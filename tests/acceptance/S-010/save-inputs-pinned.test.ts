// @US-1 (S-010 save and continue my season) @regression
// CONTRACT_SHAPE: pure-function
// Outcome anchor: DISCUSS "Seed-31 save text" fixture and DESIGN handoff (goldens, RED-first, never re-pinned from DELIVER output): the pinned text
// is the stored form of the state reached by New game, Netherwold Borough and 2 x (Play match, Back) at ?seed=31, and the standings after matchday 2
// are the hand-derived figures of the DISCUSS user stories. Written against code that exists today (no save code), so it passes before and after
// DELIVER; a model change that makes it red must bump SAVE_VERSION (ADR-0016 Earned Trust 8).
import { describe, expect, it } from "vitest";
import { standingsOf } from "../../../src/app/state";
import { afterMatchdays, homeOf } from "./save-world";
import { DAMAGED_SAVE_TEXT, INCOMPATIBLE_SAVE_TEXT, SEED_31_SAVE_TEXT } from "./save-golden";

const played = afterMatchdays(homeOf(31, 0), 2);

describe("@US-1 S-010 the pinned seed-31 save text is the played season, as recorded", () => {
  it("Given Netherwold Borough at seed 31 after two matches, when its seed, club, formation and results are written in the stored order, then they equal the pinned save text @regression @boundary @contract-shape:pure-function", () => {
    const { league, screen, formation, results } = played;
    expect(screen.kind === "clubHome" && screen.clubId).toBe(league.clubs[0]!.id);
    expect(JSON.stringify({ v: 1, seed: league.seed, clubId: league.clubs[0]!.id, formation, results })).toBe(SEED_31_SAVE_TEXT);
    expect(SEED_31_SAVE_TEXT.length).toBeLessThan(65536);
  });

  it("Given the pinned text, when read as the reference season, then matchday 1 is Netherwold Borough 1-2 Marlbrook Athletic and matchday 2 is Rushmoor Heath Albion 2-1 Netherwold Borough @regression @boundary @contract-shape:pure-function", () => {
    const [first, , , , , second] = JSON.parse(SEED_31_SAVE_TEXT).results;
    expect([first.home, first.away, first.result.homeGoals, first.result.awayGoals]).toEqual([0, 7, 1, 2]);
    expect([second.home, second.away, second.result.homeGoals, second.result.awayGoals]).toEqual([2, 0, 2, 1]);
  });

  it("Given Netherwold Borough after two matches, when Sam reads the table, then the DISCUSS rows read Tarnbeck Borough 4 +4 ... Netherwold Borough P 2 Pts 0 -2 @regression @boundary @contract-shape:pure-function", () => {
    expect(standingsOf(played).map((row) => [row.name, row.points, row.goalDifference])).toEqual([
      ["Tarnbeck Borough", 4, 4], ["Oakhampton Rise Borough", 4, 2], ["Marlbrook Athletic", 4, 1], ["Juniper Hollow United", 3, 0],
      ["Rushmoor Heath Albion", 3, -3], ["Fennimore Town", 2, 0], ["Valebridge Albion", 1, -2], ["Netherwold Borough", 0, -2],
    ]);
  });

  it("Given the pinned text, when damaged (first 100 characters) or set to version 0, then neither is valid JSON of a version-1 save @regression @error @contract-shape:pure-function", () => {
    expect(() => JSON.parse(DAMAGED_SAVE_TEXT)).toThrow();
    expect(JSON.parse(INCOMPATIBLE_SAVE_TEXT).v).toBe(0);
  });
});
