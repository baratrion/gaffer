# S-003: View a player's details

## Wave: DISCUSS

Lean, unattended. Reuses `discuss/journey.md`. The outcome is the owner draft for S-003 ("Tapping a player in the squad shows their attributes (4-6 numeric attributes on a 1-20 scale) and current condition (0-100%), with a way back to the squad list"), narrowed by scope.md precedence (ship less). Feature type: user-facing. UX depth: lightweight. No DIVERGE artifact (accepted as lean, as for S-002).

### Wave: DISCUSS / [REF] Scope Assessment
PASS: 1 story, 1 context ("League setup", extended), 1 releasable carpaccio slice (domain precursor commit plus screen commit), about 2-3 days. Walking skeleton extends S-002 by one step (squad, player, back). No oversized signal.

### Wave: DISCUSS / [REF] Persona
Sam, 34, a lapsed Championship Manager fan. Plays on the bus, one-handed, on a mid-range Android phone at 390px wide, with 5 minutes to spare (persona established in `docs/feature/S-001/feature-delta.md`; player from brief.md, "Player"). Has just looked at the squad and wants to know why one player is better than another before picking a team.

### Wave: DISCUSS / [REF] JTBD one-liner
When I am weighing up who should play, I want to see what each player is good at and how fit they are, so that I can pick a team I believe in. (Recorded as J-03 `judge-a-player` in `docs/product/jobs.yaml`; it follows J-02.)

### Wave: DISCUSS / [REF] Locked decisions
- D1 Tappable rows: each squad row becomes exactly one real `<button>` (44px or taller) inside its `<li>`. The row text is unchanged (name, position, age, overall; age and overall still the first two numbers), so the S-002 protected scenarios still hold. Supersedes the S-002 DISCUSS decision "Squad rows are display-only (not buttons); player detail is a later story". The architecture brief's squad line ("listitems, not buttons") still stands until DESIGN supersedes it with an ADR, which must land before DELIVER; the e2e test replacement below follows that ADR.
- D2 Attributes: exactly 4 (the narrower end of 4-6), with fixed labels in this order: "Goalkeeping", "Defending", "Passing", "Shooting". Each is a whole number from 1 to 20. Each attribute matters most for one position line (GK, DF, MF, FW), so the starting-XI and match stories can use them.
- D3 Condition: a whole percentage from 0 to 100, shown as for example "Condition 92%". Generated per player from the seed. The generator range is a DESIGN decision and may be narrower than 0-100 (as age is 17-35 inside 16-40). There are no matches yet, so condition does not change in this story.
- D4 Overall agrees with attributes (ADR-0004 and ADR-0005 (e) anticipated this): the overall on the player screen equals the overall in the squad row, and lies between the player's lowest and highest attribute, inclusive. The formula is a DESIGN decision and supersedes ADR-0005 (e) through an ADR. It may change the S-002 squads for a given seed; that is acceptable (no persistence, and the S-002 protected scenarios assert properties only).
- D5 Player screen: exactly one `<h1>`, the player's full name. "Position" (GK, DF, MF or FW), "Age" and "Overall" each shown as the label followed by its value. A list named "Attributes" with exactly 4 items in D2 order, each item the attribute name followed by its value and no other number. "Condition" shown outside that list as the label followed by "N%". A button named exactly "Back" (44px or taller). Position, age and overall equal the tapped row's values. Testable by visible text: each label and its value read together, for example "Position GK", "Age 27", "Overall 14", "Condition 92%" (markup, for example a description list, is for DESIGN).
- D6 Same seed, same club and same row give an identical player screen on every visit. Derived on render from the seed (ADR-0005 (d)); not stored, not persisted. The players of one squad do not all share the same attributes.
- D7 Navigation: `Screen` gains a player variant (club and player index); `Action` gains a view-player action. "Back" from the player screen goes to the same club's squad; "Back" from the squad still goes to club home. Wrong-screen actions are no-ops, as before. Names and shapes are for DESIGN (ADR-0003).
- D8 Phone first: no horizontal scroll at 390px, no console errors, focus moves to the new `<h1>` (existing shell behaviour), generated text through `el()`/`textContent` only (ADR-0002).
- UX depth: no mockups beyond the journey table.

