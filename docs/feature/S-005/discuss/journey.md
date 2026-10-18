# S-005: Pick my starting XI (DISCUSS, lean)

## Job to be done
J-05 `pick-my-starting-eleven`: "When I have set how my side lines up, I want to choose which players
start, so that I field the team I believe in."

## Why this slice next
Sam has a squad, knows each player, and has a formation with 11 slots of position codes, but no names
in them. Filling the slots is the last part of "pick team" in the brief's loop "pick team, play match,
see table"; the match stories need a starting XI to play.

## Elevator pitch
- **Before:** the club home offers "Squad" and "Tactics"; the formation is 11 bare codes and no player
  is picked to start.
- **After:** on the club home Sam taps "Starting XI" and sees 11 buttons such as "GK Ray Dunmore 15",
  "MF Tom Barrow 14"; tapping a slot, then a player, puts that player in the slot.
- **Decision enabled:** who starts in each position: the best-rated man, or the one Sam believes in?

## Persona
Sam (see S-001, S-004): one-handed, on a bus, with 5 minutes. Wants a sensible XI already filled in,
one tap to open a slot and one tap to pick, and never a gap or the same player twice.

## Journey (phone, one thumb)
Names and ratings below are illustrative; the real ones come from the seed and equal the "Squad" list.

| Step | Player does | Player sees | Feels |
|---|---|---|---|
| 1 | On the club home, taps "Starting XI" | Heading "Starting XI" (focused); list "Starting XI" of 11 buttons in the formation's line-up order, e.g. "GK Ray Dunmore 15", 4 DF, 4 MF ("MF Tom Barrow 14" first), 2 FW: the best-rated players of each position, highest first | Reassured: "A proper team, already" |
| 2 | Taps the 4th MF slot, "MF Ned Pike 11" | Heading "Choose MF" (focused); list "Players": the 6 midfielders in squad order, each name and overall; 4 also read "Starting" | Weighing up: "Hale is a point lower, but I rate him" |
| 3 | Taps "Joe Hale 10" | Back on "Starting XI" (heading focused); the 4th MF slot reads "MF Joe Hale 10"; Ned Pike is out; still 11 different players | In charge: "My call" |
| 4 | Taps the 1st MF slot, then "Joe Hale 10 Starting" | Swap: the 1st MF slot reads "MF Joe Hale 10", the 4th "MF Tom Barrow 14" | Precise: "Just moved him" |
| 5 | "Back", "Tactics", taps "4-3-3", "Back", "Starting XI" | GK, 4 DF, 3 MF (Hale, Cole, Webb kept in their order; the 4th MF, Barrow, drops out), 3 FW (the 2 kept, then the best-rated unpicked forward) | Trusting: "It kept my picks" |
| 6 | "Back", "Squad", "Back", "Starting XI" | The same XI | Trusting: "It remembered" |

Emotional arc: reassured (a full team at once), then weighing up and in charge (one tap per decision),
then trusting (picks survive navigation and a formation change). No step leaves Sam lost: each screen
has one focused heading, "Back" undoes an open slot, and the XI never has a gap or a duplicate.

## Shared artifacts (single source each)
- **Seed** and **club**: `league.seed` and the `clubId` carried by the screen (S-001).
- **Squad**: `generateSquad(league.seed, clubIndex)` (S-002/S-003), derived, never copied: every name,
  position and overall on the Starting XI and choose screens equals the "Squad" list of the same seed.
  "Squad order" means that list's order.
- **Formation**: `GameState.formation` (S-004). **Slots**: indices 0..10 of `lineUp(formation)`
  (ADR-0007); slot `i` reads the code `lineUp(formation)[i]`, the same order as the Tactics "Line-up".
- **The XI**: one value in the game state for the session (which squad player is in which slot;
  representation for DESIGN). The Starting XI list and the "Starting" marks on the choose screen both
  read it, so they cannot disagree.
- **Position codes**: GK, DF, MF, FW, shared by squad and formation; they decide eligibility.

## Error and boundary paths
- Invalid or missing seed (`?seed=abc`): the default-seed league; the automatic XI equals the one
  without a seed.
- Tapping the slot's own player, or "Back" on the choose screen: nothing changes.
- A player from another slot: swap, never a duplicate. A player of another position cannot be offered.
- Ties in overall: the player earlier in squad order starts and is listed first.
- Formation with more slots of a position (MF 3 to 5): each extra slot takes the highest-rated unpicked
  player of that position; fewer slots (MF 4 to 3): the last starters of that position in slot order
  drop out. The squad quota (2/6/6/4) always covers every formation (at most 1 GK, 4 DF, 5 MF, 3 FW).
- Choosing the formation already chosen: XI unchanged.
- Wrong-screen or invalid actions (opening the XI off a known club's home, a slot outside 0..10, a
  player outside the slot's position): no-op, unit tests on `update`.
- Reload: title screen; "New game" gives the automatic XI again.

## Acceptance scenarios (Gherkin, lean)
```gherkin
Scenario: A new game shows the best eleven at once
  Given Sam has started a new game with "?seed=31" and is on the first club's home, formation 4-4-2
  When Sam taps "Starting XI"
  Then the only heading is "Starting XI" and it has focus
  And the list "Starting XI" holds 11 buttons whose codes read GK, DF, DF, DF, DF, MF, MF, MF, MF, FW, FW
  And each button reads code, name, overall, with 11 different players of matching squad position
  And in each position no unpicked player has a higher overall than a starter, highest listed first

Scenario: Picking a player who is not starting fills the tapped slot
  Given Sam is on "Starting XI" with "MF Ned Pike 11" in the 4th MF slot
  When Sam taps that slot and then "Joe Hale 10" in the list "Players"
  Then the heading "Starting XI" has focus, the 4th MF slot reads "MF Joe Hale 10" and Ned Pike is not in the XI

Scenario: Picking a starter from another slot swaps the two
  Given "MF Tom Barrow 14" is in the 1st MF slot and "MF Joe Hale 10" in the 4th
  When Sam taps the 1st MF slot and then "Joe Hale 10 Starting"
  Then the 1st MF slot reads "MF Joe Hale 10" and the 4th reads "MF Tom Barrow 14"

Scenario: A formation change keeps the picks
  Given Sam's 4-4-2 XI reads Joe Hale, Ian Cole, Sid Webb and Tom Barrow in its 4 MF slots, in that order
  When Sam chooses "4-3-3" in Tactics and opens "Starting XI"
  Then the 3 MF slots read Joe Hale, Ian Cole and Sid Webb, and Tom Barrow is not in the XI
  And the 3 FW slots read the 2 forwards already starting, in their order, then the best-rated unpicked forward
```

## Sizing
About 450 changed lines over 3 thin slices (automatic XI and screen about 200; choose and swap about
150; formation follow and session about 100), 3 days in total, 1 day per slice. 14 UAT scenarios across
3 user stories (4, 5, 5).

## Out of this story
Out-of-position play, condition or fitness in selection, a substitutes bench or its count, captain,
set pieces, drag and drop, finer roles, persistence across reloads, a match, any change to the Tactics
screen or its "Line-up" list.
