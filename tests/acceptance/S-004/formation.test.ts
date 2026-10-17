// @US-1 (S-004 choose a formation): the formation data (brief port 11, ADR-0007 (1)).
// CONTRACT_SHAPE: pure-function (frozen constants and return-only functions; the data never depends on a seed)
// Outcome anchor: DISCUSS Elevator Pitch (feature-delta.md US-1): after Sam taps "4-3-3" the list "Line-up" reads
// GK, DF, DF, DF, DF, MF, MF, MF, FW, FW, FW.
// Hand-off: every scenario is pending (it.skip) until DELIVER implements src/domain/formation.ts (scaffold today).
// DELIVER: unskip ONE scenario at a time (it.skip becomes it), make it green, commit, repeat. Never edit an assertion to fit the code.
import fc from "fast-check";
import { describe, expect, it } from "vitest";
import {
  DEFAULT_FORMATION,
  FORMATIONS,
  formationLines,
  isFormationId,
  lineUp,
  type FormationId,
} from "../../../src/domain/formation";
import type { Position } from "../../../src/domain/squad";

const ORDER: readonly Position[] = ["GK", "DF", "MF", "FW"];
const COUNTS: Readonly<Record<FormationId, readonly [number, number, number, number]>> = {
  "4-4-2": [1, 4, 4, 2],
  "4-3-3": [1, 4, 3, 3],
  "4-2-3-1": [1, 4, 5, 1],
};
const ids = fc.constantFrom<FormationId>("4-4-2", "4-3-3", "4-2-3-1");
const expand = (id: FormationId): Position[] =>
  formationLines(id).flatMap((line) => Array.from({ length: line.count }, () => line.position));

describe("@US-1 S-004 the three formations and their 11-slot line-ups", () => {
  it.skip("Given the game's formations, when Sam looks at the choices, then they are 4-4-2, 4-3-3 and 4-2-3-1 in that order, and a new game starts at 4-4-2 @driving_port @contract-shape:pure-function", () => {
    expect([...FORMATIONS]).toEqual(["4-4-2", "4-3-3", "4-2-3-1"]);
    expect(DEFAULT_FORMATION).toBe("4-4-2");
  });

  it.skip.each([
    ["4-4-2", ["GK", "DF", "DF", "DF", "DF", "MF", "MF", "MF", "MF", "FW", "FW"]],
    ["4-3-3", ["GK", "DF", "DF", "DF", "DF", "MF", "MF", "MF", "FW", "FW", "FW"]],
    ["4-2-3-1", ["GK", "DF", "DF", "DF", "DF", "MF", "MF", "MF", "MF", "MF", "FW"]],
  ] as const)("Given the formation %s, when its line-up is read, then it reads %j (4-2-3-1 has no finer split: five MF) @driving_port @contract-shape:pure-function", (id, codes) => {
    expect([...lineUp(id)]).toEqual(codes);
  });

  it.skip("Given any formation, when its line-up is read, then it has 11 codes, one GK first, then DF, MF, FW in that order, with the counts 1/4/4/2, 1/4/3/3 or 1/4/5/1 @property @contract-shape:pure-function", () => {
    fc.assert(
      fc.property(ids, (id) => {
        const codes = lineUp(id);
        expect(codes).toHaveLength(11);
        expect(codes[0]).toBe("GK");
        const ranks = codes.map((code) => ORDER.indexOf(code));
        expect(ranks.every((rank) => rank >= 0)).toBe(true);
        expect(ranks).toEqual([...ranks].sort((a, b) => a - b));
        expect(ORDER.map((position) => codes.filter((code) => code === position).length)).toEqual([...COUNTS[id]]);
      }),
    );
  });

  it.skip("Given any formation, when its pitch lines are read, then expanding them gives exactly the line-up, GK line first, and 4-2-3-1 has two midfield lines of 2 and 3 @property @contract-shape:pure-function", () => {
    fc.assert(
      fc.property(ids, (id) => {
        expect(expand(id)).toEqual([...lineUp(id)]);
        expect(formationLines(id)[0]).toEqual({ position: "GK", count: 1 });
        expect(formationLines(id).every((line) => line.count >= 1)).toBe(true);
      }),
    );
    const midfield = formationLines("4-2-3-1").filter((line) => line.position === "MF");
    expect(midfield.map((line) => line.count)).toEqual([2, 3]);
  });

  it.skip("Given the formation data, when it is read twice or tampered with, then it is the same and deeply frozen @property @contract-shape:pure-function", () => {
    expect(Object.isFrozen(FORMATIONS)).toBe(true);
    fc.assert(
      fc.property(ids, (id) => {
        expect(formationLines(id)).toEqual(formationLines(id));
        expect([...lineUp(id)]).toEqual([...lineUp(id)]);
        const lines = formationLines(id);
        expect(Object.isFrozen(lines)).toBe(true);
        for (const line of lines) expect(Object.isFrozen(line)).toBe(true);
      }),
    );
  });

  it.skip("Given the three known names, when they are checked, then each is accepted @driving_port @contract-shape:pure-function", () => {
    for (const id of ["4-4-2", "4-3-3", "4-2-3-1"]) expect(isFormationId(id)).toBe(true);
  });

  it.skip.each(["3-5-2", "", "4-4-2 ", " 4-4-2", "4-4-2\n", "4-3-3-0", "4-2-3-1-", "442", "4-4-2/4-3-3"])(
    "Given the unknown formation name %j, when it is checked, then it is rejected @error @contract-shape:pure-function",
    (value) => {
      expect(isFormationId(value)).toBe(false);
    },
  );

  it.skip("Given any text, when it is checked, then it is accepted only when it is one of the three names @property @error @contract-shape:pure-function", () => {
    fc.assert(
      fc.property(fc.string(), (value) => {
        expect(isFormationId(value)).toBe(["4-4-2", "4-3-3", "4-2-3-1"].includes(value));
      }),
    );
  });
});
