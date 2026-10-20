# Slice 02: See who scored, from my eleven

**Story:** US-2 (S-006). **Depends on:** slice 01 (match screen, match model with goal events). **Estimate:** about 1 day, about 330 changed lines in DELIVER, tests included: code about 95 (scorer choice 30, match screen list 15, `main.ts` 5, CSS 25, state 5, plus 15 in the model's event shape) and tests about 235 (match unit and property 100, names check 30, navigation 40, e2e 65, only what `tests/protected/S-006/` does not cover). It ships in the same DELIVER as slice 01; with it the roadmap outcome and `tests/protected/S-006/` are complete.

## Goal
Under the score Sam reads a list "Goals": one line per goal with the minute, the scorer and his club. Every goal for Sam's club was scored by one of the outfield players on his Starting XI screen.

## IN
- A list named "Goals" below the score line (a visible non-heading label, so the screen keeps one heading), already shown with all its items on arrival, never revealed over time (D13):
  - exactly one item per goal (home goals plus away goals); for 0–0 the list is present with no items;
  - items in match order, minutes never decreasing;
  - each item reads exactly `<minute>' <scorer> (<club>)`: minute a whole number 1-90, straight apostrophe U+0027, one space, the scorer's name, one space, the club's name in round brackets, for example "23' Ivo Elderkin (Netherwold Borough)";
  - the number of items naming each club equals that club's goals in the score line.
- Scorers: for Sam's club, one of the 11 names on its Starting XI screen at the time of the match, never the GK slot's player; for the opponent, a player of the opponent's squad (its automatic 4-4-2 XI, outfield). No goalkeeper scores in this story; no own goals.
- Names with an apostrophe or hyphen read as in the squad.

## OUT
Assists, penalties, own goals, cards, shots, possession, live minute-by-minute reveal, commentary lines other than goals, ratings, top-scorer tables.

## Learning hypothesis
This slice disproves the following if it fails: "naming scorers from Sam's own eleven, one line per goal, makes the result feel earned by his picks and fits a 390px screen without clutter".

## Acceptance (player-facing)
- For each of the 8 clubs at `?seed=31` (and Oakhampton Rise Borough at `?seed=abc`): the list "Goals" is present and has home plus away items (none for 0–0), each matching `^(\d{1,2})' (.+) \((.+)\)$` with minute 1-90 and minutes non-decreasing; items naming each club equal its goals.
- Netherwold Borough at `?seed=31`, with "Kestrel Northcott 6" picked for "MF Dorian Dunmore 7": every item naming Netherwold Borough names one of the 11 on its Starting XI screen and never "Tamsin Ingleby"; every item naming the opponent names a player not in Netherwold Borough's "Squad" list and present in the opponent's "Squad" list (read in a new game managing the opponent).
- Two fresh pages with the same seed, club and tactics give the same "Goals" list.
- No sideways scroll at 390px with the longest names; no console errors.

## Developer criteria (not story AC)
- Property tests over many seeds, all 4 fixtures and all 3 formations: events sorted by minute; minutes 1-90; event count per side equals that side's goals; every scorer is in that side's XI and is not its GK slot; inputs never mutated.
- Unit check over every string array in `src/domain/names.ts`: no entry contains "Play match", "Goals" or "Matchday" (case-insensitive substrings).
- A golden match (seed 31, Netherwold Borough, automatic 4-4-2) is pinned as a regression lock in DELIVER's first green commit.
- Locators use `exact: true` for "Play match", "Back" and "Goals".

## Technical notes (for DESIGN, not AC)
- Generated text (scorer and club names) goes through `el()`/`textContent` only (ADR-0002); item text is one text node or inline spans with literal single spaces (S-005 inline-flow rule).

## Demonstrable
`/gaffer/?seed=31`: New game, "Netherwold Borough", "Starting XI", "MF Dorian Dunmore 7", "Kestrel Northcott 6", "Back", "Play match": read the "Goals" list.
