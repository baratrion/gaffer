# S-004: Choose a formation (DISCUSS, lean)

## Job to be done
J-04 `set-up-my-team`: "When I am getting my team ready for the next match, I want to choose how my
side lines up, so that I can play to my squad's strengths."

## Why this slice next
Sam can now see the squad and judge each player, but has nothing to pick a team into. The starting-XI
story (S-005) fills 11 slots, and those slots come from the formation, so the formation comes first.
Together they are "pick team" in the brief's loop "pick team, play match, see table".

## Elevator pitch
- **Before:** the club home offers only "Squad"; there is no way to say how the team lines up.
- **After:** on the club home Sam taps "Tactics", then taps "4-3-3", and sees "4-3-3" checked and the
  list "Line-up" reading GK, DF, DF, DF, DF, MF, MF, MF, FW, FW, FW.
- **Decision enabled:** which shape suits my squad: two strikers, three forwards, or a packed midfield?

## Persona
Sam (see S-001): one-handed, on a bus, with 5 minutes. Wants one tap per choice, no save button, and
nothing to scroll sideways.

## Journey (phone, one thumb)
| Step | Player does | Player sees | Feels |
|---|---|---|---|
| 1 | On the club home, taps "Tactics" | Heading "Tactics"; group "Formation" with "4-4-2" checked; list "Line-up": GK, 4 DF, 4 MF, 2 FW | Curious: "What shape are we?" |
| 2 | Taps "4-3-3" | "4-3-3" checked, the others not; "Line-up": GK, 4 DF, 3 MF, 3 FW; heading and focus unchanged | In charge: "Three up front" |
| 3 | Taps "Back" | Club home, headed by the club's name, "Squad" and "Tactics" | Oriented |
| 4 | Taps "Squad", "Back", then "Tactics" | "4-3-3" still checked with its line-up | Trusting: "It remembered" |

Emotional arc: curious, then in charge, then trusting. No step leaves Sam lost: every screen has one
heading, the choice takes effect at once without a confirm step, and focus stays where Sam's thumb
(or screen reader) is.

## Shared artifacts (single source each)
- **Seed** and **club**: as in S-001/S-002 (`league.seed`, the `clubId` carried by the screen). The
  formation does not depend on either.
- **Formations**: fixed domain data, the same for every seed: "4-4-2", "4-3-3", "4-2-3-1" in that
  order, each with an 11-slot line-up of position codes (GK, DF, MF, FW), in GK, DF, MF, FW order.
- **Chosen formation**: held in `GameState` (one value, initially "4-4-2"). The radio group and the
  "Line-up" list both read it, so they cannot disagree. In memory only; lost on reload.
- **Position codes**: the same GK, DF, MF, FW the squad uses (S-002), so S-005 can match players to slots.

## Error and boundary paths
- Invalid or missing seed: the default-seed league is used; tactics behaves the same (formations are
  not generated).
- Tapping the formation that is already checked changes nothing.
- A view-tactics action from any screen but a known club's home, a choose-formation action off the
  tactics screen or with an unknown formation, or "Back" from tactics with an unknown club changes
  nothing (as `ChooseClub`, `ViewSquad` and `ViewPlayer` do); details for DESIGN.
- Reload: the game starts again at the title screen, and "4-4-2" after "New game".
- Same-screen update: focus must stay on the tapped option, not move to the heading.

## Acceptance criteria (BDD)
- Given a new game on a club home, when I tap "Tactics", then the only heading is "Tactics", the group
  "Formation" holds "4-4-2", "4-3-3", "4-2-3-1" in that order with "4-4-2" checked, and "Line-up"
  reads GK, 4 DF, 4 MF, 2 FW.
- Tapping a formation checks only it and updates "Line-up" at once; heading and focus stay.
- Every formation's line-up has 11 codes in GK, DF, MF, FW order: 1/4/4/2, 1/4/3/3, 1/4/5/1, for any seed.
- The choice survives "Back", "Squad", "Back", "Tactics" in the same session.
- Every new game ("New game" on the title screen) starts at "4-4-2".
- "Tactics", "Back" and each formation label are 44px or taller; focus on the heading on arrival; no
  sideways scroll at 390px; no console errors.

## Examples
1. `?seed=31`, first club, "Tactics": "4-4-2" checked; tap "4-3-3"; "Back", "Squad", "Back",
   "Tactics": "4-3-3" still checked, line-up GK, DF, DF, DF, DF, MF, MF, MF, FW, FW, FW.
2. `?seed=abc`, 8th club, "Tactics", "4-2-3-1": 1 GK, 4 DF, 5 MF, 1 FW, as for any other seed.
3. Fresh visit, "New game", 8th club, "Tactics": "4-4-2" checked.

## Sizing
About 300-400 changed lines in 1 slice (formation data about 60, state and navigation about 100,
tactics screen, club home button, shell focus handling and CSS about 200), 2-3 days. 6 UAT scenarios.

## Out of this slice
Players in slots, suggested XI, mentality and instructions, drag and drop, finer roles, pitch
coordinates beyond a simple line layout, persistence across reloads, opponent tactics, the formation
affecting anything else.
