import { test, expect } from '@playwright/test';
import { TestHelpers, mockData } from '../utils/test-helpers';

test.describe('Home Screen', () => {
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page);
    
    // Mock all required API responses
    await helpers.mockApiResponse('/auth/login', {
      success: true,
      token: 'mock-jwt-token',
      user: mockData.user
    });
    
    await helpers.mockApiResponse('/api/v1/games/nearby', mockData.games);
    await helpers.mockApiResponse('/api/v1/games/trending', mockData.trendingSports);
    await helpers.mockApiResponse('/api/v1/notifications', mockData.notifications);
    await helpers.mockApiResponse('/api/v1/weather', {
      city: 'Kathmandu',
      temperature: 22,
      condition: 'Clear',
      icon: '01d'
    });

    await helpers.login();
  });

  test('should load home screen with all sections', async ({ page }) => {
    // Verify hero banner
    await expect(page.locator('[data-testid="hero-banner"]')).toBeVisible();
    await expect(page.locator('[data-testid="welcome-message"]')).toContainText('Welcome back, John!');
    await expect(page.locator('[data-testid="location-info"]')).toContainText('Kathmandu');
    await expect(page.locator('[data-testid="weather-info"]')).toContainText('22°C');

    // Verify quick actions
    await expect(page.locator('[data-testid="create-game-button"]')).toBeVisible();
    await expect(page.locator('[data-testid="find-games-button"]')).toBeVisible();
    await expect(page.locator('[data-testid="my-games-button"]')).toBeVisible();

    // Verify nearby games section
    await expect(page.locator('[data-testid="nearby-games-section"]')).toBeVisible();
    await expect(page.locator('[data-testid="game-card"]')).toHaveCount(2);

    // Verify trending sports section
    await expect(page.locator('[data-testid="trending-sports-section"]')).toBeVisible();
    await expect(page.locator('[data-testid="trending-sport-chip"]')).toHaveCount(3);

    // Verify notifications preview
    await expect(page.locator('[data-testid="notifications-preview"]')).toBeVisible();
  });

  test('should display nearby games correctly', async ({ page }) => {
    // Wait for games to load
    await helpers.waitForApiCall('/api/v1/games/nearby');
    
    // Verify first game card
    const firstGame = page.locator('[data-testid="game-card"]').first();
    await expect(firstGame.locator('[data-testid="game-sport"]')).toContainText('Football');
    await expect(firstGame.locator('[data-testid="game-venue"]')).toContainText('Kathmandu Sports Complex');
    await expect(firstGame.locator('[data-testid="game-time"]')).toContainText('10:00');
    await expect(firstGame.locator('[data-testid="game-price"]')).toContainText('500');
    await expect(firstGame.locator('[data-testid="game-players"]')).toContainText('8/12');
    
    // Verify second game card
    const secondGame = page.locator('[data-testid="game-card"]').nth(1);
    await expect(secondGame.locator('[data-testid="game-sport"]')).toContainText('Basketball');
    await expect(secondGame.locator('[data-testid="game-venue"]')).toContainText('Basketball Court');
  });

  test('should display trending sports correctly', async ({ page }) => {
    // Wait for trending sports to load
    await helpers.waitForApiCall('/api/v1/games/trending');
    
    // Verify trending sports chips
    const footballChip = page.locator('[data-testid="trending-sport-chip"]').filter({ hasText: 'Football' });
    await expect(footballChip).toBeVisible();
    await expect(footballChip.locator('[data-testid="player-count"]')).toContainText('45');

    const basketballChip = page.locator('[data-testid="trending-sport-chip"]').filter({ hasText: 'Basketball' });
    await expect(basketballChip).toBeVisible();
    await expect(basketballChip.locator('[data-testid="player-count"]')).toContainText('32');
  });

  test('should display user XP and rank', async ({ page }) => {
    // Verify XP progress bar
    await expect(page.locator('[data-testid="xp-progress-bar"]')).toBeVisible();
    await expect(page.locator('[data-testid="xp-value"]')).toContainText('150');
    await expect(page.locator('[data-testid="xp-max"]')).toContainText('250');
    
    // Verify rank display
    await expect(page.locator('[data-testid="user-rank"]')).toContainText('Competent');
  });

  test('should handle quick action clicks', async ({ page }) => {
    // Test create game button
    await page.click('[data-testid="create-game-button"]');
    await expect(page).toHaveURL('/dashboard/games?action=create');
    
    // Navigate back to home
    await page.click('[data-testid="nav-home"]');
    
    // Test find games button
    await page.click('[data-testid="find-games-button"]');
    await expect(page).toHaveURL('/dashboard/games');
    
    // Navigate back to home
    await page.click('[data-testid="nav-home"]');
    
    // Test my games button
    await page.click('[data-testid="my-games-button"]');
    await expect(page).toHaveURL('/dashboard/games?filter=my-games');
  });

  test('should show loading states', async ({ page }) => {
    // Mock slow API response
    await page.route('**/api/v1/games/nearby', async route => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockData.games)
      });
    });

    await page.reload();
    
    // Verify loading skeletons are shown
    await expect(page.locator('[data-testid="games-loading-skeleton"]')).toBeVisible();
    await expect(page.locator('[data-testid="trending-loading-skeleton"]')).toBeVisible();
  });

  test('should handle API errors gracefully', async ({ page }) => {
    // Mock API error
    await page.route('**/api/v1/games/nearby', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal Server Error' })
      });
    });

    await page.reload();
    
    // Verify error state is shown
    await expect(page.locator('[data-testid="games-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="games-error"]')).toContainText('Failed to load games');
  });

  test('should show offline indicator when offline', async ({ page }) => {
    // Simulate offline state
    await page.context().setOffline(true);
    
    await page.reload();
    
    // Verify offline indicator is shown
    await expect(page.locator('[data-testid="offline-indicator"]')).toBeVisible();
    await expect(page.locator('[data-testid="offline-indicator"]')).toContainText('You\'re offline');
  });

  test('should show cached data when offline', async ({ page }) => {
    // First load data online
    await page.reload();
    await helpers.waitForApiCall('/api/v1/games/nearby');
    
    // Go offline
    await page.context().setOffline(true);
    
    // Reload page
    await page.reload();
    
    // Verify cached data is still shown
    await expect(page.locator('[data-testid="game-card"]')).toHaveCount(2);
    await expect(page.locator('[data-testid="trending-sport-chip"]')).toHaveCount(3);
  });

  test('should display notifications preview', async ({ page }) => {
    // Wait for notifications to load
    await helpers.waitForApiCall('/api/v1/notifications');
    
    // Verify notification preview
    await expect(page.locator('[data-testid="notification-item"]')).toHaveCount(1);
    await expect(page.locator('[data-testid="notification-title"]')).toContainText('Game Invitation');
    await expect(page.locator('[data-testid="notification-message"]')).toContainText('You have been invited to a football game');
    
    // Verify unread indicator
    await expect(page.locator('[data-testid="unread-indicator"]')).toBeVisible();
  });

  test('should navigate to notifications when clicking notification', async ({ page }) => {
    await helpers.waitForApiCall('/api/v1/notifications');
    
    // Click on notification
    await page.click('[data-testid="notification-item"]');
    
    // Should navigate to notifications tab
    await expect(page).toHaveURL('/dashboard/notifications');
  });

  test('should show real-time connection status', async ({ page }) => {
    // Verify live indicator when connected
    await expect(page.locator('[data-testid="live-indicator"]')).toBeVisible();
    await expect(page.locator('[data-testid="live-indicator"]')).toContainText('Live');
  });
});
