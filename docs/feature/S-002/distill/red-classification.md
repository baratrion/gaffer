# S-002 RED classification (pre-DELIVER fail-for-the-right-reason gate)

Reconciliation passed -- 0 contradictions. Run against RED scaffolds (`src/domain/squad.ts`, `deriveSeed` in `src/domain/rng.ts`, `ViewSquad`/`Back` in `src/app/state.ts`). No import errors; `tsc --noEmit` and `oxlint` clean. S-001 and unit tests still pass (37 passing).

## Vitest (`tests/acceptance/S-002/`): 46 of 46 fail
| File | Failing | Classification |
|---|---|---|
| `squad-generation.test.ts` | 16 property/example tests (incl. the new GK/DF/MF/FW token property) | MISSING_FUNCTIONALITY (`generateSquad` throws the RED scaffold error; fast-check reports it as the cause) |
| `squad-generation.test.ts` | 5 RangeError cases (-1, 8, 100, 1.5, NaN) | MISSING_FUNCTIONALITY (assertion: scaffold throws `Error`, not `RangeError`) |
| `derive-seed.test.ts` | 8 | MISSING_FUNCTIONALITY (`deriveSeed` scaffold) |
| `name-pool.test.ts` | 5 | MISSING_FUNCTIONALITY (`FIRST_NAMES`/`SURNAMES` are empty scaffold arrays; the assertions on size and non-empty entries fail; no import error) |
| `navigation.test.ts` | 12 (incl. 2 unknown-clubId no-ops) | MISSING_FUNCTIONALITY (`update` throws for `ViewSquad`/`Back`) |

## Playwright (`tests/e2e/S-002-squad.spec.ts`, Pixel 7, 390px): all fail, MISSING_FUNCTIONALITY
Includes the invalid-seed cases `abc`, `9999999999` and empty. Club home has no "Squad" button, so click and list expectations time out. The title, "New game", club pick and club-home heading steps pass (setup is sound).

No IMPORT_ERROR, FIXTURE_BROKEN or WRONG_ASSERTION findings. DELIVER may proceed.
