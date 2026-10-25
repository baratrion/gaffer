// @US-1 @US-2 (S-008 play the season, matchday by matchday) @regression
// CONTRACT_SHAPE: pure-function
// Outcome anchor: DISCUSS reference season (discuss/reference-season.md): the 14 matchdays at seeds 31 and 20260, every side an automatic
// 4-4-2, are the expected values of the held-out season specs and of the cross-engine e2e. They are worked out here from the domain that
// already exists (generateLeague, fixturesOf, playMatchday, standings) and compared with the plain data of season-reference.ts. If the
// generator, the schedule, the match model or the standings rules ever change, THIS file turns red, not the season specs. S-008 changes
// none of them (no new stream), so it passes before and after DELIVER.
import { describe, expect, it } from "vitest";
import { generateLeague } from "../../../src/domain/league";
import { playMatchday, type PlayedMatch } from "../../../src/domain/match";
import { automaticXI } from "../../../src/domain/selection";
import { generateSquad } from "../../../src/domain/squad";
import { standings } from "../../../src/domain/standings";
import { goalDifferenceText, REFERENCE_20260, REFERENCE_31, TABLE_AFTER_TWO_31, scoreLinesOf, type ReferenceSeason } from "./season-reference";

/** The whole league's season with every side an automatic 4-4-2, matchday by matchday (nobody's picks, nobody's formation). */
const untouchedSeason = (seed: number): readonly (readonly PlayedMatch[])[] => {
  const sides = Array.from({ length: 8 }, (_, club) => {
    const squad = generateSquad(seed, club);
    return { squad, xi: automaticXI(squad, "4-4-2") };
  });
  return Array.from({ length: 14 }, (_, i) => playMatchday({ seed, matchday: i + 1, sides }));
};
const lines = (seed: number, matchdays: readonly (readonly PlayedMatch[])[]): readonly (readonly string[])[] => {
  const names = generateLeague(seed).clubs.map((club) => club.name);
  return matchdays.map((played) => played.map(({ home, away, result }) => `${names[home]} ${result.homeGoals}–${result.awayGoals} ${names[away]}`));
};

describe.each([[REFERENCE_31], [REFERENCE_20260]] as readonly (readonly [ReferenceSeason])[])("@US-2 S-008 the reference season at seed $seed is pinned", (reference) => {
  const { seed } = reference;
  const played = untouchedSeason(seed);

  it("Given every side fields an automatic 4-4-2, when the 14 matchdays are worked out, then each matchday has the four score lines of the reference season, in fixture order @regression @walking_skeleton @boundary @contract-shape:pure-function", () => {
    expect(lines(seed, played)).toEqual(reference.matchdays);
  });

  it("Given the 56 results, when the table is worked out, then it is the reference final table: 8 rows at P 14 in the reference order @regression @boundary @contract-shape:pure-function", () => {
    const rows = standings(generateLeague(seed).clubs, played.flat()).map(({ name, played: p, won, drawn, lost, goalsFor, goalsAgainst, goalDifference, points }) => ({
      name, played: p, won, drawn, lost, goalsFor, goalsAgainst, goalDifference, points,
    }));
    expect(rows).toEqual(reference.table);
    expect(rows.every((row) => row.played === 14)).toBe(true);
  });
});

describe("@US-1 S-008 the tables the stories quote are pinned", () => {
  it("Given the seed-31 results of matchdays 1 and 2, when the table is worked out, then it is US-1 example 1: Tarnbeck Borough first on +4, Netherwold Borough eighth on Pts 0 and GD -2 @regression @boundary @contract-shape:pure-function", () => {
    const league = generateLeague(31);
    const rows = standings(league.clubs, untouchedSeason(31).slice(0, 2).flat());
    expect(rows.map((r) => [r.name, r.played, r.won, r.drawn, r.lost, r.goalDifference, r.points])).toEqual(TABLE_AFTER_TWO_31.map((row) => [...row]));
    expect(goalDifferenceText(rows[7]!.goalDifference)).toBe("-2");
  });

  it("Given the seed-31 results of matchdays 1 to 3, when the table is worked out, then Netherwold Borough is sixth on Pts 3 (the Elevator Pitch) @regression @boundary @contract-shape:pure-function", () => {
    const rows = standings(generateLeague(31).clubs, untouchedSeason(31).slice(0, 3).flat());
    const netherwold = rows.find((r) => r.name === "Netherwold Borough")!;
    expect([netherwold.position, netherwold.points, netherwold.played]).toEqual([6, 3, 3]);
  });

  it("Given the seed-31 reference season, when Netherwold Borough's own fixtures are read, then they are the 14 score lines of US-2 example 1 @regression @boundary @contract-shape:pure-function", () => {
    expect(scoreLinesOf(REFERENCE_31, "Netherwold Borough")).toEqual([
      "Netherwold Borough 1–2 Marlbrook Athletic", "Rushmoor Heath Albion 2–1 Netherwold Borough", "Netherwold Borough 2–1 Oakhampton Rise Borough",
      "Valebridge Albion 1–2 Netherwold Borough", "Netherwold Borough 1–0 Fennimore Town", "Juniper Hollow United 2–0 Netherwold Borough",
      "Netherwold Borough 2–4 Tarnbeck Borough", "Marlbrook Athletic 1–2 Netherwold Borough", "Netherwold Borough 3–1 Rushmoor Heath Albion",
      "Oakhampton Rise Borough 1–1 Netherwold Borough", "Netherwold Borough 2–0 Valebridge Albion", "Fennimore Town 2–2 Netherwold Borough",
      "Netherwold Borough 1–0 Juniper Hollow United", "Tarnbeck Borough 2–1 Netherwold Borough",
    ]);
  });

  it("Given the 20260 reference season, when Oakhampton Rise Borough's fixtures of matchdays 1, 2 and 14 are read, then they are the ones US-1 example 2 and US-2 example 3 quote @regression @boundary @contract-shape:pure-function", () => {
    const own = scoreLinesOf(REFERENCE_20260, "Oakhampton Rise Borough");
    expect([own[0], own[1], own[13]]).toEqual([
      "Harrowgate Lane United 0–1 Oakhampton Rise Borough", "Oakhampton Rise Borough 2–2 Mossdale Wanderers", "Oakhampton Rise Borough 1–1 Ironbridge Fen Wanderers",
    ]);
    expect(REFERENCE_20260.table.slice(0, 2).map((r) => [r.name, r.points])).toEqual([["Valebridge Town", 29], ["Oakhampton Rise Borough", 21]]);
  });

  it("Given a goal difference, when it is written as the table writes it, then it is +N, 0 or -N with an ASCII minus @regression @error @boundary @contract-shape:pure-function", () => {
    expect([14, 4, 1, 0, -1, -2, -15].map(goalDifferenceText)).toEqual(["+14", "+4", "+1", "0", "-1", "-2", "-15"]);
  });
});
