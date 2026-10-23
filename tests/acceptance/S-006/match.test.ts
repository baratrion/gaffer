// @US-1 @US-2 (S-006 play my first match) @walking_skeleton
// CONTRACT_SHAPE: pure-function
// Outcome anchor: DISCUSS Elevator Pitch (US-1, US-2): on Netherwold Borough's home Sam taps "Play match" and reads
// "Netherwold Borough 1–2 Marlbrook Athletic" and the goals "17' Rurik Fairbourne (Marlbrook Athletic)", "22' Calder Redfern (Netherwold
// Borough)", "77' Rurik Fairbourne (Marlbrook Athletic)". The match is a pure function of the seed, the fixture and both sides (D6).
// Universe: the returned MatchResult (homeGoals, awayGoals, goals) and the inputs, compared before and after (deep-frozen, never mutated).
// The two goldens are the EXPECTED values fixed by DESIGN (ADR-0011, "Expected golden matches"), written before match.ts exists.
// DELIVER makes them pass unchanged; a deviation means the code is fixed to follow ADR-0011, never the golden re-pinned.
// Destination: tests/acceptance/S-006/match.test.ts (DELIVER step 02).
import { readFileSync } from "node:fs";
import { join } from "node:path";
import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { generateLeague } from "../../../src/domain/league";
import { matchStream, playMatch, teamStrength, type GoalEvent, type MatchInput, type MatchResult, type MatchSide } from "../../../src/domain/match";
import { deriveSeed } from "../../../src/domain/rng";
import { fixturesOf } from "../../../src/domain/schedule";
import { FORMATIONS, lineUp, type FormationId } from "../../../src/domain/formation";
import { automaticXI, playersForPosition } from "../../../src/domain/selection";
import { generateSquad, type Player, type Position } from "../../../src/domain/squad";

const anySeed = fc.integer({ min: -(2 ** 31), max: 2 ** 31 - 1 });
const anyFormation = fc.constantFrom(...FORMATIONS);
const POSITIONS: readonly Position[] = ["GK", "DF", "MF", "FW"];

const sideOf = (seed: number, club: number, formation: FormationId = "4-4-2"): MatchSide => {
  const squad = generateSquad(seed, club);
  return { squad, xi: automaticXI(squad, formation) };
};
const inputOf = (seed: number, fixtureIndex: number, matchday = 1): MatchInput => {
  const fixture = fixturesOf(matchday)[fixtureIndex]!;
  return { seed, matchday, fixtureIndex, home: sideOf(seed, fixture.home), away: sideOf(seed, fixture.away) };
};
/** What Sam reads: the score line and the goals list, like the match screen. */
const reading = (input: MatchInput, result: MatchResult): { score: string; goals: string[] } => {
  const fixture = fixturesOf(input.matchday)[input.fixtureIndex]!;
  const clubs = generateLeague(input.seed).clubs;
  const home = clubs[fixture.home]!.name;
  const away = clubs[fixture.away]!.name;
  return {
    score: `${home} ${result.homeGoals}–${result.awayGoals} ${away}`,
    goals: result.goals.map((g) => `${g.minute}' ${(g.side === "home" ? input.home : input.away).squad[g.playerIndex]!.name} (${g.side === "home" ? home : away})`),
  };
};
const deepFreeze = <T>(value: T): T => {
  if (typeof value === "object" && value !== null && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const child of Object.values(value)) deepFreeze(child);
  }
  return value;
};
/** An arbitrary valid XI of a squad: per position, the squad's players ordered by random keys, dealt in lineUp order. */
const xiFrom = (squad: readonly Player[], formation: FormationId, keys: readonly number[]): readonly number[] => {
  const taken: Record<Position, number> = { GK: 0, DF: 0, MF: 0, FW: 0 };
  const ordered = Object.fromEntries(
    POSITIONS.map((position) => [position, [...playersForPosition(squad, position)].sort((a, b) => keys[a]! - keys[b]! || a - b)]),
  ) as Record<Position, number[]>;
  return lineUp(formation).map((position) => ordered[position][taken[position]++]!);
};
const anyKeys = fc.array(fc.integer({ min: 0, max: 1000 }), { minLength: 18, maxLength: 18 });
const anyMatch = fc.record({ seed: anySeed, fixtureIndex: fc.integer({ min: 0, max: 3 }), matchday: fc.integer({ min: 1, max: 14 }), formation: anyFormation, keys: anyKeys });
const matchFrom = ({ seed, fixtureIndex, matchday, formation, keys }: { seed: number; fixtureIndex: number; matchday: number; formation: FormationId; keys: readonly number[] }): MatchInput => {
  const fixture = fixturesOf(matchday)[fixtureIndex]!;
  const home = generateSquad(seed, fixture.home);
  const away = generateSquad(seed, fixture.away);
  return { seed, matchday, fixtureIndex, home: { squad: home, xi: xiFrom(home, formation, keys) }, away: { squad: away, xi: automaticXI(away, "4-4-2") } };
};

