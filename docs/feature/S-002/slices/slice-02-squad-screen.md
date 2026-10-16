# Slice 02: Squad screen and Back

**Story:** US-1 (S-002). **Depends on:** slice 01 and S-001. **Estimate:** about 200 changed lines, 1-2 days.

## Outcome
From a club's home screen Sam taps "Squad", sees the club's 18 players, and taps "Back" to return.

## Scope
- `Screen` gains `{ kind: "squad", clubId }`; `Action` gains `ViewSquad` and `Back`. `update` handles both and ignores them from the wrong screen (ADR-0003).
- Club home gains a "Squad" button (44px or taller). Its `<h1>` stays the club name.
- Squad view built with `el()` (ADR-0002):
  - one `<h1>` (for example "Squad").
  - `<ul>` named "Squad", one `<li>` per player.
  - Row text order: name, position, age, overall. Age and overall are the first two numbers.
  - A `<button>` named exactly "Back", 44px or taller.
- Squad derived from the seed and the club's index on render; not stored in state, not persisted.
- Focus moves to the new `<h1>` after navigation (shell, as in S-001).
- No horizontal scroll at 390px, long names wrap or truncate within the width.

## Acceptance (embedded)
- Squad shows 1 `<h1>` and a "Squad" list with 18 items.
- Each row: name, then GK/DF/MF/FW, then age 16-40, then overall 1-20.
- Tapping "Back" makes the `<h1>` the club's name.
- Same `?seed=` and same club give identical rows; two clubs give different players.
- The phone-viewport e2e smoke passes with no console errors; button heights are at least 44px.

## Demonstrable
Open `/gaffer/?seed=31` on a phone, tap New game, a club, "Squad", then "Back".

## Out
Player detail, sorting, filtering, formations, persistence.
