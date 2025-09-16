import { EventEmitter } from 'events';

export interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: string;
}

export interface GameUpdatedEvent {
  gameId: string;
  playerCount: number;
  maxPlayers: number;
  status: string;
}

export interface NotificationCreatedEvent {
  id: string;
  type: string;
  title: string;
  message: string;
  userId: string;
}

export interface ChatMessageEvent {
  gameId: string;
  userId: string;
  message: string;
  timestamp: string;
  userName: string;
}

class WebSocketManager extends EventEmitter {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000; // Start with 1 second
  private maxReconnectDelay = 30000; // Max 30 seconds
  private isConnecting = false;
  private shouldReconnect = true;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private token: string | null = null;

  constructor() {
    super();
    this.setMaxListeners(50); // Allow many listeners
  }

  connect(token: string) {
    this.token = token;
    this.shouldReconnect = true;
    this.connectWebSocket();
  }

  disconnect() {
    this.shouldReconnect = false;
    this.cleanup();
  }

  private connectWebSocket() {
    if (this.isConnecting || (this.ws && this.ws.readyState === WebSocket.OPEN)) {
      return;
    }

    this.isConnecting = true;

    try {
      const wsUrl = import.meta.env.VITE_WS_URL || 'wss://api.pickupsports.com/ws';
      const url = `${wsUrl}?token=${this.token}`;
      
      this.ws = new WebSocket(url);

      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this.reconnectDelay = 1000;
        this.startHeartbeat();
        this.emit('connected');
      };

      this.ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          this.handleMessage(message);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      this.ws.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        this.isConnecting = false;
        this.cleanup();
        
        if (this.shouldReconnect && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.scheduleReconnect();
        } else if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          this.emit('maxReconnectAttemptsReached');
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.isConnecting = false;
        this.emit('error', error);
      };

    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      this.isConnecting = false;
      this.scheduleReconnect();
    }
  }

  private handleMessage(message: WebSocketMessage) {
    switch (message.type) {
      case 'game_updated':
        this.emit('game_updated', message.data as GameUpdatedEvent);
        break;
      case 'notification_created':
        this.emit('notification_created', message.data as NotificationCreatedEvent);
        break;
      case 'chat_message':
        this.emit('chat_message', message.data as ChatMessageEvent);
        break;
      case 'pong':
        // Heartbeat response
        break;
      default:
        console.log('Unknown WebSocket message type:', message.type);
    }
  }

  private scheduleReconnect() {
    if (!this.shouldReconnect) return;

    this.reconnectAttempts++;
    const delay = Math.min(this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1), this.maxReconnectDelay);
    
    console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    
    setTimeout(() => {
      if (this.shouldReconnect) {
        this.connectWebSocket();
      }
    }, delay);
  }

  private startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'ping' }));
      }
    }, 30000); // Send ping every 30 seconds
  }

  private cleanup() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
    
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  send(message: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket is not connected. Message not sent:', message);
    }
  }

  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }
}

export const websocketManager = new WebSocketManager();
