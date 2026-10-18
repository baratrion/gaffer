// @US-1 (S-004 choose a formation)
// CONTRACT_SHAPE: pure-function
// Outcome anchor: DISCUSS Elevator Pitch (feature-delta.md US-1): Sam taps "4-3-3" and sees the list "Line-up" reading
// GK, DF, DF, DF, DF, MF, MF, MF, FW, FW, FW. Every formation lines up 11 slots in GK, DF, MF, FW order, whatever the seed.
// Destination: tests/acceptance/S-004/formation.test.ts (DELIVER step 01).
import fc from "fast-check";
import { describe, expect, it, vi } from "vitest";
import {
  DEFAULT_FORMATION,
  FORMATIONS,
  formationLines,
  isFormationId,
  lineUp,
  type FormationId,
} from "../../../src/domain/formation";

type Code = "GK" | "DF" | "MF" | "FW";
const repeat = (code: Code, count: number): Code[] => Array.from({ length: count }, () => code);
const slots = ([gk, df, mf, fw]: readonly [number, number, number, number]): Code[] => [
  ...repeat("GK", gk),
  ...repeat("DF", df),
  ...repeat("MF", mf),
  ...repeat("FW", fw),
];

// Independent expected data, written out from the DISCUSS decision D4 (not derived from the module).
const EXPECTED: Readonly<Record<string, readonly Code[]>> = {
  "4-4-2": slots([1, 4, 4, 2]),
  "4-3-3": slots([1, 4, 3, 3]),
  "4-2-3-1": slots([1, 4, 5, 1]),
};
const RANK: Readonly<Record<Code, number>> = { GK: 0, DF: 1, MF: 2, FW: 3 };
const anyFormation = fc.constantFrom(...FORMATIONS);

