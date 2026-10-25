# Slice 01: End of season screen (final position, top scorer, Back)

**Story:** US-1 (S-009). **Depends on:** S-007 (results log, standings), S-008 (14 matchdays, derived season-complete flag; ADR-0014). **Estimate:** about 0.6 day, about 280 changed lines in DELIVER, tests included. Code about 85 (selectors 35, screen renderer 35, club home, `main.ts`, CSS 15). Tests about 195 (unit and property 110, amended S-008 "Season over" assertions 40, e2e 45, only what `tests/protected/S-009/` does not cover). **Release:** ships in ONE DELIVER merge together with slice 02; there is no separate release of this slice, so a "Play again" button that does nothing never ships.

## Goal
After matchday 14 the club home offers "End of season" instead of the "Season over" line. The screen gives Sam's verdict: his final position and his top scorer, and "Back" returns to the club home.

## IN
- Club home: "End of season" button (44px or taller) in the "Play match" slot once 14 matchdays are recorded; none before. "Season over" line removed. Heading, "Squad", "Tactics", "Starting XI", "Table" stay.
- Screen: only h1 "End of season", focused on arrival; "Final position <1st..8th>" equal to the table's Pos; the "Top scorer" line matching ^Top scorer (none|(.+) \((\d+) goals?\))$ ("goal" singular exactly when the count is 1, "none" exactly when the club scored no goal), ties to the first in the "Squad" list; buttons "Play again" (its behaviour is slice 02, in the same merge) and "Back" (44px or taller).
- Changing Tactics or the Starting XI after matchday 14 does not change the screen.
- "Back" to the club home, heading focused, still "End of season"; the screen can be reopened and reads the same.
- Derived from the results log and the seed only; nothing stored; no new stream.
- D7: the S-008 "Season over" e2e and unit assertions replaced, never weakened.
- Names check: no generated name holds "End of season", "Final position", "Top scorer" or "Play again".

## OUT
"Play again" behaviour (slice 02). League-wide top scorer, other clubs' scorers, awards, trophy or banner, re-opening matches, persistence.

## Learning hypothesis
If this slice fails, it disproves this: "a one-tap verdict (a final place and a named top scorer) gives the season the closure the north star 'start to finish' needs".

## Acceptance (player-facing)
- `?seed=31`, "Netherwold Borough", untouched tactics: after 13 matches "Play match" and no "End of season"; after 14, "Back" shows "End of season" and no "Play match" or "Season over". "End of season": "Final position 3rd", "Top scorer Garrick Thistlewood (5 goals)" (tied with Merrick Hartwell on 5; Thistlewood is the 15th row of the Squad list, Hartwell the 18th), "Play again", "Back".
- `?seed=abc`, "Oakhampton Rise Borough": "Final position 2nd", "Top scorer Joren Northcott (8 goals)"; the same with no "?seed=".
- `?seed=13`, "Ashworth Vale Rovers": "Final position 8th", "Top scorer Orrin Yarrow (1 goal)".
- `?seed=1`, "Wexcombe Athletic" (e2e row, not protected): "Final position 8th", "Top scorer Bram Fairbourne (3 goals)".
- "Back": club home, heading focused, "End of season"; "Table" reads P 14 on every row.

## Developer criteria (not story AC)
- Unit: ordinal table 1st..8th; top scorer over constructed logs (outright, 2- and 3-way ties to the first in the "Squad" list, 1 goal, none); final position equals `standingsOf` Pos; the offer for 14 recorded matchdays and not 0..13; the view action is a no-op unless the season is complete; Tactics or XI changes after matchday 14 leave the screen unchanged.
- Fixed-seed sweep: seeds 1..300 x 8 clubs, the screen's lines agree with the standings and the counted goals (K2).
- Golden: the seed-31, seed-20260, seed-13 and seed-1 lines above (`discuss/reference-season-end.md`; e2e in Chromium as well).

## Demonstrable
`/gaffer/?seed=31`: New game, "Netherwold Borough", 14 x ("Play match", "Back"), "End of season".
