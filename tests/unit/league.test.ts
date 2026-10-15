import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { generateLeague } from "../../src/domain/league";
import { PALETTE, SUFFIXES, TOWNS } from "../../src/domain/names";
import { deriveSeed } from "../../src/domain/rng";
import { REAL_CLUB_DENYLIST } from "./fixtures/real-club-denylist";

describe("name lists", () => {
  it("offer at least 24 distinct towns and 2 colours", () => {
    expect(new Set(TOWNS).size).toBeGreaterThanOrEqual(24);
    expect(SUFFIXES.length).toBeGreaterThan(0);
    expect(PALETTE.length).toBeGreaterThanOrEqual(2);
  });

  it("never produce a real club name", () => {
    fc.assert(
      fc.property(fc.integer(), (seed) => {
        const names = generateLeague(seed).clubs.map((c) => c.name);
        for (const real of REAL_CLUB_DENYLIST) expect(names).not.toContain(real);
      }),
    );
  });
});

describe("deriveSeed", () => {
  it("is pure and differs between indices", () => {
    expect(deriveSeed(42, 0)).toBe(deriveSeed(42, 0));
    expect(deriveSeed(42, 0)).not.toBe(deriveSeed(42, 1));
    expect(Number.isInteger(deriveSeed(-5, 3))).toBe(true);
  });
});
