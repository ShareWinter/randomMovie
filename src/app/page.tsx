'use client'

import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { HomeIcon, DoorIcon, MovieIcon, ChartIcon } from '@/components/HandDrawnIcon'

export default function HomePage() {
  const { data: session } = useSession()

  return (
    <main className="h-[calc(100vh-4rem)] notebook-bg p-6 md:p-10 overflow-auto">
      <div className="h-full flex flex-col max-w-5xl mx-auto">
        <div className="text-center mb-6 md:mb-10 animate-sketch-in flex-shrink-0">
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-hand font-bold text-primary-blue mb-2 sketch-underline inline-block">
            随机抽取电影
          </h1>
          <p className="text-xl md:text-2xl text-text-medium font-hand mt-4">
            与朋友一起决定今晚看什么电影
          </p>
        </div>

        {session ? (
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 content-start">
            <div className="sketch-card p-5 md:p-6 sketch-wiggle">
              <div className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-4 text-primary-green">
                <HomeIcon />
              </div>
              <h2 className="text-xl md:text-3xl font-hand font-bold text-text-dark mb-3 text-center text-primary-green">
                创建房间
              </h2>
              <p className="text-lg md:text-xl text-text-medium text-center mb-5">
                创建新房间，邀请朋友一起抽奖
              </p>
              <div className="flex justify-center">
                <Link href="/room/create" className="bg-primary-blue px-8 py-3 rounded-lg text-white font-hand font-bold shadow-[5px_5px_0px_0px_rgba(0,0,0,0.2)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,0.25)] transition-all text-lg sketch-button">
                  创建房间
                </Link>
              </div>
            </div>

            <div className="sketch-card p-5 md:p-6 sketch-wiggle" style={{ animationDelay: '0.5s' }}>
              <div className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-4 text-orange-600">
                <DoorIcon />
              </div>
              <h2 className="text-xl md:text-3xl font-hand font-bold text-text-dark mb-3 text-center text-orange-600">
                加入房间
              </h2>
              <p className="text-lg md:text-xl text-text-medium text-center mb-5">
                输入房间号，加入朋友的房间
              </p>
              <div className="flex justify-center">
                <Link href="/room/join" className="bg-green-600 px-8 py-3 rounded-lg text-white font-hand font-bold shadow-[5px_5px_0px_0px_rgba(0,0,0,0.2)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,0.25)] transition-all text-lg sketch-button">
                  加入房间
                </Link>
              </div>
            </div>

            <div className="sketch-card p-5 md:p-6 sketch-wiggle" style={{ animationDelay: '1s' }}>
              <div className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-4 text-primary-blue">
                <MovieIcon />
              </div>
              <h2 className="text-xl md:text-3xl font-hand font-bold text-text-dark mb-3 text-center text-primary-blue">
                我的影片库
              </h2>
              <p className="text-lg md:text-xl text-text-medium text-center mb-5">
                管理你的影片收藏
              </p>
              <div className="flex justify-center">
                <Link href="/movies" className="bg-purple-500 px-8 py-3 rounded-lg text-white font-hand font-bold shadow-[5px_5px_0px_0px_rgba(0,0,0,0.2)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,0.25)] transition-all text-lg sketch-button">
                  管理影片库
                </Link>
              </div>
            </div>

            <div className="sketch-card p-5 md:p-6 sketch-wiggle" style={{ animationDelay: '1.5s' }}>
              <div className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-4 text-purple-600">
                <ChartIcon />
              </div>
              <h2 className="text-xl md:text-3xl font-hand font-bold text-text-dark mb-3 text-center text-purple-600">
                历史记录
              </h2>
              <p className="text-lg md:text-xl text-text-medium text-center mb-5">
                查看抽奖历史
              </p>
              <div className="flex justify-center">
                <Link href="/history" className="bg-indigo-600 px-8 py-3 rounded-lg text-white font-hand font-bold shadow-[5px_5px_0px_0px_rgba(0,0,0,0.2)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,0.25)] transition-all text-lg sketch-button">
                  查看历史
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <p className="text-xl md:text-2xl text-text-medium font-hand mb-6">
              与朋友一起决定今晚看什么电影
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-xl">
              <div className="sketch-card p-5 md:p-6 sketch-wiggle">
                <div className="w-14 h-14 md:w-16 md:h-16 mx-auto mb-3 text-primary-green">
                  <HomeIcon />
                </div>
                <h3 className="text-lg md:text-xl font-hand font-bold text-text-dark mb-3 text-center text-primary-green">
                  创建房间
                </h3>
                <p className="text-base md:text-lg text-text-medium text-center mb-5">
                  创建新房间，邀请朋友一起抽奖
                </p>
                <div className="flex justify-center">
                  <Link href="/room/create" className="bg-primary-blue px-8 py-3 rounded-lg text-white font-hand font-bold shadow-[5px_5px_0px_0px_rgba(0,0,0,0.2)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,0.25)] transition-all text-lg sketch-button">
                    创建房间
                  </Link>
                </div>
              </div>

              <div className="sketch-card p-5 md:p-6 sketch-wiggle" style={{ animationDelay: '0.5s' }}>
                <div className="w-14 h-14 md:w-16 md:h-16 mx-auto mb-3 text-orange-600">
                  <DoorIcon />
                </div>
                <h3 className="text-lg md:text-xl font-hand font-bold text-text-dark mb-3 text-center text-orange-600">
                  加入房间
                </h3>
                <p className="text-base md:text-lg text-text-medium text-center mb-5">
                  输入房间号，加入朋友的房间
                </p>
                <div className="flex justify-center">
                  <Link href="/room/join" className="bg-green-600 px-8 py-3 rounded-lg text-white font-hand font-bold shadow-[5px_5px_0px_0px_rgba(0,0,0,0.2)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,0.25)] transition-all text-lg sketch-button">
                    加入房间
                  </Link>
                </div>
              </div>
            </div>
            <div className="mt-8">
              <Link href="/movies" className="bg-purple-500 px-8 py-3 rounded-lg text-white font-hand font-bold shadow-[5px_5px_0px_0px_rgba(0,0,0,0.2)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,0.25)] transition-all text-lg sketch-button inline-block">
                <span className="inline-flex items-center gap-2">
                  <span className="w-6 h-6">
                    <MovieIcon />
                  </span>
                  管理我的影片库
                </span>
              </Link>
            </div>
            <div className="mt-6">
              <div className="flex gap-5 justify-center">
                <Link 
                  href="/auth/login"
                  className="bg-primary-yellow px-8 py-3 rounded-lg border-2 border-yellow-600 text-gray-800 font-hand font-bold shadow-[5px_5px_0px_0px_rgba(0,0,0,0.2)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,0.25)] transition-all text-lg sketch-button"
                >
                  登录
                </Link>
                <Link 
                  href="/auth/register"
                  className="bg-white px-8 py-3 rounded-lg border-2 border-gray-400 text-gray-700 font-hand font-bold shadow-[5px_5px_0px_0px_rgba(0,0,0,0.2)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,0.25)] transition-all text-lg sketch-button"
                >
                  注册
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
