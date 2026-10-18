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
- Scenario: Every formation lines up in position order, at `?seed=31` and `?seed=abc`.
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
| 9 | Outcome KPI measurable (extra check beyond the 8-item DoR) | PASS | Club home to a chosen formation in 2 taps, back in 1, e2e tap count |

### Wave: DISCUSS / [REF] Peer review
`nw-product-owner-reviewer`, cycle 1 (plan run): rejected pending revisions on three high findings about the roadmap outcome, which becomes permanent protected tests. Resolved: RO-1, the outcome now says focus is on the "Tactics" heading on arrival. RO-2, the outcome names the measured element: each radio's visible label (its formation name) is 44px or taller, tapping the label checks that radio, and focus is on the tapped formation's radio button. RO-3, "Reloading and starting a new game" removed: the default is checked through "New game" in a fresh page, so the later "Save and continue" story cannot contradict a permanent S-004 scenario (D3). Medium: RO-4, "for any seed" replaced by the named seeds `?seed=31` and `?seed=abc`; RO-5, the arrow-key path is e2e and review only, and the re-tap no-op a unit test (D5). Low: RO-6 "named exactly \"Tactics\""; D1 now says "in addition to Squad", layout for DESIGN. Accepted as is: examples name clubs by ordinal (generated names are seed-dependent fixtures), the bold "Elevator Pitch" label (same as S-003), and DESIGN-level names in D5/D7 (DESIGN owns them, as accepted in S-003 review M7). The focus-contract risk (ADR-0003 "focus after each navigation", brief "renderers do not move focus") is handed to DESIGN for ADR-0007.

`nw-product-owner-reviewer`, cycle 2: approved with notes, no blocking issue; all six cycle-1 findings verified in the roadmap entry. Folded in: J-1/J-2, the journey now says focus is on the tapped formation's radio (not the heading); J-3, the remaining "any seed" wording in the journey and the scenario title now names `?seed=31` and `?seed=abc`; L-1, the slice says "in addition to Squad" (stacked, per DESIGN); L-3, DoR row 9 is marked as an extra check. M-1 (Safari/iOS focus fallback) and L-2 (the "Line-up" label must not be a heading) are resolved in the DESIGN revision after the architecture review (see DESIGN "Peer review").

## Wave: DESIGN

Mode: propose. Scope: application. One solo team (no Conway constraint). Paradigm: functional (ADR-0003). New ADRs: `adr-0007-formation-data-and-tactics-state.md` and `adr-0008-focus-on-same-screen-update.md` (refines ADR-0003's focus note and the brief's "renderers do not move focus" contract; ADR-0003 got a refinement note, not a supersession). Architecture: `docs/product/architecture/brief.md` ("Tactics (S-004)", "For Acceptance Designer" ports 11-14). No new C4 container: the S-001 L1/L2 still hold (two descriptions updated). Outcomes-registry collision check: skipped: no registry (`docs/product/outcomes/` does not exist).

### Wave: DESIGN / [REF] DDD list
- New small context, "Tactics" (supporting; formation data only), sharing the `Position` codes of "League setup" (shared kernel by type import from `squad.ts`). Language: Formation, Line, Slot, Line-up, Position code.
- Value objects: `FormationId`; `FormationLine { position, count }`; the line-up is a derived `readonly Position[]` of 11. No aggregates, no events.
- Invariants by construction: 11 slots; one GK first; lines in GK, DF, MF, FW order; counts 1/4/4/2, 1/4/3/3, 1/4/5/1; data independent of any seed. State invariant: `GameState.formation` is always a known `FormationId` (enforced by the `ChooseFormation` guard).

