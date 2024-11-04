// File: frontend/src/hooks/useWebSocket.ts
import { useState, useEffect, useCallback, useRef } from 'react';

interface WebSocketMessage {
  type: 'ping' | 'dig';
  command: string;
  parameters: Record<string, unknown>;
}

interface WebSocketResponse {
  output: string;
  error?: string;
}

export const useWebSocket = () => {
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const handlersRef = useRef<{
    onOutput: ((output: string) => void) | null;
    onError: ((error: string) => void) | null;
  }>({
    onOutput: null,
    onError: null
  });

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8080/ws');

    ws.onopen = () => {
      setConnected(true);
      setError(null);
    };

    ws.onclose = () => {
      setConnected(false);
      setError('Connection closed');
    };

    ws.onerror = () => {
      setError('WebSocket connection error');
      setConnected(false);
    };

    ws.onmessage = (event) => {
      try {
        const response: WebSocketResponse = JSON.parse(event.data);
        
        if (response.error && handlersRef.current.onError) {
          handlersRef.current.onError(response.error);
        } else if (response.output && handlersRef.current.onOutput) {
          handlersRef.current.onOutput(response.output);
        }
      } catch (err) {
        console.error('Error parsing WebSocket message:', err);
        if (handlersRef.current.onError) {
          handlersRef.current.onError('Invalid response from server');
        }
      }
    };

    socketRef.current = ws;

    return () => {
      ws.close();
    };
  }, []);

  const sendMessage = useCallback(
    (message: WebSocketMessage, onOutput: (output: string) => void, onError: (error: string) => void) => {
      if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
        onError('WebSocket is not connected');
        return;
      }

      // Update handlers for this command
      handlersRef.current = {
        onOutput,
        onError
      };

      try {
        socketRef.current.send(JSON.stringify(message));
      } catch (err) {
        onError('Failed to send message');
      }
    },
    []
  );

  return {
    connected,
    error,
    sendMessage
  };
};