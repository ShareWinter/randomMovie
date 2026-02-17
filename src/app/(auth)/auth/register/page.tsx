'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { SketchInput } from '@/components/ui/SketchInput'
import { SketchButton } from '@/components/ui/SketchButton'

export default function RegisterPage() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirmPassword') as string
    const name = formData.get('name') as string

    if (password !== confirmPassword) {
      setError('两次输入的密码不一致')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError('密码至少需要6个字符')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || '注册失败')
        return
      }

      // 注册成功,跳转到登录页
      router.push('/auth/login?registered=true')
    } catch {
      setError('注册失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen notebook-bg flex items-center justify-center p-8">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg border-2 border-gray-300 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.2)] p-8">
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">🎬</div>
            <h1 className="text-4xl font-hand font-bold text-primary-blue mb-2">
              创建账号
            </h1>
            <p className="text-text-medium font-hand">
              加入影片随机抽取社区
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <SketchInput
              label="用户名"
              type="text"
              name="name"
              placeholder="你的名字"
              required
            />

            <SketchInput
              label="邮箱"
              type="email"
              name="email"
              placeholder="your@email.com"
              required
            />

            <SketchInput
              label="密码"
              type="password"
              name="password"
              placeholder="至少6个字符"
              required
            />

            <SketchInput
              label="确认密码"
              type="password"
              name="confirmPassword"
              placeholder="再次输入密码"
              required
            />

            {error && (
              <div className="bg-red-50 border-2 border-red-300 rounded-lg p-3">
                <p className="text-functional-error font-hand text-sm">{error}</p>
              </div>
            )}

            <SketchButton
              type="submit"
              className="w-full"
              size="lg"
              disabled={loading}
            >
              {loading ? '注册中...' : '注册'}
            </SketchButton>
          </form>

          <div className="mt-6 text-center">
            <p className="text-text-medium font-hand">
              已有账号?{' '}
              <Link 
                href="/auth/login"
                className="text-primary-blue hover:underline font-semibold"
              >
                立即登录
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
