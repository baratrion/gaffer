// @US-1 (S-004 choose a formation): ADR-0008 enforcement. Renderers never move focus; only the shell does, from a plan.
// CONTRACT_SHAPE: pure-function (reads source text only). Runs now: no renderer calls focus() today, so this is a regression guard.
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const sourceFiles = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory() ? sourceFiles(join(dir, entry.name)) : entry.name.endsWith(".ts") ? [join(dir, entry.name)] : [],
  );

describe("@US-1 S-004 only the shell moves focus", () => {
  it("Given the screens under src/ui, when their source is read, then none calls focus() @contract-shape:pure-function", () => {
    const files = sourceFiles("src/ui");
    expect(files.length).toBeGreaterThan(0);
    const offenders = files.filter((file) => /\.focus\s*\(/.test(readFileSync(file, "utf8")));
    expect(offenders).toEqual([]);
  });
});
