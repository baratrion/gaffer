# Slice 02: Play again

**Story:** US-2 (S-009). **Depends on:** slice 01 (the End of season screen and its "Play again" button). **Estimate:** about 0.4 day, about 130 changed lines in DELIVER, tests included. Code about 25 (the reset action in `state.ts`, wiring). Tests about 105 (unit and property 60, e2e 45). With it the roadmap outcome is complete.

## Goal
"Play again" on the End of season screen starts a fresh season of the same league at once: the pick-a-club screen, then matchday 1 with an all-zero table, the default formation and the automatic XI.

## IN
- "Play again" lands on the screen "New game" shows (heading focused, the "Clubs" list of the same league, the same 8 names in the same order). Same seed; no page reload.
- Reset: no results (table all zero, A to Z), formation "4-4-2", automatic Starting XI, next "Play match" is "Matchday 1".
- Same seed, club and choices replay the same season and the same End of season screen.
- The landing place is this version only (D3, D6): not pinned in `tests/protected/S-009/`.

## OUT
A different league or seed on "Play again", carrying anything into the new season (squads, history, records), a "next season" with the same club kept, save and continue.

## Learning hypothesis
If this slice fails, it disproves this: "one tap from the verdict to a fresh season turns the end of a season into the start of the next, so the owner plays a second one".

## Acceptance (player-facing)
- `?seed=31`, End of season of Netherwold Borough: "Play again" shows the 8 clubs in the first "New game" order; "Netherwold Borough", "Table": every row 0, A to Z; "Back", "Play match": "Matchday 1", "Netherwold Borough 1–2 Marlbrook Athletic".
- Old season chose "4-3-3" and picked "Kestrel Northcott 6" for "MF Calder Redfern 15": after "Play again", "Netherwold Borough", "Tactics" shows "4-4-2"; "Starting XI" is the automatic 4-4-2 XI of a new game.
- `?seed=abc`: "Play again", "Valebridge Town": "Play match" (no "End of season"), first match "Matchday 1".
- Replaying 14 matches with untouched tactics gives the same End of season screen, line for line.

## Developer criteria (not story AC)
- Unit: "Play again" from the End of season screen equals `update(initialState(league), NewGame)` for the same league; a no-op from any other screen; `NewGame` stays title-only (or DESIGN widens it and records why).
- Property: after any season and any run of up to 40 formation, pick and navigation actions, "Play again" gives that same fresh state (K3).

## Demonstrable
`/gaffer/?seed=31`: slice 01's path, then "Play again", "Netherwold Borough", "Table", "Back", "Play match".
