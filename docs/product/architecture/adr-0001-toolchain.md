# ADR-0001: Toolchain: TypeScript, Vite, pnpm, Vitest + fast-check, Playwright, oxlint

- Status: Accepted
- Date: 2026-10-15
- Deciders: nWave solution-architect (factory plan run, `interaction_mode=propose`)

## Context
The bootstrap shell already ships with a working toolchain that satisfies the `ci:*` script contract
in `CLAUDE.md`, but no ADR recorded it. The brief says "switching tools on a whim" stalled earlier
attempts, so the baseline has to be explicit before any story is delivered.

Constraints: a static site under `/gaffer/` (scope.md), deterministic game logic, mid-range phones,
property tests that honour `FC_SEED`, and Playwright on a phone viewport.

## Options
| Option | Pros | Cons |
|---|---|---|
| **A. Keep the bootstrap stack** (TS strict, Vite 7, pnpm 10, Vitest 3, fast-check 4, Playwright, oxlint, Stryker) | Already green in CI; tiny config; Vite's `base` handles `/gaffer/`; Vitest shares Vite's transform; Stryker has a Vitest runner | oxlint has fewer rules than ESLint |
| B. Swap to Bun (runtime + test runner) | Fast; one tool | Stryker has no Bun runner, so `ci:mutation` breaks; churn for no product gain |
| C. ESLint + typescript-eslint instead of oxlint | Richer rule set | More dependencies and slower; the current rules already enforce the domain/UI boundary |

## Decision
**Option A.** Record the existing stack as the baseline:
- **Language:** TypeScript in `strict` mode with `noUncheckedIndexedAccess` and `exactOptionalPropertyTypes`.
- **Build/dev:** Vite (`base: "/gaffer/"`, output in `dist/`).
- **Package manager:** pnpm (pinned via `packageManager`, lockfile `pnpm-lock.yaml`).
- **Unit/property/acceptance tests:** Vitest + fast-check, in `tests/unit`, `tests/property` and `tests/acceptance`.
  fast-check honours `FC_SEED`: `tests/setup/fast-check-seed.ts` (a Vitest `setupFiles` entry, added in
  this PR) calls `fc.configureGlobal({ seed })` when the variable holds an integer.
- **E2E smoke:** Playwright on `devices["Pixel 7"]`, in `tests/e2e`.
- **Lint:** oxlint with the domain-boundary overrides in `.oxlintrc.json`.
- **Mutation:** Stryker with the Vitest runner on `src/domain/**`.

Docs checked (Context7): `/microsoft/playwright` (role locators with accessible names, `allInnerTexts`,
`boundingBox`) and `/dubzzz/fast-check` (`configureGlobal` from a Vitest setup file).

## Consequences
- No tool switch. This PR only closes the `FC_SEED` gap and tightens the lint boundaries (ADR-0003).
  Any later switch needs a superseding ADR and must keep every `ci:*` script working.
- Open (owner-only, recorded in `docs/feature/S-001/open-questions.md`): `vitest.config.ts`,
  `playwright.config.ts` and `stryker.config.mjs` are agent-editable, although the Stryker file claims to be owner-only.
  Until the owner locks them, the AI reviewer's "no weakening of `ci:*` checks" rule is the guard.
