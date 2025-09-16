import { test, expect } from '@playwright/test';

test('Defense Key generator creates strong compliant password', async ({ page }) => {
  await page.goto('/');

  // Step 1 is default
  const gen = page.getByText('Generate strong key');
  await gen.click();

  // Read the password input
  const input = page.getByLabel(/Defense key password/i);
  const value = await input.inputValue();

  // Validate rules: >=12 chars, has upper, lower, number, symbol
  expect(value.length).toBeGreaterThanOrEqual(12);
  expect(/[A-Z]/.test(value)).toBeTruthy();
  expect(/[a-z]/.test(value)).toBeTruthy();
  expect(/[0-9]/.test(value)).toBeTruthy();
  expect(/[!@#$%^&*()_+\[\]{}<>?]/.test(value)).toBeTruthy();
});

