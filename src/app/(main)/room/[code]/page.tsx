'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { SketchButton } from '@/components/ui/SketchButton'
import { SketchCard } from '@/components/ui/SketchCard'
import ParticipantList from '@/components/room/ParticipantList'
import PosterCard from '@/components/movie/PosterCard'
import SlotMachine from '@/components/draw/SlotMachine'
import DrawResult from '@/components/draw/DrawResult'
import { useSocket } from '@/hooks/useSocket'
import type { IMovie, IParticipant, MoviesById, RoomStatus } from '@/types'

type DrawMovie = { id: string; title: string; poster: string }
type DrawResultMovie = {
  id: string
  title: string
  poster: string
  year: string
  director: string
  rating: number
}

export default function RoomPage() {
  const params = useParams()
  const router = useRouter()
  const roomCode = params.code as string
  const { data: session, status } = useSession()
  const { socket, isConnected } = useSocket()

  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [roomStatus, setRoomStatus] = useState<RoomStatus>('waiting')
  const [participants, setParticipants] = useState<IParticipant[]>([])
  const [moviesById, setMoviesById] = useState<MoviesById>({})
  const [userMovies, setUserMovies] = useState<IMovie[]>([])
  const [isHost, setIsHost] = useState(false)
  const [showWatchedMovies, setShowWatchedMovies] = useState(false)

  const [drawState, setDrawState] = useState<'idle' | 'drawing' | 'result'>('idle')
  const [drawMovies, setDrawMovies] = useState<DrawMovie[]>([])
  const [drawSeed, setDrawSeed] = useState(0)
  const [drawResult, setDrawResult] = useState<DrawResultMovie | null>(null)

  const myUserId = useMemo(() => {
    const id = session?.user?.id
    return id ? String(id) : ''
  }, [session?.user?.id])

  // 当前用户选择的影片（从参与者数据中获取）
  const mySelectedMovies = useMemo(() => {
    if (!myUserId) return []
    const myParticipant = participants.find(p => String(p.userId) === myUserId)
    return myParticipant?.selectedMovies || []
  }, [participants, myUserId])

  // 总影片池数量（所有参与者选择的影片去重后）
  const totalMoviePoolCount = useMemo(() => {
    const allMovieIds = new Set<string>()
    participants.forEach(p => {
      ;(p.selectedMovies || []).forEach(id => allMovieIds.add(id))
    })
    return allMovieIds.size
  }, [participants])

  const moviePoolIds = useMemo(() => {
    const allMovieIds = new Set<string>()
    participants.forEach((p) => {
      ;(p.selectedMovies || []).forEach((id) => allMovieIds.add(id))
    })
    return Array.from(allMovieIds)
  }, [participants])

  const selectorsByMovieId = useMemo(() => {
    const map: Record<string, string[]> = {}
    participants.forEach((p) => {
      ;(p.selectedMovies || []).forEach((id) => {
        if (!map[id]) map[id] = []
        map[id].push(p.name)
      })
    })
    return map
  }, [participants])

  const moviePoolMeta = useMemo(() => {
    return moviePoolIds.map((id) => moviesById[id]).filter(Boolean)
  }, [moviePoolIds, moviesById])

  // 获取房间信息
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    }
  }, [status, router])

  useEffect(() => {
    async function fetchRoomAndMovies() {
      if (!session?.user) return

      try {
        // 获取房间信息
        const roomRes = await fetch(`/api/rooms?code=${roomCode}`)
        const roomData = await roomRes.json()

        if (!roomRes.ok) {
          alert(roomData.error || '房间不存在')
          router.push('/')
          return
        }

        setRoomStatus(roomData.room.status)
        setParticipants(roomData.room.participants)
        setIsHost(roomData.room.hostId === session.user.id)
        
        // 获取用户影片
        const moviesRes = await fetch('/api/movies')
        const moviesData = await moviesRes.json()
        const fetchedUserMovies = moviesData.movies || []
        setUserMovies(fetchedUserMovies)

        // 合并服务器返回的 moviesById 和用户影片信息
        const mergedMoviesById: MoviesById = { ...(roomData.moviesById || {}) }
        fetchedUserMovies.forEach((m: IMovie) => {
          const id = m._id.toString()
          if (!mergedMoviesById[id]) {
            mergedMoviesById[id] = {
              id,
              title: m.title,
              poster: m.poster || '',
              year: m.year || '',
              rating: m.rating || 0,
            }
          }
        })
        setMoviesById(mergedMoviesById)

        setLoading(false)
      } catch (error) {
        console.error('Fetch error:', error)
        setLoading(false)
      }
    }

    if (session) {
      fetchRoomAndMovies()
    }
  }, [session, roomCode, router])

  // Socket.io事件
  useEffect(() => {
    if (!socket || !session?.user || !isConnected) return

    console.log('[Room] Socket connected, joining room:', { roomCode, userId: session.user.id })

    // 加入房间
    socket.emit('join-room', {
      roomCode,
      userId: session.user.id,
      userName: session.user.name || '用户',
    })

    // 监听房间更新
    socket.on('room-updated', (data) => {
      console.log('[Room] Received room-updated:', {
        participantsCount: data.participants?.length,
        moviesByIdCount: Object.keys(data.moviesById || {}).length,
        participants: data.participants?.map((p: any) => ({
          name: p.name,
          selectedCount: p.selectedMovies?.length
        }))
      })
      setParticipants(data.participants)
      setRoomStatus(data.status)
      // 合并服务器返回的 moviesById 和本地用户影片信息
      setMoviesById((prev) => {
        const merged = { ...prev, ...(data.moviesById || {}) }
        console.log('[Room] moviesById merged, total:', Object.keys(merged).length)
        return merged
      })
    })

    socket.on('kicked', (data) => {
      alert(data?.reason === 'duplicate-connection' ? '你的账号在其他地方进入了该房间，你已被踢出。' : '你已被踢出房间。')
      socket.disconnect()
      router.push('/')
    })

    socket.on('room-closed', () => {
      alert('房主已退出，房间已解散。')
      socket.disconnect()
      router.push('/')
    })

    // 监听抽奖开始
    socket.on('draw-started', (data) => {
      setDrawMovies(data.movies)
      setDrawSeed(data.seed)
      setDrawState('drawing')
    })

    // 监听抽奖结果
    socket.on('draw-result', (data) => {
      setDrawResult(data.movie)
      setDrawState('result')
    })

    // 监听房间重置
    socket.on('room-reset', (data) => {
      setRoomStatus(data.status)
      setParticipants(data.participants || [])
      setDrawState('idle')
      setDrawResult(null)
    })

    // 监听错误
    socket.on('error', (data) => {
      alert(data.message)
    })

    return () => {
      socket.off('room-updated')
      socket.off('draw-started')
      socket.off('draw-result')
      socket.off('room-reset')
      socket.off('error')
      socket.off('kicked')
      socket.off('room-closed')
    }
  }, [socket, session, roomCode, isConnected, router])

  // 页面卸载/关闭时 best-effort 离开房间
  useEffect(() => {
    if (!socket || !session?.user || !isConnected) return

    const leave = () => {
      try {
        socket.emit(
          'leave-room',
          {
            roomCode,
            userId: session.user.id,
          },
          () => {
            // ignore ack
          }
        )
      } catch {
        // ignore
      }
    }

    const handlePageHide = () => {
      leave()
    }

    window.addEventListener('pagehide', handlePageHide)

    return () => {
      window.removeEventListener('pagehide', handlePageHide)
      // 不在 cleanup 中调用 leave()，避免切换标签页时离开房间
    }
  }, [socket, session?.user, roomCode, isConnected])

  // 选择/取消选择影片
  const toggleMovie = useCallback((movieId: string) => {
    if (!myUserId) return
    const newSelection = mySelectedMovies.includes(movieId)
      ? mySelectedMovies.filter((id) => id !== movieId)
      : [...mySelectedMovies, movieId]

    setParticipants((prev) =>
      prev.map((p) =>
        String(p.userId) === myUserId
          ? {
              ...p,
              selectedMovies: newSelection,
            }
          : p
      )
    )

    // 更新到服务器
    if (socket && session?.user) {
      socket.emit(
        'update-user-movies',
        {
          roomCode,
          userId: session.user.id,
          selectedMovies: newSelection,
        },
        (res?: { ok?: boolean }) => {
          if (!res?.ok) {
            console.warn('[Room] update-user-movies ack not ok')
          }
        }
      )
    }
  }, [socket, roomCode, session?.user, mySelectedMovies, myUserId])

  const displayedUserMovies = useMemo(() => {
    if (showWatchedMovies) return userMovies
    return userMovies.filter((m) => !m.watched)
  }, [userMovies, showWatchedMovies])

  const allUnwatchedMovieIds = useMemo(() => {
    return userMovies.filter((m) => !m.watched).map((m) => m._id.toString())
  }, [userMovies])

  const handleAddAllUnwatched = useCallback(() => {
    if (!socket || !session?.user) return
    if (!myUserId) return
    if (allUnwatchedMovieIds.length === 0) return

    const newSelection = Array.from(new Set([...mySelectedMovies, ...allUnwatchedMovieIds]))

    setParticipants((prev) =>
      prev.map((p) =>
        String(p.userId) === myUserId
          ? {
              ...p,
              selectedMovies: newSelection,
            }
          : p
      )
    )

    socket.emit(
      'update-user-movies',
      {
        roomCode,
        userId: session.user.id,
        selectedMovies: newSelection,
      },
      (res?: { ok?: boolean }) => {
        if (!res?.ok) {
          console.warn('[Room] update-user-movies ack not ok (add all)')
        }
      }
    )
  }, [socket, session?.user, roomCode, mySelectedMovies, allUnwatchedMovieIds, myUserId])

  // 发起抽奖
  const handleStartDraw = () => {
    if (totalMoviePoolCount === 0) {
      alert('影片池为空，请参与者先选择影片')
      return
    }

    if (socket && isHost) {
      socket.emit('start-draw', {
        roomCode,
        userId: session?.user?.id,
      })
    }
  }

  // 重置房间
  const handleReset = () => {
    if (socket && isHost) {
      socket.emit('reset-room', {
        roomCode,
        userId: session?.user?.id,
      })
    }
  }

  // 复制房间号
  const handleCopyRoomCode = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(roomCode)
      } else {
        // 备用方案：使用 execCommand
        const textArea = document.createElement('textarea')
        textArea.value = roomCode
        textArea.style.position = 'fixed'
        textArea.style.left = '-9999px'
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
      }
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Copy failed:', error)
    }
  }

  // 退出房间
  const handleLeaveRoom = () => {
    if (socket && session?.user) {
      socket.emit(
        'leave-room',
        {
          roomCode,
          userId: session.user.id,
        },
        () => {
          socket.disconnect()
        }
      )
    }
    router.push('/')
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

  if (!session) return null

  return (
    <main className="min-h-screen notebook-bg p-8">
      <div className="max-w-7xl mx-auto">
        {/* 房间信息 */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl font-hand font-bold text-primary-blue">
                  房间
                </h1>
                <button
                  onClick={handleCopyRoomCode}
                  className="flex items-center gap-2 px-4 py-2 bg-primary-yellow rounded-lg border-2 border-yellow-600 font-hand font-bold text-lg hover:bg-yellow-400 transition-colors shadow-[3px_3px_0px_0px_rgba(0,0,0,0.2)]"
                  title="点击复制房间号"
                >
                  <span>{roomCode}</span>
                  {copied ? (
                    <span className="text-green-600">✓</span>
                  ) : (
                    <span className="text-gray-600">📋</span>
                  )}
                </button>
              </div>
              <p className="text-text-medium font-hand">
                状态: {roomStatus === 'waiting' ? '等待中' : roomStatus === 'drawing' ? '抽奖中' : '已完成'}
              </p>
            </div>
            <div className="flex gap-3">
              {isHost && (
                <SketchButton onClick={handleReset} variant="secondary">
                  重置房间
                </SketchButton>
              )}
              <SketchButton onClick={handleLeaveRoom} variant="secondary">
                退出房间
              </SketchButton>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* 左侧: 参与者列表 */}
          <div className="lg:col-span-1">
            <ParticipantList participants={participants} />
          </div>

          {/* 右侧: 主内容区 */}
          <div className="lg:col-span-3">
            {drawState === 'idle' && (
              <>
                {/* 影片选择区 */}
                <SketchCard className="p-6 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-2xl font-hand font-bold text-text-dark">
                        我的影片选择 ({mySelectedMovies.length})
                      </h2>
                      <p className="text-sm text-text-medium font-hand mt-1">
                        影片池总计: {totalMoviePoolCount} 部影片
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-2 font-hand text-sm text-text-medium select-none">
                        <input
                          type="checkbox"
                          checked={showWatchedMovies}
                          onChange={(e) => setShowWatchedMovies(e.target.checked)}
                          className="w-4 h-4"
                        />
                        显示已看影片
                      </label>

                      <SketchButton
                        onClick={handleAddAllUnwatched}
                        variant="secondary"
                        disabled={allUnwatchedMovieIds.length === 0}
                      >
                        添加全部未看
                      </SketchButton>

                      {isHost && (
                        <SketchButton
                          onClick={handleStartDraw}
                          size="lg"
                          disabled={totalMoviePoolCount === 0}
                        >
                          🎰 开始抽奖
                        </SketchButton>
                      )}
                    </div>
                  </div>

                  {userMovies.length === 0 ? (
                    <div className="text-center py-10">
                      <p className="text-text-medium font-hand">
                        你的影片库是空的,请先添加影片
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {displayedUserMovies.map((movie) => {
                        const isSelected = mySelectedMovies.includes(movie._id.toString())
                        const isInPool = moviePoolIds.includes(movie._id.toString())
                        return (
                          <div
                            key={movie._id.toString()}
                            onClick={() => toggleMovie(movie._id.toString())}
                            className="relative cursor-pointer"
                          >
                            <PosterCard
                              poster={movie.poster}
                              title={movie.title}
                              rating={movie.rating}
                              watched={movie.watched}
                            />
                            {isInPool && !isSelected && (
                              <div className="absolute top-2 right-2 bg-primary-blue text-white px-2 py-1 rounded-md text-xs font-hand font-bold shadow-md border border-blue-700">
                                已在池中
                              </div>
                            )}
                            {isSelected && (
                              <div className="absolute inset-0 bg-primary-green/30 rounded-lg border-4 border-primary-green flex items-center justify-center">
                                <div className="text-5xl">✓</div>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </SketchCard>

                <SketchCard className="p-6 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-2xl font-hand font-bold text-text-dark">
                        参与抽取的影片库 ({moviePoolIds.length})
                      </h2>
                      <p className="text-sm text-text-medium font-hand mt-1">
                        所有人已选择的影片会在这里合并展示
                      </p>
                    </div>
                  </div>

                  {moviePoolMeta.length === 0 ? (
                    <div className="text-center py-10">
                      <p className="text-text-medium font-hand">影片池为空，请先选择影片</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {moviePoolMeta.map((m) => (
                        <div key={m.id} className="relative">
                          <PosterCard poster={m.poster} title={m.title} rating={m.rating} />
                          <div className="mt-2">
                            <p className="text-xs text-text-medium font-hand">
                              {selectorsByMovieId[m.id]?.length ? `选择：${selectorsByMovieId[m.id].join('、')}` : ''}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </SketchCard>
              </>
            )}

            {/* 抽奖动画 */}
            {drawState === 'drawing' && (
              <div className="min-h-[400px] flex items-center justify-center">
                <SlotMachine
                  movies={drawMovies}
                  seed={drawSeed}
                  onComplete={() => {}}
                />
              </div>
            )}

            {/* 抽奖结果 */}
            {drawState === 'result' && drawResult && (
              <div className="min-h-[400px] flex items-center justify-center">
                <DrawResult movie={drawResult} onReset={isHost ? handleReset : undefined} />
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
