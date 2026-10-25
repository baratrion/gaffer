# S-008: Play the season, matchday by matchday

## Wave: DISCUSS

Lean, unattended, revision 3, final (after `nw-product-owner-reviewer` cycles 1 and 2, see Peer review). Reuses `discuss/journey.md` and `slices/slice-01..02`. North star: "manage one fictional club through one short season, start to finish". S-006 shipped matchday 1 and S-007 the table after it. S-007 also said that a second "Play match" re-shows matchday 1 *in this version* and that later versions may move on. scope.md IN says: "Season: double round-robin (14 matchdays); other matches are simulated; league table." The domain already has the full 14-matchday schedule (ADR-0010), streams 200..255 for every fixture (ADR-0011) and an append-only results log (ADR-0012). So the smallest next visible increment is this: every "Play match" plays the NEXT matchday. Narrowed by scope.md precedence (ship less), the following are all later stories: the end-of-season screen, save and continue, the other results, a fixtures list, commentary and stats. Feature type: user-facing. UX depth: lightweight. Walking skeleton: no (brownfield, extends S-001..S-007). JTBD: yes, new job J-08. No DIVERGE artifact (accepted as lean, as for S-002..S-007).

### Wave: DISCUSS / [REF] Scope Assessment
PASS: 2 small user stories with 7 scenarios in total (4, 3), 1 roadmap story and one demonstrable outcome ("I can play my season to the end"). No new context: it uses Match (`playMatchday`), Schedule (`fixturesOf`), Standings (unchanged) and one rule change in the app state (`PlayMatch` appends the next matchday instead of re-showing). 2 carpaccio slices, one release (one DELIVER), about 1.25 days. Integration points: schedule (ADR-0010), match streams (ADR-0011), results log (ADR-0012), standings (ADR-0013), club home: 5, at the limit, not over it. No oversized signal: the end-of-season screen, persistence and other results are cut (D-out).

Line budget (changed lines, code plus tests; file names are indicative, and DESIGN names the files). The one hard cap is the 1200-line PR guard. The e2e covers only what the protected scenarios do not: the seed-31 reference season as a cross-engine golden, focus, 44px and 390px.

| File | Kind | Lines |
|---|---|---|
| `src/app/state.ts` and a pure next-matchday helper (next matchday on "Play match", guard after 14, match screen reads the latest match, side builder generalised from matchday 1) | code | 55 |
| `src/ui/screens/club-home.ts`, `src/main.ts`, `src/ui/styles.css` ("Play match" or the "Season over" line, from a season-over flag) | code | 20 |
| `tests/acceptance/S-008/season-progression.test.ts` (unit and property: next matchday, append-only, picks count from the next match, P N, no-op after 14, `NewGame` clears) | tests | 150 |
| `tests/acceptance/S-008/season-for-a-club.test.ts` (every rival twice, named first once; seed-31 and seed-20260 reference-season goldens) and the D9 names check | tests | 75 |
| `tests/e2e/S-008-season.spec.ts` (14 matchdays at 390px, "Season over", trimmed to what protected does not cover) | tests | 120 |
| Amended S-006/S-007 non-protected re-show assertions (D7) | tests | 40 |
| **DELIVER total** (code 75, tests 385) | code and tests | **460** |
| `tests/protected/S-008/season.spec.ts` (written in the plan run, outside DELIVER; measured) | tests | 347 |
| **Grand total** (with protected) | code and tests | **807** (DESIGN re-estimates DELIVER at 481, so about 828) |

### Wave: DISCUSS / [REF] Persona
Sam, 34, a lapsed Championship Manager fan. He plays on the bus, one-handed, on a mid-range Android phone 390px wide, with 5 minutes to spare (persona from `docs/feature/S-001/feature-delta.md`). He has played matchday 1 and read the table. Now he wants the season to go on: the next opponent, the next result, the climb or the drop, and a last day that settles where he finishes.

### Wave: DISCUSS / [REF] JTBD one-liner
When I come back for a few spare minutes, I want to play my club's next match of the season, so that each result builds toward where we finish. (Recorded as J-08 `play-out-my-season` in `docs/product/jobs.yaml`; it follows J-06 and J-07.) S-008 serves J-08 in part: play the next match, the table after every match, and the season-over line. The final-position screen and saving are later stories.

### Wave: DISCUSS / [REF] Glossary
- **Next matchday**: the matchday after the last recorded one; 1 when none (on the contiguous log `update` keeps, this equals the lowest unrecorded matchday and count/4 + 1). "Play match" plays it for the whole league (D1). **N-th match**: Sam's match on matchday N. The table after it reads P N on every row (D4).
- **Season over**: all 14 matchdays recorded (56 results). The club home shows the line "Season over" instead of the "Play match" button (D6, this version only).
- **Named first / named second**: the club before / after the dash in the score line (the schedule's home and away; no home advantage).
- **Reference season**: the real generator's 14 matchdays at a seed with untouched tactics (`discuss/reference-season.md`). **Recorded result**, **Standings**, **Table row**, **Untouched tactics**, **Score line**, **Screen title**: as in S-006/S-007.

### Wave: DISCUSS / [REF] Locked decisions
- D1 Next matchday: each "Play match" tap on a known club's home plays the next matchday for the whole league. Its 4 fixtures: Sam's with his formation and his Starting XI at the moment of the tap, and the other 3 with both clubs' automatic XI in 4-4-2, exactly as S-007 does for matchday 1. The tap appends the 4 results (earlier matchdays never change) and shows the match screen of Sam's fixture of that matchday. The first tap of a new game is still matchday 1, exactly as S-006/S-007 (their durable contracts are untouched).
- D2 Match screen: its only h1 reads "Matchday N", where N is the matchday just played (1..14), focused on arrival. The score line and the "Goals" list use exactly the S-006 formats. Sam's goals are scored by the outfield players of his Starting XI at the time of that match; the opponent's by non-GK players of the opponent's squad. "Back" returns to the club home, focus on its h1.
- D3 Opponents come from the fixed double round-robin (ADR-0010). Over matchdays 1..7 Sam's club meets each of the other 7 clubs exactly once, and over 8..14 again exactly once each. Over the 14 matchdays it is named first against each other club exactly once and named second exactly once. Pairing and order come from the schedule and are the same for every seed (club names vary with the seed).
- D4 Table: after N matches, every row reads P N. The row rules (W + D + L = P, Pts = 3 × W + D) hold on every row. Total W = total L, total D is even, and the GDs add up to 0. Sam's row equals the sum of the score lines he saw (W/D/L counts, GD = goals for minus goals against, Pts). Order rules as S-007 (D4/D14 there).
- D5 Picks between matches count from the next match on. Changing the formation or the XI after matchday k changes nothing recorded (match k and the table stay), and matchday k+1 uses the new XI.
- D6 End of season, this version only: after matchday 14 the club home has no "Play match" button and shows the short line "Season over" instead. The heading and "Squad", "Tactics", "Starting XI" and "Table" stay. "Table" still opens and reads P 14. A "Play match" action after 14 is a no-op (unit test). This rule is not durable and is not pinned in `tests/protected/`. This version amends the S-007 outcome's "Play match" button staying on the club home, from matchday 14 on only; S-007's durable list is unchanged and no protected scenario reaches matchday 14. The amendment lives in the S-008 outcome; roadmap stories are never edited, so S-007's entry stays as it is. The end-of-season screen (final position, top scorer, play again) is a later story.
- D7 The S-007 re-show is superseded: a second "Play match" now plays matchday 2. S-007 flagged the re-show as non-durable, and no protected S-007 scenario plays twice (checked by the orchestrator). There is no way to re-open an already played match in this version. DELIVER replaces (never weakens) the non-protected assertions of the re-show. Indicative list (DISTILL fixes the exact one): `tests/e2e/S-006-match.spec.ts` "playing again replays the same match (nothing is recorded)", the re-show test in `tests/e2e/S-007-table.spec.ts`, and the S-007 unit and property cases where a later `PlayMatch` keeps the same `results` (now: a later `PlayMatch` appends 4 entries and leaves the earlier entries unchanged).
- D8 Determinism and lifetime: the same seed, club and picks give identical matches and tables on every matchday; "?seed=abc" is the same as no seed. No new RNG stream (matchday N uses streams 200 + 4(N-1) .. +3). Results are kept until the page is reloaded (no persistence). `NewGame` clears them (unit-level invariant, as S-007 D9).
- D9 Phone first and regression: no horizontal scroll at 390px, buttons 44px or taller, no console errors, text through `el()`/`textContent` (ADR-0002), renderers never move focus (ADR-0008). All S-001..S-007 protected scenarios stay green, and "Play match" keeps its exact name. Accessible names: "Season over" appears (case-insensitive) in no `src/domain/names.ts` entry and no generated name (grep today: none; "Rovers" contains "over" but not the phrase). DISTILL adds a unit check, as S-007 D11.
- D10 Durability, for every later version, within each season (a new game, and any later season a later version may start): each "Play match" plays the season's next matchday in order. The match screen of the season's N-th match has the h1 "Matchday N" (1..14), with the S-006 score-line and "Goals" formats. After the season's N-th match every table row has P N. Over the season's 14 matchdays the player's club meets every other club exactly twice, named first once and named second once. Protected (`tests/protected/S-008/`) pins these through: the US-1 outline (matchday 2: next matchday in order, the N-th h1 and the formats); US-1 scenario 2 and US-2 scenario 2 (every row P N); US-2 scenario 1 (every rival twice, named first once and second once). US-1 scenario 3 (picks count forward) and US-1 scenario 4 (same seed) are also candidates; US-2 scenario 3 ("Season over") stays out. Not durable: the "Season over" line, the missing button after matchday 14, and "no way to re-open a played match". UX depth: no mockups beyond the journey table.

### Wave: DISCUSS / [REF] Story map and priority
Backbone: pick club, club home, squad, tactics, starting XI, **play next match**, see table, (next: end of season, save, other results). Walking skeleton: the existing S-001..S-007 loop; this story turns it into a cycle (club home, play match, back, table, back, repeat). One release with two thin slices, both in the one S-008 DELIVER:
1. `slices/slice-01-next-matchday.md` (US-1): "Play match" plays the next matchday. The h1 reads "Matchday N", the opponent is new, picks count from the next match, and the table reads P N. Value 5 x urgency 5 / effort 2 = 12.5. It comes first because it is the rule change itself and every later season story builds on it.
2. `slices/slice-02-season-to-the-end.md` (US-2): play all 14. Every rival twice, named first once and second once, the final table at P 14, and the "Season over" line in place of the button. 4 x 4 / 1 = 16, but it depends on slice 01. It closes the season.

Priority rationale: the north star is a season "start to finish". Without the next matchday the loop stops after one match. Slices are ordered by dependency, then by outcome value. The roadmap outcome and `tests/protected/S-008/` are complete only after slice 02. Rejected alternatives: save and continue first (it persists a one-match game); an end-of-season screen in this story (a second screen and a top-scorer rule double the scope); a "next opponent" line on the club home first (text with no result).

### Wave: DISCUSS / [REF] User stories
Fixtures from `discuss/reference-season.md` (the real generator, untouched tactics). At `?seed=31` Netherwold Borough (club 0) plays: 1 "Netherwold Borough 1–2 Marlbrook Athletic", 2 "Rushmoor Heath Albion 2–1 Netherwold Borough", 3 "Netherwold Borough 2–1 Oakhampton Rise Borough", 4 "Valebridge Albion 1–2 Netherwold Borough", 5 "Netherwold Borough 1–0 Fennimore Town", 6 "Juniper Hollow United 2–0 Netherwold Borough", 7 "Netherwold Borough 2–4 Tarnbeck Borough", 8 "Marlbrook Athletic 1–2 Netherwold Borough", 9 "Netherwold Borough 3–1 Rushmoor Heath Albion", 10 "Oakhampton Rise Borough 1–1 Netherwold Borough", 11 "Netherwold Borough 2–0 Valebridge Albion", 12 "Fennimore Town 2–2 Netherwold Borough", 13 "Netherwold Borough 1–0 Juniper Hollow United", 14 "Tarnbeck Borough 2–1 Netherwold Borough". It finishes 3rd: P 14, W 7, D 2, L 5, GD "+2", Pts 23.
At the default seed 20260 (`?seed=abc`) Oakhampton Rise Borough (club 7) opens with "Harrowgate Lane United 0–1 Oakhampton Rise Borough", plays "Oakhampton Rise Borough 2–2 Mossdale Wanderers" on matchday 2 and finishes 2nd (P 14, W 5, D 6, L 3, GD "+4", Pts 21), behind Valebridge Town (Pts 29). The pick "Kestrel Northcott 6" for "MF Calder Redfern 15" after choosing 4-3-3 is the S-006/S-007 golden pick at `?seed=31`. The acceptance criteria state rules; the reference season is a unit-level and e2e regression lock, not a protected scenario.

#### US-1: Play the next matchday
**Problem:** Sam has played matchday 1 and seen the table. Tapping "Play match" again shows the same 1–2 defeat. His season is stuck on one result, so no decision he makes for the next match can ever count.
**job_id:** J-08

##### Elevator Pitch
- Before: on Netherwold Borough's home, a second "Play match" re-shows "Matchday 1", "Netherwold Borough 1–2 Marlbrook Athletic".
- After: Sam taps "Back" and "Play match" again and sees the screen title "Matchday 2", "Rushmoor Heath Albion 2–1 Netherwold Borough". Then "Back" and "Table" show every row at P 2, with Netherwold Borough 8th on Pts 0 and GD "-2". After matchday 3 ("Netherwold Borough 2–1 Oakhampton Rise Borough") he is 6th on Pts 3.
- Decision enabled: do I change my eleven or my formation before the next match, now that I know who I just lost to and where I stand?

**Domain examples**
1. `?seed=31`, "Netherwold Borough", untouched tactics, "Play match", "Back", "Play match": "Matchday 2", "Rushmoor Heath Albion 2–1 Netherwold Borough". "Back", "Table": 1 Tarnbeck Borough 2 1 1 0 +4 4; 2 Oakhampton Rise Borough 2 1 1 0 +2 4; 3 Marlbrook Athletic 2 1 1 0 +1 4; 4 Juniper Hollow United 2 1 0 1 0 3; 5 Rushmoor Heath Albion 2 1 0 1 -3 3; 6 Fennimore Town 2 0 2 0 0 2; 7 Valebridge Albion 2 0 1 1 -2 1; 8 Netherwold Borough 2 0 0 2 -2 0.
2. `?seed=abc`, "Oakhampton Rise Borough", untouched tactics, two matches: "Matchday 1" "Harrowgate Lane United 0–1 Oakhampton Rise Borough", then "Matchday 2" "Oakhampton Rise Borough 2–2 Mossdale Wanderers". Its row reads P 2, W 1, D 1, L 0, GD "+1", Pts 4.
3. `?seed=31`, after matchday 1 Sam chooses "4-3-3" and picks "Kestrel Northcott 6" for "MF Calder Redfern 15". The table still reads as after matchday 1 (Netherwold Borough 6th, P 1, GD "-1"). "Play match" shows "Matchday 2" against Rushmoor Heath Albion (named first, from the schedule). Every Netherwold Borough goal is scored by one of the 11 now on his Starting XI screen, never the GK and never Calder Redfern (no score is pinned here; the score-line pattern and the 11-scorer rule are).

**Acceptance criteria (embedded UAT)**
```gherkin
Scenario Outline: The second Play match plays matchday 2 against a new opponent
  Given Sam opens a fresh page at "<seed>", taps "New game", reads the 8 names of the "Clubs" list, taps "<club>", taps "Play match", reads the score line and taps "Back", and reads its Starting XI (taps "Starting XI", reads the 11, taps "Back")
  When Sam taps "Play match" again
  Then the screen title "Matchday 2" is the only h1 and has focus
  And the score line matches ^(.+) (\d)–(\d) (.+)$ and names "<club>" and one other club of the "Clubs" list
  And that other club is not the other club of the matchday-1 score line
  And the "Goals" list has one item per goal in the S-006 format, minutes never decreasing
  And every goal naming "<club>" is scored by one of the 11 on its Starting XI screen, never the GK slot
  Examples:
    | seed      | club                    |
    | ?seed=31  | Netherwold Borough      |
    | ?seed=abc | Oakhampton Rise Borough |

Scenario: After three matches the table agrees with the three results Sam saw
  Given Sam at "?seed=31" managing "Netherwold Borough" has tapped "Play match" and "Back" 3 times, reading the 3 score lines
  When Sam taps "Table"
  Then every body row has P 3
  And on every body row W + D + L = P
  And on every body row Pts = 3 x W + D
  And Netherwold Borough's W, D and L count its wins, draws and losses in those 3 score lines
  And Netherwold Borough's GD is its goals minus the other clubs' goals over those 3 score lines
  And Netherwold Borough's Pts is 3 per win plus 1 per draw

Scenario: Picks made between matches count from the next match on
  Given Sam at "?seed=31" managing "Netherwold Borough" has played matchday 1, tapped "Back" and "Table" and read the table
  When Sam taps "Back", "Tactics", chooses "4-3-3", taps "Back", "Starting XI", the slot "MF Calder Redfern 15", "Kestrel Northcott 6", "Back" and "Table"
  Then the table reads exactly as before, cell for cell
  When Sam taps "Back", "Starting XI", reads the 11, taps "Back" and then "Play match"
  Then the screen title is "Matchday 2"
  And every goal naming "Netherwold Borough" is scored by one of the 11 now on its Starting XI screen, never the GK slot

Scenario Outline: The same seed plays the same season
  Given Sam opens a fresh page at "<first>", taps "New game" and "<club>" and plays 3 matches, reading each score line and "Goals" list, and after each match taps "Back", "Table", reads the table and taps "Back"
  When Sam does the same in a second fresh page at "<second>"
  Then the 3 match screens read the same, and the tables after them read the same, cell for cell
  Examples:
    | first     | second                   | club                    |
    | ?seed=31  | ?seed=31                 | Netherwold Borough      |
    | ?seed=abc | no ?seed= in the address | Oakhampton Rise Borough |
```
Property-test notes: total W = total L, total D even and total GD = 0 after any N, plus the S-007 order rules after any N, are unit and property tests (fast-check honours `FC_SEED`). The e2e checks the seed-31 table of example 1 (cross-engine), 44px, no sideways scroll and no console errors. The opponent's goals (non-GK players of the opponent's "Squad" list) are kept from S-006 (protected there for matchday 1; unit tests for N > 1).

