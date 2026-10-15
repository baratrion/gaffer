# Gaffer: architecture brief

SSOT for architecture. Decisions live in `adr-0001..0004`; this file shows how they fit together. Extend it per story.

## Application Architecture

### Drivers and constraints
Quality attributes, in order: determinism and replayability, phone usability and accessibility, testability, small bundle, simplicity. Bundle budget: no runtime dependencies; JS under 50 kB gzip (not yet enforced by CI; deferred).
Constraints: static site under `/gaffer/`, no backend, one solo team (no Conway conflict), OSS only (TypeScript, Vite, Vitest, fast-check, Playwright, oxlint, Stryker: all MIT or Apache-2.0).

### Style (ADR-0003)
Modular monolith, run as a functional core and imperative shell. This is the functional paradigm, and it is recorded here and in ADR-0003, not in CLAUDE.md.
Ports and adapters, in function-signature form:
- `src/domain/` is the pure core. Readonly data, no DOM, clock, storage, `Math.random` or `Date`. Randomness comes only from `rng.ts`.
- `src/app/` is the pure shell state: `GameState`, `Screen`, `Action`, `update`, `parseSeed`.
- `src/ui/` holds the effectful DOM renderers, built with `el()` (ADR-0002).
- `src/main.ts` is the composition root. It reads `location.search` once, owns the current state, and runs the loop `dispatch` then `update` then `render`.
- Dependencies point inward only: ui, then app, then domain.

Rejected simpler alternative: no layering, with generation inline in the UI. It breaks Node-only property tests and determinism checks.

### Effect isolation (contract shapes)
| Component | Shape | Universe / assertion |
|---|---|---|
| `generateLeague`, `createRng`, `nextFloat` (`deriveSeed` from S-002) | pure, return-only | Deep-equal on repeat calls; input never mutated; fast-check property tests |
| `parseSeed`, `update` | pure, return-only | Unit tests; `update` returns a new state and never mutates the old one |
| `domain/names.ts` | pure data constants, return-only | Frozen word lists, towns, suffixes, palette; no functions with effects. Unit test: no duplicates in name/town lists |
| `ui/dom.ts` `el()` | bounded-change | Creates detached nodes only; never touches `document.body` or attached nodes |
| `render<Screen>` | bounded-change | Writes only `root`'s children. Takes `(root, props, dispatch)`, never `window` or `location`. Does not move focus |
| `main.ts` | unbounded shell | Universe: reads `location.search` once; writes only `root`'s children (via render) and focus (the new `<h1>`, `tabindex="-1"`); no other globals. Covered by e2e |

Driving ports that only read expose no write methods: `generateLeague` and `parseSeed` return values and have no setters.

### Earned Trust (probes)
S-001 has no external adapters. The only environment dependency is `location.search`, read once and validated by `parseSeed`, which falls back to the default on any bad input (the probe equivalent: the unit test feeds `abc`, empty, `9999999999`, `1.5`). Storage will need a probe when persistence arrives (its own story).

### Enforcement
`.oxlintrc.json` forbids domain importing app or ui, app importing ui, and DOM/time use in domain. The PR guard rejects `Math.random`, `Date.now` and `new Date(` in `src/domain/`. Stryker mutates `src/domain/**` nightly.

### Domain model (S-001)
- `League`: `{ seed, clubs: readonly [8 Club] }`
- `Club`: `{ id, name, colours: readonly [Colour, Colour] }`; the colours are distinct and come from a fixed palette.
- Name uniqueness: 8 towns drawn without replacement from at least 24, plus a suffix that may repeat (ADR-0004).
- No external integrations, so no contract tests are needed.

### Domain model (S-002: squads)
- `Player`: `{ name, position, age, overall }`, all readonly. `Position` is `GK | DF | MF | FW`. No other fields (ADR-0004 defers attributes and condition).
- A squad is `readonly Player[]` of 18, ordered GK, DF, MF, FW. It is derived data, never stored: `generateSquad(league.seed, clubIndex)` with `clubIndex` = the club's position in `league.clubs`. Per-club seed comes from `deriveSeed(seed, clubIndex)` in `rng.ts`.
- Invariants by construction: quota 2/6/6/4, age 17-35, overall 1-20 (independent of position and age), no digits in names, surnames unique within a squad (drawn without replacement). Squads of different clubs differ because each club has its own derived seed.
- `Screen` gains `{ kind: "squad", clubId }`. `Action` gains `OpenSquad` (clubHome to squad) and `Back` (squad to clubHome); both are no-ops from any other screen.

