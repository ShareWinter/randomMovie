'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { SketchInput } from '@/components/ui/SketchInput'
import { SketchButton } from '@/components/ui/SketchButton'

export default function JoinRoomPage() {
  const router = useRouter()
  const { status } = useSession()
  const [roomCode, setRoomCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch(`/api/rooms?code=${roomCode.toUpperCase()}`)
      const data = await response.json()

      if (response.ok) {
        router.push(`/room/${data.room.code}`)
      } else {
        setError(data.error || '房间不存在')
      }
    } catch (error) {
      console.error('Join room error:', error)
      setError('加入失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  if (status === 'unauthenticated') {
    router.push('/auth/login')
    return null
  }

  return (
    <main className="min-h-screen notebook-bg flex items-center justify-center p-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg border-2 border-gray-300 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.2)] p-8 text-center">
          <div className="text-6xl mb-6">🚪</div>
          <h1 className="text-4xl font-hand font-bold text-primary-blue mb-4">
            加入房间
          </h1>
          <p className="text-text-medium font-hand mb-8">
            输入6位房间码加入好友创建的房间
          </p>

          <form onSubmit={handleJoin} className="space-y-6">
            <SketchInput
              label="房间码"
              name="roomCode"
              placeholder="输入6位房间码"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              maxLength={6}
              required
            />

            {error && (
              <div className="bg-red-50 border-2 border-red-300 rounded-lg p-3">
                <p className="text-functional-error font-hand text-sm">{error}</p>
              </div>
            )}

            <SketchButton
              type="submit"
              size="lg"
              className="w-full"
              disabled={loading || roomCode.length !== 6}
            >
              {loading ? '加入中...' : '加入房间'}
            </SketchButton>
          </form>
        </div>
      </div>
    </main>
  )
}
