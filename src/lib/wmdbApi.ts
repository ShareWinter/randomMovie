import type { DoubanMovieData } from '@/types'

interface WmdbDataItem {
  poster: string
  name: string
  genre: string
  description: string
  language: string
  country: string
  lang: string
}

interface WmdbPersonData {
  name: string
  lang: string
}

interface WmdbPerson {
  data: WmdbPersonData[]
}

interface WmdbApiResponse {
  data: WmdbDataItem[]
  director: WmdbPerson[]
  actor: WmdbPerson[]
  year: string
  doubanId: string
  doubanRating: string
  duration: number
}

function getChineseData<T extends { lang: string }>(items: T[] | undefined): T | undefined {
  if (!items || items.length === 0) return undefined
  return items.find(item => item.lang === 'Cn') || items[0]
}

export async function fetchMovieData(url: string): Promise<DoubanMovieData> {
  const match = url.match(/subject\/(\d+)/)
  if (!match) throw new Error('无效的豆瓣影片链接')
  const doubanId = match[1]

  const apiUrl = `https://api.wmdb.tv/movie/api?id=${doubanId}`

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 30000)

  try {
    const response = await fetch(apiUrl, {
      headers: {
        'Accept': 'application/json',
      },
      signal: controller.signal,
    })
    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`API 请求失败: ${response.status}`)
    }

    const data: WmdbApiResponse = await response.json()

    if (!data || !data.data || data.data.length === 0) {
      throw new Error('未找到影片数据')
    }

    const chineseData = getChineseData(data.data)

    // 获取所有导演的中文名字
    const directors = data.director?.map(d => {
      const chineseDirector = getChineseData(d.data)
      return chineseDirector?.name
    }).filter(Boolean) || []

    // 获取所有主演的中文名字
    const actors = data.actor?.map(a => {
      const chineseActor = getChineseData(a.data)
      return chineseActor?.name
    }).filter(Boolean) || []

    const genreString = chineseData?.genre || ''
    const genre = genreString ? genreString.split('/').map(g => g.trim()).filter(Boolean) : []

    const rating = data.doubanRating ? parseFloat(data.doubanRating) : 0

    return {
      title: chineseData?.name || '',
      year: data.year || '',
      director: directors.join(' / '),
      cast: actors.join(' / '),
      rating,
      genre,
      region: chineseData?.country || '',
      poster: chineseData?.poster || '',
      doubanUrl: `https://movie.douban.com/subject/${doubanId}/`,
    }
  } catch (error) {
    clearTimeout(timeoutId)
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('API 请求超时，请稍后重试')
    }
    throw error
  }
}
