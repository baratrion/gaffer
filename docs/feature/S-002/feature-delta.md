# S-002: View my squad

## Wave: DISCUSS

Lean, unattended. Reuses `discuss/journey.md`. Outcome is fixed by `docs/roadmap.yaml` (S-002) and is not re-scoped here.

### Wave: DISCUSS / [REF] Persona
Sam, 34, a lapsed Championship Manager fan. Plays on the bus, one-handed, on a mid-range Android phone at 390px wide, with 5 minutes to spare (brief.md, "Player"). Wants to see the squad at a glance, scrolling only vertically.

### Wave: DISCUSS / [REF] JTBD one-liner
When I have just taken charge of a club, I want to see who I have got, so that I can start judging who should play. (Recorded as J-02 `know-my-squad` in `docs/product/jobs.yaml`; it follows J-01.)

### Wave: DISCUSS / [REF] Locked decisions
- Squad: 18 players per club, generated purely from the league seed and the club's index (ADR-0004: `generateSquad(seed, clubIndex)`). ~~from `deriveSeed(seed, clubIndex)`~~ Superseded by ADR-0005: `deriveSeed(seed, stream)` with a league-wide name stream (-1). Same seed gives the same squad on every visit.
- Position quota is exact: 2 GK, 6 DF, 6 MF, 4 FW (ADR-0004). This satisfies "at least 2 GK and players in every position".
- Player: `name`, `position` (GK, DF, MF, FW), `age`, `overall` (integer 1-20, stored). ADR-0004 narrows generated age to 17-35, inside the 16-40 the outcome allows; the UI and tests must accept anything in 16-40 and the generator stays within 17-35. (Note: the UI accepts ages 16-40, while the generator domain property is 17-35; the two ranges are deliberately different.) No attributes or condition (deferred to the player-detail story).
- "Every club has different players": no two clubs in one league share a squad, and no full player name appears in two clubs of the same league. The mechanism is for DESIGN (draws from independent per-club seeds can collide, so uniqueness needs a construction, as for club names). Names within one squad are also unique.
- Names come from fictional first-name and surname lists in `src/domain/names.ts`. A unit test checks no generated name matches a small denylist of well-known real players (same approach as the club denylist, ADR-0004).
- Screens: club home gains a "Squad" button; new squad screen with one `<h1>` and a `<ul>` named "Squad" (one `<li>` per player); a button named exactly "Back" returns to club home (heading is the club's name). Real buttons, one `<h1>` per screen, lists for collections, 44px targets (CLAUDE.md "Phone first").
- Row text order: name, position, age, overall. Age and overall are the first two numbers in the row, so a player name must contain no digits. Row is built with `el()` (ADR-0002); generated text never goes through `innerHTML`.
- `Screen` gains `{ kind: "squad", clubId }` and `Action` gains `ViewSquad` and `Back` (ADR-0003). The squad is derived from the seed on render; it is not stored in state and not persisted.
- Squad rows are display-only (not buttons); player detail is a later story.
- `deriveSeed` is created in this story (ADR-0003/0004 name it; S-001 deferred it).
- UX depth: no mockups beyond the journey table.

### Wave: DISCUSS / [REF] User stories

#### US-1: See who is in my squad
**Problem:** Sam has taken charge of a club, but the club is only a name. Without seeing the players there is nothing to judge, so Sam cannot start thinking about who should play.
**job_id:** J-02
**Elevator Pitch**
- Before: the club home screen shows only the club's name.
- After: Sam taps "Squad" and sees 18 players, each with name, position, age and overall rating, then taps "Back" to return to the club's home.
- Decision enabled: who is my best player, and which position is weak?

**Domain examples**
1. Sam opens `?seed=31`, picks the first club and taps "Squad". A row reads "Tomas Brenning GK 27 14" (name, position, age, overall). This row is an illustrative placeholder, not a fixed value: the generated values are fixed by the implementation, not by this example.
2. Sam taps "Back" and sees the club's name as the heading again. Sam taps the second club instead and sees a different 18 players. Reopening `?seed=31` and the first club shows the identical squad.
3. Sam opens `?seed=abc` (default seed) and views the squad of the 8th club: still exactly 18 players with 2 GK, 6 DF, 6 MF and 4 FW, none sharing a name with a player of any other club.

**Acceptance criteria (embedded UAT)**
- Scenario: Sam sees 18 players after tapping Squad.
  Given Sam is on a club's home screen, when Sam taps "Squad", then Sam sees one heading and a list named "Squad" with exactly 18 items.
- Scenario: Each row tells Sam who the player is.
  Given Sam is on a club's home screen, when Sam taps "Squad" and reads the rows, then every row shows a name, then one of GK, DF, MF or FW, then an age from 16 to 40, then an overall from 1 to 20, and age and overall are the first two numbers in the row.
- Scenario: The squad is balanced.
  Given Sam is on any club's home screen, when Sam taps "Squad" and counts the positions, then the list has at least 2 goalkeepers and at least one DF, one MF and one FW (in fact exactly 2, 6, 6 and 4).
- Scenario: Every club has different players.
  Given Sam is in one league, when Sam taps "Squad" for one club, taps "Back", and taps "Squad" for a different club, then the two lists of player names are not the same, and no player name appears in both.
- Scenario: The same link gives the same squad.
  Given Sam opened `?seed=31` and noted the first club's 18 rows, when Sam opens `?seed=31` again in a fresh visit and views the same club's squad, then the rows are identical and in the same order.
- Scenario: Back returns to the club home.
  Given Sam is looking at the "Squad" list, when Sam taps the button named "Back", then the screen heading is the club's name.
- Scenario: An invalid seed still gives a full, balanced squad.
  Given Sam opens `?seed=abc` (invalid, so the default-seed league is used), when Sam picks the league's club and taps "Squad", then the list named "Squad" has 18 players with 2 GK, 6 DF, 6 MF and 4 FW.
- Scenario: The squad fits a phone screen without sideways scrolling.
  Given Sam is on a 390px-wide phone viewport, when Sam taps "Squad" on a club's home screen, then the page does not scroll sideways, the "Squad" and "Back" buttons are at least 44px tall, and no errors appear in the browser console. (Checked at the squad screen: "Squad" is the button tapped to reach it.) does not scroll sideways, the "Squad" and "Back" buttons are at least 44px tall, and no errors appear in the browser console.

Notes for DELIVER and DISTILL (not part of the AC): the domain property (18 players, exact quota, ages 17-35, overalls 1-20, deep-equal for the same seed, no duplicate names across clubs) is covered by property tests on `generateSquad`. `update` handles `ViewSquad` and `Back`; both are no-ops from the wrong screen (as `ChooseClub` is in S-001).

**Outcome KPI:** Sam goes from club home to seeing the squad in 1 tap (measured by the e2e smoke tap count; no analytics in the POC).
**Technical notes:** `generateSquad`, `deriveSeed` and player name lists in `src/domain/`. `Screen`/`Action`/`update` in `src/app/` (ADR-0003). `el()` for the squad view (ADR-0002). Depends on S-001 (league, club home).

### Wave: DISCUSS / [REF] DoD
- `tests/protected/S-002/` passes on main.
- Unit and property tests for `generateSquad`, `deriveSeed`, navigation and the player-name denylist pass. The `ci:*` scripts are green.
- The e2e phone-viewport smoke covers club home, squad and back.
- No ambient randomness or wall-clock time in `src/domain/`.
- S-001 behaviour and tests are unchanged (club home still headed by the club name).

### Wave: DISCUSS / [REF] Out-of-scope
Player detail view, attributes and condition, derived overall, sorting and filtering, formations and the starting XI, persistence, injuries, transfers, player photos or kits.

### Wave: DISCUSS / [REF] WS strategy
Extends the S-001 walking skeleton (title, pick-club, club-home) by one step: club-home, squad, back. The e2e journey "pick a club, Squad, Back" is the end-to-end proof. Two carpaccio slices: `slices/slice-01-squad-generator.md` (a precursor commit, not shipped alone since nothing is visible) then `slices/slice-02-squad-screen.md`.

### Wave: DISCUSS / [REF] Driving ports
- `generateSquad(seed: number, clubIndex: number) => readonly Player[]`, pure domain (ADR-0004). `deriveSeed(seed, stream) => number`, pure (superseded by ADR-0005: was `deriveSeed(seed, clubIndex)`).
- `update(GameState, Action) => GameState` with `ViewSquad` and `Back`.
- UI entry: the "Squad" button on club home, the list named "Squad", and the button named "Back", reachable by role and accessible name at `http://localhost:4173/gaffer/`. Row text order: name, position, age, overall.

### Wave: DISCUSS / [REF] Pre-requisites
- S-001 delivered (league, pick-club and club-home screens, `update`, `parseSeed`).
- ADR-0002, ADR-0003 and ADR-0004 accepted; ~~no new ADR expected~~ superseded: DESIGN produced ADR-0005 (squad generation). Possible superseding note in ADR-0004 when overall becomes derived (later story).
- `docs/product/jobs.yaml` now has J-02 (resolved).
- Open risk: no DIVERGE artifact (accepted as lean). Open question for DESIGN: the construction that guarantees no shared player name across clubs.

## Wave: DESIGN

Mode: propose. Scope: application. One solo team. Paradigm: functional (ADR-0003). New ADR: `adr-0005-squad-generation.md`. Architecture: `docs/product/architecture/brief.md` ("Squad (S-002)", "For Acceptance Designer" ports 4-7). No new C4 container: the S-001 L1/L2 still hold.

### Wave: DESIGN / [REF] DDD list
- Same bounded context, "League setup", extended with `Player` and `Position`. Language: Squad, Player, Position, Overall.
- Value objects: `Player { name, position: GK|DF|MF|FW, age, overall }`; a squad is a `readonly Player[]` of 18. No aggregates, no events.
- Invariants by construction: exact quota 2/6/6/4; all names unique across the league (one league-wide draw without replacement, sliced per club); names have no digits.

### Wave: DESIGN / [REF] Decisions
| # | Decision | Source |
|---|---|---|
| D1 | Name uniqueness: partial Fisher-Yates of 144 draws from `FIRST_NAMES x SURNAMES` (900 or more combinations), seeded by `deriveSeed(seed, -1)`, club takes slice `clubIndex*18..+18`. Rejected: per-club draw plus retry; surname partition per club | ADR-0005 (a) |
| D2 | Quota 2/6/6/4 in order GK, DF, MF, FW; age 17-35; overall 1-20 uniform; no digits and no GK/DF/MF/FW tokens in names | ADR-0005 (b) |
| D3 | `deriveSeed(seed, stream)` = one mulberry32 step over `seed ^ imul(stream, 0x9e3779b9)`, in `rng.ts` | ADR-0005 (c) |
| D4 | Squad derived on render, not in `GameState`. Rejected: storing it; memoising | ADR-0005 (d) |
| D5 | `overall` stored; derived later (player-detail story) | ADR-0005 (e) |
| D6 | Denylist test enumerates the whole name pool, not just generated names | ADR-0005 (f) |
| D7 | `ViewSquad` only from clubHome, `Back` only from squad (returns to the same club); otherwise no-ops, like `ChooseClub` | ADR-0003 |
| D8 | Row built with `el()`: spans for name, position, age, overall in that order with a space between; `<li>` is not a button. `club-home.ts` gains `dispatch` and a "Squad" button | ADR-0002 |

### Wave: DESIGN / [REF] Component decomposition
| Component | Layer | Responsibility |
|---|---|---|
| `rng.ts` `deriveSeed` | domain | Pure int32 hash of (seed, stream) |
| `names.ts` | domain | Adds `FIRST_NAMES`, `SURNAMES` (30 or more each, letters/space/hyphen/apostrophe) |
| `squad.ts` | domain | `Player`, `Position`, `SQUAD_QUOTA`, `PLAYERS_PER_SQUAD`, `generateSquad` |
| `app/state.ts` | app | `Screen` + `squad`; `Action` + `ViewSquad`, `Back`; `update` |
| `ui/screens/squad.ts` | ui | `renderSquad(root, club, squad, dispatch)` |
| `ui/screens/club-home.ts` | ui | Adds "Squad" button |
| `main.ts` | shell | Renders squad screen: finds club index, calls `generateSquad(league.seed, index)` |

### Wave: DESIGN / [REF] Driving ports
- `generateSquad(seed, clubIndex) => readonly Player[]`, `deriveSeed(seed, stream) => number` (pure).
- `update(GameState, Action) => GameState` with `ViewSquad` and `Back`.
- Browser: "Squad" button on club home; `<h1>`; list "Squad" with 18 `listitem`s; "Back" button. Detail in the brief, "For Acceptance Designer".

### Wave: DESIGN / [REF] Driven ports and adapters
None: no storage, clock or network. The squad is derived, so nothing is persisted and no probe is needed. No external integrations, so no contract tests. Enforcement unchanged (oxlint boundary rules, PR guard, nightly Stryker on `src/domain/**`, which includes `squad.ts`).

### Wave: DESIGN / [REF] Technology choices
No new technology or dependency (ADR-0001, 0002, 0004 apply; all OSS). New word lists are plain data.

### Wave: DESIGN / [REF] Reuse Analysis
| Existing | Action | Contract shape / assertion |
|---|---|---|
| `src/domain/rng.ts` (`createRng`, `nextFloat`) | EXTEND: add `deriveSeed` | pure, return-only; deep-equal, int32 property |
| `src/domain/names.ts` | EXTEND: add name lists | pure data; test no duplicates, no digits, size 144 or more, denylist over whole pool |
| `src/domain/league.ts` (`drawWithoutReplacement`, `CLUBS_PER_LEAGUE`) | REUSE `CLUBS_PER_LEAGUE` only. `drawWithoutReplacement` works on item arrays, so it is not reused for squads | pure, return-only |
| `src/domain/squad.ts` | CREATE NEW (no existing alternative); includes a new index-permutation helper (partial Fisher-Yates over indices 0..pool-1) | pure, return-only; property tests (quota, ranges, determinism, cross-club uniqueness, whole-pool distinct full names) |
| `el()` (ADR-0002) | REUSE for squad rows and screen | bounded-change; e2e |
| `Club`, `League` types (`league.ts`) | REUSE unchanged (`squad.ts` and shell read them) | type-only |
| `parseSeed` | REUSE unchanged (seed source for `league.seed`) | pure, return-only |
| `renderSquad` / `club-home.ts` deltas | `renderSquad` is new; `club-home.ts` gains `dispatch` and a "Squad" button (existing call site in `main.ts` updated) | bounded-change; e2e |
| `src/app/state.ts` | EXTEND: new `Screen` and `Action` variants | pure, return-only; unit tests including wrong-screen no-ops |
| `src/ui/screens/club-home.ts` | EXTEND: "Squad" button, `dispatch` parameter | bounded-change: root's children only; e2e |
| `src/ui/screens/squad.ts` | CREATE NEW | bounded-change; e2e |
| `src/main.ts` | EXTEND: render case for squad | unbounded shell, universe unchanged (reads `location.search` once, writes root and focus) |
| `src/ui/styles.css` | EXTEND: squad rows, 44px buttons, no sideways scroll | n/a |
| `tests/unit/fixtures/real-player-denylist.ts` | CREATE NEW | test fixture |
| `tests/e2e/` | EXTEND: new `S-002-squad.spec.ts` (shell.spec.ts untouched) | black-box |

### Wave: DESIGN / [REF] Open questions
- None blocking. Name pool size (30 x 30) is a floor; DELIVER may grow it. Pinned: squad screen `<h1>` text = the club name; the list has `aria-label="Squad"`. Name-list entries are single words and a whole-pool test asserts all full names are distinct (ADR-0005 (a)). Pools are frozen after S-002 (ADR-0005 Consequences).
- Deferred: skewed overall distribution, attributes, sort and filter (later stories).
- Handoff note for DISTILL: lean on property tests for `generateSquad` (all 8 clubs per seed, assert the 144 names are distinct) and role-based e2e; enumerate the full name pool in the denylist test.

## Wave: DEVOPS

Lean, unattended. All nine decisions pre-answered. Owner-locked paths (`.github/`, `factory/`, `scripts/`, `.nwave/`, `CLAUDE.md`, brief/scope) are read-only. Machine-readable environments: `docs/feature/S-002/environments.yaml`. Inherits the S-001 DEVOPS setup; only the deltas are recorded.

Checklist: ✓ existing infra reused | ✓ KPI mapped to instrument | ✓ rollback defined | ✓ mutation strategy (nightly-delta, inherited) | ⊘ new IaC/containers (none) | ⊘ server-side observability (no backend) | ⊘ continuous learning | ⊘ CLAUDE.md edit (already states strategy)

### Wave: DEVOPS / [REF] Environment matrix
| Env | URL | Runner | Purpose |
|---|---|---|---|
| local-dev | `http://localhost:5173/gaffer/` (`pnpm dev`) | dev machine | Iteration |
| local-preview | `http://localhost:4173/gaffer/` (`ci:serve`) | dev, CI, protected runner | Production build under test; unit, property, e2e and `tests/protected/S-002/` |
| production | `https://<owner>.github.io/gaffer/` | GitHub Pages | Live site; post-deploy smoke via `BASE_URL` |

No staging (static site, recreate). Client: Chromium, Pixel 7 profile, 390px viewport. The squad is derived from `?seed=` on render, so the same seed gives the same squad in every environment.

### Wave: DEVOPS / [REF] CI/CD pipeline outline (existing, unchanged)
- `ci` (PR, push to main, dispatch): PR guards, roadmap lint, `ci:lint`, `ci:typecheck`, `ci:test` (fresh `FC_SEED`; S-002 property tests on `generateSquad` honour it), `ci:build`, `ci:e2e`, protected-scenario no-regression check vs main.
- `deploy` (push to main): `ci:build`, deploy-pages, then `smoke` runs `ci:e2e` against the live URL.
- `nightly`: `ci:mutation`; failure opens a `mutation-alarm` issue.
- `ai-review`, `factory-tick`, `watchdog`, `weekly-demo`: factory-owned, untouched.
- S-002 needs no pipeline change: it adds unit, property and e2e specs run by the existing scripts, and no new dependency.
- Local gate: `pnpm run check` mirrors the commit stage. No git hooks (locked paths; CI is the gate).
- Security: no secrets, no runtime deps, no network. Generated names enter the DOM only via `el()` (ADR-0002, never `innerHTML`). Name-pool denylist test guards against real-player names. SAST/SCA/SBOM not added (workflows locked; see Open questions).

### Wave: DEVOPS / [REF] Monitoring contracts (DISCUSS KPI to instrument)
| KPI / criterion (DISCUSS) | Instrument | Where / when | Pass condition |
|---|---|---|---|
| Club home to squad in 1 tap | Playwright `tests/e2e/S-002-squad.spec.ts`: count clicks on "Squad", assert list "Squad" visible | `ci:e2e` on PR and main; `smoke` on live URL after each deploy | Exactly 1 click |
| 18 rows per squad, quota 2/6/6/4 | e2e role query: `listitem` count in list "Squad"; position token counts | same | 18; 2 GK, 6 DF, 6 MF, 4 FW |
| Row order and ranges | e2e regexp on row text: position, first two numbers = age 16-40, overall 1-20 | same | all 18 rows match |
| Back returns to club home | e2e click "Back", assert `<h1>` is club name | same | holds |
| Same link, same squad | e2e two-visit comparison on `?seed=31`; fast-check deep-equal | `ci:e2e`, `ci:test` | identical rows, same order |
| No console errors | `page.on("console"/"pageerror")` across home, squad, back | same | zero |
| No horizontal scroll at 390px | `scrollWidth <= clientWidth` on squad screen | same | holds |
| Tap targets at least 44px | `boundingBox().height >= 44` for "Squad" and "Back" | same | both |
| Cross-club name uniqueness | property test over all 8 clubs (144 distinct names) | `ci:test` | distinct |
| Domain test strength | Stryker on `src/domain/**` (now incl. `squad.ts`, `deriveSeed`) | nightly | at or above break threshold |

No analytics (POC). The e2e tap count is the KPI's sole measurement.

### Wave: DEVOPS / [REF] Deployment strategy and rollback
- Strategy: recreate. Merge to main triggers `deploy`, replacing the whole static artifact.
- Rollback (designed first): `workflow_dispatch` of `deploy.yml` on a known-good ref (the S-001 commit before the S-002 squash); `smoke` validates the restored site. Fallback: fix-forward on a `claude/*` branch. `git revert` of the squash is blocked by the append-only protected-tests and no-regression guards (owner action). Time to restore: one deploy cycle (about 5 minutes).
- Failure detection: a red `smoke` job marks the deploy run red.
- Data: squad is derived, never stored or persisted, so no migration and no user data at risk. Rolling back to S-001 simply removes the "Squad" button.
- Blast radius: one static page.

### Wave: DEVOPS / [REF] Mutation testing strategy
nightly-delta, inherited from `CLAUDE.md`; `/nw-deliver` Phase 5 skipped. Scope `src/domain/**` now covers `squad.ts`, `rng.ts` (`deriveSeed`), `names.ts` and `league.ts`. Run by `nightly.yml` via `ci:mutation`. Failure opens `mutation-alarm`, `needs-human`. `src/app/state.ts` (`ViewSquad`/`Back`) remains outside Stryker scope (agent-editable config; see Open questions).

### Wave: DEVOPS / [REF] Observability stack
Browser console plus Playwright smoke on the deployed URL only. No RUM, error tracking, logs or tracing. SLO: smoke green per deploy. Alerting: a red `deploy` run. No dashboards.

### Wave: DEVOPS / [REF] Branching strategy
Trunk-based. Short-lived `claude/S-002-*` branches, PR to main, squash merge. CI green and protected scenarios not regressing. Deploy fires on merge. No release branches.

### Wave: DEVOPS / [REF] Coexistence matrix
| Component | S-002 impact | Action |
|---|---|---|
| `ci.yml`, `deploy.yml`, `nightly.yml` | none; run existing `ci:*` scripts | reuse |
| `ci:*` scripts, `playwright.config.ts`, `stryker.config.mjs` | none required; Pixel 7 and `BASE_URL` fit; `src/domain/**` glob already covers new files | reuse |
| `tests/e2e/S-001-pick-club.spec.ts`, `shell.spec.ts` | club-home screen gains a "Squad" button; S-001 assertions (heading = club name, scroll, 44px club buttons) must stay green | unchanged, regression-watch |
| `tests/e2e/S-002-squad.spec.ts` | new spec | add |
| `tests/protected/S-001/`, `tests/protected/S-002/` | locked runner on `localhost:4173/gaffer/`; roles and accessible names | none |
| `src/domain/league.ts` | draw helper exported or shared (DESIGN) | behaviour must stay deep-equal for S-001 seeds |
| `src/ui/screens/club-home.ts`, `src/main.ts` | extended (dispatch, squad case) | S-001 tests guard |
| Pages artifact | grows slightly; base path `/gaffer/` unchanged | none |

### Wave: DEVOPS / [REF] Pre-requisites
- S-001 delivered and deployed; GitHub Pages source "GitHub Actions" enabled (✓).
- Node 22 or later, pnpm 10.12.4 pinned, Playwright chromium via `.github/actions/setup`.
- ADR-0001..0005 accepted (✓).
- `BASE_URL` derived from repository owner and name (no secret).

### Wave: DEVOPS / [REF] Open questions
Owner-only items inherited from S-001 (smoke `sleep 20`, no security scanning, smoke has no commit-SHA check, deploy not gated on `ci`, squash revert blocked, no uptime probe) are unchanged and none block S-002. New:
1. No `.github/` change is needed for S-002.
2. Agent decision for DELIVER: extend Stryker scope to `src/app/state.ts` now that it holds navigation logic for `ViewSquad`/`Back` (config is agent-editable per ADR-0001); optional, not blocking.
3. Smoke on the live URL runs the S-002 e2e spec too; it relies on `?seed=` being honoured on Pages (same as S-001).

## Wave: DISTILL

Lean, unattended. Reconciliation passed, 0 contradictions (DISCUSS, DESIGN, DEVOPS agree). Language: TypeScript (vitest + fast-check, Playwright), following the S-001 approach: Given/When/Then-named `describe`/`it`, no cucumber, tests enabled (not skipped). Failure classification: `distill/red-classification.md`.

### Wave: DISTILL / [REF] Scenario list with tags
| Scenario | Level | Tags |
|---|---|---|
| Club home, "Squad" (one click), 18 players, "Back" to club home, no console errors | e2e | `@walking_skeleton @driving_port` |
| Each row reads name, position, age, overall; age and overall are the first two numbers (age 16-40, overall 1-20); checked for clubs 0..7 at one seed | e2e | `@driving_port` |
| Squad is balanced 2 GK / 6 DF / 6 MF / 4 FW, for clubs 0..7 | e2e | `@driving_port` |
| Rows are display-only (no buttons in the list) | e2e | `@driving_port` |
| `?seed=31` twice gives identical rows in identical order | e2e | `@determinism` |
| All 8 clubs differ; 144 names distinct across the league | e2e | `@driving_port` |
| Back shows the club name as heading, squad list gone | e2e | `@driving_port` |
| Invalid seed (`abc`, `9999999999`, empty) falls back to the default; 8th club still has 18 players balanced 2/6/6/4 | e2e | `@error` |
| No horizontal scroll at 390px on club home and squad | e2e | `@error-boundary` |
| "Squad" and "Back" at least 44px tall | e2e | `@driving_port` |
| No console errors across club home, squad, back | e2e | `@error` |
| 18 players; quota 2/6/6/4; position order; age 17-35; overall 1-20; no digits or blanks; unique within squad; no standalone GK/DF/MF/FW token in any name; any seed and club | vitest | `@property @driving_port` |
| 144 names distinct across all 8 clubs; no two clubs share a squad | vitest | `@property` |
| Same seed and club deep-equal | vitest | `@property @determinism` |
| Seeds 1 and 4242 differ; boundary seeds 0, -1, max, min give full squads | vitest | `@driving_port @error-boundary` |
| Club index -1, 8, 100, 1.5, NaN throws RangeError | vitest | `@error` |
| `deriveSeed`: signed 32-bit integer, deterministic, 9 streams distinct, seeds differ | vitest | `@property @driving_port @determinism` |
| `ViewSquad` clubHome to squad; `Back` squad to clubHome (same club); round trip leaves state equal; no input mutation | vitest | `@walking_skeleton @driving_port` |
| `ViewSquad` from title, club list or squad, and `Back` from title, club list or club home, are no-ops | vitest | `@error` |
| `ViewSquad` on a club home, and `Back` on a squad, with an unknown `clubId` return the state unchanged (`isKnownClub` precedent) | vitest | `@error` |
| Name pool (`FIRST_NAMES`, `SURNAMES`): >= 30 x 30 and >= 144 combinations; every entry one word of letters/hyphen/apostrophe; no standalone GK/DF/MF/FW; all full names distinct; no combination equals a real footballer in `tests/unit/fixtures/real-player-denylist.ts` | vitest | `@error-boundary` |

Measured error and boundary share: 27 of 59 test cases (about 46%): vitest 22 of 46 (5 name pool, 8 navigation no-ops and unknown clubs, 9 boundary seeds and club-index RangeErrors), e2e 5 of 13 (3 invalid seeds, no horizontal scroll, no console errors). The name pool and real-player denylist (ADR-0005 d, f) are now a RED DISTILL test, `name-pool.test.ts`. All tests carry `@US-1`.

### Wave: DISTILL / [REF] WS strategy
Extends the S-001 skeleton by one step: e2e "club home, Squad, Back" in the production build at `localhost:4173/gaffer/`, plus its domain twin in `navigation.test.ts`. The e2e runs on local-preview and production (`BASE_URL`); local-dev is covered by the unit and property tests. Production precondition: the deployed site honours `?seed=` (the seed query parameter is read in production exactly as in preview), otherwise the seeded e2e cases cannot pin their squads. No driven adapters exist (squad is derived, nothing stored), so the Architecture of Reference gives a real driving port and nothing to fake.

### Wave: DISTILL / [REF] Adapter coverage
| Adapter | @real-io scenario | Covered by |
|---|---|---|
| None (DESIGN: no storage, clock or network) | n/a | No driven adapters. `location.search` is read for real by every e2e test. |

### Wave: DISTILL / [REF] Scaffolds
All carry an exported `__SCAFFOLD__ = true`; behaviour throws `Error("Not yet implemented -- RED scaffold")`. DELIVER removes the markers. Additions only; S-001 behaviour and exports are unchanged.
- `src/domain/squad.ts` (new): `Position`, `Player`, `SQUAD_QUOTA`, `PLAYERS_PER_SQUAD`, `generateSquad(seed, clubIndex)`.
- `src/domain/rng.ts`: adds `deriveSeed(seed, stream)` and the marker.
- `src/domain/names.ts`: adds `__SCAFFOLD_NAMES__` and empty `FIRST_NAMES` / `SURNAMES` arrays (so `name-pool.test.ts` fails by assertion, not import error); existing exports unchanged.
- `src/app/state.ts`: `Screen` gains `{kind:"squad", clubId}`; `Action` gains `ViewSquad` and `Back` (both throw the scaffold error in `update`); adds the marker.

Not scaffolded (not imported by tests, DELIVER creates): `ui/screens/squad.ts`, the "Squad" button and `main.ts` squad case. DELIVER fills the `names.ts` lists. `tests/unit/fixtures/real-player-denylist.ts` is created now.

### Wave: DISTILL / [REF] Test placement
- `tests/acceptance/S-002/{squad-generation,derive-seed,navigation,name-pool}.test.ts`: matched by the existing vitest include (`tests/acceptance/**`).
- `tests/e2e/S-002-squad.spec.ts`: Playwright, Pixel 7 config, 390px; new file so `shell.spec.ts` and the S-001 spec stay untouched. `tests/protected/` untouched.

### Wave: DISTILL / [REF] Driving adapter coverage
| Entry | Scenario |
|---|---|
| `generateSquad` | `squad-generation.test.ts` |
| `deriveSeed` | `derive-seed.test.ts` |
| `update` with `ViewSquad`, `Back` | `navigation.test.ts` |
| Browser: "Squad" button, list "Squad", "Back" button, `<h1>` | `S-002-squad.spec.ts` (role and accessible-name queries) |

Mandate-12 note: TS tests call the driving ports directly with no step layer, so step-body and step-reuse criteria are n/a.

### Wave: DISTILL / [REF] Pre-requisites
- ADR-0002..0005 accepted; the brief's "For Acceptance Designer" ports 4-7 supply the ports.
- `ci:serve` on `localhost:4173/gaffer/`; Pixel 7 profile at 390px; `FC_SEED` honoured via `tests/setup/fast-check-seed.ts`.
- DEVOPS matrix: local-preview for e2e; production via `BASE_URL` (specs are URL-relative).
- Mandate 8 (state-delta port) n/a: `update`, `generateSquad`, `deriveSeed` are pure and return values, so tests assert on returns directly.
- KPI "club home to squad in 1 tap": the walking-skeleton e2e uses exactly one click on "Squad" (and one on "Back").
