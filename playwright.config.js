// @ts-check
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['junit', { outputFile: 'test-results/results.xml' }]
  ],
  
  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'basketball-reference-chromium',
      testDir: './tests/e2e/Basketball-Reference',
      use: { 
        ...devices['Desktop Chrome'],
        timeout: 60000,
      },
    },
    
    {
      name: 'basketball-reference-firefox',
      testDir: './tests/e2e/Basketball-Reference',
      use: { 
        ...devices['Desktop Firefox'],
        timeout: 60000,
      },
    },

    {
      name: 'basketball-reference-webkit',
      testDir: './tests/e2e/Basketball-Reference',
      use: { 
        ...devices['Desktop Safari'],
        timeout: 60000,
      },
    },
  ],
});