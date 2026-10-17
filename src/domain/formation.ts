// __SCAFFOLD__ (S-004 DISTILL): RED-ready stub. DELIVER replaces every body per ADR-0007 and removes this marker.
// DEFAULT_FORMATION is real (the app shell needs a working default until `initialState` lands); everything else is a stub.
import type { Position } from "./squad";

export type FormationId = "4-4-2" | "4-3-3" | "4-2-3-1";

export interface FormationLine {
  readonly position: Position;
  readonly count: number;
}

export const DEFAULT_FORMATION: FormationId = "4-4-2";

/** __SCAFFOLD__: must become the frozen ordered list "4-4-2", "4-3-3", "4-2-3-1". */
export const FORMATIONS: readonly FormationId[] = [];

const scaffold = (name: string): never => {
  throw new Error(`__SCAFFOLD__ ${name} is not implemented yet (S-004 DELIVER)`);
};

export const formationLines = (_formation: FormationId): readonly FormationLine[] => scaffold("formationLines");

export const lineUp = (_formation: FormationId): readonly Position[] => scaffold("lineUp");

export const isFormationId = (_value: string): _value is FormationId => scaffold("isFormationId");
