// @US-1 (S-001 start a new game and pick a club)
// CONTRACT_SHAPE: pure-function
// Outcome anchor: DISCUSS Elevator Pitch (feature-delta.md US-1)
import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { generateLeague } from "../../../src/domain/league";

const anySeed = fc.integer({ min: -2147483648, max: 2147483647 });

describe("@US-1 S-001 a league is generated from a seed", () => {
  describe("Given any 32-bit seed, when the league is generated", () => {
    it("then it holds exactly 8 clubs @property @driving_port", () => {
      fc.assert(fc.property(anySeed, (seed) => generateLeague(seed).clubs.length === 8));
    });

    it("then the 8 club names are non-empty and unique @property", () => {
      fc.assert(
        fc.property(anySeed, (seed) => {
          const names = generateLeague(seed).clubs.map((c) => c.name);
          expect(names.every((n) => n.trim().length > 0)).toBe(true);
          expect(new Set(names).size).toBe(8);
        }),
      );
    });

    it("then each club has two distinct colours @property", () => {
      fc.assert(
        fc.property(anySeed, (seed) => {
          for (const club of generateLeague(seed).clubs) {
            expect(club.colours).toHaveLength(2);
            expect(club.colours[0]).not.toBe(club.colours[1]);
          }
        }),
      );
    });

    it("then every club has its own id @property", () => {
      fc.assert(
        fc.property(anySeed, (seed) => {
          const ids = generateLeague(seed).clubs.map((c) => c.id);
          expect(new Set(ids).size).toBe(8);
        }),
      );
    });
  });

  describe("Given the same seed twice", () => {
    it("then the two leagues are identical @property @determinism", () => {
      fc.assert(fc.property(anySeed, (seed) => {
        expect(generateLeague(seed)).toEqual(generateLeague(seed));
      }));
    });
  });

  describe("Given two different seeds", () => {
    it("then seeds 1 and 4242 give different leagues", () => {
      expect(generateLeague(1)).not.toEqual(generateLeague(4242));
    });

    it("then the club names differ between seeds 1 and 4242", () => {
      const names = (seed: number) => generateLeague(seed).clubs.map((c) => c.name);
      expect(names(1)).not.toEqual(names(4242));
    });
  });

  describe("Boundary seeds", () => {
    it.each([0, -1, 2147483647, -2147483648])("then seed %i still gives 8 unique clubs @error-boundary", (seed) => {
      const names = generateLeague(seed).clubs.map((c) => c.name);
      expect(new Set(names).size).toBe(8);
    });
  });
});
