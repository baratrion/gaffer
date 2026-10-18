# S-005: Pick my starting XI

## Wave: DISCUSS

Lean, unattended, revision 1. Reuses `discuss/journey.md` and `slices/slice-01..02`. The outcome is the owner draft for S-005 ("The player fills the 11 slots from the squad by tapping (tap slot, tap player). A suggested XI is pre-filled by best rating per position. Exactly 11 starters with exactly 1 goalkeeper are required to continue."), narrowed by scope.md precedence (ship less). The XI is always full: it starts automatic, and the player can only swap within a position. So "required to continue" needs no gate, and there is nothing to continue to yet (no match). "Exactly 1 goalkeeper" holds by construction: every formation has one GK slot, and only goalkeepers fill it. The XI is kept for the session only ("Save and continue" is its own later story). Keeping the player's picks through a formation change is deferred to a later story; here a formation change re-picks the automatic XI (D10). Feature type: user-facing. UX depth: lightweight. Walking skeleton: no (brownfield, extends S-001..S-004). No DIVERGE artifact (accepted as lean, as for S-002..S-004).

### Wave: DISCUSS / [REF] Scope Assessment
PASS: 3 small user stories, 1 roadmap story, 1 new small context ("Selection": the XI over squad and formation) plus the app navigation. 2 releasable carpaccio slices shipped in one DELIVER, about 2-3 days. Under 1200 changed lines including tests (budget below). Integration points: squad (S-002/S-003), formation and `lineUp` (S-004), club home actions, shell focus (ADR-0008): 4, within the limit of 5. No oversized signal: each story has 3-5 scenarios, and the keep-picks rule is cut (C1).

Line budget (changed lines, code plus tests; file names are indicative, DESIGN names the files):

| File | Kind | Lines |
|---|---|---|
| `src/domain/selection.ts` (new: automatic XI, pick/swap) | code | 80 |
| `src/app/state.ts` (XI, 3 actions, `Back` cases, formation reset) | code | 80 |
| `src/ui/screens/starting-xi.ts` (new) | code | 50 |
| `src/ui/screens/choose-player.ts` (new) | code | 50 |
| `src/ui/screens/club-home.ts` (third button) | code | 5 |
| `src/main.ts` (two render cases) | code | 30 |
| `src/ui/styles.css` | code | 35 |
| `tests/acceptance/S-005/selection.test.ts` (unit and property) | tests | 220 |
| `tests/acceptance/S-005/navigation.test.ts` (`update`, no-ops) | tests | 220 |
| `tests/e2e/S-005-starting-xi.spec.ts` | tests | 230 |
| Existing acceptance fixtures (only if `GameState` gains a required field) | tests | 40 |
| **Total** (code 330, tests 710) | code and tests | **1040** |

### Wave: DISCUSS / [REF] Persona
Sam, 34, a lapsed Championship Manager fan. Plays on the bus, one-handed, on a mid-range Android phone at 390px wide, with 5 minutes to spare (persona from `docs/feature/S-001/feature-delta.md`; player from brief.md). Has looked at the squad and its players and chosen a formation. Now Sam wants names in the 11 slots: a sensible XI without filling 11 slots by hand, and the final say on who starts.

### Wave: DISCUSS / [REF] JTBD one-liner
When I have set how my side lines up, I want to choose which players start, so that I field the team I believe in. (Recorded as J-05 `pick-my-starting-eleven` in `docs/product/jobs.yaml`; it follows J-04.)

### Wave: DISCUSS / [REF] Glossary
- **Squad order**: the order of the club's "Squad" list (S-002: GK, DF, MF, FW, then generation order); the index of a player is his row 0..17.
- **Club index**: the club's position 0..7 in `league.clubs`, found from the `clubId` as `main.ts` `findClub` does (`league.clubs.findIndex`); the squad is `generateSquad(league.seed, clubIndex)`.
- **Automatic XI**: the XI of D6 for a club and a formation.
- **In the XI / not in the XI**: whether a squad player holds one of the 11 slots.
- **Picks**: changes Sam made with the choose screen (D8). An XI with no picks is "never changed".

