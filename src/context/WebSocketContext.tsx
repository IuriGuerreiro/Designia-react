import React, { createContext, useEffect, useRef, useState, useCallback } from 'react'
import { useAuthStore } from '@/features/auth/hooks/useAuthStore'
import { tokenStorage } from '@/shared/utils/tokenStorage'

export interface WebSocketContextType {
  send: (data: unknown) => void
  lastMessage: MessageEvent | null
  readyState: number
}

// eslint-disable-next-line react-refresh/only-export-components
export const WebSocketContext = createContext<WebSocketContextType | null>(null)

const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL || 'ws://localhost:8000'

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuthStore()
  const [lastMessage, setLastMessage] = useState<MessageEvent | null>(null)
  const [readyState, setReadyState] = useState<number>(WebSocket.CLOSED)
  const socketRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const reconnectAttemptsRef = useRef(0)

  // Ref to hold the connect function to allow recursive calls
  const connectRef = useRef<() => void>(() => {})

  const connect = useCallback(() => {
    if (!isAuthenticated) return

    const token = tokenStorage.getAccessToken()
    if (!token) return

    // Defaulting to activity socket as the global one
    // This handles unread counts, notifications, and cart updates
    const url = `${WS_BASE_URL}/ws/activity/?token=${token}`

    if (import.meta.env.VITE_DEBUG_MODE === 'true') {
      console.log('[WebSocket] Connecting to activity socket')
    }

    const socket = new WebSocket(url)
    socketRef.current = socket
    setReadyState(WebSocket.CONNECTING)

    socket.onopen = () => {
      if (import.meta.env.VITE_DEBUG_MODE === 'true') {
        console.log('[WebSocket] Connected')
      }
      setReadyState(WebSocket.OPEN)
      reconnectAttemptsRef.current = 0
    }

    socket.onmessage = event => {
      setLastMessage(event)
    }

    socket.onclose = event => {
      if (import.meta.env.VITE_DEBUG_MODE === 'true') {
        console.log('[WebSocket] Closed', event.code, event.reason)
      }
      setReadyState(WebSocket.CLOSED)

      // Attempt reconnection if not closed normally (1000)
      if (isAuthenticated && event.code !== 1000) {
        const timeout = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000)
        if (import.meta.env.VITE_DEBUG_MODE === 'true') {
          console.log(
            `[WebSocket] Reconnecting in ${timeout}ms (attempt ${reconnectAttemptsRef.current + 1})`
          )
        }
        reconnectTimeoutRef.current = setTimeout(() => {
          reconnectAttemptsRef.current += 1
          connectRef.current()
        }, timeout)
      }
    }

    socket.onerror = error => {
      console.error('[WebSocket] Error', error)
      // Error often precedes onclose, so we let onclose handle reconnection
    }
  }, [isAuthenticated])

  // Update the ref whenever connect changes
  useEffect(() => {
    connectRef.current = connect
  }, [connect])

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }
    if (socketRef.current) {
      socketRef.current.close(1000, 'User logout or component unmount')
      socketRef.current = null
    }
    setReadyState(WebSocket.CLOSED)
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      connect()
    } else {
      disconnect()
    }

    return () => {
      disconnect()
    }
  }, [isAuthenticated, connect, disconnect])

  const send = useCallback((data: unknown) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      const payload = typeof data === 'string' ? data : JSON.stringify(data)
      socketRef.current.send(payload)
    } else {
      console.warn('[WebSocket] Cannot send message: socket not open')
    }
  }, [])

  return (
    <WebSocketContext.Provider value={{ send, lastMessage, readyState }}>
      {children}
    </WebSocketContext.Provider>
  )
}
