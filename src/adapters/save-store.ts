// __SCAFFOLD__ (S-010 DISTILL, Mandate 7): RED-ready stub at the path and with the signatures of ADR-0016. Every function throws, so an
// acceptance test that is moved into the tree fails on missing behaviour, never on a missing import. DELIVER replaces this whole file.
import { saveTextFor } from "../app/save";
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
export const createAutosave = (write: (text: string) => boolean, lastText: string | undefined): ((state: GameState) => void) => {
  let last = lastText;
  return (state) => {
    try {
      const text = saveTextFor(last, state);
      if (text !== undefined) last = write(text) ? text : undefined;
    } catch {
      last = undefined; // saving must never reach the caller; the next tap retries, earlier text included
    }
  };
};
