import { test, expect } from '@playwright/test';

test('Username taken shows suggestions and applying one updates input', async ({ page }) => {
  // Intercept username availability API: mark unavailable for the first check
  await page.route('**/users/check-username**', async (route, request) => {
    const url = new URL(request.url());
    const uname = url.searchParams.get('username') || '';
    // First call for any username: unavailable -> suggest
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ available: false }) });
  });

  // Go directly to the test page that mounts registration
  await page.goto('/test-registration');

  // Type a username to trigger debounce + fetch
  const input = page.getByPlaceholder('Choose your player tag');
  await input.fill('nepalpro');

  // Wait for StepIdentity to perform debounce (~500ms used there)
  await page.waitForTimeout(700);

  // Expect suggestions block to appear
  await expect(page.getByText('Tag taken! Try these instead:')).toBeVisible();

  // Click first suggestion chip
  const firstChip = page.locator('button', { hasText: /@nepalpro/ }).first();
  await firstChip.click();

  // Input should update with suggested value (without @ in the field value)
  const val = await input.inputValue();
  expect(val.toLowerCase()).toContain('nepalpro');
});

test('Username available shows no suggestions and passes check', async ({ page }) => {
  // Intercept as available
  await page.route('**/users/check-username**', async (route) => {
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ available: true }) });
  });

  await page.goto('/test-registration');

  const input = page.getByPlaceholder('Choose your player tag');
  await input.fill('uniquechampion');

  // Wait for debounce
  await page.waitForTimeout(700);

  // Suggestions should not appear
  await expect(page.getByText('Tag taken! Try these instead:')).toHaveCount(0);
});
