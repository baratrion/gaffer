# Slice 01: Tactics, choose a formation, see the line-up, Back

**Story:** US-1 (S-004). **Depends on:** S-001 (club home), S-002 ("Back" pattern). **Estimate:** about 350 changed lines, 2-3 days. The only slice of S-004, and releasable: the player sees a new screen and makes a choice. A domain precursor commit for the formation data is allowed (developer-facing, not shipped alone because nothing new is visible), followed by the screen commit. Per the expected ADR-0007.

## Goal
On the club home Sam taps "Tactics", chooses one of three formations, sees its 11-slot line-up update at once, taps "Back", and finds the same choice when returning later in the session.

## IN
Precursor commit (optional, developer-facing):
- Fixed formation data: "4-4-2", "4-3-3", "4-2-3-1" in that order, each with 11 position codes (GK, DF, MF, FW) in GK, DF, MF, FW order: 1/4/4/2, 1/4/3/3, 1/4/5/1. Pure, no seed, no RNG, no `Date` or DOM. Ported and simplified from `salvage/tactics.ts`, not imported.

Player-visible commit:
- Club home gains a button named exactly "Tactics" (44px or taller) in addition to "Squad" (layout is a DESIGN choice: stacked below it, ADR-0007/brief); heading still the club's name.
- Tactics screen: one heading "Tactics"; a radio group named "Formation" with radios "4-4-2", "4-3-3", "4-2-3-1" in that order, exactly one checked, each label 44px or taller; a list named "Line-up" of 11 items, each exactly one position code; a button named exactly "Back" (44px or taller) to the club home.
- `GameState` holds the chosen formation, initially "4-4-2". Choosing updates the radios and the list at once; the heading stays "Tactics" and focus stays on the tapped option (no jump to the `<h1>`, the focused radio is not lost). Navigation to another screen still focuses the new `<h1>`.
- The choice is kept in memory for the session (survives "Back", "Squad", a player, "Back"); every new game ("New game" on the title screen) starts at "4-4-2".
- Wrong-screen actions and unknown formations are no-ops. No sideways scroll at 390px; no console errors.

## OUT
Players in slots, suggested XI, mentality and instructions, drag and drop, finer roles (LB, CB, ST), pitch coordinates beyond a simple line layout, persistence across reloads, opponent tactics, the formation changing anything else.

## Learning hypothesis
Disproves "a formation can live in the game state and be changed on the same screen with focus kept on the tapped option, without breaking the shell's focus-on-heading navigation or any S-001..S-003 protected scenario, while a chosen formation is two taps from the club home" if it fails.

## Acceptance (player-facing)
- "Tactics" on the club home opens one heading "Tactics", the group "Formation" with the three radios in order, "4-4-2" checked in a new game, and "Line-up" reading GK, 4 DF, 4 MF, 2 FW.
- Tapping "4-3-3" checks only it, "Line-up" reads GK, 4 DF, 3 MF, 3 FW at once, heading unchanged, focus on "4-3-3".
- `?seed=abc`, 8th club: "4-2-3-1" gives 1 GK, 4 DF, 5 MF, 1 FW; every formation's 11 items are in GK, DF, MF, FW order, the same as for `?seed=31`.
- "Back", "Squad", "Back", "Tactics": the same formation is checked with its line-up.
- A fresh visit and "New game": "4-4-2" checked.
- "Tactics", "Back" and the three labels at least 44px; focus on the heading on arrival; no sideways scroll; no console errors.

## Developer criteria (precursor commit, not story AC)
- Unit: exactly three formations in order; each line-up has 11 codes from GK, DF, MF, FW, sorted by line, with the D4 counts.
- Unit on `update`: view-tactics only from a known club's home; choose-formation only on the tactics screen and only with a known formation; "Back" to club home; inputs not mutated; only the formation changes in `GameState` when choosing.

## Demonstrable
Open `/gaffer/?seed=31` on a phone, tap New game, a club, "Tactics", "4-3-3", "Back", "Squad", "Back", "Tactics".
