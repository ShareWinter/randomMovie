'use client'

import { forwardRef } from 'react'
import { motion } from 'framer-motion'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

type SketchButtonProps = React.ComponentPropsWithoutRef<typeof motion.button> & {
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'sm' | 'md' | 'lg'
}

export const SketchButton = forwardRef<HTMLButtonElement, SketchButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={twMerge(
          clsx(
            'relative font-hand font-bold rounded-lg border-2 transition-all',
            'shadow-[3px_3px_0px_0px_rgba(0,0,0,0.2)]',
            'hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.25)]',
            {
              'bg-primary-yellow border-yellow-600 text-gray-800 hover:bg-yellow-200':
                variant === 'primary',
              'bg-white border-gray-400 text-gray-700 hover:bg-gray-50':
                variant === 'secondary',
              'bg-transparent border-gray-400 text-gray-700 hover:bg-gray-50':
                variant === 'outline',
              'px-3 py-1 text-sm': size === 'sm',
              'px-4 py-2 text-base': size === 'md',
              'px-6 py-3 text-lg': size === 'lg',
            }
          ),
          className
        )}
        {...props}
      >
        {children}
      </motion.button>
    )
  }
)

SketchButton.displayName = 'SketchButton'
