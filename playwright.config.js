// @ts-check
const { defineConfig, devices } = require("@playwright/test");

module.exports = defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  /* Enhanced reporter configuration for Docker */
  reporter: [
    [
      "html",
      {
        outputFolder: "playwright-report",
        open: process.env.CI ? "never" : "on-failure",
      },
    ],
    ["json", { outputFile: "test-results/results.json" }],
    ["junit", { outputFile: "test-results/results.xml" }],
    ["list"], // Better for Docker console output
  ],

  /* Output directory for test artifacts */
  outputDir: "test-results",

  use: {
    /* Base URL for your application */
    baseURL: process.env.BASE_URL || "http://localhost:3000",

    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",

    /* Timeouts */
    actionTimeout: 30000,
    navigationTimeout: 30000,
    timeout: 60000,

    /* Browser context options */
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        // Docker-specific Chrome args for CI
        launchOptions: {
          args: process.env.CI
            ? [
                "--no-sandbox",
                "--disable-setuid-sandbox",
                "--disable-dev-shm-usage",
                "--disable-gpu",
              ]
            : [],
        },
      },
    },

    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },

    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },

    /* Mobile testing */
    {
      name: "mobile-chrome",
      use: {
        ...devices["Pixel 5"],
        launchOptions: {
          args: process.env.CI
            ? ["--no-sandbox", "--disable-setuid-sandbox"]
            : [],
        },
      },
    },

    {
      name: "mobile-safari",
      use: { ...devices["iPhone 12"] },
    },
  ],

  /* Global test timeout */
  timeout: 30000,
  expect: {
    timeout: 10000,
  },

  /* Uncomment to run your local dev server before starting tests */
  // webServer: {
  //   command: "npm run start",
  //   url: "http://localhost:3000",
  //   reuseExistingServer: !process.env.CI,
  //   timeout: 120000,
  // },
});
