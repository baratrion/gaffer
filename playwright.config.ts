import { defineConfig, devices } from "@playwright/test";

// BASE_URL lets the same specs run against the deployed GitHub Pages site (post-deploy smoke).
const baseURL = process.env.BASE_URL ?? "http://localhost:4173/gaffer/";
const external = Boolean(process.env.BASE_URL);

export default defineConfig({
  timeout: 30_000,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["list"], ["json", { outputFile: "test-results/playwright.json" }]] : "list",
  use: { baseURL, ...devices["Pixel 7"], trace: "retain-on-failure", screenshot: "only-on-failure" },
  projects: [
    { name: "e2e", testDir: "tests/e2e" },
    // Owner-authored, black-box story scenarios. The factory may read but never edit them.
    { name: "protected", testDir: "tests/protected" },
  ],
  ...(external
    ? {}
    : { webServer: { command: "pnpm build && pnpm preview", url: baseURL, reuseExistingServer: !process.env.CI } }),
});
