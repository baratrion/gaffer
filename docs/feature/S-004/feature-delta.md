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

## Wave: DESIGN

Mode: propose. Scope: application. One solo team (no Conway constraint). Paradigm: functional (ADR-0003). New ADRs: `adr-0007-formation-data-and-tactics-state.md` and `adr-0008-focus-on-same-screen-update.md` (refines ADR-0003's focus note and the brief's "renderers do not move focus" contract; ADR-0003 got a refinement note, not a supersession). Architecture: `docs/product/architecture/brief.md` ("Tactics (S-004)", "For Acceptance Designer" ports 11-14). No new C4 container: the S-001 L1/L2 still hold (two descriptions updated). Outcomes-registry collision check: skipped: no registry (`docs/product/outcomes/` does not exist).

### Wave: DESIGN / [REF] DDD list
- New small context, "Tactics" (supporting; formation data only), sharing the `Position` codes of "League setup" (shared kernel by type import from `squad.ts`). Language: Formation, Line, Slot, Line-up, Position code.
- Value objects: `FormationId`; `FormationLine { position, count }`; the line-up is a derived `readonly Position[]` of 11. No aggregates, no events.
- Invariants by construction: 11 slots; one GK first; lines in GK, DF, MF, FW order; counts 1/4/4/2, 1/4/3/3, 1/4/5/1; data independent of any seed. State invariant: `GameState.formation` is always a known `FormationId` (enforced by the `ChooseFormation` guard).

