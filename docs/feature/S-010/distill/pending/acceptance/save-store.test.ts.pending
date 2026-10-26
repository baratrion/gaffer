// @US-2 (S-010 save and continue my season)
// CONTRACT_SHAPE: bounded-change
// Outcome anchor: DISCUSS D6 and K3, ADR-0016 Earned Trust 1-5 and 11: the browser's storage lies (blocked, full at load, full during play, ignored
// writes, odd reads) and the game never breaks, logs nothing, never offers an older game after a degraded load or a failed save, and touches only
// the keys gaffer.save and gaffer.probe. The driven adapter under test: createSaveStore over an injected storage. RED against the scaffolds.
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createSaveStore, type SaveStorage } from "../../../src/adapters/save-store";

afterEach(() => vi.restoreAllMocks());

const SAVE = "gaffer.save";
const QUOTA = (): never => { throw new DOMException("full", "QuotaExceededError"); };
const memory = (initial: Record<string, string>, over: Partial<SaveStorage> = {}) => {
  const data = new Map(Object.entries(initial));
  const storage: SaveStorage = {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => void data.set(key, value),
    removeItem: (key) => void data.delete(key),
    ...over,
  };
  return { data, storage };
};
const quietly = <T>(run: () => T): T => {
  const logged = [vi.spyOn(console, "error"), vi.spyOn(console, "warn"), vi.spyOn(console, "log")];
  const out = run();
  for (const spy of logged) expect(spy).not.toHaveBeenCalled();
  return out;
};

describe("@US-2 S-010 a working store reads and writes the one saved game", () => {
  it("Given working storage holding a saved game, when the store is made, then it is healthy, reads the text, leaves no probe key behind and leaves no probe key and only the saved game in storage @driving_port @real-io @contract-shape:bounded-change", () => {
    const { data, storage } = memory({ [SAVE]: "text" });
    const store = quietly(() => createSaveStore(() => storage));
    expect(store.health).toBe("ok");
    expect(store.read()).toBe("text");
    expect(store.write("newer")).toBe(true);
    expect([...data.entries()]).toEqual([[SAVE, "newer"]]);
    expect(data.has("gaffer.probe")).toBe(false);
  });

  it("Given storage with nothing stored, a throwing read or a read that is not text, when the store reads, then it reads nothing and does not throw @error @contract-shape:bounded-change", () => {
    expect(createSaveStore(() => memory({}).storage).read()).toBeUndefined();
    const throwing = memory({ [SAVE]: "x" }, { getItem: (key) => { if (key === SAVE) throw new Error("odd"); return null; } });
    expect(quietly(() => createSaveStore(() => throwing.storage).read())).toBeUndefined();
    const odd = memory({}, { getItem: (key) => (key === SAVE ? (7 as unknown as string) : null) });
    expect(createSaveStore(() => odd.storage).read()).toBeUndefined();
  });
});

describe("@US-2 S-010 a store that cannot be trusted at load offers nothing and cleans up", () => {
  it("Given storage that is blocked entirely, when the store is made, then it is degraded, reads nothing, writes nothing and does not throw or log @error @boundary @contract-shape:bounded-change", () => {
    const store = quietly(() => createSaveStore(() => { throw new DOMException("blocked", "SecurityError"); }));
    expect(store.health).toBe("degraded");
    expect(store.read()).toBeUndefined();
    expect(quietly(() => store.write("text"))).toBe(false);
  });

  it("Given a readable saved game and storage that is full (every write throws), when the store is made, then it is degraded, offers nothing and has removed the stored game @error @boundary @contract-shape:bounded-change", () => {
    const { data, storage } = memory({ [SAVE]: "valid" }, { setItem: QUOTA });
    const store = quietly(() => createSaveStore(() => storage));
    expect(store.health).toBe("degraded");
    expect(store.read()).toBeUndefined();
    expect(data.has(SAVE)).toBe(false);
  });

  it("Given a degraded store and a game that reappears, when Sam taps and the store writes, then the write fails and the game is removed again; a throwing removal is swallowed @error @contract-shape:bounded-change", () => {
    const { data, storage } = memory({}, { setItem: QUOTA });
    const store = createSaveStore(() => storage);
    data.set(SAVE, "reappeared");
    expect(quietly(() => store.write("text"))).toBe(false);
    expect(data.has(SAVE)).toBe(false);
    const stuck = memory({ [SAVE]: "valid" }, { setItem: QUOTA, removeItem: () => { throw new Error("no"); } });
    expect(quietly(() => createSaveStore(() => stuck.storage).write("text"))).toBe(false);
  });

  it("Given storage that accepts writes and forgets them, when the store is made, then the probe reads back the lie and the store is degraded @error @boundary @contract-shape:bounded-change", () => {
    const store = createSaveStore(() => memory({ [SAVE]: "valid" }, { setItem: () => undefined }).storage);
    expect(store.health).toBe("degraded");
    expect(store.read()).toBeUndefined();
  });
});

