// @US-1 @US-2 (S-005 pick my starting XI)
// CONTRACT_SHAPE: pure-function
// Outcome anchor: DISCUSS Elevator Pitch (feature-delta.md US-1, US-2): on Netherwold Borough's home Sam taps "Starting XI" and
// sees "GK Tamsin Ingleby 17" to "FW Garrick Thistlewood 5"; tapping "MF Dorian Dunmore 7", then "Kestrel Northcott 6", puts
// Northcott in that slot. Rules D5 (a slot holds only its position), D6 (best overall, ties in squad order), D8 (replace/swap).
// Universe: the returned array only (pure, return-only); inputs are deep-frozen to prove they are never mutated.
// Destination: tests/acceptance/S-005/selection.test.ts (DELIVER step 01).
import fc from "fast-check";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { FORMATIONS, lineUp, type FormationId } from "../../../src/domain/formation";
import { automaticXI, isSlotIndex, pickForSlot, playersForPosition } from "../../../src/domain/selection";
import { generateSquad, PLAYERS_PER_SQUAD, type Player, type Position } from "../../../src/domain/squad";

const POSITIONS: readonly Position[] = ["GK", "DF", "MF", "FW"];
const DEFAULT_SEED = 20260; // what ?seed=abc gives
const NETHERWOLD = generateSquad(31, 0);
const OAKHAMPTON = generateSquad(DEFAULT_SEED, 7);

const anySeed = fc.integer({ min: -(2 ** 31), max: 2 ** 31 - 1 });
const anyClub = fc.integer({ min: 0, max: 7 });
const anyFormation = fc.constantFrom(...FORMATIONS);
const anySlot = fc.integer({ min: 0, max: 10 });
const anyPlayer = fc.integer({ min: 0, max: PLAYERS_PER_SQUAD - 1 });
const anySquad = fc.tuple(anySeed, anyClub).map(([seed, club]) => generateSquad(seed, club));

const deepFreeze = <T>(value: T): T => {
  if (typeof value === "object" && value !== null && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const child of Object.values(value)) deepFreeze(child);
  }
  return value;
};
const label = ({ position, name, overall }: Player): string => `${position} ${name} ${overall}`;
const labels = (squad: readonly Player[], xi: readonly number[]): string[] => xi.map((index) => label(squad[index]!));
const isValidXI = (squad: readonly Player[], formation: FormationId, xi: readonly number[]): boolean =>
  xi.length === 11 &&
  new Set(xi).size === 11 &&
  xi.every((index, slot) => Number.isInteger(index) && index >= 0 && index < PLAYERS_PER_SQUAD && squad[index]?.position === lineUp(formation)[slot]);
/** A reachable XI: the automatic one followed by some picks (invalid ones leave it as it was). */
const anyXIFor = (squad: readonly Player[], formation: FormationId) =>
  fc.array(fc.tuple(anySlot, anyPlayer), { maxLength: 12 }).map((picks) =>
    picks.reduce((xi, [slot, player]) => pickForSlot({ squad, formation, xi }, slot, player) ?? xi, automaticXI(squad, formation)),
  );

const anyContext = fc
  .tuple(anySquad, anyFormation)
  .chain(([squad, formation]) => anyXIFor(squad, formation).map((xi) => ({ squad, formation, xi })));