describe("@US-1 S-004 Sam's formations and their line-ups", () => {
  describe("Given the three formations Sam can choose from", () => {
    it("then they are 4-4-2, 4-3-3 and 4-2-3-1, in that order, and a new game starts at 4-4-2 @driving_port @contract-shape:pure-function", () => {
      expect([...FORMATIONS]).toEqual(["4-4-2", "4-3-3", "4-2-3-1"]);
      expect(DEFAULT_FORMATION).toBe("4-4-2");
    });

    it.each(["4-4-2", "4-3-3", "4-2-3-1"] as const)(
      "then the %s line-up reads exactly the expected 11 position codes @driving_port @contract-shape:pure-function",
      (formation) => {
        expect([...lineUp(formation)]).toEqual(EXPECTED[formation]);
      },
    );

    it("then every line-up has 11 slots: one goalkeeper first, then defenders, midfielders and forwards, only GK, DF, MF or FW @property @contract-shape:pure-function", () => {
      fc.assert(
        fc.property(anyFormation, (formation) => {
          const codes = lineUp(formation);
          expect(codes).toHaveLength(11);
          expect(codes[0]).toBe("GK");
          expect(codes.filter((c) => c === "GK")).toHaveLength(1);
          for (const code of codes) expect(Object.keys(RANK)).toContain(code);
          const ranks = codes.map((c) => RANK[c]);
          expect(ranks).toEqual([...ranks].sort((a, b) => a - b));
          expect(codes.filter((c) => c === "DF")).toHaveLength(4);
        }),
      );
    });

    it("then the 4-2-3-1 midfield is five MF slots and the 4-3-3 has three forwards @boundary @contract-shape:pure-function", () => {
      expect(lineUp("4-2-3-1").filter((c) => c === "MF")).toHaveLength(5);
      expect(lineUp("4-2-3-1").filter((c) => c === "FW")).toHaveLength(1);
      expect(lineUp("4-3-3").filter((c) => c === "FW")).toHaveLength(3);
      expect(lineUp("4-4-2").filter((c) => c === "FW")).toHaveLength(2);
    });
  });

  describe("Given the pitch lines of each formation", () => {
    it("then the lines are GK 1, DF 4, then the midfield lines and the forwards (4-2-3-1 has two midfield lines, 2 and 3) @contract-shape:pure-function", () => {
      const line = (position: Code, count: number) => ({ position, count });
      expect(formationLines("4-4-2").map((l) => ({ ...l }))).toEqual([line("GK", 1), line("DF", 4), line("MF", 4), line("FW", 2)]);
      expect(formationLines("4-3-3").map((l) => ({ ...l }))).toEqual([line("GK", 1), line("DF", 4), line("MF", 3), line("FW", 3)]);
      expect(formationLines("4-2-3-1").map((l) => ({ ...l }))).toEqual([
        line("GK", 1),
        line("DF", 4),
        line("MF", 2),
        line("MF", 3),
        line("FW", 1),
      ]);
    });

    it("then the line-up is exactly the lines expanded, so the two cannot disagree @property @contract-shape:pure-function", () => {
      fc.assert(
        fc.property(anyFormation, (formation) => {
          const expanded = formationLines(formation).flatMap(({ position, count }) => repeat(position, count));
          expect([...lineUp(formation)]).toEqual(expanded);
          for (const { count } of formationLines(formation)) expect(Number.isInteger(count) && count > 0).toBe(true);
        }),
      );
    });
  });

  describe("Given the formation data", () => {
    it("then it is deeply frozen: the list, every formation's lines and every line @boundary @contract-shape:pure-function", () => {
      expect(Object.isFrozen(FORMATIONS)).toBe(true);
      for (const formation of FORMATIONS) {
        const lines = formationLines(formation);
        expect(Object.isFrozen(lines), `${formation} lines`).toBe(true);
        for (const line of lines) expect(Object.isFrozen(line), `${formation} line ${line.position}`).toBe(true);
      }
    });

    it("then reading it twice gives equal answers and does not change the data @property @contract-shape:pure-function", () => {
      fc.assert(
        fc.property(anyFormation, (formation) => {
          const before = JSON.stringify([FORMATIONS, formationLines(formation)]);
          expect(lineUp(formation)).toEqual(lineUp(formation));
          expect(formationLines(formation)).toEqual(formationLines(formation));
          expect(JSON.stringify([FORMATIONS, formationLines(formation)])).toBe(before);
        }),
      );
    });

    it("then no ambient randomness or wall-clock time is used @determinism @contract-shape:pure-function", () => {
      const forbidden = () => {
        throw new Error("ambient nondeterminism used");
      };
      vi.spyOn(Math, "random").mockImplementation(forbidden);
      vi.spyOn(Date, "now").mockImplementation(forbidden);
      try {
        for (const formation of FORMATIONS) expect([...lineUp(formation)]).toEqual(EXPECTED[formation]);
      } finally {
        vi.restoreAllMocks();
      }
    });
  });

  describe("Given a text that might name a formation", () => {
    it.each(["4-4-2", "4-3-3", "4-2-3-1"])("then %s is a known formation @contract-shape:pure-function", (text) => {
      expect(isFormationId(text)).toBe(true);
    });

    it.each(["3-5-2", "", "4-4-2 ", " 4-4-2", "4-3-3\n", "442", "4-2-3-1x", "4-2-3", "constructor", "__proto__", "toString", "hasOwnProperty"])(
      "then %j is not a known formation @error @contract-shape:pure-function",
      (text) => {
        expect(isFormationId(text)).toBe(false);
      },
    );

    it("then exactly the three formation names are accepted, whatever other text is offered @property @error @contract-shape:pure-function", () => {
      fc.assert(
        fc.property(fc.oneof(fc.string(), fc.string({ unit: "binary" })), (text) => {
          expect(isFormationId(text)).toBe(["4-4-2", "4-3-3", "4-2-3-1"].includes(text));
        }),
      );
    });

    it("then a known name narrows to a formation Sam can look up @driving_port @contract-shape:pure-function", () => {
      const text: string = "4-3-3";
      if (!isFormationId(text)) throw new Error("expected a known formation");
      const formation: FormationId = text;
      expect(lineUp(formation)).toHaveLength(11);
    });
  });
});
