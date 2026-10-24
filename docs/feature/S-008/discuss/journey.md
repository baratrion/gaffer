# S-008: Play the season, one matchday at a time (DISCUSS, lean)

## Job to be done
J-08 `play-out-my-season`: "When I have seen where we stand, I want to play the next match of the season,
so that I can see whether my choices take us up the table."

## Why this slice next
S-006 shipped "play match" and S-007 "see table", both for matchday 1 only; a second "Play match"
re-showed the same game. The brief's north star is a whole season. This story makes the loop run:
each "Play match" plays the next matchday (up to 14) and the table counts them all.

## Elevator pitch
- **Before:** Sam lost 1–2 to Marlbrook Athletic, moved to 4-3-3, tapped "Play match" and saw the same 1–2.
- **After:** Sam taps "Play match" and sees "Matchday 2", away at Rushmoor Heath Albion, with his current
  eleven's scorers; "Back", "Table": every club on P 2, his row adding up both results.
- **Decision enabled:** did my change work, and what do I field for matchday 3?

## Persona
Sam (see S-001, S-007): 34, one-handed on a bus, 390px Android, 5 minutes. Has played matchday 1 and sits
6th on "-1". Wants the next match now, and wants his changes to count from that match on.

## Journey (phone, one thumb)
Real data: `?seed=31`, "New game", "Netherwold Borough" (club 0). Fixtures from ADR-0010, home first.
Scores are Netherwold Borough's season with untouched tactics, computed from the model by the orchestrator
(DISTILL pins them as goldens); with Sam's 4-3-3 change in step 1 his own later scores may differ.

| Step | Precondition | Player does | Player sees | Feels |
|---|---|---|---|---|
| 1 | Club home, matchday 1 played (1–2), table read (6th, "-1") | Taps "Tactics", "4-3-3", "Back"; "Starting XI", "MF Calder Redfern 15", "Kestrel Northcott 6", "Back" | Club home, heading focused, same five buttons | Restless: "Let's try something" |
| 2 | Club home | Taps "Play match" | Screen title "Matchday 2" (focused); one score line, Rushmoor Heath Albion first, Netherwold Borough second (untouched tactics: "Rushmoor Heath Albion 2–1 Netherwold Borough"); "Goals" list; every Netherwold Borough scorer is on the new XI | Tension, then the answer to his change |
| 3 | Match screen | Taps "Back", then "Table" | "League table": every row P 2; his row = his 1–2 defeat plus matchday 2; every row gained exactly one result | Context: "Up or down?" |
| 4 | League table | "Back", then "Play match", "Back" up to matchday 7 | "Matchday 3" v Oakhampton Rise Borough (home) ... "Matchday 7" v Tarnbeck Borough (home): all 7 other clubs once | Momentum: the season moves under his thumb |
| 5 | Club home, 7 played | "Play match" | "Matchday 8": Marlbrook Athletic first, Netherwold Borough second (untouched: "Marlbrook Athletic 1–2 Netherwold Borough"), the return game | Recognition: "Revenge at their place" |
| 6 | Club home, 13 played | "Play match", "Back", "Table" | "Matchday 14": Tarnbeck Borough first (untouched: 2–1); table every row P 14, two-digit values, no sideways scroll; his row = sum of 14 score lines (untouched: P 14 W 7 D 2 L 5 "+2" 23) | Closure: the season is played |

Emotional arc: restlessness after a defeat, then tension and an answer (the next match reflects his change),
then context (the table moves by exactly one result per club), then momentum over the matchdays, then
closure at matchday 14. One focused screen title per screen; results complete on arrival.

Known gap of this version (D7): after matchday 14 nothing tells Sam the season is over. A further "Play
match" re-shows the matchday-14 match and records nothing (table stays at P 14). Accepted under scope.md
"ship less"; the successor story, the end-of-season screen (final position, top scorer, "play again";
scope.md IN), closes it and may replace the re-show. Not pinned in `tests/protected/S-008/`.

## Shared artifacts (single source each)
- **Seed** and **league**: `league.seed`, `league.clubs` (S-001); every club name on a match screen or
  table row is a "Clubs" name.
- **Schedule**: `fixturesOf(N)` (ADR-0010) for N = 1..14, home first; the score line order comes from it.
- **Recorded results**: the append-only list (ADR-0012), 4 entries per matchday, in matchday order. Single
  source for the match screen (Sam's latest match) and the table. Matchdays played = its length / 4.
- **Sam's team at the tap**: `formation` and `currentXI` read once per "Play match"; never applied to an
  already recorded result.
- **Standings**: a pure function of the 8 clubs and the whole record (ADR-0013); never edited by hand.
- **Managed club**: `screen.clubId`, for Sam's side, his match and the highlighted row.

## Error and boundary paths
- First tap of a new game: matchday 1 exactly as S-006/S-007 (goldens unchanged).
- Team change between matches: affects only the next match; the table before it is unchanged (D5).
- Draw or 0–0 on any matchday: "Goals" list present with matching items (none for 0–0); row D + 1, GD same.
- Two-digit values after many matchdays: the table still fits 390px (e2e).
- After matchday 14: the known gap above (this version only; e2e and unit tests, not protected).
- `?seed=abc`: default seed 20260, the same season as no "?seed=" in the address.
- "Play match" off a known club's home, or for an unknown club: no-op (unit tests on `update`).
- Lifetime: until the page is reloaded (title screen; persistence is OUT); `NewGame` clears the record
  (unit-level invariant).

## Scenarios (sketch; the AC in feature-delta.md are authoritative)
```gherkin
Scenario: The second Play match plays matchday 2
  Given Sam at "?seed=31" managing "Netherwold Borough" has a season with matchday 1 played
  When Sam taps "Back" and "Play match"
  Then the screen title "Matchday 2" has focus
  And the score line reads "Rushmoor Heath Albion 2–1 Netherwold Borough"

Scenario: The table counts every matchday played
  Given Sam at "?seed=31" managing "Netherwold Borough" has a season with 3 matchdays played
  When Sam taps "Back" and "Table"
  Then every row has P 3
  And Netherwold Borough's row reads P 3, W 1, D 0, L 2, GD "-1", Pts 3
```
