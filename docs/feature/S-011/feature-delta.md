# S-011: Read my club's news in the Inbox

Status: DISCUSS done (lean, unattended, revision 1). DESIGN, DEVOPS, the protected-scenarios step, DISTILL and DELIVER follow.

## Wave: DISCUSS

Lean and unattended. Reuses `discuss/journey.md` and `slices/slice-01..02`. North star: "manage one fictional club through one short season, on a phone browser, start to finish". Vision: 5-minute sessions on the bus. Since S-010 a season spans many sessions. But an already played match can never be re-opened (S-008, S-009), and the Table only shows where the club stands now. So when Sam comes back after "Continue", he cannot re-read how earlier matchdays went or see how his league position has moved. scope.md IN says: "Inbox/news feed with match reports and simple storylines". The smallest next visible increment is a sixth club-home button, "Inbox". It opens a list of messages, one report per matchday played, newest first. Each report gives the matchday, his club's score line and his league position right after that matchday. Everything is derived from the recorded results: there is no match-model change, no new RNG stream, no new `GameState` data and no save-format change. Narrowed by scope.md precedence (ship less): storylines, player form, other clubs' results, scorers, unread markers and tapping a message are cut. Feature type: user-facing. UX depth: lightweight. Walking skeleton: no (brownfield, extends S-001..S-010). JTBD: yes, new job J-11. No DIVERGE artifact (accepted as lean, as for S-002..S-010).

### Wave: DISCUSS / [REF] Scope Assessment
PASS. The story has 2 small user stories with 9 scenarios in total (US-1 has 5, US-2 has 4) and is 1 roadmap story. It adds one button, one screen, one pure selector and one lookup refactor, for one demonstrable outcome: "I look back over my season". It adds no new seam: no storage change, no new RNG stream and no domain change, except perhaps reusing `standings` over part of the results log. The 2 carpaccio slices are ordered DELIVER commits of one story (S-011), shipped in ONE merge: slice 01's commits come first and slice 02's follow on the same branch. Slice 01 is never released on its own, so main never gets an Inbox whose messages lack the position line that the durable list (D7) promises. About 1 day. There are 4 integration points: the club home, the recorded results, the standings, and the S-010 save (read-only: it is unchanged). That is under the limit. No oversized signal: storylines, badges and other clubs' results are cut (Out-of-scope).

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
Sam, 34, a lapsed Championship Manager fan. He plays on the bus, one-handed, on a mid-range Android phone 390px wide, with 5 minutes to spare (persona from `docs/feature/S-001/feature-delta.md`). A season is 14 matches; he plays two or three per trip and, since S-010, carries on with "Continue" days later. Between trips he forgets how the last matches went and whether his club is climbing or slipping.

### Wave: DISCUSS / [REF] JTBD one-liner
When I come back between matches, I want to look back over how my season has gone, so that I can see whether my decisions are paying off. Recorded as J-11 `follow-my-seasons-story` in `docs/product/jobs.yaml`. It builds on J-07 "see where we stand" and J-10 "carry on my season".

### Wave: DISCUSS / [REF] Glossary
- **Inbox**: the screen opened by the club home's "Inbox" button. Its h1 is "Inbox" and it holds the list "Messages".
- **Message**: one item of the "Messages" list. It is read-only text: no button and no link.
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
- **D5 Empty state.** Before any match the list holds no item, and the screen shows a line reading exactly "No messages yet". This text is a rule of this version only.
- **D6 Derived only, nothing new stored.**
  - Messages come from the recorded results and the seed. There is no new `GameState` data and no save-format change.
  - The same seed, club and choices give the same Inbox, and "?seed=abc" gives the same Inbox as no seed. After a reload and "Continue" the Inbox shows the same messages.
  - Changing Tactics or the Starting XI never changes a message.
  - "New game" or "Play again", then picking a club, gives an empty Inbox.
  - Opening the Inbox changes nothing in the game and writes no save (navigation is not saved, S-010).
  - Messages are read-only text: no message is or holds a button or link, and an already played match still cannot be re-opened.
- **D7 Durable list.** These hold in every later version, within each season:
  - the club home offers "Inbox";
  - its screen has the only h1 "Inbox" and a list named "Messages";
  - for each matchday played in the season there is exactly one message whose title line reads "Matchday N", newest first, with that matchday's score line and its "League position" line in these formats.

  Later versions MAY add other kinds of message to the same list (storylines, player form), as long as none of them has a line reading "Matchday N". Rules of this version only: the "No messages yet" text, the exact number of items (as opposed to the number of matchday reports), and the position of "Inbox" after "Table".
