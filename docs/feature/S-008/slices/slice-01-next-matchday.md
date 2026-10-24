# Slice 01: Each Play match plays the next matchday, the table follows the season

**Stories:** US-1 and US-2 (S-008). **Depends on:** S-006 (schedule, match model, match screen), S-007 (`playMatchday`, append-only `results`, standings, table screen), ADR-0010..0013 accepted; DESIGN records the change to the ADR-0012 re-show rule. **Estimate:** about 1 day, about 445 changed lines in DELIVER, tests included: code about 45 (state: next matchday, append, season over, latest match, 40; `main.ts` 5) and tests about 400 (unit and property 210, e2e 130, amended S-006/S-007 cases 60 (D11)). With it the roadmap outcome and `tests/protected/S-008/` are complete.

## Goal
Each "Play match" on the club home plays the next unplayed matchday (1, 2, ... 14) for the whole league with Sam's team as it is at that tap, records its 4 results after the earlier ones, and shows "Matchday N". The table counts every recorded matchday. Nothing Sam changes moves a played result.

## IN
- Next matchday = matchdays played + 1, while 14 or less; the first tap of a new game is still matchday 1.
- Sam's side: formation and Starting XI at the tap; every other side: automatic XI in 4-4-2 (ADR-0012 policy, unchanged). No new RNG stream.
- Match screen: Sam's latest match; h1 "Matchday N" focused; S-006 score line and "Goals" formats and scorer rules for every N; "Back" to the club home.
- Schedule from ADR-0010: each other club once over matchdays 1-7; matchday N + 7 the same two clubs in the opposite order.
- Table: after N matchdays every row P N, totals (W = L, D even, GD 0), Sam's row = sum of his N score lines; per-matchday delta (exactly one result added to every row). Order and tie-breaks as S-007.
- Recorded results never change; earlier entries kept as they are when a matchday is appended.
- Season over (this version only): after matchday 14 a further "Play match" re-shows the matchday-14 match and records nothing. e2e and unit tests only; NOT pinned in `tests/protected/S-008/`.
- Amend the non-protected S-006/S-007 assertions listed in feature-delta D11 (replace, never weaken).

## OUT
End-of-season screen, results or fixtures list, "next opponent" or "Matchday N of 14" line, commentary, stats, save and continue, AI formations for other clubs, fatigue, tie-break changes, new columns.

## Learning hypothesis
This slice disproves the following if it fails: "one tap per matchday, with the team as Sam set it at that tap and every result kept in the table, turns one match into a season Sam wants to keep playing, and makes a team change feel answered by the next result".

## Acceptance (player-facing)
- `?seed=31`, "Netherwold Borough": "Play match", "Back", 3 times: "Matchday 1" ("Netherwold Borough 1–2 Marlbrook Athletic"), "Matchday 2" (Rushmoor Heath Albion first, Netherwold Borough second), "Matchday 3" (Netherwold Borough first, Oakhampton Rise Borough second); each h1 focused; each score line and "Goals" list in the S-006 formats.
- 14 taps at `?seed=31`: h1 "Matchday 1" to "Matchday 14"; matchdays 1-7 meet the 7 other clubs once each; matchday N + 7 reverses matchday N's order (8: Marlbrook Athletic first; 14: Tarnbeck Borough first).
- After matchday 1, "4-3-3" and "Kestrel Northcott 6" for "MF Calder Redfern 15", then "Play match": "Matchday 2"; every Netherwold Borough goal by an outfield player of the new XI; never Calder Redfern.
- After N matchdays (N = 3 at `?seed=31`, 2 at `?seed=abc`, 14 at `?seed=7` 3rd club), "Table": every row P N; W total = L total; D total even; GD total 0; Sam's row = sum of his score lines.
- From matchday 1 to 2 (with a formation change in between) every row gains exactly one result.
- After 2 matchdays, a formation and XI change and a Squad visit leave the table cell-for-cell unchanged.
- `?seed=abc` and no seed, "Oakhampton Rise Borough", 3 matchdays: identical match screens and tables.

## Developer criteria (not story AC)
- Unit: "Play match" from a known club's home appends exactly the 4 results of `fixturesOf(N + 1)`; the earlier entries are the very same objects; Sam's fixture uses `currentXI` at the tap; the match screen reads the latest match; after 14 entries x 4 a tap appends nothing and shows matchday 14; "Play match" off a club home or for an unknown club is a no-op; `NewGame` clears the record.
- Property: for N = 1..14 over seeds, clubs, formations and picks: every row P N, row rules, totals, Sam's row = sum of his results, per-matchday delta; with untouched tactics the record is the same whichever club is managed; same inputs give the same record.
- Golden: seed-31 matchday-2 and matchday-14 score lines and the seed-31 table after matchday 2.

## Demonstrable
`/gaffer/?seed=31`: New game, "Netherwold Borough", "Play match", "Back", "Table", "Back", "Tactics", "4-3-3", "Back", "Play match" ("Matchday 2"), "Back", "Table" (P 2), then "Play match"/"Back" to "Matchday 14", "Table" (P 14), "Play match" (matchday 14 again).
