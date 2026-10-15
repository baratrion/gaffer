# S-001: Start a new game and pick a club

## Wave: DISCUSS

Lean, unattended. Reuses `discuss/journey.md`. Outcome is fixed by `docs/roadmap.yaml` (S-001) and is not re-scoped here.

### Wave: DISCUSS / [REF] Persona
Sam, 34, a lapsed Championship Manager fan. Plays on the bus, one-handed, on a mid-range Android phone at 390px wide. Has 5 minutes and no patience for setup screens (brief.md, "Player").

### Wave: DISCUSS / [REF] JTBD one-liner
When I open Gaffer with a few spare minutes, I want to be in charge of a club in seconds, so that the next thing I do is a managerial decision rather than a setup chore. (Specialises the brief job; `job_id: J-01 take-charge-of-a-club`. No `docs/product/jobs.yaml` exists yet, so this is the only job.)

### Wave: DISCUSS / [REF] Locked decisions
- Seed comes from `?seed=<int>` with a fixed `DEFAULT_SEED` fallback. Anything invalid (missing, empty, `abc`, fractional, out of 32-bit range) silently uses the default (ADR-0004).
- League: 8 fictional clubs, each with a unique name and two distinct colours, generated purely from the seed (ADR-0004).
- Chosen club is held in memory only. No persistence in this story.
- Screens: title (exists), pick-club, club-home. Each has exactly one `<h1>`.
- Club = one `<button>` of 44px or taller, inside a `<ul>` named "Clubs". The first line of its text is the club name. The colour swatch is decorative and `aria-hidden`.
- Real-club denylist unit test, per ADR-0004.
- UX depth lightweight: no mockups beyond the journey table.

### Wave: DISCUSS / [REF] User stories

#### US-1: Choose a club from a generated league
**Problem:** Sam opens Gaffer, taps "New game" and nothing is behind it. There is no club to manage, so no decision is possible.
**Job:** J-01.
**Elevator Pitch**
- Before: the title screen has a "New game" that leads nowhere.
- After: Sam taps "New game", sees "Choose your club" with 8 clubs, taps one, and lands on a screen headed by that club's name.
- Decision enabled: which club do I take on?

**Domain examples**
1. Sam opens `/gaffer/` with no seed, taps "New game" and sees the same 8 clubs every visit, for example "Brindlecombe Rovers" and "Quarrow Athletic".
2. Sam opens `/gaffer/?seed=4242` and sees a different league. Reopening that link shows the identical league.
3. Sam opens `/gaffer/?seed=abc` and sees the default league. The same happens with `?seed=` or `?seed=9999999999`.

**Acceptance criteria (embedded UAT)**
- Given the title screen, when Sam taps "New game", then there is one `<h1>` and a list named "Clubs" with exactly 8 items, each holding exactly one button.
- Every club name (first line of the item) is non-empty and unique.
- When Sam taps any club, then the screen's `<h1>` contains that club's name.
- The same `?seed=` on two fresh visits gives identical club lists. Different seeds give different lists.
- Every club button is at least 44px tall. There is no horizontal scroll at 390px and no console errors.
- An invalid seed (`abc`, empty, out of range) gives the same league as no seed (unit-tested in the shell, not protected).
- Domain property: for any 32-bit seed, `generateLeague` returns 8 unique names, each club has two distinct colours, and the output is deep-equal for the same seed.

**Outcome KPI:** Sam goes from the title screen to a chosen club in 2 taps and under 10 seconds (measured by the e2e smoke tap count; no analytics in the POC).
**Technical notes:** `generateLeague` and `names.ts` in `src/domain/`. Seed parsing and `update`/`Screen` in `src/app/` (ADR-0003). The `el()` helper for views (ADR-0002).

### Wave: DISCUSS / [REF] DoD
- `tests/protected/S-001/` passes on main.
- Unit and property tests for `generateLeague`, seed parsing and the denylist pass. The `ci:*` scripts are green.
- The e2e phone-viewport smoke covers title, pick-club and club-home.
- No ambient randomness or wall-clock time in `src/domain/`.

### Wave: DISCUSS / [REF] Out-of-scope
Persistence or "continue", crests and badges, club-name editing, squads (S-002), seeding policy for a new season, a seed input UI.

