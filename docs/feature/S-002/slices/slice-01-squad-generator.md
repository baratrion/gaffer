# Slice 01: Squad generator

**Story:** US-1 (S-002). **Depends on:** S-001. **Estimate:** about 150 changed lines, under 1 day. A precursor commit: nothing is visible to the player.

## Outcome
Given a seed and a club index, the domain returns the same 18 players every time, and different clubs get different players.

## Scope
- `deriveSeed(seed, clubIndex) => number`, a pure integer hash (ADR-0003/0004).
- `generateSquad(seed, clubIndex) => readonly Player[]` in `src/domain/` (ADR-0004).
- `Player { name, position, age, overall }`, `position` one of GK, DF, MF, FW.
- Exact quota: 2 GK, 6 DF, 6 MF, 4 FW. Age 17-35. Overall integer 1-20.
- Fictional first-name and surname lists in `src/domain/names.ts`. Names contain no digits.
- No duplicate player name within a squad or across the 8 clubs of one league (DESIGN picks the construction).
- Real-player denylist unit test.

## Acceptance (embedded)
- Property: for any 32-bit seed and club index 0-7, the squad has 18 players, the exact quota, ages 17-35, overalls 1-20.
- Property: the same seed and index give a deep-equal squad.
- Property: for any seed, the 8 squads share no player name.
- Seeds 1 and 4242 give different squads for club 0.
- No generated name matches the real-player denylist.
- No `Date`, `Math.random` or DOM in `src/domain/`.

## Demonstrable
Vitest and fast-check run green under `ci:test` (honouring `FC_SEED`).

## Out
Attributes, condition, derived overall, any UI.