describe("@US-1 S-005 the automatic eleven: the best-rated player of each position, ties in squad order", () => {
  describe("Given Netherwold Borough (seed 31, first club)", () => {
    it("when the 4-4-2 XI is chosen, then it is the DISCUSS eleven, from GK Tamsin Ingleby 17 to FW Garrick Thistlewood 5 @walking_skeleton @driving_port @example @contract-shape:pure-function", () => {
      expect(automaticXI(NETHERWOLD, "4-4-2")).toEqual([0, 7, 3, 6, 2, 9, 12, 8, 10, 17, 14]);
      expect(labels(NETHERWOLD, automaticXI(NETHERWOLD, "4-4-2"))).toEqual([
        "GK Tamsin Ingleby 17", "DF Bram Pemberly 19", "DF Calder Ashcombe 18", "DF Quill Crossley 4", "DF Quill Yarrow 3",
        "MF Ivo Elderkin 18", "MF Joren Dalrymple 16", "MF Calder Redfern 15", "MF Dorian Dunmore 7",
        "FW Merrick Hartwell 8", "FW Garrick Thistlewood 5",
      ]);
    });

    it("when the 4-3-3 XI is chosen, then it is the DISCUSS 4-3-3 eleven (the hyphenated Fitch-Moreton fills the last slot) @example @contract-shape:pure-function", () => {
      expect(automaticXI(NETHERWOLD, "4-3-3")).toEqual([0, 7, 3, 6, 2, 9, 12, 8, 17, 14, 16]);
      expect(labels(NETHERWOLD, automaticXI(NETHERWOLD, "4-3-3")).slice(5)).toEqual([
        "MF Ivo Elderkin 18", "MF Joren Dalrymple 16", "MF Calder Redfern 15", "FW Merrick Hartwell 8", "FW Garrick Thistlewood 5", "FW Finlay Fitch-Moreton 5",
      ]);
    });

    it("when the 4-2-3-1 XI is chosen, then five midfielders and one forward start, the fifth midfielder being Kestrel Northcott 6 @example @boundary @contract-shape:pure-function", () => {
      expect(labels(NETHERWOLD, automaticXI(NETHERWOLD, "4-2-3-1")).slice(5)).toEqual([
        "MF Ivo Elderkin 18", "MF Joren Dalrymple 16", "MF Calder Redfern 15", "MF Dorian Dunmore 7", "MF Kestrel Northcott 6", "FW Merrick Hartwell 8",
      ]);
    });

    it("when three defenders tie at 3 for the last slot, then the earliest in squad order (Quill Yarrow, row 2) starts, and the tied forwards at 5 give Thistlewood (row 14) the slot ahead of Fitch-Moreton (row 16) @boundary @contract-shape:pure-function", () => {
      const xi = automaticXI(NETHERWOLD, "4-4-2");
      expect(xi.includes(2)).toBe(true);
      expect(xi.includes(4) || xi.includes(5)).toBe(false);
      expect(xi.includes(14)).toBe(true);
      expect(xi.includes(16)).toBe(false);
    });
  });

  describe("Given Oakhampton Rise Borough (the default seed 20260, eighth club)", () => {
    it("when the 4-4-2 XI is chosen, then the better goalkeeper (row 1, ahead of row 0) starts and the DISCUSS defenders, midfielders and forwards follow @example @contract-shape:pure-function", () => {
      expect(automaticXI(OAKHAMPTON, "4-4-2")).toEqual([1, 5, 2, 6, 7, 12, 9, 10, 8, 17, 16]);
      expect(labels(OAKHAMPTON, automaticXI(OAKHAMPTON, "4-4-2")).slice(0, 5)).toEqual([
        "GK Alden Hartwell 17", "DF Wystan Redfern 14", "DF Ulric O'Garrity 8", "DF Soren Dalrymple 8", "DF Perrin Dunmore 6",
      ]);
    });

    it("when the 4-2-3-1 XI is chosen, then it is the DISCUSS eleven, Orrin Lockhart 2 winning the tie with Brannock Cardew 2 by squad order @walking_skeleton @driving_port @example @contract-shape:pure-function", () => {
      expect(automaticXI(OAKHAMPTON, "4-2-3-1")).toEqual([1, 5, 2, 6, 7, 12, 9, 10, 8, 11, 17]);
      expect(labels(OAKHAMPTON, automaticXI(OAKHAMPTON, "4-2-3-1"))).toEqual([
        "GK Alden Hartwell 17", "DF Wystan Redfern 14", "DF Ulric O'Garrity 8", "DF Soren Dalrymple 8", "DF Perrin Dunmore 6",
        "MF Niall Stanhope 20", "MF Alden Underby 17", "MF Tamsin Stanhope 12", "MF Ulric Everleigh 8", "MF Orrin Lockhart 2",
        "FW Joren Northcott 19",
      ]);
    });

    it("when the 4-3-3 XI is chosen, then Cormac Marwood 6 takes the third forward slot @example @contract-shape:pure-function", () => {
      expect(labels(OAKHAMPTON, automaticXI(OAKHAMPTON, "4-3-3")).slice(8)).toEqual(["FW Joren Northcott 19", "FW Bram Stanhope 9", "FW Cormac Marwood 6"]);
    });
  });

  describe("Given any seed, any of the 8 clubs and any formation", () => {
    it("then the XI holds 11 different players of the squad, each slot's player has that slot's position @property @contract-shape:pure-function", () => {
      fc.assert(
        fc.property(anySquad, anyFormation, (squad, formation) => {
          expect(isValidXI(squad, formation, automaticXI(squad, formation))).toBe(true);
        }),
      );
    });

    it("then within a position the overalls never rise from one slot to the next, and equal overalls keep squad order @property @contract-shape:pure-function", () => {
      fc.assert(
        fc.property(anySquad, anyFormation, (squad, formation) => {
          const xi = automaticXI(squad, formation);
          xi.forEach((current, slot) => {
            const previous = xi[slot - 1];
            if (previous === undefined || squad[previous]?.position !== squad[current]?.position) return;
            const [before, after] = [squad[previous]!.overall, squad[current]!.overall];
            expect(before > after || (before === after && previous < current), `slot ${slot}`).toBe(true);
          });
        }),
      );
    });

    it("then no player outside the XI beats a starter of his position: a higher overall never sits out, and a tie sits out only with a later squad index @property @contract-shape:pure-function", () => {
      fc.assert(
        fc.property(anySquad, anyFormation, (squad, formation) => {
          const xi = automaticXI(squad, formation);
          squad.forEach((outsider, outsiderIndex) => {
            if (xi.includes(outsiderIndex)) return;
            for (const starterIndex of xi.filter((index) => squad[index]?.position === outsider.position)) {
              const starter = squad[starterIndex]!;
              expect(starter.overall > outsider.overall || (starter.overall === outsider.overall && starterIndex < outsiderIndex)).toBe(true);
            }
          });
        }),
      );
    });

    it("then asking twice gives equal answers and the squad is not changed (even when frozen), so no randomness and no clock are involved @property @contract-shape:pure-function", () => {
      fc.assert(
        fc.property(anySquad, anyFormation, (squad, formation) => {
          const frozen = deepFreeze(structuredClone(squad));
          expect(automaticXI(frozen, formation)).toEqual(automaticXI(squad, formation));
          expect(frozen).toEqual(squad);
        }),
      );
    });

    it("then the XI of a formation is the line-up positions filled in order: its codes equal lineUp(formation) @property @driving_port @contract-shape:pure-function", () => {
      fc.assert(
        fc.property(anySquad, anyFormation, (squad, formation) => {
          expect(automaticXI(squad, formation).map((index) => squad[index]!.position)).toEqual([...lineUp(formation)]);
        }),
      );
    });
  });

  it("Given the selection source, when searched, then it uses no ambient randomness and no wall-clock time @determinism @contract-shape:pure-function", () => {
    const source = readFileSync(join(import.meta.dirname, "..", "..", "..", "src", "domain", "selection.ts"), "utf8");
    expect(source).not.toMatch(/Math\.random|Date|performance\.now|crypto\./);
  });
});