describe("@US-1 @US-2 S-006 the match Sam sees is decided by the seed, the fixture and the two elevens", () => {
  describe("Given untouched tactics (both clubs field their automatic 4-4-2)", () => {
    it("when seed 31's matchday-1 match of club 0 plays, then Netherwold Borough lose 1–2 to Marlbrook Athletic with the three ADR-0011 goals (strengths 130 and 143) @walking_skeleton @driving_port @contract-shape:pure-function", () => {
      const input = inputOf(31, 0);
      const result = playMatch(input);
      expect([teamStrength(input.home), teamStrength(input.away)]).toEqual([130, 143]);
      expect(reading(input, result)).toEqual({
        score: "Netherwold Borough 1–2 Marlbrook Athletic",
        goals: ["17' Rurik Fairbourne (Marlbrook Athletic)", "22' Calder Redfern (Netherwold Borough)", "77' Rurik Fairbourne (Marlbrook Athletic)"],
      });
      expect(result.goals.map((g) => g.minute)).toEqual([17, 22, 77]);
    });

    it("when the default seed 20260 (what ?seed=abc gives) plays fixture 0, then Oakhampton Rise Borough win 1–0 away with 65' Joren Northcott (strengths 152 and 138) @walking_skeleton @driving_port @contract-shape:pure-function", () => {
      const input = inputOf(20260, 0);
      expect([teamStrength(input.home), teamStrength(input.away)]).toEqual([152, 138]);
      expect(reading(input, playMatch(input))).toEqual({
        score: "Harrowgate Lane United 0–1 Oakhampton Rise Borough",
        goals: ["65' Joren Northcott (Oakhampton Rise Borough)"],
      });
    });

    it.each([
      [1, "Fennimore Town 2–2 Valebridge Albion"],
      [2, "Tarnbeck Borough 5–1 Rushmoor Heath Albion"],
      [3, "Juniper Hollow United 1–3 Oakhampton Rise Borough"],
    ])("when seed 31's matchday-1 fixture %s plays, then the score line is the ADR-0011 reference %s @boundary @contract-shape:pure-function", (fixtureIndex, score) => {
      const input = inputOf(31, fixtureIndex);
      expect(reading(input, playMatch(input)).score).toBe(score);
    });

    it("when seed 8's matchday-1 fixture 3 plays (clubs 3 and 4), then it ends Mossdale Athletic 0–0 Pickering Dene Rovers with no goals: the pinned goalless match behind the empty-list check @boundary @contract-shape:pure-function", () => {
      const input = inputOf(8, 3);
      const result = playMatch(input);
      expect(reading(input, result)).toEqual({ score: "Mossdale Athletic 0–0 Pickering Dene Rovers", goals: [] });
      expect(result).toEqual({ homeGoals: 0, awayGoals: 0, goals: [] });
    });

    it.each([
      [11, "'", "an apostrophe (Emlyn O'Garrity)"],
      [15, "-", "a hyphen (Tamsin Fitch-Moreton)"],
    ])("when seed %s's matchday-1 fixture 0 plays, then a goal is scored by a player whose name has %s: the pinned match behind the e2e name-reading probe @environment-probe @boundary @contract-shape:pure-function", (seed, mark) => {
      const input = inputOf(seed, 0);
      const scorers = playMatch(input).goals.map((g) => (g.side === "home" ? input.home : input.away).squad[g.playerIndex]!.name);
      expect(scorers.some((name) => name.includes(mark))).toBe(true);
    });

    it("when the same match is played twice, then the two results are deep-equal, and the inputs (deep-frozen) are unchanged @property @contract-shape:pure-function", () => {
      fc.assert(
        fc.property(anySeed, fc.integer({ min: 0, max: 3 }), (seed, fixtureIndex) => {
          const input = deepFreeze(inputOf(seed, fixtureIndex));
          const before = JSON.stringify(input);
          expect(playMatch(input)).toEqual(playMatch(input));
          expect(JSON.stringify(input)).toBe(before);
        }),
      );
    });

    it("when the seed changes, then the match changes for some seeds, and the fixture and the matchday each pick their own draws @boundary @contract-shape:pure-function", () => {
      const results = (build: (n: number) => MatchInput) => new Set(Array.from({ length: 30 }, (_, n) => JSON.stringify(playMatch(build(n + 1)))));
      expect(results((seed) => inputOf(seed, 0)).size).toBeGreaterThan(5);
      const base = inputOf(31, 0);
      const otherFixture = playMatch({ ...base, fixtureIndex: 1 });
      const otherMatchday = playMatch({ ...base, matchday: 2 });
      expect([otherFixture, otherMatchday].map((r) => JSON.stringify(r))).not.toContain(JSON.stringify(playMatch(base)));
    });
  });

  describe("Given any seed, fixture, matchday, formation and eleven", () => {
    it("when the match is played, then each side scores 0 to 9, the two scores add up to the goals listed, and the events per side equal that side's goals @property @contract-shape:pure-function", () => {
      fc.assert(
        fc.property(anyMatch, (spec) => {
          const result = playMatch(matchFrom(spec));
          for (const goals of [result.homeGoals, result.awayGoals]) {
            expect(Number.isInteger(goals)).toBe(true);
            expect(goals).toBeGreaterThanOrEqual(0);
            expect(goals).toBeLessThanOrEqual(9);
          }
          expect(result.goals).toHaveLength(result.homeGoals + result.awayGoals);
          expect(result.goals.filter((g) => g.side === "home")).toHaveLength(result.homeGoals);
          expect(result.goals.filter((g) => g.side === "away")).toHaveLength(result.awayGoals);
        }),
      );
    });

    it("when the match is played, then minutes are whole numbers 1 to 90, never decreasing, and at the same minute the home goal comes first @property @contract-shape:pure-function", () => {
      fc.assert(
        fc.property(anyMatch, (spec) => {
          const { goals } = playMatch(matchFrom(spec));
          goals.forEach((g, i) => {
            expect(Number.isInteger(g.minute) && g.minute >= 1 && g.minute <= 90).toBe(true);
            const previous: GoalEvent | undefined = goals[i - 1];
            if (previous) {
              expect(g.minute).toBeGreaterThanOrEqual(previous.minute);
              expect(g.minute === previous.minute && previous.side === "away" && g.side === "home").toBe(false);
            }
          });
        }),
      );
    });

    it("when the match is played, then every scorer is on that side's eleven and is never its goalkeeper (no own goals) @property @contract-shape:pure-function", () => {
      fc.assert(
        fc.property(anyMatch, (spec) => {
          const input = matchFrom(spec);
          for (const g of playMatch(input).goals) {
            const side = g.side === "home" ? input.home : input.away;
            expect(side.xi).toContain(g.playerIndex);
            expect(side.squad[g.playerIndex]!.position).not.toBe("GK");
          }
        }),
      );
    });

    it("when the home eleven is replaced by one with a higher sum of overalls, against the same away eleven and seed, then the home side never scores fewer and the away side never more @property @contract-shape:pure-function", () => {
      fc.assert(
        fc.property(anyMatch, anyKeys, (spec, otherKeys) => {
          const one = matchFrom(spec);
          const other = matchFrom({ ...spec, keys: otherKeys });
          const [weak, strong] = teamStrength(one.home) <= teamStrength(other.home) ? [one, other] : [other, one];
          const weakResult = playMatch(weak);
          const strongResult = playMatch(strong);
          expect(strongResult.homeGoals).toBeGreaterThanOrEqual(weakResult.homeGoals);
          expect(strongResult.awayGoals).toBeLessThanOrEqual(weakResult.awayGoals);
        }),
      );
    });

    it("when the away eleven gets stronger against the same home eleven and seed, then the home side never scores more @property @contract-shape:pure-function", () => {
      fc.assert(
        fc.property(anyMatch, anyKeys, (spec, otherKeys) => {
          const base = matchFrom(spec);
          const away = (keys: readonly number[]): MatchSide => ({ squad: base.away.squad, xi: xiFrom(base.away.squad, "4-4-2", keys) });
          const a = { ...base, away: away(spec.keys) };
          const b = { ...base, away: away(otherKeys) };
          const [weak, strong] = teamStrength(a.away) <= teamStrength(b.away) ? [a, b] : [b, a];
          expect(playMatch(strong).homeGoals).toBeLessThanOrEqual(playMatch(weak).homeGoals);
        }),
      );
    });
  });

  describe("Given the strength of an eleven", () => {
    it("when it is measured, then it is the sum of the 11 overalls, a whole number from 11 to 220 @property @driving_port @contract-shape:pure-function", () => {
      fc.assert(
        fc.property(anySeed, fc.integer({ min: 0, max: 7 }), anyFormation, (seed, club, formation) => {
          const side = sideOf(seed, club, formation);
          const expected = side.xi.reduce((sum, index) => sum + side.squad[index]!.overall, 0);
          expect(teamStrength(side)).toBe(expected);
          expect(expected).toBeGreaterThanOrEqual(11);
          expect(expected).toBeLessThanOrEqual(220);
        }),
      );
    });

    it("when Netherwold Borough's automatic 4-4-2 eleven is measured, then it is 130 @boundary @contract-shape:pure-function", () => {
      expect(teamStrength(sideOf(31, 0))).toBe(130);
    });
  });

  describe("Given a late-season fixture (matchday 9, fixture 2) of seed 31", () => {
    it("when it plays, then it uses stream 234 (hand-computed: 200 + 8 * 4 + 2) and gives the recorded result @regression @contract-shape:pure-function", () => {
      // Figures below were recorded once from the frozen model (ADR-0011); the stream number is hand-computed, not read from code.
      expect(matchStream(9, 2)).toBe(200 + (9 - 1) * 4 + 2);
      expect(matchStream(9, 2)).toBe(234);
      const result = playMatch(inputOf(31, 2, 9));
      expect({ home: result.homeGoals, away: result.awayGoals, minutes: result.goals.map((g) => g.minute) }).toEqual({ home: 2, away: 3, minutes: [13, 16, 34, 64, 79] });
    });
  });

  describe("Given a matchday or fixture outside the schedule", () => {
    it.each([
      ["matchday 0", { matchday: 0 }],
      ["matchday 15", { matchday: 15 }],
      ["matchday 1.5", { matchday: 1.5 }],
      ["matchday NaN", { matchday: Number.NaN }],
      ["fixture -1", { fixtureIndex: -1 }],
      ["fixture 4", { fixtureIndex: 4 }],
      ["fixture 1.5", { fixtureIndex: 1.5 }],
      ["fixture NaN", { fixtureIndex: Number.NaN }],
    ])("when the match is played with %s, then a RangeError is thrown @error @boundary @contract-shape:pure-function", (_label, change) => {
      expect(() => playMatch({ ...inputOf(31, 0), ...change })).toThrow(RangeError);
    });

    it("when the first and the last valid matchday and fixture are played, then they work @boundary @contract-shape:pure-function", () => {
      for (const [matchday, fixtureIndex] of [[1, 0], [14, 3]] as const) {
        const { homeGoals, awayGoals, goals } = playMatch(inputOf(31, fixtureIndex, matchday));
        expect(goals).toHaveLength(homeGoals + awayGoals);
      }
    });
  });

  describe("Given the random streams used by the generator and the matches, when the seeds derived for them are compared", () => {
    // Streams in use after S-006 (ADR-0011): -1 names, 0..7 clubs, 100..107 attributes, 200..255 matches.
    // ADR-0011 formula, restated independently: stream = 200 + (matchday - 1) * 4 + fixtureIndex.
    const pairs = Array.from({ length: 14 }, (_, d) => Array.from({ length: 4 }, (_, f) => [d + 1, f] as const)).flat();
    const matchStreams = pairs.map(([matchday, fixtureIndex]) => matchStream(matchday, fixtureIndex));
    const streams = [-1, ...Array.from({ length: 8 }, (_, i) => i), ...Array.from({ length: 8 }, (_, i) => 100 + i), ...matchStreams];

    it("then the 56 match streams follow 200 + (matchday - 1) * 4 + fixture, span 200..255, and all 73 stream numbers are pairwise distinct @boundary @contract-shape:pure-function", () => {
      expect(pairs).toHaveLength(56);
      pairs.forEach(([matchday, fixtureIndex], i) => {
        expect(matchStream(matchday, fixtureIndex)).toBe(200 + (matchday - 1) * 4 + fixtureIndex);
        expect(matchStream(matchday, fixtureIndex)).toBe(200 + i);
      });
      expect(Math.min(...matchStreams)).toBe(200);
      expect(Math.max(...matchStreams)).toBe(255);
      expect(new Set(streams).size).toBe(73);
    });

    it("then the 73 derived seeds are pairwise distinct over sampled seeds (probabilistic, as the S-003 guard it extends) @property @contract-shape:pure-function", () => {
      fc.assert(fc.property(anySeed, (seed) => new Set(streams.map((s) => deriveSeed(seed, s))).size === streams.length));
    });
  });

  describe("Given the source of the match model", () => {
    const source = readFileSync(join(import.meta.dirname, "..", "..", "..", "src", "domain", "match.ts"), "utf8");
    const code = source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");

    it("when searched for functions the engines approximate, then there is no Math.pow, Math.exp, Math.log or ** (cross-engine determinism, ADR-0011) @determinism @error @contract-shape:pure-function", () => {
      expect(code).not.toMatch(/Math\.(pow|exp|log|log2|log10|sqrt|cbrt|sin|cos|tan|atan|atan2|tanh)\b|\*\*/);
    });

    it("when searched for ambient randomness or time, then there is no Math.random, Date, performance.now or crypto. @determinism @error @contract-shape:pure-function", () => {
      expect(code).not.toMatch(/Math\.random|\bDate\b|performance\.now|crypto\./);
    });
  });
});
