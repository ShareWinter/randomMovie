'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { SketchButton } from '@/components/ui/SketchButton'
import { useRouter, usePathname } from 'next/navigation'
import { MovieIcon, HomeIcon } from '@/components/HandDrawnIcon'

export default function Navbar() {
  const { data: session } = useSession()
  const router = useRouter()
  const pathname = usePathname()

  const isAuthPage = pathname.startsWith('/auth')
  const isHomePage = pathname === '/'

  if (isAuthPage) return null

  return (
    <nav className="fixed top-0 left-0 right-0 z-50">
      <div className="bg-amber-50/95 backdrop-blur-sm border-b-[3px] border-gray-400 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.15)]">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* 返回首页按钮 - 仅在非主页显示 */}
              {!isHomePage && (
                <Link 
                  href="/"
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg border-2 border-gray-300 bg-white hover:border-amber-400 hover:bg-amber-50 transition-all group"
                  title="返回首页"
                >
                  <div className="w-5 h-5 text-gray-600 group-hover:text-amber-600 transition-colors">
                    <HomeIcon />
                  </div>
                  <span className="font-hand text-sm text-gray-600 group-hover:text-amber-600 transition-colors hidden sm:inline">
                    首页
                  </span>
                </Link>
              )}
              
              <Link href="/" className="flex items-center gap-2 group">
                <div className="w-10 h-10 text-amber-600 group-hover:text-amber-700 transition-colors sketch-wiggle">
                  <MovieIcon />
                </div>
                <span className="text-2xl font-hand font-bold text-gray-700 group-hover:text-amber-700 transition-colors sketch-underline">
                  影片随机抽取
                </span>
              </Link>
            </div>

            <div className="flex items-center gap-4">
              {session ? (
                <>
                  <div className="hidden sm:flex items-center gap-6">
                    <Link 
                      href="/movies"
                      className="font-hand text-lg text-gray-600 hover:text-amber-600 transition-colors relative group"
                    >
                      <span className="relative">
                        我的影片库
                        <span className="absolute -bottom-1 left-0 w-0 h-[3px] bg-amber-400 group-hover:w-full transition-all duration-300 rounded-full" />
                      </span>
                    </Link>
                    <Link 
                      href="/history"
                      className="font-hand text-lg text-gray-600 hover:text-amber-600 transition-colors relative group"
                    >
                      <span className="relative">
                        历史记录
                        <span className="absolute -bottom-1 left-0 w-0 h-[3px] bg-amber-400 group-hover:w-full transition-all duration-300 rounded-full" />
                      </span>
                    </Link>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-hand text-lg text-gray-600 hidden sm:block">
                      {session.user?.name}
                    </span>
                    <SketchButton
                      size="sm"
                      variant="secondary"
                      onClick={() => signOut({ callbackUrl: '/' })}
                    >
                      退出
                    </SketchButton>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <SketchButton
                    size="sm"
                    variant="secondary"
                    onClick={() => router.push('/auth/login')}
                  >
                    登录
                  </SketchButton>
                  <SketchButton
                    size="sm"
                    onClick={() => router.push('/auth/register')}
                  >
                    注册
                  </SketchButton>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
