interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

class OfflineCacheService {
  private dbName = 'PickupSportsCache';
  private dbVersion = 1;
  private db: IDBDatabase | null = null;

  async initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create object stores for different data types
        if (!db.objectStoreNames.contains('games')) {
          db.createObjectStore('games', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('venues')) {
          db.createObjectStore('venues', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('profile')) {
          db.createObjectStore('profile', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('notifications')) {
          db.createObjectStore('notifications', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('trending')) {
          db.createObjectStore('trending', { keyPath: 'id' });
        }
      };
    });
  }

  async set<T>(storeName: string, key: string, data: T, ttlMinutes: number = 60): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + (ttlMinutes * 60 * 1000)
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put({ id: key, ...entry });

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async get<T>(storeName: string, key: string): Promise<T | null> {
    if (!this.db) {
      return null;
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const result = request.result;
        if (!result) {
          resolve(null);
          return;
        }

        const entry: CacheEntry<T> = result;
        
        // Check if entry has expired
        if (Date.now() > entry.expiresAt) {
          this.delete(storeName, key);
          resolve(null);
          return;
        }

        resolve(entry.data);
      };
    });
  }

  async getAll<T>(storeName: string): Promise<T[]> {
    if (!this.db) {
      return [];
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const results = request.result;
        const validEntries = results
          .filter((entry: CacheEntry<T>) => Date.now() <= entry.expiresAt)
          .map((entry: CacheEntry<T>) => entry.data);
        
        resolve(validEntries);
      };
    });
  }

  async delete(storeName: string, key: string): Promise<void> {
    if (!this.db) {
      return;
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async clear(storeName: string): Promise<void> {
    if (!this.db) {
      return;
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async clearExpired(): Promise<void> {
    if (!this.db) {
      return;
    }

    const storeNames = ['games', 'venues', 'profile', 'notifications', 'trending'];
    
    for (const storeName of storeNames) {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => {
        const results = request.result;
        const now = Date.now();
        
        results.forEach((entry: CacheEntry<any>) => {
          if (now > entry.expiresAt) {
            store.delete(entry.id);
          }
        });
      };
    }
  }

  // Specific methods for different data types
  async cacheGames(games: any[], ttlMinutes: number = 30): Promise<void> {
    await this.set('games', 'nearby', games, ttlMinutes);
  }

  async getCachedGames(): Promise<any[] | null> {
    return await this.get('games', 'nearby');
  }

  async cacheVenues(venues: any[], ttlMinutes: number = 60): Promise<void> {
    await this.set('venues', 'nearby', venues, ttlMinutes);
  }

  async getCachedVenues(): Promise<any[] | null> {
    return await this.get('venues', 'nearby');
  }

  async cacheProfile(profile: any, ttlMinutes: number = 120): Promise<void> {
    await this.set('profile', 'current', profile, ttlMinutes);
  }

  async getCachedProfile(): Promise<any | null> {
    return await this.get('profile', 'current');
  }

  async cacheTrending(trending: any[], ttlMinutes: number = 15): Promise<void> {
    await this.set('trending', 'sports', trending, ttlMinutes);
  }

  async getCachedTrending(): Promise<any[] | null> {
    return await this.get('trending', 'sports');
  }

  async cacheNotifications(notifications: any[], ttlMinutes: number = 30): Promise<void> {
    await this.set('notifications', 'recent', notifications, ttlMinutes);
  }

  async getCachedNotifications(): Promise<any[] | null> {
    return await this.get('notifications', 'recent');
  }
}

export const offlineCache = new OfflineCacheService();
