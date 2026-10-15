# S-001: Start a new game and pick a club

## Wave: DISCUSS

Lean, unattended. Reuses `discuss/journey.md`. Outcome is fixed by `docs/roadmap.yaml` (S-001) and is not re-scoped here.

### Wave: DISCUSS / [REF] Persona
Sam, 34, a lapsed Championship Manager fan. Plays on the bus, one-handed, on a mid-range Android phone at 390px wide. Has 5 minutes and no patience for setup screens (brief.md, "Player").

### Wave: DISCUSS / [REF] JTBD one-liner
When I open Gaffer with a few spare minutes, I want to be in charge of a club in seconds, so that the next thing I do is a managerial decision rather than a setup chore. (Specialises the brief job, recorded as J-01 `take-charge-of-a-club` in `docs/product/jobs.yaml`.)

### Wave: DISCUSS / [REF] Locked decisions
- Seed comes from `?seed=<int>` with a fixed `DEFAULT_SEED` fallback. Anything invalid (missing, empty, `abc`, fractional, out of 32-bit range) silently uses the default (ADR-0004).
- League: 8 fictional clubs, each with a unique name and two distinct colours, generated purely from the seed (ADR-0004).
- Chosen club is held in memory only. No persistence in this story.
- Screens: title (exists), pick-club, club-home. Each has exactly one `<h1>`.
- Club = one `<button>` of 44px or taller, inside a `<ul>` named "Clubs". The first line of its text is the club name. The colour swatch is decorative and `aria-hidden`. Real buttons, one `<h1>` per screen, lists for collections and 44px targets are required by CLAUDE.md "Phone first" (accessible markup that the protected scenarios query by role and name).
- Real-club denylist unit test, per ADR-0004.
- Seed alternatives rejected in ADR-0004: B (wall-clock seed on "New game", untestable black-box and a varying first run) and C (seed text input on the title screen, extra friction against the five-minute loop).
- UX depth: no mockups beyond the journey table.

### Wave: DISCUSS / [REF] User stories

#### US-1: Choose a club from a generated league
**Problem:** Sam opens Gaffer, taps "New game" and nothing is behind it. There is no club to manage, so no decision is possible.
**job_id:** J-01
**Elevator Pitch**
- Before: the title screen has a "New game" that leads nowhere.
- After: Sam taps "New game", sees "Choose your club" with 8 clubs, taps one, and lands on a screen headed by that club's name.
- Decision enabled: which club do I take on?

**Domain examples**
1. Sam opens `/gaffer/` with no seed, taps "New game" and sees the same 8 clubs every visit, for example "Brindlecombe Rovers" and "Quarrow Athletic".
2. Sam opens `/gaffer/?seed=1` and then `/gaffer/?seed=4242` and sees two different leagues. Reopening `?seed=4242` shows the identical league as before.
3. Sam opens `/gaffer/?seed=abc` and sees the default league (the one with no seed). The same happens with `?seed=`, `?seed=9999999999`, `?seed=1.5` (fractional) and `?seed=+5`. `?seed=007` is a valid seed (7), not a fallback.

The names above are illustrative. The actual `DEFAULT_SEED` value is chosen in DELIVER, so the default league's club names are not fixed here.

**Acceptance criteria (embedded UAT)**
- Scenario: Sam sees 8 clubs after tapping New game.
  Given Sam is on the title screen, when Sam taps "New game", then Sam sees a heading "Choose your club" and a list named "Clubs" with 8 clubs, each one a single tappable button.
- Scenario: Every club has its own name.
  Given Sam is looking at the "Clubs" list, then each of the 8 clubs shows a non-empty name and no two names are the same.
- Scenario: Tapping a club takes charge of it.
  Given Sam is looking at the "Clubs" list, when Sam taps "Quarrow Athletic" (or any listed club), then the screen heading is that club's name.
- Scenario: The same link gives the same league.
  Given Sam opened `?seed=4242` and noted the 8 club names, when Sam opens `?seed=4242` again in a fresh visit, then the 8 names are identical and in the same order.
- Scenario: Different seeds give different leagues.
  Given Sam opened `?seed=1`, when Sam opens `?seed=4242`, then the list of club names is not the same as for seed 1.
