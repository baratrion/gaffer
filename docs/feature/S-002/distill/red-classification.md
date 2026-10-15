# S-002 RED classification (pre-DELIVER fail-for-the-right-reason gate)

Reconciliation passed -- 0 real contradictions (one wording gap, age 16-40 vs 17-35, resolved to 17-35; see `open-questions.md`).
Run against RED scaffolds (`src/domain/squad.ts`, `deriveSeed` in `src/domain/rng.ts`, `OpenSquad`/`Back` in `src/app/state.ts`). No import errors; `ci:typecheck` and `ci:lint` clean. All 36 S-001 and unit tests still pass.

## Vitest (`tests/acceptance/S-002/`): 27 of 29 fail, all MISSING_FUNCTIONALITY; 2 regression guards pass
Failure is the scaffold `Error("Not yet implemented -- RED scaffold")` thrown from the driving port (fast-check wraps it as "Property failed ... Caused by: Not yet implemented").

| File | Tests | Failing | Classification |
|---|---|---|---|
| `squad-generation.test.ts` | 19 | 17 | MISSING_FUNCTIONALITY (`generateSquad` 14, `deriveSeed` 3) |
| `navigation.test.ts` | 10 | 10 | MISSING_FUNCTIONALITY (`update` for `OpenSquad`/`Back`) |

The 2 passing tests are the `generateLeague` regression guards ("seed 4242 still gives the same eight clubs", "league keeps its shape"). They pin existing S-001 behaviour and must stay green through DELIVER; they are not RED by design.

## Playwright (`tests/e2e/S-002-squad.spec.ts`, Pixel 7, 390px): 10 of 10 fail, MISSING_FUNCTIONALITY
Club home has no "Squad" button, so every test fails waiting on `getByRole("button", { name: "Squad" })` (click, or `toBeVisible()` in the tap-size test; the reload test fails at its `openSquad` precondition, which also needs the button). The page loads and the pick-club and club-home steps succeed before that point. No setup errors.

No IMPORT_ERROR, FIXTURE_BROKEN or WRONG_ASSERTION findings. DELIVER may proceed.
