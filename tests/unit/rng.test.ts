import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { createRng, nextFloat } from "../../src/domain/rng";

describe("seeded rng", () => {
  it("is deterministic for the same seed", () => {
    fc.assert(
      fc.property(fc.integer(), (seed) => {
        const a = nextFloat(createRng(seed));
        const b = nextFloat(createRng(seed));
        expect(a).toEqual(b);
      }),
    );
  });

  it("produces values in [0, 1)", () => {
    fc.assert(
      fc.property(fc.integer(), (seed) => {
        const { value } = nextFloat(createRng(seed));
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThan(1);
      }),
    );
  });
});
