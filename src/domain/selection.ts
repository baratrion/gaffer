import { lineUp, type FormationId } from "./formation";
import { PLAYERS_PER_SQUAD, type Player, type Position } from "./squad";

/** 11 squad indices in slot order; slot i holds a player of position lineUp(formation)[i]. */
export type StartingXI = readonly number[];

export interface SelectionContext {
  readonly squad: readonly Player[];
  readonly formation: FormationId;
  readonly xi: StartingXI;
}

const SLOTS_PER_XI = 11;

export const isSlotIndex = (value: number): boolean => Number.isInteger(value) && value >= 0 && value < SLOTS_PER_XI;

const isSquadIndex = (value: number): boolean => Number.isInteger(value) && value >= 0 && value < PLAYERS_PER_SQUAD;

/** Squad indices of the players of one position, in squad order. */
export const playersForPosition = (squad: readonly Player[], position: Position): readonly number[] =>
  squad.flatMap((player, index) => (player.position === position ? [index] : []));

const overallOf = (squad: readonly Player[], index: number): number => (squad[index] as Player).overall;

/** Best overall first; equal overalls keep ascending squad index. */
const bestFirst = (squad: readonly Player[], position: Position): readonly number[] =>
  [...playersForPosition(squad, position)].sort(
    (left, right) => overallOf(squad, right) - overallOf(squad, left) || left - right,
  );

/** The best-rated players of each position, in the slot order of the formation. */
export const automaticXI = (squad: readonly Player[], formation: FormationId): StartingXI => {
  const taken: Record<Position, number> = { GK: 0, DF: 0, MF: 0, FW: 0 };
  return lineUp(formation).map((position) => {
    const chosen = bestFirst(squad, position)[taken[position]] as number;
    taken[position] += 1;
    return chosen;
  });
};

/** Replaces or swaps a player into a slot; undefined when the slot or player is invalid or of another position. */
export const pickForSlot = (
  { squad, formation, xi }: SelectionContext,
  slot: number,
  playerIndex: number,
): StartingXI | undefined => {
  if (!isSlotIndex(slot) || !isSquadIndex(playerIndex)) return undefined;
  if (squad[playerIndex]?.position !== lineUp(formation)[slot]) return undefined;
  const displaced = xi[slot] as number;
  if (displaced === playerIndex) return xi;
  const otherSlot = xi.indexOf(playerIndex);
  return xi.map((current, index) => (index === slot ? playerIndex : index === otherSlot ? displaced : current));
};

/** A saved eleven is legal when it is 11 different squad players, each in the position of its slot. */
export const isLegalXI = (squad: readonly Player[], formation: FormationId, xi: readonly number[]): boolean => {
  const slots = lineUp(formation);
  return (
    xi.length === SLOTS_PER_XI &&
    new Set(xi).size === SLOTS_PER_XI &&
    xi.every((playerIndex, slot) => isSquadIndex(playerIndex) && squad[playerIndex]?.position === slots[slot])
  );
};
