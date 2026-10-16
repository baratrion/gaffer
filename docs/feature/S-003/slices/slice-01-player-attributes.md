# Slice 01: Player attributes, condition and derived overall

**Story:** US-1 (S-003). **Tag:** `@infrastructure` precursor. **Depends on:** S-002. **Estimate:** about 120 changed lines, under 1 day. Not releasable alone: nothing new is visible to the player (the squad row's overall may change value for a seed, still 1-20). Slice 02 is the only releasable slice.

## Goal
Every generated player carries four attributes and a condition, and their overall is consistent with the attributes, for any seed and club.

## IN
- `Player` gains the four attributes Goalkeeping, Defending, Passing, Shooting (whole numbers 1-20) and condition (whole number 0-100; the generator range is a DESIGN decision).
- `overall` becomes derived from the four attributes: at least the lowest, at most the highest, still 1-20. Formula and ADR note superseding ADR-0005 (e) are DESIGN's.
- Drawn from the per-club seed (`deriveSeed(seed, clubIndex)`), pure, no `Date`, `Math.random` or DOM.
- S-002 invariants unchanged: 18 players, quota 2/6/6/4 in order, ages 17-35, names unchanged and unique across the league.

## OUT
Any UI, navigation, condition changes over time, position-weighted attribute rules beyond what DESIGN chooses, more than 4 attributes.

## Learning hypothesis
Disproves "four attributes and a derived overall fit the existing generator without breaking any S-002 property (quota, 1-20 overall, determinism, distinct squads)" if it fails.

## Acceptance (embedded)
- Property: for any 32-bit seed and club 0-7, every player has 4 attributes 1-20 and a condition 0-100.
- Property: every overall lies between the player's lowest and highest attribute, inclusive.
- Property: the same seed and club give a deep-equal squad, attributes and condition included.
- Property: within one squad, the 18 players do not all share the same four attribute values.
- All S-002 acceptance and property tests still pass.

## Demonstrable
Vitest and fast-check run green under `ci:test` (honouring `FC_SEED`).
