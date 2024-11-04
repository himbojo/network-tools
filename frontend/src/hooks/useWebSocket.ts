// File: frontend/src/hooks/useWebSocket.ts
import { useState, useEffect, useCallback } from 'react'

interface WebSocketMessage {
  type: 'ping' | 'dig'
  command: string
  parameters: Record<string, unknown>
}

interface WebSocketResponse {
  output: string
  error?: string
}

export const useWebSocket = () => {
  const [socket, setSocket] = useState<WebSocket | null>(null)
  const [connected, setConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // TODO: Set up WebSocket connection with backend
    const ws = new WebSocket('ws://localhost:8080/ws')

    ws.onopen = () => {
      setConnected(true)
      setError(null)
    }

    ws.onclose = () => {
      setConnected(false)
      // TODO: Implement reconnection logic
    }

    ws.onerror = (event) => {
      setError('WebSocket connection error')
      console.error('WebSocket error:', event)
    }

    setSocket(ws)

    return () => {
      ws.close()
    }
  }, [])

  const sendMessage = useCallback((message: WebSocketMessage) => {
    if (socket?.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(message))
    } else {
      setError('WebSocket is not connected')
    }
  }, [socket])

  return {
    connected,
    error,
    sendMessage
  }
}