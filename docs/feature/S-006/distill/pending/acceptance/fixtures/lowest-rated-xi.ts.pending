// Test fixture for the D7(b) calibration (DESIGN handoff): XIs of a given squad that are weaker or stronger than the automatic one.
// Not production code. Uses only existing modules (selection, formation, squad).
// Destination: tests/acceptance/S-006/fixtures/lowest-rated-xi.ts (DELIVER step 01).
import { lineUp, type FormationId } from "../../../../src/domain/formation";
import { automaticXI, pickForSlot, playersForPosition, type StartingXI } from "../../../../src/domain/selection";
import type { Player, Position } from "../../../../src/domain/squad";

const POSITIONS: readonly Position[] = ["GK", "DF", "MF", "FW"];

/** Per position, the lowest overall first (ties by ascending squad index), dealt in lineUp order. */
export const lowestRatedXI = (squad: readonly Player[], formation: FormationId): StartingXI => {
  const worstFirst = Object.fromEntries(
    POSITIONS.map((position) => [
      position,
      [...playersForPosition(squad, position)].sort((a, b) => squad[a]!.overall - squad[b]!.overall || a - b),
    ]),
  ) as Record<Position, number[]>;
  const taken: Record<Position, number> = { GK: 0, DF: 0, MF: 0, FW: 0 };
  return lineUp(formation).map((position) => {
    const chosen = worstFirst[position][taken[position]]!;
    taken[position] += 1;
    return chosen;
  });
};

export const sumOfOveralls = (squad: readonly Player[], xi: StartingXI): number => xi.reduce((sum, index) => sum + squad[index]!.overall, 0);

/** The lowest-rated XI with slots handed to the automatic XI's players, one slot at a time, until it is at least `gain` stronger. */
export const raisedXI = (squad: readonly Player[], formation: FormationId, gain: number): StartingXI => {
  const best = automaticXI(squad, formation);
  const floor = sumOfOveralls(squad, lowestRatedXI(squad, formation));
  let xi = lowestRatedXI(squad, formation);
  for (let slot = 0; slot < xi.length && sumOfOveralls(squad, xi) < floor + gain; slot++) {
    xi = pickForSlot({ squad, formation, xi }, slot, best[slot]!) ?? xi;
  }
  return xi;
};
