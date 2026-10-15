import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { generateLeague } from "../../../src/domain/league";
import { CLUB_SUFFIXES, COLOUR_PALETTE, TOWNS } from "../../../src/domain/names";

const REAL_CLUB_DENYLIST: readonly string[] = [
  "Arsenal",
  "Aston Villa",
  "Barcelona",
  "Bayern Munich",
  "Brighton",
  "Celtic",
  "Chelsea",
  "Everton",
  "Fulham",
  "Juventus",
  "Leeds United",
  "Leicester City",
  "Liverpool",
  "Manchester City",
  "Manchester United",
  "Newcastle United",
  "Real Madrid",
  "Rangers",
  "Tottenham Hotspur",
  "West Ham United",
  "Wolverhampton Wanderers",
].map((name) => name.toLowerCase());

const hasNoDuplicates = (items: readonly string[]) => new Set(items).size === items.length;

describe("fictional club naming", () => {
  it("never generates a real club name, nor a real club name as a town", () => {
    fc.assert(
      fc.property(fc.integer({ min: -2147483648, max: 2147483647 }), (seed) => {
        for (const club of generateLeague(seed).clubs) {
          const name = club.name.toLowerCase();
          expect(REAL_CLUB_DENYLIST).not.toContain(name);
          expect(REAL_CLUB_DENYLIST.some((real) => name.startsWith(`${real} `))).toBe(false);
        }
      }),
    );
  });

  it("no possible town and suffix pairing forms a real club name", () => {
    const possibleNames = TOWNS.flatMap((town) => CLUB_SUFFIXES.map((suffix) => `${town} ${suffix}`.toLowerCase()));
    for (const name of possibleNames) expect(REAL_CLUB_DENYLIST).not.toContain(name);
    for (const town of TOWNS) expect(REAL_CLUB_DENYLIST).not.toContain(town.toLowerCase());
  });

  it("word lists hold no duplicates and enough towns to draw eight without replacement", () => {
    expect(hasNoDuplicates(TOWNS)).toBe(true);
    expect(hasNoDuplicates(CLUB_SUFFIXES)).toBe(true);
    expect(hasNoDuplicates(COLOUR_PALETTE)).toBe(true);
    expect(TOWNS.length).toBeGreaterThanOrEqual(24);
    expect(COLOUR_PALETTE.length).toBeGreaterThanOrEqual(2);
  });
});
