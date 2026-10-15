import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/unit/**/*.test.ts", "tests/acceptance/**/*.test.ts", "tests/property/**/*.test.ts"],
    environment: "node",
    setupFiles: ["tests/setup/fast-check-seed.ts"],
  },
});
