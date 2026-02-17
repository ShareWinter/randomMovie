'use client'

import { useState } from 'react'
import { SketchInput } from '@/components/ui/SketchInput'
import { SketchButton } from '@/components/ui/SketchButton'
import type { DoubanMovieData } from '@/types'

type NewMoviePayload = {
  title: string
  year?: string
  director?: string
  cast?: string
  rating?: number
  genre?: string[]
  region?: string
  poster?: string
  doubanUrl?: string
}

interface AddMovieFormProps {
  onAdd: (movieData: NewMoviePayload) => Promise<void>
  onClose: () => void
}

interface DoulistMovie extends DoubanMovieData {
  posterProxy?: string
}

export default function AddMovieForm({ onAdd, onClose }: AddMovieFormProps) {
  const [mode, setMode] = useState<'url' | 'doulist' | 'manual'>('url')
  const [loading, setLoading] = useState(false)
  const [scrapedData, setScrapedData] = useState<DoubanMovieData | null>(null)
  const [doulistMovies, setDoulistMovies] = useState<DoulistMovie[]>([])
  const [selectedMovies, setSelectedMovies] = useState<Set<number>>(new Set())
  const [error, setError] = useState('')

  const handleScrape = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const url = formData.get('doubanUrl') as string

    try {
      const response = await fetch('/api/movies/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || '爬取失败')
        return
      }

      setScrapedData(data.movieData)
    } catch {
      setError('爬取失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  const handleDoulistScrape = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    setDoulistMovies([])
    setSelectedMovies(new Set())

    const formData = new FormData(e.currentTarget)
    const url = formData.get('doulistUrl') as string

    try {
      const response = await fetch('/api/movies/doulist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || '爬取片单失败')
        return
      }

      setDoulistMovies(data.movies)
      // 默认全选
      setSelectedMovies(new Set(data.movies.map((_: DoulistMovie, i: number) => i)))
    } catch {
      setError('爬取片单失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  const toggleMovieSelection = (index: number) => {
    const newSelected = new Set(selectedMovies)
    if (newSelected.has(index)) {
      newSelected.delete(index)
    } else {
      newSelected.add(index)
    }
    setSelectedMovies(newSelected)
  }

  const handleAddDoulistMovies = async () => {
    if (selectedMovies.size === 0) return

    setLoading(true)
    setError('')

    try {
      const moviesToAdd = Array.from(selectedMovies).map(i => doulistMovies[i])
      for (const movie of moviesToAdd) {
        await onAdd(movie)
      }
      onClose()
    } catch {
      setError('添加失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  const handleAddMovie = async () => {
    if (!scrapedData) return

    setLoading(true)
    setError('')

    try {
      await onAdd(scrapedData)
      onClose()
    } catch {
      setError('添加失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  const handleManualSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const movieData = {
      title: formData.get('title') as string,
      year: formData.get('year') as string,
      director: formData.get('director') as string,
      cast: formData.get('cast') as string,
      rating: parseFloat(formData.get('rating') as string) || 0,
      poster: formData.get('poster') as string,
      genre: (formData.get('genre') as string).split('/').map(g => g.trim()).filter(Boolean),
      region: formData.get('region') as string,
      doubanUrl: formData.get('doubanUrl') as string,
    }

    try {
      await onAdd(movieData)
      onClose()
    } catch {
      setError('添加失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg border-2 border-gray-300 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.2)] p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-hand font-bold text-text-dark">添加影片</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="flex gap-2 mb-6">
          <SketchButton
            variant={mode === 'url' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setMode('url')}
            className="flex-1"
          >
            豆瓣链接
          </SketchButton>
          <SketchButton
            variant={mode === 'doulist' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setMode('doulist')}
            className="flex-1"
          >
            片单批量
          </SketchButton>
          <SketchButton
            variant={mode === 'manual' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setMode('manual')}
            className="flex-1"
          >
            手动添加
          </SketchButton>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border-2 border-red-300 rounded-lg p-3">
            <p className="text-functional-error font-hand text-sm">{error}</p>
          </div>
        )}

        {mode === 'url' && !scrapedData && (
          <form onSubmit={handleScrape} className="space-y-4">
            <SketchInput
              label="豆瓣影片链接"
              name="doubanUrl"
              placeholder="https://movie.douban.com/subject/..."
              required
            />
            <SketchButton type="submit" className="w-full" disabled={loading}>
              {loading ? '获取中...' : '获取影片信息'}
            </SketchButton>
          </form>
        )}

        {mode === 'url' && scrapedData && (
          <div className="space-y-4">
            <div className="bg-background-cream border-2 border-gray-300 rounded-lg p-4">
              <h3 className="font-hand font-bold text-lg mb-2">{scrapedData.title}</h3>
              <div className="text-sm text-text-medium space-y-1">
                {scrapedData.year && <p>年份: {scrapedData.year}</p>}
                {scrapedData.director && <p>导演: {scrapedData.director}</p>}
                {scrapedData.cast && <p>主演: {scrapedData.cast}</p>}
                {scrapedData.rating > 0 && <p>豆瓣评分: ⭐ {scrapedData.rating}</p>}
                {scrapedData.genre && scrapedData.genre.length > 0 && <p>类型: {scrapedData.genre.join(' / ')}</p>}
                {scrapedData.region && <p>制片国家/地区: {scrapedData.region}</p>}
              </div>
            </div>
            <p className="text-sm text-text-medium font-hand text-center">
              💡 观看后可在影片库中添加评分和影评
            </p>
            <div className="flex gap-2">
              <SketchButton
                variant="secondary"
                onClick={() => setScrapedData(null)}
                className="flex-1"
              >
                重新获取
              </SketchButton>
              <SketchButton
                onClick={handleAddMovie}
                className="flex-1"
                disabled={loading}
              >
                {loading ? '添加中...' : '确认添加'}
              </SketchButton>
            </div>
          </div>
        )}

        {mode === 'doulist' && doulistMovies.length === 0 && (
          <form onSubmit={handleDoulistScrape} className="space-y-4">
            <SketchInput
              label="豆瓣片单链接"
              name="doulistUrl"
              placeholder="https://www.douban.com/doulist/..."
              required
            />
            <SketchButton type="submit" className="w-full" disabled={loading}>
              {loading ? '获取中...' : '获取片单影片'}
            </SketchButton>
          </form>
        )}

        {mode === 'doulist' && doulistMovies.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-hand text-sm text-text-medium">
                已选择 {selectedMovies.size} / {doulistMovies.length} 部影片
              </span>
              <SketchButton
                size="sm"
                variant="secondary"
                onClick={() => {
                  if (selectedMovies.size === doulistMovies.length) {
                    setSelectedMovies(new Set())
                  } else {
                    setSelectedMovies(new Set(doulistMovies.map((_, i) => i)))
                  }
                }}
              >
                {selectedMovies.size === doulistMovies.length ? '取消全选' : '全选'}
              </SketchButton>
            </div>
            <div className="max-h-60 overflow-y-auto space-y-2 border-2 border-gray-200 rounded-lg p-2">
              {doulistMovies.map((movie, index) => (
                <label
                  key={index}
                  className={`flex items-start gap-3 p-2 rounded cursor-pointer transition-colors ${
                    selectedMovies.has(index) ? 'bg-amber-50 border border-amber-300' : 'hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedMovies.has(index)}
                    onChange={() => toggleMovieSelection(index)}
                    className="mt-1"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-hand font-bold text-text-dark">{movie.title}</div>
                    <div className="text-xs text-text-medium space-y-0.5">
                      {movie.year && <span>{movie.year}</span>}
                      {movie.director && <span> · 导演: {movie.director}</span>}
                      {movie.rating > 0 && <span> · ⭐ {movie.rating}</span>}
                    </div>
                  </div>
                </label>
              ))}
            </div>
            <div className="flex gap-2">
              <SketchButton
                variant="secondary"
                onClick={() => {
                  setDoulistMovies([])
                  setSelectedMovies(new Set())
                }}
                className="flex-1"
              >
                重新获取
              </SketchButton>
              <SketchButton
                onClick={handleAddDoulistMovies}
                className="flex-1"
                disabled={loading || selectedMovies.size === 0}
              >
                {loading ? '添加中...' : `添加 ${selectedMovies.size} 部影片`}
              </SketchButton>
            </div>
          </div>
        )}

        {mode === 'manual' && (
          <form onSubmit={handleManualSubmit} className="space-y-4">
            <SketchInput
              label="影片名称"
              name="title"
              placeholder="输入影片名称"
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <SketchInput
                label="年份"
                name="year"
                placeholder="2024"
              />
              <SketchInput
                label="豆瓣评分"
                name="rating"
                type="number"
                step="0.1"
                min="0"
                max="10"
                placeholder="0-10"
              />
            </div>
            <SketchInput
              label="导演"
              name="director"
              placeholder="导演姓名"
            />
            <SketchInput
              label="主演"
              name="cast"
              placeholder="主演姓名，用 / 分隔"
            />
            <SketchInput
              label="类型"
              name="genre"
              placeholder="剧情 / 爱情"
            />
            <SketchInput
              label="制片国家/地区"
              name="region"
              placeholder="中国大陆"
            />
            <SketchInput
              label="海报链接"
              name="poster"
              placeholder="https://..."
            />
            <SketchInput
              label="豆瓣链接"
              name="doubanUrl"
              placeholder="https://movie.douban.com/subject/..."
            />
            <p className="text-sm text-text-medium font-hand text-center">
              💡 观看后可在影片库中添加评分和影评
            </p>
            <SketchButton type="submit" className="w-full" disabled={loading}>
              {loading ? '添加中...' : '添加影片'}
            </SketchButton>
          </form>
        )}
      </div>
    </div>
  )
}