### Wave: DISCUSS / [REF] Story map and priority
Backbone: pick club, club home, squad, **player**, back. Walking skeleton = the existing S-001/S-002 path plus one step (squad row to player screen and back). One release, one story, one releasable slice (`slices/slice-01-player-details.md`), delivered as a domain precursor commit (attributes, condition, derived overall; not shipped alone) followed by the tappable rows, player screen and Back. Priority rationale: S-004/S-005 (formation, starting XI) need attributes to make "best rating per position" meaningful, so this story comes first in week 1.

### Wave: DISCUSS / [REF] User stories

#### US-1: See what a player is good at
**Problem:** Sam can see 18 names with an overall rating, but two players rated 14 can be very different. Without knowing what each player is good at and how fit they are, picking a team is a guess.
**job_id:** J-03
**Elevator Pitch**
- Before: the squad list shows each player's name, position, age and overall, and nothing more.
- After: on the squad list Sam taps a player's row and sees that player's name as the heading, their position, age and overall, four attributes (Goalkeeping, Defending, Passing, Shooting) on a 1-20 scale and their condition as a percentage, then taps "Back" to return to the squad.
- Decision enabled: is this player good enough, and fit enough, to start in that position?

**Domain examples**
1. Sam opens `?seed=31`, picks the first club, taps "Squad" and taps the row "Tomas Brenning GK 27 14". The heading reads "Tomas Brenning"; Position GK, Age 27, Overall 14; Attributes: Goalkeeping 15, Defending 12, Passing 11, Shooting 4; Condition 92%. (Illustrative values, not fixtures: the generator fixes the real ones. They agree with the ADR-0006 formula: (7x15 + 1x12 + 2x11 + 0x4 + 5) / 10 rounds down to 14, which lies between 4 and 15.)
2. Sam taps "Back", sees the same club's 18-player squad, taps the last row, a forward "Ivo Marsh FW 22 11", and sees Goalkeeping 2, Defending 6, Passing 12, Shooting 12, Condition 85% ((0x2 + 1x6 + 3x12 + 6x12 + 5) / 10 rounds down to 11, between 2 and 12). Sam taps "Back" twice and is on the club home, headed by the club's name.
3. Sam opens `?seed=abc` (invalid, so the default seed is used), picks the 8th club and taps a goalkeeper's row: the player screen still shows Position GK, four attributes and a condition. Opening the same link and row in a fresh visit shows the identical screen.

**Acceptance criteria (embedded UAT)**
- Scenario: Tapping a player shows who they are.
  Given Sam is looking at the list named "Squad", when Sam taps a player's row, then the screen has exactly one heading, which is that player's name, and shows "Position", "Age" and "Overall", each label followed by the same value as in the tapped row (for example "Position GK", "Age 27", "Overall 14").
- Scenario: Sam sees the player's four attributes and condition.
  Given Sam has tapped a player's row in the squad, when Sam reads the player screen, then a list named "Attributes" holds exactly 4 items, "Goalkeeping", "Defending", "Passing" and "Shooting" in that order, each followed by a whole number from 1 to 20 and no other number, and, outside that list, "Condition" is followed by a whole percentage from 0 to 100 (for example "Condition 92%").
- Scenario: The overall agrees with the attributes.
  Given Sam has tapped a player's row in the squad, when Sam compares the player's "Overall" with the four attribute values, then the overall is at least the lowest attribute and at most the highest attribute.
- Scenario: The same link gives the same player, and players differ.
  Given Sam opened `?seed=31` and noted every player screen of the first club, when Sam opens `?seed=31` again in a fresh visit and taps the same rows, then each player screen is identical, and the 18 players of that squad do not all have the same four attribute values.
- Scenario: Back goes from the player to the squad, then to the club home.
  Given Sam is on a player's screen, when Sam taps the button named "Back", then the heading is the club's name and the list named "Squad" has 18 items; and when Sam taps "Back" again, the heading is the club's name, the "Squad" list is gone and the "Squad" button is visible.
- Scenario: Goalkeepers and forwards open, even with an invalid seed.
  Given Sam opens `?seed=abc` (invalid, so the default-seed league is used) and views the 8th club's squad, when Sam taps a goalkeeper's row (position GK) and, after "Back", a forward's row (position FW), then the player screens show Position GK and Position FW respectively, each with exactly 4 attributes and a condition.
- Scenario: The squad and player screens fit a phone.
  Given Sam is on a 390px-wide phone viewport, when Sam taps "Squad" and then a player's row, then each of the 18 rows in the list "Squad" holds exactly one button at least 44px tall, the "Back" button on the player screen is at least 44px tall, neither screen scrolls sideways, focus is on the player screen's heading, and no errors appear in the browser console.

