# S-008: Play the season, matchday by matchday (DISCUSS, lean)

## Job to be done
J-08 `play-out-my-season`: "When I come back for a few spare minutes, I want to play my club's next match
of the season, so that each result builds toward where we finish."

## Why this slice next
S-006 shipped matchday 1 and S-007 the table after it. A second "Play match" still re-shows matchday 1, so
the season stops after one result. The schedule (ADR-0010), the streams (ADR-0011) and the results log
(ADR-0012) already cover 14 matchdays. This story makes every "Play match" play the next one, up to the
last.

## Persona
Sam (see S-001, S-007): 34, one-handed on a bus, 390px Android, 5 minutes a session. He has played
matchday 1 and read the table. He wants the next opponent, the next result, and a last day that settles
where he finishes.

## Journey (phone, one thumb)
Real data: `?seed=31`, "New game", "Netherwold Borough" (club 0), untouched tactics. Every score line is
the real generator's (`reference-season.md`).

| Step | Precondition | Player does | Player sees | Feels |
|---|---|---|---|---|
| 1 | Club home, new game | Taps "Play match" | "Matchday 1", "Netherwold Borough 1–2 Marlbrook Athletic" (as S-006) | The sting of a defeat |
| 2 | Match screen | "Back", "Play match" | "Matchday 2", "Rushmoor Heath Albion 2–1 Netherwold Borough": a new opponent, away this time | Frustration, but the season moves |
| 3 | Match screen | "Back", "Table" | Every row P 2; Netherwold Borough 8th, P 2, L 2, GD "-2", Pts 0; Tarnbeck Borough top on 4 | Worry: "Bottom. Something has to change" |
| 4 | League table | "Back", then changes formation or XI if he wants, "Play match" | "Matchday 3", "Netherwold Borough 2–1 Oakhampton Rise Borough" (untouched tactics); a change would count from this match, and matchdays 1 and 2 stay as played | Relief: the first win |
| 5 | Match screen | "Back", "Table" | Every row P 3; Netherwold Borough 6th, W 1, L 2, GD "-1", Pts 3 | The climb starts |
| 6 | Club home | 4 more rounds of "Play match", "Back" | Matchday 7 "Netherwold Borough 2–4 Tarnbeck Borough": halfway, each rival met once | Mid-season tension |
| 7 | Club home | "Play match" on matchday 8 | "Marlbrook Athletic 1–2 Netherwold Borough": the matchday-1 rival again, names in the other order | Revenge |
| 8 | Club home | Plays matchdays 9 to 14 | Matchday 14 "Tarnbeck Borough 2–1 Netherwold Borough" | A last-day defeat |
| 9 | Match screen | "Back" | Club home, heading "Netherwold Borough" (focused), the line "Season over" where "Play match" was; "Squad", "Tactics", "Starting XI", "Table" stay | Closure |
| 10 | Club home | "Table" | Every row P 14; 1 Oakhampton Rise Borough Pts 28, 2 Tarnbeck Borough 26, 3 Netherwold Borough (highlighted) W 7, D 2, L 5, GD "+2", Pts 23 | Closure: a final place, and "one more season?" |

Emotional arc: the sting of matchday 1, the worry of the bottom after two defeats, then relief and the
climb, mid-season tension, revenge on matchday 8, and the closure of a final table with a finishing place.
Each step is one tap or two; the screen title is focused on every arrival.

## Shared artifacts (single source each)
- **Schedule**: `fixturesOf(N)` (ADR-0010). Opponent and name order per matchday, the same for every seed.
- **Results log**: `GameState.results` (ADR-0012), appended 4 at a time by "Play match". It is the single
  source for the match screen, the table, the next matchday and "season over"; none of these is stored
  separately.
- **Next matchday**: the number of matchdays recorded plus 1; "season over" when 14 are recorded.
- **Starting XI at the tap**: `currentXI` at the moment of "Play match" (S-005). It is read once, then frozen
  in that matchday's result.
- **Standings**: `standingsOf(state)` (S-007), unchanged; derived on render.

## Error and boundary paths
- First tap of a new game: matchday 1, exactly as S-006/S-007 (durable).
- Formation or XI changed between matches: nothing played moves; the next match uses the change.
- After matchday 14: no "Play match" button; a dispatched "Play match" action is a no-op (unit test).
- `?seed=abc`: the default seed 20260, the same season as no "?seed="; Oakhampton Rise Borough finishes 2nd
  on 21, behind Valebridge Town on 29.
- Reload the page, then "New game": the season is lost (no save yet) and starts again at matchday 1 with the
  all-zero table. `NewGame` clears the log (unit-level invariant).
- Already played matches cannot be re-opened (a results list is a later story).
