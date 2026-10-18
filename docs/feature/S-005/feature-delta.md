# S-005: Pick my starting XI

## Wave: DISCUSS

Lean, unattended, revision 1. Reuses `discuss/journey.md` and `slices/slice-01..02`. The outcome is the owner draft for S-005 ("The player fills the 11 slots from the squad by tapping (tap slot, tap player). A suggested XI is pre-filled by best rating per position. Exactly 11 starters with exactly 1 goalkeeper are required to continue."), narrowed by scope.md precedence (ship less). The XI is always full: it starts automatic, and the player can only swap within a position. So "required to continue" needs no gate, and there is nothing to continue to yet (no match). "Exactly 1 goalkeeper" holds by construction: every formation has one GK slot, and only goalkeepers fill it. The XI is kept for the session only ("Save and continue" is its own later story). Keeping the player's picks through a formation change is deferred to a later story; here a formation change re-picks the automatic XI (D10). Feature type: user-facing. UX depth: lightweight. Walking skeleton: no (brownfield, extends S-001..S-004). No DIVERGE artifact (accepted as lean, as for S-002..S-004).

### Wave: DISCUSS / [REF] Scope Assessment
PASS: 3 small user stories with 7 scenarios in total (2, 3, 2; consolidated after review cycle 2), 1 roadmap story and one demonstrable outcome ("my eleven, my picks"), 1 new small context ("Selection": the XI over squad and formation) plus the app navigation. 2 demonstrable carpaccio slices, one release (one DELIVER), about 2-3 days. Under 1200 changed lines including tests (budget below). Integration points: squad (S-002/S-003), formation and `lineUp` (S-004), club home actions, shell focus (ADR-0008): 4, within the limit of 5. No oversized signal: 7 scenarios for the whole roadmap story, and the keep-picks rule is cut (C1).

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
When I have set how my side lines up, I want to choose which players start, so that I field the team I believe in. (Recorded as J-05 `pick-my-starting-eleven` in `docs/product/jobs.yaml`; it follows J-04.) S-005 serves J-05 in part: its "picks that survive a formation change" opportunity and the "losing picks when changing the formation" anxiety are deferred to the D15 candidate; here picks survive every visit except a formation change.

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
- D9 Session memory: the XI is kept in the game state for the rest of the session. After "Back", "Squad" (and a player), "Back", or "Tactics" without choosing another formation (including a tap on the already checked formation), then "Back", it is unchanged. It is not persisted across reloads. "New game" (title screen) starts from the automatic XI again. The XI belongs to the session's one club: today a session holds one club (`ChooseClub` runs only from the pick-club screen and no screen leads back to it), so a later "back to clubs" story must reset or key the XI by club. The protected scenario checks this in a fresh page, not by reloading after picks, so the later "Save and continue" story (scope IN) can restore a saved XI through "Continue" without contradicting a permanent S-005 test (same rationale as S-004 D3).
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
Fixtures are real generator values, produced by running `generateSquad(31, 0)` and `generateSquad(20260, 7)` (names, positions and overalls) on 2026-10-18 at commit `6d73d16`; DISTILL adds a golden unit test pinning these rows before DELIVER starts. `?seed=31`, first club "Netherwold Borough" (club index 0), squad in order (index, position, name, overall):
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
  Given Sam opens a fresh page at "?seed=31" on a 390px-wide viewport, taps "New game" and taps "Netherwold Borough"
  When Sam taps the button named "Starting XI"
  Then the only heading is "Starting XI", it has focus, and the list named "Starting XI" holds exactly 11 items of one button each, reading in order "GK Tamsin Ingleby 17", "DF Bram Pemberly 19", "DF Calder Ashcombe 18", "DF Quill Crossley 4", "DF Quill Yarrow 3", "MF Ivo Elderkin 18", "MF Joren Dalrymple 16", "MF Calder Redfern 15", "MF Dorian Dunmore 7", "FW Merrick Hartwell 8", "FW Garrick Thistlewood 5"

Scenario Outline: An XI never changed follows the formation chosen in Tactics
  Given Sam opens a fresh page at "<seed>", taps "New game" and taps "<club>"
  When Sam taps "Tactics", "<formation>", "Back" and "Starting XI"
  Then the 11 codes are <counts> in that order and the MF and FW buttons read <mf_fw>
  Examples:
    | seed      | club                    | formation | counts             | mf_fw |
    | ?seed=31  | Netherwold Borough      | 4-3-3     | 1 GK, 4 DF, 3 MF, 3 FW | "MF Ivo Elderkin 18", "MF Joren Dalrymple 16", "MF Calder Redfern 15", "FW Merrick Hartwell 8", "FW Garrick Thistlewood 5", "FW Finlay Fitch-Moreton 5" |
    | ?seed=abc | Oakhampton Rise Borough | 4-2-3-1   | 1 GK, 4 DF, 5 MF, 1 FW | "MF Niall Stanhope 20", "MF Alden Underby 17", "MF Tamsin Stanhope 12", "MF Ulric Everleigh 8", "MF Orrin Lockhart 2", "FW Joren Northcott 19" |