describe("@US-2 S-010 a write that fails during play never leaves an older game behind", () => {
  it("Given a healthy store whose writes to the saved game now fail, when it writes, then it says no, removes the stored game (a throwing removal swallowed) and later writes work again @error @contract-shape:bounded-change", () => {
    let full = false;
    const { data, storage } = memory({}, {});
    const failing: SaveStorage = { ...storage, setItem: (key, value) => { if (full && key === SAVE) QUOTA(); storage.setItem(key, value); } };
    const store = createSaveStore(() => failing);
    expect(store.write("T1")).toBe(true);
    full = true;
    expect(quietly(() => store.write("T2"))).toBe(false);
    expect(data.has(SAVE)).toBe(false);
    expect(store.health).toBe("ok");
    full = false;
    expect(store.write("T3")).toBe(true);
    expect(data.get(SAVE)).toBe("T3");
    full = true;
    const noRemoval = createSaveStore(() => ({ ...failing, removeItem: (key) => { if (key === SAVE) throw new Error("no"); storage.removeItem(key); } }));
    expect(quietly(() => noRemoval.write("T4"))).toBe(false);
  });
});

const SRC = join(__dirname, "../../../src");
const files = (dir: string): string[] => readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? files(join(dir, e.name)) : [join(dir, e.name)]));
const all = files(SRC).map((path) => ({ path: path.slice(SRC.length + 1), text: readFileSync(path, "utf8") }));
const textOf = (path: string): string => all.find((file) => file.path === path)?.text ?? "";
const count = (text: string, needle: string): number => text.split(needle).length - 1;

describe("@US-1 @US-2 S-010 the storage seam stays one small adapter (ADR-0016 structure)", () => {
  it("Given every source file, when searched, then only the adapter and one getter in main.ts name a storage, main.ts reads the saved game only through decodeSave, and Continue is dispatched at one place @boundary @contract-shape:bounded-change", () => {
    expect(all.filter(({ text }) => /\b(localStorage|sessionStorage)\b/.test(text)).map(({ path }) => path).every((path) => path === "main.ts" || path.startsWith("adapters/"))).toBe(true);
    expect(count(textOf("main.ts"), "localStorage")).toBe(1);
    expect(textOf("main.ts")).toContain("() => localStorage");
    expect(textOf("main.ts")).toContain("decodeSave(");
    expect(textOf("main.ts")).not.toContain("fromSave(");
    expect(count(textOf("ui/screens/title.ts"), 'type: "Continue"')).toBe(1);
    expect(count(textOf("ui/screens/title.ts"), "dispatch(")).toBeLessThanOrEqual(2);
    expect(all.filter(({ text }) => text.includes('type: "Continue"')).map(({ path }) => path).sort()).toEqual(["app/state.ts", "ui/screens/title.ts"]);
  });

  it("Given the adapter, when searched, then it never logs, probes with its own key and imports nothing from the UI @error @boundary @contract-shape:bounded-change", () => {
    const adapter = textOf("adapters/save-store.ts");
    expect(adapter).not.toMatch(/console\./);
    expect(adapter).toContain("gaffer.probe");
    expect(adapter).not.toMatch(/from "\.\.\/ui\//);
  });
});
