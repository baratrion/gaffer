# S-007: See the league table after my first match (DISCUSS, lean)

## Job to be done
J-07 `see-where-we-stand`: "When I have seen my team's result, I want to see where my club stands in the
league, so that I know whether my season is on track and what the next match means."

## Why this slice next
S-006 shipped "play match": one result, then nothing. The brief's loop is "pick team, play match, see
table"; this story ships the last step at its thinnest: the league table, all zero before kick-off and
after matchday 1 (Sam's match plus the 3 other matchday-1 fixtures, simulated and recorded at the first
"Play match" of a new game).

## Elevator pitch
- **Before:** after "Netherwold Borough 1–2 Marlbrook Athletic" Sam has no idea where that leaves him.
- **After:** on Netherwold Borough's home Sam taps "Table" and sees the screen title "League table" and a
  table "League table" (Pos, Club, P, W, D, L, GD, Pts): Tarnbeck Borough top on 3 points and "+4", his
  club 6th on 0 points and "-1", his row highlighted.
- **Decision enabled:** is my season on track, and what must change before the next match?

## Persona
Sam (see S-001, S-006): 34, one-handed on a bus, 390px Android, 5 minutes. Has just played matchday 1.
Wants his standing at a glance, his own row easy to find, and numbers he can trust.

## Journey (phone, one thumb)
Real data: `?seed=31`, "New game", "Netherwold Borough" (club 0), untouched tactics. The matchday-1
results are the ADR-0011 goldens (fixture 0 is pinned by DISTILL; fixtures 1-3 are its references):
Netherwold Borough 1–2 Marlbrook Athletic, Fennimore Town 2–2 Valebridge Albion, Tarnbeck Borough 5–1
Rushmoor Heath Albion, Juniper Hollow United 1–3 Oakhampton Rise Borough. Each row reads
Pos, Club (the row header), P, W, D, L, GD, Pts.

| Step | Precondition | Player does | Player sees | Feels |
|---|---|---|---|---|
| 1 | Club home, new game | Looks at the actions | "Squad", "Tactics", "Starting XI", "Play match", then "Table" (44px or taller) | Curious: "Where do we start?" |
| 2 | Club home, nothing played | Taps "Table" | Screen title "League table" (focused); 8 rows A→Z, each P 0, W 0, D 0, L 0, GD 0, Pts 0: Fennimore Town, Juniper Hollow United, Marlbrook Athletic, Netherwold Borough (highlighted), ... Valebridge Albion | Level start: "Everyone's on zero" |
| 3 | League table | Taps "Back", then "Play match" | Club home (heading focused); then "Matchday 1", "Netherwold Borough 1–2 Marlbrook Athletic"; the 4 matchday-1 results are now recorded | The sting of a defeat |
| 4 | Match screen | Taps "Back", then "Table" | 1 Tarnbeck Borough 1 1 0 0 +4 3; 2 Oakhampton Rise Borough 1 1 0 0 +2 3; 3 Marlbrook Athletic 1 1 0 0 +1 3; 4 Fennimore Town 1 0 1 0 0 1; 5 Valebridge Albion 1 0 1 0 0 1; 6 Netherwold Borough 1 0 0 1 -1 0 (highlighted); 7 Juniper Hollow United 1 0 0 1 -2 0; 8 Rushmoor Heath Albion 1 0 0 1 -4 0 | Context: "Only one goal off; three points off the top" |
| 5 | League table | "Back", "Tactics", "4-3-3", "Back", "Starting XI", "MF Calder Redfern 15", "Kestrel Northcott 6", "Back", "Table" | The same table, unchanged | Trust: "What's played is played" |
| 6 | League table | "Back", "Play match" | The same recorded match: "Netherwold Borough 1–2 Marlbrook Athletic", same "Goals" list (this version only) | Trust confirmed |
| 7 | Match screen | Taps "Back" | Club home, heading "Netherwold Borough" (focused), 4-3-3 still checked | In charge: the next decision is his |

