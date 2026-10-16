# S-003 DISTILL verification note

Scratch reference run (before review edits). A throwaway implementation (domain per ADR-0006, `update` cases, row buttons, player screen, CSS) was written in a temporary git worktree of HEAD with `node_modules` linked, the four held-out files were copied into its `tests/` (dropping `.pending`), and these were run there:
- `pnpm run ci:typecheck`: clean.
- `pnpm run ci:test` (`vitest run`): 13 files, 162 tests passed (the four S-003 files: 78 tests incl. 6 identity).
- `pnpm run ci:lint`: the S-003 test files clean after replacing a 4-parameter helper (max-params 3); one error remained in the reference's own `update` (complexity 19, cap 15), which DELIVER must avoid by splitting per-action helpers.
- `pnpm run ci:e2e`: 39 passed, 1 failed; the failure is the S-002 test "squad rows are display-only, not buttons", which D1/ADR-0006 supersede (DELIVER renames it). All 12 S-003 e2e cases passed.
The worktree was removed; no reference code is kept.

Real repo, after the review edits (contract-shape tags, whole-state assertions in N1/N2, page-side tap counter, Pixel 7 profile from config, A9 extended to `deriveOverall`, E7 row-order checks removed, R4 added):
- Held-out files copied into `tests/` temporarily: `oxlint` clean; `tsc` reports only missing-symbol errors (`ATTRIBUTE_*`, `CONDITION_*`, `OVERALL_WEIGHTS`, `deriveOverall`, `Player.attributes/condition`, `Screen` "player", `Action` "ViewPlayer") plus the implicit-any errors that follow from them: RED for missing functionality, not setup. vitest fails the same way. The copies were then removed.
- Not repeated: a full green run of the edited held-out files against a reference implementation. DELIVER step 01/02 does this when each file moves in.
- Committed tree: `ci:lint`, `ci:typecheck`, `ci:test`, `ci:e2e` green (see the final report of this run).
