'use client'

import { io, Socket } from 'socket.io-client'

let socket: Socket | null = null

export function getSocket(): Socket {
  if (!socket) {
    // 获取当前页面的 origin 作为 Socket.io 服务器地址
    const socketUrl =
      process.env.NEXT_PUBLIC_SOCKET_URL ||
      (typeof window !== 'undefined' ? window.location.origin : '')
    console.log('[Socket] Connecting to:', socketUrl)
    
    socket = io(socketUrl, {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
    })
    
    socket.on('connect', () => {
      console.log('[Socket] Connected:', socket?.id)
    })
    
    socket.on('connect_error', (error) => {
      console.error('[Socket] Connection error:', error)
    })
  }
  return socket
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}
