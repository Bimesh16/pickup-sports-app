import { test, expect } from '@playwright/test';
import { TestHelpers, mockData } from '../utils/test-helpers';

test.describe('Settings Management', () => {
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page);
    
    // Mock API responses
    await helpers.mockApiResponse('/auth/login', {
      success: true,
      token: 'mock-jwt-token',
      user: mockData.user
    });
    
    await helpers.mockApiResponse('/api/v1/notifications/preferences', { success: true });
    await helpers.mockApiResponse('/api/v1/settings', { success: true });
    await helpers.mockApiResponse('/api/v1/data/download', { success: true });
    await helpers.mockApiResponse('/api/v1/account/delete', { success: true });

    await helpers.login();
    await helpers.navigateToTab('settings');
  });

  test('should load settings page with all sections', async ({ page }) => {
    // Verify settings sections
    await expect(page.locator('[data-testid="notification-preferences"]')).toBeVisible();
    await expect(page.locator('[data-testid="app-settings"]')).toBeVisible();
    await expect(page.locator('[data-testid="privacy-data"]')).toBeVisible();
    await expect(page.locator('[data-testid="invite-friends"]')).toBeVisible();
  });

  test('should update notification preferences', async ({ page }) => {
    // Toggle invite notifications
    await page.click('[data-testid="toggle-invites"]');
    
    // Wait for API call
    await helpers.waitForApiCall('/api/v1/notifications/preferences');
    
    // Verify toggle state
    await expect(page.locator('[data-testid="toggle-invites"]')).toBeChecked();
    
    // Verify success message
    await expect(page.locator('[data-testid="success-toast"]')).toBeVisible();
    
    // Toggle reminder notifications
    await page.click('[data-testid="toggle-reminders"]');
    
    // Wait for API call
    await helpers.waitForApiCall('/api/v1/notifications/preferences');
    
    // Verify toggle state
    await expect(page.locator('[data-testid="toggle-reminders"]')).toBeChecked();
  });

  test('should update app settings', async ({ page }) => {
    // Change language
    await page.selectOption('[data-testid="language-select"]', 'Nepali');
    
    // Wait for API call
    await helpers.waitForApiCall('/api/v1/settings');
    
    // Verify language is changed
    await expect(page.locator('[data-testid="language-select"]')).toHaveValue('Nepali');
    
    // Toggle push notifications
    await page.click('[data-testid="toggle-push-notifications"]');
    
    // Wait for API call
    await helpers.waitForApiCall('/api/v1/settings');
    
    // Verify toggle state
    await expect(page.locator('[data-testid="toggle-push-notifications"]')).toBeChecked();
  });

  test('should toggle theme', async ({ page }) => {
    // Click dark theme button
    await page.click('[data-testid="theme-dark"]');
    
    // Wait for API call
    await helpers.waitForApiCall('/api/v1/settings');
    
    // Verify theme is applied
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    
    // Click light theme button
    await page.click('[data-testid="theme-light"]');
    
    // Wait for API call
    await helpers.waitForApiCall('/api/v1/settings');
    
    // Verify theme is applied
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  });

  test('should download user data', async ({ page }) => {
    // Mock file download
    await page.route('**/api/v1/data/download', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: 'user data' })
      });
    });

    // Click download data button
    await page.click('[data-testid="download-data-button"]');
    
    // Wait for API call
    await helpers.waitForApiCall('/api/v1/data/download');
    
    // Verify success message
    await expect(page.locator('[data-testid="success-toast"]')).toBeVisible();
    await expect(page.locator('[data-testid="success-toast"]')).toContainText('Your data has been downloaded!');
  });

  test('should handle delete account', async ({ page }) => {
    // Mock confirmation dialog
    page.on('dialog', dialog => dialog.accept());
    
    // Click delete account button
    await page.click('[data-testid="delete-account-button"]');
    
    // Wait for API call
    await helpers.waitForApiCall('/api/v1/account/delete');
    
    // Verify success message
    await expect(page.locator('[data-testid="success-toast"]')).toBeVisible();
    await expect(page.locator('[data-testid="success-toast"]')).toContainText('Account deleted successfully!');
  });

  test('should copy invite link', async ({ page }) => {
    // Mock clipboard API
    await page.evaluate(() => {
      navigator.clipboard.writeText = jest.fn();
    });
    
    // Click copy invite button
    await page.click('[data-testid="copy-invite-button"]');
    
    // Verify success message
    await expect(page.locator('[data-testid="success-toast"]')).toBeVisible();
    await expect(page.locator('[data-testid="success-toast"]')).toContainText('Invite link copied to clipboard!');
  });

  test('should share invite link', async ({ page }) => {
    // Mock share API
    await page.evaluate(() => {
      navigator.share = jest.fn().mockResolvedValue(undefined);
    });
    
    // Click share invite button
    await page.click('[data-testid="share-invite-button"]');
    
    // Verify success message
    await expect(page.locator('[data-testid="success-toast"]')).toBeVisible();
    await expect(page.locator('[data-testid="success-toast"]')).toContainText('Invite shared successfully!');
  });

  test('should handle share API not supported', async ({ page }) => {
    // Mock share API not supported
    await page.evaluate(() => {
      navigator.share = undefined;
    });
    
    // Click share invite button
    await page.click('[data-testid="share-invite-button"]');
    
    // Verify fallback message
    await expect(page.locator('[data-testid="info-toast"]')).toBeVisible();
    await expect(page.locator('[data-testid="info-toast"]')).toContainText('Web Share API not supported');
  });

  test('should handle API errors gracefully', async ({ page }) => {
    // Mock API error
    await page.route('**/api/v1/notifications/preferences', route => {
      route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Invalid preferences' })
      });
    });

    // Toggle invite notifications
    await page.click('[data-testid="toggle-invites"]');
    
    // Wait for API call
    await helpers.waitForApiCall('/api/v1/notifications/preferences');
    
    // Verify error message
    await expect(page.locator('[data-testid="error-toast"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-toast"]')).toContainText('Invalid preferences');
    
    // Verify toggle is reverted
    await expect(page.locator('[data-testid="toggle-invites"]')).not.toBeChecked();
  });

  test('should show loading states during updates', async ({ page }) => {
    // Mock slow API response
    await page.route('**/api/v1/notifications/preferences', async route => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true })
      });
    });

    // Toggle invite notifications
    await page.click('[data-testid="toggle-invites"]');
    
    // Verify loading state
    await expect(page.locator('[data-testid="toggle-invites-loading"]')).toBeVisible();
    
    // Wait for completion
    await helpers.waitForApiCall('/api/v1/notifications/preferences');
    
    // Verify loading state is gone
    await expect(page.locator('[data-testid="toggle-invites-loading"]')).toBeHidden();
  });

  test('should persist settings across page refreshes', async ({ page }) => {
    // Change language
    await page.selectOption('[data-testid="language-select"]', 'Nepali');
    
    // Wait for API call
    await helpers.waitForApiCall('/api/v1/settings');
    
    // Refresh page
    await page.reload();
    
    // Verify language is still set
    await expect(page.locator('[data-testid="language-select"]')).toHaveValue('Nepali');
  });

  test('should show quick actions', async ({ page }) => {
    // Verify quick action buttons
    await expect(page.locator('[data-testid="quick-action-advanced-settings"]')).toBeVisible();
    await expect(page.locator('[data-testid="quick-action-notification-preferences"]')).toBeVisible();
    await expect(page.locator('[data-testid="quick-action-how-you-play"]')).toBeVisible();
  });

  test('should navigate to quick actions', async ({ page }) => {
    // Click notification preferences quick action
    await page.click('[data-testid="quick-action-notification-preferences"]');
    
    // Verify navigation to notification preferences section
    await expect(page.locator('[data-testid="notification-preferences"]')).toBeVisible();
  });

  test('should show invite link with correct format', async ({ page }) => {
    // Verify invite link format
    const inviteLink = page.locator('[data-testid="invite-link-input"]');
    await expect(inviteLink).toHaveValue(/https:\/\/pickup\.sports\/invite\/\w+/);
  });

  test('should handle download data error', async ({ page }) => {
    // Mock download error
    await page.route('**/api/v1/data/download', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Download failed' })
      });
    });

    // Click download data button
    await page.click('[data-testid="download-data-button"]');
    
    // Wait for API call
    await helpers.waitForApiCall('/api/v1/data/download');
    
    // Verify error message
    await expect(page.locator('[data-testid="error-toast"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-toast"]')).toContainText('Download failed');
  });

  test('should handle delete account error', async ({ page }) => {
    // Mock delete account error
    await page.route('**/api/v1/account/delete', route => {
      route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Cannot delete account' })
      });
    });

    // Mock confirmation dialog
    page.on('dialog', dialog => dialog.accept());
    
    // Click delete account button
    await page.click('[data-testid="delete-account-button"]');
    
    // Wait for API call
    await helpers.waitForApiCall('/api/v1/account/delete');
    
    // Verify error message
    await expect(page.locator('[data-testid="error-toast"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-toast"]')).toContainText('Cannot delete account');
  });
});
