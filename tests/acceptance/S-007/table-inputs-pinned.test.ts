// @US-2 (S-007 see the league table after my first match) @regression
// CONTRACT_SHAPE: pure-function
// Outcome anchor: DISCUSS US-2 example 1 and D9: the seed-31 table after matchday 1 is derived from four results that already exist in
// the game today: Netherwold Borough 1–2 Marlbrook Athletic, Fennimore Town 2–2 Valebridge Albion, Tarnbeck Borough 5–1 Rushmoor Heath
// Albion, Juniper Hollow United 1–3 Oakhampton Rise Borough (ADR-0011 values, both sides automatic 4-4-2), and at ?seed=abc the first
// fixture is Harrowgate Lane United 0–1 Oakhampton Rise Borough. The held-out table specs write their golden from these. If the
// generator, the schedule or the match model ever changes, this file turns red, not the table specs. Passes before and after DELIVER:
// it uses only schedule.ts, match.ts, league.ts, squad.ts and selection.ts.
import { describe, expect, it } from "vitest";
import { generateLeague } from "../../../src/domain/league";
import { playMatch } from "../../../src/domain/match";
import { fixturesOf } from "../../../src/domain/schedule";
import { automaticXI } from "../../../src/domain/selection";
import { generateSquad } from "../../../src/domain/squad";

const scoreLines = (seed: number): string[] => {
  const clubs = generateLeague(seed).clubs;
  const side = (club: number) => {
    const squad = generateSquad(seed, club);
    return { squad, xi: automaticXI(squad, "4-4-2") };
  };
  return fixturesOf(1).map(({ home, away }, fixtureIndex) => {
    const { homeGoals, awayGoals } = playMatch({ seed, matchday: 1, fixtureIndex, home: side(home), away: side(away) });
    return `${clubs[home]!.name} ${homeGoals}–${awayGoals} ${clubs[away]!.name}`;
  });
};

describe("@US-2 S-007 the four matchday-1 results the table is built from are pinned", () => {
  it("Given the seed-31 league fielding automatic 4-4-2 sides, when matchday 1 is worked out, then the four score lines are the ones the golden table is derived from @regression @boundary @contract-shape:pure-function", () => {
    expect(scoreLines(31)).toEqual([
      "Netherwold Borough 1–2 Marlbrook Athletic",
      "Fennimore Town 2–2 Valebridge Albion",
      "Tarnbeck Borough 5–1 Rushmoor Heath Albion",
      "Juniper Hollow United 1–3 Oakhampton Rise Borough",
    ]);
  });

  it("Given the ?seed=abc league (seed 20260), when matchday 1 is worked out, then its first fixture is Harrowgate Lane United 0–1 Oakhampton Rise Borough @regression @boundary @contract-shape:pure-function", () => {
    expect(scoreLines(20260)[0]).toBe("Harrowgate Lane United 0–1 Oakhampton Rise Borough");
  });

  it("Given the seed-31 league, when its clubs are listed by index, then Netherwold Borough is first and Marlbrook Athletic last, as the golden table assumes @regression @boundary @contract-shape:pure-function", () => {
    const names = generateLeague(31).clubs.map((club) => club.name);
    expect(names[0]).toBe("Netherwold Borough");
    expect(names[7]).toBe("Marlbrook Athletic");
    expect([...names].sort()).toEqual([
      "Fennimore Town", "Juniper Hollow United", "Marlbrook Athletic", "Netherwold Borough",
      "Oakhampton Rise Borough", "Rushmoor Heath Albion", "Tarnbeck Borough", "Valebridge Albion",
    ]);
  });
});
