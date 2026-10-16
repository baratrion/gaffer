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
| D4 | `Screen` + `{kind: "player", clubId, playerIndex}` (no `Player` field: the player is derived on render); `Action` + `ViewPlayer{playerIndex}` valid only from squad, known club, integer 0..17; `Back` player to squad (same club), squad to clubHome; else no-ops | ADR-0006 (3); DISCUSS D7 |
| D5 | Player derived on render, not stored | ADR-0005 (d); DISCUSS D6 |
| D6 | Squad row = `<li>` with one `<button>` (same spans, 44px or taller). Supersedes the S-002 "not buttons" line in the brief | ADR-0006 (4, 6); DISCUSS D1 |
| D7 | Player screen via `el()`: h1 name; `<p>` lines "Position GK", "Age 27", "Overall 14"; `<ul role="list" aria-label="Attributes">` of four items in `ATTRIBUTE_ORDER`; `<p>` "Condition 92%"; "Back" button. Label and value on one line, inline flow only; any bar is CSS-only. Rejected: `<dl>`, table | ADR-0006 (4); DISCUSS D5, D8 |
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

## Wave: DISTILL

Unattended. Language: TypeScript (`package.json`, `tsconfig.json`); runners: vitest + fast-check (`FC_SEED` honoured through `tests/setup/fast-check-seed.ts`) and Playwright (Pixel 7, 390px). No Gherkin runner exists, so scenarios are `describe/it` blocks whose titles read Given/When/Then in domain language, with `@tags` in the titles and a `CONTRACT_SHAPE` + outcome-anchor header, as in `tests/acceptance/S-002/`. Every test title also carries `@contract-shape:<pure-function|bounded-change|unbounded-preservation>`: domain files `pure-function`, `update` navigation and the e2e spec `bounded-change` (no `unbounded-preservation` shape applies: nothing is written outside the screen). Wave-decision reconciliation: DISCUSS, DESIGN and DEVOPS read, 0 contradictions (the three superseded DISCUSS/brief lines are already recorded as "Changed Assumptions"). Only `discuss/journey.md` exists under `discuss/` (no separate wave-decisions files); the decisions live in this file.

### Wave: DISTILL / [REF] Hand-off model: green tree, scenarios held out until DELIVER (Mandate 7 adapted)
CI forbids committing failing, skipped or `.todo` tests, and test counts may only go up. New-behaviour scenarios cannot pass before DELIVER implements the generator, `update` and the screens. So DISTILL does this:
- **Committed and running now (green, regression guard):** `tests/acceptance/S-003/unchanged-identity.test.ts` (7 tests), pinning names, positions and ages captured from the pre-change generator. It passes before and after DELIVER because it never reads `overall`, `attributes` or `condition`.
- **Held out, complete and verified:** the four executable specs below are stored as `docs/feature/S-003/distill/pending/**/*.pending`. The `.pending` suffix keeps them outside every glob (`vitest include`, `tsc include`, `oxlint .`, Playwright `testDir`), so nothing is skipped, weakened or marked todo; they simply are not in the tree yet. Nothing was weakened to get them to pass.
- **Verification done in DISTILL** (details and commands in `docs/feature/S-003/distill/verification-note.md`): I implemented a throwaway reference (domain, `update`, row buttons, player screen) in a scratch git worktree (since removed), copied the four files into `tests/`, and ran them. After the review edits (contract-shape tags, tap counter, viewport, whole-state asserts, A9) the held-out files were re-linted and re-typechecked in the real repo only; the reference e2e/vitest run was not repeated, and DELIVER step 01 therefore re-runs them (below). Result there: `ci:typecheck` clean; vitest 162 passed (S-003 files 78); Playwright 39 passed, the only red being the S-002 "display-only" test that DELIVER must supersede (see step 02). Without the reference the same files fail for the right reason (missing exports, no row buttons), not for setup. The reference is not kept; DELIVER writes the real implementation.
- **No scaffold stubs in `src/`:** a stub that throws would make the committed run red. The scaffold equivalent is the `.pending` files plus the exact-symbol list below.
- **DELIVER mechanics:** `git mv` each file to its destination, dropping `.pending`, in the same commit as the code that makes it green. Never edit an assertion to fit the implementation; if one is wrong, record it in `distill/upstream-issues.md`.

