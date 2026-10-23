// @US-1 @US-2 (S-006 play my first match) @regression
// CONTRACT_SHAPE: pure-function
// Outcome anchor: DESIGN D7 and ADR-0011 "Expected golden matches": the goldens (seed 31 and seed 20260 fixture 0, seed 8 fixture 3)
// were computed from these real generator values. This test pins the inputs (club names behind the indices, the sum of the 11
// overalls of each automatic 4-4-2 XI, the scorers' squads), so a change to the league or squad generator turns this file red
// and the held-out match goldens stay meaningful. It uses no S-006 module and passes before and after DELIVER.
import { describe, expect, it } from "vitest";
import { generateLeague } from "../../../src/domain/league";
import { automaticXI } from "../../../src/domain/selection";
import { generateSquad } from "../../../src/domain/squad";

const strength = (seed: number, clubIndex: number): number => {
  const squad = generateSquad(seed, clubIndex);
  return automaticXI(squad, "4-4-2").reduce((sum, index) => sum + squad[index]!.overall, 0);
};
const names = (seed: number): string[] => generateLeague(seed).clubs.map((club) => club.name);

describe("@US-1 @US-2 S-006 the leagues and elevens behind the expected matches are the ones DESIGN used", () => {
  it("Given seed 31, when its eight clubs are listed, then their names are the ones in ADR-0011 (club 0 Netherwold Borough, club 7 Marlbrook Athletic) @regression @contract-shape:pure-function", () => {
    expect(names(31)).toEqual([
      "Netherwold Borough", "Fennimore Town", "Rushmoor Heath Albion", "Juniper Hollow United",
      "Oakhampton Rise Borough", "Tarnbeck Borough", "Valebridge Albion", "Marlbrook Athletic",
    ]);
  });

  it("Given seed 31 matchday 1, when each club's automatic 4-4-2 strength is summed, then it is 130 and 143 for the golden fixture, and the three other fixtures are as DESIGN recorded @regression @contract-shape:pure-function", () => {
    expect([strength(31, 0), strength(31, 7)]).toEqual([130, 143]);
    expect([strength(31, 1), strength(31, 6)]).toEqual([131, 124]);
    expect([strength(31, 5), strength(31, 2)]).toEqual([154, 141]);
    expect([strength(31, 3), strength(31, 4)]).toEqual([144, 171]);
  });

  it("Given the default seed 20260 (what ?seed=abc gives), when clubs 0 and 7 are read, then they are Harrowgate Lane United (152) and Oakhampton Rise Borough (138) @regression @contract-shape:pure-function", () => {
    expect([names(20260)[0], names(20260)[7]]).toEqual(["Harrowgate Lane United", "Oakhampton Rise Borough"]);
    expect([strength(20260, 0), strength(20260, 7)]).toEqual([152, 138]);
  });

  it("Given seed 8, when clubs 3 and 4 are read, then they are Mossdale Athletic (153) and Pickering Dene Rovers (161), the goalless fixture the empty-list check relies on @regression @boundary @contract-shape:pure-function", () => {
    expect([names(8)[3], names(8)[4]]).toEqual(["Mossdale Athletic", "Pickering Dene Rovers"]);
    expect([strength(8, 3), strength(8, 4)]).toEqual([153, 161]);
  });

  it("Given the golden scorers, when their squads are read, then Rurik Fairbourne is a forward of Marlbrook Athletic, Calder Redfern a midfielder of Netherwold Borough and Joren Northcott a forward of Oakhampton Rise Borough @regression @contract-shape:pure-function", () => {
    const find = (seed: number, club: number, name: string) => generateSquad(seed, club).find((player) => player.name === name)?.position;
    expect(find(31, 7, "Rurik Fairbourne")).toBe("FW");
    expect(find(31, 0, "Calder Redfern")).toBe("MF");
    expect(find(20260, 7, "Joren Northcott")).toBe("FW");
  });
});
