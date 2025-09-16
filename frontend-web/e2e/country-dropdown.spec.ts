// Playwright e2e - Country dropdown keyboard navigation (unit-less)
// Usage (if Playwright is installed):
//   npx playwright test frontend-web/e2e/country-dropdown.spec.ts --ui

import { test, expect } from '@playwright/test';

test.describe('Country dropdown keyboard navigation', () => {
  test('Arrow keys move active option and Enter selects', async ({ page }) => {
    // Assumes an environment route that renders UnifiedJoinTheLeague
    // Adjust URL to your app route
    await page.goto('/');

    // Navigate to Step 2 if needed
    await page.getByText('Next Step').click({ timeout: 10000 });

    // Open country dropdown
    const openBtn = page.getByTestId('country-selector-button');
    await openBtn.click();

    const dropdown = page.getByTestId('country-dropdown');
    await expect(dropdown).toBeVisible();

    const search = page.getByTestId('country-search');
    await search.fill('nep');

    // Debounce allowance (260ms)
    await page.waitForTimeout(300);

    // ArrowDown to first item
    await search.press('ArrowDown');
    // Expect first option highlighted (aria-selected=true)
    const first = await dropdown.locator('[data-testid^="country-option-"]').first();
    await expect(first).toHaveAttribute('aria-selected', 'true');

    // Move down and up
    await search.press('ArrowDown');
    await search.press('ArrowUp');

    // Enter selects current active item; dropdown closes
    await search.press('Enter');
    await expect(dropdown).toBeHidden();

    // Optional: validate selector button text contains code e.g. (+977)
    const buttonText = await openBtn.textContent();
    expect(buttonText || '').toMatch(/\(\+\d+\)/);
  });
});

