// @US-1 @US-2 (S-011 read my club's news in the Inbox) held out until DELIVER step 3 (it needs steps 1 and 2 done: the RENDERERS lookup and the shared score line)
// CONTRACT_SHAPE: pure-function
// Source grep tests (vitest has no DOM), ADR-0017 Enforcement and ADR-0018 Enforcement. A missing file fails an assertion (not a read error), so each is RED for the right reason.
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const read = (path: string): string | undefined => (existsSync(path) ? readFileSync(path, "utf8") : undefined);
const count = (text: string, pattern: RegExp): number => (text.match(pattern) ?? []).length;
const files = (dir: string): string[] => readdirSync(dir).flatMap((name) => (statSync(join(dir, name)).isDirectory() ? files(join(dir, name)) : [join(dir, name)]));
const specifiers = (text: string): string[] => [...text.matchAll(/from\s+"([^"]+)"/g)].map((match) => match[1]!);

describe("@US-1 @US-2 S-011 the derivation is pure, the screen only emits Back, one source for the score line, and the shell is a lookup", () => {
  it("Given src/domain/inbox.ts, when read, then it has no clock, randomness, locale or storage and imports only the club and standings modules @boundary @contract-shape:pure-function", () => {
    const source = read("src/domain/inbox.ts");
    expect(source).toBeDefined();
    expect(source!).not.toMatch(/\bIntl\b|toLocale|\bDate\b|Math\.random|localStorage|sessionStorage|performance/);
    expect(specifiers(source!).sort()).toEqual(["./league", "./standings"]);
  });
  it("Given src/ui/screens/inbox.ts, when read, then it has one dispatch call, one listener, no focus call, no innerHTML, no storage, one button (Back), no link, and builds its lines with the shared score-line module without importing a sibling screen @boundary @error @contract-shape:bounded-change", () => {
    const source = read("src/ui/screens/inbox.ts");
    expect(source).toBeDefined();
    expect([count(source!, /\bdispatch\(/g), count(source!, /addEventListener\(/g), count(source!, /\.focus\(/g)]).toEqual([1, 1, 0]);
    expect(source!).not.toMatch(/innerHTML|insertAdjacentHTML|localStorage|sessionStorage/);
    expect([count(source!, /el\(\s*"button"/g), count(source!, /el\(\s*"a"/g), count(source!, /role:\s*"button"/g)]).toEqual([1, 0, 0]);
    expect(source!).toMatch(/\bscoreLine\b/);
    expect(source!).toMatch(/\bmatchdayTitle\b/);
    expect(specifiers(source!).filter((spec) => spec.startsWith("./"))).toEqual([]);
  });
  it("Given src/ui/score-line.ts and the match screen, when read, then scoreLine and matchdayTitle live in the shared module and match.ts imports them instead of building the line and title itself @boundary @contract-shape:bounded-change", () => {
    const [shared, match] = [read("src/ui/score-line.ts"), read("src/ui/screens/match.ts")];
    expect(shared).toBeDefined();
    expect(shared!).toMatch(/export (const|function) scoreLine\b/);
    expect(shared!).toMatch(/export (const|function) matchdayTitle\b/);
    expect(specifiers(match ?? "")).toContain("../score-line");
    expect(match!).not.toMatch(/(const|function) scoreLine\b|`Matchday \$\{/);
  });
  it("Given src/main.ts and the club home, when read, then render is a RENDERERS lookup with no switch statement (ADR-0018) and Inbox is offered after Table, dispatching ViewInbox @boundary @contract-shape:bounded-change", () => {
    const [main, clubHome] = [read("src/main.ts")!, read("src/ui/screens/club-home.ts")!];
    expect(main).toMatch(/\bRENDERERS\b/);
    expect(main).not.toMatch(/switch\s*\(/);
    expect(clubHome.indexOf('"Inbox"')).toBeGreaterThan(clubHome.indexOf('"Table"'));
    expect(clubHome).toMatch(/ViewInbox/);
  });
  it("Given the whole of src, when searched for the scaffold marker, then none remains (DELIVER's completion check) @boundary @contract-shape:pure-function", () => {
    expect(files("src").filter((path) => readFileSync(path, "utf8").includes("__SCAFFOLD__"))).toEqual([]);
  });
});
