'use client'

import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { SketchButton } from '@/components/ui/SketchButton'
import type { IMovie } from '@/types'

interface MovieDetailModalProps {
  movie: IMovie | null
  onClose: () => void
  onDelete?: (id: string) => void
  onUpdate?: (movie: IMovie) => void
}

export default function MovieDetailModal({ movie, onClose, onDelete, onUpdate }: MovieDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [watched, setWatched] = useState(false)
  const [userRating, setUserRating] = useState(0)
  const [userReview, setUserReview] = useState('')
  const [saving, setSaving] = useState(false)

  // 使用 movie 的 watched 值，确保默认为 false
  const movieWatched = movie?.watched ?? false

  useEffect(() => {
    if (movie) {
      setWatched(movie.watched ?? false)
      setUserRating(movie.userRating || 0)
      setUserReview(movie.userReview || '')
      setIsEditing(false)
    }
  }, [movie?._id, movie?.watched, movie?.userRating, movie?.userReview])

  if (!movie) return null

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch(`/api/movies/${movie._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ watched, userRating, userReview }),
      })

      if (response.ok) {
        const data = await response.json()
        onUpdate?.(data.movie)
        setIsEditing(false)
      }
    } catch (error) {
      console.error('Failed to save:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setWatched(movieWatched)
    setUserRating(movie.userRating || 0)
    setUserReview(movie.userReview || '')
    setIsEditing(false)
  }

  const toggleWatched = async () => {
    const newWatched = !watched
    setWatched(newWatched)
    try {
      const response = await fetch(`/api/movies/${movie._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ watched: newWatched }),
      })
      if (response.ok) {
        const data = await response.json()
        onUpdate?.(data.movie)
      }
    } catch (error) {
      console.error('Failed to update watched status:', error)
      setWatched(!newWatched)
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-lg border-2 border-gray-300 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.2)] max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <h2 className="text-3xl font-hand font-bold text-text-dark">
                  {movie.title}
                </h2>
                <button
                  onClick={toggleWatched}
                  className={`px-3 py-1 rounded-full text-sm font-hand font-bold transition-all ${
                    watched 
                      ? 'bg-green-500 text-white border-2 border-green-600' 
                      : 'bg-gray-100 text-gray-500 border-2 border-gray-300 hover:border-green-400 hover:text-green-600'
                  }`}
                >
                  {watched ? '✓ 已看过' : '未看'}
                </button>
              </div>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="w-48 h-72 relative rounded-lg overflow-hidden border-2 border-gray-300">
                  {movie.poster ? (
                    <Image
                      src={movie.poster}
                      alt={movie.title}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center">
                      <div className="text-6xl">🎬</div>
                    </div>
                  )}
                  {movie.rating > 0 && (
                    <div className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 px-2 py-1 rounded-md text-sm font-bold shadow-md border border-yellow-500">
                      ⭐ {movie.rating}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex-1 space-y-3">
                {movie.year && (
                  <div>
                    <span className="font-hand font-semibold text-text-medium">年份: </span>
                    <span className="font-hand text-text-dark">{movie.year}</span>
                  </div>
                )}
                {movie.director && (
                  <div>
                    <span className="font-hand font-semibold text-text-medium">导演: </span>
                    <span className="font-hand text-text-dark">{movie.director}</span>
                  </div>
                )}
                {movie.cast && (
                  <div>
                    <span className="font-hand font-semibold text-text-medium">主演: </span>
                    <span className="font-hand text-text-dark">{movie.cast}</span>
                  </div>
                )}
                {movie.genre && movie.genre.length > 0 && (
                  <div>
                    <span className="font-hand font-semibold text-text-medium">类型: </span>
                    <span className="font-hand text-text-dark">{movie.genre.join(' / ')}</span>
                  </div>
                )}
                {movie.region && (
                  <div>
                    <span className="font-hand font-semibold text-text-medium">制片国家/地区: </span>
                    <span className="font-hand text-text-dark">{movie.region}</span>
                  </div>
                )}
                {movie.doubanUrl && (
                  <div>
                    <span className="font-hand font-semibold text-text-medium">豆瓣: </span>
                    <a 
                      href={movie.doubanUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="font-hand text-blue-600 hover:text-blue-800 underline"
                    >
                      查看详情
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* 我的评分和影评 */}
            <div className="mt-6 pt-4 border-t-2 border-dashed border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-hand font-semibold text-text-dark">我的评价</h3>
                {!isEditing && (
                  <SketchButton
                    size="sm"
                    variant="secondary"
                    onClick={() => setIsEditing(true)}
                  >
                    {userRating > 0 || userReview ? '编辑' : '添加评价'}
                  </SketchButton>
                )}
              </div>

              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="font-hand text-sm text-text-medium mb-2 block">我的评分</label>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setUserRating(star)}
                          className="text-2xl transition-transform hover:scale-110"
                        >
                          {star <= userRating ? '⭐' : '☆'}
                        </button>
                      ))}
                      {userRating > 0 && (
                        <span className="ml-2 font-hand text-text-dark">{userRating}/10</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="font-hand text-sm text-text-medium mb-2 block">我的影评</label>
                    <textarea
                      value={userReview}
                      onChange={(e) => setUserReview(e.target.value)}
                      placeholder="写下你对这部影片的看法..."
                      maxLength={2000}
                      className="w-full p-3 border-2 border-gray-300 rounded-lg font-hand text-text-dark leading-relaxed resize-none focus:border-amber-400 focus:outline-none transition-colors"
                      rows={4}
                    />
                    <p className="text-xs text-text-medium mt-1 text-right font-hand">
                      {userReview.length}/2000
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <SketchButton
                      variant="secondary"
                      onClick={handleCancel}
                      className="flex-1"
                    >
                      取消
                    </SketchButton>
                    <SketchButton
                      onClick={handleSave}
                      className="flex-1"
                      disabled={saving}
                    >
                      {saving ? '保存中...' : '保存'}
                    </SketchButton>
                  </div>
                </div>
              ) : (
                <div>
                  {userRating > 0 || userReview ? (
                    <div className="space-y-3">
                      {userRating > 0 && (
                        <div>
                          <span className="font-hand font-semibold text-text-medium">我的评分: </span>
                          <span className="text-lg">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
                              <span key={star}>
                                {star <= userRating ? '⭐' : ''}
                              </span>
                            ))}
                          </span>
                          <span className="font-hand text-text-dark ml-2">{userRating}/10</span>
                        </div>
                      )}
                      {userReview && (
                        <div>
                          <span className="font-hand font-semibold text-text-medium block mb-2">我的影评</span>
                          <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-4">
                            <p className="font-hand text-text-dark leading-relaxed whitespace-pre-wrap">
                              {userReview}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="font-hand text-text-medium text-center py-4">
                      还没有添加评价，观看后点击右上角按钮添加吧～
                    </p>
                  )}
                </div>
              )}
            </div>

            {onDelete && !isEditing && (
              <div className="mt-6 flex justify-end">
                <SketchButton
                  variant="outline"
                  onClick={() => {
                    onDelete(movie._id.toString())
                    onClose()
                  }}
                  className="border-functional-error text-functional-error hover:bg-red-50"
                >
                  删除影片
                </SketchButton>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
