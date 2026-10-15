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
