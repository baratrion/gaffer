import type { Position } from "./squad";

export type FormationId = "4-4-2" | "4-3-3" | "4-2-3-1";

export interface FormationLine {
  readonly position: Position;
  readonly count: number;
}

export const FORMATIONS: readonly FormationId[] = Object.freeze(["4-4-2", "4-3-3", "4-2-3-1"] as const);

export const DEFAULT_FORMATION: FormationId = "4-4-2";

const line = (position: Position, count: number): FormationLine => Object.freeze({ position, count });

const freezeLines = (...lines: FormationLine[]): readonly FormationLine[] => Object.freeze(lines);

const LINES: Readonly<Record<FormationId, readonly FormationLine[]>> = Object.freeze({
  "4-4-2": freezeLines(line("GK", 1), line("DF", 4), line("MF", 4), line("FW", 2)),
  "4-3-3": freezeLines(line("GK", 1), line("DF", 4), line("MF", 3), line("FW", 3)),
  "4-2-3-1": freezeLines(line("GK", 1), line("DF", 4), line("MF", 2), line("MF", 3), line("FW", 1)),
});

export const isFormationId = (value: string): value is FormationId =>
  FORMATIONS.some((formation) => formation === value);

/** The pitch lines of a formation, goalkeeper first. */
export const formationLines = (formation: FormationId): readonly FormationLine[] => LINES[formation];

/** The 11 position codes of a formation: GK, then DF, MF, FW. */
export const lineUp = (formation: FormationId): readonly Position[] =>
  formationLines(formation).flatMap(({ position, count }) => Array.from({ length: count }, () => position));
