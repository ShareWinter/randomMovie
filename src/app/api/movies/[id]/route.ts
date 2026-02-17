import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { Movie } from '@/models/Movie'
import { User } from '@/models/User'
import connectDB from '@/lib/mongoose'

// DELETE - 删除影片
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    const { id } = await params

    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }

    await connectDB()

    const movie = await Movie.findById(id)

    if (!movie) {
      return NextResponse.json({ error: '影片不存在' }, { status: 404 })
    }

    if (movie.addedBy.toString() !== session.user.id) {
      return NextResponse.json({ error: '无权删除此影片' }, { status: 403 })
    }

    await Movie.findByIdAndDelete(id)

    // 从用户的影片列表中移除
    await User.findByIdAndUpdate(session.user.id, {
      $pull: { movies: id },
    })

    return NextResponse.json({ message: '删除成功' })
  } catch (error) {
    console.error('Delete movie error:', error)
    return NextResponse.json({ error: '删除影片失败' }, { status: 500 })
  }
}

// GET - 获取单个影片详情
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    const { id } = await params

    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }

    await connectDB()

    const movie = await Movie.findById(id).lean()

    if (!movie) {
      return NextResponse.json({ error: '影片不存在' }, { status: 404 })
    }

    return NextResponse.json({ movie })
  } catch (error) {
    console.error('Get movie error:', error)
    return NextResponse.json({ error: '获取影片详情失败' }, { status: 500 })
  }
}

// PATCH - 更新影片的用户评分和影评
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    const { id } = await params

    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }

    await connectDB()

    const movie = await Movie.findById(id)

    if (!movie) {
      return NextResponse.json({ error: '影片不存在' }, { status: 404 })
    }

    if (movie.addedBy.toString() !== session.user.id) {
      return NextResponse.json({ error: '无权编辑此影片' }, { status: 403 })
    }

    const body = await request.json()
    const { watched, userRating, userReview } = body

    // 构建更新对象
    const updateData: Record<string, unknown> = {}
    
    if (typeof watched === 'boolean') {
      updateData.watched = watched
    }
    if (typeof userRating === 'number') {
      updateData.userRating = Math.max(0, Math.min(10, userRating))
    }
    if (typeof userReview === 'string') {
      updateData.userReview = userReview.slice(0, 2000)
    }

    // 如果没有要更新的数据，直接返回当前电影
    if (Object.keys(updateData).length === 0) {
      const currentMovie = movie.toObject()
      return NextResponse.json({ movie: {
        ...currentMovie,
        watched: currentMovie.watched ?? false,
        userRating: currentMovie.userRating ?? 0,
        userReview: currentMovie.userReview ?? '',
      } })
    }

    // 使用 findByIdAndUpdate 确保更新成功
    const updatedMovie = await Movie.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, lean: true }
    )

    if (!updatedMovie) {
      return NextResponse.json({ error: '更新失败' }, { status: 500 })
    }

    return NextResponse.json({ movie: {
      ...updatedMovie,
      watched: updatedMovie.watched ?? false,
      userRating: updatedMovie.userRating ?? 0,
      userReview: updatedMovie.userReview ?? '',
    } })
  } catch (error) {
    console.error('Update movie error:', error)
    return NextResponse.json({ error: '更新影片失败' }, { status: 500 })
  }
}
