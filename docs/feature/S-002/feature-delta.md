# S-002: View my squad

## Wave: DISCUSS

Lean, unattended. Reuses `discuss/journey.md`. Outcome is fixed by `docs/roadmap.yaml` (S-002) and is not re-scoped here. Scope assessment: PASS (1 story, 2 contexts touched: domain and UI, about 2 days).

### Wave: DISCUSS / [REF] Persona
Sam, 34, a lapsed Championship Manager fan. Plays on the bus, one-handed, on a mid-range Android phone at 390px wide. Has 5 minutes and wants the squad at a glance, with no sideways scrolling (brief.md, "Player").

### Wave: DISCUSS / [REF] JTBD one-liner
When I have just taken over a club, I want to see who I have got, so that I can start judging who should play. (Specialises J-01 `take-charge-of-a-club` in `docs/product/jobs.yaml`; no change to that file is needed.)

### Wave: DISCUSS / [REF] Locked decisions
- Squad comes from `generateSquad(seed, clubIndex)` in `src/domain/`, using `deriveSeed(seed, clubIndex)` (ADR-0003/0004). Same seed and club give an identical squad on every visit. Squads are not stored; they are regenerated from the league seed.
- Quota is exactly 2 GK / 6 DF / 6 MF / 4 FW = 18 players. Ages are 17-35 (ADR-0004; narrower than the 16-40 the outcome allows). Overall is a stored integer 1-20.
- Player names come from fictional first-name and surname lists and must contain no digits, so the first two numbers in a row are age then overall.
- Row order of content: name, position (GK/DF/MF/FW), age, overall. Rows are `<li>` items in a `<ul>` named "Squad". Rows are not buttons: there is no player detail yet.
- Screens: club-home gains a button named exactly "Squad"; the new squad screen has one `<h1>`, the "Squad" list and a button named exactly "Back" that returns to club-home. "Back" is not a browser-history action; it is an app `Action` in `update` (ADR-0003).
- The squad screen is for the chosen club only. Navigation state is memory only.
- Squad screen layout: no horizontal scroll at 390px (long names wrap); tap targets of 44px or more for the "Back" and "Squad" buttons (CLAUDE.md "Phone first").
- No attributes, condition or other player fields are added (ADR-0004 defers them).
- UX depth: lightweight, no mockups beyond the journey table.

### Wave: DISCUSS / [REF] User stories

#### US-1: See who is in my squad
**Problem:** Sam has taken over a club, but it is just a name. Without a list of players, Sam cannot judge who is good or where the team is weak, so no lineup decision is possible.
**job_id:** J-01
**Elevator Pitch**
- Before: Sam's club home shows only the club's name.
- After: Sam taps "Squad" and sees a list named "Squad" with 18 players, each showing name, position, age and overall, then taps "Back" to return home.
- Decision enabled: who is my best player and which position is weak? (It also sets up the formation and starting-XI story.)

**Domain examples**
1. Sam opens `/gaffer/?seed=31`, taps "New game", picks the 1st club, then "Squad". The list has 18 rows; one reads "Tomas Brenning GK 27 14" (name, position, age, overall). Counts: 2 GK, 6 DF, 6 MF, 4 FW. Illustrative: the actual names depend on DELIVER word lists.
2. Sam taps "Back" and sees the club's name as the heading again. Sam picks the 2nd club instead and sees a different set of players. Reopening `?seed=31` and club 1 shows the identical squad.
3. Boundary: with seeds 0, -1 and 2147483647, every club still has 18 players, 2 GK, ages 17-35, overalls 1-20, and no digit in any name, so reading the first two numbers in a row always gives age then overall.

**Acceptance criteria (embedded UAT)**
- Scenario: Sam opens the squad from club home.
  Given Sam has chosen a club and is on its home screen, when Sam taps "Squad", then Sam sees one heading and a list named "Squad" with exactly 18 items.
- Scenario: Each row tells Sam who the player is.
  Given Sam is looking at the "Squad" list, then every row shows a name, one position (GK, DF, MF or FW), an age from 16 to 40 and an overall from 1 to 20, in that order, and the first two numbers in the row are the age then the overall.
- Scenario: The squad can cover every position.
  Given Sam is looking at the "Squad" list, then there are at least 2 goalkeepers and at least one DF, one MF and one FW.
