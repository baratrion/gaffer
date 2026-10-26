export const DEFAULT_SEED = 20260;

const SEED_PARAM = "seed";
const SEED_GRAMMAR = /^-?\d{1,10}$/;
const INT32_MIN = -2147483648;
const INT32_MAX = 2147483647;

export const isInt32 = (n: number): boolean => n >= INT32_MIN && n <= INT32_MAX;

export const parseSeed = (search: string): number => {
  const raw = new URLSearchParams(search).get(SEED_PARAM);
  if (raw === null || !SEED_GRAMMAR.test(raw)) return DEFAULT_SEED;
  const value = Number(raw);
  return isInt32(value) ? value : DEFAULT_SEED;
};
