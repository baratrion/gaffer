import { CLUBS_PER_LEAGUE } from "./league";

export interface Fixture {
  readonly home: number;
  readonly away: number;
}

export interface ClubFixture {
  readonly index: number;
  readonly fixture: Fixture;
}

export const FIXTURES_PER_MATCHDAY = CLUBS_PER_LEAGUE / 2;

const ROUNDS = CLUBS_PER_LEAGUE - 1;

export const MATCHDAYS = ROUNDS * 2;

const fixture = (home: number, away: number, mirrored: boolean): Fixture =>
  Object.freeze(mirrored ? { home: away, away: home } : { home, away });

const fixedVertexFixture = (round: number, mirrored: boolean): Fixture =>
  round % 2 === 0 ? fixture(round, ROUNDS, mirrored) : fixture(ROUNDS, round, mirrored);

const rotatingFixture = (round: number, k: number, mirrored: boolean): Fixture => {
  const a = (round + k) % ROUNDS;
  const b = (round - k + ROUNDS) % ROUNDS;
  return k % 2 === 1 ? fixture(a, b, mirrored) : fixture(b, a, mirrored);
};

const matchdayFixtures = (matchday: number): readonly Fixture[] => {
  const mirrored = matchday > ROUNDS;
  const round = (matchday - 1) % ROUNDS;
  const rotating = Array.from({ length: FIXTURES_PER_MATCHDAY - 1 }, (_, i) =>
    rotatingFixture(round, i + 1, mirrored),
  );
  return Object.freeze([fixedVertexFixture(round, mirrored), ...rotating]);
};

const SCHEDULE: readonly (readonly Fixture[])[] = Object.freeze(
  Array.from({ length: MATCHDAYS }, (_, i) => matchdayFixtures(i + 1)),
);

const isIntegerIn = (value: number, min: number, max: number): boolean =>
  Number.isInteger(value) && value >= min && value <= max;

/** The 4 fixtures of a matchday (1..14), in index order, home club first. */
export const fixturesOf = (matchday: number): readonly Fixture[] => {
  if (!isIntegerIn(matchday, 1, MATCHDAYS)) throw new RangeError(`matchday ${matchday} is not 1..${MATCHDAYS}`);
  return SCHEDULE[matchday - 1] as readonly Fixture[];
};

/** The fixture a club plays on a matchday, with its index within that matchday. */
export const fixtureOf = (matchday: number, clubIndex: number): ClubFixture => {
  const fixtures = fixturesOf(matchday);
  if (!isIntegerIn(clubIndex, 0, CLUBS_PER_LEAGUE - 1)) throw new RangeError(`club ${clubIndex} is not 0..${CLUBS_PER_LEAGUE - 1}`);
  const index = fixtures.findIndex((f) => f.home === clubIndex || f.away === clubIndex);
  return { index, fixture: fixtures[index] as Fixture };
};
