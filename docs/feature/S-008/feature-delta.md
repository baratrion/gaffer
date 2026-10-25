# S-008: Play the season, matchday by matchday

## Wave: DISCUSS

Lean, unattended, revision 1. Reuses `discuss/journey.md` and `slices/slice-01..02`. North star: "manage one fictional club through one short season, start to finish". S-006 shipped matchday 1 and S-007 the table after it. S-007 also said that a second "Play match" re-shows matchday 1 *in this version* and that later versions may move on. scope.md IN says: "Season: double round-robin (14 matchdays); other matches are simulated; league table." The domain already has the full 14-matchday schedule (ADR-0010), streams 200..255 for every fixture (ADR-0011) and an append-only results log (ADR-0012). So the smallest next visible increment is this: every "Play match" plays the NEXT matchday. Narrowed by scope.md precedence (ship less), the following are all later stories: the end-of-season screen, save and continue, the other results, a fixtures list, commentary and stats. Feature type: user-facing. UX depth: lightweight. Walking skeleton: no (brownfield, extends S-001..S-007). JTBD: yes, new job J-08. No DIVERGE artifact (accepted as lean, as for S-002..S-007).

### Wave: DISCUSS / [REF] Scope Assessment
PASS: 2 small user stories with 7 scenarios in total (4, 3), 1 roadmap story and one demonstrable outcome ("I can play my season to the end"). No new context: it uses Match (`playMatchday`), Schedule (`fixturesOf`), Standings (unchanged) and one rule change in the app state (`PlayMatch` appends the next matchday instead of re-showing). 2 carpaccio slices, one release (one DELIVER), about 1.25 days. Integration points: schedule (ADR-0010), match streams (ADR-0011), results log (ADR-0012), standings (ADR-0013), club home: 5, at the limit, not over it. No oversized signal: the end-of-season screen, persistence and other results are cut (D-out).

Line budget (changed lines, code plus tests; file names are indicative, and DESIGN names the files). The e2e covers only what the protected scenarios do not: the seed-31 reference season as a cross-engine golden, focus, 44px and 390px.

| File | Kind | Lines |
|---|---|---|
| `src/app/state.ts` and a pure next-matchday helper (next matchday on "Play match", guard after 14, match screen reads the latest match, side builder generalised from matchday 1) | code | 55 |
| `src/ui/screens/club-home.ts`, `src/main.ts`, `src/ui/styles.css` ("Play match" or the "Season over" line, from a season-over flag) | code | 20 |
| `tests/acceptance/S-008/season-progression.test.ts` (unit and property: next matchday, append-only, picks count from the next match, P N, no-op after 14, `NewGame` clears) | tests | 150 |
| `tests/acceptance/S-008/season-for-a-club.test.ts` (every rival twice, named first once; seed-31 and seed-20260 reference-season goldens) and the D9 names check | tests | 75 |
| `tests/e2e/S-008-season.spec.ts` (14 matchdays at 390px, "Season over", trimmed to what protected does not cover) | tests | 120 |
| Amended S-006/S-007 non-protected re-show assertions (D7) | tests | 40 |
| **DELIVER total** (code 75, tests 385) | code and tests | **460** |
| `tests/protected/S-008/` (written in the plan run, outside DELIVER) | tests | 150 |
| **Grand total** (with protected) | code and tests | **610** |

### Wave: DISCUSS / [REF] Persona
Sam, 34, a lapsed Championship Manager fan. He plays on the bus, one-handed, on a mid-range Android phone 390px wide, with 5 minutes to spare (persona from `docs/feature/S-001/feature-delta.md`). He has played matchday 1 and read the table. Now he wants the season to go on: the next opponent, the next result, the climb or the drop, and a last day that settles where he finishes.

### Wave: DISCUSS / [REF] JTBD one-liner
When I come back for a few spare minutes, I want to play my club's next match of the season, so that each result builds toward where we finish. (Recorded as J-08 `play-out-my-season` in `docs/product/jobs.yaml`; it follows J-06 and J-07.) S-008 serves J-08 fully except the end-of-season screen and saving between sessions.