### Wave: DESIGN / [REF] Decisions
| # | Decision | Source |
|---|---|---|
| D1 | `src/domain/formation.ts`: frozen line structure is the source (`{ position, count }` lines; 4-2-3-1 has two MF lines, 2 and 3); `lineUp(f)` (11 codes) derived from it; `formationLines(f)` for layout; `FORMATIONS`, `DEFAULT_FORMATION`, `isFormationId`. Ported from salvage: names only. Rejected: literal 11-arrays; port of roles and coordinates; UI-local data | ADR-0007 (1); DISCUSS D4, D9 |
| D2 | `GameState.formation` (required), `initialState(league)` in `app/state.ts` replaces the literal in `main.ts`; `NewGame` also resets it to 4-4-2. Rejected: formation in the Screen or UI-local; optional field | ADR-0007 (2); DISCUSS D3, D6, D7 |
| D3 | `Screen` + `tactics{clubId}`; `Action` + `ViewTactics` (known club's home only) and `ChooseFormation{formation}` (tactics, known club, known id; same formation returns the same object; only `formation` changes); `Back` tactics to clubHome, no-op for an unknown club | ADR-0007 (2); DISCUSS D7 |
| D4 | Focus: pure `focusPlan(previous, next, focusedId)` in `app/focus.ts`; shell focuses `<h1>` only when the Screen changed, else restores focus to the element with the previously focused `id` (fallback `<h1>`). Renderers never move focus; radios have ids `formation-<id>` and dispatch on `change`. Rejected: in-place patch and skipped render; keyed DOM diff; renderer-owned focus | ADR-0008; DISCUSS D5 |
| D5 | Markup via `el()`: one `<h1 tabindex="-1">`; `div role="radiogroup" aria-labelledby` with a visible non-heading label; three `<label>`s each holding a native radio (stretched over the label, transparent), an `aria-hidden` mark and the formation name as a direct text node, 48px; `ul role="list" aria-labelledby` of 11 `<li>`, `textContent` exactly the code; `Back` button 48px. Rejected: `fieldset`/`legend`; `select` | ADR-0007 consequences; brief "Tactics"; DISCUSS D2, D4 |
| D6 | Line-up layout: flat 12-column CSS grid, `--row` and `--span` custom properties from `formationLines`; forwards on the top row, GK on the bottom row (pitch view), DOM order GK first. Pitch green, chalk, gold | brief "Tactics"; DISCUSS D4 (layout is DESIGN) |
| D7 | Club home: "Tactics" after "Squad", stacked in `div.club-actions` (full width, 48px). Rejected: side by side (two 200px buttons do not fit at 358px) | DISCUSS D1 |
| D8 | `main.ts` tactics case: `renderTactics(root, { formation }, dispatch)` with `formation` from state | DISCUSS D7 |

### Wave: DESIGN / [REF] Component decomposition
| Component | Layer | Responsibility |
|---|---|---|
| `domain/formation.ts` | domain | New: ids, order, default, guard, line structure, `lineUp`, `formationLines` |
| `app/state.ts` | app | `GameState.formation`; `Screen` + tactics; `Action` + `ViewTactics`, `ChooseFormation`; `initialState`; `update` cases (one helper per action) |
| `app/focus.ts` | app | New: pure `focusPlan` |
| `ui/screens/tactics.ts` | ui | New: `renderTactics(root, { formation }, dispatch)` |
| `ui/screens/club-home.ts` | ui | Adds the "Tactics" button, wraps both buttons in `div.club-actions` |
| `main.ts` | shell | `initialState`, tactics render case, previous-screen memory, reads `document.activeElement.id`, executes the focus plan |
| `ui/styles.css` | ui | Club actions stack, radio cards (stretched transparent input, gold mark, focus ring), line-up pitch grid, `.tactics h1` size |

### Wave: DESIGN / [REF] Driving ports
- Formation data (`FORMATIONS`, `DEFAULT_FORMATION`, `lineUp`, `formationLines`, `isFormationId`), `update(GameState, Action) => GameState` with `ViewTactics`, `ChooseFormation`, `Back`, `initialState`, and `focusPlan`.
- Browser: the "Tactics" button on the club home; the tactics screen (`<h1>`, radiogroup "Formation" with three radios, list "Line-up" of 11, "Back"). Detail in the brief, "For Acceptance Designer" ports 11-14.

### Wave: DESIGN / [REF] Driven ports and adapters
None: no storage, clock or network; the formation is in memory only (persistence is the later "Save and continue" story and gets its own probe then). The one environmental assumption is browser focus and native radio behaviour; it is probed by e2e (tap and arrow key keep focus on the radio; fault: the re-render destroys the focused node; fallback to the heading) per ADR-0008. No external integrations, so no contract tests. Enforcement: oxlint boundary rules unchanged; a unit test that fails if `.focus(` appears under `src/ui/`; Stryker already mutates `src/domain/**` and `src/app/state.ts` (adding `src/app/focus.ts` is recommended if `stryker.config.mjs` is editable by the factory; its comment says it is not, so unit tests carry that logic).

### Wave: DESIGN / [REF] Technology choices
No new technology or dependency (ADR-0001, 0002, 0003 apply; all OSS). `:has()` and other newer CSS is not relied on.

### Wave: DESIGN / [REF] Reuse Analysis
| Existing | Action | Contract shape / assertion |
|---|---|---|
| `src/domain/squad.ts` (`Position`) | REUSE (type import) | pure types; no change |
| `salvage/tactics.ts` | REFERENCE only: names 4-4-2 and 4-3-3 | not built, not imported |
| `src/domain/formation.ts` | CREATE NEW (no existing alternative: no formation data exists outside salvage) | pure data constants and pure return-only functions; unit tests (counts, order, derivation, frozen) |
| `src/app/state.ts` (`update`, `isKnownClub`, `toScreen`) | EXTEND: field, variants, cases, `initialState`, `NewGame` reset | pure return-only; unit tests incl. no-ops, same-object choice, only-formation-changes, no mutation |
| `src/app/focus.ts` | CREATE NEW (no existing alternative: the focus rule is inline in `main.ts`) | pure return-only plan value; unit tests |
| `src/ui/screens/tactics.ts` | CREATE NEW (no existing screen) | bounded-change (root's children only; never moves focus); e2e |
| `src/ui/screens/club-home.ts` | EXTEND: second button and wrapper | bounded-change; e2e |
| `src/ui/dom.ts` `el()` | REUSE (attribute `checked: ""` sets the default checked state on fresh nodes) | bounded-change; detached nodes only |
| `src/main.ts` | EXTEND: `initialState`, tactics case, focus execution | unbounded shell; universe widened by `document.activeElement.id` read; e2e |
| `src/ui/styles.css` | EXTEND: reuse `.back-button`, `button.primary`, tokens | n/a |
| `tests/acceptance/S-001/navigation.test.ts`, `S-002/navigation.test.ts`, `S-003/player-navigation.test.ts` | EXTEND: `GameState` fixtures gain `formation: DEFAULT_FORMATION` (or use `initialState`); assertions and counts unchanged | pure return-only; required by the new field |
| `tests/e2e/S-001..S-003*.spec.ts` | REUSE unchanged (focus on `<h1>` after navigation still holds) | black-box regression |
| `tests/acceptance/S-004/`, `tests/e2e/S-004-tactics.spec.ts` | CREATE NEW (DISTILL) | unit/property and black-box |

### Wave: DESIGN / [REF] Changed Assumptions
- DISCUSS slice 01 IN: "Club home gains a button named exactly 'Tactics' (44px or taller) next to 'Squad'". Changed: stacked below "Squad" (D1 leaves layout to DESIGN; two 200px buttons do not fit side by side at 390px).
- DISCUSS notes: "D7 no-ops ... are unit tests on `update`" and "a whole-state check that only the formation changes". Unchanged, but the new required `GameState.formation` forces DELIVER to touch three existing acceptance fixtures (types only).
- DISCUSS D5 / ADR-0003 / brief: "the shell focuses the `<h1>` after every render" and "after navigation". Changed (ADR-0008): after a render that changed the Screen; same-screen updates restore focus to the previously focused element's `id`.
- DISCUSS D5: "focus is on the tapped formation's radio". Holds wherever the platform focuses a radio on tap or arrow key (Chromium e2e, keyboard, screen readers). Where it does not (Safari/iOS touch), focus falls back to the heading (ADR-0008).
- No change to the roadmap outcome text; every sentence is covered (see Open questions, "Outcome trace").

### Wave: DESIGN / [REF] Open questions
- None blocking. Accepted: returning to the tactics screen re-renders from the top (no scroll restore); reading order (GK first) differs from the visual order (forwards on top) by design, because each slot is a static label.
- Outcome trace: "Tactics" button 44px: `button.primary` 48px. Only heading "Tactics" focused on arrival: `focusPlan` heading on a Screen change. Radiogroup "Formation" with three radios in order, one checked, "4-4-2" in a new game: D1, D2, D5. Label visible name and 44px, tap checks: label 48px with the input stretched over it. List "Line-up" of 11 codes with counts: D1, D5. Choosing updates at once, heading stays, focus on the radio: D3, D4. "Back" 44px to the club home: D3, D5. Kept for the session, also after "Squad": formation is state, not screen. Not seed-dependent: fixed data. No sideways scroll or console errors: D6 and e2e.
- Handoff for DISTILL: unit and property tests on `formation.ts` (three ids in order; each `lineUp` 11 codes, GK first, non-decreasing order, counts 1/4/4/2, 1/4/3/3, 1/4/5/1; `lineUp` equals the expansion of `formationLines`; `Object.isFrozen`; `isFormationId` rejects `"3-5-2"`, `""`, `"4-4-2 "`); `update` tests (`ViewTactics` from each other screen and an unknown club; `ChooseFormation` off tactics, unknown club, unknown id, same formation returns the same object, whole-state equality except `formation`; `Back` from tactics incl. unknown club; `NewGame` reset; no mutation); `focusPlan` tests (first render, every screen pair incl. same club different screen, same screen with and without id); an `src/ui` grep test that no `.focus(` appears. E2E (Pixel 7, 390px): club home to Tactics (focus on `<h1>`), the group and 3 radios by role and name in order, one checked, "Line-up" items equal the expected codes for all three formations at `?seed=31` and `?seed=abc` (8th club), tap each label (label 44px or taller, radio focused, only that radio checked, heading text still "Tactics", exactly one heading), arrow-key path (focus the checked radio, press `ArrowRight`, next radio checked and focused), tap the checked one (no change), Back, Squad, a player, Back, Back, Tactics (choice kept), fresh page and "New game" shows 4-4-2, tap counts (2 to a chosen formation, 1 back), no horizontal scroll on club home and tactics, no console errors, S-001..S-003 e2e unchanged. Existing suites that build `GameState` literals need `formation` added (see Reuse Analysis). Held-out `.pending` mechanics as in S-003 DISTILL if new scenarios cannot pass before DELIVER. The protected-test runner finds radios by role and name, so the radio `input` must stay native and unique per name; do not add a second element named "4-4-2" (for example a visible caption outside the label).

<!-- DEVOPS, DISTILL and DELIVER sections are appended below by later waves. -->