### Wave: DISCUSS / [REF] Locked decisions
- D1 Entry: the club home gains a button named exactly "Starting XI" (44px or taller), stacked after "Squad" and "Tactics" (the S-004 `club-actions` stack). The club home `<h1>` is still the club's name; "Squad" and "Tactics" are unchanged.
- D2 Own screen: the XI lives on its own screen. The Tactics screen and its "Line-up" list stay exactly as S-004 shipped (each item exactly its code, no names), because S-004's protected scenarios pin them. The XI is not shown on the Tactics screen.
- D3 Starting XI screen: exactly one `<h1>` "Starting XI", focused on arrival and on every return to it. A list named "Starting XI" holds exactly 11 items, each holding exactly one button (44px or taller). Its text is the slot's position code, one space, the player's name, one space, then the player's overall (1-20), for example "MF Ivo Elderkin 18". The overall is the only number (names have no digits, S-002). The name is everything between the code and the final number, and may hold a space, an apostrophe or a hyphen ("DF Ulric O'Garrity 8", "FW Finlay Fitch-Moreton 5"). A button named exactly "Back" (44px or taller) returns to the club home, with focus on its `<h1>`, the club's name. The list's name and the heading share the text "Starting XI"; there is still one heading.
- D4 Slots: ADR-0007 says: "S-005 reuse: a slot is its index 0..10 in `lineUp(formation)`; its position code is the element at that index and its row is derived from `formationLines`." Slot `i` reads the code `lineUp(formation)[i]`, so the 11 codes equal the Tactics "Line-up" list in the same order. 4-4-2 is 1 GK, 4 DF, 4 MF, 2 FW; 4-3-3 is 1 GK, 4 DF, 3 MF, 3 FW; 4-2-3-1 is 1 GK, 4 DF, 5 MF, 1 FW.
- D5 Eligibility: a slot with code P only ever holds a squad player whose squad position is P (no out-of-position play; scope narrowest). The XI always holds 11 different players of the club's squad, each with the same name and overall as in the "Squad" list. The squad quota 2/6/6/4 covers every formation (at most 1 GK, 4 DF, 5 MF, 3 FW), so no slot is ever empty.
- D6 Automatic XI: for each position, the formation's n slots of that position hold the n players of that position with the highest overall. They are listed from highest to lowest overall, ties in squad order. Equivalently, no player of a position who is not in the XI has a higher overall than a starter of that position. The XI is derived from the generated squad only, with no RNG draw of its own. So the same `?seed=` always gives the same XI, and `?seed=abc` gives the default seed's XI (the same as no seed).
- D7 Choose screen: tapping a slot opens a screen with exactly one `<h1>`, focused on arrival: "Choose GK", "Choose DF", "Choose MF" or "Choose FW" (the slot's code). A list named "Players" holds one button (44px or taller) per squad player of that position (2 GK, 6 DF, 6 MF or 4 FW), in squad order. Each button reads the player's name, one space, then the overall. For each player currently in the XI, one space and "Starting" follow, for example "Ivo Elderkin 18 Starting". So exactly as many buttons read "Starting" as the formation has slots of that position, the tapped slot's own player included. The screen shows no age, attributes or condition. A button named exactly "Back" (44px or taller) returns to the Starting XI screen, heading focused, with the XI unchanged.
- D8 Picking: tapping a player returns to the Starting XI screen (heading focused, as for any screen change, ADR-0008), with that player in the tapped slot. A player not in the XI replaces the slot's player, who leaves the XI. A player already in another slot (of the same position, by D5) swaps with the slot's player. Tapping the slot's own player changes nothing. There is no confirm or save button.
- D9 Session memory: the XI is kept in the game state for the rest of the session. After "Back", "Squad" (and a player), "Back", or "Tactics" without choosing another formation (including a tap on the already checked formation), then "Back", it is unchanged. It is not persisted across reloads. "New game" (title screen) starts from the automatic XI again. The protected scenario checks this in a fresh page, not by reloading after picks, so the later "Save and continue" story (scope IN) can restore a saved XI through "Continue" without contradicting a permanent S-005 test (same rationale as S-004 D3).
- D10 Formation change (narrowed, C1): choosing another formation in Tactics replaces the XI with the automatic XI of the new formation, and drops any picks. The permanent rule, the only one the protected scenarios pin, is: "an XI the player never changed always follows the formation: after choosing another formation, Starting XI shows the automatic XI of the new formation". That a formation change also drops picks is this story's behaviour only. It is covered by unit and e2e tests, not by `tests/protected/S-005/`, so a later story may keep the player's picks without contradicting a permanent test. The `ChooseFormation` guards are unchanged: an unknown id, another screen, an unknown club or the same formation all return the same state object.
- D11 Navigation (names and shapes for DESIGN, ADR-0003): `Screen` gains a starting-XI variant (club id) and a choose-slot variant (club id, slot index). `Action` gains three actions. View-starting-XI is valid only from a known club's home. Choose-slot is valid only on the Starting XI screen, with a slot that is an integer 0..10. Pick-player is valid only on the choose screen, with a squad index 0..17 of a player whose position equals the slot's code. "Back" goes from choose-slot to Starting XI, and from Starting XI to the club home. Wrong-screen actions and invalid slots or players are no-ops, as before. `GameState` gains the XI; the representation is for DESIGN (ADR-0007 anticipates "slot index to player index" in state).
- D12 Accessible names: no new accessible name may collide with an existing one. The checked words are "Back" (except the two new "Back" buttons), "Squad", "Tactics", "Starting", "Players", "Formation", "Line-up", "Clubs" and "Choose". Every string array in `src/domain/names.ts` (`TOWNS`, `CLUB_SUFFIXES`, `COLOUR_PALETTE`, `FIRST_NAMES`, `SURNAMES`) contains none of these words, checked case-insensitively and as substrings, the way Playwright matches names by default. So no club, player or slot button can collide with them. DISTILL adds a unit check over those arrays. "Starting XI" is new. The "Choose GK/DF/MF/FW" headings are on their own screen, never with "Choose your club".
- D13 Phone first: no horizontal scroll at 390px (long names wrap inside the button), no console errors, generated text through `el()`/`textContent` only (ADR-0002). Renderers never move focus (ADR-0008).
- D14 Selection changes nothing else yet. No condition or fitness effect on selection or on the automatic XI. No substitutes bench or bench count, no captain, no match, no persistence. The squad, ratings, attributes, condition and formations are unchanged.
- D15 Deferred next-story candidate: "keep my picks through a formation change". In each position the players already starting would keep their order and stay in as far as the new formation has room, and each extra slot would take the best-rated player of that position who is not in the XI. It is not planned here; the plan run may queue it later.
- UX depth: no mockups beyond the journey table.

### Wave: DISCUSS / [REF] Story map and priority
Backbone: pick club, club home, squad, player, tactics, **starting XI** (see, choose, keep), (next: match, table). Walking skeleton: the existing S-001..S-004 path plus one branch from the club home (club home, Starting XI, choose, back). One release, two thin slices, both in the one S-005 DELIVER:
1. `slices/slice-01-see-automatic-xi.md` (US-1): the club home button, the Starting XI screen and the automatic XI that follows the formation. Value 4 x urgency 4 / effort 2 = 8. It comes first because it is the end-to-end proof that squad and formation combine, and it already answers "who plays?". It renders the 11 slot buttons; slice 02 wires them.
2. `slices/slice-02-swap-player-in-slot.md` (US-2, US-3): the choose screen, pick and swap, session memory, the formation re-pick and the `NewGame` reset. 5 x 4 / 2 = 10, but it depends on slice 01. It turns a suggestion into Sam's decision, which is the job's core.
Priority rationale: "pick team" is the first step of the brief's five-minute loop "pick team, play match, see table". With S-004, this story completes that step and gives the match stories a side to play. The slices are ordered by dependency, then by outcome value. The roadmap outcome and `tests/protected/S-005/` are complete only after slice 02.

### Wave: DISCUSS / [REF] User stories
Fixtures are real generator values. `?seed=31`, first club "Netherwold Borough" (club index 0), squad in order (index, position, name, overall):
0 GK Tamsin Ingleby 17, 1 GK Alden Zealby 11, 2 DF Quill Yarrow 3, 3 DF Calder Ashcombe 18, 4 DF Calder Kilbride 3, 5 DF Dacey Jessamy 3, 6 DF Quill Crossley 4, 7 DF Bram Pemberly 19, 8 MF Calder Redfern 15, 9 MF Ivo Elderkin 18, 10 MF Dorian Dunmore 7, 11 MF Finlay Ballantyne 3, 12 MF Joren Dalrymple 16, 13 MF Kestrel Northcott 6, 14 FW Garrick Thistlewood 5, 15 FW Emlyn Vexford 2, 16 FW Finlay Fitch-Moreton 5, 17 FW Merrick Hartwell 8.
`?seed=abc` (default seed 20260), 8th club "Oakhampton Rise Borough" (club index 7): 0 GK Dacey Marwood 6, 1 GK Alden Hartwell 17, 2 DF Ulric O'Garrity 8, 3 DF Bram Quarrie 5, 4 DF Zander Wetherby 4, 5 DF Wystan Redfern 14, 6 DF Soren Dalrymple 8, 7 DF Perrin Dunmore 6, 8 MF Ulric Everleigh 8, 9 MF Alden Underby 17, 10 MF Tamsin Stanhope 12, 11 MF Orrin Lockhart 2, 12 MF Niall Stanhope 20, 13 MF Brannock Cardew 2, 14 FW Cormac Marwood 6, 15 FW Rurik Pemberly 4, 16 FW Bram Stanhope 9, 17 FW Joren Northcott 19.
The acceptance criteria state rules; these rows are their examples. "Netherwold Borough's automatic 4-4-2 XI" below is: GK Tamsin Ingleby 17; DF Bram Pemberly 19, DF Calder Ashcombe 18, DF Quill Crossley 4, DF Quill Yarrow 3 (a tie at 3 with Kilbride and Jessamy, broken by squad order); MF Ivo Elderkin 18, MF Joren Dalrymple 16, MF Calder Redfern 15, MF Dorian Dunmore 7; FW Merrick Hartwell 8, FW Garrick Thistlewood 5 (a tie with Finlay Fitch-Moreton, broken by squad order).

#### US-1: See my best eleven at once
**Problem:** Sam has chosen a formation, but its 11 slots are bare codes. Filling 11 slots by hand from 18 players on a bus is a chore, and without names in the slots there is no team to send out.
**job_id:** J-05
**Elevator Pitch**
- Before: the club home offers "Squad" and "Tactics"; "Line-up" is 11 codes and nobody is picked to start.
- After: on Netherwold Borough's home Sam taps "Starting XI" and sees the heading "Starting XI" and 11 buttons, from "GK Tamsin Ingleby 17" and "DF Bram Pemberly 19" to "FW Garrick Thistlewood 5".
- Decision enabled: is the suggested eleven the side I want, or who should I change?

**Domain examples**
1. `?seed=31`, "New game", "Netherwold Borough", "Starting XI": the automatic 4-4-2 XI above. Ivo Elderkin 18 leads the midfield, and Kestrel Northcott 6 and Finlay Ballantyne 3 are not in the XI.
2. Ties: Quill Yarrow, Calder Kilbride and Dacey Jessamy are all 3 for the 4th DF slot, so Quill Yarrow (row 2, earliest) starts. Garrick Thistlewood and Finlay Fitch-Moreton are both 5 for the 2nd FW slot, so Garrick Thistlewood (row 14) starts.
3. `?seed=abc`, "New game", "Oakhampton Rise Borough", "Tactics", "4-2-3-1", "Back", "Starting XI": GK Alden Hartwell 17 (row 1, ahead of row 0 Dacey Marwood 6); DF Wystan Redfern 14, DF Ulric O'Garrity 8, DF Soren Dalrymple 8, DF Perrin Dunmore 6; MF Niall Stanhope 20, MF Alden Underby 17, MF Tamsin Stanhope 12, MF Ulric Everleigh 8, MF Orrin Lockhart 2 (a tie with Brannock Cardew 2, broken by squad order); FW Joren Northcott 19.

**Acceptance criteria (embedded UAT)**
```gherkin
Scenario: A new game shows the automatic eleven at once
  Given Sam opens a fresh page at "?seed=31", taps "New game" and taps "Netherwold Borough"
  When Sam taps the button named "Starting XI"
  Then the only heading is "Starting XI" and it has focus
  And the list named "Starting XI" holds exactly 11 items, each holding exactly one button
  And the buttons read, in order, "GK Tamsin Ingleby 17", "DF Bram Pemberly 19", "DF Calder Ashcombe 18", "DF Quill Crossley 4", "DF Quill Yarrow 3", "MF Ivo Elderkin 18", "MF Joren Dalrymple 16", "MF Calder Redfern 15", "MF Dorian Dunmore 7", "FW Merrick Hartwell 8", "FW Garrick Thistlewood 5"

Scenario: The automatic eleven are the best of each position, as the Squad list shows
  Given Sam opens a fresh page at "?seed=abc", taps "New game", taps "Oakhampton Rise Borough", taps "Squad", notes the 18 rows and taps "Back"
  When Sam taps "Starting XI"
  Then each button reads a code, one space, a name, one space and an overall, with 11 different players whose "Squad" position equals the code and whose overall equals the "Squad" row
  And in each position no player missing from the XI has a higher overall than a starter, and starters are listed from highest to lowest overall, ties in squad order
  And the DF buttons read "DF Wystan Redfern 14", "DF Ulric O'Garrity 8", "DF Soren Dalrymple 8", "DF Perrin Dunmore 6"

Scenario Outline: An XI never changed follows the formation chosen in Tactics
  Given Sam opens a fresh page at "<seed>", taps "New game" and taps "<club>"
  When Sam taps "Tactics", "<formation>", "Back" and "Starting XI"
  Then the 11 codes equal that formation's "Line-up" order (<counts>) and the MF and FW buttons read <mf_fw>
  Examples:
    | seed      | club                    | formation | counts             | mf_fw |
    | ?seed=31  | Netherwold Borough      | 4-3-3     | 1 GK, 4 DF, 3 MF, 3 FW | "MF Ivo Elderkin 18", "MF Joren Dalrymple 16", "MF Calder Redfern 15", "FW Merrick Hartwell 8", "FW Garrick Thistlewood 5", "FW Finlay Fitch-Moreton 5" |
    | ?seed=abc | Oakhampton Rise Borough | 4-2-3-1   | 1 GK, 4 DF, 5 MF, 1 FW | "MF Niall Stanhope 20", "MF Alden Underby 17", "MF Tamsin Stanhope 12", "MF Ulric Everleigh 8", "MF Orrin Lockhart 2", "FW Joren Northcott 19" |

Scenario: The same seed always gives the same eleven
  Given Sam has noted Netherwold Borough's Starting XI after a fresh page at "?seed=31", "New game", "Netherwold Borough", "Starting XI"
  When Sam repeats exactly those steps in a second fresh page
  Then the 11 buttons read exactly as noted, in the same order

Scenario: The Starting XI screen fits a phone and leads back home
  Given Sam is on a 390px-wide phone viewport on Netherwold Borough's home at "?seed=31"
  When Sam taps "Starting XI" and then the button named "Back"
  Then the only heading is "Netherwold Borough" and it has focus
  And "Starting XI", each of the 11 slot buttons and "Back" were at least 44px tall, neither screen scrolled sideways, and no errors appeared in the browser console
```

**Outcome KPI:** K1 (below).
**Technical notes (for DESIGN, not AC):** the squad is derived on render (`generateSquad(league.seed, clubIndex)`, ADR-0005; club index as in the Glossary) and is not stored in `GameState`. The automatic pick is a pure function of the squad and `lineUp(formation)`: no RNG, no `Date`. Club home layout from S-004 (`div.club-actions`, ADR-0007). Focus moves to the `<h1>` on a screen change (ADR-0008). Slice 01 renders the 11 slot buttons and slice 02 wires them, both in the one S-005 DELIVER. Depends on S-002, S-003 (derived overall) and S-004.

#### US-2: Put the player I believe in into a slot
**Problem:** the automatic XI picks by overall only. Sam rates a player the number does not show (he read his attributes in S-003), and today cannot start him.
**job_id:** J-05
**Elevator Pitch**
- Before: the XI is the game's best-rated eleven and Sam cannot change a name.
- After: on Netherwold Borough's "Starting XI" Sam taps "MF Dorian Dunmore 7". Sam sees "Choose MF" with 6 midfielders, from "Calder Redfern 15 Starting" to "Kestrel Northcott 6", taps "Kestrel Northcott 6", and the slot reads "MF Kestrel Northcott 6".
- Decision enabled: who starts in this position, the higher number or my man?

**Domain examples**
1. Netherwold Borough, automatic 4-4-2 XI: Sam taps "MF Dorian Dunmore 7" (the 9th slot). "Choose MF" lists "Calder Redfern 15 Starting", "Ivo Elderkin 18 Starting", "Dorian Dunmore 7 Starting", "Finlay Ballantyne 3", "Joren Dalrymple 16 Starting" and "Kestrel Northcott 6". Sam taps "Kestrel Northcott 6": the 9th slot reads "MF Kestrel Northcott 6", and Dorian Dunmore is not in the XI.
2. Netherwold Borough, automatic XI: Sam taps "MF Ivo Elderkin 18" (the 6th slot), then "Joren Dalrymple 16 Starting". This is a swap: the 6th slot reads "MF Joren Dalrymple 16" and the 7th "MF Ivo Elderkin 18".
3. Oakhampton Rise Borough (`?seed=abc`), automatic XI: Sam taps "GK Alden Hartwell 17". "Choose GK" lists "Dacey Marwood 6" and "Alden Hartwell 17 Starting". Sam taps "Alden Hartwell 17 Starting", the slot's own player, and nothing changes. Sam opens "FW Joren Northcott 19", then taps "Back": nothing changes.

**Acceptance criteria (embedded UAT)**
```gherkin
Scenario: Tapping a slot lists the players of that position, starters marked
  Given Sam is on Netherwold Borough's Starting XI at "?seed=31" with its automatic 4-4-2 XI, on a 390px-wide viewport
  When Sam taps "MF Dorian Dunmore 7"
  Then the only heading is "Choose MF" and it has focus
  And the list named "Players" holds exactly 6 buttons reading, in order, "Calder Redfern 15 Starting", "Ivo Elderkin 18 Starting", "Dorian Dunmore 7 Starting", "Finlay Ballantyne 3", "Joren Dalrymple 16 Starting", "Kestrel Northcott 6"
  And each player button and the button named "Back" are at least 44px tall, nothing scrolls sideways and no console error appears

Scenario: Picking a player who is not in the XI fills the tapped slot
  Given Sam is on "Choose MF", opened from "MF Dorian Dunmore 7" on Netherwold Borough's automatic XI
  When Sam taps "Kestrel Northcott 6"
  Then the only heading is "Starting XI" and it has focus
  And the 9th button reads "MF Kestrel Northcott 6", no button names Dorian Dunmore, and the other 10 buttons are unchanged

Scenario: Picking a starter from another slot swaps the two
  Given Sam is on Netherwold Borough's Starting XI with its automatic XI
  When Sam taps "MF Ivo Elderkin 18" and then "Joren Dalrymple 16 Starting"
  Then the 6th button reads "MF Joren Dalrymple 16" and the 7th "MF Ivo Elderkin 18"
  And the other 9 buttons are unchanged and the 11 players are all different

Scenario Outline: The slot's own player or Back changes nothing
  Given Sam is on Oakhampton Rise Borough's Starting XI at "?seed=abc" with its automatic 4-4-2 XI
  When Sam taps "<slot>" and then "<button>"
  Then the only heading is "Starting XI", it has focus, and all 11 buttons read as before
  Examples:
    | slot                  | button                     |
    | GK Alden Hartwell 17  | Alden Hartwell 17 Starting |
    | FW Joren Northcott 19 | Back                       |
```

**Outcome KPI:** K2 (below).
**Technical notes (for DESIGN, not AC):** a swap keeps D5 by construction (same position). Pick and swap are pure rules on the XI, with unit and property tests. The choose screen is a new `Screen` variant, so returning to "Starting XI" is a screen change and focuses the `<h1>`; no same-screen focus id is needed (ADR-0008). Protected tests find slot buttons by role `button` inside the list named "Starting XI", and player buttons inside the list named "Players". Depends on US-1.

#### US-3: Keep my XI for the session
**Problem:** Sam fears losing the picks: looking at the squad or the tactics for a moment must not throw the XI away.
**job_id:** J-05
**Elevator Pitch**
- Before: picks would only be as good as the visit to the screen.
- After: Sam picks Kestrel Northcott, then taps "Back", "Squad", "Back", "Tactics", "Back" and "Starting XI", and still sees "MF Kestrel Northcott 6" in the 9th slot.
- Decision enabled: can I check a player's attributes or the formation and come back to the eleven I chose?

**Domain examples**
1. Netherwold Borough with Kestrel Northcott picked into the 9th slot: Sam taps "Back", "Squad", "Calder Redfern" (his row), "Back", "Back", "Tactics", "4-4-2" (already checked), "Back" and "Starting XI". The XI is unchanged.
2. Same XI: Sam taps "Back", "Tactics", "4-3-3", "Back" and "Starting XI". He sees Netherwold Borough's automatic 4-3-3 XI (MF Ivo Elderkin 18, Joren Dalrymple 16, Calder Redfern 15; FW Merrick Hartwell 8, Garrick Thistlewood 5, Finlay Fitch-Moreton 5), because in this story a formation change re-picks the automatic XI (D10).
3. A fresh page at `?seed=31`, "New game", "Netherwold Borough", "Starting XI": the automatic 4-4-2 XI, with Dorian Dunmore back in the 9th slot.

**Acceptance criteria (embedded UAT)**
```gherkin
Scenario: The XI is kept while Sam looks around
  Given Sam has picked "Kestrel Northcott 6" into the 9th slot of Netherwold Borough's Starting XI at "?seed=31"
  When Sam taps "Back", "Squad", "Back", "Tactics", "4-4-2" (already checked), "Back" and "Starting XI"
  Then the 11 buttons read exactly as before the walk, in the same order, the 9th still "MF Kestrel Northcott 6"

Scenario: Choosing another formation re-picks the automatic XI (this story only; unit and e2e, not protected)
  Given Sam has picked "Kestrel Northcott 6" into the 9th slot of Netherwold Borough's Starting XI
  When Sam taps "Back", "Tactics", "4-3-3", "Back" and "Starting XI"
  Then the buttons read Netherwold Borough's automatic 4-3-3 XI: "GK Tamsin Ingleby 17", the same 4 DF, "MF Ivo Elderkin 18", "MF Joren Dalrymple 16", "MF Calder Redfern 15", "FW Merrick Hartwell 8", "FW Garrick Thistlewood 5", "FW Finlay Fitch-Moreton 5"

Scenario: Every new game starts from the automatic XI
  Given Sam opens a fresh page at "?seed=31" (and, on another try, "?seed=abc")
  When Sam taps "New game", "Netherwold Borough" ("Oakhampton Rise Borough") and "Starting XI"
  Then the buttons read that club's automatic 4-4-2 XI, with no horizontal scroll and no console errors
```

**Outcome KPI:** K3 (below).
**Technical notes (for DESIGN, not AC):** DESIGN question (M5), not a decided test change. Today `ChooseFormation` changes only `formation`, and `tests/acceptance/S-004/tactics-navigation.test.ts` (not protected) asserts whole-state equality with only `formation` changed, building states through a fixture helper. DESIGN picks the XI representation so that S-004's acceptance tests stay green. One option: an XI never changed is derived from squad and formation, not stored, and picks are stored apart and cleared by a formation change. ADR-0007 anticipates "slot index to player index" in state. The `ChooseFormation` guards stay as they are (an unknown id or the same formation returns the same object). `tests/protected/S-004/` must stay green (the Tactics UI is unchanged). Depends on US-2 and S-004.

Notes for DESIGN and DISTILL (not part of the AC):
- "Has focus" means `document.activeElement` is the `<h1>`.
- D11 no-ops and `NewGame` resetting the XI are unit tests on `update`. The no-ops are view-starting-XI off a known club's home, choose-slot off Starting XI or outside 0..10, pick-player off the choose screen, outside 0..17 or of another position, and "Back" with an unknown club.
- The D6 and D8 rules get property tests over many seeds, all 8 clubs and all 3 formations (fast-check honours `FC_SEED`).
- The protected scenarios for D10 pin only the never-changed case (US-1 outline); US-3 scenario 2 is unit and e2e only.
- D12 is a unit check over the name arrays, plus review.
- Adding "Starting XI" to the club home must keep `tests/protected/S-001..S-004` green: they find "Squad", "Tactics" and "Back" by name and do not count club home buttons.

### Wave: DISCUSS / [REF] Outcome KPIs
| # | Who | Does what | By how much (target) | Baseline | Measured by |
|---|---|---|---|---|---|
| K1 | Sam on a 390px phone | Sees a complete XI from the club home | 1 tap ("Starting XI"); 11 of 11 slots filled, 0 duplicates; back home in 1 tap | not possible (no XI) | e2e click counter (as S-003/S-004) |
| K2 | Sam | Changes a starter | 2 taps from "Starting XI" (a slot, a player), 3 from the club home | not possible | e2e click counter |
| K3 | Sam | Keeps a valid XI through the session | 100% of picks kept after the Squad and Tactics visits of US-3 scenario 1; 0 gaps and 0 duplicates after any pick, swap or formation change | not possible | property tests (`ci:test`, fresh `FC_SEED`) and e2e |

Guardrails: S-001..S-004 protected scenarios stay green; no sideways scroll at 390px and 0 console errors on club home, Starting XI and choose screens. Environments as in the DEVOPS environment matrix (`docs/feature/S-004/environments.yaml`): local-preview `http://localhost:4173/gaffer/` (`ci:serve`) for e2e and protected scenarios, and the production Pages URL for the post-deploy smoke, both on Chromium with the Pixel 7 profile at 390px. There is no analytics in the POC; the e2e tap count and the property tests are the only measurements.

### Wave: DISCUSS / [REF] DoD
- `tests/protected/S-005/` passes on main; `tests/protected/S-001/` to `S-004/` still pass.
- Unit and property tests pass for the automatic XI, for pick and swap, for the formation re-pick, and for navigation (including no-ops and the `NewGame` reset). The `ci:*` scripts are green.
- The e2e phone-viewport smoke (local-preview and the post-deploy smoke, per the DEVOPS matrix) covers this path: club home, Starting XI, a slot, a pick, a swap, the choose screen's Back, Back, Squad, Back, Tactics, Back, Starting XI (kept), then a formation change (automatic XI of the new formation). It also checks focus on each new heading.
- The change stays under 1200 changed lines including tests (budget above).
- No ambient randomness or wall-clock time in `src/domain/`.

### Wave: DISCUSS / [REF] Out-of-scope
- Keeping the player's picks through a formation change: the deferred next-story candidate, D15.
- Out-of-position play, condition or fitness affecting selection, a substitutes bench or bench count, captain and set-piece takers.
- Drag and drop, finer roles (LB, CB, ST and so on), and showing the XI or names on the Tactics screen (its "Line-up" list stays codes only).
- Persistence across reloads, opponent selection, a match, a "continue" gate.
- Every OUT tag: `match-2d`, `utility-ai`, `transfers`, `finances`, `training`, `youth`, `staff`, `multiplayer`, `backend`, `real-data`.

### Wave: DISCUSS / [REF] WS strategy
No new walking skeleton (brownfield). This story extends the S-001..S-004 skeleton by one branch from the club home: club home, Starting XI, choose, back. The e2e journey "Starting XI, a slot, a player, Back, Squad, Back, Starting XI" is the end-to-end proof. There are two carpaccio slices in order (`slices/slice-01..02`), both delivered in the one S-005 DELIVER. A pure domain precursor commit (the automatic pick) is allowed inside slice 01, not as a separate slice.

### Wave: DISCUSS / [REF] Driving ports
- Selection rules (pure; shape for DESIGN): the automatic XI from a squad and a formation, and the pick or swap of a squad player into a slot.
- `update(GameState, Action) => GameState` with view-starting-XI, choose-slot, pick-player, `Back` from both new screens, the formation re-pick and the `NewGame` reset. `GameState` holds the XI.
- UI entry, reachable by role and accessible name at `http://localhost:4173/gaffer/`:
  - the button named "Starting XI" on the club home;
  - the Starting XI screen (`<h1>` "Starting XI", list "Starting XI" of 11 buttons, "Back");
  - the choose screen (`<h1>` "Choose GK|DF|MF|FW", list "Players", "Back").

### Wave: DISCUSS / [REF] Pre-requisites
- S-001..S-004 delivered (club home, "Squad", "Tactics", `lineUp`, `GameState.formation`, `focusPlan`).
- ADR-0001..0008 accepted. Expected from DESIGN: ADR-0009, covering:
  - the XI in state: its representation, and when the automatic XI is derived, given that the squad is derived on render and not stored (ADR-0005);
  - the selection rules as pure domain functions;
  - how `ChooseFormation` re-picks without breaking S-004's acceptance tests (US-3 technical notes, M5).
- `docs/product/jobs.yaml` now has J-05 (resolved). Roadmap entry S-005 appended.
- Open item for DESIGN: the visual layout of the 11 slot buttons (a list, or pitch rows like the S-004 line-up) is a DESIGN choice. The list semantics, order and 44px must hold, and nothing may scroll sideways.

### Wave: DISCUSS / [REF] DoR validation
| # | Item | Status | Evidence |
|---|---|---|---|
| 1 | Problem clear, domain language | PASS | US-1: bare codes, and filling 11 slots is a chore; US-2: cannot start the player he rates; US-3: fear of losing picks |
| 2 | Persona specific | PASS | Sam, 34, one-handed on a bus, 390px Android, 5 minutes, has chosen a formation |
| 3 | 3+ domain examples, real data | PASS | Real generator rows for Netherwold Borough (`?seed=31`) and Oakhampton Rise Borough (`?seed=abc`); 3 examples per story (ties at 3 and 5, Northcott for Dunmore, Dalrymple and Elderkin swap, own GK no-op, 4-3-3 re-pick) |
| 4 | UAT Given/When/Then, 3-7 | PASS | US-1 5, US-2 4, US-3 3 scenarios; exact step sequences, one Then each |
| 5 | AC derived from UAT | PASS | Embedded scenarios are the AC: D1-D10 and D13 by scenario; D11 no-ops, D12 names and D14 by unit tests and review (Notes) |
| 6 | Right-sized | PASS | 2 slices in about 2-3 days; 1040 of at most 1200 changed lines including tests; each story 3-5 scenarios |
| 7 | Technical notes | PASS | Labelled per story: squad derived on render (ADR-0005), club index via `findClub`, pure rules with no RNG, focus on screen change (ADR-0008), the S-004 test question for DESIGN |
| 8 | Dependencies tracked | PASS | S-001..S-004 delivered; ADR-0009 expected from DESIGN; D15 deferred candidate; open item listed |
| 9 | Outcome KPI measurable (extra check beyond the 8-item DoR) | PASS | K1 1 tap, K2 2/3 taps, K3 100% kept and 0 gaps or duplicates, by e2e and property tests |

DoR status: PASSED (all 3 stories). Every story has `job_id` J-05 and an Elevator Pitch.

### Wave: DISCUSS / [REF] Peer review
`nw-product-owner-reviewer`, cycle 1: rejected pending revisions. Revision 1 applied; re-review pending.

| Finding | How it landed |
|---|---|
| C1 giant story | Narrowed: the keep-picks rule was cut. A formation change re-picks the automatic XI (D10), and the protected scenarios pin only the never-changed case. Keep-picks is the deferred candidate (D15, Out-of-scope). 2 slices (slice-03 withdrawn). DoD, story map, KPIs (K3 restated) and DoR rewritten |
| C2 fixtures | Real generator rows for Netherwold Borough and Oakhampton Rise Borough. The "illustrative" caveat is removed. ACs state the rules, with these rows as examples. Apostrophes and hyphens in names are handled by D3 |
| H1 formations | All three line-ups are spelled out in the roadmap outcome and D4 |
| H2 line budget | Per-file budget, code plus tests, 1040 of at most 1200 lines (Scope Assessment, DoD) |
| M1 Starting XI Back | "a button named exactly Back (44px or taller)", which returns to the club home with its heading focused (D3, roadmap) |
| M2 separators | "code, one space, name, one space, overall" and "name, one space, overall" plus " Starting" (D3, D7, roadmap) |
| M3/M4/L10 scenarios | Clubs named, exact step sequences, one Then per scenario |
| M5 ChooseFormation | Guards unchanged (D10). The representation is a DESIGN question so that S-004's acceptance tests stay green (US-3 technical notes); no test change is decided |
| L1 club index | Glossary: `league.clubs` position, as `main.ts` `findClub` |
| L2 ADR quote | D4 quotes ADR-0007 exactly |
| L3 name check | D12 covers every array in `names.ts`, including `TOWNS`, against the 9 banned words |
| L4 unwired buttons | Slice 01 renders the slot buttons and slice 02 wires them, both in the one DELIVER |
| L5 terms | Glossary defines squad order, club index, automatic XI, in or not in the XI, and picks; "bench" and "unpicked" are dropped from the ACs |
| L6 | Not restated in the revision brief; no separate change beyond the above |
| L7 journey | Journey steps have preconditions and a row for the choose screen's Back |
| L8 environments | KPIs and DoD reference the DEVOPS environment matrix (`docs/feature/S-004/environments.yaml`) |
| L9 technical notes | Labelled "Technical notes (for DESIGN, not AC)" |