- Scenario: An unusable seed gives the default league.
  Given Sam opens the game with no seed, when Sam opens it again with `?seed=abc`, `?seed=`, `?seed=9999999999`, `?seed=1.5` or `?seed=+5`, then each shows the same 8 clubs as the no-seed visit. `?seed=007` is not in this list: it is the valid seed 7.
- Scenario: The list is easy to use on a phone.
  Given Sam is on a 390px-wide phone viewport looking at the "Clubs" list, then every club button is at least 44px tall, the page does not scroll sideways, and no errors appear in the browser console on any of the three screens.

Notes for DELIVER and DISTILL (not part of the AC): the domain property (8 unique names, two distinct colours, deep-equal for the same seed) is covered by property tests on `generateLeague`. Seed fallback is unit-tested on `parseSeed`.

**Outcome KPI:** Sam goes from the title screen to a chosen club in 2 taps (measured by the e2e smoke tap count; no analytics in the POC).
**Technical notes:** `generateLeague` and `names.ts` in `src/domain/`. Seed parsing and `update`/`Screen` in `src/app/` (ADR-0003). The `el()` helper for views (ADR-0002).

### Wave: DISCUSS / [REF] DoD
- `tests/protected/S-001/` passes on main.
- Unit and property tests for `generateLeague`, seed parsing and the denylist pass. The `ci:*` scripts are green.
- The e2e phone-viewport smoke covers title, pick-club and club-home.
- No ambient randomness or wall-clock time in `src/domain/`.

### Wave: DISCUSS / [REF] Out-of-scope
Persistence or "continue", crests and badges, club-name editing, squads (S-002), seeding policy for a new season, a seed input UI.

### Wave: DISCUSS / [REF] WS strategy
The e2e journey "New game, pick a club, club home" is the walking skeleton: the first thin end-to-end slice through title, pick-club and club-home screens. Delivery is two carpaccio slices: `slices/slice-01-league-generator.md` (a precursor commit, not shipped separately, since nothing is visible to the player), then `slices/slice-02-pick-club-screens.md`, which completes the skeleton.

### Wave: DISCUSS / [REF] Driving ports
- `generateLeague(seed: number) => League`, a pure domain function (ADR-0004).
- Seed parser: `location.search` to a number, falling back to `DEFAULT_SEED` (shell).
- UI entry: the "New game" button, the "Clubs" list and the club buttons, reachable by role and accessible name at `http://localhost:4173/gaffer/`.

### Wave: DISCUSS / [REF] Pre-requisites
- ADR-0002 (view helper), ADR-0003 (`update`/`Screen`, `deriveSeed`) and ADR-0004 (seed and world) are accepted.
- The title screen with a "New game" button exists.
- `docs/product/jobs.yaml` now exists with J-01 (prerequisite resolved).
- Open risk: there is no DIVERGE artifact. Accepted as lean.

## Wave: DESIGN

Mode: propose. Scope: application. One solo team. Paradigm: functional (functional core / imperative shell, ADR-0003), recorded in the ADR and `docs/product/architecture/brief.md`. No new ADR: ADR-0001..0004 cover every decision. Full architecture: `docs/product/architecture/brief.md` (C4 L1/L2, "For Acceptance Designer").

### Wave: DESIGN / [REF] DDD list
- One bounded context, "League setup", in a single core domain. Language: Seed, League, Club, Colour.
- Value objects: `Colour` (palette entry), `Club` (`id`, `name`, `colours[2]`), `League` (`seed`, `clubs[8]`). They are immutable, there are no aggregates with behaviour, and no domain events.
- Invariants, enforced by construction: 8 clubs, unique names (towns drawn without replacement), 2 distinct colours.
- No DDD tooling is warranted; the domain is data generation.

### Wave: DESIGN / [REF] Component decomposition
| Component | Layer | Responsibility |
|---|---|---|
| `rng.ts` | domain | Seeded draws (exists) |
| `deriveSeed` | domain | NOT in S-001 scope. Pure integer hash (ADR-0003/0004), added with squads in S-002. |
| `names.ts` | domain | Word lists, towns (24 or more), suffixes, palette |
| `league.ts` (`generateLeague`) | domain | Pure League from a seed |
| `seed.ts` (`parseSeed`, `DEFAULT_SEED`) | app | `search` string to a number |
| `state.ts` (`GameState`, `Screen`, `Action`, `update`) | app | Navigation and chosen club |
| `ui/dom.ts` (`el`) | ui | Safe element builder |
| `ui/screens/{title,pick-club,club-home}.ts` | ui | `render<Screen>(root, props, dispatch)` |
| `main.ts` | shell | Composition root and loop; the only reader of `location.search`; moves focus to the new `<h1>` (renderers do not) |

