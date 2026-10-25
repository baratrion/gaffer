# Slice 01: End of season screen (final position, top scorer, Back)

**Story:** US-1 (S-009). **Depends on:** S-007 (results log, standings), S-008 (14 matchdays, derived season-complete flag; ADR-0014). **Estimate:** about 0.6 day, about 280 changed lines in DELIVER, tests included. Code about 85 (selectors 35, screen renderer 35, club home, `main.ts`, CSS 15). Tests about 195 (unit and property 110, amended S-008 "Season over" assertions 40, e2e 45, only what `tests/protected/S-009/` does not cover).

## Goal
After matchday 14 the club home offers "End of season" instead of the "Season over" line. The screen gives Sam's verdict: his final position and his top scorer, and "Back" returns to the club home.

## IN
- Club home: "End of season" button (44px or taller) in the "Play match" slot once 14 matchdays are recorded; none before. "Season over" line removed. Heading, "Squad", "Tactics", "Starting XI", "Table" stay.
- Screen: only h1 "End of season", focused on arrival; "Final position <1st..8th>" equal to the table's Pos; "Top scorer <name> (N goals)" / "(1 goal)", ties by "Squad" order, "Top scorer none" for no goal; buttons "Play again" (wired in slice 02) and "Back" (44px or taller).
- "Back" to the club home, heading focused, still "End of season"; the screen can be reopened and reads the same.
- Derived from the results log and the seed only; nothing stored; no new stream.
- D7: the S-008 "Season over" e2e and unit assertions replaced, never weakened.
- Names check: no generated name holds "End of season", "Final position", "Top scorer" or "Play again".

## OUT
"Play again" behaviour (slice 02). League-wide top scorer, other clubs' scorers, awards, trophy or banner, re-opening matches, persistence.

## Learning hypothesis
If this slice fails, it disproves this: "a one-tap verdict (a final place and a named top scorer) gives the season the closure the north star 'start to finish' needs".

## Acceptance (player-facing)
- `?seed=31`, "Netherwold Borough", untouched tactics: after 13 matches "Play match" and no "End of season"; after 14, "Back" shows "End of season" and no "Play match" or "Season over". "End of season": "Final position 3rd", "Top scorer Garrick Thistlewood (5 goals)" (tied with Merrick Hartwell on 5; Thistlewood is first in the "Squad" list), "Play again", "Back".
- `?seed=abc`, "Oakhampton Rise Borough": "Final position 2nd", "Top scorer Joren Northcott (8 goals)"; the same with no "?seed=".
- `?seed=13`, "Ashworth Vale Rovers": "Top scorer Orrin Yarrow (1 goal)".
- "Back": club home, heading focused, "End of season"; "Table" reads P 14 on every row.

## Developer criteria (not story AC)
- Unit: ordinal for 1..8; top scorer over constructed logs (outright, 2- and 3-way ties, 1 goal, none); final position equals `standingsOf` Pos; the offer for 14 recorded matchdays and not 0..13; the view action is a no-op unless the season is complete.
- Fixed-seed sweep: seeds 1..300 x 8 clubs, the screen's lines agree with the standings and the counted goals (K2).
- Golden: the seed-31 and seed-20260 lines above (e2e in Chromium as well).

## Demonstrable
`/gaffer/?seed=31`: New game, "Netherwold Borough", 14 x ("Play match", "Back"), "End of season".
