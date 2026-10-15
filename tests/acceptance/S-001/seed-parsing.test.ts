// @US-1 (S-001 start a new game and pick a club)
// CONTRACT_SHAPE: pure-function
// Outcome anchor: DISCUSS Elevator Pitch (feature-delta.md US-1)
import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { DEFAULT_SEED, parseSeed } from "../../../src/app/seed";

describe("@US-1 S-001 the seed comes from the web address", () => {
  describe("Given a valid seed in the address", () => {
    it.each([
      ["?seed=4242", 4242],
      ["?seed=007", 7],
      ["?seed=-5", -5],
      ["?seed=2147483647", 2147483647],
      ["?seed=-2147483648", -2147483648],
    ])("then %s gives seed %i @driving_port", (search, expected) => {
      expect(parseSeed(search)).toBe(expected);
    });

    it("then any 32-bit seed is used as given @property", () => {
      fc.assert(
        fc.property(fc.integer({ min: -2147483648, max: 2147483647 }), (n) => parseSeed(`?seed=${n}`) === n),
      );
    });
  });

  describe("Given an invalid or missing seed", () => {
    it.each(["", "?", "?seed=", "?seed=abc", "?seed=1.5", "?seed=9999999999", "?seed=-2147483649", "?other=3", "?seed=+5"])(
      "then %j falls back to the default seed @error",
      (search) => {
        expect(parseSeed(search)).toBe(DEFAULT_SEED);
      },
    );

    it("then any non-numeric seed falls back to the default seed @property @error", () => {
      fc.assert(
        fc.property(
          fc.string().filter((s) => !/^-?\d{1,10}$/.test(s)),
          (s) => parseSeed(`?seed=${encodeURIComponent(s)}`) === DEFAULT_SEED,
        ),
      );
    });
  });
});