### Wave: DESIGN / [REF] Driving ports
- `generateLeague(seed: number) => League` (domain, pure).
- `parseSeed(search: string) => number` (app, pure) and `update(GameState, Action) => GameState`. The actions are `NewGame` and `ChooseClub(clubId)`.
- Browser: the roles and accessible names listed in the brief's "For Acceptance Designer" section: `button` "New game", `list` "Clubs" (8 items, 1 button each), and an `<h1>` per screen.

### Wave: DESIGN / [REF] Driven ports and adapters
- None needed for S-001: no storage, clock or network.
- The only environmental input is `location.search`, read once in `main.ts` and passed as a string to the pure `parseSeed`.
- Persistence (a later story) will add a storage port, with a `probe()` to prove it is writable.
- No external integrations, so no contract tests.

### Wave: DESIGN / [REF] Technology choices
No new technology. Bundle budget: no runtime dependencies; JS under 50 kB gzip (not CI-enforced yet; deferred). Existing: TypeScript strict, Vite, pnpm, Vitest + fast-check, Playwright, oxlint, Stryker (ADR-0001), plain DOM (ADR-0002); all MIT or Apache-2.0. Enforcement: the oxlint boundary rules, the PR guard, and nightly mutation of `src/domain/**`.

### Wave: DESIGN / [REF] Decisions
| # | Decision | Source |
|---|---|---|
| D1 | Functional core / imperative shell; dependencies point inward | ADR-0003 |
| D2 | Seed from `?seed=` with a default fallback. Resolution: only `main.ts` reads `location.search`; `parseSeed(search: string)` in the app layer is pure. ADR-0004 and ADR-0003 wording amended to match | ADR-0004 |
| D3 | Name uniqueness by construction (towns drawn without replacement) | ADR-0004 |
| D4 | Plain-DOM `el()` views with no `innerHTML` of generated text. Each screen has one `<h1 tabindex="-1">`. Renderers write only `root`'s children; `main.ts` (shell) moves focus to the new `<h1>` after navigation | ADR-0002/0003 |
| D5 | Chosen club is kept in `GameState` (memory only). Rejected: persisting it (out of scope, no storage port yet) | DISCUSS |
| D6 | The title screen is migrated to `el()` and given a `dispatch` hook, because it needs a click handler; static `innerHTML` was only valid while it was inert. Rejected: attaching a listener from `main.ts` onto `innerHTML` markup (splits view logic, bypasses `el()`) | ADR-0002 |

### Wave: DESIGN / [REF] Reuse Analysis
| Existing | Action | Contract shape / assertion |
|---|---|---|
| `src/domain/rng.ts` (`createRng`, `nextFloat`) | EXTEND (use as is; add `deriveSeed` alongside only if needed) | pure, return-only; deep-equal and property tests |
| `src/ui/title-screen.ts` | EXTEND (move to `ui/screens/title.ts`, use `el()`, add a "New game" click that dispatches) | bounded-change: writes only `root`'s children; e2e |
| `src/main.ts` | EXTEND (becomes the loop and composition root) | unbounded shell, declared universe: reads `location.search` once; writes only `root`'s children and focus; no other globals; e2e |
| `src/domain/names.ts` | CREATE NEW | pure data constants, return-only; unit test that name/town lists contain no duplicates |
| `src/ui/dom.ts` `el()` | CREATE NEW | bounded-change: creates detached nodes only; unit/e2e |
| `src/ui/styles.css` | EXTEND (club list, 44px buttons, swatch) | n/a |
| `tests/e2e/shell.spec.ts` | EXTEND (pick-club and club-home smoke) | black-box |
| `league.ts`, `names.ts`, `app/*`, `ui/dom.ts`, pick-club and club-home screens | CREATE NEW (no existing alternative) | `generateLeague` pure; `update` and `parseSeed` pure; renderers bounded-change |

