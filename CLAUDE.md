# Gaffer: operating manual for Claude

Gaffer is a mobile-first football management game for the browser, built mostly by an unattended nWave-governed factory (`factory/`, `.github/workflows/factory-tick.yml`). This file is owner-only.

## Read first
- `docs/product/brief.md`: the vision and the player.
- `docs/product/scope.md`: IN/OUT and precedence rules. **It wins every conflict; the narrower scope wins.**
- `factory/roadmap.yaml`: the ordered stories. A story is done only when `tests/protected/<id>/` passes on main.

## Architecture
- `src/domain/`: pure TypeScript. Game state and rules (league, squad, tactics, match sim, season). No DOM, no storage, no `Math.random`/`Date.now`/`new Date()`. Use `src/domain/rng.ts`, and thread the `Rng` state through explicitly.
- `src/ui/`: plain DOM modules that render domain state and dispatch user intents. UI may import domain; domain never imports UI.
- `src/main.ts`: composition root. Persistence adapters (localStorage) live in `src/ui/` or a dedicated `src/adapters/`, never in domain.
- Prefer immutable data and small pure functions. Keep files under 400 lines and functions under 3 params (lint-enforced).

## Testing
- `tests/unit/`: fast unit tests. `tests/property/`: fast-check properties; CI uses a fresh seed every run, so never pin seeds to make a test pass.
- `tests/acceptance/<story>-*.test.ts`: the nWave DISTILL output, driving the domain through its public functions.
- `tests/e2e/`: Playwright smoke on a Pixel 7 viewport.
- `tests/protected/`: **owner-approved black-box scenarios.** Never edit them, and don't read them in deliver/fix mode.
- Full local check: `pnpm exec oxlint . && pnpm exec tsc --noEmit && pnpm exec vitest run && pnpm exec playwright test --project=e2e`.

## UI conventions (protected scenarios rely on these)
- Use semantic, accessible elements: real `<button>`s, headings (`<h1>`/`<h2>`) per screen, lists for collections, and `aria-label`s where text is not visible.
- The screen title is an `<h1>`; navigation buttons use the screen names the stories mention ("Squad", "Tactics", "Play match", "Fixtures", "Table", "Inbox").
- Tap targets of 44px or more, no horizontal scroll at 390px width, and no console errors.

## nWave
- The project rigor profile is in `.nwave/des-config.json` (custom: sonnet crafter, haiku reviewer, RED→GREEN→COMMIT, refactor pass on, mutation testing nightly instead of per step).
- Feature artifacts go in `docs/feature/<story-id>/`. Keep them lean (`documentation.density: lean`).
- Unattended runs follow `factory/PROMPT.md`, which pre-answers every interactive gate.

## Reference only
`salvage/` holds code from earlier attempts (seeded RNG, formation coordinates). It is not compiled or linted. Port pieces deliberately; don't import them.
