# S-008: Play the season to the end (evolution record)

Finalized 2026-10-25. Delivery history stays in `docs/feature/S-008/` (feature-delta, slices, discuss, distill, `deliver/roadmap.json`, `deliver/execution-log.json`).

## Summary
Every "Play match" tap now plays the next matchday (2 to 14) instead of re-showing matchday 1. The match screen shows the latest matchday for Sam's club; the table reads the whole record. After matchday 14 the club home replaces the "Play match" button with a plain "Season over" line, and further taps cannot reach matchday 15. A new game still drops the record.

## Key decisions
- ADR-0014: `nextMatchday(state)` is derived from the results log (highest recorded matchday + 1, undefined after 14), not stored. It supersedes in part ADR-0012's re-show rule and S-007 design D4.
- A private `matchdayFor` is the only side builder (managed `currentXI`, others automatic 4-4-2); `playOpeningMatchday` stays as its matchday-1 one-liner. No new RNG stream.
- `matchFor` restricts the log to the latest recorded matchday; `main.ts` passes `seasonOver` to `renderClubHome`, which swaps the button for `<p class="season-over">Season over</p>`.
- U-1: 11 assertions pinning the S-007 re-show were replaced by stricter equivalents (they also check the matchday) in the commit that obsoleted them. Nothing weakened or skipped.

## Work completed (roadmap steps 01-01 and 01-02)
| Step | Outcome | Commit |
|---|---|---|
| 01-01 | Next matchday recording, latest-match screen, re-show test amendments; season specs activated | 65b7408 |
| 01-02 | "Season over" line on the club home after matchday 14; season e2e activated | 45bcfa1 |
| review | Review findings folded in (assert match screen, tidy import) | e507356 |

## Issues and quality-gate notes (honest record)
- Execution-log RED/GREEN timestamps for step 01-02 are identical, so RED evidence is thin (as in S-005 to S-007).
- `tests/protected/S-008/` was not run locally; CI runs it on main.
- Mutation testing is nightly-delta; `/nw-deliver` Phase 5 skipped. Watch item: the 100-run whole-season properties are the nightly Stryker runtime cost (trim `numRuns` in `season-for-a-club.test.ts` first).
- `des-verify-integrity` passed. Finalize gates: `ci:lint`, `ci:typecheck`, `ci:test` (897 passed), `ci:e2e` (124 passed) all green.

## Lessons
- Listing every superseded assertion in DISTILL (U-1) made the amendment commit mechanical; keep doing it.
- A latent flaky assertion (U-1 row 5) was fixed in the same commit rather than waiting for an unlucky `FC_SEED`.

## Migrated artifacts
None to copy. ADR-0014, brief ports 29-31 and the design-system "Season over" entry already live in `docs/product/` (SSOT). `docs/feature/S-008/` is preserved as delivery history. Session artifact removed: `deliver/.develop-progress.json` (`.nwave/des/deliver-session.json` is untracked and locked, left alone).
