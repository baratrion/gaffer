# S-005: Pick my starting XI

## Wave: DISCUSS

Lean, unattended. Reuses `discuss/journey.md` and `slices/slice-01..03`. The outcome is the owner draft for S-005 ("The player fills the 11 slots from the squad by tapping (tap slot, tap player). A suggested XI is pre-filled by best rating per position. Exactly 11 starters with exactly 1 goalkeeper are required to continue."), narrowed by scope.md precedence (ship less): the XI is always full (automatic, then swaps within a position), so "required to continue" needs no gate and there is nothing to continue to yet (no match); "exactly 1 goalkeeper" holds by construction (every formation has one GK slot and only goalkeepers fill it). Kept for the session only ("Save and continue" is its own later story). Feature type: user-facing. UX depth: lightweight. Walking skeleton: no (brownfield, extends S-001..S-004). No DIVERGE artifact (accepted as lean, as for S-002..S-004).

### Wave: DISCUSS / [REF] Scope Assessment
PASS: 3 user stories, 1 roadmap story, 1 new small context ("Selection": the XI over squad and formation) plus the app navigation, 3 releasable carpaccio slices of about 1 day each, about 450 changed lines and 3 days in total. Integration points: squad (S-002/S-003), formation and `lineUp` (S-004), club home actions, shell focus (ADR-0008): 4, under the 5 limit. No oversized signal (2+ needed): no story above 5 scenarios, 2 contexts touched beyond navigation.

### Wave: DISCUSS / [REF] Persona
Sam, 34, a lapsed Championship Manager fan. Plays on the bus, one-handed, on a mid-range Android phone at 390px wide, with 5 minutes to spare (persona from `docs/feature/S-001/feature-delta.md`; player from brief.md). Has looked at the squad and its players and chosen a formation; now wants names in the 11 slots, a sensible XI without filling 11 slots by hand, and the final say on who starts.

### Wave: DISCUSS / [REF] JTBD one-liner
When I have set how my side lines up, I want to choose which players start, so that I field the team I believe in. (Recorded as J-05 `pick-my-starting-eleven` in `docs/product/jobs.yaml`; it follows J-04.)

