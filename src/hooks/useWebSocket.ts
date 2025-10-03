/**
 * React WebSocket Hook
 *
 * A comprehensive React hook for managing WebSocket connections with automatic
 * reconnection, error handling, and type-safe event management.
 */

import { useEffect, useState, useRef, useCallback } from 'react';
import { io, type Socket } from 'socket.io-client';
import {
  SOCKET_CONFIG,
  SOCKET_EVENTS,
  type ConnectionState,
  type WebSocketOptions,
  calculateReconnectionDelay,
  formatSocketError,
  isRecoverableError,
  createLogger
} from '../utils/websocket';

// Hook return type
export interface UseWebSocketReturn {
  socket: Socket | null;
  connectionState: ConnectionState;
  isConnected: boolean;
  isConnecting: boolean;
  isReconnecting: boolean;
  error: string | null;
  connect: () => void;
  disconnect: () => void;
  reconnect: () => void;
  emit: (event: string, data?: any) => void;
  on: (event: string, handler: (...args: any[]) => void) => void;
  off: (event: string, handler?: (...args: any[]) => void) => void;
  joinRoom: (roomId: string) => void;
  leaveRoom: (roomId: string) => void;
}

// Default options
const DEFAULT_OPTIONS: Required<WebSocketOptions> = {
  url: SOCKET_CONFIG.URL,
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  timeout: 20000,
  debug: false
};

/**
 * Custom hook for managing WebSocket connections
 */
