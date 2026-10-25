# S-009: See how my season ended

## Wave: DISCUSS

Lean, unattended, revision 1. Reuses `discuss/journey.md` and `slices/slice-01..02`. North star: "manage one fictional club through one short season, on a phone browser, start to finish". Success: the owner plays a full season and *wants* to start a second one. S-008 made the season playable to matchday 14 but ends it with a plain "Season over" line, which S-008 marked as this version only and named the end-of-season screen as a later story. scope.md IN says: "End-of-season screen (final position, top scorer, 'play again')". Everything it needs is already recorded: the 56 results of the season (ADR-0012, ADR-0014) hold every score and every scorer, and the table (ADR-0013) holds the final position. So the smallest next visible increment is: after matchday 14 the club home offers "End of season", a screen with the final position and the club's top scorer, and "Play again" starts a fresh season of the same league. Narrowed by scope.md precedence (ship less): a league-wide top scorer, awards, other results, save and continue and a different league on "Play again" are later stories. Feature type: user-facing. UX depth: lightweight. Walking skeleton: no (brownfield, extends S-001..S-008). JTBD: yes, new job J-09. No DIVERGE artifact (accepted as lean, as for S-002..S-008).

### Wave: DISCUSS / [REF] Scope Assessment
PASS: 2 small user stories with 8 scenarios in total (5, 3), 1 roadmap story, one new screen and one demonstrable outcome ("I see how my season ended and can play it again"). No new context: it reads the results log (ADR-0012) and the standings (ADR-0013), adds one screen and two actions in the app state, and reuses the S-001 pick-a-club screen. 2 carpaccio slices, one release (one DELIVER), about 1 day. Integration points: results log, standings, squad order (S-002), club home, pick-a-club screen: 5, at the limit, not over it. No oversized signal: league-wide stats, persistence and a new league are cut (Out-of-scope).

Line budget (changed lines, code plus tests; file names are indicative, and DESIGN names the files). The one hard cap is the 1200-line PR guard.

| File | Kind | Lines |
|---|---|---|
| `src/app/state.ts` (end-of-season screen and its two actions, final position and top-scorer selectors, "Play again" reset) | code | 55 |
| `src/ui/screens/end-of-season.ts` (new), `src/ui/screens/club-home.ts`, `src/main.ts`, `src/ui/styles.css` ("End of season" button in the "Play match" slot) | code | 55 |
| `tests/acceptance/S-009/*.test.ts` (unit and property: ordinal, top scorer incl. tie, one goal and none, final position equals the table, "Play again" reset, Back, names check) | tests | 170 |
| `tests/e2e/S-009-end-of-season.spec.ts` (seed-31 golden screen at 390px, focus, 44px; trimmed to what protected does not cover) | tests | 90 |
| Amended S-008 non-protected "Season over" assertions (D7) | tests | 40 |
| **DELIVER total** (code 110, tests 300) | code and tests | **410** |
| `tests/protected/S-009/*.spec.ts` (written in the plan run, outside DELIVER; estimate) | tests | 250 |
| **Grand total** (with protected) | code and tests | **660** |

### Wave: DISCUSS / [REF] Persona
Sam, 34, a lapsed Championship Manager fan. He plays on the bus, one-handed, on a mid-range Android phone 390px wide, with 5 minutes to spare (persona from `docs/feature/S-001/feature-delta.md`). He has played all 14 matchdays and read the final table. Now he wants the season summed up (where he finished, who carried his team) and a quick way to have another go.

### Wave: DISCUSS / [REF] JTBD one-liner
When my club's last match of the season is played, I want to see where we finished and who scored our goals, and to start again at once, so that the season feels complete and I can try to do better. (Recorded as J-09 `see-how-my-season-ended` in `docs/product/jobs.yaml`; it follows J-08, whose "closure of a final position" it completes.)

### Wave: DISCUSS / [REF] Glossary
- **Season complete**: all 14 matchdays recorded (56 results); S-008's "season over". Derived from the results log, never stored.
- **End of season screen**: the screen behind the club-home button "End of season": h1 "End of season", the "Final position" line, the "Top scorer" line, "Play again" and "Back".
- **Final position**: the club's Pos in the League table after matchday 14, written as an ordinal: 1st, 2nd, 3rd, 4th, 5th, 6th, 7th, 8th.
- **Club goals of a player**: the number of items naming that player and the player's club on the club's 14 match screens' "Goals" lists. **Top scorer**: the club player with the most club goals; ties go to the tied player listed first in the club's "Squad" list.
- **Play again**: start a new game of the same league (same seed) at once, without the title screen.
- **Recorded result**, **Standings**, **Table row**, **Untouched tactics**, **Score line**, **Next matchday**, **Reference season**: as in S-006..S-008.

### Wave: DISCUSS / [REF] Locked decisions
- D1 Entry: once all 14 matchdays are played, the club home shows, in the slot where "Play match" was, a button named exactly "End of season" (44px or taller); S-008's "Season over" line is removed. The heading (the club's name) and "Squad", "Tactics", "Starting XI" and "Table" stay. Before matchday 14 is played there is no "End of season" button and "Play match" is there as before.
- D2 Screen: tapping "End of season" opens a screen whose only h1 is "End of season", focused on arrival. Its lines, each read as one line of text (label, one space, value: the S-003 stat-line style), in this order:
  - "Final position" and the ordinal of the club's Pos in the League table after matchday 14 (1st..8th), for example "Final position 3rd". It equals that club's Pos on the "Table" screen.
  - "Top scorer", the top scorer's name, one space and the count in round brackets, "(N goals)", or "(1 goal)" for one; for example "Top scorer Garrick Thistlewood (5 goals)", "Top scorer Orrin Yarrow (1 goal)". Pattern: ^Top scorer (.+) \((\d+) goals?\)$, "goal" exactly when N is 1. N equals the number of items naming that player and the club on the 14 "Goals" lists, and no club player has more. Ties: the tied player listed first in the club's "Squad" list. If the club scored no goal all season the line reads exactly "Top scorer none". Player names are unique within a league and hold no round brackets.
  - Then a button named exactly "Play again" and a button named exactly "Back", both 44px or taller.
- D3 Play again: starts a new game at once with the same seed as the address and lands on the pick-a-club screen that "New game" on the title screen shows (heading focused, the "Clubs" list of the same league, the same 8 names in the same order). Everything of the old season is gone: no results (after picking a club the table is all zero in A to Z order), formation "4-4-2", the automatic Starting XI, and the next "Play match" plays "Matchday 1". Same seed, same club and the same choices play the same season again. A different league needs a different "?seed=" and a reload (open question for a later story). Where "Play again" lands is a rule of this version only (a later "next season" or save story may change it).
- D4 Back: returns to the club home with focus on its heading, the club's name, still showing "End of season" and no "Play match"; "Table" still reads P 14 on every row. "End of season" can be opened again and reads the same. Played matches cannot be re-opened.
- D5 Derived only: everything on the screen comes from the recorded results and the seed. Nothing new is stored and there is no new RNG stream; the same seed, club and choices give the same End of season screen, and "?seed=abc" gives the same screen as no "?seed=". Results still last only until the page is reloaded (save and continue is a later story).
- D6 Durable, in every later version, within each season: once the season's 14 matchdays are played the club home offers "End of season" (and does not before); its screen has the only h1 "End of season", the "Final position" line equal to the Table's Pos of the club, the "Top scorer" line in this format and by this rule (ties, "(1 goal)", "none"), and "Back" to the club home. Version only: where "Play again" lands. S-008's "Season over" line is replaced; S-008 marked it version only and its durable list is unchanged (no protected S-008 scenario checks the line).
- D7 Amended non-protected S-008 assertions: the "Season over" line checks are replaced (never weakened) by the "End of season" button checks. Indicative list (DISTILL fixes it): `tests/e2e/S-008-season.spec.ts`, `tests/e2e/S-008-club-home-regression.spec.ts`, `tests/acceptance/S-008/season-end.test.ts`. The S-008 names check keeps passing (it guards a phrase no longer shown; DESIGN may keep or retire it). A "Play match" action after matchday 14 stays a no-op.
- D8 Phone first and regression: no horizontal scroll at 390px, buttons 44px or taller, no console errors, text through `el()`/`textContent` (ADR-0002), focus on the new h1 after every navigation and renderers never move focus (ADR-0008). All S-001..S-008 protected scenarios stay green. Locators use `exact: true`: the town "Saltmarsh End" (seed 2) holds "End" but no generated name holds "End of season", "Final position", "Top scorer" or "Play again" (DISTILL adds a unit check, as S-008 D9).

### Wave: DISCUSS / [REF] Story map and priority
Backbone: pick club, club home, squad, tactics, starting XI, play next match, see table, **see how the season ended**, **play again**, (next: save and continue, other results, a next season). Walking skeleton: the existing S-001..S-008 loop; this story closes it into a full cycle (season, end screen, new season). One release with two thin slices, both in the one S-009 DELIVER:
1. `slices/slice-01-end-of-season-screen.md` (US-1): the "End of season" button, the screen with the final position and the top scorer, and "Back". Value 5 x urgency 5 / effort 2 = 12.5. It comes first: it is the closure the north star asks for and the screen "Play again" lives on.
2. `slices/slice-02-play-again.md` (US-2): "Play again" starts a fresh season of the same league. 5 x 4 / 1 = 20, but it depends on slice 01. It turns "I finished" into "one more go", the success criterion of the brief.

