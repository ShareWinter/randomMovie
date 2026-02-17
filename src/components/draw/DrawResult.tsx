'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { SketchButton } from '@/components/ui/SketchButton'

interface DrawResultProps {
  movie: {
    id: string
    title: string
    poster: string
    year: string
    director: string
    rating: number
  }
  onReset?: () => void
}

export default function DrawResult({ movie, onReset }: DrawResultProps) {
  return (
    <motion.div
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="flex flex-col items-center"
    >
      <div className="text-center mb-6">
        <div className="text-6xl mb-2">🎉</div>
        <h2 className="text-3xl font-hand font-bold text-primary-blue">
          恭喜中奖!
        </h2>
      </div>

      <div className="bg-white rounded-lg border-4 border-primary-yellow shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] p-6 max-w-sm">
        <div className="w-48 h-72 relative mx-auto rounded-lg overflow-hidden border-2 border-gray-300 mb-4">
          {movie.poster ? (
            <Image
              src={movie.poster}
              alt={movie.title}
              fill
              className="object-cover"
              unoptimized
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center">
              <div className="text-6xl">🎬</div>
            </div>
          )}
          {movie.rating > 0 && (
            <div className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 px-2 py-1 rounded-md text-sm font-bold shadow-md border border-yellow-500">
              ⭐ {movie.rating}
            </div>
          )}
        </div>

        <div className="text-center">
          <h3 className="font-hand text-2xl font-bold text-text-dark mb-2">
            {movie.title}
          </h3>
          {movie.year && (
            <p className="font-hand text-text-medium">{movie.year}</p>
          )}
          {movie.director && (
            <p className="font-hand text-text-medium">导演: {movie.director}</p>
          )}
        </div>
      </div>

      {onReset && (
        <div className="mt-6">
          <SketchButton onClick={onReset} variant="secondary">
            再抽一次
          </SketchButton>
        </div>
      )}
    </motion.div>
  )
}