### S-002 components
| Component | Layer | Responsibility |
|---|---|---|
| `deriveSeed` (`rng.ts`) | domain | Pure per-club seed hash |
| `FIRST_NAMES`, `SURNAMES` (`names.ts`) | domain | Frozen fictional lists, no digits |
| `squad.ts` (`Player`, `Position`, `generateSquad`) | domain | Pure 18-player squad |
| `state.ts`, `types.ts` | app | `squad` screen, `OpenSquad`/`Back`, `Player` re-export |
| `ui/screens/squad.ts` | ui | `renderSquad(root, club, squad, dispatch)` |
| `ui/screens/club-home.ts` | ui | Adds the "Squad" button (now takes `dispatch`) |
| `main.ts` | shell | `squad` case: derives the squad, renders; focus on `<h1>` |

Contract shapes: `deriveSeed` and `generateSquad` are pure, return-only (deep-equal, no input mutation, fast-check); `update` pure; `renderSquad` bounded-change (writes only `root`'s children). No driven adapters, so no probe; no external integrations, so no contract tests. No new ADR; no new technology. Existing enforcement (oxlint boundaries, PR guard, nightly Stryker on `src/domain/**`) covers the new domain code.

### Component inventory (shipped in S-001)
| Component | Layer | Responsibility |
|---|---|---|
| `src/domain/rng.ts` | domain | Seeded draws (`createRng`, `nextFloat`) |
| `src/domain/names.ts` | domain | Frozen word lists: towns, suffixes, palette |
| `src/domain/league.ts` | domain | `generateLeague(seed)`: pure 8-club `League` |
| `src/app/seed.ts` | app | `parseSeed(search)`, `DEFAULT_SEED` |
| `src/app/types.ts` | app | Shared app types |
| `src/app/state.ts` | app | `GameState`, `Screen`, `Action`, `update` |
| `src/ui/dom.ts` | ui | `el()` safe element builder |
| `src/ui/screens/{title,pick-club,club-home}.ts` | ui | `render<Screen>(root, props, dispatch)`; `club-colours.ts` is a shared swatch helper |
| `src/main.ts` | shell | Composition root, loop, focus on new `<h1>` |

### C4 level 1: System context
```mermaid
C4Context
  title Gaffer: System Context
  Person(sam, "Player (Sam)", "Plays in short phone sessions")
  System(gaffer, "Gaffer", "Static football management game in the browser")
  System_Ext(pages, "GitHub Pages", "Hosts the static build under /gaffer/")
  Rel(sam, gaffer, "Picks a club and manages it in")
  Rel(pages, sam, "Serves the game files to")
```

### C4 level 2: Container
```mermaid
C4Container
  title Gaffer: Containers (single-page static app)
  Person(sam, "Player (Sam)")
  System_Boundary(app, "Gaffer SPA (browser)") {
    Container(main, "Shell: main.ts", "TypeScript", "Reads the URL seed, owns state, runs the dispatch/update/render loop")
    Container(ui, "UI: src/ui", "TypeScript, DOM, el()", "Renders screens and emits actions")
    Container(appl, "App state: src/app", "TypeScript, pure", "Holds Screen, Action, update and parseSeed")
    Container(dom, "Domain: src/domain", "TypeScript, pure", "Generates the league, with seeded RNG")
  }
  System_Ext(pages, "GitHub Pages", "Static host")
  Rel(sam, ui, "Taps buttons on")
  Rel(ui, main, "Dispatches actions to")
  Rel(main, appl, "Applies actions through update in")
  Rel(appl, dom, "Requests the generated league from")
  Rel(main, ui, "Renders the current state with")
  Rel(pages, main, "Delivers the bundle to")
```

### Technology
No new technology for S-001; ADR-0001 (toolchain), ADR-0002 (plain DOM) and ADR-0004 (seed and world) cover it. No new ADR is needed.

### Platform handoff notes
No external integrations. No contract tests. The `ci:*` contract is unchanged.

## For Acceptance Designer

Black-box target: `http://localhost:4173/gaffer/` (`ci:serve`). Pin the seed with `?seed=<int>`.

### Driving ports (S-001)
1. **Domain: `generateLeague(seed: number) => League`** (pure, `src/domain/`).
   - For any 32-bit seed: 8 clubs, unique non-empty names, 2 distinct colours each.
   - The same seed gives deep-equal output. Seeds 1 and 4242 differ.
   - No name is on the real-club denylist (`tests/unit/fixtures/real-club-denylist.ts`).
2. **Shell: seed parsing, `parseSeed(search: string) => number`** (pure, `src/app/`).
   - `^-?\d{1,10}$` within signed 32-bit: used as is, and `007` gives 7.
   - Missing, empty, `abc`, `1.5` and `9999999999` give `DEFAULT_SEED`.
   - Shell: `update(state, action) => state` with `Screen` = `title | pickClub | clubHome{clubId}`. "New game" moves title to pickClub. "Choose club" moves pickClub to clubHome. The chosen club is in memory only.
3. **UI: DOM via roles and accessible names** (Playwright, Pixel 7 / 390px viewport).

### UI contract
| Screen | Contract |
|---|---|
| Title | One `<h1>` "Gaffer"; `button` named "New game" |
| Pick club | One `<h1>` "Choose your club"; a `list` named "Clubs" (`aria-labelledby` on the h1) with exactly 8 `listitem`s, each holding exactly 1 `button`. The first line of the button text is the club name; the swatch is `aria-hidden`. Buttons are 44px or taller. |
| Club home | One `<h1>` containing the chosen club's name |

Cross-cutting: the shell (`main.ts`, not the renderers) moves focus to the new `<h1>` (`tabindex="-1"`) after navigation. `deriveSeed` arrives with squads (S-002). There is no horizontal scroll at 390px and no console errors. Generated text is set with `textContent`, never `innerHTML`.

### Driving ports (S-002)
4. **Domain: `generateSquad(seed: number, clubIndex: number) => readonly Player[]`** and **`deriveSeed(seed, clubIndex) => number`** (pure, `src/domain/`).
   - For any 32-bit seed and clubIndex 0-7: 18 players; exactly 2 GK, 6 DF, 6 MF, 4 FW; age 17-35; overall integer 1-20; no digit in any name.
   - Same inputs give a deep-equal squad in the same order. The 8 squads of one league are pairwise different. Boundary seeds 0, -1, 2147483647, -2147483648 hold the invariants.
5. **Shell: `update`** accepts `OpenSquad` (clubHome to `{kind:"squad", clubId}`) and `Back` (squad to `{kind:"clubHome", clubId}`). Both leave the state unchanged from any other screen. The league is never altered.
6. **UI roles and names** (below).

### UI contract (S-002)
| Screen | Contract |
|---|---|
| Club home | One `<h1>` with the club name (unchanged); `button` named "Squad", 44px or taller |
| Squad | One `<h1>` "Squad"; a `list` named "Squad" with exactly 18 `listitem`s (rows are not buttons); a `button` named "Back", 44px or taller |

Row text order: name, position (GK/DF/MF/FW), age, overall. Names contain no digits, so the first two numbers in a row are age then overall. Tests assert the generated ranges (age 17-35, overall 1-20), which sit inside the outcome's wider 16-40. The squad for a given `?seed=` and club is identical across visits and across repeated views. No horizontal scroll at 390px (long names wrap) and no console errors. Tap count: club home to squad is 1 tap, back is 1 tap.

### Observable acceptance (behavioural)
- Title to "New game" shows the heading and the 8-club list.
- Tapping any club (all 8, not a sample) gives an `<h1>` containing its name.
- The same `?seed=` on two fresh visits gives identical lists; seeds 1 and 4242 give different lists.
- An invalid seed gives the same list as no seed (unit-level).
- A tap count of 2 from load to club home.
- (S-002) From club home, "Squad" shows an 18-item "Squad" list; "Back" returns to the club-name heading; the 8 clubs of one seed show different squads; reopening the same seed and club shows identical rows.
