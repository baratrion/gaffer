# S-007: See the league table after my first match

## Wave: DISCUSS

Lean, unattended, revision 2 (after `nw-product-owner-reviewer` cycles 1 and 2, see Peer review). Reuses `discuss/journey.md` and `slices/slice-01..02`. Toward the north star (manage a club through a season: pick team, play match, see table), S-006 shipped "play match"; the smallest next visible increment is "see table" after matchday 1. scope.md IN says: "Season: double round-robin (14 matchdays); other matches are simulated; league table." Narrowed by scope.md precedence (ship less): only matchday 1. Matchday 2 and later, a results list of the other fixtures, persistence, commentary and stats are later stories. Feature type: user-facing. UX depth: lightweight. Walking skeleton: no (brownfield, extends S-001..S-006). JTBD: yes, new job J-07. No DIVERGE artifact (accepted as lean, as for S-002..S-006).

### Wave: DISCUSS / [REF] Scope Assessment
PASS: 2 small user stories with 6 scenarios in total (3, 3), 1 roadmap story and one demonstrable outcome ("after my match, here is where we stand"). 1 new small context ("Standings": a pure function of recorded results) plus the app navigation and one new piece of session state (the recorded matchday-1 results). 2 demonstrable carpaccio slices, one release (one DELIVER), about 1.5 days. Integration points: league clubs (S-001), schedule (ADR-0010), match model and `matchFor` (ADR-0011), formation and `currentXI` (S-004/S-005), shell focus (ADR-0008): 5, at the limit, not over it. No oversized signal: matchday 2+, other results, persistence are cut (D13).

Line budget (changed lines, code plus tests; file names are indicative, DESIGN names the files). The e2e covers only what the protected scenarios do not: focus on each heading, 44px, the highlighted row, the seed-31 golden table, cell text equality.

| File | Kind | Lines |
|---|---|---|
| `src/domain/standings.ts` (new: rows from results, order) | code | 45 |
| `src/app/state.ts` (table screen and action, record results on "Play match", re-show, reset, `Back`) | code | 60 |
| `src/ui/screens/table.ts` (new) | code | 55 |
| `src/ui/screens/club-home.ts` (fifth button) | code | 2 |
| `src/main.ts` (table render case, recorded match) | code | 23 |
| `src/ui/styles.css` | code | 30 |
| `tests/acceptance/S-007/standings.test.ts` (unit, property, golden) | tests | 110 |
| `tests/acceptance/S-007/table-navigation.test.ts` (`update`, recording, no-ops) | tests | 145 |
| `tests/acceptance/S-007/names-avoid-table-words.test.ts` | tests | 20 |
| `tests/e2e/S-007-table.spec.ts` (trimmed to what protected does not cover) | tests | 120 |
| Amended S-005/S-006 tests (D12: button lists, "nothing recorded") | tests | 30 |
| **DELIVER total** (code 215, tests 425) | code and tests | **640** |
| `tests/protected/S-007/table.spec.ts` (written in the plan run, outside DELIVER) | tests | 140 |
| **Grand total** (with protected) | code and tests | **780** |

### Wave: DISCUSS / [REF] Persona
Sam, 34, a lapsed Championship Manager fan. Plays on the bus, one-handed, on a mid-range Android phone at 390px wide, with 5 minutes to spare (persona from `docs/feature/S-001/feature-delta.md`; player from brief.md). Has picked a Starting XI and played his first match. Now Sam wants to know what that result means: where his club stands among the 8.

### Wave: DISCUSS / [REF] JTBD one-liner
When I have seen my team's result, I want to see where my club stands in the league, so that I know whether my season is on track and what the next match means. (Recorded as J-07 `see-where-we-stand` in `docs/product/jobs.yaml`; it follows J-06.) S-007 serves J-07 in part: matchday 1 only.

### Wave: DISCUSS / [REF] Glossary
- **Recorded result**: one matchday-1 fixture's final score and goal events, fixed in session state at the first "Play match" tap of a new game (D1). 4 per matchday. After that tap they are the single source for both the match screen and the table (D2).
- **Standings**: the league table derived from the recorded results: one **table row** per club.
- **Table row**: Pos (a cell), Club (the row header), then P (played), W (won), D (drawn), L (lost), GD (goal difference = goals scored minus goals against), Pts (points = 3 per win, 1 per draw), each a cell: in this version 7 cells and 1 row header.
- **Goals scored** (GF): a tie-break that is not shown (D4).
- **Mirror row**: the opponent's row after one match: W and L swapped, D the same, GD negated.
- **Screen title**: the screen's only top-level heading (h1), focused on arrival.
- **Untouched tactics**: a new game in which Sam has not chosen another formation nor picked a player (S-006 glossary).
- **Club index**, **Fixture**, **Matchday**, **Score line**: as in S-006.

### Wave: DISCUSS / [REF] Locked decisions
- D1 Playing records the matchday: the first "Play match" of a new game plays matchday 1 for the whole league. Sam's fixture uses his formation and current Starting XI (exactly as S-006); the other 3 fixtures are simulated with both clubs' automatic XI in 4-4-2 (the S-006 opponent rule). The 4 results are recorded in session state at that moment. This supersedes S-006 D8 ("not recorded") and ADR-0011 section 5 (option 5A, "nothing is stored"); recorded: ADR-0012 accepted.
- D2 Single source and re-show: after the first "Play match", both the match screen and the table read only the recorded results; the S-006 on-demand derivation (`matchFor` style) is used only to produce the recording. Changing the formation or the Starting XI afterwards never changes the recorded results, the table or the match screen. In this version a second "Play match" re-shows the same recorded matchday-1 match (screen title "Matchday 1", same score line and "Goals" list), whatever formation or XI was chosen in between. Later versions may move on to the next matchday instead, so this is not in the durable clause.
- D3 Entry: the club home gains a fifth button named exactly "Table" (44px or taller), stacked after "Play match". The heading (club name) and the other four buttons stay. The order is a layout decision, not part of the durable outcome (S-006 L-2 precedent).
- D4 Table screen: its screen title (only h1) is "League table", focused on arrival. A table (ARIA role table) named "League table" has exactly one header row and exactly 8 body rows, one per club of the "Clubs" list, each club exactly once. In this version the table has exactly 8 columns whose column headers read exactly, in order: "Pos", "Club", "P", "W", "D", "L", "GD", "Pts", and each body row has, in order: Pos (a cell), Club (the row header, role rowheader), then P, W, D, L, GD and Pts (cells): in this version 7 cells and 1 row header. Pos = 1..8 matching row order (no shared positions); Club = the club's name; P, W, D, L, Pts = whole numbers; GD = "+N" when positive, "0" when zero, "-N" (ASCII hyphen-minus U+002D) when negative.
  - Row rules (durable, D14): every row has W + D + L = P and Pts = 3×W + D. The protected scenarios will check both on every row, before and after matchday 1.
  - Visible order (durable, D14): Pts never increases down the table; between rows with equal Pts, GD never increases; the all-zero table of a new game is in A→Z order (D5). The protected scenarios will check these.
  - Full tie-break (this version only, not durable): Pts high→low, then GD high→low, then goals scored high→low, then club name A→Z. A→Z means code-point order: a space sorts before any letter, and club names are letters and spaces only. Goals scored is not shown (GF/GA columns are OUT to fit 390px), so the goals-scored and club-name tie-breaks after a match are checked only by unit and acceptance tests.
