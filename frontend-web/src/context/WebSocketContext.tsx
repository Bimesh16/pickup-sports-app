import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { websocketManager, GameUpdatedEvent, NotificationCreatedEvent, ChatMessageEvent } from '@lib/websocket';
import { useAuth } from '@hooks/useAuth';

interface WebSocketContextType {
  isConnected: boolean;
  gameUpdates: GameUpdatedEvent[];
  notifications: NotificationCreatedEvent[];
  chatMessages: ChatMessageEvent[];
  sendMessage: (message: any) => void;
  clearGameUpdates: () => void;
  clearNotifications: () => void;
  clearChatMessages: () => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};

interface WebSocketProviderProps {
  children: React.ReactNode;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children }) => {
  const { token } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [gameUpdates, setGameUpdates] = useState<GameUpdatedEvent[]>([]);
  const [notifications, setNotifications] = useState<NotificationCreatedEvent[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessageEvent[]>([]);

  // Connect to WebSocket when token is available
  useEffect(() => {
    if (token) {
      websocketManager.connect(token);
    } else {
      websocketManager.disconnect();
      setIsConnected(false);
    }
  }, [token]);

  // Set up event listeners
  useEffect(() => {
    const handleConnected = () => {
      setIsConnected(true);
    };

    const handleDisconnected = () => {
      setIsConnected(false);
    };

    const handleGameUpdated = (data: GameUpdatedEvent) => {
      setGameUpdates(prev => [data, ...prev.slice(0, 9)]); // Keep last 10 updates
    };

    const handleNotificationCreated = (data: NotificationCreatedEvent) => {
      setNotifications(prev => [data, ...prev.slice(0, 9)]); // Keep last 10 notifications
    };

    const handleChatMessage = (data: ChatMessageEvent) => {
      setChatMessages(prev => [data, ...prev.slice(0, 49)]); // Keep last 50 messages
    };

    const handleMaxReconnectAttempts = () => {
      console.error('Max reconnection attempts reached');
      setIsConnected(false);
    };

    websocketManager.on('connected', handleConnected);
    websocketManager.on('disconnected', handleDisconnected);
    websocketManager.on('game_updated', handleGameUpdated);
    websocketManager.on('notification_created', handleNotificationCreated);
    websocketManager.on('chat_message', handleChatMessage);
    websocketManager.on('maxReconnectAttemptsReached', handleMaxReconnectAttempts);

    return () => {
      websocketManager.off('connected', handleConnected);
      websocketManager.off('disconnected', handleDisconnected);
      websocketManager.off('game_updated', handleGameUpdated);
      websocketManager.off('notification_created', handleNotificationCreated);
      websocketManager.off('chat_message', handleChatMessage);
      websocketManager.off('maxReconnectAttemptsReached', handleMaxReconnectAttempts);
    };
  }, []);

  const sendMessage = useCallback((message: any) => {
    websocketManager.send(message);
  }, []);

  const clearGameUpdates = useCallback(() => {
    setGameUpdates([]);
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const clearChatMessages = useCallback(() => {
    setChatMessages([]);
  }, []);

  const value: WebSocketContextType = {
    isConnected,
    gameUpdates,
    notifications,
    chatMessages,
    sendMessage,
    clearGameUpdates,
    clearNotifications,
    clearChatMessages,
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};
