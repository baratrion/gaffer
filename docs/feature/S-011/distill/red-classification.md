# S-011 RED gate (fail for the right reason)

Run with the held-out files temporarily copied into the tree (then removed again) and the committed scaffold `src/domain/inbox.ts` in place. The state-level files also needed `inboxOf` and a `ViewInbox` handler, which are not committed (a new `Screen` kind breaks the `render` and `HANDLERS` typecheck), so a two-line throwing scaffold was appended to `src/app/state.ts` for the run and reverted with `git checkout`.

## Acceptance (vitest, `tests/acceptance/S-011`): 66 cases, 17 pass, 49 RED
| File | Cases | Classification |
|---|---|---|
| `inbox-reports` | 20 | MISSING_FUNCTIONALITY: all 20 RED. 14 hit the `matchdayReports` scaffold throw (goldens, literal logs, frozen inputs, both properties, the 300-seed sweep); 6 are the RangeError table, which fails on the assertion because the scaffold throws a plain `Error` |
| `inbox-navigation` | 24 | 22 MISSING_FUNCTIONALITY (the temporary `ViewInbox` / `inboxOf` scaffold throws, so every case reaches its first call). 2 PASS today and after, as guards: "Back on an Inbox screen of an unknown club is the very same state" (no handler for that screen yet, so `Back` is already a no-op) and the `focusPlan` comparison (generic code); neither can be RED before the screen exists, both would fail after DELIVER if the handler or the plan broke |
| `inbox-source` | 7 | MISSING_FUNCTIONALITY: the files or strings they search do not exist yet (`inbox.ts` carries the scaffold marker, `score-line.ts` and `screens/inbox.ts` are absent, no `ViewInbox` in the club home, `main.ts` still holds a `switch`). File reads are lazy, so each case is RED on its own, not a collection error |
| `inbox-inputs-pinned`, `names-avoid-inbox-words` | 15 | PASS before and after (regression guards; the goldens equal the existing generator and `standings`; the independent oracle equals `standings` over seeds 1..100 x 8 clubs x 14 matchdays) |

No IMPORT_ERROR, FIXTURE_BROKEN or SETUP_FAILURE. No assertion couples to an internal struct: universes are the returned report list, the screen kind and the five `GameState` keys, the encoded save text, and the source text.

## e2e (`S-011-inbox.spec.ts.pending`, 11 tests) against today's app: 11 RED
RED, right reason: 9 time out waiting for a button named exactly "Inbox" (they ran the real steps before it: New game, club pick, Play match, Table and Back, End of season); 2 fail on assertion first (the six-button list and the End of season list lack "Inbox"). The negative claims (no "Continue" with blocked storage) sit after the Inbox open, so none of the 11 can pass on an app without the screen. The run used shortened per-test timeouts on a scratch copy (the file in `pending/` keeps the real 60 and 90 s); the copy and `test-results/` were removed.
Committed `S-011-club-home-regression.spec.ts`: 1 passes today (and after).

## Verified GREEN-able (throwaway implementation, not committed)
A 15-line `matchdayReports`, the `inbox` screen kind, `ViewInbox`, `inboxOf` and the `Back` set member in `state.ts`, `score-line.ts` with `scoreLine` and `matchdayTitle` (used by `match.ts`), a 15-line `renderInbox`, the club-home button, the `inbox` case in `main.ts` and 4 CSS rules were written to the tree, then reverted. Result: all 20 `inbox-reports` and all 24 `inbox-navigation` cases pass (including the seeds 1..300 oracle sweep in about 2 s), 6 of the 7 `inbox-source` cases pass (the seventh, "main.ts holds RENDERERS and no switch", is exactly the ADR-0018 debt: the throwaway kept the switch, and `ci:lint` then reported `render` at complexity 17), and all 11 e2e pass on the built app. The pending files typecheck (`tsc --noEmit`) and lint (`oxlint .`) clean against that implementation. This shows the tests are neither vacuous nor wrong. Two defects found this way were fixed in the held-out files before hand-off: `shuffledSubarray` needs a mutable array, and `testInfo.project.use.baseURL` may be undefined under `exactOptionalPropertyTypes`.
