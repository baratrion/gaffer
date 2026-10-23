# Slice 01: Table button, the all-zero league table, Back

**Story:** US-1 (S-007). **Depends on:** S-001 (league, "Clubs"), S-006 (club home actions, schedule, match result shape). **Estimate:** about 0.75 day, about 400 changed lines in DELIVER, tests included: code about 165 (standings 45, table screen 55, state 20, club home 2, `main.ts` 13, CSS 30) and tests about 235 (standings unit and property 110, navigation 55, names check 20, e2e 50, only what `tests/protected/S-007/` does not cover), plus about 10 lines amending the S-005/S-006 e2e club-home button lists (D12). A pure domain precursor commit (standings) is allowed inside the slice.

## Goal
On the club home Sam taps "Table" and, on arrival, sees the screen title "League table": the 8 clubs, every number zero, in A→Z order, his own row highlighted. "Back" returns to the club home with nothing changed.

## IN
Precursor commit (optional, developer-facing):
- A pure standings function: from the 8 clubs and a list of match results (home club, away club, home goals, away goals), it returns 8 rows (club, P, W, D, L, goals scored, goals against, GD, Pts) in the D4 order. An empty list gives all zeros in A→Z order.

Player-visible commit:
- Club home: a fifth button named exactly "Table" (44px or taller), after "Play match". Heading and the other four unchanged.
- Table screen: its screen title (only h1) is "League table", focused on arrival. A table (role table) named "League table": one header row; in this version exactly 8 columns whose column headers read exactly "Pos", "Club", "P", "W", "D", "L", "GD", "Pts" in that order (durable as a prefix: later versions add columns only after "Pts"); 8 body rows, one per "Clubs" name, each exactly once. Each body row has, in order, Pos (a cell), Club (the row header, role rowheader), then P, W, D, L, GD and Pts (cells): in this version 7 cells and 1 row header. Row rules on every row: W + D + L = P and Pts = 3 × W + D (protected will check them). Pos 1..8 in row order; GD written "+N", "0" or "-N" (hyphen-minus).
- In a new game nothing has been played, so P, W, D, L, GD and Pts read "0" on every row and the rows are A→Z (code-point order: a space before any letter; club names are letters and spaces only).
- Sam's row highlighted (design token; not black-box tested; DESIGN may choose the markup).
- A button named exactly "Back" (44px or taller) to the club home, heading focused; formation and XI unchanged.
- No sideways scroll at 390px (the 8 columns fit; long club names wrap); no console errors.

## OUT
Recording results and any non-zero row (slice 02). GF and GA columns, form, other results list, matchdays after 1, persistence, sorting by tapping a column.

## Learning hypothesis
This slice disproves the following if it fails: "an 8-column table with a highlighted row fits a 390px phone, reads at a glance, and is reachable by role and name, without touching any S-001..S-006 output".

## Acceptance (player-facing)
- `?seed=31`, "New game", "Netherwold Borough", "Table": the screen title "League table" is the only h1 and has focus; the table "League table" has the 8 column headers in order and 8 body rows, Pos 1..8, row headers A→Z: Fennimore Town, Juniper Hollow United, Marlbrook Athletic, Netherwold Borough, Oakhampton Rise Borough, Rushmoor Heath Albion, Tarnbeck Borough, Valebridge Albion; P, W, D, L, GD and Pts read "0" on every row.
- The set of row headers equals the "Clubs" list of the same league, in A→Z order (also at `?seed=abc`).
- "Back" focuses the "Netherwold Borough" heading; after choosing "4-3-3" before "Table", Tactics still has 4-3-3 checked.
- "Table" and "Back" are 44px or taller; no sideways scroll; no console errors.

## Developer criteria (precursor, not story AC)
- Standings: pure, inputs never mutated; property tests over arbitrary result lists for the 8 clubs (goals 0-9): W + D + L = P; Pts = 3W + D; total W = total L; total GD = 0; order strictly by Pts, GD, goals scored (not shown; checked here only), then name in code-point order; Pos 1..8. Empty list: all zero, A→Z.
- `update`: the table action only from a known club's home; "Back" from the table to the club home; elsewhere no-op; `xi` and `formation` untouched.
- D11 names check: no `names.ts` array entry contains "Table" or "League table" (case-insensitive).

## Demonstrable
`/gaffer/?seed=31` on a phone: New game, "Netherwold Borough", "Table", "Back".
