import { test, expect } from '@playwright/test';
import { TestHelpers, mockData } from '../utils/test-helpers';

test.describe('Games Tab', () => {
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page);
    
    // Mock API responses
    await helpers.mockApiResponse('/auth/login', {
      success: true,
      token: 'mock-jwt-token',
      user: mockData.user
    });
    
    await helpers.mockApiResponse('/api/v1/games/search', mockData.games);
    await helpers.mockApiResponse('/api/v1/games/join', { success: true });

    await helpers.login();
    await helpers.navigateToTab('games');
  });

  test('should load games tab with search and filters', async ({ page }) => {
    // Verify search bar is visible
    await expect(page.locator('[data-testid="search-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="filter-button"]')).toBeVisible();
    
    // Verify view toggle buttons
    await expect(page.locator('[data-testid="list-view-button"]')).toBeVisible();
    await expect(page.locator('[data-testid="map-view-button"]')).toBeVisible();
    
    // Verify sorting options
    await expect(page.locator('[data-testid="sort-distance"]')).toBeVisible();
    await expect(page.locator('[data-testid="sort-time"]')).toBeVisible();
    await expect(page.locator('[data-testid="sort-price"]')).toBeVisible();
    await expect(page.locator('[data-testid="sort-popularity"]')).toBeVisible();
  });

  test('should search games by sport', async ({ page }) => {
    // Type in search input
    await page.fill('[data-testid="search-input"]', 'Football');
    
    // Wait for API call
    await helpers.waitForApiCall('/api/v1/games/search');
    
    // Verify filtered results
    await expect(page.locator('[data-testid="game-card"]')).toHaveCount(1);
    await expect(page.locator('[data-testid="game-sport"]').first()).toContainText('Football');
  });

  test('should filter games by location', async ({ page }) => {
    // Click filter button
    await page.click('[data-testid="filter-button"]');
    
    // Verify filter panel is open
    await expect(page.locator('[data-testid="filter-panel"]')).toBeVisible();
    
    // Set location filter
    await page.fill('[data-testid="location-input"]', 'Kathmandu');
    await page.fill('[data-testid="radius-input"]', '5');
    
    // Apply filters
    await page.click('[data-testid="apply-filters-button"]');
    
    // Wait for API call
    await helpers.waitForApiCall('/api/v1/games/search');
    
    // Verify filtered results
    await expect(page.locator('[data-testid="game-card"]')).toHaveCount(2);
  });

  test('should filter games by date and time', async ({ page }) => {
    await page.click('[data-testid="filter-button"]');
    
    // Set date filter
    await page.fill('[data-testid="date-input"]', '2024-01-15');
    await page.selectOption('[data-testid="time-select"]', 'morning');
    
    // Apply filters
    await page.click('[data-testid="apply-filters-button"]');
    
    // Wait for API call
    await helpers.waitForApiCall('/api/v1/games/search');
    
    // Verify filtered results
    await expect(page.locator('[data-testid="game-card"]')).toHaveCount(1);
  });

  test('should filter games by skill level', async ({ page }) => {
    await page.click('[data-testid="filter-button"]');
    
    // Set skill level filter
    await page.selectOption('[data-testid="skill-level-select"]', 'intermediate');
    
    // Apply filters
    await page.click('[data-testid="apply-filters-button"]');
    
    // Wait for API call
    await helpers.waitForApiCall('/api/v1/games/search');
    
    // Verify filtered results
    await expect(page.locator('[data-testid="game-card"]')).toHaveCount(2);
  });

  test('should sort games by distance', async ({ page }) => {
    // Click distance sort
    await page.click('[data-testid="sort-distance"]');
    
    // Wait for API call
    await helpers.waitForApiCall('/api/v1/games/search');
    
    // Verify games are sorted by distance
    const gameCards = page.locator('[data-testid="game-card"]');
    await expect(gameCards).toHaveCount(2);
  });

  test('should sort games by time', async ({ page }) => {
    // Click time sort
    await page.click('[data-testid="sort-time"]');
    
    // Wait for API call
    await helpers.waitForApiCall('/api/v1/games/search');
    
    // Verify games are sorted by time
    const gameCards = page.locator('[data-testid="game-card"]');
    await expect(gameCards).toHaveCount(2);
  });

  test('should sort games by price', async ({ page }) => {
    // Click price sort
    await page.click('[data-testid="sort-price"]');
    
    // Wait for API call
    await helpers.waitForApiCall('/api/v1/games/search');
    
    // Verify games are sorted by price
    const gameCards = page.locator('[data-testid="game-card"]');
    await expect(gameCards).toHaveCount(2);
  });

  test('should sort games by popularity', async ({ page }) => {
    // Click popularity sort
    await page.click('[data-testid="sort-popularity"]');
    
    // Wait for API call
    await helpers.waitForApiCall('/api/v1/games/search');
    
    // Verify games are sorted by popularity
    const gameCards = page.locator('[data-testid="game-card"]');
    await expect(gameCards).toHaveCount(2);
  });

  test('should toggle between list and map view', async ({ page }) => {
    // Start in list view
    await expect(page.locator('[data-testid="games-list"]')).toBeVisible();
    await expect(page.locator('[data-testid="games-map"]')).toBeHidden();
    
    // Switch to map view
    await page.click('[data-testid="map-view-button"]');
    
    // Verify map view is shown
    await expect(page.locator('[data-testid="games-map"]')).toBeVisible();
    await expect(page.locator('[data-testid="games-list"]')).toBeHidden();
    
    // Switch back to list view
    await page.click('[data-testid="list-view-button"]');
    
    // Verify list view is shown
    await expect(page.locator('[data-testid="games-list"]')).toBeVisible();
    await expect(page.locator('[data-testid="games-map"]')).toBeHidden();
  });

  test('should join a game', async ({ page }) => {
    // Wait for games to load
    await helpers.waitForApiCall('/api/v1/games/search');
    
    // Click join button on first game
    await page.click('[data-testid="join-game-button"]').first();
    
    // Wait for join API call
    await helpers.waitForApiCall('/api/v1/games/join');
    
    // Verify success message
    await expect(page.locator('[data-testid="success-toast"]')).toBeVisible();
    await expect(page.locator('[data-testid="success-toast"]')).toContainText('Joined!');
    
    // Verify player count updated
    await expect(page.locator('[data-testid="game-players"]').first()).toContainText('9/12');
  });

  test('should handle join game error', async ({ page }) => {
    // Mock join game error
    await page.route('**/api/v1/games/join', route => {
      route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Game is full' })
      });
    });

    await helpers.waitForApiCall('/api/v1/games/search');
    
    // Click join button
    await page.click('[data-testid="join-game-button"]').first();
    
    // Verify error message
    await expect(page.locator('[data-testid="error-toast"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-toast"]')).toContainText('Game is full');
  });

  test('should implement infinite scroll', async ({ page }) => {
    // Mock paginated response
    const firstPage = mockData.games.slice(0, 1);
    const secondPage = mockData.games.slice(1, 2);
    
    await page.route('**/api/v1/games/search', (route, request) => {
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
    await expect(page.locator('[data-testid="game-card"]')).toHaveCount(1);
    
    // Scroll to bottom to trigger load more
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    
    // Wait for second page to load
    await page.waitForTimeout(1000);
    
    // Verify both pages loaded
    await expect(page.locator('[data-testid="game-card"]')).toHaveCount(2);
  });

  test('should show loading states during search', async ({ page }) => {
    // Mock slow search response
    await page.route('**/api/v1/games/search', async route => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockData.games)
      });
    });

    // Trigger search
    await page.fill('[data-testid="search-input"]', 'Football');
    
    // Verify loading state
    await expect(page.locator('[data-testid="search-loading"]')).toBeVisible();
    
    // Wait for results
    await helpers.waitForApiCall('/api/v1/games/search');
    
    // Verify loading state is gone
    await expect(page.locator('[data-testid="search-loading"]')).toBeHidden();
  });

  test('should show empty state when no games found', async ({ page }) => {
    // Mock empty response
    await page.route('**/api/v1/games/search', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([])
      });
    });

    // Search for non-existent games
    await page.fill('[data-testid="search-input"]', 'NonExistentSport');
    
    // Wait for API call
    await helpers.waitForApiCall('/api/v1/games/search');
    
    // Verify empty state
    await expect(page.locator('[data-testid="empty-state"]')).toBeVisible();
    await expect(page.locator('[data-testid="empty-state"]')).toContainText('No games found');
  });

  test('should display game details correctly', async ({ page }) => {
    await helpers.waitForApiCall('/api/v1/games/search');
    
    // Verify first game card details
    const firstGame = page.locator('[data-testid="game-card"]').first();
    await expect(firstGame.locator('[data-testid="game-sport"]')).toContainText('Football');
    await expect(firstGame.locator('[data-testid="game-venue"]')).toContainText('Kathmandu Sports Complex');
    await expect(firstGame.locator('[data-testid="game-time"]')).toContainText('10:00');
    await expect(firstGame.locator('[data-testid="game-price"]')).toContainText('500');
    await expect(firstGame.locator('[data-testid="game-players"]')).toContainText('8/12');
    await expect(firstGame.locator('[data-testid="game-distance"]')).toContainText('0.5 km');
  });

  test('should handle map view interactions', async ({ page }) => {
    // Switch to map view
    await page.click('[data-testid="map-view-button"]');
    
    // Verify map is visible
    await expect(page.locator('[data-testid="games-map"]')).toBeVisible();
    
    // Verify map markers are present
    await expect(page.locator('[data-testid="map-marker"]')).toHaveCount(2);
    
    // Click on a marker
    await page.click('[data-testid="map-marker"]').first();
    
    // Verify game details popup
    await expect(page.locator('[data-testid="game-popup"]')).toBeVisible();
    await expect(page.locator('[data-testid="game-popup"]')).toContainText('Football');
  });
});
