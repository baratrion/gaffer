import { PALETTE, SUFFIXES, TOWNS } from "./names";
import { createRng, nextFloat, type Rng } from "./rng";

export interface Club {
  readonly id: string;
  readonly name: string;
  readonly colours: readonly [string, string];
}

export interface League {
  readonly seed: number;
  readonly clubs: readonly Club[];
}

export const CLUB_COUNT = 8;

const draw = (rng: Rng, size: number): { readonly index: number; readonly next: Rng } => {
  const { value, next } = nextFloat(rng);
  return { index: Math.floor(value * size), next };
};

/** Removes and returns one item chosen by the rng (sampling without replacement). */
const take = <T>(rng: Rng, pool: readonly T[]): { readonly item: T; readonly rest: readonly T[]; readonly next: Rng } => {
  const { index, next } = draw(rng, pool.length);
  return { item: pool[index] as T, rest: pool.filter((_, i) => i !== index), next };
};

export const generateLeague = (seed: number): League => {
  let rng = createRng(seed);
  let towns = TOWNS;
  const clubs: Club[] = [];
  for (let i = 0; i < CLUB_COUNT; i += 1) {
    const town = take(rng, towns);
    const suffix = draw(town.next, SUFFIXES.length);
    const first = take(suffix.next, PALETTE);
    const second = take(first.next, first.rest);
    rng = second.next;
    towns = town.rest;
    clubs.push({
      id: `club-${i + 1}`,
      name: `${town.item} ${SUFFIXES[suffix.index] as string}`,
      colours: [first.item, second.item],
    });
  }
  return { seed, clubs };
};
