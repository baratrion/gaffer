/** Squad generation -- RED scaffold (created by DISTILL, S-002). DELIVER replaces the body. */
export const __SCAFFOLD__ = true;

export type Position = "GK" | "DF" | "MF" | "FW";

export interface Player {
  readonly name: string;
  readonly position: Position;
  readonly age: number;
  readonly overall: number;
}

export const generateSquad = (_seed: number, _clubIndex: number): readonly Player[] => {
  throw new Error("Not yet implemented -- RED scaffold");
};
