# S-011 RED gate (fail for the right reason)

Run with the held-out files temporarily copied into the tree and the committed scaffolds in place (then removed again). Today's app has no "Inbox" button; the scaffolds throw.

## Acceptance (vitest, `tests/acceptance/S-011`): 89 cases, 17 pass (the committed ones), 72 held-out, of which 70 RED and 2 already green
| File | Cases | Classification |
|---|---|---|
| `inbox-reports` | 34 | MISSING_FUNCTIONALITY: 28 hit the `matchdayReports` scaffold throw; 6 are `RangeError` rows (5 club places, 1 foreign club) that fail an assertion ("expected error to be instance of RangeError", the scaffold throws a plain `Error`) |
| `inbox-oracle` | 3 | MISSING_FUNCTIONALITY: scaffold throw on the first club of the first seed |
| `inbox-time-travel` | 2 | MISSING_FUNCTIONALITY: `inboxOf` scaffold throw (1 direct, 1 fast-check property whose shrunk counterexample is one Play match) |
| `inbox-navigation` | 26 | 25 MISSING_FUNCTIONALITY (21 `ViewInbox` scaffold throws, 4 `inboxOf`); 1 passes today and after (the `focusPlan` case: club home to Inbox and back focus the heading, existing code) |
| `inbox-readonly` | 2 | MISSING_FUNCTIONALITY: two fast-check properties; the counterexamples hold a `ViewInbox` (the scaffold throw) |
| `inbox-source` | 5 | 4 RED assertions (`expected undefined to be defined` for `src/ui/screens/inbox.ts` and `src/ui/score-line.ts`, no `RENDERERS` in `main.ts`, scaffold markers still in `src/`); 1 passes today and after (the domain module's imports and no-clock grep, true of the scaffold) |
| `inbox-reference-pinned`, `inbox-save-unchanged`, `names-avoid-inbox-words` | 17 | PASS before and after (regression guards: the DISCUSS table and the oracle agree with the real generator and Table) |

No IMPORT_ERROR, FIXTURE_BROKEN or SETUP_FAILURE: every held-out test reaches its first production call or its first assertion. Module-level work calls no scaffold (the scaffolded `ViewInbox` is never used to build a fixture; the "Inbox itself" screen is a hand-built state), so each case is RED on its own rather than failing the file at collection. No assertion couples to an internal struct: universes are the returned report list, the five-key `GameState` and the saved text.

## e2e (`S-011-inbox.spec.ts.pending`, 9 tests) against today's app
All 9 RED for the right reason: 7 wait for `getByRole('button', { name: 'Inbox', exact: true })`; 2 reach the club home and fail the exact button list (`["Squad", "Tactics", "Starting XI", "Play match", "Table", "Inbox"]` and its End of season variant). No locator or fixture error.

## Verified GREEN-able (throwaway implementation, not committed)
A 25-line `matchdayReports`, `ViewInbox`/`inboxOf`/`inbox` screen kind, a 12-line `score-line.ts`, a 15-line `inbox.ts` screen, the club-home button, a `main.ts` case and 4 CSS rules were written to the tree, run, then reverted (`git checkout`, files deleted, scaffolds restored). Result: all 72 held-out acceptance cases pass except 2 of the 5 source greps (the throwaway skipped the `RENDERERS` lookup and the `match.ts` extraction, which are DELIVER steps 1 and 2); all 9 e2e pass (Chromium equals Node on the 14 goldens and seed 20260, the sweep seed 585 gives 55-character lines and no sideways scroll); the amended 8 e2e files plus the S-010 regression run 78 passed. Fault injection: `<` for `<=` in the prefix filter turns `inbox-reports`, `inbox-oracle`, `inbox-navigation` and `inbox-time-travel` red; a `display: flex` on the position line turns the computed-style e2e red (`innerText` differs from `textContent`). This shows the tests are neither vacuous nor wrong.

## Notes for DELIVER
- Positions after matchdays 1..14 at seed 31 (6th, 8th, 6th, 5th, 3rd, 3rd, 5th, 4th, 2nd, 4th, 4th, 4th, 3rd, 3rd) and the seed-20260 message were pinned from the DISCUSS table, and both were confirmed true of the real generator by the committed `inbox-reference-pinned.test.ts` (including the three name tie-breaks).
- The e2e seed for the 390px check was chosen by sweeping seeds 1..1500 x 8 clubs for the largest total score-line length: seed 585, fourth club "Oakhampton Rise Wanderers" (longest line 55 characters, 656 name characters over its 14 lines). A committed test pins that.