### Wave: DESIGN / [REF] Open questions
- None blocking. Back navigation from club-home is deferred (slice 02 "Out"). Seed variety between new games is deferred (open-questions.md item 4).
- Handoff note for DISTILL: lean on property tests for the domain and the role-based black-box checks listed in the brief.

## Wave: DEVOPS

Lean, unattended. All nine decisions pre-answered. Owner-locked paths (`.github/`, `factory/`, `scripts/`, `.nwave/`, `CLAUDE.md`, brief/scope) are read-only. Machine-readable environments: `docs/feature/S-001/environments.yaml`.

Checklist: ✓ existing infra reused | ✓ KPI mapped to instrument | ✓ rollback defined | ✓ mutation strategy (nightly-delta, inherited) | ⊘ new IaC/containers (none needed) | ⊘ server-side observability (no backend) | ⊘ continuous learning | ⊘ CLAUDE.md edit (already states strategy)

### Wave: DEVOPS / [REF] Environment matrix
| Env | URL | Runner | Purpose |
|---|---|---|---|
| local-dev | `http://localhost:5173/gaffer/` (`pnpm dev`) | dev machine | Iteration |
| local-preview | `http://localhost:4173/gaffer/` (`ci:serve`) | dev, CI, protected runner | Production build under test; unit, e2e and protected scenarios |
| production | `https://<owner>.github.io/gaffer/` | GitHub Pages | Live site; post-deploy smoke via `BASE_URL` |

No staging: static site, recreate strategy, pre-merge CI against the production build is the gate. Client: Chromium, Pixel 7 profile, 390px viewport.

### Wave: DEVOPS / [REF] CI/CD pipeline outline (existing, unchanged)
- `ci` (PR, push to main, dispatch): setup, PR guards, roadmap lint, `ci:lint`, `ci:typecheck`, `ci:test` (fresh `FC_SEED`), `ci:build` (asserts `dist/index.html`), `ci:e2e`, protected-scenario no-regression check vs main.
- `deploy` (push to main): `ci:build`, upload `dist`, deploy-pages, then `smoke` runs `ci:e2e` against the live URL.
- `nightly`: `ci:mutation`; opens a `mutation-alarm` issue on failure.
- `ai-review`, `factory-tick`, `watchdog`, `weekly-demo`: factory-owned, untouched.
- S-001 needs no pipeline change: it adds only unit, property and e2e specs run by the existing scripts.
- Local gates: `pnpm run check` mirrors the commit stage (lint, typecheck, test, build, e2e). No git hooks are added (`.nwave`/scripts locked; CI is the gate).
- Security: no secrets, no runtime dependencies, no network calls. Generated text enters the DOM only via `el()` (ADR-0002). Dependency supply chain is covered by the lockfile and `pnpm install --frozen-lockfile`. SAST/SCA/SBOM jobs are not added (no workflow edits allowed; see Open questions).

### Wave: DEVOPS / [REF] Monitoring contracts (DISCUSS KPI to instrument)
| KPI (DISCUSS) | Instrument | Where / when | Pass condition |
|---|---|---|---|
| Title to chosen club in 2 taps | Playwright e2e in `tests/e2e/S-001-pick-club.spec.ts`: count clicks (New game, club), assert club `<h1>` | `ci:e2e` on PR and main; `smoke` on live URL after each deploy | Exactly 2 clicks |
| No console errors | Playwright `page.on("console"/"pageerror")` assertion in the e2e spec | same as above | Zero errors across title, pick-club, club-home |
| No horizontal scroll at 390px | e2e assertion `scrollWidth <= clientWidth` on the Pixel 7 profile | same | holds on all 3 screens |
| Tap targets at least 44px | e2e `boundingBox().height >= 44` on every club button | same | 8 of 8 buttons |
| Determinism (same seed, same league) | fast-check property test + e2e two-visit comparison | `ci:test`, `ci:e2e` | deep-equal |
| Domain test strength | Stryker on `src/domain/**` | nightly | at or above the break threshold in `stryker.config.mjs` |

No analytics (POC, per DISCUSS). The e2e tap count is the KPI's sole measurement.

