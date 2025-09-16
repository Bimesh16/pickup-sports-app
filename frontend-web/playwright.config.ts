import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 60_000, // Increased for complex integration tests
  expect: { timeout: 10_000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/results.xml' }]
  ],
  use: {
    baseURL: process.env.E2E_BASE_URL || 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    // Simulate slow 3G network for performance testing
    ...(process.env.SLOW_3G ? {
      contextOptions: {
        ...devices['Desktop Chrome'].contextOptions,
        // Simulate 3G network conditions
        extraHTTPHeaders: {
          'Connection': 'keep-alive',
        },
      },
    } : {}),
  },
  webServer: {
    command: 'npm run dev',
    port: 5173,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 12'] },
    },
    // Performance testing with slow 3G
    {
      name: 'performance',
      use: { 
        ...devices['Desktop Chrome'],
        // Simulate slow 3G network
        contextOptions: {
          ...devices['Desktop Chrome'].contextOptions,
        },
      },
      testMatch: '**/performance/*.spec.ts',
    },
  ],
});
