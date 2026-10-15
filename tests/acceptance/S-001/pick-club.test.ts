import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { DEFAULT_SEED, parseSeed } from "../../../src/app/seed";
import { initialState, update } from "../../../src/app/state";
import { generateLeague } from "../../../src/domain/league";

const seeds = fc.integer({ min: -2147483648, max: 2147483647 });

// @US-1 @property @contract-shape:pure-function
describe("S-001 league from a seed (driving port: generateLeague)", () => {
  it("has 8 clubs with unique names and two distinct colours, for any seed", () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { clubs } = generateLeague(seed);
        expect(clubs).toHaveLength(8);
        expect(new Set(clubs.map((c) => c.name)).size).toBe(8);
        expect(new Set(clubs.map((c) => c.id)).size).toBe(8);
        for (const c of clubs) {
          expect(c.name.length).toBeGreaterThan(0);
          expect(c.colours[0]).not.toBe(c.colours[1]);
        }
      }),
    );
  });

  it("is deterministic: the same seed gives a deep-equal league", () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        expect(generateLeague(seed)).toEqual(generateLeague(seed));
      }),
    );
  });

  it("differs between seeds", () => {
    const names = (s: number) => generateLeague(s).clubs.map((c) => c.name).join("|");
    expect(names(1)).not.toBe(names(2));
    expect(names(4242)).not.toBe(names(DEFAULT_SEED));
  });
});

// @US-1 @error @contract-shape:pure-function
describe("S-001 seed parsing (driving port: parseSeed)", () => {
  it.each([
    ["?seed=4242", 4242],
    ["?seed=-7", -7],
    ["?seed=007", 7],
    ["?foo=1&seed=5", 5],
    ["?seed=2147483647", 2147483647],
    ["?seed=-2147483648", -2147483648],
  ])("accepts %s", (search, expected) => expect(parseSeed(search)).toBe(expected));

  it.each(["", "?", "?seed=", "?seed=abc", "?seed=1.5", "?seed=9999999999", "?seed=2147483648", "?seed=-2147483649", "?seed=1e3", "?seed=%2B5"])(
    "falls back to the default for %j",
    (search) => expect(parseSeed(search)).toBe(DEFAULT_SEED),
  );
});

// @US-1 @driving_port @contract-shape:bounded-change
describe("S-001 navigation (driving port: update)", () => {
  it("title -> pick club -> club home for the chosen club", () => {
    const start = initialState("?seed=4242");
    expect(start.screen).toEqual({ kind: "title" });
    const picking = update(start, { type: "newGame" });
    expect(picking.screen).toEqual({ kind: "pickClub" });
    const club = picking.league.clubs[5];
    if (!club) throw new Error("expected 8 clubs");
    const home = update(picking, { type: "pickClub", clubId: club.id });
    expect(home.screen).toEqual({ kind: "clubHome", clubId: club.id });
  });

  it("ignores an unknown club id", () => {
    const picking = update(initialState(""), { type: "newGame" });
    expect(update(picking, { type: "pickClub", clubId: "nope" })).toEqual(picking);
  });

  it("uses the default league without a valid seed", () => {
    expect(initialState("?seed=abc").league).toEqual(initialState("").league);
    expect(initialState("").league).toEqual(generateLeague(DEFAULT_SEED));
  });
});
