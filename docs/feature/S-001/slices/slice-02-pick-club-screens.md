# Slice 02: Seed, pick-club and club-home screens

**Story:** US-1 (S-001). **Depends on:** slice 01. **Estimate:** about 250 changed lines, 1-2 days.

## Outcome
Sam taps "New game", sees 8 clubs, taps one, and lands on that club's home screen headed by its name.

## Scope
- Seed parsing in the shell. Matches `^-?\d{1,10}$` and fits 32-bit, otherwise `DEFAULT_SEED` (ADR-0004).
- `Screen` gains pick-club and club-home. `update` handles New game and Choose club (ADR-0003).
- Views built with `el()` (ADR-0002):
  - `<h1>` "Choose your club".
  - `<ul>` named "Clubs", with one `<li>` per club holding one `<button>`.
  - Button text: the club name on the first line, plus an `aria-hidden` two-colour swatch.
  - Buttons are at least 44px tall. No horizontal scroll at 390px.
  - Club-home `<h1>` is the club name.
- The chosen club is held in memory only.

## Acceptance (embedded)
- "New game" shows 1 `<h1>` and a "Clubs" list with 8 items, each with exactly 1 button.
- Tapping a club makes the `<h1>` contain its name.
- Same `?seed=` gives the same list. Seeds 1 and 4242 give different lists.
- Invalid seeds (`abc`, empty, `9999999999`, `1.5`, `+5`) give the default league (unit-tested).
- The phone-viewport e2e smoke passes with no console errors.

## Demonstrable
Open the deployed `/gaffer/` on a phone and tap through in 2 taps.
Completes the walking skeleton (e2e: New game, pick a club, club home).

## Out
Persistence, crests, squads, back navigation polish (a later story if needed).
