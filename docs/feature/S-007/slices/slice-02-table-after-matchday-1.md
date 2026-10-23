# Slice 02: The first Play match records matchday 1, the table shows it

**Story:** US-2 (S-007). **Depends on:** slice 01 (standings, table screen), S-006 (schedule, match model, `matchFor`), ADR-0012 accepted (recording; supersedes ADR-0011 section 5 and S-006 D8). **Estimate:** about 0.75 day, about 230 changed lines in DELIVER, tests included: code about 50 (state: record the 4 results on the first "Play match", re-show the recorded match, reset on "New game", 40; `main.ts` 10) and tests about 180 (recording and standings-from-state unit and property 90, amended S-006 `match-navigation` cases 20 (D12), e2e 70, only what `tests/protected/S-007/` does not cover). With it the roadmap outcome and `tests/protected/S-007/` are complete.

## Goal
The first "Play match" of a new game plays matchday 1 for the whole league and records the 4 results. After "Back" and "Table", every club has played once and Sam's row matches the score he just saw. Nothing Sam changes afterwards moves the table or the recorded match.

## IN
- The first "Play match" of a new game (from a known club's home) records the 4 matchday-1 results in session state: Sam's fixture with his formation and current Starting XI (exactly as S-006), the other 3 with both clubs' automatic XI in 4-4-2.
- Single source: from then on the match screen and the table read only the recorded results; the S-006 on-demand derivation only produces the recording.
- Changing the formation or the Starting XI afterwards never changes the recorded results, the table or the match screen.
- In this version a second "Play match" re-shows the same recorded matchday-1 match (screen title "Matchday 1", same score line and "Goals" list), whatever formation or XI was chosen in between. Later versions may move on to the next matchday.
- The table is the standings of the recorded results: every row P 1; Sam's row agrees with his score line; the opponent's is its mirror; Pts never increases down the table and, within equal Pts, GD never increases.
- The results last until the page is reloaded or "New game" is tapped. "New game" starts from no results (the all-zero table). Reload: title screen (no persistence).

## OUT
Matchday 2 and later, a results list of the other fixtures, form, persistence, commentary, stats, opponent tactics, condition changes.

## Learning hypothesis
This slice disproves the following if it fails: "recording the whole matchday at the tap turns one score into a standing Sam trusts: the table agrees with his match and never moves when he tinkers afterwards".

## Acceptance (player-facing)
- `?seed=31`, "Netherwold Borough", untouched tactics, "Play match" ("Netherwold Borough 1–2 Marlbrook Athletic"), "Back", "Table": 1 Tarnbeck Borough 1 1 0 0 +4 3; 2 Oakhampton Rise Borough 1 1 0 0 +2 3; 3 Marlbrook Athletic 1 1 0 0 +1 3; 4 Fennimore Town 1 0 1 0 0 1; 5 Valebridge Albion 1 0 1 0 0 1; 6 Netherwold Borough 1 0 0 1 -1 0; 7 Juniper Hollow United 1 0 0 1 -2 0; 8 Rushmoor Heath Albion 1 0 0 1 -4 0 (expected from the ADR-0011 goldens; protected scenarios check rules, not this golden).
- For each of the 8 clubs at `?seed=31` and at `?seed=abc`: every row P 1; Sam's row and the opponent's agree with the score line; Pts and, within equal Pts, GD never increase down the table.
- Same seed, same club, untouched tactics, two fresh pages: identical table. `?seed=abc` equals no "?seed=" in the address.
- After playing: "Tactics", "4-3-3", "Back", "Starting XI", "MF Calder Redfern 15", "Kestrel Northcott 6" (the S-006 golden pick), "Back", "Squad", "Back", "Table": identical table; then "Back", "Play match": the same recorded score line and "Goals" list.

## Developer criteria (not story AC)
- Unit: the first "Play match" from a known club's home stores exactly the 4 results of `fixturesOf(1)`; the managed fixture equals S-006 `matchFor` at the tap; others use automatic 4-4-2; formation or XI changes never touch stored results; the match screen reads the stored result; "New game" clears them; "Play match" off a club home is still a no-op.
- Property: row rules on every row (W + D + L = P, Pts = 3W + D), total W = total L, total D even, total GD 0; with untouched tactics the recorded table is the same whichever club is managed (unit-level only).
- Golden: the seed-31 table above pinned as a regression lock.
- Amend the S-006 `match-navigation` cases that assert "nothing is recorded" (D12).

## Demonstrable
`/gaffer/?seed=31`: New game, "Netherwold Borough", "Table", "Back", "Play match", "Back", "Table", "Back", "Tactics", "4-3-3", "Back", "Table", "Back", "Play match".
