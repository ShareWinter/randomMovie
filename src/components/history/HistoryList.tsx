'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import type { IDrawHistory } from '@/types'

interface HistoryListProps {
  history: IDrawHistory[]
}

export default function HistoryList({ history }: HistoryListProps) {
  if (history.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-8xl mb-6">📊</div>
        <h2 className="text-2xl font-hand font-bold text-text-dark mb-4">
          暂无抽奖记录
        </h2>
        <p className="text-text-medium font-hand">
          参与抽奖后,记录会在这里显示
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {history.map((record, index) => (
        <motion.div
          key={record._id.toString()}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white rounded-lg border-2 border-gray-300 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.2)] overflow-hidden hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.25)] transition-shadow"
        >
          <div className="flex gap-4 p-4">
            {/* 海报 */}
            <div className="flex-shrink-0">
              <div className="w-24 h-36 relative rounded-lg overflow-hidden border-2 border-gray-300">
                {record.moviePoster ? (
                  <Image
                    src={record.moviePoster}
                    alt={record.movieTitle}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center">
                    <div className="text-4xl">🎬</div>
                  </div>
                )}
                {record.movieRating > 0 && (
                  <div className="absolute top-1 right-1 bg-yellow-400 text-yellow-900 px-1 py-0.5 rounded text-xs font-bold shadow-md">
                    ⭐ {record.movieRating}
                  </div>
                )}
              </div>
            </div>

            {/* 信息 */}
            <div className="flex-1">
              <h3 className="font-hand text-xl font-bold text-text-dark mb-2">
                {record.movieTitle}
              </h3>
              <div className="space-y-1 text-sm font-hand text-text-medium">
                <p>📅 {new Date(record.drawnAt).toLocaleDateString('zh-CN')} {new Date(record.drawnAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}</p>
                <p>🏠 房间: {record.roomCode}</p>
                <p>👥 参与人数: {record.participants}</p>
                {record.movieYear && <p>📅 年份: {record.movieYear}</p>}
              </div>
            </div>

            {/* 标签 */}
            <div className="flex items-start">
              <div className="bg-primary-green text-white px-3 py-1 rounded-lg font-hand text-sm font-semibold">
                已完成
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}
