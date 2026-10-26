// __SCAFFOLD__ (S-010 DISTILL, Mandate 7): RED-ready stub at the path and with the signatures of ADR-0016. Every function throws, so an
// acceptance test that is moved into the tree fails on missing behaviour, never on a missing import. DELIVER replaces this whole file.
import type { GameState } from "../app/state";

export const __SCAFFOLD__ = true;

export type SaveStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;

export interface SaveStore {
  readonly health: "ok" | "degraded";
  read(): string | undefined;
  write(text: string): boolean;
}

const scaffold = (name: string): never => {
  throw new Error(`__SCAFFOLD__ save-store.ts ${name}: not implemented yet (S-010 DELIVER)`);
};

export const createSaveStore = (_getStorage: () => SaveStorage, _key = "gaffer.save"): SaveStore => scaffold("createSaveStore");
export const createAutosave = (_write: (text: string) => boolean, _lastText: string | undefined): ((state: GameState) => void) => scaffold("createAutosave");
