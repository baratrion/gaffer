# S-009: See how my season ended (DISCUSS, lean)

## Job to be done
J-09 `see-how-my-season-ended`: "When my club's last match of the season is played, I want to see where we
finished and who scored our goals, and to start again at once, so that the season feels complete and I can
try to do better."

## Why this slice next
S-008 made the 14 matchdays playable but ends the season with the plain line "Season over" (this version
only). scope.md IN lists the end-of-season screen (final position, top scorer, "play again"), and the
brief's success is a full season that makes the owner want a second one. The results log already holds
every score and scorer, so the screen is derived, not stored.

## Persona
Sam (see S-001, S-008): 34, one-handed on a bus, 390px Android, 5 minutes a session. He has just played
matchday 14. He wants the verdict on his season, and another go.

## Journey (phone, one thumb)
Real data: `?seed=31`, "New game", "Netherwold Borough" (club 0), untouched tactics; the real generator's
season (`S-008/discuss/reference-season.md`, scorers checked in this plan run).

| Step | Precondition | Player does | Player sees | Feels |
|---|---|---|---|---|
| 1 | Club home after matchday 13 | Reads the club home | "Play match", no "End of season" | One to go: "can we hold third?" |
| 2 | Club home | "Play match" | "Matchday 14", "Tarnbeck Borough 2–1 Netherwold Borough" | A last-day sting |
| 3 | Match screen | "Back" | Heading "Netherwold Borough" (focused); "End of season" where "Play match" was; "Squad", "Tactics", "Starting XI", "Table" stay | Anticipation: "so how did we do?" |
| 4 | Club home | "End of season" | h1 "End of season" (focused), "Final position 3rd", "Top scorer Garrick Thistlewood (5 goals)", "Play again", "Back" | Closure and pride: third, and a striker to build on |
| 5 | End of season | "Back", "Table", "Back", "End of season" | The table at P 14 with Netherwold Borough 3rd; the same End of season screen again | Trust: the verdict matches the table |
| 6 | End of season | "Play again" | The pick-a-club screen (heading focused), the same 8 clubs in the same order | The urge: "this time we win it" |
| 7 | Pick a club | "Netherwold Borough", "Table", "Back", "Play match" | The all-zero table, A to Z; "Matchday 1", "Netherwold Borough 1–2 Marlbrook Athletic" | A fresh start, with what he learned |

Emotional arc: the tension of the last matchday, the sting of losing it, then anticipation, the closure
and pride of a final verdict (a place and a name), trust when it matches the table, and the urge to play
again, answered in one tap. Each step is one tap or a short run of taps; the h1 is focused on every arrival.

## Shared artifacts (single source each)
- **Results log**: `GameState.results` (ADR-0012, ADR-0014). The single source for "season complete", the
  final position (through the standings) and the top scorer. Nothing new is stored.
- **Season complete**: S-008's derived flag (14 matchdays recorded); it decides "Play match" or "End of
  season" on the club home.
- **Final position**: the Pos of the club in `standingsOf(state)` (ADR-0013), shown as an ordinal. The
  "Table" screen and the End of season screen read the same source.
- **Top scorer**: counted from the managed club's goals in the results log (the same entries the 14 match
  screens' "Goals" lists printed); ties by the "Squad" list order (`generateSquad`, S-002).
- **League and seed**: `GameState.league` from the address's "?seed=" (S-001). "Play again" keeps it;
  everything else resets to a new game.

## Error and boundary paths
- Before matchday 14: no "End of season"; "Play match" as before.
- A tie at the top (seed 31: Thistlewood and Hartwell on 5; 18.5% of seasons over seeds 1..300): the tied
  player listed first in the "Squad" list is named.
- One goal: "(1 goal)", singular (seed 13, Ashworth Vale Rovers: "Top scorer Orrin Yarrow (1 goal)").
- No goal all season: "Top scorer none" (not seen over 2400 seasons; unit test on a constructed log).
- "Back" from End of season: the club home, still "End of season"; played matches cannot be re-opened.
- `?seed=abc`: the default seed 20260, the same screen as no "?seed=" (Oakhampton Rise Borough: "Final
  position 2nd", "Top scorer Joren Northcott (8 goals)").
- "Play again": the same league only; a different league needs another "?seed=" and a reload.
- Reload the page at any point: the season is lost (no save yet); the title screen and "New game" as before.
