import { test, expect } from '@playwright/test';
import { TestHelpers, mockData } from '../utils/test-helpers';

test.describe('Create Game Form', () => {
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page);
    
    // Mock API responses
    await helpers.mockApiResponse('/auth/login', {
      success: true,
      token: 'mock-jwt-token',
      user: mockData.user
    });
    
    await helpers.mockApiResponse('/api/v1/venues', mockData.venues);
    await helpers.mockApiResponse('/api/v1/games/create', { 
      success: true, 
      gameId: 'new-game-123' 
    });

    await helpers.login();
    await page.goto('/dashboard/games?action=create');
  });

  test('should load create game form with all fields', async ({ page }) => {
    // Verify form is visible
    await expect(page.locator('[data-testid="create-game-form"]')).toBeVisible();
    
    // Verify all required fields are present
    await expect(page.locator('[data-testid="sport-select"]')).toBeVisible();
    await expect(page.locator('[data-testid="venue-select"]')).toBeVisible();
    await expect(page.locator('[data-testid="date-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="time-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="duration-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="max-players-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="price-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="description-textarea"]')).toBeVisible();
    
    // Verify form buttons
    await expect(page.locator('[data-testid="preview-button"]')).toBeVisible();
    await expect(page.locator('[data-testid="create-button"]')).toBeVisible();
    await expect(page.locator('[data-testid="cancel-button"]')).toBeVisible();
  });

  test('should validate required fields', async ({ page }) => {
    // Try to submit empty form
    await page.click('[data-testid="create-button"]');
    
    // Verify validation messages
    await expect(page.locator('[data-testid="sport-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="venue-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="date-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="time-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="max-players-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="price-error"]')).toBeVisible();
  });

  test('should fill form step by step', async ({ page }) => {
    // Step 1: Select sport
    await page.selectOption('[data-testid="sport-select"]', 'Football');
    
    // Step 2: Select venue
    await page.selectOption('[data-testid="venue-select"]', 'Kathmandu Sports Complex');
    
    // Step 3: Set date and time
    await page.fill('[data-testid="date-input"]', '2024-01-20');
    await page.fill('[data-testid="time-input"]', '14:00');
    
    // Step 4: Set duration
    await page.fill('[data-testid="duration-input"]', '90');
    
    // Step 5: Set max players
    await page.fill('[data-testid="max-players-input"]', '12');
    
    // Step 6: Set price
    await page.fill('[data-testid="price-input"]', '500');
    
    // Step 7: Add description
    await page.fill('[data-testid="description-textarea"]', 'Casual football game for all skill levels');
    
    // Verify all fields are filled
    await expect(page.locator('[data-testid="sport-select"]')).toHaveValue('Football');
    await expect(page.locator('[data-testid="venue-select"]')).toHaveValue('Kathmandu Sports Complex');
    await expect(page.locator('[data-testid="date-input"]')).toHaveValue('2024-01-20');
    await expect(page.locator('[data-testid="time-input"]')).toHaveValue('14:00');
    await expect(page.locator('[data-testid="duration-input"]')).toHaveValue('90');
    await expect(page.locator('[data-testid="max-players-input"]')).toHaveValue('12');
    await expect(page.locator('[data-testid="price-input"]')).toHaveValue('500');
    await expect(page.locator('[data-testid="description-textarea"]')).toHaveValue('Casual football game for all skill levels');
  });

  test('should show preview before creating', async ({ page }) => {
    // Fill form
    await page.selectOption('[data-testid="sport-select"]', 'Football');
    await page.selectOption('[data-testid="venue-select"]', 'Kathmandu Sports Complex');
    await page.fill('[data-testid="date-input"]', '2024-01-20');
    await page.fill('[data-testid="time-input"]', '14:00');
    await page.fill('[data-testid="duration-input"]', '90');
    await page.fill('[data-testid="max-players-input"]', '12');
    await page.fill('[data-testid="price-input"]', '500');
    await page.fill('[data-testid="description-textarea"]', 'Casual football game');
    
    // Click preview button
    await page.click('[data-testid="preview-button"]');
    
    // Verify preview modal is shown
    await expect(page.locator('[data-testid="preview-modal"]')).toBeVisible();
    
    // Verify preview content
    await expect(page.locator('[data-testid="preview-sport"]')).toContainText('Football');
    await expect(page.locator('[data-testid="preview-venue"]')).toContainText('Kathmandu Sports Complex');
    await expect(page.locator('[data-testid="preview-date"]')).toContainText('2024-01-20');
    await expect(page.locator('[data-testid="preview-time"]')).toContainText('14:00');
    await expect(page.locator('[data-testid="preview-duration"]')).toContainText('90 minutes');
    await expect(page.locator('[data-testid="preview-players"]')).toContainText('12 players');
    await expect(page.locator('[data-testid="preview-price"]')).toContainText('500');
    await expect(page.locator('[data-testid="preview-description"]')).toContainText('Casual football game');
  });

  test('should create game successfully', async ({ page }) => {
    // Fill form
    await page.selectOption('[data-testid="sport-select"]', 'Football');
    await page.selectOption('[data-testid="venue-select"]', 'Kathmandu Sports Complex');
    await page.fill('[data-testid="date-input"]', '2024-01-20');
    await page.fill('[data-testid="time-input"]', '14:00');
    await page.fill('[data-testid="duration-input"]', '90');
    await page.fill('[data-testid="max-players-input"]', '12');
    await page.fill('[data-testid="price-input"]', '500');
    await page.fill('[data-testid="description-textarea"]', 'Casual football game');
    
    // Click create button
    await page.click('[data-testid="create-button"]');
    
    // Wait for API call
    await helpers.waitForApiCall('/api/v1/games/create');
    
    // Verify success message
    await expect(page.locator('[data-testid="success-toast"]')).toBeVisible();
    await expect(page.locator('[data-testid="success-toast"]')).toContainText('Game created successfully!');
    
    // Verify redirect to games list
    await expect(page).toHaveURL('/dashboard/games');
  });

  test('should handle create game error', async ({ page }) => {
    // Mock create game error
    await page.route('**/api/v1/games/create', route => {
      route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Venue not available at this time' })
      });
    });

    // Fill form
    await page.selectOption('[data-testid="sport-select"]', 'Football');
    await page.selectOption('[data-testid="venue-select"]', 'Kathmandu Sports Complex');
    await page.fill('[data-testid="date-input"]', '2024-01-20');
    await page.fill('[data-testid="time-input"]', '14:00');
    await page.fill('[data-testid="duration-input"]', '90');
    await page.fill('[data-testid="max-players-input"]', '12');
    await page.fill('[data-testid="price-input"]', '500');
    await page.fill('[data-testid="description-textarea"]', 'Casual football game');
    
    // Click create button
    await page.click('[data-testid="create-button"]');
    
    // Wait for API call
    await helpers.waitForApiCall('/api/v1/games/create');
    
    // Verify error message
    await expect(page.locator('[data-testid="error-toast"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-toast"]')).toContainText('Venue not available at this time');
  });

  test('should validate date and time constraints', async ({ page }) => {
    // Try to set past date
    await page.fill('[data-testid="date-input"]', '2020-01-01');
    await page.fill('[data-testid="time-input"]', '14:00');
    
    // Click create button
    await page.click('[data-testid="create-button"]');
    
    // Verify date validation error
    await expect(page.locator('[data-testid="date-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="date-error"]')).toContainText('Date must be in the future');
  });

  test('should validate player count constraints', async ({ page }) => {
    // Try to set invalid player count
    await page.fill('[data-testid="max-players-input"]', '1');
    
    // Click create button
    await page.click('[data-testid="create-button"]');
    
    // Verify player count validation error
    await expect(page.locator('[data-testid="max-players-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="max-players-error"]')).toContainText('Must be at least 2 players');
  });

  test('should validate price constraints', async ({ page }) => {
    // Try to set negative price
    await page.fill('[data-testid="price-input"]', '-100');
    
    // Click create button
    await page.click('[data-testid="create-button"]');
    
    // Verify price validation error
    await expect(page.locator('[data-testid="price-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="price-error"]')).toContainText('Price must be positive');
  });

  test('should cancel form and return to games', async ({ page }) => {
    // Fill some fields
    await page.selectOption('[data-testid="sport-select"]', 'Football');
    await page.fill('[data-testid="date-input"]', '2024-01-20');
    
    // Click cancel button
    await page.click('[data-testid="cancel-button"]');
    
    // Verify redirect to games list
    await expect(page).toHaveURL('/dashboard/games');
  });

  test('should load venues dynamically', async ({ page }) => {
    // Wait for venues to load
    await helpers.waitForApiCall('/api/v1/venues');
    
    // Verify venue options are populated
    const venueOptions = page.locator('[data-testid="venue-select"] option');
    await expect(venueOptions).toHaveCount(2); // Including default option
    
    // Verify venue names
    await expect(venueOptions.nth(1)).toContainText('Kathmandu Sports Complex');
  });

  test('should show loading state during creation', async ({ page }) => {
    // Mock slow create response
    await page.route('**/api/v1/games/create', async route => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, gameId: 'new-game-123' })
      });
    });

    // Fill form
    await page.selectOption('[data-testid="sport-select"]', 'Football');
    await page.selectOption('[data-testid="venue-select"]', 'Kathmandu Sports Complex');
    await page.fill('[data-testid="date-input"]', '2024-01-20');
    await page.fill('[data-testid="time-input"]', '14:00');
    await page.fill('[data-testid="duration-input"]', '90');
    await page.fill('[data-testid="max-players-input"]', '12');
    await page.fill('[data-testid="price-input"]', '500');
    await page.fill('[data-testid="description-textarea"]', 'Casual football game');
    
    // Click create button
    await page.click('[data-testid="create-button"]');
    
    // Verify loading state
    await expect(page.locator('[data-testid="create-loading"]')).toBeVisible();
    await expect(page.locator('[data-testid="create-button"]')).toBeDisabled();
    
    // Wait for completion
    await helpers.waitForApiCall('/api/v1/games/create');
    
    // Verify loading state is gone
    await expect(page.locator('[data-testid="create-loading"]')).toBeHidden();
  });

  test('should handle form reset', async ({ page }) => {
    // Fill form
    await page.selectOption('[data-testid="sport-select"]', 'Football');
    await page.fill('[data-testid="date-input"]', '2024-01-20');
    await page.fill('[data-testid="time-input"]', '14:00');
    
    // Click reset button
    await page.click('[data-testid="reset-button"]');
    
    // Verify form is reset
    await expect(page.locator('[data-testid="sport-select"]')).toHaveValue('');
    await expect(page.locator('[data-testid="date-input"]')).toHaveValue('');
    await expect(page.locator('[data-testid="time-input"]')).toHaveValue('');
  });
});