- Scenario: Every club has different players.
  Given Sam has looked at the first club's squad with `?seed=31`, when Sam looks at the squads of the other 7 clubs, then no two clubs show the same list of players.
- Scenario: The same link shows the same squad.
  Given Sam noted the squad of the 1st club at `?seed=31`, when Sam opens `?seed=31` again in a fresh visit and views that club's squad, then the 18 rows are identical and in the same order. Viewing it twice in one visit also gives identical rows.
- Scenario: Back returns to club home.
  Given Sam is on the squad screen, when Sam taps "Back", then Sam sees the club home screen headed by the club's name.
- Scenario: The squad is easy to read on a phone.
  Given Sam is on a 390px-wide phone viewport on the squad screen, then the page does not scroll sideways, "Back" is at least 44px tall, and no errors appear in the browser console.

Notes for DELIVER and DISTILL (not part of the AC): the domain property (quota 2/6/6/4, ages 17-35, overall 1-20, no digit in any name, deep-equal for same seed and club, distinct squads across the 8 clubs of a league) is covered by property tests on `generateSquad`. `Squad` and `Back` actions are unit-tested on `update`. The roadmap outcome's 16-40 age range is wider than the generated 17-35; tests assert the generated range.

**Outcome KPI:** Sam goes from club home to a full squad view in 1 tap and back in 1 tap (measured by the e2e smoke tap count; no analytics in the POC).
**Technical notes:** `generateSquad`, `deriveSeed` and player name lists in `src/domain/` (ADR-0004). `update`/`Screen` gain a squad screen in `src/app/` (ADR-0003). Views via `el()` (ADR-0002). The squad screen needs the league seed and the chosen club's index; `GameState` already holds the league (S-001).

### Wave: DISCUSS / [REF] DoD
- `tests/protected/S-002/` passes on main.
- Unit and property tests for `generateSquad`, `deriveSeed` and the `update` actions pass. The `ci:*` scripts are green.
- The e2e phone-viewport smoke covers club home, squad and back.
- No ambient randomness or wall-clock time in `src/domain/`.

### Wave: DISCUSS / [REF] Out-of-scope
Player detail view, attributes, condition, sorting and filtering, formations and the starting XI, persistence, player images, transfers, squad size changes.

### Wave: DISCUSS / [REF] WS strategy
No walking skeleton: brownfield. S-001 delivered the end-to-end skeleton (title, pick-club, club-home). This story extends it by one screen. Delivery is two carpaccio slices: `slices/slice-01-generate-squad.md` (a domain precursor commit, not visible to the player), then `slices/slice-02-squad-screen.md`, which makes the squad reachable and demonstrable.

### Wave: DISCUSS / [REF] Driving ports
- `generateSquad(seed: number, clubIndex: number) => Player[]`, a pure domain function (ADR-0004), with `deriveSeed(seed, clubIndex) => number`.
- `update(GameState, Action) => GameState` with new actions for opening the squad and going back (shell navigation, ADR-0003).
- UI entry: the "Squad" button on club home, the "Squad" list and the "Back" button, reachable by role and accessible name at `http://localhost:4173/gaffer/`.

### Wave: DISCUSS / [REF] Pre-requisites
- S-001 delivered (league, club-home, `update`/`Screen`, `el()`).
- ADR-0002, ADR-0003 and ADR-0004 accepted.
- `docs/product/jobs.yaml` has J-01 (no change needed).
- Open risk: there is no DIVERGE artifact. Accepted as lean.

## Wave: DESIGN

Mode: propose. Scope: application. One solo team. Paradigm: functional (functional core / imperative shell, ADR-0003), recorded in the ADR and `docs/product/architecture/brief.md`. No new ADR: ADR-0001..0004 cover every decision (squad quota, age range, `deriveSeed` are fixed by ADR-0004; the `squad` screen kind is already named in ADR-0003). Full architecture: `docs/product/architecture/brief.md`.

