# S-004: Choose a formation

## Wave: DISCUSS

Lean, unattended. Reuses `discuss/journey.md`. The outcome is the owner draft for S-004 ("On a 'Tactics' screen the player picks one of 4-4-2, 4-3-3 or 4-2-3-1; the choice is shown as 11 position slots and persists when leaving and returning to the screen"), narrowed by scope.md precedence (ship less): slots are position codes only, and "persists" means for the rest of the session, not across reloads ("Save and continue" is its own later story). Feature type: user-facing. UX depth: lightweight. No DIVERGE artifact (accepted as lean, as for S-002 and S-003).

### Wave: DISCUSS / [REF] Scope Assessment
PASS: 1 story, 1 new context ("Tactics", formation data only) plus the app navigation, 1 releasable carpaccio slice (an optional domain precursor commit for the formation data, then the screen commit), about 2-3 days. Walking skeleton extends S-001..S-003 by one branch from the club home (club home, tactics, back). No oversized signal.

### Wave: DISCUSS / [REF] Persona
Sam, 34, a lapsed Championship Manager fan. Plays on the bus, one-handed, on a mid-range Android phone at 390px wide, with 5 minutes to spare (persona established in `docs/feature/S-001/feature-delta.md`; player from brief.md, "Player"). Has looked at the squad and at individual players, and now wants to decide how the side lines up before picking who plays.

### Wave: DISCUSS / [REF] JTBD one-liner
When I am getting my team ready for the next match, I want to choose how my side lines up, so that I can play to my squad's strengths. (Recorded as J-04 `set-up-my-team` in `docs/product/jobs.yaml`; it follows J-03.)

