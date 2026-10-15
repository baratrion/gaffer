import { defineConfig, devices } from "@playwright/test";

// Agent-owned e2e config. BASE_URL lets the same specs smoke-test the deployed GitHub Pages site.
// (Protected story scenarios use the locked scripts/factory/protected.playwright.config.ts instead.)
const baseURL = process.env.BASE_URL ?? "http://localhost:4173/gaffer/";

export default defineConfig({
  testDir: "tests/e2e",
  timeout: 30_000,
  retries: process.env.CI ? 1 : 0,
  reporter: "list",
  use: { baseURL, ...devices["Pixel 7"], viewport: { width: 390, height: 844 }, trace: "retain-on-failure", screenshot: "only-on-failure" },
  ...(process.env.BASE_URL
    ? {}
    : { webServer: { command: "pnpm run ci:serve", url: baseURL, reuseExistingServer: !process.env.CI } }),
});
