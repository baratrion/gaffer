# S-011: Read my club's news in the Inbox

Status: DISCUSS done (lean, unattended, revision 2: peer review cycle 1 folded in). DESIGN, DEVOPS, the protected-scenarios step, DISTILL and DELIVER follow.

## Wave: DISCUSS

Lean and unattended. Reuses `discuss/journey.md` and `slices/slice-01..02`. North star: "manage one fictional club through one short season, on a phone browser, start to finish". Vision: 5-minute sessions on the bus. Since S-010 a season spans many sessions. But an already played match can never be re-opened (S-008, S-009), and the Table only shows where the club stands now. So when Sam comes back after "Continue", he cannot re-read how earlier matchdays went or see how his league position has moved. scope.md IN says: "Inbox/news feed with match reports and simple storylines". The smallest next visible increment is a sixth club-home button, "Inbox". It opens a list of messages, one report per matchday played, newest first. Each report gives the matchday, his club's score line and his league position right after that matchday. Everything is derived from the recorded results: there is no match-model change, no new RNG stream, no new `GameState` data and no save-format change. Narrowed by scope.md precedence (ship less): storylines, player form, other clubs' results, scorers, unread markers and tapping a message are cut. Feature type: user-facing. UX depth: lightweight. Walking skeleton: no (brownfield, extends S-001..S-010). JTBD: yes, new job J-11. No DIVERGE artifact (accepted as lean, as for S-002..S-010).

### Wave: DISCUSS / [REF] Scope Assessment
PASS. The story has 2 small user stories with 9 scenarios in total (US-1 has 5, US-2 has 4) and is 1 roadmap story. It adds one button, one screen, one pure selector and one lookup refactor, for one demonstrable outcome: "I look back over my season". US-1 (what happened) and US-2 (where it left the club) are one outcome, because Sam looks back over his season for both answers in one visit; neither one alone is the outcome. It adds no new seam: no storage change, no new RNG stream and no domain change, except perhaps reusing `standings` over part of the results log.

Carpaccio exception (recorded). The 2 slices are ordered DELIVER commits of one story (S-011), shipped in ONE merge: slice 01's commits come first and slice 02's follow on the same branch. Slice 01's two-line message is an intermediate commit state inside that one merge. It is never released and is not a durable state, because main never gets an Inbox whose messages lack the position line that the durable list (D7) promises. So slice 01's learning hypothesis is tested together with slice 02's, in the same merge. About 1 day.

