'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { SketchButton } from '@/components/ui/SketchButton'

export default function CreateRoomPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(false)

  const handleCreate = async () => {
    if (!session?.user) return

    setLoading(true)
    try {
      const response = await fetch('/api/rooms', {
        method: 'POST',
      })

      const data = await response.json()

      if (response.ok) {
        router.push(`/room/${data.room.code}`)
      } else {
        alert(data.error || '创建失败')
      }
    } catch (error) {
      console.error('Create room error:', error)
      alert('创建失败')
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
          <div className="text-6xl mb-6">🏠</div>
          <h1 className="text-4xl font-hand font-bold text-primary-blue mb-4">
            创建房间
          </h1>
          <p className="text-text-medium font-hand mb-8">
            创建一个新房间,邀请好友一起抽奖决定观看哪部影片
          </p>
          <SketchButton
            onClick={handleCreate}
            size="lg"
            className="w-full"
            disabled={loading}
          >
            {loading ? '创建中...' : '创建房间'}
          </SketchButton>
        </div>
      </div>
    </main>
  )
}