Notes for DESIGN and DISTILL (not part of the AC): labelled values are checked by visible text ("Position GK", "Age 27", "Overall 14", "Condition 92%"). D7 wrong-screen no-ops (view-player from any screen but the squad, `Back` from the player screen with an unknown club or a player index outside 0-17) are unit tests on `update`, as in S-002. D8's `el()`/`textContent` rule is a code-review and ADR-0002 check, not a scenario. The domain property (4 attributes 1-20, condition 0-100 inside the DESIGN range, overall within [min, max] attribute, deep-equal for the same seed and club) is covered by property tests on the squad generator. The S-002 e2e test "squad rows are display-only, not buttons" (`tests/e2e/S-002-squad.spec.ts`) contradicts D1: DELIVER must replace it (renamed, never deleted) with a stronger per-row assertion: the list has 18 items and each item holds exactly one button, so the e2e test count does not drop.

**Outcome KPI:** Sam goes from the squad list to a player's details in 1 tap, and back in 1 tap (measured by the e2e smoke tap count; no analytics in the POC). Baseline: not possible (no player screen).
**Technical notes:** squad generator and `Player` in `src/domain/squad.ts` (ADR-0004, ADR-0005). `Screen`/`Action`/`update` in `src/app/state.ts` (ADR-0003). `el()` for the player view and row buttons (ADR-0002). Depends on S-002 (squad list, Back).

### Wave: DISCUSS / [REF] DoD
- `tests/protected/S-003/` passes on main; `tests/protected/S-001/` and `tests/protected/S-002/` still pass.
- Unit and property tests for attributes, condition, derived overall and navigation pass. The `ci:*` scripts are green.
- The e2e phone-viewport smoke covers squad, player, back, back. The S-002 "display-only" e2e test is replaced, not deleted (test count does not drop).
- No ambient randomness or wall-clock time in `src/domain/`.

### Wave: DISCUSS / [REF] Out-of-scope
Editing anything, sorting or filtering, condition changing over time, injuries, morale, form, player development or training (OUT tag `training`), photos, kits, more than 4 attributes, swiping to the previous or next player, condition or attributes in the squad row.

### Wave: DISCUSS / [REF] WS strategy
Extends the S-002 walking skeleton (club home, squad, back) by one step: squad, player, back. The e2e journey "Squad, tap a row, Back, Back" is the end-to-end proof. One releasable carpaccio slice, `slices/slice-01-player-details.md`, delivered as two commits: a domain precursor commit (attributes, condition, derived overall; developer-facing, never shipped alone) then the tappable rows, player screen and Back. (Peer review: an `@infrastructure`-only slice is not allowed, so the earlier two-slice split was merged.)

### Wave: DISCUSS / [REF] Driving ports
- Squad generator `generateSquad(seed, clubIndex)`: each `Player` gains the 4 attributes and condition; `overall` derived (shape for DESIGN).
- `update(GameState, Action) => GameState` with a view-player action and `Back` from the player screen.
- UI entry: the 18 row buttons in the list named "Squad", the player screen (`<h1>` = player name, "Position", "Age", "Overall", list "Attributes", "Condition"), and the button named "Back", reachable by role and accessible name at `http://localhost:4173/gaffer/`.

### Wave: DISCUSS / [REF] Pre-requisites
- S-002 delivered (squad screen, `generateSquad`, `deriveSeed`, `Back`).
- ADR-0002..0005 accepted. Expected from DESIGN: an ADR (or superseding note) for attributes, condition range and the derived-overall formula (supersedes ADR-0005 (e)); an ADR superseding the architecture brief's squad row "not buttons" line (before DELIVER).
- `docs/product/jobs.yaml` now has J-03 (resolved).
- Open items for DESIGN/DISTILL: (1) replace the S-002 e2e "display-only" test as above; (2) the derived overall may reshuffle S-002 overalls per seed; (3) whether attributes lean towards the player's position is a DESIGN choice and is not asserted by the AC.

