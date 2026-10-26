# Slice 01: Save and Continue to the club home

**Story:** US-1 (S-010). **Depends on:** S-007 (results log, standings), S-008 (14 matchdays, `nextMatchday`), S-009 (End of season, "Play again"). **Estimate:** about 0.7 day, about 320 changed lines in DELIVER, tests included. Code is about 125 lines: save format 60, shell adapter and wiring 25, Continue plus the `update`/`render` lookup refactor 30, title button 10. Tests are about 195 lines: unit and property 120, e2e 65 (only what `tests/protected/S-010/` does not cover), and the D7 S-008 reload test 10. **Release:** ships in ONE DELIVER merge together with slice 02; there is no separate release of this slice, so a "Continue" that drops the formation or the Starting XI never ships.

## Goal
The game saves itself once a club is picked and after every "Play match". After a reload, the title offers "Continue", which lands on the saved club's home with the same table, the next matchday, and a finished season's End of season.

## IN
- Automatic save (no Save button) after picking the club and after each "Play match". The save holds the seed, the club and the recorded results; the formation and XI are added in slice 02, in the same merge. The screen is not saved.
- Title: "Continue" (44px or taller) above "New game" when a saved game exists, and none otherwise. The h1 "Gaffer" stays the only h1, focused on load.
- "Continue" goes to the club home with its heading (the club's name) focused. "Table" shows the same cells. The next "Play match" is "Matchday N+1". After 14, the club home shows "End of season" and no "Play match", and the screen shows the same lines.
- With untouched tactics, the continued season equals the uninterrupted one.
- "New game" with a saved game present starts fresh from the address's seed (all-zero table in A to Z order, "4-4-2", "Matchday 1"). "New game" and "Play again" do not remove the save; picking a club replaces it (version-only).
- The `update` and `render` switches move to lookups before the new action (S-009 DESIGN Open question 1).
- D7: the S-008 "reload loses the season" e2e test is reworded and gains a "Continue is offered" check; its assertions are never weakened.

## OUT
Saving the formation and the XI picks, the unreadable-save and storage-failure safety, and D5's seed rule (all slice 02). Several slots, a "Delete save" button, export, sync, restoring the last screen.

## Learning hypothesis
If this slice fails, it disproves this: "a one-tap Continue that brings back the season's results and next matchday lets a 14-matchday season be played across 5-minute sessions".

## Acceptance (player-facing)
- Fresh browser at `?seed=31`: no "Continue". "New game", "Netherwold Borough", reload: "Continue" above "New game", and "Gaffer" focused.
- After 2 x ("Play match", "Back"), reload, "Continue": "Netherwold Borough" focused. "Table" is unchanged, with Netherwold Borough 8th at P 2 and Pts 0. "Play match" shows "Matchday 3", "Netherwold Borough 2–1 Oakhampton Rise Borough", the same as an uninterrupted browser.
- After 14 matches, reload, "Continue": "End of season" and no "Play match"; the screen still reads "Final position 3rd" and "Top scorer Garrick Thistlewood (5 goals)".
- With a saved game, reload, "New game", "Netherwold Borough": the table is all zero in A to Z order, "4-4-2", "Matchday 1".
- "New game" without picking a club, then a reload: "Continue" still resumes the old game.

## Developer criteria (not story AC)
- Unit: club pick and Play match write the save; navigation does not. "Continue" gives the club home with the saved results; `nextMatchday` is N+1, or `undefined` after 14. D4 timing (`pickClub` writes nothing).
- Round trip over seeds 1..300 x 8 clubs after each matchday 0..14 (untouched tactics); DISTILL may trim the sweep (K2).
- `update` and `render` stay under the lint complexity limit after the lookup refactor.

## Demonstrable
`/gaffer/?seed=31`: "New game", "Netherwold Borough", 2 x ("Play match", "Back"), reload, "Continue", "Table", "Back", "Play match".
