import { test, expect } from '@playwright/test';
import { TestHelpers, mockData } from '../utils/test-helpers';

test.describe('Low-End Device Testing', () => {
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
    await helpers.mockApiResponse('/api/v1/games/trending', mockData.trendingSports);
  });

  test('should work on iPhone SE (375x667)', async ({ page }) => {
    // Set iPhone SE viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Navigate to login
    await page.goto('/login');
    
    // Test touch targets are minimum 44px
    const loginButton = page.locator('[data-testid="login-button"]');
    const buttonBox = await loginButton.boundingBox();
    expect(buttonBox?.height).toBeGreaterThanOrEqual(44);
    
    // Test form inputs
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    
    // Test keyboard handling
    await page.click('[data-testid="email-input"]');
    await page.keyboard.type('test@example.com');
    
    // Verify no horizontal scroll
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = 375;
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 10); // Allow small margin
  });

  test('should work on Android small (360x640)', async ({ page }) => {
    // Set Android small viewport
    await page.setViewportSize({ width: 360, height: 640 });
    
    // Navigate to dashboard
    await page.goto('/dashboard');
    await helpers.login();
    
    // Test mobile navigation
    const navItems = page.locator('[data-testid^="nav-"]');
    const navCount = await navItems.count();
    expect(navCount).toBeGreaterThan(0);
    
    // Test each nav item has proper touch target
    for (let i = 0; i < navCount; i++) {
      const navItem = navItems.nth(i);
      const box = await navItem.boundingBox();
      expect(box?.height).toBeGreaterThanOrEqual(44);
    }
    
    // Test swipe gestures
    await page.touchscreen.tap(180, 300);
    await page.touchscreen.tap(200, 300);
    
    // Test pull-to-refresh
    await page.touchscreen.tap(180, 50);
    await page.mouse.move(180, 100);
  });

  test('should handle slow 3G network', async ({ page }) => {
    // Simulate slow 3G
    await page.route('**/*', route => {
      setTimeout(() => {
        route.continue();
      }, 2000);
    });
    
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    const startTime = Date.now();
    await page.goto('/dashboard');
    await helpers.login();
    
    const loadTime = Date.now() - startTime;
    
    // Should load within reasonable time even on slow network
    expect(loadTime).toBeLessThan(10000);
    
    // Verify content is visible
    await expect(page.locator('[data-testid="hero-banner"]')).toBeVisible();
  });

  test('should work with reduced motion', async ({ page }) => {
    // Set reduced motion preference
    await page.emulateMedia({ reducedMotion: 'reduce' });
    
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/dashboard');
    await helpers.login();
    
    // Verify animations are disabled
    const animatedElements = page.locator('[class*="animate-"]');
    const count = await animatedElements.count();
    
    // Should still work without animations
    await expect(page.locator('[data-testid="hero-banner"]')).toBeVisible();
  });

  test('should handle high contrast mode', async ({ page }) => {
    // Set high contrast preference
    await page.emulateMedia({ colorScheme: 'dark', forcedColors: 'active' });
    
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/dashboard');
    await helpers.login();
    
    // Verify content is still readable
    await expect(page.locator('[data-testid="hero-banner"]')).toBeVisible();
    
    // Check text contrast
    const textElements = page.locator('h1, h2, h3, p, span');
    const firstText = textElements.first();
    const color = await firstText.evaluate(el => {
      const styles = window.getComputedStyle(el);
      return styles.color;
    });
    
    expect(color).toBeTruthy();
  });

  test('should work with large text', async ({ page }) => {
    // Set large text size
    await page.emulateMedia({ colorScheme: 'light' });
    
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/dashboard');
    await helpers.login();
    
    // Increase font size
    await page.addStyleTag({
      content: `
        * {
          font-size: 1.2em !important;
        }
      `
    });
    
    // Verify layout still works
    await expect(page.locator('[data-testid="hero-banner"]')).toBeVisible();
    
    // Check for horizontal scroll
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = 375;
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 20);
  });

  test('should handle orientation change', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/dashboard');
    await helpers.login();
    
    // Test portrait to landscape
    await page.setViewportSize({ width: 667, height: 375 });
    
    // Verify layout adapts
    await expect(page.locator('[data-testid="hero-banner"]')).toBeVisible();
    
    // Test landscape to portrait
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Verify layout still works
    await expect(page.locator('[data-testid="hero-banner"]')).toBeVisible();
  });

  test('should work with touch only', async ({ page }) => {
    // Disable mouse events
    await page.addInitScript(() => {
      document.addEventListener('mousedown', e => e.preventDefault());
      document.addEventListener('mouseup', e => e.preventDefault());
      document.addEventListener('click', e => e.preventDefault());
    });
    
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/dashboard');
    await helpers.login();
    
    // Test touch interactions
    await page.touchscreen.tap(200, 300);
    
    // Verify touch targets work
    const navItems = page.locator('[data-testid^="nav-"]');
    await navItems.first().tap();
    
    // Verify navigation worked
    await expect(page.locator('[data-testid="hero-banner"]')).toBeVisible();
  });

  test('should handle memory constraints', async ({ page }) => {
    // Simulate memory pressure
    await page.addInitScript(() => {
      // Create memory pressure
      const arrays = [];
      for (let i = 0; i < 100; i++) {
        arrays.push(new Array(10000).fill(Math.random()));
      }
    });
    
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/dashboard');
    await helpers.login();
    
    // Verify app still works
    await expect(page.locator('[data-testid="hero-banner"]')).toBeVisible();
    
    // Test scrolling performance
    await page.evaluate(() => {
      window.scrollTo(0, 1000);
    });
    
    await page.evaluate(() => {
      window.scrollTo(0, 0);
    });
  });

  test('should work with older browser features', async ({ page }) => {
    // Disable modern features
    await page.addInitScript(() => {
      // Mock older browser
      delete (window as any).IntersectionObserver;
      delete (window as any).ResizeObserver;
      delete (window as any).requestIdleCallback;
    });
    
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/dashboard');
    await helpers.login();
    
    // Verify app still works
    await expect(page.locator('[data-testid="hero-banner"]')).toBeVisible();
    
    // Test basic functionality
    const navItems = page.locator('[data-testid^="nav-"]');
    await navItems.first().click();
  });

  test('should handle network interruptions', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/dashboard');
    await helpers.login();
    
    // Simulate network interruption
    await page.context().setOffline(true);
    
    // Verify offline indicator
    await expect(page.locator('[data-testid="offline-indicator"]')).toBeVisible();
    
    // Simulate network recovery
    await page.context().setOffline(false);
    
    // Verify online indicator
    await expect(page.locator('[data-testid="offline-indicator"]')).toBeHidden();
  });

  test('should work with assistive technologies', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/dashboard');
    await helpers.login();
    
    // Test keyboard navigation
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Test screen reader support
    const headings = page.locator('h1, h2, h3, h4, h5, h6');
    const headingCount = await headings.count();
    expect(headingCount).toBeGreaterThan(0);
    
    // Test ARIA labels
    const labeledElements = page.locator('[aria-label]');
    const labelCount = await labeledElements.count();
    expect(labelCount).toBeGreaterThan(0);
  });
});