### Wave: DESIGN / [REF] DDD list
- Same bounded context as S-001 ("League setup"), extended with the term Player. Language: Seed, League, Club, Squad, Player, Position.
- Value objects: `Player` (`name`, `position`, `age`, `overall`) and `Position` (`GK | DF | MF | FW`). A squad is a `readonly Player[]` of 18, derived data: never stored, regenerated from `(league.seed, clubIndex)`. No aggregates, no domain events.
- Invariants, enforced by construction: quota 2/6/6/4 (the squad is built from the quota, not filtered); age 17-35; overall integer 1-20; names have no digits (word lists contain none); surnames are drawn without replacement within a squad, so no two players in one squad share a surname.
- `clubIndex` is the club's position in `league.clubs` (0-7), found by the shell with `findIndex` on the chosen `clubId`.

### Wave: DESIGN / [REF] Component decomposition
| Component | Layer | Responsibility |
|---|---|---|
| `deriveSeed(seed, clubIndex)` in `rng.ts` | domain | Pure integer hash to a per-club seed (ADR-0003/0004) |
| `FIRST_NAMES`, `SURNAMES` in `names.ts` | domain | Frozen fictional lists (about 30 first names, 40 or more surnames); no digits, no real players |
| `Player`, `Position` types and `generateSquad(seed, clubIndex)` in new `squad.ts` | domain | Pure 18-player squad. Order is fixed: GK, DF, MF, FW (quota order), so reopening gives identical order |
| `Player` re-export in `app/types.ts` | app | Lets `ui` import types without reaching into `domain` |
| `Screen` gains `{ kind: "squad"; clubId }`; `Action` gains `OpenSquad` and `Back` | app | Navigation only. `OpenSquad` is valid only from `clubHome`; `Back` only from `squad` (returns `clubHome` with the same `clubId`). Otherwise the state is unchanged |
| `ui/screens/squad.ts` `renderSquad(root, club, squad, dispatch)` | ui | One `<h1>` "Squad", a `<p>` with the club name, `<ul aria-label="Squad">` of 18 `<li>` rows, a `<button>` "Back" |
| `ui/screens/club-home.ts` | ui | Gains a "Squad" `<button>`; signature becomes `renderClubHome(root, club, dispatch)` |
| `main.ts` (composition root and loop) | shell | New `squad` case: finds the club and its index, calls `generateSquad(league.seed, index)`, renders. Focus on `<h1>` unchanged |
| `ui/styles.css` | ui | Squad list and row layout, wrapping names, 44px "Back" and "Squad" buttons |

Row markup: each `<li>` holds four inline `<span>`s in the order name, position, age, overall, separated by whitespace text nodes so the row's text reads "Tomas Brenning GK 27 14". CSS lays them out as columns and lets the name wrap. Rows are not buttons.

### Wave: DESIGN / [REF] Driving ports
- `generateSquad(seed: number, clubIndex: number) => readonly Player[]` (domain, pure) and `deriveSeed(seed: number, clubIndex: number) => number` (domain, pure).
- `update(GameState, Action) => GameState` with `OpenSquad` and `Back` added.
- Browser: `button` "Squad" on club home; on the squad screen one `<h1>`, `list` "Squad" with 18 `listitem`s, `button` "Back" (44px or taller). Details in the brief's "For Acceptance Designer" section.

### Wave: DESIGN / [REF] Driven ports and adapters
None. Squads are derived in memory from the seed; no storage, clock or network. No external integrations, so no contract tests. Earned Trust: no adapter, so no probe; the determinism property tests are the empirical check.

### Wave: DESIGN / [REF] Technology choices
None new. TypeScript, plain DOM `el()`, Vitest + fast-check, Playwright, oxlint, Stryker (ADR-0001/0002). Stryker already mutates `src/domain/**`, so `squad.ts` and `deriveSeed` are covered nightly. No runtime dependencies.

