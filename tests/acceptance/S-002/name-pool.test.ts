// @US-1 (S-002 view my squad)
// CONTRACT_SHAPE: pure-function
// Outcome anchor: DISCUSS Elevator Pitch (feature-delta.md US-1): 18 players per club, names that are fictional and never clash with the row's numbers
// Enumerates the WHOLE name pool (ADR-0005 d, f), not only generated squads.
import { describe, expect, it } from "vitest";
import { FIRST_NAMES, SURNAMES } from "../../../src/domain/names";
import { REAL_PLAYER_DENYLIST } from "../../unit/fixtures/real-player-denylist";

const combos = FIRST_NAMES.flatMap((first) => SURNAMES.map((surname) => `${first} ${surname}`));
const WORD = /^[\p{L}'-]+$/u;

describe("@US-1 S-002 the player name pool is large, clean and fictional", () => {
  it("Given the pool, then it offers at least 30 first names, 30 surnames and 144 combinations @error-boundary", () => {
    expect(FIRST_NAMES.length).toBeGreaterThanOrEqual(30);
    expect(SURNAMES.length).toBeGreaterThanOrEqual(30);
    expect(combos.length).toBeGreaterThanOrEqual(144);
  });

  it("Given every entry, then it is one word of letters, hyphens or apostrophes, with no space or digit @error-boundary", () => {
    const entries = [...FIRST_NAMES, ...SURNAMES];
    expect(entries.length).toBeGreaterThan(0);
    expect(entries.filter((entry) => !WORD.test(entry))).toEqual([]);
  });

  it("Given every entry, then none is a standalone GK, DF, MF or FW token @error-boundary", () => {
    const entries = [...FIRST_NAMES, ...SURNAMES];
    expect(entries.length).toBeGreaterThan(0);
    expect(entries.filter((entry) => /^(GK|DF|MF|FW)$/i.test(entry))).toEqual([]);
  });

  it("Given every first name and surname, then all full names are distinct @error-boundary", () => {
    expect(combos.length).toBeGreaterThan(0);
    expect(new Set(combos.map((c) => c.toLowerCase())).size).toBe(combos.length);
  });

  it("Given every full name the pool can produce, then none is a real footballer @error-boundary", () => {
    expect(combos.length).toBeGreaterThan(0);
    const real = new Set(REAL_PLAYER_DENYLIST.map((n) => n.toLowerCase()));
    expect(combos.filter((c) => real.has(c.toLowerCase()))).toEqual([]);
  });
});
