// __SCAFFOLD__ (S-010 DISTILL, Mandate 7): RED-ready stub at the path and with the signatures of ADR-0016. Every function throws, so an
// acceptance test that is moved into the tree fails on missing behaviour, never on a missing import. DELIVER replaces this whole file.
import type { FormationId } from "../domain/formation";
import type { PlayedMatch } from "../domain/match";
import type { GameState } from "./state";

export const __SCAFFOLD__ = true;
export const SAVE_VERSION = 1;

export interface SaveData {
  readonly v: 1;
  readonly seed: number;
  readonly clubId: string;
  readonly formation: FormationId;
  readonly xi?: readonly number[];
  readonly results?: readonly PlayedMatch[];
}

const scaffold = (name: string): never => {
  throw new Error(`__SCAFFOLD__ save.ts ${name}: not implemented yet (S-010 DELIVER)`);
};

export const toSave = (_state: GameState): SaveData | undefined => scaffold("toSave");
export const fromSave = (_raw: unknown): GameState | undefined => scaffold("fromSave");
export const encodeSave = (_state: GameState): string | undefined => scaffold("encodeSave");
export const decodeSave = (_text: string | null | undefined): GameState | undefined => scaffold("decodeSave");
export const saveTextFor = (_lastText: string | undefined, _state: GameState): string | undefined => scaffold("saveTextFor");
