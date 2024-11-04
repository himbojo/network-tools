import { useState, useEffect, useCallback, useRef } from 'react';

const WS_URL = 'ws://localhost:8080/ws';
const RECONNECT_DELAY_MS = 2000;
const MAX_RECONNECT_ATTEMPTS = 5;

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
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef<number | null>(null);
  
  const handlersRef = useRef<{
    onOutput: ((output: string) => void) | null;
    onError: ((error: string) => void) | null;
  }>({
    onOutput: null,
    onError: null
  });

  const clearReconnectTimeout = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  }, []);

  const connect = useCallback(() => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      const ws = new WebSocket(WS_URL);

      // Set up ping interval
      const pingInterval = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'ping' }));
        }
      }, 30000);

      ws.onopen = () => {
        console.log('WebSocket connected');
        setConnected(true);
        setError(null);
        reconnectAttemptsRef.current = 0;
        clearReconnectTimeout();
      };

      ws.onclose = (event) => {
        console.log('WebSocket closed:', event.code, event.reason);
        setConnected(false);
        clearInterval(pingInterval);

        if (!event.wasClean && reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
          const delay = RECONNECT_DELAY_MS * Math.pow(2, reconnectAttemptsRef.current);
          console.log(`Attempting to reconnect in ${delay}ms...`);
          
          clearReconnectTimeout();
          reconnectTimeoutRef.current = window.setTimeout(() => {
            reconnectAttemptsRef.current += 1;
            connect();
          }, delay);
        } else if (reconnectAttemptsRef.current >= MAX_RECONNECT_ATTEMPTS) {
          setError('Maximum reconnection attempts reached. Please refresh the page.');
        }
      };

      ws.onerror = (event) => {
        console.log('WebSocket error:', event);
        setError('Connection error occurred');
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
    } catch (err) {
      console.error('Error creating WebSocket:', err);
      setError('Failed to create WebSocket connection');
    }
  }, [clearReconnectTimeout]);

  useEffect(() => {
    connect();

    return () => {
      clearReconnectTimeout();
      if (socketRef.current) {
        socketRef.current.close(1000, 'Component unmounting');
        socketRef.current = null;
      }
    };
  }, [connect, clearReconnectTimeout]);

  const sendMessage = useCallback(
    (
      message: WebSocketMessage,
      onOutput: (output: string) => void,
      onError: (error: string) => void
    ) => {
      if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
        onError('WebSocket is not connected');
        return;
      }

      handlersRef.current = {
        onOutput,
        onError
      };

      try {
        socketRef.current.send(JSON.stringify(message));
      } catch (err) {
        console.error('Error sending message:', err);
        onError('Failed to send message');
      }
    },
    []
  );

  return {
    connected,
    error,
    sendMessage,
    reconnect: connect
  };
};