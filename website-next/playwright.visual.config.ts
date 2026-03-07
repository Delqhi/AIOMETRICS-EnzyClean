import { defineConfig, devices } from "@playwright/test";

const HOST = "127.0.0.1";
const PORT = 4173;
const BASE_URL = `http://${HOST}:${PORT}`;

export default defineConfig({
  testDir: "./tests/visual",
  timeout: 60_000,
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  outputDir: "test-results/visual",
  reporter: [
    ["line"],
    ["html", { outputFolder: "playwright-report-visual", open: "never" }]
  ],
  expect: {
    timeout: 10_000,
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.003
    }
  },
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? BASE_URL,
    trace: "retain-on-failure",
    video: "off",
    screenshot: "only-on-failure",
    locale: "en-US",
    timezoneId: "UTC"
  },
  snapshotPathTemplate: "{testDir}/__screenshots__/{projectName}/{arg}{ext}",
  projects: [
    {
      name: "desktop-chromium",
      use: {
        ...devices["Desktop Chrome"],
        browserName: "chromium",
        viewport: { width: 1440, height: 2400 }
      }
    },
    {
      name: "mobile-chromium",
      use: {
        ...devices["iPhone 14"],
        browserName: "chromium"
      }
    }
  ]
});
