import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { Movie } from '@/models/Movie'
import { User } from '@/models/User'
import connectDB from '@/lib/mongoose'

// GET - 获取用户的影片列表
export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }

    await connectDB()

    const movies = await Movie.find({ addedBy: session.user.id })
      .sort({ createdAt: -1 })
      .lean()

    // 确保返回的数据有默认值
    const moviesWithDefaults = movies.map(m => ({
      ...m,
      watched: m.watched ?? false,
      userRating: m.userRating ?? 0,
      userReview: m.userReview ?? '',
    }))

    return NextResponse.json({ movies: moviesWithDefaults })
  } catch (error) {
    console.error('Get movies error:', error)
    return NextResponse.json({ error: '获取影片列表失败' }, { status: 500 })
  }
}

// POST - 添加影片
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }

    await connectDB()

    const body = await request.json()
    const { title, year, director, cast, rating, genre, region, poster, doubanUrl } = body

    if (!title) {
      return NextResponse.json({ error: '影片名称不能为空' }, { status: 400 })
    }

    const movie = await Movie.create({
      title,
      year: year || '',
      director: director || '',
      cast: cast || '',
      rating: rating || 0,
      genre: genre || [],
      region: region || '',
      poster: poster || '',
      doubanUrl: doubanUrl || '',
      addedBy: session.user.id,
    })

    // 添加到用户的影片列表
    await User.findByIdAndUpdate(session.user.id, {
      $push: { movies: movie._id },
    })

    return NextResponse.json({ movie }, { status: 201 })
  } catch (error) {
    console.error('Add movie error:', error)
    return NextResponse.json({ error: '添加影片失败' }, { status: 500 })
  }
}
