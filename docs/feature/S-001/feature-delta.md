# Feature delta: S-001 Start a new game and pick a club

## Wave: DISCUSS / [REF] Persona ID
Sam, 34, lapsed Championship Manager fan, plays one-handed on a mid-range Android phone (brief.md, "Player"). Detail: `discuss/journey.md`.

## Wave: DISCUSS / [REF] JTBD one-liner
"When I open Gaffer with a few spare minutes, I want to be in charge of a club in seconds, so that the next thing I do is a managerial decision rather than a setup chore." (quoted from the brief; no `jobs.yaml` exists, see `open-questions.md` #1)

## Wave: DISCUSS / [REF] Locked decisions
- D1 Feature type: user-facing. Walking skeleton: no (one exists: title screen). Research depth: lightweight.
- D2 JTBD: on, quoting the brief's single job. Scope assessment: PASS (one story, one slice, about 400 lines).
- D3 Seed comes from `?seed=` with a fixed default (ADR-0004).
- D4 Chosen club is not persisted in this slice.

## Wave: DISCUSS / [REF] User stories with elevator pitches
### US-1 Pick a club
As Sam, I want to start a new game and choose one of 8 fictional clubs, so that I manage a club in two taps.

### Elevator Pitch
Before: the player opens Gaffer and sees a title screen with nothing behind "New game".
After: tap "New game" then a club button -> sees a club home screen whose `<h1>` is the club's name.
Decision enabled: which club to take on.

## Wave: DISCUSS / [REF] Acceptance criteria
- Tap "New game": one `<h1>` and a list named "Clubs" with exactly 8 items, each holding exactly one button of 44px or more whose first line is a unique, non-empty club name.
- Each club shows two colours as a swatch hidden from screen readers.
- Tapping a club shows a club home screen whose `<h1>` contains the club's name.
- Same `?seed=` gives the same league; different seeds give different leagues.
- Missing, empty, non-numeric or out-of-range seed gives the default league.
- Exactly one `<h1>` per screen; no horizontal scroll at 390px; no console errors.

## Wave: DISCUSS / [REF] Definition of Done
Tests green (`ci:lint`, `ci:typecheck`, `ci:test`, `ci:e2e`), ADRs followed, semantic markup, phone-viewport walk-through done, protected scenarios pass on main, no persistence, no real names, deterministic domain, diff within budget.

## Wave: DISCUSS / [REF] Out-of-scope
Persistence, crests, renaming clubs, squads (S-002), the seeding policy for a later "new season".

## Wave: DISCUSS / [REF] WS strategy
Strategy A: thin vertical slice on top of the existing title-screen skeleton; real generator, real DOM, no mocks.

## Wave: DISCUSS / [REF] Driving ports
Browser UI at `/gaffer/` (optionally `?seed=N`): "New game" button, "Clubs" list, club buttons.

## Wave: DISCUSS / [REF] Pre-requisites
None. Existing: `src/domain/rng.ts`, title screen, ADR-0001..0004.

## Wave: DESIGN / [REF] DDD list
- DDD-1 Scope: Application, propose mode, one solo team. Accepted ADR-0001..0004 cover every decision; no new ADR needed.
- DDD-2 Paradigm: functional core, imperative shell (ADR-0003).
- DDD-3 Seed from `?seed=` with fixed default (ADR-0004).

## Wave: DESIGN / [REF] Component decomposition
| Component | Path | Change |
|---|---|---|
| `deriveSeed` | `src/domain/rng.ts` | EXTEND |
| `generateLeague`, `names` | `src/domain/league.ts`, `src/domain/names.ts` | CREATE NEW |
| `parseSeed`, `GameState`, `Screen`, `Action`, `update` | `src/app/` | CREATE NEW |
| `el()` helper | `src/ui/dom.ts` | CREATE NEW |
| title, pick-club, club-home screens | `src/ui/screens/` | title: EXTEND; others CREATE NEW |
| wiring | `src/main.ts` | EXTEND |

## Wave: DESIGN / [REF] Driving ports
See "For Acceptance Designer" in `docs/product/architecture/brief.md`.

## Wave: DESIGN / [REF] Driven ports + adapters
None in this slice.

## Wave: DESIGN / [REF] Technology choices
TypeScript strict, Vite, Vitest + fast-check, Playwright, oxlint (ADR-0001). No new dependencies.

## Wave: DESIGN / [REF] Reuse Analysis
| Existing | File | Overlap | Decision | Justification |
|---|---|---|---|---|
| mulberry32 RNG | `src/domain/rng.ts` | randomness | EXTEND | add `deriveSeed` |
| title screen | `src/ui/title-screen.ts` | title UI | EXTEND | add dispatch on New game |
| `salvage/` | reference only | names/RNG | CREATE NEW | not built; own word lists |

## Wave: DESIGN / [REF] Open questions
Seed policy for a later "new season" (`open-questions.md` #4).

## Wave: DEVOPS / [REF] Environment matrix
See `environments.yaml`: local production preview (`ci:serve`) and GitHub Pages under `/gaffer/`.

## Wave: DEVOPS / [REF] CI/CD pipeline outline
Existing GitHub Actions workflows (`ci`, `deploy`, `nightly`, factory), owner-locked and unchanged. CI runs `ci:lint`, `ci:typecheck`, `ci:test`, `ci:build`, `ci:e2e`.

## Wave: DEVOPS / [REF] Monitoring contracts
No KPI instrumentation. Observability is the browser console and Playwright smoke tests on the deployed URL only.

## Wave: DEVOPS / [REF] Deployment strategy
Recreate: deploy on merge to main. Rollback is reverting the merge.

## Wave: DEVOPS / [REF] Mutation testing strategy
nightly-delta (CLAUDE.md); DELIVER Phase 5 skipped.

## Wave: DEVOPS / [REF] Observability stack
Browser console only; no logs, metrics or traces.

## Wave: DEVOPS / [REF] Branching strategy
Trunk-based, short-lived `claude/*` branches, squash merge.

## Wave: DEVOPS / [REF] Coexistence matrix
Playwright smoke tests (`tests/e2e/shell.spec.ts`) must keep passing.

## Wave: DEVOPS / [REF] Pre-requisites
Static build in `dist/` with base `/gaffer/`. No changes to locked `.github/` needed.
