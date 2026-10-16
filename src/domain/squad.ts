import { CLUBS_PER_LEAGUE } from "./league";
import { FIRST_NAMES, SURNAMES } from "./names";
import { createRng, deriveSeed, nextFloat, type Rng } from "./rng";

export type Position = "GK" | "DF" | "MF" | "FW";

export interface Player {
  readonly name: string;
  readonly position: Position;
  readonly age: number;
  readonly overall: number;
}

export const SQUAD_QUOTA: Readonly<Record<Position, number>> = { GK: 2, DF: 6, MF: 6, FW: 4 };
export const PLAYERS_PER_SQUAD = 18;

const NAMES_STREAM = -1;
const POSITION_ORDER: readonly Position[] = ["GK", "DF", "MF", "FW"];
const MIN_AGE = 17;
const MAX_AGE = 35;
const MIN_OVERALL = 1;
const MAX_OVERALL = 20;

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
  return positionsInOrder.map((position, slot): Player => {
    const age = drawInRange(rng, MIN_AGE, MAX_AGE);
    const overall = drawInRange(age.next, MIN_OVERALL, MAX_OVERALL);
    rng = overall.next;
    return { name: fullNameAt(clubNames[slot] as number), position, age: age.value, overall: overall.value };
  });
};
