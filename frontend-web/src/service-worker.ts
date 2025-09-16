// Enhanced Service Worker for Pickup Sports App with Real-time Features
// Provides offline functionality, caching, background sync, and push notifications

const CACHE_NAME = 'pickup-sports-v2.0.0';
const STATIC_CACHE = 'pickup-sports-static-v2';
const DYNAMIC_CACHE = 'pickup-sports-dynamic-v2';
const API_CACHE = 'pickup-sports-api-v2';
const IMAGE_CACHE = 'pickup-sports-images-v2';

// Static assets to cache
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png',
  '/badge-72x72.png'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (![STATIC_CACHE, DYNAMIC_CACHE, API_CACHE, IMAGE_CACHE].includes(cacheName)) {
            console.log('Service Worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache or network with enhanced strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Handle API requests with stale-while-revalidate
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request));
    return;
  }
  
  // Handle WebSocket connections
  if (url.protocol === 'wss:' || url.protocol === 'ws:') {
    return; // Let WebSocket connections pass through
  }
  
  // Handle static assets with cache-first
  if (request.destination === 'script' || request.destination === 'style' || request.destination === 'document') {
    event.respondWith(handleStaticRequest(request));
    return;
  }
  
  // Handle images with cache-first
  if (request.destination === 'image') {
    event.respondWith(handleImageRequest(request));
    return;
  }
  
  // Default handling
  event.respondWith(handleDefaultRequest(request));
});

// Enhanced API request handler with stale-while-revalidate
async function handleApiRequest(request: Request): Promise<Response> {
  const cache = await caches.open(API_CACHE);
  const cachedResponse = await cache.match(request);
  
  // Return cached response immediately if available (stale-while-revalidate)
  if (cachedResponse) {
    // Update cache in background
    fetch(request).then(async (response) => {
      if (response.ok) {
        await cache.put(request, response.clone());
      }
    }).catch(() => {
      // Ignore fetch errors in background
    });
    
    return cachedResponse;
  }
  
  // Try to fetch from network
  try {
    const response = await fetch(request);
    if (response.ok) {
      await cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    // Return offline fallback for specific API endpoints
    if (request.url.includes('/api/v1/games/nearby')) {
      const offlineGames = await cache.match('/api/v1/games/nearby-offline');
      if (offlineGames) return offlineGames;
    }
    
    if (request.url.includes('/api/v1/venues/nearby')) {
      const offlineVenues = await cache.match('/api/v1/venues/nearby-offline');
      if (offlineVenues) return offlineVenues;
    }
    
    return new Response(JSON.stringify({ 
      error: 'Offline', 
      message: 'This data is not available offline' 
    }), { 
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Static asset handler with cache-first strategy
async function handleStaticRequest(request: Request): Promise<Response> {
  const cache = await caches.open(STATIC_CACHE);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const response = await fetch(request);
    if (response.ok) {
      await cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    return new Response('Asset not available offline', { status: 503 });
  }
}

// Image handler with cache-first strategy
async function handleImageRequest(request: Request): Promise<Response> {
  const cache = await caches.open(IMAGE_CACHE);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const response = await fetch(request);
    if (response.ok) {
      await cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    // Return placeholder for offline images
    return new Response('', { status: 503 });
  }
}

// Default request handler
async function handleDefaultRequest(request: Request): Promise<Response> {
  try {
    return await fetch(request);
  } catch (error) {
    const cache = await caches.open(STATIC_CACHE);
    const cachedResponse = await cache.match('/');
    return cachedResponse || new Response('Offline', { status: 503 });
  }
}

// Background sync for offline data
self.addEventListener('sync', (event) => {
  console.log('Background sync triggered:', event.tag);
  
  switch (event.tag) {
    case 'background-sync':
      event.waitUntil(doBackgroundSync());
      break;
    case 'game-updates':
      event.waitUntil(syncGameUpdates());
      break;
    case 'notifications':
      event.waitUntil(syncNotifications());
      break;
  }
});

async function doBackgroundSync() {
  console.log('Performing background sync...');
  
  try {
    // Sync any pending offline actions
    const pendingActions = await getStoredPendingActions();
    
    for (const action of pendingActions) {
      try {
        await fetch(action.url, action.options);
        await removePendingAction(action.id);
      } catch (error) {
        console.log('Failed to sync action:', action.id);
      }
    }
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

async function syncGameUpdates() {
  console.log('Syncing game updates...');
  // Implementation for syncing game updates
}

async function syncNotifications() {
  console.log('Syncing notifications...');
  // Implementation for syncing notifications
}

// Store pending actions for background sync
async function getStoredPendingActions() {
  // Implementation would use IndexedDB or localStorage
  return [];
}

async function removePendingAction(id: string) {
  // Implementation would remove from IndexedDB or localStorage
}

// Enhanced push notifications
self.addEventListener('push', (event) => {
  console.log('Push notification received:', event);
  
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body || 'You have a new notification',
      icon: data.icon || '/icon-192x192.png',
      badge: data.badge || '/badge-72x72.png',
      tag: data.tag || 'default',
      requireInteraction: data.requireInteraction || false,
      silent: data.silent || false,
      vibrate: data.vibrate || [200, 100, 200],
      actions: data.actions || [
        {
          action: 'view',
          title: 'View',
          icon: '/icon-192x192.png'
        },
        {
          action: 'dismiss',
          title: 'Dismiss',
          icon: '/icon-192x192.png'
        }
      ],
      data: {
        url: data.url || '/dashboard',
        gameId: data.gameId,
        notificationId: data.notificationId,
        ...data.data
      }
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title || 'Pickup Sports', options)
    );
  }
});

// Enhanced notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  
  event.notification.close();
  
  const data = event.notification.data || {};
  const urlToOpen = data.url || '/dashboard';
  const action = event.action;
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Handle different actions
      if (action === 'dismiss') {
        return;
      }
      
      // Check if app is already open
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          // Send message to existing client
          client.postMessage({
            type: 'NOTIFICATION_CLICKED',
            data: data,
            action: action
          });
          return client.focus();
        }
      }
      
      // Open new window
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Handle messages from the main thread
self.addEventListener('message', (event) => {
  console.log('Service Worker received message:', event.data);
  
  switch (event.data.type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
    case 'CACHE_GAME_DATA':
      cacheGameData(event.data.data);
      break;
    case 'CACHE_VENUE_DATA':
      cacheVenueData(event.data.data);
      break;
  }
});

async function cacheGameData(games: any[]) {
  const cache = await caches.open(API_CACHE);
  const response = new Response(JSON.stringify(games), {
    headers: { 'Content-Type': 'application/json' }
  });
  await cache.put('/api/v1/games/nearby-offline', response);
}

async function cacheVenueData(venues: any[]) {
  const cache = await caches.open(API_CACHE);
  const response = new Response(JSON.stringify(venues), {
    headers: { 'Content-Type': 'application/json' }
  });
  await cache.put('/api/v1/venues/nearby-offline', response);
}