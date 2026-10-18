# Slice 03: The XI is kept and follows a formation change

**Story:** US-3 (S-005). **Depends on:** slice 02 (picks exist), S-004 (choosing a formation). **Estimate:** about 100 changed lines, 1 day. Releasable: Sam's picks survive the session and a change of shape.

## Goal
Sam's XI stays as picked while Sam visits "Squad" or "Tactics"; when Sam changes the formation the XI updates at once to the new line-up and keeps every pick it has room for.

## IN
- The XI is kept in the game state for the session: after "Back", "Squad" (and a player), "Back", "Tactics" (no change), "Back", "Starting XI", it is unchanged.
- Choosing another formation in Tactics updates the XI at once to the new line-up: in each position the players already starting keep their order and stay in as far as the new formation has room (the first ones in slot order stay, the last ones drop out); each extra slot takes the highest-rated unpicked player of that position (ties in squad order), in that order.
- An XI Sam never changed is always the automatic XI of the current formation (the rule above preserves it).
- Choosing the formation already chosen leaves the XI unchanged. The Tactics screen and its "Line-up" list look exactly as in S-004.
- "New game" (title screen, fresh page) starts from the automatic XI again.

## OUT
Showing the XI on the Tactics screen, out-of-position moves on a formation change, persistence across reloads, undo of a formation change.

## Learning hypothesis
Disproves "a per-position keep-then-fill rule keeps Sam's picks through any of the 6 formation changes without a gap, a duplicate or a surprise reorder" if it fails.

## Acceptance (player-facing)
- After picks, "Squad", "Back", "Tactics", "Back", "Starting XI": the same 11 buttons in the same order.
- 4-4-2 to 4-3-3: the first 3 MF starters stay in order, the 4th drops out; the 2 FW stay in order and the 3rd FW slot takes the highest-rated unpicked forward.
- 4-3-3 back to 4-4-2: the 3 MF stay, the 4th MF slot takes the highest-rated unpicked midfielder; the first 2 FW stay.
- 4-3-3 to 4-2-3-1: 3 MF stay, 2 extra MF slots take the two highest-rated unpicked midfielders, best first; only the first FW stays.
- A fresh page and "New game" at the same `?seed=` show the automatic XI again.
- No sideways scroll; no console errors.

## Developer criteria (not story AC)
- Property tests over all 6 ordered formation pairs, many seeds, clubs and pick sequences: 11 distinct, positions match, kept players keep relative order, extras are the top-rated unpicked, automatic XI maps to the automatic XI; same formation returns the XI unchanged.
- Unit on `update`: `NewGame` resets the XI; the S-004 `ChooseFormation` guards unchanged.

## Demonstrable
`/gaffer/?seed=31`, a club, "Starting XI", swap a midfielder, "Back", "Tactics", "4-3-3", "Back", "Starting XI", then "Tactics", "4-4-2", "Back", "Starting XI".
