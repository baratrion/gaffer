// @US-1 @US-2 (S-006 play my first match) @kpi
// CONTRACT_SHAPE: pure-function
// Outcome anchor: DISCUSS Elevator Pitch (US-1/US-2)
// Outcome anchor: DISCUSS D7 and KPI K3 ("an XI whose overall sum is at least 20 higher scores more on average; mean goals per side
// 1.0-2.0 and under 20% 0-0 between two automatic XIs; at most 9 goals per side") and the realism floor ("a league's matchday is not
// all goalless"). Committed fixed-seed test (no fast-check, so it does not use FC_SEED): seeds 1..1000 x the 4 matchday-1 fixtures =
// 4000 matches. DESIGN spike figures: 1.363 goals per side, 5.5% goalless, at most 6; 1.384 vs 0.481 goals (automatic vs lowest-rated).
// The assertions are the D7 bounds, not the spike's exact figures. Squads are built once per seed (nightly mutation reruns this file).
// Destination: tests/acceptance/S-006/match-calibration.test.ts with fixtures/lowest-rated-xi.ts (DELIVER step 02).
import { describe, expect, it } from "vitest";
import { playMatch, teamStrength, type MatchInput } from "../../../src/domain/match";
import { fixturesOf } from "../../../src/domain/schedule";
import { automaticXI } from "../../../src/domain/selection";
import { generateSquad, type Player } from "../../../src/domain/squad";
import { lowestRatedXI, raisedXI } from "./fixtures/lowest-rated-xi";

const SEEDS = Array.from({ length: 1000 }, (_, i) => i + 1);
const FIXTURES = [0, 1, 2, 3] as const;
const squadsBySeed = new Map<number, readonly (readonly Player[])[]>();
const squadsOf = (seed: number): readonly (readonly Player[])[] => {
  const known = squadsBySeed.get(seed);
  if (known) return known;
  const built = Array.from({ length: 8 }, (_, club) => generateSquad(seed, club));
  squadsBySeed.set(seed, built);
  return built;
};
const automatic = (seed: number, fixtureIndex: number): MatchInput => {
  const fixture = fixturesOf(1)[fixtureIndex]!;
  const [home, away] = [squadsOf(seed)[fixture.home]!, squadsOf(seed)[fixture.away]!];
  return { seed, matchday: 1, fixtureIndex, home: { squad: home, xi: automaticXI(home, "4-4-2") }, away: { squad: away, xi: automaticXI(away, "4-4-2") } };
};
const allMatches = SEEDS.flatMap((seed) => FIXTURES.map((fixtureIndex) => automatic(seed, fixtureIndex)));
const mean = (values: readonly number[]): number => values.reduce((a, b) => a + b, 0) / values.length;

