'use client'

import { forwardRef } from 'react'
import { motion } from 'framer-motion'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

type SketchCardProps = React.ComponentPropsWithoutRef<typeof motion.div> & {
  hoverable?: boolean
}

export const SketchCard = forwardRef<HTMLDivElement, SketchCardProps>(
  ({ className, hoverable = false, children, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        {...(hoverable ? {
          whileHover: { scale: 1.02 },
          whileTap: { scale: 0.98 }
        } : {})}
        className={twMerge(
          clsx(
            'bg-white rounded-lg border-2 border-gray-300',
            'shadow-[3px_3px_0px_0px_rgba(0,0,0,0.2)]',
            hoverable && 'hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.25)] cursor-pointer transition-shadow',
            className
          )
        )}
        {...props}
      >
        {children}
      </motion.div>
    )
  }
)

SketchCard.displayName = 'SketchCard'
