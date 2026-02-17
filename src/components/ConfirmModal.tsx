'use client'

import { useEffect } from 'react'

interface ConfirmModalProps {
  isOpen: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = '确定',
  cancelText = '取消',
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onCancel}
    >
      {/* 背景遮罩 */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      
      {/* 弹窗内容 */}
      <div 
        className="relative bg-white rounded-xl border-4 border-gray-800 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.3)] max-w-sm w-full p-6 sketch-wiggle"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 手绘风格装饰 */}
        <div className="absolute -top-2 -left-2 w-4 h-4 bg-primary-yellow rounded-full border-2 border-gray-800" />
        <div className="absolute -top-2 -right-2 w-4 h-4 bg-primary-blue rounded-full border-2 border-gray-800" />
        <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-primary-green rounded-full border-2 border-gray-800" />
        <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-orange-500 rounded-full border-2 border-gray-800" />

        {/* 标题 */}
        <h3 className="text-2xl font-hand font-bold text-gray-800 text-center mb-4 sketch-underline inline-block">
          {title}
        </h3>

        {/* 消息 */}
        <p className="text-lg font-hand text-gray-600 text-center mb-6">
          {message}
        </p>

        {/* 按钮 */}
        <div className="flex gap-4 justify-center">
          <button
            onClick={onCancel}
            className="px-6 py-2 bg-gray-200 text-gray-700 font-hand font-bold rounded-lg border-2 border-gray-400 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.2)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.25)] hover:bg-gray-300 transition-all"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="px-6 py-2 bg-red-500 text-white font-hand font-bold rounded-lg border-2 border-red-600 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.2)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.25)] hover:bg-red-600 transition-all"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
