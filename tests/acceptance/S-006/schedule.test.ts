// @US-1 (S-006 play my first match) @walking_skeleton
// CONTRACT_SHAPE: pure-function
// Outcome anchor: DISCUSS Elevator Pitch (US-1) and D5: on matchday 1 every club of the league plays exactly one other club, the
// schedule fixes which club is home (named first), and both clubs see the same fixture. ADR-0010: circle method over club indices,
// seed-independent; matchdays 8..14 mirror 1..7. The domain is finite (14 x 8), so exhaustive loops replace fast-check.
// Universe: the returned frozen arrays and fixtures. Goldens are written out from ADR-0010, independent of the code under test.
// Destination: tests/acceptance/S-006/schedule.test.ts (DELIVER step 01).
import { describe, expect, it } from "vitest";
import { CLUBS_PER_LEAGUE } from "../../../src/domain/league";
import { FIXTURES_PER_MATCHDAY, fixtureOf, fixturesOf, MATCHDAYS, type Fixture } from "../../../src/domain/schedule";

const matchdays = Array.from({ length: MATCHDAYS }, (_, i) => i + 1);
const clubs = Array.from({ length: CLUBS_PER_LEAGUE }, (_, i) => i);
const pairs = (matchday: number): [number, number][] => fixturesOf(matchday).map((f): [number, number] => [f.home, f.away]);

