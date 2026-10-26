import { saveTextFor } from "../app/save";
import type { GameState } from "../app/state";

export type SaveStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;

export interface SaveStore {
  readonly health: "ok" | "degraded";
  read(): string | undefined;
  write(text: string): boolean;
}

const PROBE_KEY = "gaffer.probe";
const PROBE_VALUE = "probe";

const quietly = (run: () => void): void => {
  try {
    run();
  } catch {
    // saving is optional: the adapter never throws and never logs
  }
};

const probe = (storage: SaveStorage): boolean => {
  try {
    storage.setItem(PROBE_KEY, PROBE_VALUE);
    const readBack = storage.getItem(PROBE_KEY);
    storage.removeItem(PROBE_KEY);
    return readBack === PROBE_VALUE;
  } catch {
    return false;
  }
};

const tryGetStorage = (getStorage: () => SaveStorage): SaveStorage | undefined => {
  try {
    return getStorage();
  } catch {
    return undefined;
  }
};

const healthyStore = (storage: SaveStorage, key: string): SaveStore => ({
  health: "ok",
  read: () => {
    try {
      const text = storage.getItem(key);
      return typeof text === "string" ? text : undefined;
    } catch {
      return undefined;
    }
  },
  write: (text) => {
    try {
      storage.setItem(key, text);
      return true;
    } catch {
      quietly(() => storage.removeItem(key));
      return false;
    }
  },
});

const degradedStore = (storage: SaveStorage | undefined, key: string): SaveStore => {
  const forget = (): void => quietly(() => storage?.removeItem(key));
  forget();
  return {
    health: "degraded",
    read: () => undefined,
    write: () => {
      forget();
      return false;
    },
  };
};

export const createSaveStore = (getStorage: () => SaveStorage, key = "gaffer.save"): SaveStore => {
  const storage = tryGetStorage(getStorage);
  return storage && probe(storage) ? healthyStore(storage, key) : degradedStore(storage, key);
};

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