```
Checked inside these two scenarios or by the e2e and property tests (consolidated after review cycle 2 to keep the story at 7 scenarios): "Starting XI", each slot button and "Back" are at least 44px tall; "Back" returns to the club home with its heading ("Netherwold Borough") focused; nothing scrolls sideways at 390px and no console error appears; the same `?seed=` in a second fresh page gives the same 11 buttons; for any seed and club the test reads the "Squad" list rows (name, position, overall) and checks that the 11 are different players whose squad position equals the slot code and whose overall equals their row, and that no player of a position missing from the XI has a higher overall than a starter (property, `?seed=abc` 8th club gives "DF Wystan Redfern 14", "DF Ulric O'Garrity 8", "DF Soren Dalrymple 8", "DF Perrin Dunmore 6").

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

Scenario Outline: Picking a player puts him in the tapped slot, swapping with another starter
  Given Sam is on Netherwold Borough's Starting XI at "?seed=31" with its automatic 4-4-2 XI
  When Sam taps "<slot>" and then "<player>"
  Then the only heading is "Starting XI", it has focus, and <result>, with the other buttons unchanged and 11 different players
  Examples:
    | slot               | player                      | result |
    | MF Dorian Dunmore 7 | Kestrel Northcott 6        | the 9th button reads "MF Kestrel Northcott 6" and no button names Dorian Dunmore |
    | MF Ivo Elderkin 18  | Joren Dalrymple 16 Starting | the 6th button reads "MF Joren Dalrymple 16" and the 7th "MF Ivo Elderkin 18" |

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
  When Sam taps "Back", "Squad", the row of "Calder Redfern", "Back", "Back", "Tactics", "4-4-2" (already checked), "Back" and "Starting XI"
  Then the 11 buttons read exactly as before the walk, in the same order, the 9th still "MF Kestrel Northcott 6"

Scenario: Choosing another formation re-picks the automatic XI
  Given Sam has picked "Kestrel Northcott 6" into the 9th slot of Netherwold Borough's Starting XI
  When Sam taps "Back", "Tactics", "4-3-3", "Back" and "Starting XI"
  Then the buttons read Netherwold Borough's automatic 4-3-3 XI: "GK Tamsin Ingleby 17", the same 4 DF, "MF Ivo Elderkin 18", "MF Joren Dalrymple 16", "MF Calder Redfern 15", "FW Merrick Hartwell 8", "FW Garrick Thistlewood 5", "FW Finlay Fitch-Moreton 5"
```
Notes: the formation re-pick scenario is this story's behaviour only (D10); it is covered by unit and e2e tests, not by `tests/protected/S-005/`. "Every new game starts from the automatic XI" is the fresh-page US-1 scenario plus a unit test that `NewGame` resets the XI.

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
- `tests/acceptance/S-004/` assertions stay as they are (binding for DESIGN): fixtures may gain a field, as ADR-0007 allowed for `formation`, but no S-004 assertion is edited or weakened. So choosing a formation with an XI never changed must still change only `formation`.
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
| 4 | UAT Given/When/Then, 3-7 | PASS | 7 for the roadmap story: US-1 2, US-2 3, US-3 2; exact step sequences, one Then each |
| 5 | AC derived from UAT | PASS | Embedded scenarios are the AC: D1-D10 and D13 by scenario; D11 no-ops, D12 names and D14 by unit tests and review (Notes) |
| 6 | Right-sized | PASS (disputed by the reviewer, see Peer review) | 2 slices in about 2-3 days; 1040 of at most 1200 changed lines including tests; 7 scenarios for the roadmap story; one outcome |
| 7 | Technical notes | PASS | Labelled per story: squad derived on render (ADR-0005), club index via `findClub`, pure rules with no RNG, focus on screen change (ADR-0008), the S-004 test question for DESIGN |
| 8 | Dependencies tracked | PASS | S-001..S-004 delivered; ADR-0009 expected from DESIGN; D15 deferred candidate; open item listed |
| 9 | Outcome KPI measurable (extra check beyond the 8-item DoR) | PASS | K1 1 tap, K2 2/3 taps, K3 100% kept and 0 gaps or duplicates, by e2e and property tests |

DoR status: PASSED (all 3 stories). Every story has `job_id` J-05 and an Elevator Pitch.

### Wave: DISCUSS / [REF] Peer review
`nw-product-owner-reviewer`, cycle 1: rejected pending revisions (C1 giant story, C2 fixtures not producible by the generator). Revision 1 applied as below.

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

`nw-product-owner-reviewer`, cycle 2 (final; the two-cycle limit is reached, so no third review): rejected pending revisions on C1 only (12 scenario blocks and, in its reading, three outcomes in one roadmap story); every other cycle-1 finding verified resolved. Folded in after cycle 2 by the plan run:

| Finding | How it landed |
|---|---|
| C1 scenario count | Consolidated to 7 scenarios for the roadmap story (US-1 2, US-2 3, US-3 2): the same-seed, 390px-fit, Back-home and Squad-comparison checks moved into the US-1 note as e2e/property checks; pick and swap became one outline; the New game reset is the fresh-page US-1 scenario plus a unit test. Scope Assessment and DoR 4/6 restated at the story level |
| C1 "three outcomes" | **Disagreement recorded, not resolved.** The plan run reads see / choose / keep as one demonstrable outcome, "my eleven, my picks": an automatic XI alone enables no decision (brief principle 1, "decisions over simulation"), and a pick lost on the next screen is no decision either. The factory plans exactly one story per run, so splitting into new ids is not available here; this is an owner-visible note, not an owner decision |
| H1 overall values | Provenance stated (generator run on 2026-10-18 at `6d73d16`); DISTILL adds a golden unit test pinning the fixture rows |
| M2 S-004 test | DoD makes it binding: S-004 acceptance assertions are not edited; a formation choice with a never-changed XI changes only `formation` |
| M3 J-05 partly served | JTBD one-liner notes the deferred forces (D15) |
| L1 slices | "2 demonstrable slices, one release" |
| L2 Squad comparison | The note says the test reads the "Squad" rows (name, position, overall) |
| L3 Line-up order | The outline states the codes in order; equality with `lineUp` is a unit test |
| L4 title | Test-layer note moved out of the scenario title |
| L5 example vs scenario | US-3 scenario now taps the "Calder Redfern" row, as the example |
| L6 club key | D9 says the XI belongs to the session's one club |
| L7 K3 | Kept; the e2e walk is the user-facing measure alongside the property tests |

## Wave: DESIGN

