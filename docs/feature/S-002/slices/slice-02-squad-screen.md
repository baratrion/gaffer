# Slice 02: Squad screen and Squad/Back navigation

**Story:** US-1 (S-002). **Depends on:** slice 01. **Estimate:** about 200 changed lines, 1-2 days.

## Outcome
From club home Sam taps "Squad", sees 18 players, and taps "Back" to return to club home.

## Scope
- Club-home gains a button named exactly "Squad" (44px or taller).
- `Screen` gains a squad screen; `update` handles opening the squad and "Back" (ADR-0003). The squad is generated from the league seed and the chosen club's index; it is not stored.
- View built with `el()` (ADR-0002): one `<h1>`, a `<ul>` named "Squad" with 18 `<li>` rows, a `<button>` named exactly "Back".
- Each row's text order: name, position, age, overall. Age and overall are the first two numbers.
- No horizontal scroll at 390px; focus moves to the new `<h1>` (shell, existing behaviour).

## Acceptance (embedded)
- Tapping "Squad" shows one `<h1>` and a "Squad" list with 18 items.
- Each row: name, GK/DF/MF/FW, age 16-40, overall 1-20, in that order; at least 2 GK and every position present.
- The 8 clubs of `?seed=31` show different squads; reopening gives an identical squad.
- "Back" returns to club-home, headed by the club's name.
- The phone-viewport e2e smoke passes with no console errors and no sideways scroll.

## Demonstrable
Open the deployed `/gaffer/?seed=31` on a phone: New game, pick a club, Squad, Back.

## Out
Player detail, sorting, filtering, formations, persistence.