### Wave: DISTILL / [REF] Scenario list with tags
Tier A only (production code: real `generateSquad`, `update`, built app). Tier B skipped: the journey is 1 chained step on a small input space (club 0..7 x row 0..17), property tests already cover it.

| # | Scenario (title in the file) | File | Tags | Kind |
|---|---|---|---|---|
| R1 | Seed 31, first club: 18 names, positions, ages are the S-002 ones | `unchanged-identity.test.ts` (committed) | `@regression @driving_port` | example |
| R2 | Default seed, 8th club: same | same | `@regression` | example |
| R3 | Seeds 31, 4242, 20260, -1, all 8 clubs: identity hashes unchanged (4 cases) | same | `@regression` | example |
| R4 | Any seed and club: positions and ages equal an independent copy of the S-002 age/overall draw sequence (names are pinned only by the R1-R3 goldens, not by an independent copy) | same | `@property @regression` | PBT |
| A1 | Every player has exactly the four attributes | `player-attributes.test.ts` | `@property @driving_port` | PBT, all 8 clubs per seed |
| A2 | Every attribute is a whole number 1-20 | same | `@property` | PBT |
| A3 | Every condition is a whole percentage 75-100 (inside 0-100) | same | `@property` | PBT |
| A4 | Overall equals the value derived from the attributes | same | `@property` | PBT |
| A5 | Overall is whole, between lowest and highest attribute, 1-20 | same | `@property` | PBT |
| A6 | The 18 players of a squad do not all share attribute values | same | `@property` | PBT |
| A7 | Squads still hold 18 unique names | same | `@property` | PBT |
| A8 | Same seed and club: deep-equal, attributes and condition included | same | `@property @determinism` | PBT |
| A9 | No ambient randomness or wall-clock time in the squad or in `deriveOverall` | same | `@determinism` | example |
| A10 | Conditions of exactly 75 and 100 both occur (200 seeds x 8 clubs) | same | `@boundary @design-derived` | survey, kills off-by-one; pins the DESIGN range, not an AC |
| A11 | Attributes of exactly 1 and 20 both occur (clamp edges) | same | `@boundary @design-derived` | survey; pins DESIGN clamping, not an AC |
| A12 | Goalkeepers lean to Goalkeeping, forwards to Shooting (on average) | same | `@position-lean @design-derived` | survey (guards offsets; DESIGN decision, not an AC) |
| A13 | Display order and labels: Goalkeeping, Defending, Passing, Shooting | same | `@driving_port` | example |
| A14 | The 17 stream numbers are distinct; the 17 derived seeds are pairwise distinct over sampled seeds (ADR-0006: not proven injective) | same | `@property` | example + PBT |
| A15 | Club index -1, 8, 100, 1.5, NaN still raises RangeError (5 cases) | same | `@error` | example |
| D1 | Weights per position non-negative, sum 10; equal the ADR-0006 table (8 cases) | `derive-overall.test.ts` | `@boundary` | example |
| D2 | Exact overalls: 8 concrete (position, attributes, value) cases incl. both DISCUSS domain examples (GK 15/12/11/4 gives 14, FW 2/6/12/12 gives 11) | same | `@example` | example |
| D3 | Round half up: DF with weighted sum 15 gives 2, sum 14 gives 1 | same | `@boundary` | example |
| D4 | Equal attributes give that value, per position (4 cases) | same | `@property` | PBT |
| D5 | Overall equals an independent copy of the formula, any position and attributes | same | `@property @driving_port` | PBT |
| D6 | Overall within [min, max] | same | `@property` | PBT |
| D7 | Raising an attribute never lowers the overall | same | `@property` | PBT |
| D8 | A zero-weight attribute does not matter (GK shooting; DF, MF, FW goalkeeping) | same | `@property` | PBT |
| N1 | Squad, tap row: that club's player 0 shown (whole `GameState` compared with `toEqual`) | `player-navigation.test.ts` | `@walking_skeleton @driving_port` | example |
| N2 | Player screen, Back: same club's squad (whole `GameState` compared with `toEqual`) | same | `@walking_skeleton` | example |
| N3 | Back twice: club home; squad, player 17, Back, Back: original state | same | | example |
| N4 | Any row of any club, tap then Back: that squad | same | `@property` | PBT |
| N5 | Row -1, 18, 100, 1.5, NaN, Infinity: no change (6 cases) | same | `@error` | example |
| N6 | Squad of an unknown club, tap a row: no change | same | `@error` | example |
| N7 | View-player from title, club list, club home, player: no change (4 cases) | same | `@error` | example |
| N8 | Back on a player screen with invalid index (6 cases) or unknown club: no change | same | `@error` | example |
| N9 | Inputs not mutated | same | | example |
| E1 | Journey: 1 tap squad to player, 1 tap back, Back to club home; no console errors. Taps counted by a page-side capture-phase click listener (real clicks, not a test-side counter). Precondition asserted: page served under `/gaffer/` | `S-003-player.spec.ts` | `@walking_skeleton @kpi` | e2e |
| E2 | Each of 18 rows holds exactly one button, 44px or taller; row text unchanged (two numbers) | same | | e2e |
| E3 | All 18 players of club 0 and club 7 (`?seed=31`): one h1 = name; "Position/Age/Overall" lines equal the row; list "Attributes" has 4 items "Goalkeeping N"... in order, 1-20, one number each; one "Condition N%" line 0-100 outside the list; overall within min/max | same | | e2e (2 cases) |
| E4 | One h1, one list named "Attributes", no other list | same | | e2e |
| E5 | Back from row 17 of club 4: same squad (identical rows); Back: club home | same | | e2e |
| E6 | Two fresh visits of `?seed=31`: all 18 screens identical; not all attribute tuples equal | same | `@determinism` | e2e |
| E7 | `?seed=abc`, 8th club: GK and FW rows (found by position text only, no row-order assumption) open with 4 attributes and a condition, identical on a fresh visit | same | `@error` | e2e |
| E8 | "Back" on the player screen is 44px or taller | same | | e2e |
| E9 | No horizontal scroll at 390px on the squad and all 18 player screens of the 8th club | same | | e2e |
| E10 | Focus on the h1 after tapping a row and after Back | same | | e2e |
| E11 | No console errors across squad, player, back, back | same | | e2e |