- D5 New game: before Sam plays matchday 1, every row reads P 0, W 0, D 0, L 0, GD 0, Pts 0, and the rows are in A→Z order of club name.
- D6 After matchday 1 ("Play match", "Back", "Table"): every row has P = 1; total W = total L; total D is even; total GD = 0. Sam's row agrees with his match screen's score line (win: W 1, Pts 3; draw: D 1, Pts 1; loss: L 1, Pts 0; GD = his goals minus the opponent's goals) and the opponent's row is its mirror.
- D7 Sam's own row is highlighted visually (a design token; not black-box tested). DESIGN may choose the markup; it must not change any cell's text or the row's accessible structure.
- D8 Back: a button named exactly "Back" (44px or taller) returns to the club home with focus on its h1, the club's name; formation and XI unchanged.
- D9 Determinism and lifetime: the recorded results are pure functions of the seed, the fixtures and both sides (ADR-0011 streams; no new stream). Two fresh visits with the same "?seed=" and club, without changing formation or XI, show the identical table after matchday 1; "?seed=abc" equals no "?seed=" in the address. The table is kept until the page is reloaded: visiting "Squad", "Tactics" or "Starting XI" and coming back leaves it unchanged. No persistence: a reload shows the title screen. A new game (after loading the page and tapping "New game") starts from the all-zero table (durable). "New game" is only on the title screen, which only a page load reaches, so "the `NewGame` action clears the recorded results" is a unit-level invariant, not a user-visible step.
- D10 Phone first and regression: no horizontal scroll at 390px (8 narrow columns; long club names wrap in their cell), every button 44px or taller, no console errors, generated text through `el()`/`textContent` only (ADR-0002), renderers never move focus (ADR-0008). Every S-001..S-006 behaviour is unchanged, including S-006's "Matchday 1" first match of a new game and its durable contract (S-006 D14).
- D11 Accessible names: "Table" and "League table" appear (case-insensitive substrings) in no string array of `src/domain/names.ts`, nor in any generated name (checked by grep today: none). "Table" contains none of the existing locator words ("Squad", "Tactics", "Starting", "Players", "Back", "Clubs", "Choose", "Formation", "Line-up", "Play match", "Goals", "Matchday"). Column headers are matched by role columnheader, so "Club" does not clash with the list "Clubs". DISTILL adds a unit check, as S-006 D11.
- D12 Superseded non-protected assertions (DELIVER amends them; none are weakened, each is replaced by the S-007 rule): the exact four-button club-home lists in `tests/e2e/S-005-starting-xi.spec.ts` and `tests/e2e/S-006-match.spec.ts` gain "Table"; the S-006 `match-navigation.test.ts` cases asserting "Play match changes nothing but the screen", "Play match, Back restores the whole state" and "nothing is recorded, so the match is replayed" are restated with the recorded results (screen and results change; formation and XI never). `tests/protected/` is untouched.
- D13 Deferred candidates (not planned here; the plan run may queue them): matchday 2..14 and advancing the matchday; a results list of the other fixtures; GF/GA or form columns (after "Pts" only, D14); save and continue; end-of-season position.
- D14 Durability (prefix rule): in every later version the first 8 column headers read "Pos", "Club", "P", "W", "D", "L", "GD", "Pts" in this order, with these cell formats and Club as the row header; later versions may add columns only after "Pts". In this version there are exactly 8 columns (7 cells and 1 row header per body row). Also durable: the row rules W + D + L = P and Pts = 3×W + D on every row; Pts never increasing down the table and GD never increasing between rows with equal Pts; the all-zero A→Z table of a new game. Not durable: the goals-scored and club-name tie-breaks (D4) and the re-show on a second "Play match" (D2).
- UX depth: no mockups beyond the journey table.

### Wave: DISCUSS / [REF] Story map and priority
Backbone: pick club, club home, squad, player, tactics, starting XI, play match, **see table** (open table, read standing, back), (next: later matchdays, other results, save, end of season). Walking skeleton: the existing S-001..S-006 path plus one branch from the club home (club home, table, back). One release, two thin slices, both in the one S-007 DELIVER:
1. `slices/slice-01-table-before-kickoff.md` (US-1): the "Table" button, the standings function, the table screen with the all-zero A→Z table, and Back. Value 4 x urgency 5 / effort 2 = 10. It comes first: it proves the table fits 390px and is reachable by role and name, with no state change.
2. `slices/slice-02-table-after-matchday-1.md` (US-2): "Play match" records the 4 matchday-1 results; the table and the match screen read them; results kept until the page is reloaded. 5 x 5 / 1.5 = 16.7, but it depends on slice 01. It is the consequence that closes the loop.
Priority rationale: "see table" is the third and last step of the brief's five-minute loop; with it a first full loop is playable. Slices are ordered by dependency, then by outcome value. The roadmap outcome and `tests/protected/S-007/` are complete only after slice 02.
Rejected alternatives: a whole-season "advance matchday" story (ships 14 matchdays, persistence pressure and more state at once); a results list of the other fixtures first (more text, no standing); recording only Sam's match (the table would show 2 clubs on P 1 and 6 on P 0, which is not a league table).

### Wave: DISCUSS / [REF] User stories
Fixtures: at `?seed=31` the league's clubs by index are 0 Netherwold Borough, 1 Fennimore Town, 2 Rushmoor Heath Albion, 3 Juniper Hollow United, 4 Oakhampton Rise Borough, 5 Tarnbeck Borough, 6 Valebridge Albion, 7 Marlbrook Athletic (ADR-0010 matchday 1 with the ADR-0011 seed-31 goldens). With untouched tactics the 4 matchday-1 results are: Netherwold Borough 1–2 Marlbrook Athletic (golden, pinned), Fennimore Town 2–2 Valebridge Albion, Tarnbeck Borough 5–1 Rushmoor Heath Albion, Juniper Hollow United 1–3 Oakhampton Rise Borough (ADR-0011 references; DISTILL pins the derived table as a golden). At `?seed=abc` (default 20260), fixture 0 is Harrowgate Lane United 0–1 Oakhampton Rise Borough (club 7). The pick "Kestrel Northcott 6" for "MF Calder Redfern 15" after choosing 4-3-3 is the S-006 golden pick for Netherwold Borough at `?seed=31` (S-006 slice-01 acceptance; in 4-3-3 its 3 MF slots are Ivo Elderkin 18, Joren Dalrymple 16, Calder Redfern 15). The acceptance criteria state rules; the golden table is a unit-level regression lock, not a protected scenario.

#### US-1: See the league table before kick-off
**Problem:** Sam has a club and a team, but no picture of the league he is in. He cannot see who he is up against or where he starts, so the season has no shape.
**job_id:** J-07

##### Elevator Pitch
- Before: the club home offers "Squad", "Tactics", "Starting XI" and "Play match"; there is no league table anywhere.
- After: on Netherwold Borough's home Sam taps "Table" and sees the screen title "League table" and a table "League table" with columns Pos, Club, P, W, D, L, GD, Pts: Fennimore Town first, Juniper Hollow United second, ... Valebridge Albion eighth, P, W, D, L, GD and Pts all "0", his row highlighted.
- Decision enabled: who are my rivals this season, and am I ready to play the first match?

**Domain examples**
1. `?seed=31`, "New game", "Netherwold Borough", "Table": rows 1 Fennimore Town, 2 Juniper Hollow United, 3 Marlbrook Athletic, 4 Netherwold Borough (highlighted), 5 Oakhampton Rise Borough, 6 Rushmoor Heath Albion, 7 Tarnbeck Borough, 8 Valebridge Albion; each reads P 0, W 0, D 0, L 0, GD "0", Pts 0.
2. `?seed=abc`, 8th club "Oakhampton Rise Borough", "Table": the 8 row headers are exactly the 8 names of that league's "Clubs" list (Harrowgate Lane United among them), A→Z, all zero.
3. Sam chose "4-3-3" in Tactics, then "Table", "Back": the club home heading "Netherwold Borough" has focus and Tactics still has 4-3-3 checked.

**Acceptance criteria (embedded UAT)**
```gherkin
Scenario: Before kick-off every club is level on zero, in A to Z order
  Given Sam opens a fresh page at "?seed=31" on a 390px-wide viewport, taps "New game" and "Netherwold Borough"
  When Sam taps the button named "Table"
  Then the screen title "League table" is the only h1 and has focus
  And the table named "League table" has one header row reading "Pos", "Club", "P", "W", "D", "L", "GD", "Pts"
  And its 8 body rows read Pos 1 to 8, top to bottom
  And their row headers read "Fennimore Town", "Juniper Hollow United", "Marlbrook Athletic", "Netherwold Borough", "Oakhampton Rise Borough", "Rushmoor Heath Albion", "Tarnbeck Borough", "Valebridge Albion", in that order
  And in every body row the cells P, W, D, L, GD and Pts each read "0"
  And in every body row W + D + L equals P
  And in every body row Pts equals 3 × W + D

Scenario Outline: The table holds exactly the league's clubs
  Given Sam opens a fresh page at "<seed>", taps "New game" and reads the 8 names of the "Clubs" list
  When Sam taps "<club>" and then "Table"
  Then the 8 row headers are those 8 names, each exactly once
  And they are in A to Z order (code-point order, a space before any letter)
  Examples:
    | seed      | club                    |
    | ?seed=31  | Netherwold Borough      |
    | ?seed=abc | Oakhampton Rise Borough |

Scenario: Back returns to the club home with the team as Sam left it
  Given Sam at "?seed=31" managing "Netherwold Borough" has chosen "4-3-3" in Tactics
  When Sam taps "Table" and then "Back"
  Then the club home heading "Netherwold Borough" has focus
  And Tactics still has "4-3-3" checked
```
Checked inside these scenarios or by the e2e: "Table" and "Back" are at least 44px tall; the club home still shows "Squad", "Tactics", "Starting XI" and "Play match"; Sam's row is highlighted (e2e, by whatever markup DESIGN chooses); nothing scrolls sideways at 390px; no console error on the club home and table screens.

**Outcome KPI:** K1 (below).
**Technical notes (for DESIGN, not AC):** standings is a pure domain module (no RNG, no `Date`) that takes the 8 clubs and a list of results and returns ordered rows (goals scored kept for the tie-break). Required behaviour only: a table with an accessible name "League table", column headers, and the club cell as row header; DESIGN may choose the markup. Cell text through `textContent`. Narrow numeric columns; the club cell wraps. `update` adds one screen and one action with the usual guards; `sameScreen` gains the table case. Depends on S-001, S-006.

#### US-2: See the table after matchday 1
**Problem:** Sam lost 1–2 and has no idea what it means. Is everyone else winning? Is he bottom? A result without a table is a one-off, and a table that ignored the other matches or moved when he changed his team afterwards would not be worth reading.
**job_id:** J-07

##### Elevator Pitch
- Before: after "Netherwold Borough 1–2 Marlbrook Athletic" the table still reads all zeros.
- After: Sam taps "Play match", "Back", then "Table" and sees the screen title "League table" with 1 Tarnbeck Borough P 1 W 1 GD "+4" Pts 3 at the top and his own highlighted row, 6 Netherwold Borough P 1 L 1 GD "-1" Pts 0, with Marlbrook Athletic 3rd on "+1" and 3 points.
- Decision enabled: how far off the top am I, and do I change my eleven or my formation for the next match?

**Domain examples**
1. `?seed=31`, "Netherwold Borough", untouched tactics, "Play match", "Back", "Table": 1 Tarnbeck Borough 1 1 0 0 +4 3; 2 Oakhampton Rise Borough 1 1 0 0 +2 3; 3 Marlbrook Athletic 1 1 0 0 +1 3; 4 Fennimore Town 1 0 1 0 0 1; 5 Valebridge Albion 1 0 1 0 0 1 (level with Fennimore Town on Pts, GD and goals scored, so A→Z decides); 6 Netherwold Borough 1 0 0 1 -1 0; 7 Juniper Hollow United 1 0 0 1 -2 0; 8 Rushmoor Heath Albion 1 0 0 1 -4 0.
2. `?seed=abc`, "Oakhampton Rise Borough", untouched tactics: its match reads "Harrowgate Lane United 0–1 Oakhampton Rise Borough", so its row reads P 1, W 1, D 0, L 0, GD "+1", Pts 3 and Harrowgate Lane United's reads P 1, W 0, D 0, L 1, GD "-1", Pts 0.
3. After example 1, Sam chooses "4-3-3" and picks "Kestrel Northcott 6" for "MF Calder Redfern 15" (the S-006 golden pick), then opens "Table": it reads exactly as in example 1, Netherwold Borough still 6th on "-1". "Back", "Play match": still "Netherwold Borough 1–2 Marlbrook Athletic" with the same "Goals" list.

**Acceptance criteria (embedded UAT)**
```gherkin
Scenario Outline: After matchday 1 the table agrees with the result Sam saw
  Given Sam opens a fresh page at "<seed>", taps "New game" and "<club>", taps "Play match" and reads the score line
  When Sam taps "Back" and then "Table"
  Then every body row has P 1
  And on every body row W + D + L = P
  And on every body row Pts = 3 x W + D
  And "<club>"'s row has W 1 if its goals in the score line exceed the other club's, D 1 if they are equal, L 1 if they are fewer
  And "<club>"'s row has Pts 3 for that win, 1 for that draw, 0 for that loss
  And "<club>"'s row has GD equal to its goals minus the other club's, written "+N", "0" or "-N"
  And the other club of the score line has the mirror row: W and L swapped, the same D, GD negated
  And Pts never increases down the table
  And between rows with equal Pts, GD never increases
  Examples:
    | seed      | club                    |
    | ?seed=31  | Netherwold Borough      |
    | ?seed=abc | Oakhampton Rise Borough |

Scenario Outline: The same seed always gives the same table after matchday 1
  Given Sam opens a fresh page at "<first>", taps "New game" and "<club>", taps "Play match", "Back" and "Table"
  When Sam does the same in a second fresh page at "<second>"
  Then both tables read the same rows, cell for cell
  Examples:
    | first     | second                          | club                    |
    | ?seed=31  | ?seed=31                        | Netherwold Borough      |
    | ?seed=abc | no ?seed= in the address        | Oakhampton Rise Borough |

Scenario: What is played stays played
  Given Sam at "?seed=31" managing "Netherwold Borough" has tapped "Play match", read the score line and the "Goals" list, then tapped "Back" and "Table" and read the table
  When Sam taps "Back", chooses "4-3-3" in Tactics, picks "Kestrel Northcott 6" for "MF Calder Redfern 15" on the Starting XI, visits "Squad" and comes back, and taps "Table"
  Then the table reads exactly as before, cell for cell
  When Sam taps "Back" and "Play match"
  Then the match screen shows the recorded score line and "Goals" list exactly as before
```
Property-test notes: the protected scenarios will check the row rules W + D + L = P and Pts = 3 × W + D on every row, before matchday 1 (US-1, all zero) and after it (steps above). The totals (total W = total L, total D even, total GD = 0) and the goals-scored and club-name tie-breaks are unit and property tests. Also checked by the e2e: the seed-31 golden table of example 1 (cross-engine probe); no sideways scroll and no console errors.

**Outcome KPI:** K2, K3 (below).
**Technical notes (for DESIGN, not AC):** the first "Play match" of a new game records the 4 results of `fixturesOf(1)` (each via `playMatch` with ADR-0011's stream for its fixture index; no new stream). After that, the match screen and the table read only the recorded results (D2); the on-demand derivation only produces the recording. DESIGN may choose how the results are stored; whole-state assertions in S-001..S-005 on states that never played must stay valid. The `NewGame` action clears the results (unit-level invariant, D9). Standings are derived from the recorded results on render (ADR-0005 (d) pattern). Recorded: ADR-0012 accepted (recording the matchday's results; supersedes ADR-0011 section 5 and S-006 D8). Depends on US-1.

Notes for DESIGN and DISTILL (not part of the AC):
- "Has focus" means `document.activeElement` is the `<h1>`.
- Rows are read by role: the table named "League table" (exact), then `row` (9 rows: 1 header, 8 body), `columnheader`, `rowheader` (the Club cell) and `cell` (the other 7).
- The protected scenarios will check, on every row, W + D + L = P and Pts = 3 × W + D (before and after matchday 1), that Pts never increases down the table, that GD never increases between rows with equal Pts, and the A→Z order of the all-zero table (D4).
- The goals-scored and club-name tie-breaks after a match, the totals, the GD format for every sign, and "the same table whoever is managed under untouched tactics" are unit and property tests on standings and state (fast-check honours `FC_SEED`), not protected (D4).
- The `NewGame` reset (unreachable in the UI without a page load, D9) and the no-ops (table action off a known club's home, `Back` with an unknown club) are unit tests on `update`.
- Decision (L-B): the re-show on a second "Play match" (D2, US-2 scenario 3's last When/Then) is NOT pinned in `tests/protected/S-007/`; it is checked by e2e and unit tests only, because a later matchday-2 story may change it.
- DISTILL hand-off: locators use `exact: true` for "Table", "Back", the heading and the table "League table", and each column header.
- Adding "Table" must keep `tests/protected/S-001..S-006` green: they find buttons by name and do not count club home buttons.

### Wave: DISCUSS / [REF] Outcome KPIs
| # | Who | Does what | By how much (target) | Baseline | Measured by |
|---|---|---|---|---|---|
| K1 | Sam on a 390px phone | Reads where his club stands, from the club home | 1 tap ("Table") from the club home, 2 taps from the match screen ("Back", "Table"); all 8 rows shown on arrival; back home in 1 tap | not possible (no table) | e2e click counter (as S-003..S-006) |
| K2 | Sam | Trusts that the table matches the results | 100% of rows satisfy W + D + L = P and Pts = 3W + D; his row matches his score line and the opponent's mirrors it in 100% of cases; 0 mismatches over seeds 1..1000 x 8 managed clubs | not possible | property tests (`ci:test`, fresh `FC_SEED`) and the protected scenarios |
| K3 | Sam | Tinkers with his team after the match without losing the result | 0 changes to the table or the re-shown match over any run of up to 40 formation, pick and navigation taps after playing | not possible | property test on `update` plus the standings selector |

Guardrails: S-001..S-006 protected scenarios stay green; league, squads, automatic XIs and the S-006 first match unchanged for every seed; no sideways scroll at 390px and 0 console errors on the club home and table screens. Environments as in the DEVOPS environment matrix (`docs/feature/S-004/environments.yaml`): local-preview `http://localhost:4173/gaffer/` (`ci:serve`) for e2e and protected scenarios, and the production Pages URL for the post-deploy smoke, both on Chromium with the Pixel 7 profile at 390px. There is no analytics in the POC; the e2e tap count and the property tests are the only measurements. Performance is not separately measured in this story: the only new work is 3 more quick-sims on the first "Play match" tap and an 8-row tally per table render.

### Wave: DISCUSS / [REF] DoD
- `tests/protected/S-007/` passes on main; `tests/protected/S-001/` to `S-006/` still pass.
- Unit and property tests pass for standings (row rules, order with every tie-break, GD format, empty list), recording (4 results at the tap, single source for match screen and table, kept after formation and XI changes, cleared by the `NewGame` action) and navigation (no-ops). The D11 names check passes. The `ci:*` scripts are green.
- The e2e phone-viewport smoke (local-preview and the post-deploy smoke) covers: club home, "Table" (all zero), "Back", "Play match", "Back", "Table" (P 1, Sam's row highlighted), a formation change, "Table" unchanged, "Play match" re-shown unchanged, "Back"; focus on each new heading.
- The seed-31 golden table (US-2 example 1) is pinned as a regression lock.
- The D12 amendments replace, never weaken, the superseded S-005/S-006 non-protected assertions; no other S-001..S-006 acceptance assertion is edited.
- No ambient randomness or wall-clock time in `src/domain/`; no new RNG stream.
- Recorded: ADR-0012 accepted (recording, superseding ADR-0011 section 5 and S-006 D8); `docs/product/ui/design-system.md` gains the table pattern and the highlighted-row token.
- No sideways scroll at 390px and 0 console errors on every screen of the journey.
- The DELIVER change stays under 1100 changed lines including tests (640 budgeted in DISCUSS, about 701 in the DESIGN estimate; 841 with the plan run's protected scenarios).

### Wave: DISCUSS / [REF] Out-of-scope
- Matchday 2 and later, advancing the matchday, the full double round-robin, end of season.
- A results list or match screens for the other 3 fixtures; GF/GA, form or home/away columns; sorting by column; promotion or relegation markers.
- Save and continue (localStorage); a reload loses the results (title screen).
- Commentary, stats, opponent tactics, condition changes from playing.
- Every OUT tag: `match-2d`, `utility-ai`, `transfers`, `finances`, `training`, `youth`, `staff`, `multiplayer`, `backend`, `real-data`.

### Wave: DISCUSS / [REF] WS strategy
No new walking skeleton (brownfield). This story extends the S-001..S-006 skeleton by one branch from the club home (club home, table, back) and one state change on the first "Play match" (record the matchday). The e2e journey "Table, Back, Play match, Back, Table, Tactics change, Table, Play match, Back" is the end-to-end proof of the full five-minute loop. Two carpaccio slices in order (`slices/slice-01..02`), both delivered in the one S-007 DELIVER. A pure standings precursor commit is allowed inside slice 01.

### Wave: DISCUSS / [REF] Driving ports
- Standings (pure; shape for DESIGN): from the 8 clubs and a list of results, the 8 ordered rows (Pos, club, P, W, D, L, goals scored, goals against, GD, Pts).
- `update(GameState, Action) => GameState` with the table action, `Back` from the table, and the first "Play match" now recording the matchday-1 results; `focusPlan` with the table screen.
- A selector for the table of the current state (recorded results, else none) and for Sam's recorded match.
- UI entry, reachable by role and accessible name at `http://localhost:4173/gaffer/`:
  - the button named "Table" on the club home;
  - the table screen (screen title "League table", table "League table", "Back").

### Wave: DISCUSS / [REF] Pre-requisites
- S-001..S-006 delivered (league, squads, formation, `currentXI`, `automaticXI`, `squadOf`, `fixturesOf`, `playMatch`, `matchFor`, `focusPlan`, club home actions).
- ADR-0001..0011 accepted. Recorded: ADR-0012 accepted (recording the matchday-1 results in session state, superseding ADR-0011 section 5 (D8, "nothing is stored") and S-006 D8); the standings order and the GD format are in ADR-0013 (DESIGN).
- `docs/product/jobs.yaml` now has J-07 (resolved). Roadmap entry S-007 to be appended by the orchestrator from the draft below.
- D12 lists the non-protected S-005/S-006 assertions DELIVER amends.
- Open item for DESIGN: column widths at 390px (8 columns, the club cell wrapping) and the highlighted-row token.

### Wave: DISCUSS / [REF] Roadmap outcome (draft)
From the club home screen the player taps a button named exactly "Table" (44px or taller; the club home's heading is still the club's name and its "Squad", "Tactics", "Starting XI" and "Play match" buttons stay) and sees the league table screen: its screen title, the only top-level heading (h1), is "League table", focused on arrival. A table (role table) named "League table" has exactly one header row and exactly 8 body rows, one per club of the "Clubs" list, each club exactly once. In this version the table has exactly 8 columns, whose column headers read exactly, in this order, "Pos", "Club", "P", "W", "D", "L", "GD" and "Pts", and each body row has, in this order, Pos (a cell), Club (the row header, role rowheader) and then P, W, D, L, GD and Pts (cells): in this version 7 cells and 1 row header. Pos is the row's position, 1 to 8 down the table, with no shared positions; Club is the club's name; P (played), W (won), D (drawn), L (lost) and Pts (points) are whole numbers; GD (goal difference) reads "+N" when positive, "0" when zero and "-N" with an ASCII hyphen-minus when negative, for example "+4", "0" and "-1". On every row, before and after the first match, W + D + L = P and Pts = 3 × W + D. Pts never increases down the table and, between rows with equal Pts, GD never increases. In this version the full order is Pts from high to low, then GD from high to low, then goals scored from high to low, then club name from A to Z in code-point order (a space sorts before any letter; club names are letters and spaces only); goals scored is not shown, so the goals-scored and club-name tie-breaks are checked only by unit and acceptance tests. The player's club's row is highlighted (visual only; not black-box tested). In a new game (after loading the page and tapping "New game" on the title screen), before the player has played a match, every row reads P 0, W 0, D 0, L 0, GD 0 and Pts 0, and the rows are in A to Z order of club name. The first "Play match" of a new game plays matchday 1 for the whole league: the player's fixture exactly as before, and the league's 3 other matchday-1 fixtures are simulated, and the 4 results are recorded at that moment; from then on the match screen and the table read only those recorded results. After "Play match", "Back" and "Table", every row has P 1, the total of W equals the total of L, the total of D is even and the GDs add up to 0; the player's club's row agrees with the score line of its match screen (a win reads W 1 and Pts 3, a draw D 1 and Pts 1, a loss L 1 and Pts 0, and GD is the club's goals minus the other club's goals) and the other club of that score line has the mirror row (W and L swapped, the same D, GD negated). Recorded results are kept until the page is reloaded: changing the formation in Tactics or the Starting XI afterwards does not change the table, and visiting "Squad", "Tactics" or "Starting XI" and coming back leaves it unchanged. In this version a second "Play match" re-shows the same recorded matchday-1 match (the same score line and "Goals" list), whatever formation or Starting XI was chosen in between; later versions may move on to the next matchday instead. The table comes from the seed: two fresh visits with the same "?seed=" and the same club, without changing the formation or the Starting XI, show the identical table after matchday 1, and "?seed=abc" shows the same table as no "?seed=" in the address. A button named exactly "Back" (44px or taller) returns to the club home with focus on its heading, the club's name, and the formation in Tactics and the Starting XI are unchanged. The first match of a new game still reads "Matchday 1" as before. These hold in every later version of the game: the "Table" button on the club home; the screen title "League table"; the table named "League table" with one body row per club, whose first 8 column headers read "Pos", "Club", "P", "W", "D", "L", "GD" and "Pts" in this order, with these cell formats and Club as the row header (later versions may add columns only after "Pts"); the row rules W + D + L = P and Pts = 3 × W + D on every row; Pts never increasing down the table and GD never increasing between rows with equal Pts; the all-zero table, in A to Z order, of a new game before its first match; and "Back" to the club home. The goals-scored and club-name tie-breaks and the re-show on a second "Play match" are rules of this version only. No horizontal scroll at 390px and no console errors.

### Wave: DISCUSS / [REF] DoR validation
| # | Item | Status | Evidence |
|---|---|---|---|
| 1 | Problem clear, domain language | PASS | US-1: no picture of the league or his rivals; US-2: a 1–2 defeat means nothing without a table that includes the other matches and does not move when he tinkers |
| 2 | Persona specific | PASS | Sam, 34, one-handed on a bus, 390px Android, 5 minutes, has just played matchday 1 |
| 3 | 3+ domain examples, real data | PASS | Real generator and ADR-0011 values: the seed-31 league (8 real names, A→Z), its full matchday-1 table including a Pts/GD/goals-scored tie broken A→Z; `?seed=abc` Oakhampton Rise Borough v Harrowgate Lane United; the S-006 golden pick "Kestrel Northcott 6" for "MF Calder Redfern 15" in 4-3-3 after playing. 3 examples per story |
| 4 | UAT Given/When/Then, 3-7 | PASS | Counted per roadmap story, an outline counts as one: 6 for S-007 (US-1 3, one outline; US-2 3, two outlines); one assertion per Then/And step (row rules and the win/draw/loss mapping as separate steps); totals and hidden tie-breaks in property-test notes |
| 5 | AC derived from UAT | PASS | Embedded scenarios are the AC: D2-D6, D8, D9 and D10 by scenario; D1 recording via "What is played stays played" and unit tests; D4 goals-scored tie-break, D7 highlight, D11 and D12 by unit tests, e2e and review (Notes) |
| 6 | Right-sized | PASS | 2 slices in about 1.5 days; DELIVER about 701 changed lines including tests (DESIGN estimate; 640 in DISCUSS), under the 1100 cap (841 with the plan run's 140 protected lines); 6 scenarios; one outcome |
| 7 | Technical notes | PASS | Labelled per story: pure standings, required table semantics only (markup is DESIGN's choice), single source after the first "Play match", no new stream, standings derived on render |
| 8 | Dependencies tracked | PASS | Recorded: ADR-0012 accepted, superseding ADR-0011 section 5 (D8, "nothing is stored") and S-006 D8. S-001..S-006 delivered; D12 amendments listed; D13 deferred candidates; open layout item |
| 9 | Outcome KPI measurable | PASS | K1 1 tap from home, 2 from the match, 1 back; K2 100% consistent rows over seeds 1..1000 x 8 clubs; K3 0 changes over 40-tap runs; by e2e and property tests |

DoR status: PASSED (both stories). Every story has `job_id` J-07 and an Elevator Pitch.

### Wave: DISCUSS / [REF] Peer review
`nw-product-owner-reviewer` (haiku), cycle 1: rejected_pending_revisions (C1, H1-H4, M1-M5, L2-L4). Revision 1 applied as below.

| Finding | How it landed |
|---|---|
| C1 hidden tie-break not black-box checkable | D4 and the outcome keep the order Pts, GD, goals scored, club name, and say goals scored is not shown and its tie-break is checked only by unit and acceptance tests. Black-box checks only that Pts never increases and, within equal Pts, GD never increases (new And in US-2 scenario 1), plus the A→Z order of the all-zero table. A→Z defined as code-point order (a space before any letter; names are letters and spaces only) in D4, US-1 scenario 2, the outcome and slice 01 |
| H1 ADR dependency | DoR item 8, Pre-requisites, D1 and DoD: DESIGN must record an accepted ADR-0012 that supersedes ADR-0011 section 5 (D8, "nothing is stored") and S-006 D8 before DELIVER |
| H2 row structure | D4, Glossary, the outcome and slice 01: each body row has Pos (a cell), Club (the row header, role rowheader), then P, W, D, L, GD, Pts (cells): 7 cells and 1 row header |
| H3 re-tap and "whole league" wording | D2 and the outcome: in this version a second "Play match" re-shows the same recorded match (same score line and "Goals" list) whatever formation or XI was chosen in between; later versions may move on. US-2 scenario 3 gains a When/Then: "Play match" still shows the recorded score line and "Goals" list. "The first "Play match" of a new game plays matchday 1 for the whole league" in D1, the outcome and slice 02. Notes flag that pinning the re-show in `tests/protected/` would bind later versions (orchestrator's call) |
| H4 durable columns | New D14 and the outcome's durable clause: the first 8 columns stay in this order with these formats and row rules; later versions may only add columns after "Pts"; exactly 8 in this version |
| M1 compound Thens | Every Then is split into one assertion per Then/And step; row-rule arithmetic and totals moved to property-test notes under US-2 |
| M2 markup prescriptions | `aria-current`, native `<table>`/caption/`th scope` and the state field shape removed; only "a table with an accessible name, column headers and row headers" is required; markup and storage are "DESIGN may choose" (D7, US-1 and US-2 technical notes, slices) |
| M3 pick fixture | "Dorian Dunmore 7" could not be confirmed after choosing 4-3-3 (in 4-3-3 Netherwold Borough's 3 MF are Ivo Elderkin 18, Joren Dalrymple 16, Calder Redfern 15, so Dunmore is not on the XI). Replaced everywhere by the S-006 slice-01 golden pick "Kestrel Northcott 6" for "MF Calder Redfern 15", cited in the User stories fixtures |
| M4 single source | D2, Glossary, US-2 technical notes, the outcome and journey: after the first "Play match", match screen and table read only the recorded results; the `matchFor`-style derivation only produces the recording |
| M5 lifetime wording | "Rest of the session" replaced by "until the page is reloaded or "New game" is tapped" (D9, the outcome, slice 02) |
| L2 no-seed wording | Examples and the outcome read "no ?seed= in the address" |
| L3 named columns | US-1 scenario 1 and the Elevator Pitch name P, W, D, L, GD and Pts instead of "every other cell" |
| L4 screen title | User-facing prose (Elevator Pitches, journey, Glossary, driving ports) uses "screen title"; the outcome reads "its screen title, the only top-level heading (h1)" |
| L1 (recorded in cycle 2) | House format kept (the S-006 `[REF]` structure), no change |
| L5 (recorded in cycle 2) | The 9th DoD item is an extra check, kept |
| L6 (recorded in cycle 2) | No change |
| L7 (recorded in cycle 2) | Code-point order stated (D4, outcome, slice 01, journey) |
| L8 (recorded in cycle 2) | No action |

Cycle 2 (final): rejected_pending_revisions (H-1, H-2, M-1, M-3, L-A..L-D, plus recording cycle-1 L1, L5-L8). Revision 2 applied as below. Final cycle; any residual is recorded here.

| Finding | How it landed |
|---|---|
| H-1 durable order too wide | D4 split into row rules (durable), visible order (durable) and full tie-break (this version only). The durable clause of the outcome and D14 now hold only what black-box checks can see: Pts never increases down the table, GD never increases between rows with equal Pts, and the all-zero table of a new game is in A to Z order. Goals scored then club name (code-point order) is the rule of this version, checked by unit and acceptance tests, and listed as not durable. Row rules stay durable; D4, the US-2 property-test notes and the DISTILL notes say the protected scenarios will check them on every row before and after matchday 1 |
| H-2 "exactly" not qualified | Outcome first paragraph, D4, D14, Glossary and slice 01: "exactly 8 columns", "column headers read exactly" and "7 cells and 1 row header" are qualified "in this version". D14 and the durable clause are a prefix rule: the first 8 column headers read "Pos", "Club", "P", "W", "D", "L", "GD", "Pts" in this order, with these formats; later versions may add columns only after "Pts" |
| M-1 bundled steps | US-1 scenario 1: Pos 1 to 8 and the row-header order are separate steps. US-2 outline 1: W/D/L, Pts and GD of Sam's row, the mirror row, the two row rules, "Pts never increases" and "GD never increases within equal Pts" are each one step. Journey sketches split too |
| M-3 New game unreachable | User-visible lifetime is "until the page is reloaded" (D9, outcome, slice 02, journey). "A new game (after loading the page and tapping New game) starts from the all-zero table" stays, durable. "`NewGame` clears results" is a unit-level invariant (D9, US-2 technical notes, DoD, DISTILL notes) |
| L-A ADR-0012 status | "DESIGN must record an accepted ADR-0012 before DELIVER" replaced by "recorded: ADR-0012 accepted" in D1, US-2 technical notes, DoD, Pre-requisites, DoR item 8 and slice 02 |
| L-B re-show not protected | DISTILL notes record the decision: the re-show on a second "Play match" is NOT pinned in `tests/protected/S-007/`; e2e and unit tests only |
| L-C budget | DoR item 6 and DoD: DELIVER about 701 lines (DESIGN estimate), under the 1100 cap (841 with protected) |
| L-D performance | Outcome KPIs: performance not separately measured (3 more quick-sims on the first tap, an 8-row tally per render) |
| Cycle-1 L1, L5-L8 | Recorded in the cycle-1 table above |

Cycle 3 (final verification): **approved_with_notes**, no critical, high or medium. H-1, H-2, M-1, M-2, M-3 and L-A..L-C resolved; L-D partially. Its two lows landed by the orchestrator: J-07's functional text drops the unquantified "in seconds" (now "one tap from the club home"); US-1 scenario 1 gains the two row-rule steps (W + D + L = P, Pts = 3 × W + D) that the protected scenarios check before matchday 1.

## Wave: DESIGN

- **Setup**: mode propose; scope application; one solo team, so no Conway constraint. Paradigm: functional core, imperative shell (ADR-0003; recorded in the ADRs and the brief, not in CLAUDE.md). Unattended run; no questions asked.
- **New ADRs**: `adr-0012-recorded-matchday-results.md` (what is recorded, where the 4-fixture simulation lives, how the match screen reads; supersedes ADR-0011 section 5 and S-006 D8) and `adr-0013-league-standings-and-table-screen.md` (standings, order, GD format, table markup, highlight, 390px layout, navigation). ADR-0011 gets a status-line note ("Superseded in part by ADR-0012 (S-007)": section 5, the App line "`GameState` and `initialState` are unchanged", the Consequence "Nothing is stored", and "`matchFor` is the one place that derives a match") and one clarifying documentation edit to its Domain step 2 (the frozen conversion expression, as the code writes it; see Changed Assumptions).
- **Brief**: `docs/product/architecture/brief.md` gains the "Table and recorded results (S-007, ADR-0012, ADR-0013)" subsection, effect-isolation and inventory rows, the C4 L2 descriptions, "For Acceptance Designer" ports 24-28 plus the S-007 observable bullet, and a Changed Assumptions note.
- **No new C4 container.** The domain gains `standings.ts` and extends `match.ts`; the L2 holds, descriptions updated.
- **Library check**: no library is involved (native HTML table, ADR-0002 plain DOM, no new dependency). No Context7 lookup applies; none was run. The only external facts are web-platform semantics (`th scope`, `aria-current`, Chromium dropping table roles when `display` is overridden); they are not looked up here but probed by the e2e (ADR-0013 Earned Trust 1).
- **Outcome collision check**: not run in this unattended design; S-007 registers no outcome (no new typed contract beyond brief ports 24-28), as S-006.

### Wave: DESIGN / [REF] DDD list
- **New small context**: "Standings" (supporting), one pure module `standings.ts`, a pure function of the club list and the recorded results.
- **Extended context**: "Match" gains the matchday: `PlayedMatch` and `playMatchday` in `match.ts` (no new file).
- **Language**: Recorded result (a `PlayedMatch`), Results log (the append-only `results` list, a precursor of the Season), Opening matchday, Standing row, Position, Points, Goal difference, Goals for/against, Managed club (highlighted row), Table.
- **Value objects**: `PlayedMatch { matchday, fixtureIndex, home, away, result }`, `StandingRow { position, clubId, name, played, won, drawn, lost, goalsFor, goalsAgainst, goalDifference, points }`.
- **State**: one new optional field, `GameState.results`. It is a log of facts, not an aggregate with behaviour; the invariants are enforced by the producer (`playMatchday`).
- **Invariants by construction**:
  - Each fixture's result is `playMatch` on its own stream, so the 4 results are independent of each other and of the managed club (only the managed club's own fixture reads its tactics).
  - Standings are a function of results alone, so W + D + L = P, Pts = 3W + D, total W = total L, total D even, total GD = 0 hold for any input.
  - The order is total (unique names), so positions are never shared.
  - `results`, once set, is the same array until `NewGame`.

### Wave: DESIGN / [REF] Decisions
| # | Decision | Source |
|---|---|---|
| D1 | **Record the results themselves** in `GameState.results?: readonly PlayedMatch[] \| undefined` (absent means nothing recorded), entries `{ matchday, fixtureIndex, home, away, result: MatchResult }`, plain JSON-able data, append-only so matchdays 2..14 and `localStorage` need no reshape.<br>Rejected: a kick-off snapshot re-derived per render (history rewritten by any model or rule change; one snapshot per matchday later); standings rows only (no goal list for the match screen); a required `results: []` (breaks `initialState` and S-003 whole-state `toEqual`, as ADR-0009 1B). | ADR-0012 (1); DISCUSS D1, D2, D9 |
| D2 | **Supersession**: ADR-0012 supersedes ADR-0011 section 5 (option 5A "Not stored") and S-006 D8 ("Result not stored"), plus the ADR-0011 App line "`GameState` and `initialState` are unchanged" and the brief line "`GameState` gains nothing". Everything else in ADR-0011 stands: the model, constants, draw order, goldens, streams, screen markup. ADR-0011 gets a status-line note, nothing else. | ADR-0012; DISCUSS H1 |
| D3 | **The 4-fixture simulation is a pure domain function**: `playMatchday({ seed, matchday, sides })` in `match.ts` (8 sides by club index, 4 `PlayedMatch` in fixture order, each exactly `playMatch`). The app decides the XIs (managed `currentXI`, all others `automaticXI(squad, DEFAULT_FORMATION)`) in `playOpeningMatchday(state, clubId)`, the only producer.<br>Rejected: a loop in `state.ts` (matchday rule tied to `GameState`; the season story would copy it); recording only Sam's match and deriving the rest per render (the table would move). | ADR-0012 (2); DISCUSS D1 |
| D4 | **`PlayMatch`** records on the first tap: `results = state.results ?? playOpeningMatchday(...)`, and shows the match screen; later taps keep the same array (re-show, this version only). **`NewGame`** drops `results` (helper returning the same state when none, like `withoutPicks`). No other action touches it. | ADR-0012; DISCUSS D2, D9 |
| D5 | **`matchFor` stays the one selector the match screen reads**, with an unchanged `MatchView`: the recorded entry when present, else the S-006 derivation (unreachable through `update`). `main.ts`'s `match` case does not change, and the S-006 `matchFor` cases stay green unedited.<br>Rejected: a second reader with `matchFor` left as dead code; deleting `matchFor` (rewrites about 12 S-006 cases, for a state `update` never produces). | ADR-0012 (3) |
| D6 | **No new RNG stream**, no new draw: matchday 1 uses streams 200..203. Sam's opponent gets exactly today's result, so the S-006 goldens (seed 31: 1–2; seed 20260: 0–1) and every S-001..S-006 output are unchanged. | ADR-0012; DISCUSS D9 |
| D7 | **Standings**: pure `standings(clubs, played) => readonly StandingRow[]` in new `src/domain/standings.ts`, computed from the results on each render, never stored. `goalsFor`/`goalsAgainst` are kept internally (tie-break, later columns). `standingsOf(state)` in `state.ts` feeds it. Rejected: a running table in state (second source); computing in the renderer (outside tests and Stryker). | ADR-0013 (1) |
| D8 | **Order**: points, goal difference, goals for (descending), then name ascending by `<` (code-point order; a space before any letter). No `localeCompare` (grep test): locale and engine dependent. Names are unique, so the order is total. | ADR-0013 (2); DISCUSS D4 |
| D9 | **GD text** `+N` / `0` / `-N` (ASCII U+002D) by `formatGoalDifference` exported from `standings.ts` (pure, mutated by Stryker, sign table test); the renderer calls it. Rejected: in the renderer (unmutated); in `state.ts` (bloat, mixes concerns). | ADR-0013 (3) |
| D10 | **Markup**: native `<table aria-labelledby="table-title">` named by the `<h1 id="table-title">`; `<thead>` one row of 8 `<th scope="col">`; `<tbody>` 8 rows of `<td>` Pos, `<th scope="row">` Club, six `<td>`. Roles: 9 rows, 8 columnheaders, 8 rowheaders, 56 cells. Rejected: `<caption>` (visible duplicate of the h1); ARIA `div`s; a card list (not a table). | ADR-0013 (4); DISCUSS D4 |
| D11 | **Highlight**: `aria-current="true"` on the managed club's `<tr>`, styled by the attribute selector with new token `--highlight` (gold at 18%), a 4px gold inset edge on the first cell, bold text. One hook for meaning and style; no text change. Rejected: class only; a "(you)" text. | ADR-0013 (5); DISCUSS D7 |
| D12 | **390px**: automatic table layout, `width: 100%`, numeric cells `nowrap` and `width: 1%`, tabular numerals, 1rem body and 0.85rem headers (kept only if the 390px `scrollWidth` probe passes; DELIVER verifies, else 0.9rem and 0.8rem), the Club cell wraps (`overflow-wrap: anywhere`), no `text-transform`. Binding: no `display` override on any table part (Chromium drops roles). Rejected: fixed layout with `colgroup`; an `overflow-x` wrapper (forbidden); hiding columns. | ADR-0013 (6); DISCUSS D10 |
| D13 | **Navigation**: `Screen` adds `table{clubId}`; `Action` adds `ViewTable` (known club's home only); `Back` table to home; `sameScreen` groups `table` with the `clubId` kinds; every navigation changes the screen, so focus goes to the `<h1>` and no focus ids are added. The club home gains a fifth `button.primary` "Table" after "Play match". `update` is at 13 of the 15 allowed cases. | ADR-0013 (7); ADR-0008; DISCUSS D3, D8 |
| D14 | **Names**: "Table" and "League table" are in no `names.ts` array (grep: none). "Table" is a substring of no existing name and contains none of them. "Club" (a columnheader) does not clash with the list "Clubs". The short column names are substrings of other text, so locators use `exact: true`. DISTILL adds the unit check. | ADR-0013; DISCUSS D11 |
| D15 | **No dependency**; no DOM test environment is added. The table renderer is covered by the e2e (role counts, scroll width, text) and the protected scenarios; its data by unit tests. | ADR-0013 |
| D16 | **`renderTable` takes the full `dispatch`** (the ADR-0002/0003 renderer convention) as an accepted exception, with the contract "emits only `{ type: "Back" }`", made a compile-time check by typing the parameter `(action: Extract<Action, { type: "Back" }>) => void` (reviewer cycle 2, N2): an e2e clicks every element of the screen and asserts that nothing navigates but Back, the screen has exactly one `button` and no other control, and a grep test allows one `dispatch(` call and one `addEventListener` in `table.ts`.<br>Rejected: a narrower `onBack` callback for this one renderer (a second renderer signature). | ADR-0013 (UI); reviewer H1 |
| D17 | **Closed universes**: `section.club-home` = swatch, h1, `div.club-actions` of exactly 5 `button.primary` in the order Squad, Tactics, Starting XI, Play match, Table (delta: one button). `main.ts` is unbounded-preservation: only the `table` render case is new; the other render cases, the loop and the focus calls are unchanged. | ADR-0013; reviewer M1, M2 |
| D18 | **The other clubs' side policy** ("every club but the managed one fields `automaticXI(squad, DEFAULT_FORMATION)`") is an app-level policy owned by `playOpeningMatchday` alone; the season story revisits it. The re-show on a second "Play match" is not pinned in `tests/protected/S-007`. | ADR-0012; reviewer L5, L9; DISCUSS D2, D14 |

### Wave: DESIGN / [REF] Component decomposition
| Path | Change | Responsibility | Indicative lines |
|---|---|---|---|
| `src/domain/standings.ts` | CREATE | `ScoredMatch`, `StandingRow`, `standings`, `formatGoalDifference` (tally, order, GD text) | 55 |
| `src/domain/match.ts` | EXTEND | `PlayedMatch`, `MatchdayInput`, `playMatchday` | 22 |
| `src/app/state.ts` | EXTEND | `results` field; `table` screen, `ViewTable`; `PlayMatch` records; `NewGame` drops; `Back` and `sameScreen` cases; `playOpeningMatchday` (replaces `sideOf`); `matchFor` reads the record; `standingsOf` | 50 |
| `src/ui/screens/table.ts` | CREATE | `renderTable` | 55 |
| `src/ui/screens/club-home.ts` | EXTEND | Fifth button "Table" | 1 |
| `src/main.ts` | EXTEND | `table` render case (`standingsOf`, `renderTable`), import. The `match` case is unchanged | 8 |
| `src/ui/styles.css` | EXTEND | `--highlight`, `.league-table`, `.standings` and its cells, the `aria-current` row | 30 |

**Code total**: about 221 lines, against 215 in DISCUSS. `docs/product/ui/design-system.md` gains the table pattern and the token in DELIVER (about 8 doc lines, not counted).

Test lines, re-estimated from the ADR-0012/0013 check lists (finite checks as tables, fast-check only for the row-rule and 40-action properties):

| Test file (DISTILL) | Contents | Lines |
|---|---|---|
| `tests/acceptance/S-007/standings.test.ts` | seed-31 golden (RED-first); each tie-break (Pts, GD, goals for, name) and a name-only full tie; space before letter; empty list gives the all-zero A to Z table; GD sign table; row rules and totals as fast-check properties; permutation and order property; no mutation; `RangeError`; grep: no `localeCompare` | 110 |
| `tests/acceptance/S-007/matchday.test.ts` | `playMatchday` equals `playMatch` per fixture; deep-equal on repeat; frozen sides; other fixtures independent of one club's XI; JSON round trip; `RangeError` table | 60 |
| `tests/acceptance/S-007/table-navigation.test.ts` | `ViewTable`/`Back` and no-op table; `PlayMatch` records exactly the 4 entries of `playMatchday` (managed side `currentXI`, others automatic) and keeps the same array on later taps; formation/XI/visits never change `results`; `NewGame` drops it; `matchFor` recorded vs fallback, plus the fallback-equivalence property (`matchFor` without results deep-equals `matchFor` with `results: playOpeningMatchday(...)`); `standingsOf` before/after; `focusPlan` table cases; 40-action property | 150 |
| `tests/acceptance/S-007/names-avoid-table-words.test.ts` | D11 check over every `names.ts` array | 20 |
| `tests/e2e/S-007-table.spec.ts` | Role counts (9 rows, 8 columnheaders, 8 rowheaders, 56 cells), focus on each heading, 44px, exactly one `aria-current` row = managed club, cell `innerText` = `textContent`, seed-31 golden table (Chromium vs Node), the click-everything check that only "Back" navigates, no sideways scroll or console errors, the formation-change walk | 110 |
| Amended S-005/S-006 tests (D12) | button lists gain "Table"; three `update` cases restated with the record | 30 |
| **Tests total** | | **480** |

**DELIVER total**: about 701 changed lines (221 code + 480 tests), against 640 in DISCUSS; 841 with the plan run's 140 protected lines. The additions from review (the fallback-equivalence property, the click-everything check and the `table.ts` grep, about 20 lines) are absorbed inside the per-file estimates above (the 40-action property shrinks to what the units do not cover). One cap applies: the factory's hard limit of about 1200 changed lines per PR; the DELIVER target stays at or under 1100, and the estimate leaves about 400 lines of room. No cut is needed. If DELIVER runs over, the cut order is: (1) the 40-action property (the unit cases carry the logic); (2) the e2e formation-change walk (units cover it); (3) the seed-`abc` rows of the e2e.

### Wave: DESIGN / [REF] Driving ports
- **Domain**: `playMatchday` (ADR-0012); `standings` and `formatGoalDifference` (ADR-0013).
- **App**: `update` with `PlayMatch` (records), `ViewTable`, `Back`, `NewGame`; selectors `matchFor` (reads the record) and `standingsOf`; `focusPlan` (extended).
- **Browser**: "Table" on the club home; the table screen (`<h1>` "League table", the table "League table", "Back").
- Detail and properties: brief, "For Acceptance Designer", ports 24-28.

New and changed shapes, for the acceptance designer:
- `GameState` = `{ league, screen, formation, xi?, results? }`, with `results?: readonly PlayedMatch[] | undefined`.
- `PlayedMatch` = `{ matchday, fixtureIndex, home, away, result }` (`home`, `away` club indices; `result` a `MatchResult`).
- `Screen` adds `{ kind: "table"; clubId: string }`. `Action` adds `{ type: "ViewTable" }`.
- `StandingRow` = `{ position, clubId, name, played, won, drawn, lost, goalsFor, goalsAgainst, goalDifference, points }`.

### Wave: DESIGN / [REF] Driven ports and adapters
None: no storage, clock or network. The record lives in memory for the page's life. Environment assumptions are named and probed (ADR-0012/0013 Earned Trust):
1. **Chromium vs Node determinism of all 4 fixtures.** Chromium's seed-31 table after matchday 1 equals the table the Node test pins (derived from the ADR-0011 fixture values); WebKit and iOS Safari are not probed. Fault: an approximated function in `match.ts` (the grep test also covers it).
2. **Native table roles in the browser.** The e2e counts the roles (9 rows, 8 columnheaders, 8 rowheaders, 56 cells). Faults: a `display` override on a table part, or a missing `scope`.
3. **390px fit.** The e2e asserts document and table `scrollWidth <= clientWidth` with the long club names of both pinned seeds. Faults: a fixed width, `overflow-wrap` removed.
4. **Text.** Cell `innerText` equals `textContent`; GD cells read `+4`, `0`, `-1` with U+002D. Faults: `text-transform`, a Unicode minus.
5. **Highlight.** Exactly one `aria-current` row, its row header the managed club.
6. **Sort order.** No `localeCompare` (grep test); a unit case where a space sorts before a letter.
7. **Future persistence** (not this story) is the first real adapter and gets its own `probe()` and shape validator; the JSON round-trip test keeps `results` honest until then.

No external integrations, so no contract tests.

**Enforcement**:
- oxlint boundaries are unchanged: `standings.ts` imports only domain; `state.ts` imports no ui.
- `max-params` 3 (`playMatchday` and `standings` take one and two parameters); `complexity` 15 (`update` 13).
- The PR guard and oxlint globals; the `.focus(` grep covers `renderTable`; a new grep forbids `localeCompare` in `standings.ts`.
- Stryker's existing globs cover `standings.ts`, `match.ts` and `state.ts` with no config change.

### Wave: DESIGN / [REF] Technology choices
- No new technology or dependency (ADR-0001, 0002 and 0003 apply; all OSS). The table is native HTML and CSS; no table library.
- No DOM test environment is added (a jsdom would be a new dependency); the renderer is covered by the e2e.
- No newer CSS is relied on (no `:has()`, no container queries): attribute selectors and `font-variant-numeric` only.

### Wave: DESIGN / [REF] Reuse Analysis
| Existing Component | File | Overlap | Decision | Justification / contract shape |
|---|---|---|---|---|
| `playMatch`, `MatchSide`, `MatchResult`, `matchStream` | `src/domain/match.ts` | The matchday's fixtures are `playMatch` calls | REUSE unchanged | Pure return-only; `playMatchday` calls it per fixture, so every result is bit-identical to S-006 (ADR-0011 goldens) |
| (none for the matchday) | `src/domain/match.ts` | A matchday of 4 fixtures | EXTEND (`PlayedMatch`, `playMatchday`) | No matchday function exists; `schedule.ts` cannot import `match.ts` (cycle), `match.ts` already imports `schedule.ts`. Pure return-only; universe = the returned array; deep-equal, frozen inputs, equals `playMatch` per fixture, JSON round trip |
| `fixturesOf`, `fixtureOf`, `FIXTURES_PER_MATCHDAY`, `MATCHDAYS` | `src/domain/schedule.ts` | Which clubs meet, and the fixture index | REUSE unchanged | Frozen data; ADR-0010 goldens |
| `squadOf`, `currentXI`, `automaticXI`, `DEFAULT_FORMATION` | `state.ts`, `selection.ts`, `formation.ts` | The 8 sides | REUSE unchanged | `currentXI` stays the only effective-XI derivation, `squadOf` the only squad lookup |
| `rng.ts`, `generateSquad`, `generateLeague`, `CLUBS_PER_LEAGUE` | `src/domain/` | Seeded draws, squads, club list | REUSE unchanged | No new stream; no generator change |
| `matchFor`, `MatchView`, `OPENING_MATCHDAY`, `sideOf` | `src/app/state.ts` | Deriving and reading the match | EXTEND (`matchFor` reads the record, else the derivation over `playOpeningMatchday`; `sideOf` replaced by the 8-sides builder) | Pure return-only. Same signature and `MatchView`, so `main.ts` and the S-006 cases are unchanged. Universe of the returned state: `{ league, screen, formation, xi?, results? }` |
| `update`, `back`, `sameScreen`, `withoutPicks`, `newGame`, `playMatchAction` | `src/app/state.ts` | Navigation, resets | EXTEND (`ViewTable`, `table` cases, recording, `withoutResults`) | Pure return-only; only `screen` and, on the first tap, `results` change; whole-state `toEqual`, `toBe` for no-ops, deep-freeze |
| `focusPlan` | `src/app/state.ts` | Focus on the new screen | EXTEND (`table` in the `clubId` group via `sameScreen`) | Pure plan value; no focus ids needed |
| (none) | `src/domain/standings.ts` | League table rules | CREATE NEW | No standings, points or table code exists in `src/` or `salvage/` (`salvage/` has an RNG, tactics and a formation resolver only). Contract: pure return-only; universe = the returned rows; properties, goldens, sign table |
| `renderMatch`, `renderStartingXI` markup | `src/ui/screens/` | Section, h1, Back, list named by heading | REFERENCE (same pattern, not shared code) | A table needs different elements; a shared helper would couple screens for about 3 lines |
| (none) | `src/ui/screens/table.ts` | The table screen | CREATE NEW | No table screen exists. Contract: bounded-change; universe = `root.replaceChildren(section.league-table)` with exactly h1, table and Back; never moves focus (grep test); emits only `{ type: "Back" }` (accepted full-`dispatch` exception, D16); e2e role counts and click-everything check |
| `renderClubHome` | `src/ui/screens/club-home.ts` | The club-actions stack | EXTEND (fifth button) | Bounded-change; closed universe: `section.club-home` = swatch, h1, `div.club-actions` of exactly 5 `button.primary` in the order Squad, Tactics, Starting XI, Play match, Table; the existing club-home e2e iterates every button for 44px |
| `el()` | `src/ui/dom.ts` | Builds every cell and its text node | REUSE unchanged | Bounded-change, detached nodes only; string children become text (ADR-0002); `aria-current`, `scope` and `aria-labelledby` pass as attributes |
| `.back-button`, tokens, `h1` rules | `src/ui/styles.css` | Back button, colours, headings | EXTEND (`--highlight`, table rules; reuse `.back-button` and the other tokens) | `.section-label` is not used (uppercase); no `text-transform` on table text |
| `render`, `findClub` | `src/main.ts` | Render switch | EXTEND (`table` case under the `never` guard) | Unbounded-preservation shell. Universe: only the `table` render case is new; the other render cases, the loop and the focus calls are unchanged |
| S-001..S-006 acceptance, e2e and protected tests | `tests/` | Regression | REUSE unchanged, except the D12 amendments | Never-played states have no `results` key, so whole-state assertions hold; the `matchFor` cases stay green via the fallback |

### Wave: DESIGN / [REF] Changed Assumptions
- **S-006 D8, quoted**: "**Result not stored**. A pure `matchFor(state, clubId)` in `state.ts` derives it on render; `main.ts` calls it and maps it to view props." Superseded: the matchday-1 results are recorded in `GameState.results` at the first "Play match" (ADR-0012). `matchFor` and `main.ts`'s `match` case stay, but `matchFor` now reads the record.
- **ADR-0011 section 5, quoted**: "**A. Not stored: a pure app selector `matchFor(state, clubId)` in `state.ts` derives it on render, and `main.ts` calls it (chosen)**", and its rejection of 5C: "Stores derivable data. A new field breaks the whole-state `toEqual` assertions, and an optional field is a second source of truth. D8 says nothing is recorded." Superseded in part by ADR-0012. The reasoning held for one match derived from live tactics; the table needs facts that tactics changes cannot move. The `toEqual` objection is met by the absent-key pattern of ADR-0009 (never-played states keep their exact keys), and the "second source" objection by making the record the only source after the tap.
- **Brief S-006 line "`GameState` gains nothing: the result is never stored (D8)"**: struck through in the brief and pointed at ADR-0012.
- **DISCUSS D2 wording** ("the S-006 on-demand derivation is used only to produce the recording"): refined, not contradicted. `matchFor` also derives as a total fallback when nothing is recorded; `update` records before it ever shows the match screen, so the fallback is unreachable in play.
- **DISCUSS line budget**: DELIVER is about 701 lines (DISCUSS 640), because the matchday function and the persistence-ready shape add a test file. Under the 1100 cap.
- **DISCUSS D12 amendments**: unchanged in size, because `matchFor` keeps its S-006 behaviour on never-played states. The amended `update` cases are the three named in D12.
- **ADR-0011 Domain step 2 (clarifying edit, documentation only)**: the ADR described the conversion as `MAX_CONVERSION * share`; the code computes `(MAX_CONVERSION * cube) / (homeCube + awayCube)`. The ADR now states the code's expression, because the order of operations is frozen to the last bit. Constants, draw order and goldens are unchanged.
- **Brief and ADR claims "`matchFor` is the one place that derives a match"**: no longer true; `playOpeningMatchday` produces the recording and `matchFor` falls back to it.
- **S-006 feature-delta D8 and D10** carry a "(superseded by ADR-0012)" marker.
- **Lifetime wording**: the user-visible lifetime is "until the page is reloaded"; "`NewGame` clears `results`" is a unit-level invariant (DISCUSS D9).
- **Durable order**: only "Pts never increases down the table and GD never increases between rows with equal Pts" plus the all-zero A to Z table are durable (DISCUSS D14); the goals-for and name tie-breaks and the re-show are this version only, and the re-show is not pinned in `tests/protected/S-007`.
- No change to the roadmap outcome text.

### Wave: DESIGN / [REF] Open questions
- **None blocking.**
- **Re-show on a second "Play match"** holds in this version only (DISCUSS D2). The season story replaces it with "play the next matchday" by appending to `results` and keeping a matchday in state; `OPENING_MATCHDAY` then goes away. Nothing in the data shape changes.
- **Column widths** are an estimate (body 1rem and headers 0.85rem per ADR-0013 option 6, falling back to 0.9rem and 0.8rem if the 390px probe fails). DELIVER tunes the padding against the e2e `scrollWidth` check with the longest names of seeds 31 and `abc`; the rule that matters is "no `display` override, the Club cell wraps".
- **`aria-current` support** varies across screen readers; the visual cue (edge, wash, weight) does not depend on it.
- **Persistence** (a later story) must add a probe and a shape validator for `results`, and a save version, because `playerIndex` depends on the frozen squad order.
- **Outcome trace**:
  - "Table" 44px; h1 "League table" focused: D13.
  - Table name, 8 headers, 8 rows, row-header and cell structure: D10.
  - Pos 1..8, GD format, row rules: D7, D8, D9.
  - Order, tie-breaks, A to Z: D8.
  - All-zero A to Z before kick-off: D7 (empty list).
  - First "Play match" records the matchday for the whole league: D1, D3, D4.
  - Sam's row agrees with the score line, mirror for the opponent: D3, D5, D6.
  - What is played stays played; kept until the page is reloaded (`NewGame` clearing is a unit-level invariant): D1, D4.
  - Same seed same table; `?seed=abc` equals no seed: D6.
  - Highlight: D11. Back with focus on the club heading: D13.
  - No sideways scroll, no console errors: D12 and the e2e.
- **Handoff for DISTILL**:
  - Properties and checks: brief ports 24-28 and the ADR-0012/0013 Consequences. Test files and lines are in the table under Component decomposition.
  - **Expected goldens**, written RED-first: the seed-31 matchday-1 table of DISCUSS US-2 example 1 (derived from the ADR-0011 fixture values; DELIVER must match it and never re-pins from its own output), and the all-zero A to Z table of DISCUSS US-1 example 1. Sam's fixture (seed 31, untouched tactics) stays "Netherwold Borough 1–2 Marlbrook Athletic".
  - Locators: role `table` named "League table", `columnheader`, `rowheader`, `cell`, `row`; `exact: true` for "Table", "Back", the heading and every column header ("P", "W", "D", "L", "GD", "Pts", "Pos" are substrings of other texts).
  - The pending-then-activate pattern of S-006 applies to the amended S-005/S-006 cases (D12), in the same commit as the production change.
  - `update` no-ops for `ViewTable` on every other screen; `results` untouched by every action but `PlayMatch` (first tap) and `NewGame`.
  - Unit check D11 for "Table" and "League table"; grep tests for `localeCompare` in `standings.ts` and for one `dispatch(` call and one `addEventListener` in `table.ts`.
  - Property (M5): `matchFor(state without results, clubId)` deep-equals `matchFor({ ...state, results: playOpeningMatchday(state, clubId) }, clubId)` over seeds, all 8 clubs, formations and optional picks.
  - e2e: click every element of the table screen and assert that only "Back" navigates (the `renderTable` emits-only-Back contract); the club home has exactly 5 `button.primary` in the order Squad, Tactics, Starting XI, Play match, Table.
  - The re-show on a second "Play match" is e2e and unit only; `tests/protected/S-007` must not pin it.

### Wave: DESIGN / [REF] Peer review
`nw-solution-architect-reviewer`, cycle 1: **rejected_pending_revisions**. Revision applied as below. Cycle 2 (final): **approved_with_notes**, no critical or high. Its notes landed by the orchestrator: N2 `renderTable`'s `dispatch` parameter is typed `(action: Extract<Action, { type: "Back" }>) => void`, so "emits only Back" is a compile-time check and H1 is resolved without a second renderer signature (ADR-0013, D16); N1 the column-width open question now cites 1rem/0.85rem; N3 the remaining "cross-engine" wording in the brief's S-006 text now reads Chromium vs Node (ADR-0011 option 1D keeps "cross-engine", where it names the `Math.exp` risk correctly); N4 recorded for DISTILL: the club-home e2e asserts the five-button list, and the section's other children (swatch, h1) are covered by the existing S-001/S-006 checks, so the universe claim is limited to that list.

| Finding | How it landed |
|---|---|
| H1 (medium after discussion) `renderTable` gets the full `dispatch` | Kept for consistency (the ADR-0002/0003 renderer convention). Recorded in ADR-0013 as an accepted exception with the reason, the contract "`renderTable` emits only `{ type: "Back" }`", an e2e that clicks every element and records navigation, and a grep test on `table.ts`. Vitest has no DOM environment, so the "DOM test" is the e2e (D16) |
| M1 club home universe | ADR-0013, brief and D17: `section.club-home` = swatch, h1, `div.club-actions` of exactly 5 `button.primary` in the order Squad, Tactics, Starting XI, Play match, Table; the delta is one button |
| M2 `main.ts` label | Labelled unbounded-preservation with its universe (only the `table` case is new) in ADR-0013, the brief's effect table, D17 and the Reuse table |
| M3 / PO M-2 ADR-0011 status | Status line extended: section 5, the App line "`GameState` and `initialState` are unchanged", the Consequence "Nothing is stored", and "`matchFor` is the one place that derives a match". Also in ADR-0012's supersession header |
| M4 brief wording | Brief S-006 App bullet now reads "Since S-007 `playOpeningMatchday` produces the recording; `matchFor` reads it and, when none is recorded, falls back to the same producer (unreachable through `update`)" |
| M5 fallback equivalence | Property added to ADR-0012 (contract shapes), the brief (port 26), the component test table and the DISTILL handoff |
| L1 ADR-0011 step 2 | Restated with the code's expression `(MAX_CONVERSION * cube) / (homeCube + awayCube)`; documentation only; goldens unchanged |
| L2 S-006 markers | "(superseded by ADR-0012, S-007)" added to S-006 feature-delta D8 and D10 |
| L3 "cross-engine" | Replaced by "Chromium vs Node" (WebKit and iOS Safari not probed) in ADR-0012, ADR-0013, the brief's S-007 text and this section |
| L5 re-show not pinned | Recorded in ADR-0012, the brief's durable clause, D18 and the handoff: e2e and unit only, not in `tests/protected/S-007` |
| L6 one cap | One cap stated: the factory's hard limit of about 1200 changed lines per PR; the DELIVER target stays at or under 1100 with the about 701 estimate |
| L8 font sizes | Header 0.85rem and body 1rem, kept only if the 390px `scrollWidth` probe passes (DELIVER verifies; fallback 0.9rem and 0.8rem) in ADR-0013, the brief and D12 |
| L9 other-club policy | Named in ADR-0012 and D18 as an app-level policy owned by `playOpeningMatchday`, to be revisited by the season story |
| Consistency with DISCUSS cycle 2 | Lifetime is "until the page is reloaded" and `NewGame` clearing is a unit-level invariant (ADR-0012, brief, trace); the durable order is only Pts non-increasing and GD non-increasing within equal Pts (ADR-0013, brief) |

## Wave: DEVOPS

Lean, unattended. All nine decisions pre-answered. No platform change: phone-viewport Chromium in CI and the deployed Pages URL. Owner-locked paths (`.github/`, `factory/`, `scripts/`, `.nwave/`, `CLAUDE.md`, brief/scope, `tests/protected/`, `stryker.config.mjs`) are read-only. Machine-readable environments: `docs/feature/S-007/environments.yaml`. Inherits the S-006 DEVOPS setup (`docs/feature/S-006/environments.yaml`); only the deltas are recorded.

Checklist: ✓ existing infra reused | ✓ K1-K3 mapped to instruments | ✓ rollback defined | ✓ mutation strategy (nightly-delta, inherited; `standings.ts`, `match.ts`, `state.ts` inside the mutate globs, no config change) | ⊘ new IaC/containers (none) | ⊘ server-side observability (no backend) | ⊘ continuous learning | ⊘ CLAUDE.md edit (already states strategy) | ⊘ `docs/product/kpi-contracts.yaml` (not created by S-001..S-006)

### Wave: DEVOPS / [REF] Environment matrix
| Env | URL | Runner | Purpose |
|---|---|---|---|
| local-dev | `http://localhost:5173/gaffer/` (`pnpm dev`) | dev machine | Iteration |
| local-preview | `http://localhost:4173/gaffer/` (`ci:serve`) | dev, CI, protected runner | Production build under test; unit, property, e2e and `tests/protected/S-001..S-007/` |
| production | `https://<owner>.github.io/gaffer/` | GitHub Pages | Live site; post-deploy smoke via `BASE_URL` |

Unchanged from S-006: no staging (static site, recreate); Chromium, Pixel 7 profile, 390px viewport in local-preview and production. Deltas:
- The matchday-1 results are recorded in session memory (`GameState.results`, ADR-0012) at the first "Play match" and the table is derived from them on render (ADR-0013). Nothing is persisted: a reload shows the title screen, so no environment holds state between visits.
- Cross-engine determinism now covers all 4 matchday-1 fixtures (ADR-0012 Earned Trust 1): the e2e compares the browser's seed-31 table with the golden the Node test pins (Tarnbeck Borough, Oakhampton Rise Borough, Marlbrook Athletic, Fennimore Town, Valebridge Albion, Netherwold Borough, Juniper Hollow United, Rushmoor Heath Albion). It runs in Chromium on local-preview and, through `smoke`, on the live site. WebKit and iOS Safari are not probed in CI.
- Native table roles (ADR-0013 Earned Trust 2): the e2e counts 9 rows, 8 columnheaders, 8 rowheaders, 56 cells in Chromium. A `display` override on a table part would drop the roles and fail the count.
- 390px fit: `scrollWidth <= clientWidth` on document and table with the longest club names of seeds 31 and `abc`; cell `innerText` equals `textContent` (GD uses ASCII U+002D); exactly one `aria-current` row. All Chromium only.
- Every S-007 navigation ("Table", "Back") is a screen change, so focus goes to the new `<h1>` (ADR-0008).

### Wave: DEVOPS / [REF] CI/CD pipeline outline (existing, unchanged)
- `ci` (PR, push to main, dispatch): PR guards (locked paths, append-only protected, diff size 1200, `Math.random`/`Date` in `src/domain/`), roadmap lint, `ci:lint`, `ci:typecheck`, `ci:test` (fresh `FC_SEED`; the standings and 40-action properties honour it), `ci:build`, `ci:e2e`, protected-scenario no-regression check vs main (new `tests/protected/S-007/table.spec.ts` must fail on main).
- `deploy` (push to main): `ci:build`, deploy-pages, then `smoke` runs `ci:e2e` against the live URL (includes the new S-007 spec and its seed-31 golden table probe).
- `nightly`: `ci:mutation`; failure opens a `mutation-alarm` issue.
- `ai-review`, `factory-tick`, `watchdog`, `weekly-demo`: factory-owned, untouched.
- S-007 needs no pipeline change: it adds unit, property and e2e specs run by the existing scripts and no dependency (ADR-0012/0013: native HTML table, no DOM test environment). The DELIVER diff (about 701 lines planned) stays under the 1200-line PR guard.
- Local gate: `pnpm run check` mirrors the commit stage. No git hooks (locked paths; CI is the gate).
- Security: no secrets, no runtime deps, no network. Club names enter the DOM only via `el()`/`textContent` (ADR-0002); a review check. SAST/SCA/SBOM not added (workflows locked; inherited open question).

### Wave: DEVOPS / [REF] Monitoring contracts (DISCUSS KPI/AC to instrument)
E2E instrument is the new `tests/e2e/S-007-table.spec.ts` (Pixel 7, 390px), run by `ci:e2e` on PR and main and by `smoke` on the live URL after each deploy. "Unit" and "property" rows run in `ci:test` (properties with a fresh `FC_SEED`). `tests/protected/S-007/` runs on local-preview in `ci` and must pass on main.

| KPI / criterion (DISCUSS) | Instrument | Pass condition |
|---|---|---|
| K1: standing read in 1 tap from the club home ("Table"), 2 taps from the match screen ("Back", "Table"); all 8 rows shown on arrival; back home in 1 tap | e2e: page-side capture-phase click counter (as S-003..S-006); after "Table" assert `document.activeElement` is h1 "League table" and 8 body rows are visible with no wait; "Play match", "Back", "Table" counts 2 clicks from the match screen; "Back" returns to the club h1 with focus. Protected: the same, rule-based | 1 click in, 8 rows on arrival, 2 clicks from the match, 1 click back |
| K2: 100% of rows satisfy W + D + L = P and Pts = 3W + D; Sam's row matches his score line and the opponent's mirrors it; 0 mismatches over seeds 1..1000 x 8 managed clubs | property (fast-check, `FC_SEED`; standings row rules, totals W = L, D even, GD 0, order non-increasing; and an `update`-level check over seeds x 8 clubs that Sam's row agrees with `matchFor`). e2e: seed-31 golden table cell for cell (cross-engine probe) and seed `abc`. Protected: matchday-1 scenarios by rule | 100%; 0 mismatches; golden exact |
| K3: 0 changes to the table or the re-shown match over any run of up to 40 formation, pick and navigation taps after playing | property on `update` (40-action runs, `results` is the same array until `NewGame`) plus `standingsOf` and `matchFor` equality. e2e: formation change and pick, "Table" unchanged cell for cell, "Play match" re-shows the same score line and "Goals". Protected: "What is played stays played" | 0 changes |
| Standings rules and tie-breaks (D4, D8) | unit: each tie-break (Pts, GD, goals for, name), a name-only full tie, space before letter, empty list gives the all-zero A to Z table; grep: no `localeCompare` in `standings.ts`; no `Math.random`/`Date` (PR guard) | holds |
| GD format (D9) | unit sign table (`+N`, `0`, `-N` with U+002D); e2e cell text `+4`, `0`, `-1` | holds |
| Table structure (D10) | e2e: role counts 9 / 8 / 8 / 56; table named "League table"; column headers exact and in order; cell `innerText` equals `textContent` | holds |
| Highlight (D7, D11) | e2e: exactly one `aria-current` row and its row header is the managed club (visual styling not black-box tested) | holds |
| Recording (ADR-0012) | unit: `playMatchday` equals `playMatch` per fixture; `PlayMatch` records exactly the 4 entries, managed side `currentXI`, others automatic; later taps keep the same array; `NewGame` drops it; JSON round trip; `RangeError` table | holds |
| S-006 goldens unchanged | unit: seed 31 fixture 0 stays 1–2 and seed 20260 fixture 0 stays 0–1 (no new stream, streams 200..203); S-006 `matchFor` cases green unedited | holds |
| Navigation and no-ops (D13) | unit on `update`: `ViewTable` only from a known club's home, `Back` from the table, same-object `toBe` for no-ops, deep-freeze; `focusPlan` table case; `.focus(` grep covers `renderTable` | holds |
| Names avoid table words (D11) | unit: "Table" and "League table" in no `names.ts` array | holds |
| 44px tap targets | e2e: `boundingBox().height >= 44` on "Table" and "Back"; club-home regression specs check every club home button | holds |
| No horizontal scroll at 390px | `scrollWidth <= clientWidth` on club home and table screens (long names wrap) | holds |
| No console errors | `page.on("console"/"pageerror")` across the DoD journey (club home, Table, Back, Play match, Back, Table, formation change, Table, Play match, Back) | zero |
| S-001..S-006 unchanged | existing e2e, acceptance tests (only the D12 amendments, which replace and never weaken) and `tests/protected/S-001..S-006/` | green |
| Domain test strength | Stryker on `src/domain/**` (covers `standings.ts`, `match.ts`) and `src/app/state.ts` (covers `ViewTable`, recording, `NewGame` reset, `Back`, `sameScreen`, `standingsOf`, `matchFor`) | nightly, at or above break threshold (70) |

No analytics (POC). The e2e tap count and the property tests are the KPIs' sole measurements.

### Wave: DEVOPS / [REF] Deployment strategy and rollback
- Strategy: recreate. Merge to main triggers `deploy`, replacing the whole static artifact. Idempotent: redeploying the same ref yields the same artifact.
- Rollback (designed first): revert the S-007 squash commit on main; the merge triggers `deploy` and `smoke` validates the restored site. Alternative: `workflow_dispatch` of `deploy.yml` on a known-good ref (the commit before the S-007 squash, which is the S-006 deploy). Fallback: fix-forward on a `claude/*` branch. As in S-003..S-006, the append-only protected-tests and no-regression guards may block a plain revert of a squash that added `tests/protected/S-007/`; if so, the dispatch route is the owner action. Time to restore: one deploy cycle (about 5 minutes).
- Failure detection: a red `smoke` job marks the deploy run red. A cross-engine fault shows as a red seed-31 table probe in `smoke` while `ci:test` stays green; a dropped table role shows as a red role count.
- Data: nothing is persisted (`results` lives in memory for the page's life), so no migration, no save version and no user data at risk. Rolling back removes the "Table" button and the table screen, and "Play match" goes back to deriving the S-006 match on render.
- Result stability across deploys: results stay frozen by ADR-0011 (constants, draw order, streams 200..255; matchday 1 uses 200..203). The table is a pure function of them. Any later change to them changes every seed's table and needs an ADR amendment; it is not a deploy concern.
- Blast radius: one static page.

### Wave: DEVOPS / [REF] Mutation testing strategy
nightly-delta, inherited from `CLAUDE.md`; `/nw-deliver` Phase 5 skipped. `stryker.config.mjs` (owner-locked, read) mutates `src/domain/**/*.ts` except `names.ts`, plus `src/app/state.ts`; thresholds high 85, low 70, break 70. Glob check:
- `src/domain/standings.ts` (new): matches `src/domain/**/*.ts`, not excluded. Mutants are killed by the seed-31 golden, each tie-break case (Pts, GD, goals for, name), the name-only full tie, the space-before-letter case, the empty-list all-zero table, the GD sign table (including the zero and U+002D cases), the row-rule and order properties and the `RangeError` table.
- `src/domain/match.ts` (extended with `PlayedMatch`, `playMatchday`): already matches. Killed by the `playMatchday` equals `playMatch` per fixture case, the independence of the other fixtures from one club's XI, the `RangeError` table and the S-006 goldens and calibration, which still run.
- `src/app/state.ts` (`results`, `table` screen, `ViewTable`, recording in `PlayMatch`, `NewGame` reset, `Back` and `sameScreen` table cases, `playOpeningMatchday`, `standingsOf`, `matchFor`): already listed. The whole-state `toEqual`, same-object `toBe` for no-ops, the 4-entry record check, the same-array-on-later-taps check, `focusPlan` pairs and the 40-action property carry it.
- UI renderers (`table.ts`, `club-home.ts`) and `main.ts` are outside the globs (as before); the e2e covers them.
- Runtime watch: `state.ts` mutants rerun the 40-action property and the `update` suites, on top of the S-006 4000-match calibration for `match.ts` mutants. Nightly stays under the 45-minute `nightly.yml` timeout by estimate; check the first nightly after the merge (open question 3 of S-006 still applies).
- No `stryker.config.mjs` change needed (nothing for DELIVER to change). Run by `nightly.yml` via `ci:mutation`; failure opens `mutation-alarm`, `needs-human`.

### Wave: DEVOPS / [REF] Observability stack
Browser console plus Playwright smoke on the deployed URL only. No RUM, error tracking, logs or tracing. SLO: smoke green per deploy (including the seed-31 golden table probe). Alerting: a red `deploy` run; a red nightly opens `mutation-alarm`. No dashboards.

### Wave: DEVOPS / [REF] Branching strategy
Trunk-based. Short-lived `claude/S-007-*` branches, PR to main, squash merge. CI green and protected scenarios not regressing. Deploy fires on merge. No release branches. The DELIVER diff (about 701 lines planned, 841 with the protected scenarios) stays under the 1200-line PR guard; `docs/` is outside the count. If DELIVER nears the cap, the DESIGN cut order applies.

### Wave: DEVOPS / [REF] Coexistence matrix
| Component | S-007 impact | Action |
|---|---|---|
| `ci.yml`, `deploy.yml`, `nightly.yml` | none; run existing `ci:*` scripts | reuse |
| `ci:*` scripts, `playwright.config.ts` | none; Pixel 7, 390px, `BASE_URL` already fit | reuse |
| `stryker.config.mjs` | `src/domain/**` covers `standings.ts` and `match.ts`; `src/app/state.ts` covers the new state code; no change needed | none |
| `scripts/guards/pr-guards.mjs` | determinism grep covers `standings.ts`; diff cap 1200 vs about 701 planned | none |
| `tests/protected/S-001..S-006/` | club home gains a fifth button "Table" (no name collision with "Squad", "Tactics", "Starting XI", "Play match", "Back"; does not contain "Players"); they do not count club home buttons | must stay green |
| `tests/protected/S-007/` | locked scenario for this story (written in the plan run) | must pass on main |
| `tests/acceptance/S-001..S-006/` | `GameState.results` is an absent-key optional field, so never-played states keep their exact keys; streams unchanged, so every generator output and S-006 golden is unchanged. Only the D12 amendments (button lists, three `update` cases restated with the record) are edited, replace-not-weaken | reuse; amend per D12 |
| `tests/e2e/S-005-starting-xi.spec.ts`, `S-006-match.spec.ts` | exact four-button club-home lists gain "Table" (D12) | amend in the same commit as the production change |
| `tests/e2e/S-004/S-005/S-006` club-home regression specs | the new `button.primary` is 48px | reuse unchanged |
| `tests/e2e/S-001..S-006*.spec.ts`, `shell.spec.ts` | focus on `<h1>` after navigation still holds (ADR-0008) | reuse unchanged, regression-watch |
| `tests/e2e/S-007-table.spec.ts`, `tests/acceptance/S-007/` | new specs | add (DISTILL) |
| `src/domain/standings.ts`, `src/ui/screens/table.ts` | new | S-007 tests guard |
| `src/domain/match.ts`, `src/app/state.ts`, `src/ui/screens/club-home.ts`, `src/main.ts`, `src/ui/styles.css` | extended | S-001..S-006 tests guard |
| `docs/product/ui/design-system.md` | gains the table pattern and `--highlight` token in DELIVER | doc edit |
| Pages artifact | grows slightly; base path `/gaffer/` unchanged | none |

### Wave: DEVOPS / [REF] Pre-requisites
- S-006 delivered and deployed; GitHub Pages source "GitHub Actions" enabled (✓).
- Node 22 or later, pnpm 10.12.4 pinned, Playwright chromium via `.github/actions/setup`.
- ADR-0001..0013 accepted (✓; ADR-0012 and ADR-0013 landed in DESIGN, before DELIVER; ADR-0011 carries a status-line note).
- `tests/protected/S-007/table.spec.ts` committed by the plan run (append-only from then on).
- `BASE_URL` derived from repository owner and name (no secret).

### Wave: DEVOPS / [REF] Open questions
Owner-only items inherited from S-001..S-006 (smoke `sleep 20`, no security scanning, smoke has no commit-SHA check, deploy not gated on `ci`, squash revert possibly blocked by the append-only guards, no uptime probe, WebKit not probed) are unchanged and none block S-007. New:
1. No `.github/` or `stryker.config.mjs` change is needed for S-007 (`standings.ts`, `match.ts` and `state.ts` are inside the existing `mutate` globs).
2. Nightly mutation runtime: `state.ts` gains more mutants and test paths (40-action property). Watch the first nightly after the S-007 merge against the 45-minute `nightly.yml` timeout; if it nears it, DELIVER trims test cost (not bounds), or the owner raises the timeout.
3. Smoke on the live URL runs the S-007 e2e spec too; its seed-31 golden table relies on `?seed=` being honoured on Pages (same as S-001..S-006).
4. The squash revert of S-007 may be blocked by the append-only protected guards (new `tests/protected/S-007/`); the `workflow_dispatch` route is the owner action.

## Plan run: protected scenarios

`tests/protected/S-007/league-table.spec.ts` holds 4 black-box scenarios (Pixel 7, 390px; roles, accessible names and visible text only). They check only rules that hold for any seed and in every later version: the durable clause of the outcome, plus the after-matchday-1 consistency rules. They pin no generated table, so the seed-31 table above stays a unit/e2e golden for DISTILL. Only the first 8 columns are read, because later versions may add columns after "Pts". Every table read checks:
- the focused, only h1 "League table";
- one table named "League table" with exactly one header row whose first 8 column headers are "Pos", "Club", "P", "W", "D", "L", "GD", "Pts";
- 8 body rows, each with one row header (the club, each club of "Clubs" exactly once) and at least 7 cells (Pos, then P, W, D, L, GD, Pts);
- Pos 1 to 8;
- whole numbers, with GD matching `^(\+[1-9]\d*|0|-[1-9]\d*)$`;
- on every row, W + D + L = P and Pts = 3 × W + D;
- Pts never increasing down the table, and GD never increasing between rows with equal Pts;
- "Table" at 44px or taller;
- no sideways scroll.

1. **New game before any match** (`?seed=31`, 1st club; "Squad", "Tactics", "Starting XI", "Play match" still there). Every row reads 0 in P, W, D, L, GD and Pts, and the rows are in A to Z (code-point) order. "Back" (44px) returns to the club home with its heading focused, and Tactics still has "4-4-2" checked.
2. **After the first "Play match"** (`?seed=31` 1st club, `?seed=abc` 6th, `?seed=7` 4th; `test.slow()`).
   - Every row has P 1.
   - Total W equals total L, total D is even, and the GDs add up to 0.
   - The player's row agrees with the score line (W, D, L, GD and Pts), and the opponent named in the score line has the mirror row.
3. **The result is kept** (`?seed=7`, 3rd club). The test plays, reads the table, chooses 4-3-3, puts a bench forward into the last FW slot, then visits Squad. The table is identical; Tactics still has 4-3-3 and the Starting XI is unchanged. The table is identical again after that.
4. **Determinism.** `?seed=abc` twice and no seed (8th club, after its first match) give identical tables.

Not pinned, by design:
- the re-show on a second "Play match" (D2 and D18, a rule of this version only);
- the goals-scored and club-name tie-breaks after matches (this version only; unit and acceptance tests);
- the highlight of the player's row (visual only);
- the "New game clears results" reset (unreachable in the UI; a unit-level invariant).

All 4 fail on the current app (no "Table" button). The plan run checked that they can be met: against a throwaway prototype (not committed), all 8 S-006 and S-007 protected scenarios passed. That prototype recorded matchday 1 on the first "Play match" and had a native `<table aria-labelledby>` with `th scope="col"`, `th scope="row"` and `td`. It confirmed that Chromium exposes the columnheader, rowheader and cell roles as ADR-0013 expects. No faulty variants were run in this plan run.

## Wave: DISTILL

Unattended. Language: TypeScript; runners: vitest + fast-check (`FC_SEED` honoured through `tests/setup/fast-check-seed.ts`) and Playwright (Pixel 7, 390px); package manager pnpm. No Gherkin runner exists, so scenarios are `describe/it` blocks whose titles read Given/When/Then in domain language, with `@tags` and `@contract-shape:<pure-function|bounded-change|unbounded-preservation>` in every title and a `CONTRACT_SHAPE` + outcome-anchor header, as in S-003..S-006 (`standings`, `formatGoalDifference`, `playMatchday`, `matchFor`, `standingsOf` and `focusPlan` are `pure-function`; `update` navigation, recording and the e2e specs are `bounded-change`; `main.ts` is `unbounded-preservation` per DESIGN D17 and is covered by the unchanged S-001..S-006 e2e suites plus the journey test E14, with no separate tag). Wave-decision reconciliation: DISCUSS, DESIGN and DEVOPS read, 0 contradictions (D12 and the DEVOPS coexistence matrix already name the S-005/S-006 amendments that U-1 and U-2 confirm with exact lines). The test sources were not derived from `tests/protected/` (not opened). Open for the orchestrator: `distill/upstream-issues.md` U-1 (two existing e2e assertions list exactly four club-home buttons) and U-2 (two existing S-006 `update` cases, and one stale title, supersede by the record), both planned in D12.

### Wave: DISTILL / [REF] Hand-off model: green tree, new-behaviour specs held out until DELIVER (Mandate 7 adapted)
CI forbids committing failing, skipped or `.todo` tests, and test counts may only go up. As in S-004 to S-006:
- **Committed and running now (green regression guards, 4 files, 21 cases):**
  - `tests/acceptance/S-007/existing-navigation-unchanged.test.ts` (7): Squad, a player, Tactics, a formation, Starting XI, a slot, Play match and Back still work for any club and formation; Netherwold Borough's first match is still Matchday 1, 1–2 at seed 31. States are built without naming `table`, `ViewTable` or `results`, and only screen, formation, picks and league are compared, so it compiles and passes before and after DELIVER.
  - `tests/acceptance/S-007/table-inputs-pinned.test.ts` (3): pins the inputs of the golden table: the four seed-31 matchday-1 score lines (1–2, 2–2, 5–1, 1–3), the `?seed=abc` first fixture (0–1) and the seed-31 club order. A generator, schedule or match-model change turns this file red, not the table specs.
  - `tests/acceptance/S-007/names-avoid-table-words.test.ts` (10): DISCUSS D11/D14. No entry of `TOWNS`, `CLUB_SUFFIXES`, `COLOUR_PALETTE`, `FIRST_NAMES`, `SURNAMES` (nor any "First Last" or "Town Suffix" text built from them) contains "Table" or "League table" (case-insensitive substrings); "Table" and "League table" and the twelve existing locator words contain each other in neither direction; the eight column headers are eight distinct names and equal no generated text; "Club" is a part of "Clubs" (why header locators are exact). Passes today, so committed, not held out.
  - `tests/e2e/S-007-club-home-regression.spec.ts` (1): heading is the club name and focused, four or five club-home buttons all 44px or taller, Squad, Starting XI, Tactics and Play match still open and Back returns with the heading focused, a 4-3-3 choice survives, no sideways scroll, no console error; it never names "Table".
  - The renderers-never-move-focus guard is reused: `tests/unit/ui/renderers-never-move-focus.test.ts` scans every file under `src/ui`, so it covers `table.ts`.
  - Net: `ci:test` 685 to 705 tests (+20, 34 files), `ci:e2e` 97 to 98 (+1). `ci:lint`, `ci:typecheck`, `ci:test`, `ci:e2e` green on the committed tree.
- **Held out, complete and verified:** four executable specs stored as `docs/feature/S-007/distill/pending/{acceptance,e2e}/*.pending` (outside every glob: `vitest include`, `tsc include`, `oxlint .`, Playwright `testDir`). Nothing skipped, weakened or marked todo; they are simply not in the tree yet. 85 vitest cases (standings 31, matchday 8, table-navigation 46) and 16 e2e cases, 1341 lines.
- **Verification done in DISTILL** (`distill/verification-note.md`): a throwaway reference implementation in a scratch git worktree (since removed), written from ADR-0012/0013 only, made all 85 held-out vitest cases and all 16 held-out e2e cases pass (with the four existing assertions of U-1/U-2 amended there: `ci:test` 790 of 790, `ci:e2e` 114 of 114, `ci:typecheck` and `ci:lint` clean), with 26 seeded domain/app faults and 13 UI faults caught (the one survivor class is the documented `display` override, U-3). In the real repo the same files are lint-clean and fail only for missing modules and symbols (RED for missing functionality).
- **No scaffold stubs in `src/`:** a throwing stub would turn the committed run red. The scaffold equivalent is the `.pending` files plus the exact-symbol list below.
- **DELIVER mechanics:** `git mv` each file to its destination, dropping `.pending`, in the same commit as the code that makes it green. Never edit an assertion to fit the implementation; if one is wrong, record it in `distill/upstream-issues.md`. The seed-31 golden table is an expected value derived from the ADR-0011 results: a mismatch means the code is fixed, never the golden.

### Wave: DISTILL / [REF] Scenario list with tags
Tier A only (production code: real `generateSquad`, `automaticXI`, `fixturesOf`, `playMatch`, `playMatchday`, `update`, `matchFor`, `standingsOf`, `focusPlan`, the built app). Tier B skipped: the journey is a few chained steps and the pure rules and `update` are already explored by fast-check properties over seeds, all 8 clubs, all 3 formations and 40-action runs.

Committed now: R1-R7 `existing-navigation-unchanged` (`@regression @property|@driving_port|@error`, 4 PBT), I1-I3 `table-inputs-pinned` (`@regression @boundary`), W1-W10 `names-avoid-table-words` (`@regression @error|@boundary`), C1 `S-007-club-home-regression.spec.ts` (`@regression`).

Held out (`distill/pending/`):

| # | Scenario (title in the file) | File | Tags | Kind |
|---|---|---|---|---|
| S1 | Seed-31 league and its four results: Tarnbeck Borough first on +4, Netherwold Borough sixth on -1 (whole `StandingRow`s incl. goals for/against) | `standings.test.ts` | `@walking_skeleton @driving_port` | golden |
| S2 | Level pair Fennimore Town / Valebridge Albion: the name decides | same | `@boundary` | example |
| S3 | No match played: all zero, A to Z (seed 31) | same | `@driving_port @boundary` | example |
| S4 | Any seed, no match: code-point name order, each club once | same | `@property @boundary` | PBT |
| S5 | Points beat GD; GD beats goals scored; goals scored beat the name (High has the later name and loses every lower rule) | same | `@boundary` | example (3) |
| S6 | Name-only full tie, in both list orders; space before letter (Oak Hill / Oakham); prefix (Oak / Oak Hill) | same | `@boundary` | example (3) |
| S7 | Win 3, draw 1, loss 0; a club that played twice | same | `@boundary` | example (2) |
| S8 | Equals an independent tally and sort of the same results, any league | same | `@property @driving_port` | PBT |
| S9 | Row rules W+D+L=P, Pts=3W+D, GD=GF-GA; totals W=L, D even, GD 0, every match counted twice | same | `@property` | PBT (2) |
| S10 | 8 rows, a permutation, Pos 1..8, total order (Pts, GD, GF, name) | same | `@property @boundary` | PBT |
| S11 | Results in any order give the same table; frozen inputs unchanged, repeatable | same | `@property @boundary` | PBT (2) |
| S12 | Club index -1, 8, 1.5, NaN, 100 as home or away: `RangeError` | same | `@error @boundary` | example |
| S13 | GD text table (+4, +1, +12, 0, -0, -1, -4, -12); ASCII U+002D; any whole GD matches `^(\+[1-9]\d*\|0\|-[1-9]\d*)$` and reads back | same | `@boundary @property @error` | example (8) + 1 + PBT |
| S14 | Source has no `localeCompare`/`toLocale`/`Intl`, no `Math.random`/`Date`/`performance.now` | same | `@error @determinism` | grep (2) |
| D1 | Seed 31, all automatic 4-4-2: 1–2, 2–2, 5–1, 1–3 and the three scorers of Sam's match | `matchday.test.ts` | `@walking_skeleton @driving_port` | golden |
| D2 | Seed 20260: first fixture Harrowgate Lane United 0–1 Oakhampton Rise Borough | same | `@driving_port` | golden |
| D3 | Any seed, matchday, formations: 4 entries in fixture order, scheduled clubs, matchday echoed, each result equals `playMatch` | same | `@property @driving_port` | PBT |
| D4 | One club's eleven changes: the three fixtures without it are unchanged | same | `@property @boundary` | PBT |
| D5 | Played twice with frozen sides: deep-equal, no input changed; JSON round trip | same | `@property @boundary` | PBT (2) |
| D6 | Other seed or matchday: other draws | same | `@boundary` | example |
| D7 | Sides not 8 (0, 7, 9) and matchday 0, 15, 1.5, NaN, -1, 100: `RangeError`; matchdays 1 and 14 work | same | `@error @boundary` | example |
| N1 | "Table" from a club home: only the screen changes, no `results` key; any club/formation/picks/record: only screen changes | `table-navigation.test.ts` | `@walking_skeleton @driving_port @property` | example + PBT (2) |
| N2 | "Back" returns to the club home and the whole state is what it was (plain, picks, record) | same | `@walking_skeleton @driving_port` | example |
| N3 | Unknown club: Table and Back are the very same state; Table on 9 other screens, with and without a record; 11 other actions on the table screen | same | `@error @boundary @driving_port` | example (12) |
| N4 | First Play match records exactly the 4 `playMatchday` entries (Sam's current XI, others automatic 4-4-2); any seed/club/formation/picks; only Sam's fixture reads his tactics; the same set whoever is managed | same | `@walking_skeleton @driving_port @property` | example + PBT (3) |
| N5 | The very same array stays after Play again, Back, Table, formation, picks, visits; table and Sam's match unchanged after 4-3-3 + Northcott for Redfern + Squad/Tactics (K3) | same | `@walking_skeleton @driving_port` | example (2) |
| N6 | Tactics changed before the first tap: only Sam's fixture differs; JSON round trip; a never-played state has no `results` key | same | `@boundary` | example (3) |
| N7 | `NewGame` from the title drops the record, the picks and the formation (unit-level invariant, D9); Play match off the club home or on an unknown club is a no-op | same | `@error @boundary` | example (2) |
| N8 | `matchFor`: unknown club `undefined`; Sam's recorded match is entry 0 (1–2); 8 clubs read their own recorded pairing; recorded match survives formation/XI changes; fallback equals the record that playing would make (M5); fallback still the S-006 golden | same | `@walking_skeleton @driving_port @property @error` | example + PBT (6) |
| N9 | `standingsOf`: all zero A to Z; seed-31 golden; same whoever is managed; `?seed=abc` rows; Sam's row = score line, opponent mirror, totals, row rules (any seed, club); seeds 1..100 x 8 clubs (K2); determinism and `?seed=abc` = no seed | same | `@walking_skeleton @driving_port @property @boundary` | example + PBT (7) |
| N10 | Any run of up to 40 taps from the title never throws, once recorded the very same array stays, row rules hold; after playing, any 40 tinkering taps never change the table or his match | same | `@property @error @walking_skeleton` | PBT (2) |
| N11 | `focusPlan`: club home to table and back: heading; any other screen to table: heading; table redrawn: element only for the same club and a non-empty id | same | `@walking_skeleton @driving_port @boundary` | example (3) |
| N12 | The three S-006 cases D12 supersedes, restated with the record (U-2) | same | `@walking_skeleton @driving_port @boundary` | example (3) |
| E1 | Table in 1 tap, h1 focused and 8 rows already there, role structure, zero A to Z table, own row marked, Back in 1 tap | `S-007-table.spec.ts` | `@walking_skeleton @kpi` | e2e |
| E2 | Environment probe: the browser's own accessibility tree holds 1 table, 9 rows, 8 columnheaders, 8 rowheaders, 56 cells, before and after matchday 1 | same | `@environment-probe @boundary` | e2e |
| E3 | Club home: five buttons in the order Squad, Tactics, Starting XI, Play match, Table, all 44px or taller | same | | e2e |
| E4 | The table holds exactly the league's clubs, each once, A to Z (`?seed=31`, `?seed=abc`) | same | `@example @boundary` | e2e (2) |
| E5 | Back: heading focused, Tactics still has 4-3-3 | same | `@boundary` | e2e |
| E6 | Click everything on the table screen: nothing navigates; one button, no link/input/other control | same | `@error @boundary` | e2e |
| E7 | After Play match, Back, Table (2 taps): the seed-31 golden cell for cell (Chromium equals Node), row rules, order, Sam's row = score line, mirror, own row marked | same | `@walking_skeleton @kpi` | e2e |
| E8 | `?seed=abc`: Oakhampton Rise Borough +1 Pts 3, Harrowgate Lane United -1; no seed gives the same table | same | `@example @boundary` | e2e |
| E9 | Same seed in a second fresh page: same table | same | `@boundary` | e2e |
| E10 | Managing Marlbrook Athletic: same table, own row marked | same | `@boundary` | e2e |
| E11 | What is played stays played: 4-3-3 + a real pick + Squad, table unchanged; Play match re-shows the same score line and Goals (this version only) | same | `@walking_skeleton` | e2e |
| E12 | Squad, Tactics and Starting XI visited without change: table unchanged | same | `@boundary` | e2e |
| E13 | No sideways scroll (document and table `scrollWidth`) before and after matchday 1, both pinned seeds | same | `@boundary` | e2e (2) |
| E14 | Whole DoD journey with no console error and no sideways scroll: club home, Table, Back, Play match, Back, Table, 4-3-3, Table, Play match, Back | same | `@walking_skeleton` | e2e |

Counts: 21 committed now (20 vitest: R 7, I 3, W 10; 1 e2e: C1); 85 vitest cases held out (S 31, D 8, N 46) and 16 e2e cases. Error/edge share by title tag (`@error` or `@boundary`): standings 15 of 22 titles, matchday 5 of 8, navigation 21 of 38, e2e 9 of 14, about 60% over the held-out titles. **Waiver (environment):** E1-E14 run on local-preview and on a `BASE_URL` deployment; local-dev is not a supported target (inherited). Viewport is the Pixel 7 profile at 390px from `playwright.config.ts`; "fresh visits" are new pages of the same browser context (nothing is persisted). **Waiver (line budget):** DESIGN budgeted 480 test lines; the held-out and committed tests total about 1600. They are written and verified in DISTILL, not part of DELIVER's authoring; DELIVER's code (about 221 lines per DESIGN) is within budget, and `docs/` is outside the 1200-line PR guard.

### Wave: DISTILL / [REF] WS strategy (Architecture of Reference)
- Driving ports: in-process pure calls (`standings`, `formatGoalDifference`, `playMatchday`, `initialState`, `update`, `matchFor`, `playOpeningMatchday`, `standingsOf`, `focusPlan`) and the built browser app at `http://localhost:4173/gaffer/`. All real; no DI container exists.
- Driven ports: none (no storage, clock or network; the record lives in memory for the page's life). Nothing to fake. The seeded `createRng`/`deriveSeed` are the production ones.
- Walking skeleton: extends the S-001..S-006 skeleton by one branch (club home, Table, Back) and one state change (the first Play match records the matchday). Browser proof: E1, E7, E11, E14. Domain proof: S1 + D1 and N1 + N4 + N5 + N9. Litmus: the title is a user goal (see where my club stands after my first match) and the Then is what Sam reads (the rows, his own row marked, agreeing with his score line).
- Infrastructure policy: as S-003..S-006, no `docs/architecture/atdd-infrastructure-policy.md`; "everything real, nothing faked". Mandate 8 is met by comparing whole `GameState` values (league + screen + formation + xi + results, a closed universe), whole `StandingRow`s and whole `PlayedMatch` arrays, and deep-freeze no-mutation properties (S11, D5, N1-N6, N10).

### Wave: DISTILL / [REF] Adapter coverage table
There are no driven adapters (DESIGN, "Driven ports and adapters": none).

| Adapter | @real-io scenario | Covered by |
|---|---|---|
| (none) | n/a | n/a; the named environment assumptions are probed on the built app: (1) Chromium vs Node determinism of all 4 fixtures by E7, E8, E9, E10 (the browser table equals the Node golden S1/N9) plus the existing grep on `match.ts`; (2) native table roles by E1, E2, E6; (3) 390px fit with the pinned seeds' names by E13; (4) `innerText` = `textContent` and GD text by E1, E7 (`expectStructure`); (5) exactly one `aria-current` row by E1, E7, E8, E10; (6) sort order engine-independence by S6, S14 |

### Wave: DISTILL / [REF] Scaffolds
No `__SCAFFOLD__` stubs are written under `src/` (a throwing stub would turn the committed run red). Symbols DELIVER must export, all used by the held-out tests:
- `src/domain/standings.ts`: `ScoredMatch = { readonly home: number; readonly away: number; readonly result: { readonly homeGoals: number; readonly awayGoals: number } }` (a `PlayedMatch` satisfies it); `StandingRow = { position, clubId, name, played, won, drawn, lost, goalsFor, goalsAgainst, goalDifference, points }` (exactly these 11 keys: S1 compares whole rows with `toEqual`); `standings(clubs: readonly Club[], played: readonly ScoredMatch[]): readonly StandingRow[]` (two parameters; one row per club; order Pts, GD, goals for descending, then name ascending by `<`; `position` 1..8; `RangeError` for a `home` or `away` that is not an index of `clubs`; inputs never mutated; imports only the `Club` type; no `localeCompare`, `toLocale`, `Intl`, `Math.random`, `Date`, `performance.now` in the file, S14 greps the source with comments stripped); `formatGoalDifference(n: number): string` (`+N`, `0` for 0 and -0, `-N` with U+002D).
- `src/domain/match.ts` (extended): `PlayedMatch = { readonly matchday: number; readonly fixtureIndex: number; readonly home: number; readonly away: number; readonly result: MatchResult }` (plain data, JSON round trip); `MatchdayInput = { seed, matchday, sides: readonly MatchSide[] }`; `playMatchday(input): readonly PlayedMatch[]` (one parameter; the 4 fixtures of `fixturesOf(matchday)` in index order, each `result` exactly `playMatch({ seed, matchday, fixtureIndex: k, home: sides[home], away: sides[away] })`; no new stream; `RangeError` when `sides.length` is not 8 and, through `fixturesOf`, for a matchday not an integer 1..14). `playMatch` and every S-006 constant are unchanged.
- `src/app/state.ts` (extended): `GameState.results?: readonly PlayedMatch[] | undefined` (absent key in every never-played state and in `initialState`); `Screen` gains `{ kind: "table"; clubId: string }`; `Action` gains `{ type: "ViewTable" }`; `ViewTable` valid only from `clubHome` of a known club (else the very same state object); `Back` from `table` of a known club goes to `clubHome` (unknown club: same object); `PlayMatch` (valid as before) sets `results` to `state.results ?? playOpeningMatchday(state, clubId)` and nothing else but `screen` changes (a later tap keeps the very same array, `toBe`); `NewGame` from the title also drops `results` (as it drops `xi`); no other action touches `results`; `playOpeningMatchday(state, clubId): readonly PlayedMatch[] | undefined` (`undefined` for an unknown club; the managed club's side is `currentXI(state, squad)`, every other side `automaticXI(squad, "4-4-2")`, then `playMatchday({ seed: league.seed, matchday: OPENING_MATCHDAY, sides })`); `matchFor(state, clubId): MatchView | undefined` reads the recorded matchday-1 entry containing the club when `results` is present, else the same producer's entry, and returns only `{ matchday, home: { club, squad }, away: { club, squad }, result }` (no `xi` or other key: U-5; the `result` is the recorded object itself, `toBe`); `standingsOf(state): readonly StandingRow[]` = `standings(state.league.clubs, state.results ?? [])`; `focusPlan`: `table` is in the same-club group of `sameScreen`.
- UI contract (brief ports 24-28; roles and names only): the club-home button "Table" (exact name, 44px or taller, the fifth after "Squad", "Tactics", "Starting XI" and "Play match", the only five buttons); the table screen has exactly one heading "League table" (focused on arrival, no other heading) and exactly one table named "League table" (`aria-labelledby` the heading): 9 rows, 8 columnheaders reading `Pos, Club, P, W, D, L, GD, Pts` in order, 8 rowheaders (the Club cells), 56 cells (7 per body row, Pos first); every cell's `innerText` equals its `textContent` (no `text-transform`); exactly one body row has `aria-current="true"`, its rowheader the managed club; exactly one button "Back" (44px or taller) and no link, input or other control; clicking any element but "Back" navigates nowhere; all 8 body rows are visible with no waiting when the heading has focus.
- Learned from the scratch run: `oxlint` caps cyclomatic complexity at 15 and `sameScreen` and `back` cross it with a fifth screen kind (U-4: a `sameClub` helper and a set of home-returning kinds fixed it); `max-params` caps at 3, test-side too (U-5 aside, the specs use records and rest tuples); the `main.ts` `table` case must exist in the same commit as the `table` screen kind (the `never` guard); `matchFor` must not leak `xi` into the view; Playwright's role engine and, here, Chromium's accessibility tree both ignore a CSS `display` override on table parts (U-3).

### Wave: DISTILL / [REF] Test placement
`tests/acceptance/S-007/` (vitest, same convention as S-001..S-006), `tests/e2e/S-007-club-home-regression.spec.ts` (committed) and `tests/e2e/S-007-table.spec.ts` (held out; DEVOPS coexistence matrix). Held-out sources live in `docs/feature/S-007/distill/pending/{acceptance,e2e}/` as `*.pending`. Existing tests are untouched. Exactly four existing assertions go red in DELIVER (two e2e, two vitest; plus one stale title), all planned by D12 (see Open points).

### Wave: DISTILL / [REF] Driving port coverage
| Port (brief 24-28) | Scenarios |
|---|---|
| 24 matchday (`playMatchday`, `PlayedMatch`) | D1-D7, N4, N6 |
| 25 standings (`standings`, `formatGoalDifference`) | S1-S14, N9 |
| 26 `update` (`ViewTable`, `Back`, `PlayMatch` recording, `NewGame`), `matchFor`, `standingsOf` | N1-N12, R1-R7 |
| 27 `focusPlan` (extended) | N11, E1, E7, E14 (heading focus), the reused `.focus(` guard |
| 28 UI: "Table", the "League table" screen, "Back" | E1-E14, C1 |
Ports 1-23 are unchanged and covered by S-001..S-006 tests. Driving adapters (CLI/HTTP/hook): none; the browser app is covered by E1-E14.

### Wave: DISTILL / [REF] DEVOPS monitoring-contract trace
| Contract row | Scenario |
|---|---|
| K1: 1 tap to the table, 8 rows on arrival, 2 taps from the match, 1 tap back | E1 and E7 (pointerdown counter, snapshot taken in the same evaluate as the focus check, no wait) |
| K2: row rules and Sam's row = score line, opponent mirror, 100% over seeds x 8 clubs | S8-S10, N9 (PBT and seeds 1..100 x 8), E7, E8 |
| K3: 0 changes over 40 taps after playing | N5, N10 (second property), E11, E12 |
| Standings rules and tie-breaks (D4, D8) | S2-S7, S10, S14 |
| GD format (D9) | S13, E1/E7 cell text |
| Table structure (D10) | E1, E2, E6, E7 (role counts, exact column headers in order, `innerText` = `textContent`) |
| Highlight (D7, D11) | E1, E7, E8, E10 (exactly one `aria-current` row) |
| Recording (ADR-0012) | D1-D7, N4-N7 |
| S-006 goldens unchanged | I1-I3, R5, N8 (fallback golden), D1/D2, the S-006 suites |
| Navigation and no-ops (D13) | N1-N3, N7, N11 |
| Names avoid table words (D11) | W1-W10 |
| 44px tap targets | E1, E3, C1 |
| No horizontal scroll at 390px | E1, E13, E14, C1 |
| No console errors | E1, E7, E11, E14, C1 |
| S-001..S-006 unchanged | R1-R7, C1, the S-001..S-006 suites (see Open points for the amended assertions) |
| Domain test strength (Stryker) | S1-S13 (goldens, each tie-break, oracle equality), D1-D7 (per-fixture equality, independence, RangeError), N1-N10 (same-object no-ops, record contents, NewGame, same-array, fallback equivalence) |

### Wave: DISTILL / [REF] DELIVER step plan (which files to add, and when)
1. **Step 01, standings**: implement `src/domain/standings.ts` per ADR-0013 (`standings`, `formatGoalDifference`, `ScoredMatch`, `StandingRow`). First run the committed guards and see them green. `git mv docs/feature/S-007/distill/pending/acceptance/standings.test.ts.pending tests/acceptance/S-007/standings.test.ts`; confirm RED for the missing module before coding, then GREEN. Gates: `ci:lint`, `ci:typecheck`, `ci:test`.
2. **Step 02, matchday**: add `PlayedMatch`, `MatchdayInput` and `playMatchday` to `src/domain/match.ts` per ADR-0012. In the same commit `git mv` `matchday.test.ts.pending` to `tests/acceptance/S-007/matchday.test.ts`.
3. **Step 03, state, record, table screen and shell** (one commit, so the tree is never red; the `never` guard in `main.ts` forces the renderer and the `table` render case into this commit): `results`, `table` screen, `ViewTable`, recording in `PlayMatch`, `NewGame` reset, `Back` and `sameScreen` cases, `playOpeningMatchday`, `matchFor` reading the record, `standingsOf` in `src/app/state.ts` (mind U-4); `src/ui/screens/table.ts` (`renderTable`, `dispatch` typed `(action: Extract<Action, { type: "Back" }>) => void`) and the `main.ts` `table` case. In the same commit `git mv` `table-navigation.test.ts.pending` to `tests/acceptance/S-007/table-navigation.test.ts` and replace the three superseded S-006 cases (U-2). The "Table" button is not added yet, so no user can reach the screen and no existing e2e changes.
4. **Step 04, button, CSS, e2e** (one commit): the fifth club-home button "Table" in `div.club-actions`, the table CSS and `--highlight` token (no `display` on a table part, no `text-transform`, the Club cell wraps; keep 1rem/0.85rem only if the 390px probe passes), `docs/product/ui/design-system.md` table pattern. In the same commit `git mv` `e2e/S-007-table.spec.ts.pending` to `tests/e2e/S-007-table.spec.ts` and apply the two e2e edits of U-1. `ci:e2e`, the three club-home regression specs and `tests/protected/S-001..S-007` must pass.
5. Delete `docs/feature/S-007/distill/pending/` once all four files are moved; zero `.pending` files is the DISTILL-to-DELIVER completion check.

### Wave: DISTILL / [REF] Pre-requisites
DESIGN: ADR-0012, ADR-0013, ADR-0010, ADR-0011, ADR-0008, ADR-0009 and brief ports 24-28 (read). DEVOPS: local-preview `http://localhost:4173/gaffer/` via `ci:serve`, Pixel 7 at 390px, `FC_SEED` per CI run (the fast-check properties honour it; the seeds 1..100 x 8 loop is fixed), `BASE_URL` for post-deploy smoke (the e2e uses `?seed=`, roles and names only, so it holds on Pages). The CDP accessibility probe (E2) needs Chromium, which is the only project. No new dependency, no `.github/`, `stryker.config.mjs` or other locked-path change.

### Wave: DISTILL / [REF] Mandate checks (adapted)
- CM-A: tests import only `standings`, `formatGoalDifference`, `playMatchday`, `playMatch`, `fixturesOf`, `automaticXI`, `generateSquad`, `generateLeague`, `parseSeed`, `initialState`, `update`, `currentXI`, `squadOf`, `matchFor`, `playOpeningMatchday`, `standingsOf`, `focusPlan`; UI tests enter through the built app by role and name (plus in-page snapshots of focus, visible rows and `innerText`, which are the shapes being specified). CM-B: titles use domain terms (table, row, points, goal difference, Back, record, matchday). CM-D: pure rules are tested against independent expected data (the DISCUSS golden written out, an independent per-club tally-and-sort oracle in S8, hand-built tie-break pairs where the higher club loses every lower rule, a recomputed expected record in N4) and the e2e reads expected names from the "Clubs" list. CM-F: PBT only in layer 1-2 files; e2e is example-only with named sad paths (E6 click-everything, E9 repeat, E13 widths). Mandate-12 domain types/DSL and step-reuse-ratio do not apply: there are no Gherkin steps; e2e helpers (`openClubHome`, `openTable`, `readTable`, `playBackTable`) hold no business logic beyond the expected tables written out in the file.
- Open points for DELIVER: (1) **U-1**: `tests/e2e/S-005-starting-xi.spec.ts:173-177` and `tests/e2e/S-006-match.spec.ts:145-149` list exactly four club-home buttons; D17 makes five, so both lists gain "Table" in step 04 (stricter, planned by D12). (2) **U-2**: two S-006 `match-navigation.test.ts` cases fail on the record and a third carries a stale title; replaced in step 03 by the restated cases already in `table-navigation.test.ts`. (3) **U-3**: no test can detect a `display` override on a table part in this Chromium; the CSS rule is a review item. (4) **U-4**: `sameScreen` and `back` cross oxlint's complexity limit with a fifth kind. (5) Held-out E11 and N5 use the S-006 golden pick (Kestrel Northcott for Calder Redfern in 4-3-3: slot 7, squad row 13).

### Wave: DISTILL / [REF] Reviewer outcome
The Final Wave Review Gate (four Haiku reviewers) was not dispatched in this unattended hand-off; it is left to the orchestrator. Self-review against the checklist: every driving port 24-28 has a scenario; every DEVOPS monitoring row is traced; no adapter exists; no committed test fails or is skipped; no existing test was edited; held-out specs verified green against a reference and RED for missing functionality without it.

## Wave: DELIVER

### Wave: DELIVER / [REF] Implementation summary
The first "Play match" tap now records all four matchday-1 results (Sam's side = his current XI, every other side its automatic 4-4-2) in optional `GameState.results`; later taps keep the same array and `NewGame` drops it. A new "Table" button (fifth on the club home) opens a table screen: native `<table>` named by its heading, 8 rows ordered by Pts, GD, goals for, then name, Sam's row `aria-current`, one "Back" button. The match screen and the table read the same record (`matchFor`, `standingsOf`), so tactics, XI and visit taps never change either. Pure `standings`/`formatGoalDifference` (ADR-0013) and `playMatchday` (ADR-0012); no new RNG stream.

### Wave: DELIVER / [REF] Files modified
- New: `src/domain/standings.ts`, `src/ui/screens/table.ts`.
- Changed: `src/domain/match.ts` (`playMatchday`, `PlayedMatch`), `src/app/state.ts` (results, `ViewTable`, `playOpeningMatchday`, `standingsOf`, `matchFor` reads the record, `sameClub` refactor), `src/main.ts` (table case), `src/ui/screens/club-home.ts` (Table button), `src/ui/styles.css`, `docs/product/ui/design-system.md`.
- Tests moved from `distill/pending/` (D12 amendments, nothing weakened): `tests/acceptance/S-007/{standings,matchday,table-navigation}.test.ts`, `tests/e2e/S-007-table.spec.ts`. Superseded assertions replaced by stricter equivalents: three cases in `tests/acceptance/S-006/match-navigation.test.ts` (U-2) and the club-home button list in `tests/e2e/S-005-starting-xi.spec.ts` and `S-006-match.spec.ts` (now five names in order).
- Commits: 6310cef (01-01), 28d301d (02-01), 421391b (03-01), 9c60535 (04-01), 2d9f951 (refactor pass).

### Wave: DELIVER / [REF] Scenarios green
Roadmap steps 01-01, 02-01, 03-01, 04-01 all complete (RED, GREEN, COMMIT logged for each in `deliver/execution-log.json`). Verified at finalize: `ci:test` 790 passed, `ci:e2e` 114 passed (phone viewport, includes `S-007-table.spec.ts` and `S-007-club-home-regression.spec.ts`). `tests/protected/S-007/` runs in CI against the built site; the S-001..S-006 suites are unchanged.

### Wave: DELIVER / [REF] DoD check
- Unit, property and acceptance tests for standings, recording and navigation: met. Seed-31 golden table pinned: met.
- e2e journey with focus on each heading, no sideways scroll, no console errors: met.
- No ambient randomness or wall-clock time in `src/domain/`, no new RNG stream: met.
- ADR-0012 and ADR-0013 accepted; design-system gains the table pattern and highlighted-row token: met.
- Protected scenarios: S-007 is verified by CI on main (not run locally).
- Change-size budget (under 1100 changed lines including tests): not met strictly. The branch diff against main is about 1800 lines, of which 1616 are test lines (the DISTILL-authored specs); production code is about 280 lines.

### Wave: DELIVER / [REF] Quality gates
`ci:lint`, `ci:typecheck`, `ci:test`, `ci:build`, `ci:e2e` all exit 0 at finalize. Mutation testing is nightly-delta; `/nw-deliver` Phase 5 skipped. Early execution-log COMMIT timestamps for steps are seconds apart from GREEN (as in S-005 and S-006), so RED evidence is thin.

### Wave: DELIVER / [REF] Reviewer disposition
The implementation reviewer approved the production code. Its test-budget and test-deletion findings B1, B3 and H1 are declined: CI forbids deleting or weakening tests, so trimming the DISTILL specs to fit the line budget is not available. The budget overrun above is recorded as accepted.
