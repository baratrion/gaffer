// LOCKED runner for owner-trusted story scenarios. The agent owns playwright.config.ts; it does not own this.
// Contract: the project's `ci:serve` script serves the production build at http://localhost:4173/gaffer/.
import { defineConfig, devices } from "@playwright/test";

const baseURL = process.env.BASE_URL ?? "http://localhost:4173/gaffer/";
const pm = process.env.PM ?? "pnpm";

export default defineConfig({
  testDir: "../../tests/protected",
  // Status check, not a debugging run: a scenario for an unbuilt screen should fail in seconds, not minutes.
  timeout: 20_000,
  expect: { timeout: 2_000 },
  retries: 0,
  workers: 4,
  use: { baseURL, ...devices["Pixel 7"], actionTimeout: 2_000, navigationTimeout: 10_000, trace: "off" },
  projects: [{ name: "protected" }],
  ...(process.env.BASE_URL
    ? {}
    : { webServer: { command: `${pm} run ci:serve`, url: baseURL, reuseExistingServer: !process.env.CI, timeout: 180_000 } }),
});