Counts: 7 committed now (R1-R4); 72 vitest cases held out (player-attributes 20, derive-overall 28, player-navigation 24); 12 e2e cases (E1-E11, E3 doubled). Measured error/edge share of the 84 held-out cases, by tag: 24 `@error` (A15 5, N5 6, N6 1, N7 4, N8 7, E7 1) = 29%; with the 7 `@boundary` cases (A10, A11, D1 weights 4, D3) 31/84 = 37%. This is under the 40% target. **Waiver:** the feature is a read-only display; every invalid input that can reach it (row index, unknown club, wrong screen, bad club index, invalid seed) is enumerated above, and further cases would repeat the same no-op. The e2e tier has a single sad path (E7, invalid seed); more e2e sad paths were not added because the other failure modes (index, club, screen) are unreachable from the UI and are covered at the `update` level (N5-N8), and invalid seeds are covered by the S-001 seed-parsing tests and S-002 e2e. **Waiver (environment):** E1-E11 run on local-preview and on a `BASE_URL` deployment; local-dev (`vite dev`, :5173) is not a supported target for the spec (the Playwright config starts `ci:serve`), so no local-dev run is promised. The viewport is the Pixel 7 profile at 390px from `playwright.config.ts`; the spec has no per-spec viewport override and "fresh visits" are new pages of the same browser context (nothing is persisted).