### Wave: DISCUSS / [REF] Glossary
- **Next matchday**: the lowest matchday 1..14 with no recorded results, so 1 in a new game. "Play match" plays it for the whole league (D1). **N-th match**: Sam's match on matchday N. The table after it reads P N on every row (D4).
- **Season over**: all 14 matchdays recorded (56 results). The club home shows the line "Season over" instead of the "Play match" button (D6, this version only).
- **Named first / named second**: the club before / after the dash in the score line (the schedule's home and away; no home advantage).
- **Reference season**: the real generator's 14 matchdays at a seed with untouched tactics (`discuss/reference-season.md`). **Recorded result**, **Standings**, **Table row**, **Untouched tactics**, **Score line**, **Screen title**: as in S-006/S-007.

### Wave: DISCUSS / [REF] Locked decisions
- D1 Next matchday: each "Play match" tap on a known club's home plays the next matchday for the whole league. Its 4 fixtures: Sam's with his formation and his Starting XI at the moment of the tap, and the other 3 with both clubs' automatic XI in 4-4-2, exactly as S-007 does for matchday 1. The tap appends the 4 results (earlier matchdays never change) and shows the match screen of Sam's fixture of that matchday. The first tap of a new game is still matchday 1, exactly as S-006/S-007 (their durable contracts are untouched).
- D2 Match screen: its only h1 reads "Matchday N", where N is the matchday just played (1..14), focused on arrival. The score line and the "Goals" list use exactly the S-006 formats. Sam's goals are scored by the outfield players of his Starting XI at the time of that match; the opponent's by non-GK players of the opponent's squad. "Back" returns to the club home, focus on its h1.
- D3 Opponents come from the fixed double round-robin (ADR-0010). Over matchdays 1..7 Sam's club meets each of the other 7 clubs exactly once, and over 8..14 again exactly once each. Over the 14 matchdays it is named first against each other club exactly once and named second exactly once. Pairing and order come from the schedule and are the same for every seed (club names vary with the seed).
- D4 Table: after N matches, every row reads P N. The row rules (W + D + L = P, Pts = 3 × W + D) hold on every row. Total W = total L, total D is even, and the GDs add up to 0. Sam's row equals the sum of the score lines he saw (W/D/L counts, GD = goals for minus goals against, Pts). Order rules as S-007 (D4/D14 there).
- D5 Picks between matches count from the next match on. Changing the formation or the XI after matchday k changes nothing recorded (match k and the table stay), and matchday k+1 uses the new XI.
- D6 End of season, this version only: after matchday 14 the club home has no "Play match" button and shows the short line "Season over" instead. The heading and "Squad", "Tactics", "Starting XI" and "Table" stay. "Table" still opens and reads P 14. A "Play match" action after 14 is a no-op (unit test). This rule is not durable and is not pinned in `tests/protected/`. The end-of-season screen (final position, top scorer, play again) is a later story.
- D7 The S-007 re-show is superseded: a second "Play match" now plays matchday 2. S-007 flagged the re-show as non-durable, and no protected S-007 scenario plays twice (checked by the orchestrator). There is no way to re-open an already played match in this version. DELIVER replaces (never weakens) the non-protected assertions of the re-show. Indicative list (DISTILL fixes the exact one): `tests/e2e/S-006-match.spec.ts` "playing again replays the same match (nothing is recorded)", the re-show test in `tests/e2e/S-007-table.spec.ts`, and the S-007 unit and property cases where a later `PlayMatch` keeps the same `results` (now: a later `PlayMatch` appends 4 entries and leaves the earlier entries unchanged).
- D8 Determinism and lifetime: the same seed, club and picks give identical matches and tables on every matchday; "?seed=abc" is the same as no seed. No new RNG stream (matchday N uses streams 200 + 4(N-1) .. +3). Results are kept until the page is reloaded (no persistence). `NewGame` clears them (unit-level invariant, as S-007 D9).
- D9 Phone first and regression: no horizontal scroll at 390px, buttons 44px or taller, no console errors, text through `el()`/`textContent` (ADR-0002), renderers never move focus (ADR-0008). All S-001..S-007 protected scenarios stay green, and "Play match" keeps its exact name. Accessible names: "Season over" appears (case-insensitive) in no `src/domain/names.ts` entry and no generated name (grep today: none; "Rovers" contains "over" but not the phrase). DISTILL adds a unit check, as S-007 D11.
- D10 Durability, for every later version: each "Play match" plays the next matchday in order. The match screen of the N-th match of a new game has the h1 "Matchday N" (1..14), with the S-006 score-line and "Goals" formats. After the N-th match every table row has P N. Over the 14 matchdays the player's club meets every other club exactly twice, named first once and named second once. Not durable: the "Season over" line, the missing button after matchday 14, and "no way to re-open a played match". UX depth: no mockups beyond the journey table.

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
3. `?seed=31`, after matchday 1 Sam chooses "4-3-3" and picks "Kestrel Northcott 6" for "MF Calder Redfern 15". The table still reads as after matchday 1 (Netherwold Borough 6th, P 1, GD "-1"). "Play match" shows "Matchday 2" against Rushmoor Heath Albion (named first, from the schedule). Every Netherwold Borough goal is scored by one of the 11 now on his Starting XI screen, never the GK and never Calder Redfern (the score is the generator's; DISTILL pins it).

**Acceptance criteria (embedded UAT)**
```gherkin
Scenario Outline: The second Play match plays matchday 2 against a new opponent
  Given Sam opens a fresh page at "<seed>", taps "New game" and "<club>", taps "Play match", reads the score line and taps "Back"
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
  Given Sam at "?seed=31" managing "Netherwold Borough" has played matchday 1 and read the table
  When Sam chooses "4-3-3" in Tactics, picks "Kestrel Northcott 6" for "MF Calder Redfern 15" on the Starting XI and taps "Table"
  Then the table reads exactly as before, cell for cell
  When Sam taps "Back" and "Play match"
  Then the screen title is "Matchday 2"
  And every goal naming "Netherwold Borough" is scored by one of the 11 now on its Starting XI screen, never the GK slot

Scenario Outline: The same seed plays the same season
  Given Sam opens a fresh page at "<first>", taps "New game" and "<club>" and plays 3 matches, reading each score line and "Goals" list
  When Sam does the same in a second fresh page at "<second>"
  Then the 3 match screens read the same, and the tables after them read the same, cell for cell
  Examples:
    | first     | second                   | club                    |
    | ?seed=31  | ?seed=31                 | Netherwold Borough      |
    | ?seed=abc | no ?seed= in the address | Oakhampton Rise Borough |
```
Property-test notes: total W = total L, total D even and total GD = 0 after any N, plus the S-007 order rules after any N, are unit and property tests (fast-check honours `FC_SEED`). The e2e checks the seed-31 table of example 1 (cross-engine), 44px, no sideways scroll and no console errors. The opponent's goals (non-GK players of the opponent's "Squad" list) are kept from S-006 (protected there for matchday 1; unit tests for N > 1).

**Outcome KPI:** K1, K3 (below).
**Technical notes (for DESIGN, not AC):** the next matchday is derived from the recorded results (count of matchdays recorded + 1), with no second source of truth (ADR-0012's log carries each entry's matchday). `PlayMatch` appends `playMatchday` for that matchday. Sides are built as `playOpeningMatchday` builds them today (managed `currentXI`, others `automaticXI(squad, DEFAULT_FORMATION)`), generalised from matchday 1. `OPENING_MATCHDAY` gives way to that derived matchday (ADR-0012 foresaw it). The match screen reads the managed club's entry of the latest recorded matchday through the one selector (`matchFor` today). Streams are unchanged (ADR-0011). Superseding ADR-0012's "later taps re-show" needs a decision record: DESIGN's call whether that is an ADR-0012 amendment or a short new ADR. Depends on S-006, S-007.

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
  Given Sam opens a fresh page at "<seed>", taps "New game" and "<club>"
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
  Given Sam at "?seed=31" managing "Netherwold Borough" has played 14 matches, reading each score line
  When Sam taps "Table"
  Then every body row has P 14
  And on every body row W + D + L = P
  And on every body row Pts = 3 x W + D
  And Netherwold Borough's W, D and L count its wins, draws and losses in its 14 score lines
  And Netherwold Borough's GD is its goals minus the other clubs' goals over its 14 score lines
  And Pts never increases down the table
  And between rows with equal Pts, GD never increases

Scenario: When the season is over the club home says so
  Given Sam at "?seed=31" managing "Netherwold Borough" has played 14 matches
  When Sam taps "Back" from the matchday-14 screen
  Then the club home heading "Netherwold Borough" has focus
  And the club home shows the text "Season over"
  And there is no button named "Play match"
  And the buttons "Squad", "Tactics", "Starting XI" and "Table" are still there
```
Notes: the third scenario is this version only (D6). It is checked by e2e and unit tests and NOT pinned in `tests/protected/S-008/` (DISTILL decision, as S-007 L-B), so the end-of-season story may replace the line with a screen. The protected scenarios pin the first two (durable, D10). Unit: a "Play match" action after matchday 14 is a no-op, and the reference seasons at seeds 31 and 20260 are goldens.

**Outcome KPI:** K1, K2 (below).
**Technical notes (for DESIGN, not AC):** "season over" is derived from the recorded results (14 matchdays recorded), never stored separately. The club home renders either the "Play match" button or the "Season over" line from that flag (a plain text line, not a button or heading). The club home layout order stays DESIGN's (S-006 L-2 precedent). The guard sits in `update`, so a dispatched `PlayMatch` after 14 cannot throw from `fixturesOf(15)`. Depends on US-1.
Notes for DESIGN and DISTILL (not part of the AC): "has focus" means `document.activeElement` is the `<h1>`; locators use `exact: true` for "Play match", "Back", "Table", the h1 and "Season over". Protected (`tests/protected/S-008/`) pins only the durable clause (D10) plus the per-match rules; the "Season over" line, the missing button and the reference-season goldens are e2e and unit tests. A protected season is 28 taps per seed; DISTILL may keep one seed per scenario where runtime matters. `tests/protected/S-001..S-007` stay green: none plays twice, and S-006/S-007 pin matchday 1 of a new game only.

### Wave: DISCUSS / [REF] Outcome KPIs
| # | Who | Does what | By how much (target) | Baseline | Measured by |
|---|---|---|---|---|---|
| K1 | Sam on a 390px phone | Plays his season forward | The next match in 1 tap from the club home; a whole season in 28 taps ("Play match", "Back" x 14); "Season over" visible on the first club home after matchday 14 | stuck on matchday 1 (a second tap re-shows it) | e2e click counter (as S-003..S-007) |
| K2 | Sam | Trusts the season is a real league | 100% of seasons over seeds 1..1000 x 8 managed clubs: every rival twice, named first once and second once; every row P N after match N; row rules on every row; his row equals the sum of his score lines | not possible | property tests (`ci:test`, fresh `FC_SEED`) and the protected scenarios |
| K3 | Sam | Sees his between-match decisions count, and only forward | 0 changes to any recorded matchday over runs of up to 40 formation, pick and navigation actions; in 100% of cases matchday k+1's goals for Sam come from his XI at the tap | not possible | property test on `update` plus the selectors |

Guardrails: S-001..S-007 protected scenarios stay green. The league, squads, schedule, every matchday-1 result and the S-006/S-007 goldens are unchanged for every seed. No sideways scroll at 390px and 0 console errors on the club home, match and table screens. Environments follow `docs/feature/S-004/environments.yaml`: local-preview `http://localhost:4173/gaffer/` and the production Pages URL, Chromium, Pixel 7 profile at 390px. There is no analytics in the POC. Performance is not measured separately: each tap does what S-007's first tap does (8 squads, 4 quick-sims).

### Wave: DISCUSS / [REF] DoD
- `tests/protected/S-008/` passes on main; `tests/protected/S-001/` to `S-007/` still pass. Unit and property tests pass for: next matchday (append-only, earlier matchdays untouched, picks count from the next match), the per-club schedule (every rival twice, named first once), P N and the row rules after any N, the no-op after 14, `NewGame` clearing, the D9 names check and the reference-season goldens at seeds 31 and 20260. The `ci:*` scripts are green.
- The e2e phone smoke covers 14 matchdays at `?seed=31` (h1 and score line each), "Season over" with no "Play match", the final table at P 14, and focus on each heading.
- The D7 amendments replace, never weaken, the superseded re-show assertions; no other S-001..S-007 acceptance assertion is edited. No ambient randomness or wall-clock time in `src/domain/`; no new RNG stream. DESIGN records the supersession of ADR-0012's re-show (an amendment or a new ADR). The DELIVER change stays under 1100 changed lines including tests (460 budgeted).

### Wave: DISCUSS / [REF] Out-of-scope
- The end-of-season screen (final position, top scorer, "play again"); a second season without a reload; save and continue (localStorage), so a reload loses the season. Results of the other fixtures, a fixtures list, a "next opponent" line on the club home, re-opening past matches; commentary, stats, condition or fatigue changes, home advantage, AI formations for other clubs.
- Every OUT tag: `match-2d`, `utility-ai`, `transfers`, `finances`, `training`, `youth`, `staff`, `multiplayer`, `backend`, `real-data`.

### Wave: DISCUSS / [REF] WS strategy
No new walking skeleton (brownfield). The story turns the S-001..S-007 loop into a cycle by changing one rule ("Play match" plays the next matchday) and adding one end state ("Season over"). The e2e journey "14 x (Play match, Back), Table" is the end-to-end proof of the north star. Two carpaccio slices in order (`slices/slice-01..02`), both delivered in the one S-008 DELIVER.

### Wave: DISCUSS / [REF] Driving ports
- `update(GameState, Action) => GameState`: `PlayMatch` appends the next matchday's 4 results (no-op after 14 or off a known club's home); `NewGame` clears them.
- Selectors: the next matchday (or season over) from the state; the managed club's latest recorded match (`matchFor` today); `standingsOf`. Domain, unchanged: `playMatchday({ seed, matchday, sides })`, `fixturesOf`/`fixtureOf`. UI entry, by role and accessible name at `http://localhost:4173/gaffer/`: the club home button "Play match" (until matchday 14), then the text "Season over"; the match screen h1 "Matchday N"; "Table"; "Back".

