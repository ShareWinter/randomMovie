'use client'

import { motion, AnimatePresence } from 'framer-motion'
import type { IParticipant } from '@/types'

interface ParticipantListProps {
  participants: IParticipant[]
}

export default function ParticipantList({ participants }: ParticipantListProps) {
  return (
    <div className="bg-white rounded-lg border-2 border-gray-300 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.2)] p-4">
      <h3 className="font-hand font-bold text-lg mb-3">
        参与者 ({participants.length})
      </h3>
      <div className="space-y-2">
        <AnimatePresence>
          {participants.map((participant, index) => (
            <motion.div
              key={participant.userId}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-3 p-2 bg-background-cream rounded-lg"
            >
              <div className="w-10 h-10 rounded-full bg-primary-yellow flex items-center justify-center text-xl">
                {participant.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-hand font-semibold text-text-dark">
                    {participant.name}
                  </p>
                  {participant.isHost && (
                    <span className="text-xs text-primary-blue font-hand">
                      👑 房主
                    </span>
                  )}
                </div>
                <p className="text-xs text-text-medium font-hand">
                  已选 {participant.selectedMovies?.length || 0} 部影片
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