### Wave: DISCUSS / [REF] Locked decisions
- D1 Entry: the club home gains a button named exactly "Tactics" (44px or taller), in addition to "Squad" (layout is a DESIGN choice). The club home `<h1>` is still the club's name, and "Squad" is unchanged.
- D2 Tactics screen: exactly one `<h1>`, text "Tactics", focused on arrival (existing shell behaviour). A radio group named "Formation" holds exactly three radio buttons named "4-4-2", "4-3-3" and "4-2-3-1", in that order; exactly one is checked at any time. Each radio's visible label is its formation name and is the tappable area: the label is 44px or taller, and tapping it checks that radio (the native radio input itself may be smaller or visually restyled).
- D3 Default: a new game (from "New game" on the title screen) starts at "4-4-2". The protected scenario checks this in a fresh page, not by reloading after a choice, so that the later "Save and continue" story (scope IN) can restore a saved formation through "Continue" without contradicting a permanent S-004 test.
- D4 Line-up: a list named "Line-up" holds exactly 11 items, each reading exactly one position code from the squad's codes (GK, DF, MF, FW), ordered goalkeeper first, then defenders, midfielders and forwards. Counts: 4-4-2 = 1 GK, 4 DF, 4 MF, 2 FW; 4-3-3 = 1 GK, 4 DF, 3 MF, 3 FW; 4-2-3-1 = 1 GK, 4 DF, 5 MF, 1 FW (the "2" and the "3" of 4-2-3-1 are both midfield lines, so MF). No finer roles (LB, CB, ST and so on) and no player names in the slots in this story (that is S-005, starting XI). Drawing the items as pitch lines is a DESIGN choice; the list semantics are fixed.
- D5 Choosing: tapping a formation checks it, unchecks the others and updates the "Line-up" list at once (no save or confirm button). The heading stays "Tactics" and focus is on the tapped formation's radio button: it must not jump to the `<h1>`, and the focused radio must not be destroyed and lost by a re-render, because that breaks keyboard and screen-reader users. Changing the choice with the arrow keys behaves the same way (native radio behaviour); this keyboard path is covered by the e2e smoke and review, not by a protected scenario (Sam plays by touch). Tapping the already checked formation changes nothing (unit test on `update`). Navigation to a different screen still moves focus to the new `<h1>` (existing shell behaviour). Today `main.ts` focuses the `<h1>` after every render, so DESIGN must decide how a same-screen update keeps focus.
- D6 Session memory: the chosen formation is kept in the game state for the rest of the session. A button named exactly "Back" (44px or taller) returns to the club home (heading the club's name); tapping "Tactics" again shows the same formation checked with its line-up, also after visiting "Squad" (and a player) in between. Not persisted across reloads (in memory only; persistence is the later "Save and continue" story).
- D7 Navigation (names and shapes for DESIGN, ADR-0003): `Screen` gains a tactics variant (club id); `Action` gains a view-tactics action (valid only from the club home of a known club) and a choose-formation action (valid only on the tactics screen, with one of the three formations); "Back" from tactics goes to the club home. Wrong-screen actions and unknown formations are no-ops, as before. `GameState` gains the chosen formation, initially "4-4-2".
- D8 Phone first: no horizontal scroll at 390px, no console errors, generated text through `el()`/`textContent` only (ADR-0002).
- D9 The formation changes nothing else yet: not the squad, ratings, attributes or any other screen. It feeds S-005 (starting XI) and the match stories later. Formations are fixed data, the same for every seed (not generated).
- UX depth: no mockups beyond the journey table.

### Wave: DISCUSS / [REF] Story map and priority
Backbone: pick club, club home, squad, player, **tactics**, (next: starting XI, match, table). Walking skeleton = the existing S-001..S-003 path plus one branch from the club home (club home to tactics and back). One release, one story, one releasable slice (`slices/slice-01-choose-formation.md`); a domain precursor commit for the formation data is allowed but is not shipped alone. Priority rationale: the formation comes before the starting XI (S-005) because the XI's 11 slots come from the formation's line-up; together they are "pick team" in the brief's five-minute loop "pick team, play match, see table", so this story moves the POC towards its first match.

### Wave: DISCUSS / [REF] User stories

#### US-1: Choose how my side lines up
**Problem:** Sam knows the squad and what each player is good at, but has no say in how the side lines up. Without a formation there is nothing to pick a team into, and no way to play to a squad that is, say, rich in midfielders.
**job_id:** J-04
**Elevator Pitch**
- Before: the club home offers only "Squad"; there is no way to say how the team lines up.
- After: on the club home Sam taps "Tactics", then taps "4-3-3", and sees "4-3-3" checked and the list "Line-up" reading GK, DF, DF, DF, DF, MF, MF, MF, FW, FW, FW.
- Decision enabled: which shape suits my squad: two strikers, three forwards, or a packed midfield?

**Domain examples**
1. Sam opens `?seed=31`, taps "New game", picks the first club and taps "Tactics": the heading is "Tactics", "4-4-2" is checked and the line-up reads GK, DF, DF, DF, DF, MF, MF, MF, MF, FW, FW. Sam taps "4-3-3": the line-up reads GK, DF, DF, DF, DF, MF, MF, MF, FW, FW, FW. Sam taps "Back", "Squad", "Back", then "Tactics": "4-3-3" is still checked with the same line-up.
2. Sam opens `?seed=abc` (invalid, so the default seed is used), picks the 8th club, taps "Tactics" and then "4-2-3-1": the line-up is 1 GK, 4 DF, 5 MF and 1 FW. The three formations give the same line-ups as for `?seed=31`.
3. In a fresh visit to `?seed=31`, Sam taps "New game", picks the 8th club and taps "Tactics": "4-4-2" is checked, as it is for every new game.

**Acceptance criteria (embedded UAT)**
- Scenario: Tactics opens on a 4-4-2 for a new game.
  Given Sam has started a new game and is on a club's home screen, when Sam taps the button named "Tactics", then the screen has exactly one heading, "Tactics", a radio group named "Formation" holds exactly three radio buttons, "4-4-2", "4-3-3" and "4-2-3-1" in that order, only "4-4-2" is checked, and the list named "Line-up" holds exactly 11 items reading GK, then 4 DF, then 4 MF, then 2 FW.
- Scenario: Choosing a formation updates the line-up at once.
  Given Sam is on the "Tactics" screen with "4-4-2" checked, when Sam taps "4-3-3", then "4-3-3" is the only checked option, the "Line-up" list reads GK, DF, DF, DF, DF, MF, MF, MF, FW, FW, FW, the only heading is still "Tactics", and focus is on the "4-3-3" option.
- Scenario: Every formation lines up in position order, whatever the seed.
  Given Sam opens `?seed=abc` (invalid, so the default-seed league is used) and is on the 8th club's "Tactics" screen, when Sam taps "4-2-3-1", then "4-3-3" and then "4-4-2", then the "Line-up" list each time holds exactly 11 items, each exactly one of GK, DF, MF or FW, goalkeeper first, then defenders, midfielders and forwards, with counts 1/4/5/1, 1/4/3/3 and 1/4/4/2 respectively, the same as for `?seed=31`.
- Scenario: The choice is kept for the rest of the session.
  Given Sam has chosen "4-3-3" on the "Tactics" screen, when Sam taps "Back", then the heading is the club's name; and when Sam taps "Squad", "Back" and then "Tactics", then "4-3-3" is the only checked option and the "Line-up" list reads 1 GK, 4 DF, 3 MF, 3 FW.
- Scenario: Every new game starts at 4-4-2.
  Given Sam opens the game fresh (with `?seed=31`, and again with `?seed=abc`), when Sam taps "New game", picks a club and taps "Tactics", then only "4-4-2" is checked and the "Line-up" list reads 1 GK, 4 DF, 4 MF, 2 FW.
- Scenario: The tactics screen fits a phone.
  Given Sam is on a 390px-wide phone viewport on a club's home screen, when Sam taps "Tactics" and then each formation in turn, then the "Tactics" and "Back" buttons and each formation's label (the text "4-4-2", "4-3-3", "4-2-3-1") are at least 44px tall, tapping a label checks its radio, focus is on the "Tactics" heading after arriving, neither the club home nor the tactics screen scrolls sideways, and no errors appear in the browser console.

Notes for DESIGN and DISTILL (not part of the AC): "focus is on the tapped option" means the radio input of that formation is the focused element after the tap. Radios are found by role `radio` and accessible name inside the group named "Formation"; "checked" is the radio's checked state. D7 no-ops (view-tactics from any screen but a known club's home, choose-formation off the tactics screen or with an unknown formation, "Back" from tactics with an unknown club) are unit tests on `update`, as in S-002/S-003. D9 "squad unchanged" is covered by the existing S-002/S-003 tests and a whole-state check that only the formation changes. D8's `el()`/`textContent` rule is a code-review and ADR-0002 check, not a scenario. Adding the "Tactics" button must keep `tests/protected/S-001..S-003` green (they find "Squad" and "Back" by name and do not count club home buttons).

