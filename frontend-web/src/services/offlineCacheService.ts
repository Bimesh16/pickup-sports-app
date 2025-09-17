import { apiClient } from '@lib/apiClient';

interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  expiresAt: number;
  version: string;
}

interface CacheConfig {
  maxAge: number; // in milliseconds
  version: string;
  maxEntries?: number;
}

class OfflineCacheService {
  private dbName = 'PickupSportsCache';
  private dbVersion = 1;
  private db: IDBDatabase | null = null;
  private isInitialized = false;

  // Cache configurations for different data types
  private cacheConfigs: Record<string, CacheConfig> = {
    games: {
      maxAge: 5 * 60 * 1000, // 5 minutes
      version: '1.0',
      maxEntries: 100
    },
    venues: {
      maxAge: 10 * 60 * 1000, // 10 minutes
      version: '1.0',
      maxEntries: 50
    },
    notifications: {
      maxAge: 2 * 60 * 1000, // 2 minutes
      version: '1.0',
      maxEntries: 200
    },
    profile: {
      maxAge: 30 * 60 * 1000, // 30 minutes
      version: '1.0',
      maxEntries: 1
    },
    teams: {
      maxAge: 15 * 60 * 1000, // 15 minutes
      version: '1.0',
      maxEntries: 20
    },
    sports: {
      maxAge: 60 * 60 * 1000, // 1 hour
      version: '1.0',
      maxEntries: 10
    }
  };