### Wave: DESIGN / [REF] Decisions
| # | Decision | Source |
|---|---|---|
| D1 | Squads are derived data: never stored in `GameState`, regenerated by the shell from `league.seed` and the club index | ADR-0003/0004 |
| D2 | `deriveSeed` lives in `rng.ts` next to `createRng` (ADR-0003 lists it with them). Suggested form per ADR-0004 (a mulberry32 step over `seed ^ (clubIndex * 0x9e3779b9)`); the crafter owns the exact hash, bound by the property tests | ADR-0004 |
| D3 | Clubs get distinct derived seeds; pairwise distinctness of the 8 squads is property-tested for any 32-bit seed (not guaranteed by construction) | ADR-0004 |
| D4 | Name digits are impossible by construction (lists contain none); surnames within one squad are drawn without replacement (same technique as towns) so a squad has no repeated surname | ADR-0004 |
| D5 | Overall is drawn independently of position (uniform 1-20) and age (uniform 17-35). No formula linking them: ADR-0004 makes overall a stored placeholder until attributes arrive | ADR-0004 |
| D6 | Fixed squad order: GK, DF, MF, FW. No sorting in the UI | DISCUSS |
| D7 | `Back` is an app `Action`, not browser history. `OpenSquad`/`Back` are no-ops outside their source screen, as in S-001 | ADR-0003 |
| D8 | `ul` gets `aria-label="Squad"` and the `<h1>` is "Squad", mirroring the "Clubs" list. A paragraph under the heading shows the club name. Rejected: `<h1>` containing the club name (the list name or "Squad" heading would drift) | ADR-0002 |
| D9 | No new ADR. Rejected alternative: a separate ADR-0005 for row markup and name uniqueness (they are story-level choices fully covered by ADR-0002/0004). `docs/product/architecture/brief.md` is the SSOT for the fixed GK/DF/MF/FW order and for within-squad surname uniqueness | n/a |
| D11 | The AC and outcome age bound 16-40 is the outcome bound only; the generator and all tests pin 17-35 (ADR-0004) | ADR-0004 |
| D12 | Accessible naming of rows evaluated. `aria-label` on the `<li>` would override its accessible name and break name-based queries and the row-text contract; `aria-describedby` on rows adds hidden text and duplicates it for screen readers. Outcome: rows stay plain text, deferral stands (see Open questions) | ADR-0002 |
| D10 | Rejected simpler alternative: store squads in `GameState` at game start. It adds state to persist and breaks "derived data" (ADR-0003) | ADR-0003 |

### Wave: DESIGN / [REF] Reuse Analysis
| Existing | Action | Justification / contract shape / assertion |
|---|---|---|
| `src/domain/rng.ts` | EXTEND (add `deriveSeed`) | ADR-0003 places it here. Pure, return-only. Property: deterministic, int32-safe, distinct for clubIndex 0-7 |
| `src/domain/names.ts` | EXTEND (add `FIRST_NAMES`, `SURNAMES`) | Same file as the other word lists. Pure data constants; unit test: no duplicates, no digits |
| `src/domain/league.ts` | EXTEND (export or share its draw helpers `drawIndex`/`drawWithoutReplacement`; do not duplicate) | Shape: pure, return-only. Universe: `generateLeague(seed)` output must stay deep-equal to the S-001 output for every seed, so the extraction must not change draw order or the number of draws. Assertion: the existing S-001 league property/determinism tests plus a pinned-output regression check for seeds 1, 4242 and `DEFAULT_SEED` |
| `src/domain/squad.ts` (`generateSquad`, `Player`) | CREATE NEW | No existing alternative. Pure, return-only; input never mutated; property tests (quota, ranges, no digits, deep-equal, pairwise distinct) |
| `src/app/state.ts` | EXTEND (`Screen`, `Action`, `update`) | Pure, return-only; unit tests on `OpenSquad`/`Back` including no-op cases |
| `src/app/types.ts` | EXTEND (re-export `Player`) | Types only |
| `src/ui/screens/club-home.ts` | EXTEND (add "Squad" button and `dispatch`) | Bounded-change: writes only `root`'s children; e2e |
| `src/ui/screens/squad.ts` | CREATE NEW | No existing alternative. Bounded-change: writes only `root`'s children; no focus move; e2e |
| `src/ui/dom.ts` `el()` | EXTEND (use as is) | Unchanged |
| `src/main.ts` | EXTEND (new `squad` case, `dispatch` into club-home) | Declared universe unchanged: reads `location.search` once; writes only `root`'s children and focus |
| `src/ui/styles.css` | EXTEND | n/a |
| `tests/e2e/S-001-pick-club.spec.ts` | KEEP (unchanged) | Club home still has one `<h1>`; S-002 gets its own spec |

