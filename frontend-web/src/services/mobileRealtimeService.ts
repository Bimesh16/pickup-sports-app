// Mobile Real-time Service for React Native
// This service provides real-time features for mobile devices using WebSocket and Firebase Cloud Messaging

import { EventEmitter } from 'events';

interface MobileRealtimeConfig {
  wsUrl: string;
  firebaseConfig?: {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
  };
  enablePushNotifications: boolean;
  enableInAppNotifications: boolean;
}

interface InAppNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  actionUrl?: string;
  timestamp: number;
  isRead: boolean;
}

interface PushNotificationPayload {
  title: string;
  body: string;
  data?: Record<string, any>;
  imageUrl?: string;
  actionUrl?: string;
}

class MobileRealtimeService {
  private eventEmitter = new EventEmitter();
  private ws: WebSocket | null = null;
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private config: MobileRealtimeConfig;
  private inAppNotifications: InAppNotification[] = [];
  private fcmToken: string | null = null;

  constructor(config: MobileRealtimeConfig) {
    this.config = config;
  }

  // Initialize the service
  async initialize(): Promise<void> {
    try {
      // Initialize WebSocket connection
      await this.initializeWebSocket();
      
      // Initialize push notifications if enabled
      if (this.config.enablePushNotifications) {
        await this.initializePushNotifications();
      }
      
      // Initialize in-app notifications if enabled
      if (this.config.enableInAppNotifications) {
        this.initializeInAppNotifications();
      }
      
      console.log('Mobile real-time service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize mobile real-time service:', error);
      throw error;
    }
  }

  // Initialize WebSocket connection
  private async initializeWebSocket(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.config.wsUrl);
        
        this.ws.onopen = () => {
          console.log('WebSocket connected');
          this.isConnected = true;
          this.reconnectAttempts = 0;
          
          // Send authentication token
          this.sendAuthToken();
          resolve();
        };
        
        this.ws.onmessage = (event) => {
          this.handleWebSocketMessage(event);
        };
        
        this.ws.onclose = (event) => {
          console.log('WebSocket disconnected:', event.code, event.reason);
          this.isConnected = false;
          this.scheduleReconnect();
        };
        
        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          reject(error);
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  // Initialize push notifications (Firebase Cloud Messaging)
  private async initializePushNotifications(): Promise<void> {
    try {
      // Check if Firebase is available
      if (typeof window !== 'undefined' && 'firebase' in window) {
        const firebase = (window as any).firebase;
        
        // Initialize Firebase
        if (!firebase.apps.length) {
          firebase.initializeApp(this.config.firebaseConfig);
        }
        
        // Get messaging instance
        const messaging = firebase.messaging();
        
        // Request permission
        const permission = await messaging.requestPermission();
        if (permission === 'granted') {
          // Get FCM token
          this.fcmToken = await messaging.getToken();
          console.log('FCM token:', this.fcmToken);
          
          // Send token to server
          await this.sendFCMTokenToServer(this.fcmToken);
          
          // Listen for background messages
          messaging.onBackgroundMessage((payload: any) => {
            console.log('Background message received:', payload);
            this.handleBackgroundMessage(payload);
          });
          
          // Listen for foreground messages
          messaging.onMessage((payload: any) => {
            console.log('Foreground message received:', payload);
            this.handleForegroundMessage(payload);
          });
        }
      } else {
        console.warn('Firebase not available, push notifications disabled');
      }
    } catch (error) {
      console.error('Failed to initialize push notifications:', error);
    }
  }

  // Initialize in-app notifications
  private initializeInAppNotifications(): void {
    // Set up event listeners for in-app notifications
    this.eventEmitter.on('show_in_app_notification', (notification: InAppNotification) => {
      this.showInAppNotification(notification);
    });
  }

  // Send authentication token to WebSocket
  private sendAuthToken(): void {
    if (this.ws && this.isConnected) {
      const token = localStorage.getItem('ps_token');
      if (token) {
        this.ws.send(JSON.stringify({
          type: 'auth',
          token: token
        }));
      }
    }
  }

