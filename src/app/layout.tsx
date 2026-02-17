import type { Metadata } from 'next'
import { Providers } from './providers'
import Navbar from '@/components/Navbar'
import './globals.css'

export const metadata: Metadata = {
  title: '影片随机抽取',
  description: '多人在线实时抽奖决定观看影片',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body>
        <Providers>
          <Navbar />
          <div className="pt-16">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  )
}
