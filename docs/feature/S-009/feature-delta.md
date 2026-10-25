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
