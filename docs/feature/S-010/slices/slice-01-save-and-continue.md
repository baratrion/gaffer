# Slice 01: Save and Continue to the club home

**Story:** US-1 (S-010). **Depends on:** S-007 (results log, standings), S-008 (14 matchdays, `nextMatchday`), S-009 (End of season, "Play again"). **Estimate:** about 0.7 day, about 335 changed lines in DELIVER, tests included. Code is about 125 lines: save format 60, shell adapter and wiring 25, Continue plus the `update`/`render` lookup refactor 30, title button 10. Tests are about 210 lines: unit and property 120, e2e 75 (only what `tests/protected/S-010/` does not cover), and the D7 amendments 15. **Release:** this slice is the first set of ordered DELIVER commits of S-010; slice 02's commits follow on the same branch, and both ship in ONE merge. There is no separate release, so main never gets a "Continue" that drops the formation or the Starting XI.

## Goal
The game saves itself once a club is picked and after every "Play match". After a reload, the title offers "Continue", which lands on the saved club's home with the same table, the next matchday, and a finished season's End of season, whatever "?seed=" the address holds.

## IN
- Automatic save (no Save button) under "gaffer.save" (ADR-0016) after the club-choice tap and after each "Play match". The pick-a-club screen (no club yet) writes nothing. The save holds the seed, the club and the recorded results; the formation and XI are added by slice 02's commits in the same merge. The screen is not saved.
- Title: "Continue" (44px or taller) above "New game" when a saved game exists, and none otherwise. The h1 "Gaffer" stays the only h1, focused on load.
- "Continue" goes to the club home with its heading (the club's name) focused. "Table" shows the same cells. The next "Play match" is "Matchday N+1". After 14, the club home shows "End of season" and no "Play match", and the screen shows the same lines.
- With untouched tactics, the continued season equals the uninterrupted one.
- The save carries its seed: "Continue" ignores the address's "?seed=" (D5).
- "New game" with a saved game present starts fresh from the address's seed (all-zero table in A to Z order, "4-4-2", "Matchday 1"). "New game" and "Play again" do not remove the save; the club-choice tap replaces it (version-only). Until then a reload's "Continue" offers the earlier game, a finished one included (D7). Accepted risk (D4): a mistaken "New game" followed by a club pick replaces the save.
- The `update` and `render` switches move to lookups before the new action (S-009 DESIGN Open question 1).
- D7 amendments (titles reworded, assertions never weakened):
  - the S-008 e2e "reload loses the season" test also checks that "Continue" is offered;
  - the S-009 acceptance test title "(a reload)" is reworded.

## OUT
Saving the formation and the XI picks, and the damaged, incompatible, blocked and full storage safety (all slice 02). Several slots, a "Delete save" button, export, sync, several tabs, restoring the last screen.

## Learning hypothesis
If this slice fails, it disproves this: "a one-tap Continue that brings back the season's results and next matchday lets a 14-matchday season be played across 5-minute sessions".

## Acceptance (player-facing)
- Fresh browser at `?seed=31`: no "Continue". "New game", "Netherwold Borough", reload: "Continue" above "New game", and "Gaffer" focused.
- After 2 x ("Play match", "Back"), reload, "Continue":
  - "Netherwold Borough" is focused;
  - "Table" is unchanged, with Netherwold Borough 8th at P 2 and Pts 0;
  - "Play match" shows "Matchday 3", "Netherwold Borough 2–1 Oakhampton Rise Borough", the same as an uninterrupted browser.
- The same save opened at `?seed=abc`: "Continue" still lands on "Netherwold Borough", with "Matchday 3" next.
- After 14 matches, reload, "Continue": "End of season" and no "Play match"; the screen still reads "Final position 3rd" and "Top scorer Garrick Thistlewood (5 goals)".
- With a saved game, reload, "New game", "Netherwold Borough": the table is all zero in A to Z order, "4-4-2", "Matchday 1".
- "New game" (or "Play again" after 14) without picking a club, then a reload: "Continue" still resumes the old game.

## Developer criteria (not story AC)
- Unit:
  - the club-choice tap and Play match write the save; navigation and the pick-a-club screen do not;
  - "Continue" gives the club home with the saved results; `nextMatchday` is N+1, or `undefined` after 14;
  - restore uses the saved seed;
  - D4 timing.
- Round trip over seeds 1..300 x 8 clubs after each matchday 0..14 (untouched tactics); DISTILL may trim the sweep (K2).
- `update` and `render` stay under the lint complexity limit after the lookup refactor.

## Demonstrable
`/gaffer/?seed=31`: "New game", "Netherwold Borough", 2 x ("Play match", "Back"), reload, "Continue", "Table", "Back", "Play match".
