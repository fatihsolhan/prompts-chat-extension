import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "e2e",

  forbidOnly: !!process.env.CI,

  retries: process.env.CI ? 2 : 0,

  workers: 4,

  // Reporter to use
  reporter: "html",

  use: {
    // Collect trace when retrying the failed test.
    trace: "on-first-retry"
  },

  // Configure projects for major browsers.
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    }
  ],
});
