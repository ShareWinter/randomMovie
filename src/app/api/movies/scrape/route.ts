import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { fetchMovieData } from '@/lib/wmdbApi'

// POST - 获取影片信息
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }

    const body = await request.json()
    const { url } = body

    if (!url) {
      return NextResponse.json({ error: '请提供豆瓣链接' }, { status: 400 })
    }

    const movieData = await fetchMovieData(url)

    return NextResponse.json({ movieData })
  } catch (error) {
    console.error('Fetch movie error:', error)
    const message = error instanceof Error ? error.message : '获取影片信息失败'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
