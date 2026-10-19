// @US-1 (S-005 pick my starting XI) @regression
// CONTRACT_SHAPE: pure-function
// Outcome anchor: DISCUSS US-1 fixtures (H1): the XI examples are real generator rows, produced on 2026-10-18. This test
// pins those rows, so a change to the squad generator turns this file red (not the XI specs) and the examples stay true.
// Rows: [squad index, position, name, overall]. Passes before and after DELIVER (generateSquad is not touched by S-005).
import { describe, expect, it } from "vitest";
import { generateSquad, type Position } from "../../../src/domain/squad";

type Row = readonly [Position, string, number];

const NETHERWOLD: readonly Row[] = [
  ["GK", "Tamsin Ingleby", 17], ["GK", "Alden Zealby", 11],
  ["DF", "Quill Yarrow", 3], ["DF", "Calder Ashcombe", 18], ["DF", "Calder Kilbride", 3],
  ["DF", "Dacey Jessamy", 3], ["DF", "Quill Crossley", 4], ["DF", "Bram Pemberly", 19],
  ["MF", "Calder Redfern", 15], ["MF", "Ivo Elderkin", 18], ["MF", "Dorian Dunmore", 7],
  ["MF", "Finlay Ballantyne", 3], ["MF", "Joren Dalrymple", 16], ["MF", "Kestrel Northcott", 6],
  ["FW", "Garrick Thistlewood", 5], ["FW", "Emlyn Vexford", 2], ["FW", "Finlay Fitch-Moreton", 5], ["FW", "Merrick Hartwell", 8],
];

const OAKHAMPTON: readonly Row[] = [
  ["GK", "Dacey Marwood", 6], ["GK", "Alden Hartwell", 17],
  ["DF", "Ulric O'Garrity", 8], ["DF", "Bram Quarrie", 5], ["DF", "Zander Wetherby", 4],
  ["DF", "Wystan Redfern", 14], ["DF", "Soren Dalrymple", 8], ["DF", "Perrin Dunmore", 6],
  ["MF", "Ulric Everleigh", 8], ["MF", "Alden Underby", 17], ["MF", "Tamsin Stanhope", 12],
  ["MF", "Orrin Lockhart", 2], ["MF", "Niall Stanhope", 20], ["MF", "Brannock Cardew", 2],
  ["FW", "Cormac Marwood", 6], ["FW", "Rurik Pemberly", 4], ["FW", "Bram Stanhope", 9], ["FW", "Joren Northcott", 19],
];

const rows = (seed: number, clubIndex: number): Row[] =>
  generateSquad(seed, clubIndex).map((player): Row => [player.position, player.name, player.overall]);

describe("@US-1 S-005 the squads behind the starting XI examples are the ones DISCUSS wrote down", () => {
  it("Given seed 31, when the first club's squad is generated (Netherwold Borough), then its 18 rows are the DISCUSS rows in squad order @regression @contract-shape:pure-function", () => {
    expect(rows(31, 0)).toEqual(NETHERWOLD);
  });

  it("Given the default seed 20260 (what ?seed=abc gives), when the eighth club's squad is generated (Oakhampton Rise Borough), then its 18 rows are the DISCUSS rows in squad order @regression @contract-shape:pure-function", () => {
    expect(rows(20260, 7)).toEqual(OAKHAMPTON);
  });
});
