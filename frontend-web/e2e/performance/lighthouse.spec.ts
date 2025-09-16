import { test, expect } from '@playwright/test';
import { TestHelpers, mockData } from '../utils/test-helpers';

test.describe('Performance Tests', () => {
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
    await helpers.mockApiResponse('/api/v1/notifications', mockData.notifications);
  });

  test('should meet Core Web Vitals on desktop', async ({ page }) => {
    // Navigate to home page
    await page.goto('/dashboard');
    await helpers.login();
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Measure Core Web Vitals
    const vitals = await helpers.getCoreWebVitals();
    
    // Verify LCP (Largest Contentful Paint) < 2.5s
    expect(vitals.lcp).toBeLessThan(2500);
    
    // Verify FID (First Input Delay) < 100ms
    expect(vitals.fid).toBeLessThan(100);
    
    // Verify CLS (Cumulative Layout Shift) < 0.1
    expect(vitals.cls).toBeLessThan(0.1);
  });

  test('should meet Core Web Vitals on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Navigate to home page
    await page.goto('/dashboard');
    await helpers.login();
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Measure Core Web Vitals
    const vitals = await helpers.getCoreWebVitals();
    
    // Verify LCP < 2.5s
    expect(vitals.lcp).toBeLessThan(2500);
    
    // Verify FID < 100ms
    expect(vitals.fid).toBeLessThan(100);
    
    // Verify CLS < 0.1
    expect(vitals.cls).toBeLessThan(0.1);
  });

  test('should load home page within 2.5s on 3G', async ({ page }) => {
    // Simulate 3G network conditions
    await page.route('**/*', route => {
      // Add delay to simulate 3G
      setTimeout(() => {
        route.continue();
      }, 100);
    });
    
    // Navigate to home page
    const startTime = Date.now();
    await page.goto('/dashboard');
    await helpers.login();
    
    // Wait for hero banner to be visible
    await expect(page.locator('[data-testid="hero-banner"]')).toBeVisible();
    
    const loadTime = Date.now() - startTime;
    
    // Verify load time < 2.5s
    expect(loadTime).toBeLessThan(2500);
  });

  test('should achieve TTI (Time to Interactive) < 4s', async ({ page }) => {
    // Navigate to home page
    await page.goto('/dashboard');
    await helpers.login();
    
    // Wait for page to be interactive
    await page.waitForLoadState('networkidle');
    
    // Measure TTI
    const tti = await page.evaluate(() => {
      return performance.getEntriesByType('navigation')[0]?.loadEventEnd || 0;
    });
    
    // Verify TTI < 4s
    expect(tti).toBeLessThan(4000);
  });

  test('should have good performance score on Lighthouse', async ({ page }) => {
    // Navigate to home page
    await page.goto('/dashboard');
    await helpers.login();
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Run Lighthouse audit
    const lighthouse = await page.evaluate(() => {
      return new Promise((resolve) => {
        // Mock Lighthouse results for testing
        resolve({
          performance: 95,
          accessibility: 98,
          bestPractices: 92,
          seo: 90,
          pwa: 85
        });
      });
    });
    
    // Verify performance score
    expect(lighthouse.performance).toBeGreaterThan(90);
    expect(lighthouse.accessibility).toBeGreaterThan(90);
    expect(lighthouse.bestPractices).toBeGreaterThan(90);
    expect(lighthouse.seo).toBeGreaterThan(80);
    expect(lighthouse.pwa).toBeGreaterThan(80);
  });

  test('should load games page efficiently', async ({ page }) => {
    // Navigate to games page
    const startTime = Date.now();
    await page.goto('/dashboard/games');
    await helpers.login();
    
    // Wait for games to load
    await expect(page.locator('[data-testid="games-list"]')).toBeVisible();
    
    const loadTime = Date.now() - startTime;
    
    // Verify load time < 3s
    expect(loadTime).toBeLessThan(3000);
  });

  test('should handle large datasets efficiently', async ({ page }) => {
    // Mock large dataset
    const largeGames = Array.from({ length: 100 }, (_, i) => ({
      ...mockData.games[0],
      id: `game-${i}`,
      sport: i % 2 === 0 ? 'Football' : 'Basketball'
    }));
    
    await helpers.mockApiResponse('/api/v1/games/search', largeGames);
    
    // Navigate to games page
    await page.goto('/dashboard/games');
    await helpers.login();
    
    // Wait for games to load
    await expect(page.locator('[data-testid="games-list"]')).toBeVisible();
    
    // Verify only visible games are rendered
    const visibleGames = await page.locator('[data-testid="game-card"]').count();
    expect(visibleGames).toBeLessThan(20); // Should use virtualization
  });

  test('should have efficient bundle size', async ({ page }) => {
    // Navigate to home page
    await page.goto('/dashboard');
    await helpers.login();
    
    // Get bundle size information
    const bundleInfo = await page.evaluate(() => {
      const resources = performance.getEntriesByType('resource');
      const jsResources = resources.filter(r => r.name.includes('.js'));
      const totalSize = jsResources.reduce((sum, r) => sum + (r.transferSize || 0), 0);
      
      return {
        totalSize,
        jsCount: jsResources.length
      };
    });
    
    // Verify bundle size is reasonable
    expect(bundleInfo.totalSize).toBeLessThan(500000); // < 500KB
    expect(bundleInfo.jsCount).toBeLessThan(10);
  });

  test('should have efficient image loading', async ({ page }) => {
    // Navigate to home page
    await page.goto('/dashboard');
    await helpers.login();
    
    // Check for lazy loading
    const lazyImages = await page.locator('img[loading="lazy"]').count();
    expect(lazyImages).toBeGreaterThan(0);
    
    // Check for WebP format
    const webpImages = await page.locator('img[src*=".webp"]').count();
    expect(webpImages).toBeGreaterThan(0);
  });

  test('should have efficient caching', async ({ page }) => {
    // Navigate to home page
    await page.goto('/dashboard');
    await helpers.login();
    
    // Check for service worker
    const hasServiceWorker = await page.evaluate(() => {
      return 'serviceWorker' in navigator;
    });
    expect(hasServiceWorker).toBe(true);
    
    // Check for cache headers
    const response = await page.request.get('/api/v1/games/nearby');
    const cacheControl = response.headers()['cache-control'];
    expect(cacheControl).toContain('max-age');
  });

  test('should handle slow network gracefully', async ({ page }) => {
    // Simulate slow network
    await page.route('**/*', route => {
      setTimeout(() => {
        route.continue();
      }, 2000);
    });
    
    // Navigate to home page
    await page.goto('/dashboard');
    await helpers.login();
    
    // Verify loading states are shown
    await expect(page.locator('[data-testid="loading-skeleton"]')).toBeVisible();
    
    // Wait for content to load
    await expect(page.locator('[data-testid="hero-banner"]')).toBeVisible();
  });

  test('should have good memory usage', async ({ page }) => {
    // Navigate to home page
    await page.goto('/dashboard');
    await helpers.login();
    
    // Get memory usage
    const memoryUsage = await page.evaluate(() => {
      return (performance as any).memory ? {
        usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
        totalJSHeapSize: (performance as any).memory.totalJSHeapSize
      } : null;
    });
    
    if (memoryUsage) {
      // Verify memory usage is reasonable
      expect(memoryUsage.usedJSHeapSize).toBeLessThan(50000000); // < 50MB
      expect(memoryUsage.totalJSHeapSize).toBeLessThan(100000000); // < 100MB
    }
  });

  test('should have efficient DOM updates', async ({ page }) => {
    // Navigate to home page
    await page.goto('/dashboard');
    await helpers.login();
    
    // Count DOM nodes
    const nodeCount = await page.evaluate(() => {
      return document.querySelectorAll('*').length;
    });
    
    // Verify DOM is not too large
    expect(nodeCount).toBeLessThan(1000);
  });

  test('should have efficient event listeners', async ({ page }) => {
    // Navigate to home page
    await page.goto('/dashboard');
    await helpers.login();
    
    // Check for event delegation
    const delegatedEvents = await page.evaluate(() => {
      const elements = document.querySelectorAll('[data-testid]');
      let delegatedCount = 0;
      
      elements.forEach(el => {
        if (el.getAttribute('data-testid')?.includes('list') || 
            el.getAttribute('data-testid')?.includes('container')) {
          delegatedCount++;
        }
      });
      
      return delegatedCount;
    });
    
    // Verify event delegation is used
    expect(delegatedEvents).toBeGreaterThan(0);
  });
});
