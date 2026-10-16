// @US-1 (S-002 view my squad)
// CONTRACT_SHAPE: pure-function
// Outcome anchor: DISCUSS Elevator Pitch (feature-delta.md US-1); deriveSeed underpins same-link-same-squad
import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { deriveSeed } from "../../../src/domain/rng";

const anySeed = fc.integer({ min: -2147483648, max: 2147483647 });
const anyStream = fc.integer({ min: -1, max: 7 });

describe("@US-1 S-002 independent seeds are derived from the league seed", () => {
  describe("Given any 32-bit seed and stream, when a seed is derived", () => {
    it("then the result is a signed 32-bit integer @property @driving_port", () => {
      fc.assert(
        fc.property(anySeed, anyStream, (seed, stream) => {
          const derived = deriveSeed(seed, stream);
          expect(Number.isInteger(derived)).toBe(true);
          expect(derived).toBeGreaterThanOrEqual(-2147483648);
          expect(derived).toBeLessThanOrEqual(2147483647);
        }),
      );
    });

    it("then deriving twice gives the same value @property @determinism", () => {
      fc.assert(fc.property(anySeed, anyStream, (seed, stream) => deriveSeed(seed, stream) === deriveSeed(seed, stream)));
    });
  });

  describe("Given typical seeds, when different streams are derived", () => {
    it.each([1, 4242, 31, 0, -1])("then the 9 streams -1..7 of seed %i give distinct values", (seed) => {
      const values = [-1, 0, 1, 2, 3, 4, 5, 6, 7].map((stream) => deriveSeed(seed, stream));
      expect(new Set(values).size).toBe(values.length);
    });

    it("then seeds 1 and 4242 differ on the same stream @driving_port", () => {
      expect(deriveSeed(1, 0)).not.toBe(deriveSeed(4242, 0));
    });
  });
});