Why the "League position" line is in scope. scope.md IN says "match reports and simple storylines". A report that only repeats the score the match screen already showed adds no new information. Where the club stood after each matchday is the simplest storyline (the season's trajectory), and it is shown nowhere else, because the Table only shows the present. The narrower reading (US-1 only, scores without positions) was considered and rejected: it fails J-11's "are my decisions paying off". The position line costs about 145 lines and no new state (a `standings` over a results prefix, plus `formatOrdinal`, both existing). There are 4 integration points: the club home, the recorded results, the standings, and the S-010 save (read-only: it is unchanged). That is under the limit of 5 integration points that the S-009 and S-010 scope assessments used for a story of this size. No oversized signal: storylines, badges and other clubs' results are cut (Out-of-scope).

Line budget (changed lines, code plus tests). File names are indicative, and DESIGN names the files. The one hard cap is the 1200-line PR guard.

| File | Kind | Lines |
|---|---|---|
| App: `Screen` kind "inbox", the `ViewInbox` action and `Back` through the S-010 handler table, plus a pure inbox selector that builds one message per recorded matchday (title, score line, position after that matchday) (`src/app/state.ts` or a new `src/app/inbox.ts`) | code | 45 |
| `render` switch moved to a lookup, then the inbox case added (`src/main.ts`; S-009 DESIGN Open question 1, deferred in S-010 by ADR-0016 Decision 4) | code | 40 |
| `src/ui/screens/inbox.ts` (new); score-line element shared with `match.ts`; "Inbox" button on the club home; `src/ui/styles.css` | code | 60 |
| `tests/acceptance/S-011/*.test.ts` (selector goldens, position oracle sweep, read-only property, save unchanged, names check) | tests | 220 |
| `tests/e2e/S-011-inbox.spec.ts` (what protected does not cover: "No messages yet", exact item counts, button order, D6 seeds, the save untouched, 390px) | tests | 120 |
| Amended non-protected e2e club-home button lists (D8) | tests | 20 |
| **DELIVER total** (code 145, tests 360) | code and tests | **505** |
| `tests/protected/S-011/*.spec.ts` (written in the plan run, outside DELIVER; estimate) | tests | 220 |
| **Grand total** (with protected) | code and tests | **725** |

### Wave: DISCUSS / [REF] Persona
Sam, 34, a lapsed fan of football management games. He plays on the bus, one-handed, on a mid-range Android phone 390px wide, with 5 minutes to spare (persona from `docs/feature/S-001/feature-delta.md`). A season is 14 matches; he plays two or three per trip and, since S-010, carries on with "Continue" days later. Between trips he forgets how the last matches went and whether his club is climbing or slipping.

### Wave: DISCUSS / [REF] JTBD one-liner
When I come back between matches, I want to look back over how my season has gone, so that I can see whether my decisions are paying off. Recorded as J-11 `follow-my-seasons-story` in `docs/product/jobs.yaml`. It builds on J-07 "see where we stand" and J-10 "carry on my season".

### Wave: DISCUSS / [REF] Glossary
- **Inbox**: the screen opened by the club home's "Inbox" button. Its h1 is "Inbox" and it holds the list "Messages".
- **Message**: one list item of the list named "Messages". It is read-only text: it holds no button, link or nested list (element contract in D4).
- **Matchday report**: the message for one played matchday. It has three lines: the title "Matchday N", the score line, and the "League position" line. In this version every message is a matchday report.
- **Position after matchday N**: the managed club's Pos in the League table built from the recorded results of matchdays 1 to N only, with the Table's own order (ADR-0013), written as an ordinal ("1st" to "8th", as on the End of season screen). It is the Pos the Table screen showed right after matchday N was played.
- **Recorded result**, **Standings**, **Score line**, **Next matchday**, **Saved game**, **Continue**: as in S-006..S-010.

### Wave: DISCUSS / [REF] Locked decisions
- **D1 Button.** The club home gains a sixth button named exactly "Inbox", 44px or taller, placed after "Table". The existing buttons keep their order and names: "Squad", "Tactics", "Starting XI", then "Play match" or "End of season", then "Table". "Inbox" is there from the moment a club is picked, and also after matchday 14 and after "Continue".
- **D2 Screen.** Tapping "Inbox" opens a screen whose only top-level heading (h1) reads exactly "Inbox", focused on arrival. It holds a list named exactly "Messages". A button named exactly "Back", 44px or taller, returns to the club home with focus on its heading, the club's name.
- **D3 One message per matchday played, newest first.** The list holds exactly one message per matchday the season has played so far. The first is the latest matchday played and the last is Matchday 1. After N matches there are N items, N from 0 to 14.
- **D4 Three lines per message.** Each line is read as one piece of text, in this order:
  1. The title "Matchday N", where N is that message's matchday (1 to 14). It is the same text as that match screen's h1.
  2. The score line of the player's club's match on that matchday. It is exactly the same text as that matchday's match screen score line (pattern `^(.+) (\d)–(\d) (.+)$`, en dash), for example "Rushmoor Heath Albion 2–1 Netherwold Borough".
  3. "League position", one space, then the ordinal of the club's Pos after that matchday, one of "1st" to "8th" (pattern `^League position (1st|2nd|3rd|4th|5th|6th|7th|8th)$`), for example "League position 3rd".

  So the newest message's position equals the club's Pos on the "Table" screen now, and after matchday 14 it equals the End of season screen's "Final position". An older message keeps the position it had right after its matchday, even when the table has moved since.

  Element contract (black box): each message is one list item of the list named "Messages". It holds its three lines in this order, each line one child element of the list item whose visible text (innerText) is exactly that line. A message holds no button, link or nested list.
- **D5 Empty state.** Before any match the list holds no item, and a line reading exactly "No messages yet" is shown outside the list. It is shown only while no match has been played, and it is absent once one has. This text is a rule of this version only.
- **D6 Derived only, nothing new stored.**
  - Messages come from the recorded results and the seed. There is no new `GameState` data and no save-format change.
  - The same seed, club and choices give the same Inbox, and "?seed=abc" gives the same Inbox as no seed. After a reload and "Continue" the Inbox shows the same messages.
  - Changing Tactics or the Starting XI never changes a message.
  - "New game" or "Play again", then picking a club, gives an empty Inbox. This per-season reset is a deliberate rule of this version only: the Inbox tells the story of the current season, and "Play again" starts a new season with an empty Inbox, as the Table resets. The trade-off is that there is no history across seasons; that is a later story.
  - Opening the Inbox changes nothing in the game and writes no save (navigation is not saved, S-010).
  - Messages are read-only text: no message is or holds a button or link, and an already played match still cannot be re-opened.
- **D7 Durable list.** These hold in every later version, within each season:
  - the club home offers "Inbox";
  - its screen has the only h1 "Inbox" and a list named "Messages";
  - for each matchday played in the season there is exactly one message whose title line reads "Matchday N", newest first among the matchday messages, with that matchday's score line and its "League position" line in these formats;
  - a message's position equals the Table's Pos right after that matchday;
  - each matchday message is one list item of "Messages" whose lines are separate child elements in this order, and it holds no button, link or nested list;
  - a matchday message never changes once its matchday is played: changing Tactics or the Starting XI does not change it, and after a reload and "Continue" it reads the same.

  Later versions MAY add other kinds of message to the same list (storylines, player form), as long as none of them has a line reading "Matchday N". Rules of this version only: the "No messages yet" text, the exact number of items (as opposed to the number of matchday reports), the position of "Inbox" after "Table", the per-season reset (an empty Inbox after "New game" or "Play again" and a club pick; a later story may keep earlier seasons), and the position values themselves following the Table's order as S-007 defines it for this version (the tie-breaks); the durable clause is only the equality with the Table's Pos in the last bullet above.
- **D8 Amendment (club home).** This version adds a sixth button to the club home. No earlier outcome fixes the number of club-home buttons: S-005..S-010 name the buttons that "stay", never a count. Their durable lists are unchanged.
  - No protected scenario counts the club-home buttons. `tests/protected/S-007`, `S-008` and `S-009` check only that the named buttons are visible.
  - Non-protected tests to amend: each exact five-button list gains "Inbox" last, so they are replaced, never weakened. Their test titles, messages and header comments that say "five" change too. DISTILL fixes the final list (line numbers checked against the tree in this revision):
    - `tests/e2e/S-005-starting-xi.spec.ts`: the exact list at line 176, and the test title at line 173 ("... third of five club home buttons ...");
    - `tests/e2e/S-006-match.spec.ts`: the exact list at line 148, and the test title at line 145 ("... fourth of five club home buttons ... all five are 44px or taller");
    - `tests/e2e/S-007-table.spec.ts`: the test "The club home has five buttons ..." at line 225 (title) and its exact list at line 228;
    - `tests/e2e/S-007-club-home-regression.spec.ts`: `toHaveLength(5)` and its message "exactly five club home buttons" at line 24, and the header comment at line 5 ("requires exactly five club-home buttons");
    - `tests/e2e/S-008-club-home-regression.spec.ts`: the exact five-button list assertion at line 25, the test title at line 11 ("Five buttons and ...") and the header comment at line 3;
    - `tests/e2e/S-008-season.spec.ts`: the exact list at line 252 (and its message "five buttons: ...") and the `.club-actions` children at line 254;
    - `tests/e2e/S-009-club-home-regression.spec.ts`: the exact five-button list assertion at line 46 and the header comment at line 3;
    - `tests/e2e/S-009-end-of-season.spec.ts`: the exact list at line 137 (and its message "five buttons in ...") and the `.club-actions` children at line 139.
  - Before DELIVER, DISTILL greps `tests/` (outside `tests/protected/`) for "five" and for the exact five-button lists, including `tests/e2e/S-010-club-home-regression.spec.ts` (checked in this revision: it holds no such list, but it exercises the club home), so that no amended list is missed.
- **D9 Protected pin list.** The plan run's protected-scenarios step writes these later. Each must fail on today's app, which has no "Inbox". The pins check only the durable list (D7) and the conventions every story pins (buttons 44px or taller, "Back" to the club home with its h1 focused, focus on the new h1, no horizontal scroll at 390px, no console errors): they count the messages that have a line reading "Matchday N", never all items; they check order only among those messages; and they do not check "No messages yet" or where "Inbox" sits among the buttons.
  - **P1:** at `?seed=31`, "New game", then the first club. The club home has an "Inbox" button 44px or taller. "Inbox" shows the h1 "Inbox", focused and the only h1, and a list "Messages" with no message that has a "Matchday N" line. "Back" returns to the club home with its h1 (the club's name) focused.
  - **P2:** at `?seed=31`, 3 times "Play match", reading the h1 and the score line, then "Back", "Table", reading the club's Pos, then "Back". "Inbox" shows 3 matchday reports in the order "Matchday 3", "Matchday 2", "Matchday 1". Each has the score line read on that match screen and "League position" with the ordinal of the Pos read right after it. The list holds no button and no link.
  - **P3:** at `?seed=31`, all 14 matchdays played, then "End of season" with its "Final position" read. "Inbox" shows 14 matchday reports, the first "Matchday 14" and the last "Matchday 1", and the first one's position line equals "League position" plus the Final position value. (The per-season reset after "Play again" is a rule of this version only, so it is checked in the non-protected e2e, not pinned.)
  - **P4:** at `?seed=31`, 2 matches played and the Inbox texts read. Then "4-3-3" in "Tactics": the Inbox reads the same. Then a reload, "Continue", "Inbox": it reads the same again.
  - In all of them: no horizontal scroll at 390px and no console errors. Locators use `exact: true` ("Inbox", "Back", "Continue", "New game", "Play again", the h1).
- **D10 Phone first and regression.**
  - Buttons are 44px or taller, with no horizontal scroll at 390px (long score lines wrap) and no console errors.
  - Text goes through `el()`/`textContent` (ADR-0002), and focus goes to the new h1 after every navigation (ADR-0008).
  - Every S-001..S-010 protected scenario stays green.
  - Deterministic game logic is unaffected: the Inbox only reads recorded results, and nothing in it uses wall-clock time or randomness.

### Wave: DISCUSS / [REF] Story map and priority
Backbone: open the game (Continue or New game), pick club, club home, squad, tactics, starting XI, play next match, see table, **look back (Inbox)**, end of season, play again. Walking skeleton: the existing S-001..S-010 loop. This story adds a "look back" step next to "see table". There is one release with two thin slices: ordered DELIVER commits of one story, shipped in ONE merge.
1. `slices/slice-01-inbox-match-reports.md` (US-1): the "Inbox" button, the screen, its h1 and list, one report per matchday played, newest first, with title and score line, the empty state, and "Back". Value 4 x urgency 4 / effort 1 = 16. It comes first because it is the "re-read how it went" promise itself.
2. `slices/slice-02-league-position-line.md` (US-2): the "League position" line per message, using the standings after each matchday. Value 4 x 4 / 0.5 = 32, but it depends on slice 01. Without it the Inbox only repeats scores the match screens showed; the position after each matchday is the season's trajectory (climbing or slipping), shown nowhere else (Scope Assessment).

Priority rationale: S-010 made the season span many sessions, but a played match can never be re-opened and the Table shows only today. So Sam comes back after "Continue" with no memory of the season's shape. The Inbox is the remaining scope.md IN item that is (a) derived only from facts already recorded, so there is no match-model change, no new RNG stream and no save-format bump, and (b) about the whole season, which is the J-08/J-10 thread of the last three stories. Rejected alternatives:
- **Quick-sim commentary and basic stats (shots, possession, cards) first.** They are the other remaining scope.md IN item, but they deepen one match rather than the season across sessions. They need a match-model extension (new events, likely a new stream). They also need either a save-format bump (`SAVE_VERSION`, ADR-0016), so that results already saved can show their stats, or recorded stats that older saves lack. More risk, more lines, and it fits better once the Inbox has made matches re-readable.
- **Storylines or player form in the Inbox now.** They need rules for what counts as a story; a later story can add them to the same list (D7).
- **Unread markers or a badge count on "Inbox".** They need stored read state, which means a save-format change. Later.
- **Other clubs' results in each message.** More text per message on a 390px phone, and not Sam's job ("how has my season gone"). Later.
- **Tapping a message to re-open its match screen.** S-008/S-009 say an already played match cannot be re-opened (a version-only rule of those stories, which this story keeps), and it needs a new screen state. Later.

Carpaccio exception: slice 01 alone would leave a two-line message, which is an intermediate commit state inside the one DELIVER merge. It is never released and is not a durable state. Slice 01's learning hypothesis is tested with slice 02's, in that same merge.

Slice-to-clause map (one roadmap outcome, two slices, one merge):

| Outcome clause | Slice | Durable or version-only |
|---|---|---|
| "Inbox" (44px or taller) on the club home from the club pick, after matchday 14 and after "Continue" | 01 | durable (the offer) |
| "Inbox" placed after "Table", the other buttons unchanged in order | 01 | version-only (placement) |
| Only h1 "Inbox", focused; list "Messages"; "Back" to the club home, heading focused | 01 | durable |
| One message per matchday played, newest first, title "Matchday N", the match screen's score line | 01 | durable |
| Exactly N items after N matches | 01 | version-only (exact count) |
| "No messages yet" outside the list before any match, absent after the first | 01 | version-only |
| Element contract: a message is one list item holding three separate lines (innerText exact), no button, link or nested list | 01 (two lines), 02 (the third) | durable |
| "League position" line: position right after that matchday; newest equals the Table, matchday 14 equals "Final position" | 02 | durable (the equality with the Table's Pos); the position values follow the Table's tie-breaks as S-007 defines them: version-only |
| Derived only: same seed same Inbox, reload and Continue the same, tactics never change a message, a new game gives an empty Inbox (per-season reset, D6), nothing saved, read-only | 01, 02 | durable |
| No horizontal scroll at 390px, no console errors | 01, 02 | durable |

### Wave: DISCUSS / [REF] User stories
Fixtures come from the real generator, read from `docs/feature/S-008/discuss/reference-season.md` and S-009's `discuss/reference-season-end.md`, with untouched tactics (every side plays the automatic 4-4-2). At `?seed=31`, "Netherwold Borough" is 1st in the "Clubs" list. Its 14 matchdays, with the position after each:

| N | Score line | Position after N |
|---|---|---|
| 1 | Netherwold Borough 1–2 Marlbrook Athletic | 6th |
| 2 | Rushmoor Heath Albion 2–1 Netherwold Borough | 8th |
| 3 | Netherwold Borough 2–1 Oakhampton Rise Borough | 6th |
| 4 | Valebridge Albion 1–2 Netherwold Borough | 5th |
| 5 | Netherwold Borough 1–0 Fennimore Town | 3rd |
| 6 | Juniper Hollow United 2–0 Netherwold Borough | 3rd |
| 7 | Netherwold Borough 2–4 Tarnbeck Borough | 5th |
| 8 | Marlbrook Athletic 1–2 Netherwold Borough | 4th |
| 9 | Netherwold Borough 3–1 Rushmoor Heath Albion | 2nd |
| 10 | Oakhampton Rise Borough 1–1 Netherwold Borough | 4th |
| 11 | Netherwold Borough 2–0 Valebridge Albion | 4th |
| 12 | Fennimore Town 2–2 Netherwold Borough | 4th |
| 13 | Netherwold Borough 1–0 Juniper Hollow United | 3rd |
| 14 | Tarnbeck Borough 2–1 Netherwold Borough | 3rd |

The positions were worked out by hand in this DISCUSS from the reference matchdays, using the Table's order (Pts, GD, goals scored, then name A to Z). They agree with S-010's checked table after matchday 2 (8th) and with "Final position 3rd" after matchday 14. DISTILL confirms them with the domain code. Three of them rest on the name tie-break:
- after matchday 4, Netherwold Borough and Juniper Hollow United are level on Pts 6, GD 0 and 6 goals, and Juniper Hollow United is listed first, so Netherwold Borough is 5th;
- the same happens after matchday 5, so Netherwold Borough is 3rd behind Juniper Hollow United;
- after matchday 7, Netherwold Borough is level with Rushmoor Heath Albion on Pts 9, GD -3 and 9 goals, and is listed first, so it is 5th.

At the default seed 20260 (`?seed=abc` or no seed), "Oakhampton Rise Borough" plays "Matchday 1": "Harrowgate Lane United 0–1 Oakhampton Rise Borough", and is 3rd after it, behind Juniper Hollow Rovers (+2, 3 goals) and Ironbridge Fen Wanderers (+2, 2 goals).

#### US-1: Re-read how my season's matches went
**Problem:** Sam played matchdays 1 to 3 on Monday's bus and taps "Continue" on Wednesday. The club home offers "Play match" for matchday 4, but he cannot remember whether he beat Oakhampton Rise Borough or by how much. An already played match can never be re-opened, and the Table gives totals, not matches. To answer "how did the last games go?" he would have to have written the scores down.
**job_id:** J-11

##### Elevator Pitch
- Before: the club home "Netherwold Borough" offers "Play match" (Matchday 4), but matchdays 1 to 3 are gone from view: a played match cannot be re-opened, and "Table" shows only totals (P 3, Pts 3).
- After: Sam taps "Inbox" on the club home and sees the screen "Inbox" (focused) with a list "Messages" of 3 messages, newest first: "Matchday 3 / Netherwold Borough 2–1 Oakhampton Rise Borough", "Matchday 2 / Rushmoor Heath Albion 2–1 Netherwold Borough", "Matchday 1 / Netherwold Borough 1–2 Marlbrook Athletic".
- Decision enabled: keep the eleven that just won matchday 3, or change it after two defeats in the first two?

**Domain examples**
1. At `?seed=31`, "New game", then "Netherwold Borough". The club home shows "Squad", "Tactics", "Starting XI", "Play match", "Table" and "Inbox". "Inbox" shows "Inbox" (focused), an empty "Messages" list and "No messages yet". "Back" returns to "Netherwold Borough" (focused).
2. After 3 x ("Play match", "Back"), "Inbox" lists 3 messages: "Matchday 3" with "Netherwold Borough 2–1 Oakhampton Rise Borough", then "Matchday 2" with "Rushmoor Heath Albion 2–1 Netherwold Borough", then "Matchday 1" with "Netherwold Borough 1–2 Marlbrook Athletic". Each score line is exactly the text its match screen showed. Tapping a message does nothing: it is text, not a button.
3. On Wednesday, Sam reloads and taps "Continue", then "Inbox": the same 3 messages. He switches to "4-3-3" in "Tactics": the Inbox still reads the same 3 messages, because what was played is never rewritten.
4. After all 14 matchdays the Inbox lists 14 messages, from "Matchday 14", "Tarnbeck Borough 2–1 Netherwold Borough", down to "Matchday 1". After "End of season", "Play again" and "Netherwold Borough", the Inbox is empty again ("No messages yet").

**Acceptance criteria (embedded UAT)**
```gherkin
Scenario: The club home offers an Inbox that is empty before the first match
  Given Sam at "?seed=31" has tapped "New game" and "Netherwold Borough"
  Then the club home has a button named "Inbox", 44px or taller, after the button named "Table"
  When Sam taps "Inbox"
  Then the only h1 is "Inbox" and it has focus
  And the list named "Messages" holds no item
  And a line reads "No messages yet"
  When Sam taps "Back"
  Then the heading "Netherwold Borough" is the only h1 and has focus

Scenario: Every played matchday leaves one report, newest first, with its match's score line
  Given Sam at "?seed=31" managing "Netherwold Borough" has tapped "Play match" and "Back" 3 times, reading each match screen's h1 and score line
  When Sam taps "Inbox"
  Then the list named "Messages" holds 3 items
  And the items' title lines read "Matchday 3", "Matchday 2" and "Matchday 1", in this order
  And each item's score line reads the same as the score line of the match screen with the same h1
  And no item holds a button, a link or a nested list

Scenario: Reading the Inbox changes nothing in the season
  Given Sam at "?seed=31" managing "Netherwold Borough" has played 3 matches and read every row of "Table"
  When Sam taps "Inbox", "Back" and "Table"
  Then every row reads the same, cell for cell
  When Sam taps "Back" and "Play match"
  Then the screen title is "Matchday 4"

Scenario: The Inbox survives a team change and a reload
  Given Sam at "?seed=31" managing "Netherwold Borough" has played 2 matches and read the 2 messages in "Inbox"
  When Sam taps "Back", taps "Tactics", chooses "4-3-3", taps "Back" and "Inbox"
  Then the 2 messages read the same, line for line
  When Sam reloads the page, taps "Continue" and "Inbox"
  Then the 2 messages read the same, line for line

Scenario: A new season starts with an empty Inbox
  Given Sam at "?seed=31" managing "Netherwold Borough" has played all 14 matches
  And "Inbox" lists 14 messages, the first titled "Matchday 14" and the last "Matchday 1"
  When Sam taps "Back", "End of season", "Play again", "Netherwold Borough" and "Inbox"
  Then the list named "Messages" holds no item
  And a line reads "No messages yet"
```
Notes: scenario 1 is pin P1 (without "after Table" and "No messages yet", which are version-only, D9). Scenario 2 is part of P2, scenario 4 is P4, and scenario 5 is part of P3 (counting matchday reports only). Scenario 3 and the exact counts are e2e and unit tested. Unit:
- `ViewInbox` is valid from a known club's home only (else no-op), and `Back` from the Inbox goes to the club home;
- the selector gives N messages after N matchdays, newest first, and none for an empty log;
- the score-line text equals the match screen's for every recorded matchday;
- opening the Inbox and going back leave `formation`, `xi` and `results` the same objects, and the saved text the same.

**Outcome KPI:** K1, plus the guardrails K2 and K3 (below).
**Technical notes (for DESIGN, not AC):**
- The Inbox is a selector over `GameState.results` (ADR-0012, ADR-0014) and the managed club (the screen's `clubId`). No new `GameState` key: `tests/acceptance/S-009/existing-navigation-unchanged.test.ts` asserts the state holds only `league`, `screen`, `formation`, `xi` and `results`. No save change (ADR-0016): the S-010 autosave compares the encoded projection, which navigation does not change.
- The score-line text must have a single source shared with the match screen (today it is built inside `src/ui/screens/match.ts`), so the two can never differ.
- `render` in `main.ts` is at the complexity limit (15 of 15). S-009 DESIGN said the next story that adds a screen must first move it to a lookup (deferred in S-010 by ADR-0016 Decision 4). `update` is already a handler table (S-010), so `ViewInbox` costs one entry.
- Depends on S-007, S-008, S-009 and S-010.

#### US-2: See how my league position moved
**Problem:** Sam's season is a story of climbing and slipping: 8th after two defeats, 2nd after matchday 9. The Table only shows where Netherwold Borough stands today. Whether sticking with his eleven after the 2–4 defeat on matchday 7 paid off depends on where the club stood before and after, and he has no way to see that.
**job_id:** J-11

##### Elevator Pitch
- Before: "Table" shows Netherwold Borough 2nd after 9 matches, but not that it was 8th after matchday 2 and 5th after matchday 7. The climb exists only in his memory.
- After: Sam taps "Inbox". Each message ends with its position line, for example "Matchday 9 / Netherwold Borough 3–1 Rushmoor Heath Albion / League position 2nd", and further down "Matchday 7 / Netherwold Borough 2–4 Tarnbeck Borough / League position 5th" and "Matchday 2 / ... / League position 8th".
- Decision enabled: is my season on track (5th after matchday 7, 2nd after matchday 9), so I keep this team sheet, or is it slipping, so I change it before the next match?

**Domain examples**
1. At `?seed=31`, after matchdays 1, 2 and 3 the Table showed Netherwold Borough 6th, then 8th, then 6th. The Inbox reads "League position 6th" under "Matchday 3", "League position 8th" under "Matchday 2" and "League position 6th" under "Matchday 1".
2. After 9 matches the newest message is "Matchday 9", "Netherwold Borough 3–1 Rushmoor Heath Albion", "League position 2nd", equal to the Table now. Sam plays matchday 10 ("Oakhampton Rise Borough 1–1 Netherwold Borough"). The newest message reads "League position 4th", while "Matchday 9" still reads "League position 2nd": an older message keeps where the club stood then.
3. Tie (boundary): after matchday 4, Netherwold Borough and Juniper Hollow United are level on Pts, GD and goals scored. The Table listed Juniper Hollow United first, so "Matchday 4" reads "League position 5th", exactly as the Table showed then.
4. After matchday 14 the newest message reads "Matchday 14", "Tarnbeck Borough 2–1 Netherwold Borough", "League position 3rd", the same ordinal as "Final position 3rd" on "End of season".
5. At `?seed=abc`, "Oakhampton Rise Borough", one match: "Matchday 1", "Harrowgate Lane United 0–1 Oakhampton Rise Borough", "League position 3rd". It is the same in a second fresh browser at `/gaffer/` with no seed.

**Acceptance criteria (embedded UAT)**
```gherkin
Scenario: Each report shows where the club stood right after its matchday
  Given Sam at "?seed=31" managing "Netherwold Borough" has, 3 times, tapped "Play match", "Back" and "Table", read the Pos of the "Netherwold Borough" row, and tapped "Back"
  When Sam taps "Inbox"
  Then each message's last line reads "League position" followed by the ordinal of the Pos read right after its matchday
  And the first message's position is the club's Pos on the "Table" screen now

Scenario: An older report keeps its position after the table has moved
  Given Sam at "?seed=31" managing "Netherwold Borough" has played 9 matches
  And the "Matchday 9" message reads "League position 2nd"
  When Sam taps "Back", "Play match", "Back" and "Inbox"
  Then the first message is titled "Matchday 10" and reads "League position 4th"
  And the "Matchday 9" message still reads "League position 2nd"

Scenario: After the last matchday the newest report agrees with the final position
  Given Sam at "?seed=31" managing "Netherwold Borough" has played all 14 matches and read the "Final position" line of "End of season"
  When Sam taps "Back" and "Inbox"
  Then the first message is titled "Matchday 14"
  And its last line reads "League position" followed by the Final position's ordinal

Scenario: The same league gives the same Inbox
  Given Sam opens "/gaffer/?seed=abc", taps "New game", "Oakhampton Rise Borough", "Play match", "Back" and "Inbox"
  Then the one message reads "Matchday 1", "Harrowgate Lane United 0–1 Oakhampton Rise Borough" and "League position 3rd"
  And a fresh browser at "/gaffer/" with the same taps shows the same message
```
Notes:
- Scenario 1 is the rest of pin P2, and scenario 3 is the rest of P3. Scenarios 2 and 4 are e2e and unit tested; their figures are from the hand-derived table above, which DISTILL confirms.
- Unit and property: the position after matchday N equals the managed club's `position` in `standings(clubs, results with matchday <= N)`, checked against an independent oracle that sorts the cumulative rows with the ADR-0013 order. It runs over at least seeds 1..100 x 8 clubs x matchdays 1..14 with untouched tactics; DISTILL may widen the sweep but never narrow it below that (K2).
- Fast-check (numRuns 100, fresh `FC_SEED`) over random formation, pick and "Play match" sequences: messages never change when tactics change after a match.

**Outcome KPI:** K1, plus the guardrail K2 (below).
**Technical notes (for DESIGN, not AC):**
- Position after N: `standings` (ADR-0013) over the prefix of `results` with matchday <= N, plus `formatOrdinal` (S-009, `standings.ts`). Both already exist, so there is no new domain rule and the tie-breaks are exactly the Table's.
- Cost: at most 14 standings over at most 56 results each, which is negligible on a phone. DESIGN decides whether to fold cumulatively.
- Depends on US-1.

Notes for DESIGN and DISTILL (not part of the AC):
- "Has focus" means `document.activeElement` is the `<h1>`. Locators use `exact: true` for "Inbox", "Back", "Continue", "New game", "Play again", "End of season", "Play match" and the h1.
- "Read as one piece of text": each of the three lines is one element whose `textContent` and `innerText` read the exact line, as with S-009's season lines (inline flow only, no generated content). The element contract of D4 applies: a message is one list item, its three lines are separate pieces of text, and it holds no button, link or nested list. Message titles may be plain text or sub-headings (DESIGN decides). The pins check only that "Inbox" is the only h1, never the total number of headings.
- Names check: no generated club or player name holds "Inbox", "Messages", "League position" or "No messages yet".
- A protected season is 28+ taps: one seed per scenario, and `test.setTimeout(90_000)` as headroom (S-008..S-010 precedent).

### Wave: DISCUSS / [REF] Outcome KPIs
K1 is the one user outcome KPI. K2 and K3 are CI guardrails: they keep the KPI honest, and they do not measure behaviour.

| # | Kind | Who | Does what | By how much (target) | Baseline | Measured by |
|---|---|---|---|---|---|---|
| K1 | User outcome KPI | Sam on a 390px phone, mid-season, after "Continue" | Re-reads how any played matchday went and where his club stood after it | 1 tap from the club home ("Inbox") for every matchday 1..N at once, 2 taps from the title ("Continue", "Inbox") | Impossible: a played match cannot be re-opened and the Table shows only today; the path must be remembered | e2e tap counter (as S-003..S-010) |
| K2 | CI guardrail | the CI run | Proves the Inbox agrees with the game | 0 differences between message N and match screen N (h1 and score line) and between its position and the Table's Pos after matchday N, over the oracle sweep (at least seeds 1..100 x 8 clubs x 14 matchdays; widen, never narrow) | n/a (no Inbox) | selector goldens, the oracle property test, pins P2, P3 |
| K3 | CI guardrail | the CI run | Proves the Inbox never changes the game | 0 changes to `formation`, `xi`, `results` or the saved text from opening the Inbox and going back, over 100 fast-check runs; 0 message changes after tactics changes | n/a | fast-check property, pin P4, e2e storage check |

Other guardrails:
- S-001..S-010 protected scenarios stay green.
- The league, squads, schedule, every result, the save format and the S-006..S-010 goldens are unchanged for every seed.
- No ambient randomness or wall-clock time in `src/domain/` or in the selector.
- No sideways scroll at 390px with the longest score lines (the longest club names the generator makes; DISTILL picks the seed by sweeping the generator), and 0 console errors.
- No analytics in the POC. The owner's Friday demo is a qualitative check outside CI and not part of K1's measured target: the owner continues a season, tells its story from the Inbox, and states the club's position path (for example "8th after two, 2nd after nine") from the Inbox alone.

### Wave: DISCUSS / [REF] DoD
- `tests/protected/S-011/` passes on main. This plan run's protected-scenarios step writes it from the D9 pin list. It is append-only and does not exist before that step.
- Precondition of the first DELIVER commit: the RED commit of `tests/protected/S-011/` (written in this plan run) is on main. DELIVER does not start without it.
- `tests/protected/S-001/` to `S-010/` still pass on the DELIVER branch.
- Unit and property tests pass for the intents above: selector goldens, the position oracle sweep, read-only and save-unchanged properties, tactics changes, and the names check. The `ci:*` scripts are green.
- The e2e phone smoke covers: the button and its height; the Inbox h1 and focus; "No messages yet"; the exact counts and order after 3 and 14 matches; the seed-31 figures above; D6 ("?seed=abc" equals no seed, reload and Continue, the stored "gaffer.save" text unchanged by opening the Inbox); no sideways scroll at 390px; 0 console errors.
- The D8 amendments replace, never weaken: each five-button list becomes the six-button list. No other S-001..S-010 acceptance assertion is edited.
- `render` is moved to a lookup before the inbox case is added, and lint complexity stays under 15.
- Slices 01 and 02 are ordered commits in one DELIVER merge, under the 1200-line PR guard: about 676 lines, and about 896 with the protected file (the DESIGN re-estimate in its Changed Assumptions; the first DISCUSS estimate was 505 and 725).

### Wave: DISCUSS / [REF] Out-of-scope
- Unread markers, badges or counts on the "Inbox" button (stored read state, a save change); storylines, player form or any other kind of message; other clubs' results; scorers or goals inside a message; tapping a message to open its match; deleting or archiving messages; a "season over" or end-of-season message; board or staff messages (`staff` is OUT); notifications; quick-sim commentary and stats (a later story).
- Every OUT tag: `match-2d`, `utility-ai`, `transfers`, `finances`, `training`, `youth`, `staff`, `multiplayer`, `backend`, `real-data`.

### Wave: DISCUSS / [REF] WS strategy
No new walking skeleton (brownfield). The story adds one button, one screen and one pure selector over data the game already records. The e2e journey "New game, club, 3 x (Play match, Back, Table, Back), Inbox, Back" is the end-to-end proof. Two carpaccio slices in order (`slices/slice-01..02`), both delivered in the one S-011 DELIVER.

### Wave: DISCUSS / [REF] Driving ports
- UI entry, by role and accessible name, at `http://localhost:4173/gaffer/` (the built app):
  - the club home's button "Inbox";
  - the Inbox screen: h1 "Inbox", the list "Messages" and its list items, the line "No messages yet", and "Back";
  - as in S-001..S-010: "Table", "Tactics", "Play match", "End of season", "Play again", "Continue", and `page.reload()`.
- In-process, for unit and property tests:
  - `update` (`ViewInbox`, `Back`);
  - the pure inbox selector (state and club to messages);
  - `standings` over a prefix of the results;
  - `formatOrdinal`;
  - the S-010 save projection (unchanged by navigation).

### Wave: DISCUSS / [REF] Pre-requisites
- S-001..S-010 are delivered:
  - the `results` log, `nextMatchday`, `standings`/`standingsOf` and `formatOrdinal`;
  - "New game" and "Play again" through `NewGame`;
  - the S-010 autosave and "Continue";
  - `update` as a handler table.
- ADR-0001..0016 are accepted.
- **`render` must move to a lookup first.** S-009 DESIGN Open question 1 says the `render` switch in `src/main.ts` is at the complexity limit (15 of 15) and that the next story adding a screen must move it to a lookup. S-010 deferred this (DESIGN D5, ADR-0016 Decision 4). This story's DESIGN must do it before adding the inbox case.
- `docs/product/jobs.yaml` now has J-11 (done in this run). Roadmap entry S-011 is appended from the draft below (done in this run).
- `tests/protected/S-011/` is written by this plan run's protected-scenarios step from the D9 pin list, after this DISCUSS (append-only). It is not claimed to exist yet. Its RED commit on main is a precondition of the first DELIVER commit.
- D8 lists the non-protected e2e tests that DELIVER amends.

### Wave: DISCUSS / [REF] Roadmap outcome (draft)
From the club home screen the player taps a button named exactly "Inbox" (44px or taller), placed after "Table". The club home's heading (the club's name) and its buttons "Squad", "Tactics", "Starting XI", "Play match" (or, once all 14 matchdays are played, "End of season") and "Table" stay, in this order. "Inbox" is there from the moment a club is picked, also after matchday 14 and after "Continue". Tapping "Inbox" opens a screen whose only top-level heading (h1) reads exactly "Inbox", focused on arrival, with a list named exactly "Messages". The list holds exactly one message per matchday the season has played so far, newest first: after N matches (N from 0 to 14) it holds N items, the first for matchday N and the last for matchday 1. Each message is one list item of that list. It holds three lines in this order, each one child element of the list item whose visible text (innerText) is exactly that line, and it holds no button, link or nested list. First, the title "Matchday N" (N from 1 to 14): the same text as the h1 of that matchday's match screen. Second, the score line of the player's club's match on that matchday: exactly the same text as that match screen's score line (pattern ^(.+) (\d)–(\d) (.+)$, with an en dash), for example "Rushmoor Heath Albion 2–1 Netherwold Borough". Third, "League position" and one space and the ordinal of the club's Pos in the table named "League table" right after that matchday was played (pattern ^League position (1st|2nd|3rd|4th|5th|6th|7th|8th)$), for example "League position 3rd". So the newest message's position equals the club's Pos on the "Table" screen now, and after matchday 14 the "Final position" on the "End of season" screen. An older message keeps the position the "Table" screen showed right after its matchday. Before the first match the list holds no item and a line reading exactly "No messages yet" is shown outside the list; once a match has been played that line is absent. An already played match still cannot be re-opened. A button named exactly "Back" (44px or taller) returns to the club home with focus on its heading, the club's name. Everything in the Inbox comes from the season's recorded results and the seed, and nothing new is stored (the saved game is unchanged). Two fresh visits with the same "?seed=", club and choices show the same Inbox, "?seed=abc" shows the same Inbox as no "?seed=", and after a reload and "Continue" the Inbox shows the same messages. Changing "Tactics" or the "Starting XI" never changes a message. In this version the Inbox tells the story of the current season only: "New game" or "Play again", then picking a club, gives an empty Inbox. Opening the Inbox changes nothing in the game and saves nothing. This version adds a sixth button to the club home; the S-005 to S-010 outcomes name the buttons that stay but never fix their number, and their durable lists are unchanged. These hold in every later version, within each season: the club home offers "Inbox"; its screen has the only h1 "Inbox" and a list named "Messages"; for each matchday played there is exactly one message whose title line reads "Matchday N", newest first among the matchday messages, with that matchday's score line and its "League position" line in these formats; a message's position equals the Table's Pos right after that matchday; each matchday message is one list item of "Messages" whose lines are separate child elements in this order, holding no button, link or nested list; and a matchday message never changes once played: changing "Tactics" or the "Starting XI" does not change it, and after a reload and "Continue" it reads the same. Later versions may add other kinds of message to the same list, as long as none has a line reading "Matchday N". The "No messages yet" line, the exact number of items, the place of "Inbox" after "Table", the empty Inbox after "New game" or "Play again" (a later version may keep earlier seasons), and the order of tied clubs behind the position values (the Table's tie-breaks as S-007 defines them for this version) are rules of this version only. No horizontal scroll at 390px and no console errors.

### Wave: DISCUSS / [REF] DoR validation
| # | Item | Status | Evidence |
|---|---|---|---|
| 1 | Problem clear, domain language | PASS | US-1: after "Continue", a played match cannot be re-opened and the Table gives only totals, so Sam cannot re-read how matchdays 1 to 3 went. US-2: the Table shows only today, so the climb or slide of his season, and whether his changes paid off, is lost |
| 2 | Persona specific | PASS | Sam, 34, one-handed on a bus, 390px Android, 5 minutes, two or three matches per trip, continuing days later (S-010) |
| 3 | 3+ domain examples, real data | PASS | Real generator output (`S-008/discuss/reference-season.md`): the seed-31 Netherwold Borough score lines for matchdays 1 to 14, with positions hand-derived from them and anchored to S-010's checked table after matchday 2 and "Final position 3rd"; the matchday-4 name tie; the seed-20260 Oakhampton Rise Borough matchday 1. US-1 has 4 examples, US-2 has 5 |
| 4 | UAT Given/When/Then, 3-7 | PASS | 9 for S-011 (US-1 5, US-2 4). Every Given and When is a tap sequence or a reload on the real app; every Then reads only what an earlier step read, a fixed label, or a hand-derived figure that DISTILL confirms |
| 5 | AC derived from UAT | PASS | Project convention since S-001: the AC are the embedded Gherkin scenarios. D1, D2 and D5 are in US-1 scenario 1; D3 in US-1 scenarios 2 and 5; D4 in US-1 scenario 2 and US-2 scenarios 1 to 3; D6 in US-1 scenarios 3 to 5 and US-2 scenario 4; D7 to D10 are covered by the pin list, unit tests, e2e and review |
| 6 | Right-sized | PASS | 2 slices (ordered commits, one merge) in about 1 day; about 676 changed lines in DELIVER including tests, about 896 with the protected file (DESIGN re-estimate; first DISCUSS estimate 505 and 725), under the 1200-line PR guard; one outcome |
| 7 | Technical notes | PASS | Per story: a selector over `results` with no new `GameState` key (the five-key test) and no save change (ADR-0016); one score-line source shared with the match screen; the `render` lookup first; `standings` over a results prefix plus `formatOrdinal` |
| 8 | Dependencies tracked | PASS | S-001..S-010 delivered. The `render` lookup is a prerequisite (S-009 DESIGN Open question 1). D8 lists the 8 non-protected e2e files with five-button lists (lines, titles and header comments verified by grep); no protected scenario counts the club-home buttons. J-11 added. `tests/protected/S-011/` follows from this plan run's protected-scenarios step; its RED commit on main is a precondition of the first DELIVER commit |
| 9 | Outcome KPI measurable (feature-specific addition to the 8-item checklist) | PASS | K1, the user KPI: 1 tap from the club home to every matchday's report and position (e2e tap counter; the Friday demo is a qualitative check outside CI). Guardrails: K2, 0 disagreements with the match screens and the Table over the oracle sweep; K3, 0 state or save changes from opening the Inbox over 100 fast-check runs |

DoR status: PASSED (both stories). Every story has `job_id` J-11 and an Elevator Pitch.

### Wave: DISCUSS / [REF] Peer review
Status: **conditionally approved after cycle 2 of 2; every cycle-2 finding folded in by the orchestrator (no further cycle allowed)**. Cycle 1 of the `nw-product-owner-reviewer` (at most 2 cycles) returned `rejected_pending_revisions`. Resolutions:
- **S011-H1 (high):** the element contract is in the roadmap outcome and D4, in black-box words (a message is one list item of "Messages", three separate lines with exact innerText, no button, link or nested list; "No messages yet" outside the list, only while no match has been played). Also in D5, the glossary, the slice map, the US-1 scenario, the DESIGN/DISTILL notes, slice 01 and the journey. The outcome was tightened to compensate.
- **S011-H2 (high):** the position line stays. Scope Assessment and the story map justify it (a score-only report adds no information, the position trajectory is the simplest storyline and is shown nowhere else; the US-1-only reading was rejected as it fails J-11; about 145 lines, no new state). The circular "durable list would be incomplete" argument is removed.
- **S011-M1:** slice 01's two-line message is marked an intermediate commit state in the one merge; its hypothesis is tested with slice 02's; the carpaccio exception is in Scope Assessment, the story map, and slice 01.
- **S011-M2:** D7, the outcome and slice 02 list the position values (tie-breaks, S-007's order) as version-only; the durable clause is the equality with the Table's Pos.
- **S011-M3:** D8 is corrected from grep: the exact five-button lists at S-008-club-home-regression:25 and S-009-club-home-regression:46, the test titles at S-005:173 and S-006:145, the header comments at line 3 of S-008/S-009 (and line 5 of S-007's), and DISTILL greps `tests/` for "five" and the exact lists, S-010 regression included.
- **S011-M4:** the per-season reset is a deliberate rule in D6, the outcome, journey step 9, slice 01 and J-11's emotional dimension (no history across seasons; a later story).
- **S011-M5:** K2's oracle sweep has a fixed minimum (seeds 1..100 x 8 clubs x 14 matchdays); the Friday demo is a qualitative check outside CI and not part of K1's target.
- **S011-L1:** "newest first among the matchday messages" in the durable clause. **L2:** "reverses" reworded as a version-only rule of S-008/S-009. **L3:** the persona is "a lapsed fan of football management games". **L4:** covered by H1. **L5:** "the longest club names the generator makes", DISTILL picks the seed by sweeping. **L6:** a journey error row for unavailable storage. **L7:** DoR item 9 is labelled a feature-specific addition. **L8:** Scope Assessment says why US-1 and US-2 are one outcome. **L9:** the RED commit of `tests/protected/S-011/` is a precondition of the first DELIVER commit (DoD, DoR item 8, Pre-requisites).
- Not changed: DESIGN and DEVOPS parts of this file, and `environments.yaml` (its "two three-word club names" wording is for the DEVOPS revision).
Cycle 2 (`nw-product-owner-reviewer`): `conditionally_approved`. Every cycle-1 finding verified resolved. New findings and how they were folded in:
- **N1 (high):** the pins checked clauses outside the durable list. Resolved: the element contract (one list item, separate child-element lines, no button, link or nested list) and "a matchday message never changes once played (Tactics, Starting XI, reload and Continue)" join the durable list (D7 and the roadmap outcome); the per-season reset is now a rule of this version only (D6, D7, the outcome); P3 no longer pins the empty Inbox after "Play again" (non-protected e2e instead); D9 names the generic conventions every story pins (44px, Back focus, h1 focus, 390px, console).
- **N2 (medium):** DESIGN/DEVOPS called the oracle sweep trimmable. Resolved: every "trimmable" and the seeds 1..60 lever are removed; the floor seeds 1..100 x 8 clubs x 14 matchdays is stated in DD6, the DELIVER checkpoint, DEVOPS, ADR-0017 Earned Trust 3 and the brief.
- **N3:** US-1 scenario 4 now taps "Tactics" before choosing "4-3-3". **N4:** DoD and DoR item 6 carry the DESIGN numbers (about 676, about 896). **N5:** the integration-point limit is named (5, as in S-009 and S-010). **N6:** each line is one child element of the list item (D4, the outcome). **N7:** slice 01 has no learning hypothesis of its own. **N8:** review ids are removed from the DISCUSS body (kept here only).

Cycle 2 covered this section, `discuss/journey.md`, the two slices, J-11 and the S-011 roadmap entry.

## Wave: DESIGN

- **Setup**: mode propose; scope application / components; one solo team plus the factory, no Conway constraint. Paradigm: functional core, imperative shell (ADR-0003; recorded in the ADRs and the brief, not in CLAUDE.md). Unattended; no questions asked. Precedence used: scope.md, then brief.md, then accepted ADRs; the narrower choice wins.
- **Checklist**: ✓ DISCUSS (D1-D10, US-1/US-2, K1-K3, pins P1-P4, line budget, journey, slices) | ✓ S-010 DESIGN as the format template | ✓ brief, ADR-0002/0003/0008/0011/0012/0013/0014/0015/0016 (others by title) | ✓ code (`main.ts`, `state.ts`, `save.ts`, `standings.ts`, `season.ts`, `match.ts`, `dom.ts`, `screens/match.ts`, `season-end.ts`, `table.ts`, `club-home.ts`, `styles.css`, `.oxlintrc.json`, `stryker.config.mjs`, `package.json`) | ✓ existing tests (grep tests of S-009/S-010, the five-button e2e lists) | ✓ **seed-31 positions verified against the real code** (below) | ⊘ Context7 and web (no library; no browser API beyond what S-006..S-010 already use) | ⊘ residuality, DDD expansion, formal verification (lean) | ⊘ CLAUDE.md edit (locked).
- **New ADRs**: `adr-0017-inbox-derived-matchday-reports.md` (where the derivation lives, navigation, the shared score line, markup, Earned Trust) and `adr-0018-render-lookup-table.md` (the `render` lookup; closes the deferral of ADR-0016 Decision 4). ADR-0016's status line carries a one-line pointer to ADR-0018.
- **Brief**: `docs/product/architecture/brief.md` gains "Inbox (S-011, ADR-0017, ADR-0018)", effect-isolation rows, component rows, "Driving ports (S-011)" (ports 40-43), the S-011 observable bullet, and C4 L2 description updates (no new container).
- **Verified, not assumed** (a throwaway vitest file over the real `generateLeague`, `update`, `matchFor`, `standingsOf` and `standings`, deleted afterwards; `git status` clean): at `?seed=31`, "Netherwold Borough" (first club), the 14 score lines and the positions after each matchday 1..14 equal the DISCUSS table exactly: 6th, 8th, 6th, 5th, 3rd, 3rd, 5th, 4th, 2nd, 4th, 4th, 4th, 3rd, 3rd. They were read from `standingsOf` right after each tap and re-derived with `standings` over `results.filter(matchday <= N)`; both agree, so the three name tie-breaks (matchdays 4, 5, 7) hold. At the default seed 20260, "Oakhampton Rise Borough" after one match: "Harrowgate Lane United 0–1 Oakhampton Rise Borough", 3rd. `encodeSave` of the seed-31 club home after 3 matchdays equals that of the same state on another `clubId` screen, and `saveTextFor` is `undefined`. No mismatch with DISCUSS. DISTILL still pins the goldens independently, RED-first.
- **Outcome collision check**: not run in this DESIGN run (no shell tool). At S-010 `docs/product/outcomes/registry.yaml` was empty (`outcomes: []`), so no collision is possible; the orchestrator may run `nwave-ai outcomes check-delta docs/feature/S-011/feature-delta.md`.

### Wave: DESIGN / [REF] DDD list
- **No new bounded context.** A matchday report is a read model over two existing contexts: Match (the recorded entry) and Standings (the table after N matchdays). It sits in a small new domain module because the rule "position after matchday N" is a domain fact.
- **Language**: Inbox (the screen), Message (one list item; read-only), Matchday report (the message for one played matchday: title, score line, position), Position after matchday N (the club's Pos in `standings` over the entries with matchday <= N), Prefix (those entries).
- **Invariants by construction**: the position is `standings`' own output over a filtered log, so the Table's order is never copied (the Inbox cannot disagree with the Table); the score line is built by the one shared `scoreLine` (the Inbox cannot disagree with the match screen); the messages are a pure function of the recorded log and the club, so same seed gives the same Inbox, a restored log gives the same messages, tactics changes never touch them, and nothing is stored or written.

### Wave: DESIGN / [REF] Decisions
Design decisions are numbered DD1..DD9 to keep them apart from DISCUSS D1..D10 (peer review M7). ADR-0017 and ADR-0018 cite them as DD1..DD9.

| # | Decision | Source |
|---|---|---|
| DD1 | **Derivation in a new pure `src/domain/inbox.ts`**: `matchdayReports(clubs, played, clubIndex) => readonly MatchdayReport[]`, `MatchdayReport = { matchday, home: { name, goals }, away: { name, goals }, position }`, newest first, one per matchday in which the club has a fixture; `position` = the club's row in `standings(clubs, entries with matchday <= N)`. The sides are `{ name, goals }` so they match the shared `scoreLine` input structurally. `position` is in the type and the function from the first Inbox commit (M6, see DD9). Rejected: extending `standings.ts` or `season.ts` (two other concepts, widens ADR-0013/0015 contracts); app-only in `state.ts` (rule in the shell, harder to test with literal logs); a cumulative fold (a second ranking implementation; no saving: at most 14 `standings` over at most 56 entries, only when the Inbox renders). Plus the app selector `inboxOf(state, clubId)` (EXTEND `state.ts`; `undefined` for an unknown club). | ADR-0017 (1) |
| DD2 | **Navigation as the table precedent**: `Screen` adds `inbox{clubId}`; `Action` adds `ViewInbox` (a known club's `clubHome` only, else a `toBe` no-op); `Back` through `HOME_RETURNING_KINDS`; `sameScreen`'s `default` and `focusPlan` unchanged (screen changes focus the new h1, ADR-0008). `GameState` keeps its five keys. **No save change and no `SAVE_VERSION` bump**: `toSave` projects any screen with a known `clubId`, so the Inbox encodes to the same text as the club home (verified) and the autosave writes nothing on navigation; a reload from the Inbox continues at the club home. Rejected: a generic `ViewScreen` action (bypasses per-screen guards); messages inside the club home (D2 wants its own h1). | ADR-0017 (2) |
| DD3 | **`render` becomes a lookup first** (`RENDERERS`, a mapped type `{ [K in Screen["kind"]]: (context, screen) => void }`, `context = { root, state, dispatch }` because `max-params` is 3), as its own behaviour-preserving DELIVER commit before any Inbox code. The type is the exhaustiveness check (replaces the `never` guard); one documented cast at the call. `.oxlintrc.json` really enforces `complexity` max 15 (and `max-params` 3, `max-lines` 400): the 11-case switch is at 15, a twelfth case would be 16. Separate ADR because it is a different decision from the Inbox. Rejected: grouping cases into helpers (pays the debt again), glue inside the screen modules (ui would import app selectors), a library, a new `render.ts`. | ADR-0018 |
| DD4 | **One score-line builder and one title source**: the match screen's private `scoreLine` moves unchanged to `src/ui/score-line.ts` (`scoreLine({ home, away })`), used by `renderMatch` and `renderInbox`; the same module gets `matchdayTitle(n)` ("Matchday N"), used by `renderMatch`'s h1 and the Inbox title line, so both texts have one source (M2; behaviour-preserving for the match screen). "Equal to the match screen's" is guaranteed by construction and probed in e2e; Node vitest has no DOM, so the unit tier covers `matchdayReports` output only (M3). The S-006 binding markup stays (`p.score-line` of `span.score-name`, `" "`, `span.score-goals` "h–a" with U+2013, `" "`, `span.score-name`). In the Inbox a descendant rule `.message .score-line` shrinks the box; it sets no `display`, `float`, `position`, `text-transform` or `content`. Rejected: a pure string formatter (spans cannot be rebuilt from a string, so it would be a second source), copying the markup, importing from `match.ts` (screen to screen). | ADR-0017 (3) |
| DD5 | **Markup**: `section.inbox` = `<h1 tabindex="-1">Inbox</h1>`, [`<p class="inbox-empty">No messages yet</p>` only when empty], `<ul role="list" aria-label="Messages" class="message-list">` (always rendered, `min-height: 1.5rem`, the Goals-list precedent), `button.back-button` "Back". Each `li.message` holds three one-element lines: `p.message-title` "Matchday N", the shared `p.score-line`, `p.message-position` = `span.message-label` "League position", `" "`, `span.message-value` "3rd" (inline flow, as the S-009 season lines). **Titles are `<p>`, not `<h2>`**: one heading per screen is the project convention (S-004 labels, the Goals label), 14 headings would flood heading navigation, later message kinds (D7) need not be headings; pins only need "Inbox" to be the only h1. **The list is named by `aria-label`**, not a visible label: the h1 already says "Inbox" and `choose-player.ts` names "Players" the same way. `renderInbox` has `dispatch` narrowed to `Back` at compile time (the `renderTable` precedent). Club home: a sixth `button.primary` "Inbox" after "Table". CSS in the chalk/gold identity: `li.message` card with a 4px gold left border, gold bold position value, muted chalk title; `overflow-wrap: anywhere`; 48px buttons. | ADR-0017 (4) |
| DD6 | **Earned Trust**: browser vs Node goldens (14 seed-31 messages, seed 20260 matchday 1); `innerText` equals `textContent` for all three lines and an e2e computed-style check (spans `inline`, `<p>` lines `block`, no float or positioning; replaces a brittle CSS source grep, M8) for the layout lie; two oracles for K2: one that sorts cumulative rows itself and never calls `standings` (seeds 1..300 x 8 clubs; never below the K2 floor of seeds 1..100 x 8 clubs x 14 matchdays), and a time-travel oracle (`standingsOf` and `matchFor` read after each tap vs the final state's reports); no write on navigation (unit `encodeSave`/`saveTextFor`, e2e `setItem` counter plus unchanged `gaffer.save`); click-everything emits only `Back`, no `button`/`a` in `.message`; focus; 390px with 14 messages and the longest names; names check. No adapter, so no `probe()`. | ADR-0017 Earned Trust |
| DD7 | **Mutation scope**: `src/domain/inbox.ts` is under the existing `src/domain/**` glob and `inboxOf` under `src/app/state.ts` in `stryker.config.mjs`: no config change, no ADR for scope. Mutants to kill: `<=` vs `<` in the prefix, newest-first order, the club-row pick, the own-entry pick. The UI files are not mutated (as all UI). | `stryker.config.mjs` |
| DD8 | **Complexity (counted as S-007..S-010 did; `ci:lint` confirms in DELIVER)**: `update` stays 1 (`viewInbox` 3); `render` 1 with entries 1 to 2; `matchdayReports` designed at 8 or less by splitting (prefix filter, own entry, one report); `max-lines` 400: `state.ts` about 310, `main.ts` about 190. If a count differs, extract the nearest helper (behaviour-preserving). | `.oxlintrc.json` |
| DD9 | **DELIVER commit order** (one merge, under the 1200-line guard): (1) the `render` lookup, no behaviour change, whole existing suite green; (2) extract `scoreLine` and `matchdayTitle`, no behaviour change; (3) slice 01 (screen, button, list with title and score line, empty state); (4) slice 02 (the "League position" line). **Intermediate shape (M6):** commit 3 already defines `position` in the `MatchdayReport` type and in `matchdayReports` (the domain function is written once, with its goldens and oracles); slice 01 only skips *rendering* the position line, and slice 02 adds that one line to `renderInbox`. So no commit has a report type without `position`, and the intermediate state is exactly DISCUSS's two-line message. Slice 01 is never released alone. | DISCUSS slices; ADR-0018 |

### Wave: DESIGN / [REF] Component decomposition
| Path | Change | Responsibility | Indicative lines |
|---|---|---|---|
| `src/domain/inbox.ts` | CREATE NEW | `MatchdayReport`, `ReportableMatch`, `matchdayReports` (prefix filter, own entry, one report as small functions) | 40 |
| `src/app/state.ts` | EXTEND | `inbox` screen kind, `ViewInbox`, `viewInbox`, one `HANDLERS` entry, `"inbox"` in `HOME_RETURNING_KINDS`, `inboxOf`, one import | 25 |
| `src/ui/score-line.ts` | CREATE NEW (extracted from `match.ts`) | `scoreLine({ home, away })` moved from `match.ts` with its side type `ScoreSide = { name, goals }` declared here (`match.ts` imports it; no ui-to-screen import, no cycle); `matchdayTitle(n)` | 15 |
| `src/ui/screens/match.ts` | EXTEND | drops its private `scoreLine`, imports the shared `scoreLine` and `matchdayTitle` (h1 text) | 14 |
| `src/ui/screens/inbox.ts` | CREATE NEW | `renderInbox` (h1, [empty line], list of three-line items, `Back`; `dispatch` narrowed) | 35 |
| `src/ui/screens/club-home.ts` | EXTEND | the sixth button | 2 |
| `src/ui/styles.css` | EXTEND | `.inbox`, `.inbox-empty`, `.message-list`, `.message*`, the `.message .score-line` override | 35 |
| `src/main.ts` | EXTEND | `RENDERERS` lookup (the old case bodies; counted as added plus removed lines), the `inbox` entry, `inboxOrThrow`, imports | 130 |

**Code total about 296** (DISCUSS 145: the `render` refactor counted as 40 lines, but a lookup replaces about 60 lines of switch with about 70 of table, so about 130 changed lines; plus the `score-line.ts` extraction and the domain module). Tests (DISTILL fixes the files): `tests/acceptance/S-011/*.test.ts` about 220 (`matchdayReports` goldens, boundary, order and `RangeError` table, the independent and time-travel oracles 80; `update`/`inboxOf`/`focusPlan` cases, read-only and save-unchanged, fast-check tactics-stability 70; names check and source grep tests 40; the new 40-action property 30), `tests/e2e/S-011-inbox.spec.ts` about 135 (empty state; button order; 3 and 14 messages with exact lines and counts; the DISCUSS D6 seeds; the `setItem` counter and unchanged `gaffer.save`; click-everything; `innerText` equals `textContent` plus the computed-style check of the line elements; 390px with 14 messages and long names; focus), amendments about 24 (8 files, 3 lines each). **DELIVER total about 676** (code 296, tests 380; the review's `matchdayTitle` adds about 3 code lines, absorbed in the `score-line.ts` row's rounding above, and the computed-style e2e check replaces the CSS grep for a net of about 0 test lines) against DISCUSS 505. With the 220-line protected file (written in the plan run, outside DELIVER) the grand total is about 896, under the 1200-line PR guard (the one hard cap), about 300 lines of headroom. **DELIVER checkpoint**: after the first two refactor commits, project the total; if it would pass about 1,000, trim in this order: (1) merge the grep tests into one file; (2) fold the names check into the source file. The oracle sweep never drops below the K2 floor (seeds 1..100 x 8 clubs x 14 matchdays). Never split the slices.

**Amend list** (non-protected tests DELIVER must update, replacing, never weakening; DISTILL fixes the exact text). Checked by grep over `tests/` (non-protected) for `club-actions`, `toHaveLength(5)` and the five-button name lists; the list equals DISCUSS D8 exactly:
| File | Test / part | Replace with |
|---|---|---|
| `tests/e2e/S-005-starting-xi.spec.ts` | line 176, the club-home name list | the list gains `"Inbox"` last |
| `tests/e2e/S-006-match.spec.ts` | line 148 | gains `"Inbox"` last |
| `tests/e2e/S-007-table.spec.ts` | the test at line 225 ("The club home has five buttons ...", list at 228) | title "... six buttons in the order Squad, Tactics, Starting XI, Play match, Table, Inbox ..."; list gains `"Inbox"`; the 44px loop covers all six |
| `tests/e2e/S-007-club-home-regression.spec.ts` | line 24, `toHaveLength(5)` and its message | `toHaveLength(6)`, message "exactly six club home buttons"; the name checks gain "Inbox" |
| `tests/e2e/S-008-club-home-regression.spec.ts` | line 25 and its header comment (line 3) | the list gains `"Inbox"`; comment restated |
| `tests/e2e/S-008-season.spec.ts` | lines 252 and 254 (the End of season list and the `.club-actions > *` children) | both gain `"Inbox"` last (the `BUTTON:Inbox` child); the message text says six |
| `tests/e2e/S-009-club-home-regression.spec.ts` | line 46 and its header comment (line 3) | the list gains `"Inbox"`; comment restated |
| `tests/e2e/S-009-end-of-season.spec.ts` | lines 137 and 139 | both gain `"Inbox"` last |
Checked and **unaffected** (no edit): every `tests/acceptance/S-001..S-010` file (`update` is a handler table and gains one entry; `existing-navigation-unchanged` five-key test untouched: no state key is added; the S-009 `season-end-source.test.ts` checks `club-home.ts` only for the End of season/Play match strings and the `.season-line` CSS blocks, none of which change; the S-010 storage grep keeps passing because `inbox` code names no storage), `tests/unit/ui/renderers-never-move-focus.test.ts` (scans `src/ui`; the new files have no `.focus(`), and no existing test mentions `score-line` (the extraction breaks nothing). Protected specs never count club-home buttons (D8). The pending-then-activate pattern of S-006..S-009 applies to the amend list, in the same commit as the production change.

### Wave: DESIGN / [REF] Driving ports
- **Domain, pure**: `matchdayReports(clubs, played, clubIndex)`; `standings` over a prefix; `formatOrdinal` (existing).
- **App, pure**: `update` with `ViewInbox` and `Back`; `inboxOf(state, clubId)`; `focusPlan`; the S-010 save projection (unchanged by navigation).
- **Browser** (`http://localhost:4173/gaffer/`, roles and accessible names): the club home's "Inbox" (sixth button); the Inbox: h1 "Inbox", the list "Messages" and its items, the line "No messages yet", "Back"; plus the S-001..S-010 entry points ("Table", "Tactics", "Play match", "End of season", "Play again", "Continue", `page.reload()`); an init script that counts `Storage.prototype.setItem` calls for `gaffer.save` (non-protected spec).
- Detail and properties: brief, "For Acceptance Designer", ports 40-43.

New and changed shapes, for the acceptance designer (contracts only):
- `MatchdayReport = { readonly matchday: number; readonly home: { readonly name: string; readonly goals: number }; readonly away: { readonly name: string; readonly goals: number }; readonly position: number }`; `matchdayReports(clubs: readonly Club[], played: readonly ReportableMatch[], clubIndex: number): readonly MatchdayReport[]` (`ReportableMatch` = `ScoredMatch` plus `matchday`; a `PlayedMatch` fits).
- `Screen` adds `{ kind: "inbox"; clubId: string }`; `Action` adds `{ type: "ViewInbox" }`; `inboxOf(state: GameState, clubId: string): readonly MatchdayReport[] | undefined`; `GameState`, `PlayedMatch`, `SaveData` unchanged.
- `scoreLine({ home, away })` returns the `p.score-line` element; `renderInbox(root, { messages }, dispatch)` with `messages: readonly MatchdayReport[]` and `dispatch` typed to `Back`; not reachable from vitest, covered by e2e and grep tests.

### Wave: DESIGN / [REF] Driven ports and adapters
**None new.** The Inbox only reads the state; it touches no storage, clock, network or vendor SDK, and the S-010 adapter is untouched (the save is read-only here: the autosave decides "no write" from the unchanged encoded text). So there is no new `probe()`. The environment lies the design could suffer, and how each is exercised (full list with fault scenarios in ADR-0017 Earned Trust):
1. **Chromium vs Node**: the browser's 14 seed-31 messages and the seed-20260 message equal the Node goldens (positions verified in this run).
2. **Layout**: one line per element; `innerText` equals `textContent`; an e2e computed-style check (spans `inline`, `<p>` lines `block`, no float or positioning), not a CSS source grep.
3. **The verdict vs the evidence**: the independent oracle and the time-travel oracle; faults: `<` for `<=`, a missing tie-break, the wrong row, the wrong side's name or goals.
4. **Navigation writes nothing**: unit (`encodeSave`, `saveTextFor`, same objects) and e2e (`setItem` counter, stored text).
5. **Messages are text**: click-everything emits only `Back`; no control in `.message`.
6. **The refactors preserve behaviour**: `render` lookup and `scoreLine` extraction are run against the whole existing e2e and protected suites before Inbox code lands (ADR-0018 Earned Trust).
No external integrations, so no contract tests. **Enforcement**: oxlint (existing), `ci:typecheck` (the lookup's completeness), grep tests (ADR-0017 Enforcement, ADR-0018 Enforcement).

### Wave: DESIGN / [REF] Technology choices
- No new dependency, no library (ADR-0001, 0002, 0003 apply; all OSS). Plain DOM through `el()`, `standings` and `formatOrdinal` reused, plain CSS. No Context7 lookup applies.

### Wave: DESIGN / [REF] Reuse Analysis
| Existing Component | File | Overlap | Decision | Justification / contract shape |
|---|---|---|---|---|
| `standings`, `ScoredMatch`, `formatOrdinal` | `src/domain/standings.ts` | The table order and the ordinal text | REUSE unchanged | Pure return-only; the Inbox calls `standings` on a prefix, so the order is never copied; `formatOrdinal` is called by the renderer as in `renderSeasonEnd` |
| `standingsOf`, `matchFor`, `seasonSummaryOf`, `nextMatchday` | `src/app/state.ts` | Oracles and the "Final position" comparison | REUSE unchanged | Pure return-only; the time-travel oracle reads `standingsOf` and `matchFor` after each tap |
| `GameState`, `Screen`, `Action`, `update` (`HANDLERS`), `HOME_RETURNING_KINDS`, `sameScreen`, `focusPlan` | `src/app/state.ts` | Where the screen, the action and the way back live | EXTEND (`inbox` kind, `ViewInbox`, one handler entry, one set member, `inboxOf`) | `update`: bounded-change (a new state, input never mutated; "pure return-only" in the project's older wording), universe `{ league, screen, formation, xi?, results? }`, delta "`screen` only" (five-key test stays); `inboxOf`: pure return-only (= Principle-6 pure-function); `ViewInbox` from a known club's `clubHome` else `toBe`; `Back` returns the club home `toEqual`; `sameScreen` default and `focusPlan` untouched |
| `toSave`, `encodeSave`, `saveTextFor` | `src/app/save.ts` | "Opening the Inbox writes no save" | REUSE unchanged | Pure return-only; any `clubId` screen projects the same text, so navigation writes nothing; no `SAVE_VERSION` bump (a test pins equality of the two encodings) |
| `PlayedMatch`, `MatchResult` | `src/domain/match.ts` | The log entries the reports read | REUSE unchanged (structural input) | Plain data; `ReportableMatch` is structural so tests pass literals |
| `topScorer`, `ScoringMatch` | `src/domain/season.ts` | A per-club view over the log | REUSE as the pattern only (not extended); shape: not a component here (nothing is called or changed; `topScorer` itself is pure return-only) | The end-of-season rules stay separate from the per-matchday reports (ADR-0015 vs ADR-0017) |
| (none) | `src/domain/` | The club's own match and its position after each matchday | CREATE NEW `inbox.ts` | No existing function builds a per-matchday prefix table or pairs it with the club's entry (grep: `standings` is only called on the whole log by `standingsOf`). Pure return-only; universe = the returned list; goldens, boundary, order property, two oracles, `RangeError` table; Stryker covers `src/domain/**` |
| `scoreLine` (private) and the h1 template literal "Matchday N" | `src/ui/screens/match.ts` | The score line and title the Inbox must repeat exactly | CREATE NEW, extracted from `match.ts` (`src/ui/score-line.ts` holds the moved `scoreLine`, its side type `ScoreSide = { name, goals }` that `match.ts` now imports, and the new `matchdayTitle(n)`; `scoreLine`'s parameter becomes `{ home: ScoreSide; away: ScoreSide }`) | **`scoreLine`: bounded-change** (creates detached nodes only; universe = the returned element; assertion: e2e text and markup of the match screen unchanged on commit 2, e2e Inbox lines read next to the match screens). **`matchdayTitle`: pure, return-only** (= Principle-6 pure-function; string out). One source of the markup and of the title text; markup moved verbatim, `MatchScreenView` unchanged (its side type is the imported `ScoreSide`); every S-006..S-010 e2e covers the match screen; no test mentions `score-line` |
| `src/ui/screens/inbox.ts` (`renderInbox`) | new file | The Inbox screen | CREATE NEW | **Bounded-change, emits only `Back`.** Universe = `root`'s single `section.inbox`: h1, optional `p.inbox-empty`, `ul` list "Messages", `button.back-button` (nothing else is written or clickable; no `button`, `a` or `[role=button]` in a message). Assertion mechanisms the crafter and DISTILL use: `dispatch` narrowed at compile time to `Back`; grep test (one `dispatch(`, one `addEventListener`, no `.focus(`, no `innerHTML`); e2e click-everything sees only `Back`; e2e universe check of the DOM under `.message`; computed-style check of the line elements. No existing component does this ("no existing alternative": the Table and End of season screens have other contents) |
| `renderSeasonEnd`, `renderTable` | `src/ui/screens/season-end.ts`, `table.ts` | A screen that emits only named actions; label and value lines | REUSE as patterns only; shape: not a component here (nothing is called or changed) | The compile-time narrowed `dispatch` and the inline-flow label/value line are copied as patterns; `renderInbox` is a new screen with its own list; `seasonLine` is private and bordered for the End of season screen, so a three-line copy is cheaper than a shared helper and styles differ |
| `renderMatch` | `src/ui/screens/match.ts` | Uses the shared builder and title | EXTEND (imports `scoreLine` and `matchdayTitle`) | Bounded-change; markup and h1 text unchanged (behaviour-preserving, commit 2) |
| `renderClubHome` | `src/ui/screens/club-home.ts` | The button list | EXTEND (one `actionButton`) | Bounded-change; closed universe of six `button.primary` in order |
| `el`, `.back-button`, `button.primary`, `.club-actions`, `.score-line`, `.goal-list`, tokens | `src/ui/dom.ts`, `styles.css` | Elements and styling | REUSE (the Inbox overrides `.score-line` by a descendant rule); shape: `el` is bounded-change (creates detached nodes); the CSS classes and tokens are not components | Presentation only; no `display` change on the lines (e2e computed-style check) |
| `render`, `findClub`, `squadOrThrow`, `seasonSummaryOrThrow`, `matchScreenView`, `applyFocus`, the loop | `src/main.ts` | Maps state to props | EXTEND (lookup `RENDERERS`, `inbox` entry, `inboxOrThrow`) | Bounded-change, enumerated universe unchanged; every old case body moves unchanged |
| `.oxlintrc.json`, `stryker.config.mjs` | repo root | Layer rules; mutation scope | REUSE unchanged; shape: not a component (configuration, read only) | No weakening; the Stryker globs already cover the new domain code |
| `tests/e2e/*` five-button lists | amend list | Assert five buttons | REUSE except the amend list; shape: not a component (tests) | Equal-or-stronger: each list gains "Inbox", nothing else dropped |

### Wave: DESIGN / [REF] Changed Assumptions
- **DISCUSS line budget, quoted**: "`render` switch moved to a lookup, then the inbox case added (`src/main.ts`; ...) | code | 40"; "DELIVER total (code 145, tests 360) ... 505". Revised: the lookup rewrites every case, so the diff is about 130 changed lines in `main.ts`; code about 296, tests about 380, DELIVER about 676, grand total about 896 with the protected file (under the 1200-line guard).
- **Right-size re-check against the DESIGN numbers (M5): PASS.** DELIVER about 676 lines (code 296, tests 380) and about 896 with the 220-line protected file, against the 1200-line PR cap (about 300 lines of headroom; the DELIVER checkpoint after the two refactor commits still applies). Still 1 story, 2 slices, 1 outcome, about 1 day; the DISCUSS scope assessment (PASS) holds although the diff is about 170 lines larger than its estimate, because the growth is the `render` lookup rewrite (a refactor, not new behaviour) and the extraction, and no new seam is added. Peer-review changes (M2 `matchdayTitle`, M8 computed-style check in place of the CSS grep) net to a few lines, inside rounding.
- **DISCUSS guardrail wording, carried over (revision 2)**: DISCUSS says the 390px check uses the longest club names the generator makes and DISTILL picks the seed by sweeping; "two three-word club names" in earlier DESIGN/DEVOPS text is replaced by that wording.
- **DISCUSS technical note, quoted**: "a pure inbox selector ... (`src/app/state.ts` or a new `src/app/inbox.ts`)" and Scope Assessment "no domain change, except perhaps reusing `standings` over part of the results log". Decided: the rule lives in a new pure `src/domain/inbox.ts` (no existing domain code changes) and `inboxOf` in `state.ts`.
- **DISCUSS US-2 note, quoted**: "DESIGN decides whether to fold cumulatively." Decided: no fold, a fresh `standings` per prefix (a second ranking implementation would be a second source of the tie-break order).
- **DISCUSS shared artifacts, quoted**: "One builder is shared by the match screen and the Inbox (today it is inside `src/ui/screens/match.ts`; DESIGN extracts it)". Done: `src/ui/score-line.ts`.
- **ADR-0016 Decision 4, quoted**: "`render` stays a switch at 15 of 15 ... Converting `render` to a lookup is deferred to the next story that adds a *screen*, which must do it first." Taken by ADR-0018; S-009 Open question 1 is closed for `render`.
- **DISCUSS hand-derived positions, quoted**: "The positions were worked out by hand ... DISTILL confirms them with the domain code." Confirmed already in this DESIGN run against the real code (all 14 equal; see Verified, not assumed); DISTILL still pins them RED-first from the DISCUSS table, not from DELIVER output.
- **DISCUSS D2 wording, refined**: "a list named exactly 'Messages'" is an `aria-label` on a `<ul role="list">` (no visible label); message titles are `<p>`, not headings (DISCUSS left both to DESIGN).
- **DISCUSS D8 amend list**: confirmed against the repo by grep (8 files, same lines); no file is added or dropped.
- No change to the roadmap outcome text.

### Wave: DESIGN / [REF] Open questions
- **None blocking.**
- **Counts are by hand**; DELIVER confirms every complexity and `max-lines` figure with `ci:lint` (DD8 has the fallback). **`max-params` is 3 and `matchdayReports(clubs, played, clubIndex)` already has 3** (L3/L4): a fourth parameter later must become an options object, not a fourth positional argument.
- **"Back" at the bottom of 14 messages** (about 1.4k px at 390px) is an owner-demo open question (M9), kept consistent with every other screen. Trigger: if the owner reports that Back is hard to reach one-handed with a full season of messages, a later story adds a top Back or a sticky Back; the pins do not fix its position.
- **For DEVOPS**: no CI, `ci:*`, Stryker or lint-config change. The new e2e uses an init script and `page.evaluate` against `localStorage` (non-protected spec). `ci:lint` complexity is the gate for the `render` lookup.
- **For DISTILL**:
  - Goldens, RED-first (never re-pinned from DELIVER output): the seed-31 table in the DISCUSS User stories (verified), the seed-20260 message, the matchday 4, 5 and 7 name ties. Choose the seed for the 390px check by sweeping the generator for the longest club names it makes.
  - Properties: the independent and the time-travel oracle; fast-check tactics stability; read-only and no-write; the new 40-action pool with `ViewInbox`; names check; source grep tests (ADR-0017 Enforcement); an e2e computed-style check of the message line elements (spans `inline`, `<p>` lines `block`, no float or positioning; there is no CSS source grep, M8); a grep that `main.ts` has no `switch (` and holds `RENDERERS` (ADR-0018). The pairing of screen kind and renderer in `RENDERERS` is guarded by e2e, not by types (L1).
  - The protected pins P1..P4 (DISCUSS D9) cover only the durable list; e2e covers "No messages yet", exact counts and the place of "Inbox".
  - Slice order inside DELIVER: refactor commits first (DD9).
- **Outcome trace**: "Inbox" 44px+ after "Table", from the club pick, after matchday 14 and after "Continue": DD2, DD5 (club home). Only h1 "Inbox" focused, list "Messages", "Back" with heading focus: DD2, DD5. One message per matchday, newest first, title, the match screen's score line: DD1, DD4, DD5. Position after each matchday equals the Table then and the final position at 14: DD1 (reuses `standings`). "No messages yet": DD5. Derived only, same seed same Inbox, reload and Continue, tactics never change a message, a new game empties it, nothing saved, text not buttons: DD1, DD2 (no state key, no save change), DD5. 44px, no sideways scroll, no console errors: DD5, DD6.

### Wave: DESIGN / [REF] Peer review
Status: **conditionally approved after cycle 2 of 2; every cycle-2 finding folded in by the orchestrator (no further cycle allowed)**. Cycle 1 of `nw-solution-architect-reviewer` (at most 2 cycles) returned `conditionally_approved`. Resolutions (also in ADR-0017, ADR-0018 and the brief's "Inbox (S-011)" section and ports 40-43):
- **H1 (high), resolved:** Reuse Analysis gains a row for `src/ui/screens/inbox.ts` (CREATE NEW, bounded-change, universe = root's single `section.inbox`: h1, optional `p.inbox-empty`, `ul` "Messages", `button.back-button`; `dispatch` narrowed to `Back`; grep and e2e click-everything and universe checks). The `score-line.ts` row gets its shape (`scoreLine` bounded-change, `matchdayTitle` pure return-only). Pattern-reuse rows say "not a component" or give a shape.
- **M1, resolved:** ADR-0017 maps "pure, return-only" to Principle-6 pure-function and labels `update`'s `ViewInbox`/`Back` bounded-change, universe `{ league, screen, formation, xi?, results? }`, delta "screen only"; the brief and the Reuse Analysis follow.
- **M2, resolved:** shared `matchdayTitle(n)` in `src/ui/score-line.ts`, used by `renderMatch`'s h1 and the Inbox title (DD4, ADR-0017).
- **M3, resolved:** ADR-0017 and the brief's port 40 state the score-line text equality is by construction and probed in e2e; the unit tier (environment `node`, no DOM) covers `matchdayReports` and `inboxOf` only.
- **M4, resolved:** ADR-0017 Consequences carries a rough bundle estimate (about +3-4 KB minified, +1.5 KB gzip on a baseline of roughly 35 KB / 12 KB; an estimate from line counts, not measured).
- **M5, resolved:** right-size re-check against DESIGN numbers in Changed Assumptions: PASS (about 676, about 896 with protected, cap 1200).
- **M6, resolved:** `position` is in the type and `matchdayReports` from commit 3; slice 01 only skips rendering the line (DD9, ADR-0017).
- **M7, resolved:** DESIGN decisions renamed DD1..DD9; the ADRs and the brief cite them.
- **M8, resolved:** the CSS source grep is replaced by an e2e computed-style check plus `innerText` equal to `textContent` (DD6, ADR-0017 Earned Trust 2).
- **M9, resolved as an open question with a trigger:** owner-demo report of an unreachable Back leads to a later top or sticky Back (Open questions, ADR-0017 Consequences).
- **L1, L2, L5, L6, resolved:** L1 the `RENDERERS` pairing of kind and renderer is guarded by e2e, not types (ADR-0018 Consequences, brief); L2 ADR-0018 cites "no runtime dependencies" (brief line 8) instead of a bundle budget; L5 the composition-root exemption is stated in ADR-0018; L6 ADR-0017 Earned Trust 8 references ADR-0018 Earned Trust 2 as the probe.
- **L3, L4, no change** except the `max-params` note for `matchdayReports` (3 of 3) in Open questions.
- **Wording:** "two three-word club names" replaced by "the longest club names the generator makes (DISTILL picks the seed by sweeping)" here, in the DEVOPS part and in `environments.yaml`. The DEVOPS part's two cross-references "DESIGN D9" and "DESIGN D8" now read DD9 and DD8 (renamed targets).
Cycle 2 (`nw-solution-architect-reviewer`): `conditionally_approved`. Every cycle-1 finding verified resolved (names, DD1..DD9 and shapes consistent across ADR-0017, ADR-0018, the brief and this file). New findings and how they were folded in:
- **N1 (high):** "trimmable" oracle sweep contradicted the DISCUSS K2 floor. Resolved: removed everywhere; the floor (seeds 1..100 x 8 clubs x 14 matchdays; DESIGN sweep 1..300) is stated in DD6, the checkpoint, DEVOPS, ADR-0017 Earned Trust 3 and brief port 40; the checkpoint trims grep tests and the names check instead.
- **N2 (low):** ADR-0017 cites the whole brief budget line (no runtime dependencies; JS under 50 kB gzip, not yet enforced) and states the estimate is within it.
- **N3 (medium):** ADR-0018's composition-root section no longer claims the globals rule applies to `main.ts`; it lists the top-level rules that do (complexity, max-depth, max-params, max-lines, no-console, eqeqeq, prefer-const, no-var) and the guards (typecheck, grep, complexity gate).
- **N4 (low):** the side type `ScoreSide = { name, goals }` is declared in `src/ui/score-line.ts` and imported by `match.ts` (no ui helper imports a screen, no cycle); `scoreLine`'s parameter is `{ home: ScoreSide; away: ScoreSide }`; markup moved verbatim (ADR-0017, Reuse row, Component table, brief).
- **N5 (low):** `src/ui/score-line.ts` is labelled CREATE NEW (extracted from `match.ts`) everywhere.
- **N6 (low):** DISCUSS DoD and DoR item 6 carry the DESIGN numbers.

Cycle 2 covered this section, ADR-0017, ADR-0018 and the brief's "Inbox (S-011)" section.

## Wave: DEVOPS

Lean, unattended. All nine decisions pre-answered; no platform change. Locked paths (`.github/`, `factory/`, `scripts/`, `.nwave/`, `CLAUDE.md`, the product brief and scope, `tests/protected/`) are read-only. Machine-readable: `docs/feature/S-011/environments.yaml`. Inherits S-010 (and S-001..S-009); only deltas are recorded. S-011 adds no storage, no dependency, no script and no config change: the Inbox only reads the recorded results.

Checklist: ✓ existing infra reused | ✓ K1-K3 mapped to instruments | ✓ rollback defined | ✓ storage-state matrix for DISTILL (clean, saved game) | ✓ mutation strategy (nightly-delta; `src/domain/inbox.ts` inside the `src/domain/**` glob, `inboxOf` inside `src/app/state.ts`; verified in `stryker.config.mjs`) | ✓ protected-runner timeout constraint carried over | ⊘ new IaC/containers | ⊘ server-side observability | ⊘ continuous learning | ⊘ CLAUDE.md edit

### Wave: DEVOPS / [REF] Environment matrix
| Env | URL | Runner | Purpose |
|---|---|---|---|
| local-dev | `http://localhost:5173/gaffer/` (`pnpm dev`) | dev machine | Iteration |
| local-preview | `http://localhost:4173/gaffer/` (`ci:serve`) | dev, CI, protected runner | Production build under test: phone-viewport Chromium (Pixel 7 profile, 390px); unit, property, e2e, `tests/protected/S-001..S-011/` |
| production | `https://<owner>.github.io/gaffer/` | GitHub Pages | Live site; post-deploy smoke through `BASE_URL` (same Pixel 7, 390px) |

Unchanged: no staging (static, recreate); Chromium only. S-011 adds no new platform surface. The one storage-related delta: the Inbox must survive "Continue" and must never write.

**Storage states DISTILL must cover** (fresh Playwright context per test by default):

| State | How it is produced | Expected | Instrument |
|---|---|---|---|
| clean | fresh context, no seeding; "New game", a club | club home offers "Inbox" (sixth, 44px or taller); Inbox shows "No messages yet" and an empty "Messages" list; "Back" returns to the focused club home | e2e; protected P1 |
| clean, N matches played | play N x ("Play match", "Back") in the test | N items newest first (3 at seed 31: Matchday 3, 2, 1; 14 after a full season), the seed-31 score lines and positions of DISCUSS | e2e; protected P2, P3; unit goldens and oracles |
| saved game (Continue) | play 2 matches, `page.reload()`, "Continue" (no seeding needed; if an init script seeds a save it writes only when the key is absent, S-010 rule) | the Inbox reads the same messages, line for line, as before the reload; "Inbox" is offered on the club home after Continue | e2e; protected P4 |
| no write on navigation | init script counting `Storage.prototype.setItem` calls for `gaffer.save` (non-protected spec) | opening "Inbox" and "Back" adds 0 writes; stored `gaffer.save` text unchanged | e2e (non-protected); unit (`encodeSave`, `saveTextFor`) |
| default seed | `?seed=abc` and no seed, fresh browsers | same one message at "Oakhampton Rise Borough" matchday 1: "Harrowgate Lane United 0–1 Oakhampton Rise Borough", 3rd | e2e |
| New game, Play again | "End of season", "Play again", same club, "Inbox" | empty again ("No messages yet") | e2e; protected P3 |

Storage faults (blocked, full, damaged saves) are S-010's matrix and are not re-run for the Inbox: it touches no storage, so an S-010 fault cannot reach it. A damaged or blocked store gives no "Continue" and a play-through from "New game" still fills the Inbox in memory.

Notes:
- **Fresh contexts, in CI and on the live URL.** Each test and the deployed-site `smoke` (`BASE_URL`) run in fresh contexts, so a stale save from an older deploy cannot reach them. Smoke never writes to a real player's browser. Shared `<owner>.github.io` origin as in S-010.
- **Real players.** No `SAVE_VERSION` bump and no format change (ADR-0017, verified in DESIGN: an Inbox screen encodes to the same text as the club home). A save from S-010 continues unchanged and its Inbox is derived from the saved results.
- **Focus** (ADR-0008): the Inbox h1 and the club home h1 on "Back" are focused through the existing screen-change plan; no new focus code.
- **Layout.** Long score lines wrap at 390px: the e2e uses a seed with the longest club names the generator makes (DISTILL picks the seed by sweeping; DESIGN, For DISTILL) for the no-horizontal-scroll check.
- **e2e runtime.** A 14-matchday Inbox check is 28+ taps: the agent e2e needs `test.setTimeout(90_000)` (config default 30 s, retries 1 in CI).

### Wave: DEVOPS / [REF] CI/CD pipeline outline (existing, unchanged)
- `ci` (PR, push to main, dispatch; 30 min): PR guards (locked paths, append-only protected, diff cap 1200, `Math.random`/`Date` in `src/domain/`, which covers `src/domain/inbox.ts`), roadmap lint, `ci:lint` (confirms the `render` lookup's and `matchdayReports`' complexity counts, DESIGN DD8), `ci:typecheck` (the `RENDERERS` mapped type is the screen-kind exhaustiveness check, ADR-0018), `ci:test` (fresh `FC_SEED`), `ci:build`, `ci:e2e`, protected no-regression check vs main (a new `tests/protected/S-011/*.spec.ts` must fail on main until DELIVER).
- `deploy` (push to main): `ci:build`, deploy-pages, then `smoke` (10 min) runs `ci:e2e` against the live URL, including the new S-011 spec and the eight amended club-home specs.
- `nightly` (03:00, 45 min): `ci:mutation`; failure opens a `mutation-alarm` issue. `ai-review`, `factory-tick`, `watchdog`, `weekly-demo`: factory-owned, untouched.
- No pipeline change: S-011 adds unit, property and e2e specs run by existing scripts, and no dependency. DESIGN estimates DELIVER at about 676 lines (about 896 with protected), under the 1200 guard; `docs/` is outside the count.
- Local gate: `pnpm run check` mirrors the commit stage; no git hooks (locked). Security: no secrets, no runtime deps, no network, no new untrusted input (the Inbox reads in-memory results only; text goes through `el()`/`textContent`, ADR-0002). SAST/SCA/SBOM not added (inherited owner-only item).

### Wave: DEVOPS / [REF] Monitoring contracts (DISCUSS KPI to instrument)
E2E instrument: `tests/e2e/S-011-inbox.spec.ts` (Pixel 7, 390px) via `ci:e2e` on PR and main and `smoke` on the live URL. Unit/property rows run in `ci:test` with a fresh `FC_SEED`. `tests/protected/S-011/` runs on local-preview in `ci` and must pass on main.

| KPI (DISCUSS) | Instrument | Pass condition |
|---|---|---|
| K1: 1 tap from the club home to every matchday's report and position; 2 taps from the title after a reload ("Continue", "Inbox"); the owner states the position path from the Inbox alone | e2e: page-side capture-phase click counter (as S-003..S-010): at seed 31 after 3 matches, 1 click ("Inbox") from the club home to the 3 reports; after a reload, 2 clicks ("Continue", "Inbox"). Protected P2 and P4 pin the reports and the Continue survival. Manual: owner's Friday demo continues a season and tells its story from the Inbox (no analytics in the POC) | 1 and 2 clicks; owner states the path |
| K2: 0 differences between message N and match screen N (h1, score line) and between its position and the Table's Pos after matchday N | unit: goldens (seed-31 14 positions 6th, 8th, 6th, 5th, 3rd, 3rd, 5th, 4th, 2nd, 4th, 4th, 4th, 3rd, 3rd; seed-20260 matchday 1), the independent oracle (seeds 1..300 x 8 clubs x 14 matchdays, never below the floor of seeds 1..100; sorts the cumulative rows itself) and the time-travel oracle (`standingsOf` and `matchFor` after each tap). Protected P2, P3 (newest position equals the Table; matchday 14 equals "Final position"). Browser vs Node goldens equal (Earned Trust 1) | 0 differences; goldens exact |
| K3: 0 changes to `formation`, `xi`, `results` or the saved text from opening the Inbox; 0 message changes after tactics changes | unit: fast-check (`numRuns` 100, fresh `FC_SEED`) over random formation, pick and Play match sequences; same-object checks; `encodeSave`/`saveTextFor` unchanged by the Inbox screen. e2e: `setItem` counter and unchanged `gaffer.save` text. Protected P4 (tactics change then reload and Continue: same messages) | 0 changes; 0 writes |
| 44px, no sideways scroll at 390px, 0 console errors, focus | e2e: "Inbox" and "Back" 44px or taller, no horizontal scroll on the longest-names seed, console and page-error capture, h1 focus on arrival and on "Back"; click-everything on the Inbox dispatches only `Back`; no button or link inside a message | holds |
| Names, determinism, layering | unit: "Inbox", "Messages", "League position", "No messages yet" in no `names.ts` string; grep tests (ADR-0017/0018: one `dispatch(`, no `innerHTML`, no `.focus(` in `src/ui`, no `switch (` in `main.ts`, `RENDERERS` present); no `Math.random`/`Date` in `src/domain/` (PR guard) | holds |
| S-001..S-010 unchanged | existing e2e and acceptance (only the D8 amend list: eight five-button lists become six, replaced never weakened) and `tests/protected/S-001..S-010/`; first two DELIVER commits (`render` lookup, `scoreLine` extraction) run against the whole existing suite before Inbox code lands | green |
| Domain test strength | Stryker on `src/domain/inbox.ts` (prefix `<=`, newest-first, club-row pick, own-entry pick) and `inboxOf`/`ViewInbox` in `src/app/state.ts` | nightly, at or above break 70 |

No analytics (POC). The e2e tap counter, the property tests and the owner's demo are the KPIs' sole measurements.

### Wave: DEVOPS / [REF] Deployment strategy and rollback
- Strategy: recreate. Merge to main triggers `deploy`, replacing the whole static artifact; idempotent.
- Rollback (designed first): revert the S-011 squash commit on main; the merge triggers `deploy` and `smoke` validates the restored site. Alternative: `workflow_dispatch` of `deploy.yml` on the pre-S-011 commit (the S-010 deploy). Fallback: fix-forward on a `claude/*` branch. The append-only protected guards may block a plain revert of a squash that added `tests/protected/S-011/`; the dispatch route is then the owner action. Time to restore: one deploy cycle (about 5 minutes).
- **Rolling back across saves.** Nothing to clean up: S-011 stores nothing and does not change the save format, so a pre-S-011 build reads every save as today (the club home simply has five buttons). Rolling forward again shows the Inbox derived from the same saved results.
- Failure detection: a red `smoke` marks the deploy run red; red goldens or oracles show as a red `ci:test` before merge.
- Data: none new. Blast radius: one static page.
- Result stability: no new RNG stream and no change to any result, schedule, squad or save for any seed.

### Wave: DEVOPS / [REF] Mutation testing strategy
nightly-delta, inherited from `CLAUDE.md`; `/nw-deliver` Phase 5 skipped. `stryker.config.mjs` (checked) mutates `src/domain/**/*.ts` except `names.ts`, plus `src/app/state.ts`, `src/app/save.ts` and `src/adapters/**/*.ts`; thresholds high 85, low 70, break 70 (unchanged).
- `src/domain/inbox.ts` (new, `matchdayReports`): INSIDE the `src/domain/**` glob, no config change. Mutants to kill: `<=` vs `<` in the prefix filter, newest-first order, the club-row pick, the own-entry pick (killed by the goldens, the oracle and the order property).
- `src/app/state.ts` (`ViewInbox`, `HANDLERS` entry, `inboxOf`, `HOME_RETURNING_KINDS`): INSIDE.
- `src/ui/score-line.ts`, `src/ui/screens/inbox.ts`, `club-home.ts` and `src/main.ts` (`RENDERERS`): OUTSIDE (UI and the shell never were mutated); covered by e2e and grep tests.
- Runtime: no new sweep beyond the oracle (bounded; floor seeds 1..100 x 8 clubs x 14 matchdays); watch the first nightly after merge against the 45-minute timeout.

### Wave: DEVOPS / [REF] Observability stack
Browser console plus Playwright smoke on the deployed URL only. No RUM, error tracking, logs or tracing. SLO: smoke green per deploy (including the Inbox spec in a fresh context on the live origin). Alerting: a red `deploy` run; a red nightly opens `mutation-alarm`. No dashboards.

### Wave: DEVOPS / [REF] Branching strategy
Trunk-based. Short-lived `claude/S-011-*` branches, PR to main, squash merge, deploy on merge, no release branches. DELIVER commit order (DESIGN DD9): `render` lookup, `scoreLine` and `matchdayTitle` extraction, slice 01, slice 02, in ONE merge. DESIGN estimates about 676 lines (about 896 with protected), under the 1200 guard; if DELIVER nears it, trim test duplication (merge grep tests, fold the names check), never narrow the oracle sweep below the K2 floor and never split the slices.

### Wave: DEVOPS / [REF] Coexistence matrix
| Component | S-011 impact | Action |
|---|---|---|
| `ci.yml`, `deploy.yml`, `nightly.yml`, `ci:*` scripts, `playwright.config.ts` | none; Pixel 7, 390px, `BASE_URL` fit; no new script or dependency | reuse |
| `stryker.config.mjs`, `.oxlintrc.json` | none; `inbox.ts` falls under the existing glob; lint complexity 15 is the gate for the `render` lookup | reuse |
| `scripts/guards/pr-guards.mjs` | determinism grep and 1200 cap fit | none |
| `tests/protected/S-001..S-010/` | untouched; none counts the club-home buttons | must stay green |
| `tests/protected/S-011/` | locked scenarios (plan run, pins P1-P4); P2 and P3 play 3 and 14 matchdays | must exist before DELIVER and pass on main; `test.setTimeout(90_000)` where a season is played |
| Amend list (D8: `tests/e2e/S-005-starting-xi`, `S-006-match`, `S-007-table`, `S-007-club-home-regression`, `S-008-club-home-regression`, `S-008-season`, `S-009-club-home-regression`, `S-009-end-of-season`) | each five-button list gains "Inbox" last | replace, never weaken, in the same commit as the club-home button |
| `tests/e2e/S-010-club-home-regression.spec.ts` | not on the D8 list: DISTILL must grep it for a five-button list or `toHaveLength(5)`; no edit if it names buttons only | DISTILL checks |
| `tests/acceptance/S-009/existing-navigation-unchanged.test.ts` (five-key test), `focusPlan` suites, `renderers-never-move-focus`, the S-010 storage grep | unedited (no state key, no storage in Inbox code, no `.focus(` in new UI files) | reuse, regression-watch |
| `src/app/state.ts`, `src/main.ts`, `src/ui/screens/{club-home,match}.ts`, `styles.css`, new `domain/inbox.ts`, `ui/score-line.ts`, `ui/screens/inbox.ts` | extended / created | S-001..S-010 tests guard |
| Pages artifact, base path `/gaffer/` | negligible growth | none |

**Constraint for the protected scenarios and DISTILL (timeouts).** Locked runner `scripts/factory/protected.playwright.config.ts`: `timeout: 20_000` per test, `expect`/`actionTimeout` 2 s, `retries: 0`, `workers: 4`. Any protected S-011 scenario that plays more than a few matchdays (P3: 28+ taps plus the End of season read and "Play again") must call `test.setTimeout(90_000)`; one seed and one club per scenario; keep reads per matchday minimal. The agent e2e (30 s per test, `retries: 1` in CI) needs `test.setTimeout` for the 14-matchday Inbox test.

### Wave: DEVOPS / [REF] Pre-requisites
- S-010 delivered and deployed; Pages source "GitHub Actions" enabled (✓). Node 22+, pnpm 10.12.4, Playwright chromium via `.github/actions/setup`.
- ADR-0001..0018 accepted (✓; ADR-0017 and ADR-0018 landed in DESIGN). `docs/product/jobs.yaml` has J-11 (✓).
- **`tests/protected/S-011/`** does not exist yet (checked). It is written by the plan run's protected-scenarios step from the D9 pin list (append-only, `test.setTimeout(90_000)` where a season is played) and must be committed RED before DELIVER starts; the `ci` no-regression check expects it to fail on main until DELIVER.
- `BASE_URL` derived from owner and repo name (no secret).

### Wave: DEVOPS / [REF] Open questions
Owner-only items inherited from S-001..S-010 (smoke `sleep 20`, no security scanning, no commit-SHA check in smoke, deploy not gated on `ci`, squash revert blocked by append-only guards, no uptime probe, WebKit not probed) are unchanged and none block S-011. New:
1. Changes needed in locked paths: none. No CI, `ci:*`, Stryker, lint-config or Playwright change.
2. Missing `tests/protected/S-011/` is a plan-run item, not a DEVOPS change; flagged for the orchestrator.
3. `tests/e2e/S-010-club-home-regression.spec.ts` is absent from the DISCUSS D8 amend list; DISTILL greps it and amends only if it holds an exact five-button list.
4. Smoke on the live URL runs the Inbox spec in fresh contexts; the `setItem` counter is an init script per context, so it cannot touch a real player's storage.
5. "Back" sits below up to 14 messages (about 1.4k px at 390px); a sticky or earlier "Back" is a later-story option (DESIGN open question), not a platform item.

### Wave: DEVOPS / [REF] Peer review
No per-wave review (none triggered): no novel deployment target and no CI change.

## Plan run: protected scenarios

`tests/protected/S-011/inbox.spec.ts` holds 4 black-box scenarios (Pixel 7, 390px; roles, accessible names and visible text, plus the S-006 "innermost element whose whole text matches" scan for the match screen's score line and the End of season line). They pin only the durable clause (DISCUSS D7, D9) and the conventions every story pins (44px, Back to the club home with its h1 focused, focus on the new h1, no sideways scroll at 390px, no console errors). A matchday message is a list item of "Messages" with a child element reading "Matchday N" first, then a child reading the score line and later a child reading "League position Xth"; items without a "Matchday N" line are skipped (later storylines), and each matchday message must hold no button, link or nested list. Clubs are read from the "Clubs" list and scores and positions from the match screens and the "League table", so no generated name and no tie-break order is pinned; the seed-31 position goldens stay unit and e2e goldens for DISTILL.

1. **P1, offer and empty** (`?seed=31`, 1st club). The club home has "Inbox", 44px or taller; it opens the only h1 "Inbox", focused, with one list "Messages" holding no matchday message; "Back" returns to the club home, h1 focused.
2. **P2, reports and positions** (`?seed=31`, 4th club; 60 s). Three matches, reading each match screen's h1 and score line, then the Table's Pos (every row at P N) after each. The Inbox holds exactly the reports Matchday 3, 2, 1, each with its match screen's score line and "League position" plus the ordinal of the Pos read right after that matchday.
3. **P3, whole season** (`?seed=31`, 1st club; 90 s). Fourteen matches, then "End of season" and its "Final position". The Inbox holds the 14 reports, Matchday 14 down to 1, each with its match screen's score line, and the newest's position line equals "League position" plus the final position.
4. **P4, never rewritten** (`?seed=31`, 6th club; 60 s). Two matches and the Inbox read; "4-3-3" in Tactics: the same reports; reload and "Continue" (back to the club home if it lands elsewhere): the same reports.

Not pinned, by design (version-only): "No messages yet", the exact number of items, the place of "Inbox" among the buttons, the empty Inbox after "Play again" or "New game", the tie-break order behind a position value, and the address seed ("?seed=abc").

All 4 fail on the current app at the "Inbox" check (no such button), after the steps before it ran: under the locked runner P2 got there after three matches and three Table reads, and P3 after fourteen matches and the End of season screen. So the match, Table and End of season helpers are known to hold on the real app. The Inbox-reading helper was checked against throwaway mock markup that follows ADR-0017 (three `<p>` lines with inline spans, an extra non-matchday item, and an empty list). It read the two reports and skipped the other item. The mock was not committed and was deleted. DELIVER is the first to run the Inbox path end to end.

## Wave: DISTILL

Lean, unattended. Reconciliation passed: 0 contradictions (DISCUSS D1..D10, DESIGN DD1..DD9 and the DEVOPS part agree on every point checked: the sixth button after "Table", the derived-only Inbox with no save change, `position` in the type from commit 3, the D8 amend list, the K2 sweep floor, the check that the 390px seed is chosen by sweeping). No new port, so no policy row is added (`docs/architecture/atdd-infrastructure-policy.md` does not exist in this repo; the S-006..S-010 precedent is followed: vitest + fast-check at layers 1-2, Playwright for the browser). Language: TypeScript (`[lang-mode] ts`). Detail: `distill/pending-scenarios.md` (held-out files and the D8 amend patch) and `distill/red-classification.md` (the RED gate).

### Wave: DISTILL / [REF] Scenario list with tags
Every test title carries `@contract-shape:<...>` (the project's existing convention, `pure-function` or `bounded-change`) and Given/When/Then in domain words. 98 cases: 89 acceptance (17 committed, 72 held out) and 9 e2e (held out), plus the 8-file amend patch. About half of the cases are `@error` or `@boundary`.

| File | Cases | Tags | Covers |
|---|---|---|---|
| `tests/acceptance/S-011/inbox-reference-pinned.test.ts` (committed) | 7 | `@regression @walking_skeleton @boundary @property` | DISCUSS seed-31 table and seed 20260 against the real generator (RED-first goldens are true), the 3 name ties, oracle equals `standings` over seeds 1..100, the 390px seed |
| `.../inbox-save-unchanged.test.ts` (committed) | 5 | `@regression @driving_port` | K3: `SAVE_VERSION` 1; an `inbox` screen encodes like the club home; autosave writes nothing |
| `.../names-avoid-inbox-words.test.ts` (committed) | 5 | `@regression @error @boundary` | "Inbox", "Messages", "League position", "No messages yet" in no generated name |
| `.../inbox-reports.test.ts` (held out) | 34 | `@walking_skeleton @driving_port @boundary @error @property` | US-1/US-2 goldens (14 messages, seed 20260), name ties at matchdays 4, 5, 7, Table-order rows, prefix boundary (`<=`), any log order, 0..14 counts, `RangeError` table, frozen inputs |
| `.../inbox-oracle.test.ts` (held out) | 3 | `@property @kpi` | K2: independent oracle (own tallies, no `standings`), seeds 1..300 x 8 clubs x 14 matchdays (floor 1..100 never narrowed) |
| `.../inbox-time-travel.test.ts` (held out) | 2 | `@property @kpi @walking_skeleton` | time-travel oracle: after every tap the Inbox equals `matchFor`/`standingsOf` read right then; tactics changes rewrite nothing (fast-check, `numRuns` 100) |
| `.../inbox-navigation.test.ts` (held out) | 26 | `@walking_skeleton @driving_port @error @boundary @kpi` | `ViewInbox` from a known club's home only (12 no-op rows incl. unknown club), screen-only change with the same objects, `Back` returns the home `toEqual`, `focusPlan`, `inboxOf` counts 0..14, unknown club, restored save |
| `.../inbox-readonly.test.ts` (held out) | 2 | `@property @kpi` | K3: 40-action pool incl. `ViewInbox`: the round trip changes nothing and writes nothing; peeking never changes the season |
| `.../inbox-source.test.ts` (held out) | 5 | `@boundary @error` | ADR-0017/0018 enforcement greps; zero `__SCAFFOLD__` |
| `tests/e2e/S-011-inbox.spec.ts` (held out) | 9 | `@walking_skeleton @driving_port @kpi @boundary @error` | empty state, six buttons in order (Inbox after Table, 44px), focus, 3 and 14 messages with exact lines (seed 31), K1 tap counts (1 and 2), `?seed=abc` = default, `setItem` counter plus click-everything, `innerText` = `textContent` plus computed style, Tactics/reload/Continue, New game after a season, 390px with the longest names (seed 585) |

### Wave: DISTILL / [REF] WS strategy, driving ports, adapter coverage
- **WS**: no new walking skeleton (brownfield). The `@walking_skeleton` tags mark the end-to-end journeys: e2e "3 matches then Inbox" and "14 matches, End of season, Play again", and the unit goldens. Port class decides treatment (no per-feature strategy): driving ports are the real built app at `http://localhost:4173/gaffer/` (Playwright, Pixel 7, 390px) and the pure `update`/`inboxOf`/`matchdayReports` calls; no external port is faked (no clock, network or vendor SDK).
- **Driving ports** (from DESIGN, none new beyond ports 40-43): `matchdayReports`, `update` (`ViewInbox`, `Back`), `inboxOf`, `focusPlan`, `encodeSave`/`saveTextFor` (read-only), the browser roles and names. Each is hit by at least one scenario above.
- **Driven adapters**: none new; the S-010 store is untouched. Table: `localStorage` store (S-010) | `@real-io` e2e | `S-011-inbox.spec.ts` (`setItem` counter and unchanged `gaffer.save` text, Continue after a reload).
- **Environment matrix** (DEVOPS): clean, N matches played, saved game (Continue), no write on navigation, default seed, New game/Play again: each has an e2e case; the longest-names seed is 585 (sweep).

### Wave: DISTILL / [REF] Scaffolds (Mandate 7)
- `src/domain/inbox.ts`: `__SCAFFOLD__`, `MatchdayReport`, `ReportableMatch`, and `matchdayReports` throwing an `Error` whose message starts `__SCAFFOLD__`.
- `src/app/state.ts`: `Action` gains `{ type: "ViewInbox" }` with a throwing `viewInbox` (one `HANDLERS` entry, as the S-010 `Continue` scaffold), and a throwing exported `inboxOf`. The `inbox` `Screen` kind is not added yet (it would break the exhaustive `render`), so no UI path can reach a scaffold; DELIVER step 3 adds it with the real handlers. `ci:lint`, `ci:typecheck` and `ci:test` stay green (1141 tests).
- DELIVER's check: `grep -r __SCAFFOLD__ src/` empty (also asserted by `inbox-source.test.ts`).

### Wave: DISTILL / [REF] Test placement
`tests/acceptance/S-011/` (vitest `include` already globs `tests/acceptance/**/*.test.ts`) and `tests/e2e/S-011-inbox.spec.ts`, as S-006..S-010. Held-out files live in `docs/feature/S-011/distill/pending/{acceptance,e2e}/` with a `.pending` suffix (outside every glob). Shared helpers are reused from `tests/acceptance/S-010/save-world.ts`; the committed `inbox-reference.ts` and `inbox-oracle.ts` are the S-011 data and the independent oracle. Size: committed 163 lines, held out 331 (acceptance) and 296 (e2e) plus the amend patch (19 lines changed each way): about 830 test lines against DESIGN's 380 (see the upstream note below).

### Wave: DISTILL / [REF] Pre-requisites
- DESIGN driving ports 40-43 and ADR-0017/0018; DEVOPS environment matrix (local-preview Pixel 7 390px, fresh contexts, no seeding script needed).
- `tests/protected/S-011/` (4 pins) exists from the plan run; not read here.
- DELIVER order (DD9): (1) `render` lookup, (2) `score-line.ts` extraction, (3) domain + state + screen + button + CSS, moving `inbox-reports/oracle/time-travel/navigation/readonly/source` and applying the amend patch in the same commit, (4) the position line, moving the e2e spec.

### Wave: DISTILL / [REF] Step-reuse note (informational, Mandate-12)
There is no Gherkin step layer (vitest/Playwright, project precedent): the "DSL" is typed helpers. Domain types: `ReferenceReport` (`inbox-reference.ts`), `MatchdayReport` (production). Reuse: e2e helpers `startSeason` 7, `playMatches` 7, `openInbox` 12, `leaveInbox` 6, `readMessages` 9 call sites; acceptance helpers `homeOf`/`afterMatchdays`/`withFormation`/`withPick`/`playSeason` shared across 6 files. Natural ceiling for this shape; Pillar 1 readability (titles in domain words) was kept over forcing reuse.

### Wave: DISTILL / [REF] Upstream issues
None blocking (no `upstream-issues.md`). Notes for the orchestrator and DELIVER:
1. **Size.** DESIGN estimated about 380 test lines; DISTILL has about 830 (committed 163 + held out 627 + patch 38 line-changes), after trimming. With DESIGN's code estimate (about 296) the whole S-011 diff outside `docs/` could reach about 1150 to 1200, against the 1200 cap, if DISTILL and DELIVER ship in one PR. The DELIVER checkpoint trims (merge `inbox-source` into another file, fold `names-avoid-inbox-words`) save about 40 lines; the oracle sweep must stay. If the guard bites, the `human-approved` label is the owner's call.
2. DESIGN says the S-007 regression's "name checks gain Inbox", but that file has no name list (only `toHaveLength(5)` and comments); the patch changes the count, message and comments only.
3. The scaffold `viewInbox` throws from `update`: nothing in the app dispatches it, but nightly Stryker will count the throwing scaffold lines as uncovered until step 3 (as for S-010's `Continue`).

### Wave: DISTILL / [REF] Final wave review dispositions
Four reviewers ran in the foreground (Eclipse, Atlas, Forge, Sentinel).
- **Eclipse (DISCUSS): conditionally approved.** The protected pins are written by the plan run and arrive with the branch. The "five" titles and header comments are covered by the amend patch; DELIVER greps for remaining "five" wording in the amended files. Slice estimates are superseded by the DESIGN numbers (676 / 896).
- **Atlas (DESIGN): conditionally approved.** H1: the amend table does list S-005 line 176 and S-006 line 148 (8 files plus the S-005/S-006 title edits); DELIVER applies `amend-existing-tests.patch` and greps for `five`. H2: DISTILL measured about 830 test lines, so DELIVER must follow the DD9 checkpoint (trim grep tests first; oracle sweep never narrowed; the `human-approved` label is the owner's call if the cap still bites). L1: the S-007 regression row changes the count, message and comments only.
- **Forge (DEVOPS): rejected_pending_revisions, all findings inherited platform posture** (no SAST/SCA, deploy not gated on ci, no SLO/DORA, rollback route). S-011 adds no storage, no pipeline change and no `ci:*` change; `.github/` is locked, so these stay owner items, as accepted at S-010.
- **Sentinel (DISTILL): rejected_pending_revisions (style/mandate).** Accepted as DELIVER-scope notes: the source-grep file is an architecture guard (ADR-0017/0018 Enforcement), not a user-journey scenario, and keeps its code-structure vocabulary on purpose; the committed reference test calls `standings` directly as the independent Table comparator, as the S-007..S-010 acceptance tests do for their domain ports; the `setItem` counter is the K3 observable because a same-text rewrite is invisible otherwise; no state-delta port or Tier-B machine is added (waiver: the repo's fast-check action walks are the Tier-B equivalent, and adding a harness would cost lines against the 1200 cap). Low items F11 (two-matchday points-vs-goal-difference case), F13 (assert the Inbox is opened at least once per property run) and F16 (title wording) are to be folded into the pending files when DELIVER moves them.

## Wave: DELIVER

### Wave: DELIVER / [REF] Implementation summary
The club home has a sixth button, "Inbox" (after "Table"). It opens a screen with the h1 "Inbox" and a list "Messages" holding one read-only message per matchday played, newest first. Each message has the title "Matchday N", the match screen's score line and "League position" with the ordinal after that matchday. Everything is derived from the recorded results (`src/domain/inbox.ts`): no new `GameState` data, no save-format change. Before any match, "No messages yet" is shown. `render` became a lookup (ADR-0018) and the score line and matchday title are shared with the match screen (`src/ui/score-line.ts`).

### Wave: DELIVER / [REF] Files modified
- New: `src/domain/inbox.ts`, `src/ui/score-line.ts`, `src/ui/screens/inbox.ts`, `tests/acceptance/S-011/*` (navigation, oracle, readonly, reference-pinned, reports, save-unchanged, source, time-travel, names-avoid-inbox-words, helpers), `tests/e2e/S-011-inbox.spec.ts`.
- Changed: `src/app/state.ts` (`ViewInbox`, `Back`), `src/main.ts` (render lookup, inbox case), `src/ui/screens/club-home.ts`, `src/ui/screens/match.ts`, `src/ui/styles.css`.
- Amended without weakening (D8, "Inbox" added last to the exact button lists): `tests/e2e/S-005-starting-xi`, `S-006-match`, `S-007-club-home-regression`, `S-007-table`, `S-008-club-home-regression`, `S-008-season`, `S-009-club-home-regression`, `S-009-end-of-season` specs.

### Wave: DELIVER / [REF] Scenarios green
Roadmap: 4 steps (01-01, 01-02, 02-01, 03-01), all DONE. Acceptance: 1213 tests passing. e2e: 155 passing. `tests/protected/S-011/` runs in CI on main.

### Wave: DELIVER / [REF] DoD check
- Inbox button, screen, list, Back, one message per matchday newest first, three lines, empty state: met (acceptance and e2e).
- Position equals the Table's Pos right after each matchday (oracle sweep): met.
- Derived only, read-only, save unchanged, per-season reset: met.
- D8 amendments replace, never weaken: met.
- `ci:*` scripts green; no ambient randomness or clock in `src/domain/`: met.
- Protected S-011 on main: verified by CI after merge.

### Wave: DELIVER / [REF] Quality gates
- Refactor pass done (inbox derivation helper, empty list height, stale comment).
- Reviewer (Haiku) found no production defects. Its blocker B1 (missing "Outcome anchor" tag in tests) is declined: earlier stories' tests do not carry it and it is an nWave template convention, not a repo rule.
- Mutation testing is nightly-delta, so `/nw-deliver` Phase 5 was skipped.
- `des-verify-integrity` passed (all 4 steps have complete DES traces).
- Honest note: the 02-01 RED phase was logged without a separate observed run (RED and GREEN share a timestamp), though the scaffolds threw by construction. 01-01 and 01-02 RED were SKIPPED as NOT_APPLICABLE (behaviour-preserving refactors).
