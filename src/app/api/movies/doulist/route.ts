import { NextRequest, NextResponse } from 'next/server'
import * as cheerio from 'cheerio'
import type { DoubanMovieData } from '@/types'

// 将海报URL转换为webp格式
function convertToWebp(url: string): string {
  if (!url) return ''
  if (url.endsWith('.webp')) return url
  return url.replace(/\.(jpg|jpeg|png|gif)$/i, '.webp')
}

// 解析abstract字段
function parseAbstract(abstractHtml: string): {
  director: string
  cast: string
  genre: string[]
  region: string
  year: string
} {
  const $ = cheerio.load(`<div>${abstractHtml}</div>`)
  const text = $('div').text()
  
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean)
  
  let director = ''
  let cast = ''
  let genre: string[] = []
  let region = ''
  let year = ''
  
  for (const line of lines) {
    if (line.startsWith('导演:')) {
      director = line.replace('导演:', '').trim()
    } else if (line.startsWith('主演:')) {
      cast = line.replace('主演:', '').trim()
    } else if (line.startsWith('类型:')) {
      const genreStr = line.replace('类型:', '').trim()
      genre = genreStr.split('/').map(g => g.trim()).filter(Boolean)
    } else if (line.startsWith('制片国家/地区:')) {
      region = line.replace('制片国家/地区:', '').trim()
    } else if (line.startsWith('年份:')) {
      year = line.replace('年份:', '').trim()
    }
  }
  
  return { director, cast, genre, region, year }
}

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()
    
    if (!url) {
      return NextResponse.json({ error: '请提供片单链接' }, { status: 400 })
    }
    
    // 验证链接格式
    const match = url.match(/douban\.com\/doulist\/(\d+)/)
    if (!match) {
      return NextResponse.json({ error: '无效的豆瓣片单链接' }, { status: 400 })
    }
    
    // 请求片单页面
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        'Referer': 'https://www.douban.com/',
      },
    })
    
    if (!response.ok) {
      return NextResponse.json({ error: '获取片单页面失败' }, { status: 500 })
    }
    
    const html = await response.text()
    const $ = cheerio.load(html)
    
    const movies: DoubanMovieData[] = []
    
    // 解析每个影片项
    $('.doulist-item').each((_, element) => {
      const $item = $(element)
      
      // 获取豆瓣链接
      const $post = $item.find('.post')
      const doubanUrl = $post.find('a').attr('href') || ''
      
      // 获取海报URL并转换为webp
      let poster = $post.find('img').attr('src') || ''
      if (poster) {
        poster = convertToWebp(poster)
        // 使用代理URL，传递原始URL和referer
        const proxyUrl = `/api/movies/poster?${new URLSearchParams({
          url: poster,
          referer: url
        })}`
        poster = proxyUrl
      }
      
      // 获取影片名
      const title = $item.find('.title a').text().trim()
      
      // 获取评分
      const ratingText = $item.find('.rating_nums').text().trim()
      const rating = ratingText ? parseFloat(ratingText) : 0
      
      // 获取abstract信息
      const abstractHtml = $item.find('.abstract').html() || ''
      const { director, cast, genre, region, year } = parseAbstract(abstractHtml)
      
      if (title) {
        movies.push({
          title,
          year,
          director,
          cast,
          rating,
          genre,
          region,
          poster,
          doubanUrl,
        })
      }
    })
    
    if (movies.length === 0) {
      return NextResponse.json({ error: '未找到影片，请检查片单是否为空或需要登录' }, { status: 404 })
    }
    
    return NextResponse.json({ movies })
  } catch (error) {
    console.error('Doulist scrape error:', error)
    return NextResponse.json({ error: '爬取片单失败，请稍后重试' }, { status: 500 })
  }
}
