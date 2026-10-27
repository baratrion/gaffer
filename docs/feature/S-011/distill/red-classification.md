# S-011 RED gate (fail for the right reason)

Run with the held-out files temporarily copied into the tree and the committed scaffolds in place (then removed again).

## Acceptance (vitest, `tests/acceptance/S-011`): 74 cases, 31 pass (the committed ones plus 3 guards), 43 RED
| File | Cases | Classification |
|---|---|---|
| `matchday-reports` | 17 | MISSING_FUNCTIONALITY: `matchdayReports` scaffold throws (9 direct or inside a property); 6 `RangeError` rows fail on the assertion "expected error to be instance of RangeError" (the scaffold throws a plain Error); 2 properties fail on the same throw |
| `inbox-navigation` | 19 | 16 MISSING_FUNCTIONALITY (`viewInbox` / `inboxOf` scaffold throws, 3 of them inside properties). 3 GUARDS pass on the scaffold and must keep passing: Back on the Inbox of an unknown club is a no-op, and the two `focusPlan` cases (the `default` branch already treats a new club screen as a screen change) |
| `inbox-source` | 10 | MISSING_FUNCTIONALITY: assertions fail on the scaffold sources (scaffold marker still present, no `standings(` call, no `"Messages"`, no shared-builder import, `main.ts` still has `switch (`, club home ends with "Play match"/"Table" not "Inbox"); 3 `matchdayTitle` cases hit the scaffold throw. File reads are lazy (inside each `it`), so no case fails at collection |
| `inbox-inputs-pinned`, `names-avoid-inbox-phrases` | 28 | PASS before and after (regression guards; the DISCUSS table is recomputed from the existing domain; the oracle equals `standings` over seeds 1..300 x 8 clubs x 14 matchdays) |

No IMPORT_ERROR, FIXTURE_BROKEN or SETUP_FAILURE: every held-out unit test reaches its first production call. No assertion couples to an internal struct: universes are the returned report list, the state's five keys, the encoded save text and source text of declared files.

## e2e (`S-011-inbox.spec.ts.pending`, 7 tests) against today's app
RED, right reason: every test waits for, or counts, the club home's button "Inbox" (test 1 fails on the exact six-button list `Squad, Tactics, Starting XI, Play match, Table, Inbox`; tests 2 to 7 time out waiting for `getByRole('button', { name: 'Inbox', exact: true })` after the earlier steps ran: new game, club pick, Play match, Table reads). None fails on a setup error.
The eight amended specs (`amend-existing-tests.patch` applied temporarily) fail today at the new six-button list or the `toHaveLength(6)` (observed for S-005, S-006, S-007 table and regression, S-008 regression; the S-008 season and S-009 end-of-season lists are the same assertion, observed failing under a 15 s cap on a 28-tap season). Reverted afterwards.

## Verified GREEN-able (throwaway implementation, not committed, reverted)
A 15-line `matchdayReports`, the `inbox` screen kind, `viewInbox`, `inboxOf`, a real `score-line.ts`, `renderInbox`, the sixth button, a `RENDERERS` lookup and a few CSS lines were written to the tree, then reverted (`git status` shows scaffolds only). Result: all 74 S-011 unit cases and the whole suite pass (63 files, 1198 tests), `tsc --noEmit` is clean with the pending files in the tree, the 7 new e2e pass, the 8 amended specs pass, and the whole Playwright suite is green (154 tests). Mutants killed by the held-out unit tests: `<` for `<=` in the prefix (10 failures), oldest-first order (7), the wrong club's row (6). So the tests are neither vacuous nor wrong.
