# Slice 01: Play match, see the final score, Back

**Story:** US-1 (S-006). **Depends on:** S-001 (league, "Clubs"), S-002/S-003 (squads, attributes), S-004 (formation), S-005 (`currentXI`, automatic XI, club home actions). **Estimate:** about 1.5 days, about 560 changed lines in DELIVER, tests included: code about 215 (schedule 40, match model 90, state 25, match screen 30, club home 4, `main.ts` 25) and tests about 345 (schedule 90, match unit and property 140, navigation 70, e2e 45, only what `tests/protected/S-006/` does not cover). The protected scenarios (about 150 lines for the story) are written in the plan run, outside DELIVER. A pure domain precursor commit (schedule, then match model) is allowed inside the slice.

## Goal
On the club home Sam taps "Play match" and, on arrival, sees "Matchday 1" and the final score already shown (not revealed over time) of his club's matchday-1 league fixture, played by his own formation and Starting XI. "Back" returns to the club home with nothing changed.

## IN
Precursor commits (optional, developer-facing):
- A fixed round-robin schedule over the 8 clubs (algorithm and ADR by DESIGN; circle method expected). Matchday 1 pairs every club with exactly one other (4 fixtures) and fixes the home club.
- A pure match model: from the seed, the fixture, both formations and both XIs, it returns the goals of each side (0-9), built from goal events (minute 1-90, scorer, side) that slice 02 shows. Team strength comes from the XI's attributes. Its RNG stream never disturbs the league, name, club or attribute streams (-1, 0..7, 100..107), so S-001..S-005 outputs are unchanged.

Player-visible commit:
- Club home: a fourth button named exactly "Play match" (44px or taller), after "Squad", "Tactics", "Starting XI". Heading and the other three unchanged.
- Match screen: its only top-level heading (h1) is "Matchday 1", focused on arrival; exactly one piece of text whose whole text reads `<home> <h>–<a> <away>` (pattern `^(.+) (\d)–(\d) (.+)$`, en dash U+2013, no spaces around it, goals 0-9), and no other text on the screen in that format. One club is Sam's, the other a different "Clubs" name.
- Instant result (D13): the score line is already visible when the h1 has focus; nothing is revealed over time; no millisecond cap.
- Sam's club fields its current formation and `currentXI`; the opponent its automatic XI in 4-4-2.
- A button named exactly "Back" (44px or taller) to the club home, heading focused; XI and formation unchanged.
- No state change except the screen; no sideways scroll at 390px; no console errors.

## OUT
The "Goals" list and scorer rules (slice 02). Commentary, stats, other fixtures' results, table, matchday advance, persistence, condition effects, opponent tactics.

## Learning hypothesis
This slice disproves the following if it fails: "a seeded, event-based quick-sim fed by the XI's attributes gives believable football scores (mostly 0-3 a side, rarely 0–0 across a league) on one phone screen, in one tap, without touching any S-001..S-005 output".

## Acceptance (player-facing)
- `?seed=31`, "New game", "Netherwold Borough", "Play match": the only h1 is "Matchday 1", focused on arrival, and while it has focus exactly one piece of text already reads in full `<club> <0-9>–<0-9> <club>`, one club "Netherwold Borough", the other another name from the "Clubs" list.
- Two fresh pages at `?seed=31`, same club, untouched tactics: the identical match screen. `?seed=abc` and no seed, 8th club "Oakhampton Rise Borough": identical too.
- At `?seed=31`, managing each of the 8 clubs in turn: every club appears in exactly one pairing, 4 pairings, and both clubs of a pairing see the same two names in the same order (home first).
- Over those 4 matches, not every one ends 0–0 (also at `?seed=abc`).
- After choosing "4-3-3" and picking "Kestrel Northcott 6" for "MF Calder Redfern 15": "Play match", "Back" focuses the "Netherwold Borough" heading; Tactics still has 4-3-3 checked and Starting XI reads the same 11.
- "Play match" and "Back" are 44px or taller; no sideways scroll; no console errors.

## Developer criteria (precursor, not story AC)
- Schedule: unit and property tests: matchday 1 is a perfect matching of the 8 clubs with a fixed home club; deterministic (whether it depends on the seed is DESIGN's call, D5).
- Match model: pure (same inputs, deep-equal result; inputs never mutated); goals 0-9 per side. Over at least 1000 seeded matches between two automatic XIs: mean goals per side between 1.0 and 2.0, and under 20% of matches 0–0. Stronger XI property (D7): "stronger" = higher sum of the 11 overalls; against the same opponent XI, an XI whose sum is at least 20 higher scores more goals on average over at least 1000 seeds (DESIGN may refine the measure in the ADR but keeps this property). fast-check honours `FC_SEED`.
- `update`: "Play match" only from a known club's home; "Back" from the match to the club home; other screens no-ops; `xi` and `formation` untouched.

## Demonstrable
`/gaffer/?seed=31` on a phone: New game, "Netherwold Borough", "Play match", "Back", "Tactics", "4-3-3", "Back", "Play match".
