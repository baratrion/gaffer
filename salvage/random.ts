/**
 * Seeded PRNG using the mulberry32 algorithm.
 *
 * Pure functions only -- nextRandom returns a new RNG state
 * without mutating the input.
 */

import type { SeededRNG } from "../types";

/**
 * Create a seeded RNG from an initial seed value.
 */
export const createRNG = (seed: number): SeededRNG => ({
  seed,
  state: seed,
});

/**
 * Produce the next random value in [0, 1) and a new RNG state.
 *
 * Uses the mulberry32 algorithm -- a fast 32-bit PRNG with
 * good statistical properties for game simulation.
 */
export const nextRandom = (
  rng: SeededRNG,
): { readonly value: number; readonly nextRng: SeededRNG } => {
  // Advance state by one step
  let t = (rng.state + 0x6d2b79f5) | 0;
  const nextState = t;

  // Mix bits (mulberry32 mixing function)
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  const value = ((t ^ (t >>> 14)) >>> 0) / 4294967296;

  return {
    value,
    nextRng: {
      seed: rng.seed,
      state: nextState,
    },
  };
};