### Wave: DISTILL / [REF] WS strategy (Architecture of Reference)
- Driving ports: in-process pure calls (`generateSquad`, `deriveOverall`, `update`) and the built browser app at `http://localhost:4173/gaffer/`. All real; no DI container exists.
- Driven internal and external ports: none (see adapter table). So there is nothing to fake: no clock, no random source (the seeded `createRng` is deterministic domain code), no storage.
- Walking skeleton: extends the S-001/S-002 skeleton by one step. Browser proof: E1. Domain proof: N1+N2. Litmus: title is a user goal (tap a player, see them, go back), the Then is what Sam reads.
- Infrastructure policy: no `docs/architecture/atdd-infrastructure-policy.md` is created. This repo has no driven ports, and its architecture SSOT is `docs/product/architecture/`; the policy for this project is "everything real, nothing faked", which this section records. Mandate 8 (state-delta helper) is met by the repo's own convention: navigation tests compare the whole `GameState` (league + screen) with `toEqual`, a closed universe, and a no-mutation check; no `tests/common/state_delta.ts` is bootstrapped (no TypeScript pilot exists, and S-001/S-002 tests don't use one).

### Wave: DISTILL / [REF] Adapter coverage table
There are no driven adapters (DESIGN, "Driven ports and adapters": none). Nothing is persisted, no clock, no network.

| Adapter | @real-io scenario | Covered by |
|---|---|---|
| (none) | n/a | n/a; the only environmental assumption (button-as-grid layout at 390px, no overflow) is proven by E2, E8, E9 on the built app |

### Wave: DISTILL / [REF] Scaffolds
No `__SCAFFOLD__` stubs are written under `src/`: a throwing stub would turn the committed run red, which CI forbids. RED-readiness is instead guaranteed by the held-out files: each fails with a missing-symbol or missing-button assertion, never a setup error (checked in the scratch run). Symbols DELIVER must export, all used by the held-out tests:
- `src/domain/squad.ts`: `ATTRIBUTE_ORDER`, `ATTRIBUTE_LABELS`, `ATTRIBUTE_STREAM_BASE` (=100), `CONDITION_MIN` (=75), `CONDITION_MAX` (=100), `OVERALL_WEIGHTS` (indexable by position; `Object.values(OVERALL_WEIGHTS[pos])` must list the 4 weights in `ATTRIBUTE_ORDER` order), `deriveOverall(position, attributes)`, `Player.attributes` (record keyed by `ATTRIBUTE_ORDER`), `Player.condition`.
- `src/app/state.ts`: `Screen` `{ kind: "player"; clubId; playerIndex }`, `Action` `{ type: "ViewPlayer"; playerIndex }`.
- UI (role/name contract, brief port 10): `<p>` lines "Position GK", "Age 27", "Overall 14", "Condition 92%" (innerText exactly this, on one line); `<ul role="list" aria-label="Attributes">` with four `<li>` "Goalkeeping 15"...; no other list on the player screen; button "Back".
- Implementation hint learned from the scratch run: `oxlint` caps cyclomatic complexity at 15; adding `ViewPlayer` and the player `Back` to the single `update` switch tipped it to 19. Split per-action helpers. Test-side `max-params` is 3.

### Wave: DISTILL / [REF] Test placement
`tests/acceptance/S-003/` (vitest, same folder convention as `tests/acceptance/S-001|S-002`) and `tests/e2e/S-003-player.spec.ts` (DEVOPS coexistence matrix). Held-out sources live in `docs/feature/S-003/distill/pending/{acceptance,e2e}/` as `*.pending`. Existing tests are untouched, including `tests/e2e/S-002-squad.spec.ts`.

### Wave: DISTILL / [REF] Driving port coverage
| Port (brief 8-10) | Scenarios |
|---|---|
| 8 `generateSquad` extended; `deriveOverall` | R1-R4, A1-A15, D1-D8 |
| 9 `update` with `ViewPlayer`, `Back` | N1-N9 |
| 10 UI: row buttons, player screen, "Back" | E1-E11 |
Ports 1-7 are unchanged and covered by S-001/S-002 tests; the S-002 e2e test of the same behaviour is replaced in step 02. Driving adapters (CLI/HTTP/hook): none; the browser app is covered by E1-E11.