### Wave: DESIGN / [REF] Decisions
| # | Decision | Source |
|---|---|---|
| D1 | `src/domain/formation.ts`: deeply frozen line structure is the source (`{ position, count }` lines; 4-2-3-1 has two MF lines, 2 and 3); `lineUp(f)` (11 codes) derived from it; `formationLines(f)` for layout; `FORMATIONS`, `DEFAULT_FORMATION`, `isFormationId(value: string): value is FormationId` (type guard). Ported from salvage: names only. Rejected: literal 11-arrays; port of roles and coordinates; UI-local data | ADR-0007 (1); DISCUSS D4, D9 |
| D2 | `GameState.formation` (required), `initialState(league)` in `app/state.ts` replaces the literal in `main.ts`; `NewGame` also resets it to 4-4-2. Rejected: formation in the Screen or UI-local; optional field | ADR-0007 (2); DISCUSS D3, D6, D7 |
| D3 | `Screen` + `tactics{clubId}`; `Action` + `ViewTactics` (known club's home only) and `ChooseFormation{formation}` (tactics, known club, known id; same formation returns the same object; only `formation` changes); `Back` tactics to clubHome, no-op for an unknown club | ADR-0007 (2); DISCUSS D7 |
| D4 | Focus on the tapped control: dispatch contract becomes `dispatch(action, focusId?: string)` (optional; existing renderers unchanged; ADR-0003 refinement note). The tactics `change` listener calls `dispatch({ type: "ChooseFormation", formation }, "formation-<id>")`. Pure `focusPlan(previous, next, focusId)` and `FocusPlan` live in `app/state.ts`; `main.ts` passes `focusId` = the dispatch's argument, else none (no `document.activeElement` read). Same Screen and a `focusId` whose element exists after the render: focus it; Screen changed, first render or no element: the `<h1>`. Renderers never call `.focus()`. Rejected: in-place patch and skipped render; keyed DOM diff; renderer-owned focus; reading `document.activeElement` only (no focus on tap in Safari/iOS) | ADR-0008; DISCUSS D5 |
| D5 | Markup via `el()`: one `<h1 tabindex="-1">`; `div role="radiogroup" aria-labelledby` with a visible non-heading label (`<p id>`, as is the "Line-up" label, so the screen has exactly one heading); three `<label>`s (`display: block`, `position: relative`, `min-height: 48px`) each holding a native radio (stretched over the label with `opacity: 0`; never `display: none`, `visibility: hidden` or `hidden`, so it stays in the accessibility tree), an `aria-hidden` mark and the formation name as a direct text node; `ul role="list" aria-labelledby` of 11 `<li>`, `textContent` exactly the code; `Back` button 48px. Rejected: `fieldset`/`legend`; `select` | ADR-0007 consequences; brief "Tactics"; DISCUSS D2, D4 |
| D6 | Line-up layout: one flat 12-column CSS grid; each `<li>` has `style="--span: k"` (12 divided by its line's count, from `formationLines`) and `grid-column: span var(--span)`; each line's spans sum to 12, so auto-placement gives one pitch row per line in DOM order, with no explicit row. Visual order equals DOM order: GK row first (top), FW row last (bottom), the team attacks downward. Pitch green, chalk, gold | brief "Tactics"; DISCUSS D4 (layout is DESIGN) |
| D7 | Club home: "Tactics" after "Squad", stacked in `div.club-actions` (full width, 48px). Rejected: side by side (two 200px buttons do not fit at 358px) | DISCUSS D1 |
| D8 | `main.ts` tactics case: derives `formationLines(formation)` and calls `renderTactics(root, { formation, lines }, dispatch)` (the renderer imports domain types only, as S-002/S-003) | DISCUSS D7 |

### Wave: DESIGN / [REF] Component decomposition
| Component | Layer | Responsibility |
|---|---|---|
| `domain/formation.ts` | domain | New: ids, order, default, guard, line structure, `lineUp`, `formationLines` |
| `app/state.ts` | app | `GameState.formation`; `Screen` + tactics; `Action` + `ViewTactics`, `ChooseFormation`; `initialState`; `update` cases (one helper per action); pure `focusPlan` and `FocusPlan` (inside the existing Stryker glob) |
| `ui/screens/tactics.ts` | ui | New: `renderTactics(root, { formation, lines }, dispatch)`; the `change` listener passes its own input id as `focusId` |
| `ui/screens/club-home.ts` | ui | Adds the "Tactics" button, wraps both buttons in `div.club-actions` |
| `main.ts` | shell | `initialState`, tactics render case (derives `formationLines`), `dispatch(action, focusId?)`, previous-screen memory, takes `focusId` from the dispatch argument, executes the focus plan |
| `ui/styles.css` | ui | Club actions stack, radio cards (stretched transparent input, gold mark, focus ring), line-up pitch grid, `.tactics h1` size |

### Wave: DESIGN / [REF] Driving ports
- Formation data (`FORMATIONS`, `DEFAULT_FORMATION`, `lineUp`, `formationLines`, `isFormationId`), `update(GameState, Action) => GameState` with `ViewTactics`, `ChooseFormation`, `Back`, `initialState`, and `focusPlan` (all in `state.ts`).
- Browser: the "Tactics" button on the club home; the tactics screen (`<h1>`, radiogroup "Formation" with three radios, list "Line-up" of 11, "Back"). Detail in the brief, "For Acceptance Designer" ports 11-14.

### Wave: DESIGN / [REF] Driven ports and adapters
None: no storage, clock or network; the formation is in memory only (persistence is the later "Save and continue" story and gets its own probe then). The one environmental assumption is that a re-rendered node with the same id can be focused programmatically in the same task and that native radios keep one checked per group; it is probed by e2e (tap and arrow key leave focus on the radio; fault: the re-render replaces the focused node; fallback to the heading when the id is missing) per ADR-0008. No external integrations, so no contract tests. Enforcement: oxlint boundary rules unchanged; a unit test that fails if `.focus(` appears under `src/ui/`; Stryker already mutates `src/domain/**` and `src/app/state.ts`, which now holds `focusPlan`, so no owner action is needed.

### Wave: DESIGN / [REF] Technology choices
No new technology or dependency (ADR-0001, 0002, 0003 apply; all OSS). `:has()` and other newer CSS is not relied on.

### Wave: DESIGN / [REF] Reuse Analysis
| Existing | Action | Contract shape / assertion |
|---|---|---|
| `src/domain/squad.ts` (`Position`) | REUSE (type import) | pure types; no change |
| `salvage/tactics.ts` | REFERENCE only: names 4-4-2 and 4-3-3 | not built, not imported |
| `src/domain/formation.ts` | CREATE NEW (no existing alternative: no formation data exists outside salvage) | pure data constants and pure return-only functions; unit tests (counts, order, derivation, frozen) |
| `src/app/state.ts` (`update`, `isKnownClub`, `toScreen`) | EXTEND: field, variants, cases, `initialState`, `NewGame` reset, and the pure `focusPlan` / `FocusPlan` (the focus rule is inline in `main.ts` today; no module of its own, so it is under the existing Stryker `mutate` glob) | pure return-only; unit tests incl. no-ops, same-object choice, only-formation-changes, no mutation; `focusPlan` plan-value tests |
| `src/ui/screens/tactics.ts` | CREATE NEW (no existing screen) | bounded-change (root's children only; never moves focus; names the id to refocus through `dispatch`'s second argument); e2e |
| `src/ui/screens/club-home.ts` | EXTEND: second button and wrapper | bounded-change; e2e |
| Existing renderers' `dispatch: (action: Action) => void` parameter types | REUSE unchanged: the wider `(action, focusId?) => void` that `main.ts` passes is assignable; only `renderTactics` declares the second parameter | type-level; `ci:typecheck` |
| `src/ui/dom.ts` `el()` | REUSE (attribute `checked: ""` sets the default checked state on fresh nodes) | bounded-change; detached nodes only |
| `src/main.ts` | EXTEND: `initialState`, tactics case (derives `formationLines`), `dispatch(action, focusId?)`, focus execution | unbounded shell; universe unchanged apart from focus on the named element; e2e |
| `src/ui/styles.css` | EXTEND: reuse `.back-button`, `button.primary`, tokens | n/a |
| `tests/acceptance/S-001/navigation.test.ts`, `S-002/navigation.test.ts`, `S-003/player-navigation.test.ts` | EXTEND: `GameState` fixtures gain `formation: DEFAULT_FORMATION` (or use `initialState`); assertions and counts unchanged | pure return-only; required by the new field |
| `tests/e2e/S-001..S-003*.spec.ts` | REUSE unchanged (focus on `<h1>` after navigation still holds) | black-box regression |
| `tests/acceptance/S-004/`, `tests/e2e/S-004-tactics.spec.ts` | CREATE NEW (DISTILL) | unit/property and black-box |

### Wave: DESIGN / [REF] Changed Assumptions
- Stacking is a DESIGN decision under DISCUSS D1, which left the layout to DESIGN, not a change: "Tactics" sits below "Squad" (two 200px buttons do not fit side by side at 358px). The slice-01 wording "next to Squad" is read as "in addition to Squad".
- DISCUSS notes: "D7 no-ops ... are unit tests on `update`" and "a whole-state check that only the formation changes". Unchanged, but the new required `GameState.formation` forces DELIVER to touch three existing acceptance fixtures (types only).
- DISCUSS D5 / ADR-0003 / brief: "the shell focuses the `<h1>` after every render" and "after navigation". Changed (ADR-0008): after a render that changed the Screen; same-screen updates restore focus to the element whose `id` the dispatching renderer names (else the previously focused element's `id`). The renderer contract `dispatch(action)` becomes `dispatch(action, focusId?)` (ADR-0003 refinement note); existing renderers are unchanged.
- DISCUSS D5: "the focused radio must not be destroyed and lost by a re-render". Refined to: the radio node is re-created by the re-render, and focus is restored to the new node of the tapped formation (same id) in the same task, so it is never lost. Reason: it keeps one render path (ADR-0002, ADR-0003); option B (patching the radios and line-up in place, no re-render) was rejected because it splits rendering into two code paths for one screen. The observable outcome (focus on the tapped radio, heading unchanged) is exactly as D5 states.
- DISCUSS D5: "focus is on the tapped formation's radio". Holds wherever programmatic focus works (probed on Chromium; iOS Safari expected, not probed in CI): the listener names its own input's id, so nothing depends on the platform focusing a radio on tap. (The first draft's Safari/iOS fallback to the heading is removed; ADR-0008.)
- No change to the roadmap outcome text; every sentence is covered (see Open questions, "Outcome trace").

### Wave: DESIGN / [REF] Open questions
- None blocking. Accepted: returning to the tactics screen re-renders from the top (no scroll restore). Visual order equals DOM order (GK first at the top, FW last), so there is no reading-order difference to accept.
- Outcome trace: "Tactics" button 44px: `button.primary` 48px. Only heading "Tactics" focused on arrival: `focusPlan` heading on a Screen change. Radiogroup "Formation" with three radios in order, one checked, "4-4-2" in a new game: D1, D2, D5. Label visible name and 44px, tap checks: label 48px with the input stretched over it. List "Line-up" of 11 codes with counts: D1, D5. Choosing updates at once, heading stays, focus on the radio (every browser): D3, D4. "Back" 44px to the club home: D3, D5. Kept for the session, also after "Squad": formation is state, not screen. Not seed-dependent: fixed data. No sideways scroll or console errors: D6 and e2e.
- Handoff for DISTILL: unit and property tests on `formation.ts` (three ids in order; each `lineUp` 11 codes, GK first, non-decreasing order, counts 1/4/4/2, 1/4/3/3, 1/4/5/1; `lineUp` equals the expansion of `formationLines`; `Object.isFrozen`; `isFormationId` (a type guard) rejects `"3-5-2"`, `""`, `"4-4-2 "`); `update` tests (`ViewTactics` from each other screen and an unknown club; `ChooseFormation` off tactics, unknown club, unknown id, same formation returns the same object, whole-state equality except `formation`; `Back` from tactics incl. unknown club; `NewGame` reset; no mutation); `focusPlan` tests in the `state.ts` unit suite (first render, every screen pair incl. same club different screen, same screen with and without id); freeze tests deep (the outer array, each lines array and every `FormationLine`); an `src/ui` grep test that no `.focus(` appears. E2E (Pixel 7, 390px): club home to Tactics (focus on `<h1>`), the group and 3 radios by role and name in order, one checked, "Line-up" items equal the expected codes for all three formations at `?seed=31` and `?seed=abc` (8th club), tap each label (label 44px or taller, radio focused, only that radio checked, heading text still "Tactics", exactly one heading), arrow-key path (focus the checked radio, press `ArrowRight`, next radio checked and focused), tap the checked one (no change), Back, Squad, a player, Back, Back, Tactics (choice kept), fresh page and "New game" shows 4-4-2, tap counts (2 to a chosen formation, 1 back), no horizontal scroll on club home and tactics, no console errors, S-001..S-003 e2e unchanged. Existing suites that build `GameState` literals need `formation` added (see Reuse Analysis). Held-out `.pending` mechanics as in S-003 DISTILL if new scenarios cannot pass before DELIVER. The protected-test runner finds radios by role and name, so the radio `input` must stay native and unique per name; do not add a second element named "4-4-2" (for example a visible caption outside the label).

### Wave: DESIGN / [REF] Peer review
`nw-solution-architect-reviewer`, cycle 1: rejected pending revisions on one high finding (H1: focus restoration relied on `document.activeElement` before the render, which is empty on tap in Safari/iOS, so the design accepted a platform limitation against DISCUSS D5). Resolved:
- H1: `dispatch` becomes `dispatch(action, focusId?: string)`; `renderTactics`'s `change` listener passes its own input id (`formation-<id>`); `focusPlan(previous, next, focusId)` is fed the argument, else the id of `document.activeElement` inside root, else none. Same Screen with an existing element: focus it; Screen changed, first render or no element: the `<h1>`. Renderers still never call `.focus()`. The "Accepted limitation" (Safari/iOS) is dropped from ADR-0008, the brief (port 14 "Choosing" row now unconditional), the environments file and the DEVOPS sections. The dispatch change is recorded as a refinement note in ADR-0003 and in ADR-0008's Decision.
- M1: explicit Changed Assumption for DISCUSS D5 ("must not be destroyed and lost"): refined to "re-created by the re-render, focus restored to the new node of the tapped formation (same id) in the same task, so never lost"; reason: one render path (ADR-0002/0003), option B (in-place patch) rejected for splitting rendering into two code paths.
- M2: `focusPlan` and `FocusPlan` move into `src/app/state.ts` (EXTEND, not CREATE NEW), under the existing Stryker `mutate` glob with no owner action; `src/app/focus.ts` is removed from the Reuse table, component inventory, brief and the DEVOPS open question.
- M3: visual order equals DOM order: the line-up renders GK row first (top) to FW row last (bottom), and the "reading order differs" accepted question is dropped. `formationLines` is kept to group 4-2-3-1's two MF lines into rows. Layout is one CSS grid with `--span` per `<li>`; each line's spans sum to 12, so auto-placement gives the rows in DOM order and no explicit row is needed (the smaller of the two options).
- L1 (wiring): `main.ts` derives `formationLines(formation)` and passes it as `renderTactics(root, { formation, lines }, dispatch)`; the renderer imports domain types only (as S-002/S-003). The renderer expands `lines` into the 11 items (equal to `lineUp(formation)`, which stays for S-005 and tests). The brief's component table and C4 L2 arrow text are consistent.
- L2: `isFormationId(value: string): value is FormationId` is a type guard.
- L3: the freeze test is deep (outer array, each lines array, every `FormationLine`).
- L4: ADR-0007's "Related" line no longer calls ADR-0006 the navigation pattern; it cites ADR-0005 and ADR-0006 as the precedent for extending `Screen`, `Action` and `Back` (squad and player screens).
- L5: UI contract adds the CSS constraints (the radio is never `display: none`, `visibility: hidden` or `hidden`, so it stays in the accessibility tree, e.g. `opacity: 0` stretched over the label; the label is `display: block`, `position: relative`, `min-height: 48px`) and states that the "Formation" and "Line-up" labels are non-heading `<p id>` elements, so the screen keeps exactly one heading.
- L6: the Changed Assumptions bullet about stacking is reworded as a DESIGN decision under DISCUSS D1, not a change.
- Accepted as is: `NewGame` still resets `formation`. The reviewer's simplicity concern (unreachable today) is noted in ADR-0007; it is kept deliberately as cheap future-proofing for "Save and continue" or "play again" (one assignment, one unit test).
- PO cycle-2 items: M-1 (Safari/iOS focus fallback) is removed by H1, and L-2 (non-heading labels) is resolved by L5.

`nw-solution-architect-reviewer`, cycle 2: approved with notes, no critical or high issue; H1, M1-M3 and the lows verified. Folded in after cycle 2 (the two-cycle limit is reached, so no third review): M-1, the iOS Safari claim is scoped to "expected, not probed in CI" in ADR-0008, the brief (port 14) and `environments.yaml`; the contract is probed on Chromium. L-1, the unreachable `document.activeElement` fallback is removed: `focusId` comes only from the dispatch argument, so `main.ts`'s read universe is unchanged. L-2, the brief's inventory says `main.ts` derives `formationLines` only. L-3, the `.focus(` grep check is a committed unit test. Accepted as is: L-4 (the 11-item expansion exists in `lineUp` and in the renderer; the renderer's output is pinned for all three formations by the e2e and the protected scenarios, and DISTILL may add a unit test that the renderer's items equal `lineUp`), L-5 (DISCUSS D5's "not destroyed" is refined to "re-created and refocused in the same task"; the roadmap outcome is unchanged, and the plan run, which holds the pre-approved product-owner decision, accepts the reinterpretation).

## Wave: DEVOPS

Lean, unattended. All nine decisions pre-answered. No platform change: phone-viewport Chromium in CI and the deployed Pages URL. Owner-locked paths (`.github/`, `factory/`, `scripts/`, `.nwave/`, `CLAUDE.md`, brief/scope, `tests/protected/`, `stryker.config.mjs`) are read-only. Machine-readable environments: `docs/feature/S-004/environments.yaml`. Inherits the S-003 DEVOPS setup (`docs/feature/S-003/environments.yaml`); only the deltas are recorded.

Checklist: ✓ existing infra reused | ✓ KPI mapped to instrument | ✓ rollback defined | ✓ mutation strategy (nightly-delta, inherited) | ⊘ new IaC/containers (none) | ⊘ server-side observability (no backend) | ⊘ continuous learning | ⊘ CLAUDE.md edit (already states strategy) | ⊘ `docs/product/kpi-contracts.yaml` (not created by S-001..S-003)

### Wave: DEVOPS / [REF] Environment matrix
| Env | URL | Runner | Purpose |
|---|---|---|---|
| local-dev | `http://localhost:5173/gaffer/` (`pnpm dev`) | dev machine | Iteration |
| local-preview | `http://localhost:4173/gaffer/` (`ci:serve`) | dev, CI, protected runner | Production build under test; unit, property, e2e and `tests/protected/S-001..S-004/` |
| production | `https://<owner>.github.io/gaffer/` | GitHub Pages | Live site; post-deploy smoke via `BASE_URL` |

No staging (static site, recreate). Client: Chromium, Pixel 7 profile, 390px viewport, in local-preview and production. Formation data is fixed and seed-independent, and the chosen formation lives in memory only, so every environment behaves the same. Chromium covers the tap and arrow-key focus paths; the focus restore does not depend on the platform focusing a radio on tap (the listener names the id, ADR-0008); iOS Safari is expected to behave the same but is not probed in CI.

### Wave: DEVOPS / [REF] CI/CD pipeline outline (existing, unchanged)
- `ci` (PR, push to main, dispatch): PR guards, roadmap lint, `ci:lint`, `ci:typecheck`, `ci:test` (fresh `FC_SEED`; the S-004 formation property tests honour it), `ci:build`, `ci:e2e`, protected-scenario no-regression check vs main.
- `deploy` (push to main): `ci:build`, deploy-pages, then `smoke` runs `ci:e2e` against the live URL (includes the new S-004 spec).
- `nightly`: `ci:mutation`; failure opens a `mutation-alarm` issue.
- `ai-review`, `factory-tick`, `watchdog`, `weekly-demo`: factory-owned, untouched.
- S-004 needs no pipeline change: it adds unit, property and e2e specs run by the existing scripts, and no new dependency (ADR-0007, ADR-0008: no new technology).
- Local gate: `pnpm run check` mirrors the commit stage. No git hooks (locked paths; CI is the gate).
- Security: no secrets, no runtime deps, no network. Formation names and position codes enter the DOM only via `el()`/`textContent` (ADR-0002); a review check, not a scenario. SAST/SCA/SBOM not added (workflows locked; inherited open question).

### Wave: DEVOPS / [REF] Monitoring contracts (DISCUSS KPI/AC to instrument)
E2E instrument is the new `tests/e2e/S-004-tactics.spec.ts` (Pixel 7, 390px), run by `ci:e2e` on PR and main and by `smoke` on the live URL after each deploy. "Unit" rows run in `ci:test` (fresh `FC_SEED`). `tests/protected/S-004/` runs on local-preview in `ci` and must pass on main.

| KPI / criterion (DISCUSS) | Instrument | Pass condition |
|---|---|---|
| KPI: club home to a chosen formation in 2 taps ("Tactics", then one formation) | e2e: page-side capture-phase click counter (as S-003 E1); assert heading "Tactics", then a formation checked | Exactly 2 clicks |
| KPI: back in 1 tap | e2e: count clicks on "Back"; assert heading is the club's name | Exactly 1 click |
| Tactics screen shape (new game) | e2e + `tests/protected/S-004/`: exactly one heading "Tactics", radiogroup "Formation" with 3 radios "4-4-2", "4-3-3", "4-2-3-1" in order, only "4-4-2" checked | holds |
| Focus on the `<h1>` on arrival | e2e: `document.activeElement` is the "Tactics" heading after tapping "Tactics"; `focusPlan` unit tests (Screen change gives heading) | holds |
| Focus on the tapped radio after choosing; heading stays | e2e: tap each label, assert the radio is the focused element, only it is checked, exactly one heading still "Tactics"; arrow-key path (`ArrowRight`: next radio checked and focused); `focusPlan` unit tests (same screen with id gives element, without id gives heading); unit grep test that no `.focus(` appears under `src/ui/` | holds |
| Line-up counts for the three formations | e2e + protected: list "Line-up" has 11 items, goalkeeper first then DF, MF, FW; 1/4/4/2, 1/4/3/3, 1/4/5/1 at `?seed=31` and `?seed=abc` (8th club). Unit: `lineUp` for each id (11 codes, GK first, non-decreasing order, counts), equals expansion of `formationLines`, deeply frozen, `isFormationId` rejects `"3-5-2"`, `""`, `"4-4-2 "` | holds |
| Session memory across Squad | e2e: choose "4-3-3", Back, Squad, a player, Back, Back, Tactics: "4-3-3" checked, same line-up. Unit: `update` keeps `formation` across navigation | holds |
| New game starts at 4-4-2 | e2e + protected: fresh page, "New game" (`?seed=31` and `?seed=abc`), club, Tactics: only "4-4-2" checked. Unit: `NewGame` resets to `DEFAULT_FORMATION`; `initialState` | holds |
| Tapping the checked formation changes nothing | unit: `ChooseFormation` with the same formation returns the same object; e2e: tap the checked label, no change | holds |
| D7 no-ops | vitest on `update`: `ViewTactics` from each other screen and unknown club; `ChooseFormation` off tactics, unknown club, unknown id; `Back` from tactics incl. unknown club; whole state equal except `formation`; no mutation | holds |
| 44px labels and buttons | e2e: `boundingBox().height >= 44` on "Tactics" (club home), "Back", and each formation label; tapping a label checks its radio | holds |
| No horizontal scroll at 390px | `scrollWidth <= clientWidth` on club home and tactics | holds |
| No console errors | `page.on("console"/"pageerror")` across club home, Tactics, each choice, Back, Squad, player, Back, Back, Tactics | zero |
| S-001..S-003 unchanged | existing e2e specs, acceptance tests and `tests/protected/S-001..S-003/` | green |
| Domain test strength | Stryker on `src/domain/**` (covers `formation.ts`) and `src/app/state.ts` (covers `update` and `focusPlan`) | nightly, at or above break threshold (70) |

No analytics (POC). The e2e tap count is the KPI's sole measurement.

### Wave: DEVOPS / [REF] Deployment strategy and rollback
- Strategy: recreate. Merge to main triggers `deploy`, replacing the whole static artifact. Idempotent: redeploying the same ref yields the same artifact.
- Rollback (designed first): revert the S-004 squash commit on main; the merge triggers `deploy` and `smoke` validates the restored site. Alternative: `workflow_dispatch` of `deploy.yml` on a known-good ref (the commit before the S-004 squash). Fallback: fix-forward on a `claude/*` branch. Per the S-003 record, the append-only protected-tests and no-regression guards may block a plain revert of a squash that added `tests/protected/S-004/`; if so, the dispatch route is the owner action. Time to restore: one deploy cycle (about 5 minutes).
- Failure detection: a red `smoke` job marks the deploy run red.
- Data: nothing is persisted and the formation is fixed data plus in-memory state, so no migration and no user data at risk. Rolling back removes the "Tactics" button and screen only.
- Blast radius: one static page.

### Wave: DEVOPS / [REF] Mutation testing strategy
nightly-delta, inherited from `CLAUDE.md`; `/nw-deliver` Phase 5 skipped. `stryker.config.mjs` mutates `src/domain/**/*.ts` except `names.ts`, plus `src/app/state.ts`; thresholds high 85, low 70, break 70.
- `src/domain/formation.ts` (new): covered by the existing `src/domain/**` glob. Tests that kill mutants must pin the three ids and their order, `DEFAULT_FORMATION`, each line count (1/4/4/2, 1/4/3/3, 1/4/5/1 with the two MF lines of 4-2-3-1), `lineUp` order and length 11, and `isFormationId` edge inputs.
- `src/app/state.ts` (`ViewTactics`, `ChooseFormation`, `Back` from tactics, `initialState`, `NewGame` reset, and the pure `focusPlan`): already listed; the no-op, same-object and whole-state-except-`formation` tests carry `update`, and the `focusPlan` tests (first render, each screen pair, same screen with and without id) must kill its mutants (screen-field comparison, the empty-id case). Because `focusPlan` lives in `state.ts`, it is covered with no owner action and no `stryker.config.mjs` change.
- Run by `nightly.yml` via `ci:mutation`; failure opens `mutation-alarm`, `needs-human`.

### Wave: DEVOPS / [REF] Observability stack
Browser console plus Playwright smoke on the deployed URL only. No RUM, error tracking, logs or tracing. SLO: smoke green per deploy. Alerting: a red `deploy` run. No dashboards.

### Wave: DEVOPS / [REF] Branching strategy
Trunk-based. Short-lived `claude/S-004-*` branches, PR to main, squash merge. CI green and protected scenarios not regressing. Deploy fires on merge. No release branches.

### Wave: DEVOPS / [REF] Coexistence matrix
| Component | S-004 impact | Action |
|---|---|---|
| `ci.yml`, `deploy.yml`, `nightly.yml` | none; run existing `ci:*` scripts | reuse |
| `ci:*` scripts, `playwright.config.ts` | none; Pixel 7, 390px, `BASE_URL` already fit | reuse |
| `stryker.config.mjs` | `src/domain/**` covers `formation.ts`; `src/app/state.ts` covers `focusPlan`; no change needed | none |
| `tests/protected/S-001..S-003/` | club home gains a "Tactics" button; they find "Squad" and "Back" by name and do not count club home buttons | must stay green |
| `tests/protected/S-004/` | locked scenario for this story | must pass on main |
| `tests/acceptance/S-001/navigation.test.ts`, `S-002/navigation.test.ts`, `S-003/player-navigation.test.ts` | `GameState` fixtures need the new required `formation` field (types only) | add `formation: DEFAULT_FORMATION` or use `initialState`; assertions and counts unchanged |
| `tests/e2e/S-001..S-003*.spec.ts`, `shell.spec.ts` | focus on `<h1>` after navigation still holds (ADR-0008) | reuse unchanged, regression-watch |
| `tests/e2e/S-004-tactics.spec.ts`, `tests/acceptance/S-004/` | new specs | add (DISTILL) |
| `src/domain/formation.ts`, `src/ui/screens/tactics.ts` | new | S-004 tests guard |
| `src/app/state.ts`, `src/ui/screens/club-home.ts`, `src/main.ts`, `src/ui/styles.css` | extended | S-001..S-003 tests guard |
| Pages artifact | grows slightly; base path `/gaffer/` unchanged | none |

### Wave: DEVOPS / [REF] Pre-requisites
- S-003 delivered and deployed; GitHub Pages source "GitHub Actions" enabled (✓).
- Node 22 or later, pnpm 10.12.4 pinned, Playwright chromium via `.github/actions/setup`.
- ADR-0001..0008 accepted (✓; ADR-0007 and ADR-0008 landed in DESIGN, before DELIVER).
- `BASE_URL` derived from repository owner and name (no secret).

### Wave: DEVOPS / [REF] Open questions
Owner-only items inherited from S-001..S-003 (smoke `sleep 20`, no security scanning, smoke has no commit-SHA check, deploy not gated on `ci`, squash revert possibly blocked by the append-only guards, no uptime probe) are unchanged and none block S-004. New:
1. No `.github/` or `stryker.config.mjs` change is needed for S-004 (`focusPlan` lives in `src/app/state.ts`, already under Stryker's `mutate` glob).
2. Smoke on the live URL runs the S-004 e2e spec too; it relies on `?seed=` being honoured on Pages (same as S-001..S-003).

## Wave: DISTILL

Unattended. Language: TypeScript; runners: vitest + fast-check (`FC_SEED` honoured through `tests/setup/fast-check-seed.ts`) and Playwright (Pixel 7, 390px). No Gherkin runner exists, so scenarios are `describe/it` blocks whose titles read Given/When/Then in domain language, with `@tags` and `@contract-shape:<pure-function|bounded-change|unbounded-preservation>` in every title and a `CONTRACT_SHAPE` + outcome-anchor header, as in S-003 (domain files `pure-function`; `update`, `focusPlan` navigation and the e2e specs `bounded-change`; no `unbounded-preservation` shape applies: nothing is written outside the screen). Wave-decision reconciliation: DISCUSS, DESIGN and DEVOPS read, 0 contradictions (the DISCUSS D5 "not destroyed" refinement and the stacking choice are recorded in DESIGN "Changed Assumptions"). Only `discuss/journey.md` exists under `discuss/`; the decisions live in this file. The test sources that bind DELIVER were not derived from `tests/protected/` (not opened).

### Wave: DISTILL / [REF] Hand-off model: green tree, new-behaviour specs held out until DELIVER (Mandate 7 adapted)
CI forbids committing failing, skipped or `.todo` tests, and test counts may only go up. As in S-003:
- **Committed and running now (green regression guards):** `tests/acceptance/S-004/existing-navigation-unchanged.test.ts` (3 tests: club home, Squad, a player, Back, Back unchanged; built without naming the new `formation` field, so it compiles before and after DELIVER), `tests/unit/ui/renderers-never-move-focus.test.ts` (1 test: no `.focus(` under `src/ui/`, ADR-0008 enforcement), `tests/e2e/S-004-club-home-regression.spec.ts` (1 test: the club home's heading is the club name and focused, every club-home button is 44px or taller, no sideways scroll, "Squad" then "Back" still work; it never names "Tactics"). Net: `ci:test` 163 to 167, `ci:e2e` 40 to 41.
- **Held out, complete and verified:** four executable specs stored as `docs/feature/S-004/distill/pending/**/*.pending` (outside every glob: `vitest include`, `tsc include`, `oxlint .`, Playwright `testDir`). Nothing skipped, weakened or marked todo; they are simply not in the tree yet.
- **Verification done in DISTILL** (`distill/verification-note.md`): a throwaway reference implementation in a scratch git worktree (since removed) made all 160 held-out vitest cases and the 14 held-out e2e cases pass, with lint and typecheck clean and the three existing fixtures fixed; five seeded faults in the reference (focus plan ignoring the id, same-formation guard removed, a wrong 4-2-3-1 line, 20px labels) were each caught. In the real repo the same files are lint-clean and fail only for missing symbols/module (RED for missing functionality).
- **No scaffold stubs in `src/`:** a throwing stub would turn the committed run red. The scaffold equivalent is the `.pending` files plus the exact-symbol list below.
- **DELIVER mechanics:** `git mv` each file to its destination, dropping `.pending`, in the same commit as the code that makes it green. Never edit an assertion to fit the implementation; if one is wrong, record it in `distill/upstream-issues.md`.

### Wave: DISTILL / [REF] Scenario list with tags
Tier A only (production code: real `lineUp`, `update`, `focusPlan`, the built app). Tier B skipped: the journey is 4 chained steps over a tiny input space (3 formations); property tests over all formations and screens already cover it.

| # | Scenario (title in the file) | File | Tags | Kind |
|---|---|---|---|---|
| R1 | Walk Squad, a player, Back, Back from any club home: club home again, league untouched | `existing-navigation-unchanged.test.ts` (committed) | `@regression @property` | PBT |
| R2 | Club home, Squad: that club's squad | same | `@regression @driving_port` | example |
| R3 | Back on the club home changes nothing | same | `@regression @error` | example |
| R4 | No screen renderer under `src/ui` calls `.focus()` | `tests/unit/ui/renderers-never-move-focus.test.ts` (committed) | `@regression` | example |
| R5 | Club home: heading is the club name and focused, buttons 44px or taller, no sideways scroll, Squad/Back work, no console errors | `tests/e2e/S-004-club-home-regression.spec.ts` (committed) | `@regression` | e2e |
| F1 | Formations are 4-4-2, 4-3-3, 4-2-3-1 in order; default 4-4-2 | `formation.test.ts` | `@driving_port` | example |
| F2 | Each line-up reads exactly its 11 codes (3 cases, independent expected data) | same | `@driving_port` | example |
| F3 | Any formation: 11 slots, one GK first, non-decreasing GK/DF/MF/FW, 4 DF | same | `@property` | PBT |
| F4 | 4-2-3-1 has 5 MF and 1 FW; 4-3-3 has 3 FW; 4-4-2 has 2 FW | same | `@boundary` | example |
| F5 | Pitch lines per formation (4-2-3-1 has MF 2 then MF 3) | same | | example |
| F6 | Line-up equals the lines expanded; counts are positive integers | same | `@property` | PBT |
| F7 | Data deeply frozen: list, each lines array, each line | same | `@boundary` | example |
| F8 | Reading twice gives equal answers and does not change the data | same | `@property` | PBT |
| F9 | No ambient randomness or wall-clock time | same | `@determinism` | example |
| F10 | Three names accepted; 12 other texts rejected (`3-5-2`, empty, trailing/leading space, newline, `442`, prefix names, `constructor`, `__proto__`, `toString`, `hasOwnProperty`); any other text rejected; type guard narrows | same | `@error @property` | example + PBT |
| T1 | `initialState`: title, 4-4-2; New game keeps 4-4-2; New game from a title holding 4-3-3 or 4-2-3-1 resets to 4-4-2 | `tactics-navigation.test.ts` | `@driving_port` | example |
| T2 | New game anywhere but the title changes nothing | same | `@error` | example |
| T3 | Club home, Tactics: that club's tactics, formation unchanged; any club, any held formation | same | `@walking_skeleton @driving_port @property` | example + PBT |
| T4 | Tap 4-3-3: only the formation changes; any from-to pair: league and screen objects untouched | same | `@walking_skeleton @driving_port @property` | example + PBT |
| T5 | Tap the formation already chosen: the very same state object (3 cases) | same | `@boundary` | example |
| T6 | Back from tactics: same club's home, formation kept | same | `@walking_skeleton` | example |
| T7 | Any seed: the same choice gives the same line-up | same | `@property` | PBT |
| T8 | Back, Squad, a player (any row), Back, Back, Tactics: formation kept (any formation); the DISCUSS 4-3-3 example; whole walk from the title | same | `@walking_skeleton @property` | PBT + examples |
| T9 | Tactics from title, club list, squad, player, tactics, unknown club home (6 cases): no change | same | `@error` | example |
| T10 | Choosing on title, club list, club home, squad, player, tactics of an unknown club: no change (6 cases) | same | `@error` | example |
| T11 | Unknown formations `3-5-2`, empty, `4-4-2 `, ` 4-3-3`, `4-2-3-1\n`, `constructor`, `__proto__` (7 cases) and any other text: no change | same | `@error @property` | example + PBT |
| T12 | Back on tactics of an unknown club; other actions on tactics: no change | same | `@error` | example |
| T13 | Deep-frozen states: opening, choosing, Back, bad choice mutate nothing | same | | example |
| T14 | Squad, player 17, Back, Back with a formation held: formation untouched | same | | example |
| P1 | First render (any screen, with or without an id): heading (9 cases) | `focus-plan.test.ts` | | example |
| P2 | Different screen (72 ordered pairs, with and without an id): heading, incl. same club different screen kind | same | `@driving_port` | example |
| P3 | Only the club differs, or only the player index differs: heading | same | `@boundary` | example |
| P4 | Same screen with `formation-4-4-2` / `-4-3-3` / `-4-2-3-1`: that element | same | `@walking_skeleton @driving_port` | example |
| P5 | Same screen without an id, or with an empty id: heading | same | `@boundary @error` | example |
| P6 | Equal copies count as the same screen | same | `@boundary` | example |
| P7 | Any previous/next/id: element exactly when same screen and non-empty id, else heading; inputs not changed | same | `@property` | PBT (2) |
| E1 | Tactics (club home to 4-3-3 in 2 taps, 1 tap Back): heading focused on arrival, group, radio focused after tap, Back to club home focused | `S-004-tactics.spec.ts` | `@walking_skeleton @kpi` | e2e |
| E2 | New game opens Tactics on 4-4-2 with GK, 4 DF, 4 MF, 2 FW; one heading, one radiogroup, 3 radios named in order, one list (`?seed=31` club 0; `?seed=abc` club 8; 2 cases) | same | | e2e |
| E3 | Tap 4-2-3-1, 4-3-3, 4-4-2: line-up 1/4/5/1, 1/4/3/3, 1/4/4/2, the tapped radio focused, heading not focused, same for both seeds (2 cases) | same | `@example` | e2e |
| E4 | Tactics, Back, each formation label 44px or taller; label is the radio's visible name; tapping it checks the radio | same | | e2e |
| E5 | 4-3-3, Back, Squad, Back, Tactics: 4-3-3 kept with its line-up, heading focused | same | | e2e |
| E6 | 4-2-3-1 kept after Squad, a player, Back, Back (`?seed=abc`, club 8) | same | | e2e |
| E7 | Fresh visit and New game start at 4-4-2 again, `?seed=31` and `?seed=abc` | same | `@error` | e2e |
| E8 | Tapping the checked formation changes nothing | same | `@boundary` | e2e |
| E9 | Arrow keys: next formation checked and focused, heading stays | same | | e2e |
| E10 | Back by keyboard | same | | e2e |
| E11 | No sideways scroll at 390px on the club home and tactics for every formation | same | | e2e |
| E12 | No console errors across the whole journey | same | | e2e |

Counts: 5 committed now (R1-R5); 160 vitest cases held out (formation 28, tactics-navigation 41, focus-plan 91, the latter 72 of them the P2 pairs); 14 e2e cases (E1-E12, E2 and E3 doubled). Error/edge share of the 174 held-out cases, by tag: 38 `@error` (F10 13, T2 1, T9 6, T10 6, T11 8, T12 2, P5 1 counted, E7 1) plus 10 `@boundary` = 48/174 = 28%. This is under the 40% target. **Waiver:** the feature is a display plus one state field; every invalid input that can reach it (unknown formation text, wrong screen, unknown club, repeat tap, empty focus id) is enumerated above, and further cases would repeat the same no-op. The e2e tier has one sad path (E7) and one boundary (E8): the other failure modes (unknown formation, wrong screen, unknown club) are unreachable from the UI and are covered at the `update` level (T9-T12). **Waiver (environment):** E1-E12 run on local-preview and on a `BASE_URL` deployment; local-dev is not a supported target for the spec. Viewport is the Pixel 7 profile at 390px from `playwright.config.ts`; "fresh visits" are new pages of the same browser context (nothing is persisted).

### Wave: DISTILL / [REF] WS strategy (Architecture of Reference)
- Driving ports: in-process pure calls (`lineUp`, `formationLines`, `isFormationId`, `initialState`, `update`, `focusPlan`) and the built browser app at `http://localhost:4173/gaffer/`. All real; no DI container exists.
- Driven ports: none (no storage, clock, network; the formation is in memory only). Nothing to fake. The seeded `createRng` is not used by this feature.
- Walking skeleton: extends the S-001..S-003 skeleton by one branch. Browser proof: E1 (and E5). Domain proof: T3+T4+T6 and T8. Litmus: the title is a user goal (open Tactics, pick a shape, come back) and the Then is what Sam reads.
- Infrastructure policy: as S-003, no `docs/architecture/atdd-infrastructure-policy.md`; "everything real, nothing faked". Mandate 8 is met by comparing whole `GameState` values (league + screen + formation, a closed universe) and by the deep-freeze no-mutation test T13.

### Wave: DISTILL / [REF] Adapter coverage table
There are no driven adapters (DESIGN, "Driven ports and adapters": none).

| Adapter | @real-io scenario | Covered by |
|---|---|---|
| (none) | n/a | n/a; the one environmental assumption (a re-rendered node with the same id can be focused in the same task, a native radio group keeps one checked) is probed by E1, E3, E9 on the built app (ADR-0008 Earned Trust) |

### Wave: DISTILL / [REF] Scaffolds
No `__SCAFFOLD__` stubs are written under `src/` (a throwing stub would turn the committed run red). Symbols DELIVER must export, all used by the held-out tests:
- `src/domain/formation.ts`: `FormationId` (`"4-4-2" | "4-3-3" | "4-2-3-1"`), `FormationLine { position: Position; count: number }`, `FORMATIONS` (deeply frozen `readonly FormationId[]`, in UI order), `DEFAULT_FORMATION` (`"4-4-2"`), `isFormationId(value: string): value is FormationId` (must reject `constructor`, `__proto__`, `toString`: no object-key lookup), `formationLines(f): readonly FormationLine[]` (frozen array of frozen lines; 4-2-3-1 is GK 1, DF 4, MF 2, MF 3, FW 1), `lineUp(f): readonly Position[]` (derived from the lines).
- `src/app/state.ts`: `Screen` gains `{ kind: "tactics"; clubId }`; `Action` gains `{ type: "ViewTactics" }` and `{ type: "ChooseFormation"; formation: FormationId }`; `GameState.formation: FormationId` (required); `initialState(league)` (title screen, `DEFAULT_FORMATION`); `focusPlan(previous: Screen | undefined, next: Screen, focusId: string | undefined)` returning `{ kind: "heading" }` or `{ kind: "element", id }`; screens compared by value (copies with equal fields are the same screen). `NewGame` from the title resets `formation` to `DEFAULT_FORMATION`; from any other screen it changes nothing. Choosing the current formation returns the same object. A no-op returns an equal state.
- UI contract (brief port 14; roles and names only): the club home button "Tactics" (exact name, 44px or taller); on the tactics screen exactly one heading (any level) "Tactics", exactly one `radiogroup` named "Formation" holding exactly three `radio`s named "4-4-2", "4-3-3", "4-2-3-1" in that order, exactly 3 radios on the page, exactly one `list` on the page (named "Line-up") with 11 `listitem`s whose text is exactly the code, and a button "Back" (exact, 44px or taller). The element found by `group.getByText(name, { exact: true })` must itself be 44px or taller and clicking it must check the radio, so the formation name must be a direct text node of the tall `<label>` (not inside a short inner span); `group.getByLabel(name, { exact: true })` must resolve to exactly one element. Radio ids are `formation-<name>` and the `change` listener passes the id as `focusId`.
- Learned from the scratch run: `oxlint` caps cyclomatic complexity at 15 (one helper per action) and test-side `max-params` is 3. `main.ts` needs `CSS.escape` for the id selector. The tap counter in E1 counts `pointerdown`, not `click`, because a label tap also clicks its radio.

### Wave: DISTILL / [REF] Test placement
`tests/acceptance/S-004/` (vitest, same convention as S-001..S-003), `tests/unit/ui/` (the structural `.focus(` guard, ADR-0008) and `tests/e2e/S-004-tactics.spec.ts` plus `tests/e2e/S-004-club-home-regression.spec.ts` (DEVOPS coexistence matrix). Held-out sources live in `docs/feature/S-004/distill/pending/{acceptance,e2e}/` as `*.pending`. Existing tests are untouched; DELIVER edits the three fixtures listed in step 02.

### Wave: DISTILL / [REF] Driving port coverage
| Port (brief 11-14) | Scenarios |
|---|---|
| 11 formation data (`FORMATIONS`, `DEFAULT_FORMATION`, `lineUp`, `formationLines`, `isFormationId`) | F1-F10, T7, E2, E3 |
| 12 `update` with `ViewTactics`, `ChooseFormation`, `Back`, `NewGame`, `initialState` | T1-T14, R1-R3 |
| 13 `focusPlan` | P1-P7, R4 |
| 14 UI: "Tactics" button, tactics screen, "Back" | E1-E12, R5 |
Ports 1-10 are unchanged and covered by S-001..S-003 tests. Driving adapters (CLI/HTTP/hook): none; the browser app is covered by E1-E12.

### Wave: DISTILL / [REF] DEVOPS monitoring-contract trace
| Contract row | Scenario |
|---|---|
| KPI 2 taps to a chosen formation, 1 back | E1 (pointerdown counter) |
| Tactics screen shape (new game) | E2, F1, F2, T1 |
| Focus on the `<h1>` on arrival | E1, E2, E5; P1, P2 |
| Focus on the tapped radio, heading stays; arrow keys | E1, E3, E9; P4, P5, P7; R4 |
| Line-up counts for the three formations, both seeds | E3, F2-F6, T7 |
| Session memory across Squad | E5, E6, T8 |
| New game starts at 4-4-2 | E2, E7, T1, F1 |
| Tapping the checked formation changes nothing | T5, E8 |
| D7 no-ops | T9-T12 |
| 44px labels and buttons | E4, R5 |
| No horizontal scroll | E11, R5 |
| No console errors | E1, E12, R5 |
| S-001..S-003 unchanged | R1-R3, R5, existing suites |
| Stryker strength | F2, F4, F5, F10, T5, T11, P5-P7 pin the three ids, order, counts, the two MF lines, edge inputs, the empty-id and screen-field cases |

### Wave: DISTILL / [REF] DELIVER step plan (which files to add, and when)
1. **Step 01, formation data** (developer-facing, not shipped alone): implement `src/domain/formation.ts` per ADR-0007. First run the committed guards and see them green. `git mv` `formation.test.ts.pending` to `tests/acceptance/S-004/formation.test.ts`; confirm RED for the missing module before coding, then GREEN. Gates: `ci:lint`, `ci:typecheck`, `ci:test`.
2. **Step 02, state, fixtures, focus plan** (one commit, so the tree is never red): `GameState.formation`, `initialState`, `Screen`/`Action` variants, `update` cases (one helper per action), `focusPlan` in `src/app/state.ts`; `src/main.ts` switches to `initialState(...)` (types only; the screen is step 03). Add `formation: DEFAULT_FORMATION` (or use `initialState`) to the `GameState` literals in `tests/acceptance/S-001/navigation.test.ts`, `S-002/navigation.test.ts` and `S-003/player-navigation.test.ts` (types only; assertions and counts unchanged). In the same commit move in `tactics-navigation.test.ts.pending` and `focus-plan.test.ts.pending`. `existing-navigation-unchanged.test.ts` stays green.
3. **Step 03, screen, button, focus execution** (one commit): `src/ui/screens/tactics.ts`, the club-home "Tactics" button in `div.club-actions`, the `main.ts` tactics case, `dispatch(action, focusId?)` and the focus plan executed (heading, or the element with the id, falling back to the heading), CSS. In the same commit move in `e2e/S-004-tactics.spec.ts.pending` as `tests/e2e/S-004-tactics.spec.ts`. `ci:e2e`, `tests/e2e/S-004-club-home-regression.spec.ts` and `tests/protected/S-001..S-003` must pass.
4. Delete `docs/feature/S-004/distill/pending/` once all four files are moved; zero `.pending` files is the DISTILL-to-DELIVER completion check.

### Wave: DISTILL / [REF] Pre-requisites
DESIGN: ADR-0007, ADR-0008 and brief ports 11-14 (read). DEVOPS: local-preview `http://localhost:4173/gaffer/` via `ci:serve`, Pixel 7 at 390px, `FC_SEED` per CI run, `BASE_URL` for post-deploy smoke (the e2e uses `?seed=`, roles and names only, so it holds on Pages). No new dependency.

### Wave: DISTILL / [REF] Mandate checks (adapted)
- CM-A: tests import only `FORMATIONS`, `DEFAULT_FORMATION`, `lineUp`, `formationLines`, `isFormationId`, `initialState`, `update`, `focusPlan`, `generateLeague`; UI tests enter through the built app by role and name. CM-B: titles use domain terms (formation, line-up, Tactics, Back, Squad). CM-D: pure functions are tested against independent expected data (written out from DISCUSS D4) and an independent reference of the focus rule. CM-F: PBT only in layer 1-2 files; e2e is example-only with named sad paths (E7, E8). Mandate-12 domain types/DSL and step-reuse-ratio do not apply: there are no Gherkin steps; e2e helpers (`openTactics`, `expectChosen`) hold no business logic beyond the expected tables written out in the file.
- Open points for DELIVER: (1) DISCUSS D5 "must not be destroyed" is refined by DESIGN to "re-created and refocused in the same task"; E1/E3/E9 assert the observable outcome only (the tapped radio is the focused element). (2) The DISCUSS "Tactics" example clubs are by ordinal and not asserted by name. (3) `focusPlan` tests live in `tests/acceptance/S-004/` (not a separate unit folder) so that they are counted with the story.
- Peer review: the four-reviewer gate was not dispatched in this unattended run (none requested); the held-out files were instead executed against the reference above, and seeded faults were shown to fail them.
