# Slice 02: League position line per message

**Story:** US-2 (S-011).

**Depends on:** slice 01 (the Inbox and its messages), S-007 (`standings`, ADR-0013), S-009 (`formatOrdinal`).

**Estimate:** about 0.3 day, about 145 changed lines in DELIVER, tests included.
- Code is about 30 lines: the position after each matchday in the selector, and the third line in the Inbox screen.
- Tests are about 115 lines: unit, the oracle sweep and fast-check 90, and e2e 25.

**Release:** these commits follow slice 01's on the same branch and ship in the ONE S-011 merge.

## Goal
Each message gains a third line, "League position" plus the ordinal of the club's Pos right after that matchday. Sam can then see his season climb or slip, with every figure agreeing with the Table and the End of season screen.

## IN
- **Why it is in (S011-H2):** a report that only repeats the match screen's score adds no new information. The position after each matchday is the simplest storyline (the season's trajectory), shown nowhere else (the Table shows only the present), and J-11's "are my decisions paying off" needs it. About 145 lines, no new state. With slice 01 it completes the three-line message the durable list (D7) promises, in the same merge.
- **Third line** of every message, one piece of text (separate from the other two lines, in the same list item): "League position", one space, then "1st" to "8th" (pattern `^League position (1st|2nd|3rd|4th|5th|6th|7th|8th)$`).
- **The figure:** the managed club's Pos in the standings built from the results of matchdays 1..N only, with the Table's own order (Pts, GD, goals scored, name A to Z; ADR-0013), written as "Final position" writes it (`formatOrdinal`).
- **Version-only:** the position values follow the Table's order as S-007 defines it for this version (the tie-breaks). The durable clause is only that a message's position equals the Table's Pos right after that matchday.
- **Newest message:** its position equals the Pos on the "Table" screen now; after matchday 14 it equals "Final position".
- **Older messages** keep the position they had right after their matchday, even when the table has moved since.
- **Derived only, as in slice 01:** the same seed gives the same lines, "?seed=abc" equals no seed, reload and "Continue" change nothing, and tactics changes never change a line.

## OUT
- Movement arrows or "up 2 places" text, points or goal difference in the message, other clubs' positions, a position chart, and storylines.

## Learning hypothesis
If this slice fails, it disproves this: "a position after each matchday is enough for Sam to tell whether his season is on track and whether his decisions are paying off".

## Acceptance (player-facing)
Figures were worked out by hand from the reference season; DISTILL confirms them with the domain code.
- At `?seed=31`, "Netherwold Borough", after 3 matches the Inbox reads, from newest to oldest:
  - "League position 6th" (Matchday 3);
  - "League position 8th" (Matchday 2);
  - "League position 6th" (Matchday 1).

  Each is the Pos the Table showed right after that matchday.
- After 9 matches: "Matchday 9", "Netherwold Borough 3–1 Rushmoor Heath Albion", "League position 2nd". After matchday 10, the newest message reads "League position 4th" and "Matchday 9" still reads "League position 2nd".
- Tie: "Matchday 4" reads "League position 5th". Netherwold Borough is level with Juniper Hollow United on Pts 6, GD 0 and 6 goals, and is listed after it by name, as the Table showed.
- After 14 matches: "Matchday 14", "Tarnbeck Borough 2–1 Netherwold Borough", "League position 3rd", the same as "Final position 3rd".
- At `?seed=abc`, "Oakhampton Rise Borough", one match: "Matchday 1", "Harrowgate Lane United 0–1 Oakhampton Rise Borough", "League position 3rd". It is the same at `/gaffer/` with no seed.

## Developer criteria (not story AC)
- Oracle sweep: over at least seeds 1..100 x 8 clubs x matchdays 1..14 (untouched tactics), the position after N equals an independent sort of the cumulative rows (K2). DISTILL may widen the sweep but never narrow it below that.
- Fast-check (numRuns 100, fresh `FC_SEED`): random formation, pick and "Play match" sequences never change an earlier message's three lines.
- Names check: no generated club or player name holds "League position".
- No new domain rule and no new RNG stream; `src/domain/` stays free of wall-clock time and randomness.

## Demonstrable
`/gaffer/?seed=31`: "New game", "Netherwold Borough", 3 x ("Play match", "Back", "Table", "Back"), "Inbox".
