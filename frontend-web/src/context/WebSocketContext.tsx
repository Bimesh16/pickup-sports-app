import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { EventEmitter } from 'events';
import { toast } from 'react-toastify';

interface WebSocketContextValue {
  isConnected: boolean;
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
  reconnectAttempts: number;
  subscribe: (event: string, callback: (data: any) => void) => void;
  unsubscribe: (event: string, callback: (data: any) => void) => void;
  send: (event: string, data: any) => void;
  reconnect: () => void;
}

const WebSocketContext = createContext<WebSocketContextValue | undefined>(undefined);

interface WebSocketProviderProps {
  children: React.ReactNode;
}

export function WebSocketProvider({ children }: WebSocketProviderProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [eventEmitter] = useState(() => new EventEmitter());
  
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const maxReconnectAttempts = 5;
  const baseReconnectDelay = 1000; // 1 second

  // WebSocket URL - use environment variable or fallback
  const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8080/ws';

  // Calculate exponential backoff delay
  const getReconnectDelay = (attempt: number) => {
    return Math.min(baseReconnectDelay * Math.pow(2, attempt), 30000); // Max 30 seconds
  };

  // Connect to WebSocket
  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    setConnectionStatus('connecting');
    
    try {
      // Check if WebSocket is supported
      if (typeof WebSocket === 'undefined') {
        throw new Error('WebSocket is not supported in this environment');
      }
      
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        setConnectionStatus('connected');
        setReconnectAttempts(0);
        
        // Send authentication token if available
        const token = localStorage.getItem('ps_token');
        if (token) {
          ws.send(JSON.stringify({
            type: 'auth',
            token: token
          }));
        }
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('WebSocket message received:', data);
          
          // Emit the event to subscribers
          eventEmitter.emit(data.type, data.payload);
          
          // Handle specific events
          handleWebSocketEvent(data.type, data.payload);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        setIsConnected(false);
        setConnectionStatus('disconnected');
        
        // Don't attempt to reconnect if it's a manual close or if we've exceeded max attempts
        if (event.code !== 1000 && reconnectAttempts < maxReconnectAttempts) {
          scheduleReconnect();
        } else if (reconnectAttempts >= maxReconnectAttempts) {
          console.warn('Max reconnection attempts reached. WebSocket will not reconnect automatically.');
          setConnectionStatus('error');
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnectionStatus('error');
        setIsConnected(false);
        // Don't attempt to reconnect on error, let the close handler handle it
      };

    } catch (error) {
      console.error('Error creating WebSocket connection:', error);
      setConnectionStatus('error');
      scheduleReconnect();
    }
  }, [wsUrl, reconnectAttempts, eventEmitter]);

  // Schedule reconnection with exponential backoff
  const scheduleReconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    const delay = getReconnectDelay(reconnectAttempts);
    console.log(`Scheduling reconnection in ${delay}ms (attempt ${reconnectAttempts + 1})`);
    
    reconnectTimeoutRef.current = setTimeout(() => {
      setReconnectAttempts(prev => prev + 1);
      connect();
    }, delay);
  }, [connect, reconnectAttempts]);

  // Handle specific WebSocket events
  const handleWebSocketEvent = useCallback((eventType: string, payload: any) => {
    switch (eventType) {
      case 'game_updated':
        handleGameUpdated(payload);
        break;
      case 'notification_created':
        handleNotificationCreated(payload);
        break;
      case 'chat_message':
        handleChatMessage(payload);
        break;
      case 'player_joined':
        handlePlayerJoined(payload);
        break;
      case 'player_left':
        handlePlayerLeft(payload);
        break;
      case 'game_cancelled':
        handleGameCancelled(payload);
        break;
      case 'team_invite':
        handleTeamInvite(payload);
        break;
      default:
        console.log('Unhandled WebSocket event:', eventType, payload);
    }
  }, []);

  // Handle game updates
  const handleGameUpdated = (payload: any) => {
    console.log('Game updated:', payload);
    // You can emit a custom event or update state here
    eventEmitter.emit('game_updated', payload);
  };

  // Handle new notifications
  const handleNotificationCreated = (payload: any) => {
    console.log('New notification:', payload);
    
    // Show in-app banner for important notifications
    if (payload.priority === 'high') {
      toast.info(payload.message, {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
    
    eventEmitter.emit('notification_created', payload);
  };

  // Handle chat messages
  const handleChatMessage = (payload: any) => {
    console.log('Chat message:', payload);
    eventEmitter.emit('chat_message', payload);
  };

  // Handle player joined
  const handlePlayerJoined = (payload: any) => {
    console.log('Player joined:', payload);
    toast.success(`${payload.playerName} joined the game!`);
    eventEmitter.emit('player_joined', payload);
  };

  // Handle player left
  const handlePlayerLeft = (payload: any) => {
    console.log('Player left:', payload);
    toast.info(`${payload.playerName} left the game`);
    eventEmitter.emit('player_left', payload);
  };

  // Handle game cancelled
  const handleGameCancelled = (payload: any) => {
    console.log('Game cancelled:', payload);
    toast.error(`Game "${payload.gameName}" has been cancelled`);
    eventEmitter.emit('game_cancelled', payload);
  };

  // Handle team invite
  const handleTeamInvite = (payload: any) => {
    console.log('Team invite:', payload);
    toast.info(`You've been invited to join "${payload.teamName}"`);
    eventEmitter.emit('team_invite', payload);
  };

  // Subscribe to events
  const subscribe = useCallback((event: string, callback: (data: any) => void) => {
    eventEmitter.on(event, callback);
  }, [eventEmitter]);

  // Unsubscribe from events
  const unsubscribe = useCallback((event: string, callback: (data: any) => void) => {
    eventEmitter.off(event, callback);
  }, [eventEmitter]);

  // Send message
  const send = useCallback((event: string, data: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: event,
        payload: data
      }));
    } else {
      console.warn('WebSocket is not connected. Cannot send message:', event, data);
    }
  }, []);

  // Manual reconnect
  const reconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
    }
    setReconnectAttempts(0);
    connect();
  }, [connect]);

  // Initialize connection
  useEffect(() => {
    // Only attempt to connect if WebSocket is supported
    if (typeof WebSocket !== 'undefined') {
      // Add a small delay to prevent immediate connection attempts
      const timeoutId = setTimeout(() => {
        connect();
      }, 1000);
      
      return () => {
        clearTimeout(timeoutId);
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }
        if (wsRef.current) {
          wsRef.current.close();
        }
      };
    } else {
      console.warn('WebSocket not supported, real-time features disabled');
      setConnectionStatus('error');
    }
  }, [connect]);

  // Reconnect when token changes
  useEffect(() => {
    const token = localStorage.getItem('ps_token');
    if (token && wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'auth',
        token: token
      }));
    }
  }, []);

  const value: WebSocketContextValue = {
    isConnected,
    connectionStatus,
    reconnectAttempts,
    subscribe,
    unsubscribe,
    send,
    reconnect
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket() {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
}