### Wave: DEVOPS / [REF] Deployment strategy and rollback
- Strategy: recreate. Merge to main triggers `deploy`, which replaces the whole static artifact. No traffic splitting is possible or needed on Pages.
- Rollback (designed first): primary = `workflow_dispatch` of `deploy.yml` on a known-good ref or tag (the trigger exists); `smoke` then validates the restored site. Fallback = fix-forward (new PR on a `claude/*` branch). A `git revert` of the squash commit is not a reliable path: the append-only protected-tests guard and the no-regression guard block it, so it needs owner action. Target time to restore: one deploy cycle (about 5 minutes) for the dispatch.
- Failure detection: a failing `smoke` job marks the deploy run red. The state (chosen club) is in memory only, so there is no data migration and no user data to corrupt on rollback.
- Blast radius: one static page, no persistence, no backend.

### Wave: DEVOPS / [REF] Mutation testing strategy
nightly-delta, inherited from `CLAUDE.md`; `/nw-deliver` Phase 5 skipped. Scope is `src/domain/**` (`league.ts`, `names.ts`, `rng.ts`). Run by `nightly.yml` at 03:00 UTC through `ci:mutation`, with a break threshold in `stryker.config.mjs`. Failure opens an issue labelled `mutation-alarm`, `needs-human`. `src/app/` (`parseSeed`, `update`) is outside the configured mutation scope; the Stryker config is agent-editable (ADR-0001), so extending it is an agent decision (Open questions).

### Wave: DEVOPS / [REF] Observability stack
Browser console plus Playwright smoke on the deployed URL only. No RUM, error tracking, logs or tracing. SLO: smoke green per deploy; availability monitoring out of scope for S-001 (owner open question 7). Alerting: a red `deploy` run (GitHub notification). No dashboards.

### Wave: DEVOPS / [REF] Branching strategy
Trunk-based. Short-lived `claude/S-001-*` branches, PR to main, squash merge. CI must pass and the protected scenarios must not regress. Deploy fires on merge. No release branches, no tags required.

### Wave: DEVOPS / [REF] Coexistence matrix
| Component | S-001 impact | Action |
|---|---|---|
| `ci.yml`, `deploy.yml`, `nightly.yml` | none; they run the existing `ci:*` scripts | reuse |
| `ci:*` scripts, `playwright.config.ts` | none; `BASE_URL` and the Pixel 7 profile already fit | reuse |
| `tests/e2e/S-001-pick-club.spec.ts` | new S-001 e2e spec (pick-club and club-home smoke); `shell.spec.ts` unchanged | add |
| `tests/protected/S-001/` | locked runner on `localhost:4173/gaffer/`; relies on roles and accessible names | none |
| Stryker config | covers `src/domain/**`, which now holds `league.ts` and `names.ts` | none |
| Pages artifact | `dist/` grows slightly; base path `/gaffer/` unchanged | none |

### Wave: DEVOPS / [REF] Pre-requisites
- GitHub Pages enabled with source "GitHub Actions" (already in use by `deploy.yml`).
- Node 22 or later, pnpm 10.12.4 (pinned), Playwright chromium installed by `.github/actions/setup`.
- ADR-0001..0004 accepted (✓).
- `BASE_URL` for the smoke is derived from the repository owner and name (no secret).

### Wave: DEVOPS / [REF] Open questions
Owner-only (locked paths); none block S-001:
1. `deploy.yml` smoke uses a fixed `sleep 20` (weakness already recorded); a poll-until-200 would be more robust against Pages propagation lag.
2. OWNER DECISION NEEDED (not a blocker for S-001): security scanning absent (no dependency audit or secret scan in `ci.yml`); owner-locked. Waiver proposed for S-001: no runtime deps, no secrets, no network. Consider `pnpm audit` as an advisory step.
3. Stryker scope excludes `src/app/` (`parseSeed`, `update`); per ADR-0001 the Stryker, vitest and playwright configs are agent-editable (not locked), so extending the scope is an agent decision once `src/app/` holds logic worth mutating. Only `.github/` workflow changes remain owner-only.
4. Smoke does not assert deployed commit SHA, so a stale Pages cache could pass; consider a build-stamp check.
5. Deploy is not gated on the `ci` workflow (it triggers on push to main independently); branch protection is the only gate. Owner to confirm branch protection requires `ci` green.
6. Reverting a squash commit is blocked by the append-only protected-tests and no-regression guards; owner action is needed if a revert is ever required.
7. Availability monitoring (uptime probe) is out of scope for S-001; owner to decide whether to add one.

