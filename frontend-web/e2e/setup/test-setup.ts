import { test as base, expect } from '@playwright/test';
import { TestHelpers } from '../utils/test-helpers';

// Extend the base test with custom fixtures
export const test = base.extend<{
  helpers: TestHelpers;
}>({
  helpers: async ({ page }, use) => {
    const helpers = new TestHelpers(page);
    await use(helpers);
  },
});

// Global test configuration
test.beforeEach(async ({ page }) => {
  // Set up global mocks
  await page.addInitScript(() => {
    // Mock WebSocket
    window.mockWebSocket = {
      readyState: 1,
      onopen: null,
      onclose: null,
      onmessage: null,
      onerror: null,
      send: jest.fn(),
      close: jest.fn()
    };
    
    // Mock Web Share API
    Object.defineProperty(navigator, 'share', {
      value: jest.fn().mockResolvedValue(undefined),
      writable: true
    });
    
    // Mock Clipboard API
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: jest.fn().mockResolvedValue(undefined),
        readText: jest.fn().mockResolvedValue('')
      },
      writable: true
    });
    
    // Mock Geolocation API
    Object.defineProperty(navigator, 'geolocation', {
      value: {
        getCurrentPosition: jest.fn().mockImplementation((success) => {
          success({
            coords: {
              latitude: 27.7172,
              longitude: 85.324,
              accuracy: 10
            }
          });
        }),
        watchPosition: jest.fn(),
        clearWatch: jest.fn()
      },
      writable: true
    });
    
    // Mock Network Information API
    Object.defineProperty(navigator, 'connection', {
      value: {
        effectiveType: '4g',
        downlink: 10,
        rtt: 50,
        saveData: false,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn()
      },
      writable: true
    });
    
    // Mock Service Worker
    Object.defineProperty(navigator, 'serviceWorker', {
      value: {
        register: jest.fn().mockResolvedValue({
          scope: '/',
          update: jest.fn(),
          unregister: jest.fn()
        }),
        ready: Promise.resolve({
          scope: '/',
          update: jest.fn(),
          unregister: jest.fn()
        }),
        controller: null,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn()
      },
      writable: true
    });
    
    // Mock Push Manager
    Object.defineProperty(navigator, 'PushManager', {
      value: {
        supportedContentEncodings: ['aesgcm'],
        subscribe: jest.fn().mockResolvedValue({
          endpoint: 'https://fcm.googleapis.com/fcm/send/test',
          keys: {
            p256dh: 'test-p256dh-key',
            auth: 'test-auth-key'
          }
        }),
        getSubscription: jest.fn().mockResolvedValue(null),
        permissionState: jest.fn().mockResolvedValue('granted')
      },
      writable: true
    });
    
    // Mock IndexedDB
    const mockDB = {
      open: jest.fn().mockResolvedValue({
        result: {
          createObjectStore: jest.fn(),
          transaction: jest.fn().mockReturnValue({
            objectStore: jest.fn().mockReturnValue({
              put: jest.fn(),
              get: jest.fn(),
              getAll: jest.fn(),
              clear: jest.fn()
            })
          })
        }
      })
    };
    
    Object.defineProperty(window, 'indexedDB', {
      value: mockDB,
      writable: true
    });
    
    // Mock localStorage
    const mockStorage = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
      length: 0,
      key: jest.fn()
    };
    
    Object.defineProperty(window, 'localStorage', {
      value: mockStorage,
      writable: true
    });
    
    // Mock sessionStorage
    Object.defineProperty(window, 'sessionStorage', {
      value: mockStorage,
      writable: true
    });
  });
});

// Global test teardown
test.afterEach(async ({ page }) => {
  // Clean up any global state
  await page.evaluate(() => {
    // Clear any global variables
    if (window.mockWebSocket) {
      window.mockWebSocket.close();
    }
    
    // Clear any queued messages
    if (window.queuedMessages) {
      window.queuedMessages = [];
    }
  });
});

// Global test timeout
test.setTimeout(60000);

// Global expect timeout
expect.setOptions({ timeout: 10000 });
