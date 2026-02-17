'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface SlotMachineProps {
  movies: Array<{ id: string; title: string; poster: string }>
  seed: number
  onComplete: () => void
}

export default function SlotMachine({ movies, seed, onComplete }: SlotMachineProps) {
  const [displayIndex, setDisplayIndex] = useState(0)
  const [isSpinning, setIsSpinning] = useState(true)

  useEffect(() => {
    if (!isSpinning || movies.length === 0) return

    // 使用确定性随机种子
    const targetIndex = seed % movies.length
    const duration = 5000 // 5秒动画
    const startTime = Date.now()

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime
      const progress = elapsed / duration

      if (progress >= 1) {
        setDisplayIndex(targetIndex)
        setIsSpinning(false)
        clearInterval(interval)
        setTimeout(onComplete, 500)
      } else {
        // 前80%时间快速滚动,后20%时间减速
        setDisplayIndex((prev) => (prev + 1) % movies.length)
      }
    }, 100)

    return () => clearInterval(interval)
  }, [isSpinning, movies, seed, onComplete])

  if (movies.length === 0) return null

  const currentMovie = movies[displayIndex]

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="flex flex-col items-center justify-center"
    >
      <div className="text-6xl mb-4 animate-bounce">🎰</div>
      <motion.div
        key={displayIndex}
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white rounded-lg border-4 border-primary-yellow shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] p-6 min-w-[200px] text-center"
      >
        <p className="font-hand text-2xl font-bold text-text-dark">
          {currentMovie.title}
        </p>
      </motion.div>
      {isSpinning && (
        <p className="mt-4 font-hand text-xl text-text-medium animate-pulse">
          抽奖中...
        </p>
      )}
    </motion.div>
  )
}
