# Slice 01: Play match plays the next matchday

**Story:** US-1 (S-008). **Depends on:** S-006 (schedule, match model), S-007 (results log, standings, table screen; ADR-0012). **Estimate:** about 0.75 day, about 300 changed lines in DELIVER, tests included. Code is about 55 lines: state 40 (next matchday on "Play match", the match screen reads the latest match, side builder generalised) and the next-matchday helper 15. Tests are about 245 lines: progression unit and property 150, amended S-006/S-007 re-show assertions 40 (D7), and e2e 55 (only what `tests/protected/S-008/` does not cover).

## Goal
Each "Play match" tap plays the next matchday for the whole league and shows Sam's match of that matchday. The first tap is still matchday 1, the second is matchday 2 against a new opponent, and so on. The table always reads P N after N matches, and picks made between matches count from the next one.

## IN
- "Play match" from a known club's home appends the next matchday's 4 results. Sam's fixture is played with his formation and XI at the tap; the other 3 use both clubs' automatic 4-4-2. Earlier matchdays never change.
- The match screen shows the matchday just played: h1 "Matchday N", the score line and "Goals" list in the S-006 formats, Sam's scorers from his XI at the tap (never the GK), the opponent's from its non-GK squad players.
- The opponent and the name order come from the fixed schedule (ADR-0010).
- After N matches every table row has P N; row rules hold; Sam's row equals the sum of his N score lines.
- Formation or XI changes between matches change nothing recorded; the next match uses them.
- Same seed, club and picks give the same season; `?seed=abc` equals no seed. Results are kept until reload; `NewGame` clears them (unit).
- A "Play match" action after matchday 14 changes nothing (unit guard; the visible end is slice 02).
- The S-007 re-show is replaced: the non-protected re-show assertions are amended, never weakened (D7).

## OUT
The "Season over" line and removing the button (slice 02). Other results, a fixtures list, re-opening a played match, persistence, commentary, stats, condition changes, home advantage.

## Learning hypothesis
If this slice fails, it disproves this: "playing the next matchday on each tap, with the table moving one game at a time, makes Sam's between-match decisions feel like they count".

## Acceptance (player-facing)
- `?seed=31`, "Netherwold Borough", untouched tactics: "Play match" "Matchday 1" "Netherwold Borough 1–2 Marlbrook Athletic"; "Back", "Play match" "Matchday 2" "Rushmoor Heath Albion 2–1 Netherwold Borough". "Back", "Table": every row P 2, with Netherwold Borough 8th on Pts 0 and GD "-2". After matchday 3 ("Netherwold Borough 2–1 Oakhampton Rise Borough") he is 6th on Pts 3.
- `?seed=abc`, "Oakhampton Rise Borough": "Matchday 2" reads "Oakhampton Rise Borough 2–2 Mossdale Wanderers"; its row reads P 2, W 1, D 1, GD "+1", Pts 4.
- After matchday 1: "Back", "Tactics", "4-3-3", "Back", "Starting XI", "MF Calder Redfern 15", "Kestrel Northcott 6", "Back", "Table": the table is unchanged; "Back", "Play match" shows "Matchday 2" against Rushmoor Heath Albion, and every Netherwold Borough goal is scored by one of his 11 now, never the GK.
- Two fresh pages, same seed and club, 3 matches each: identical match screens and tables.

## Developer criteria (not story AC)
- Unit: each `PlayMatch` appends exactly the 4 results of the next matchday (`fixturesOf(N)`, streams 200 + 4(N-1)..+3). The managed fixture uses `currentXI` at the tap and the others automatic 4-4-2. Earlier entries are unchanged (`toBe` per entry). The match screen selector returns the latest matchday's entry for the managed club. No-op off a club home and after 14. `NewGame` clears the log.
- Property: after any N (1..14) and any run of up to 40 formation, pick and navigation actions, every row has P N, the row rules and totals hold, and recorded entries never change.
- Golden: the seed-31 table after matchday 2 above.

## Demonstrable
`/gaffer/?seed=31`: New game, "Netherwold Borough", "Play match", "Back", "Play match", "Back", "Table".
