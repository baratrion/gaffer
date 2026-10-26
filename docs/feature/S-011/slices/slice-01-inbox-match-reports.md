# Slice 01: Inbox screen with match reports

**Story:** US-1 (S-011).

**Depends on:** S-007 (results log), S-008 (14 matchdays, match screen "Matchday N" and score line), S-009 ("End of season", "Play again"), S-010 ("Continue", autosave, `update` as a handler table).

**Estimate:** about 0.7 day, about 360 changed lines in DELIVER, tests included.
- Code is about 115 lines: the `render` lookup refactor 40; the screen kind, action and selector (title and score line) 35; the Inbox screen, the shared score-line element and the club home button 40.
- Tests are about 245 lines: unit and property 130, e2e 95 (only what `tests/protected/S-011/` does not cover), and the D8 button-list amendments 20.

**Release:** this slice is the first set of ordered DELIVER commits of S-011. Slice 02's commits follow on the same branch, and both ship in ONE merge. There is no separate release, so main never gets messages without their "League position" line (durable list D7).

## Goal
The club home offers "Inbox". It opens a list of one read-only message per played matchday, newest first, each with the title "Matchday N" and exactly the score line its match screen showed.

## IN
- **Button:** a sixth club-home button named exactly "Inbox" (44px or taller), after "Table". The other buttons keep their order and names. It is there from the club pick, after matchday 14 (next to "End of season") and after "Continue".
- **Screen:** the only h1 "Inbox", focused on arrival; a list named exactly "Messages"; a button named exactly "Back" (44px or taller) to the club home, with the club's name focused.
- **Messages:** one list item per matchday played, newest first (N items after N matches, N from 0 to 14). Each holds two lines, each one piece of text:
  - "Matchday N", the same text as that match screen's h1;
  - the club's score line for that matchday, exactly the match screen's text (one shared builder).
- **Empty state:** before any match, no item and a line reading exactly "No messages yet" (version-only).
- **Derived only:**
  - no new `GameState` key and no save change;
  - opening the Inbox writes no save;
  - tactics and XI changes never change a message;
  - "New game" or "Play again", then a club, gives an empty Inbox;
  - reload and "Continue" give the same messages.
- **Read-only:** no button or link inside the list.
- **Refactor first:** `render` in `src/main.ts` moves to a lookup before the inbox case is added (S-009 DESIGN Open question 1, deferred by ADR-0016 Decision 4).
- **D8 amendments:** the 8 non-protected e2e five-button lists gain "Inbox" last (replaced, never weakened).

## OUT
- The "League position" line (slice 02).
- Unread markers or badges, other clubs' results, scorers, storylines, tapping a message, deleting messages, and an end-of-season message.

## Learning hypothesis
If this slice fails, it disproves this: "a one-tap, newest-first list of his own results lets Sam pick up the thread of his season after a break without re-opening matches".

## Acceptance (player-facing)
- At `?seed=31`, "New game", "Netherwold Borough":
  - the club home shows "Inbox" after "Table", 44px or taller;
  - "Inbox" shows "Inbox" (focused), an empty "Messages" list and "No messages yet";
  - "Back" returns to "Netherwold Borough", focused.
- After 3 x ("Play match", "Back"), "Inbox" lists, in this order:
  1. "Matchday 3", "Netherwold Borough 2–1 Oakhampton Rise Borough";
  2. "Matchday 2", "Rushmoor Heath Albion 2–1 Netherwold Borough";
  3. "Matchday 1", "Netherwold Borough 1–2 Marlbrook Athletic".

  There are no buttons in the list.
- "Inbox", "Back", "Table": the same cells as before; "Play match" shows "Matchday 4".
- "4-3-3" in "Tactics", then "Inbox": the same messages. A reload, "Continue", "Inbox": the same messages.
- After 14 matches: 14 messages, from "Matchday 14" down to "Matchday 1". Then "End of season", "Play again", "Netherwold Borough", "Inbox": empty, "No messages yet".

## Developer criteria (not story AC)
- Unit:
  - `ViewInbox` is valid only from a known club's home (else no-op), and `Back` returns to the club home;
  - the selector gives N messages newest first, and none for an empty log;
  - the score line equals the match screen's for every recorded matchday;
  - opening the Inbox leaves `formation`, `xi`, `results` and the saved text unchanged.
- Names check: no generated club or player name holds "Inbox", "Messages" or "No messages yet".
- `render` and `update` stay under the lint complexity limit (15).

## Demonstrable
`/gaffer/?seed=31`: "New game", "Netherwold Borough", "Inbox", "Back", 3 x ("Play match", "Back"), "Inbox".