export const useWebSocket = (options: WebSocketOptions = {}): UseWebSocketReturn => {
  const config = { ...DEFAULT_OPTIONS, ...options };
  const logger = createLogger('useWebSocket', config.debug);

  // State management
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connectionState, setConnectionState] = useState<ConnectionState>({
    isConnected: false,
    isConnecting: false,
    isReconnecting: false,
    error: null,
    retryCount: 0,
    lastConnected: null,
    lastError: null
  });

  // Refs for cleanup and state management
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);
  const reconnectAttemptRef = useRef(0);

  // Update connection state helper
  const updateConnectionState = useCallback((updates: Partial<ConnectionState>) => {
    if (!mountedRef.current) return;
    setConnectionState(prev => ({ ...prev, ...updates }));
  }, []);

  // Clear reconnection timeout
  const clearReconnectTimeout = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  }, []);

  // Initialize socket connection
  const initializeSocket = useCallback(() => {
    if (!mountedRef.current) return null;

    logger.log('Initializing socket connection', { url: config.url });

    try {
      updateConnectionState({
        isConnecting: true,
        error: null
      });

      const newSocket = io(config.url, {
        ...SOCKET_CONFIG.OPTIONS,
        reconnection: config.reconnection,
        reconnectionAttempts: config.reconnectionAttempts,
        reconnectionDelay: config.reconnectionDelay,
        timeout: config.timeout,
        autoConnect: false // We'll connect manually
      });

      // Connection event handlers
      newSocket.on(SOCKET_EVENTS.CONNECT, () => {
        if (!mountedRef.current) return;

        logger.log('Socket connected successfully');
        reconnectAttemptRef.current = 0;
        clearReconnectTimeout();

        updateConnectionState({
          isConnected: true,
          isConnecting: false,
          isReconnecting: false,
          error: null,
          retryCount: 0,
          lastConnected: new Date()
        });
      });

      newSocket.on(SOCKET_EVENTS.DISCONNECT, (reason: string) => {
        if (!mountedRef.current) return;

        logger.warn('Socket disconnected', { reason });

        updateConnectionState({
          isConnected: false,
          isConnecting: false
        });

        // Auto-reconnect for certain disconnect reasons
        if (config.reconnection && reason !== 'io client disconnect') {
          handleReconnection();
        }
      });

      newSocket.on(SOCKET_EVENTS.CONNECT_ERROR, (error: any) => {
        if (!mountedRef.current) return;

        const errorMessage = formatSocketError(error);
        logger.error('Connection error', { error: errorMessage });

        updateConnectionState({
          isConnected: false,
          isConnecting: false,
          error: errorMessage,
          lastError: new Date()
        });

        // Attempt reconnection if error is recoverable
        if (config.reconnection && isRecoverableError(error)) {
          handleReconnection();
        }
      });

      newSocket.on(SOCKET_EVENTS.RECONNECTING, (attemptNumber: number) => {
        if (!mountedRef.current) return;

        logger.log('Reconnecting...', { attempt: attemptNumber });

        updateConnectionState({
          isReconnecting: true,
          retryCount: attemptNumber
        });
      });

      newSocket.on(SOCKET_EVENTS.RECONNECT, (attemptNumber: number) => {
        if (!mountedRef.current) return;

        logger.log('Reconnected successfully', { attempts: attemptNumber });

        updateConnectionState({
          isConnected: true,
          isConnecting: false,
          isReconnecting: false,
          error: null,
          retryCount: 0,
          lastConnected: new Date()
        });
      });

      newSocket.on(SOCKET_EVENTS.RECONNECT_ERROR, (error: any) => {
        if (!mountedRef.current) return;

        const errorMessage = formatSocketError(error);
        logger.error('Reconnection error', { error: errorMessage });

        updateConnectionState({
          error: errorMessage,
          lastError: new Date()
        });
      });

      newSocket.on(SOCKET_EVENTS.RECONNECT_FAILED, () => {
        if (!mountedRef.current) return;

        logger.error('Reconnection failed - max attempts reached');

        updateConnectionState({
          isConnecting: false,
          isReconnecting: false,
          error: 'Failed to reconnect after maximum attempts'
        });
      });

      return newSocket;

    } catch (error) {
      logger.error('Failed to initialize socket', { error });
      updateConnectionState({
        isConnecting: false,
        error: formatSocketError(error)
      });
      return null;
    }
  }, [config, logger, updateConnectionState, clearReconnectTimeout]);

  // Handle manual reconnection with exponential backoff
  const handleReconnection = useCallback(() => {
    if (!config.reconnection || !mountedRef.current) return;

    reconnectAttemptRef.current += 1;

    if (reconnectAttemptRef.current > config.reconnectionAttempts) {
      logger.error('Max reconnection attempts reached');
      updateConnectionState({
        isReconnecting: false,
        error: 'Maximum reconnection attempts exceeded'
      });
      return;
    }

    const delay = calculateReconnectionDelay(reconnectAttemptRef.current - 1, config.reconnectionDelay);
    logger.log('Scheduling reconnection', { attempt: reconnectAttemptRef.current, delay });

    updateConnectionState({
      isReconnecting: true,
      retryCount: reconnectAttemptRef.current
    });

    reconnectTimeoutRef.current = setTimeout(() => {
      if (!mountedRef.current) return;

      logger.log('Attempting reconnection', { attempt: reconnectAttemptRef.current });
      socket?.connect();
    }, delay);
  }, [config, socket, logger, updateConnectionState]);

  // Connect function
  const connect = useCallback(() => {
    if (socket?.connected) {
      logger.warn('Socket already connected');
      return;
    }

    if (!socket) {
      const newSocket = initializeSocket();
      if (newSocket) {
        setSocket(newSocket);
        newSocket.connect();
      }
    } else {
      socket.connect();
    }
  }, [socket, initializeSocket, logger]);

  // Disconnect function
  const disconnect = useCallback(() => {
    logger.log('Disconnecting socket');
    clearReconnectTimeout();
    reconnectAttemptRef.current = 0;

    if (socket) {
      socket.disconnect();
      updateConnectionState({
        isConnected: false,
        isConnecting: false,
        isReconnecting: false
      });
    }
  }, [socket, logger, clearReconnectTimeout, updateConnectionState]);

  // Reconnect function
  const reconnect = useCallback(() => {
    logger.log('Manual reconnection triggered');
    reconnectAttemptRef.current = 0;
    clearReconnectTimeout();

    if (socket) {
      socket.disconnect();
      setTimeout(() => {
        if (mountedRef.current) {
          socket.connect();
        }
      }, 100);
    } else {
      connect();
    }
  }, [socket, connect, logger, clearReconnectTimeout]);

  // Type-safe emit function
  const emit = useCallback((event: string, data?: any) => {
    if (!socket?.connected) {
      logger.warn('Cannot emit - socket not connected', { event });
      return;
    }

    logger.log('Emitting event', { event, data });
    socket.emit(event, data);
  }, [socket, logger]);

  // Type-safe event listener
  const on = useCallback((event: string, handler: (...args: any[]) => void) => {
    if (!socket) {
      logger.warn('Cannot add listener - socket not initialized', { event });
      return;
    }

    logger.log('Adding event listener', { event });
    socket.on(event, handler);
  }, [socket, logger]);

  // Remove event listener
  const off = useCallback((event: string, handler?: (...args: any[]) => void) => {
    if (!socket) {
      logger.warn('Cannot remove listener - socket not initialized', { event });
      return;
    }

    logger.log('Removing event listener', { event });
    if (handler) {
      socket.off(event, handler);
    } else {
      socket.removeAllListeners(event);
    }
  }, [socket, logger]);

  // Join room helper
  const joinRoom = useCallback((roomId: string) => {
    emit(SOCKET_EVENTS.JOIN_ROOM, { roomId });
  }, [emit]);

  // Leave room helper
  const leaveRoom = useCallback((roomId: string) => {
    emit(SOCKET_EVENTS.LEAVE_ROOM, { roomId });
  }, [emit]);

  // Initialize socket on mount
  useEffect(() => {
    mountedRef.current = true;

    if (config.autoConnect) {
      const newSocket = initializeSocket();
      if (newSocket) {
        setSocket(newSocket);
        newSocket.connect();
      }
    }

    return () => {
      mountedRef.current = false;
      clearReconnectTimeout();

      if (socket) {
        logger.log('Cleaning up socket connection');
        socket.removeAllListeners();
        socket.disconnect();
      }
    };
  }, []); // Empty dependency array - only run on mount/unmount

  // Derived state for convenience
  const isConnected = connectionState.isConnected;
  const isConnecting = connectionState.isConnecting;
  const isReconnecting = connectionState.isReconnecting;
  const error = connectionState.error;

  return {
    socket,
    connectionState,
    isConnected,
    isConnecting,
    isReconnecting,
    error,
    connect,
    disconnect,
    reconnect,
    emit,
    on,
    off,
    joinRoom,
    leaveRoom
  };
};