### Wave: DISCUSS / [REF] Pre-requisites
- S-001..S-007 delivered (`playMatchday`, `results` log, `standingsOf`, table screen, `fixturesOf` for 1..14, streams 200..255). ADR-0001..0013 accepted; ADR-0012's "later taps re-show (this version only)" is superseded by D1/D7, and DESIGN records it. `docs/product/jobs.yaml` now has J-08 (resolved). The orchestrator appends roadmap entry S-008 from the draft below. D7 lists the non-protected assertions DELIVER amends.

### Wave: DISCUSS / [REF] Roadmap outcome (draft)
From the club home screen, each tap on the button named exactly "Play match" (44px or taller) plays the next matchday of the season for the whole league and shows the match screen of the player's club's fixture on that matchday. The first tap of a new game plays matchday 1 exactly as before, the second plays matchday 2, and so on up to matchday 14. On each matchday the player's fixture is played with the formation in Tactics and the Starting XI at the moment of the tap, and the league's 3 other fixtures are simulated; the 4 results are recorded at that moment and never change afterwards. The match screen's only top-level heading (h1) reads "Matchday N", where N is the matchday just played (a whole number from 1 to 14), focused on arrival, and the score line and the list named "Goals" are already visible. The score line is exactly one piece of text whose whole text reads the home club's name, one space, the home goals, an en dash (–), the away goals, one space and the away club's name (pattern ^(.+) (\d)–(\d) (.+)$), for example "Rushmoor Heath Albion 2–1 Netherwold Borough"; one of the two clubs is the player's club and the other is a different club of the "Clubs" list. The "Goals" list holds exactly one item per goal, in match order with minutes never decreasing, each reading exactly the minute (1 to 90), a straight apostrophe ('), one space, the scorer's name, one space and the scorer's club name in round brackets, for example "23' Ivo Elderkin (Netherwold Borough)"; the number of items naming each club equals that club's goals in the score line. Every goal for the player's club is scored by one of the 11 players on its Starting XI screen at the time of that match, never the one in the GK slot; every goal for the other club is scored by a player of that club's "Squad" list who is not a goalkeeper (GK). A button named exactly "Back" (44px or taller) returns to the club home with focus on its heading, the club's name. Opponents come from the league's fixed double round-robin schedule, the same for every seed (the club names vary with the seed): over matchdays 1 to 7 the player's club meets each of the other 7 clubs exactly once, over matchdays 8 to 14 again exactly once each, and over the 14 matchdays it is named first in the score line against each other club exactly once and named second exactly once. Changing the formation or the Starting XI between two matches changes nothing already played, and the table stays as it was; the change counts from the next "Play match" on. After the player's N-th match, "Back" and "Table" show the table named "League table" with every row at P N; on every row W + D + L = P and Pts = 3 × W + D; the total of W equals the total of L, the total of D is even and the GDs add up to 0; the player's club's row equals the sum of the N score lines he saw (W, D and L count his wins, draws and losses, GD is his goals minus the goals against, written as in the table, for example "+2", "0" or "-2", and Pts is 3 per win plus 1 per draw); Pts never increases down the table and, between rows with equal Pts, GD never increases. The season comes from the seed: two fresh visits with the same "?seed=", the same club and the same choices show the same match screens and the same table after every matchday, and "?seed=abc" plays the same season as no "?seed=" in the address. Results are kept until the page is reloaded. In this version, after matchday 14 has been played, the club home shows no "Play match" button and shows a line reading exactly "Season over" instead (its heading and its "Squad", "Tactics", "Starting XI" and "Table" buttons stay), and "Table" still shows every row at P 14; an already played match cannot be re-opened. These hold in every later version of the game: each "Play match" plays the next matchday in order; the match screen of the N-th match of a new game has the h1 "Matchday N" (1 to 14) with the score line and the "Goals" list in these formats; after the N-th match every table row has P N; and over the 14 matchdays the player's club meets every other club exactly twice, named first once and named second once. The "Season over" line and the missing "Play match" button after matchday 14 are rules of this version only. No horizontal scroll at 390px and no console errors.

### Wave: DISCUSS / [REF] DoR validation
| # | Item | Status | Evidence |
|---|---|---|---|
| 1 | Problem clear, domain language | PASS | US-1: the season is stuck on one 1–2 defeat, so no decision counts; US-2: a season that never ends cannot be won, and nothing says when it is over |
| 2 | Persona specific | PASS | Sam, 34, one-handed on a bus, 390px Android, 5 minutes, has played matchday 1 and read the table |
| 3 | 3+ domain examples, real data | PASS | Real generator output (`reference-season.md`): seed-31 Netherwold Borough's 14 score lines, its table after matchday 2 and the final table (with a goals-scored tie); seed-20260 Oakhampton Rise Borough's matchdays 1, 2 and 14 and its final position; the S-006 golden pick in 4-3-3. 3 examples per story |
| 4 | UAT Given/When/Then, 3-7 | PASS | 7 for S-008 (US-1 4, two outlines; US-2 3, one outline) |
| 5 | AC derived from UAT | PASS | D1, D2 and D8 in US-1 scenarios 1 and 4; D4 in US-1 scenario 2 and US-2 scenario 2; D5 in US-1 scenario 3; D3 in US-2 scenario 1; D6 in US-2 scenario 3; D7 and D9 by unit tests, e2e and review |
| 6 | Right-sized | PASS | 2 slices in about 1.25 days; 460 changed lines in DELIVER including tests (610 with protected), under the 1100 cap; one outcome |
| 7 | Technical notes | PASS | Per story: next matchday and season-over derived from the log (no second source), side builder generalised, guard in `update`, streams unchanged, decision record for the re-show supersession |
| 8 | Dependencies tracked | PASS | S-001..S-007 delivered; ADR-0010..0013 accepted; ADR-0012 re-show supersession for DESIGN; D7 amendments listed; J-08 added |
| 9 | Outcome KPI measurable | PASS | K1 1 tap per match and 28 per season; K2 100% over seeds 1..1000 x 8 clubs; K3 0 changes to played matchdays over 40-action runs; by e2e and property tests |

DoR status: PASSED (both stories). Every story has `job_id` J-08 and an Elevator Pitch.

### Wave: DISCUSS / [REF] Peer review
Pending.
