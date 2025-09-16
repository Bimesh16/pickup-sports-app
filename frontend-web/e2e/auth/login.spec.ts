import { test, expect } from '@playwright/test';
import { TestHelpers, mockData } from '../utils/test-helpers';

test.describe('Login Flow', () => {
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page);
    await helpers.clearStorage();
  });

  test('should login successfully with valid credentials', async ({ page }) => {
    // Mock successful login API response
    await helpers.mockApiResponse('/auth/login', {
      success: true,
      token: 'mock-jwt-token',
      user: mockData.user
    });

    await page.goto('/login');
    
    // Verify login form is visible
    await expect(page.locator('[data-testid="email-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="password-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="login-button"]')).toBeVisible();

    // Fill login form
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    
    // Click login button
    await page.click('[data-testid="login-button"]');

    // Wait for API call
    await helpers.waitForApiCall('/auth/login');

    // Verify redirect to dashboard
    await page.waitForURL('/dashboard');
    await expect(page.locator('[data-testid="dashboard-header"]')).toBeVisible();
    
    // Verify user data is stored
    const userData = await page.evaluate(() => localStorage.getItem('user'));
    expect(userData).toBeTruthy();
    
    // Verify JWT token is stored
    const token = await page.evaluate(() => localStorage.getItem('token'));
    expect(token).toBe('mock-jwt-token');
  });

  test('should show error for invalid credentials', async ({ page }) => {
    // Mock failed login API response
    await helpers.mockApiResponse('/auth/login', {
      success: false,
      error: 'Invalid credentials'
    });

    await page.goto('/login');
    
    // Fill login form with invalid credentials
    await page.fill('[data-testid="email-input"]', 'invalid@example.com');
    await page.fill('[data-testid="password-input"]', 'wrongpassword');
    
    // Click login button
    await page.click('[data-testid="login-button"]');

    // Wait for API call
    await helpers.waitForApiCall('/auth/login');

    // Verify error message is shown
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-message"]')).toContainText('Invalid credentials');
    
    // Verify still on login page
    await expect(page).toHaveURL('/login');
  });

  test('should validate required fields', async ({ page }) => {
    await page.goto('/login');
    
    // Try to submit empty form
    await page.click('[data-testid="login-button"]');
    
    // Verify validation messages
    await expect(page.locator('[data-testid="email-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="password-error"]')).toBeVisible();
  });

  test('should redirect to dashboard if already logged in', async ({ page }) => {
    // Set logged in state
    await page.evaluate(() => {
      localStorage.setItem('token', 'mock-jwt-token');
      localStorage.setItem('user', JSON.stringify(mockData.user));
    });

    await page.goto('/login');
    
    // Should redirect to dashboard
    await page.waitForURL('/dashboard');
    await expect(page.locator('[data-testid="dashboard-header"]')).toBeVisible();
  });

  test('should handle network errors gracefully', async ({ page }) => {
    // Mock network error
    await page.route('**/api/auth/login', route => {
      route.abort('Failed');
    });

    await page.goto('/login');
    
    // Fill login form
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    
    // Click login button
    await page.click('[data-testid="login-button"]');

    // Verify error handling
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-message"]')).toContainText('Network error');
  });

  test('should persist login state across page refreshes', async ({ page }) => {
    // Mock successful login
    await helpers.mockApiResponse('/auth/login', {
      success: true,
      token: 'mock-jwt-token',
      user: mockData.user
    });

    await helpers.login();
    
    // Refresh page
    await page.reload();
    
    // Verify still logged in
    await expect(page.locator('[data-testid="dashboard-header"]')).toBeVisible();
    
    // Verify user data is still there
    const userData = await page.evaluate(() => localStorage.getItem('user'));
    expect(userData).toBeTruthy();
  });

  test('should logout and clear storage', async ({ page }) => {
    // Mock logout API
    await helpers.mockApiResponse('/auth/logout', { success: true });

    await helpers.login();
    
    // Click logout
    await page.click('[data-testid="user-menu"]');
    await page.click('[data-testid="logout-button"]');
    
    // Wait for redirect
    await page.waitForURL('/login');
    
    // Verify storage is cleared
    const token = await page.evaluate(() => localStorage.getItem('token'));
    const user = await page.evaluate(() => localStorage.getItem('user'));
    expect(token).toBeNull();
    expect(user).toBeNull();
  });
});
