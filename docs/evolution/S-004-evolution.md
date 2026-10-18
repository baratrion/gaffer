# S-004: Choose a formation (evolution record)

Finalized 2026-10-18. Delivery history stays in `docs/feature/S-004/` (feature-delta, slices, discuss, distill, `deliver/roadmap.json`, `deliver/execution-log.json`).

## Summary
On the club home Sam taps "Tactics" and sees a radio group "Formation" (4-4-2, 4-3-3, 4-2-3-1; 4-4-2 by default for a new game) and a list "Line-up" of 11 position codes (GK, DF, MF, FW). Tapping a formation checks it and updates the line-up at once; the heading stays "Tactics" and focus stays on the tapped radio. The choice is kept for the session (in memory only) and survives visits to Squad and a player. "Back" returns to the club home. Formations are fixed data, identical for every seed.

## Key decisions
- ADR-0007: formation data in pure domain (`src/domain/formation.ts`); `GameState` gains the chosen formation; `Screen`/`Action` gain tactics variants (`ViewTactics`, `ChooseFormation`); wrong-screen actions and unknown formations are no-ops.
- ADR-0008: focus on a same-screen update. The `change` listener names the element to refocus (`dispatch(action, focusId?)`), so the unconditional `<h1>` focus applies only after a render that changed the screen. Works on iOS Safari, where tap does not focus a radio.
- Persistence across reloads is out of scope (later "Save and continue" story). Slots are position codes only; player names come with S-005.

## Work completed (roadmap steps 01-01 to 01-03)
| Step | Outcome | Commit |
|---|---|---|
| 01-01 | Domain precursor: formation data | 020a8a0 |
| 01-02 | State: formation field, `ViewTactics`, `ChooseFormation`, Back, `focusPlan` in `src/app/state.ts` | e35a42f |
| 01-03 | Tactics renderer, Tactics button on club home, `main.ts` wiring and focus, CSS, e2e | 2f6d886 |
| Refactor/review fixes | `:has()`, `sameScreen`, unexported helper | f83caaa |

## Quality-gate notes (honest record)
- The roadmap reviewer rejected once, on orphan committed guards R4/R5; fixed and re-approved.
- Step 01-03's RED was logged without a captured failing run.
- Steps 01-02 RED/GREEN/COMMIT share timestamps (18:46:40Z): the implementation was written before RED, and RED was verified afterwards by swapping in the prior `state.ts`. Process deviation from strict RED-first.
- The implementation reviewer flagged the test-count budget. Not actionable: repo CI forbids removing tests (append-only and no-regression guards).
- Fixes for `:has()`, `sameScreen` and an unexported helper were applied in commit f83caaa.
- Mutation testing is nightly-delta; `/nw-deliver` Phase 5 skipped.

## Lessons
- Log RED with a captured failing run per step; timestamps identical across phases signal missing evidence.
- Planning commits that are not shipped alone (01-01, 01-02) still need guards that reference live code, or reviewers flag them as orphans.
- Decide the focus model before the screen: a same-screen update is the first case where the shell's "focus the h1 after every render" breaks.

## Migrated artifacts
None to copy. ADR-0007 and ADR-0008 already live in `docs/product/architecture/` (SSOT). No walking-skeleton or UX files in the destination map. `docs/feature/S-004/` is preserved as delivery history (including tracked `deliver/` files).
