import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  workers: 1,
  retries: 1,
  reporter: [['html', { open: 'never' }]],
  outputDir: 'test-results',
  use: {
    baseURL: 'http://localhost:5173',
    browserName: 'chromium',
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
  },
})
