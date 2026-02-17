'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { SketchButton } from '@/components/ui/SketchButton'
import PosterCard from '@/components/movie/PosterCard'
import AddMovieForm from '@/components/movie/AddMovieForm'
import MovieDetailModal from '@/components/movie/MovieDetailModal'
import ConfirmModal from '@/components/ConfirmModal'
import type { IMovie } from '@/types'

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

export default function MoviesPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [movies, setMovies] = useState<IMovie[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedMovie, setSelectedMovie] = useState<IMovie | null>(null)
  const [deletingMovieId, setDeletingMovieId] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; movieId: string; movieTitle: string }>({
    isOpen: false,
    movieId: '',
    movieTitle: '',
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    }
  }, [status, router])

  useEffect(() => {
    if (session?.user) {
      fetchMovies()
    }
  }, [session])

  async function fetchMovies() {
    try {
      const response = await fetch('/api/movies')
      const data = await response.json()
      if (response.ok) {
        setMovies(data.movies)
      }
    } catch (error) {
      console.error('Failed to fetch movies:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleAddMovie(movieData: NewMoviePayload) {
    const response = await fetch('/api/movies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(movieData),
    })

    if (response.ok) {
      await fetchMovies()
    } else {
      const data = await response.json()
      throw new Error(data.error || '添加失败')
    }
  }

  function handleDeleteMovie(id: string) {
    const movie = movies.find(m => m._id.toString() === id)
    setDeleteConfirm({
      isOpen: true,
      movieId: id,
      movieTitle: movie?.title || '',
    })
  }

  async function confirmDelete() {
    const id = deleteConfirm.movieId
    setDeleteConfirm({ isOpen: false, movieId: '', movieTitle: '' })

    // 关闭详情弹窗
    setSelectedMovie(null)

    // 开始播放粉碎动画
    setDeletingMovieId(id)

    // 等待动画完成后执行删除
    setTimeout(async () => {
      try {
        const response = await fetch(`/api/movies/${id}`, {
          method: 'DELETE',
        })

        if (response.ok) {
          setMovies(prev => prev.filter(m => m._id.toString() !== id))
        } else {
          const data = await response.json()
          alert(data.error || '删除失败')
        }
      } catch (error) {
        console.error('Failed to delete movie:', error)
        alert('删除失败')
      } finally {
        setDeletingMovieId(null)
      }
    }, 800)
  }

  function handleMovieUpdate(updatedMovie: IMovie) {
    setMovies(prev => prev.map(m => 
      m._id.toString() === updatedMovie._id.toString() ? updatedMovie : m
    ))
    setSelectedMovie(updatedMovie)
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen notebook-bg flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🎬</div>
          <p className="font-hand text-xl text-text-medium">加载中...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <main className="min-h-screen notebook-bg p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-hand font-bold text-primary-blue mb-2">
              🎥 我的影片库
            </h1>
            <p className="text-text-medium font-hand">
              共 {movies.length} 部影片
            </p>
          </div>
          <SketchButton onClick={() => setShowAddForm(true)} size="lg">
            + 添加影片
          </SketchButton>
        </div>

        {movies.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-8xl mb-6">🎬</div>
            <h2 className="text-2xl font-hand font-bold text-text-dark mb-4">
              影片库是空的
            </h2>
            <p className="text-text-medium font-hand mb-6">
              点击上方按钮添加你的第一部影片
            </p>
            <SketchButton onClick={() => setShowAddForm(true)}>
              开始添加
            </SketchButton>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {movies.map((movie) => (
              <PosterCard
                key={movie._id.toString()}
                poster={movie.poster}
                title={movie.title}
                rating={movie.rating}
                userRating={movie.userRating}
                watched={movie.watched}
                onClick={() => setSelectedMovie(movie)}
                isDeleting={deletingMovieId === movie._id.toString()}
              />
            ))}
          </div>
        )}

        {showAddForm && (
          <AddMovieForm
            onAdd={handleAddMovie}
            onClose={() => setShowAddForm(false)}
          />
        )}

        {selectedMovie && (
          <MovieDetailModal
            movie={selectedMovie}
            onClose={() => setSelectedMovie(null)}
            onDelete={handleDeleteMovie}
            onUpdate={handleMovieUpdate}
          />
        )}

        <ConfirmModal
          isOpen={deleteConfirm.isOpen}
          title="删除影片"
          message={`确定要删除「${deleteConfirm.movieTitle}」吗？此操作无法撤销。`}
          confirmText="删除"
          cancelText="取消"
          onConfirm={confirmDelete}
          onCancel={() => setDeleteConfirm({ isOpen: false, movieId: '', movieTitle: '' })}
        />
      </div>
    </main>
  )
}
