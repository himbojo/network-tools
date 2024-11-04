// File: frontend/src/services/websocket.ts
// Type definitions and constants for WebSocket communication
export interface WebSocketCommand {
    type: 'ping' | 'dig'
    command: string
    parameters: Record<string, unknown>
  }
  
  export interface WebSocketResponse {
    output: string
    error?: string
  }
  
  export const WS_URL = 'ws://localhost:8080/ws'
  
  export const createWebSocketMessage = (
    type: WebSocketCommand['type'],
    command: string,
    parameters: Record<string, unknown>
  ): WebSocketCommand => ({
    type,
    command,
    parameters
  })