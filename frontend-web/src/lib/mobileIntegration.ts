// Mobile Integration Guide for React Native
// This file provides guidance for implementing real-time features in React Native

export interface MobileRealTimeConfig {
  // WebSocket configuration for React Native
  websocket: {
    url: string;
    reconnectAttempts: number;
    reconnectDelay: number;
  };
  
  // Push notification configuration
  pushNotifications: {
    fcm: {
      serverKey: string;
      senderId: string;
    };
    apns: {
      keyId: string;
      teamId: string;
      bundleId: string;
    };
  };
  
  // Background sync configuration
  backgroundSync: {
    enabled: boolean;
    interval: number; // minutes
  };
}

export const mobileConfig: MobileRealTimeConfig = {
  websocket: {
    url: 'wss://api.pickupsports.com/ws',
    reconnectAttempts: 5,
    reconnectDelay: 1000
  },
  pushNotifications: {
    fcm: {
      serverKey: import.meta.env.VITE_FCM_SERVER_KEY || '',
      senderId: import.meta.env.VITE_FCM_SENDER_ID || ''
    },
    apns: {
      keyId: import.meta.env.VITE_APNS_KEY_ID || '',
      teamId: import.meta.env.VITE_APNS_TEAM_ID || '',
      bundleId: import.meta.env.VITE_APNS_BUNDLE_ID || ''
    }
  },
  backgroundSync: {
    enabled: true,
    interval: 15
  }
};

// React Native WebSocket implementation example
export const createReactNativeWebSocket = () => {
  /*
  // Install required packages:
  // npm install @react-native-async-storage/async-storage
  // npm install react-native-websocket
  // npm install @react-native-firebase/messaging
  // npm install @react-native-firebase/app

  import { WebSocket } from 'react-native-websocket';
  import AsyncStorage from '@react-native-async-storage/async-storage';

  class ReactNativeWebSocketManager {
    private ws: WebSocket | null = null;
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;
    private reconnectDelay = 1000;
    private token: string | null = null;

    async connect(token: string) {
      this.token = token;
      this.connectWebSocket();
    }

    private connectWebSocket() {
      const wsUrl = `${mobileConfig.websocket.url}?token=${this.token}`;
      
      this.ws = new WebSocket(wsUrl);
      
      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
        this.reconnectDelay = 1000;
      };

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          this.handleMessage(message);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        this.scheduleReconnect();
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    }

    private handleMessage(message: any) {
      // Handle different message types
      switch (message.type) {
        case 'game_updated':
          this.emit('game_updated', message.data);
          break;
        case 'notification_created':
          this.emit('notification_created', message.data);
          break;
        case 'chat_message':
          this.emit('chat_message', message.data);
          break;
      }
    }

    private scheduleReconnect() {
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++;
        const delay = Math.min(this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1), 30000);
        
        setTimeout(() => {
          this.connectWebSocket();
        }, delay);
      }
    }

    send(message: any) {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify(message));
      }
    }

    disconnect() {
      if (this.ws) {
        this.ws.close();
        this.ws = null;
      }
    }
  }
  */
};

// React Native Push Notifications implementation example
export const createReactNativePushNotifications = () => {
  /*
  // Firebase Cloud Messaging setup
  import messaging from '@react-native-firebase/messaging';
  import { PermissionsAndroid, Platform } from 'react-native';

  class ReactNativePushNotificationManager {
    async initialize() {
      // Request permission
      const authStatus = await messaging().requestPermission();
      const enabled = authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
                     authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        console.log('Push notification permission granted');
        
        // Get FCM token
        const token = await messaging().getToken();
        console.log('FCM Token:', token);
        
        // Send token to server
        await this.sendTokenToServer(token);
        
        // Set up message handlers
        this.setupMessageHandlers();
      }
    }

    private async sendTokenToServer(token: string) {
      try {
        await fetch('/api/v1/notifications/subscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.token}`
          },
          body: JSON.stringify({
            token,
            platform: Platform.OS,
            type: 'fcm'
          })
        });
      } catch (error) {
        console.error('Failed to send token to server:', error);
      }
    }

    private setupMessageHandlers() {
      // Handle foreground messages
      messaging().onMessage(async remoteMessage => {
        console.log('Foreground message:', remoteMessage);
        this.showInAppNotification(remoteMessage);
      });

      // Handle background messages
      messaging().setBackgroundMessageHandler(async remoteMessage => {
        console.log('Background message:', remoteMessage);
      });

      // Handle notification tap
      messaging().onNotificationOpenedApp(remoteMessage => {
        console.log('Notification opened app:', remoteMessage);
        this.handleNotificationTap(remoteMessage);
      });

      // Handle app opened from quit state
      messaging()
        .getInitialNotification()
        .then(remoteMessage => {
          if (remoteMessage) {
            console.log('App opened from quit state:', remoteMessage);
            this.handleNotificationTap(remoteMessage);
          }
        });
    }

    private showInAppNotification(remoteMessage: any) {
      // Show in-app notification banner
      // Implementation depends on your UI library (e.g., react-native-toast-message)
    }

    private handleNotificationTap(remoteMessage: any) {
      // Navigate to relevant screen based on notification data
      const { data } = remoteMessage;
      
      if (data?.gameId) {
        // Navigate to game details
        // navigation.navigate('GameDetails', { gameId: data.gameId });
      } else if (data?.type === 'notification') {
        // Navigate to notifications tab
        // navigation.navigate('Notifications');
      }
    }
  }
  */
};