### Wave: DISCUSS / [REF] Locked decisions
- D1 Entry: the club home gains a button named exactly "Starting XI" (44px or taller), stacked after "Squad" and "Tactics" (same `club-actions` stack as S-004). The club home `<h1>` is still the club's name; "Squad" and "Tactics" are unchanged.
- D2 Own screen: the XI lives on its own screen. The Tactics screen and its "Line-up" list stay exactly as S-004 shipped (each item exactly its code, no names), because S-004's protected scenarios pin them. The XI is not shown on the Tactics screen.
- D3 Starting XI screen: exactly one `<h1>` "Starting XI", focused on arrival (and on every return to it). A list named "Starting XI" holds exactly 11 items, each holding exactly one button (44px or taller) whose text reads the slot's position code, one space, the player's name, one space, the player's overall (1-20), for example "MF Tom Barrow 14"; the overall is the only number (names have no digits, S-002). A button named exactly "Back" (44px or taller) returns to the club home (heading the club's name). The list's name and the heading share the text "Starting XI"; there is still one heading.
- D4 Slots: a slot is its index 0..10 in `lineUp(formation)` (ADR-0007: "S-005 treats a slot as its index in lineUp(formation)"). Slot `i` reads the code `lineUp(formation)[i]`, so the 11 codes equal the Tactics "Line-up" list in the same order (4-4-2: GK, 4 DF, 4 MF, 2 FW; 4-3-3: 1/4/3/3; 4-2-3-1: 1/4/5/1).
- D5 Eligibility: a slot with code P only ever holds a squad player whose squad position is P (no out-of-position play; scope narrowest). The XI always holds 11 different players of the club's squad, each with the same name and overall as in the "Squad" list. The squad quota 2/6/6/4 covers every formation (at most 1 GK, 4 DF, 5 MF, 3 FW), so no slot is ever empty.
- D6 Automatic XI: in a new game, for each position the formation's n slots of that position hold the n players of that position with the highest overall, listed from highest to lowest overall, ties in squad order (the "Squad" list order). Equivalently: no unpicked player of a position has a higher overall than a starter of that position. It is derived from the generated squad only, with no RNG draw of its own, so the same `?seed=` always gives the same XI and `?seed=abc` gives the default seed's XI.
- D7 Choose screen: tapping a slot opens a screen with exactly one `<h1>` "Choose GK", "Choose DF", "Choose MF" or "Choose FW" (the slot's code), focused on arrival, and a list named "Players" holding one button (44px or taller) per squad player of that position (2 GK, 6 DF, 6 MF or 4 FW), in squad order, each reading the player's name, one space, the overall; the button of each player currently in the XI also reads "Starting" after the overall (for example "Tom Barrow 14 Starting"), so exactly as many read "Starting" as the formation has slots of that position (the tapped slot's own player included). No age, attributes or condition on this screen. A button named exactly "Back" (44px or taller) returns to the Starting XI screen with the XI unchanged.
- D8 Picking: tapping a player returns to the Starting XI screen (heading focused, as for any screen change, ADR-0008) with that player in the tapped slot. A player not in the XI replaces the slot's player, who leaves the XI. A player already in another slot (of the same position, by D5) swaps with the slot's player. Tapping the slot's own player changes nothing. No confirm or save button.
- D9 Session memory: the XI is kept in the game state for the rest of the session; after "Back", "Squad" (and a player), "Back", "Tactics", "Back" it is unchanged. Not persisted across reloads. "New game" (title screen) starts from the automatic XI again; the protected scenario checks this in a fresh page, not by reloading after picks, so the later "Save and continue" story (scope IN) can restore a saved XI through "Continue" without contradicting a permanent S-005 test (same rationale as S-004 D3).
- D10 Formation change: choosing another formation in Tactics updates the XI at once to the new line-up: in each position the players already starting keep their order (slot order) and the first of them stay in as far as the new formation has room for that position (the last ones drop out); each extra slot takes the highest-rated unpicked player of that position (ties in squad order), extras in that order after the kept players. Choosing the formation already chosen leaves the XI unchanged. Consequence (an invariant DISTILL can test): an XI Sam never changed is always the automatic XI of the current formation, whatever formation changes happened.
- D11 Navigation (names and shapes for DESIGN, ADR-0003): `Screen` gains a starting-XI variant (club id) and a choose-slot variant (club id, slot index); `Action` gains view-starting-XI (valid only from a known club's home), choose-slot (only on the Starting XI screen, slot an integer 0..10) and pick-player (only on the choose screen, a squad index 0..17 of a player whose position equals the slot's code). "Back" goes choose-slot to Starting XI, Starting XI to club home. Wrong-screen actions and invalid slots or players are no-ops, as before. `GameState` gains the XI (representation for DESIGN).
- D12 Accessible names: no new accessible name contains "Squad", "Tactics", "Back" (except the two "Back" buttons), "Line-up", "Formation" or "Clubs". The frozen name and club-suffix pools in `src/domain/names.ts` contain none of these words (checked case-insensitively, as Playwright's default name match is), nor "Starting" or "Players", so player and slot buttons cannot collide with them. "Starting XI" is a new name; "Choose GK/DF/MF/FW" headings live on their own screen, not on "Choose your club".
- D13 Phone first: no horizontal scroll at 390px (long names wrap inside the button), no console errors, generated text through `el()`/`textContent` only (ADR-0002). Renderers never move focus (ADR-0008).
- D14 Selection changes nothing else yet: no condition or fitness effect on selection or on the automatic XI, no substitutes bench or bench count, no captain, no match, no persistence; the squad, ratings, attributes, condition and formations are unchanged.
- UX depth: no mockups beyond the journey table.

### Wave: DISCUSS / [REF] Story map and priority
Backbone: pick club, club home, squad, player, tactics, **starting XI** (see, choose, keep), (next: match, table). Walking skeleton = the existing S-001..S-004 path plus one branch from the club home (club home, Starting XI, choose, back). One release, three thin slices in order:
1. `slices/slice-01-see-automatic-xi.md` (US-1): the club home button, the Starting XI screen and the automatic XI. Value 4 x urgency 4 / effort 2 = 8. First: it is the end-to-end proof that squad and formation combine, and alone already answers "who plays?".
2. `slices/slice-02-swap-player-in-slot.md` (US-2): the choose screen, pick and swap. 5 x 4 / 2 = 10, but depends on slice 01. It turns a suggestion into Sam's decision, the job's core.
3. `slices/slice-03-xi-follows-formation.md` (US-3): session memory with picks and the formation-change rule. 4 x 3 / 2 = 6. Last: it is only observable once picks exist; it guards the job's anxiety (losing picks).
Priority rationale: "pick team" is the first step of the brief's five-minute loop "pick team, play match, see table"; with S-004 it completes that step and gives the match stories a side to play. Slices are ordered by dependency, then by outcome value; each is releasable (green tree, visible increment); the roadmap outcome and `tests/protected/S-005/` are complete only after slice 03.

### Wave: DISCUSS / [REF] User stories
Names and ratings in the examples are illustrative: the generated squad depends on the seed, so DISTILL pins the real values through the "Squad" list of the same seed and club (as in S-003/S-004, clubs are named by ordinal).

#### US-1: See my best eleven at once
**Problem:** Sam has chosen a formation, but its 11 slots are bare codes. Filling 11 slots by hand from 18 players on a bus is a chore, and without names in the slots there is no team to send out.
**job_id:** J-05
**Elevator Pitch**
- Before: the club home offers "Squad" and "Tactics"; "Line-up" is 11 codes and nobody is picked to start.
- After: on the club home Sam taps "Starting XI" and sees the heading "Starting XI" and 11 buttons such as "GK Ray Dunmore 15", "DF Ali Marsh 13", ..., "MF Tom Barrow 14", ..., "FW Lee Sands 16".
- Decision enabled: is the suggested eleven the side I want, or who should I change?

**Domain examples**
1. Sam opens `?seed=31`, taps "New game", picks the first club (4-4-2) and taps "Starting XI": GK Ray Dunmore 15 (the better of 2 keepers), 4 DF, then MF Tom Barrow 14, Ian Cole 13, Sid Webb 12, Ned Pike 11 (Joe Hale 10 and a 9 not starting), then 2 FW, highest first in each position.
2. Two defenders both rated 12 compete for the 4th DF slot: the one earlier in the "Squad" list starts and is listed first.
3. Sam opens `?seed=abc` (invalid, default seed), picks the 8th club, chooses "4-2-3-1" in Tactics, then taps "Starting XI": GK, 4 DF, the 5 best midfielders, the 1 best forward; on a second fresh visit with `?seed=abc` the XI is identical.

**Acceptance criteria (embedded UAT)**
- Scenario: A new game shows the best eleven at once.
  Given Sam has started a new game with `?seed=31` and is on the first club's home with formation 4-4-2, when Sam taps the button named "Starting XI", then the only heading is "Starting XI" and it has focus, and the list named "Starting XI" holds exactly 11 items, each holding exactly one button whose text reads a code, a name and an overall (1-20, the only number), with codes GK, DF, DF, DF, DF, MF, MF, MF, MF, FW, FW in that order.
- Scenario: The eleven are the club's best players, each in his own position.
  Given Sam is on the first club's "Starting XI" at `?seed=31`, when Sam compares it with that club's "Squad" list, then the 11 are different squad players, each one's squad position equals the slot's code and his overall equals the "Squad" list, no player missing from the XI has a higher overall than a starter of his position, and the starters of each position are listed from highest to lowest overall, ties in squad order.
- Scenario: The eleven fit the formation chosen in Tactics, for the same seed every time.
  Given Sam opens `?seed=abc` and is on the 8th club's home, when Sam chooses "4-3-3" (and, in turn, "4-2-3-1") in Tactics and taps "Back" and "Starting XI", then the codes read 1 GK, 4 DF, 3 MF, 3 FW (1 GK, 4 DF, 5 MF, 1 FW) in the same order as the "Line-up" list, the starters are the best-rated of each position, and a second fresh visit with `?seed=abc` shows the same XI.
- Scenario: The Starting XI screen fits a phone and leads back home.
  Given Sam is on a 390px-wide phone viewport on a club's home, when Sam taps "Starting XI" and then "Back", then "Starting XI", each slot button and "Back" are at least 44px tall, the heading after "Back" is the club's name, neither screen scrolls sideways, and no errors appear in the browser console.

**Outcome KPI:** Sam sees a complete, sensible XI 1 tap from the club home ("Starting XI") and is back in 1 ("Back") (e2e tap count). Baseline: not possible (no XI).
**Technical notes:** the squad is derived on render (`generateSquad(league.seed, clubIndex)`, ADR-0005), not stored in `GameState`; the automatic pick is a pure function of the squad and `lineUp(formation)`, no RNG, no `Date`. Club home layout from S-004 (`div.club-actions`, ADR-0007). Focus on the `<h1>` on a screen change (ADR-0008). Depends on S-002, S-003 (derived overall), S-004.

#### US-2: Put the player I believe in into a slot
**Problem:** the automatic XI picks by overall only. Sam rates a player the number does not show (he read his attributes in S-003), and today cannot start him.
**job_id:** J-05
**Elevator Pitch**
- Before: the XI is the game's best-rated eleven and Sam cannot change a name.
- After: on "Starting XI" Sam taps "MF Ned Pike 11", sees "Choose MF" with 6 midfielders ("Tom Barrow 14 Starting", ..., "Joe Hale 10"), taps "Joe Hale 10", and the slot reads "MF Joe Hale 10".
- Decision enabled: who starts in this position, the higher number or my man?

**Domain examples**
1. `?seed=31`, first club, 4-4-2: Sam taps the 4th MF slot "MF Ned Pike 11"; "Choose MF" lists the 6 midfielders in squad order, 4 reading "Starting"; Sam taps "Joe Hale 10": back on "Starting XI", the 4th MF slot reads "MF Joe Hale 10" and Ned Pike is not in the XI.
2. Then Sam taps the 1st MF slot "MF Tom Barrow 14" and taps "Joe Hale 10 Starting": the 1st MF slot reads "MF Joe Hale 10" and the 4th "MF Tom Barrow 14" (a swap); 11 different players.
3. Sam taps the GK slot "GK Ray Dunmore 15": "Choose GK" lists 2 goalkeepers, only Ray Dunmore reads "Starting"; Sam taps "Ray Dunmore 15 Starting" (his own player): nothing changes. Sam taps the 1st FW slot, then "Back": "Starting XI" unchanged.

**Acceptance criteria (embedded UAT)**
- Scenario: Tapping a slot lists the players of that position.
  Given Sam is on the first club's "Starting XI" at `?seed=31` with 4-4-2, when Sam taps the 4th MF slot, then the only heading is "Choose MF" and it has focus, the list named "Players" holds exactly 6 buttons, the club's midfielders in squad order, each reading name then overall, and exactly 4 of them also read "Starting" (the 4 in the XI).
- Scenario: Picking a player who is not starting fills the tapped slot.
  Given Sam is on "Choose MF" opened from the 4th MF slot, when Sam taps a midfielder who does not read "Starting", then the only heading is "Starting XI" and it has focus, the 4th MF slot reads "MF", his name and overall, the slot's previous player is not in the XI, and the XI holds 11 different players.
- Scenario: Picking a starter from another slot swaps the two.
  Given the 1st MF slot holds Tom Barrow and the 4th holds Joe Hale, when Sam taps the 1st MF slot and then "Joe Hale 10 Starting", then the 1st MF slot reads "MF Joe Hale 10", the 4th reads "MF Tom Barrow 14", and every other slot is unchanged.
- Scenario: The slot's own player or Back changes nothing.
  Given Sam is on "Choose GK" opened from the GK slot (2 buttons, 1 reading "Starting"), when Sam taps the goalkeeper reading "Starting" (and, on another try, the button named "Back"), then "Starting XI" is shown with its heading focused and all 11 slots unchanged.
- Scenario: Every position can be chosen on a phone.
  Given Sam is on a 390px-wide viewport at 4-4-2, when Sam opens a GK, a DF, an MF and an FW slot in turn, then the lists hold 2, 6, 6 and 4 players with 1, 4, 4 and 2 reading "Starting", every player button and "Back" are at least 44px tall, no screen scrolls sideways, and no errors appear in the browser console.

**Outcome KPI:** Sam changes a starter in 2 taps from "Starting XI" (a slot, a player) and 3 from the club home (e2e tap count). Baseline: not possible.
**Technical notes:** a "swap" keeps D5 by construction (same position). Pick and swap are pure rules on the XI (unit and property tests). The choose screen is a new `Screen` variant, so returning to "Starting XI" is a screen change and focuses the `<h1>` (no same-screen focus id needed, ADR-0008). Depends on US-1.

#### US-3: Keep my picks through the session and a formation change
**Problem:** Sam fears losing the picks: leaving the screen or trying 4-3-3 for a moment must not throw his XI away or leave a gap.
**job_id:** J-05
**Elevator Pitch**
- Before: picks would only be as good as the visit; a formation change would mean picking again from scratch.
- After: Sam picks Joe Hale, taps "Back", "Tactics", "4-3-3", "Back", "Starting XI" and sees 3 MF slots still reading "MF Joe Hale 10", "MF Ian Cole 13", "MF Sid Webb 12", and 3 FW slots, the third filled by the best forward not yet starting.
- Decision enabled: which shape suits the eleven I believe in, without losing the eleven?

**Domain examples**
1. `?seed=31`, first club, 4-4-2, MF slots Joe Hale, Ian Cole, Sid Webb, Tom Barrow (after US-2 examples): Sam chooses "4-3-3": MF slots read Hale, Cole, Webb (Barrow drops out); FW slots read the 2 forwards already starting, in order, then the best-rated unpicked forward.
2. Sam then chooses "4-4-2" again: the 4th MF slot takes the best-rated unpicked midfielder (Tom Barrow 14), and the FW slots keep the first 2 forwards.
3. From 4-3-3 Sam chooses "4-2-3-1": the 3 MF stay, the 2 extra MF slots take the two best-rated unpicked midfielders, best first; only the first FW stays. In a fresh visit with `?seed=31` and "New game", the automatic XI is back.

**Acceptance criteria (embedded UAT)**
- Scenario: The XI is kept while Sam looks around.
  Given Sam has changed a starter on "Starting XI", when Sam taps "Back", "Squad", a player, "Back", "Back", "Tactics", "Back" and "Starting XI", then the 11 slot buttons read exactly as before, in the same order.
- Scenario: A formation with fewer slots in a position keeps the first picks.
  Given Sam's 4-4-2 XI reads Joe Hale, Ian Cole, Sid Webb and Tom Barrow in its MF slots, when Sam chooses "4-3-3" in Tactics and opens "Starting XI", then the codes read 1 GK, 4 DF, 3 MF, 3 FW, the MF slots read Joe Hale, Ian Cole, Sid Webb, Tom Barrow is not in the XI, the GK and DF slots are unchanged, and the FW slots read the 2 forwards already starting, in their order, then the best-rated forward not starting.
- Scenario: A formation with more slots in a position fills them with the best players not starting.
  Given Sam's XI is in 4-3-3 with picks, when Sam chooses "4-2-3-1" (and, on another try, "4-4-2"), then the MF starters stay in their order and the extra MF slots take the best-rated midfielders not starting, best first (ties in squad order), only the first FW (the first 2 FW) stays, and the XI holds 11 different players of matching positions.
- Scenario: Choosing the same formation changes nothing.
  Given Sam's XI has picks and 4-4-2 is chosen, when Sam taps "4-4-2" in Tactics and opens "Starting XI", then all 11 slots are unchanged.
- Scenario: Every new game starts from the automatic XI.
  Given Sam opens the game fresh (with `?seed=31`, and again with `?seed=abc`), when Sam taps "New game", picks a club and taps "Starting XI", then the XI is the automatic XI of 4-4-2 for that seed and club (D6), the same on every fresh visit; no horizontal scroll and no console errors.

**Outcome KPI:** after a formation change, 0 of Sam's picks are lost while the new formation has room for them, and the XI never has a gap or a duplicate (property tests over all 6 formation changes; e2e for 4-4-2 to 4-3-3 and back). Baseline: not possible.
**Technical notes:** S-004's `ChooseFormation` today changes only `formation`, and `tests/acceptance/S-004/tactics-navigation.test.ts` (not protected) asserts whole-state equality with only `formation` changed; DESIGN decides whether the XI is stored so that a formation change derives the new XI (no extra state change) or `ChooseFormation` also updates the XI (then that non-protected test is changed with the reason recorded). `tests/protected/S-004/` must stay green either way (Tactics UI unchanged). Depends on US-2 and S-004.

Notes for DESIGN and DISTILL (not part of the AC): slot buttons are found by role `button` inside the list named "Starting XI", player buttons inside the list named "Players"; "has focus" means `document.activeElement` is the `<h1>`. "Squad order" is the "Squad" list order (S-002: GK, DF, MF, FW, then generation order). D11 no-ops (view-starting-XI off a known club's home, choose-slot off Starting XI or outside 0..10, pick-player off the choose screen, outside 0..17 or of another position, "Back" with an unknown club) and `NewGame` resetting the XI are unit tests on `update`. D6/D8/D10 rules get property tests over many seeds, all 8 clubs and all formations (fast-check honours `FC_SEED`). D12 is a unit check over the name pools plus review. Adding "Starting XI" to the club home must keep `tests/protected/S-001..S-004` green (they find "Squad", "Tactics" and "Back" by name and do not count club home buttons).

### Wave: DISCUSS / [REF] Outcome KPIs
| # | Who | Does what | By how much (target) | Baseline | Measured by |
|---|---|---|---|---|---|
| K1 | Sam on a 390px phone | Sees a complete XI from the club home | 1 tap ("Starting XI"); 11 of 11 slots filled, 0 duplicates | not possible (no XI) | e2e click counter (as S-003/S-004) |
| K2 | Sam | Changes a starter | 2 taps from "Starting XI", 3 from the club home; back home in 1 | not possible | e2e click counter |
| K3 | Sam | Keeps picks through navigation and a formation change | 100% of picks kept after Squad/Tactics visits; 0 picks lost where the new formation has room; 0 gaps or duplicates over all 6 formation changes | not possible | property tests (`ci:test`, fresh `FC_SEED`) and e2e |
Guardrails: S-001..S-004 protected scenarios stay green; no sideways scroll at 390px and 0 console errors on club home, Starting XI and choose screens. No analytics in the POC; the e2e tap count and property tests are the sole measurement.

### Wave: DISCUSS / [REF] DoD
- `tests/protected/S-005/` passes on main; `tests/protected/S-001/` to `S-004/` still pass.
- Unit and property tests for the automatic XI, pick/swap and the formation-change rule, and for navigation (including no-ops and the `NewGame` reset) pass. The `ci:*` scripts are green.
- The e2e phone-viewport smoke covers club home, Starting XI, a slot, a pick, a swap, Back, Tactics and a formation change, Squad, Back, Starting XI (kept), and focus on each new heading.
- No ambient randomness or wall-clock time in `src/domain/`.

### Wave: DISCUSS / [REF] Out-of-scope
Out-of-position play, condition or fitness affecting selection, a substitutes bench or bench count, captain and set-piece takers, drag and drop, finer roles (LB, CB, ST and so on), showing the XI or names on the Tactics screen (its "Line-up" list stays codes only), persistence across reloads, opponent selection, a match, a "continue" gate, and every OUT tag (`match-2d`, `utility-ai`, `transfers`, `finances`, `training`, `youth`, `staff`, `multiplayer`, `backend`, `real-data`).

### Wave: DISCUSS / [REF] WS strategy
No new walking skeleton (brownfield). Extends the S-001..S-004 skeleton by one branch from the club home: club home, Starting XI, choose, back. The e2e journey "Starting XI, a slot, a player, Back, Tactics, 4-3-3, Back, Starting XI" is the end-to-end proof. Three releasable carpaccio slices in order (`slices/slice-01..03`); a pure domain precursor commit (automatic pick) is allowed inside slice 01, not as a separate slice.

### Wave: DISCUSS / [REF] Driving ports
- Selection rules (pure, shape for DESIGN): the automatic XI from a squad and a formation; pick/swap of a squad player into a slot; the XI for a new formation from the old XI (D10).
- `update(GameState, Action) => GameState` with view-starting-XI, choose-slot, pick-player, `Back` from both new screens, the formation-change effect on the XI and the `NewGame` reset; `GameState` holds the XI.
- UI entry: the button named "Starting XI" on the club home; the Starting XI screen (`<h1>` "Starting XI", list "Starting XI" of 11 buttons, "Back"); the choose screen (`<h1>` "Choose GK|DF|MF|FW", list "Players", "Back"); reachable by role and accessible name at `http://localhost:4173/gaffer/`.

### Wave: DISCUSS / [REF] Pre-requisites
- S-001..S-004 delivered (club home, "Squad", "Tactics", `lineUp`, `GameState.formation`, `focusPlan`).
- ADR-0001..0008 accepted. Expected from DESIGN: ADR-0009 for the XI in state (representation, for example squad indices per slot, and when the automatic XI is first derived, given that the squad is derived on render and not stored, ADR-0005), the selection rules as pure domain functions, and how `ChooseFormation` interacts with the XI (see US-3 technical notes).
- `docs/product/jobs.yaml` now has J-05 (resolved). Roadmap entry S-005 appended.
- Open items for DESIGN/DISTILL: (1) the visual layout of the 11 slot buttons (a list, or pitch rows like the S-004 line-up) is a DESIGN choice, as long as the list semantics, order and 44px hold and nothing scrolls sideways; (2) whether the tapped slot's own player is marked on the choose screen beyond "Starting" is not required (ship less).

### Wave: DISCUSS / [REF] DoR validation
| # | Item | Status | Evidence |
|---|---|---|---|
| 1 | Problem clear, domain language | PASS | US-1 bare codes and a chore to fill; US-2 cannot start the man he rates; US-3 fear of losing picks |
| 2 | Persona specific | PASS | Sam, 34, one-handed on a bus, 390px Android, 5 minutes, has chosen a formation |
| 3 | 3+ domain examples, real data | PASS | 3 per story: `?seed=31` first club 4-4-2 best XI, tie on 12, `?seed=abc` 8th club 4-2-3-1; Hale for Pike, swap with Barrow, own GK no-op; 4-3-3 drop, back to 4-4-2 refill, 4-2-3-1 two extras |
| 4 | UAT Given/When/Then, 3-7 | PASS | US-1 4, US-2 5, US-3 5 scenarios |
| 5 | AC derived from UAT | PASS | Embedded scenarios are the AC; D1-D10, D13 by scenario; D11 no-ops, D12 names and D14 by unit tests and review (Notes) |
| 6 | Right-sized | PASS | 3 slices of about 1 day (200, 150, 100 changed lines); each story 4-5 scenarios |
| 7 | Technical notes | PASS | Squad derived on render (ADR-0005), pure rules no RNG, focus on screen change (ADR-0008), S-004 `ChooseFormation` test interaction |
| 8 | Dependencies tracked | PASS | S-001..S-004 delivered; ADR-0009 expected from DESIGN; open items listed |
| 9 | Outcome KPI measurable (extra check beyond the 8-item DoR) | PASS | K1 1 tap, K2 2/3 taps, K3 0 lost picks and 0 duplicates, e2e and property tests |

DoR status: PASSED (all 3 stories). Every story has `job_id` J-05 and an Elevator Pitch.

### Wave: DISCUSS / [REF] Peer review
Pending: `nw-product-owner-reviewer` has not reviewed this DISCUSS section yet (run by the plan run; up to 2 cycles). Findings and resolutions will be recorded here.
