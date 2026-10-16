# ADR-0003: Architecture: functional core (domain) and imperative shell (app + UI)

- Status: Accepted
- Date: 2026-10-15
- Deciders: nWave solution-architect (factory plan run, `interaction_mode=propose`)

## Context
Game rules must be deterministic: same seed, same season, with no ambient randomness or wall-clock
time (CLAUDE.md; CI checks `src/domain/`). The game is a small, turn-based loop of player decisions
and simulated outcomes. `.oxlintrc.json` already forbids `src/domain` from importing UI code or
touching `document`, `window` or `localStorage`.

## Options
| Option | Pros | Cons |
|---|---|---|
| **A. Functional core / imperative shell**: pure domain functions over immutable data; one app-state value; a shell that owns the DOM, the URL and (later) storage | Determinism by construction; easy property tests; fits a turn-based loop; no dependencies | Explicit RNG threading is a bit verbose |
| B. ECS | Shines for many per-frame simulated entities | No real-time simulation in scope (`match-2d`/`utility-ai` OUT); heavy ceremony for menus |
| C. Class-based OOP models with internal mutable state | Familiar | Hidden mutation makes replay and debugging harder; RNG ownership gets murky |
| D. State library (Redux/Zustand) | Conventions | A dependency for what one `reduce`-style function does |

## Decision
**Option A.**
- **`src/domain/`** (functional core): pure functions and `readonly` data types only. Randomness comes
  only from `src/domain/rng.ts` (mulberry32). Every draw returns `{ value, next }` and the caller threads
  `next` onward. Generators take an `Rng` and return `{ result, next }`, or derive per-entity seeds
  (`deriveSeed(leagueSeed, clubIndex)`, see ADR-0004) so that adding a field to one club doesn't reshuffle every other club.
  *Refinement note 2026-10-16: for squad player names, ADR-0005 (a)/(c) deliberately uses a league-wide name stream
  `deriveSeed(seed, -1)` sliced per club, trading this isolation for league-wide uniqueness (see ADR-0005 Consequences).*
  No `Date`, `Math.random`, DOM or storage.
- **`src/app/`** (shell state): one `GameState` value plus `Screen` (a tagged union such as
  `{ kind: "title" } | { kind: "pickClub" } | { kind: "clubHome", clubId } | { kind: "squad", clubId }`)
  and a pure `update(state, action) => state`. `main.ts` reads `location.search` once; the pure `parseSeed(search)` here turns it into a seed (ADR-0004).
- **`src/ui/`** (shell view): screen renderers (ADR-0002) that receive state and a `dispatch(action)`
  callback. `main.ts` wires `dispatch` to `update` and re-renders.
- Dependencies point inward: `ui` → `app` → `domain`. Never the reverse. `.oxlintrc.json` enforces this:
  `domain` may not import `app` or `ui`, and `app` may not import `ui`. Domain code may not touch
  `Date`, `performance`, `crypto`, timers, `location` or the DOM. The PR guard additionally rejects `Math.random`, `Date.now` and `new Date(` in `src/domain/`.

### Component contracts
| Component | Layer | Effect class | Contract |
|---|---|---|---|
| `createRng`, `nextFloat`, `deriveSeed` | domain | pure | `number`/`Rng` → `{ value, next }` / `number` |
| `generateLeague` | domain | pure | `seed: number` → `League` (8 clubs) |
| `generateSquad` | domain | pure | `(seed: number, clubIndex: number)` → `readonly Player[]` (18) |
| `parseSeed` | app | pure | `search: string` → `number` (`DEFAULT_SEED` on invalid) |
| `update` | app | pure | `(GameState, Action)` → `GameState` |
| `main.ts` (`dispatch` loop) | shell | effectful | reads `location.search` once, owns the current state, calls `render` |
| `render<Screen>` | ui | effectful (DOM writes) | `(root, props, dispatch)` → `void` |

Future persistence (save and continue) follows the same split. A pure `toSave(state)` / `fromSave(data)`
works over the seed plus the player's choices and results, and a separate storage port in the shell does the I/O.

### Bootstrap
Today `main.ts` renders the title screen directly. The first story (S-001) creates `src/app/`
(`GameState`, `Screen`, `Action`, `update`, `parseSeed`) and the `dispatch` → `update` → `render` wiring
in `main.ts`. After each navigation, the shell moves focus to the new screen's `<h1>` (`tabindex="-1"`)
so screen-reader and keyboard users are not dropped on `<body>`.

## Consequences
- Domain logic is unit- and property-tested in Node with no DOM. Mutation testing (`src/domain/**`) covers the rules.
- The league and squads are derived data: they can be regenerated from the seed, so persistence (a later story)
  only needs the seed plus the player's choices and results.