- **D8 Amendment (club home).** This version adds a sixth button to the club home. No earlier outcome fixes the number of club-home buttons: S-005..S-010 name the buttons that "stay", never a count. Their durable lists are unchanged.
  - No protected scenario counts the club-home buttons. `tests/protected/S-007`, `S-008` and `S-009` check only that the named buttons are visible.
  - Non-protected tests to amend: each exact five-button list gains "Inbox" last, so they are replaced, never weakened. DISTILL fixes the final list:
    - `tests/e2e/S-005-starting-xi.spec.ts` (about line 176);
    - `tests/e2e/S-006-match.spec.ts` (about line 148);
    - `tests/e2e/S-007-table.spec.ts` (the test "The club home has five buttons ...", about line 225; title and list);
    - `tests/e2e/S-007-club-home-regression.spec.ts` (`toHaveLength(5)`, about line 24);
    - `tests/e2e/S-008-club-home-regression.spec.ts` (about line 25, header comment);
    - `tests/e2e/S-008-season.spec.ts` (about lines 252 and 254, the list and the `.club-actions` children);
    - `tests/e2e/S-009-club-home-regression.spec.ts` (about line 46, header comment);
    - `tests/e2e/S-009-end-of-season.spec.ts` (about lines 137 and 139).
- **D9 Protected pin list.** The plan run's protected-scenarios step writes these later. Each must fail on today's app, which has no "Inbox". The pins check only the durable list (D7): they count the messages that have a line reading "Matchday N", never all items; they check order only among those messages; and they do not check "No messages yet" or where "Inbox" sits among the buttons.
  - **P1:** at `?seed=31`, "New game", then the first club. The club home has an "Inbox" button 44px or taller. "Inbox" shows the h1 "Inbox", focused and the only h1, and a list "Messages" with no message that has a "Matchday N" line. "Back" returns to the club home with its h1 (the club's name) focused.
  - **P2:** at `?seed=31`, 3 times "Play match", reading the h1 and the score line, then "Back", "Table", reading the club's Pos, then "Back". "Inbox" shows 3 matchday reports in the order "Matchday 3", "Matchday 2", "Matchday 1". Each has the score line read on that match screen and "League position" with the ordinal of the Pos read right after it. The list holds no button and no link.
  - **P3:** at `?seed=31`, all 14 matchdays played, then "End of season" with its "Final position" read. "Inbox" shows 14 matchday reports, the first "Matchday 14" and the last "Matchday 1", and the first one's position line equals "League position" plus the Final position value. Then "Back", "End of season", "Play again", the same club, "Inbox": no matchday report.
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
2. `slices/slice-02-league-position-line.md` (US-2): the "League position" line per message, using the standings after each matchday. Value 4 x 4 / 0.5 = 32, but it depends on slice 01. Without it the Inbox tells results but not the season's story (climbing or slipping), and the durable list (D7) would be incomplete.

Priority rationale: S-010 made the season span many sessions, but a played match can never be re-opened and the Table shows only today. So Sam comes back after "Continue" with no memory of the season's shape. The Inbox is the remaining scope.md IN item that is (a) derived only from facts already recorded, so there is no match-model change, no new RNG stream and no save-format bump, and (b) about the whole season, which is the J-08/J-10 thread of the last three stories. Rejected alternatives:
- **Quick-sim commentary and basic stats (shots, possession, cards) first.** They are the other remaining scope.md IN item, but they deepen one match rather than the season across sessions. They need a match-model extension (new events, likely a new stream). They also need either a save-format bump (`SAVE_VERSION`, ADR-0016), so that results already saved can show their stats, or recorded stats that older saves lack. More risk, more lines, and it fits better once the Inbox has made matches re-readable.
- **Storylines or player form in the Inbox now.** They need rules for what counts as a story; a later story can add them to the same list (D7).
- **Unread markers or a badge count on "Inbox".** They need stored read state, which means a save-format change. Later.
- **Other clubs' results in each message.** More text per message on a 390px phone, and not Sam's job ("how has my season gone"). Later.
- **Tapping a message to re-open its match screen.** It reverses S-008/S-009's "an already played match cannot be re-opened" and adds a screen state. Later.

Slice-to-clause map (one roadmap outcome, two slices, one merge):

| Outcome clause | Slice | Durable or version-only |
|---|---|---|
| "Inbox" (44px or taller) on the club home from the club pick, after matchday 14 and after "Continue" | 01 | durable (the offer) |
| "Inbox" placed after "Table", the other buttons unchanged in order | 01 | version-only (placement) |
| Only h1 "Inbox", focused; list "Messages"; "Back" to the club home, heading focused | 01 | durable |
| One message per matchday played, newest first, title "Matchday N", the match screen's score line | 01 | durable |
| Exactly N items after N matches | 01 | version-only (exact count) |
| "No messages yet" before any match | 01 | version-only |
| "League position" line: position right after that matchday; newest equals the Table, matchday 14 equals "Final position" | 02 | durable |
| Derived only: same seed same Inbox, reload and Continue the same, tactics never change a message, a new game gives an empty Inbox, nothing saved, read-only | 01, 02 | durable |
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
  And no item holds a button or a link

Scenario: Reading the Inbox changes nothing in the season
  Given Sam at "?seed=31" managing "Netherwold Borough" has played 3 matches and read every row of "Table"
  When Sam taps "Inbox", "Back" and "Table"
  Then every row reads the same, cell for cell
  When Sam taps "Back" and "Play match"
  Then the screen title is "Matchday 4"

Scenario: The Inbox survives a team change and a reload
  Given Sam at "?seed=31" managing "Netherwold Borough" has played 2 matches and read the 2 messages in "Inbox"
  When Sam taps "Back", chooses "4-3-3" in "Tactics", taps "Back" and "Inbox"
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
- Unit and property: the position after matchday N equals the managed club's `position` in `standings(clubs, results with matchday <= N)`, checked against an independent oracle that sorts the cumulative rows with the ADR-0013 order. It runs over seeds 1..300 x 8 clubs x matchdays 1..14 with untouched tactics; DISTILL may trim the sweep (K2).
- Fast-check (numRuns 100, fresh `FC_SEED`) over random formation, pick and "Play match" sequences: messages never change when tactics change after a match.

**Outcome KPI:** K1, plus the guardrail K2 (below).
**Technical notes (for DESIGN, not AC):**
- Position after N: `standings` (ADR-0013) over the prefix of `results` with matchday <= N, plus `formatOrdinal` (S-009, `standings.ts`). Both already exist, so there is no new domain rule and the tie-breaks are exactly the Table's.
- Cost: at most 14 standings over at most 56 results each, which is negligible on a phone. DESIGN decides whether to fold cumulatively.
- Depends on US-1.

Notes for DESIGN and DISTILL (not part of the AC):
- "Has focus" means `document.activeElement` is the `<h1>`. Locators use `exact: true` for "Inbox", "Back", "Continue", "New game", "Play again", "End of season", "Play match" and the h1.
- "Read as one piece of text": each of the three lines is one element whose `textContent` and `innerText` read the exact line, as with S-009's season lines (inline flow only, no generated content). Message titles may be plain text or sub-headings (DESIGN decides). The pins check only that "Inbox" is the only h1, never the total number of headings.
- Names check: no generated club or player name holds "Inbox", "Messages", "League position" or "No messages yet".
- A protected season is 28+ taps: one seed per scenario, and `test.setTimeout(90_000)` as headroom (S-008..S-010 precedent).

### Wave: DISCUSS / [REF] Outcome KPIs
K1 is the one user outcome KPI. K2 and K3 are CI guardrails: they keep the KPI honest, and they do not measure behaviour.

| # | Kind | Who | Does what | By how much (target) | Baseline | Measured by |
|---|---|---|---|---|---|---|
| K1 | User outcome KPI | Sam on a 390px phone, mid-season, after "Continue" | Re-reads how any played matchday went and where his club stood after it | 1 tap from the club home ("Inbox") for every matchday 1..N at once, 2 taps from the title ("Continue", "Inbox"); in the owner's Friday demo the owner states the club's position path (for example "8th after two, 2nd after nine") from the Inbox alone | Impossible: a played match cannot be re-opened and the Table shows only today; the path must be remembered | e2e tap counter (as S-003..S-010), and the owner's Friday demo |
| K2 | CI guardrail | the CI run | Proves the Inbox agrees with the game | 0 differences between message N and match screen N (h1 and score line) and between its position and the Table's Pos after matchday N, over the oracle sweep (seeds 1..300 x 8 clubs x 14 matchdays, trimmable) | n/a (no Inbox) | selector goldens, the oracle property test, pins P2, P3 |
| K3 | CI guardrail | the CI run | Proves the Inbox never changes the game | 0 changes to `formation`, `xi`, `results` or the saved text from opening the Inbox and going back, over 100 fast-check runs; 0 message changes after tactics changes | n/a | fast-check property, pin P4, e2e storage check |

Other guardrails:
- S-001..S-010 protected scenarios stay green.
- The league, squads, schedule, every result, the save format and the S-006..S-010 goldens are unchanged for every seed.
- No ambient randomness or wall-clock time in `src/domain/` or in the selector.
- No sideways scroll at 390px with the longest score lines (two three-word club names), and 0 console errors.
- No analytics in the POC. In the owner's Friday demo, the owner continues a season and tells its story from the Inbox.

### Wave: DISCUSS / [REF] DoD
- `tests/protected/S-011/` passes on main. This plan run's protected-scenarios step writes it from the D9 pin list, and the pin files are committed RED on main before the first DELIVER commit. It is append-only and does not exist before that step.
- `tests/protected/S-001/` to `S-010/` still pass on the DELIVER branch.
- Unit and property tests pass for the intents above: selector goldens, the position oracle sweep, read-only and save-unchanged properties, tactics changes, and the names check. The `ci:*` scripts are green.
- The e2e phone smoke covers: the button and its height; the Inbox h1 and focus; "No messages yet"; the exact counts and order after 3 and 14 matches; the seed-31 figures above; D6 ("?seed=abc" equals no seed, reload and Continue, the stored "gaffer.save" text unchanged by opening the Inbox); no sideways scroll at 390px; 0 console errors.
- The D8 amendments replace, never weaken: each five-button list becomes the six-button list. No other S-001..S-010 acceptance assertion is edited.
- `render` is moved to a lookup before the inbox case is added, and lint complexity stays under 15.
- Slices 01 and 02 are ordered commits in one DELIVER merge, under the 1200-line PR guard: about 505 lines, and about 725 with the protected file.

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
- `tests/protected/S-011/` is written by this plan run's protected-scenarios step from the D9 pin list, after this DISCUSS (append-only). It is not claimed to exist yet.
- D8 lists the non-protected e2e tests that DELIVER amends.

### Wave: DISCUSS / [REF] Roadmap outcome (draft)
From the club home screen the player taps a button named exactly "Inbox" (44px or taller), placed after "Table". The club home's heading (the club's name) and its buttons "Squad", "Tactics", "Starting XI", "Play match" (or, once all 14 matchdays are played, "End of season") and "Table" stay, in this order. "Inbox" is there from the moment a club is picked, also after matchday 14 and after "Continue". Tapping "Inbox" opens a screen whose only top-level heading (h1) reads exactly "Inbox", focused on arrival, with a list named exactly "Messages". The list holds exactly one item (a message) per matchday the season has played so far, newest first: after N matches (N from 0 to 14) it holds N items, the first for matchday N and the last for matchday 1. Each message shows three lines, each read as one piece of text, in this order. First, the title "Matchday N", where N is that message's matchday (a whole number from 1 to 14): the same text as the h1 of that matchday's match screen. Second, the score line of the player's club's match on that matchday: exactly the same text as that match screen's score line (pattern ^(.+) (\d)–(\d) (.+)$, with an en dash), for example "Rushmoor Heath Albion 2–1 Netherwold Borough". Third, "League position" followed by one space and the ordinal of the club's Pos in the table named "League table" right after that matchday was played, one of "1st", "2nd", "3rd", "4th", "5th", "6th", "7th" or "8th" (pattern ^League position (1st|2nd|3rd|4th|5th|6th|7th|8th)$), for example "League position 3rd". So the newest message's position equals the club's Pos on the "Table" screen now, and after matchday 14 it equals the "Final position" on the "End of season" screen. An older message keeps the position the "Table" screen showed right after its matchday, even when the table has moved since. Before the first match the list holds no item, and the screen shows a line reading exactly "No messages yet". Messages are read-only text: no message holds a button or a link, and an already played match still cannot be re-opened. A button named exactly "Back" (44px or taller) returns to the club home with focus on its heading, the club's name. Everything in the Inbox comes from the season's recorded results and the seed, and nothing new is stored (the saved game is unchanged). Two fresh visits with the same "?seed=", the same club and the same choices show the same Inbox, "?seed=abc" shows the same Inbox as no "?seed=" in the address, and after a reload and "Continue" the Inbox shows the same messages. Changing "Tactics" or the "Starting XI" never changes a message. "New game" or "Play again", then picking a club, gives an empty Inbox. Opening the Inbox changes nothing in the game and saves nothing. This version adds a sixth button to the club home. The S-005 to S-010 outcomes name the club-home buttons that stay but never fix their number, and their durable lists are unchanged. These hold in every later version of the game, within each season: the club home offers "Inbox"; its screen has the only h1 "Inbox" and a list named "Messages"; and for each matchday played in the season there is exactly one message whose title line reads "Matchday N", newest first, with that matchday's score line and its "League position" line in these formats. Later versions may add other kinds of message to the same list, as long as none of them has a line reading "Matchday N". The "No messages yet" line, the exact number of items in the list (as opposed to the number of matchday messages) and the place of "Inbox" after "Table" are rules of this version only. No horizontal scroll at 390px and no console errors.

