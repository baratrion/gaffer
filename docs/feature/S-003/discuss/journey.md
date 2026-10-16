# S-003: View a player's details (DISCUSS, lean)

## Job to be done
J-03 `judge-a-player`: "When I'm weighing up who should play, I want to see what each player is good
at and how fit they are, so that I can pick a team I believe in."

## Why this slice next
The overall rating alone cannot tell a passer from a finisher. The formation and starting-XI stories
(S-004, S-005) pick "best rating per position", which needs attributes per position line. This is
also the first screen that is about one person, which makes the squad feel like people.

## Elevator pitch
- **Before:** the squad list shows name, position, age and overall, and nothing more.
- **After:** on the squad list Sam taps a player's row and sees four attributes (Goalkeeping,
  Defending, Passing, Shooting, 1-20) and a condition percentage, then taps "Back" to the squad.
- **Decision enabled:** is this player good enough, and fit enough, to start in that position?

## Persona
Sam (see S-001): one-handed, on a bus, with 5 minutes. Wants one tap in, one tap back, and nothing
to scroll sideways.

## Journey (phone, one thumb)
| Step | Player does | Player sees | Feels |
|---|---|---|---|
| 1 | On the "Squad" list, taps a player's row | Heading = the player's name; Position, Age, Overall (same as the row) | Curious: "Why is he a 14?" |
| 2 | Reads down the screen | List "Attributes": Goalkeeping, Defending, Passing, Shooting (1-20); then "Condition 92%" | Informed: "Great passer, can't shoot" |
| 3 | Taps "Back" | The same club's "Squad" list of 18 | In control, ready to compare the next player |
| 4 | Taps "Back" again | Club home, headed by the club's name | Oriented |

Emotional arc: curious, then informed, then in control. No step leaves Sam lost: every screen has
one heading and one "Back".

## Shared artifacts (single source each)
- **Seed**: `?seed=` read once by `parseSeed`, held as `league.seed`. Invalid seed gives the default.
- **Club**: the `clubId` carried by the current screen (S-001/S-002).
- **Player**: one entry of `generateSquad(league.seed, clubIndex)`, picked by the tapped row's index.
  Row and player screen read the same `Player`, so position, age and overall cannot disagree.
- **Attributes** (Goalkeeping, Defending, Passing, Shooting, 1-20) and **condition** (0-100%):
  generated in the domain from the seed with the rest of the player; not stored, not persisted.
- **Overall**: derived in the domain from the four attributes, within [lowest, highest] attribute.
  The squad row and the player screen both show this one value.

## Error and boundary paths
- Invalid or missing seed: the default-seed league is used; every player still opens (S-001 rule).
- First row (a goalkeeper) and last row (a forward) of any club open like any other row.
- A view-player or Back action from the wrong screen, or a player index outside 0-17, changes
  nothing (as `ChooseClub` and `ViewSquad` do); details for DESIGN.
- Long player names wrap within 390px; no sideways scroll.

## Acceptance criteria (BDD)
- Given the "Squad" list, when I tap a player's row, then the only heading is the player's name and
  Position, Age and Overall match the row.
- The list "Attributes" has exactly Goalkeeping, Defending, Passing, Shooting in that order, each 1-20.
- "Condition" sits outside that list as a whole percentage 0-100.
- The overall lies between the lowest and highest attribute.
- Same seed, same club, same row gives the same screen; one squad's players do not all match.
- "Back" goes player to squad, then squad to club home.
- Each of the 18 rows is exactly one button; rows and "Back" are 44px or taller; no sideways
  scroll at 390px; no console errors.

## Examples
1. `?seed=31`, first club, row "Tomas Brenning GK 27 14": Goalkeeping 17, Defending 12, Passing 11,
   Shooting 4, Condition 92% (illustrative values).
2. "Back", then the last row "Ivo Marsh FW 22 11": Goalkeeping 2, Defending 6, Passing 12,
   Shooting 16, Condition 85%. "Back" twice reaches club home.
3. `?seed=abc`, 8th club, first row: a goalkeeper with 4 attributes and a condition, identical on a
   fresh visit.

## Sizing
About 300-350 changed lines over 2 slices (domain about 120, screen and navigation about 200),
2-3 days. 7 UAT scenarios.

## Out of this slice
Editing, sorting, filtering, condition changing over time, injuries, morale, form, training and
development, photos, kits, more than 4 attributes, previous/next player swiping.
