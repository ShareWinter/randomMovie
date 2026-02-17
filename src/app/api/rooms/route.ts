import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { Room } from '@/models/Room'
import { Movie } from '@/models/Movie'
import connectDB from '@/lib/mongoose'

// POST - 创建房间
export async function POST() {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }

    await connectDB()

    // 生成6位随机房间码
    const code = Math.random().toString(36).substring(2, 8).toUpperCase()

    const room = await Room.create({
      code,
      hostId: session.user.id,
      participants: [{
        userId: session.user.id,
        name: session.user.name || '用户',
        isHost: true,
        joinedAt: new Date(),
        selectedMovies: [],
      }],
      status: 'waiting',
    })

    return NextResponse.json({ room }, { status: 201 })
  } catch (error) {
    console.error('Create room error:', error)
    return NextResponse.json({ error: '创建房间失败' }, { status: 500 })
  }
}

// GET - 获取房间信息
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }

    await connectDB()

    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')

    if (!code) {
      return NextResponse.json({ error: '请提供房间码' }, { status: 400 })
    }

    const room = await Room.findOne({ code }).lean()

    if (!room) {
      return NextResponse.json({ error: '房间不存在' }, { status: 404 })
    }

    // 构建 moviesById
    const allMovieIds = new Set<string>()
    ;(room.participants as any[]).forEach((p) => {
      ;(p.selectedMovies || []).forEach((id: string) => allMovieIds.add(id))
    })

    const movieIds = Array.from(allMovieIds)
    const movies = movieIds.length ? await Movie.find({ _id: { $in: movieIds } }).lean() : []

    const moviesById: Record<string, { id: string; title: string; poster: string; year: string; rating: number }> = {}
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

    return NextResponse.json({ room, moviesById })
  } catch (error) {
    console.error('Get room error:', error)
    return NextResponse.json({ error: '获取房间信息失败' }, { status: 500 })
  }
}
