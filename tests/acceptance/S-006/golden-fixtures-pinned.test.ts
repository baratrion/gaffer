// @US-1 @US-2 (S-006 play my first match) @regression
// CONTRACT_SHAPE: pure-function
// Outcome anchor: DESIGN D7 and ADR-0011 "Expected golden matches": the goldens name real generator output (clubs, scorers,
// team strengths) computed on 2026-10-20. This file pins those premises, so a change to the league or squad generator turns
// THIS file red and the golden-match specs stay true. Passes before and after DELIVER (generators are not touched by S-006).
import { describe, expect, it } from "vitest";
import { generateLeague } from "../../../src/domain/league";
import { automaticXI } from "../../../src/domain/selection";
import { generateSquad } from "../../../src/domain/squad";

const clubName = (seed: number, index: number): string => generateLeague(seed).clubs[index]?.name ?? "";
const strength442 = (seed: number, clubIndex: number): number => {
  const squad = generateSquad(seed, clubIndex);
  return automaticXI(squad, "4-4-2").reduce((sum, index) => sum + (squad[index]?.overall ?? 0), 0);
};
const starterNames = (seed: number, clubIndex: number): string[] => {
  const squad = generateSquad(seed, clubIndex);
  return automaticXI(squad, "4-4-2").map((index) => squad[index]?.name ?? "");
};

describe("@US-1 S-006 the clubs and strengths behind the expected golden matches are the ones DESIGN computed", () => {
  it("Given seed 31, when its league is generated, then the matchday-1 clubs are the ones the golden and its three reference fixtures name @regression @contract-shape:pure-function", () => {
    expect([0, 7, 1, 6, 5, 2, 3, 4].map((index) => clubName(31, index))).toEqual([
      "Netherwold Borough", "Marlbrook Athletic", "Fennimore Town", "Valebridge Albion",
      "Tarnbeck Borough", "Rushmoor Heath Albion", "Juniper Hollow United", "Oakhampton Rise Borough",
    ]);
  });

  it("Given seed 20260 (what ?seed=abc gives), when its league is generated, then clubs 0 and 7 are the golden's clubs @regression @contract-shape:pure-function", () => {
    expect([clubName(20260, 0), clubName(20260, 7)]).toEqual(["Harrowgate Lane United", "Oakhampton Rise Borough"]);
  });

  it("Given seed 8, when its league is generated, then clubs 3 and 4 are the goalless fixture the empty-list probe opens @regression @contract-shape:pure-function", () => {
    expect([clubName(8, 3), clubName(8, 4)]).toEqual(["Mossdale Athletic", "Pickering Dene Rovers"]);
  });

  it("Given the automatic 4-4-2 elevens, when each is summed over its overalls, then the golden strengths are 130 v 143 (seed 31) and 152 v 138 (seed 20260) @regression @contract-shape:pure-function", () => {
    expect([strength442(31, 0), strength442(31, 7)]).toEqual([130, 143]);
    expect([strength442(20260, 0), strength442(20260, 7)]).toEqual([152, 138]);
  });

  it("Given the golden scorers, when the elevens are read, then Calder Redfern starts for Netherwold Borough, Rurik Fairbourne for Marlbrook Athletic and Joren Northcott for Oakhampton Rise Borough @regression @contract-shape:pure-function", () => {
    expect(starterNames(31, 0)).toContain("Calder Redfern");
    expect(starterNames(31, 7)).toContain("Rurik Fairbourne");
    expect(starterNames(20260, 7)).toContain("Joren Northcott");
  });
});
