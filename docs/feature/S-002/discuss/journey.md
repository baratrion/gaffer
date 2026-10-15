# S-002: View my squad (DISCUSS, lean)

## Job to be done
"When I've just taken over a club, I want to see who I've got, so that I can start judging who
should play."

## Why this slice next
Choosing a formation and starting XI (the first real *decision*) needs a squad to choose from.
Seeing 18 named players with positions and ratings is also the first moment the club feels real.

## Elevator pitch
- **Before:** the player owns a club, but it is just a name.
- **After:** they see 18 players with positions, ages and ratings.
- **Decision enabled:** this story sets up *who starts?* The formation and starting-XI story needs this list to choose from. Right away, it lets the player spot their best player and their weak position.

## Persona
Sam (see S-001): one-handed, on a bus, with 5 minutes. Sam wants to see the squad at a glance without scrolling sideways.

## Journey (phone, one thumb)
| Step | Player does | Player sees | Feels |
|---|---|---|---|
| 1 | On the club home screen, taps "Squad" | A list named "Squad" of 18 players: name, position, age, overall rating | "Who's my best player?" |
| 2 | Scrolls vertically | All rows fit the width; no sideways scrolling | Comfortable |
| 3 | Taps "Back" | Club home screen with the club's name | In control |

## Shared artifacts
- **Squad**: 18 players per club, generated from the league seed (same seed, same players).
- **Player**: name, position (GK/DF/MF/FW), age 16-40, overall rating 1-20. The 1-20 scale matches
  the attribute scale planned for the player-detail story, so the overall reads as a summary.

## Acceptance criteria (BDD)
- Given my club's home screen, when I tap "Squad", then I see a list named "Squad" with exactly 18 items.
- Every row shows a name, exactly one position code (GK, DF, MF or FW), an age between 16 and 40, and an overall rating.
- The squad has at least 2 goalkeepers and at least one DF, MF and FW.
- Two different clubs have different squads.
- Tapping "Back" returns to the club home screen.
- No horizontal scroll at 390px.

## Examples
1. Sam picks the 1st club and taps "Squad". A row reads "Tomas Brenning · GK · 27 · 14": name, position, age, overall, in that order, with no other number before the overall.
2. Sam taps "Back" and sees the club's name as the heading again.
3. With `?seed=31`, the 8 clubs each have a different squad, and reopening club 1 shows the identical squad.

## Sizing and technical notes
- Estimate: about 300-400 changed lines. That covers `generateSquad` (quota 2 GK / 6 DF / 6 MF / 4 FW, ADR-0004), player name lists, the squad screen, the Squad and Back actions in `update`, and the tests.
- "Overall" is a stored 1-20 integer for now. When attributes arrive in the player-detail story, a superseding note in ADR-0004 makes it derived from them.

## Out of this slice
Player detail view, attributes, condition, sorting and filtering, formations and the starting XI.