  // Initialize IndexedDB
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => {
        console.error('Failed to open IndexedDB:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        this.isInitialized = true;
        console.log('IndexedDB initialized successfully');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create object stores for different data types
        Object.keys(this.cacheConfigs).forEach(storeName => {
          if (!db.objectStoreNames.contains(storeName)) {
            const store = db.createObjectStore(storeName, { keyPath: 'key' });
            store.createIndex('timestamp', 'timestamp', { unique: false });
            store.createIndex('expiresAt', 'expiresAt', { unique: false });
          }
        });

        // Create a general cache store for API responses
        if (!db.objectStoreNames.contains('apiCache')) {
          const store = db.createObjectStore('apiCache', { keyPath: 'url' });
          store.createIndex('timestamp', 'timestamp', { unique: false });
          store.createIndex('expiresAt', 'expiresAt', { unique: false });
        }
      };
    });
  }

  // Get cached data
  async get<T>(storeName: string, key: string): Promise<T | null> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(key);

      request.onsuccess = () => {
        const result = request.result as CacheEntry<T> | undefined;
        
        if (!result) {
          resolve(null);
          return;
        }

        // Check if data has expired
        if (Date.now() > result.expiresAt) {
          // Data has expired, delete it
          this.delete(storeName, key);
          resolve(null);
          return;
        }

        resolve(result.data);
      };

      request.onerror = () => {
        console.error('Failed to get data from cache:', request.error);
        resolve(null);
      };
    });
  }

  // Set cached data
  async set<T>(storeName: string, key: string, data: T): Promise<void> {
    if (!this.isInitialized) {
      try {
        await this.initialize();
      } catch (error) {
        console.error('Failed to initialize offline cache service:', error);
        return; // Don't throw, just return silently
      }
    }

    const config = this.cacheConfigs[storeName] || this.cacheConfigs.games;
    const now = Date.now();
    
    const entry: CacheEntry<T> = {
      data,
      timestamp: now,
      expiresAt: now + config.maxAge,
      version: config.version
    };

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put({ key, ...entry });

      request.onsuccess = () => {
        // Clean up old entries if maxEntries is specified
        if (config.maxEntries) {
          this.cleanupOldEntries(storeName, config.maxEntries);
        }
        resolve();
      };

      request.onerror = () => {
        console.error('Failed to set data in cache:', request.error);
        reject(request.error);
      };
    });
  }

  // Delete cached data
  async delete(storeName: string, key: string): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(key);

      request.onsuccess = () => resolve();
      request.onerror = () => {
        console.error('Failed to delete data from cache:', request.error);
        reject(request.error);
      };
    });
  }

  // Clear all data from a store
  async clear(storeName: string): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => {
        console.error('Failed to clear cache store:', request.error);
        reject(request.error);
      };
    });
  }

  // Clean up old entries
  private async cleanupOldEntries(storeName: string, maxEntries: number): Promise<void> {
    if (!this.db) {
      return;
    }

    const transaction = this.db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    const index = store.index('timestamp');
    const request = index.openCursor();

    const entries: Array<{ key: string; timestamp: number }> = [];

    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest).result;
      if (cursor) {
        entries.push({ key: cursor.key as string, timestamp: cursor.value.timestamp });
        cursor.continue();
      } else {
        // Sort by timestamp (oldest first) and remove excess entries
        entries.sort((a, b) => a.timestamp - b.timestamp);
        const entriesToDelete = entries.slice(0, entries.length - maxEntries);
        
        entriesToDelete.forEach(entry => {
          store.delete(entry.key);
        });
      }
    };
  }

  // Cache API response
  async cacheApiResponse<T>(url: string, data: T, maxAge?: number): Promise<void> {
    const cacheKey = `api_${url}`;
    const now = Date.now();
    const expiresAt = now + (maxAge || 5 * 60 * 1000); // Default 5 minutes

    const entry: CacheEntry<T> = {
      data,
      timestamp: now,
      expiresAt,
      version: '1.0'
    };

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction(['apiCache'], 'readwrite');
      const store = transaction.objectStore('apiCache');
      const request = store.put({ url: cacheKey, ...entry });

      request.onsuccess = () => resolve();
      request.onerror = () => {
        console.error('Failed to cache API response:', request.error);
        reject(request.error);
      };
    });
  }

  // Get cached API response
  async getCachedApiResponse<T>(url: string): Promise<T | null> {
    const cacheKey = `api_${url}`;
    return this.get<T>('apiCache', cacheKey);
  }

  // Stale-while-revalidate strategy
  async staleWhileRevalidate<T>(
    url: string,
    fetcher: () => Promise<T>,
    maxAge?: number
  ): Promise<T> {
    // Try to get cached data first
    const cachedData = await this.getCachedApiResponse<T>(url);
    
    if (cachedData) {
      // Return cached data immediately
      console.log('Returning cached data for:', url);
      
      // Fetch fresh data in the background
      fetcher()
        .then(freshData => {
          this.cacheApiResponse(url, freshData, maxAge);
        })
        .catch(error => {
          console.error('Background fetch failed:', error);
        });
      
      return cachedData;
    }

    // No cached data, fetch fresh data
    console.log('Fetching fresh data for:', url);
    const freshData = await fetcher();
    await this.cacheApiResponse(url, freshData, maxAge);
    return freshData;
  }

  // Get cache statistics
  async getCacheStats(): Promise<Record<string, number>> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const stats: Record<string, number> = {};

    for (const storeName of Object.keys(this.cacheConfigs)) {
      stats[storeName] = await this.getStoreCount(storeName);
    }

    stats.apiCache = await this.getStoreCount('apiCache');
    return stats;
  }

  // Get count of entries in a store
  private async getStoreCount(storeName: string): Promise<number> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.count();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => {
        console.error('Failed to count store entries:', request.error);
        resolve(0);
      };
    });
  }

  // Clear all caches
  async clearAllCaches(): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const storeNames = [...Object.keys(this.cacheConfigs), 'apiCache'];
    
    for (const storeName of storeNames) {
      await this.clear(storeName);
    }

    console.log('All caches cleared');
  }

  // Check if offline
  isOffline(): boolean {
    return !navigator.onLine;
  }

  // Listen for online/offline events
  onOnlineStatusChange(callback: (isOnline: boolean) => void): () => void {
    const handleOnline = () => callback(true);
    const handleOffline = () => callback(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Return cleanup function
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }
}

// Create singleton instance
export const offlineCacheService = new OfflineCacheService();

// Export the class for testing
export { OfflineCacheService };