### Wave: DISCUSS / [REF] DoR validation
| # | Item | Status | Evidence |
|---|---|---|---|
| 1 | Problem clear, domain language | PASS | US-1 Problem: two 14-rated players can differ; picking is a guess |
| 2 | Persona specific | PASS | Sam, 34, one-handed on a bus, 390px Android, 5 minutes |
| 3 | 3+ domain examples, real data | PASS | Examples 1-3: `?seed=31` GK Tomas Brenning, FW Ivo Marsh, `?seed=abc` 8th club |
| 4 | UAT Given/When/Then, 3-7 | PASS | 7 scenarios |
| 5 | AC derived from UAT | PASS | Embedded scenarios are the AC; D1-D6 and D8's phone rules by scenario; D7 no-ops and D8 `el()` by unit tests and review (Notes) |
| 6 | Right-sized | PASS | 1 slice (2 commits), about 2-3 days, 7 scenarios |
| 7 | Technical notes | PASS | Ports, ADR-0002..0005, superseded S-002 decision, e2e test replacement |
| 8 | Dependencies tracked | PASS | S-002 delivered; DESIGN ADR expected; open items listed |
| 9 | Outcome KPI measurable | PASS | Squad to player in 1 tap and back in 1, e2e tap count |

### Wave: DISCUSS / [REF] Peer review
`nw-product-owner-reviewer`, cycle 1 (in plan run): rejected with C1 (the precursor slice held only `@infrastructure` work) and H1-H3. Resolved: C1, by merging into one releasable slice, `slices/slice-01-player-details.md`, with the domain work as a precursor commit. H1/H2: the roadmap outcome now spells out the one-line "label, space, value" format, the 44px "Back", "any position opens" and "no console errors". H3: the example attributes now agree with the ADR-0006 formula and are marked as non-fixtures. M3: persona citation. M4: journey wording. M5: GK/FW rows are found by position text, not row order. Accepted as is: M1 (the KPI is measured by the e2e tap count, because the POC has no analytics, as in S-001/S-002), M7 (ADR-backed technical terms stay in the locked decisions), and M9 (the `forces` block exists only on J-03; J-01/J-02 are left untouched).

## Wave: DESIGN

Mode: propose. Scope: application. One solo team. Paradigm: functional (ADR-0003). New ADR: `adr-0006-player-attributes-condition-derived-overall.md` (refines ADR-0005 (e) and the ADR-0004 overall note). Architecture: `docs/product/architecture/brief.md` ("Player detail (S-003)", "For Acceptance Designer" ports 8-10). No new C4 container: the S-001 L1/L2 still hold.

### Wave: DESIGN / [REF] DDD list
- Same bounded context, "League setup", extended. Language: Attribute, Condition, Overall (now derived), Quality (internal only).
- Value objects: `Player { name, position, age, overall, attributes, condition }`; `Attributes` = four integers 1-20 keyed `goalkeeping | defending | passing | shooting`. No aggregates, no events.
- Invariants by construction: `overall = deriveOverall(position, attributes)` lies in [min, max] attribute (non-negative weights summing to 10, integer round-half-up); condition 75-100; S-002 invariants (quota, ages, unique names) unchanged.

### Wave: DESIGN / [REF] Decisions
| # | Decision | Source |
|---|---|---|
| D1 | `overall` derived: floor((sum(w*a)+5)/10), weights in tenths GK 7/1/2/0, DF 0/6/3/1, MF 0/2/5/3, FW 0/1/3/6. Rejected: stored overall plus fitted attributes; plain mean; UI-side formula | ADR-0006 (1); DISCUSS D4 |
| D2 | Club stream still draws age then 1-20 internal `quality` (ages, names, positions unchanged); attributes and condition from `deriveSeed(seed, 100 + clubIndex)`, 5 draws per player (4 noise -2..+2, condition). Attribute = clamp(quality + position offset + noise, 1, 20). Rejected: redraw everything; attributes from the names stream | ADR-0006 (2) |
| D3 | Condition integer 75-100 uniform, constant in this story. Rejected: uniform 0-100; fixed 100 | ADR-0006 (2); DISCUSS D3 |
| D4 | `Screen` + `{player, clubId, playerIndex}`; `Action` + `ViewPlayer{playerIndex}` valid only from squad, known club, integer 0..17; `Back` player to squad (same club), squad to clubHome; else no-ops | ADR-0006 (3); DISCUSS D7 |
| D5 | Player derived on render, not stored | ADR-0005 (d); DISCUSS D6 |
| D6 | Squad row = `<li>` with one `<button>` (same spans, 44px or taller). Supersedes the S-002 "not buttons" line in the brief | ADR-0006 (4, 6); DISCUSS D1 |
| D7 | Player screen via `el()`: h1 name; `<p>` lines "Position GK", "Age 27", "Overall 14"; `<ul aria-label="Attributes">` of four items in `ATTRIBUTE_ORDER`; `<p>` "Condition 92%"; "Back" button. Label and value on one line, inline flow only; any bar is CSS-only. Rejected: `<dl>`, table | ADR-0006 (4); DISCUSS D5, D8 |
| D8 | DELIVER renames the S-002 e2e "display-only" test and replaces its assertion with a per-row check (18 items, each holding exactly one button); same test, never deleted | ADR-0006 (6); DISCUSS notes |

