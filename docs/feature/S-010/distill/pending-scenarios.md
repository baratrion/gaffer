# S-010 held-out scenarios (DISTILL, green hand-off)

The repo forbids committed failing, skipped, `.only`, `.todo` or `.fixme` tests (`scripts/guards/pr-guards.mjs` check 4; the test count may never fall), so the not-yet-passing scenarios are held out, as in S-006..S-009: they are `*.pending` files outside every glob (vitest `include`, `tsc include`, `oxlint .`, Playwright `testDir`). Nothing is skipped or weakened; they are simply not in the tree yet. Each is complete, and was run (RED against the scaffolds, GREEN against a throwaway implementation, see `red-classification.md`).

| Held-out file | Destination (`git mv`, dropping `.pending`) | Cases | Goes green with |
|---|---|---|---|
| `pending/acceptance/legal-xi.test.ts.pending` | `tests/acceptance/S-010/legal-xi.test.ts` | 9 | DELIVER step 1: `isLegalXI` in `src/domain/selection.ts` |
| `pending/acceptance/save-round-trip.test.ts.pending` | `tests/acceptance/S-010/save-round-trip.test.ts` | 8 | step 2: `src/app/save.ts` (`encodeSave`, `decodeSave`, `toSave`, `fromSave`) and the `Continue` handler in `update` |
| `pending/acceptance/save-unreadable.test.ts.pending` | `tests/acceptance/S-010/save-unreadable.test.ts` | 33 (30 table rows) | step 2 |
| `pending/acceptance/save-triggers.test.ts.pending` | `tests/acceptance/S-010/save-triggers.test.ts` | 17 | step 2 (`saveTextFor`) and step 3 (`createAutosave`) |
| `pending/acceptance/save-store.test.ts.pending` | `tests/acceptance/S-010/save-store.test.ts` | 9 (7 adapter faults, 2 structural greps) | step 3 adapter; the greps go green in step 4 (`main.ts`, `title.ts`) |
| `pending/e2e/S-010-save-continue.spec.ts.pending` | `tests/e2e/S-010-save-continue.spec.ts` | 11 | step 4 (title, CSS `button.secondary` 44px, wiring) |
| `pending/amend-existing-tests.patch` | `git apply` in the step-4 commit | 2 amended tests | step 4 (DESIGN amend list; replace, never weaken) |

Committed now (green before and after DELIVER): `tests/acceptance/S-010/{names-avoid-continue,save-inputs-pinned}.test.ts`, data/helpers `save-golden.ts` and `save-world.ts`, `tests/e2e/S-010-club-home-regression.spec.ts`. Scaffolds committed (Mandate 7): `src/app/save.ts`, `src/adapters/save-store.ts`, `isLegalXI` in `src/domain/selection.ts`, a throwing `Continue` case in `src/app/state.ts` (`Action` gains `Continue`).

Mechanics: move a file in the same commit as the code that makes it green; confirm RED first (the scaffolds throw), then GREEN. Never edit an assertion to fit the implementation; the golden text in `save-golden.ts` is pinned from the existing generator, never re-pinned from DELIVER output. Zero `*.pending` files and zero `__SCAFFOLD__` markers (`grep -r __SCAFFOLD__ src/`) is the completion check; delete `docs/feature/S-010/distill/pending/`. The e2e `.pending` imports `../acceptance/S-010/save-golden` (committed; do not move it).
