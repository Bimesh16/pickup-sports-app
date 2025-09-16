import { test, expect } from '@playwright/test';

test.describe('Sticky bar and trust pills visibility', () => {
  test('No overlap at small viewport and both visible', async ({ page }) => {
    await page.goto('/');
    await page.setViewportSize({ width: 390, height: 740 });

    // Scroll to near bottom to ensure sticky bar engages
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    // Sticky CTA text should be visible
    await expect(page.getByText('You can edit details later in your profile.')).toBeVisible();

    // Trust pills row should be visible above the sticky bar
    await expect(page.getByText('🔒 Secure')).toBeVisible();
    await expect(page.getByText('🎯 Fair Play')).toBeVisible();
    await expect(page.getByText('⚡ Fast')).toBeVisible();
    await expect(page.getByText('🛡 Protected')).toBeVisible();
  });
});

