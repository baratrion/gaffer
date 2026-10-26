# S-010 RED gate (fail for the right reason)

Run with the held-out files temporarily copied into the tree and the committed scaffolds in place (then removed again).

## Acceptance (vitest, `tests/acceptance/S-010`): 86 cases, 10 pass (the committed ones), 76 RED
| File | Cases | Classification |
|---|---|---|
| `legal-xi` | 9 | MISSING_FUNCTIONALITY: `isLegalXI` scaffold throws (8 direct, 1 fast-check property whose counterexample is the same throw) |
| `save-round-trip` | 8 | MISSING_FUNCTIONALITY: `encodeSave` / `decodeSave` scaffold throws (7 direct, 1 property) |
| `save-unreadable` | 33 | MISSING_FUNCTIONALITY: `decodeSave` scaffold throws (the file and its `vi.mock` load fine; no collection error) |
| `save-triggers` | 17 | MISSING_FUNCTIONALITY: `encodeSave` / `saveTextFor` / `createAutosave` scaffold throws |
| `save-store` | 9 | MISSING_FUNCTIONALITY: 7 scaffold throws; 2 structural greps fail on assertions (no `decodeSave(` in `main.ts`, no `Continue` dispatch in the title, scaffold lacks the probe key) |
| `names-avoid-continue`, `save-inputs-pinned` | 10 | PASS before and after (regression guards; the golden text is the existing model's output) |

No IMPORT_ERROR, FIXTURE_BROKEN or SETUP_FAILURE: every held-out test reaches its first production call. Module-level calls to scaffolds were removed (lazy), so each case is RED on its own rather than failing the suite at collection. No assertion couples to an internal struct: universes are the returned text, the restored `GameState` (five keys), the fake store's written texts and keys.

## Verified GREEN-able (throwaway implementation, not committed)
A 60-line `save.ts`, a 20-line `save-store.ts`, `isLegalXI`, the `Continue` handler and a 10-line `main.ts` / `title.ts` wiring were written to a scratch tree, then reverted. Result: all 76 held-out acceptance cases pass (the greps with the wiring in place) (as expected without the wiring, then satisfied by it), and 10 of the 11 held-out e2e pass; the one failure is the 44px check of "Continue" because the scratch tree had no CSS (`button.secondary`), which is real DELIVER work. This shows the tests are neither vacuous nor wrong.

## e2e (`S-010-save-continue.spec.ts.pending`, 10 tests) against today's app
- RED, right reason (waiting for a button named exactly "Continue"; the first three observed in a run cut short by the 110 s tool limit, the rest by reading the steps): the seed-31 reload, the `?seed=abc` D5 test, the New game timing test, the Play again test, and the three damaged / version 0 / foreign-text tests (each reloads and taps "Continue" after the first club pick).
- PASS today and after (negative claims that must keep holding; they guard the degraded paths): blocked storage, full at load, full mid-session. They cannot be RED on an app that never offers "Continue"; their value is after DELIVER, where "no Continue" would fail if the degraded store or the removal were missing (verified with the throwaway implementation).
