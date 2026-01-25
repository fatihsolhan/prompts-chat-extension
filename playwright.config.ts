import { defineConfig } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        channel: 'chrome',
        launchOptions: {
          args: [
            `--disable-extensions-except=${path.join(__dirname, '.output/chrome-mv3')}`,
            `--load-extension=${path.join(__dirname, '.output/chrome-mv3')}`,
          ],
        },
      },
    },
  ],
});
