# Slice 01: Tap a player, see attributes and condition, Back

**Story:** US-1 (S-003). **Depends on:** S-002. **Estimate:** about 320 changed lines, 2-3 days. The only slice of S-003, and releasable: the player sees a new screen. Delivered as two commits: (1) a domain precursor commit (attributes, condition, derived overall; not shipped alone because nothing new is visible), then (2) the tappable rows, player screen and Back. Per ADR-0006.

## Goal
On the squad list Sam taps a player's row, sees what that player is good at and how fit they are, and taps "Back" to return to the same squad.

## IN
Precursor commit (developer-facing, ADR-0006):
- `Player` gains `attributes` (goalkeeping, defending, passing, shooting; whole numbers 1-20) and `condition` (75-100 generated, inside the 0-100 the UI accepts).
- `overall` derived by `deriveOverall(position, attributes)`: at least the lowest attribute, at most the highest, still 1-20.
- Age and the internal quality stay on `deriveSeed(seed, clubIndex)`; attributes and condition come from `deriveSeed(seed, 100 + clubIndex)`. Names, positions, ages and row order stay identical to S-002 for every seed. Pure: no `Date`, `Math.random` or DOM in `src/domain/`.

Player-visible commit:
- Each squad row holds exactly one button (44px or taller); row text unchanged (name, position, age, overall).
- Tapping it opens the player screen: one heading, the player's name; "Position GK", "Age 27" and "Overall 14" style lines equal to the row; a list named "Attributes" with Goalkeeping, Defending, Passing, Shooting in that order, each "Name N"; "Condition N%" outside the list; a button named exactly "Back" (44px or taller).
- "Back" from the player returns to the same club's squad; "Back" from the squad still returns to club home.
- Derived on render from the seed, club and row; not stored, not persisted. Focus on the new heading; no sideways scroll at 390px.
- Replace the S-002 e2e test "squad rows are display-only, not buttons" by a renamed test asserting, for each of the 18 rows, exactly one button (test count must not drop).

## OUT
Editing, sorting, filtering, prev/next swiping, condition or attributes in the squad row, condition changes over time, more than 4 attributes, photos, kits.

## Learning hypothesis
Disproves "four attributes, a condition and a derived overall fit the existing generator, and turning rows into buttons keeps every S-001/S-002 protected scenario green while a player's details are one tap away and one tap back" if it fails.

## Acceptance (player-facing)
- Tapping a row shows one heading, the player's name, with Position, Age and Overall equal to the row.
- The "Attributes" list has exactly 4 items in order, each 1-20 and no other number; "Condition" is 0-100% outside it.
- The overall lies between the lowest and highest attribute.
- "Back" shows the squad (heading the club name, 18 items); "Back" again shows club home.
- `?seed=abc`, 8th club: a goalkeeper's row and a forward's row both open full details.
- Same `?seed=31`, club and row give an identical player screen on a fresh visit; a squad's players do not all share the same attributes.
- 18 row buttons and "Back" at least 44px; no sideways scroll; no console errors.

## Developer criteria (precursor commit, not story AC)
- Property: for any 32-bit seed and club 0-7, every player has 4 attributes 1-20, condition 75-100, overall between min and max attribute; deep-equal for the same seed and club.
- Names, positions and ages equal the S-002 generator's for sampled seeds. All S-002 tests still pass.

## Demonstrable
Open `/gaffer/?seed=31` on a phone, tap New game, a club, "Squad", a player, "Back", "Back".
