import { Server, Socket } from 'socket.io'
import connectDB from '../src/lib/mongoose'
import { Room } from '../src/models/Room'
import { Movie } from '../src/models/Movie'
import { DrawHistory } from '../src/models/DrawHistory'

export function setupDrawHandlers(io: Server, socket: Socket) {
  socket.on('start-draw', async ({ roomCode, userId }) => {
    try {
      await connectDB()
      
      const room = await Room.findOne({ code: roomCode })
      if (!room) {
        socket.emit('error', { message: '房间不存在' })
        return
      }

      // Only host can trigger draw
      if (room.hostId !== userId) {
        socket.emit('error', { message: '只有房主可以发起抽奖' })
        return
      }

      // 合并所有参与者选择的影片（去重）
      const allMovieIds = new Set<string>()
      room.participants.forEach(p => {
        p.selectedMovies.forEach(id => allMovieIds.add(id))
      })
      const movieIds = Array.from(allMovieIds)

      if (movieIds.length === 0) {
        socket.emit('error', { message: '影片库为空，请先选择影片' })
        return
      }

      // Get all movies
      const movies = await Movie.find({ _id: { $in: movieIds } })
      if (movies.length === 0) {
        socket.emit('error', { message: '影片库为空' })
        return
      }

      // Generate random seed for deterministic animation
      const seed = Date.now()

      // Pick random movie
      const randomIndex = seed % movies.length
      const selectedMovie = movies[randomIndex]

      // Update room
      room.status = 'completed'
      room.drawResult = {
        movieId: selectedMovie._id.toString(),
        movieTitle: selectedMovie.title,
        drawnAt: new Date(),
        seed,
      }
      await room.save()

      // Save to history
      const participant = room.participants.find(p => p.userId === userId)
      if (participant) {
        await DrawHistory.create({
          userId,
          userName: participant.name,
          roomCode,
          movieId: selectedMovie._id.toString(),
          movieTitle: selectedMovie.title,
          moviePoster: selectedMovie.poster,
          movieYear: selectedMovie.year,
          movieRating: selectedMovie.rating,
          participants: room.participants.length,
          seed,
          drawnAt: new Date(),
        })
      }

      // Broadcast draw start with seed
      io.to(roomCode).emit('draw-started', {
        seed,
        movies: movies.map(m => ({ id: m._id, title: m.title, poster: m.poster })),
      })

      // After animation, send result
      setTimeout(() => {
        io.to(roomCode).emit('draw-result', {
          movie: {
            id: selectedMovie._id,
            title: selectedMovie.title,
            poster: selectedMovie.poster,
            year: selectedMovie.year,
            director: selectedMovie.director,
            rating: selectedMovie.rating,
          },
        })
      }, 5000) // Animation duration

    } catch (error) {
      console.error('Start draw error:', error)
      socket.emit('error', { message: '抽奖失败' })
    }
  })

  socket.on('reset-room', async ({ roomCode, userId }) => {
    try {
      await connectDB()
      
      const room = await Room.findOne({ code: roomCode })
      if (!room) {
        socket.emit('error', { message: '房间不存在' })
        return
      }

      if (room.hostId !== userId) {
        socket.emit('error', { message: '只有房主可以重置房间' })
        return
      }

      room.status = 'waiting'
      room.drawResult = undefined
      // 清空所有人的选择
      room.participants.forEach(p => {
        p.selectedMovies = []
      })
      await room.save()

      io.to(roomCode).emit('room-reset', {
        status: room.status,
        participants: room.participants,
      })
    } catch (error) {
      console.error('Reset room error:', error)
      socket.emit('error', { message: '重置房间失败' })
    }
  })
}
