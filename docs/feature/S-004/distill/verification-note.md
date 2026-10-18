# S-004 DISTILL verification note

Scratch reference run. A throwaway implementation (`src/domain/formation.ts`, the `state.ts` extension with `initialState`, `ViewTactics`, `ChooseFormation`, `Back` from tactics, `NewGame` reset and `focusPlan`, `src/ui/screens/tactics.ts`, the club-home "Tactics" button, `main.ts` focus execution, CSS) was written in a temporary git worktree of HEAD with `node_modules` linked. The three existing navigation fixtures got `formation` added there (as DELIVER step 02 must). The four held-out files were copied into `tests/` (dropping `.pending`) with the committed guards, and these were run there:
- `pnpm run ci:typecheck`: clean.
- `pnpm run ci:lint`: clean after replacing a 4-parameter helper (`slots`, test-side `max-params` 3) in two held-out files.
- `pnpm run ci:test`: 18 files, 327 tests passed (the three held-out S-004 files: 28 + 41 + 91 = 160; committed S-004 guards 4).
- `pnpm run ci:e2e`: 55 passed (14 held-out S-004 cases, 1 committed S-004 regression case, 40 existing).
- Seeded faults, applied together in one run and all caught: `focusPlan` never returning the element; the same-formation guard removed; the 4-2-3-1 lines changed to MF 2, MF 2, FW 2; formation labels shrunk to about 20px. Result: 12 vitest cases failed (formation 4, tactics-navigation 3, focus-plan 5) and 9 e2e tests failed (focus, line-up, 44px label, scroll, console checks).
The worktree was removed; no reference code is kept.

Real repo, without the reference:
- Held-out files copied into `tests/` temporarily: `oxlint` clean; `tsc` reports only missing-symbol errors (`src/domain/formation`, `initialState`, `focusPlan`, `Screen` "tactics", `Action` "ViewTactics"/"ChooseFormation", `GameState.formation`) plus the implicit-any errors that follow from them; vitest fails on the missing module or `focusPlan is not a function`. RED for missing functionality, not setup. The copies were then removed.
- Not run without the reference: the held-out e2e spec (it needs the Tactics button; it would time out on the missing button, not on setup).
- Committed tree: `ci:lint`, `ci:typecheck`, `ci:test` (167 tests), `ci:e2e` (41 tests) green.