### Wave: DESIGN / [REF] Open questions
- None blocking.
- Accessibility note, deferred: a screen reader reads a row as "name GK 27 14" without labels for age and overall. Column labels or visually hidden text can come with the player-detail story; adding them now would change the row's text order that the protected scenarios read.
- Handoff note for DISTILL: lean on property tests for `generateSquad`; e2e for the row text order, the 8-club difference and the Squad/Back round trip. External integrations: none, so no contract tests.

## Wave: DEVOPS

Lean, unattended. All decisions pre-answered. Owner-locked paths (`.github/`, `factory/`, `scripts/`, `.nwave/`, `CLAUDE.md`) are read-only. Builds on S-001 DEVOPS (`docs/feature/S-001/feature-delta.md`). Machine-readable environments: `docs/feature/S-002/environments.yaml`.

Checklist: ✓ existing infra reused | ✓ KPI mapped to instrument | ✓ rollback defined | ✓ mutation strategy (nightly-delta, inherited) | ⊘ new IaC/containers (none) | ⊘ server-side observability (no backend) | ⊘ continuous learning | ⊘ CLAUDE.md edit (already states strategy)

### Wave: DEVOPS / [REF] Environment matrix
| Env | URL | Runner | Purpose |
|---|---|---|---|
| local-dev | `http://localhost:5173/gaffer/` (`pnpm dev`) | dev machine | Iteration |
| local-preview | `http://localhost:4173/gaffer/` (`ci:serve`) | dev, CI, protected runner | Production build under test: unit, e2e, `tests/protected/S-002/` |
| production | `https://<owner>.github.io/gaffer/` | GitHub Pages | Live site; post-deploy smoke via `BASE_URL` |

Clients: phone (Chromium, Pixel 7 profile, 390px; the gating profile) and desktop (Chromium, wider viewport; layout sanity only, no separate spec). No staging: static site, recreate strategy, pre-merge CI against the production build is the gate. Same as S-001 apart from the added desktop client.

### Wave: DEVOPS / [REF] CI/CD pipeline outline (existing, unchanged)
- `ci` (PR, push to main, dispatch): setup, PR guards, roadmap lint, `ci:lint`, `ci:typecheck`, `ci:test` (fresh `FC_SEED`), `ci:build`, `ci:e2e`, protected-scenario no-regression check.
- `deploy` (push to main): `ci:build`, deploy-pages, then `smoke` runs `ci:e2e` against the live URL. `nightly`: `ci:mutation`. `ai-review`, `factory-tick`, `watchdog`, `weekly-demo`: factory-owned, untouched.
- S-002 needs no pipeline change: it adds unit, property and e2e specs run by the existing scripts.
- Local gate: `pnpm run check` (lint, typecheck, test, build, e2e). No git hooks (locked paths; CI is the gate).
- Security: no secrets, no runtime dependencies, no network, no storage. Generated names enter the DOM only via `el()` (ADR-0002). S-001 waiver on SAST/SCA/SBOM stands (see S-001 Open questions 2).

### Wave: DEVOPS / [REF] Monitoring contracts (DISCUSS KPI to instrument)
| KPI / contract (DISCUSS) | Instrument | Where / when | Pass condition |
|---|---|---|---|
| Club home to squad in 1 tap, back in 1 tap | Playwright spec `tests/e2e/S-002-squad.spec.ts`: count clicks ("Squad", "Back"), assert `<h1>` and club-name heading | `ci:e2e` on PR and main; `smoke` on live URL after each deploy | Exactly 1 click each way |
| "Squad" list has 18 `<li>`; row text reads name, position, age, overall | e2e role queries (`list` "Squad", `listitem`) | same | 18 rows; first two numbers are age then overall |
| No horizontal scroll at 390px | e2e `scrollWidth <= clientWidth` on the squad screen | same | holds |
| "Back" and "Squad" tap targets at least 44px | e2e `boundingBox().height >= 44` | same | both buttons |
| No console errors | e2e `console`/`pageerror` listener across club home and squad | same | zero errors |
| Same seed and club, same squad; 8 clubs differ | fast-check on `generateSquad`; e2e two-visit and 8-club comparison | `ci:test`, `ci:e2e` | deep-equal; pairwise distinct |
| Quota 2/6/6/4, ages 17-35, overall 1-20, no digit in names | fast-check on `generateSquad` | `ci:test` | holds for any 32-bit seed |
| Domain test strength | Stryker on `src/domain/**` | nightly | at or above the break threshold in `stryker.config.mjs` |

