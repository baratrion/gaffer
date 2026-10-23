# S-007: See the league table after my first match

## Wave: DISCUSS

Lean, unattended, revision 1 (after `nw-product-owner-reviewer` cycle 1, see Peer review). Reuses `discuss/journey.md` and `slices/slice-01..02`. Toward the north star (manage a club through a season: pick team, play match, see table), S-006 shipped "play match"; the smallest next visible increment is "see table" after matchday 1. scope.md IN says: "Season: double round-robin (14 matchdays); other matches are simulated; league table." Narrowed by scope.md precedence (ship less): only matchday 1. Matchday 2 and later, a results list of the other fixtures, persistence, commentary and stats are later stories. Feature type: user-facing. UX depth: lightweight. Walking skeleton: no (brownfield, extends S-001..S-006). JTBD: yes, new job J-07. No DIVERGE artifact (accepted as lean, as for S-002..S-006).

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
- **Table row**: Pos (a cell), Club (the row header), then P (played), W (won), D (drawn), L (lost), GD (goal difference = goals scored minus goals against), Pts (points = 3 per win, 1 per draw), each a cell: 7 cells and 1 row header.
- **Goals scored** (GF): a tie-break that is not shown (D4).
- **Mirror row**: the opponent's row after one match: W and L swapped, D the same, GD negated.
- **Screen title**: the screen's only top-level heading (h1), focused on arrival.
- **Untouched tactics**: a new game in which Sam has not chosen another formation nor picked a player (S-006 glossary).
- **Club index**, **Fixture**, **Matchday**, **Score line**: as in S-006.

