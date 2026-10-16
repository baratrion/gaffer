/**
 * Seeded PRNG (mulberry32), salvaged from fmw-nw/src/engine/random.ts.
 * Pure: every draw returns the value and the next state. Domain code must use this,
 * never Math.random, so matches and seasons replay identically from a seed.
 */
export interface Rng {
  readonly seed: number;
  readonly state: number;
}

export const createRng = (seed: number): Rng => ({ seed, state: seed | 0 });

export const nextFloat = (rng: Rng): { readonly value: number; readonly next: Rng } => {
  let t = (rng.state + 0x6d2b79f5) | 0;
  const nextState = t;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  const value = ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  return { value, next: { seed: rng.seed, state: nextState } };
};

/**
 * Derives an independent seed for a named stream (ADR-0005 c): one mulberry32 step
 * over the seed mixed with the stream, returned as a signed 32-bit integer.
 */
export const deriveSeed = (seed: number, stream: number): number => {
  const state = (seed ^ Math.imul(stream, 0x9e3779b9)) | 0;
  let t = (state + 0x6d2b79f5) | 0;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return (t ^ (t >>> 14)) | 0;
};
