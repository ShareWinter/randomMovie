import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const imageUrl = searchParams.get('url')
    const referer = searchParams.get('referer') || 'https://www.douban.com/'
    
    if (!imageUrl) {
      return NextResponse.json({ error: '缺少图片URL' }, { status: 400 })
    }
    
    // 通过后端代理请求图片，带referer和user-agent
    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'image/webp,image/avif,image/jxl,image/heic,image/heic-sequence,image/avif-sequence,image/jxl-sequence,image/png,image/svg+xml,image/*;q=0.8,*/*;q=0.5',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        'Referer': referer,
      },
    })
    
    if (!response.ok) {
      return NextResponse.json({ error: '获取图片失败' }, { status: 500 })
    }
    
    // 获取图片数据
    const imageBuffer = await response.arrayBuffer()
    const contentType = response.headers.get('content-type') || 'image/webp'
    
    // 返回图片
    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400', // 缓存1天
      },
    })
  } catch (error) {
    console.error('Poster proxy error:', error)
    return NextResponse.json({ error: '代理图片失败' }, { status: 500 })
  }
}