### Wave: DISTILL / [REF] DEVOPS monitoring-contract trace
| Contract row | Scenario |
|---|---|
| KPI 1 tap each way | E1 (tap counter) |
| Journey squad, player, Back, Back | E1, E5 |
| h1 only heading; Position/Age/Overall equal row | E3, E4 |
| 4 attributes in order, 1-20, no other number | E3, A1, A2, A13 |
| Condition outside list | E3 (e2e), A3 (75-100) |
| Overall within bounds; `OVERALL_WEIGHTS` | E3, A4, A5, D1-D8 |
| Row/screen agreement, club 0 and 8th | E3 |
| Same seed identical; players differ | E6, A6, A8 |
| GK/FW with invalid seed | E7 |
| 18 rows, one button each, 44px | E2 |
| Back 44px; no sideways scroll; focus; no console errors | E8; E9; E10; E1, E11 |
| `ViewPlayer`/`Back` no-ops (-1, 18, 1.5, NaN, unknown club, wrong screens) | N5-N8 |
| Ages, names, positions unchanged vs S-002 | R1-R4 (committed) |
| Stryker strength | D1-D3, A10-A11, A14 pin weights, edges, stream numbers |

### Wave: DISTILL / [REF] DELIVER step plan (which files to add, and when)
1. **Step 01, domain precursor commit** (first, before any production code: run `pnpm exec vitest run tests/acceptance/S-003/unchanged-identity.test.ts` and see it green; then `git mv` the two domain files in and run `pnpm run ci:typecheck`, `pnpm run ci:lint` and the files themselves, and confirm they fail RED for missing exports/members, not for setup; oxlint must already be clean on them): (developer-facing, not shipped alone): implement per ADR-0006 in `src/domain/squad.ts`. Add `acceptance/derive-overall.test.ts.pending` and `acceptance/player-attributes.test.ts.pending` to `tests/acceptance/S-003/` (drop `.pending`). `tests/acceptance/S-002/*` and `unchanged-identity.test.ts` must stay green. Gates: `ci:lint`, `ci:typecheck`, `ci:test`.
2. **Step 02, rows, player screen, Back** (one commit, so the tree is never red): `update` cases and `player.ts`, row buttons, `main.ts` player case, CSS. In the same commit:
   - add `acceptance/player-navigation.test.ts.pending` as `tests/acceptance/S-003/player-navigation.test.ts`;
   - add `e2e/S-003-player.spec.ts.pending` as `tests/e2e/S-003-player.spec.ts`;
   - rename the S-002 e2e test "squad rows are display-only, not buttons" to "each squad row is exactly one button" and replace its assertion with: 18 items, each holding exactly one button (ADR-0006 (6)); never delete it;
   - add `src/app/state.ts` to Stryker `mutate` (agent-editable config).
   `ci:e2e` and `tests/protected/S-001..S-003` must pass.
3. Delete `docs/feature/S-003/distill/pending/` once all four files are moved (or leave it empty); zero `.pending` files remaining is the DISTILL-to-DELIVER completion check.

### Wave: DISTILL / [REF] Pre-requisites
DESIGN: ADR-0006 and brief ports 8-10 (read). DEVOPS: local-preview `http://localhost:4173/gaffer/` via `ci:serve`, Pixel 7 at 390px, `FC_SEED` per CI run, `BASE_URL` for post-deploy smoke (E-tests use `?seed=` and role/name queries only, so they hold on Pages). No new dependency.

### Wave: DISTILL / [REF] Mandate checks (adapted)
- CM-A: tests import only `generateSquad`, `deriveOverall`, constants, `update`, `generateLeague`, `deriveSeed`; UI tests enter through the built app by role and name. CM-B: titles use domain terms (row, squad, player, Back); technical words stay in code. CM-D: formula tested as a pure function with an independent reference copy. CM-F: PBT only in layer 1-2 files; e2e is example-only, each sad path named (E7, E9; N5-N8). Mandate-12 domain types/DSL and step-reuse-ratio do not apply: there are no Gherkin steps, no step-decorator layer; helpers (`openSquad`, `checkPlayerScreen`, `readPlayerScreen`) hold no business logic.
- Open points for DELIVER: (1) `OVERALL_WEIGHTS` shape is free (see Scaffolds). (2) A12 (position lean) pins DESIGN's offsets, not an AC; if DELIVER changes the offsets by ADR note, A12 may be adjusted with that note. (3) Example attribute values in DISCUSS ("Tomas Brenning") are illustrative and are not asserted anywhere.
- Peer review: the four-reviewer gate was not dispatched in this unattended run (no reviewer was asked for); the held-out files were instead executed against the reference above.
