// @US-1 @US-2 (S-009 see how my season ended) held out until DELIVER
// CONTRACT_SHAPE: bounded-change
// Outcome anchor: DISCUSS Elevator Pitch (US-1 and US-2); DESIGN "Enforcement" and ADR-0015 Earned Trust 2 and 6: vitest has no DOM, so the rules that cannot be reached by a render are
// held by source checks, as the S-004 "renderers never move focus" test is. (1) season.ts and formatOrdinal use no Intl, toLocale, Date or
// Math.random and season.ts imports only the Player type from squad.ts; (2) season-end.ts has exactly two dispatch( calls and two
// addEventListener calls, no focus() call, no innerHTML, and reads "End of season", "Final position", "Top scorer", "Play again" and "Back";
// (3) the club home no longer holds the Season over line or its CSS and offers "End of season"; (4) the CSS rules of the two lines keep inline flow
// (no display, float, position, text-transform or generated content), so innerText equals textContent.
// Destination: tests/acceptance/S-009/season-end-source.test.ts (DELIVER: git mv, dropping .pending, in the commit that adds the screen).
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const SRC = join(import.meta.dirname, "..", "..", "..", "src");
const read = (...parts: string[]): string => readFileSync(join(SRC, ...parts), "utf8");
const count = (text: string, pattern: RegExp): number => (text.match(pattern) ?? []).length;
/** The text of one top-level CSS block starting at `selectorStart`, up to its closing brace. */
const blocksFor = (css: string, word: string): string[] =>
  [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].filter((block) => block[1]!.includes(word)).map((block) => block[0]);

describe("@US-1 S-009 the season-end rules stay pure (domain files)", () => {
  it("Given season.ts, when searched, then it uses no Intl, toLocale, Date or Math.random and imports only the Player type from squad.ts @boundary @contract-shape:pure-function", () => {
    const text = read("domain", "season.ts");
    expect(text).not.toMatch(/Intl|toLocale|\bDate\b|Math\.random/);
    const imports = text.split("\n").filter((line) => /^\s*import\b/.test(line));
    expect(imports).toHaveLength(1);
    expect(imports[0]).toMatch(/import type \{[^}]*\bPlayer\b[^}]*\} from "\.\/squad"/);
  });

  it("Given standings.ts, when searched, then formatOrdinal is written without Intl or toLocale and the module still imports only the Club type @boundary @contract-shape:pure-function", () => {
    const text = read("domain", "standings.ts");
    expect(text).toContain("export const formatOrdinal");
    expect(text).not.toMatch(/Intl|toLocale/);
    expect(text.split("\n").filter((line) => /^\s*import\b/.test(line))).toEqual(['import type { Club } from "./league";']);
  });
});

describe("@US-1 @US-2 S-009 the End of season screen emits two actions and moves no focus", () => {
  const text = read("ui", "screens", "season-end.ts");

  it("Given season-end.ts, when searched, then it has two dispatch calls and two listeners, no focus call and no innerHTML @boundary @contract-shape:bounded-change", () => {
    expect(count(text, /\bdispatch\(/g)).toBe(2);
    expect(count(text, /addEventListener\(/g)).toBe(2);
    expect(text).not.toMatch(/\.focus\s*\(|innerHTML|insertAdjacentHTML/);
    expect(text).toContain('type: "NewGame"');
    expect(text).toContain('type: "Back"');
  });

  it("Given season-end.ts, when searched for the texts Sam reads, then it writes the heading, the two labels and the two buttons exactly @boundary @contract-shape:bounded-change", () => {
    for (const phrase of ["End of season", "Final position", "Top scorer", "Play again", "Back"]) expect(text, phrase).toContain(`"${phrase}"`);
  });
});

describe("@US-1 S-009 the club home swaps Play match for End of season", () => {
  it("Given club-home.ts and the CSS, when searched, then the Season over line and its rule are gone and End of season dispatches ViewSeasonEnd @boundary @contract-shape:bounded-change", () => {
    const home = read("ui", "screens", "club-home.ts");
    expect(home).not.toMatch(/Season over|season-over/);
    expect(home).toContain('"End of season"');
    expect(home).toContain("ViewSeasonEnd");
    expect(home).toContain('"Play match"');
    expect(read("ui", "styles.css")).not.toContain("season-over");
  });
});

describe("@US-1 S-009 the two lines are one line of text (the layout lie)", () => {
  it("Given the CSS of .season-line and its spans, when searched, then no rule makes a part of the line a box of its own @boundary @contract-shape:bounded-change", () => {
    const css = read("ui", "styles.css");
    const blocks = [...blocksFor(css, ".season-line"), ...blocksFor(css, ".season-label"), ...blocksFor(css, ".season-value")];
    expect(blocks.length, "the line has styling rules").toBeGreaterThan(0);
    for (const block of blocks) expect(block, block).not.toMatch(/(^|[;{\s])(display|float|position|text-transform|content)\s*:/);
  });
});