## Wave: DISTILL

Lean, unattended. Reconciliation passed, 0 contradictions. Language: TypeScript (vitest + fast-check, Playwright). No cucumber: scenarios are Given/When/Then-named `describe`/`it` files. Failure classification: `distill/red-classification.md`.

### Wave: DISTILL / [REF] Scenario list with tags
| Scenario | Level | Tags |
|---|---|---|
| Tap New game, pick a club, land on its home in 2 taps | e2e | `@walking_skeleton @driving_port` |
| Club list: 8 clubs, one button each, one heading | e2e | `@driving_port` |
| Every club button at least 44px tall | e2e | `@driving_port` |
| Club names non-empty and unique | e2e | `@driving_port` |
| Tapping each of the 8 clubs shows its name in the heading | e2e | `@driving_port` |
| No horizontal scroll at 390px (list and club home) | e2e | `@error-boundary` |
| Same seed, same league across two visits | e2e | `@property`-style |
| Different seeds, different leagues | e2e | `@driving_port` |
| Invalid seed (`abc`, empty, `9999999999`) gives the default league | e2e | `@error` |
| No console errors across the three screens | e2e | `@error` |
| 8 clubs, unique names, two distinct colours, unique ids for any 32-bit seed | vitest | `@property @driving_port` |
| Same seed deep-equal | vitest | `@property @determinism` |
| Seeds 1 and 4242 differ; boundary seeds 0, -1, max, min | vitest | `@driving_port @error-boundary` |
| Valid seeds parse (`007` is 7, 32-bit limits); any 32-bit integer round-trips | vitest | `@driving_port @property` |
| Invalid or missing seed falls back to `DEFAULT_SEED` (example list and property over non-numeric strings) | vitest | `@error @property` |
| New game moves title to pickClub; choosing a club moves to clubHome; league unchanged | vitest | `@walking_skeleton @driving_port` |
| Choose club before New game, or an unknown club, leaves the screen unchanged | vitest | `@error` |

Error and boundary share is above 40%. Real-club denylist test is a DELIVER unit test (ADR-0004), not a DISTILL scenario. All tests are enabled (no skip), per the green-branch rule; they land with the implementation.

### Wave: DISTILL / [REF] WS strategy
Walking skeleton = e2e "New game, pick club, home" in the production build at `localhost:4173/gaffer/`, plus its domain-level twin in `navigation.test.ts`. There are no driven adapters, so the Architecture of Reference gives real driving port, nothing to fake. The only environmental input (`location.search`) is exercised for real in the e2e specs.

### Wave: DISTILL / [REF] Adapter coverage
| Adapter | @real-io scenario | Covered by |
|---|---|---|
| None (DESIGN: no storage, clock or network) | n/a | No driven adapters exist. `location.search` is read in the browser by every e2e spec. |

### Wave: DISTILL / [REF] Scaffolds
All carry an exported `__SCAFFOLD__ = true` and throw `Error("Not yet implemented -- RED scaffold")`. DELIVER removes the marker.
- `src/domain/league.ts`: types `Colour`, `Club`, `League`; `generateLeague(seed)`.
- `src/app/seed.ts`: `DEFAULT_SEED` (placeholder value 1, DELIVER may change); `parseSeed(search)`.
- `src/app/state.ts`: `Screen`, `GameState { league, screen }`, `Action` (`{type:"NewGame"}`, `{type:"ChooseClub", clubId}`); `update(state, action)`.

Shapes the tests rely on: `Club { id, name, colours: [Colour, Colour] }`, `League { seed, clubs }`. Behaviour the tests pin: choosing a club outside `pickClub`, or an unknown club id, leaves the screen unchanged.

### Wave: DISTILL / [REF] Test placement
- `tests/acceptance/S-001/{league-generation,seed-parsing,navigation}.test.ts`: matched by the existing `vitest.config.ts` include (`tests/acceptance/**`).
- `tests/e2e/S-001-pick-club.spec.ts`: Playwright, next to the existing `shell.spec.ts`; uses the Pixel 7 config. `tests/protected/` is untouched.