describe("@US-1 S-006 the league has one fixed schedule: who plays whom, and who is at home", () => {
  it.each([
    [1, [[0, 7], [1, 6], [5, 2], [3, 4]]],
    [2, [[7, 1], [2, 0], [6, 3], [4, 5]]],
    [8, [[7, 0], [6, 1], [2, 5], [4, 3]]],
  ] as const)("Given matchday %s, when its fixtures are read, then they are the ADR-0010 golden, home club first @walking_skeleton @driving_port @contract-shape:pure-function", (matchday, expected) => {
    expect(pairs(matchday)).toEqual(expected);
  });

  it("Given the constants of the schedule, when read, then there are 14 matchdays of 4 fixtures for 8 clubs @boundary @contract-shape:pure-function", () => {
    expect([MATCHDAYS, FIXTURES_PER_MATCHDAY, CLUBS_PER_LEAGUE]).toEqual([14, 4, 8]);
  });

  it("Given any matchday of the season, when its fixtures are read, then every club is in exactly one of the 4 fixtures @property @contract-shape:pure-function", () => {
    for (const matchday of matchdays) {
      const fixtures = fixturesOf(matchday);
      expect(fixtures).toHaveLength(4);
      expect(fixtures.flatMap((f) => [f.home, f.away]).sort((a, b) => a - b)).toEqual(clubs);
    }
  });

  it("Given the 14 matchdays, when every ordered pair of two different clubs is counted, then each pair meets exactly once (a double round-robin) @property @contract-shape:pure-function", () => {
    const seen = new Map<string, number>();
    for (const matchday of matchdays) for (const f of fixturesOf(matchday)) seen.set(`${f.home}v${f.away}`, (seen.get(`${f.home}v${f.away}`) ?? 0) + 1);
    expect(seen.size).toBe(CLUBS_PER_LEAGUE * (CLUBS_PER_LEAGUE - 1));
    expect([...seen.values()].every((count) => count === 1)).toBe(true);
    expect([...seen.keys()].some((key) => key.split("v")[0] === key.split("v")[1])).toBe(false);
  });

  it("Given matchdays 1..7, when compared with matchdays 8..14, then each later fixture is the earlier one with home and away swapped @property @contract-shape:pure-function", () => {
    for (let matchday = 1; matchday <= 7; matchday++) {
      expect(pairs(matchday + 7)).toEqual(pairs(matchday).map(([home, away]) => [away, home]));
    }
  });

  it("Given matchdays 1..7, when the home games of each club are counted, then clubs 0, 2, 4, 6 are at home 4 times and clubs 1, 3, 5, 7 three times; over 14 matchdays every club is at home 7 times @property @boundary @contract-shape:pure-function", () => {
    const home = (list: readonly number[]) => clubs.map((club) => list.filter((m) => fixturesOf(m).some((f) => f.home === club)).length);
    expect(home(matchdays.slice(0, 7))).toEqual([4, 3, 4, 3, 4, 3, 4, 3]);
    expect(home(matchdays)).toEqual(clubs.map(() => 7));
  });

  it("Given any matchday and club, when the club's fixture is asked for, then it is the very fixture at that index of the matchday, it holds the club, and the opponent sees the same one @driving_port @property @contract-shape:pure-function", () => {
    for (const matchday of matchdays) {
      for (const club of clubs) {
        const { index, fixture } = fixtureOf(matchday, club);
        expect(fixture).toBe(fixturesOf(matchday)[index]);
        expect([fixture.home, fixture.away]).toContain(club);
        const opponent = fixture.home === club ? fixture.away : fixture.home;
        expect(fixtureOf(matchday, opponent)).toEqual({ index, fixture });
      }
    }
  });

  it("Given matchday 1, when each club's fixture is asked for, then clubs 0 and 7 are in fixture 0, 3 and 4 in fixture 3, and club 0 is at home @driving_port @contract-shape:pure-function", () => {
    expect(fixtureOf(1, 0)).toEqual({ index: 0, fixture: { home: 0, away: 7 } });
    expect(fixtureOf(1, 7).index).toBe(0);
    expect(fixtureOf(1, 3)).toEqual({ index: 3, fixture: { home: 3, away: 4 } });
    expect(fixtureOf(1, 4).index).toBe(3);
  });

  it("Given the schedule, when a reader tries to write to it, then every level is frozen and the table is unchanged @boundary @contract-shape:pure-function", () => {
    const before = JSON.stringify(matchdays.map((m) => fixturesOf(m)));
    for (const matchday of matchdays) {
      const fixtures = fixturesOf(matchday);
      expect(Object.isFrozen(fixtures)).toBe(true);
      for (const f of fixtures) expect(Object.isFrozen(f)).toBe(true);
    }
    expect(() => (fixturesOf(1) as Fixture[]).push({ home: 0, away: 1 })).toThrow(TypeError);
    expect(() => ((fixturesOf(1)[0] as { home: number }).home = 5)).toThrow(TypeError);
    expect(JSON.stringify(matchdays.map((m) => fixturesOf(m)))).toBe(before);
    expect(fixturesOf(3)).toBe(fixturesOf(3));
  });

  it.each([0, 15, 1.5, Number.NaN, -1, 100])("Given matchday %s, when the fixtures or a club's fixture are asked for, then a RangeError is thrown @error @boundary @contract-shape:pure-function", (matchday) => {
    expect(() => fixturesOf(matchday)).toThrow(RangeError);
    expect(() => fixtureOf(matchday, 0)).toThrow(RangeError);
  });

  it.each([-1, 8, 1.5, Number.NaN, 100])("Given club %s outside the league, when its fixture is asked for, then a RangeError is thrown @error @boundary @contract-shape:pure-function", (club) => {
    expect(() => fixtureOf(1, club)).toThrow(RangeError);
  });

  it("Given the first and last valid matchday and club, when asked for, then they work (the edges of the ranges) @boundary @contract-shape:pure-function", () => {
    expect(fixturesOf(1)).toHaveLength(4);
    expect(fixturesOf(14)).toHaveLength(4);
    expect(pairs(14)).toEqual([[7, 6], [5, 0], [1, 4], [3, 2]]);
    expect(fixtureOf(14, 0)).toEqual({ index: 1, fixture: { home: 5, away: 0 } });
    expect(fixtureOf(1, 7).fixture.away).toBe(7);
  });
});