Mode: propose. Scope: application. One solo team (no Conway constraint). Paradigm: functional core, imperative shell (ADR-0003; recorded in the ADR and the brief, not in CLAUDE.md). New ADR: `adr-0009-starting-xi-selection-and-state.md` (one decision cluster: XI representation, rules placement, screens, button text). It refines ADR-0007's S-005 note: the slot-to-player map is stored only after the first pick. Architecture: `docs/product/architecture/brief.md` ("Starting XI (S-005, ADR-0009)", effect-isolation rows, inventory, C4 L2 descriptions, "For Acceptance Designer" ports 15-18). No new C4 container. Outcomes-registry collision check: skipped, because there is no registry (`docs/product/outcomes/` does not exist).

### Wave: DESIGN / [REF] DDD list
- New small context, "Selection" (supporting), over "League setup" (the squad, by type import from `squad.ts`) and "Tactics" (`lineUp`, `FormationId` from `formation.ts`). Language: Starting XI, Slot, Automatic XI, Pick, Swap, Starter, Squad order.
- Value objects: `StartingXI` (readonly 11 squad indices in slot order); the selection context `{ squad, formation, xi }`. No aggregate, no events, no identity beyond the squad index (frozen order, ADR-0005/0006).
- Invariants by construction: 11 distinct players; each slot's player has the slot's position (D5); the automatic XI is the top n per position by overall, ties in squad order (D6); a pick replaces or swaps, never duplicates (D8). State invariant: an absent `xi` means "never changed", and the effective XI is derived (`currentXI`). A formation change and `NewGame` drop a stored `xi` (D10, D9).

