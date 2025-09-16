# Real-Time Features & PWA Implementation

This document outlines the comprehensive real-time features and Progressive Web App (PWA) capabilities implemented in the Pickup Sports App.

## 🚀 Features Implemented

### 1. WebSocket Integration
- **Connection**: `wss://api.pickupsports.com/ws`
- **Events**: `game_updated`, `notification_created`, `chat_message`
- **Reconnection**: Exponential backoff with max 5 attempts
- **Heartbeat**: 30-second ping/pong to maintain connection

### 2. Push Notifications (Web)
- **Service Worker**: Enhanced with push notification handling
- **VAPID**: Public key configuration for secure push subscriptions
- **Actions**: View, Dismiss with custom handling
- **Background**: Notifications work even when app is closed

### 3. Offline Caching
- **IndexedDB**: Persistent storage for offline data
- **Strategy**: Stale-while-revalidate for API calls
- **Data Types**: Games, venues, profile, notifications, trending
- **TTL**: Configurable expiration times per data type

### 4. Network Status Monitoring
- **Online/Offline**: Real-time connection status
- **Connection Type**: 2G, 3G, 4G, WiFi detection
- **Slow Connection**: Automatic detection and UI adaptation

### 5. Real-Time UI Updates
- **Game Updates**: Live player count updates
- **Notifications**: In-app banner notifications
- **Offline Indicators**: Visual feedback for connection status
- **Live Status**: WebSocket connection indicators

## 📁 File Structure

```
src/
├── lib/
│   ├── websocket.ts              # WebSocket manager
│   ├── pushNotifications.ts      # Push notification service
│   ├── offlineCache.ts          # IndexedDB cache service
│   └── mobileIntegration.ts     # React Native integration guide
├── context/
│   └── WebSocketContext.tsx     # React WebSocket context
├── hooks/
│   ├── useNetworkStatus.tsx     # Network status hook
│   └── usePWA.tsx              # PWA features hook
├── components/
│   ├── NotificationBanner.tsx   # Real-time notification banner
│   └── OfflineIndicator.tsx    # Network status indicator
└── service-worker.ts            # Enhanced service worker
```

## 🔧 Configuration

### Environment Variables
```bash
# WebSocket URL
VITE_WS_URL=wss://api.pickupsports.com/ws

# VAPID Public Key for Push Notifications
VITE_VAPID_PUBLIC_KEY=your_vapid_public_key

# API Base URL
VITE_API_URL=https://api.pickupsports.com
```

### Service Worker Configuration
```typescript
const CACHE_NAME = 'pickup-sports-v2.0.0';
const STATIC_CACHE = 'pickup-sports-static-v2';
const DYNAMIC_CACHE = 'pickup-sports-dynamic-v2';
const API_CACHE = 'pickup-sports-api-v2';
const IMAGE_CACHE = 'pickup-sports-images-v2';
```

## 🚀 Usage

### WebSocket Integration
```typescript
import { useWebSocket } from '@context/WebSocketContext';

function MyComponent() {
  const { isConnected, gameUpdates, notifications, sendMessage } = useWebSocket();
  
  // Listen for real-time updates
  useEffect(() => {
    if (gameUpdates.length > 0) {
      // Handle game updates
      const latestUpdate = gameUpdates[0];
      updateGameData(latestUpdate);
    }
  }, [gameUpdates]);
}
```

### Push Notifications
```typescript
import { pushNotificationService } from '@lib/pushNotifications';

// Initialize push notifications
await pushNotificationService.initialize();

// Subscribe to notifications
await pushNotificationService.subscribe();

// Show notification
await pushNotificationService.showNotification('Game Update', {
  body: 'Your futsal game is confirmed!',
  data: { gameId: '123' }
});
```

### Offline Caching
```typescript
import { offlineCache } from '@lib/offlineCache';

// Cache data
await offlineCache.cacheGames(games);
await offlineCache.cacheVenues(venues);

// Retrieve cached data
const cachedGames = await offlineCache.getCachedGames();
const cachedVenues = await offlineCache.getCachedVenues();
```

### Network Status
```typescript
import { useNetworkStatus } from '@hooks/useNetworkStatus';

function MyComponent() {
  const { isOnline, isSlowConnection, connectionType } = useNetworkStatus();
  
  return (
    <div>
      {!isOnline && <OfflineIndicator />}
      {isSlowConnection && <SlowConnectionWarning />}
    </div>
  );
}
```

