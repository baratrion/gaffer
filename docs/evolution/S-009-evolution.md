# S-009: See how my season ended (evolution record)

Finalized 2026-10-25. Delivery history stays in `docs/feature/S-009/` (feature-delta, slices, discuss, distill, `deliver/roadmap.json`, `deliver/execution-log.json`).

## Summary
After matchday 14 the club home shows an "End of season" button in place of "Play match". It opens an End of season screen with Sam's final position as an ordinal ("Final position 3rd") and the club's top scorer ("Top scorer Garrick Thistlewood (5 goals)"). The screen has two buttons: "Play again" starts a new game, and Back returns to the club home. The "Season over" line from S-008 is retired.

## Key decisions
- ADR-0015: the End of season screen and Play again. It supersedes S-008's plain "Season over" line. The summary is derived from the results log (`seasonSummaryOf`), not stored. `ViewSeasonEnd` is a new action; `NewGame` resets the record.
- Domain rules: the top scorer comes from `season.ts`; `formatOrdinal` sits in `standings.ts` as ADR-0015 says.
- U-1: the S-008 assertions that pinned the "Season over" line were replaced by equal-or-stricter ones for the button (they also check size, order and no sideways scroll). Nothing weakened or skipped.

## Work completed (roadmap steps 01-01 to 01-03)
| Step | Outcome | Commit |
|---|---|---|
| 01-01 | Season rules: ordinal final position and top scorer in the domain | bba0735 |
| 01-02 | App state: End of season screen, season summary selector, Play again reset | 634aa6a |
| 01-03 | End of season screen, club home button, Play again wiring, S-008 e2e amendments | 4b167eb |
| review | Acceptance headers anchored to the Elevator Pitch | 3dcd1b6 |

Source touched: `src/app/state.ts`, `src/domain/season.ts`, `src/domain/standings.ts`, `src/main.ts`, `src/ui/screens/club-home.ts`, `src/ui/screens/season-end.ts` (new), `src/ui/styles.css`.

## Reviewer findings carried over
- DISTILL final gate (haiku reviewers, all conditionally approved, 0 blockers; see the last section of `distill/upstream-issues.md`):
  - Dispatch/listener-count, import-count and CSS greps from `season-end-source.test.ts.pending` may be dropped only where e2e X1/X3/X8 cover them; domain purity and no-innerHTML guards stay.
  - Error-path share is 24% on `@error` alone (92% counts `@boundary`).
  - Unit case: player names are unique and hold no round brackets for seeds 1..300.
  - Tier B skipped and whole-state `toEqual`/`toBe` used in place of a `state_delta` port (project convention, as in S-003..S-008).
  - The DISCUSS "forgets the old season's picks" scenario makes no pick; the held-out navigation spec covers picks surviving a reset.
  - The DELIVER line budget is the DESIGN figure (654), not DISCUSS (410).
- DELIVER review: a reviewer suggested `formatOrdinal` live in `season.ts`. It stays in `standings.ts` per ADR-0015 (the standings module owns ordinal position formatting).
- Owner-level items (deploy gating, scanning, rollback tag, `tests/protected/S-009` ownership) are outside the factory's remit.

## Issues and quality-gate notes (honest record)
- Execution-log timestamps are short (seconds between RED and GREEN, 01-03 RED to GREEN is one second) because the crafter ran quickly. RED evidence is thin, as in S-005 to S-008.
- The S-008 test amendments (U-1) came from the DISTILL patch `distill/pending/amend-s008-tests.patch`, applied under the ADR-0015 supersession. Rows 1-4 and 6 rode with the club-home step, row 5 with the state step.
- `tests/protected/S-009/` was not run locally; CI runs it on main.
- Mutation testing is nightly-delta; `/nw-deliver` Phase 5 skipped. Watch item (U-3): the K2 sweep over seeds 1..300 is about 3.2 s; if the first nightly nears 45 minutes, trim `numRuns` of the 25-run properties first, never the seed range.
- `des-verify-integrity` passed. Gates: `ci:lint`, `ci:typecheck`, `ci:test` (1038 passed), `ci:e2e` (134 passed) all green.

## Lessons
- Listing every superseded assertion with exact replacement text in DISTILL (U-1) and storing it as a patch made the amendment commit mechanical.
- Committing the oracle and reference modules in DISTILL (U-2) kept the held-out specs independent of the code under test.
- Building each seed's finished log from the oracle, instead of 28 taps, kept the 300-seed sweep fast and out of the default timeout.

## Migrated artifacts
None to copy: no `design/` directory exists in the feature workspace. ADR-0015 and the architecture brief already live in `docs/product/architecture/` (SSOT). `docs/feature/S-009/` is preserved as delivery history. Session artifacts removed: `.nwave/des/deliver-session.json` and `.nwave/des/des-task-active` (untracked), and the untracked `deliver/.develop-progress.json`.