No analytics (POC). The e2e tap count is the KPI's sole measurement.

### Wave: DEVOPS / [REF] Deployment strategy and rollback
- Strategy: recreate. Merge to main triggers `deploy`, replacing the whole static artifact.
- Rollback (designed first): `workflow_dispatch` of `deploy.yml` on a known-good ref (the S-001 head, for example); `smoke` then validates the restored site. Fallback: fix-forward on a `claude/*` branch. Squash-commit revert is blocked by the append-only and no-regression guards (owner action). Time to restore: one deploy cycle (about 5 minutes).
- Rolling back to the S-001 build is safe: squads are derived data, never stored; navigation state is memory only. No migration, no user data.
- Blast radius: one static page, no persistence, no backend.

### Wave: DEVOPS / [REF] Mutation testing strategy
nightly-delta, inherited from `CLAUDE.md` (not edited); `/nw-deliver` Phase 5 skipped. Target `src/domain/**` gains `squad.ts` (`generateSquad`, `Player`), plus `deriveSeed` in `rng.ts` and the new lists in `names.ts`; the existing glob covers them, so no Stryker config change is needed. Expect mutants in the quota loop, age and overall ranges, surname draw-without-replacement and the fixed GK/DF/MF/FW order; the property tests (quota, ranges, deep-equal, pairwise distinct) must kill them. `src/app/` (`update` `OpenSquad`/`Back`) stays outside the mutation scope (S-001 Open question 3 still applies).

### Wave: DEVOPS / [REF] Observability stack
Browser console plus Playwright smoke on the deployed URL only. No RUM, error tracking, logs or tracing. SLO: smoke green per deploy. Alerting: a red `deploy` run (GitHub notification). No dashboards.

### Wave: DEVOPS / [REF] Branching strategy
Trunk-based. Short-lived `claude/S-002-*` branches, PR to main, squash merge. CI green and protected scenarios not regressing. Deploy fires on merge. No release branches or tags.

### Wave: DEVOPS / [REF] Coexistence matrix
| Component | S-002 impact | Action |
|---|---|---|
| `ci.yml`, `deploy.yml`, `nightly.yml` | none; run the existing `ci:*` scripts | reuse |
| `ci:*` scripts, `playwright.config.ts` | none; `BASE_URL` and Pixel 7 already fit | reuse |
| `tests/e2e/S-001-pick-club.spec.ts`, `shell.spec.ts` | unchanged; club home still has one `<h1>` | keep |
| `tests/e2e/S-002-squad.spec.ts` | new: Squad/Back round trip, row order, 8-club difference, 390px checks | add |
| `tests/protected/S-001/`, `S-002/` | locked runner on `localhost:4173/gaffer/`; roles and accessible names ("Squad" button, "Squad" list, "Back") | none |
| `src/domain/rng.ts`, `names.ts` | extended; S-001 league output must stay byte-identical (same seed, same league) so protected S-001 and the two-visit specs hold | extend carefully |
| Stryker config | `src/domain/**` now includes `squad.ts` | none |
| Pages artifact | `dist/` grows slightly (word lists); base path `/gaffer/` unchanged | none |

### Wave: DEVOPS / [REF] Pre-requisites
- GitHub Pages enabled with source "GitHub Actions" (in use).
- Node 22+, pnpm 10.12.4 (pinned), Playwright chromium via `.github/actions/setup`.
- ADR-0001..0004 accepted (✓); S-001 delivered (✓).
- `BASE_URL` for the smoke is derived from the repository owner and name (no secret).

### Wave: DEVOPS / [REF] Open questions
Owner-only (locked paths); none block S-002. The S-001 DEVOPS items 1-7 still stand (fixed `sleep 20` in smoke, no security scan, Stryker scope excludes `src/app/`, no deployed-SHA check, deploy not gated on `ci`, squash-revert blocked, no uptime probe). New:
1. The live smoke runs the whole `ci:e2e` suite, S-002 specs included. A stale pre-S-002 Pages build would fail them loudly, so the missing deployed-SHA check (S-001 item 4) is lower risk here. No change requested.
2. If squad rows later gain more fields, the screen-reader labelling deferred in DESIGN needs an e2e a11y check; none is added now.