// React Native Background Sync implementation example
export const createReactNativeBackgroundSync = () => {
  /*
  // Install required packages:
  // npm install @react-native-async-storage/async-storage
  // npm install @react-native-background-job/react-native-background-job

  import AsyncStorage from '@react-native-async-storage/async-storage';
  import BackgroundJob from '@react-native-background-job/react-native-background-job';

  class ReactNativeBackgroundSyncManager {
    async initialize() {
      // Set up background job for data sync
      BackgroundJob.register({
        jobKey: 'dataSync',
        period: mobileConfig.backgroundSync.interval * 60 * 1000, // Convert to milliseconds
      });

      // Start background job
      BackgroundJob.start({
        jobKey: 'dataSync',
        notificationTitle: 'Pickup Sports',
        notificationText: 'Syncing your data...',
        requiredNetworkType: 'wifi', // or 'any'
      });
    }

    async syncData() {
      try {
        // Get cached data
        const cachedData = await AsyncStorage.getItem('cached_dashboard_data');
        
        if (cachedData) {
          // Sync with server
          const response = await fetch('/api/v1/sync', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${this.token}`
            },
            body: cachedData
          });

          if (response.ok) {
            const updatedData = await response.json();
            await AsyncStorage.setItem('cached_dashboard_data', JSON.stringify(updatedData));
          }
        }
      } catch (error) {
        console.error('Background sync failed:', error);
      }
    }
  }
  */
};

// React Native Offline Storage implementation example
export const createReactNativeOfflineStorage = () => {
  /*
  // Install required packages:
  // npm install @react-native-async-storage/async-storage
  // npm install react-native-sqlite-storage

  import AsyncStorage from '@react-native-async-storage/async-storage';
  import SQLite from 'react-native-sqlite-storage';

  class ReactNativeOfflineStorageManager {
    private db: SQLite.SQLiteDatabase | null = null;

    async initialize() {
      // Initialize SQLite database
      this.db = await SQLite.openDatabase({
        name: 'PickupSports.db',
        location: 'default',
      });

      // Create tables
      await this.createTables();
    }

    private async createTables() {
      const createGamesTable = `
        CREATE TABLE IF NOT EXISTS games (
          id TEXT PRIMARY KEY,
          sport TEXT,
          venue TEXT,
          time TEXT,
          price REAL,
          currentPlayers INTEGER,
          maxPlayers INTEGER,
          data TEXT,
          timestamp INTEGER
        )
      `;

      const createNotificationsTable = `
        CREATE TABLE IF NOT EXISTS notifications (
          id TEXT PRIMARY KEY,
          type TEXT,
          title TEXT,
          message TEXT,
          isRead INTEGER,
          timestamp INTEGER
        )
      `;

      await this.db?.executeSql(createGamesTable);
      await this.db?.executeSql(createNotificationsTable);
    }

    async cacheGames(games: any[]) {
      if (!this.db) return;

      for (const game of games) {
        await this.db.executeSql(
          'INSERT OR REPLACE INTO games (id, sport, venue, time, price, currentPlayers, maxPlayers, data, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [
            game.id,
            game.sport,
            game.venue,
            game.time,
            game.price,
            game.currentPlayers,
            game.maxPlayers,
            JSON.stringify(game),
            Date.now()
          ]
        );
      }
    }

    async getCachedGames(): Promise<any[]> {
      if (!this.db) return [];

      return new Promise((resolve, reject) => {
        this.db!.executeSql(
          'SELECT * FROM games ORDER BY timestamp DESC',
          [],
          (result) => {
            const games = [];
            for (let i = 0; i < result.rows.length; i++) {
              const row = result.rows.item(i);
              games.push(JSON.parse(row.data));
            }
            resolve(games);
          },
          (error) => {
            reject(error);
          }
        );
      });
    }

    async cacheNotifications(notifications: any[]) {
      if (!this.db) return;

      for (const notification of notifications) {
        await this.db.executeSql(
          'INSERT OR REPLACE INTO notifications (id, type, title, message, isRead, timestamp) VALUES (?, ?, ?, ?, ?, ?)',
          [
            notification.id,
            notification.type,
            notification.title,
            notification.message,
            notification.isRead ? 1 : 0,
            Date.now()
          ]
        );
      }
    }

    async getCachedNotifications(): Promise<any[]> {
      if (!this.db) return [];

      return new Promise((resolve, reject) => {
        this.db!.executeSql(
          'SELECT * FROM notifications ORDER BY timestamp DESC',
          [],
          (result) => {
            const notifications = [];
            for (let i = 0; i < result.rows.length; i++) {
              const row = result.rows.item(i);
              notifications.push({
                id: row.id,
                type: row.type,
                title: row.title,
                message: row.message,
                isRead: row.isRead === 1,
                timestamp: row.timestamp
              });
            }
            resolve(notifications);
          },
          (error) => {
            reject(error);
          }
        );
      });
    }
  }
  */
};

export default {
  mobileConfig,
  createReactNativeWebSocket,
  createReactNativePushNotifications,
  createReactNativeBackgroundSync,
  createReactNativeOfflineStorage
};
