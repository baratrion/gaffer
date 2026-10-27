// @US-1 @US-2 (S-011 read my club's news in the Inbox) held out until DELIVER
// CONTRACT_SHAPE: bounded-change
// Outcome anchor: ADR-0017 Enforcement and ADR-0018 Enforcement; DESIGN decisions DD3, DD4 and DD5; DISCUSS D10 (text through el(), focus left to the shell,
// deterministic domain). Vitest has no DOM, so the layering of the Inbox is guarded by reading the source: the domain module is pure (no locale, clock,
// randomness; imports only Club, ScoredMatch and standings); the Inbox screen emits only Back (one dispatch, one listener), never focuses, never writes
// HTML; the match screen and the Inbox share ONE score-line builder and ONE title source; render is a lookup (no switch) over RENDERERS. The layout of the message lines is checked in e2e by computed style, not here.
// Destination: tests/acceptance/S-011/inbox-source.test.ts (DELIVER: git mv, dropping .pending, in the commit that adds the Inbox screen; the main.ts and
// match.ts rows go green earlier, with the render lookup and the scoreLine extraction commits, so move the file with the last of them).
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { matchdayTitle } from "../../../src/ui/score-line";

const SRC = join(import.meta.dirname, "..", "..", "..", "src");
const read = (path: string): string => readFileSync(join(SRC, path), "utf8");
const count = (text: string, pattern: RegExp): number => (text.match(pattern) ?? []).length;
const stripComments = (text: string): string => text.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/.*$/gm, "$1");

describe("@US-1 @US-2 S-011 the domain module of the reports is pure", () => {
  const source = (): string => stripComments(read("domain/inbox.ts"));
  it("Given src/domain/inbox.ts, when searched, then it has no locale, clock or randomness and no scaffold marker is left @boundary @error @contract-shape:pure-function", () => {
    for (const forbidden of [/\bIntl\b/, /toLocale/, /\bDate\b/, /Math\.random/, /performance\./, /__SCAFFOLD__/]) expect(source(), String(forbidden)).not.toMatch(forbidden);
  });

  it("Given src/domain/inbox.ts, when its imports are read, then it imports only Club, ScoredMatch and standings (the table's order is never copied) @boundary @contract-shape:pure-function", () => {
    const imports = [...source().matchAll(/from\s+"([^"]+)"/g)].map((match) => match[1]);
    expect(imports.sort()).toEqual(["./league", "./standings"]);
    expect(source()).toMatch(/\bstandings\s*\(/);
  });
});

describe("@US-1 @US-2 S-011 the Inbox screen emits only Back and writes only text", () => {
  const source = (): string => stripComments(read("ui/screens/inbox.ts"));
  it("Given src/ui/screens/inbox.ts, when searched, then it has one dispatch, one listener, Back only, no focus() and no innerHTML @boundary @error @contract-shape:bounded-change", () => {
    const text = source();
    expect(count(text, /\bdispatch\s*\(/g)).toBe(1);
    expect(count(text, /addEventListener\s*\(/g)).toBe(1);
    expect(text).toMatch(/type:\s*"Back"/);
    expect(text).not.toMatch(/\.focus\s*\(/);
    expect(text).not.toMatch(/innerHTML|insertAdjacentHTML|outerHTML/);
  });

  it("Given src/ui/screens/inbox.ts, when its elements are counted, then it builds one button (Back) and no link @boundary @contract-shape:bounded-change", () => {
    const text = source();
    expect(count(text, /el\(\s*"button"/g)).toBe(1);
    expect(count(text, /el\(\s*"a"/g)).toBe(0);
  });

  it("Given the Inbox and the match screen, when their sources are read, then both take the score line and the title from src/ui/score-line.ts and neither builds its own @boundary @contract-shape:bounded-change", () => {
    const match = stripComments(read("ui/screens/match.ts"));
    for (const [name, text] of [["inbox", source()], ["match", match]] as const) {
      expect(text, name).toMatch(/import\s*\{[^}]*\bscoreLine\b[^}]*\}\s*from\s*"\.\.\/score-line"/);
      expect(text, name).toMatch(/import\s*\{[^}]*\bmatchdayTitle\b[^}]*\}\s*from\s*"\.\.\/score-line"/);
      expect(text, name).not.toMatch(/const\s+scoreLine\s*=/);
      expect(text, name).not.toMatch(/`Matchday /);
    }
    expect(read("ui/score-line.ts")).not.toContain("__SCAFFOLD__");
  });
});

describe("@US-1 S-011 the shared title is one text", () => {
  it.each([[1, "Matchday 1"], [9, "Matchday 9"], [14, "Matchday 14"]])("Given matchday %s, when its title is built, then it reads %s @boundary @contract-shape:pure-function", (matchday, text) => {
    expect(matchdayTitle(matchday)).toBe(text);
  });
});

describe("@US-1 S-011 render is a lookup", () => {
  const main = (): string => stripComments(read("main.ts"));
  it("Given src/main.ts, when searched, then render has no switch and the RENDERERS lookup holds an inbox entry (ADR-0018) @boundary @contract-shape:bounded-change", () => {
    const text = main();
    expect(text).not.toMatch(/switch\s*\(/);
    expect(text).toMatch(/\bRENDERERS\b/);
    expect(text).toMatch(/\binbox\s*:/);
    expect(text).toMatch(/renderInbox/);
  });
});