**Outcome KPI:** Sam goes from the club home to a chosen formation in 2 taps ("Tactics", then one formation), and back in 1 (measured by the e2e smoke tap count; no analytics in the POC). Baseline: not possible (no tactics screen).
**Technical notes:** `Screen`/`Action`/`GameState`/`update` in `src/app/state.ts` (ADR-0003). Formation data is fixed, pure domain data (no seed, no RNG); `salvage/tactics.ts` holds 4-4-2 and 4-3-3 with finer roles and coordinates, to be ported and simplified, not imported (4-2-3-1 missing). The shell (`main.ts`) focuses the `<h1>` after every render today; D5 needs a same-screen update that keeps focus on the tapped radio. `el()` for the tactics view and the club home button (ADR-0002). Depends on S-001 (club home) and S-002 ("Back" pattern).

### Wave: DISCUSS / [REF] DoD
- `tests/protected/S-004/` passes on main; `tests/protected/S-001/`, `S-002/` and `S-003/` still pass.
- Unit tests for the formation data (11 slots, counts, order) and for navigation and choose-formation (including no-ops) pass. The `ci:*` scripts are green.
- The e2e phone-viewport smoke covers club home, tactics, choose, back, squad, back, tactics (choice kept) and focus staying on the tapped option.
- No ambient randomness or wall-clock time in `src/domain/`.

### Wave: DISCUSS / [REF] Out-of-scope
Picking players into slots, a suggested XI, mentality or team instructions, drag and drop, finer roles (LB, CB, ST and so on), rendering pitch coordinates beyond a simple line layout, persistence across reloads, opponent tactics, the formation affecting ratings or anything else, and every OUT tag (`match-2d`, `utility-ai`, `transfers`, `finances`, `training`, `youth`, `staff`, `multiplayer`, `backend`, `real-data`).

### Wave: DISCUSS / [REF] WS strategy
Extends the S-001..S-003 walking skeleton by one branch from the club home: club home, tactics, back. The e2e journey "Tactics, 4-3-3, Back, Squad, Back, Tactics" is the end-to-end proof. One releasable carpaccio slice, `slices/slice-01-choose-formation.md`. A domain precursor commit for the formation data (developer-facing, never shipped alone) is allowed inside that slice, not as a separate slice.