### Wave: DISCUSS / [REF] Locked decisions
- D1 Playing records the matchday: the first "Play match" of a new game plays matchday 1 for the whole league. Sam's fixture uses his formation and current Starting XI (exactly as S-006); the other 3 fixtures are simulated with both clubs' automatic XI in 4-4-2 (the S-006 opponent rule). The 4 results are recorded in session state at that moment. This supersedes S-006 D8 ("not recorded") and ADR-0011 section 5 (option 5A, "nothing is stored"); DESIGN must record that in an accepted ADR-0012 before DELIVER.
- D2 Single source and re-show: after the first "Play match", both the match screen and the table read only the recorded results; the S-006 on-demand derivation (`matchFor` style) is used only to produce the recording. Changing the formation or the Starting XI afterwards never changes the recorded results, the table or the match screen. In this version a second "Play match" re-shows the same recorded matchday-1 match (screen title "Matchday 1", same score line and "Goals" list), whatever formation or XI was chosen in between. Later versions may move on to the next matchday instead, so this is not in the durable clause.
- D3 Entry: the club home gains a fifth button named exactly "Table" (44px or taller), stacked after "Play match". The heading (club name) and the other four buttons stay. The order is a layout decision, not part of the durable outcome (S-006 L-2 precedent).
- D4 Table screen: its screen title (only h1) is "League table", focused on arrival. A table (ARIA role table) named "League table" has exactly one header row whose column headers read exactly, in order: "Pos", "Club", "P", "W", "D", "L", "GD", "Pts", and exactly 8 body rows, one per club of the "Clubs" list, each club exactly once. Each body row has, in order: Pos (a cell), Club (the row header, role rowheader), then P, W, D, L, GD and Pts (cells): 7 cells and 1 row header. Pos = 1..8 matching row order (no shared positions); Club = the club's name; P, W, D, L, Pts = whole numbers; GD = "+N" when positive, "0" when zero, "-N" (ASCII hyphen-minus U+002D) when negative. Every row: W + D + L = P and Pts = 3×W + D. Order: Pts high→low, then GD high→low, then goals scored high→low, then club name A→Z. A→Z means code-point order: a space sorts before any letter, and club names are letters and spaces only. Goals scored is not shown (GF/GA columns are OUT to fit 390px), so the goals-scored tie-break is checked only by unit and acceptance tests. Black-box checks cover only that Pts never increases down the table and, between rows with equal Pts, GD never increases, plus the A→Z order of the all-zero table (D5).
- D5 New game: before Sam plays matchday 1, every row reads P 0, W 0, D 0, L 0, GD 0, Pts 0, and the rows are in A→Z order of club name.
- D6 After matchday 1 ("Play match", "Back", "Table"): every row has P = 1; total W = total L; total D is even; total GD = 0. Sam's row agrees with his match screen's score line (win: W 1, Pts 3; draw: D 1, Pts 1; loss: L 1, Pts 0; GD = his goals minus the opponent's goals) and the opponent's row is its mirror.
- D7 Sam's own row is highlighted visually (a design token; not black-box tested). DESIGN may choose the markup; it must not change any cell's text or the row's accessible structure.
- D8 Back: a button named exactly "Back" (44px or taller) returns to the club home with focus on its h1, the club's name; formation and XI unchanged.
- D9 Determinism and lifetime: the recorded results are pure functions of the seed, the fixtures and both sides (ADR-0011 streams; no new stream). Two fresh visits with the same "?seed=" and club, without changing formation or XI, show the identical table after matchday 1; "?seed=abc" equals no "?seed=" in the address. The table is kept until the page is reloaded or "New game" is tapped: visiting "Squad", "Tactics" or "Starting XI" and coming back leaves it unchanged. "New game" starts from the all-zero table. No persistence: a reload shows the title screen.
- D10 Phone first and regression: no horizontal scroll at 390px (8 narrow columns; long club names wrap in their cell), every button 44px or taller, no console errors, generated text through `el()`/`textContent` only (ADR-0002), renderers never move focus (ADR-0008). Every S-001..S-006 behaviour is unchanged, including S-006's "Matchday 1" first match of a new game and its durable contract (S-006 D14).
- D11 Accessible names: "Table" and "League table" appear (case-insensitive substrings) in no string array of `src/domain/names.ts`, nor in any generated name (checked by grep today: none). "Table" contains none of the existing locator words ("Squad", "Tactics", "Starting", "Players", "Back", "Clubs", "Choose", "Formation", "Line-up", "Play match", "Goals", "Matchday"). Column headers are matched by role columnheader, so "Club" does not clash with the list "Clubs". DISTILL adds a unit check, as S-006 D11.
- D12 Superseded non-protected assertions (DELIVER amends them; none are weakened, each is replaced by the S-007 rule): the exact four-button club-home lists in `tests/e2e/S-005-starting-xi.spec.ts` and `tests/e2e/S-006-match.spec.ts` gain "Table"; the S-006 `match-navigation.test.ts` cases asserting "Play match changes nothing but the screen", "Play match, Back restores the whole state" and "nothing is recorded, so the match is replayed" are restated with the recorded results (screen and results change; formation and XI never). `tests/protected/` is untouched.
- D13 Deferred candidates (not planned here; the plan run may queue them): matchday 2..14 and advancing the matchday; a results list of the other fixtures; GF/GA or form columns (after "Pts" only, D14); save and continue; end-of-season position.
- D14 Durability: in later versions the first 8 columns stay, in this order, with these formats and row rules; later versions may only add columns after "Pts". In this version there are exactly 8.
- UX depth: no mockups beyond the journey table.

### Wave: DISCUSS / [REF] Story map and priority
Backbone: pick club, club home, squad, player, tactics, starting XI, play match, **see table** (open table, read standing, back), (next: later matchdays, other results, save, end of season). Walking skeleton: the existing S-001..S-006 path plus one branch from the club home (club home, table, back). One release, two thin slices, both in the one S-007 DELIVER:
1. `slices/slice-01-table-before-kickoff.md` (US-1): the "Table" button, the standings function, the table screen with the all-zero A→Z table, and Back. Value 4 x urgency 5 / effort 2 = 10. It comes first: it proves the table fits 390px and is reachable by role and name, with no state change.
2. `slices/slice-02-table-after-matchday-1.md` (US-2): "Play match" records the 4 matchday-1 results; the table and the match screen read them; results kept; "New game" resets. 5 x 5 / 1.5 = 16.7, but it depends on slice 01. It is the consequence that closes the loop.
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
  And its 8 body rows have Pos 1 to 8 and the row headers "Fennimore Town", "Juniper Hollow United", "Marlbrook Athletic", "Netherwold Borough", "Oakhampton Rise Borough", "Rushmoor Heath Albion", "Tarnbeck Borough", "Valebridge Albion", in that order
  And in every body row the cells P, W, D, L, GD and Pts each read "0"

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
  And "<club>"'s row matches the score line: a win W 1 and Pts 3, a draw D 1 and Pts 1, a loss L 1 and Pts 0, GD its goals minus the other club's written "+N", "0" or "-N"
  And the other club of the score line has the mirror row
  And Pts never increases down the table, and between rows with equal Pts GD never increases
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
Property-test notes (row rules, not separate black-box steps): on every row W + D + L = P and Pts = 3 × W + D; total W = total L; total D is even; total GD = 0. The protected scenarios may also check them; unit and property tests must. Also checked by the e2e: the seed-31 golden table of example 1 (cross-engine probe); no sideways scroll and no console errors.

**Outcome KPI:** K2, K3 (below).
**Technical notes (for DESIGN, not AC):** the first "Play match" of a new game records the 4 results of `fixturesOf(1)` (each via `playMatch` with ADR-0011's stream for its fixture index; no new stream). After that, the match screen and the table read only the recorded results (D2); the on-demand derivation only produces the recording. DESIGN may choose how the results are stored; whole-state assertions in S-001..S-005 on states that never played must stay valid, and "New game" clears the results. Standings are derived from the recorded results on render (ADR-0005 (d) pattern). Expected ADR-0012: recording the matchday's results (supersedes ADR-0011 section 5 and S-006 D8), the standings order and the GD format. Depends on US-1.

Notes for DESIGN and DISTILL (not part of the AC):
- "Has focus" means `document.activeElement` is the `<h1>`.
- Rows are read by role: the table named "League table" (exact), then `row` (9 rows: 1 header, 8 body), `columnheader`, `rowheader` (the Club cell) and `cell` (the other 7).
- Goals scored as a tie-break, the GD format for every sign, and "the same table whoever is managed under untouched tactics" are unit and property tests on standings and state (fast-check honours `FC_SEED`), not protected (D4).
- "New game" reset and the no-ops (table action off a known club's home, `Back` with an unknown club) are unit tests on `update`.
- The re-show on a second "Play match" (D2) holds in this version only. If the plan run pins it in `tests/protected/S-007/`, a later matchday-2 story would have to keep it; the orchestrator should decide whether that Then stays e2e and unit-level.
- DISTILL hand-off: locators use `exact: true` for "Table", "Back", the heading and the table "League table", and each column header.
- Adding "Table" must keep `tests/protected/S-001..S-006` green: they find buttons by name and do not count club home buttons.

### Wave: DISCUSS / [REF] Outcome KPIs
| # | Who | Does what | By how much (target) | Baseline | Measured by |
|---|---|---|---|---|---|
| K1 | Sam on a 390px phone | Reads where his club stands, from the club home | 1 tap ("Table") from the club home, 2 taps from the match screen ("Back", "Table"); all 8 rows shown on arrival; back home in 1 tap | not possible (no table) | e2e click counter (as S-003..S-006) |
| K2 | Sam | Trusts that the table matches the results | 100% of rows satisfy W + D + L = P and Pts = 3W + D; his row matches his score line and the opponent's mirrors it in 100% of cases; 0 mismatches over seeds 1..1000 x 8 managed clubs | not possible | property tests (`ci:test`, fresh `FC_SEED`) and the protected scenarios |
| K3 | Sam | Tinkers with his team after the match without losing the result | 0 changes to the table or the re-shown match over any run of up to 40 formation, pick and navigation taps after playing | not possible | property test on `update` plus the standings selector |

Guardrails: S-001..S-006 protected scenarios stay green; league, squads, automatic XIs and the S-006 first match unchanged for every seed; no sideways scroll at 390px and 0 console errors on the club home and table screens. Environments as in the DEVOPS environment matrix (`docs/feature/S-004/environments.yaml`): local-preview `http://localhost:4173/gaffer/` (`ci:serve`) for e2e and protected scenarios, and the production Pages URL for the post-deploy smoke, both on Chromium with the Pixel 7 profile at 390px. There is no analytics in the POC; the e2e tap count and the property tests are the only measurements.

### Wave: DISCUSS / [REF] DoD
- `tests/protected/S-007/` passes on main; `tests/protected/S-001/` to `S-006/` still pass.
- Unit and property tests pass for standings (row rules, order with every tie-break, GD format, empty list), recording (4 results at the tap, single source for match screen and table, kept after formation and XI changes, reset by "New game") and navigation (no-ops). The D11 names check passes. The `ci:*` scripts are green.
- The e2e phone-viewport smoke (local-preview and the post-deploy smoke) covers: club home, "Table" (all zero), "Back", "Play match", "Back", "Table" (P 1, Sam's row highlighted), a formation change, "Table" unchanged, "Play match" re-shown unchanged, "Back"; focus on each new heading.
- The seed-31 golden table (US-2 example 1) is pinned as a regression lock.
- The D12 amendments replace, never weaken, the superseded S-005/S-006 non-protected assertions; no other S-001..S-006 acceptance assertion is edited.
- No ambient randomness or wall-clock time in `src/domain/`; no new RNG stream.
- ADR-0012 (recording, superseding ADR-0011 section 5 and S-006 D8) is accepted; `docs/product/ui/design-system.md` gains the table pattern and the highlighted-row token.
- No sideways scroll at 390px and 0 console errors on every screen of the journey.
- The DELIVER change stays under 1100 changed lines including tests (640 budgeted; 780 with the plan run's protected scenarios).

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
- ADR-0001..0011 accepted. DESIGN must record an accepted ADR-0012 before DELIVER: recording the matchday-1 results in session state, superseding ADR-0011 section 5 (D8, "nothing is stored") and S-006 D8; plus the standings order and the GD format.
- `docs/product/jobs.yaml` now has J-07 (resolved). Roadmap entry S-007 to be appended by the orchestrator from the draft below.
- D12 lists the non-protected S-005/S-006 assertions DELIVER amends.
- Open item for DESIGN: column widths at 390px (8 columns, the club cell wrapping) and the highlighted-row token.

### Wave: DISCUSS / [REF] Roadmap outcome (draft)
From the club home screen the player taps a button named exactly "Table" (44px or taller; the club home's heading is still the club's name and its "Squad", "Tactics", "Starting XI" and "Play match" buttons stay) and sees the league table screen: its screen title, the only top-level heading (h1), is "League table", focused on arrival. A table (role table) named "League table" has exactly one header row, whose column headers read exactly, in this order, "Pos", "Club", "P", "W", "D", "L", "GD" and "Pts", and exactly 8 body rows, one per club of the "Clubs" list, each club exactly once. Each body row has, in this order, Pos (a cell), Club (the row header, role rowheader) and then P, W, D, L, GD and Pts (cells): 7 cells and 1 row header. Pos is the row's position, 1 to 8 down the table, with no shared positions; Club is the club's name; P (played), W (won), D (drawn), L (lost) and Pts (points) are whole numbers; GD (goal difference) reads "+N" when positive, "0" when zero and "-N" with an ASCII hyphen-minus when negative, for example "+4", "0" and "-1". On every row W + D + L = P and Pts = 3 × W + D. Rows are ordered by Pts from high to low, then GD from high to low, then goals scored from high to low, then club name from A to Z, where A to Z is code-point order (a space sorts before any letter; club names are letters and spaces only). Goals scored is not shown, so that tie-break is checked only by unit and acceptance tests; on the screen, Pts never increases down the table and, between rows with equal Pts, GD never increases. The player's club's row is highlighted (visual only; not black-box tested). In a new game (from "New game" on the title screen), before the player has played a match, every row reads P 0, W 0, D 0, L 0, GD 0 and Pts 0, and the rows are in A to Z order of club name. The first "Play match" of a new game plays matchday 1 for the whole league: the player's fixture exactly as before, and the league's 3 other matchday-1 fixtures are simulated, and the 4 results are recorded at that moment; from then on the match screen and the table read only those recorded results. After "Play match", "Back" and "Table", every row has P 1, the total of W equals the total of L, the total of D is even and the GDs add up to 0; the player's club's row agrees with the score line of its match screen (a win reads W 1 and Pts 3, a draw D 1 and Pts 1, a loss L 1 and Pts 0, and GD is the club's goals minus the other club's goals) and the other club of that score line has the mirror row (W and L swapped, the same D, GD negated). Recorded results are kept: changing the formation in Tactics or the Starting XI afterwards does not change the table, and visiting "Squad", "Tactics" or "Starting XI" and coming back leaves it unchanged until the page is reloaded or "New game" is tapped. In this version a second "Play match" re-shows the same recorded matchday-1 match (the same score line and "Goals" list), whatever formation or Starting XI was chosen in between; later versions may move on to the next matchday instead. The table comes from the seed: two fresh visits with the same "?seed=" and the same club, without changing the formation or the Starting XI, show the identical table after matchday 1, and "?seed=abc" shows the same table as no "?seed=" in the address. A button named exactly "Back" (44px or taller) returns to the club home with focus on its heading, the club's name, and the formation in Tactics and the Starting XI are unchanged. The first match of a new game still reads "Matchday 1" as before. These hold in every later version of the game: the "Table" button on the club home; the screen title "League table"; the table named "League table" whose first 8 columns stay in this order with these formats and row rules, and the order of its rows (later versions may only add columns after "Pts"; in this version there are exactly 8); the all-zero, A to Z table of a new game before its first match; and "Back" to the club home. No horizontal scroll at 390px and no console errors.

### Wave: DISCUSS / [REF] DoR validation
| # | Item | Status | Evidence |
|---|---|---|---|
| 1 | Problem clear, domain language | PASS | US-1: no picture of the league or his rivals; US-2: a 1–2 defeat means nothing without a table that includes the other matches and does not move when he tinkers |
| 2 | Persona specific | PASS | Sam, 34, one-handed on a bus, 390px Android, 5 minutes, has just played matchday 1 |
| 3 | 3+ domain examples, real data | PASS | Real generator and ADR-0011 values: the seed-31 league (8 real names, A→Z), its full matchday-1 table including a Pts/GD/goals-scored tie broken A→Z; `?seed=abc` Oakhampton Rise Borough v Harrowgate Lane United; the S-006 golden pick "Kestrel Northcott 6" for "MF Calder Redfern 15" in 4-3-3 after playing. 3 examples per story |
| 4 | UAT Given/When/Then, 3-7 | PASS | Counted per roadmap story, an outline counts as one: 6 for S-007 (US-1 3, one outline; US-2 3, two outlines); one assertion per Then/And step; row-rule arithmetic in property-test notes |
| 5 | AC derived from UAT | PASS | Embedded scenarios are the AC: D2-D6, D8, D9 and D10 by scenario; D1 recording via "What is played stays played" and unit tests; D4 goals-scored tie-break, D7 highlight, D11 and D12 by unit tests, e2e and review (Notes) |
| 6 | Right-sized | PASS | 2 slices in about 1.5 days; DELIVER 640 of at most 1100 changed lines including tests (780 with the plan run's 140 protected lines); 6 scenarios; one outcome |
| 7 | Technical notes | PASS | Labelled per story: pure standings, required table semantics only (markup is DESIGN's choice), single source after the first "Play match", no new stream, standings derived on render |
| 8 | Dependencies tracked | PASS | Tracked; DESIGN must record an accepted ADR-0012 that supersedes ADR-0011 section 5 (D8, "nothing is stored") and S-006 D8 before DELIVER. S-001..S-006 delivered; D12 amendments listed; D13 deferred candidates; open layout item |
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
