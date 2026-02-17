'use client'

import { useState, useEffect } from 'react'
import { signIn, getCsrfToken } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { SketchInput } from '@/components/ui/SketchInput'
import { SketchButton } from '@/components/ui/SketchButton'

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [csrfToken, setCsrfToken] = useState<string>('')

  useEffect(() => {
    getCsrfToken().then((token) => {
      if (token) setCsrfToken(token)
    })
  }, [])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    try {
      const result = await signIn('credentials', {
        email,
        password,
        csrfToken,
        redirect: false,
      })

      if (result?.error) {
        setError('邮箱或密码错误')
      } else {
        router.push('/')
        router.refresh()
      }
    } catch {
      setError('登录失败，请重试')
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
              欢迎回来
            </h1>
            <p className="text-text-medium font-hand">
              登录以继续使用影片随机抽取
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
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
              placeholder="输入密码"
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
              {loading ? '登录中...' : '登录'}
            </SketchButton>
          </form>

          <div className="mt-6 text-center">
            <p className="text-text-medium font-hand">
              还没有账号?{' '}
              <Link 
                href="/auth/register"
                className="text-primary-blue hover:underline font-semibold"
              >
                立即注册
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
