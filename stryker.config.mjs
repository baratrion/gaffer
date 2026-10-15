/** @type {import('@stryker-mutator/api/core').PartialStrykerOptions} */
export default {
  testRunner: "vitest",
  mutate: ["src/domain/**/*.ts"],
  reporters: ["clear-text", "progress"],
  // Ratchet: the owner raises this as the domain grows (70 -> 80). The factory cannot edit this file.
  thresholds: { high: 85, low: 70, break: 70 },
};
