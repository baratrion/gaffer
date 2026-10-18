# S-005: Pick my starting XI (DISCUSS, lean, revision 1)

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
- **After:** on Netherwold Borough's home Sam taps "Starting XI" and sees 11 buttons from
  "GK Tamsin Ingleby 17" to "FW Garrick Thistlewood 5"; tapping "MF Dorian Dunmore 7", then
  "Kestrel Northcott 6", puts Northcott in that slot.
- **Decision enabled:** who starts in each position: the best-rated player, or the one Sam believes in?

## Persona
Sam (see S-001, S-004): one-handed, on a bus, with 5 minutes. Wants a sensible XI already filled in,
one tap to open a slot and one tap to pick, and never a gap or the same player twice.

## Journey (phone, one thumb)
Real generator values: `?seed=31`, first club "Netherwold Borough" (club index 0), formation 4-4-2.
Precondition for step 1: a fresh page at `/gaffer/?seed=31`, "New game", "Netherwold Borough".

| Step | Precondition | Player does | Player sees | Feels |
|---|---|---|---|---|
| 1 | Club home, new game | Taps "Starting XI" | Heading "Starting XI" (focused); list "Starting XI" of 11 buttons: "GK Tamsin Ingleby 17", "DF Bram Pemberly 19", "DF Calder Ashcombe 18", "DF Quill Crossley 4", "DF Quill Yarrow 3", "MF Ivo Elderkin 18", "MF Joren Dalrymple 16", "MF Calder Redfern 15", "MF Dorian Dunmore 7", "FW Merrick Hartwell 8", "FW Garrick Thistlewood 5" | Reassured: "A proper team, already" |
| 2 | Starting XI, automatic XI | Taps "MF Dorian Dunmore 7" | Heading "Choose MF" (focused); list "Players": "Calder Redfern 15 Starting", "Ivo Elderkin 18 Starting", "Dorian Dunmore 7 Starting", "Finlay Ballantyne 3", "Joren Dalrymple 16 Starting", "Kestrel Northcott 6" | Weighing up: "Northcott is a point lower, but I rate him" |
| 3 | Choose MF from the 9th slot | Taps "Kestrel Northcott 6" | "Starting XI" (heading focused); the 9th button reads "MF Kestrel Northcott 6"; Dunmore is out; still 11 different players | In charge: "My call" |
| 4 | Starting XI after step 3 | Taps "MF Ivo Elderkin 18", then "Joren Dalrymple 16 Starting" | Swap: the 6th button reads "MF Joren Dalrymple 16", the 7th "MF Ivo Elderkin 18" | Precise: "Just moved him" |
| 5 | Starting XI after step 4 | Taps "FW Merrick Hartwell 8", then "Back" on "Choose FW" | "Starting XI" (heading focused), unchanged | Safe: "Nothing lost" |
| 6 | Starting XI after step 5 | "Back", "Squad", "Back", "Tactics", "Back", "Starting XI" | The same 11 buttons as after step 4 | Trusting: "It remembered" |
| 7 | Starting XI after step 6 | "Back" | Club home, heading "Netherwold Borough" (focused) | Oriented |

Emotional arc: reassured (a full team at once), then weighing up and in charge (one tap per decision),
then safe and trusting (Back undoes an open slot, picks survive navigation). No step leaves Sam lost:
each screen has one focused heading, and the XI never has a gap or a duplicate.

Not in the happy path, but in this story: choosing another formation in Tactics re-picks the automatic
XI of the new formation (picks are dropped; a later story may keep them, D15). An XI Sam never changed
always follows the formation.

## Shared artifacts (single source each)
- **Seed** and **club**: `league.seed` and the `clubId` carried by the screen (S-001); the club index is
  the club's position in `league.clubs` (`main.ts` `findClub`).
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
- Invalid seed (`?seed=abc`): the default seed 20260; the automatic XI equals the one without a seed
  (8th club "Oakhampton Rise Borough": "GK Alden Hartwell 17", row 1, starts ahead of row 0 "Dacey Marwood 6").
- Names with an apostrophe or hyphen ("DF Ulric O'Garrity 8", "FW Finlay Fitch-Moreton 5"): the name is
  everything between the code and the final number.
- Ties in overall: the player earlier in squad order starts and is listed first (Quill Yarrow 3 over
  Calder Kilbride 3 and Dacey Jessamy 3; Garrick Thistlewood 5 over Finlay Fitch-Moreton 5).
- Tapping the slot's own player, or "Back" on the choose screen: nothing changes.
- A player from another slot: swap, never a duplicate. A player of another position is never offered.
- Choosing the formation already checked: the XI is unchanged. Choosing another: the automatic XI of the
  new formation (this story).
- Wrong-screen or invalid actions (opening the XI off a known club's home, a slot outside 0..10, a
  player outside the slot's position or 0..17): no-op, unit tests on `update`.
- Reload: title screen; "New game" gives the automatic XI again.

## Acceptance scenarios (Gherkin, lean)
```gherkin
Scenario: A new game shows the automatic eleven at once
  Given Sam opens a fresh page at "?seed=31", taps "New game" and taps "Netherwold Borough"
  When Sam taps "Starting XI"
  Then the only heading is "Starting XI", focused, and the list "Starting XI" reads "GK Tamsin Ingleby 17", "DF Bram Pemberly 19", "DF Calder Ashcombe 18", "DF Quill Crossley 4", "DF Quill Yarrow 3", "MF Ivo Elderkin 18", "MF Joren Dalrymple 16", "MF Calder Redfern 15", "MF Dorian Dunmore 7", "FW Merrick Hartwell 8", "FW Garrick Thistlewood 5"

Scenario: Picking a player who is not in the XI fills the tapped slot
  Given Sam is on "Choose MF", opened from "MF Dorian Dunmore 7" on Netherwold Borough's automatic XI
  When Sam taps "Kestrel Northcott 6"
  Then "Starting XI" is shown, heading focused, with the 9th button "MF Kestrel Northcott 6" and the other 10 unchanged

Scenario: Picking a starter from another slot swaps the two
  Given Sam is on Netherwold Borough's Starting XI with its automatic XI
  When Sam taps "MF Ivo Elderkin 18" and then "Joren Dalrymple 16 Starting"
  Then the 6th button reads "MF Joren Dalrymple 16", the 7th "MF Ivo Elderkin 18", and the other 9 are unchanged

Scenario: The XI is kept while Sam looks around
  Given Sam has picked "Kestrel Northcott 6" into the 9th slot of Netherwold Borough's Starting XI
  When Sam taps "Back", "Squad", "Back", "Tactics", "Back" and "Starting XI"
  Then the 11 buttons read exactly as before, in the same order
```

## Sizing
2 slices in one DELIVER, about 2-3 days, about 1040 changed lines including tests (at most 1200; per-file
budget in `feature-delta.md`). 12 UAT scenarios across 3 user stories (5, 4, 3).

## Out of this story
Keeping picks through a formation change (deferred, D15), out-of-position play, condition or fitness in
selection, a substitutes bench or its count, captain, set pieces, drag and drop, finer roles,
persistence across reloads, a match, any change to the Tactics screen or its "Line-up" list.