## Wave: DISTILL

Lean, unattended. Reconciliation passed, 0 real contradictions (age wording 16-40 vs 17-35 resolved to 17-35, `open-questions.md`). Language: TypeScript (vitest + fast-check, Playwright). No cucumber: scenarios are Given/When/Then-named `describe`/`it` files. Failure classification: `distill/red-classification.md`.

### Wave: DISTILL / [REF] Scenario list with tags
Contract shapes: `@contract-shape:pure-function` (generateSquad, deriveSeed), `bounded-change` (update navigation, e2e journey), `unbounded-preservation` (generateLeague regression). DISCUSS AC names are from US-1.

| Scenario | Level | Tags | DISCUSS AC |
|---|---|---|---|
| Sam taps Squad, sees 18 players, taps Back to the club home | e2e | `@contract-shape:bounded-change @driving_port` | Sam opens the squad from club home; Back returns to club home |
| Row text reads name, position, age, overall; age then overall are the first two numbers | e2e | `@contract-shape:bounded-change @driving_port` | Each row tells Sam who the player is |
| Positions limited to GK/DF/MF/FW, at least 2 GK | e2e | `@contract-shape:bounded-change @driving_port` | The squad can cover every position |
| No horizontal scroll at 390px on the squad screen | e2e | `@contract-shape:bounded-change @error-boundary` | The squad is easy to read on a phone |
| Back and Squad buttons at least 44px tall | e2e | `@contract-shape:bounded-change @error-boundary` | The squad is easy to read on a phone |
| Back returns to the club home headed by the club name | e2e | `@contract-shape:bounded-change @driving_port` | Back returns to club home |
| Same seed, identical squad on a second look and a fresh visit | e2e | `@contract-shape:bounded-change @property`-style | The same link shows the same squad |
| The 8 clubs show 8 different squads | e2e | `@contract-shape:bounded-change @driving_port` | Every club has different players |
| Reload on the squad screen returns to the title (memory-only navigation) | e2e | `@contract-shape:bounded-change @error-boundary` | DISCUSS locked decision: navigation state is memory only |
| No console errors across club home, squad, back | e2e | `@contract-shape:bounded-change @error` | The squad is easy to read on a phone |
| 18 players; quota 2/6/6/4; at least 2 GK and all positions; fixed order GK, DF, MF, FW | vitest | `@contract-shape:pure-function @property @driving_port` | Opens the squad (18); The squad can cover every position |
| Ages 17-35 integers; overall integers 1-20; names non-empty and digit-free | vitest | `@contract-shape:pure-function @property` | Each row tells Sam who the player is |
| No two players in a squad share a name | vitest | `@contract-shape:pure-function @property @error-boundary` | DESIGN D4 (no repeated names) |
| Same seed and club deep-equal | vitest | `@contract-shape:pure-function @property @determinism` | The same link shows the same squad |
| 8 clubs pairwise different squads for any seed | vitest | `@contract-shape:pure-function @property` | Every club has different players |
| Boundary seeds 0, -1, max, min give full valid squads | vitest | `@contract-shape:pure-function @driving_port @error-boundary` | DISCUSS domain example 3 |
| `deriveSeed`: deterministic, 32-bit, 8 distinct values for clubs 0-7 | vitest | `@contract-shape:pure-function @property @determinism` | Every club has different players; same link, same squad |
| `generateLeague(4242)` club names unchanged; league shape unchanged for any seed | vitest | `@contract-shape:unbounded-preservation @regression @property` (green now, stay green) | DEVOPS coexistence: S-001 league output unchanged |
| OpenSquad: clubHome to squad, same clubId; league unchanged | vitest | `@contract-shape:bounded-change @driving_port` | Sam opens the squad from club home |
| Back: squad to clubHome, same clubId; OpenSquad then Back round trips for all 8 clubs | vitest | `@contract-shape:bounded-change @driving_port` | Back returns to club home |
| OpenSquad from title, pickClub, squad is a no-op; Back from title, pickClub, clubHome is a no-op | vitest | `@contract-shape:bounded-change @error` | DESIGN D7 (no-ops outside source screen) |