### Wave: DISCUSS / [REF] Driving ports
- Formation data: the three formations, in order, each with its 11-slot line-up of position codes (pure, fixed; shape for DESIGN).
- `update(GameState, Action) => GameState` with view-tactics, choose-formation and `Back` from tactics; `GameState` holds the chosen formation (initially "4-4-2").
- UI entry: the button named "Tactics" on the club home, the tactics screen (`<h1>` "Tactics", radio group "Formation" with three radios, list "Line-up"), and the button named "Back", reachable by role and accessible name at `http://localhost:4173/gaffer/`.

### Wave: DISCUSS / [REF] Pre-requisites
- S-001..S-003 delivered (club home, "Squad", "Back", `update`).
- ADR-0001..0006 accepted. Expected from DESIGN: ADR-0007 for the formation data (shape, where it lives, the 4-2-3-1 midfield mapping to MF, what is ported from `salvage/tactics.ts`), the `GameState` extension, and focus handling on a same-screen re-render (D5), including the brief's "renderers do not move focus" contract.
- `docs/product/jobs.yaml` now has J-04 (resolved).
- Open items for DESIGN/DISTILL: (1) whether the club home's "Squad" and "Tactics" sit side by side or stacked at 390px is a DESIGN choice, as long as both are 44px or taller and nothing scrolls sideways; (2) how S-005 will map line-up slots to players is not decided here.

### Wave: DISCUSS / [REF] DoR validation
| # | Item | Status | Evidence |
|---|---|---|---|
| 1 | Problem clear, domain language | PASS | US-1 Problem: no say in how the side lines up, nothing to pick a team into |
| 2 | Persona specific | PASS | Sam, 34, one-handed on a bus, 390px Android, 5 minutes |
| 3 | 3+ domain examples, real data | PASS | Examples 1-3: `?seed=31` first club 4-3-3 kept across Squad; `?seed=abc` 8th club 4-2-3-1; fresh visit starts at 4-4-2 |
| 4 | UAT Given/When/Then, 3-7 | PASS | 6 scenarios |
| 5 | AC derived from UAT | PASS | Embedded scenarios are the AC; D1-D6, D8 phone rules and D9 "same for every seed" by scenario; D7 no-ops, D8 `el()` and D9 "squad unchanged" by unit tests and review (Notes) |
| 6 | Right-sized | PASS | 1 slice, about 300-400 changed lines, 2-3 days, 6 scenarios |
| 7 | Technical notes | PASS | `state.ts` ports, fixed formation data, salvage reference, focus constraint in `main.ts`, ADR-0002/0003 |
| 8 | Dependencies tracked | PASS | S-001..S-003 delivered; ADR-0007 expected from DESIGN; open items listed |
| 9 | Outcome KPI measurable | PASS | Club home to a chosen formation in 2 taps, back in 1, e2e tap count |

### Wave: DISCUSS / [REF] Peer review
`nw-product-owner-reviewer`, cycle 1 (plan run): rejected pending revisions on three high findings about the roadmap outcome, which becomes permanent protected tests. Resolved: RO-1, the outcome now says focus is on the "Tactics" heading on arrival. RO-2, the outcome names the measured element: each radio's visible label (its formation name) is 44px or taller, tapping the label checks that radio, and focus is on the tapped formation's radio button. RO-3, "Reloading and starting a new game" removed: the default is checked through "New game" in a fresh page, so the later "Save and continue" story cannot contradict a permanent S-004 scenario (D3). Medium: RO-4, "for any seed" replaced by the named seeds `?seed=31` and `?seed=abc`; RO-5, the arrow-key path is e2e and review only, and the re-tap no-op a unit test (D5). Low: RO-6 "named exactly \"Tactics\""; D1 now says "in addition to Squad", layout for DESIGN. Accepted as is: examples name clubs by ordinal (generated names are seed-dependent fixtures), the bold "Elevator Pitch" label (same as S-003), and DESIGN-level names in D5/D7 (DESIGN owns them, as accepted in S-003 review M7). The focus-contract risk (ADR-0003 "focus after each navigation", brief "renderers do not move focus") is handed to DESIGN for ADR-0007.

<!-- DESIGN, DEVOPS, DISTILL and DELIVER sections are appended below by later waves. -->
