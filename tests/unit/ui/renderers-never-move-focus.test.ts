// @US-1 (S-004 choose a formation) @regression
// CONTRACT_SHAPE: bounded-change
// Outcome anchor: DISCUSS D5 and ADR-0008: focus is moved by the shell alone, so tapping a formation keeps focus on the
// tapped radio. A screen renderer that called .focus() would break that and the heading focus after each navigation.
// Passes before and after DELIVER: no renderer calls .focus() today and none may.
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const UI_DIR = join(import.meta.dirname, "..", "..", "..", "src", "ui");
const sources = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return sources(path);
    return /\.(ts|tsx|js)$/.test(entry.name) ? [path] : [];
  });

describe("@US-1 S-004 screens leave focus to the shell", () => {
  it("Given every screen renderer under src/ui, when searched, then none calls focus() @regression @contract-shape:bounded-change", () => {
    const files = sources(UI_DIR);
    expect(files.length, "the search found the screen renderers").toBeGreaterThanOrEqual(7);
    const offenders = files.filter((file) => /\.focus\s*\(/.test(readFileSync(file, "utf8")));
    expect(offenders).toEqual([]);
  });
});
