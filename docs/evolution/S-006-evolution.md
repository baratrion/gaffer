# S-006: Play a match (evolution record)

Finalized 2026-10-23. Delivery history stays in `docs/feature/S-006/` (feature-delta, slices, discuss, distill, `deliver/roadmap.json`, `deliver/execution-log.json`).

## Summary
The club home gains a fourth button "Play match" (after Squad, Tactics, Starting XI; 44px or taller). It opens a match screen: `<h1>` "Matchday 1" (focused), one score line `Home 2–1 Away`, a labelled "Goals" list of items like `23' Name (Club)`, and a "Back" button to the club home. The result is instant, deterministic and derived on render, never stored: same seed, same club and untouched tactics always show the same match, and `?seed=abc` equals no seed. Sam's side uses the current XI and formation; the opponent (matchday-1 fixture) plays its automatic 4-4-2.

## Key decisions
- ADR-0010: fixed, seed-independent double round-robin in pure `src/domain/schedule.ts` (circle method, 14 matchdays x 4 fixtures, matchdays 8..14 mirror 1..7, deeply frozen table, `RangeError` out of range). Matchday 1 is `[0 v 7, 1 v 6, 5 v 2, 3 v 4]`.
- ADR-0011: pure `src/domain/match.ts` (`playMatch`, `teamStrength`). 9 chances per side, one per 10-minute window, a fixed 54 draws per match; own RNG stream `deriveSeed(seed, 200 + (matchday-1)*4 + fixtureIndex)` (streams 200..255); only `+ - * /`, comparisons and `Math.floor` so Chromium, WebKit and Node agree; scorers are outfield players weighted by shooting x position factor (DF 1, MF 2, FW 4). Result derived by the pure `matchFor` selector in `app/state.ts`, not stored in `GameState`; `Screen` gains `match`, `Action` gains `PlayMatch`.
- U-1 decision (orchestrator, DISTILL close): the one S-005 e2e assertion that listed exactly three club-home buttons was updated in DELIVER step 04, in the same commit as the button, to `["Squad", "Tactics", "Starting XI", "Play match"]`. Same assertion count, stricter (four names in order), nothing weakened or skipped. It supersedes the DISCUSS/DESIGN/DEVOPS claim that no test counts club-home buttons.
- U-3: the two ADR goldens (seed 31, seed 20260) do not alone pin the constants (`MAX_CONVERSION = 0.31` leaves both unchanged), so the K2 canonical-figure pin in `match-calibration.test.ts` guards them too. ADR-0011 was reworded accordingly.

## Work completed (roadmap steps 01-01 to 04-01)
| Step | Outcome | Commit |
|---|---|---|
| 01-01 | Pure double round-robin schedule `src/domain/schedule.ts`; `schedule.test.ts` activated | 65c6237 |
| 02-01 | Deterministic match model and calibration (golden, K1-K5 incl. K2 pin); stream-table comment in `squad.ts`; acceptance specs activated | 982f6b3 |
| 03-01 | Match state, `PlayMatch`, `Back`, `matchFor`, minimal `main.ts` case; navigation spec activated | 32b7b8a |
| 04-01 | `match.ts` screen, "Play match" button, CSS, e2e spec activated, U-1 edit, `distill/pending/` removed | db8c270 |
| 04-01 (follow-ups) | Refactor pass (`actionButton` helper in `club-home.ts`, line-wrapped `Back` guard) then test strengthening after review | 9837048, 6930017 |

## Issues and quality-gate notes (honest record)
- Reviewer rejection D1-D5: the implementation reviewer rejected the first pass on findings D1-D5. The findings text itself was not preserved in the repo, so it is not reproduced here. The fix is commit 6930017 ("strengthen match tests after review"), whose content is: exported `matchStream(matchday, fixtureIndex)` from `match.ts` and a hand-computed late-season golden (seed 31, matchday 9, fixture 2: stream 234, score 2-3, minutes 13, 16, 34, 64, 79); the stream-distinctness test restates the ADR-0011 formula independently for all 56 fixtures instead of trusting the code; `JSON.stringify` before/after checks that `PlayMatch` and `Back` do not mutate state; outcome-anchor headers added to the five test files lacking one. Refactor commit 9837048 removed the four near-identical button blocks in `club-home.ts`.
- Early COMMIT log entry on step 04-01: the execution-log COMMIT event for 04-01 (19:55:31Z) was logged before the first `des-commit` attempt had succeeded, i.e. before the commit it describes was verified. The DES audit log shows `LOG_INTEGRITY_WARNING` (pre-task timestamps on RED, GREEN, COMMIT) for 04-01, and `COMMIT_VERIFIED` only at 20:02 for 6930017. The commits exist and `des-verify-integrity` exits 0, but the 04-01 timestamps do not reflect the real order. Process deviation; the log was not edited after the fact.
- Execution-log RED/GREEN/COMMIT timestamps for steps 01-01 to 03-01 are seconds to two minutes apart, so RED evidence is thin (as in S-005).
- Mutation testing is nightly-delta; `/nw-deliver` Phase 5 skipped.

## Deferred review items
Reviewer items D6-D8 and D10 were not fixed in this story and are deferred (not actionable without editing existing tests or ADR text, or low value). As with D1-D5, the finding texts are not in the repo; look them up in the review output if needed. Note that the feature-delta uses its own D-numbers for design decisions, which are a different list.

## Lessons
- Persist reviewer findings in `docs/feature/<id>/deliver/` as they arrive, so the evolution record can quote them.
- Log a step's COMMIT event only after `des-commit` succeeds; an early entry produces integrity warnings and untrue timestamps.
- A golden does not pin every constant. Pin canonical aggregate figures too (K2), and say so in the ADR.
- Update existing-assertion conflicts (U-1) during DISTILL, not DELIVER, so the dependency is visible earlier.

## Migrated artifacts
None to copy. ADR-0010, ADR-0011 and the S-006 components and driving ports already live in `docs/product/architecture/` (SSOT); `brief.md` already marks them implemented, so no change there. `docs/feature/S-006/` is preserved as delivery history. Session artifact `deliver/.develop-progress.json` removed (`.nwave/des/deliver-session.json` did not exist).
