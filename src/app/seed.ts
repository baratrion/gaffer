export const DEFAULT_SEED = 1966;

const SEED_PATTERN = /^-?\d{1,10}$/;

/** Reads `?seed=<int32>`; anything else (missing, empty, fractional, out of range) is the default. */
export const parseSeed = (search: string): number => {
  const raw = new URLSearchParams(search).get("seed");
  if (raw === null || !SEED_PATTERN.test(raw)) return DEFAULT_SEED;
  const value = Number(raw);
  return value >= -2147483648 && value <= 2147483647 ? value : DEFAULT_SEED;
};