### Wave: DISTILL / [REF] Driving adapter coverage
| Entry | Scenario |
|---|---|
| `generateLeague` | `league-generation.test.ts` |
| `parseSeed`, `update` | `seed-parsing.test.ts`, `navigation.test.ts` |
| Browser: "New game" button, "Clubs" list, club buttons, `<h1>` per screen | `S-001-pick-club.spec.ts` (role and accessible-name queries) |

Mandate-12 note: TS vitest tests call the driving ports directly with no step layer, so the step-body and step-reuse criteria are n/a.

### Wave: DISTILL / [REF] Pre-requisites
- ADR-0002, ADR-0003 and ADR-0004 accepted; the brief's "For Acceptance Designer" section supplies the ports.
- `ci:serve` on `localhost:4173/gaffer/` (Playwright `webServer` in `playwright.config.ts`); Pixel 7 profile at 390px.
- `FC_SEED` honoured through `tests/setup/fast-check-seed.ts`.
- DEVOPS matrix: local-preview for e2e, production through `BASE_URL` for smoke. These specs are URL-relative, so they run against both.
- Env mapping: local-preview = `ci:serve` default; production = `BASE_URL`; local-dev is covered by the same URL-relative spec.
- Mandate 8 (state-delta port) n/a: `update()` is pure and returns the next state, so tests assert on returned values directly.
- Placement: a new `S-001-pick-club.spec.ts` rather than extending `shell.spec.ts`, to keep story scope separate.
- The e2e journey "New game, pick club, home" is the walking skeleton, as DISCUSS states. All tests carry `@US-1`.

## Wave: DELIVER

### Wave: DELIVER / [REF] Implementation summary
Four roadmap steps (01-01..01-04), each RED, GREEN, COMMIT: deterministic `generateLeague` with `names.ts`; `parseSeed` with `DEFAULT_SEED`; `update` navigation (`NewGame`, `ChooseClub`); `el()`, the title, pick-club and club-home screens, and the `main.ts` loop. A refactor pass and reviewer findings followed (a2c4dd1), then a favicon 404 fix (36cccd1).

### Wave: DELIVER / [REF] Files modified
- Domain: `src/domain/league.ts`, `src/domain/names.ts`.
- App: `src/app/seed.ts`, `src/app/state.ts`, `src/app/types.ts`.
- UI: `src/ui/dom.ts`, `src/ui/screens/{title,pick-club,club-home,club-colours}.ts`, `src/ui/styles.css`.
- Shell: `src/main.ts`, `index.html` (favicon).
- Tests: `tests/acceptance/S-001/*`, `tests/e2e/S-001-pick-club.spec.ts`, `tests/unit/domain/real-club-denylist.test.ts`.

### Wave: DELIVER / [REF] Scenarios green
Vitest: 37 tests passing. Playwright e2e: 14 passing (last run). All DISTILL scenarios are enabled, none skipped.

### Wave: DELIVER / [REF] DoD check
- Protected scenarios `tests/protected/S-001/`: run by CI on main (locked runner).
- Unit, property and denylist tests pass; `ci:*` scripts green on last run.
- e2e phone-viewport smoke covers title, pick-club and club-home.
- No ambient randomness or wall-clock time in `src/domain/`.

### Wave: DELIVER / [REF] Demo evidence
Pick-club walk with `?seed=4242`: New game shows 8 clubs; tapping the 2nd club gives `<h1>` "Netherwold Town". Screenshot: `factory-out/screens/pick-club.png`.

### Wave: DELIVER / [REF] Quality gates
- Refactor pass done (a2c4dd1).
- Reviewer ran; findings folded in.
- Mutation testing: nightly-delta, `/nw-deliver` Phase 5 skipped.
- des-verify-integrity: all 4 steps complete.

### Wave: DELIVER / [REF] Pre-requisites
ADR-0001..0004 accepted; `ci:*` scripts; Pixel 7 profile at 390px; `FC_SEED` honoured via `tests/setup/fast-check-seed.ts`. Evolution record: `docs/evolution/2026-10-15-S-001.md`.