### Wave: DESIGN / [REF] Decisions
| # | Decision | Source |
|---|---|---|
| D1 | XI in state: optional `GameState.xi?: StartingXI \| undefined`, stored only after the first real pick. Absent means never changed; the effective XI is `currentXI(state, squad)` = stored, else `automaticXI(squad, formation)`, derived like the squad (ADR-0005 (d)). `initialState` unchanged. Rejected: required `xi: StartingXI \| null` (vitest `toEqual` treats a `null` key as different from a missing one, so S-004's `initialState` assertion and S-003's literal whole states would fail: forbidden by the DoD); a required key `xi: StartingXI \| undefined` (passes `toEqual`, but every typed `GameState` literal in the S-001..S-003 tests must add `xi: undefined`: same semantics as the chosen option, more edits); an eager XI stored on `ChooseClub` and `ChooseFormation` (stores derived data, and `ChooseFormation` would change more than `formation`); a sparse override map (two sources of truth) | ADR-0009 (1); DISCUSS D9, D10, DoD |
| D2 | XI shape: `readonly number[]`, 11 squad indices in slot order; slot `i` = index `i` of `lineUp(formation)`. Rejected: slot-to-name map (names are not keys); stored `Player`s | ADR-0009 (2); ADR-0007; DISCUSS D4, D11 |
| D3 | Rules in new pure `src/domain/selection.ts`: `isSlotIndex`, `automaticXI(squad, formation)`, `playersForPosition(squad, position)`, `pickForSlot({ squad, formation, xi }, slot, playerIndex) => StartingXI \| undefined` (`undefined` = invalid pick, the same object = own player, else replace or swap). A context object keeps oxlint `max-params` 3. Rejected: rules inline in `update`; an index-only swap in domain with eligibility in app (splits D5/D8 across layers) | ADR-0009 (3); DISCUSS D5, D6, D8 |
| D4 | Formation re-pick and reset: private `withoutPicks(state)` (same state when nothing stored, else `xi: undefined`). `ChooseFormation` returns `{ ...withoutPicks(state), formation }` after its unchanged guards, so a never-changed XI gives exactly `{ ...state, formation }`. `NewGame` keeps its title-only guard and drops a stored XI too. One club per session: `pickClub` is reachable only through `NewGame`, so `xi` is never stale (unit-pinned) | ADR-0009; DISCUSS D9, D10, DoD |
| D5 | Navigation: `Screen` + `startingXI{clubId}`, `choosePlayer{clubId, slot}`; `Action` + `ViewStartingXI` (known club's home), `ChooseSlot{slot}` (startingXI, known club, `isSlotIndex`), `PickPlayer{playerIndex}` (choosePlayer, known club, valid slot; squad from the exported `squadOf(league, clubId)`, shared with `main.ts`; `undefined` = no-op, own player = back to startingXI with no `xi` stored, else back with `xi` set). `Back`: choosePlayer to startingXI, startingXI to clubHome; unknown club or invalid slot = no-op. One helper per action (complexity cap 15). The screen is named `choosePlayer` (it chooses a player for a slot), not `chooseSlot` | ADR-0009; DISCUSS D11 |
| D6 | Focus: `sameScreen` adds startingXI (by `clubId`) and choosePlayer (by `clubId` and `slot`); the switch stays exhaustive (typecheck). Every S-005 navigation changes the screen, so focus goes to the new `<h1>` (ADR-0008); no focus ids | ADR-0008; DISCUSS D3, D7, D8 |
| D7 | UI: club home third `button.primary` "Starting XI" after "Tactics". `ui/screens/starting-xi.ts`: `<h1 id="starting-xi-title" tabindex="-1">`, `<ul role="list" aria-labelledby="starting-xi-title">`, 11 `<li>` with one `button.xi-slot` each, `.back-button`. `ui/screens/choose-player.ts`: `<h1 tabindex="-1">Choose MF</h1>`, `<ul role="list" aria-label="Players">`, one `button.xi-choice` per player, `.back-button`. Layout: one flat stacked list. Rejected: pitch-row chips (about 80px per name at 358px); inline expansion (a same-screen update with focus ids; D7 wants its own heading) | ADR-0009 (4); DISCUSS D1, D3, D7, open item |
| D8 | Button text: inline spans with literal single-space text nodes (code, " ", name, " ", overall; name, " ", overall, then " " and "Starting" for starters), so `textContent` and the accessible name read exactly "MF Ivo Elderkin 18". No flex, grid or float on these buttons or spans (the brief's S-003 inline-flow rule: blockified children drop the space nodes and split `innerText`); `display: block`, full width, `min-height: 48px`, `overflow-wrap: anywhere`. Rejected: grid spans as in squad rows (no spaces in the name); one bare text node (no styling of code or "Starting") | ADR-0009; DISCUSS D3, D7, D13 |
| D9 | `main.ts`: `render` gains a `never`-typed exhaustiveness guard; two render cases derive the squad (`squadOf`), `currentXI`, `lineUp`, `playersForPosition`, and pass plain view props (`{ slots: { position, player }[] }`; `{ position, players: { playerIndex, name, overall, starting }[] }`). A missing player or code throws, as for the player screen | ADR-0009; ADR-0005 (d) |

### Wave: DESIGN / [REF] Component decomposition
| Component | Layer | Responsibility |
|---|---|---|
| `domain/selection.ts` | domain | New: `StartingXI`, `isSlotIndex`, `automaticXI`, `playersForPosition`, `pickForSlot` |
| `app/state.ts` | app | `GameState.xi?`; `Screen` + startingXI, choosePlayer; `Action` + `ViewStartingXI`, `ChooseSlot`, `PickPlayer`; `currentXI`, `squadOf`; private `withoutPicks` used by `ChooseFormation` and `NewGame`; `Back` cases; `sameScreen` cases |
| `ui/screens/starting-xi.ts` | ui | New: `renderStartingXI(root, { slots }, dispatch)` |
| `ui/screens/choose-player.ts` | ui | New: `renderChoosePlayer(root, { position, players }, dispatch)` |
| `ui/screens/club-home.ts` | ui | Third button "Starting XI" in `div.club-actions` |
| `main.ts` | shell | Two render cases deriving view props |
| `ui/styles.css` | ui | `.xi-slot`, `.xi-choice` (block, 48px, inline-flow text, wrap), code and "Starting" span accents, `.starting-xi h1`, `.choose-player h1` size; reuses `.back-button`, `button.primary`, list reset as `.squad-list` |

Indicative code budget: selection 70, state 70, starting-xi 40, choose-player 45, club-home 3, main 30, CSS 35, so about 295 lines (DISCUSS 330). Existing fixtures need 0 lines (D1), so the DISCUSS total of 1040 drops to about 1000 with tests at 710.

### Wave: DESIGN / [REF] Driving ports
- Selection rules (`isSlotIndex`, `automaticXI`, `playersForPosition`, `pickForSlot`), `update(GameState, Action) => GameState` with `ViewStartingXI`, `ChooseSlot`, `PickPlayer`, `Back`, the `ChooseFormation` re-pick and the `NewGame` reset, `currentXI`, and `focusPlan` (extended).
- Browser: "Starting XI" on the club home; the Starting XI screen (`<h1>`, list "Starting XI" of 11 buttons, "Back"); the choose-player screen (`<h1>` "Choose GK|DF|MF|FW", list "Players", "Back"). Detail in the brief, "For Acceptance Designer" ports 15-18.

### Wave: DESIGN / [REF] Driven ports and adapters
None. There is no storage, clock or network: the XI is in memory only, and persistence ("Save and continue") gets its own probe. The environment assumption is that inline spans with single-space text nodes give an accessible name, `textContent` and `innerText` with single spaces on one line, and that long names wrap within 390px. The e2e probes it with exact-name queries, `textContent` and `innerText` equality on an apostrophe name and a hyphenated name, and a scroll-width check. Faults to inject in DISTILL's reference: spans without the space nodes must turn the name and `textContent` checks red; `display: grid` or flex on the button must turn the `innerText` check red (blockified items get line breaks in `innerText`). No external integrations, so no contract tests. Enforcement: oxlint boundaries unchanged (`selection.ts` imports only domain modules); `max-params` 3 respected; the PR guard keeps RNG and `Date` out of `src/domain/`; Stryker covers `selection.ts` (domain glob) and `state.ts` (`currentXI`, `withoutPicks`, new cases) with no config change; the `.focus(` grep unit test covers the new renderers.

### Wave: DESIGN / [REF] Technology choices
No new technology or dependency (ADR-0001, 0002, 0003 apply; all OSS). No newer CSS (`:has()` and so on) is relied on.

### Wave: DESIGN / [REF] Reuse Analysis
| Existing | Action | Contract shape / universe / assertion |
|---|---|---|
| `src/domain/squad.ts` (`Player`, `Position`, `PLAYERS_PER_SQUAD`, `generateSquad`) | REUSE (type import in domain; `generateSquad` called by `update` and `main.ts`) | pure return-only; no change; S-002/S-003 property tests |
| `src/domain/formation.ts` (`lineUp`, `FormationId`) | REUSE unchanged | pure, frozen; S-004 tests |
| `src/domain/selection.ts` | CREATE NEW (no existing alternative: no selection logic exists; `salvage/` has none) | pure return-only; universe = the returned array only; fast-check properties and goldens (ADR-0009 Consequences), freeze-and-compare for no input mutation |
| `src/app/state.ts` (`update`, `isKnownClub`, `isSquadIndex`, `toScreen`, `focusPlan`, `chooseFormation`, `newGame`, `back`) | EXTEND: optional field, two screens, three actions, `currentXI`, `squadOf`, `withoutPicks`, `Back` and `sameScreen` cases | pure return-only. Universe of the returned state: `{ league, screen, formation, xi }`; whole-state `toEqual` with an explicit expected `xi` (or no `xi` key), same-object `toBe` for no-ops, deep-freeze for no mutation |
| `tests/acceptance/S-004/tactics-navigation.test.ts`, `S-003/player-navigation.test.ts`, `S-001`/`S-002` navigation tests | REUSE unchanged (no fixture or assertion edit; D1) | regression guard; must stay green |
| `src/ui/screens/club-home.ts` | EXTEND: third button | bounded-change (root's children); e2e |
| `src/ui/screens/squad.ts` (row markup) | REFERENCE only (not reused: its grid spans have no space nodes, so its name reads without spaces) | n/a |
| `src/ui/screens/starting-xi.ts`, `choose-player.ts` | CREATE NEW (no existing screen) | bounded-change; universe = root's children; never moves focus (grep unit test); e2e |
| `src/ui/dom.ts` `el()` | REUSE (string children become text nodes, used for the single-space separators) | bounded-change; detached nodes only |
| `src/main.ts` (`render`, `findClub`) | EXTEND: two render cases (using `squadOf`), `never` exhaustiveness guard; `findClub` kept for the existing cases | unbounded shell; universe unchanged (reads `location.search` once, writes root and focus); e2e |
| `src/ui/styles.css` | EXTEND: reuse `.back-button`, `button.primary`, tokens; new `.xi-slot`, `.xi-choice` | n/a |
| `tests/e2e/S-001..S-004*.spec.ts`, `tests/protected/S-001..S-004/` | REUSE unchanged (the new button does not collide with "Squad", "Tactics" or "Back") | black-box regression |

### Wave: DESIGN / [REF] Changed Assumptions
- DISCUSS line budget row "Existing acceptance fixtures (only if `GameState` gains a required field), 40": not needed. `xi` is optional (D1), so no existing fixture or assertion changes.
- DISCUSS D11 "a choose-slot variant": named `choosePlayer{clubId, slot}`, after what the screen does; the action that opens it is `ChooseSlot{slot}`. A naming choice, not a behaviour change.
- DISCUSS D8 "tapping the slot's own player changes nothing": the XI and its never-changed status are untouched, and the screen returns to Starting XI (as D8 says, "tapping a player returns to the Starting XI screen"). So `update` returns a new state with only `screen` changed, not the same object.
- US-3 technical note (M5), "one option: ... picks stored apart and cleared by a formation change": adopted as D1/D4, with the stored value being the whole XI (not a partial pick set), so there is one source for the effective XI once changed.
- DISCUSS open item (layout of the 11 slot buttons): a flat stacked list (D7); the Tactics pitch rows stay on the Tactics screen only.
- No change to the roadmap outcome text.

### Wave: DESIGN / [REF] Open questions
- None blocking. Accepted: the Starting XI screen re-renders from the top on return (no scroll restore); with 11 buttons of 48px plus gaps, the 11th slot sits below the fold on short phones (it is reachable by scroll, never sideways).
- Outcome trace: "Starting XI" button 44px: `button.primary` 48px (D7). One heading, focused on arrival and return: every S-005 navigation changes the `Screen` (D6). List "Starting XI" of 11 one-button items in `lineUp` order reading "CODE Name OVERALL": D2, D7, D8. Automatic XI by overall, ties in squad order: D3. Never-changed XI follows the formation: D1 (derived). Choose screen heading, list "Players" in squad order with "Starting" marks: D3 (`playersForPosition`), D7, D8. Replace, swap, own player, Back: D3, D5. Kept for the session: `xi` is state, not screen. Formation re-pick and the `NewGame` reset: D4. No sideways scroll and no console errors: D8 and the e2e.
- Handoff for DISTILL: goldens for `automaticXI` (seed 31 club 0 for all 3 formations; `?seed=abc` = 20260, club 7, 4-4-2 and 4-2-3-1, from DISCUSS); properties per ADR-0009 Consequences (fast-check honours `FC_SEED`); `update` tests per brief port 16, including "`ChooseFormation` with no stored `xi` adds no `xi` key" (`Object.hasOwn`) and "with a stored `xi` it is `undefined`"; `focusPlan` cases per port 17; D12 unit check over every string array in `names.ts` (case-insensitive substrings "back", "squad", "tactics", "starting", "players", "formation", "line-up", "clubs", "choose"); e2e per DISCUSS DoD with exact names (`exact: true`) and `textContent` and `innerText` equality, including an apostrophe name and a hyphenated name; unit tests that `ChooseClub` is a no-op off `pickClub` and that `NewGame` from a title with a stored `xi` drops it. The held-out `.pending` mechanics are as in S-004 DISTILL.

### Wave: DESIGN / [REF] Peer review
`nw-solution-architect-reviewer`, cycle 1: **approved** (0 critical, 0 high, 3 medium, 11 low). Verified: the optional `xi` keeps the S-004 and S-003 `toEqual` assertions green under `exactOptionalPropertyTypes`, and rejecting `null` is correctly reasoned. The goldens match the DISCUSS rows by hand. The `pickForSlot` contract and involution, the no-op rules, the `sameScreen` extension and the enforcement claims are sound. Folded in (approved, so no second cycle):

| Finding | How it landed |
|---|---|
| M1 grid fault not caught by the name or `textContent` probe | Probe adds `innerText` equality and states the mechanism (blockified items get line breaks); grid or flex turns `innerText` red, missing spaces turn name and `textContent` red (ADR-0009 Earned Trust, brief, Driven ports) |
| M2 required-`undefined` variant not evaluated | Option B2 added to ADR-0009 Options 1 and to D1, rejected for fixture churn with the same semantics |
| M3 `render` in `main.ts` not exhaustive | `never`-typed guard required (ADR-0009 Shell, D9, brief) |
| M4 `currentXI` enforcement | Enforcers named: review, `update` unit tests, and the e2e (a direct `xi[slot]` read throws on a never-changed XI) |
| M5 `NewGame` title-only guard | Restated (ADR-0009, D4, brief) |
| M6 `update` shape | Pure return-only; the universe is a separate note |
| M7 renderer closed world | `replaceChildren` is the only write; `.focus(` grep and review; no DOM-diff harness (recorded in ADR-0009) |
| M8 focus on an invalid pick | Stated: never dispatched by the UI; it would be `heading` (ADR-0008 default) |
| M9 single-club invariant | Reachability argument recorded; two unit tests (DISTILL handoff) |
| M10 duplicated club lookup | Exported `squadOf(league, clubId)` shared by `update` and `main.ts` |
| M11 wrong "ADR-0006 rule" citation | Cites the brief's S-003 inline-flow rule |
| M12 Earned Trust wording | The environment assumption and its probe are named in the Earned Trust entry |
| M13 banned-word lists differ | Aligned to DISCUSS D12's nine words (ADR-0009, brief) |
| M14 ADR status Accepted before review | Kept Accepted: the review approved it in cycle 1, and the date is that of approval |

`nw-solution-architect-reviewer`, independent dispatch by the plan run on the final DESIGN (cycle 2): **approved with notes** (0 critical, 0 high, 1 medium, 5 low). Folded in:

| Finding | How it landed |
|---|---|
| Medium: ADR-0007 still states eager storage | ADR-0007's S-005 note now points to ADR-0009 ("amended by ADR-0009"); ADR-0009 says "Amends the S-005 storage note of ADR-0007" |
| Low: unknown club in the render cases | ADR-0009 Shell: throws "Unknown club in game state", as `findClub`; unreachable by the guards |
| Low: goldens for 4-3-3 and 4-2-3-1 | ADR-0009 Consequences: seed 31 club 0 4-3-3 `[0, 7, 3, 6, 2, 9, 12, 8, 17, 14, 16]`; seed 20260 club 7 4-2-3-1 `[1, 5, 2, 6, 7, 12, 9, 10, 8, 11, 17]` (checked against the generator output) |
| Low: inline-block spans not caught | ADR-0009: every span in the slot and choose buttons keeps `display: inline` (CSS review check) |
| Low: budget estimate | Accepted: about 330-350 code plus 710 test lines, still under 1200; DELIVER records the measured count |
| Note: reader rule for `xi` | ADR-0009: readers test `state.xi === undefined`, never `in` or `Object.hasOwn` |

## Wave: DEVOPS

Lean, unattended. All nine decisions pre-answered. No platform change: phone-viewport Chromium in CI and the deployed Pages URL. Owner-locked paths (`.github/`, `factory/`, `scripts/`, `.nwave/`, `CLAUDE.md`, brief/scope, `tests/protected/`, `stryker.config.mjs`) are read-only. Machine-readable environments: `docs/feature/S-005/environments.yaml`. Inherits the S-004 DEVOPS setup (`docs/feature/S-004/environments.yaml`); only the deltas are recorded.

Checklist: ✓ existing infra reused | ✓ K1-K3 mapped to instruments | ✓ rollback defined | ✓ mutation strategy (nightly-delta, inherited; new code inside the mutate globs) | ⊘ new IaC/containers (none) | ⊘ server-side observability (no backend) | ⊘ continuous learning | ⊘ CLAUDE.md edit (already states strategy) | ⊘ `docs/product/kpi-contracts.yaml` (not created by S-001..S-004)

### Wave: DEVOPS / [REF] Environment matrix
| Env | URL | Runner | Purpose |
|---|---|---|---|
| local-dev | `http://localhost:5173/gaffer/` (`pnpm dev`) | dev machine | Iteration |
| local-preview | `http://localhost:4173/gaffer/` (`ci:serve`) | dev, CI, protected runner | Production build under test; unit, property, e2e and `tests/protected/S-001..S-005/` |
| production | `https://<owner>.github.io/gaffer/` | GitHub Pages | Live site; post-deploy smoke via `BASE_URL` |

Unchanged from S-004: no staging (static site, recreate); Chromium, Pixel 7 profile, 390px viewport in local-preview and production. Delta: the XI is derived from the seeded squad and the formation, and stored picks live in memory only (ADR-0009), so every environment gives the same XI for the same `?seed=`. Every S-005 navigation is a screen change, so focus goes to the new `<h1>` (ADR-0008) with no platform-specific focus path. The inline-flow button text (accessible name, `textContent`, `innerText`) is probed in Chromium only; iOS Safari is expected to behave the same but is not probed in CI.

### Wave: DEVOPS / [REF] CI/CD pipeline outline (existing, unchanged)
- `ci` (PR, push to main, dispatch): PR guards, roadmap lint, `ci:lint`, `ci:typecheck`, `ci:test` (fresh `FC_SEED`; the S-005 selection property tests honour it), `ci:build`, `ci:e2e`, protected-scenario no-regression check vs main.
- `deploy` (push to main): `ci:build`, deploy-pages, then `smoke` runs `ci:e2e` against the live URL (includes the new S-005 spec).
- `nightly`: `ci:mutation`; failure opens a `mutation-alarm` issue.
- `ai-review`, `factory-tick`, `watchdog`, `weekly-demo`: factory-owned, untouched.
- S-005 needs no pipeline change: it adds unit, property and e2e specs run by the existing scripts, and no new dependency (ADR-0009: no new technology).
- Local gate: `pnpm run check` mirrors the commit stage. No git hooks (locked paths; CI is the gate).
- Security: no secrets, no runtime deps, no network. Player names and position codes enter the DOM only via `el()`/`textContent` (ADR-0002); a review check, not a scenario. SAST/SCA/SBOM not added (workflows locked; inherited open question).

### Wave: DEVOPS / [REF] Monitoring contracts (DISCUSS KPI/AC to instrument)
E2E instrument is the new `tests/e2e/S-005-starting-xi.spec.ts` (Pixel 7, 390px), run by `ci:e2e` on PR and main and by `smoke` on the live URL after each deploy. "Unit" rows run in `ci:test` (fresh `FC_SEED`). `tests/protected/S-005/` runs on local-preview in `ci` and must pass on main.

| KPI / criterion (DISCUSS) | Instrument | Pass condition |
|---|---|---|
| K1: club home to a complete XI in 1 tap ("Starting XI"); 11 of 11 slots, 0 duplicates; back home in 1 tap | e2e: page-side capture-phase click counter (as S-003/S-004); assert heading "Starting XI", list "Starting XI" has 11 items with one button each, 11 distinct names; count clicks on "Back", heading is the club's name | 1 click in, 11/11 filled, 0 duplicates, 1 click back |
| K2: change a starter in 2 taps from "Starting XI" (a slot, a player), 3 from the club home | e2e: click counter from club home; tap a slot (heading "Choose MF"), tap a non-starter in list "Players"; assert heading "Starting XI" and the slot's exact name changed | 2 clicks from Starting XI, 3 from club home |
| K3: picks kept through the session; 0 gaps, 0 duplicates after any pick, swap or formation change | property (fast-check, `FC_SEED`, many seeds, all 8 clubs, all 3 formations): `automaticXI` 11 distinct indices 0..17 and positions match `lineUp`; `pickForSlot` keeps 11 distinct, positions match, replace changes 1 slot, swap exactly 2, involution, own player same object; e2e: pick, Back, Squad, Back, Tactics, Back, Starting XI shows the pick (US-3 scenario 1); formation change shows the new formation's automatic XI | 100% picks kept; 0 gaps; 0 duplicates |
| Automatic XI order and goldens | unit: seed 31 club 0, 4-4-2 gives `[0, 7, 3, 6, 2, 9, 12, 8, 10, 17, 14]` (and the other formations, `?seed=abc` club 7, per DESIGN handoff); within a position overall non-increasing, ties by squad index | holds |
| Exact button text (environment probe, ADR-0009 Earned Trust) | e2e: exact-name queries (`exact: true`); each slot button's `textContent` and `innerText` equal "CODE Name OVERALL"; apostrophe name ("DF Ulric O'Garrity 8", `?seed=abc`, 8th club) and hyphenated name ("FW Finlay Fitch-Moreton 5", `?seed=31`, 4-3-3); choose rows "Name OVERALL" plus " Starting" for starters | holds |
| Choose screen shape | e2e + protected: one heading "Choose GK\|DF\|MF\|FW", list "Players" of that position in squad order, starters marked "Starting", "Back" returns to Starting XI with no change | holds |
| Focus on each new `<h1>` | e2e: `document.activeElement` is the heading after "Starting XI", a slot, a pick, and each Back; `focusPlan` unit tests (`sameScreen` for `startingXI` by `clubId`, `choosePlayer` by `clubId` and `slot`); `.focus(` grep unit test covers the two new renderers | holds |
| Formation re-pick and `NewGame` reset | unit on `update`: `ChooseFormation` with no stored `xi` adds no `xi` key (`Object.hasOwn`), with a stored `xi` it is `undefined`; `NewGame` from a title with a stored `xi` drops it; e2e: formation change gives the new automatic XI | holds |
| D11 no-ops and single-club invariant | vitest on `update`: `ViewStartingXI`, `ChooseSlot`, `PickPlayer` off their screens, unknown club, invalid slot or index (-1, 18, 1.5, NaN; slot -1, 11, 1.5), wrong position: same object; `ChooseClub` no-op off `pickClub`; deep-freeze, no mutation | holds |
| 44px tap targets | e2e: `boundingBox().height >= 44` on "Starting XI" (club home), each slot, each choice, "Back"; S-004 club-home regression spec checks every club home button | holds |
| No horizontal scroll at 390px | `scrollWidth <= clientWidth` on club home, Starting XI and choose screens | holds |
| No console errors | `page.on("console"/"pageerror")` across the DoD journey (club home, Starting XI, slot, pick, swap, choose Back, Back, Squad, Back, Tactics, Back, Starting XI, formation change) | zero |
| S-001..S-004 unchanged | existing e2e specs, acceptance tests (no fixture or assertion edit) and `tests/protected/S-001..S-004/` | green |
| Domain test strength | Stryker on `src/domain/**` (covers `selection.ts`) and `src/app/state.ts` (covers `currentXI`, `squadOf`, `withoutPicks`, new `update` cases, `sameScreen`) | nightly, at or above break threshold (70) |

No analytics (POC). The e2e tap count and the property tests are the KPIs' sole measurements.

### Wave: DEVOPS / [REF] Deployment strategy and rollback
- Strategy: recreate. Merge to main triggers `deploy`, replacing the whole static artifact. Idempotent: redeploying the same ref yields the same artifact.
- Rollback (designed first): revert the S-005 squash commit on main; the merge triggers `deploy` and `smoke` validates the restored site. Alternative: `workflow_dispatch` of `deploy.yml` on a known-good ref (the commit before the S-005 squash). Fallback: fix-forward on a `claude/*` branch. As in S-003/S-004, the append-only protected-tests and no-regression guards may block a plain revert of a squash that added `tests/protected/S-005/`; if so, the dispatch route is the owner action. Time to restore: one deploy cycle (about 5 minutes).
- Failure detection: a red `smoke` job marks the deploy run red.
- Data: nothing is persisted (the XI is in memory; a reload starts from the automatic XI), so no migration and no user data at risk. Rolling back removes the "Starting XI" button and its two screens only; the optional `xi` field never reaches storage.
- Blast radius: one static page.

### Wave: DEVOPS / [REF] Mutation testing strategy
nightly-delta, inherited from `CLAUDE.md`; `/nw-deliver` Phase 5 skipped. `stryker.config.mjs` mutates `src/domain/**/*.ts` except `names.ts`, plus `src/app/state.ts`; thresholds high 85, low 70, break 70. Glob check:
- `src/domain/selection.ts` (new): matches `src/domain/**/*.ts`, not excluded. Tests that kill mutants must pin the goldens, the tie order (squad index ascending), the `isSlotIndex` and player-index bounds (-1, 0, 10, 11, 17, 18, 1.5, NaN), the wrong-position `undefined`, replace versus swap, and the same-reference own-player return.
- `src/app/state.ts` (`xi?`, `currentXI`, `squadOf`, private `withoutPicks`, `ViewStartingXI`, `ChooseSlot`, `PickPlayer`, `Back` from both screens, `sameScreen` cases): already listed. The whole-state `toEqual`, `Object.hasOwn` (no `xi` key added), same-object `toBe` for no-ops and the `focusPlan` screen-pair tests carry it.
- UI renderers and `main.ts` are outside the globs (as before); the e2e covers them.
- No `stryker.config.mjs` change needed. Run by `nightly.yml` via `ci:mutation`; failure opens `mutation-alarm`, `needs-human`.

### Wave: DEVOPS / [REF] Observability stack
Browser console plus Playwright smoke on the deployed URL only. No RUM, error tracking, logs or tracing. SLO: smoke green per deploy. Alerting: a red `deploy` run. No dashboards.

### Wave: DEVOPS / [REF] Branching strategy
Trunk-based. Short-lived `claude/S-005-*` branches, PR to main, squash merge. CI green and protected scenarios not regressing. Deploy fires on merge. No release branches.

### Wave: DEVOPS / [REF] Coexistence matrix
| Component | S-005 impact | Action |
|---|---|---|
| `ci.yml`, `deploy.yml`, `nightly.yml` | none; run existing `ci:*` scripts | reuse |
| `ci:*` scripts, `playwright.config.ts` | none; Pixel 7, 390px, `BASE_URL` already fit | reuse |
| `stryker.config.mjs` | `src/domain/**` covers `selection.ts`; `src/app/state.ts` covers the new state code; no change needed | none |
| `tests/protected/S-001..S-004/` | club home gains a third button "Starting XI" (no name collision with "Squad", "Tactics", "Back"; Playwright substring match checked); they do not count club home buttons | must stay green |
| `tests/protected/S-005/` | locked scenario for this story | must pass on main |
| `tests/acceptance/S-001..S-004/` | none: `xi` is optional and absent until the first pick, so `initialState` and the literal whole states still `toEqual` (DESIGN D1); no fixture or assertion edit | reuse unchanged, must stay green |
| `tests/e2e/S-004-club-home-regression.spec.ts` | checks every club home button is 44px or taller: the new `button.primary` is 48px | reuse unchanged |
| `tests/e2e/S-001..S-004*.spec.ts`, `shell.spec.ts` | focus on `<h1>` after navigation still holds (ADR-0008) | reuse unchanged, regression-watch |
| `tests/e2e/S-005-starting-xi.spec.ts`, `tests/acceptance/S-005/` | new specs | add (DISTILL) |
| `src/domain/selection.ts`, `src/ui/screens/starting-xi.ts`, `src/ui/screens/choose-player.ts` | new | S-005 tests guard |
| `src/app/state.ts`, `src/ui/screens/club-home.ts`, `src/main.ts`, `src/ui/styles.css` | extended | S-001..S-004 tests guard |
| Pages artifact | grows slightly; base path `/gaffer/` unchanged | none |

### Wave: DEVOPS / [REF] Pre-requisites
- S-004 delivered and deployed; GitHub Pages source "GitHub Actions" enabled (✓).
- Node 22 or later, pnpm 10.12.4 pinned, Playwright chromium via `.github/actions/setup`.
- ADR-0001..0009 accepted (✓; ADR-0009 landed in DESIGN, before DELIVER).
- `BASE_URL` derived from repository owner and name (no secret).

### Wave: DEVOPS / [REF] Open questions
Owner-only items inherited from S-001..S-004 (smoke `sleep 20`, no security scanning, smoke has no commit-SHA check, deploy not gated on `ci`, squash revert possibly blocked by the append-only guards, no uptime probe) are unchanged and none block S-005. New:
1. No `.github/` or `stryker.config.mjs` change is needed for S-005 (`selection.ts` and the `state.ts` changes are inside the existing `mutate` globs).
2. Smoke on the live URL runs the S-005 e2e spec too; its goldens and names rely on `?seed=` being honoured on Pages (same as S-001..S-004).

## Plan run: protected scenarios

`tests/protected/S-005/starting-xi.spec.ts`, 5 black-box scenarios (Pixel 7, 390px; roles, accessible names and visible text only). Expected XIs are computed from the "Squad" list of the same seed (per position, highest overall first, ties in squad order), so they hold for any generated squad and pin no generator values:
1. "Starting XI" (44px) opens one focused heading "Starting XI" and a list "Starting XI" of 11 one-button items reading "CODE Name OVERALL", equal to the automatic 4-4-2 XI (`?seed=31`, 1st club); slots 44px; no sideways scroll; "Back" (44px) returns to the club home with its heading focused; no console errors.
2. An XI never changed follows the formation: `?seed=abc`, 8th club, 4-2-3-1, 4-3-3 and 4-4-2 each give the automatic XI of that formation.
3. Each position's slot opens "Choose GK|DF|MF|FW" (focused) with a list "Players" of that position's squad players in squad order, "Starting" exactly on the starters (as many as the formation's slots), 44px buttons; "Back" leaves the XI unchanged (`?seed=7`, 3rd club).
4. Replace (a non-starter into the last MF slot), swap (the second MF starter into the first MF slot) and the slot's own player (no change); always 11 different squad players with matching position and overall.
5. A picked XI is kept after "Back", "Squad", "Back", "Tactics" (no change), "Back"; a fresh page and "New game" give the automatic XI again.

D10's "a formation change drops picks" is deliberately not pinned (DISCUSS D10, D15). All 5 fail on the current app (no "Starting XI" button). The plan run checked that they are achievable: against a throwaway prototype of the DESIGN (not committed), all 23 protected scenarios S-001..S-005 passed.
