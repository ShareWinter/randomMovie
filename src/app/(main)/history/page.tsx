'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import HistoryList from '@/components/history/HistoryList'
import type { IDrawHistory } from '@/types'

export default function HistoryPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [history, setHistory] = useState<IDrawHistory[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    }
  }, [status, router])

  useEffect(() => {
    if (session?.user) {
      fetchHistory()
    }
  }, [session])

  async function fetchHistory() {
    try {
      const response = await fetch('/api/history')
      const data = await response.json()
      if (response.ok) {
        setHistory(data.history)
      }
    } catch (error) {
      console.error('Failed to fetch history:', error)
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen notebook-bg flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📊</div>
          <p className="font-hand text-xl text-text-medium">加载中...</p>
        </div>
      </div>
    )
  }

  if (!session) return null

  return (
    <main className="min-h-screen notebook-bg p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-hand font-bold text-primary-blue mb-2">
            📊 抽奖历史记录
          </h1>
          <p className="text-text-medium font-hand">
            共 {history.length} 次抽奖记录
          </p>
        </div>

        <HistoryList history={history} />
      </div>
    </main>
  )
}
