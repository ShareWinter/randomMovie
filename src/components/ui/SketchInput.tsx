'use client'

import { InputHTMLAttributes, forwardRef } from 'react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

interface SketchInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const SketchInput = forwardRef<HTMLInputElement, SketchInputProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-text-dark font-hand font-semibold mb-2 text-lg">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={twMerge(
            clsx(
              'w-full px-4 py-3 rounded-lg border-2 font-hand text-base',
              'bg-white border-gray-300 text-text-dark',
              'placeholder-gray-400',
              'focus:outline-none focus:border-primary-blue',
              'transition-colors',
              error && 'border-functional-error'
            ),
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-2 text-sm text-functional-error font-hand">
            {error}
          </p>
        )}
      </div>
    )
  }
)

SketchInput.displayName = 'SketchInput'
