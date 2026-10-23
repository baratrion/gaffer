import { CLUBS_PER_LEAGUE } from "./league";
import { FIRST_NAMES, SURNAMES } from "./names";
import { createRng, deriveSeed, nextFloat, type Rng } from "./rng";

export type Position = "GK" | "DF" | "MF" | "FW";

export const ATTRIBUTE_ORDER = ["goalkeeping", "defending", "passing", "shooting"] as const;
export type AttributeName = (typeof ATTRIBUTE_ORDER)[number];
export type Attributes = Readonly<Record<AttributeName, number>>;

export const ATTRIBUTE_LABELS: Readonly<Record<AttributeName, string>> = {
  goalkeeping: "Goalkeeping",
  defending: "Defending",
  passing: "Passing",
  shooting: "Shooting",
};

export interface Player {
  readonly name: string;
  readonly position: Position;
  readonly age: number;
  readonly overall: number;
  readonly attributes: Attributes;
  readonly condition: number;
}

/** Overall weights in tenths per position, in ATTRIBUTE_ORDER; each row sums to 10 (ADR-0006). */
export const OVERALL_WEIGHTS: Readonly<Record<Position, Attributes>> = {
  GK: { goalkeeping: 7, defending: 1, passing: 2, shooting: 0 },
  DF: { goalkeeping: 0, defending: 6, passing: 3, shooting: 1 },
  MF: { goalkeeping: 0, defending: 2, passing: 5, shooting: 3 },
  FW: { goalkeeping: 0, defending: 1, passing: 3, shooting: 6 },
};

/** Attribute offsets from a player's quality per position (ADR-0006). */
const ATTRIBUTE_OFFSETS: Readonly<Record<Position, Attributes>> = {
  GK: { goalkeeping: 2, defending: -4, passing: -5, shooting: -8 },
  DF: { goalkeeping: -10, defending: 2, passing: -2, shooting: -6 },
  MF: { goalkeeping: -10, defending: -2, passing: 2, shooting: -2 },
  FW: { goalkeeping: -10, defending: -6, passing: -2, shooting: 2 },
};

export const CONDITION_MIN = 75;
export const CONDITION_MAX = 100;
/** Stream numbers in use: -1 names, 0..7 clubs (age, quality), 100..107 attributes and condition, 200..255 matches (match.ts, ADR-0011). */
export const ATTRIBUTE_STREAM_BASE = 100;

/** Position-weighted rating, integer maths, round half up; always within the lowest and highest attribute. */
export const deriveOverall = (position: Position, attributes: Attributes): number => {
  const weights = OVERALL_WEIGHTS[position];
  const weightedSum = ATTRIBUTE_ORDER.reduce((sum, key) => sum + weights[key] * attributes[key], 0);
  return Math.floor((weightedSum + 5) / 10);
};

/** Sole constructor of Player: overall is always derived from the attributes. */
const makePlayer = (
  { name, position, age }: Pick<Player, "name" | "position" | "age">,
  attributes: Attributes,
  condition: number,
): Player => ({ name, position, age, overall: deriveOverall(position, attributes), attributes, condition });

export const SQUAD_QUOTA: Readonly<Record<Position, number>> = { GK: 2, DF: 6, MF: 6, FW: 4 };
export const PLAYERS_PER_SQUAD = 18;

const NAMES_STREAM = -1;
const POSITION_ORDER: readonly Position[] = ["GK", "DF", "MF", "FW"];
const MIN_AGE = 17;
const MAX_AGE = 35;
const MIN_QUALITY = 1;
const MAX_QUALITY = 20;
const MIN_ATTRIBUTE = 1;
const MAX_ATTRIBUTE = 20;
const MAX_NOISE = 2;

const drawInRange = (rng: Rng, min: number, max: number): { readonly value: number; readonly next: Rng } => {
  const { value, next } = nextFloat(rng);
  return { value: min + Math.floor(value * (max - min + 1)), next };
};

/** Partial Fisher-Yates over 0..poolSize-1: the first `count` entries of a seeded permutation. */
const drawDistinctIndices = (seed: number, poolSize: number, count: number): readonly number[] => {
  const indices = Array.from({ length: poolSize }, (_, index) => index);
  let rng = createRng(seed);
  for (let position = 0; position < count; position++) {
    const draw = drawInRange(rng, position, poolSize - 1);
    rng = draw.next;
    const chosen = indices[draw.value] as number;
    indices[draw.value] = indices[position] as number;
    indices[position] = chosen;
  }
  return indices.slice(0, count);
};

const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value));

/** Draws 5 values: noise for each attribute in ATTRIBUTE_ORDER, then condition. Always 5, even when clamped. */
const drawAttributesAndCondition = (
  rng: Rng,
  position: Position,
  quality: number,
): { readonly attributes: Attributes; readonly condition: number; readonly next: Rng } => {
  let current = rng;
  const offsets = ATTRIBUTE_OFFSETS[position];
  const levels = ATTRIBUTE_ORDER.map((key) => {
    const noise = drawInRange(current, -MAX_NOISE, MAX_NOISE);
    current = noise.next;
    return [key, clamp(quality + offsets[key] + noise.value, MIN_ATTRIBUTE, MAX_ATTRIBUTE)] as const;
  });
  const condition = drawInRange(current, CONDITION_MIN, CONDITION_MAX);
  return { attributes: Object.fromEntries(levels) as Attributes, condition: condition.value, next: condition.next };
};

const fullNameAt = (poolIndex: number): string =>
  `${FIRST_NAMES[Math.floor(poolIndex / SURNAMES.length)]} ${SURNAMES[poolIndex % SURNAMES.length]}`;

const positionsInOrder: readonly Position[] = POSITION_ORDER.flatMap((position) =>
  Array.from({ length: SQUAD_QUOTA[position] }, () => position),
);

const assertValidClubIndex = (clubIndex: number): void => {
  if (!Number.isInteger(clubIndex) || clubIndex < 0 || clubIndex >= CLUBS_PER_LEAGUE) {
    throw new RangeError(`clubIndex must be an integer in 0..${CLUBS_PER_LEAGUE - 1}, got ${clubIndex}`);
  }
};

export const generateSquad = (seed: number, clubIndex: number): readonly Player[] => {
  assertValidClubIndex(clubIndex);
  const poolSize = FIRST_NAMES.length * SURNAMES.length;
  const leagueNames = drawDistinctIndices(
    deriveSeed(seed, NAMES_STREAM),
    poolSize,
    CLUBS_PER_LEAGUE * PLAYERS_PER_SQUAD,
  );
  const clubNames = leagueNames.slice(clubIndex * PLAYERS_PER_SQUAD, (clubIndex + 1) * PLAYERS_PER_SQUAD);

  let rng = createRng(deriveSeed(seed, clubIndex));
  let attributeRng = createRng(deriveSeed(seed, ATTRIBUTE_STREAM_BASE + clubIndex));
  return positionsInOrder.map((position, slot): Player => {
    const age = drawInRange(rng, MIN_AGE, MAX_AGE);
    const quality = drawInRange(age.next, MIN_QUALITY, MAX_QUALITY);
    rng = quality.next;
    const drawn = drawAttributesAndCondition(attributeRng, position, quality.value);
    attributeRng = drawn.next;
    return makePlayer(
      { name: fullNameAt(clubNames[slot] as number), position, age: age.value },
      drawn.attributes,
      drawn.condition,
    );
  });
};
