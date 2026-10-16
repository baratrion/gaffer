/** @type {import('@stryker-mutator/api/core').PartialStrykerOptions} */
export default {
  testRunner: "vitest",
  // pnpm's strict node_modules hides the runner from Stryker's plugin auto-discovery; load it explicitly.
  plugins: ["@stryker-mutator/vitest-runner"],
  // names.ts is plain word lists with no logic: its string-literal mutants measure nothing.
  mutate: ["src/domain/**/*.ts", "!src/domain/names.ts"],
  reporters: ["clear-text", "progress"],
  // Ratchet: the owner raises this as the domain grows (70 -> 80). The factory cannot edit this file.
  thresholds: { high: 85, low: 70, break: 70 },
};
