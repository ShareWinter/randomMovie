import { Server, Socket } from 'socket.io'
import connectDB from '../src/lib/mongoose'
import { Room } from '../src/models/Room'
import { Movie } from '../src/models/Movie'

// 存储用户与房间的映射关系
const userRoomMap = new Map<string, { roomCode: string; userId: string }>()

const roomUserSocketMap = new Map<string, string>()

function getRoomUserKey(roomCode: string, userId: string) {
  return `${roomCode}:${userId}`
}

async function buildRoomUpdatedPayload(roomCode: string) {
  const room = await Room.findOne({ code: roomCode })
  if (!room) return null

  const allMovieIds = new Set<string>()
  room.participants.forEach((p) => {
    ;(p.selectedMovies || []).forEach((id) => allMovieIds.add(id))
  })

  const movieIds = Array.from(allMovieIds)
  const movies = movieIds.length
    ? await Movie.find({ _id: { $in: movieIds } }).lean()
    : []

  const moviesById: Record<
    string,
    { id: string; title: string; poster: string; year: string; rating: number }
  > = {}

  movies.forEach((m: any) => {
    const id = m._id.toString()
    moviesById[id] = {
      id,
      title: m.title,
      poster: m.poster || '',
      year: m.year || '',
      rating: m.rating || 0,
    }
  })

  return {
    participants: room.participants,
    status: room.status,
    moviesById,
  }
}

async function handleLeave(io: Server, socket: Socket, roomCode: string, userId: string) {
  await connectDB()

  const room = await Room.findOne({ code: roomCode })
  if (!room) return

  if (room.hostId === userId) {
    await Room.deleteOne({ code: roomCode })
    io.to(roomCode).emit('room-closed', { reason: 'host-left' })

    for (const [key] of roomUserSocketMap.entries()) {
      if (key.startsWith(`${roomCode}:`)) {
        roomUserSocketMap.delete(key)
      }
    }

    io.in(roomCode).disconnectSockets(true)
    return
  }

  room.participants = room.participants.filter((p) => p.userId !== userId)
  await room.save()

  socket.leave(roomCode)

  const payload = await buildRoomUpdatedPayload(roomCode)
  if (payload) {
    io.to(roomCode).emit('room-updated', payload)
  }
}

export function setupRoomHandlers(io: Server, socket: Socket) {
  console.log('[Socket] New connection:', socket.id)

  socket.on('join-room', async ({ roomCode, userId, userName }, ack?: (res?: any) => void) => {
    console.log('[join-room] Received:', { roomCode, userId, userName, socketId: socket.id })
    try {
      await connectDB()
      
      const room = await Room.findOne({ code: roomCode })
      if (!room) {
        console.log('[join-room] Room not found:', roomCode)
        socket.emit('error', { message: '房间不存在' })
        return
      }

      const roomUserKey = getRoomUserKey(roomCode, userId)
      const existingSocketId = roomUserSocketMap.get(roomUserKey)
      if (existingSocketId && existingSocketId !== socket.id) {
        const existingSocket = io.sockets.sockets.get(existingSocketId)
        if (existingSocket) {
          existingSocket.emit('kicked', { reason: 'duplicate-connection' })
          existingSocket.disconnect(true)
        }
      }

      socket.join(roomCode)
      console.log('[join-room] Socket joined room:', { socketId: socket.id, roomCode })

      // 记录用户与房间的映射
      userRoomMap.set(socket.id, { roomCode, userId })
      roomUserSocketMap.set(roomUserKey, socket.id)

      const existingParticipant = room.participants.find(
        (p) => p.userId === userId
      )

      if (!existingParticipant) {
        console.log('[join-room] New participant:', { userId, userName })
        room.participants.push({
          userId,
          name: userName,
          isHost: room.hostId === userId,
          joinedAt: new Date(),
          selectedMovies: [],
        })
        await room.save()
      } else {
        console.log('[join-room] Participant already exists:', userId)
      }

      console.log('[join-room] Broadcasting room-updated, participants count:', room.participants.length)
      const payload = await buildRoomUpdatedPayload(roomCode)
      if (payload) {
        io.to(roomCode).emit('room-updated', payload)
      }
      ack?.({ ok: true })
    } catch (error) {
      console.error('Join room error:', error)
      socket.emit('error', { message: '加入房间失败' })
      ack?.({ ok: false })
    }
  })

  socket.on('leave-room', async ({ roomCode, userId }, ack?: (res?: any) => void) => {
    try {
      await handleLeave(io, socket, roomCode, userId)
      ack?.({ ok: true })
    } catch (error) {
      console.error('Leave room error:', error)
      ack?.({ ok: false })
    } finally {
      userRoomMap.delete(socket.id)
      roomUserSocketMap.delete(getRoomUserKey(roomCode, userId))
    }
  })

  // 更新用户选择的影片
  socket.on('update-user-movies', async ({ roomCode, userId, selectedMovies }, ack?: (res?: any) => void) => {
    try {
      await connectDB()
      
      const room = await Room.findOne({ code: roomCode })
      if (room) {
        const participant = room.participants.find(p => p.userId === userId)
        if (participant) {
          participant.selectedMovies = selectedMovies
          await room.save()
          const payload = await buildRoomUpdatedPayload(roomCode)
          if (payload) {
            io.to(roomCode).emit('room-updated', payload)
          }
        }
      }
      ack?.({ ok: true })
    } catch (error) {
      console.error('Update user movies error:', error)
      ack?.({ ok: false })
    }
  })

  // 断开连接时只清除映射，不自动离开房间（用户可以重新连接）
  socket.on('disconnect', () => {
    console.log('[Socket] Disconnected:', socket.id)
    userRoomMap.delete(socket.id)
    // 不调用 handleLeave，保留参与者在房间中
  })
}
