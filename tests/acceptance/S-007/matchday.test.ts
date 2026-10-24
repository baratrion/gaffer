// @US-2 (S-007 see the league table after my first match) @driving_port
// CONTRACT_SHAPE: pure-function
// Outcome anchor: DISCUSS D1, D9 and the Elevator Pitch (US-2): playing matchday 1 settles the whole league's four fixtures, each worked
// out exactly as the S-006 match (same stream per fixture, no new stream), so Sam's own result stays "Netherwold Borough 1–2 Marlbrook
// Athletic" at ?seed=31 and the other three are Fennimore Town 2–2 Valebridge Albion, Tarnbeck Borough 5–1 Rushmoor Heath Albion and
// Juniper Hollow United 1–3 Oakhampton Rise Borough (ADR-0011 values; fixed here before playMatchday exists). Universe: the returned
// array of PlayedMatch and the inputs (deep-frozen sides, never mutated); plain data (JSON round trip).
// Destination: tests/acceptance/S-007/matchday.test.ts (DELIVER step 02).
import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { FORMATIONS, type FormationId } from "../../../src/domain/formation";
import { generateLeague } from "../../../src/domain/league";
import { playMatch, playMatchday, type MatchSide, type PlayedMatch } from "../../../src/domain/match";
import { fixturesOf } from "../../../src/domain/schedule";
import { automaticXI } from "../../../src/domain/selection";
import { generateSquad } from "../../../src/domain/squad";

const anySeed = fc.integer({ min: -(2 ** 31), max: 2 ** 31 - 1 });
const anyMatchday = fc.integer({ min: 1, max: 14 });
const deepFreeze = <T>(value: T): T => {
  if (typeof value === "object" && value !== null && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const child of Object.values(value)) deepFreeze(child);
  }
  return value;
};
/** The eight sides of a league by club index, each fielding its automatic eleven (4-4-2 unless a formation per club is given). */
const sidesOf = (seed: number, formationOf: (club: number) => FormationId = () => "4-4-2"): MatchSide[] =>
  Array.from({ length: 8 }, (_, club) => {
    const squad = generateSquad(seed, club);
    return { squad, xi: automaticXI(squad, formationOf(club)) };
  });
const scoreLine = (seed: number, entry: PlayedMatch): string => {
  const clubs = generateLeague(seed).clubs;
  return `${clubs[entry.home]!.name} ${entry.result.homeGoals}–${entry.result.awayGoals} ${clubs[entry.away]!.name}`;
};

