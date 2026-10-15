# Slice 01: generateSquad domain precursor

**Story:** US-1 (S-002). **Depends on:** S-001 (league, `rng.ts`). **Estimate:** about 150 changed lines, 1 day.

## Outcome
A pure `generateSquad(seed, clubIndex)` that returns 18 fictional players per club. A precursor commit: nothing is visible to the player yet.

## Scope
- `deriveSeed(seed, clubIndex)`, a pure integer hash (ADR-0003/0004).
- `generateSquad`: exactly 2 GK / 6 DF / 6 MF / 4 FW, age 17-35, overall integer 1-20 (ADR-0004).
- First-name and surname lists added to `names.ts`; no digits in any name; no real players.
- A `Player` type: name, position, age, overall. No other fields (ADR-0004).
- No ambient randomness or wall-clock time.

## Acceptance (embedded)
- Property, any 32-bit seed and club index 0-7: 18 players, quota 2/6/6/4, ages 17-35, overalls 1-20, no digit in any name.
- Same seed and club index give a deep-equal squad.
- The 8 squads of one league are pairwise different.
- Boundary seeds 0, -1, 2147483647 and -2147483648 hold the same invariants.

## Demonstrable
Via `ci:test` only (property tests on the driving port).

## Out
Any UI, `update` changes, attributes, condition.
