'use client'

import { useEffect, useState } from 'react'
import { getSocket } from '@/lib/socket'
import type { Socket } from 'socket.io-client'

export function useSocket() {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    const socketInstance = getSocket()
    setSocket(socketInstance)

    socketInstance.on('connect', () => {
      setIsConnected(true)
    })

    socketInstance.on('disconnect', () => {
      setIsConnected(false)
    })

    return () => {
      socketInstance.off('connect')
      socketInstance.off('disconnect')
    }
  }, [])

  return { socket, isConnected }
}
