# S-007: League table (evolution record)

Finalized 2026-10-24. Delivery history stays in `docs/feature/S-007/` (feature-delta, slices, discuss, distill, `deliver/roadmap.json`, `deliver/execution-log.json`).

## Summary
The club home gains a fifth button "Table" (after Squad, Tactics, Starting XI, Play match; 44px or taller). It opens a table screen: `<h1>` heading (focused), a native table of all 8 clubs (P, W, D, L, GF/GA, GD, Pts) ordered by points, goal difference, goals for, then name, Sam's row marked `aria-current`, and a "Back" button. Before any match every row is zero in A to Z order. The first "Play match" tap records matchday 1 for all four fixtures; the match screen and the table read that one record, so formation, XI and visit taps never change either. A new game drops the record.

## Key decisions
- ADR-0012: recorded results. Pure `playMatchday` in `src/domain/match.ts` plays the 4 fixtures on the existing S-006 streams (200..203 for matchday 1; no new stream). `GameState.results` is optional and set once by `playOpeningMatchday` (Sam's side = `currentXI`, others automatic 4-4-2). It supersedes ADR-0011 section 5 and S-006 D8 (derive-on-render).
- ADR-0013: pure `src/domain/standings.ts` (`standings`, `formatGoalDifference`), name tie-break by code point with `<` (no `localeCompare`/Intl), table screen `renderTable` emitting only `Back`.
- U-2 / D12: three S-006 `match-navigation` cases and the club-home button list in the S-005 and S-006 e2e specs were replaced with stricter equivalents in the commit that made them obsolete. Nothing weakened or skipped.
- U-4: `sameScreen`/`back` refactored with a `sameClub` helper and a set of home-returning kinds to keep oxlint complexity at or under 15.

## Work completed (roadmap steps 01-01 to 04-01)
| Step | Outcome | Commit |
|---|---|---|
| 01-01 | Pure standings module and GD format; `standings.test.ts` activated | 6310cef |
| 02-01 | `playMatchday` and `PlayedMatch`; `matchday.test.ts` activated | 28d301d |
| 03-01 | Recorded results, `ViewTable`, table screen and shell case, `matchFor`/`standingsOf` read the record; `table-navigation.test.ts` activated | 421391b |
| 04-01 | Table button, table styles, design-system entry, e2e activated | 9c60535 |
| refactor | Club-home button pass | 2d9f951 |

## Issues and quality-gate notes (honest record)
- Implementation review: production code approved. Findings B1, B3 and H1 (test budget, test deletion) were declined because CI forbids deleting or weakening tests. Consequence: the DoD budget of 1100 changed lines was exceeded (about 1800 on the branch, 1616 of them test lines authored in DISTILL; production code about 280).
- Execution-log RED/GREEN/COMMIT timestamps are seconds to two minutes apart, so RED evidence is thin (as in S-005, S-006).
- `tests/protected/S-007/` was not run locally; CI runs it on main.
- Mutation testing is nightly-delta; `/nw-deliver` Phase 5 skipped.
- Finalize gates: `ci:lint`, `ci:typecheck`, `ci:test` (790 passed), `ci:build`, `ci:e2e` (114 passed) all green.

## Lessons
- State the change budget against the tests DISTILL has already written; a test-heavy plan cannot meet a line budget that a no-deletion rule forbids trimming.
- Replace superseded assertions in the same commit that obsoletes them (U-1 lesson from S-006 held: no surprises this time).

## Migrated artifacts
None to copy. ADR-0012, ADR-0013, the S-007 components and driving ports and the design-system table pattern already live in `docs/product/` (SSOT). `docs/feature/S-007/` is preserved as delivery history. Session artifacts removed: `deliver/.develop-progress.json`, `.nwave/des/deliver-session.json` (absent) and `.nwave/des/des-task-active*`.