Priority rationale: the brief's success is a full season that makes the owner *want* a second one; S-008 left the season with a one-line end and no way back in short of a reload. Rejected alternatives: save and continue first (the factory chose the end of season because it closes "start to finish" and S-008 named it next; a saved season still has no ending); an automatic jump to the end screen after the 14th match (it would hide the matchday-14 match screen and change S-008's "Back" to the club home; one tap is cheap); a league-wide top scorer or golden boot (needs every club's scorers on the screen and a cross-club tie rule; the scope line reads "top scorer" and the narrower reading ships less).

### Wave: DISCUSS / [REF] User stories
Fixtures from the real generator (untouched tactics: every side automatic 4-4-2), checked in this plan run with the domain code. At `?seed=31` Netherwold Borough (club 0) finishes 3rd (P 14, W 7, D 2, L 5, GD "+2", Pts 23; `S-008/discuss/reference-season.md`) with 21 goals: Garrick Thistlewood (FW, squad #14) 5, Merrick Hartwell (FW, #17) 5, Calder Ashcombe (DF, #3) 3, Ivo Elderkin (MF, #9) 3, Bram Pemberly (DF, #7) 2, Calder Redfern (MF, #8) 1, Dorian Dunmore (MF, #10) 1, Joren Dalrymple (MF, #12) 1. The top count is a tie, and Thistlewood is listed before Hartwell in the "Squad" list. At the default seed 20260 (`?seed=abc`) Oakhampton Rise Borough finishes 2nd (P 14, Pts 21) with 21 goals; Joren Northcott (FW, #17) scores 8, outright. At `?seed=13` Ashworth Vale Rovers (8th in the "Clubs" list) scores 3 all season, one each by Orrin Yarrow (DF, #3), Fenwick Ballantyne (DF, #4) and Yorick Yarrow (MF, #12). Over seeds 1..300 x 8 clubs a tie at the top happens in 444 of 2400 seasons (18.5%), and no season has 0 goals (the "none" line is a unit-level rule). Squad numbers are 0-based positions in the "Squad" list.

#### US-1: See my final position and top scorer
**Problem:** Sam has played all 14 matchdays. The club home says "Season over" and nothing else. To learn where he finished he must open the table and find his row, and who carried his team is spread over 14 match screens he can no longer open. The season ends with a shrug instead of a verdict.
**job_id:** J-09

##### Elevator Pitch
- Before: after matchday 14 Netherwold Borough's home shows the plain line "Season over".
- After: Sam taps "Back" after "Matchday 14", taps "End of season" where "Play match" was, and sees the screen title "End of season", "Final position 3rd" and "Top scorer Garrick Thistlewood (5 goals)", then "Play again" and "Back".
- Decision enabled: was that a good season, who do I build my side around, and do I play another one?

**Domain examples**
1. `?seed=31`, "Netherwold Borough", untouched tactics, 14 x ("Play match", "Back"): the club home shows "End of season" and no "Play match". "End of season": "Final position 3rd", "Top scorer Garrick Thistlewood (5 goals)". Merrick Hartwell also has 5; Thistlewood is listed first in the "Squad" list.
2. `?seed=abc`, "Oakhampton Rise Borough", 14 matches: "Final position 2nd", "Top scorer Joren Northcott (8 goals)" (outright); the same screen with no "?seed=" in the address.
3. `?seed=13`, "Ashworth Vale Rovers", 14 matches, 3 goals all season: "Top scorer Orrin Yarrow (1 goal)" (a three-way tie at 1, singular "goal"). After 13 matches (any seed) the club home still shows "Play match" and no "End of season". A season with no goal reads "Top scorer none" (unit test with a constructed results log).

**Acceptance criteria (embedded UAT)**
```gherkin
Scenario: The club home offers End of season once, and only once, all 14 matchdays are played
  Given Sam at "?seed=31" managing "Netherwold Borough" has tapped "Play match" and "Back" 13 times
  When Sam reads the buttons of the club home
  Then the club home has a button named "Play match" and no button named "End of season"
  When Sam taps "Play match" and then "Back"
  Then the club home heading "Netherwold Borough" has focus
  And the club home has a button named "End of season", 44px or taller, and no button named "Play match"
  And the club home does not show the text "Season over"
  And the buttons "Squad", "Tactics", "Starting XI" and "Table" are still there

Scenario Outline: The End of season screen shows the club's final position and its top scorer
  Given Sam opens a fresh page at "<seed>", taps "New game", taps "<club>", taps "Squad" and reads the order of the 18 names, taps "Back"
  And Sam taps "Play match" and "Back" 14 times, reading each match screen's "Goals" list
  And Sam taps "Table", reads the Pos of "<club>" and taps "Back"
  When Sam taps "End of season"
  Then the screen title "End of season" is the only h1 and has focus
  And a line reads "Final position " followed by the ordinal of that Pos (1st, 2nd, 3rd, 4th, 5th, 6th, 7th or 8th)
  And a line matches ^Top scorer (.+) \((\d+) goals?\)$, with "goal" exactly when the count is 1
  And the named player has that many items naming him and "<club>" over the 14 "Goals" lists, and no "<club>" player has more
  And no "<club>" player with as many is listed before him in the "Squad" list
  And there are buttons named "Play again" and "Back", each 44px or taller
  Examples:
    | seed      | club                    |
    | ?seed=31  | Netherwold Borough      |
    | ?seed=abc | Oakhampton Rise Borough |

Scenario: A one-goal top scorer reads "1 goal"
  Given Sam at "?seed=13" managing "Ashworth Vale Rovers" has played 14 matches and tapped "Back"
  When Sam taps "End of season"
  Then a line reads exactly "Top scorer Orrin Yarrow (1 goal)"

Scenario: Back returns to the finished season
  Given Sam at "?seed=31" managing "Netherwold Borough" is on the End of season screen after 14 matches
  When Sam taps "Back"
  Then the club home heading "Netherwold Borough" has focus
  And the club home has a button named "End of season" and no button named "Play match"
  When Sam taps "Table"
  Then every body row has P 14
  When Sam taps "Back" and "End of season"
  Then the screen reads "Final position 3rd" and "Top scorer Garrick Thistlewood (5 goals)" again

Scenario Outline: The same seed ends the same way
  Given Sam opens a fresh page at "<first>", taps "New game" and "<club>", plays 14 matches with untouched tactics and taps "Back" and "End of season", reading its lines
  When Sam does the same in a second fresh page at "<second>"
  Then the two End of season screens read the same, line for line
  Examples:
    | first     | second                   | club                    |
    | ?seed=31  | ?seed=31                 | Netherwold Borough      |
    | ?seed=abc | no ?seed= in the address | Oakhampton Rise Borough |
```
Notes: the outline checks rules; its instances' exact lines ("Final position 3rd", "Top scorer Garrick Thistlewood (5 goals)" at seed 31; "Final position 2nd", "Top scorer Joren Northcott (8 goals)" at seed 20260) are goldens for e2e and unit tests, as S-008's reference season. Unit: the ordinal for Pos 1..8, the top-scorer rule over constructed logs (outright, two- and three-way ties resolved by squad order, exactly 1 goal, no goal gives "Top scorer none"), "Final position" equals `standingsOf` Pos, "End of season" is offered for 14 recorded matchdays and not for 0..13.

**Outcome KPI:** K1, K2 (below).
**Technical notes (for DESIGN, not AC):** "season complete" is S-008's derived flag (`nextMatchday(state) === undefined`); the club home renders the "End of season" button from it instead of the `p.season-over` line. The final position reads `standingsOf(state)`; the top scorer counts the managed club's goals in `results` (each goal's `side` and `playerIndex` against the club's squad, as the match screen does), ties by lowest squad index. Both are pure selectors; nothing is stored. A new screen kind and a view action from the club home, valid only when the season is complete; `Back` from it goes to the club home. DESIGN records the screen and the replacement of S-008's "Season over" line (an ADR-0014 amendment or a short new ADR). Depends on S-007, S-008.

#### US-2: Play again
**Problem:** a finished season is a dead end. To play again Sam must reload the page and tap "New game", and the game gives no hint that he can. The brief's success is that he *wants* a second season; the game should let him start it in one tap.
**job_id:** J-09

##### Elevator Pitch
- Before: on the End of season screen (slice 01) the only way out is "Back" to a club home with nothing left to play.
- After: Sam taps "Play again" and sees the pick-a-club screen with the same 8 clubs in the "Clubs" list; he taps "Netherwold Borough", "Table" shows every row at 0 in A to Z order, and "Play match" shows "Matchday 1", "Netherwold Borough 1–2 Marlbrook Athletic" again.
- Decision enabled: do I take the same club again and try to beat 3rd, or try another club of this league?

**Domain examples**
1. `?seed=31`, End of season screen of Netherwold Borough: "Play again" shows the pick-a-club screen (heading focused) with the same 8 names in the same order as the first "New game". "Netherwold Borough", "Table": every row P 0, W 0, D 0, L 0, GD 0, Pts 0, A to Z. "Back", "Play match": "Matchday 1", "Netherwold Borough 1–2 Marlbrook Athletic".
2. `?seed=31`, during the first season Sam chose "4-3-3" and picked "Kestrel Northcott 6" for "MF Calder Redfern 15". After "Play again" and "Netherwold Borough": "Tactics" shows "4-4-2" checked, and "Starting XI" reads the automatic 4-4-2 XI of a new game.
3. `?seed=abc`, after "Play again" Sam picks "Valebridge Town" instead of Oakhampton Rise Borough: its home shows "Play match" (no "End of season"), and the first match reads "Matchday 1".

**Acceptance criteria (embedded UAT)**
```gherkin
Scenario: Play again starts a fresh season of the same league
  Given Sam opens a fresh page at "?seed=31", taps "New game", reads the 8 names of the "Clubs" list, taps "Netherwold Borough", taps "Play match", reads the score line and taps "Back"
  And Sam taps "Play match" and "Back" 13 more times and taps "End of season"
  When Sam taps "Play again"
  Then the screen's only h1 has focus and the list named "Clubs" holds the same 8 names in the same order
  When Sam taps "Netherwold Borough" and "Table"
  Then every body row reads P 0, W 0, D 0, L 0, GD 0 and Pts 0, in A to Z order of club name
  When Sam taps "Back" and "Play match"
  Then the screen title is "Matchday 1" and the score line is the one Sam read after his first "Play match"

Scenario: Play again forgets the old season's picks
  Given Sam at "?seed=31" taps "New game" and "Netherwold Borough", taps "Starting XI", reads the 11 and taps "Back"
  And Sam taps "Tactics", chooses "4-3-3", taps "Back", plays 14 matches and taps "End of season"
  When Sam taps "Play again", "Netherwold Borough" and "Tactics"
  Then the radio "4-4-2" is checked
  When Sam taps "Back" and "Starting XI"
  Then the 11 read the same as the 11 Sam read before choosing "4-3-3"

Scenario: The same choices play the same season again
  Given Sam at "?seed=31" managing "Netherwold Borough" with untouched tactics has played 14 matches and read the End of season screen
  When Sam taps "Play again", "Netherwold Borough", plays 14 matches with untouched tactics, taps "Back" and "End of season"
  Then the End of season screen reads the same, line for line
```
Notes: where "Play again" lands is this version only (D3, D6); these scenarios are e2e and unit tests and are not pinned in `tests/protected/S-009/` (as S-008's "Season over"). Unit: "Play again" gives the same state as `initialState` plus `NewGame` for the same league (no results, formation "4-4-2", no picks, the pick-a-club screen); it is a no-op off the End of season screen.

**Outcome KPI:** K1, K3 (below).
**Technical notes (for DESIGN, not AC):** `NewGame` is valid only from the title screen today and resets formation, picks and results; "Play again" needs the same reset from the End of season screen (a new action or a widened `NewGame`: DESIGN's call). The league is kept (same seed); no page reload. Depends on US-1.

Notes for DESIGN and DISTILL (not part of the AC): "has focus" means `document.activeElement` is the `<h1>`; locators use `exact: true` for "End of season", "Play again", "Back", "Play match" and the h1. Protected (`tests/protected/S-009/`) pins the durable clause (D6) through US-1 scenarios 1, 2 (rules, not names), 3 and 4; scenario 5 is a candidate; US-2 stays out. A protected season is 28+ taps: one seed per scenario and `test.setTimeout(90_000)` as headroom (S-008 precedent, 1.7 s measured for 14 matchdays).

### Wave: DISCUSS / [REF] Outcome KPIs
| # | Who | Does what | By how much (target) | Baseline | Measured by |
|---|---|---|---|---|---|
| K1 | Sam on a 390px phone | Sees how his season ended and starts another | The verdict in 1 tap from the club home after matchday 14 ("End of season"); a new season's first match in 3 taps from that screen ("Play again", club, "Play match") | 2 taps and a row scan for the position, no top scorer at all; a new season needs a page reload and "New game" | e2e click counter (as S-003..S-008) |
| K2 | Sam | Trusts the verdict | 0 disagreements between "Final position" and the table's Pos, and between "Top scorer" and the 14 "Goals" lists, over seeds 1..300 x 8 managed clubs (2400 seasons, untouched tactics), and in every CI run | not possible | a committed fixed-seed test over the 2400 seasons, plus fast-check (numRuns 100, fresh `FC_SEED` in `ci:test`) over constructed logs for ties, one goal and none, plus the protected scenarios |
| K3 | Sam | Gets a clean second season | 100% of "Play again" states equal a fresh `NewGame` state of the same league (no results, 4-4-2, no picks); 0 differences between a replayed season and the first with the same choices | not possible | property test on `update` plus the US-2 e2e |

Guardrails: S-001..S-008 protected scenarios stay green. The league, squads, schedule, every result and the S-006..S-008 goldens are unchanged for every seed. No sideways scroll at 390px and 0 console errors on the club home and the End of season screen. Environments follow `docs/feature/S-004/environments.yaml`. No analytics in the POC; the brief's "wants a second season" is observed in the owner's Friday demo (does he tap "Play again").

### Wave: DISCUSS / [REF] DoD
- `tests/protected/S-009/`, written in this plan run (append-only) from the D6 pin list, passes on main; `tests/protected/S-001/` to `S-008/` still pass. Unit and property tests pass for: the ordinal, the top-scorer rule (outright, ties by squad order, "(1 goal)", "none"), final position equals the table, the "End of season" offer for 14 recorded matchdays only, "Play again" equals a fresh new game of the same league, Back, the names check and the seed-31 and seed-20260 goldens. The `ci:*` scripts are green.
- The e2e phone smoke covers the seed-31 season to the End of season screen (lines, focus, 44px, no sideways scroll at 390px) and "Play again" to a new "Matchday 1".
- The D7 amendments replace, never weaken, the S-008 "Season over" assertions; no other S-001..S-008 acceptance assertion is edited. No ambient randomness or wall-clock time in `src/domain/`; no new RNG stream; nothing new stored. DESIGN records the new screen and the replacement of the "Season over" line. The DELIVER change stays under the 1200-line PR guard (410 budgeted, tests included).

### Wave: DISCUSS / [REF] Out-of-scope
- A league-wide top scorer or golden boot; other clubs' results or scorers; awards, player of the season, records; a "Champions" banner, trophy or celebration; a second season with the same club carried over (squads, form, history); save and continue (localStorage), so a reload loses the season; inbox or news; commentary and stats; a different seed or league on "Play again"; re-opening played matches.
- Every OUT tag: `match-2d`, `utility-ai`, `transfers`, `finances`, `training`, `youth`, `staff`, `multiplayer`, `backend`, `real-data`.

### Wave: DISCUSS / [REF] WS strategy
No new walking skeleton (brownfield). The story closes the S-001..S-008 loop with one screen ("End of season") and one action ("Play again"). The e2e journey "14 x (Play match, Back), End of season, Play again, club, Play match" is the end-to-end proof of the north star and of the brief's success criterion. Two carpaccio slices in order (`slices/slice-01..02`), both delivered in the one S-009 DELIVER.

### Wave: DISCUSS / [REF] Driving ports
UI entry only, by role and accessible name at `http://localhost:4173/gaffer/`: the club home button "End of season" (after matchday 14; "Play match" before); the End of season screen h1 "End of season", the text lines "Final position ..." and "Top scorer ...", the buttons "Play again" and "Back"; then the pick-a-club screen's "Clubs" list, "Table", "Tactics", "Starting XI" and "Play match" as in S-001..S-008.

### Wave: DISCUSS / [REF] Pre-requisites
- S-001..S-008 delivered (`results` log for 14 matchdays, `standingsOf`, `nextMatchday`, the squad order, the pick-a-club screen). ADR-0001..0014 accepted; ADR-0014's "Season over" line (this version only) is replaced by D1, and DESIGN records it. `docs/product/jobs.yaml` now has J-09 (resolved). The orchestrator appends roadmap entry S-009 from the draft below (done in this run). `tests/protected/S-009/` is written in this plan run (append-only) from the D6 pin list. D7 lists the non-protected assertions DELIVER amends.

### Wave: DISCUSS / [REF] Roadmap outcome (draft)
Once all 14 matchdays of the season have been played, the club home shows, in the place where "Play match" was, a button named exactly "End of season" (44px or taller); the line "Season over" of S-008 is no longer shown, and the club home's heading (the club's name) and its "Squad", "Tactics", "Starting XI" and "Table" buttons stay. Before matchday 14 has been played there is no "End of season" button and "Play match" is there as before. Tapping "End of season" opens a screen whose only top-level heading (h1) reads exactly "End of season", focused on arrival. It shows these lines, each read as one line of text (label, one space, value): "Final position" followed by the ordinal of the club's Pos in the League table after matchday 14, one of "1st", "2nd", "3rd", "4th", "5th", "6th", "7th" or "8th" (pattern ^Final position (1st|2nd|3rd|4th|5th|6th|7th|8th)$, for example "Final position 3rd"), equal to that club's Pos on the "Table" screen; and "Top scorer" followed by the name of the club's player with the most goals for the club over its 14 league matches, one space and the count in round brackets, "(N goals)", or "(1 goal)" when the count is 1 (pattern ^Top scorer (.+) \((\d+) goals?\)$, with "goal" exactly when the count is 1, for example "Top scorer Garrick Thistlewood (5 goals)" or "Top scorer Orrin Yarrow (1 goal)"). The count equals the number of items naming that player and the club on the club's 14 match screens' "Goals" lists, and no player of the club has more; when players are tied, the one listed first in the club's "Squad" list is named. If the club scored no goal all season the line reads exactly "Top scorer none". Player names are unique within a league and hold no round brackets. Below them are a button named exactly "Play again" and a button named exactly "Back", both 44px or taller. "Back" returns to the club home with focus on its heading, the club's name, still showing "End of season" and no "Play match"; "Table" still shows every row at P 14, and "End of season" opens the same screen again; an already played match cannot be re-opened. "Play again" starts a new game at once with the same seed and shows the screen that "New game" on the title screen shows, with focus on its heading and the list named "Clubs" holding the same 8 clubs in the same order; nothing of the old season remains: after picking a club the table reads P 0, W 0, D 0, L 0, GD 0 and Pts 0 on every row in A to Z order, Tactics has "4-4-2" checked, the Starting XI is the automatic one, and the next "Play match" plays "Matchday 1". Everything on the End of season screen comes from the season's recorded results and the seed, and nothing new is stored: two fresh visits with the same "?seed=", the same club and the same choices show the same End of season screen, "?seed=abc" shows the same screen as no "?seed=" in the address, and after "Play again" the same club and the same choices play the same season again. Results are kept until the page is reloaded. These hold in every later version of the game, within each season: once the season's 14 matchdays are played the club home offers "End of season", and does not before; its screen has the only h1 "End of season", the "Final position" line equal to the club's Pos in the table, the "Top scorer" line in this format and by this rule, and "Back" to the club home. Where "Play again" lands is a rule of this version only. This version replaces S-008's "Season over" line, which S-008 marked as a rule of its version only; S-008's durable list is unchanged. No horizontal scroll at 390px and no console errors.

### Wave: DISCUSS / [REF] DoR validation
| # | Item | Status | Evidence |
|---|---|---|---|
| 1 | Problem clear, domain language | PASS | US-1: the season ends with "Season over" and a shrug, the position needs a row scan and the scorers are lost on 14 closed match screens; US-2: a finished season is a dead end that needs a reload |
| 2 | Persona specific | PASS | Sam, 34, one-handed on a bus, 390px Android, 5 minutes, has played all 14 matchdays and read the final table |
| 3 | 3+ domain examples, real data | PASS | Real generator output checked in this run: seed-31 Netherwold Borough 3rd with a 5-5 tie (Thistlewood before Hartwell), seed-20260 Oakhampton Rise Borough 2nd with Joren Northcott 8, seed-13 Ashworth Vale Rovers' three-way tie at 1 goal; the S-006 golden matchday 1 and the S-008 golden pick for "Play again". 3 examples per story |
| 4 | UAT Given/When/Then, 3-7 | PASS | 8 for S-009 (US-1 5, two outlines; US-2 3). Every Given and When is a tap sequence on the real app, and every Then reads only what an earlier step read (the "Squad" order, the "Goals" lists, the Pos, the "Clubs" list, the Starting XI) |
| 5 | AC derived from UAT | PASS | Project convention since S-001: AC are the embedded Gherkin scenarios. D1 in US-1 scenario 1; D2 in US-1 scenarios 2 and 3; D4 in US-1 scenario 4; D5 in US-1 scenario 5 and US-2 scenario 3; D3 in US-2 scenarios 1 and 2; D6 to D8 by the pin list, unit tests, e2e and review |
| 6 | Right-sized | PASS | 2 slices in about 1 day; 410 changed lines in DELIVER including tests, under the 1200-line PR guard (the one hard cap); one outcome |
| 7 | Technical notes | PASS | Per story: derived selectors (final position from `standingsOf`, top scorer from `results` and squad order), nothing stored, the "Season over" replacement recorded by DESIGN, `NewGame`'s title-only guard and the reset for "Play again" |
| 8 | Dependencies tracked | PASS | S-001..S-008 delivered; S-008's version-only "Season over" line is replaced (D1, D6), its durable list unchanged; D7 amendments listed; J-09 added; open question: a different league on "Play again" (later story) |
| 9 | Outcome KPI measurable | PASS | K1 1 tap to the verdict and 3 taps to a new matchday 1 (e2e click counter); K2 0 disagreements over 2400 fixed-seed seasons plus fast-check; K3 100% of "Play again" states equal a fresh new game (property test) |

DoR status: PASSED (both stories). Every story has `job_id` J-09 and an Elevator Pitch.

### Wave: DISCUSS / [REF] Peer review
pending

## Wave: DESIGN

- **Setup**: mode propose; scope application; one solo team plus the factory, no Conway constraint. Paradigm: functional core, imperative shell (ADR-0003; recorded in the ADRs and the brief, not in CLAUDE.md). Unattended; no questions asked. Precedence used: scope.md, then brief.md, then accepted ADRs; the narrower choice wins.
- **Checklist**: ✓ DISCUSS (D1-D8, US-1/US-2, K1-K3, open questions) | ✓ journey and both slices | ✓ roadmap entry S-009 | ✓ brief, ADR-0003/0008/0012/0013/0014 | ✓ S-008 DESIGN as the template | ✓ code (`state.ts`, `main.ts`, `club-home.ts`, `table.ts`, `player.ts`, `match.ts`, `standings.ts`, `squad.ts` via the brief, `dom.ts`, `styles.css`, `.oxlintrc.json`, `stryker.config.mjs`) | ✓ design system | ✓ existing tests (acceptance S-008, e2e S-008, unit) | ⊘ Context7 (no library) | ⊘ residuality, DDD expansion, formal verification (lean, Tier-1) | ⊘ CLAUDE.md edit (locked).
- **New ADR**: `adr-0015-season-end-screen-and-play-again.md` (where the top-scorer rule and the ordinal live, the screen, the actions, `NewGame` widened, the selector, the markup; supersedes in part ADR-0014's "Season over" line). ADR-0014 gets a status-line note plus inline "(superseded by ADR-0015, S-009)" markers at the statements it overturns, nothing else (the ADR-0012 convention).
- **Brief**: `docs/product/architecture/brief.md` gains "Season end (S-009, ADR-0015)", effect-isolation rows, ports 32-35, the S-009 observable bullet, struck-through S-008 "Season over" statements and updated C4 L2 descriptions. `docs/product/ui/design-system.md`: the "Season over" entry is struck and an "End of season (S-009)" section added.
- **No new C4 container**; the domain gains `season.ts`, the UI gains `season-end.ts`. **Library check**: no library is involved (a pure tally, a `<p>`, plain CSS), so no Context7 lookup applies; none was run.

### Wave: DESIGN / [REF] DDD list
- **No new context.** Match, Schedule and Standings are untouched. The End of season screen is a read model over the results log: a "season summary" of two facts (the club's final position, its top scorer), both derived.
- **Language**: End of season (the screen, behind the button of the same name), Final position (the club's Pos after matchday 14, as an ordinal), Top scorer (the club player with the most goals for the club; ties to the lowest squad index; none gives "none"), Play again (a new game of the same league), Season summary (`{ position, topScorer }`).
- **Invariants by construction**: the summary is a pure function of the log and the seed, so it cannot disagree with the table or the Goals lists (K2); "Play again" is the existing `NewGame` reset, so it equals a fresh game (K3); the End of season screen is reachable only when `nextMatchday` is `undefined`.

### Wave: DESIGN / [REF] Decisions
| # | Decision | Source |
|---|---|---|
| D1 | **Top-scorer rule: a new pure `src/domain/season.ts`**: `topScorer(played, clubIndex, squad) => TopScorer or undefined` counts the club's own goals (home goal of a home match, away goal of an away match), most goals, ties to the lowest squad index, none gives `undefined`; `formatTopScorer` makes the text ("Name (N goals)", "(1 goal)", "none"). Structural input `ScoringMatch`, so a `PlayedMatch` fits and tests pass literals. Rejected: extend `standings.ts` (club-level module, one import, an ADR-0013 contract); extend `match.ts` (the frozen ADR-0011 model); compute in `state.ts` or the shell (rule outside the domain, hard to unit-test, `state.ts` near its size budget). | ADR-0015 (1); DISCUSS D2, tech notes |
| D2 | **Ordinal: `formatOrdinal(position)` in `standings.ts`** next to `formatGoalDifference` (a format of a `StandingRow` field, the ADR-0013 3A placement); plain English suffix rule (11-13 "th"), total over positive integers, `RangeError` otherwise. Rejected: in the renderer (unmutated, e2e-only); `Intl.PluralRules` (ICU/engine-dependent, a lie risk). | ADR-0015 (2); DISCUSS D2 |
| D3 | **Navigation**: `Screen` adds `seasonEnd{clubId}`; `Action` adds `ViewSeasonEnd` (a known club's `clubHome` and `nextMatchday(state) === undefined`, else a `toBe` no-op); `Back` from it goes to the club home (`HOME_RETURNING_KINDS` gains the kind). **"Play again" is `NewGame`, widened to be valid from `title` or `seasonEnd`.** Rejected: a new `PlayAgain` action (a second reset with the same effect; `update` at complexity 15 of 15, zero headroom); restructuring `update` into a handler table now (rewrites a mature function and its Stryker surface); no screen (D2 wants its own h1, D4 a Back). | ADR-0015 (3); DISCUSS D2-D4, US-2 tech notes |
| D4 | **Complexity stays under the limit (15), counted as S-007/S-008 did**: `update` goes from 12 to 13 cases (14). `sameScreen` is at 15: its six `clubId` labels become the switch's `default` (behaviour-preserving, `focusPlan` suite unedited, TypeScript still rejects a remaining kind without `clubId`), so the new kind adds nothing (drops to 9). `main.ts` `render` is at 14: the new case calls a module-level `seasonSummaryOrThrow` (like `squadOrThrow`), so it adds one (15) and no `if`. DELIVER confirms all three with `ci:lint`; if a count differs, extract the `player` case's lookup into a `playerOrThrow` helper (behaviour-preserving). Nothing new is stored in `GameState`. | ADR-0015 Context, Consequences; `.oxlintrc.json` |
| D5 | **Selector `seasonSummaryOf(state, clubId)`** in `state.ts`: `{ position, topScorer }` from `standingsOf` (the club's row) and `topScorer` over `state.results ?? []` with `squadOf`; `undefined` for an unknown club. Raw data; `formatOrdinal` and `formatTopScorer` make the text in the renderer, as `renderTable` calls `formatGoalDifference`. Rejected: finished text in the app (presentation in the wrong layer, K2 harder); computing in `main.ts`. | ADR-0015 (4); DISCUSS D5 |
| D6 | **Club home**: the "Play match" slot holds a `button.primary` "End of season" (`ViewSeasonEnd`) when `seasonOver`; `p.season-over` and `.club-actions .season-over` CSS are removed; `renderClubHome`'s props are unchanged, so `main.ts`'s `clubHome` case is untouched. Five `button.primary` again. This records the supersession of ADR-0014's "Season over" line. | ADR-0015 (6); DISCUSS D1, D6 |
| D7 | **End of season markup**: `renderSeasonEnd(root, summary, dispatch)` writes one `section.season-end` of four children: `<h1 tabindex="-1">End of season</h1>`; `<p class="season-line">` with `<span class="season-label">Final position</span>`, a literal `" "` text node, `<span class="season-value">3rd</span>`; `<p class="season-line">` with `<span>Top scorer</span>`, `" "`, `<span>Garrick Thistlewood (5 goals)</span>` ("Top scorer none" when none); `<div class="season-actions">` with `button.primary` "Play again" (`NewGame`) and `button.back-button` "Back" (`Back`). `dispatch` narrowed at compile time to those two actions. Rejected: one text node per line (no value styling); `<dl>`. | ADR-0015 (5); DISCUSS D2, D8; ADR-0009, ADR-0013 |
| D8 | **CSS (binding)**: the `<p>` and its spans keep inline flow (no flex, grid, float, `position`, `display` override, `text-transform` or generated content), so `textContent`, `innerText` and the accessible name read the exact line; `overflow-wrap: anywhere`; a new `.season-line` class (not `.player-line`, whose `:nth-of-type`/`:last-of-type` rules belong to the player screen); `.season-actions` a one-column grid with a 10px gap; buttons 48px, never below 44px; `.season-end h1` 1.75rem like the other screens. | ADR-0015 (5); design-system |
| D9 | **Focus** (ADR-0008) unchanged: club home to End of season, Back, and Play again to the pick-a-club screen are all screen changes, so the shell focuses the new `<h1>`; renderers never move focus; no focus ids. `sameScreen` treats `seasonEnd` as a `clubId` kind. | ADR-0008; DISCUSS D2-D4, D8 |
| D10 | **Contract shapes**: `topScorer`, `formatTopScorer`, `formatOrdinal`, `seasonSummaryOf`, `update` pure return-only; `renderClubHome` bounded-change (closed universe of five `button.primary`); `renderSeasonEnd` bounded-change that emits only `NewGame` and `Back`; `main.ts` bounded-change with its enumerated universe. See Reuse Analysis. | brief; ADR-0015 |
| D11 | **Names**: "End of season", "Final position", "Top scorer", "Play again" are in no `names.ts` string (grep: only the town "Saltmarsh End" holds "End"; locators use `exact: true`). DISTILL adds the unit check (S-008 D9 precedent). | DISCUSS D8 |
| D12 | **Supersession is a new ADR**, not an ADR-0014 rewrite: ADR-0014 changes only by its status line and inline "(superseded by ADR-0015, S-009)" markers (the D6 line, option 4A and 4C, the UI and CSS bullets, the `renderClubHome` contract row, Earned Trust 5 and 6); it keeps the derived `nextMatchday`, the append, the guard at 14 and `matchFor`. | ADR-0015; ADR-0012 precedent |

### Wave: DESIGN / [REF] Component decomposition
| Path | Change | Responsibility | Indicative lines |
|---|---|---|---|
| `src/domain/season.ts` | CREATE NEW | `ScoringMatch`, `TopScorer`, `topScorer`, `formatTopScorer` | 40 |
| `src/domain/standings.ts` | EXTEND | `formatOrdinal` | 10 |
| `src/app/state.ts` | EXTEND | `seasonEnd` screen kind, `ViewSeasonEnd` action and its case, `NewGame` valid from `seasonEnd`, `HOME_RETURNING_KINDS`, `sameScreen` `default` refactor, `SeasonSummary`, `seasonSummaryOf`, imports | 40 |
| `src/ui/screens/season-end.ts` | CREATE NEW | `renderSeasonEnd` | 45 |
| `src/ui/screens/club-home.ts` | EXTEND | the slot holds "End of season" or "Play match" (the `p.season-over` branch goes) | 4 |
| `src/main.ts` | EXTEND | `seasonEnd` render case, `seasonSummaryOrThrow`, two imports | 10 |
| `src/ui/styles.css` | EXTEND | `.season-end h1`, `.season-line`, `.season-label`, `.season-value`, `.season-actions` added (about 28); `.club-actions .season-over` deleted (12) | 40 |

**Code total about 189** (DISCUSS 110: the rule and formatters are in the domain, the CSS counts its 12 deleted lines, and the `sameScreen` refactor is new). Tests: `tests/acceptance/S-009/*.test.ts` 255 (ordinal and top-scorer unit and property 90, summary and K2 oracle sweep 50, navigation, `NewGame` and focus 90, names check 25), `tests/e2e/S-009-end-of-season.spec.ts` 100, S-008 amendments 110 (below). **DELIVER total about 654** (code 189, tests 465) against the DISCUSS 410, because the amend list is larger than the 40 lines assumed and the code moved logic into the domain. With the 250-line protected file written in the plan run (outside the DELIVER diff) the grand total is about 904, under the 1200-line PR guard (the one hard cap). No cut needed; if DELIVER nears the cap, ship slice 01 (the screen) first, then slice 02 ("Play again": the `NewGame` widening and its tests, about 130 lines).

**Amend list** (non-protected tests that assert the "Season over" line; DELIVER replaces each with its equal-or-stronger "End of season" check, never deletes or weakens it; DISTILL fixes the exact new text). `grep` of `Season over` / `season-over` over `src/`, `tests/` and `docs/product/`:
| File | Test / part | Why it breaks or must change | Replace with |
|---|---|---|---|
| `tests/e2e/S-008-season.spec.ts` | helper `expectSeasonOver` (lines 241-270), used at 292, 302, 335, 358, 361, 369, 374, 378 | Expects one `<p>` reading "Season over", four buttons, and `.club-actions > *` = "Squad", "Tactics", "Starting XI", "Season over", "Table" | `expectEndOfSeasonOffer`: no button named "Play match" (exact and /play match/i), exactly one button named "End of season" (exact, 44px or taller, inside the 390px screen), five buttons in the order Squad, Tactics, Starting XI, End of season, Table, all 44px or taller, `.club-actions > *` all `button`, the text "Season over" nowhere (count 0), one heading, no sideways scroll |
| same | test at line 273 (title ends "the club home says Season over") | Title and the helper calls | Title "... the club home offers End of season"; same assertions through the new helper |
| same | test at line 351 (title; line 360 clicks the "Season over" line "navigates nowhere", then `expectSeasonOver(..., false)`) | Clicking now opens a screen | Click "End of season": h1 "End of season" focused and the only heading, "Back" returns to the home (heading focused, button still there), no "Matchday" heading (a played match cannot be re-opened); the other opens (Squad, Starting XI, Table) unchanged |
| same | header comments (lines 6-7, 9, 14), `backHome` doc comment (line 149) | Describe the line | Restate for the button (comments only) |
| `tests/e2e/S-008-club-home-regression.spec.ts` | title and lines 27, 38 (`getByText("Season over")` count 0) | The phrase is retired; the absence check is vacuous | `getByRole("button", { name: "End of season", exact: true })` count 0 before matchday 14 (and keep the "Season over" count 0): equal-or-stronger |
| `tests/acceptance/S-008/season-end.test.ts` | header comment (lines 5-6); test at line 122 ("no season-over flag") | Comment names the line; the key list still holds | Comment restated; add `update(over, ViewSeasonEnd)` to the list of states checked (nothing new stored) |
Tests that stay unedited: `tests/acceptance/S-008/names-avoid-season-words.test.ts` (kept as a harmless guard; DISTILL adds the S-009 phrases in a new file); the S-008 properties (their action pools hold no `ViewSeasonEnd`, so `NewGame` never meets `seasonEnd` there); every S-001..S-008 `NewGame` test (other screens stay no-ops); the `focusPlan` suites (the `sameScreen` refactor is behaviour-preserving); `renderers-never-move-focus` (the new file has no `.focus(`). `tests/protected/S-008/` never pinned the line.

### Wave: DESIGN / [REF] Driving ports
- **Domain**: `formatOrdinal(position)`, `topScorer(played, clubIndex, squad)`, `formatTopScorer(scorer)`.
- **App**: `update` with `ViewSeasonEnd` (guarded by `nextMatchday`), `Back` from `seasonEnd`, and `NewGame` from `seasonEnd` ("Play again"); selector `seasonSummaryOf(state, clubId)`; `focusPlan` through `sameScreen`.
- **Browser**: club home "End of season" (after matchday 14); the End of season screen (h1 "End of season", "Final position ...", "Top scorer ...", "Play again", "Back"); then the pick-a-club screen's "Clubs" list, "Table", "Tactics", "Starting XI" and "Play match".
- Detail and properties: brief, "For Acceptance Designer", ports 32-35.

New and changed shapes, for the acceptance designer:
- `formatOrdinal(position: number): string`; `topScorer(played: readonly ScoringMatch[], clubIndex: number, squad: readonly Player[]): TopScorer | undefined`; `formatTopScorer(scorer: TopScorer | undefined): string`; `TopScorer = { playerIndex, name, goals }`.
- `Screen` adds `{ kind: "seasonEnd", clubId }`; `Action` adds `{ type: "ViewSeasonEnd" }`; `seasonSummaryOf(state: GameState, clubId: string): SeasonSummary | undefined`, `SeasonSummary = { position: number; topScorer: TopScorer | undefined }`. `GameState`, `PlayedMatch`, `MatchView` unchanged.
- `renderSeasonEnd(root, summary, dispatch)` and `renderClubHome(root, { club, seasonOver }, dispatch)` (props unchanged); not reachable from vitest, covered by e2e and grep tests.

### Wave: DESIGN / [REF] Driven ports and adapters
None: no storage, clock or network; the log lives in memory. Environment assumptions are named and probed (ADR-0015 Earned Trust), each with the lie it exercises:
1. **Chromium vs Node**: the browser's seed-31, seed-20260 and seed-13 End of season screens equal the Node goldens (RED-first). Fault: an approximated function upstream (grep tests).
2. **Text reads as one line (layout lie)**: both lines' `innerText` and `textContent` equal the exact line. Fault: flex/grid/float on the spans, `text-transform`.
3. **The verdict agrees with the evidence (K2)**: seeds 1..300 x 8 clubs against an oracle that does not call `topScorer` (the `matchFor` goal lists and the table), plus fast-check for ties, one goal and none. Fault: the opponent's goals counted, the wrong squad, last-index tie.
4. **The offer is exactly at 14**: boundaries 13 and 14 for `ViewSeasonEnd` and the button (nightly Stryker on `state.ts`).
5. **Play again equals a fresh game (K3)**: property after any run of up to 40 actions; the replayed season reads the same screen. Fault: a forgotten field (`xi`, `formation`, `results`).
6. **Focus and universe**: the h1 is focused on arrival, after Back and after Play again; clicking every element dispatches only `NewGame` and `Back`; buttons 44px or taller; no sideways scroll; no console errors.
7. **Names**: the four new phrases are in no `names.ts` string.

No external integrations, so no contract tests. **Enforcement** (style: modular monolith, functional core and imperative shell; tool: oxlint with the existing boundaries, plus grep tests): `season.ts` and `standings.ts` import no app or ui and use no DOM or time; `max-params` 3 (`topScorer` has 3); `complexity` 15 (D4); `max-lines` 400 (`state.ts` about 310); Stryker's globs already cover `src/domain/**` and `state.ts`, no config change; the `.focus(` grep covers the new renderer; new grep tests: no `Intl`/`toLocale` in `season.ts` and `formatOrdinal`, two `dispatch(` calls in `season-end.ts`.

### Wave: DESIGN / [REF] Technology choices
- No new technology or dependency (ADR-0001, 0002, 0003 apply; all OSS). A pure tally, a suffix rule, plain DOM and plain CSS; no newer CSS features. No library is involved, so no Context7 lookup applies.

### Wave: DESIGN / [REF] Reuse Analysis
| Existing Component | File | Overlap | Decision | Justification / contract shape |
|---|---|---|---|---|
| `standings`, `StandingRow.position`, `formatGoalDifference` | `src/domain/standings.ts` | Final position is the club's row; a format of a row field | EXTEND (`formatOrdinal`) | Pure return-only; universe = the returned string; table test (1..8, teens, 21-23, 101, 111), `RangeError` table, grep: no `Intl`/`toLocale`; the module's one import is untouched |
| `standingsOf` | `src/app/state.ts` | The table the position is read from | REUSE unchanged | Pure return-only; `seasonSummaryOf` calls it, so "Final position" equals the Table's Pos by construction (property over seeds 1..300 x 8 clubs) |
| `PlayedMatch`, `GoalEvent`, `playMatchday` | `src/domain/match.ts` | The goal log (`side`, `playerIndex`) | REUSE unchanged (read-only, through the structural `ScoringMatch`) | Pure return-only over the log; `match.ts` stays the frozen ADR-0011 model; goldens untouched |
| `matchScreenView`, `scorerName` | `src/main.ts` | Maps a goal's `side` and `playerIndex` to a name | REUSE the rule, not the code | Same mapping (`side` picks the club, `playerIndex` the squad entry); it is shell code per match view and cannot count. The K2 oracle uses the `matchFor` goal lists, not `topScorer` |
| (none) | `src/domain/` | Per-player tally of the club's goals with the tie rule | CREATE NEW `season.ts` | No existing aggregator (grep: goals are only read for display); `standings.ts` is club-level (ADR-0013 contract), `match.ts` is the frozen model. Pure return-only; deep-equal on repeat, frozen inputs unchanged, outright/tie/one-goal/none cases, opponent goals ignored, order-independence property, `RangeError` |
| `squadOf`, `Player` | `state.ts`, `squad.ts` | Names for the scorer | REUSE unchanged | Pure return-only; squad order is frozen (ADR-0005), so the lowest-index tie rule equals the "Squad" list order |
| `nextMatchday` | `src/app/state.ts` | Season complete | REUSE unchanged | Pure return-only; guards `ViewSeasonEnd` and (through the flag) the button; boundary cases 13 and 14 |
| `update`, `newGame`, `back`, `HOME_RETURNING_KINDS`, `Screen`, `Action` | `src/app/state.ts` | Navigation and the new-game reset | EXTEND (`ViewSeasonEnd`, `seasonEnd`, `NewGame` valid from `seasonEnd`) | Pure return-only; universe `{ league, screen, formation, xi?, results? }`; `ViewSeasonEnd` changes only `screen`; `toBe` no-ops; `NewGame` from `seasonEnd` `toEqual` `update(initialState(league), NewGame)`; deep-freeze; 40-action property; complexity D4 |
| `sameScreen`, `focusPlan` | `src/app/state.ts` | Focus on a screen change | EXTEND (the `clubId` labels become the `default`; behaviour unchanged) | Pure return-only; the S-004/S-005 `focusPlan` suites pass unedited; new cases: `seasonEnd` same club vs different screen |
| `renderClubHome` | `src/ui/screens/club-home.ts` | The Play match slot | EXTEND (button replaces `p.season-over`) | Bounded-change; closed universe of five `button.primary`; props unchanged; e2e iterates buttons for 44px |
| `renderTable` | `src/ui/screens/table.ts` | A screen that emits only named actions; a format function called by the renderer | REUSE the pattern (narrowed `dispatch`, grep test), not the code | Bounded-change; `renderSeasonEnd` emits only `NewGame` and `Back` (compile-time, e2e click-everything, grep) |
| `renderPlayer` `line()`, `.player-line` | `src/ui/screens/player.ts`, `styles.css` | Stat line "label value" | CREATE NEW class `.season-line` (the pattern is reused) | `.player-line` has `:nth-of-type(3)` and `:last-of-type` rules for the player screen that would style the wrong `<p>`; the metrics (1.1rem, tabular numerals) are copied; inline flow rule kept |
| `renderPickClub`, `.back-button`, `button.primary`, `.club-actions` | `src/ui/screens/pick-club.ts`, `styles.css` | The "Play again" target; buttons | REUSE unchanged | Bounded-change; "Play again" lands on the screen "New game" shows; shared button classes; the `.season-over` rule is deleted (presentation only) |
| `render`, `findClub`, `squadOrThrow` | `src/main.ts` | Maps state to props | EXTEND (`seasonEnd` case, `seasonSummaryOrThrow`) | Bounded-change with an enumerated universe (reads `location.search` once; writes `root`'s children and focus only); S-009 delta = one case, one helper, two imports; e2e |
| S-008 tests | `tests/` | Pin the "Season over" line | REUSE, except the amend list | All other S-001..S-008 tests unedited |

### Wave: DESIGN / [REF] Changed Assumptions
- **ADR-0014 Context D6, quoted**: "**D6**: after matchday 14 the club home shows the plain line "Season over" instead of the button; a "Play match" action then is a no-op. This is this version only." Superseded in part by ADR-0015: the line is replaced by the "End of season" button (DISCUSS D1); the no-op stays.
- **ADR-0014 Options 4A (chosen), quoted**: "`nextMatchday(state) === undefined` computed in `main.ts`, passed to `renderClubHome` as `seasonOver`; the renderer swaps the "Play match" button for `<p class="season-over">Season over</p>` in the same slot of `div.club-actions`". Superseded in part: the flag and its derivation stand; the swapped-in element is a `button.primary` "End of season".
- **ADR-0014 Options 4C (rejected), quoted**: "A `Screen` kind "seasonOver" | Room to grow | That is the later end-of-season story (final position, top scorer); out of scope (D6)". Taken by this story (`seasonEnd`).
- **ADR-0014 Decision, quoted**: "The `<p>` is plain text (one text node via `el()`), no role, no heading, no listeners." and "CSS `.season-over`: block, centred, `min-height: 48px`, gold text, dashed chalk 25% border". Superseded: the button replaces the `<p>`; the CSS rule is deleted.
- **Brief, "Season progression (S-008, ADR-0014)", quoted**: "After matchday 14 the "Play match" button is replaced, in the same slot of `div.club-actions`, by `<p class="season-over">Season over</p>` (plain text: no heading, no button, no role) ... This is this version only; the end-of-season screen is a later story." Struck through in the brief with a pointer to ADR-0015.
- **S-008 DESIGN D5 and D9, quoted**: "`renderClubHome(root, { club, seasonOver }, dispatch)` swaps the "Play match" button for `<p class="season-over">Season over</p>` in the same slot (plain text: no heading, no button, no role)" and "`div.club-actions` of 5 children in the order Squad, Tactics, Starting XI, [button "Play match" or `p.season-over`], Table". Superseded; the club home is five `button.primary` again.
- **Brief S-005 (Navigation), quoted**: "`NewGame` keeps its title-only guard." Widened to title or `seasonEnd`.
- **ADR-0012 Context D9, quoted**: ""New game" is only on the title screen, which only a page load reaches, so "the `NewGame` action clears `results`" is a unit-level invariant, not a user-visible step." No longer true: "Play again" makes it user-visible without a page load. The user-visible lifetime of results is still "until the page is reloaded" or "Play again".
- **Brief S-004, quoted**: "`NewGame` also resets `formation` (unneeded today, kept deliberately as future-proofing for "Save and continue" or "play again")". The future-proofing is now used (the reset is what "Play again" runs).
- **S-008 DESIGN, quoted**: "`update` stays at 12 cases, complexity 13". Now 13 cases, complexity 14 (limit 15); `sameScreen` and `main.ts` `render` are at their limits (D4).
- **DISCUSS tech notes**: "DESIGN records the screen and the replacement of S-008's "Season over" line (an ADR-0014 amendment or a short new ADR)". Chosen: a new ADR-0015 plus status-line and inline markers in ADR-0014. The DISCUSS budget put the selectors in `state.ts`; the rule and the formatters are in the domain (D1, D2). The DISCUSS file name `end-of-season.ts` becomes `season-end.ts` (it matches the `seasonEnd` kind).
- **DISCUSS line budget**: DELIVER about 654 (DISCUSS 410): code 189 (110), tests 465 (300). Under the 1200-line PR guard (the one hard cap).
- **Observation**: `tests/protected/S-009/` was not in the tree when this DESIGN ran (the DISCUSS says the plan run writes it, append-only); DISTILL and DELIVER need it present before DELIVER starts.
- No change to the roadmap outcome text.

### Wave: DESIGN / [REF] Open questions
- **None blocking.**
- **Two limits are nearly or fully used** (`update` at complexity 14 of 15, `main.ts` `render` at 15 of 15; `sameScreen`, which was at 15, drops to 9 with the refactor): the next story that adds an action or a screen must first move `update` and the `render` switch to lookups. The counts are by hand (S-007/S-008 rule); DELIVER confirms with `ci:lint` (D4 has the fallback).
- **E2E helper reuse**: the season-playing helpers (`playSeason`, `whoIs`, `openTable`) are file-local in `S-008-season.spec.ts`. The 100-line e2e budget assumes a minimal re-implementation; extracting them into a shared module would edit an S-008 spec beyond the amend list, so DISTILL decides (cost about 60 lines more either way is inside the budget).
- **Where "Play again" lands** (the pick-a-club screen) is a rule of this version only. A "next season" with the same club kept, or a different league or seed, needs its own story and likely a new action; `NewGame` stays the fresh-game reset.
- **Persistence** (a later story) must validate a loaded log: `topScorer` throws `RangeError` for a goal naming a player outside the squad (frozen squad order, ADR-0005), and a save version must guard name-pool changes; its own `probe()`.
- **Outcome trace**: "End of season" at 14 and not before: D3, D6. The screen's lines and rule: D1, D2, D5, D7. Equal to the Table and the Goals lists: D5, Earned Trust 3. Back: D3, D9. Play again equals a fresh game: D3. Same seed, same screen: D1, D5. No sideways scroll, 44px, no console errors: D7, D8. Durable clause (DISCUSS D6): D1-D3, D6, D7.
- **Handoff for DISTILL**:
  - Properties and checks: brief ports 32-35 and the ADR-0015 Consequences and Earned Trust. Test files and lines are under Component decomposition, with the amend list.
  - **Goldens, RED-first** (DELIVER never re-pins from its own output; the facts come from the DISCUSS plan run, which checked them with the real generator): `?seed=31` Netherwold Borough "Final position 3rd", "Top scorer Garrick Thistlewood (5 goals)" (squad #14; Merrick Hartwell #17 also has 5; the tie kills a last-index mutant); `?seed=abc` Oakhampton Rise Borough "Final position 2nd", "Top scorer Joren Northcott (8 goals)"; `?seed=13` Ashworth Vale Rovers "Top scorer Orrin Yarrow (1 goal)" (a three-way tie at 1, squad #3, #4, #12). "Top scorer none" is unit-level (a constructed log).
  - Unit: ordinal table (1..8 plus teens and 21-23, 101, 111, `RangeError`); top scorer outright, two- and three-way ties by squad order, one goal, none, opponent goals ignored, home and away both counted, order-independence (property), frozen inputs, `RangeError`; `seasonSummaryOf` position equals the row and the oracle agrees over seeds 1..300 x 8 clubs (play each seed's 56 results once; untouched tactics make them club-independent); `ViewSeasonEnd` at 13 and 14, from other screens, unknown club, `toBe` no-ops; `Back` restores the home `toEqual`; `NewGame` from `seasonEnd` equals `update(initialState(league), NewGame)` (also after a changed formation and picks), no-op elsewhere; the 40/80-action property including `ViewSeasonEnd`; the names check for the four phrases; `focusPlan` for `seasonEnd`.
  - e2e (390px, `exact: true`): the seed-31 season to the End of season screen (button 44px, only h1 focused, both lines by `innerText` and `textContent`, buttons 44px, no sideways scroll, no console errors, click-everything dispatches only `NewGame` and `Back`), Back then "End of season" again, "Play again" to the pick-a-club screen, club, "Table" all zero, "Play match" reads "Matchday 1" with the golden score line; the seed-13 "(1 goal)" line. Protected (`tests/protected/S-009/`) pins only the durable clause, not where "Play again" lands.
  - The pending-then-activate pattern of S-006/S-007/S-008 applies to the amend list, in the same commit as the production change.

### Wave: DESIGN / [REF] Peer review
pending

## Wave: DEVOPS

Lean, unattended. All nine decisions pre-answered; no platform change. Owner-locked paths (`.github/`, `factory/`, `scripts/`, `.nwave/`, `CLAUDE.md`, brief/scope, `tests/protected/`, `stryker.config.mjs`, `playwright.config.ts`) are read-only. Machine-readable: `docs/feature/S-009/environments.yaml`. Inherits S-008 (and S-001..S-007); only deltas are recorded.

Checklist: ✓ existing infra reused | ✓ K1-K3 mapped to instruments | ✓ rollback defined | ✓ mutation strategy (nightly-delta; `season.ts`, `standings.ts`, `state.ts` inside the mutate globs, `season-end.ts`, `club-home.ts`, `main.ts` outside, no config change) | ✓ protected-runner timeout constraint recorded | ⊘ new IaC/containers | ⊘ server-side observability | ⊘ continuous learning | ⊘ CLAUDE.md edit

### Wave: DEVOPS / [REF] Environment matrix
| Env | URL | Runner | Purpose |
|---|---|---|---|
| local-dev | `http://localhost:5173/gaffer/` (`pnpm dev`) | dev machine | Iteration |
| local-preview | `http://localhost:4173/gaffer/` (`ci:serve`) | dev, CI, protected runner | Production build under test: phone-viewport Chromium (Pixel 7 profile, 390px); unit, property, e2e, `tests/protected/S-001..S-009/` |
| production | `https://<owner>.github.io/gaffer/` | GitHub Pages | Live site; post-deploy smoke through `BASE_URL` (same Pixel 7, 390px) |

Unchanged: no staging (static, recreate); Chromium only. Deltas:
- No new state and no storage. The End of season screen is derived from `GameState.results` (up to 56 entries) and the seed; "Play again" is the existing `NewGame` reset widened to run from `seasonEnd` (ADR-0015). A reload still shows the title screen and the season is lost. No save version, no migration.
- Cross-engine determinism probe (ADR-0015 Earned Trust 1) widens to the three goldens: `?seed=31` ("Final position 3rd", "Top scorer Garrick Thistlewood (5 goals)"), `?seed=abc` ("2nd", "Joren Northcott (8 goals)") and `?seed=13` ("Orrin Yarrow (1 goal)"), read from the browser on local-preview and, through `smoke`, on the live site. WebKit and iOS Safari are not probed.
- Layout lie probe (Earned Trust 2): both lines' `innerText` equals `textContent` (inline flow, no flex/grid/float/`text-transform`), Chromium only.
- e2e runtime: the replay test plays two full seasons (2 x 28 taps) plus "Play again" and the reads; the seed-31 and seed-13 tests one each. Each tap runs 8 squads and 4 quick-sims (S-008 measured 1.7 s for 14 matchdays locally). Live-site latency adds to it; see Open questions 1.
- Every navigation stays a screen change, so focus goes to the new `<h1>` (ADR-0008), including "Play again" to the pick-a-club screen.

### Wave: DEVOPS / [REF] CI/CD pipeline outline (existing, unchanged)
- `ci` (PR, push to main, dispatch; 30 min): PR guards (locked paths, append-only protected, diff cap 1200, `Math.random`/`Date` in `src/domain/`, which covers the new `season.ts`), roadmap lint, `ci:lint` (confirms the D4 complexity counts: `update` 14, `sameScreen` 9, `main.ts` `render` 15 of 15), `ci:typecheck`, `ci:test` (fresh `FC_SEED`), `ci:build`, `ci:e2e`, protected no-regression check vs main (a new `tests/protected/S-009/*.spec.ts` must fail on main until DELIVER).
- `deploy` (push to main): `ci:build`, deploy-pages, then `smoke` (10 min) runs `ci:e2e` against the live URL, including the new S-009 spec and the amended S-008 specs.
- `nightly` (03:00, 45 min): `ci:mutation`; failure opens a `mutation-alarm` issue. `ai-review`, `factory-tick`, `watchdog`, `weekly-demo`: factory-owned, untouched.
- No pipeline change: S-009 adds unit, property and e2e specs run by existing scripts and no dependency. DELIVER diff about 654 lines (904 with protected), under the 1200 guard; `docs/` is outside the count.
- Local gate: `pnpm run check` mirrors the commit stage; no git hooks (locked). Security: no secrets, runtime deps or network; text enters the DOM via `el()`/`textContent` (ADR-0002). SAST/SCA/SBOM not added (inherited owner-only item).

### Wave: DEVOPS / [REF] Monitoring contracts (DISCUSS KPI to instrument)
E2E instrument: `tests/e2e/S-009-end-of-season.spec.ts` (Pixel 7, 390px) via `ci:e2e` on PR and main and `smoke` on the live URL. Unit/property rows run in `ci:test` with a fresh `FC_SEED`. `tests/protected/S-009/` runs on local-preview in `ci` and must pass on main.

| KPI (DISCUSS) | Instrument | Pass condition |
|---|---|---|
| K1: verdict in 1 tap from the club home after matchday 14; a new season's first match in 3 taps from the End of season screen | e2e: page-side capture-phase click counter (as S-003..S-008): exactly 1 click from the club home to the screen ("End of season"); "Play again", club, "Play match" = 3 clicks to "Matchday 1" with the golden score line; "End of season" absent and "Play match" present after 13 matches. Protected: the offer at 14 and not before, by rule. Manual: owner's Friday demo observes whether he taps "Play again" (no analytics in the POC) | 1 and 3 clicks; offer exactly at 14 |
| K2: 0 disagreements between "Final position" and the table's Pos, and between "Top scorer" and the 14 "Goals" lists, over seeds 1..300 x 8 clubs (2400 seasons) and in every CI run | unit: committed fixed-seed sweep against an oracle that does not call `topScorer` (the `matchFor` goal lists and `standingsOf`); fast-check (`numRuns` 100, fresh `FC_SEED`) over constructed logs for outright, two- and three-way ties, one goal, none, opponent goals ignored, order independence; `formatOrdinal` table. e2e: the three goldens, cell for cell (cross-engine). Protected: rules, not names (Pos equals the Table, count equals the "Goals" items, no larger count, tie to the lowest squad index) | 0 mismatches; goldens exact |
| K3: 100% of "Play again" states equal a fresh `NewGame` state of the same league; 0 differences between a replayed season and the first | property on `update`: after up to 40 valid and invalid actions plus a season, `NewGame` from `seasonEnd` `toEqual` `update(initialState(league), NewGame)`, also after a changed formation and picks; e2e: replay with the same choices reads the same End of season lines; "Tactics" shows 4-4-2, "Starting XI" the automatic XI, "Table" all zero A to Z | 100%; 0 differences |
| Boundary 13 / 14 (D3, D6) | unit: `ViewSeasonEnd` at 13 and 14, from other screens, unknown club, `toBe` no-ops; "Play match" after 14 stays a no-op | holds |
| 44px, no sideways scroll at 390px, 0 console errors, focus | e2e on the club home with "End of season" and on the End of season screen: buttons 44px or taller, h1 focused on arrival, after Back and after Play again, click-everything dispatches only `NewGame` and `Back` | holds |
| Names, determinism | unit: "End of season", "Final position", "Top scorer", "Play again" in no `names.ts` string (locators `exact: true`; "Saltmarsh End" only holds "End"); no `Math.random`/`Date` (PR guard); same seed same screen, "?seed=abc" equals no seed | holds |
| S-001..S-008 unchanged | existing e2e and acceptance (only the DESIGN amend list: replace, never weaken) and `tests/protected/S-001..S-008/` | green |
| Domain test strength | Stryker on `src/domain/**` (`season.ts`, `formatOrdinal`) and `src/app/state.ts` (`ViewSeasonEnd`, `NewGame` from `seasonEnd`, `seasonSummaryOf`, `HOME_RETURNING_KINDS`, `sameScreen`) | nightly, at or above break 70 |

No analytics (POC). The e2e tap counter, the property tests and the owner's demo are the KPIs' sole measurements.

### Wave: DEVOPS / [REF] Deployment strategy and rollback
- Strategy: recreate. Merge to main triggers `deploy`, replacing the whole static artifact; idempotent.
- Rollback (designed first): revert the S-009 squash commit on main; the merge triggers `deploy` and `smoke` validates the restored site. Alternative: `workflow_dispatch` of `deploy.yml` on the pre-S-009 commit (the S-008 deploy). Fallback: fix-forward on a `claude/*` branch. The append-only protected guards may block a plain revert of a squash that added `tests/protected/S-009/`; the dispatch route is then the owner action. Time to restore: one deploy cycle (about 5 minutes).
- Failure detection: a red `smoke` marks the deploy run red; a cross-engine fault shows as a red golden (seed 31, 20260 or 13) while `ci:test` stays green.
- Data: nothing persisted, no user data at risk, nothing to migrate. Rolling back returns the club home to S-008's plain "Season over" line and removes the End of season screen and "Play again".
- Result stability: no new RNG stream and no change to any result, schedule or squad for any seed; the screen is a pure function of the log and the seed. Blast radius: one static page.

### Wave: DEVOPS / [REF] Mutation testing strategy
nightly-delta, inherited from `CLAUDE.md`; `/nw-deliver` Phase 5 skipped. `stryker.config.mjs` (read) mutates `src/domain/**/*.ts` except `names.ts`, plus `src/app/state.ts`; thresholds high 85, low 70, break 70. No config change.
- `src/domain/season.ts` (new: `topScorer`, `formatTopScorer`): INSIDE the existing glob `src/domain/**/*.ts`; it is not `names.ts`, so it is mutated from the first nightly after the merge. Killed by outright, two- and three-way tie (lowest index; the seed-31 5-5 tie kills a last-index mutant), exactly 1 goal ("goal" vs "goals"), none, opponent goals ignored, home and away both counted.
- `src/domain/standings.ts` (`formatOrdinal`): INSIDE; killed by the ordinal table (1..8, 11-13, 21-23, 101, 111) and the `RangeError` cases.
- `src/app/state.ts` (`ViewSeasonEnd` guard at `nextMatchday`, `NewGame` from `seasonEnd`, `seasonSummaryOf`, `HOME_RETURNING_KINDS`, `sameScreen` default): INSIDE; killed by boundaries 13 and 14, `toBe` no-ops, `NewGame` equals a fresh game, the oracle sweep and the 40-action property.
- `src/ui/screens/season-end.ts`, `src/ui/screens/club-home.ts` (button vs "Play match") and `src/main.ts` (`seasonSummaryOrThrow`, the `seasonEnd` case): OUTSIDE the globs (`src/ui/` and `main.ts` never were). Gap: a mutant in the markup or the wiring is caught only by the e2e and the grep tests, not by nightly mutation. Open question 2; no config change.
- Runtime watch: the 2400-season oracle sweep re-runs per `season.ts`, `standings.ts` and `state.ts` mutant; see Open questions 3.

### Wave: DEVOPS / [REF] Observability stack
Browser console plus Playwright smoke on the deployed URL only. No RUM, error tracking, logs or tracing. SLO: smoke green per deploy (including the seed-31 End of season probe and the replay). Alerting: a red `deploy` run; a red nightly opens `mutation-alarm`. No dashboards.

### Wave: DEVOPS / [REF] Branching strategy
Trunk-based. Short-lived `claude/S-009-*` branches, PR to main, squash merge, deploy on merge, no release branches. CI green and protected scenarios not regressing. DESIGN estimates the DELIVER diff at about 654 lines (904 with protected), under the 1200 guard, so no cut is needed; if DELIVER nears the guard, ship slice 01 (the screen) first, then slice 02 ("Play again", about 130 lines).

### Wave: DEVOPS / [REF] Coexistence matrix
| Component | S-009 impact | Action |
|---|---|---|
| `ci.yml`, `deploy.yml`, `nightly.yml`, `ci:*` scripts, `playwright.config.ts` | none; Pixel 7, 390px, `BASE_URL` fit | reuse |
| `stryker.config.mjs`, `scripts/guards/pr-guards.mjs` | `season.ts`, `standings.ts`, `state.ts` already inside the globs; determinism grep and 1200 cap fit | none |
| `tests/protected/S-001..S-007/` | untouched; "Play match" keeps its exact name | must stay green |
| `tests/protected/S-008/` | its whole-season file never reaches "Season over" and never pinned the line | must stay green |
| `tests/protected/S-009/` | locked scenarios (plan run); one 28-tap season per scenario (timeout constraint below) | must pass on main |
| Amend list (`tests/e2e/S-008-season.spec.ts`, `S-008-club-home-regression.spec.ts`, `tests/acceptance/S-008/season-end.test.ts`) | non-protected "Season over" assertions replaced by "End of season" button checks (DESIGN amend list; DISTILL fixes the text) | replace, never weaken, in the same commit as the production change |
| `tests/acceptance/S-008/names-avoid-season-words.test.ts`, S-008 properties, `focusPlan` suites, `renderers-never-move-focus` | unedited (the `sameScreen` refactor is behaviour-preserving) | reuse, regression-watch |
| `tests/e2e/S-001..S-007*.spec.ts`, `shell.spec.ts` | focus on h1 holds; the club-home button lists are unchanged before matchday 14 | reuse, regression-watch |
| `src/app/state.ts`, `club-home.ts`, `main.ts`, `styles.css`, new `season.ts`, `season-end.ts` | extended / created | S-001..S-008 tests guard |
| `docs/product/ui/design-system.md`, `adr-0014`, `brief.md` | updated in DESIGN | none |
| Pages artifact, base path `/gaffer/` | negligible growth | none |

**Constraint for the protected scenarios and DISTILL (timeouts).** The locked runner `scripts/factory/protected.playwright.config.ts` sets `timeout: 20_000` per test, `expect` and `actionTimeout` 2 s, `retries: 0`, `workers: 4`. A protected S-009 scenario plays a full 14-matchday season (28 taps plus the "Squad" order, the 14 "Goals" lists and the table reads), so each one must call `test.setTimeout(90_000)` as `tests/protected/S-008/season.spec.ts` does for its whole-season test (line 298; `test.slow()` alone gives only 60 s and is used elsewhere in that file). Rules: one seed and one club per scenario (outline instances are separate tests); never play two seasons in one protected test; keep reads per matchday minimal; per-action 2 s is unchanged and enough for one tap. Four parallel workers each simulate a season, so headroom matters on a CI runner. The agent e2e (`playwright.config.ts`: 30 s per test, `retries: 1` in CI) needs `test.setTimeout(90_000)` for the replay test (two seasons) and `test.slow()` or `setTimeout` for single-season tests.

### Wave: DEVOPS / [REF] Pre-requisites
- S-008 delivered and deployed; Pages source "GitHub Actions" enabled (✓). Node 22+, pnpm 10.12.4, Playwright chromium via `.github/actions/setup`.
- ADR-0001..0015 accepted (✓; ADR-0015 landed in DESIGN). `docs/product/jobs.yaml` has J-09 (✓).
- **`tests/protected/S-009/` is not in the tree** (checked in this run: `tests/protected/` holds S-001..S-008 only). The DISCUSS says the plan run writes it, append-only; it must be committed (with `test.setTimeout(90_000)` per the constraint above) before DELIVER starts, and the `ci` no-regression check expects it to fail on main until then.
- `BASE_URL` derived from owner and repo name (no secret).

### Wave: DEVOPS / [REF] Open questions
Owner-only items inherited from S-001..S-008 (smoke `sleep 20`, no security scanning, no commit-SHA check in smoke, deploy not gated on `ci`, squash revert blocked by append-only guards, no uptime probe, WebKit not probed; see `docs/feature/S-007/feature-delta.md` and `docs/feature/S-008/feature-delta.md`) are unchanged and none block S-009. New:
1. Timeouts for full-season tests: see the constraint in the coexistence section. No config change needed; owner awareness only. If a protected scenario still nears 90 s on the runner, trim reads per matchday, not the 14 matchdays. The live-site `smoke` runs the replay test over the network; the test-level `setTimeout(90_000)` covers latency, the per-action 2 s limit applies only to the protected runner.
2. Mutation gap: `season-end.ts`, the `club-home.ts` button and the `main.ts` wiring are outside the Stryker globs; covered only by the e2e and the grep tests. Owner may widen `mutate` to `src/ui/screens/*.ts` later (`stryker.config.mjs` is locked); not needed for S-009.
3. Nightly runtime: the K2 oracle sweep (seeds 1..300, each seed's 56 results played once) plus fast-check (`numRuns` 100) re-run per mutant of `season.ts`, `standings.ts` and `state.ts`. DELIVER keeps the sweep to one season per seed (club-independent with untouched tactics) and `numRuns` bounded. Watch the first nightly after the merge against the 45-minute timeout; if it nears it, trim test cost, not bounds, or the owner raises the timeout.
4. Smoke on the live URL runs the S-009 spec (seeds 31 and 13 and the replay) and relies on `?seed=` on Pages (same as S-001..S-008).
5. Changes I would need in locked paths: none. (If the owner wants the UI renderers mutated, `stryker.config.mjs` `mutate` would need `src/ui/screens/*.ts`; recorded in 2.)
6. Missing `tests/protected/S-009/` (see Pre-requisites) is a plan-run item, not a DEVOPS change; flagged for the orchestrator.

### Wave: DEVOPS / [REF] Peer review
pending
