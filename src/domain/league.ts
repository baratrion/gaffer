import { CLUB_SUFFIXES, COLOUR_PALETTE, TOWNS } from "./names";
import { createRng, nextFloat, type Rng } from "./rng";

export type Colour = (typeof COLOUR_PALETTE)[number];

export interface Club {
  readonly id: string;
  readonly name: string;
  readonly colours: readonly [Colour, Colour];
}

export interface League {
  readonly seed: number;
  readonly clubs: readonly Club[];
}

export const CLUBS_PER_LEAGUE = 8;

interface Draw<T> {
  readonly value: T;
  readonly next: Rng;
}

const drawIndex = (rng: Rng, size: number): Draw<number> => {
  const { value, next } = nextFloat(rng);
  return { value: Math.floor(value * size), next };
};

const drawWithoutReplacement = <T>(rng: Rng, pool: readonly T[]): Draw<{ item: T; rest: readonly T[] }> => {
  const { value: index, next } = drawIndex(rng, pool.length);
  const rest = [...pool.slice(0, index), ...pool.slice(index + 1)];
  return { value: { item: pool[index] as T, rest }, next };
};

const drawDistinctColours = (rng: Rng): Draw<readonly [Colour, Colour]> => {
  const first = drawWithoutReplacement(rng, COLOUR_PALETTE);
  const second = drawWithoutReplacement(first.next, first.value.rest);
  return { value: [first.value.item, second.value.item], next: second.next };
};

const drawClub = (rng: Rng, townsLeft: readonly string[], position: number): Draw<{ club: Club; townsLeft: readonly string[] }> => {
  const town = drawWithoutReplacement(rng, townsLeft);
  const suffix = drawIndex(town.next, CLUB_SUFFIXES.length);
  const colours = drawDistinctColours(suffix.next);
  const club: Club = {
    id: `club-${position + 1}`,
    name: `${town.value.item} ${CLUB_SUFFIXES[suffix.value]}`,
    colours: colours.value,
  };
  return { value: { club, townsLeft: town.value.rest }, next: colours.next };
};

export const generateLeague = (seed: number): League => {
  let rng = createRng(seed);
  let townsLeft: readonly string[] = TOWNS;
  const clubs: Club[] = [];
  for (let position = 0; position < CLUBS_PER_LEAGUE; position++) {
    const drawn = drawClub(rng, townsLeft, position);
    clubs.push(drawn.value.club);
    townsLeft = drawn.value.townsLeft;
    rng = drawn.next;
  }
  return { seed, clubs };
};
