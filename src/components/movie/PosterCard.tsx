'use client'

import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { useState } from 'react'

interface PosterCardProps {
  poster: string
  title: string
  rating: number
  userRating?: number
  watched?: boolean
  onClick?: () => void
  isDeleting?: boolean
}

// 爆炸粒子效果
function ExplosionParticles({ poster }: { poster: string }) {
  // 生成多种类型的粒子
  const particles = Array.from({ length: 80 }, (_, i) => {
    const angle = (Math.random() * 360) * (Math.PI / 180)
    const distance = 100 + Math.random() * 200
    const size = 4 + Math.random() * 12
    const type = i % 4 // 不同类型的粒子
    
    return {
      id: i,
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance,
      size,
      rotate: Math.random() * 720 - 360,
      delay: Math.random() * 0.1,
      type,
      color: type === 0 ? '#fbbf24' : type === 1 ? '#f97316' : type === 2 ? '#ef4444' : '#a855f7',
    }
  })

  // 中心爆炸光环
  const rings = Array.from({ length: 6 }, (_, i) => ({
    id: i,
    scale: 1 + i * 0.5,
    delay: i * 0.1,
  }))

  return (
    <div className="absolute inset-0 overflow-visible pointer-events-none">
      {/* 中心爆炸光环 */}
      {rings.map((ring) => (
        <motion.div
          key={`ring-${ring.id}`}
          initial={{ scale: 0, opacity: 1 }}
          animate={{ scale: ring.scale * 3, opacity: 0 }}
          transition={{ duration: 0.6, delay: ring.delay, ease: 'easeOut' }}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full border-4 border-yellow-400"
          style={{ boxShadow: '0 0 20px #fbbf24' }}
        />
      ))}

      {/* 粒子 */}
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          initial={{ 
            x: 0, 
            y: 0, 
            scale: 1,
            rotate: 0,
            opacity: 1,
          }}
          animate={{ 
            x: particle.x, 
            y: particle.y, 
            scale: 0,
            rotate: particle.rotate,
            opacity: 0,
          }}
          transition={{ 
            duration: 0.8 + Math.random() * 0.4, 
            delay: particle.delay,
            ease: [0.4, 0, 0.2, 1],
          }}
          className="absolute left-1/2 top-1/2"
          style={{
            width: particle.size,
            height: particle.size,
            borderRadius: particle.type === 3 ? '50%' : '2px',
            backgroundColor: particle.color,
            boxShadow: `0 0 ${particle.size}px ${particle.color}`,
          }}
        />
      ))}

      {/* 大块碎片 */}
      {Array.from({ length: 16 }, (_, i) => {
        const angle = (i * 45 + Math.random() * 20) * (Math.PI / 180)
        const distance = 80 + Math.random() * 100
        return {
          id: i,
          x: Math.cos(angle) * distance,
          y: Math.sin(angle) * distance,
          rotate: Math.random() * 180 - 90,
          delay: Math.random() * 0.1,
        }
      }).map((piece) => (
        <motion.div
          key={`piece-${piece.id}`}
          initial={{ 
            x: 0, 
            y: 0, 
            rotate: 0,
            opacity: 1,
            scale: 1,
          }}
          animate={{ 
            x: piece.x, 
            y: piece.y + 50, 
            rotate: piece.rotate,
            opacity: 0,
            scale: 0.3,
          }}
          transition={{ 
            duration: 0.7, 
            delay: piece.delay,
            ease: [0.4, 0, 0.2, 1],
          }}
          className="absolute left-1/2 top-1/2 w-8 h-10 rounded"
          style={{
            backgroundImage: poster ? `url(${poster})` : undefined,
            backgroundSize: '200% 200%',
            backgroundPosition: `${(piece.id % 3) * 50}% ${Math.floor(piece.id / 3) * 50}%`,
            backgroundColor: !poster ? '#fef3c7' : undefined,
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
          }}
        />
      ))}

      {/* 闪光效果 */}
      {Array.from({ length: 12 }, (_, i) => ({
        id: i,
        x: (Math.random() - 0.5) * 100,
        y: (Math.random() - 0.5) * 100,
        delay: Math.random() * 0.2,
      })).map((spark) => (
        <motion.div
          key={`spark-${spark.id}`}
          initial={{ scale: 0, opacity: 1 }}
          animate={{ scale: [0, 2, 0], opacity: [1, 1, 0] }}
          transition={{ duration: 0.4, delay: spark.delay }}
          className="absolute left-1/2 top-1/2 w-2 h-2 bg-white rounded-full"
          style={{
            transform: `translate(${spark.x}px, ${spark.y}px)`,
            boxShadow: '0 0 10px #fff, 0 0 20px #fbbf24',
          }}
        />
      ))}
    </div>
  )
}

export default function PosterCard({ poster, title, rating, userRating, watched, onClick, isDeleting }: PosterCardProps) {
  const [imageError, setImageError] = useState(false)
  
  // 确保 watched 有默认值
  const isWatched = watched ?? false

  return (
    <AnimatePresence mode="wait">
      {isDeleting ? (
        <motion.div
          key="exploding"
          initial={{ scale: 1 }}
          animate={{ scale: [1, 1.05, 0] }}
          transition={{ duration: 0.8 }}
          className="cursor-pointer group"
        >
          <div className="relative overflow-visible rounded-lg border-2 border-red-500 bg-white shadow-lg">
            <div className="aspect-[2/3] relative bg-gradient-to-br from-amber-50 to-orange-50">
              <ExplosionParticles poster={poster} />
            </div>
            <motion.div 
              className="p-3 bg-white border-t-2 border-gray-200"
              animate={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h3 className="font-hand text-base font-bold text-gray-800 truncate">{title}</h3>
            </motion.div>
          </div>
        </motion.div>
      ) : (
        <motion.div
          key="normal"
          whileHover={{ scale: 1.05, rotate: -1 }}
          whileTap={{ scale: 0.98 }}
          onClick={onClick}
          className="cursor-pointer group"
        >
          <div className="relative overflow-hidden rounded-lg border-2 border-gray-300 bg-white shadow-md transition-all group-hover:shadow-xl group-hover:border-orange-300">
            <div className="aspect-[2/3] relative bg-gradient-to-br from-amber-50 to-orange-50">
              {poster && !imageError ? (
                <Image 
                  src={poster} 
                  alt={title} 
                  fill 
                  className="object-cover" 
                  onError={() => setImageError(true)} 
                  unoptimized 
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center p-4">
                  <div className="text-center">
                    <div className="text-6xl mb-2">🎬</div>
                    <div className="text-sm text-gray-500 font-hand">{title}</div>
                  </div>
                </div>
              )}
              {/* 豆瓣评分 */}
              {rating > 0 && (
                <div className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 px-2 py-1 rounded-md text-xs font-bold shadow-md border border-yellow-500">
                  ⭐ {rating}
                </div>
              )}
              {/* 观看状态 */}
              {isWatched && (
                <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded-md text-xs font-bold shadow-md border border-green-600">
                  ✓ 已看
                </div>
              )}
              {/* 我的评分 */}
              {(userRating ?? 0) > 0 && (
                <div className="absolute bottom-2 left-2 bg-amber-500 text-white px-2 py-1 rounded-md text-xs font-bold shadow-md border border-amber-600">
                  我 {userRating}
                </div>
              )}
            </div>
            <div className="p-3 bg-white border-t-2 border-gray-200">
              <h3 className="font-hand text-base font-bold text-gray-800 truncate">{title}</h3>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