Counts: 29 vitest tests (2 regression guards, 27 RED), 10 e2e (all RED).
Error, boundary and edge share, counted honestly: vitest 6 no-op navigation + 4 boundary seeds + 1 distinct-names = 11 of 29; e2e scroll, tap size, reload, console errors = 4 of 10. Total 15 of 39, about 38%, just under the 40% target. Justification: this is a read-only list screen with no user input, so the failure space is small (no invalid entry, no network or storage). The edge cases that exist (boundary seeds, no-ops, memory-only reload, layout limits) are covered. The 8-club difference and determinism properties are counted as happy-path invariants. Surname-uniqueness by surname (DESIGN D4) and word-list hygiene are DELIVER unit tests; the DISTILL property asserts full names are distinct. All tests are enabled (no skip), per the green-branch rule; they land with the implementation.

### Wave: DISTILL / [REF] WS strategy
No new walking skeleton (brownfield; S-001 owns it). The first e2e, Squad then Back round trip from a picked club, is the story's demonstrable journey, and its domain twin is `navigation.test.ts`. There are no driven adapters (Architecture of Reference: real driving port, nothing to fake), so no fakes are used. Seeds are pinned with `?seed=31` for determinism.

### Wave: DISTILL / [REF] Adapter coverage
| Adapter | @real-io scenario | Covered by |
|---|---|---|
| None (DESIGN: squads derived in memory, no storage, clock or network) | n/a | Determinism properties are the empirical check; e2e covers two fresh visits |

### Wave: DISTILL / [REF] Scaffolds
All carry an exported `__SCAFFOLD__ = true` and throw `Error("Not yet implemented -- RED scaffold")`. DELIVER removes the markers.
- `src/domain/squad.ts` (new): `Position`, `Player { name, position, age, overall }`, `generateSquad(seed, clubIndex)`.
- `src/domain/rng.ts`: `deriveSeed(seed, clubIndex)` added; existing `createRng`/`nextFloat` untouched.
- `src/app/state.ts`: `Screen` gains `{kind:"squad", clubId}`, `Action` gains `{type:"OpenSquad"}` and `{type:"Back"}`; `update` throws for those two cases only. Existing `NewGame`/`ChooseClub` behaviour is unchanged.

Not scaffolded (UI, no test imports): `ui/screens/squad.ts`, the club-home "Squad" button and the `main.ts` squad case. `main.ts` still typechecks because its `render` switch is non-exhaustive.

### Wave: DISTILL / [REF] Test placement
- `tests/acceptance/S-002/{squad-generation,navigation}.test.ts`: matched by the existing `vitest.config.ts` include.
- `tests/e2e/S-002-squad.spec.ts`: Playwright next to the S-001 specs; Pixel 7 at 390px. `tests/protected/` untouched.

### Wave: DISTILL / [REF] Driving adapter coverage
| Entry | Scenario |
|---|---|
| `generateSquad`, `deriveSeed` | `squad-generation.test.ts` |
| `update` (`OpenSquad`, `Back`) | `navigation.test.ts` |
| Browser: "Squad" button, "Squad" list with 18 items, "Back" button, `<h1>` | `S-002-squad.spec.ts` (role and accessible-name queries) |

Mandate-12 note: TS vitest tests call the driving ports directly with no step layer, so the step-body and step-reuse criteria are n/a.

### Wave: DISTILL / [REF] Pre-requisites
- Check B (environment preconditions) is N/A: brownfield, no new walking skeleton. e2e specs use relative URLs (`./`) and honour `BASE_URL`, so they run against local-preview and production unchanged.
- ADR-0002, ADR-0003, ADR-0004 accepted; the brief's "For Acceptance Designer" section supplies the ports.
- `ci:serve` on `localhost:4173/gaffer/` (Playwright `webServer`); Pixel 7 profile at 390px; `FC_SEED` honoured by `tests/setup/fast-check-seed.ts`.
- DEVOPS matrix: local-preview for e2e, production via `BASE_URL`; specs are URL-relative.
- Mandate 8 n/a: `update()` and the domain functions are pure and return values.
- Constraint carried to DELIVER: `generateLeague` output must stay identical (regression guards above); if `deriveSeed` or word lists share helpers with `league.ts`, do not change its draw order.
- Placement: separate `S-002-squad.spec.ts`; `S-001-pick-club.spec.ts` is kept unchanged. All tests carry `@US-1`.