describe("@US-2 S-005 the players of one position, in squad order, for the choose screen", () => {
  it("Given Netherwold Borough, when the midfielders are listed, then they are rows 8..13 in squad order @driving_port @example @contract-shape:pure-function", () => {
    expect(playersForPosition(NETHERWOLD, "MF")).toEqual([8, 9, 10, 11, 12, 13]);
    expect(playersForPosition(NETHERWOLD, "GK")).toEqual([0, 1]);
    expect(playersForPosition(NETHERWOLD, "DF")).toEqual([2, 3, 4, 5, 6, 7]);
    expect(playersForPosition(NETHERWOLD, "FW")).toEqual([14, 15, 16, 17]);
  });

  it("Given any squad, when each position is listed, then there are 2 GK, 6 DF, 6 MF and 4 FW, ascending, all of that position, and together all 18 players @property @contract-shape:pure-function", () => {
    fc.assert(
      fc.property(anySquad, (squad) => {
        const lists = POSITIONS.map((position) => playersForPosition(squad, position));
        expect(lists.map((list) => list.length)).toEqual([2, 6, 6, 4]);
        for (const [i, list] of lists.entries()) {
          expect(list.every((index) => squad[index]?.position === POSITIONS[i])).toBe(true);
          expect([...list].sort((a, b) => a - b)).toEqual([...list]);
        }
        expect(lists.flat().sort((a, b) => a - b)).toEqual(Array.from({ length: PLAYERS_PER_SQUAD }, (_, index) => index));
      }),
    );
  });
});