### Wave: DESIGN / [REF] Component decomposition
| Component | Layer | Responsibility |
|---|---|---|
| `domain/squad.ts` | domain | `Player` gains `attributes`, `condition`; exports `ATTRIBUTE_ORDER`, `ATTRIBUTE_LABELS`, `Attributes`, `OVERALL_WEIGHTS`, `deriveOverall`, `CONDITION_MIN/MAX`, `ATTRIBUTE_STREAM_BASE`; `generateSquad` extended |
| `app/state.ts` | app | `Screen` + `player`; `Action` + `ViewPlayer`; `update` cases |
| `ui/screens/squad.ts` | ui | Row becomes `<li><button>`; click dispatches `ViewPlayer(index)` |
| `ui/screens/player.ts` | ui | `renderPlayer(root, player, dispatch)` |
| `main.ts` | shell | Player render case: `generateSquad(league.seed, clubIndex)[playerIndex]` |
| `ui/styles.css` | ui | Row button (grid, 44px or taller), player screen layout, CSS-only attribute bar |

### Wave: DESIGN / [REF] Driving ports
- `generateSquad(seed, clubIndex)` (extended), `deriveOverall(position, attributes)` (pure).
- `update(GameState, Action) => GameState` with `ViewPlayer` and `Back`.
- Browser: 18 row buttons in the list "Squad"; the player screen (`<h1>`, Position/Age/Overall lines, list "Attributes", "Condition" line); "Back" button. Detail in the brief, "For Acceptance Designer" ports 8-10.

### Wave: DESIGN / [REF] Driven ports and adapters
None: no storage, clock or network. The player is derived, so nothing is persisted and no probe is needed. No external integrations, so no contract tests. Enforcement unchanged (oxlint boundary rules, PR guard, nightly Stryker on `src/domain/**`, which covers `squad.ts`).

### Wave: DESIGN / [REF] Technology choices
No new technology or dependency (ADR-0001, 0002, 0004, 0005 apply; all OSS).