describe("@US-2 S-007 a matchday settles the four fixtures of the league", () => {
  it("Given the seed-31 league fielding its automatic 4-4-2 sides, when matchday 1 is played, then the four score lines are 1–2, 2–2, 5–1 and 1–3 and Sam's is Netherwold Borough 1–2 Marlbrook Athletic @walking_skeleton @driving_port @contract-shape:pure-function", () => {
    const played = playMatchday({ seed: 31, matchday: 1, sides: sidesOf(31) });
    expect(played.map((entry) => scoreLine(31, entry))).toEqual([
      "Netherwold Borough 1–2 Marlbrook Athletic",
      "Fennimore Town 2–2 Valebridge Albion",
      "Tarnbeck Borough 5–1 Rushmoor Heath Albion",
      "Juniper Hollow United 1–3 Oakhampton Rise Borough",
    ]);
    const scorers = played[0]!.result.goals.map(({ minute, side, playerIndex }) => `${minute}' ${generateSquad(31, side === "home" ? 0 : 7)[playerIndex]!.name}`);
    expect(scorers).toEqual(["17' Rurik Fairbourne", "22' Calder Redfern", "77' Rurik Fairbourne"]);
  });

  it("Given the ?seed=abc league (seed 20260), when matchday 1 is played, then the first fixture is Harrowgate Lane United 0–1 Oakhampton Rise Borough @driving_port @contract-shape:pure-function", () => {
    expect(scoreLine(20260, playMatchday({ seed: 20260, matchday: 1, sides: sidesOf(20260) })[0]!)).toBe("Harrowgate Lane United 0–1 Oakhampton Rise Borough");
  });

  it("Given any seed, matchday and formations, when the matchday is played, then there are 4 entries in fixture order, each with the scheduled clubs, the matchday echoed and exactly the result of playMatch for that fixture @property @driving_port @contract-shape:pure-function", () => {
    fc.assert(
      fc.property(anySeed, anyMatchday, fc.array(fc.constantFrom(...FORMATIONS), { minLength: 8, maxLength: 8 }), (seed, matchday, formations) => {
        const sides = sidesOf(seed, (club) => formations[club]!);
        const played = playMatchday({ seed, matchday, sides });
        const fixtures = fixturesOf(matchday);
        expect(played).toHaveLength(4);
        played.forEach((entry, k) => {
          expect(entry.fixtureIndex).toBe(k);
          expect(entry.matchday).toBe(matchday);
          expect([entry.home, entry.away]).toEqual([fixtures[k]!.home, fixtures[k]!.away]);
          expect(entry.result).toEqual(playMatch({ seed, matchday, fixtureIndex: k, home: sides[entry.home]!, away: sides[entry.away]! }));
        });
      }),
    );
  });

  it("Given a played matchday, when only one club's eleven changes, then the three fixtures that do not involve club c are exactly as before @property @boundary @contract-shape:pure-function", () => {
    fc.assert(
      fc.property(anySeed, fc.integer({ min: 0, max: 7 }), fc.constantFrom(...FORMATIONS), (seed, club, formation) => {
        const base = sidesOf(seed);
        const changed = base.map((side, i) => (i === club ? { squad: side.squad, xi: automaticXI(side.squad, formation) } : side));
        const before = playMatchday({ seed, matchday: 1, sides: base });
        const after = playMatchday({ seed, matchday: 1, sides: changed });
        before.forEach((entry, k) => {
          if (entry.home !== club && entry.away !== club) expect(after[k]).toEqual(entry);
        });
      }),
    );
  });

  it("Given the same input played twice with frozen sides, when the matchday is played, then the two results are deep-equal and no input is changed @property @boundary @contract-shape:pure-function", () => {
    fc.assert(
      fc.property(anySeed, anyMatchday, (seed, matchday) => {
        const sides = deepFreeze(sidesOf(seed));
        const before = JSON.stringify(sides);
        const first = playMatchday({ seed, matchday, sides });
        expect(playMatchday({ seed, matchday, sides })).toEqual(first);
        expect(JSON.stringify(sides)).toBe(before);
      }),
    );
  });

  it("Given a played matchday, when it is written out and read back, then nothing is lost (plain numbers and strings only) @property @boundary @contract-shape:pure-function", () => {
    fc.assert(
      fc.property(anySeed, anyMatchday, (seed, matchday) => {
        const played = playMatchday({ seed, matchday, sides: sidesOf(seed) });
        expect(JSON.parse(JSON.stringify(played))).toEqual(played);
      }),
    );
  });

  it("Given a different seed or matchday, when matchday results are compared, then the draws differ (each fixture has its own stream) @boundary @contract-shape:pure-function", () => {
    const one = playMatchday({ seed: 31, matchday: 1, sides: sidesOf(31) });
    const two = playMatchday({ seed: 31, matchday: 2, sides: sidesOf(31) });
    expect(two.map((entry) => entry.result)).not.toEqual(one.map((entry) => entry.result));
    expect(playMatchday({ seed: 32, matchday: 1, sides: sidesOf(32) }).map((entry) => entry.result)).not.toEqual(one.map((entry) => entry.result));
  });

  it("Given sides that are not eight, or a matchday that is not 1 to 14, when the matchday is played, then it is refused with a RangeError @error @boundary @contract-shape:pure-function", () => {
    const sides = sidesOf(31);
    for (const wrong of [[], sides.slice(0, 7), [...sides, sides[0]!]]) {
      expect(() => playMatchday({ seed: 31, matchday: 1, sides: wrong }), `${wrong.length} sides`).toThrow(RangeError);
    }
    for (const matchday of [0, 15, 1.5, Number.NaN, -1, 100]) {
      expect(() => playMatchday({ seed: 31, matchday, sides }), `matchday ${matchday}`).toThrow(RangeError);
    }
    expect(playMatchday({ seed: 31, matchday: 1, sides })).toHaveLength(4);
    expect(playMatchday({ seed: 31, matchday: 14, sides })).toHaveLength(4);
  });
});