describe("@US-2 S-005 slots are only 0 to 10", () => {
  it.each([0, 1, 5, 9, 10])("Given %i, then it is a slot @boundary @contract-shape:pure-function", (value) => {
    expect(isSlotIndex(value)).toBe(true);
  });

  it.each([-1, 11, 12, 1.5, 0.5, Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY, -0.5, 10.000001])(
    "Given %s, then it is not a slot @error @boundary @contract-shape:pure-function",
    (value) => {
      expect(isSlotIndex(value)).toBe(false);
    },
  );

  it("Given any integer, then it is a slot exactly when it lies in 0..10 @property @contract-shape:pure-function", () => {
    fc.assert(
      fc.property(fc.integer({ min: -1000, max: 1000 }), (value) => {
        expect(isSlotIndex(value)).toBe(value >= 0 && value <= 10);
      }),
    );
  });
});

describe("@US-2 S-005 Sam picks a player into a slot: a newcomer replaces, a starter swaps, the own player changes nothing", () => {
  const AUTO = automaticXI(NETHERWOLD, "4-4-2");
  const pick = (slot: number, player: number, xi = AUTO) => pickForSlot({ squad: NETHERWOLD, formation: "4-4-2", xi }, slot, player);

  it("Given the automatic XI, when Sam taps MF Dorian Dunmore 7 (the 9th slot) and Kestrel Northcott 6, then Northcott fills that slot, Dunmore is out and the other ten are unchanged @walking_skeleton @driving_port @example @contract-shape:pure-function", () => {
    const next = pick(8, 13)!;
    expect(next).toEqual([0, 7, 3, 6, 2, 9, 12, 8, 13, 17, 14]);
    expect(next.includes(10)).toBe(false);
    expect(labels(NETHERWOLD, next)[8]).toBe("MF Kestrel Northcott 6");
  });

  it("Given the automatic XI, when Sam taps MF Ivo Elderkin 18 (the 6th slot) and Joren Dalrymple 16 Starting, then the two swap: Dalrymple 6th, Elderkin 7th @driving_port @example @contract-shape:pure-function", () => {
    const next = pick(5, 12)!;
    expect(next).toEqual([0, 7, 3, 6, 2, 12, 9, 8, 10, 17, 14]);
    expect(labels(NETHERWOLD, next).slice(5, 7)).toEqual(["MF Joren Dalrymple 16", "MF Ivo Elderkin 18"]);
  });

  it("Given Oakhampton Rise Borough's automatic XI, when Sam taps the goalkeeper Alden Hartwell 17 and then Alden Hartwell 17 Starting, then it is the very same XI @boundary @contract-shape:pure-function", () => {
    const xi = automaticXI(OAKHAMPTON, "4-4-2");
    expect(pickForSlot({ squad: OAKHAMPTON, formation: "4-4-2", xi }, 0, 1)).toBe(xi);
  });

  it("Given any reachable XI, when a player of the slot's position is picked, then the XI is valid, the player holds the slot, and a replace changes exactly one slot, a swap exactly two, the own player none @property @contract-shape:pure-function", () => {
    fc.assert(
      fc.property(
        anyContext,
        anySlot,
        anyPlayer,
        ({ squad, formation, xi }, slot, player) => {
          const next = pickForSlot({ squad, formation, xi }, slot, player);
          if (squad[player]!.position !== lineUp(formation)[slot]) {
            expect(next).toBeUndefined();
            return;
          }
          expect(next).toBeDefined();
          expect(isValidXI(squad, formation, next!)).toBe(true);
          expect(next![slot]).toBe(player);
          const changed = xi.flatMap((value, index) => (value === next![index] ? [] : [index]));
          if (xi[slot] === player) {
            expect(next).toBe(xi);
            expect(changed).toEqual([]);
          } else if (xi.includes(player)) {
            expect(changed).toEqual([slot, xi.indexOf(player)].sort((a, b) => a - b));
            expect(next![xi.indexOf(player)]).toBe(xi[slot]);
          } else {
            expect(changed).toEqual([slot]);
            expect(next!.includes(xi[slot]!)).toBe(false);
          }
        },
      ),
    );
  });

  it("Given any reachable XI, when a player is picked and then the displaced player is picked back into the slot, then the XI is as it was @property @contract-shape:pure-function", () => {
    fc.assert(
      fc.property(
        anyContext,
        anySlot,
        anyPlayer,
        ({ squad, formation, xi }, slot, player) => {
          const next = pickForSlot({ squad, formation, xi }, slot, player);
          fc.pre(next !== undefined && next !== xi);
          const displaced = xi[slot]!;
          expect(pickForSlot({ squad, formation, xi: next! }, slot, displaced)).toEqual(xi);
        },
      ),
    );
  });

  it("Given a XI, when a pick is made, then the XI and the squad are not changed (they are frozen) @property @contract-shape:pure-function", () => {
    fc.assert(
      fc.property(anyContext, anySlot, anyPlayer, ({ squad, formation, xi }, slot, player) => {
        const frozenSquad = deepFreeze(structuredClone(squad));
        const frozenXI = deepFreeze([...xi]);
        pickForSlot({ squad: frozenSquad, formation, xi: frozenXI }, slot, player);
        expect(frozenXI).toEqual(xi);
        expect(frozenSquad).toEqual(squad);
      }),
    );
  });

  it("Given the same inputs twice, then the answers are equal @property @contract-shape:pure-function", () => {
    fc.assert(
      fc.property(anyContext, anySlot, anyPlayer, ({ squad, formation, xi }, slot, player) => {
        expect(pickForSlot({ squad, formation, xi }, slot, player)).toEqual(pickForSlot({ squad, formation, xi }, slot, player));
      }),
    );
  });

  describe("Given a pick that cannot be made", () => {
    it("when the player plays another position (a goalkeeper into a midfield slot), then nothing is picked @error @contract-shape:pure-function", () => {
      expect(pick(8, 0)).toBeUndefined();
      expect(pick(0, 8)).toBeUndefined();
    });

    it("when any player of another position is offered for any slot, then nothing is picked @error @property @contract-shape:pure-function", () => {
      fc.assert(
        fc.property(anyContext, anySlot, anyPlayer, ({ squad, formation, xi }, slot, player) => {
          fc.pre(squad[player]!.position !== lineUp(formation)[slot]);
          expect(pickForSlot({ squad, formation, xi }, slot, player)).toBeUndefined();
        }),
      );
    });

    it.each([-1, 11, 1.5, Number.NaN, 100])("when the slot is %s, then nothing is picked @error @boundary @contract-shape:pure-function", (slot) => {
      expect(pick(slot, 13)).toBeUndefined();
    });

    it.each([-1, 18, 1.5, Number.NaN, 100])("when the player index is %s, then nothing is picked @error @boundary @contract-shape:pure-function", (player) => {
      expect(pick(8, player)).toBeUndefined();
    });

    it("when the slot and the player are the edges that are allowed (slot 10 with row 14, slot 0 with row 1, row 17 into the last slot), then the pick is made @boundary @contract-shape:pure-function", () => {
      expect(pick(10, 15)).toEqual([0, 7, 3, 6, 2, 9, 12, 8, 10, 17, 15]);
      expect(pick(0, 1)).toEqual([1, 7, 3, 6, 2, 9, 12, 8, 10, 17, 14]);
      expect(pick(10, 17)).toEqual([0, 7, 3, 6, 2, 9, 12, 8, 10, 14, 17]);
    });
  });
});
