# S-004 DISTILL: RED classification

Method: every `it.skip` / `test.skip` was temporarily unskipped in the real repo against the scaffolds (`src/domain/formation.ts`, `src/app/state.ts`), run, then re-skipped (tree verified: only skipped tests remain, `ci:test` 164 passed / 170 skipped). The e2e spec was also run against a throwaway reference implementation in a scratch copy (since removed): 14/14 passed, so the tests are satisfiable. No scenario is IMPORT_ERROR, FIXTURE_BROKEN or WRONG_ASSERTION.

Classes: MISSING_FUNCTIONALITY = fails because behaviour is unimplemented (scaffold throws `__SCAFFOLD__ ... not implemented` or an assertion on the scaffold value fails). PRE_SATISFIED = passes today (regression guard).

## tests/acceptance/S-004/formation.test.ts (18 cases)
- FORMATIONS order and DEFAULT_FORMATION: MISSING_FUNCTIONALITY (scaffold list is empty; assertion fails)
- lineUp per formation, 3 cases (4-4-2, 4-3-3, 4-2-3-1): MISSING_FUNCTIONALITY (lineUp throws)
- lineUp property (11 codes, GK first, order, counts): MISSING_FUNCTIONALITY (lineUp throws)
- formationLines expansion property + 4-2-3-1 MF lines 2 and 3: MISSING_FUNCTIONALITY (formationLines throws)
- read twice / deep frozen: MISSING_FUNCTIONALITY (empty list not frozen; accessors throw)
- isFormationId accepts the three names: MISSING_FUNCTIONALITY (throws)
- isFormationId rejects 9 unknown names: MISSING_FUNCTIONALITY (throws)
- isFormationId property over any string: MISSING_FUNCTIONALITY (throws)

## tests/acceptance/S-004/tactics-navigation.test.ts (30 cases)
- initialState: MISSING_FUNCTIONALITY (throws)
- ViewTactics from a known club home: MISSING_FUNCTIONALITY (throws)
- ChooseFormation 4-3-3 + line-up; choose property; same-formation `toBe`: MISSING_FUNCTIONALITY (update throws)
- Back from tactics (property): MISSING_FUNCTIONALITY (assertion: state stays on tactics)
- Journey Back/Squad/player/Back/Back/ViewTactics; new-game journey: MISSING_FUNCTIONALITY (update throws)
- ViewTactics no-ops, 6 cases; ChooseFormation no-ops, 6 cases; unknown-name no-ops, 6 cases: MISSING_FUNCTIONALITY (update throws)
- Back from tactics of an unknown club: PRE_SATISFIED (passes today: `back` already ignores unknown screens; kept as a regression guard for the new `tactics` branch DELIVER adds)
- NewGame resets formation: MISSING_FUNCTIONALITY (assertion: formation stays 4-2-3-1)
- Run of taps keeps a known formation (property): MISSING_FUNCTIONALITY (initialState throws)
- No mutation: MISSING_FUNCTIONALITY (update throws)

## tests/acceptance/S-004/focus-plan.test.ts (122 cases)
- First render (1), screen changes 90 pairs, same screen with id 10, same screen without id 10, empty id 10, no mutation 1: all MISSING_FUNCTIONALITY (focusPlan throws)

## tests/e2e/S-004-tactics.spec.ts (14 cases)
All 14: MISSING_FUNCTIONALITY. Each fails at the first step that needs the new screen: `waiting for getByRole('button', { name: 'Tactics', exact: true })` (the club home has no Tactics button yet); the "club home gains Tactics" case fails on its toHaveCount(1) for the same button. No navigation, seed or setup failure precedes it.

## Running now (not skipped)
- tests/unit/ui-never-moves-focus.test.ts (1): PRE_SATISFIED guard (no renderer calls `.focus(`).
- Existing S-001..S-003 acceptance fixtures now carry `formation: DEFAULT_FORMATION` (see upstream-issues.md); all still green.