### Wave: DISCUSS / [REF] DoR validation
| # | Item | Status | Evidence |
|---|---|---|---|
| 1 | Problem clear, domain language | PASS | US-1: after "Continue", a played match cannot be re-opened and the Table gives only totals, so Sam cannot re-read how matchdays 1 to 3 went. US-2: the Table shows only today, so the climb or slide of his season, and whether his changes paid off, is lost |
| 2 | Persona specific | PASS | Sam, 34, one-handed on a bus, 390px Android, 5 minutes, two or three matches per trip, continuing days later (S-010) |
| 3 | 3+ domain examples, real data | PASS | Real generator output (`S-008/discuss/reference-season.md`): the seed-31 Netherwold Borough score lines for matchdays 1 to 14, with positions hand-derived from them and anchored to S-010's checked table after matchday 2 and "Final position 3rd"; the matchday-4 name tie; the seed-20260 Oakhampton Rise Borough matchday 1. US-1 has 4 examples, US-2 has 5 |
| 4 | UAT Given/When/Then, 3-7 | PASS | 9 for S-011 (US-1 5, US-2 4). Every Given and When is a tap sequence or a reload on the real app; every Then reads only what an earlier step read, a fixed label, or a hand-derived figure that DISTILL confirms |
| 5 | AC derived from UAT | PASS | Project convention since S-001: the AC are the embedded Gherkin scenarios. D1, D2 and D5 are in US-1 scenario 1; D3 in US-1 scenarios 2 and 5; D4 in US-1 scenario 2 and US-2 scenarios 1 to 3; D6 in US-1 scenarios 3 to 5 and US-2 scenario 4; D7 to D10 are covered by the pin list, unit tests, e2e and review |
| 6 | Right-sized | PASS | 2 slices (ordered commits, one merge) in about 1 day; about 505 changed lines in DELIVER including tests, about 725 with the protected file, under the 1200-line PR guard; one outcome |
| 7 | Technical notes | PASS | Per story: a selector over `results` with no new `GameState` key (the five-key test) and no save change (ADR-0016); one score-line source shared with the match screen; the `render` lookup first; `standings` over a results prefix plus `formatOrdinal` |
| 8 | Dependencies tracked | PASS | S-001..S-010 delivered. The `render` lookup is a prerequisite (S-009 DESIGN Open question 1). D8 lists the 8 non-protected e2e files with five-button lists; no protected scenario counts the club-home buttons. J-11 added. `tests/protected/S-011/` follows from this plan run's protected-scenarios step and is committed RED before DELIVER |
| 9 | Outcome KPI measurable | PASS | K1, the user KPI: 1 tap from the club home to every matchday's report and position (e2e tap counter, Friday demo). Guardrails: K2, 0 disagreements with the match screens and the Table over the oracle sweep; K3, 0 state or save changes from opening the Inbox over 100 fast-check runs |

DoR status: PASSED (both stories). Every story has `job_id` J-11 and an Elevator Pitch.

### Wave: DISCUSS / [REF] Peer review
Pending: the orchestrator runs the `nw-product-owner-reviewer` cycle (at most 2) on this section, `discuss/journey.md`, the two slices, J-11 and the S-011 roadmap entry.