Emotional arc: curiosity (a level start), then the sting or pride of the result, then context (the table
turns one score into a standing among 8), then trust (recorded results never move), then back in charge.
One focused screen title per screen; the table is complete on arrival.

Fennimore Town and Valebridge Albion are level on Pts, GD and goals scored (2 each), so club name A→Z
(code-point order, a space before any letter) decides: Fennimore Town 4th, Valebridge Albion 5th. Goals
scored is not shown; the goals-scored and club-name tie-breaks are rules of this version, checked by unit
and acceptance tests only. What stays in every later version: the row rules (W + D + L = P,
Pts = 3 × W + D), Pts never increasing down the table, GD never increasing between rows with equal Pts,
the all-zero A→Z table of a new game, and the first 8 columns (later versions add columns only after Pts).

## Shared artifacts (single source each)
- **Seed** and **league**: `league.seed`, `league.clubs` (S-001); every row header is a "Clubs" name.
- **Schedule**: `fixturesOf(1)` (ADR-0010), the 4 matchday-1 fixtures, home first.
- **Recorded results**: the 4 matchday-1 results, recorded in session state at the first "Play match" of
  a new game (D1). After that tap both the match screen and the table read only these (D2); the S-006
  on-demand derivation is used only to produce the recording. So the two screens cannot disagree.
- **Standings**: a pure function of the recorded results and the 8 clubs (D4 order); never edited by hand.
  No results yields the all-zero A→Z table (D5).
- **Managed club**: `screen.clubId`, for the highlighted row (D7) and Sam's side in his fixture.

## Error and boundary paths
- Nothing played: all-zero rows, A→Z; no error, no empty-state message.
- Draw: both clubs D 1, Pts 1, GD "0". 0–0 draw: also "0", goals scored 0.
- Level on Pts, GD and goals scored: club name A→Z decides; positions are never shared.
- Changed formation or XI after playing: the table and the re-shown match stay as recorded.
- `?seed=abc`: default seed 20260; the same table as no "?seed=" in the address (fixture 0 there:
  Harrowgate Lane United 0–1 Oakhampton Rise Borough).
- "Table" or "Back" off the right screen, or an unknown club: no-op (unit tests on `update`).
- Lifetime: the results last until the page is reloaded. Reload: title screen (persistence is OUT); a new
  game (after loading the page and tapping "New game") starts from the all-zero table. "New game" is
  only on the title screen, so "the `NewGame` action clears the results" is a unit-level invariant.
- Second "Play match": re-shows the recorded match in this version only (e2e and unit tests; not
  pinned in `tests/protected/S-007/`).

## Scenarios (sketch; the AC in feature-delta.md are authoritative)
```gherkin
Scenario: The table before kick-off has every club level on zero
  Given Sam opens a fresh page at "?seed=31", taps "New game" and "Netherwold Borough"
  When Sam taps "Table"
  Then the screen title "League table" has focus
  And the 8 row headers of the table "League table" are the 8 clubs in A to Z order
  And in every row P, W, D, L, GD and Pts read "0"

Scenario: After matchday 1 the table agrees with the result Sam saw
  Given Sam at "?seed=31" managing "Netherwold Borough" has tapped "Play match" and read "Netherwold Borough 1–2 Marlbrook Athletic"
  When Sam taps "Back" and "Table"
  Then every row has P 1
  And Netherwold Borough's row reads L 1
  And Netherwold Borough's row reads GD "-1"
  And Netherwold Borough's row reads Pts 0
  And Marlbrook Athletic's row is its mirror: W 1, GD "+1", Pts 3

Scenario: What is played stays played
  Given Sam has played matchday 1 at "?seed=31" and read the table
  When Sam chooses "4-3-3" in Tactics and comes back to "Table"
  Then the table reads exactly as before
```
