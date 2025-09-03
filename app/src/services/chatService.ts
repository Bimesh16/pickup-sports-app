import { io, Socket } from 'socket.io-client';
import * as SecureStore from 'expo-secure-store';
import { API_CONFIG, APP_CONFIG } from '@/constants/config';
import { 
  ChatMessage, 
  ChatRoom, 
  SendMessageRequest, 
  WebSocketMessage, 
  TypingIndicator 
} from '@/types/chat';

class ChatService {
  private socket: Socket | null = null;
  private isConnected = false;
  private messageCallbacks: Array<(message: ChatMessage) => void> = [];
  private typingCallbacks: Array<(typing: TypingIndicator) => void> = [];
  private connectionCallbacks: Array<(connected: boolean) => void> = [];

  async connect(): Promise<void> {
    if (this.socket?.connected) {
      return;
    }

    try {
      const token = await SecureStore.getItemAsync(APP_CONFIG.STORAGE_KEYS.AUTH_TOKEN);
      if (!token) {
        throw new Error('No authentication token available');
      }

      this.socket = io(API_CONFIG.WS_URL, {
        auth: {
          token: `Bearer ${token}`
        },
        transports: ['websocket'],
        timeout: 10000,
      });

      this.setupEventListeners();

      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Connection timeout'));
        }, 10000);

        this.socket!.on('connect', () => {
          clearTimeout(timeout);
          this.isConnected = true;
          this.notifyConnectionChange(true);
          resolve();
        });

        this.socket!.on('connect_error', (error) => {
          clearTimeout(timeout);
          console.error('Chat connection error:', error);
          reject(error);
        });
      });
    } catch (error) {
      console.error('Failed to connect to chat:', error);
      throw error;
    }
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.notifyConnectionChange(false);
    }
  }

  private setupEventListeners(): void {
    if (!this.socket) return;

    this.socket.on('disconnect', () => {
      this.isConnected = false;
      this.notifyConnectionChange(false);
    });

    this.socket.on('message', (message: ChatMessage) => {
      this.messageCallbacks.forEach(callback => callback(message));
    });

    this.socket.on('typing', (typing: TypingIndicator) => {
      this.typingCallbacks.forEach(callback => callback(typing));
    });

    this.socket.on('error', (error: any) => {
      console.error('Chat socket error:', error);
    });
  }

  // Game Chat Methods
  async joinGameChat(gameId: number): Promise<void> {
    if (!this.socket?.connected) {
      await this.connect();
    }

    this.socket!.emit('join-game-chat', { gameId });
  }

  async leaveGameChat(gameId: number): Promise<void> {
    if (this.socket?.connected) {
      this.socket.emit('leave-game-chat', { gameId });
    }
  }

  async sendMessage(gameId: number, request: SendMessageRequest): Promise<void> {
    if (!this.socket?.connected) {
      throw new Error('Not connected to chat');
    }

    this.socket.emit('send-message', {
      gameId,
      ...request,
      timestamp: new Date().toISOString()
    });
  }

  // Typing Indicators
  async sendTypingIndicator(gameId: number, isTyping: boolean): Promise<void> {
    if (this.socket?.connected) {
      this.socket.emit('typing', {
        gameId,
        isTyping,
        timestamp: new Date().toISOString()
      });
    }
  }

  // Message Reactions
  async reactToMessage(messageId: string, emoji: string): Promise<void> {
    if (this.socket?.connected) {
      this.socket.emit('react-to-message', {
        messageId,
        emoji,
        timestamp: new Date().toISOString()
      });
    }
  }

  // Event Listeners
  onMessage(callback: (message: ChatMessage) => void): () => void {
    this.messageCallbacks.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.messageCallbacks.indexOf(callback);
      if (index > -1) {
        this.messageCallbacks.splice(index, 1);
      }
    };
  }

  onTyping(callback: (typing: TypingIndicator) => void): () => void {
    this.typingCallbacks.push(callback);
    
    return () => {
      const index = this.typingCallbacks.indexOf(callback);
      if (index > -1) {
        this.typingCallbacks.splice(index, 1);
      }
    };
  }

  onConnectionChange(callback: (connected: boolean) => void): () => void {
    this.connectionCallbacks.push(callback);
    
    return () => {
      const index = this.connectionCallbacks.indexOf(callback);
      if (index > -1) {
        this.connectionCallbacks.splice(index, 1);
      }
    };
  }

  private notifyConnectionChange(connected: boolean): void {
    this.connectionCallbacks.forEach(callback => callback(connected));
  }

  // Chat History (REST API)
  async getChatHistory(gameId: number, page: number = 0, size: number = 50): Promise<ChatMessage[]> {
    const response = await fetch(`${API_CONFIG.BASE_URL}/games/${gameId}/chat/history?page=${page}&size=${size}`, {
      headers: {
        'Authorization': `Bearer ${await SecureStore.getItemAsync(APP_CONFIG.STORAGE_KEYS.AUTH_TOKEN)}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch chat history');
    }

    return response.json();
  }

  // Connection Status
  isConnectedToChat(): boolean {
    return this.isConnected && !!this.socket?.connected;
  }

  // Cleanup
  cleanup(): void {
    this.disconnect();
    this.messageCallbacks = [];
    this.typingCallbacks = [];
    this.connectionCallbacks = [];
  }
}

export const chatService = new ChatService();