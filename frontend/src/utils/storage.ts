// Cross-platform storage utility
import { Platform } from 'react-native';

// Web-compatible storage interface
interface StorageInterface {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

// Web storage implementation
const webStorage: StorageInterface = {
  async getItem(key: string): Promise<string | null> {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  async setItem(key: string, value: string): Promise<void> {
    try {
      localStorage.setItem(key, value);
    } catch {
      // Ignore storage errors
    }
  },
  async removeItem(key: string): Promise<void> {
    try {
      localStorage.removeItem(key);
    } catch {
      // Ignore storage errors
    }
  },
};

// Native storage implementation
let nativeStorage: StorageInterface | null = null;

const getNativeStorage = async (): Promise<StorageInterface> => {
  if (nativeStorage) return nativeStorage;
  
  try {
    const SecureStore = await import('expo-secure-store');
    nativeStorage = {
      async getItem(key: string): Promise<string | null> {
        try {
          return await SecureStore.getItemAsync(key);
        } catch {
          return null;
        }
      },
      async setItem(key: string, value: string): Promise<void> {
        try {
          await SecureStore.setItemAsync(key, value);
        } catch {
          // Ignore storage errors
        }
      },
      async removeItem(key: string): Promise<void> {
        try {
          await SecureStore.deleteItemAsync(key);
        } catch {
          // Ignore storage errors
        }
      },
    };
    return nativeStorage;
  } catch {
    // Fallback to web storage if SecureStore is not available
    return webStorage;
  }
};

// Main storage interface
export const storage: StorageInterface = {
  async getItem(key: string): Promise<string | null> {
    if (Platform.OS === 'web') {
      return webStorage.getItem(key);
    }
    const native = await getNativeStorage();
    return native.getItem(key);
  },
  async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web') {
      return webStorage.setItem(key, value);
    }
    const native = await getNativeStorage();
    return native.setItem(key, value);
  },
  async removeItem(key: string): Promise<void> {
    if (Platform.OS === 'web') {
      return webStorage.removeItem(key);
    }
    const native = await getNativeStorage();
    return native.removeItem(key);
  },
};