describe("@US-1 @US-2 S-006 over 4000 matches the model looks like football and a better eleven helps", () => {
  const results = allMatches.map((input) => playMatch(input));

  it("Given two automatic 4-4-2 elevens, when 4000 matchday-1 matches are played, then the mean goals per side is between 1.0 and 2.0 and under 20% end 0–0 @kpi @property @contract-shape:pure-function", () => {
    expect(results).toHaveLength(4000);
    const perSide = mean(results.flatMap((r) => [r.homeGoals, r.awayGoals]));
    expect(perSide).toBeGreaterThanOrEqual(1.0);
    expect(perSide).toBeLessThanOrEqual(2.0);
    expect(results.filter((r) => r.homeGoals === 0 && r.awayGoals === 0).length / results.length).toBeLessThan(0.2);
  });

  it("Given the canonical 4000 matches, when the figures DESIGN published in ADR-0011 are counted, then they match exactly: 10901 goals, 220 goalless, the goals-per-side distribution, home 1.384, forwards 51.2% of the scorers @kpi @determinism @contract-shape:pure-function", () => {
    // ADR-0011 "Calibration": figures from two independent DESIGN runs of the exact rules. A changed constant or draw order shows here
    // even when the two goldens happen to survive it; changing these figures needs an ADR-0011 amendment, never a re-pin from the code.
    const sides = results.flatMap((r) => [r.homeGoals, r.awayGoals]);
    expect(sides.reduce((a, b) => a + b, 0)).toBe(10901);
    expect(results.filter((r) => r.homeGoals + r.awayGoals === 0)).toHaveLength(220);
    expect([0, 1, 2, 3, 4, 5, 6, 7].map((n) => sides.filter((c) => c === n).length)).toEqual([1914, 2864, 2032, 871, 245, 64, 10, 0]);
    expect(Math.abs(mean(results.map((r) => r.homeGoals)) - 1.384)).toBeLessThan(0.001);
    const tally = { GK: 0, DF: 0, MF: 0, FW: 0 };
    allMatches.forEach((input, i) => {
      for (const goal of results[i]!.goals) tally[(goal.side === "home" ? input.home : input.away).squad[goal.playerIndex]!.position] += 1;
    });
    const total = tally.DF + tally.MF + tally.FW;
    expect([tally.DF, tally.MF, tally.FW].map((n) => ((100 * n) / total).toFixed(1))).toEqual(["12.5", "36.3", "51.2"]);
  });

  it("Given the same 4000 matches, when the goals per side are counted, then no side scores more than 9, and some side scores 0, 1 and 2 or more @kpi @boundary @contract-shape:pure-function", () => {
    const counts = results.flatMap((r) => [r.homeGoals, r.awayGoals]);
    expect(Math.max(...counts)).toBeLessThanOrEqual(9);
    expect([0, 1, 2].every((n) => counts.some((c) => (n < 2 ? c === n : c >= n)))).toBe(true);
  });

  it("Given the same 4000 matches, when the scorers are classified, then no goalkeeper scores and forwards score more than midfielders, who score more than defenders @kpi @property @contract-shape:pure-function", () => {
    const tally = { GK: 0, DF: 0, MF: 0, FW: 0 };
    allMatches.forEach((input, i) => {
      for (const goal of results[i]!.goals) tally[(goal.side === "home" ? input.home : input.away).squad[goal.playerIndex]!.position] += 1;
    });
    const total = tally.GK + tally.DF + tally.MF + tally.FW;
    expect(tally.GK).toBe(0);
    expect(tally.FW).toBeGreaterThan(tally.MF);
    expect(tally.MF).toBeGreaterThan(tally.DF);
    expect(tally.DF / total).toBeGreaterThan(0.05);
    expect(tally.DF / total).toBeLessThan(0.2);
  });

  it("Given the 8 clubs of one league, when the 4 matchday-1 matches are compared, then not every league is all 0–0, and the leagues of seeds 31 and 20260 (?seed=abc) are not @kpi @boundary @contract-shape:pure-function", () => {
    const goalless = (seed: number): number => FIXTURES.filter((f) => { const r = playMatch(automatic(seed, f)); return r.homeGoals + r.awayGoals === 0; }).length;
    expect(SEEDS.filter((seed) => goalless(seed) === 4)).toEqual([]);
    expect(goalless(31)).toBeLessThan(4);
    expect(goalless(20260)).toBeLessThan(4);
  });

  describe("Given the home side swaps its automatic eleven for the lowest-rated one (the same away side and seed)", () => {
    const swapped = allMatches.map((input) => ({ ...input, home: { squad: input.home.squad, xi: lowestRatedXI(input.home.squad, "4-4-2") } }));

    it("when 4000 matches are replayed, then the lowest-rated eleven is at least 20 weaker by the sum of overalls, scores fewer home goals on average and never more on any seed @kpi @property @contract-shape:pure-function", () => {
      const weak = swapped.map((input) => playMatch(input));
      expect(swapped.every((input, i) => teamStrength(allMatches[i]!.home) - teamStrength(input.home) >= 20)).toBe(true);
      expect(mean(weak.map((r) => r.homeGoals))).toBeLessThan(mean(results.map((r) => r.homeGoals)));
      expect(mean(weak.map((r) => r.homeGoals)).toFixed(3), "ADR-0011: the lowest-rated eleven scores 0.481").toBe("0.481");
      expect(weak.every((r, i) => r.homeGoals <= results[i]!.homeGoals)).toBe(true);
      expect(weak.every((r, i) => r.awayGoals >= results[i]!.awayGoals)).toBe(true);
    });

    it("when an eleven at least 20 above the lowest-rated one plays instead, then it scores more home goals on average and never fewer on any seed @kpi @property @contract-shape:pure-function", () => {
      const raised = allMatches.map((input) => ({ ...input, home: { squad: input.home.squad, xi: raisedXI(input.home.squad, "4-4-2", 20) } }));
      expect(raised.every((input, i) => teamStrength(input.home) - teamStrength(swapped[i]!.home) >= 20)).toBe(true);
      const [low, high] = [swapped.map((input) => playMatch(input)), raised.map((input) => playMatch(input))];
      expect(mean(high.map((r) => r.homeGoals))).toBeGreaterThan(mean(low.map((r) => r.homeGoals)));
      expect(high.every((r, i) => r.homeGoals >= low[i]!.homeGoals)).toBe(true);
    });
  });
});
