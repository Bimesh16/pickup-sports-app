import { test, expect } from '@playwright/test';
import { TestHelpers, mockData } from '../utils/test-helpers';

test.describe('Real-time Updates', () => {
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page);
    
    // Mock API responses
    await helpers.mockApiResponse('/auth/login', {
      success: true,
      token: 'mock-jwt-token',
      user: mockData.user
    });
    
    await helpers.mockApiResponse('/api/v1/games/nearby', mockData.games);
    await helpers.mockApiResponse('/api/v1/notifications', mockData.notifications);

    await helpers.login();
  });

  test('should connect to WebSocket on login', async ({ page }) => {
    // Mock WebSocket connection
    await page.evaluate(() => {
      window.mockWebSocket = {
        readyState: 1,
        onopen: null,
        onclose: null,
        onmessage: null,
        onerror: null,
        send: jest.fn(),
        close: jest.fn()
      };
      
      // Simulate WebSocket connection
      setTimeout(() => {
        if (window.mockWebSocket.onopen) {
          window.mockWebSocket.onopen();
        }
      }, 100);
    });

    // Wait for WebSocket connection
    await page.waitForFunction(() => window.mockWebSocket?.readyState === 1);
    
    // Verify connection indicator
    await expect(page.locator('[data-testid="live-indicator"]')).toBeVisible();
    await expect(page.locator('[data-testid="live-indicator"]')).toContainText('Live');
  });

  test('should handle WebSocket disconnection', async ({ page }) => {
    // Mock WebSocket disconnection
    await page.evaluate(() => {
      window.mockWebSocket = {
        readyState: 3,
        onopen: null,
        onclose: null,
        onmessage: null,
        onerror: null,
        send: jest.fn(),
        close: jest.fn()
      };
    });

    // Wait for WebSocket disconnection
    await page.waitForFunction(() => window.mockWebSocket?.readyState === 3);
    
    // Verify connection indicator is hidden
    await expect(page.locator('[data-testid="live-indicator"]')).toBeHidden();
  });

  test('should update game player count in real-time', async ({ page }) => {
    // Navigate to games tab
    await helpers.navigateToTab('games');
    
    // Wait for games to load
    await helpers.waitForApiCall('/api/v1/games/search');
    
    // Verify initial player count
    await expect(page.locator('[data-testid="game-players"]').first()).toContainText('8/12');
    
    // Simulate game update WebSocket message
    await helpers.mockWebSocketMessage({
      type: 'game_updated',
      data: {
        gameId: 'game-1',
        playerCount: 10,
        maxPlayers: 12,
        status: 'active'
      }
    });
    
    // Verify player count is updated
    await expect(page.locator('[data-testid="game-players"]').first()).toContainText('10/12');
  });

  test('should show real-time notification banner', async ({ page }) => {
    // Simulate notification WebSocket message
    await helpers.mockWebSocketMessage({
      type: 'notification_created',
      data: {
        id: 'notif-2',
        type: 'game_invite',
        title: 'New Game Invitation',
        message: 'You have been invited to a basketball game',
        userId: 'user-123'
      }
    });
    
    // Verify notification banner is shown
    await expect(page.locator('[data-testid="notification-banner"]')).toBeVisible();
    await expect(page.locator('[data-testid="notification-title"]')).toContainText('New Game Invitation');
    await expect(page.locator('[data-testid="notification-message"]')).toContainText('You have been invited to a basketball game');
  });

  test('should dismiss notification banner', async ({ page }) => {
    // Simulate notification WebSocket message
    await helpers.mockWebSocketMessage({
      type: 'notification_created',
      data: {
        id: 'notif-2',
        type: 'game_invite',
        title: 'New Game Invitation',
        message: 'You have been invited to a basketball game',
        userId: 'user-123'
      }
    });
    
    // Wait for banner to appear
    await expect(page.locator('[data-testid="notification-banner"]')).toBeVisible();
    
    // Click dismiss button
    await page.click('[data-testid="dismiss-notification"]');
    
    // Verify banner is dismissed
    await expect(page.locator('[data-testid="notification-banner"]')).toBeHidden();
  });

  test('should auto-dismiss notification after timeout', async ({ page }) => {
    // Simulate notification WebSocket message
    await helpers.mockWebSocketMessage({
      type: 'notification_created',
      data: {
        id: 'notif-2',
        type: 'game_invite',
        title: 'New Game Invitation',
        message: 'You have been invited to a basketball game',
        userId: 'user-123'
      }
    });
    
    // Wait for banner to appear
    await expect(page.locator('[data-testid="notification-banner"]')).toBeVisible();
    
    // Wait for auto-dismiss timeout (5 seconds)
    await page.waitForTimeout(6000);
    
    // Verify banner is auto-dismissed
    await expect(page.locator('[data-testid="notification-banner"]')).toBeHidden();
  });

  test('should handle chat messages in real-time', async ({ page }) => {
    // Navigate to a game with chat
    await page.goto('/dashboard/games/game-1');
    
    // Simulate chat message WebSocket message
    await helpers.mockWebSocketMessage({
      type: 'chat_message',
      data: {
        gameId: 'game-1',
        userId: 'user-456',
        message: 'Hey everyone, ready to play?',
        timestamp: new Date().toISOString(),
        userName: 'Jane Doe'
      }
    });
    
    // Verify chat message is displayed
    await expect(page.locator('[data-testid="chat-message"]')).toContainText('Hey everyone, ready to play?');
    await expect(page.locator('[data-testid="chat-sender"]')).toContainText('Jane Doe');
  });

  test('should reconnect WebSocket on connection loss', async ({ page }) => {
    // Mock WebSocket with reconnection logic
    await page.evaluate(() => {
      let reconnectAttempts = 0;
      const maxReconnectAttempts = 3;
      
      window.mockWebSocket = {
        readyState: 3,
        onopen: null,
        onclose: null,
        onmessage: null,
        onerror: null,
        send: jest.fn(),
        close: jest.fn(),
        reconnect: () => {
          if (reconnectAttempts < maxReconnectAttempts) {
            reconnectAttempts++;
            setTimeout(() => {
              window.mockWebSocket.readyState = 1;
              if (window.mockWebSocket.onopen) {
                window.mockWebSocket.onopen();
              }
            }, 1000);
          }
        }
      };
      
      // Simulate connection loss
      setTimeout(() => {
        window.mockWebSocket.readyState = 3;
        if (window.mockWebSocket.onclose) {
          window.mockWebSocket.onclose();
        }
        // Trigger reconnection
        window.mockWebSocket.reconnect();
      }, 100);
    });

    // Wait for reconnection
    await page.waitForFunction(() => window.mockWebSocket?.readyState === 1, { timeout: 10000 });
    
    // Verify connection is restored
    await expect(page.locator('[data-testid="live-indicator"]')).toBeVisible();
  });

  test('should handle WebSocket errors gracefully', async ({ page }) => {
    // Mock WebSocket error
    await page.evaluate(() => {
      window.mockWebSocket = {
        readyState: 3,
        onopen: null,
        onclose: null,
        onmessage: null,
        onerror: null,
        send: jest.fn(),
        close: jest.fn()
      };
      
      // Simulate error
      setTimeout(() => {
        if (window.mockWebSocket.onerror) {
          window.mockWebSocket.onerror(new Error('Connection failed'));
        }
      }, 100);
    });

    // Wait for error
    await page.waitForFunction(() => window.mockWebSocket?.readyState === 3);
    
    // Verify error is handled gracefully
    await expect(page.locator('[data-testid="live-indicator"]')).toBeHidden();
  });

  test('should show offline indicator when offline', async ({ page }) => {
    // Simulate offline state
    await page.context().setOffline(true);
    
    // Verify offline indicator is shown
    await expect(page.locator('[data-testid="offline-indicator"]')).toBeVisible();
    await expect(page.locator('[data-testid="offline-indicator"]')).toContainText('You\'re offline');
  });

  test('should show slow connection indicator', async ({ page }) => {
    // Mock slow connection
    await page.evaluate(() => {
      Object.defineProperty(navigator, 'connection', {
        value: {
          effectiveType: '2g'
        },
        writable: true
      });
    });

    // Trigger connection change event
    await page.evaluate(() => {
      if (navigator.connection) {
        navigator.connection.dispatchEvent(new Event('change'));
      }
    });
    
    // Verify slow connection indicator
    await expect(page.locator('[data-testid="slow-connection-indicator"]')).toBeVisible();
    await expect(page.locator('[data-testid="slow-connection-indicator"]')).toContainText('Slow connection detected');
  });

  test('should queue messages when offline', async ({ page }) => {
    // Go offline
    await page.context().setOffline(true);
    
    // Simulate WebSocket message while offline
    await helpers.mockWebSocketMessage({
      type: 'game_updated',
      data: {
        gameId: 'game-1',
        playerCount: 10,
        maxPlayers: 12,
        status: 'active'
      }
    });
    
    // Go back online
    await page.context().setOffline(false);
    
    // Verify queued message is processed
    await page.waitForFunction(() => {
      return window.queuedMessages?.length > 0;
    });
  });

  test('should handle multiple simultaneous updates', async ({ page }) => {
    // Navigate to games tab
    await helpers.navigateToTab('games');
    
    // Wait for games to load
    await helpers.waitForApiCall('/api/v1/games/search');
    
    // Simulate multiple game updates
    await helpers.mockWebSocketMessage({
      type: 'game_updated',
      data: {
        gameId: 'game-1',
        playerCount: 10,
        maxPlayers: 12,
        status: 'active'
      }
    });
    
    await helpers.mockWebSocketMessage({
      type: 'game_updated',
      data: {
        gameId: 'game-2',
        playerCount: 6,
        maxPlayers: 10,
        status: 'active'
      }
    });
    
    // Verify both updates are processed
    await expect(page.locator('[data-testid="game-players"]').first()).toContainText('10/12');
    await expect(page.locator('[data-testid="game-players"]').nth(1)).toContainText('6/10');
  });

  test('should show connection status in header', async ({ page }) => {
    // Verify connection status is displayed
    await expect(page.locator('[data-testid="connection-status"]')).toBeVisible();
    
    // Mock WebSocket connection
    await page.evaluate(() => {
      window.mockWebSocket = {
        readyState: 1,
        onopen: null,
        onclose: null,
        onmessage: null,
        onerror: null,
        send: jest.fn(),
        close: jest.fn()
      };
      
      setTimeout(() => {
        if (window.mockWebSocket.onopen) {
          window.mockWebSocket.onopen();
        }
      }, 100);
    });

    // Wait for connection
    await page.waitForFunction(() => window.mockWebSocket?.readyState === 1);
    
    // Verify connection status shows connected
    await expect(page.locator('[data-testid="connection-status"]')).toContainText('Connected');
  });
});