**Outcome KPI:** K1, K3 (below).
**Technical notes (for DESIGN, not AC):** the next matchday (Glossary) is derived from the recorded results, with no second source of truth (ADR-0012's log carries each entry's matchday). `PlayMatch` appends `playMatchday` for that matchday. Sides are built as `playOpeningMatchday` builds them today (managed `currentXI`, others `automaticXI(squad, DEFAULT_FORMATION)`), generalised from matchday 1. ADR-0012 foresaw replacing `OPENING_MATCHDAY` with a matchday held in state; S-008 derives the matchday from the results log instead (DESIGN records this in ADR-0014). The match screen reads the managed club's entry of the latest recorded matchday through the one selector (`matchFor` today). Streams are unchanged (ADR-0011). Superseding ADR-0012's "later taps re-show" needs a decision record: DESIGN's call whether that is an ADR-0012 amendment or a short new ADR. Depends on S-006, S-007.

#### US-2: Play the season to the end
**Problem:** a season that never ends cannot be won. Sam wants all 14 matchdays: every rival twice, home and away, and a last day that leaves a final table he can read. He also needs the game to tell him plainly when there is nothing left to play.
**job_id:** J-08

##### Elevator Pitch
- Before: Sam can play on, but nothing tells him how the season ends or that it has ended.
- After: on matchday 14 Sam sees "Matchday 14", "Tarnbeck Borough 2–1 Netherwold Borough". He taps "Back" and the club home shows "Season over" where "Play match" was. "Table" shows every row at P 14, with Netherwold Borough 3rd: W 7, D 2, L 5, GD "+2", Pts 23, five points behind Oakhampton Rise Borough.
- Decision enabled: was that a good season for my club, and will I start another one?

**Domain examples**
1. `?seed=31`, "Netherwold Borough", untouched tactics, 14 matches: the 14 score lines of the Fixtures above, in order "Matchday 1" to "Matchday 14". Netherwold Borough is named first against Marlbrook Athletic (1), Oakhampton Rise Borough (3), Fennimore Town (5), Tarnbeck Borough (7), Rushmoor Heath Albion (9), Valebridge Albion (11) and Juniper Hollow United (13), and named second against each of them once (2, 4, 6, 8, 10, 12, 14).
2. Example 1's final table: 1 Oakhampton Rise Borough 14 8 4 2 +11 28; 2 Tarnbeck Borough 14 7 5 2 +14 26; 3 Netherwold Borough 14 7 2 5 +2 23; 4 Juniper Hollow United 14 6 3 5 +3 21; 5 Marlbrook Athletic 14 5 4 5 -4 19; 6 Rushmoor Heath Albion 14 5 4 5 -4 19; 7 Fennimore Town 14 2 5 7 -7 11; 8 Valebridge Albion 14 1 3 10 -15 6. Marlbrook Athletic and Rushmoor Heath Albion are level on Pts and GD, and goals scored decides (18 against 17).
3. `?seed=abc`, "Oakhampton Rise Borough", untouched tactics, after "Matchday 14" "Oakhampton Rise Borough 1–1 Ironbridge Fen Wanderers": "Back" shows "Season over", and "Squad", "Tactics", "Starting XI" and "Table" are still there. "Table": Valebridge Town 1st on 29, Oakhampton Rise Borough 2nd on 21, every row P 14.

**Acceptance criteria (embedded UAT)**
```gherkin
Scenario Outline: Over the season Sam meets every rival twice, named first once and second once
  Given Sam opens a fresh page at "<seed>", taps "New game", reads the 8 names of the "Clubs" list and taps "<club>"
  When Sam taps "Play match" and "Back" 14 times, reading each screen title and score line
  Then the screen titles read "Matchday 1" to "Matchday 14", in order
  And over matches 1 to 7 the other club of the score line is each other club of the "Clubs" list exactly once
  And over matches 8 to 14 it is each other club of the "Clubs" list exactly once
  And "<club>" is named first against each other club exactly once and named second exactly once
  Examples:
    | seed      | club                    |
    | ?seed=31  | Netherwold Borough      |
    | ?seed=abc | Oakhampton Rise Borough |

Scenario: The final table agrees with the season Sam played
  Given Sam at "?seed=31" managing "Netherwold Borough" has played 14 matches, reading each score line, and is on the matchday-14 screen
  When Sam taps "Back" and then "Table"
  Then every body row has P 14
  And on every body row W + D + L = P
  And on every body row Pts = 3 x W + D
  And Netherwold Borough's W, D and L count its wins, draws and losses in its 14 score lines
  And Netherwold Borough's GD is its goals minus the other clubs' goals over its 14 score lines
  And Pts never increases down the table
  And between rows with equal Pts, GD never increases

Scenario: When the season is over the club home says so
  Given Sam at "?seed=31" managing "Netherwold Borough" has played 14 matches and is on the matchday-14 screen
  When Sam taps "Back"
  Then the club home heading "Netherwold Borough" has focus
  And the club home shows the text "Season over"
  And there is no button named "Play match"
  And the buttons "Squad", "Tactics", "Starting XI" and "Table" are still there
```
Notes: the third scenario is this version only (D6). It is checked by e2e and unit tests and NOT pinned in `tests/protected/S-008/` (DISTILL decision, as S-007 L-B), so the end-of-season story may replace the line with a screen. The protected scenarios pin the first two (durable, D10; the full pin list is in D10). Unit: a "Play match" action after matchday 14 is a no-op, and the reference seasons at seeds 31 and 20260 are goldens.

**Outcome KPI:** K1, K2 (below).
**Technical notes (for DESIGN, not AC):** "season over" is derived from the recorded results (14 matchdays recorded), never stored separately. The club home renders either the "Play match" button or the "Season over" line from that flag (a plain text line, not a button or heading). The club home layout order stays DESIGN's (S-006 L-2 precedent). The guard sits in `update`, so a dispatched `PlayMatch` after 14 cannot throw from `fixturesOf(15)`. Depends on US-1.
Notes for DESIGN and DISTILL (not part of the AC): "has focus" means `document.activeElement` is the `<h1>`; locators use `exact: true` for "Play match", "Back", "Table", the h1 and "Season over". Protected (`tests/protected/S-008/`) pins only the durable clause plus the per-match rules, through the scenarios D10 names; the "Season over" line, the missing button and the reference-season goldens are e2e and unit tests. A protected season is 28 taps per seed: protected season scenarios use `test.slow()` (60 s on the locked runner, about 2 s per action) and one seed per scenario. `tests/protected/S-001..S-007` stay green: none plays twice, and S-006/S-007 pin matchday 1 of a new game only.

### Wave: DISCUSS / [REF] Outcome KPIs
| # | Who | Does what | By how much (target) | Baseline | Measured by |
|---|---|---|---|---|---|
| K1 | Sam on a 390px phone | Plays his season forward | The next match in 1 tap from the club home; a whole season in 28 taps ("Play match", "Back" x 14); "Season over" visible on the first club home after matchday 14 | stuck on matchday 1 (a second tap re-shows it) | e2e click counter (as S-003..S-007) |
| K2 | Sam | Trusts the season is a real league | Schedule invariants (every rival twice, named first once and second once): 100% over seeds 1..1000 x 8 managed clubs. Season and table invariants (every row P N after match N, row rules on every row, his row equals the sum of his score lines): 0 failures in every CI run | not possible | Schedule: a committed fixed-seed test over seeds 1..1000 x 8 managed clubs (the schedule is seed-independent data). Season and table: fast-check sampling, numRuns 100 per CI run with a fresh `FC_SEED` (`ci:test`), plus the protected scenarios |
| K3 | Sam | Sees his between-match decisions count, and only forward | 0 changes to any recorded matchday over runs of up to 40 formation, pick and navigation actions; in 100% of cases matchday k+1's goals for Sam come from his XI at the tap | not possible | property test on `update` plus the selectors |

Guardrails: S-001..S-007 protected scenarios stay green. The league, squads, schedule, every matchday-1 result and the S-006/S-007 goldens are unchanged for every seed. No sideways scroll at 390px and 0 console errors on the club home, match and table screens. Environments follow `docs/feature/S-004/environments.yaml`: local-preview `http://localhost:4173/gaffer/` and the production Pages URL, Chromium, Pixel 7 profile at 390px. There is no analytics in the POC. Performance is not measured separately: each tap does what S-007's first tap does (8 squads, 4 quick-sims).

### Wave: DISCUSS / [REF] DoD
- `tests/protected/S-008/`, written in this plan run (append-only) from the D10 pin list, passes on main; `tests/protected/S-001/` to `S-007/` still pass. Unit and property tests pass for: next matchday (append-only, earlier matchdays untouched, picks count from the next match), the per-club schedule (every rival twice, named first once), P N and the row rules after any N, the no-op after 14, `NewGame` clearing, the D9 names check and the reference-season goldens at seeds 31 and 20260. The `ci:*` scripts are green.
- The e2e phone smoke covers 14 matchdays at `?seed=31` (h1 and score line each), "Season over" with no "Play match", the final table at P 14, and focus on each heading.
- The D7 amendments replace, never weaken, the superseded re-show assertions; no other S-001..S-007 acceptance assertion is edited. No ambient randomness or wall-clock time in `src/domain/`; no new RNG stream. DESIGN records the supersession of ADR-0012's re-show (an amendment or a new ADR). The DELIVER change stays under the 1200-line PR guard, the one hard cap (460 budgeted, tests included).

### Wave: DISCUSS / [REF] Out-of-scope
- The end-of-season screen (final position, top scorer, "play again"); a second season without a reload; save and continue (localStorage), so a reload loses the season. Results of the other fixtures, a fixtures list, a "next opponent" line on the club home, re-opening past matches; commentary, stats, condition or fatigue changes, home advantage, AI formations for other clubs.
- Every OUT tag: `match-2d`, `utility-ai`, `transfers`, `finances`, `training`, `youth`, `staff`, `multiplayer`, `backend`, `real-data`.

### Wave: DISCUSS / [REF] WS strategy
No new walking skeleton (brownfield). The story turns the S-001..S-007 loop into a cycle by changing one rule ("Play match" plays the next matchday) and adding one end state ("Season over"). The e2e journey "14 x (Play match, Back), Table" is the end-to-end proof of the north star. Two carpaccio slices in order (`slices/slice-01..02`), both delivered in the one S-008 DELIVER.

### Wave: DISCUSS / [REF] Driving ports
- `update(GameState, Action) => GameState`: `PlayMatch` appends the next matchday's 4 results (no-op after 14 or off a known club's home); `NewGame` clears them.
- Selectors: the next matchday (or season over) from the state; the managed club's latest recorded match (`matchFor` today); `standingsOf`. Domain, unchanged: `playMatchday({ seed, matchday, sides })`, `fixturesOf`/`fixtureOf`. UI entry, by role and accessible name at `http://localhost:4173/gaffer/`: the club home button "Play match" (until matchday 14), then the text "Season over"; the match screen h1 "Matchday N"; "Table"; "Back".