### Wave: DESIGN / [REF] Reuse Analysis
| Existing | Action | Contract shape / assertion |
|---|---|---|
| `src/domain/squad.ts` (`generateSquad`, `Player`, `drawInRange`) | EXTEND: new fields, attribute stream, `deriveOverall`; the existing `drawInRange` and `createRng` are reused | pure, return-only; property tests (ranges, bounds, determinism, differing attributes, S-002 invariants) |
| `src/domain/rng.ts` (`deriveSeed`, `createRng`, `nextFloat`) | REUSE unchanged (new stream numbers only) | pure, return-only |
| `src/app/state.ts` | EXTEND: `Screen`/`Action` variants, `update` cases (reuses `isKnownClub`, imports `PLAYERS_PER_SQUAD`) | pure, return-only; unit tests incl. wrong-screen, unknown club and index no-ops |
| `src/ui/screens/squad.ts` | EXTEND: row is `<li><button>` | bounded-change; e2e |
| `src/ui/screens/player.ts` | CREATE NEW (no existing alternative: no screen shows one person) | bounded-change (root's children only); e2e |
| `src/ui/dom.ts` `el()` | REUSE | bounded-change; detached nodes only |
| `src/main.ts` | EXTEND: player case; `findClub` reused | unbounded shell, universe unchanged |
| `src/ui/styles.css` | EXTEND: move row grid from `li` to the row button; player layout | n/a |
| `tests/e2e/S-002-squad.spec.ts` | EXTEND: rename the "display-only" test and replace its assertion by a per-row check (18 items, each exactly one button; same count) | black-box |
| `tests/e2e/S-003-player.spec.ts`, `tests/acceptance/S-003/` | CREATE NEW (DISTILL): new story's tests | black-box / property |
| `tests/acceptance/S-002/*` | REUSE unchanged; they assert overall 1-20 only | regression |

### Wave: DESIGN / [REF] Changed Assumptions
- DISCUSS slice 01 (precursor commit): "Drawn from the per-club seed (`deriveSeed(seed, clubIndex)`), pure, no `Date`, `Math.random` or DOM." Changed: attributes and condition come from a separate per-club stream `deriveSeed(seed, 100 + clubIndex)`; only age and the internal `quality` stay on `deriveSeed(seed, clubIndex)`. Reason: keeps every S-002 age, name and position identical for every seed (ADR-0006 (2)).
- DISCUSS D3: "The generator range ... may be narrower than 0-100". Decided: 75-100.
- DISCUSS D1/brief: "squad rows are display-only / listitems, not buttons". Superseded as DISCUSS expected (ADR-0006 (6)).

### Wave: DESIGN / [REF] Open questions
- None blocking. Accepted: returning to the squad re-renders from the top, so scroll position is not restored (not in the AC; revisit if Sam finds it annoying).
- Handoff for DISTILL: property tests over all 8 clubs per seed; formula test via `deriveOverall`/`OVERALL_WEIGHTS`; an optional golden of (name, position, age) for one seed captured from the pre-change code; unit tests for `ViewPlayer` index bounds (-1, 18, 1.5, NaN) and unknown club; e2e for rows holding one button, label and value on one line, "Attributes" list with no other digits, and Back, Back. For the 8th club at `?seed=abc`, find a GK row and a FW row by position text (row order GK first, FW last is an extra check, not the locator).

### Wave: DESIGN / [REF] Peer review
`nw-solution-architect-reviewer`: approved, with no critical or high issues. Medium findings folded into ADR-0006 and the brief: M1, the stream-collision wording, plus a property test on the derived seeds. M2, the `makePlayer` sole constructor. M3, `renderPlayer(root, player, dispatch)`. M4, a per-row button assertion and a renamed test. M5, `src/app/state.ts` added to Stryker in DELIVER. M6, navigation options. M7, the C4 L2 `main -> domain` arrow. L2, the supersedes wording. L3, an explicit `role="list"`.

## Wave: DEVOPS

Lean, unattended. All nine decisions pre-answered. Owner-locked paths (`.github/`, `factory/`, `scripts/`, `.nwave/`, `CLAUDE.md`, brief/scope, `tests/protected/`) are read-only. Machine-readable environments: `docs/feature/S-003/environments.yaml`. Inherits the S-001/S-002 DEVOPS setup; only the deltas are recorded.

Checklist: ✓ existing infra reused | ✓ KPI mapped to instrument | ✓ rollback defined | ✓ mutation strategy (nightly-delta, inherited) | ⊘ new IaC/containers (none) | ⊘ server-side observability (no backend) | ⊘ continuous learning | ⊘ CLAUDE.md edit (already states strategy)

### Wave: DEVOPS / [REF] Environment matrix
| Env | URL | Runner | Purpose |
|---|---|---|---|
| local-dev | `http://localhost:5173/gaffer/` (`pnpm dev`) | dev machine | Iteration |
| local-preview | `http://localhost:4173/gaffer/` (`ci:serve`) | dev, CI, protected runner | Production build under test; unit, property, e2e and `tests/protected/S-001..S-003/` |
| production | `https://<owner>.github.io/gaffer/` | GitHub Pages | Live site; post-deploy smoke via `BASE_URL` |

No staging (static site, recreate). Client: Chromium, Pixel 7 profile, 390px viewport. Squad and player are derived from `?seed=` on render (ADR-0005 (d), ADR-0006), so the same seed gives the same player screen in every environment.

### Wave: DEVOPS / [REF] CI/CD pipeline outline (existing, unchanged)
- `ci` (PR, push to main, dispatch): PR guards, roadmap lint, `ci:lint`, `ci:typecheck`, `ci:test` (fresh `FC_SEED`; the S-003 property tests on `generateSquad` and `deriveOverall` honour it), `ci:build`, `ci:e2e`, protected-scenario no-regression check vs main.
- `deploy` (push to main): `ci:build`, deploy-pages, then `smoke` runs `ci:e2e` against the live URL (includes the new S-003 spec).
- `nightly`: `ci:mutation`; failure opens a `mutation-alarm` issue.
- `ai-review`, `factory-tick`, `watchdog`, `weekly-demo`: factory-owned, untouched.
- S-003 needs no pipeline change: it adds unit, property and e2e specs run by the existing scripts, and no new dependency (ADR-0006: no new technology).
- Local gate: `pnpm run check` mirrors the commit stage. No git hooks (locked paths; CI is the gate).
- Security: no secrets, no runtime deps, no network. Player name and all numbers enter the DOM only via `el()`/`textContent` (ADR-0002, never `innerHTML`); that is a review check, not a scenario. SAST/SCA/SBOM not added (workflows locked; see Open questions).

### Wave: DEVOPS / [REF] Monitoring contracts (DISCUSS KPI/AC to instrument)
E2E instrument is the new `tests/e2e/S-003-player.spec.ts` (Pixel 7, 390px), run by `ci:e2e` on PR and main and by `smoke` on the live URL after each deploy. "Unit/property" rows run in `ci:test` (fresh `FC_SEED`).

| KPI / criterion (DISCUSS) | Instrument | Pass condition |
|---|---|---|
| KPI: squad to player in 1 tap, and back in 1 tap | e2e: count clicks on a row button, assert `<h1>` is the player name; count clicks on "Back", assert list "Squad" with 18 items | Exactly 1 click each way |
| Journey squad, player, Back, Back | e2e: after the second "Back", `<h1>` is club name, list "Squad" gone, "Squad" button visible | holds |
| Player name as only heading; Position/Age/Overall equal the tapped row | e2e: read row text, tap, compare "Position GK", "Age 27", "Overall 14" by visible text; exactly one `<h1>` | equal to row |
| 4 attributes in order, values 1-20, no other number | e2e: list "Attributes" has exactly 4 items "Goalkeeping", "Defending", "Passing", "Shooting" in order, each one integer 1-20; unit/property on `generateSquad` (ranges, `ATTRIBUTE_ORDER`) | holds, all 18 rows |
| Condition 0-100% outside the list | e2e regexp `Condition (\d+)%` outside list "Attributes"; property: integer 75-100 (ADR-0006, inside the AC's 0-100) | holds |
| Overall within attribute bounds | e2e: min <= overall <= max; property: `overall === deriveOverall(position, attributes)` and bounds; unit test of `OVERALL_WEIGHTS` (non-negative, sum 10) | holds |
| Row/screen agreement | e2e: row overall equals player-screen overall for all 18 rows (club 0 and 8th club) | equal |
| Same seed, identical player screens; players differ | e2e: `?seed=31` two visits, compare all 18 screens; at least 2 distinct attribute tuples. Property: deep-equal on same `(seed, clubIndex)` | identical; not all equal |
| GK and FW open, invalid seed | e2e: `?seed=abc`, 8th club, a GK row and a FW row (found by position text) | Position GK and FW, 4 attributes, condition |
| Each of 18 rows holds exactly one button, 44px or taller | e2e: `listitem` count 18, each holds one `button`, `boundingBox().height >= 44` | holds (replaces the S-002 "display-only" assertion in `S-002-squad.spec.ts`) |
| "Back" 44px or taller | e2e `boundingBox().height >= 44` on the player screen | holds |
| No horizontal scroll at 390px | `scrollWidth <= clientWidth` on squad and player screens | holds |
| Focus on the player `<h1>` | e2e: `document.activeElement` is the `<h1>` after tapping a row | holds |
| No console errors | `page.on("console"/"pageerror")` across squad, player, back, back | zero |
| `ViewPlayer`/`Back` navigation, no-ops | vitest on `update` (index -1, 18, 1.5, NaN; unknown club; wrong screens) | holds |
| Ages, names, positions unchanged vs S-002 | vitest optional golden (DISTILL) plus unchanged S-002 acceptance tests | holds |
| Domain test strength | Stryker on `src/domain/**` (now covers `deriveOverall`, weights, attribute stream in `squad.ts`) | nightly, at or above break threshold (70) |

No analytics (POC). The e2e tap count is the KPI's sole measurement.

### Wave: DEVOPS / [REF] Deployment strategy and rollback
- Strategy: recreate. Merge to main triggers `deploy`, replacing the whole static artifact. Idempotent: redeploying the same ref yields the same artifact.
- Rollback (designed first): `workflow_dispatch` of `deploy.yml` on a known-good ref (the S-002 commit before the S-003 squash); `smoke` validates the restored site. Fallback: fix-forward on a `claude/*` branch. `git revert` of the squash is blocked by the append-only protected-tests and no-regression guards (owner action). Time to restore: one deploy cycle (about 5 minutes).
- Failure detection: a red `smoke` job marks the deploy run red.
- Data: the overall now changes for every seed versus S-002 (derived from attributes, ADR-0006). Nothing is persisted and the player is derived on render, so no data migration and no user data at risk. Rolling back restores the S-002 stored overalls and removes the player screen and the row buttons. Names, positions and ages are identical in both versions.
- Blast radius: one static page.

### Wave: DEVOPS / [REF] Mutation testing strategy
nightly-delta, inherited from `CLAUDE.md`; `/nw-deliver` Phase 5 skipped. `stryker.config.mjs` mutates `src/domain/**/*.ts` except `names.ts`, thresholds high 85, low 70, break 70. The new domain code (`deriveOverall`, `OVERALL_WEIGHTS`, attribute and condition generation, stream constants) is in `squad.ts`, so it is covered with no config change. Run by `nightly.yml` via `ci:mutation`; failure opens `mutation-alarm`, `needs-human`. `src/app/state.ts` (`ViewPlayer`/`Back` from player) is outside Stryker scope today (`mutate` does not list `src/app/**`). DELIVER adds `src/app/state.ts` to `mutate` (agent-editable per ADR-0001; required by ADR-0006 after architect review). Tests that kill mutants must pin the formula and bounds: exact `deriveOverall` values per position, the clamp edges, the condition 75/100 edges, and the 5-draws-per-slot stream.

### Wave: DEVOPS / [REF] Observability stack
Browser console plus Playwright smoke on the deployed URL only. No RUM, error tracking, logs or tracing. SLO: smoke green per deploy. Alerting: a red `deploy` run. No dashboards.

### Wave: DEVOPS / [REF] Branching strategy
Trunk-based. Short-lived `claude/S-003-*` branches, PR to main, squash merge. CI green and protected scenarios not regressing. Deploy fires on merge. No release branches.

### Wave: DEVOPS / [REF] Coexistence matrix
| Component | S-003 impact | Action |
|---|---|---|
| `ci.yml`, `deploy.yml`, `nightly.yml` | none; run existing `ci:*` scripts | reuse |
| `ci:*` scripts, `playwright.config.ts`, `stryker.config.mjs` | none required; Pixel 7, `BASE_URL`, and the `src/domain/**` glob already fit | reuse |
| `tests/e2e/S-002-squad.spec.ts` | the "squad rows are display-only, not buttons" test contradicts ADR-0006 (6) | rename it and replace its assertion with a per-row check (18 items, each holding exactly one button) (same test, count does not drop); other assertions unchanged |
| `tests/e2e/S-001-pick-club.spec.ts`, `shell.spec.ts` | untouched | regression-watch |
| `tests/e2e/S-003-player.spec.ts` | new spec | add (DISTILL) |
| `tests/protected/S-001/`, `tests/protected/S-002/` | locked runner on `localhost:4173/gaffer/`; roles and names; rows read via `listitem` inner text (still valid with a button inside the `li`); assert properties only | must stay green |
| `tests/protected/S-003/` | locked scenario for this story | must pass on main |
| `tests/acceptance/S-002/*` | assert overall is an integer 1-20 only (range still holds; derived overall is within attribute bounds, hence 1-20); no test pins stored-overall values | unchanged, regression-watch |
| `src/domain/squad.ts`, `src/app/state.ts`, `src/ui/screens/squad.ts`, `src/main.ts`, `src/ui/styles.css` | extended; `player.ts` new | S-001/S-002 tests guard |
| Pages artifact | grows slightly; base path `/gaffer/` unchanged | none |

### Wave: DEVOPS / [REF] Pre-requisites
- S-002 delivered and deployed; GitHub Pages source "GitHub Actions" enabled (✓).
- Node 22 or later, pnpm 10.12.4 pinned, Playwright chromium via `.github/actions/setup`.
- ADR-0001..0006 accepted (✓; ADR-0006 landed before DELIVER, as DISCUSS required).
- `BASE_URL` derived from repository owner and name (no secret).

### Wave: DEVOPS / [REF] Open questions
Owner-only items inherited from S-001/S-002 (smoke `sleep 20`, no security scanning, smoke has no commit-SHA check, deploy not gated on `ci`, squash revert blocked, no uptime probe) are unchanged and none block S-003. New:
1. No `.github/` change is needed for S-003.
2. DELIVER requirement (ADR-0006 Consequences, after architect review): add `src/app/state.ts` to the Stryker `mutate` list (agent-editable config; navigation logic now has `ViewSquad`, `ViewPlayer`, `Back` with index and club guards).
3. Smoke on the live URL runs the S-003 e2e spec too; it relies on `?seed=` being honoured on Pages (same as S-001/S-002).
4. The overall of any existing `?seed=` link changes on deploy (accepted in ADR-0006; no persistence). Rollback restores the S-002 values.
