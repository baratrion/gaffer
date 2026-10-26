// @US-2 (S-010 save and continue my season)
// CONTRACT_SHAPE: pure-function
// Outcome anchor: ADR-0016 (isLegalXI, a rule of the Selection context): a saved Starting XI is accepted only when it is 11 different players of the
// club's squad, each in the position of its slot. One row per rule (kills the mutants of the nightly run). RED against the scaffold.
import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { FORMATIONS } from "../../../src/domain/formation";
import { automaticXI, isLegalXI, pickForSlot } from "../../../src/domain/selection";
import { generateSquad } from "../../../src/domain/squad";

const squad = generateSquad(31, 0);
const xi = automaticXI(squad, "4-4-2");

describe("@US-2 S-010 a saved Starting XI must be a legal eleven", () => {
  it("Given the automatic eleven of every formation, when checked, then it is a legal eleven for its own line-up only @boundary @contract-shape:pure-function", () => {
    for (const formation of FORMATIONS) expect(isLegalXI(squad, formation, automaticXI(squad, formation)), formation).toBe(true);
    expect(isLegalXI(squad, "4-3-3", xi)).toBe(false);
  });

  it.each([
    ["ten players", xi.slice(0, 10)],
    ["twelve players", [...xi, 17]],
    ["a player twice", [...xi.slice(0, 10), xi[9]!]],
    ["a player of the wrong position", [...xi.slice(0, 10), 0]],
    ["player 18", [...xi.slice(0, 10), 18]],
    ["a player below 0", [...xi.slice(0, 10), -1]],
    ["a fractional player", [...xi.slice(0, 10), 16.5]],
  ])("Given an eleven with %s, when checked, then it is not a legal eleven @error @boundary @contract-shape:pure-function", (_rule, candidate) => {
    expect(isLegalXI(squad, "4-4-2", candidate)).toBe(false);
  });

  it("Given any pick Sam can make from the automatic eleven, when checked, then the result is legal (what the game stores is what it accepts) @property @contract-shape:pure-function", () => {
    fc.assert(fc.property(fc.integer({ min: 0, max: 10 }), fc.integer({ min: 0, max: 17 }), (slot, player) => {
      const picked = pickForSlot({ squad, formation: "4-4-2", xi }, slot, player);
      expect(picked === undefined || isLegalXI(squad, "4-4-2", picked)).toBe(true);
    }));
  });
});