### Wave: DISCUSS / [REF] Pre-requisites
- S-001..S-007 delivered (`playMatchday`, `results` log, `standingsOf`, table screen, `fixturesOf` for 1..14, streams 200..255). ADR-0001..0013 accepted; ADR-0012's "later taps re-show (this version only)" is superseded by D1/D7, and DESIGN records it. `docs/product/jobs.yaml` now has J-08 (resolved). The orchestrator appends roadmap entry S-008 from the draft below. `tests/protected/S-008/` is written in this plan run (append-only) from the D10 pin list. D7 lists the non-protected assertions DELIVER amends.

### Wave: DISCUSS / [REF] Roadmap outcome (draft)
From the club home screen, each tap on the button named exactly "Play match" (44px or taller) plays the next matchday of the season for the whole league and shows the match screen of the player's club's fixture on that matchday. The first tap of a new game plays matchday 1 exactly as before, the second plays matchday 2, and so on up to matchday 14. On each matchday the player's fixture is played with the formation in Tactics and the Starting XI at the moment of the tap, and the league's 3 other fixtures are simulated; the 4 results are recorded at that moment and never change afterwards. The match screen's only top-level heading (h1) reads "Matchday N", where N is the matchday just played (a whole number from 1 to 14), focused on arrival, and the score line and the list named "Goals" are already visible. The score line is exactly one piece of text whose whole text reads the home club's name, one space, the home goals, an en dash (–), the away goals, one space and the away club's name (pattern ^(.+) (\d)–(\d) (.+)$), for example "Rushmoor Heath Albion 2–1 Netherwold Borough"; one of the two clubs is the player's club and the other is a different club of the "Clubs" list. The "Goals" list holds exactly one item per goal, in match order with minutes never decreasing, each reading exactly the minute (1 to 90), a straight apostrophe ('), one space, the scorer's name, one space and the scorer's club name in round brackets, for example "23' Ivo Elderkin (Netherwold Borough)"; the number of items naming each club equals that club's goals in the score line. Every goal for the player's club is scored by one of the 11 players on its Starting XI screen at the time of that match, never the one in the GK slot; every goal for the other club is scored by a player of that club's "Squad" list who is not a goalkeeper (GK). A button named exactly "Back" (44px or taller) returns to the club home with focus on its heading, the club's name. Opponents come from the league's fixed double round-robin schedule, the same for every seed (the club names vary with the seed): over matchdays 1 to 7 the player's club meets each of the other 7 clubs exactly once, over matchdays 8 to 14 again exactly once each, and over the 14 matchdays it is named first in the score line against each other club exactly once and named second exactly once. Changing the formation or the Starting XI between two matches changes nothing already played, and the table stays as it was; the change counts from the next "Play match" on. After the player's N-th match, "Back" and "Table" show the table named "League table" with every row at P N; on every row W + D + L = P and Pts = 3 × W + D; the total of W equals the total of L, the total of D is even and the GDs add up to 0; the player's club's row equals the sum of the score lines of its N matches (W, D and L count its wins, draws and losses, GD is its goals minus the goals against, written as in the table, for example "+2", "0" or "-2", and Pts is 3 per win plus 1 per draw); Pts never increases down the table and, between rows with equal Pts, GD never increases. The season comes from the seed: two fresh visits with the same "?seed=", the same club and the same choices show the same match screens and the same table after every matchday, and "?seed=abc" plays the same season as no "?seed=" in the address. Results are kept until the page is reloaded. In this version, after matchday 14 has been played, the club home shows no "Play match" button and shows a line reading exactly "Season over" instead (its heading and its "Squad", "Tactics", "Starting XI" and "Table" buttons stay), and "Table" still shows every row at P 14; an already played match cannot be re-opened. This version amends the S-007 outcome's "Play match" button staying on the club home, from matchday 14 on only; S-007's durable list is unchanged and no protected scenario reaches matchday 14. These hold in every later version of the game, within each season (a new game, and any later season a later version may start): each "Play match" plays the season's next matchday in order; the match screen of the season's N-th match has the h1 "Matchday N" (1 to 14) with the score line and the "Goals" list in these formats; after the season's N-th match every table row has P N; and over the season's 14 matchdays the player's club meets every other club exactly twice, named first once and named second once. The "Season over" line and the missing "Play match" button after matchday 14 are rules of this version only. No horizontal scroll at 390px and no console errors.

### Wave: DISCUSS / [REF] DoR validation
| # | Item | Status | Evidence |
|---|---|---|---|
| 1 | Problem clear, domain language | PASS | US-1: the season is stuck on one 1–2 defeat, so no decision counts; US-2: a season that never ends cannot be won, and nothing says when it is over |
| 2 | Persona specific | PASS | Sam, 34, one-handed on a bus, 390px Android, 5 minutes, has played matchday 1 and read the table |
| 3 | 3+ domain examples, real data | PASS | Real generator output (`reference-season.md`): seed-31 Netherwold Borough's 14 score lines, its table after matchday 2 and the final table (with a goals-scored tie); seed-20260 Oakhampton Rise Borough's matchdays 1, 2 and 14 and its final position; the S-006 golden pick in 4-3-3. 3 examples per story |
| 4 | UAT Given/When/Then, 3-7 | PASS | 7 for S-008 (US-1 4, two outlines; US-2 3, one outline). Every Given and When is executable tap by tap on the real app (US-1 scenario 3 follows slice 01's path), and every Then reads only what an earlier step read (the "Clubs" list, the Starting XI, each table) |
| 5 | AC derived from UAT | PASS | Project convention since S-001: AC are the embedded Gherkin scenarios. D1, D2 and D8 in US-1 scenarios 1 and 4; D4 in US-1 scenario 2 and US-2 scenario 2; D5 in US-1 scenario 3; D3 in US-2 scenario 1; D6 in US-2 scenario 3; D7 and D9 by unit tests, e2e and review |
| 6 | Right-sized | PASS | 2 slices in about 1.25 days; 460 changed lines in DELIVER including tests (DESIGN: 481; the plan run's protected file is 347 lines and outside DELIVER), under the 1200-line PR guard (the one hard cap); one outcome |
| 7 | Technical notes | PASS | Per story: next matchday and season-over derived from the log (no second source), side builder generalised, guard in `update`, streams unchanged, decision record for the re-show supersession |
| 8 | Dependencies tracked | PASS | S-001..S-007 delivered; amended dependency: S-007's outcome ("Play match" stays on the club home) is amended from matchday 14 on only (D6), its durable list unchanged; ADR-0010..0013 accepted; ADR-0012 re-show supersession for DESIGN (ADR-0014); D7 amendments listed; J-08 added |
| 9 | Outcome KPI measurable | PASS | K1 1 tap per match and 28 per season (e2e click counter); K2 schedule invariants 100% over seeds 1..1000 x 8 clubs by a committed fixed-seed test, season and table invariants by fast-check (numRuns 100 per CI run, fresh `FC_SEED`) plus the protected scenarios; K3 0 changes to played matchdays over 40-action runs (property test) |

DoR status: PASSED (both stories). Every story has `job_id` J-08 and an Elevator Pitch.

### Wave: DISCUSS / [REF] Peer review
`nw-product-owner-reviewer` (haiku), cycle 1: rejected_pending_revisions (H1, H2, M1, M2, L1-L4; wording only). Revision 2 applied as below.

| Finding | How it landed |
|---|---|
| H1 steps the app cannot perform | US-1 scenario 3's When now taps "Back" between screens (Tactics, Starting XI, then "Table"). US-2 scenarios 2 and 3 start "on the matchday-14 screen"; scenario 2's When is "Back" and then "Table", scenario 3's is "Back" |
| H2 S-007 outcome keeps "Play match" | D6 and the roadmap outcome draft say that this version amends the S-007 outcome's "Play match" button staying on the club home, from matchday 14 on only; S-007's durable list is unchanged and no protected scenario reaches matchday 14. DoR item 8 lists S-007 as an amended dependency |
| M1 durable clause unscoped | D10 and the outcome's durable clause hold "within each season (a new game, and any later season a later version may start)": the season's next matchday, h1 of the season's N-th match, P N after it, every rival twice, named first once and second once |
| M2 protected pins unnamed | D10 names them: the US-1 outline (next matchday, N-th h1, formats), US-1 scenario 2 and US-2 scenario 2 (P N), US-2 scenario 1 (every rival twice); US-1 scenarios 3 and 4 are candidates; US-2 scenario 3 ("Season over") stays out. The US-2 notes and DISTILL notes point to D10 |
| L1 journey | Step 10 feeling is "Closure"; new boundary path: reload the page, "New game", the season is lost (no save yet) |
| L2 JTBD one-liner | "S-008 serves J-08 in part: play the next match, the table after every match, and the season-over line. The final-position screen and saving are later stories" |
| L3 technical note | US-1 technical note: ADR-0012 foresaw replacing `OPENING_MATCHDAY` with a matchday held in state; S-008 derives the matchday from the results log instead (DESIGN records this in ADR-0014) |
| L4 Starting XI read | The US-1 outline's Given reads the Starting XI ("Starting XI", read the 11, "Back") before the second "Play match" |

Cycle 2 (final): rejected_pending_revisions. H2, M1, M2 and L1-L4 resolved; H1 partial. Revision 3 applied as below.

| Finding | How it landed |
|---|---|
| H1 residual: US-1 scenario 3 not tap by tap | Its When follows slice 01's path: "Back", "Tactics", "4-3-3", "Back", "Starting XI", slot "MF Calder Redfern 15", "Kestrel Northcott 6", "Back", "Table". Its Given reads the table first ("Back", "Table"). DoR item 4 evidence re-marked |
| F1 reads the Thens rely on | Scenario 3: "Back", "Starting XI", read the 11, "Back", then "Play match". Scenario 4: after each match "Back", "Table", read the table, "Back" (both pages). US-1 outline and US-2 scenario 1: read the 8 names of the "Clubs" list on the New game screen |
| F2 K2 measurable | K2 split: schedule invariants by a committed fixed-seed test over seeds 1..1000 x 8 managed clubs (seed-independent data); season and table invariants by fast-check, numRuns 100 per CI run with a fresh `FC_SEED`, plus protected. DoR item 9 restated |
| F3 example 3 | "No score is pinned here; the score-line pattern and the 11-scorer rule are" |
| F4 protected timing | DoD and Pre-requisites: `tests/protected/S-008/` is written in this plan run (append-only) from the D10 pin list |
| F5 next matchday | One Glossary definition (the matchday after the last recorded one; 1 when none; equals the lowest unrecorded one and count/4 + 1 on the contiguous log); the US-1 technical note points to it |
| F6 S-007 amendment location | D6: the amendment lives in the S-008 outcome; roadmap stories are never edited. Outcome draft unchanged |
| F7 one ceiling | "1100" dropped from Scope Assessment, DoD and DoR item 6: the 1200-line PR guard is the one hard cap |
| F8 journey arc | "Each step is one tap or a short run of taps"; step 10 is closure, the season ends here in this version, "one more season?" is a later-story feeling |
| F9 DoR item 5 | Evidence starts "Project convention since S-001: AC are the embedded Gherkin scenarios" |
| F10 protected runtime | DISTILL notes: protected season scenarios use `test.slow()` (60 s on the locked runner, about 2 s per action) and one seed per scenario |

Final: residuals, if any, recorded here; no further cycle. No residual is known after revision 3. This wave did not re-check the DESIGN and DEVOPS sections (for example DEVOPS's K2 row) against the K2 split.

Cycle 3 (final verification, orchestrator-dispatched, read-only): **approved_with_notes**. H1-residual and F1-F9 resolved; F10 partly. Its notes, as landed by the orchestrator:

| Finding | How it landed |
|---|---|
| N1 (high) the 14-matchday protected test may exceed 60 s | Measured on the plan-run prototype under the locked runner: 1.7 s (the 2 s figure is a per-action cap, not a duration). The test still gets `test.setTimeout(90_000)` (S-002/S-003 precedent) as headroom for slow CI. It plays 34 taps, not 28 |
| N2 (low) stale protected line count | Scope Assessment table and DoR item 6 now carry the measured 347 lines and point to the DESIGN estimate (481) |
| N3 (low) the score-line scan reads `textContent` | Kept: the S-006/S-007 protected precedent for "exactly one score line" |
| N4 (low) protected instances differ from the Gherkin instances | Each protected test opens with a comment naming the scenario it pins; seeds and clubs differ on purpose (rules for any seed) |
| N5 (low) schedule sweep is seed-independent | DESIGN F7 states it: one exhaustive check over 8 clubs, the seed loop a cheap guard |
| N6 (low) US-1 scenarios 3 and 4 pinned as candidates | Recorded; D10 permits them |
| DEVOPS K2 row (cycle-2 note) | Aligned by the orchestrator with the K2 split (fixed-seed schedule check plus fast-check `numRuns` 100) |

## Wave: DESIGN

- **Setup**: mode propose; scope application; one solo team, no Conway constraint. Paradigm: functional core, imperative shell (ADR-0003; recorded in the ADRs and the brief, not in CLAUDE.md). Unattended; no questions asked.
- **New ADR**: `adr-0014-season-progression-next-matchday.md` (derivation of the next matchday, the producer, what the match screen reads, "Season over"; supersedes in part ADR-0012's re-show rule and S-007 design D4). ADR-0012 gets a status-line note plus inline "(superseded by ADR-0014, S-008)" markers at the statements it overturns, nothing else.
- **Brief**: `docs/product/architecture/brief.md` gains "Season progression (S-008, ADR-0014)" with the changed assumptions, effect-isolation rows, ports 29-31, the S-008 observable bullet, and updated C4 L2 descriptions. `docs/product/ui/design-system.md` gets one entry ("Season over" line).
- **No new C4 container**; the domain is unchanged. **Library check**: no library is involved (a derived counter, a `<p>`, plain CSS), so no Context7 lookup applies; none was run.

### Wave: DESIGN / [REF] DDD list
- **No new context.** Match (`playMatchday`), Schedule (`fixturesOf`) and Standings are untouched. The only change is in the app shell state: the results log now grows through the season.
- **Language**: Next matchday (highest recorded + 1), Season over (14 recorded), Latest recorded match (what the match screen shows), Results log (append-only; a precursor of the Season aggregate, still not one).
- **Invariants by construction**: the log is contiguous (matchdays 1..k, 4 entries each) because only `update` appends and only whole matchdays; so Next matchday = count / 4 + 1 on every reachable state. Earlier entries are never rewritten.

### Wave: DESIGN / [REF] Decisions
| # | Decision | Source |
|---|---|---|
| D1 | **Next matchday is derived**: `nextMatchday(state)` = highest recorded `matchday` + 1 (1 when none), `undefined` after 14. Rejected: `results.length / 4 + 1` (wrong on a partial or reordered log from a future loader); a stored counter (second source of truth, breaks whole-state `toEqual` patterns). | ADR-0014 (1); DISCUSS D1, tech notes |
| D2 | **Producer generalised, no new export**: a private `matchdayFor(state, clubId, matchday)` is the only side builder (managed `currentXI` at the tap, others `automaticXI(squad, DEFAULT_FORMATION)`); `playOpeningMatchday` stays as its matchday-1 one-liner (the `matchFor` fallback and the S-006/S-007 tests keep working unedited). `update` appends `matchdayFor(..., next)`. Rejected: replacing it with a public `playNextMatchday` (rewrites every S-007 call site); precomputing the season at the first tap (freezes Sam's XI, against D1/D5). No new RNG stream. | ADR-0014 (2); DISCUSS D1, D5, D8 |
| D3 | **Append and guard in `update`**: `PlayMatch` from a known club's home appends the 4 entries of the next matchday (earlier entries the identical objects; `results` a new array); after 14 it returns the very same state (`toBe`), so `fixturesOf(15)` is never reached. `NewGame` still drops `results`. | ADR-0014; DISCUSS D6 |
| D4 | **Match screen reads the latest**: `matchFor` restricts the record to entries whose `matchday` equals the latest recorded one (`nextMatchday(state) - 1`, or 14 when the season is over), then takes the managed club's entry of those; a plain `find` over the whole log returns the matchday-1 entry (the S-007 re-show) and must not survive. The matchday-1 derivation stays as its fallback. `MatchView.matchday` is N and `renderMatch` already prints `Matchday ${view.matchday}`, so `renderMatch` and `main.ts`'s `match` case do not change. Rejected: a matchday on the `match` screen (breaks the `toEqual({ kind: "match", clubId })` literals, no consumer yet); a matchday argument on `matchFor`. | ADR-0014 (3); DISCUSS D2 |
| D5 | **Season over is derived and passed as a flag**: `main.ts` computes `nextMatchday(state) === undefined`; `renderClubHome(root, { club, seasonOver }, dispatch)` swaps the "Play match" button for `<p class="season-over">Season over</p>` in the same slot (plain text: no heading, no button, no role). Rejected: a stored flag; a "seasonOver" screen (the later end-of-season story); a disabled button. | ADR-0014 (4); DISCUSS D6 |
| D6 | **Focus** (ADR-0008): unchanged. Renderers never move focus; every navigation (club home, match, table) is a screen change so the `<h1>` is focused; the flag changes only on a club-home re-render, itself a navigation. No focus ids. | ADR-0008 |
| D7 | **Supersession is a new ADR**, not an ADR-0012 rewrite, because it overturns a rule (re-show) that ADR-0012 and S-007 D4 stated as this-version-only. ADR-0012 changes only by its status line plus inline "(superseded by ADR-0014, S-008)" markers (the re-show statements, the `matchFor` selector rule `matchday === OPENING_MATCHDAY`, the `update` contract row and property, the case count); it keeps its record shape, `playMatchday`, fallback and `NewGame` rule. | ADR-0014; DISCUSS tech notes |
| D8 | **Names**: "Season over" is in no `names.ts` string (grep: none); the D9 unit check goes in DISTILL. "Play match" keeps its exact name. | DISCUSS D9 |
| D9 | **Closed universe of the club home**: `section.club-home` = swatch, h1, `div.club-actions` of 5 children in the order Squad, Tactics, Starting XI, [button "Play match" or `p.season-over`], Table. | ADR-0014; S-007 D17 |
| D10 | **Contract shapes**: `nextMatchday`, `update`, `matchFor` pure return-only; `renderClubHome` bounded-change; `main.ts` is bounded-change with an enumerated universe (reads `location.search` once; writes `root`'s children and focus only); the S-008 delta is the `clubHome` case's props, the `seasonOver` flag. See Reuse Analysis. | brief; reviewer M1 |

### Wave: DESIGN / [REF] Component decomposition
| Path | Change | Responsibility | Indicative lines |
|---|---|---|---|
| `src/app/state.ts` | EXTEND | `nextMatchday`; `matchdayFor` (generalises the side builder; `playOpeningMatchday` wraps it); `playMatchAction` appends and guards; `matchFor` reads the latest matchday; imports `MATCHDAYS` | 35 |
| `src/ui/screens/club-home.ts` | EXTEND | Props object `{ club, seasonOver }`; button or `p.season-over` | 14 |
| `src/main.ts` | EXTEND | `clubHome` case passes `seasonOver`; imports `nextMatchday` | 4 |
| `src/ui/styles.css` | EXTEND | `.season-over` | 8 |

**Code total** about 61 lines (DISCUSS 75). Tests (DISTILL), as the DISCUSS table: `tests/acceptance/S-008/season-progression.test.ts` 150, `season-for-a-club.test.ts` plus the D9 names check 75, `tests/e2e/S-008-season.spec.ts` 120; amendments below about 75 (DISCUSS 40, re-estimated from the list). **DELIVER total about 481** (code 61, tests 420) against 460; 828 with the 347-line protected file written in the plan run (outside the DELIVER diff); far under the 1200-line PR guard (the one hard cap). No cut needed.

**Amend list** (non-protected tests that pin the S-007 re-show; DELIVER replaces each assertion with its S-008 equivalent, never deletes or weakens it; DISTILL fixes the exact new text). Titles are quoted by their opening words:
| File | Test | Why it breaks | Replace with |
|---|---|---|---|
| `tests/acceptance/S-006/match-navigation.test.ts` | "when Sam taps Play match, Back and Play match again, then the same match screen is shown (the recorded matchday is kept, not replayed)" | Expects `again` `toEqual` `first` and `results` `toBe` | Second tap: 8 entries, the first 4 `toBe` identical, `matchFor` reads matchday 2 |
| `tests/acceptance/S-007/table-navigation.test.ts` | "Given the record exists, when Sam taps Play match again, Back, Table or anything on the way, then the very same array stays in the state" | The `update(walk(played, [back]), play)` state is no longer `toBe(record)` | Keep the `toBe` for the non-playing walks; the replay state: 8 entries, first 4 identical objects |
| same | "Given Sam taps Play match, Back and Play match again, then the same match screen is shown with the very same record (the re-show of this version)" | Re-show | As the S-006 row above |
| same | "Given any run of up to 40 taps from the title ... once recorded the very same array stays, the table keeps its row rules ..." | `expect(next.results).toBe(state.results)` after any non-NewGame action, and `row.played` is 0 or 1 | Earlier entries identical; length a multiple of 4 up to 56; `row.played` equals matchdays recorded |
| same | "Given Sam has played, when he taps any run of up to 40 formation, pick and navigation taps, then the table and his match never change (K3)" | `play` is in the pool: `results` `toBe`, `standingsOf` and `matchFor` change after the second tap | Keep `play` in the pool; assert the first 4 entries identical and the first matchday's rows derived from them unchanged |
| `tests/e2e/S-006-match.spec.ts` | helper `playAndRead` (hard-codes "Matchday 1"); "@example The goals of Sam's club name only the 11 on his Starting XI after a pick ..." (second tap, "playing again replays the same match"); "@walking_skeleton No console error and no sideways scroll across the whole journey: ... Play match, Back" (second `playAndRead`) | The second tap now reads "Matchday 2" | `playAndRead(page, matchday = 1)`; the pick test: the second match is "Matchday 2", Sam's scorers are on the changed XI, the opponent differs; the journey test: `playAndRead(page, 2)` |
| `tests/e2e/S-007-table.spec.ts` | helper `readMatch` (hard-codes "Matchday 1"); "@walking_skeleton What is played stays played: after 4-3-3, Kestrel Northcott for Calder Redfern and a visit to Squad the table reads exactly as before, and Play match shows the same score line and Goals"; "@walking_skeleton No console error ... Table, Back, Play match, Back, Table, 4-3-3, Table, Play match, Back" | Expect `SCORE_31` and `GOALS_31` again on the second tap | `readMatch(page, matchday = 1)`; second tap reads "Matchday 2" with a different opponent (matchday-1 entries and the table after matchday 1 unchanged); the header comments (lines 8-9, 6) restated |
Tests that stay unedited: the S-006 `matchFor` cases and the 40-action property (no `results` assertion), `OPENING_MATCHDAY` (still exported), every `playOpeningMatchday` call site, and the S-007 single-tap tests. The protected S-001..S-007 never play twice (DISCUSS D7).

### Wave: DESIGN / [REF] Driving ports
- **App**: `update` with `PlayMatch` (appends the next matchday; `toBe` no-op after 14) and `NewGame`; selectors `nextMatchday`, `matchFor` (latest), `standingsOf`. Domain unchanged: `playMatchday`, `fixturesOf`, `standings`.
- **Browser**: club home "Play match" until matchday 14, then the text "Season over"; the match screen h1 "Matchday N"; "Table"; "Back".
- Detail and properties: brief, "For Acceptance Designer", ports 29-31.

New and changed shapes, for the acceptance designer:
- `nextMatchday(state: GameState): number | undefined`. `GameState`, `Screen`, `Action`, `PlayedMatch`, `MatchView` unchanged.
- `renderClubHome(root, { club, seasonOver: boolean }, dispatch)` (not reachable from vitest; covered by the e2e).

### Wave: DESIGN / [REF] Driven ports and adapters
None: no storage, clock or network. The log lives in memory for the page's life. Environment assumptions are named and probed (ADR-0014 Earned Trust):
1. **Chromium vs Node over 14 matchdays**: the e2e reads the 14 seed-31 score lines; the Node test pins the same (reference season). Fault: an approximated maths function (grep test).
2. **Append-only and contiguous**: fast-check property of up to 80 actions (`numRuns` 100, fresh `FC_SEED`; earlier entries identical, length a multiple of 4, matchdays contiguous).
3. **The guard**: a 15th `PlayMatch` is a `toBe` no-op and never throws; boundaries 13 and 14 kill an off-by-one mutant (nightly Stryker on `state.ts`).
4. **Derived equals counted**: `nextMatchday` equals `results.length / 4 + 1` on every reachable state. A future persistence story must validate a loaded log's shape, order and contiguity, with its own `probe()`.
5. **"Season over" is plain text**: no "Play match" button, one exact "Season over" that is no heading or button, 4 buttons 44px or taller, no sideways scroll, `innerText` equals `textContent`.

No external integrations, so no contract tests. **Enforcement**: oxlint boundaries unchanged; `max-params` 3 (`renderClubHome` stays at 3 through the props object); `complexity` 15 (`update` stays at 12 cases, complexity 13); Stryker globs already cover `state.ts`; the `.focus(` grep covers the renderer.

### Wave: DESIGN / [REF] Technology choices
- No new technology or dependency (ADR-0001, 0002, 0003 apply; all OSS). A derived counter, a `<p>` and plain CSS; no newer CSS features. No library is involved, so no Context7 lookup applies.

### Wave: DESIGN / [REF] Reuse Analysis
| Existing Component | File | Overlap | Decision | Justification / contract shape |
|---|---|---|---|---|
| `playOpeningMatchday`, `sideFor` | `src/app/state.ts` | Builds the 8 sides and plays a matchday | EXTEND (private `matchdayFor` takes the matchday; `playOpeningMatchday` becomes its matchday-1 wrapper) | Pure return-only; universe = the returned array; equals `playMatchday` with Sam's `currentXI` and automatic others; fallback-equivalence property kept |
| `matchFor`, `MatchView` | `src/app/state.ts` | Which match the screen shows | EXTEND (restrict the record to `matchday === latest`, then the club's entry; never the first entry of the log) | Pure return-only; same signature and view; universe = the returned view; S-006 cases unedited; unit boundary cases at matchday 2 and 14 |
| `update`, `playMatchAction` | `src/app/state.ts` | Navigation and recording | EXTEND (append, guard) | Pure return-only; universe `{ league, screen, formation, xi?, results? }`; only `screen` and `results` change; `toBe` no-ops; deep-freeze |
| `standingsOf`, `standings` | `state.ts`, `standings.ts` | Table after N matches | REUSE unchanged | Pure return-only; universe = the returned rows; already a function of the whole log, rows read P N (ADR-0013 properties) |
| `playMatchday`, `fixturesOf`, `MATCHDAYS`, streams | `src/domain/` | The 4 fixtures of matchday N | REUSE unchanged | Pure return-only over frozen data; universe = the returned array / table; `MATCHDAYS` bounds `nextMatchday`; goldens untouched |
| `results` log | `GameState` | Source of next matchday and season over | REUSE unchanged | Pure return-only (the state field of `update`'s universe; append-only invariant asserted by `update`'s tests: earlier entries `toBe` identical, contiguous, no other action touches it) |
| (none) | `src/app/state.ts` | Next matchday / season over | CREATE NEW `nextMatchday` | No selector exists for the season position; `standingsOf`/`matchFor` answer other questions. Pure return-only; tests above |
| `renderClubHome` | `src/ui/screens/club-home.ts` | Club actions stack | EXTEND (props object, `p.season-over`) | Bounded-change; closed universe D9; e2e iterates buttons for 44px |
| `renderMatch` | `src/ui/screens/match.ts` | h1 "Matchday N" | REUSE unchanged | Bounded-change; closed five-child universe (h1, score line, "Goals" label, list, Back); already prints the view's matchday; `.focus(` grep |
| `render`, `matchScreenView` | `src/main.ts` | Maps state to props | EXTEND (`clubHome` case only) | Bounded-change with an enumerated universe (reads `location.search` once; writes `root`'s children and focus only); S-008 delta = the `clubHome` props, the flag; e2e |
| `.club-actions`, tokens | `src/ui/styles.css` | Stack and colours | EXTEND (`.season-over`) | Bounded-change (presentation; universe = the one `.season-over` rule); no `text-transform`, no flex or grid |
| S-006/S-007 tests | `tests/` | Pin the re-show | REUSE, except the amend list | Never-played and single-tap states behave as before |

### Wave: DESIGN / [REF] Changed Assumptions
- **ADR-0012, quoted**: "`PlayMatch` ... sets `results` to `state.results ?? playOpeningMatchday(...)`. So the first tap records, and any later tap leaves `results` as it is (the re-show, D2)". Superseded by ADR-0014: every tap appends the next matchday.
- **S-007 design D4, quoted**: "`PlayMatch` records on the first tap: `results = state.results ?? playOpeningMatchday(...)` ...; later taps keep the same array (re-show, this version only)". Superseded; the invariant "once set, `results` is the same array until `NewGame`" now reads "earlier entries stay identical objects".
- **ADR-0012**: "`OPENING_MATCHDAY = 1` stays. The season story replaces its uses by a matchday held in state". Refined: the matchday is derived from the log, not held; the constant stays only as the fallback matchday. DISCUSS "`OPENING_MATCHDAY` gives way to that derived matchday" is satisfied for the production path (`update` no longer reads it).
- **S-007 DISCUSS D2/D14**: the re-show was never pinned in `tests/protected/S-007`, so no protected scenario is amended.
- **DISCUSS line budget**: DELIVER about 481 (DISCUSS 460): code 61 (75), tests 420 (385) because the amend list is larger than the 40 lines assumed. Under the 1200-line PR guard (the one hard cap).
- The brief struck-through marks (S-007 recording bullet, port 26, S-007 observable bullet) point at ADR-0014.
- No change to the roadmap outcome text.

### Wave: DESIGN / [REF] Open questions
- **None blocking.**
- **Re-opening a played match** (a later results-list story) will need the matchday on the `match` screen (rejected option 3B today) and `sameScreen` to compare it.
- **Persistence** (a later story) must validate a loaded log (shape, order, contiguity) and add a save version; `nextMatchday` and "season over" depend on contiguity.
- **Other-club policy** (automatic 4-4-2, ADR-0012 L9) is unchanged and still owned by `matchdayFor`.
- **Outcome trace**: next match in 1 tap, h1 "Matchday N" focused, opponents from the schedule, picks count forward, P N and row rules, same seed same season: D1-D4, D6. "Season over" in place of the button, no-op after 14: D3, D5. Durable clause (D10 of DISCUSS): D1-D4. Reload loses the season: unchanged (no persistence).
- **Handoff for DISTILL**:
  - Properties and checks: brief ports 29-31 and the ADR-0014 Consequences. Test files and lines are under Component decomposition, with the amend list.
  - **Goldens, RED-first** (DELIVER never re-pins from its own output): `discuss/reference-season.md` for seeds 31 (Netherwold Borough: 14 score lines, the P 2 table, the final table with the goals-scored tie) and 20260 (Oakhampton Rise Borough). Sam's picks (4-3-3, "Kestrel Northcott 6" for "MF Calder Redfern 15") change his fixture, so DISTILL pins rules for matchday 2 after the pick, not a score.
  - Unit: `nextMatchday` 1, k+1, `undefined` at 14 (boundaries 13, 14); the `toBe` guard after 14; `NewGame` clears; prefix identity; contiguity and `results.length / 4 + 1`; the D9 names check for "Season over".
  - **`matchFor` boundary cases (H1)**: after 2 taps the view is matchday 2, not the first entry of the log, with the schedule's matchday-2 opponent; after 14 it is matchday 14; for all 8 managed clubs. A plain `find` over the whole log must fail these.
  - **K2 measurement (M3)**: the schedule layer is one exhaustive seed-independent check over 8 clubs x 14 matchdays (every rival once over 1..7 and over 8..14; named first once), with a seeds 1..1000 loop as a cheap guard that the names-to-index mapping does not matter; only the season and table layer is sampled, by fast-check (`numRuns` 100, fresh `FC_SEED`, whole seasons through `update`) for row rules, totals, `played` = N and Sam's row = the sum of his score lines. The 8000 full seasons are not simulated.
  - e2e: 14 matchdays at 390px at `?seed=31` (h1 and score line each, focus on each heading), "Season over" with no "Play match" and the other 4 buttons 44px or taller, final table at P 14, no sideways scroll or console errors. Locators use `exact: true`.
  - `tests/protected/S-008/` pins only the durable clause (DISCUSS D10) and the per-match rules, not the "Season over" line; one seed per scenario where runtime matters (28 taps per season).
  - The pending-then-activate pattern of S-006/S-007 applies to the amend list, in the same commit as the production change.

### Wave: DESIGN / [REF] Peer review
`nw-solution-architect-reviewer`, cycle 1: **rejected_pending_revisions**. Revision 1 applied as below.

| Finding | How it landed |
|---|---|
| H1 `matchFor` selection rule | Stated explicitly: restrict the record to `matchday === latest` (`nextMatchday - 1`, or 14 when over), then take the club's entry; a plain `find` returns the matchday-1 entry (the re-show). In ADR-0014 Decision (3A), the ADR contract table, D4, the Reuse row, brief port 30 and the brief subsection; boundary cases at matchday 2 and 14 added to the ADR contract table, brief port 30 and the DISTILL handoff |
| H2 contract shape per Reuse row | Every row now names a shape: `renderMatch` bounded-change with a closed five-child universe; `standingsOf`/`standings` pure return-only; `playMatchday`/`fixturesOf`/`MATCHDAYS` pure return-only over frozen data; `results` append-only data asserted by `update`; the CSS row is marked presentation only |
| M1 `main.ts` classification | The S-008 delta is bounded-change (universe = the `clubHome` props, the flag); `main.ts` as a whole stays the ADR-0003 imperative shell, outside the plan-returning rule. ADR-0014 contract table, brief effect-isolation (a new delta row; the S-007 shell row says so), D10 and the Reuse row |
| M2 brief S-007 statements | Struck through with pointers to ADR-0014: the `update` recording row (later taps keep the same array), the `renderClubHome` S-007 row (exactly 5 `button.primary`), port 26's "matchday-1 entry" bullet; the `matchFor` row now reads "latest recorded matchday" |
| M3 K2 measurement | Named in ADR-0014 Earned Trust 2a, brief port 29 and the DISTILL handoff (the append-only probe in Driven ports now states `numRuns` 100 and a fresh `FC_SEED`): a committed fixed-seed test over seeds 1..1000 x 8 clubs for the schedule invariants, plus fast-check sampling (`numRuns` 100, fresh `FC_SEED`) for the season and table invariants |
| L1 ADR-0012 inline markers | "(superseded by ADR-0014, S-008)" added at the D2 re-show statement, the `PlayMatch` re-show sentence and the forward-compatibility re-show sentence |
| L2 empty log | ADR-0014 option 1A: "the max over an empty log is taken as 0, so next = 1" |
| L3 case count | "12 cases, complexity 13, limit 15" in ADR-0014, the feature-delta and the brief (including the S-007 line that said 13 of 15, now corrected to the code's 12 cases) |
| L4 one ceiling | The "1100 target" is dropped from the DESIGN section: the 1200-line PR guard is the one hard cap |

Cycle 2 (final): **approved_with_notes** (H1, H2, M3, L2, L3, L4 resolved; M1, M2, L1 partially). Its 8 lows landed as below.

| Finding | How it landed |
|---|---|
| F1 brief leftovers | Port 28 Club home row: "exactly 5 `button.primary`" struck, with "S-008, ADR-0014: 4 `button.primary` plus the Play match slot"; port 26 Property "once set, `results` is the same array until `NewGame`" struck with a pointer to ADR-0014 |
| F2 `main.ts` label | The whole-file effect-isolation row is now bounded-change with its enumerated universe (reads `location.search` once; writes `root`'s children and focus only); the unbounded-preservation label and the carve-out are dropped in the brief, ADR-0014's contract table, D10 and the Reuse row. The S-008 delta (the `clubHome` props) is stated inside that row |
| F3 ADR-0012 markers | "(superseded by ADR-0014, S-008)" at the `matchFor` selector rule (matchday === `OPENING_MATCHDAY`), the `OPENING_MATCHDAY` line, the `update` contract row and the Earned Trust 2 property; "13 cases" corrected to "12 cases, complexity 13 (corrected in S-008)". The `matchFor` selector rule is added to ADR-0014's supersession list. D7 and the Setup bullet now say status line plus inline markers |
| F4 Reuse shapes | `results` log: pure return-only (the state field of `update`'s universe; append-only invariant asserted by `update`'s tests); `.season-over` CSS: bounded-change (presentation; universe = the one rule) |
| F5 `matchdayFor` row | New brief effect-isolation row for the private `matchdayFor` (pure return-only; universe = the 8 sides and the `playMatchday` result) and an S-008 wrapper note on the `playOpeningMatchday` row |
| F6 S-006 brief statements | Struck or annotated, with the strike convention: S-006 App matchday-1 selector bullet, `renderMatch` h1 "Matchday 1" (now "Matchday N"), port 21 `matchFor` (ADR-0012 for the record, ADR-0014 for the latest matchday), port 23 Match row |
| F7 K2 schedule layer | ADR-0014 Earned Trust 2a, brief port 29 and the DISTILL handoff: one exhaustive seed-independent check over 8 clubs x 14 matchdays; the seeds 1..1000 loop is only a cheap guard that the names-to-index mapping does not matter; only the season and table layer is sampled (fast-check `numRuns` 100) |
| F8 DEVOPS cut order | The Branching strategy line now reads "DESIGN estimates about 481 lines, so no cut order is needed; if DELIVER nears the 1200-line guard, ship slice 01 first" (one line in the DEVOPS section) |

Final: approved_with_notes; no further cycle.

## Wave: DEVOPS

Lean, unattended. All nine decisions pre-answered; no platform change. Owner-locked paths (`.github/`, `factory/`, `scripts/`, `.nwave/`, `CLAUDE.md`, brief/scope, `tests/protected/`, `stryker.config.mjs`) are read-only. Machine-readable: `docs/feature/S-008/environments.yaml`. Inherits S-007 (and S-001..S-006); only deltas are recorded.

Checklist: ✓ existing infra reused | ✓ K1-K3 mapped to instruments | ✓ rollback defined | ✓ mutation strategy (nightly-delta; `state.ts` inside the mutate globs, `club-home.ts` outside, no config change) | ⊘ new IaC/containers | ⊘ server-side observability | ⊘ continuous learning | ⊘ CLAUDE.md edit

### Wave: DEVOPS / [REF] Environment matrix
| Env | URL | Runner | Purpose |
|---|---|---|---|
| local-dev | `http://localhost:5173/gaffer/` (`pnpm dev`) | dev machine | Iteration |
| local-preview | `http://localhost:4173/gaffer/` (`ci:serve`) | dev, CI, protected runner | Production build under test; unit, property, e2e, `tests/protected/S-001..S-008/` |
| production | `https://<owner>.github.io/gaffer/` | GitHub Pages | Live site; post-deploy smoke via `BASE_URL` |

Unchanged: no staging (static, recreate); Chromium, Pixel 7 profile, 390px. Deltas:
- `GameState.results` now grows to 14 matchdays / 56 entries (ADR-0014) in session memory only. Nothing is persisted: a reload shows the title screen and the season is lost. No storage, save version or migration.
- Cross-engine determinism probe widens from matchday 1 to 14 seed-31 matchdays (14 score lines, ADR-0014 Earned Trust 1) in Chromium on local-preview and, through `smoke`, on the live site. WebKit and iOS Safari are not probed.
- e2e runtime: the season test is 28 taps ("Play match", "Back" x 14) plus the reads of 14 h1/score lines and the table; each tap runs 8 squads and 4 quick-sims, so a few seconds locally (estimate, not measured). Live-site latency adds to it: see Open questions 1 for timeouts.
- "Season over" is plain text (ADR-0014 Earned Trust 5): probed in Chromium only (no "Play match" button, 4 buttons 44px or taller, `innerText` equals `textContent`, no sideways scroll).
- Every navigation stays a screen change, so focus goes to the new `<h1>` (ADR-0008).

### Wave: DEVOPS / [REF] CI/CD pipeline outline (existing, unchanged)
- `ci` (PR, push to main, dispatch; 30 min): PR guards (locked paths, append-only protected, diff cap 1200, `Math.random`/`Date` in `src/domain/`), roadmap lint, `ci:lint`, `ci:typecheck`, `ci:test` (fresh `FC_SEED`), `ci:build`, `ci:e2e`, protected no-regression check vs main (a new `tests/protected/S-008/*.spec.ts` must fail on main).
- `deploy` (push to main): `ci:build`, deploy-pages, then `smoke` (10 min) runs `ci:e2e` against the live URL, including the new S-008 spec.
- `nightly` (03:00, 45 min): `ci:mutation`; failure opens a `mutation-alarm` issue. `ai-review`, `factory-tick`, `watchdog`, `weekly-demo`: factory-owned, untouched.
- No pipeline change: S-008 adds unit, property and e2e specs run by existing scripts and no dependency. DELIVER diff about 481 lines (828 with protected), under the 1200 guard; `docs/` is outside the count.
- Local gate: `pnpm run check` mirrors the commit stage; no git hooks (locked). Security: no secrets, runtime deps or network; text enters the DOM via `el()`/`textContent` (ADR-0002). SAST/SCA/SBOM not added (inherited owner-only item).

### Wave: DEVOPS / [REF] Monitoring contracts (DISCUSS KPI to instrument)
E2E instrument: `tests/e2e/S-008-season.spec.ts` (Pixel 7, 390px) via `ci:e2e` on PR and main and `smoke` on the live URL. Unit/property rows run in `ci:test` with a fresh `FC_SEED`. `tests/protected/S-008/` runs on local-preview in `ci` and must pass on main.

| KPI (DISCUSS) | Instrument | Pass condition |
|---|---|---|
| K1: next match in 1 tap; season in 28 taps; "Season over" on the first club home after matchday 14 | e2e: page-side capture-phase click counter (as S-003..S-007) across "Play match", "Back" x 14 (28 clicks); h1 "Matchday N" focused each time; after the 14th "Back" the text "Season over" is visible, no "Play match" button. Protected: next-matchday and N-th h1 by rule | 1 click per match, 28 per season; text present |
| K2: schedule rules (every rival twice, named first once, second once) for 100% of seeds 1..1000 x 8 clubs; season and table rules (every row P N after match N; row rules; Sam's row = sum of his score lines) in 100% of sampled seasons | committed fixed-seed test over seeds 1..1000 x 8 clubs (schedule, seed-independent); fast-check sampling, `numRuns` 100 per CI run with a fresh `FC_SEED` (season and table) in `season-for-a-club.test.ts` and `season-progression.test.ts`; seed-31 and seed-20260 reference-season goldens (Node); e2e seed-31 14 score lines and P 2 / P 14 tables cell for cell (cross-engine). Protected: every rival twice, P N after N | 100%; 0 mismatches; goldens exact |
| K3: 0 changes to any recorded matchday over runs of up to 40 actions; matchday k+1 uses Sam's XI at the tap | property on `update` (prefix entries `toBe` identical, length a multiple of 4 up to 56, contiguous) plus `standingsOf`/`matchFor`; e2e: 4-3-3 and "Kestrel Northcott 6" pick after matchday 1 leave the P 1 table unchanged, matchday 2 goals come from the new XI. Protected: picks count forward (candidate) | 0 changes |
| Guard after 14 (D6) | unit: 15th `PlayMatch` is `toBe` the same state, never throws; boundary cases at 13 and 14 | holds |
| 44px, no sideways scroll at 390px, 0 console errors | e2e across the 14-matchday journey and the club home with "Season over" | holds |
| Names, determinism | unit: "Season over" in no `names.ts` string (D9); no `Math.random`/`Date` (PR guard); same seed same season | holds |
| S-001..S-007 unchanged | existing e2e and acceptance (only the amend list: replace, never weaken) and `tests/protected/S-001..S-007/` | green |
| Domain test strength | Stryker on `src/domain/**` and `src/app/state.ts` (`nextMatchday`, `matchdayFor`, `playMatchAction`, `matchFor`) | nightly, at or above break 70 |

No analytics (POC). The e2e tap counter and the property tests are the KPIs' sole measurements.

### Wave: DEVOPS / [REF] Deployment strategy and rollback
- Strategy: recreate. Merge to main triggers `deploy`, replacing the whole static artifact; idempotent.
- Rollback (designed first): revert the S-008 squash commit on main; the merge triggers `deploy` and `smoke` validates the restored site. Alternative: `workflow_dispatch` of `deploy.yml` on the pre-S-008 commit (the S-007 deploy). Fallback: fix-forward on a `claude/*` branch. The append-only protected guards may block a plain revert of a squash that added `tests/protected/S-008/`; the dispatch route is then the owner action. Time to restore: one deploy cycle (about 5 minutes).
- Failure detection: a red `smoke` marks the deploy run red; a cross-engine fault shows as a red seed-31 14-matchday probe while `ci:test` stays green.
- Data: nothing persisted, no user data at risk. Rolling back returns "Play match" to re-showing matchday 1 (S-007 behaviour) and removes "Season over".
- Result stability: matchday N uses streams 200 + 4(N-1)..+3 (ADR-0011), no new stream; changing them changes every seed's season and needs an ADR amendment. Blast radius: one static page.

### Wave: DEVOPS / [REF] Mutation testing strategy
nightly-delta, inherited from `CLAUDE.md`; `/nw-deliver` Phase 5 skipped. `stryker.config.mjs` (read) mutates `src/domain/**/*.ts` except `names.ts`, plus `src/app/state.ts`; thresholds high 85, low 70, break 70.
- `src/app/state.ts` (`nextMatchday`, `matchdayFor`, `playMatchAction` append and guard, `matchFor` latest): INSIDE the globs. Killed by the `nextMatchday` 1 / k+1 / `undefined` cases, boundaries 13 and 14 (off-by-one on the guard), `toBe` no-op after 14, prefix identity, the 4-entry append equal to `playMatchday` with Sam's `currentXI`, `NewGame` clearing and the 80-action property.
- `src/ui/screens/club-home.ts` (`seasonOver` branch) and `src/main.ts` (`seasonOver: nextMatchday(state) === undefined`): OUTSIDE the globs (`src/ui/` and `main.ts` never were). Gap: a mutant swapping the button for the line is caught only by the e2e, not by nightly mutation. Open question 2; no config change.
- `src/domain/**`: unchanged by S-008, already covered.
- Runtime watch: the K2 fast-check property (100 sampled seasons of up to 14 matchdays) and the fixed-seed schedule sweep re-run per `state.ts` mutant; see Open questions 3.

### Wave: DEVOPS / [REF] Observability stack
Browser console plus Playwright smoke on the deployed URL only. No RUM, error tracking, logs or tracing. SLO: smoke green per deploy (including the 14-matchday seed-31 probe). Alerting: a red `deploy` run; a red nightly opens `mutation-alarm`. No dashboards.

### Wave: DEVOPS / [REF] Branching strategy
Trunk-based. Short-lived `claude/S-008-*` branches, PR to main, squash merge, deploy on merge, no release branches. CI green and protected scenarios not regressing. DELIVER about 481 lines stays under the 1200 guard; DESIGN estimates about 481 lines, so no cut order is needed; if DELIVER nears the 1200-line guard, ship slice 01 first.

### Wave: DEVOPS / [REF] Coexistence matrix
| Component | S-008 impact | Action |
|---|---|---|
| `ci.yml`, `deploy.yml`, `nightly.yml`, `ci:*` scripts, `playwright.config.ts` | none; Pixel 7, 390px, `BASE_URL` fit | reuse |
| `stryker.config.mjs`, `scripts/guards/pr-guards.mjs` | `state.ts` already mutated; determinism grep and 1200 cap fit | none |
| `tests/protected/S-001..S-007/` | none plays twice; S-006/S-007 pin matchday 1 of a new game; "Play match" keeps its name | must stay green |
| `tests/protected/S-008/` | locked scenarios (plan run); 28 taps per season | must pass on main |
| Amend list (S-006 `match-navigation`, S-007 `table-navigation`, e2e `S-006-match`, `S-007-table`) | re-show assertions replaced by S-008 equivalents | amend in the same commit as the production change |
| `tests/e2e/S-001..S-007*.spec.ts`, `shell.spec.ts` | focus on h1 holds; club-home button lists unchanged until "Season over" | reuse, regression-watch |
| `src/app/state.ts`, `club-home.ts`, `main.ts`, `styles.css` | extended | S-001..S-007 tests guard |
| `docs/product/ui/design-system.md` | "Season over" entry already added in DESIGN | none |
| Pages artifact, base path `/gaffer/` | negligible growth | none |

### Wave: DEVOPS / [REF] Pre-requisites
- S-007 delivered and deployed; Pages source "GitHub Actions" enabled (✓). Node 22+, pnpm 10.12.4, Playwright chromium via `.github/actions/setup`.
- ADR-0001..0014 accepted (✓; ADR-0014 landed in DESIGN). `tests/protected/S-008/` committed by the plan run (append-only after). `BASE_URL` derived from owner and repo name (no secret).

### Wave: DEVOPS / [REF] Open questions
Owner-only items inherited from S-001..S-007 (smoke `sleep 20`, no security scanning, no commit-SHA check in smoke, deploy not gated on `ci`, squash revert blocked by append-only guards, no uptime probe, WebKit not probed; see `docs/feature/S-007/feature-delta.md`) are unchanged and none block S-008. New:
1. Timeouts for a 28-tap season. Agent `playwright.config.ts`: `timeout: 30_000` per test, `retries: 1` in CI. Locked protected runner (`scripts/factory/protected.playwright.config.ts`): `timeout: 20_000`, `expect` and `actionTimeout` 2 s, `retries: 0`, 4 workers. `test.slow()` triples only the test timeout (30 s to 90 s, 20 s to 60 s); per-action 2 s is unchanged and sufficient for one tap. Existing protected specs already use `test.setTimeout(60_000/90_000)` for long journeys. Recommendation (DISTILL/DELIVER, no config change): `test.slow()` is enough for the full-season e2e and a protected full-season scenario; use `test.setTimeout(90_000)` if one scenario plays both seeds, or keep one seed per scenario (DISCUSS note). If the first CI run nears the limit, trim reads per matchday, not the 14 matchdays.
2. Mutation gap: the `seasonOver` wiring in `club-home.ts` and `main.ts` is outside the Stryker globs; covered only by the e2e ("Season over" present, button absent) and the unit contract on `nextMatchday`. Owner may widen `mutate` to `src/ui/screens/*.ts` later; not needed for S-008.
3. Nightly runtime: the fast-check season property (100 sampled seasons of up to 14 matchdays) is the costliest new test; the schedule sweep is seed-independent and cheap. DELIVER keeps `numRuns` bounded (fresh `FC_SEED`) so each `state.ts` mutant stays cheap. Watch the first nightly after the merge against the 45-minute timeout; if it nears it, trim test cost, not bounds, or the owner raises the timeout.
4. Smoke on the live URL runs the 14-matchday spec and relies on `?seed=` on Pages (same as S-001..S-007).

### Wave: DEVOPS / [REF] Peer review
Not triggered (no novel target, no new CI framework, no observability rewrite, no security change); consolidated review at the end of DISTILL.

## Plan run: protected scenarios

`tests/protected/S-008/season.spec.ts` holds 4 black-box scenarios (Pixel 7, 390px; roles, accessible names and visible text, plus the S-006/S-007 "exactly one score line" scan). They pin the durable clause (DISCUSS D10) and the per-match rules, for any seed; no generated result is pinned, so the reference season stays a unit and e2e golden for DISTILL. Every "Play match" checks: "Play match" at 44px or taller; the only, focused h1 "Matchday N" for the N-th match; exactly one score line matching `^(.+) (\d)–(\d) (.+)$` naming the player's club and another club of "Clubs"; the "Goals" list in the S-006 format, one item per goal, minutes 1 to 90 never decreasing, per-club counts equal to the score line; no sideways scroll. Every table read checks the S-007 structure (first 8 headers, 8 rows, one row header each, Pos 1 to 8, formats, row rules, Pts and GD order) and, after the N-th match, every row at P N, total W = total L, total D even, GDs summing to 0, and the player's row equal to the sum of its N score lines. "Back" is 44px or taller and focuses the club home's h1.

1. **Matchday 2** (`?seed=31`, 1st club; US-1 outline and scenario 2 at N = 2). The second "Play match" reads "Matchday 2" against a different club than matchday 1; the club's goals come from the outfield players of its Starting XI; the table after 2 matches; the five club-home buttons are still there before matchday 14.
2. **Picks count forward** (`?seed=7`, 3rd club; US-1 scenario 3). After matchday 1: 4-3-3 and a bench forward into the last FW slot leave the table identical; matchday 2's club goals come from the new XI's outfield players; the table after 2 matches agrees; playing leaves the picked XI unchanged.
3. **A whole season** (`?seed=31`, 4th club; US-2 scenarios 1 and 2; `test.setTimeout(90_000)`). "Matchday 1" to "Matchday 14" in order; over 1 to 7 and over 8 to 14 each other club exactly once; named first against each other club exactly once and second exactly once; the final table at P 14 agrees with the 14 score lines.
4. **Determinism** (8th club; US-1 scenario 4). `?seed=abc` twice and no seed give the same 3 matches (score lines and "Goals" lists) and the same table after each.

Not pinned, by design: the "Season over" line and the missing "Play match" after matchday 14 (D6, this version only); the reference-season goldens (unit and e2e); the opponent's scorers for N > 1 (S-006 protects them for matchday 1; unit tests for later matchdays); the `NewGame` reset (unreachable in the UI).

All 4 fail on the current app (the second "Play match" re-shows "Matchday 1"). The plan run checked that they can be met: against a throwaway prototype of ADR-0014 (not committed; `PlayMatch` appends the next matchday, `matchFor` reads the latest matchday), all 35 protected scenarios of S-001 to S-008 passed under the locked runner in 20.9 s, the S-008 ones in 0.7 to 2.6 s each.


## Wave: DISTILL

Unattended. Language: TypeScript; runners: vitest + fast-check (`FC_SEED` honoured through `tests/setup/fast-check-seed.ts`) and Playwright (Pixel 7, 390px); package manager pnpm. No Gherkin runner exists, so scenarios are `describe/it` blocks whose titles read Given/When/Then in domain language, with `@tags` and `@contract-shape:<pure-function|bounded-change|unbounded-preservation>` in every title and a `CONTRACT_SHAPE` + outcome-anchor header, as in S-003..S-007 (`nextMatchday`, `matchFor`, `standingsOf`, the schedule and the pinned domain inputs are `pure-function`; `update` recording, the guard and the e2e specs are `bounded-change`; `main.ts` stays covered by the unchanged S-001..S-007 e2e suites plus the S-008 season journeys, with no separate tag). Wave-decision reconciliation: DISCUSS, DESIGN and DEVOPS read, 0 contradictions (the DESIGN re-estimate 481 against DISCUSS 460 is a larger amend list, not a decision; the Elevator Pitch values were recomputed from the domain and agree). The test sources were not derived from `tests/protected/` (not opened). Open for the orchestrator: `distill/upstream-issues.md` U-1 (11 exact lines of existing tests that pin the S-007 re-show and that ADR-0014 supersedes, 4 vitest and 4 e2e of them red in DELIVER, one latent), already listed by DESIGN's amend list and DISCUSS D7.

### Wave: DISTILL / [REF] Hand-off model: green tree, new-behaviour specs held out until DELIVER (Mandate 7 adapted)
CI forbids committing failing, skipped or `.todo` tests, and test counts may only go up. As in S-004 to S-007:
- **Committed and running now (green regression guards, 5 test files and 1 data module, 59 cases):**
  - `tests/acceptance/S-008/existing-navigation-unchanged.test.ts` (8): the FIRST "Play match" of a new game is still matchday 1 (Netherwold Borough 1–2 Marlbrook Athletic at seed 31, the schedule's matchday-1 opponent for any seed, club and formation, P 1 on every row, the golden matchday-1 table); Squad, Tactics, Starting XI, Table and Back unchanged; wrong-screen Play match, Table and Back are no-ops; any 40-tap run keeps the row rules. It never names `nextMatchday` or plays twice, so it compiles and passes before and after DELIVER.
  - `tests/acceptance/S-008/season-schedule.test.ts` (33): K2 schedule layer, exhaustive and seed-independent over 8 clubs x 14 matchdays through `fixtureOf` (every rival once in 1..7 and once in 8..14; named first once and second once; matchday m and m + 7 mirrored; never itself, and the opponent sees the same meeting), plus the cheap guard over seeds 1..1000 x 8 clubs by club name. The domain is unchanged by S-008, so it is green now.
  - `tests/acceptance/S-008/season-inputs-pinned.test.ts` (9): pins the inputs of every golden: the reference season at seeds 31 and 20260 (14 matchdays x 4 score lines and the final table, worked out from `generateLeague`, `playMatchday` and `standings` with every side an automatic 4-4-2), the P 2 table of US-1 example 1, Netherwold Borough sixth on Pts 3 after matchday 3, Netherwold Borough's 14 score lines and Oakhampton Rise Borough's matchdays 1, 2, 14. A generator, schedule, match-model or standings change turns THIS file red, not the season specs.
  - `tests/acceptance/S-008/names-avoid-season-words.test.ts` (8): DISCUSS D9 / DESIGN D8. No entry of `TOWNS`, `CLUB_SUFFIXES`, `COLOUR_PALETTE`, `FIRST_NAMES`, `SURNAMES` (nor any joined "First Last" or "Town Suffix" text) contains "Season over" or "season" (case-insensitive), and "Season over" and the fourteen locator words of S-001..S-007 contain each other in neither direction.
  - `tests/e2e/S-008-club-home-regression.spec.ts` (1): five club-home buttons all 44px or taller, nothing says "Season over", the first "Play match" is "Matchday 1" (Netherwold Borough 1–2 Marlbrook Athletic, three goals) with the h1 focused, "Back" returns to the focused club name with "Play match" in place, "Table" reads P 1 on every row, no sideways scroll, no console error. It plays once.
  - `tests/acceptance/S-008/season-reference.ts` (data, not a test): the plan run's reference season, plain data (see U-2). The held-out e2e imports it.
  - Net: `ci:test` 790 to 848 tests (+58, 41 files), `ci:e2e` 114 to 115 (+1). `ci:lint`, `ci:typecheck`, `ci:test`, `ci:e2e` green on the committed tree.
- **Held out, complete and verified:** four executable specs stored as `docs/feature/S-008/distill/pending/{acceptance,e2e}/*.pending` (outside every glob: `vitest include`, `tsc include`, `oxlint .`, Playwright `testDir`). Nothing skipped, weakened or marked todo; they are simply not in the tree yet. 49 vitest cases (`season-progression` 27, `season-end` 9, `season-for-a-club` 13) and 9 e2e cases, 1345 lines.
- **Verification done in DISTILL** (`distill/verification-note.md`): a throwaway reference implementation in a scratch git worktree (since removed), written from ADR-0014 only, made all 107 S-008 vitest cases pass on first contact (every golden matched) and all 10 S-008 e2e cases pass after three spec fixes recorded in the note, with 21 seeded app faults and 9 UI faults caught (two survivors found and closed by strengthening a property and an e2e check). With the existing assertions of U-1 amended there: `ci:test` 897 of 897, `ci:e2e` 124 of 124, `ci:typecheck` and `ci:lint` clean. In the real repo the same files are lint-clean and fail only for the missing `nextMatchday` symbol and the unchanged behaviour (RED for missing functionality, not BROKEN).
- **No scaffold stubs in `src/`:** a throwing stub would turn the committed run red. The scaffold equivalent is the `.pending` files plus the exact-symbol list below.
- **DELIVER mechanics:** `git mv` each file to its destination, dropping `.pending`, in the same commit as the code that makes it green. Never edit an assertion to fit the implementation; if one is wrong, record it in `distill/upstream-issues.md`. The reference season is an expected value fixed by ADR-0010/0011 in the plan run: a mismatch means the code is fixed, never the golden.

### Wave: DISTILL / [REF] Scenario list with tags
Tier A only (production code: real `generateLeague`, `generateSquad`, `automaticXI`, `fixturesOf`, `playMatchday`, `update`, `matchFor`, `nextMatchday`, `standingsOf`, the built app). Tier B skipped: the journey is "Play match, Back" repeated, its input space (seed, club, formation, eleven, run of taps) is already explored at layer 1-2 by fast-check over seeds, all 8 clubs, all 5 formations, random valid elevens and runs of 40 to 80 actions through the production `update`; a state machine would only restate those properties.

Committed now: R1-R8 `existing-navigation-unchanged` (`@regression @walking_skeleton|@property|@boundary|@error`, 3 PBT), Q1-Q5 `season-schedule` (`@walking_skeleton @boundary @error`, 33 cases), I1-I7 `season-inputs-pinned` (`@regression @boundary @error`, 9 cases), W1-W4 `names-avoid-season-words` (`@regression @error @boundary`, 8 cases), C1 `S-008-club-home-regression.spec.ts` (`@regression`).

Held out (`distill/pending/`):

| # | Scenario (title in the file) | File | Tags | Kind |
|---|---|---|---|---|
| P1 | Second Play match: first four entries the very same objects, next four matchday 2, screen reads Rushmoor Heath Albion 2–1 Netherwold Borough | `season-progression.test.ts` | `@walking_skeleton @driving_port` | golden |
| P2 | After two matches every row P 2: US-1 example 1, Netherwold Borough eighth on Pts 0 GD -2 | same | `@walking_skeleton @driving_port` | golden |
| P3 | Third match Netherwold Borough 2–1 Oakhampton Rise Borough, sixth on Pts 3 | same | `@driving_port` | golden |
| P4 | `?seed=abc`: matchday 1 and 2 score lines, row P 2 W 1 D 1 L 0 GD +1 Pts 4 | same | `@example @boundary` | golden |
| P5 | Any seed, club, formation, k taps: each tap appends exactly the next four, earlier entries `toBe`, matchdays 1..k, screen reads matchday k | same | `@property @driving_port` | PBT |
| P6 | `matchFor` after k matches (1..14) for all 8 clubs at seed 31: matchday k, the schedule's opponent, home first, the recorded result | same | `@boundary @driving_port` | example (112 checks) |
| P7 | After two matches the view is matchday 2, not the first entry of the log (the S-007 re-show must not survive) | same | `@error @boundary` | example |
| P8 | Unknown club: none after matchdays; nothing recorded: the S-006 matchday-1 fallback golden | same | `@error @boundary` | example |
| P9 | A formation or eleven changed after the tap does not change the recorded match shown | same | `@property @boundary` | PBT |
| P10 | Picks forward: 4-3-3 and Northcott for Redfern leave the table and his match as before; matchday 2 against Rushmoor Heath Albion, new eleven, every goal one of the 11, never the goalkeeper, never Redfern | same | `@walking_skeleton @driving_port` | example |
| P11 | Only Sam's own fixture reads his new tactics; the other three are as untouched | same | `@boundary` | example |
| P12 | Any valid eleven set before the second match is exactly Sam's side at the tap (oracle takes the eleven directly) | same | `@property @driving_port` | PBT |
| P13 | After k = 1..3 matches, 40 formation, pick, Play match and navigation taps: earlier entries `toBe`, whole matchdays, each Play match appends what his eleven at that tap plays, first-k table unchanged (K3) | same | `@property @walking_skeleton` | PBT |
| P14 | Goals rules every matchday: minutes 1..90 never decreasing, counts equal the score line, his scorers on the eleven he had, nobody a goalkeeper | same | `@property @driving_port` | PBT |
| P15 | Same seed, club and choices: 3 matches and tables identical; `?seed=abc` = no seed; another seed differs | same | `@boundary` | example (3) |
| P16-P19 | `nextMatchday`: 1 on none or `[]`, k + 1 (1, 2, 3, 7, 13); `undefined` at 14; highest + 1 on non-contiguous logs, never count / 4 + 1; equals `results.length / 4 + 1` on any play-only run | same | `@boundary @error @property` | example (4) + PBT |
| P20 | Play match off a known club's home with eight results: the very same state (9 screens, unknown club) | same | `@error @boundary` | example (10) |
| P21 | Table, Back, Squad, Tactics, Starting XI, picks keep the very same results array | same | `@driving_port` | example (6) |
| P22 | `NewGame` from the title drops the log, picks and formation; next matchday 1 (unit-level) | same | `@error @boundary` | example |
| P23 | Any seed, club, run of up to 80 valid and invalid taps: never throws, earlier entries `toBe`, whole matchdays up to 56, every row P = matchdays recorded, row rules | same | `@property @error` | PBT (100 runs) |
| P24-P27 | The S-006/S-007 re-show cases restated (U-1 rows 1-5): second tap matchday 2 with eight entries; non-playing walks keep the array; 40-tap run from the title; K3 with Play match in the pool | same | `@boundary @driving_port @property @error @walking_skeleton` | example (2) + PBT (2) |
| E1 | 13 matches then the 14th: nextMatchday 14 then `undefined`, 56 entries | `season-end.test.ts` | `@walking_skeleton @driving_port @boundary` | example |
| E2 | Matchday-14 match screen: Back to the club home, season still over, `matchFor` reads matchday 14 | same | `@driving_port @boundary` | example |
| E3 | Season over: Play match returns the very same state, however often, never throws | same | `@walking_skeleton @error @boundary` | example |
| E4 | Season over for each of the 8 clubs at seeds 31 and 20260: Play match no-op, match still matchday 14 against the schedule's opponent | same | `@error @boundary` | example (16) |
| E5 | Formation or eleven changed after the season: still a no-op, log unmoved | same | `@error @boundary` | example |
| E6 | Season over: Table reads P 14 and Back restores the club home; Squad, Tactics, Starting XI open and leave the log alone | same | `@driving_port @boundary` | example |
| E7 | Season over, 40 valid or invalid taps: no match screen is ever reached, the log never changes (no way to re-open a played match) | same | `@property @error` | PBT (100 runs) |
| E8 | No stored season-over flag: state keys are only league, screen, formation, xi, results | same | `@boundary` | example (4) |
| E9 | `NewGame` after a finished season clears the log; next matchday 1 | same | `@error @boundary` | example |
| F1 | Reference season, seeds 31 and 20260: the 14 screens read the reference score lines, matchdays 1..14 | `season-for-a-club.test.ts` | `@walking_skeleton @driving_port` | golden (2) |
| F2 | The whole log: 14 matchdays x 4 score lines in fixture order equal the reference | same | `@boundary` | golden (2) |
| F3 | Final table equals the reference rows (incl. the goals-scored tie), Pos 1..8 | same | `@walking_skeleton @driving_port` | golden (2) |
| F4 | Sam's row = the sum of his 14 score lines (W, D, L, GF, GA, GD, Pts) | same | `@boundary` | example (2) |
| F5 | Whoever is managed (8 clubs, seeds 31 and 20260): the result log is the reference season | same | `@property @boundary` | example (16) |
| F6 | After three matches at seed 31: W 1 D 0 L 2, GD -1, Pts 3, sixth | same | `@example @boundary` | example |
| F7 | Same seed and club twice: every screen and the final table identical; `?seed=abc` = no seed | same | `@boundary` | example (2) |
| F8 | K2 schedule through the app: any seed and club, 14 matches: each rival once in 1..7 and again in 8..14, named first once and second once, the schedule's fixture each matchday | same | `@property @driving_port` | PBT |
| F9 | K2 table layer: after the N-th match every row P N, W + D + L = P, Pts = 3W + D, totals W = L, D even, GD 0, GF = GA, order rules, Sam's row = sum of his N score lines (any seed, club, formation) | same | `@property @driving_port` | PBT |
| X1 | Whole season at `?seed=31` in 28 taps: Matchday 1..14 focused, score lines = the reference (Chromium equals Node), Goals formats, Sam's scorers never the goalkeeper, every rival twice and named first once, "Season over", final table cell for cell, Netherwold Borough third on Pts 23 | `S-008-season.spec.ts` | `@walking_skeleton @kpi` | e2e |
| X2 | After two matches the P 2 table (US-1 example 1), Netherwold Borough eighth Pts 0 GD -2; after matchday 3 sixth on Pts 3 | same | `@kpi` | e2e |
| X3 | `?seed=abc` season: 0–1, 2–2, ..., 1–1 with Ironbridge Fen Wanderers, Season over, Valebridge Town 29 / Oakhampton Rise Borough 21; no seed plays the same first two | same | `@example @boundary` | e2e |
| X4 | Managing Marlbrook Athletic: same final table, own row marked; the Season over home: one plain `p`, no Play match, four 44px buttons, in the Play match slot, inside 390px, innerText = textContent; clicking it navigates nowhere; Squad, Starting XI, Table still open | same | `@environment-probe @boundary` | e2e |
| X5 | Picks forward in the browser: table unchanged, Matchday 2 against Rushmoor Heath Albion named first, goals on the new eleven, never Redfern | same | `@walking_skeleton` | e2e |
| X6 | The Dunmore pick: goals of matchdays 1 and 2 on the 11; matchday-2 opponent differs and its scorers are in its Squad list | same | `@example` | e2e |
| X7 | Same seed in a second fresh page: three matches, Goals lists and tables identical; `?seed=abc` = no seed | same | `@boundary` | e2e |
| X8 | Reload after two matches: title again, New game and the same club start at Matchday 1 with P 0 | same | `@error @boundary` | e2e |
| X9 | Restated journey: club home, Table, Back, Play match, Back, Table, 4-3-3, Table, Play match (Matchday 2), Back, no console error or sideways scroll | same | `@walking_skeleton` | e2e |

Counts: 59 committed now (58 vitest: R 8, Q 33, I 9, W 8; 1 e2e: C1); 49 vitest cases held out (P 27, E 9, F 13, written as 45 test definitions) and 9 e2e cases (54 definitions in all). Error/edge share by title tag (`@error` or `@boundary`) over the 54 held-out definitions: 34 (63%); over the committed definitions 20 of 25 (80%). **Waiver (environment):** X1-X9 and C1 run on local-preview and on a `BASE_URL` deployment; local-dev is not a supported target (inherited). Viewport is the Pixel 7 profile at 390px from `playwright.config.ts`; "fresh visits" are new pages or contexts of the same browser (nothing is persisted). **Waiver (runtime):** the season tests (X1, X3, X4) use `test.slow()` (30 s to 90 s) as DEVOPS open question 1 recommends; the whole S-008 e2e ran in about 25 s in the scratch run. **Waiver (line budget):** DESIGN budgeted 420 test lines; the held-out and committed tests total about 1800 lines. They are written and verified in DISTILL, not part of DELIVER's authoring; DELIVER's diff (code about 61 lines plus the U-1 amendments about 75) is within the 1200-line PR guard, and `docs/` is outside it. The file names `season-progression`, `season-for-a-club` and `S-008-season.spec.ts` are DESIGN's; `season-end` is a third vitest file added so no file passes about 500 lines.

### Wave: DISTILL / [REF] WS strategy (Architecture of Reference)
- Driving ports: in-process pure calls (`initialState`, `update`, `nextMatchday`, `matchFor`, `standingsOf`, `playMatchday`, `fixtureOf`, `standings`) and the built browser app at `http://localhost:4173/gaffer/`. All real; no DI container exists.
- Driven ports: none (no storage, clock or network; the log lives in memory for the page's life). Nothing to fake. The seeded `createRng`/`deriveSeed` are the production ones.
- Walking skeleton: extends the S-001..S-007 skeleton into a cycle (club home, Play match, Back, Table, Back, repeat) and one end state ("Season over"). Browser proof: X1, X2, X5, X9. Domain proof: P1 + P2 + P10 + P13 and E1 + E3 and F1 + F3. Litmus: the title is a user goal (play my season to the end and see where we finish) and the Then is what Sam reads (the 14 score lines, the final table agreeing with them, the "Season over" line where the button was).
- Infrastructure policy: as S-003..S-007, no `docs/architecture/atdd-infrastructure-policy.md`; "everything real, nothing faked". Mandate 8 is met by comparing whole `PlayedMatch` arrays against an oracle that builds the sides itself, whole `StandingRow`s, whole `GameState` keys (E8), `toBe` on the very same entries and states, and deep-freeze no-mutation properties (P5, P13, P23, E7).

### Wave: DISTILL / [REF] Adapter coverage table
There are no driven adapters (DESIGN, "Driven ports and adapters": none).

| Adapter | @real-io scenario | Covered by |
|---|---|---|
| (none) | n/a | n/a; the named environment assumptions are probed on the built app: (1) Chromium vs Node over 14 matchdays by X1 and X3 (the browser's 14 score lines and final tables equal the reference season that `season-inputs-pinned.test.ts` recomputes in Node) plus the existing grep on `match.ts`; (2) append-only and contiguous by P5, P13, P23; (3) the guard at 13/14 by E1, E3, E4 (boundaries) and nightly Stryker on `state.ts`; (4) derived equals counted by P16-P19; (5) "Season over" plain text by X1, X4 (no Play match button, one exact `p`, 4 buttons 44px, `innerText` = `textContent`, inside 390px, no sideways scroll); (6) names by W1-W4 |

### Wave: DISTILL / [REF] Scaffolds
No `__SCAFFOLD__` stubs are written under `src/` (a throwing stub would turn the committed run red). Symbols DELIVER must export or change, all used by the held-out tests:
- `src/app/state.ts`: `nextMatchday(state: GameState): number | undefined` (exported, pure, one parameter): the highest `matchday` in `state.results` plus 1, 1 when `results` is absent or empty, `undefined` when that exceeds `MATCHDAYS` (14) (P16-P19; for a log that is not whole matchdays 1..k it is still highest + 1, never `results.length / 4 + 1`, P18). `update` `PlayMatch` from a known club's `clubHome`: `screen` becomes `{ kind: "match", clubId }`, `results` becomes a new array holding the old entries (the identical objects, `toBe`) followed by exactly the 4 entries of `playMatchday({ seed: league.seed, matchday: next, sides })` with the managed club's side its `currentXI(state, squad)` at the tap and every other side `automaticXI(squad, "4-4-2")` (P1, P5, P12, P13); with `nextMatchday(state)` `undefined` it returns the very same state, `toBe`, and never throws (E3, E4, E5); off a known club's home, or on an unknown club, the very same state (P20); every other action keeps `results` (the same array, P21); `NewGame` from the title still drops `results` (P22, E9). `matchFor(state, clubId)`: with `results` present, restrict the record to the entries whose `matchday` equals the latest recorded one (`nextMatchday - 1`, or 14 when the season is over) and take the entry that contains the club's index; a plain `find` over the whole log fails P6-P7, E2, F1; with none recorded, the S-006 matchday-1 derivation (P8, R1); `MatchView` unchanged (`matchday`, `home: { club, squad }`, `away: { club, squad }`, `result` the recorded object, `toBe`). `GameState`, `Screen`, `Action`, `standingsOf`, `focusPlan`, `OPENING_MATCHDAY` and `playOpeningMatchday` keep their shapes and exports; no stored season-over flag (E8: the state keys stay `league`, `screen`, `formation`, `xi`, `results`).
- UI contract (brief port 31; roles, names and the documented club-home universe): while matchdays remain, the club home is exactly the S-007 one (five buttons "Squad", "Tactics", "Starting XI", "Play match", "Table", 44px or taller; C1, X1). After matchday 14: no button named "Play match" (nor any button matching /play match/i); exactly one element whose text is "Season over" (a `<p>`, no role, no heading ancestor, no button ancestor, `innerText` equals `textContent`); the buttons "Squad", "Tactics", "Starting XI", "Table" in that order, each 44px or taller; `div.club-actions` has exactly the five children Squad, Tactics, Starting XI, [Season over], Table in that order (X1/X4 read `.club-actions > *`, DESIGN D9); the line lies inside the 390px screen (X4); the club-name `<h1>` is the only heading and is focused on arrival; "Table" still opens and reads P 14; "Back" from the table returns to the club home still saying "Season over". The match screen is unchanged apart from its h1, which reads "Matchday N" with N = the matchday just played; its score line, "Goals" list and "Back" are the S-006 ones.
- Learned from the scratch run: `renderClubHome` stays at 3 parameters through the props object (oxlint `max-params` 3); `update` stays at 12 cases, complexity 13 of 15; `matchFor` needs no screen change (`main.ts` and `renderMatch` are untouched); a click on the "Season over" line blurs the heading (U-4), so the shell must not try to keep focus there; the line needs no `text-transform` and a width within the phone screen (X4 kills both faults); CSS `.season-over` as in ADR-0014.

### Wave: DISTILL / [REF] Test placement
`tests/acceptance/S-008/` (vitest, same convention as S-001..S-007), `tests/e2e/S-008-club-home-regression.spec.ts` (committed) and `tests/e2e/S-008-season.spec.ts` (held out; DEVOPS coexistence matrix). Held-out sources live in `docs/feature/S-008/distill/pending/{acceptance,e2e}/` as `*.pending`. Existing tests are untouched. Exactly eleven existing places go red or are latent in DELIVER (4 vitest and 4 e2e red, one vitest latent, two helpers), all planned by DESIGN's amend list (see Open points and `upstream-issues.md` U-1).

### Wave: DISTILL / [REF] Driving port coverage
| Port (brief 29-31) | Scenarios |
|---|---|
| 29 `update` (`PlayMatch` append and guard, `NewGame`), `nextMatchday` | P1-P5, P12-P13, P16-P27, E1, E3-E5, E7-E9, F1-F9, R1-R8 |
| 30 selectors `matchFor` (latest), `standingsOf` | P2-P4, P6-P11, P14, E2, E6, F1-F9 |
| 31 UI: club home "Play match" / "Season over", match "Matchday N", "Table", "Back" | X1-X9, C1 |
Ports 1-28 are unchanged and covered by S-001..S-007 tests. Driving adapters (CLI/HTTP/hook): none; the browser app is covered by X1-X9 and C1.

### Wave: DISTILL / [REF] DEVOPS monitoring-contract trace
| Contract row | Scenario |
|---|---|
| K1: next match in 1 tap; a season in 28 taps; "Season over" on the first club home after matchday 14 | X1 (page-side pointerdown counter: 28 taps; h1 "Matchday N" focused each time; the line visible after the 14th Back, no Play match) |
| K2: schedule rules for 100% of seeds 1..1000 x 8 clubs | Q1-Q5 (exhaustive seed-independent schedule check plus the 1..1000 name guard), F8 (the rule through the app, PBT), X1 (every rival twice in the browser) |
| K2: season and table rules, Sam's row = sum of his score lines | F4, F9 (PBT, 100 runs, fresh `FC_SEED`), P23, X1-X4 (`expectRules`, `expectSamsRow`), goldens F1-F3, I1-I2, X1, X3 |
| K3: 0 changes to recorded matchdays over 40 actions; matchday k + 1 uses Sam's XI at the tap | P10-P13, P27, X5, X6 |
| Guard after 14 (D6): 15th Play match `toBe`, boundaries 13 and 14 | E1, E3, E4, E5 |
| 44px, no sideways scroll at 390px, 0 console errors | X1-X9, C1 |
| Names, determinism | W1-W4, P15, F7, X7 |
| S-001..S-007 unchanged | R1-R8, C1, S-001..S-007 suites (amend list U-1) |
| Domain test strength (Stryker on `state.ts`) | P1-P27 (append, identity, guard boundaries, `matchFor` latest, non-contiguous `nextMatchday`, `NewGame`), E1-E9, 21 seeded faults caught |
| Fresh-page determinism, reload loses the season | X7, X8 |

### Wave: DISTILL / [REF] DELIVER step plan (which files to add, and when)
The tree must be green after every commit, and the second Play match changes what the existing S-006/S-007 e2e read, so the e2e amendments ride with the state change:
1. **Step 01, next matchday and recording** (one commit): `nextMatchday`, `matchdayFor` (private), the `PlayMatch` append and guard, and `matchFor` over the latest matchday in `src/app/state.ts`. First run the committed guards and see them green. `git mv` the three vitest pendings: `season-progression.test.ts.pending`, `season-end.test.ts.pending`, `season-for-a-club.test.ts.pending` to `tests/acceptance/S-008/` (dropping `.pending`); confirm RED (the missing symbol and the unchanged second tap), then GREEN. In the same commit apply the amendments of U-1 rows 1-5 (vitest) and rows 6-11 (the S-006/S-007 e2e helpers and tests: they read "Matchday 2" now). Gates: `ci:lint`, `ci:typecheck`, `ci:test`, `ci:e2e`; the club home is not touched yet, so after matchday 14 it still shows "Play match" for one commit (a no-op).
2. **Step 02, "Season over"** (one commit): `renderClubHome(root, { club, seasonOver }, dispatch)` and the `.season-over` CSS in `src/ui/styles.css`, and the `seasonOver: nextMatchday(state) === undefined` flag in the `clubHome` case of `src/main.ts`. In the same commit `git mv docs/feature/S-008/distill/pending/e2e/S-008-season.spec.ts.pending tests/e2e/S-008-season.spec.ts`. `ci:e2e` and `tests/protected/S-001..S-008` must pass.
3. Delete `docs/feature/S-008/distill/pending/` once all four files are moved; zero `.pending` files is the DISTILL-to-DELIVER completion check. Do not delete `tests/acceptance/S-008/season-reference.ts` (U-2).

### Wave: DISTILL / [REF] Pre-requisites
DESIGN: ADR-0014, ADR-0010, ADR-0011, ADR-0012, ADR-0013, ADR-0008, ADR-0009 and brief ports 29-31 (read). DEVOPS: local-preview `http://localhost:4173/gaffer/` via `ci:serve`, Pixel 7 at 390px, `FC_SEED` per CI run (the fast-check properties honour it; the schedule loop over seeds 1..1000 and the goldens are fixed), `BASE_URL` for post-deploy smoke (the e2e uses `?seed=`, roles and names only, so it holds on Pages). No new dependency, no `.github/`, `stryker.config.mjs` or other locked-path change.

### Wave: DISTILL / [REF] Mandate checks (adapted)
- CM-A: tests import only `initialState`, `update`, `nextMatchday`, `matchFor`, `standingsOf`, `currentXI`, `squadOf`, `parseSeed`, `playMatchday`, `fixtureOf`, `fixturesOf`, `standings`, `generateLeague`, `generateSquad`, `automaticXI`, `playersForPosition`, `lineUp`; UI tests enter through the built app by role and name (plus in-page snapshots of focus, `innerText` and boxes, which are the shapes being specified, and the documented `.club-actions` children of DESIGN D9). CM-B: titles use domain terms (matchday, score line, Goals, table, Season over, Back, Starting XI). CM-C: the walking skeletons P1/P2/P10/E3/F1/F3/X1/X5 are user goals with observable outcomes. CM-D: pure rules are tested against independent expected data (the plan run's reference season as plain data, an oracle that builds the sides itself, hand-built non-contiguous logs, a tally of Sam's score lines) and the e2e reads expected names from the "Clubs" list. CM-F: PBT only in layer 1-2 files; e2e is example-only with named sad paths (X4 click on the line, X8 reload, X7 repeat). Mandate-12 domain types/DSL and step-reuse-ratio do not apply: there are no Gherkin steps; e2e helpers (`openSeason`, `playAndRead`, `playSeason`, `openTable`, `readTable`, `expectSeasonOver`) hold no business logic beyond the expected tables imported from `season-reference.ts`.
- Open points for DELIVER: (1) **U-1**: 11 existing places pin the S-007 re-show (`tests/acceptance/S-006/match-navigation.test.ts:100-106`, `tests/acceptance/S-007/table-navigation.test.ts:173-183, 399-417, 419-441, 480-485`, `tests/e2e/S-006-match.spec.ts:86-111, 201-240, 285-310`, `tests/e2e/S-007-table.spec.ts:177-182, 345-382, 416-440`); replace, never weaken, in step 01. (2) **U-2**: keep `season-reference.ts`. (3) **U-3**: the 100-run whole-season properties are the runtime cost for the nightly Stryker run. (4) **U-4**: a click on the "Season over" line blurs the heading; not a defect. (5) Held-out P10 and X5 use the S-006/S-007 golden pick (Kestrel Northcott for Calder Redfern in 4-3-3: slot 7, squad row 13); P12 closes the gap that this pick leaves the seed-31 result unchanged.

### Wave: DISTILL / [REF] Reviewer outcome
The Final Wave Review Gate (four Haiku reviewers) was not dispatched in this unattended hand-off; it is left to the orchestrator. Self-review against the checklist: every driving port 29-31 has a scenario; every DEVOPS monitoring row is traced; no adapter exists; no committed test fails or is skipped; no existing test was edited; held-out specs verified green against a reference, killing 30 seeded faults, and RED for missing functionality without it.

### Wave: DISTILL / [REF] Final wave review gate (4 reviewers, Haiku)
Verdicts: DISCUSS conditionally approved (0 blockers; 2 high), DESIGN approved (0 blockers, 4 medium), DEVOPS rejected_pending_revisions (blocker B1 and C1 are inherited owner-only items: no security scan job, rollback ref; `.github/` is locked), DISTILL rejected_pending_revisions (1 blocker, 6 high). Resolutions:
- **Line budget (DISTILL B-1, DISCUSS F-02):** the PR guard counts non-`docs/` changed lines. This DISTILL PR adds about 480 test lines (under the cap). In DELIVER the held-out files move with `git mv` (pure renames, 0 changed lines under `diff --numstat` rename detection), plus about 61 code lines and about 75 lines of U-1 amendments, so the DELIVER PR stays well under 1200. DEVOPS "631" corrected to 828 (481 + 347 protected). Keep the moves pure renames; edit assertions only where U-1 prescribes.
- **Walking-skeleton tag (H-1), Mandate 8 state-delta port (H-3), Tier B (H-4), environment Given (H-5), @error share (H-6):** accepted as documented deviations. Whole-object `toBe`/`toEqual` plus fast-check properties stand in for a state-delta port (no such port exists in this TypeScript repo, as in S-003..S-007); Tier B is skipped because the pure rules and `update` are already explored by 80-action properties; the environment waiver is inherited; boundary cases count toward edge share. DELIVER may tighten tags when it moves files (U-1 amendments only change what is prescribed).
- **Inherited owner items (DEVOPS B1/C1/H1/H2/M3, DISCUSS F-01):** `.github/` and `tests/protected/` are locked; nothing to do in this tick.
- **Design notes F1 (nightly mutation runtime of the season property), F5 (empty log: latest is 1 via the matchday-1 fallback):** carried into DELIVER as watch items.
