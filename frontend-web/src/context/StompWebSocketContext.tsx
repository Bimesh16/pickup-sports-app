import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { EventEmitter } from 'events';
import { toast } from 'react-toastify';
import { useAppState } from './AppStateContext';

interface StompWebSocketContextValue {
  isConnected: boolean;
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
  reconnectAttempts: number;
  subscribe: (destination: string, callback: (message: IMessage) => void) => StompSubscription | null;
  unsubscribe: (subscription: StompSubscription | null) => void;
  send: (destination: string, body: any, headers?: any) => void;
  reconnect: () => void;
}

const StompWebSocketContext = createContext<StompWebSocketContextValue | undefined>(undefined);

interface StompWebSocketProviderProps {
  children: React.ReactNode;
}

export function StompWebSocketProvider({ children }: StompWebSocketProviderProps) {
  const { profile, addNotification } = useAppState();
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [eventEmitter] = useState(() => new EventEmitter());
  
  const stompClientRef = useRef<Client | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const subscriptionsRef = useRef<Map<string, StompSubscription>>(new Map());
  const maxReconnectAttempts = 5;
  const baseReconnectDelay = 1000; // 1 second

  // WebSocket URL - use environment variable or fallback
  const wsUrl = import.meta.env.VITE_WS_URL || 'http://localhost:8080/ws';

  // Calculate exponential backoff delay
  const getReconnectDelay = (attempt: number) => {
    return Math.min(baseReconnectDelay * Math.pow(2, attempt), 30000); // Max 30 seconds
  };

  // Handle notification messages
  const handleNotificationMessage = useCallback((data: any) => {
    const notification = {
      id: data.id || Date.now().toString(),
      type: data.type || 'system',
      title: data.title || 'New Notification',
      message: data.message || data.body || 'You have a new notification',
      timestamp: data.timestamp || new Date().toISOString(),
      isRead: false,
      priority: data.priority || 'medium',
      metadata: data.metadata || {}
    };
    
    addNotification(notification);
    
    // Show toast for high priority notifications
    if (notification.priority === 'high') {
      toast.info(notification.message, {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  }, [addNotification]);

  // Connect to STOMP WebSocket
  const connect = useCallback(() => {
    if (stompClientRef.current?.connected) {
      return;
    }

    setConnectionStatus('connecting');
    
    try {
      // Create STOMP client with SockJS
      const client = new Client({
        webSocketFactory: () => new SockJS(wsUrl),
        debug: (str) => {
          console.log('STOMP Debug:', str);
        },
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        onConnect: (frame) => {
          console.log('STOMP connected:', frame);
          setIsConnected(true);
          setConnectionStatus('connected');
          setReconnectAttempts(0);
          
          // Subscribe to user-specific notifications if profile exists
          if (profile?.id) {
            const notificationDestination = `/user/${profile.id}/notifications`;
            const notificationSub = client.subscribe(notificationDestination, (message) => {
              try {
                const data = JSON.parse(message.body);
                handleNotificationMessage(data);
                eventEmitter.emit(notificationDestination, data);
              } catch (error) {
                console.error('Error parsing notification message:', error);
                eventEmitter.emit(notificationDestination, message.body);
              }
            });
            subscriptionsRef.current.set(notificationDestination, notificationSub);
          }
          
          // Re-subscribe to existing subscriptions
          subscriptionsRef.current.forEach((subscription, destination) => {
            if (subscription && !destination.includes('/user/')) {
              subscription.unsubscribe();
            }
            const newSub = client.subscribe(destination, (message) => {
              try {
                const data = JSON.parse(message.body);
                eventEmitter.emit(destination, data);
              } catch (error) {
                console.error('Error parsing STOMP message:', error);
                eventEmitter.emit(destination, message.body);
              }
            });
            subscriptionsRef.current.set(destination, newSub);
          });
          
          // Emit connection event for components to re-subscribe
          eventEmitter.emit('stomp_connected', { connected: true });
        },
        onStompError: (frame) => {
          console.error('STOMP error:', frame);
          setConnectionStatus('error');
          setIsConnected(false);
          scheduleReconnect();
        },
        onWebSocketClose: (event) => {
          console.log('STOMP WebSocket closed:', event.code, event.reason);
          setIsConnected(false);
          setConnectionStatus('disconnected');
          
          // Don't attempt to reconnect if it's a manual close or if we've exceeded max attempts
          if (event.code !== 1000 && reconnectAttempts < maxReconnectAttempts) {
            scheduleReconnect();
          } else if (reconnectAttempts >= maxReconnectAttempts) {
            console.warn('Max reconnection attempts reached. STOMP will not reconnect automatically.');
            setConnectionStatus('error');
          }
        },
        onWebSocketError: (error) => {
          console.error('STOMP WebSocket error:', error);
          setConnectionStatus('error');
          setIsConnected(false);
          scheduleReconnect();
        }
      });

      stompClientRef.current = client;

      // Get JWT token for authentication
      const token = localStorage.getItem('ps_token');
      if (token) {
        client.connectHeaders = {
          'Authorization': `Bearer ${token}`
        };
      }

      // Activate the client
      client.activate();

    } catch (error) {
      console.error('Error creating STOMP connection:', error);
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
    console.log(`Scheduling STOMP reconnection in ${delay}ms (attempt ${reconnectAttempts + 1})`);
    
    reconnectTimeoutRef.current = setTimeout(() => {
      setReconnectAttempts(prev => prev + 1);
      connect();
    }, delay);
  }, [connect, reconnectAttempts]);

  // Subscribe to a destination
  const subscribe = useCallback((destination: string, callback: (message: IMessage) => void) => {
    if (!stompClientRef.current || !stompClientRef.current.connected) {
      console.warn('STOMP client not connected. Cannot subscribe to:', destination);
      return null;
    }

    // If already subscribed, return existing subscription
    if (subscriptionsRef.current.has(destination)) {
      return subscriptionsRef.current.get(destination) || null;
    }

    const subscription = stompClientRef.current.subscribe(destination, (message) => {
      try {
        const data = JSON.parse(message.body);
        eventEmitter.emit(destination, data);
        callback(message);
      } catch (error) {
        console.error('Error parsing STOMP message:', error);
        eventEmitter.emit(destination, message.body);
        callback(message);
      }
    });

    subscriptionsRef.current.set(destination, subscription);
    return subscription;
  }, [eventEmitter]);

  // Unsubscribe from a destination
  const unsubscribe = useCallback((subscription: StompSubscription | null) => {
    if (subscription) {
      subscription.unsubscribe();
    }
  }, []);

  // Send message to a destination
  const send = useCallback((destination: string, body: any, headers: any = {}) => {
    if (stompClientRef.current?.connected) {
      stompClientRef.current.publish({
        destination,
        body: JSON.stringify(body),
        headers
      });
    } else {
      console.warn('STOMP is not connected. Cannot send message:', destination, body);
    }
  }, []);

  // Manual reconnect
  const reconnect = useCallback(() => {
    if (stompClientRef.current) {
      stompClientRef.current.deactivate();
    }
    setReconnectAttempts(0);
    connect();
  }, [connect]);

  // Initialize connection
  useEffect(() => {
    // Add a small delay to prevent immediate connection attempts
    const timeoutId = setTimeout(() => {
      connect();
    }, 1000);
    
    return () => {
      clearTimeout(timeoutId);
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (stompClientRef.current) {
        stompClientRef.current.deactivate();
      }
    };
  }, [connect]);

  // Reconnect when token changes
  useEffect(() => {
    const token = localStorage.getItem('ps_token');
    if (token && stompClientRef.current) {
      stompClientRef.current.connectHeaders = {
        'Authorization': `Bearer ${token}`
      };
      if (!stompClientRef.current.connected) {
        reconnect();
      }
    }
  }, [reconnect]);

  const value: StompWebSocketContextValue = {
    isConnected,
    connectionStatus,
    reconnectAttempts,
    subscribe,
    unsubscribe,
    send,
    reconnect
  };

  return (
    <StompWebSocketContext.Provider value={value}>
      {children}
    </StompWebSocketContext.Provider>
  );
}

export function useStompWebSocket() {
  const context = useContext(StompWebSocketContext);
  if (!context) {
    throw new Error('useStompWebSocket must be used within a StompWebSocketProvider');
  }
  return context;
}