  // Send FCM token to server
  private async sendFCMTokenToServer(token: string): Promise<void> {
    try {
      const response = await fetch('/api/v1/notifications/fcm-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('ps_token')}`
        },
        body: JSON.stringify({ token })
      });
      
      if (!response.ok) {
        throw new Error('Failed to send FCM token to server');
      }
      
      console.log('FCM token sent to server successfully');
    } catch (error) {
      console.error('Failed to send FCM token to server:', error);
    }
  }

  // Handle WebSocket messages
  private handleWebSocketMessage(event: MessageEvent): void {
    try {
      const data = JSON.parse(event.data);
      console.log('WebSocket message received:', data);
      
      // Emit event to subscribers
      this.eventEmitter.emit(data.type, data.payload);
      
      // Handle specific events
      switch (data.type) {
        case 'game_updated':
          this.handleGameUpdated(data.payload);
          break;
        case 'notification_created':
          this.handleNotificationCreated(data.payload);
          break;
        case 'chat_message':
          this.handleChatMessage(data.payload);
          break;
        case 'player_joined':
          this.handlePlayerJoined(data.payload);
          break;
        case 'player_left':
          this.handlePlayerLeft(data.payload);
          break;
        case 'game_cancelled':
          this.handleGameCancelled(data.payload);
          break;
        case 'team_invite':
          this.handleTeamInvite(data.payload);
          break;
        default:
          console.log('Unhandled WebSocket event:', data.type);
      }
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  }

  // Handle background push messages
  private handleBackgroundMessage(payload: any): void {
    // Show notification
    if ('serviceWorker' in navigator && 'showNotification' in ServiceWorkerRegistration.prototype) {
      navigator.serviceWorker.ready.then(registration => {
        registration.showNotification(payload.notification.title, {
          body: payload.notification.body,
          icon: payload.notification.icon || '/favicon.ico',
          badge: payload.notification.badge || '/favicon.ico',
          data: payload.data,
          actions: [
            {
              action: 'view',
              title: 'View',
              icon: '/icons/view.png'
            },
            {
              action: 'dismiss',
              title: 'Dismiss',
              icon: '/icons/dismiss.png'
            }
          ]
        });
      });
    }
  }

  // Handle foreground push messages
  private handleForegroundMessage(payload: any): void {
    // Show in-app notification
    const notification: InAppNotification = {
      id: Date.now().toString(),
      title: payload.notification.title,
      message: payload.notification.body,
      type: 'info',
      actionUrl: payload.data?.actionUrl,
      timestamp: Date.now(),
      isRead: false
    };
    
    this.showInAppNotification(notification);
  }

  // Show in-app notification
  private showInAppNotification(notification: InAppNotification): void {
    // Add to notifications list
    this.inAppNotifications.unshift(notification);
    
    // Emit event for UI to handle
    this.eventEmitter.emit('in_app_notification', notification);
    
    // Auto-remove after 5 seconds if not read
    setTimeout(() => {
      if (!notification.isRead) {
        this.removeInAppNotification(notification.id);
      }
    }, 5000);
  }

  // Remove in-app notification
  private removeInAppNotification(id: string): void {
    this.inAppNotifications = this.inAppNotifications.filter(n => n.id !== id);
    this.eventEmitter.emit('in_app_notification_removed', id);
  }

  // Mark in-app notification as read
  markInAppNotificationAsRead(id: string): void {
    const notification = this.inAppNotifications.find(n => n.id === id);
    if (notification) {
      notification.isRead = true;
      this.eventEmitter.emit('in_app_notification_read', notification);
    }
  }

  // Get all in-app notifications
  getInAppNotifications(): InAppNotification[] {
    return [...this.inAppNotifications];
  }

  // Get unread count
  getUnreadCount(): number {
    return this.inAppNotifications.filter(n => !n.isRead).length;
  }

  // Clear all in-app notifications
  clearAllInAppNotifications(): void {
    this.inAppNotifications = [];
    this.eventEmitter.emit('in_app_notifications_cleared');
  }

  // Handle specific events
  private handleGameUpdated(payload: any): void {
    console.log('Game updated:', payload);
    this.eventEmitter.emit('game_updated', payload);
  }

  private handleNotificationCreated(payload: any): void {
    console.log('New notification:', payload);
    
    // Show in-app notification
    const notification: InAppNotification = {
      id: payload.id || Date.now().toString(),
      title: payload.title,
      message: payload.message,
      type: payload.priority === 'high' ? 'warning' : 'info',
      actionUrl: payload.actionUrl,
      timestamp: Date.now(),
      isRead: false
    };
    
    this.showInAppNotification(notification);
  }

  private handleChatMessage(payload: any): void {
    console.log('Chat message:', payload);
    this.eventEmitter.emit('chat_message', payload);
  }

  private handlePlayerJoined(payload: any): void {
    console.log('Player joined:', payload);
    
    const notification: InAppNotification = {
      id: Date.now().toString(),
      title: 'Player Joined',
      message: `${payload.playerName} joined the game!`,
      type: 'success',
      actionUrl: `/games/${payload.gameId}`,
      timestamp: Date.now(),
      isRead: false
    };
    
    this.showInAppNotification(notification);
  }

  private handlePlayerLeft(payload: any): void {
    console.log('Player left:', payload);
    
    const notification: InAppNotification = {
      id: Date.now().toString(),
      title: 'Player Left',
      message: `${payload.playerName} left the game`,
      type: 'info',
      actionUrl: `/games/${payload.gameId}`,
      timestamp: Date.now(),
      isRead: false
    };
    
    this.showInAppNotification(notification);
  }

  private handleGameCancelled(payload: any): void {
    console.log('Game cancelled:', payload);
    
    const notification: InAppNotification = {
      id: Date.now().toString(),
      title: 'Game Cancelled',
      message: `Game "${payload.gameName}" has been cancelled`,
      type: 'error',
      actionUrl: `/games/${payload.gameId}`,
      timestamp: Date.now(),
      isRead: false
    };
    
    this.showInAppNotification(notification);
  }

  private handleTeamInvite(payload: any): void {
    console.log('Team invite:', payload);
    
    const notification: InAppNotification = {
      id: Date.now().toString(),
      title: 'Team Invitation',
      message: `You've been invited to join "${payload.teamName}"`,
      type: 'info',
      actionUrl: `/teams/${payload.teamId}`,
      timestamp: Date.now(),
      isRead: false
    };
    
    this.showInAppNotification(notification);
  }

  // Schedule reconnection with exponential backoff
  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('Max reconnection attempts reached');
      return;
    }

    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts);
    console.log(`Scheduling reconnection in ${delay}ms (attempt ${this.reconnectAttempts + 1})`);
    
    setTimeout(() => {
      this.reconnectAttempts++;
      this.initializeWebSocket().catch(error => {
        console.error('Reconnection failed:', error);
      });
    }, delay);
  }

  // Subscribe to events
  subscribe(event: string, callback: (data: any) => void): void {
    this.eventEmitter.on(event, callback);
  }

  // Unsubscribe from events
  unsubscribe(event: string, callback: (data: any) => void): void {
    this.eventEmitter.off(event, callback);
  }

  // Send message via WebSocket
  send(event: string, data: any): void {
    if (this.ws && this.isConnected) {
      this.ws.send(JSON.stringify({
        type: event,
        payload: data
      }));
    } else {
      console.warn('WebSocket is not connected. Cannot send message:', event, data);
    }
  }

  // Get connection status
  getConnectionStatus(): {
    isConnected: boolean;
    reconnectAttempts: number;
    fcmToken: string | null;
  } {
    return {
      isConnected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts,
      fcmToken: this.fcmToken
    };
  }

  // Disconnect
  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnected = false;
    this.reconnectAttempts = 0;
  }
}

// Export the class
export { MobileRealtimeService };

// Create default instance (will be configured by the app)
export const mobileRealtimeService = new MobileRealtimeService({
  wsUrl: import.meta.env.VITE_WS_URL || 'ws://localhost:8080/ws',
  enablePushNotifications: true,
  enableInAppNotifications: true
});
