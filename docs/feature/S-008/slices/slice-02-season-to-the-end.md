# Slice 02: Play the season to the end, "Season over"

**Story:** US-2 (S-008). **Depends on:** slice 01 (next matchday, guard after 14). **Estimate:** about 0.5 day, about 160 changed lines in DELIVER, tests included. Code is about 20 lines: club home "Play match" or "Season over" 10, `main.ts` 5, CSS 5. Tests are about 140 lines: per-club season and reference-season goldens 60, names check 15, e2e 65 (14 matchdays at 390px, "Season over", the final table). With it the roadmap outcome and `tests/protected/S-008/` are complete.

## Goal
Sam plays all 14 matchdays and meets every rival twice, named first once and second once. After the last match the club home says "Season over" instead of offering "Play match", and the table shows the final standings at P 14.

## IN
- Matchdays 1..14 in order, with h1 "Matchday 1" to "Matchday 14".
- Over 1..7 each other club is met exactly once, and again over 8..14. Over the 14 matchdays Sam's club is named first against each once and named second against each once (schedule, ADR-0010).
- The final table: every row P 14, row rules, and Sam's row equal to the sum of his 14 score lines; order rules as S-007.
- After matchday 14 (this version only, not durable, not pinned in `tests/protected/`): the club home has no "Play match" button and shows a plain text line "Season over". The heading (focused on arrival) and "Squad", "Tactics", "Starting XI" and "Table" stay. "Table" opens and reads P 14.
- "Season over" is derived from the results log (14 matchdays recorded), not stored separately.
- Names check: "Season over" appears (case-insensitive) in no `names.ts` entry or generated name.
- No sideways scroll at 390px with the line in place of the button; no console errors.

## OUT
The end-of-season screen (final position, top scorer, "play again"), a second season without a reload, persistence, other results, re-opening played matches.

## Learning hypothesis
If this slice fails, it disproves this: "a 14-matchday season playable in about 28 taps, with a plain end and a final table, delivers the north star 'one club through one season, start to finish' on a phone".

## Acceptance (player-facing)
- `?seed=31`, "Netherwold Borough", untouched tactics, 14 x ("Play match", "Back"): the 14 score lines of `discuss/reference-season.md` in order. The last is "Matchday 14", "Tarnbeck Borough 2–1 Netherwold Borough". Netherwold Borough is named first on matchdays 1, 3, 5, 7, 9, 11, 13 and second on 2, 4, 6, 8, 10, 12, 14, against each other club once each way.
- Then the club home shows "Season over", with no "Play match" button; "Table": 1 Oakhampton Rise Borough 14 8 4 2 +11 28; 2 Tarnbeck Borough 14 7 5 2 +14 26; 3 Netherwold Borough 14 7 2 5 +2 23; 4 Juniper Hollow United 14 6 3 5 +3 21; 5 Marlbrook Athletic 14 5 4 5 -4 19; 6 Rushmoor Heath Albion 14 5 4 5 -4 19; 7 Fennimore Town 14 2 5 7 -7 11; 8 Valebridge Albion 14 1 3 10 -15 6.
- `?seed=abc`, "Oakhampton Rise Borough": matchday 14 reads "Oakhampton Rise Borough 1–1 Ironbridge Fen Wanderers"; then "Season over"; the table has Valebridge Town 1st on 29 and Oakhampton Rise Borough 2nd on 21, every row P 14.

## Developer criteria (not story AC)
- Unit: the season-over selector is false for 0..13 recorded matchdays and true for 14; the club home view gets the flag; `PlayMatch` with 14 recorded is a no-op (`toBe`).
- Property: for every seed and every managed club, 14 taps give every rival twice, named first once and second once.
- Golden: the seed-31 and seed-20260 reference seasons (score lines and final tables) as regression locks, also checked by the e2e in Chromium (cross-engine).

## Demonstrable
`/gaffer/?seed=31`: New game, "Netherwold Borough", 14 x ("Play match", "Back"), then "Table".
