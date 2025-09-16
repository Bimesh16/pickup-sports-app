import { test, expect } from '@playwright/test';
import { TestHelpers, mockData } from '../utils/test-helpers';

test.describe('Notifications Management', () => {
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page);
    
    // Mock API responses
    await helpers.mockApiResponse('/auth/login', {
      success: true,
      token: 'mock-jwt-token',
      user: mockData.user
    });
    
    await helpers.mockApiResponse('/api/v1/notifications', mockData.notifications);
    await helpers.mockApiResponse('/api/v1/notifications/read', { success: true });
    await helpers.mockApiResponse('/api/v1/notifications/read-all', { success: true });

    await helpers.login();
    await helpers.navigateToTab('notifications');
  });

  test('should load notifications page with all notifications', async ({ page }) => {
    // Verify notifications list is visible
    await expect(page.locator('[data-testid="notifications-list"]')).toBeVisible();
    
    // Verify notification items
    await expect(page.locator('[data-testid="notification-item"]')).toHaveCount(1);
    
    // Verify notification content
    const notification = page.locator('[data-testid="notification-item"]').first();
    await expect(notification.locator('[data-testid="notification-title"]')).toContainText('Game Invitation');
    await expect(notification.locator('[data-testid="notification-message"]')).toContainText('You have been invited to a football game');
    
    // Verify unread indicator
    await expect(notification.locator('[data-testid="unread-indicator"]')).toBeVisible();
  });

  test('should mark notification as read', async ({ page }) => {
    // Click on notification to mark as read
    await page.click('[data-testid="notification-item"]');
    
    // Wait for API call
    await helpers.waitForApiCall('/api/v1/notifications/read');
    
    // Verify unread indicator is gone
    await expect(page.locator('[data-testid="unread-indicator"]')).toBeHidden();
    
    // Verify success message
    await expect(page.locator('[data-testid="success-toast"]')).toBeVisible();
  });

  test('should mark all notifications as read', async ({ page }) => {
    // Click mark all as read button
    await page.click('[data-testid="mark-all-read-button"]');
    
    // Wait for API call
    await helpers.waitForApiCall('/api/v1/notifications/read-all');
    
    // Verify all unread indicators are gone
    await expect(page.locator('[data-testid="unread-indicator"]')).toHaveCount(0);
    
    // Verify success message
    await expect(page.locator('[data-testid="success-toast"]')).toBeVisible();
  });

  test('should filter notifications by type', async ({ page }) => {
    // Mock different notification types
    const mixedNotifications = [
      { ...mockData.notifications[0], type: 'game_invite' },
      { ...mockData.notifications[0], id: 'notif-2', type: 'reminder', title: 'Game Reminder' },
      { ...mockData.notifications[0], id: 'notif-3', type: 'achievement', title: 'Badge Earned' }
    ];
    
    await helpers.mockApiResponse('/api/v1/notifications', mixedNotifications);
    await page.reload();
    
    // Filter by game invites
    await page.click('[data-testid="filter-game-invites"]');
    
    // Wait for API call
    await helpers.waitForApiCall('/api/v1/notifications');
    
    // Verify only game invites are shown
    await expect(page.locator('[data-testid="notification-item"]')).toHaveCount(1);
    await expect(page.locator('[data-testid="notification-title"]')).toContainText('Game Invitation');
  });

  test('should filter notifications by read status', async ({ page }) => {
    // Mock mixed read/unread notifications
    const mixedNotifications = [
      { ...mockData.notifications[0], isRead: false },
      { ...mockData.notifications[0], id: 'notif-2', isRead: true, title: 'Read Notification' }
    ];
    
    await helpers.mockApiResponse('/api/v1/notifications', mixedNotifications);
    await page.reload();
    
    // Filter by unread only
    await page.click('[data-testid="filter-unread"]');
    
    // Wait for API call
    await helpers.waitForApiCall('/api/v1/notifications');
    
    // Verify only unread notifications are shown
    await expect(page.locator('[data-testid="notification-item"]')).toHaveCount(1);
    await expect(page.locator('[data-testid="notification-title"]')).toContainText('Game Invitation');
  });

  test('should show notification timestamps', async ({ page }) => {
    // Verify timestamp is displayed
    await expect(page.locator('[data-testid="notification-timestamp"]')).toBeVisible();
    await expect(page.locator('[data-testid="notification-timestamp"]')).toContainText('just now');
  });

  test('should handle notification click navigation', async ({ page }) => {
    // Mock notification with navigation data
    const navigationNotification = {
      ...mockData.notifications[0],
      data: { gameId: 'game-1', navigateTo: '/dashboard/games' }
    };
    
    await helpers.mockApiResponse('/api/v1/notifications', [navigationNotification]);
    await page.reload();
    
    // Click on notification
    await page.click('[data-testid="notification-item"]');
    
    // Verify navigation
    await expect(page).toHaveURL('/dashboard/games');
  });

  test('should show empty state when no notifications', async ({ page }) => {
    // Mock empty notifications
    await helpers.mockApiResponse('/api/v1/notifications', []);
    await page.reload();
    
    // Verify empty state
    await expect(page.locator('[data-testid="empty-state"]')).toBeVisible();
    await expect(page.locator('[data-testid="empty-state"]')).toContainText('No notifications found');
  });

  test('should show loading state during fetch', async ({ page }) => {
    // Mock slow notifications response
    await page.route('**/api/v1/notifications', async route => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockData.notifications)
      });
    });

    await page.reload();
    
    // Verify loading state
    await expect(page.locator('[data-testid="notifications-loading"]')).toBeVisible();
    
    // Wait for completion
    await helpers.waitForApiCall('/api/v1/notifications');
    
    // Verify loading state is gone
    await expect(page.locator('[data-testid="notifications-loading"]')).toBeHidden();
  });

  test('should handle API errors gracefully', async ({ page }) => {
    // Mock API error
    await page.route('**/api/v1/notifications', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal Server Error' })
      });
    });

    await page.reload();
    
    // Verify error state
    await expect(page.locator('[data-testid="notifications-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="notifications-error"]')).toContainText('Failed to load notifications');
  });

  test('should implement pagination', async ({ page }) => {
    // Mock paginated notifications
    const firstPage = mockData.notifications.slice(0, 1);
    const secondPage = mockData.notifications.slice(1, 2);
    
    await page.route('**/api/v1/notifications', (route, request) => {
      const url = new URL(request.url());
      const page = url.searchParams.get('page') || '0';
      
      if (page === '0') {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(firstPage)
        });
      } else {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(secondPage)
        });
      }
    });

    await page.reload();
    
    // Verify first page loaded
    await expect(page.locator('[data-testid="notification-item"]')).toHaveCount(1);
    
    // Click load more button
    await page.click('[data-testid="load-more-button"]');
    
    // Wait for second page
    await helpers.waitForApiCall('/api/v1/notifications');
    
    // Verify both pages loaded
    await expect(page.locator('[data-testid="notification-item"]')).toHaveCount(2);
  });

  test('should show notification count in header', async ({ page }) => {
    // Verify notification count badge
    await expect(page.locator('[data-testid="notification-count"]')).toBeVisible();
    await expect(page.locator('[data-testid="notification-count"]')).toContainText('1');
  });

  test('should handle mark as read error', async ({ page }) => {
    // Mock mark as read error
    await page.route('**/api/v1/notifications/read', route => {
      route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Notification not found' })
      });
    });

    // Click on notification
    await page.click('[data-testid="notification-item"]');
    
    // Wait for API call
    await helpers.waitForApiCall('/api/v1/notifications/read');
    
    // Verify error message
    await expect(page.locator('[data-testid="error-toast"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-toast"]')).toContainText('Notification not found');
  });

  test('should handle mark all as read error', async ({ page }) => {
    // Mock mark all as read error
    await page.route('**/api/v1/notifications/read-all', route => {
      route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Failed to mark all as read' })
      });
    });

    // Click mark all as read button
    await page.click('[data-testid="mark-all-read-button"]');
    
    // Wait for API call
    await helpers.waitForApiCall('/api/v1/notifications/read-all');
    
    // Verify error message
    await expect(page.locator('[data-testid="error-toast"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-toast"]')).toContainText('Failed to mark all as read');
  });

  test('should show notification types with icons', async ({ page }) => {
    // Mock different notification types
    const typedNotifications = [
      { ...mockData.notifications[0], type: 'game_invite' },
      { ...mockData.notifications[0], id: 'notif-2', type: 'reminder', title: 'Game Reminder' },
      { ...mockData.notifications[0], id: 'notif-3', type: 'achievement', title: 'Badge Earned' }
    ];
    
    await helpers.mockApiResponse('/api/v1/notifications', typedNotifications);
    await page.reload();
    
    // Verify notification icons
    await expect(page.locator('[data-testid="notification-icon-game-invite"]')).toBeVisible();
    await expect(page.locator('[data-testid="notification-icon-reminder"]')).toBeVisible();
    await expect(page.locator('[data-testid="notification-icon-achievement"]')).toBeVisible();
  });

  test('should refresh notifications', async ({ page }) => {
    // Click refresh button
    await page.click('[data-testid="refresh-button"]');
    
    // Wait for API call
    await helpers.waitForApiCall('/api/v1/notifications');
    
    // Verify notifications are refreshed
    await expect(page.locator('[data-testid="notification-item"]')).toHaveCount(1);
  });
});
