# Slice 02: Tap a slot, pick a player, swap; the XI is kept for the session

**Stories:** US-2 and US-3 (S-005). **Depends on:** slice 01 (the Starting XI screen and the automatic XI). **Estimate:** about 1-1.5 days, about 540 changed lines, tests included: code about 170 (pick/swap rule 30, state 50, choose screen 50, `main.ts` 15, CSS 25) and tests about 370 (selection 80, navigation and reset 120, e2e 130, existing fixtures 40 if needed). It ships in the same DELIVER as slice 01; with it, the roadmap outcome and `tests/protected/S-005/` are complete.

## Goal
On the Starting XI screen Sam taps a slot and sees the squad's players of that position, with the starters marked. Sam taps one and is back on the Starting XI with that player in the slot, or swapped with the slot he came from. The XI is kept while Sam visits "Squad" or "Tactics".

## IN
- Each slot button opens a choose screen:
  - exactly one heading "Choose GK", "Choose DF", "Choose MF" or "Choose FW" (the slot's code), focused on arrival;
  - a list named "Players" with one button (44px or taller) per squad player of that position (2 GK, 6 DF, 6 MF or 4 FW), in squad order, each reading name, one space, overall, plus one space and "Starting" for players in the XI (for example "Ivo Elderkin 18 Starting");
  - exactly as many buttons read "Starting" as the formation has slots of that position.
- Tapping a player returns to the Starting XI screen (heading focused):
  - a player not in the XI replaces the slot's player;
  - a player in another slot swaps with the slot's player;
  - the slot's own player changes nothing.

  The XI always holds 11 different players.
- A button named exactly "Back" (44px or taller) on the choose screen returns to the Starting XI screen (heading focused), unchanged.
- Session memory: the XI is kept after "Back", "Squad" (and a player), "Back", and after "Tactics" without choosing another formation (a tap on the checked formation included), then "Back".
- Choosing another formation re-picks the automatic XI of the new formation and drops the picks. This story only; unit and e2e tests, not protected. The `ChooseFormation` guards are unchanged.
- "New game" in a fresh page starts from the automatic XI.
- Wrong-screen or invalid actions are no-ops: a slot outside 0..10, a player not of the slot's position or outside 0..17, an unknown club.

## OUT
Keeping picks through a formation change (deferred next-story candidate, D15). Also out: players of another position, condition or attributes on the choose screen, a bench, drag and drop, persistence.

## Learning hypothesis
This slice disproves the following if it fails: "tap a slot, tap a player is enough to set any XI within positions in 2 taps per change, with swaps instead of duplicates, focus always on the new screen's heading, and the XI kept for the session".

## Acceptance (player-facing)
- Netherwold Borough (`?seed=31`), automatic XI: tapping "MF Dorian Dunmore 7" shows one focused heading "Choose MF". The list "Players" reads "Calder Redfern 15 Starting", "Ivo Elderkin 18 Starting", "Dorian Dunmore 7 Starting", "Finlay Ballantyne 3", "Joren Dalrymple 16 Starting", "Kestrel Northcott 6".
- Tapping "Kestrel Northcott 6" returns to "Starting XI" (heading focused). The 9th button reads "MF Kestrel Northcott 6", Dorian Dunmore is in no slot, and the other 10 are unchanged.
- From the automatic XI, tapping "MF Ivo Elderkin 18" then "Joren Dalrymple 16 Starting" swaps them: the 6th button reads "MF Joren Dalrymple 16" and the 7th "MF Ivo Elderkin 18".
- Oakhampton Rise Borough (`?seed=abc`): "GK Alden Hartwell 17" then "Alden Hartwell 17 Starting" changes nothing. So do "FW Joren Northcott 19" then "Back".
- After the pick: "Back", "Squad", "Back", "Tactics", "4-4-2", "Back", "Starting XI" shows the same 11 buttons.
- After the pick: "Back", "Tactics", "4-3-3", "Back", "Starting XI" shows Netherwold Borough's automatic 4-3-3 XI.
- A fresh page, "New game" and the same club show the automatic 4-4-2 XI.
- Each player button and "Back" are 44px or taller; no sideways scroll; no console errors.

## Developer criteria (not story AC)
- Property tests on pick and swap, for any slot and any eligible player:
  - the 11 players stay distinct and every slot's position equals its player's;
  - picking twice swaps back;
  - the own player returns the same state;
  - inputs are never mutated.
- Unit tests on `update`: the no-ops above, "Back" from the choose screen to Starting XI, the `NewGame` reset, and the formation re-pick. The S-004 acceptance tests stay green; how is DESIGN's question (M5).

## Demonstrable
`/gaffer/?seed=31`, New game, "Netherwold Borough", "Starting XI", "MF Dorian Dunmore 7", "Kestrel Northcott 6", then "MF Ivo Elderkin 18", "Joren Dalrymple 16 Starting", then "Back", "Squad", "Back", "Starting XI".
