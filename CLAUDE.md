# Gaffer: operating manual for Claude

Gaffer is a mobile-first football management game for the browser, built by an unattended nWave-governed factory (`factory/`, `.github/workflows/factory-tick.yml`). nWave's agents decide what to build, which stack to use, and how to structure it, and nWave's reviewers critique those decisions. This file is locked (owner-only).

## Read first
- `docs/product/brief.md`: the vision, the player and the principles.
- `docs/product/scope.md`: IN/OUT and precedence rules. It wins every conflict; the narrower scope wins.
- `docs/product/architecture/`: accepted technical decisions. Follow them, and supersede them only with a new ADR.
- `docs/roadmap.yaml`: the nWave-owned story queue. A story is done only when `tests/protected/<id>/` passes on main.
- `docs/CONVENTIONS.md` (once nWave creates it): the coding conventions the architecture implies. Put conventions there, not here.

## The contract CI relies on (keep it working whatever stack you choose)
The package manager is detected from the lockfile (bun, pnpm, yarn or npm). CI only ever runs these `package.json` scripts:

| Script | Must |
|---|---|
| `ci:lint` | lint the codebase, failing on errors |
| `ci:typecheck` | type-check (or a no-op only if an ADR chose an untyped stack) |
| `ci:test` | run unit, property and acceptance tests; fast-check users must honour the `FC_SEED` env var |
| `ci:build` | produce the static production build in `dist/` (with `dist/index.html`), served under base path `/gaffer/` |
| `ci:serve` | build, then serve the production build at `http://localhost:4173/gaffer/` (used by the locked protected-scenario runner) |
| `ci:e2e` | run Playwright e2e smoke tests from `tests/e2e/` on a phone viewport; honour `BASE_URL` for deployed-site smoke |
| `ci:mutation` | mutation testing of the core game logic (nightly) |

Changing what a `ci:*` script checks needs an ADR, and the AI reviewer blocks it when it weakens checking.

## Locked by design (CI rejects edits)
`.github/`, `factory/`, `docs/product/brief.md`, `docs/product/scope.md`, `scripts/`, `.nwave/`, `CLAUDE.md`. The rest of `docs/product/` is nWave's SSOT (architecture brief, ADRs, jobs, journeys, personas, outcomes). `tests/protected/` is append-only: new scenario files are fine, existing ones are permanent.

## Principles that are not up for an ADR
- **Deterministic game logic:** same seed, same season. No ambient randomness or wall-clock time in game rules; inject them. (CI checks `src/domain/` if it exists.)
- **Phone first:** semantic, accessible markup (real buttons, an `<h1>` per screen, lists for collections), tap targets of 44px or more, no horizontal scroll at 390px, and no console errors. The protected scenarios rely on roles and accessible names.
- **Small, reviewable steps**, each with tests that pass.

## nWave
- The rigor profile is in `.nwave/des-config.json` (crafter on sonnet, reviewer on haiku, RED→GREEN→COMMIT, refactor pass; mutation testing runs nightly).
- Each roadmap story is an nWave feature: feature-id = story id (`S-NNN`). Its artifacts live in `docs/feature/S-NNN/` (`feature-delta.md`, `slices/`, `deliver/roadmap.json`, `deliver/execution-log.json`).
- Architecture SSOT: `docs/product/architecture/brief.md` (with the "For Acceptance Designer" driving-ports section) and `docs/product/architecture/adr-NNNN-title.md`.
- Unattended runs follow `factory/PROMPT.md`, which pre-answers every interactive gate.

## Mutation Testing Strategy
nightly-delta. The nightly workflow runs mutation testing; `/nw-deliver` Phase 5 is skipped.

## Reference only
`salvage/` holds code from earlier attempts (seeded RNG, formation coordinates). `docs/archive/owner-drafts/` holds the owner's early story drafts; nWave may use them as input or ignore them. Neither folder is built.
