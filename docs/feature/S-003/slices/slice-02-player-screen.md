# Slice 02: Tappable rows, player screen and Back

**Story:** US-1 (S-003). **Depends on:** slice 01 and S-002. **Estimate:** about 200 changed lines, 1-2 days.

## Goal
On the squad list Sam taps a player's row, sees that player's details, and taps "Back" to return to the same squad.

## IN
- Each squad row holds exactly one `<button>` (44px or taller) inside its `<li>`; row text unchanged (name, position, age, overall).
- `Screen` gains a player variant (club and player index); `Action` gains a view-player action; `Back` from the player screen returns to the same club's squad. Wrong-screen actions are no-ops (ADR-0003).
- Player screen built with `el()` (ADR-0002):
  - one `<h1>`, the player's full name; focus moves to it (shell, as before).
  - "Position", "Age", "Overall", each label followed by its value, equal to the tapped row.
  - a list named "Attributes": Goalkeeping, Defending, Passing, Shooting, in that order, each name then its value.
  - "Condition" outside that list, as "Condition N%".
  - a `<button>` named exactly "Back", 44px or taller.
- Player derived from the seed, club index and row index on render; not stored, not persisted.
- No horizontal scroll at 390px; long names wrap.
- Replace the S-002 e2e test "squad rows are display-only, not buttons" with "each of the 18 rows holds exactly one button" (test count must not drop).

## OUT
Editing, sorting, filtering, prev/next swiping, condition or attributes in the squad row, photos, kits.

## Learning hypothesis
Disproves "turning rows into buttons keeps every S-001/S-002 protected scenario green while a player's details are one tap away and one tap back" if it fails.

## Acceptance (embedded)
- Tapping a row shows one `<h1>` = the player's name, with Position, Age and Overall equal to the row.
- The "Attributes" list has exactly 4 items in D2 order, each 1-20 and no other number; "Condition" is 0-100% outside it.
- "Back" shows the squad (heading = club name, 18 items); "Back" again shows club home.
- `?seed=abc`, 8th club: the first row (GK) and last row (FW) both open full details.
- Same `?seed=31`, club and row give an identical player screen on a fresh visit.
- 18 row buttons and "Back" at least 44px; no sideways scroll; no console errors.

## Demonstrable
Open `/gaffer/?seed=31` on a phone, tap New game, a club, "Squad", a player, "Back", "Back".
