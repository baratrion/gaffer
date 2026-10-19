# S-005: Pick my starting XI (evolution record)

Finalized 2026-10-19. Delivery history stays in `docs/feature/S-005/` (feature-delta, slices, discuss, distill, `deliver/roadmap.json`, `deliver/execution-log.json`).

## Summary
On the club home Sam taps "Starting XI" and sees a list "Starting XI" of 11 slot buttons (position code, name, overall), pre-filled with the best player per position for the chosen formation. Tapping a slot opens "Choose GK/DF/MF/FW" listing the squad players of that position; tapping one puts them in the slot (a non-starter replaces, a starter of another slot swaps, the slot's own player changes nothing). The XI is always 11 players with exactly one goalkeeper by construction. Back returns to the previous screen. Re-picking a formation drops manual picks (the automatic XI for the new formation applies). State is in memory only.

## Key decisions
- ADR-0009: pure domain `src/domain/selection.ts` (`automaticXI`, `pickForSlot`, `playersForPosition`, `isSlotIndex`); no RNG, no seed of its own. `StartingXI` is 11 squad indices in slot order.
- `GameState.xi` is optional and stored only after the first real pick; the effective XI is `currentXI(state, squad)` (stored, else automatic), derived on demand like the squad. A required `xi: null` was rejected because it breaks S-003/S-004 whole-state assertions.
- `ChooseFormation` and `NewGame` drop a stored XI (`withoutPicks`); a never-changed XI leaves the S-004 result exactly `{ ...state, formation }`.
- Focus (ADR-0008 reused): every S-005 navigation changes the screen, so focus goes to the new `<h1>`; `sameScreen` gained startingXI (by club) and choosePlayer (by club and slot).
- Button text built from inline spans with literal space nodes so `textContent` and the accessible name match; no flex/grid on those buttons.

## Work completed (roadmap steps 01-01 to 01-03)
| Step | Outcome | Commit |
|---|---|---|
| 01-01 | Selection rules in `src/domain/selection.ts`; `selection.test.ts` activated | 25ad8ba |
| 01-02 | `xi`, `startingXI`/`choosePlayer` screens, three actions, `currentXI`, `focusPlan` in `src/app/state.ts`; navigation and focus-plan specs activated | 1d84a52 |
| 01-03 | `starting-xi.ts` and `choose-player.ts` renderers, club home button, `main.ts`, CSS; e2e spec activated, `distill/pending/` removed | 721f53e |

## Quality-gate notes (honest record)
- Step 01-03 RED is logged SKIPPED: the activated spec was not run before implementation (the Starting XI button did not exist). Process deviation from strict RED-first; the DES traces are complete and `des-verify-integrity` exits 0.
- Steps 01-01 and 01-02 have RED/GREEN/COMMIT within seconds of each other, so RED evidence is thin.
- The implementation reviewer (one pass) flagged the test-count budget (91 declarations vs 40-50 estimated): not actionable, tests may not be removed. Renderer prop shapes and heading id `starting-xi-heading` differ from ADR-0009 text; behaviour identical, left for a later refactor.
- Mutation testing is nightly-delta; `/nw-deliver` Phase 5 skipped.

## Lessons
- Move held-out specs and run them before implementing, so RED has a captured failing run.
- Size test budgets from the DISTILL spec count, not an early estimate.
- Keep ADR prop shapes and ids in sync with the code at the end of the step, or note the deviation in the ADR.

## Migrated artifacts
None to copy. ADR-0009 and the S-005 component inventory (`selection.ts`, `starting-xi.ts`, `choose-player.ts`, `currentXI`, driving ports 15-17) already live in `docs/product/architecture/` (SSOT, `brief.md` needs no change). `docs/feature/S-005/` is preserved as delivery history. Session artifact `deliver/.develop-progress.json` removed.
