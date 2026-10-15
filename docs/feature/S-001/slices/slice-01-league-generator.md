# Slice 01: The same seed always produces the same league

**Story:** US-1 (S-001). **Estimate:** about 150 changed lines, under 1 day.
**Precursor commit, not shipped separately:** nothing is visible to the player until slice 02 lands.

## Outcome
Given a seed, the domain returns the same fictional 8-club league every time. Nothing is visible to the player yet, but the behaviour is proven by tests.

## Scope
- `generateLeague(seed) => League` in `src/domain/`, with 8 clubs, each with `id`, unique `name` and two distinct `colours` from a fixed palette (ADR-0004).
- Word lists in `src/domain/names.ts`. At least 24 towns, drawn without replacement, plus suffixes.
- The real-club denylist fixture and its unit test.
- No `Math.random`, no `Date`.

## Acceptance (embedded)
- For any 32-bit seed (fast-check, honouring `FC_SEED`): 8 clubs, unique names, two distinct colours each.
- The same seed gives deep-equal leagues. Seeds 1 and 4242 give different leagues.
- No generated name is on the denylist.

## Demonstrable
`ci:test` green, with a printed example league for the default seed.

## Out
Squads (S-002), seed parsing, any UI.
