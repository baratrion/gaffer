# ADR-0018: `render` becomes a lookup table keyed by screen kind (S-011)

- Status: Accepted (peer review pending: the orchestrator dispatches nw-solution-architect-reviewer)
- Date: 2026-10-26
- Deciders: nWave solution-architect (S-011 DESIGN, `interaction_mode=propose`)
- Related: ADR-0003 (composition root, functional core and imperative shell), ADR-0016 (Decision 4: `update` became a handler table; `render` "deferred to the next story that adds a screen, which must do it first"), ADR-0015 (S-009 Open question 1: `render` at 15 of 15), ADR-0017 (the screen that triggers this).
- **Closes** S-009 Open question 1 for `render` (ADR-0016 closed it for `update`). Amends nothing else.

## Context
`main.ts` `render` is a `switch (screen.kind)` of 11 cases plus a `never` guard, at oxlint `complexity` 15 of 15 (`.oxlintrc.json`: `"complexity": ["error", { "max": 15 }]`, `max-params` 3, `max-lines` 400; counted as S-007..S-010 did: base 1, plus each `case`, `if`, `&&`, ternary). The Inbox adds a screen kind, so a twelfth case would make 16 and fail `ci:lint`. Two earlier stories wrote that the next screen story must first move `render` to a lookup. The `render` code is shell glue (state to props: `findClub`, `squadOf`, `matchFor`, `standingsOf`, `seasonSummaryOf`, and the `offer` read at boot); `main.ts` has top-level effects (storage, `document`), so vitest cannot import it: behaviour is covered by e2e and the protected scenarios.

## Options
| Option | Pros | Cons |
|---|---|---|
| **A. A lookup `RENDERERS` typed `{ [K in Screen["kind"]]: (context, screen: Extract<Screen, { kind: K }>) => void }` in `main.ts`, with `context = { root, state, dispatch }` (chosen)** | The type is the exhaustiveness check: a missing or extra key is a `ci:typecheck` error (replaces the `never` guard). Each entry is its own function (complexity 1 to 3), so a new screen adds one entry and no branch to anything. Same pattern as `HANDLERS` (ADR-0016). Behaviour-preserving: each entry is the body of its old case. Stays in the composition root, next to `offer` and the `findClub`/`...OrThrow` helpers | One documented cast at the call (TypeScript cannot correlate a union key with its entry), as `update` has |
| B. Keep the switch and shave complexity by grouping cases into helper functions (for example `renderDetail`) | No type work | Pays the debt again at the next screen; the helper grouping is arbitrary; the same 15 of 15 limit returns |
| C. Move the glue into each screen module so `render` is a dumb map | Screens own their props | The UI layer would import app selectors and domain functions (`matchFor`, `standingsOf`, `generateSquad`), against the dependency direction ui, then app (`ui` only imports app types today) and the "renderers take props, never state" convention |
| D. A library (router, pattern matching) | Less hand code | A new runtime dependency for a 12-entry table; the bundle budget forbids it (ADR-0001) |
| E. A new file `src/ui/render.ts` for the lookup | `main.ts` shrinks | The table needs `offer` and the boot helpers (so a context object grows) and is shell glue; `main.ts` stays well under 400 lines (about 190), so no file is gained |

`max-params` is 3: the natural `(root, state, screen, dispatch)` has four, so the entries take `(context, screen)`.

## Decision
**A.** In `src/main.ts` (EXTEND, behaviour-preserving, **its own first DELIVER commit before any Inbox code**):
- `RenderContext = { readonly root: HTMLElement; readonly state: GameState; readonly dispatch: Dispatch }`.
- `Renderers` is the mapped type above; `RENDERERS: Renderers` holds one entry per screen kind, each the old case body (the existing helpers `findClub`, `squadOrThrow`, `seasonSummaryOrThrow` and the `matchScreenView` mapping stay as they are).
- `render(root, state, dispatch)` calls `RENDERERS[state.screen.kind]` with the context and `state.screen`; one documented cast at that line. The unreachable `default` and the `never` guard go (the mapped type replaces them).
- The `title` entry keeps `renderTitle(root, { offer }, dispatch)` (the module constant). The loop, `applyFocus` and `autosave` are untouched.
- Then S-011 adds the `inbox` entry (ADR-0017). The `Screen` union is the single place a screen is declared; the type forces the table to follow.

Expected complexity (`ci:lint` confirms in DELIVER): `render` 1; every entry 1, except `choosePlayer` 2 (one guard) and `match` and `player` 2; module-level helpers unchanged. No existing function gains a branch.

## Consequences

### Positive
- The S-009 debt is closed for `render`: a screen costs one `Screen` kind, one handler entry and one render entry; no function nears the limit.
- Exhaustiveness moves from a runtime `throw` on an impossible default to the compiler.
- Pure refactor first, then the feature: the refactor commit is judged alone by the full existing e2e and protected suites.

### Negative
- One cast at the lookup (documented; the S-010 `update` precedent). A wrong entry for a key is still caught by the mapped type; a wrong body is caught only by e2e (the same as before).
- `main.ts` is not importable from vitest, so no unit test covers the lookup; the guard is the type, a grep test (`main.ts` has no `switch (` on a screen kind and contains `RENDERERS`) and the S-001..S-011 browser suites.

### Contract shape
| Component | Shape | Universe and assertion |
|---|---|---|
| `main.ts` `render` / `RENDERERS` | bounded-change (the ADR-0003 imperative shell; enumerated universe unchanged) | Writes only `root`'s children through the renderers and then focus as `focusPlan` says; no other globals. Behaviour preservation: the unedited S-001..S-010 e2e and protected scenarios, one per screen kind, run on the refactor commit alone |

### Earned Trust (no adapter; the lie is "the refactor changed behaviour" and "the table drifts from the union")
1. **A screen kind without an entry, or an entry for no kind**: `ci:typecheck` fails (mapped type); probe: add a kind to `Screen` in a scratch change and see the typecheck red (DELIVER may do this once and discard it).
2. **Wrong props or the wrong renderer for a kind**: every screen is reached by an existing e2e (title, pick-a-club, club home, squad, player, tactics, Starting XI, choose player, match, table, End of season) and by S-011's Inbox suite; the refactor commit is run against the whole existing suite before Inbox code lands. Fault: swapping two entries turns the protected scenarios of both screens red.
3. **The switch creeps back**: grep test that `main.ts` has no `switch (` and holds `RENDERERS`; `ci:lint` complexity stays the gate.

### Enforcement
- `.oxlintrc.json` unchanged (`complexity` 15, `max-params` 3, `max-lines` 400 already bite). `ci:typecheck` enforces the table's completeness. No new dependency, no external integration, no contract tests.
