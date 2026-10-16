// @US-1 (S-003 view a player's details)
// CONTRACT_SHAPE: pure-function
// Outcome anchor: DISCUSS Elevator Pitch (feature-delta.md US-1): "Overall 14" on the player screen agrees with the
// four attributes shown below it. Formula and weights: ADR-0006 (1).
// Destination: tests/acceptance/S-003/derive-overall.test.ts (DELIVER step 01).
import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { ATTRIBUTE_ORDER, deriveOverall, OVERALL_WEIGHTS, type Position } from "../../../src/domain/squad";

type Attrs = Parameters<typeof deriveOverall>[1];

const POSITIONS: readonly Position[] = ["GK", "DF", "MF", "FW"];
// Independent copy of the ADR-0006 table (tenths), in ATTRIBUTE_ORDER: goalkeeping, defending, passing, shooting.
const TABLE: Readonly<Record<Position, readonly number[]>> = {
  GK: [7, 1, 2, 0],
  DF: [0, 6, 3, 1],
  MF: [0, 2, 5, 3],
  FW: [0, 1, 3, 6],
};

const attrs = (...[goalkeeping, defending, passing, shooting]: readonly [number, number, number, number]): Attrs => ({ goalkeeping: goalkeeping, defending: defending, passing: passing, shooting: shooting });
const reference = (position: Position, a: Attrs): number =>
  Math.floor((ATTRIBUTE_ORDER.reduce((sum, key, i) => sum + (TABLE[position][i] as number) * a[key], 0) + 5) / 10);

const level = fc.integer({ min: 1, max: 20 });
const anyAttrs = fc.record({ goalkeeping: level, defending: level, passing: level, shooting: level });
const anyPosition = fc.constantFrom(...POSITIONS);
// OVERALL_WEIGHTS may be keyed by attribute or listed by index; reading Object.values keeps this independent of that choice.
const weightsOf = (position: Position): number[] => Object.values(OVERALL_WEIGHTS[position] as unknown as Record<string, number>);

describe("@US-1 S-003 a player's overall is derived from the attributes by position", () => {
  describe("Given the weights of each position", () => {
    it.each(POSITIONS)("then the %s weights are non-negative and add up to 10 @boundary @contract-shape:pure-function", (position) => {
      const weights = weightsOf(position);
      expect(weights).toHaveLength(4);
      expect(weights.every((w) => Number.isInteger(w) && w >= 0)).toBe(true);
      expect(weights.reduce((a, b) => a + b, 0)).toBe(10);
    });

    it.each(POSITIONS)("then the %s weights are the ADR-0006 ones in the order goalkeeping, defending, passing, shooting @contract-shape:pure-function", (position) => {
      expect(weightsOf(position)).toEqual(TABLE[position]);
    });
  });

  describe("Given concrete attributes, when the overall is derived", () => {
    it.each([
      ["GK", attrs(15, 12, 11, 4), 14],
      ["FW", attrs(2, 6, 12, 12), 11],
      ["GK", attrs(20, 1, 1, 1), 14],
      ["DF", attrs(1, 20, 1, 1), 12],
      ["MF", attrs(1, 1, 20, 1), 11],
      ["FW", attrs(1, 1, 1, 20), 12],
      ["MF", attrs(9, 10, 14, 6), 11],
      ["DF", attrs(3, 8, 10, 12), 9],
    ] as const)("then a %s with %j is rated %i @example @contract-shape:pure-function", (position, a, expected) => {
      expect(deriveOverall(position, a)).toBe(expected);
    });

    it("then a weighted sum ending in 5 rounds half up: DF 1/1/6 gives 2, one point less gives 1 @boundary @contract-shape:pure-function", () => {
      expect(deriveOverall("DF", attrs(9, 1, 1, 6))).toBe(2);
      expect(deriveOverall("DF", attrs(9, 1, 1, 5))).toBe(1);
    });

    it.each(POSITIONS)("then a %s whose four attributes are all equal is rated that same value @property @contract-shape:pure-function", (position) => {
      fc.assert(fc.property(level, (v) => deriveOverall(position, attrs(v, v, v, v)) === v));
    });
  });

  describe("Given any position and any attributes from 1 to 20", () => {
    it("then the overall equals the ADR-0006 formula, computed independently @property @driving_port @contract-shape:pure-function", () => {
      fc.assert(fc.property(anyPosition, anyAttrs, (position, a) => deriveOverall(position, a) === reference(position, a)));
    });

    it("then the overall lies between the lowest and the highest attribute, inclusive @property @contract-shape:pure-function", () => {
      fc.assert(
        fc.property(anyPosition, anyAttrs, (position, a) => {
          const v = Object.values(a);
          const overall = deriveOverall(position, a);
          return Number.isInteger(overall) && overall >= Math.min(...v) && overall <= Math.max(...v);
        }),
      );
    });

    it("then raising one attribute never lowers the overall @property @contract-shape:pure-function", () => {
      fc.assert(
        fc.property(anyPosition, anyAttrs, fc.constantFrom(...ATTRIBUTE_ORDER), (position, a, key) => {
          const raised = { ...a, [key]: Math.min(20, a[key] + 1) };
          return deriveOverall(position, raised) >= deriveOverall(position, a);
        }),
      );
    });

    it.each([
      ["GK", "shooting"],
      ["DF", "goalkeeping"],
      ["MF", "goalkeeping"],
      ["FW", "goalkeeping"],
    ] as const)("then a %s's %s does not matter to the overall @property @contract-shape:pure-function", (position, key) => {
      fc.assert(fc.property(anyAttrs, level, (a, other) => deriveOverall(position, { ...a, [key]: other }) === deriveOverall(position, a)));
    });
  });
});