## 📱 Mobile Integration (React Native)

### WebSocket Implementation
```typescript
// Install: npm install react-native-websocket
import { WebSocket } from 'react-native-websocket';

const ws = new WebSocket('wss://api.pickupsports.com/ws?token=your_token');
```

### Push Notifications (Firebase)
```typescript
// Install: npm install @react-native-firebase/messaging
import messaging from '@react-native-firebase/messaging';

// Request permission
const authStatus = await messaging().requestPermission();

// Get FCM token
const token = await messaging().getToken();

// Handle messages
messaging().onMessage(async remoteMessage => {
  // Show in-app notification
});
```

### Offline Storage (SQLite)
```typescript
// Install: npm install react-native-sqlite-storage
import SQLite from 'react-native-sqlite-storage';

const db = await SQLite.openDatabase({
  name: 'PickupSports.db',
  location: 'default',
});
```

## 🔄 Real-Time Data Flow

### 1. WebSocket Connection
```
User Login → Get JWT Token → Connect WebSocket → Listen for Events
```

### 2. Push Notifications
```
Service Worker → Subscribe to Push → Send Token to Server → Receive Notifications
```

### 3. Offline Caching
```
API Request → Cache Response → Serve from Cache (Offline) → Background Sync
```

### 4. Data Synchronization
```
Online: Fresh Data + Cache Update
Offline: Cached Data + Background Sync Queue
Reconnect: Sync Queued Changes + Fresh Data
```

## 🎯 Event Types

### WebSocket Events
- `game_updated`: Player count, status changes
- `notification_created`: New notifications
- `chat_message`: Real-time chat messages

### Push Notification Types
- `game_invite`: Game invitations
- `game_reminder`: Upcoming game reminders
- `team_update`: Team-related updates
- `achievement`: Badge/achievement unlocks

## 🛠️ Development

### Testing WebSocket
```bash
# Test WebSocket connection
wscat -c wss://api.pickupsports.com/ws?token=your_token

# Send test message
{"type": "ping"}
```

### Testing Push Notifications
```bash
# Send test notification via API
curl -X POST https://api.pickupsports.com/api/v1/notifications/send \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your_token" \
  -d '{"title": "Test", "body": "Test notification"}'
```

### Testing Offline Mode
1. Open DevTools → Network tab
2. Check "Offline" checkbox
3. Refresh the app
4. Verify cached data is displayed

## 🔒 Security Considerations

### WebSocket Security
- JWT token authentication
- Connection validation
- Rate limiting on server

### Push Notifications
- VAPID key validation
- User consent required
- Secure token transmission

### Offline Data
- Encrypted sensitive data
- TTL expiration
- User data privacy

## 📊 Performance Monitoring

### WebSocket Metrics
- Connection uptime
- Reconnection attempts
- Message throughput

### Cache Performance
- Hit/miss ratios
- Storage usage
- Sync success rates

### Push Notification Metrics
- Delivery rates
- Click-through rates
- Opt-in rates

## 🚀 Deployment

### Production Configuration
```bash
# Set production environment variables
VITE_WS_URL=wss://api.pickupsports.com/ws
VITE_VAPID_PUBLIC_KEY=your_production_vapid_key
VITE_API_URL=https://api.pickupsports.com
```

### Service Worker Update
```typescript
// Force service worker update
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistration().then(registration => {
    if (registration) {
      registration.update();
    }
  });
}
```

## 🔧 Troubleshooting

### WebSocket Issues
- Check token validity
- Verify server availability
- Monitor reconnection attempts

### Push Notification Issues
- Verify VAPID key configuration
- Check browser permissions
- Test with different browsers

### Offline Cache Issues
- Clear browser storage
- Check IndexedDB quotas
- Verify TTL settings

## 📈 Future Enhancements

### Planned Features
- [ ] Real-time chat integration
- [ ] Live game streaming
- [ ] Advanced offline sync
- [ ] Push notification scheduling
- [ ] WebRTC for voice/video calls

### Performance Optimizations
- [ ] Message batching
- [ ] Compression
- [ ] Connection pooling
- [ ] Smart caching strategies

---

## 📞 Support

For technical support or questions about real-time features:
- Check the troubleshooting section above
- Review the browser console for errors
- Test with different network conditions
- Verify server-side WebSocket implementation