### Wave: DISCUSS / [REF] WS strategy
No walking skeleton. A title screen exists. This story is the first thin end-to-end slice. Delivery is two carpaccio slices: `slices/slice-01-league-generator.md`, then `slices/slice-02-pick-club-screens.md`.

### Wave: DISCUSS / [REF] Driving ports
- `generateLeague(seed: number) => League`, a pure domain function (ADR-0004).
- Seed parser: `location.search` to a number, falling back to `DEFAULT_SEED` (shell).
- UI entry: the "New game" button, the "Clubs" list and the club buttons, reachable by role and accessible name at `http://localhost:4173/gaffer/`.

### Wave: DISCUSS / [REF] Pre-requisites
- ADR-0002 (view helper), ADR-0003 (`update`/`Screen`, `deriveSeed`) and ADR-0004 (seed and world) are accepted.
- The title screen with a "New game" button exists.
- Open risk: there is no DIVERGE artifact and no `jobs.yaml`. Accepted as lean.

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
| `deriveSeed` | domain | Pure integer hash of seed and index (ADR-0003/0004). Needed for the squads in S-002; S-001 may skip it. |
| `names.ts` | domain | Word lists, towns (24 or more), suffixes, palette |
| `league.ts` (`generateLeague`) | domain | Pure League from a seed |
| `seed.ts` (`parseSeed`, `DEFAULT_SEED`) | app | `search` string to a number |
| `state.ts` (`GameState`, `Screen`, `Action`, `update`) | app | Navigation and chosen club |
| `ui/dom.ts` (`el`) | ui | Safe element builder |
| `ui/screens/{title,pick-club,club-home}.ts` | ui | `render<Screen>(root, props, dispatch)` |
| `main.ts` | shell | Composition root and loop; moves focus to the new `<h1>` |

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
No new technology. Existing: TypeScript strict, Vite, pnpm, Vitest + fast-check, Playwright, oxlint, Stryker (ADR-0001), plain DOM (ADR-0002); all MIT or Apache-2.0. Enforcement: the oxlint boundary rules, the PR guard, and nightly mutation of `src/domain/**`.

### Wave: DESIGN / [REF] Decisions
| # | Decision | Source |
|---|---|---|
| D1 | Functional core / imperative shell; dependencies point inward | ADR-0003 |
| D2 | Seed from `?seed=` with a default fallback; the parser is in the app layer | ADR-0004 |
| D3 | Name uniqueness by construction (towns drawn without replacement) | ADR-0004 |
| D4 | Plain-DOM `el()` views with no `innerHTML` of generated text; focus moves to `<h1>` | ADR-0002/0003 |
| D5 | Chosen club is kept in `GameState` (memory only) | DISCUSS |
| D6 | The title screen is migrated to `el()` and given a `dispatch` hook, because it needs a click handler; static `innerHTML` was only valid while it was inert | ADR-0002 |

### Wave: DESIGN / [REF] Reuse Analysis
| Existing | Action | Contract shape / assertion |
|---|---|---|
| `src/domain/rng.ts` (`createRng`, `nextFloat`) | EXTEND (use as is; add `deriveSeed` alongside only if needed) | pure, return-only; deep-equal and property tests |
| `src/ui/title-screen.ts` | EXTEND (move to `ui/screens/title.ts`, use `el()`, add a "New game" click that dispatches) | bounded-change: writes only `root`'s children; e2e |
| `src/main.ts` | EXTEND (becomes the loop and composition root) | unbounded shell; e2e |
| `src/ui/styles.css` | EXTEND (club list, 44px buttons, swatch) | n/a |
| `tests/e2e/shell.spec.ts` | EXTEND (pick-club and club-home smoke) | black-box |
| `league.ts`, `names.ts`, `app/*`, `ui/dom.ts`, pick-club and club-home screens | CREATE NEW (no existing alternative) | `generateLeague` pure; `update` and `parseSeed` pure; renderers bounded-change |

### Wave: DESIGN / [REF] Open questions
- None blocking. Back navigation from club-home is deferred (slice 02 "Out"). Seed variety between new games is deferred (open-questions.md item 4).
- Handoff note for DISTILL: lean on property tests for the domain and the role-based black-box checks listed in the brief.
