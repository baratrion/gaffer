# S-005 DISTILL verification note

Scratch reference run, same method as S-004. A throwaway implementation was written in a temporary git worktree of HEAD (`/tmp/s005-ref`) with `node_modules` linked: `src/domain/selection.ts`; the `state.ts` extension (optional `xi`, `startingXI` and `choosePlayer` screens, `ViewStartingXI`, `ChooseSlot`, `PickPlayer`, `currentXI`, `squadOf`, private `withoutPicks`, `Back` cases, `sameScreen` cases, `ChooseFormation` and `NewGame` dropping picks); `starting-xi.ts` and `choose-player.ts`; the club-home "Starting XI" button; two `main.ts` render cases with a `never` guard; CSS. No existing test or fixture was edited (the optional `xi` needs none). The four held-out files were copied into `tests/` (dropping `.pending`) next to the four committed guards (and the committed S-004 and older tests), and these were run there:
- `pnpm run ci:typecheck`: clean.
- `pnpm run ci:lint`: clean, after replacing three 4-parameter property callbacks (test-side `max-params` is 3) by one `anyContext` arbitrary.
- `pnpm run ci:test`: 24 files, 573 tests passed (held-out: selection 51, navigation 86, focus-plan 95 = 232; committed S-005 guards 14).
- `pnpm run ci:e2e`: 85 passed (held-out S-005 spec 29, committed S-005 club-home regression 1, 55 existing).
- One held-out e2e case (the apostrophe and hyphen probe) was wrong on its first run (it tapped "Tactics" on the Starting XI screen); fixed in the spec, not in the reference.
- Seeded faults, each a one-line change in the reference, all caught:
  - Unit side (applied together, 36 vitest cases failed in 3 files): ties broken by later squad index; a pick that never swaps (duplicates); a pick of another position accepted; slot 11 accepted as a slot; `ChooseFormation` keeping the stored XI; `Back` from the choose screen going to the club home; `focusPlan` ignoring the slot; `NewGame` keeping the stored XI. Failures were in goldens, the replace/swap properties, the no-op cases, `isSlotIndex`, navigation and focus-plan.
  - Spans without the single-space text nodes (the DESIGN fault): 26 of the 29 e2e cases failed (exact names and `textContent`).
  - `display: grid` on the slot button (the DESIGN fault): the e2e fails on the `innerText` equality of the 11 slots ("GK" / name / "17" on three lines) while the accessible name and `textContent` still pass, so that check is what catches it.
  - Small choice buttons and Back, `white-space: nowrap` on the slot, "Starting" marks removed from the choose screen (together, 11 e2e cases failed: marks, 44px, scroll width); small choices and Back alone, 8 failed.
  - `ChooseFormation` keeping picks, seen from the browser: 2 e2e cases failed (the formation re-pick and the whole-journey no-console-error walk).
  - A `.focus()` call inside the new renderer: the committed `renderers-never-move-focus` guard failed.
  The worktree was removed; no reference code is kept.

Real repo, without the reference:
- Held-out files copied into `tests/` temporarily: `oxlint` clean; `tsc` reports only errors that follow from missing symbols (`src/domain/selection`, `squadOf`, `currentXI`, `GameState.xi`, the `startingXI` and `choosePlayer` screens, `ViewStartingXI`, `ChooseSlot`, `PickPlayer`, and implicit-any parameters that follow from them); vitest fails `selection.test.ts` and `navigation.test.ts` on the missing `selection` module, and 7 `focus-plan` cases fail because `focusPlan` does not know the new screens (it returns the heading for an equal copy). RED for missing functionality, not setup. The copies were then removed.
- Not run without the reference: the held-out e2e spec (it needs the "Starting XI" button; it would time out on the missing button, not on setup).
- Committed tree: `ci:lint`, `ci:typecheck`, `ci:test` (21 files, 341 tests; 327 before, +14), `ci:e2e` (56 tests; 55 before, +1) green.
