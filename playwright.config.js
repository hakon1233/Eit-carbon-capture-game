import { defineConfig, devices } from '@playwright/test'

// Vite serves under the configured `base` even in dev mode.
const BASE_PATH = '/Eit-carbon-capture-game/'
const PORT = 5179
const ORIGIN = `http://localhost:${PORT}`

export default defineConfig({
  testDir: './tests/e2e',
  // Headless, unattended CI-style run for the Quality Loop browser QA pass.
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
  ],
  use: {
    baseURL: `${ORIGIN}${BASE_PATH}`,
    headless: true,
    // Retain heavy artifacts only for failures. Recording traces/screenshots for
    // every passing test has caused intermittent shared-output finalization
    // failures unrelated to the app under test.
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: `npx vite --port ${PORT}`,
    url: `${ORIGIN}${BASE_PATH}`,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
})
