# S-008: Play the season, one matchday at a time

## Wave: DISCUSS

Lean, unattended, revision 1. Reuses `discuss/journey.md` and `slices/slice-01-next-matchday.md`. Toward the north star (manage one fictional club through one short season, start to finish), S-006 shipped "play match" and S-007 "see table", both for matchday 1 only. The smallest next visible increment is the season itself: each "Play match" plays the next matchday, and the table counts them all. scope.md IN says: "Season: double round-robin (14 matchdays); other matches are simulated; league table." Narrowed by scope.md precedence (ship less): only "play the next matchday" and "the table reads the whole record". The end-of-season screen, a results or fixtures list, a "next opponent" line, commentary, stats, save and continue, AI formations for other clubs, fatigue and tie-break changes are later stories. Feature type: user-facing. UX depth: lightweight. Walking skeleton: no (brownfield, extends S-001..S-007). JTBD: yes, new job J-08. No DIVERGE artifact (accepted as lean, as for S-002..S-007).

### Wave: DISCUSS / [REF] Scope Assessment
PASS: 2 small user stories with 7 scenarios in total (4, 3), 1 roadmap story and one demonstrable outcome ("each tap plays the next match, the table follows the season"). No new bounded context: the schedule (ADR-0010), the match model and its 56 streams (ADR-0011), `playMatchday` and the append-only `results` list (ADR-0012) and the standings (ADR-0013) already cover 14 matchdays. The change is in the app layer: which matchday "Play match" plays, and which recorded match the match screen shows. One carpaccio slice, one release, about 1 day. Integration points: schedule, `playMatchday`, recorded results, standings, `currentXI`: 5, at the limit, not over it. No oversized signal: end of season, results list, persistence and opponent tactics are cut (D12).

Line budget (changed lines, code plus tests; file names are indicative, DESIGN names the files). The e2e covers only what the protected scenarios do not: focus on each heading, 44px, the seed-31 goldens of matchdays 2 and 14, the after-14 re-show.

| File | Kind | Lines |
|---|---|---|
| `src/app/state.ts` (next matchday from the record, append on "Play match", season over after 14, the match screen reads the latest recorded match, retire `OPENING_MATCHDAY` if DESIGN chooses) | code | 40 |
| `src/main.ts` (heading reads the recorded matchday, if not already) | code | 5 |
| `tests/acceptance/S-008/season.test.ts` (unit, property: next matchday, append, prefix kept, 14 cap, schedule seen from the club, table P N, per-matchday delta, determinism, goldens) | tests | 210 |
| `tests/e2e/S-008-season.spec.ts` (trimmed to what protected does not cover) | tests | 130 |
| Amended S-006/S-007 tests (D11: the re-show of matchday 1 on a second tap and "the record never grows") | tests | 60 |
| **DELIVER total** (code 45, tests 400) | code and tests | **445** |
| `tests/protected/S-008/season.spec.ts` (written in the plan run, outside DELIVER) | tests | 190 |
| **Grand total** (with protected) | code and tests | **635** |

### Wave: DISCUSS / [REF] Persona
Sam, 34, a lapsed Championship Manager fan. Plays on the bus, one-handed, on a mid-range Android phone at 390px wide, with 5 minutes to spare (persona from `docs/feature/S-001/feature-delta.md`; player from brief.md). Has played matchday 1 and seen his club 6th on "-1". Now Sam wants the next match: a chance to climb, and to find out whether the change he just made to his eleven works.

### Wave: DISCUSS / [REF] JTBD one-liner
When I have seen where we stand, I want to play the next match of the season, so that I can see whether my choices take us up the table. (Recorded as J-08 `play-out-my-season` in `docs/product/jobs.yaml`; it follows J-07.) S-008 serves J-08 for matchdays 1 to 14; the end of the season is a later story.

### Wave: DISCUSS / [REF] Glossary
- **Matchdays played**: how many matchdays the record holds (0 to 14). Each recorded matchday is 4 results (ADR-0012).
- **Next matchday**: matchdays played plus 1, while that is 14 or less. The matchday the next "Play match" plays.
- **Season over**: all 14 matchdays played (this version: D7).
- **Latest match**: the player's club's match of the highest recorded matchday; what the match screen shows.
- **Score lines of the season**: the score lines of the player's club's matches, matchdays 1 to N, as shown on each match screen.
- **Per-matchday delta**: what one matchday adds to a table row: P + 1 and exactly one of W, D, L + 1, with the matching Pts and GD change (D6).
- **Recorded result**, **Standings**, **Table row**, **Screen title**, **Untouched tactics**: as in S-007. **Club index**, **Fixture**, **Matchday**, **Score line**: as in S-006.

### Wave: DISCUSS / [REF] Locked decisions
- D1 Next matchday: each "Play match" on a known club's home, while the season is not over, plays the next matchday (matchdays played plus 1) for the whole league, records its 4 results after the ones already recorded, and shows the match screen. The first tap of a new game is matchday 1, exactly as S-006 and S-007. This supersedes the S-007 D2 re-show of matchday 1 on a second tap (a rule of that version only, deliberately not pinned in `tests/protected/S-007/`), as ADR-0012 "Forward compatibility" foresaw ("Matchdays 2..14: append the next `playMatchday` result").
- D2 Sides: Sam's fixture uses his formation and Starting XI at the moment of the tap (`currentXI`); every other club fields its automatic XI in 4-4-2 (the ADR-0012 policy, owned by the side builder in `state.ts`, unchanged). No new RNG stream: matchday N uses streams `200 + (N - 1) × 4 + fixtureIndex` (ADR-0011), already defined for all 14.
- D3 Match screen: it shows Sam's latest match. Its screen title (only h1) is "Matchday N", N the matchday just played, focused on arrival. Every S-006 match-screen rule holds for every N: the one score line (pattern `^(.+) (\d)–(\d) (.+)$`, en dash, goals 0 to 9, no other text in that format), one club Sam's and the other a different "Clubs" club; the "Goals" list (one item per goal, minutes 1 to 90 never decreasing, "23' Ivo Elderkin (Netherwold Borough)" format, item count per club equals its goals); both visible on arrival; every goal for Sam's club by one of the 11 on his Starting XI screen at the time of that match, never the GK slot; every goal for the other club by a non-GK player of that club's "Squad" list. "Back" (44px or taller) returns to the club home, heading focused, formation and XI unchanged.
- D4 Schedule seen from the club (ADR-0010, frozen): on every matchday every club plays exactly one other club; over matchdays 1 to 7 Sam's club meets each of the other 7 exactly once; matchday N + 7 (N = 1..7) is the same two clubs as matchday N in the opposite order. The score line names the home club first, so the protected scenarios read the order from the score line.
- D5 What is played stays played: recorded results never change. A formation or XI change after a match affects only matches not yet played. Earlier entries of the record are kept as they are when a matchday is appended (a unit-level invariant; black-box via D6).
- D6 Table reads the whole record: after N matchdays every row has P N; total W = total L; total D is even; GDs sum to 0; Sam's row equals the sum of his N score lines (W, D, L, GD, Pts). Per-matchday delta: from matchday N to N + 1 every row gains exactly one result: P + 1, exactly one of W, D, L + 1, Pts + 3 for a win, + 1 for a draw, + 0 for a loss, GD up for a win, the same for a draw, down for a loss. This black-box rule proves no earlier result moved. The S-007 order and tie-breaks are unchanged (Pts, GD, goals scored, club name; the last two this version only).
- D7 Season over (this version only): after matchday 14 a further "Play match" shows the matchday-14 match again (same h1 "Matchday 14", score line and "Goals" list) and records nothing; the table stays at P 14. A later end-of-season story must be free to replace it, so `tests/protected/S-008/` must not pin it; e2e and unit tests check it.
- D8 Club home unchanged: heading the club's name; "Squad", "Tactics", "Starting XI", "Play match", "Table" stay, labels unchanged; no new button, no "next opponent" or "Matchday N of 14" line (OUT, D12).
- D9 Determinism and lifetime: the season is a pure function of the seed and Sam's formation and XI at each tap. Two fresh visits with the same "?seed=", club and choices (or none) show identical match screens and tables; "?seed=abc" equals no "?seed=" in the address. Results last until the page is reloaded (reload: title screen, no persistence). The `NewGame` action clears the record (unit-level invariant, as S-007 D9).
- D10 Phone first and regression: no horizontal scroll at 390px, every button 44px or taller, no console errors, text through `el()`/`textContent` (ADR-0002), renderers never move focus (ADR-0008). Every S-001..S-007 "every later version" promise holds: "Matchday 1" for the first match of a new game; the club home heading and its five buttons; the all-zero A→Z table before the first match; the table columns and row rules; "Back" to the club home.
- D11 Superseded non-protected assertions (DELIVER replaces them with the S-008 rule; none is weakened; `tests/protected/` is untouched, and no protected scenario taps "Play match" twice in one page, checked):
  - `tests/acceptance/S-006/match-navigation.test.ts` lines 100-106, "Play match, Back and Play match again, then the same match screen is shown (the recorded matchday is kept, not replayed)": becomes "the second tap shows matchday 2 and appends 4 results; the first 4 entries are kept as they were".
  - `tests/acceptance/S-006/match-navigation.test.ts` line 203 (`OPENING_MATCHDAY` is 1): only if DESIGN retires the constant; restated as "the first Play match of a new game is matchday 1".
  - `tests/acceptance/S-007/table-navigation.test.ts`: lines 173-183 (the first case, "Play match again ... the very same array stays"); lines 399-417 (40-tap property: "once recorded the very same array stays" and every row P 0 or 1) restated as "the record only grows by a Play match from a club home, 4 entries at a time, earlier entries kept, every row P = matchdays played"; lines 419-441 (K3 property: `play` in the tinkering actions) restated without `play`, plus the D5 prefix rule for "Play match"; lines 480-485 ("the re-show of this version") replaced by "the second Play match plays matchday 2"; the header comment (line 6).
  - `tests/e2e/S-006-match.spec.ts` lines 231-233, "playing again replays the same match (nothing is recorded)": the second "Play match" now shows "Matchday 2" (at `?seed=31`, Rushmoor Heath Albion first, Netherwold Borough second) and its Netherwold Borough scorers are on the picked XI (Kestrel Northcott in).
  - `tests/e2e/S-007-table.spec.ts` lines 374-377 ("the re-show of this version") and its header comment (lines 8-9): "Play match" after tinkering now shows "Matchday 2", and the matchday-1 result still counts in the table.
  - DELIVER greps `tests/acceptance` and `tests/e2e` for any other case that taps "Play match" twice in one state and lists it in the execution log.
- D12 Scope cuts and deferred candidates (not planned here; the plan run may queue them): end-of-season screen (final position, top scorer, "play again"); a results or fixtures list of the other matches; a "next opponent" or "Matchday N of 14" line on the club home; commentary; stats (shots, possession, cards); save and continue (localStorage); AI formations or picks for other clubs; condition or fatigue changes from playing; tie-break changes; form or home/away columns.
- D13 Durability: in every later version, from a new game the k-th "Play match" (k = 1..14) shows the match screen of matchday k with h1 "Matchday k", the score line and "Goals" list in the S-006 formats, both on arrival, and "Back" to the club home; the double round-robin of D4; after N matchdays every table row has P N and Sam's row equals the sum of his N score lines. Not durable: what happens after matchday 14 (D7), the goals-scored and club-name tie-breaks (S-007).
- D14 Accessible names: no new accessible name. "Matchday N" extends the existing "Matchday" heading; the locator words list (S-007 D11) is unchanged.
- UX depth: no mockups beyond the journey table.

### Wave: DISCUSS / [REF] Story map and priority
Backbone: pick club, club home, squad, player, tactics, starting XI, **play match (next matchday)**, **see table (whole record)**, (next: end of season, other results, save). Walking skeleton: the existing S-001..S-007 path; S-008 turns the "play match, see table" pair into a loop that runs 14 times. One release, one thin slice, one DELIVER:
1. `slices/slice-01-next-matchday.md` (US-1 and US-2): "Play match" plays the next matchday; the match screen shows it; the table counts every recorded matchday; season over after 14 (this version). Value 5 x urgency 5 / effort 2 = 12.5.
Priority rationale: the brief's north star is a season start to finish; without matchdays 2..14 the loop stops after one round. US-2 needs no new table code (standings already read any list of results), so it is the same slice, not a second one: splitting it would ship a slice whose table is already correct.
Rejected alternatives: a "Matchday N of 14" or "next opponent" line on the club home first (information without consequence; ships more text); a "Play rest of season" button (skips the decisions, against "decisions over simulation"); an end-of-season screen in the same story (a second outcome; it would double the protected surface); recording only Sam's matches from matchday 2 (the table would show uneven P, not a league table).

### Wave: DISCUSS / [REF] User stories
Fixtures: at `?seed=31` the clubs by index are 0 Netherwold Borough, 1 Fennimore Town, 2 Rushmoor Heath Albion, 3 Juniper Hollow United, 4 Oakhampton Rise Borough, 5 Tarnbeck Borough, 6 Valebridge Albion, 7 Marlbrook Athletic (S-007). From the ADR-0010 formula, Netherwold Borough (club 0) plays, home club first: matchday 1 Netherwold Borough v Marlbrook Athletic (golden 1–2); 2 Rushmoor Heath Albion v Netherwold Borough; 3 Netherwold Borough v Oakhampton Rise Borough; 4 Valebridge Albion v Netherwold Borough; 5 Netherwold Borough v Fennimore Town; 6 Juniper Hollow United v Netherwold Borough; 7 Netherwold Borough v Tarnbeck Borough; 8 Marlbrook Athletic v Netherwold Borough; ... 14 Tarnbeck Borough v Netherwold Borough. At `?seed=abc` (default 20260), Oakhampton Rise Borough (club 7, 8th in its "Clubs" list) is away at Harrowgate Lane United (club 0) on matchday 1 (golden 0–1) and at home to club 1 on matchday 2. Scores for matchdays 2 to 14 are not known in DISCUSS: DISTILL pins the seed-31 matchday-2 and matchday-14 score lines and the seed-31 table after matchday 2 as unit-level goldens. The acceptance criteria state rules; goldens are regression locks, not protected scenarios.

#### US-1: Play the next match of the season
**Problem:** Sam lost 1–2 at home to Marlbrook Athletic, sits 6th, and has just moved to 4-3-3 with Kestrel Northcott in midfield. He taps "Play match" to see if it works, and the game shows him the same 1–2 again. His change has no next match to answer it, and the season never moves past its first day.
**job_id:** J-08

##### Elevator Pitch
- Before: a second "Play match" re-shows "Matchday 1", "Netherwold Borough 1–2 Marlbrook Athletic", whatever Sam changed.
- After: on Netherwold Borough's home Sam taps "Play match" again and sees the screen title "Matchday 2", a score line naming Rushmoor Heath Albion first and Netherwold Borough second (away at the club that lost 5–1 on matchday 1), and a "Goals" list whose Netherwold Borough scorers are all on his new 4-3-3 eleven.
- Decision enabled: did my change work, and do I keep this eleven for matchday 3 at home to Oakhampton Rise Borough?

**Domain examples**
1. `?seed=31`, "Netherwold Borough", untouched tactics: "Play match" shows "Matchday 1" and "Netherwold Borough 1–2 Marlbrook Athletic"; "Back", "Play match" shows "Matchday 2" with Rushmoor Heath Albion named first and Netherwold Borough second; "Back", "Play match" shows "Matchday 3" with Netherwold Borough first and Oakhampton Rise Borough second.
2. `?seed=31`, after matchday 1 Sam chooses "4-3-3" and picks "Kestrel Northcott 6" for "MF Calder Redfern 15" (the S-006 golden pick), then "Play match": "Matchday 2"; every "(Netherwold Borough)" item of the "Goals" list names one of the 10 outfield players now on his Starting XI screen, never Calder Redfern, never the GK.
3. `?seed=31`, 7 taps of "Play match" (each followed by "Back"): the opponents read Marlbrook Athletic, Rushmoor Heath Albion, Oakhampton Rise Borough, Valebridge Albion, Fennimore Town, Juniper Hollow United, Tarnbeck Borough: all 7 other clubs, once each. Tap 8 shows "Matchday 8" with "Marlbrook Athletic" named first and "Netherwold Borough" second.
4. `?seed=31` after 14 taps: "Matchday 14", Tarnbeck Borough first and Netherwold Borough second. A 15th "Play match" shows "Matchday 14" and the same score line and "Goals" list again (this version only).

**Acceptance criteria (embedded UAT)**
```gherkin
Scenario Outline: Each Play match plays the next matchday of the season
  Given Sam opens a fresh page at "<seed>", taps "New game" and "<club>"
  When Sam taps "Play match" and then "Back", 3 times in a row
  Then the screen titles of the 3 match screens read "Matchday 1", "Matchday 2" and "Matchday 3", in that order
  And each match screen title had focus on arrival
  And each match screen showed exactly one score line in the format "Home h–a Away" with "<club>" as one of its two clubs
  And each match screen showed the "Goals" list with one item per goal of its score line
  And after each "Back" the club home heading "<club>" has focus
  Examples:
    | seed      | club                    |
    | ?seed=31  | Netherwold Borough      |
    | ?seed=abc | Oakhampton Rise Borough |

Scenario: Over the season Sam meets every club once each way
  Given Sam at "?seed=31" managing "Netherwold Borough" in a new game
  When Sam taps "Play match" and "Back" 14 times, reading each score line
  Then the 14 screen titles read "Matchday 1" to "Matchday 14", in order
  And the other clubs of matchdays 1 to 7 are the 7 other clubs of the "Clubs" list, each exactly once
  And for each N from 1 to 7, matchday N + 7 names the same two clubs as matchday N, in the opposite order

Scenario: A change to the team counts from the next match on
  Given Sam at "?seed=31" managing "Netherwold Borough" has played matchday 1 and read the table
  When Sam chooses "4-3-3" in Tactics, picks "Kestrel Northcott 6" for "MF Calder Redfern 15" on the Starting XI and taps "Play match"
  Then the screen title is "Matchday 2"
  And every "Goals" item for "Netherwold Borough" names a player on the Starting XI screen who is not in its GK slot
  And no "Goals" item names "Calder Redfern"

Scenario: The same seed and the same choices give the same season
  Given Sam opens a fresh page at "?seed=abc", taps "New game" and "Oakhampton Rise Borough", and plays 3 matchdays, reading each match screen and then the table
  When Sam does the same in a second fresh page with no "?seed=" in the address
  Then the 3 match screens read the same, score line and "Goals" list
  And the two tables read the same rows, cell for cell
```
Checked by unit and e2e tests, not protected (D7): after matchday 14 a further "Play match" shows "Matchday 14" with the same score line and "Goals" list and the table stays at P 14. Also checked inside these scenarios or by the e2e: "Play match" and "Back" are at least 44px tall; the club home keeps its five buttons; no sideways scroll at 390px; no console error.

**Outcome KPI:** K1, K3, K4 (below).
**Technical notes (for DESIGN, not AC):** `playMatchday` and the append-only `results` list already cover matchdays 2..14 (ADR-0012 "Forward compatibility"); the next matchday may be derived from the record (DESIGN's call: no new state field is required by the AC). The match screen must read the latest recorded match of Sam's club; the S-006 fallback derivation (`matchFor` with nothing recorded) stays matchday 1. The after-14 rule (D7) lives in the app, not in the data. DESIGN records the change to the ADR-0012 re-show rule (an amendment note or a new ADR, DESIGN's choice). Depends on S-006, S-007.

#### US-2: See the table follow the season
**Problem:** a season is only a season if every match counts. If Sam's table forgot matchday 1 when he played matchday 2, or if moving to 4-3-3 quietly rewrote his opening defeat, the table would be a lie and his choices would mean nothing.
**job_id:** J-08

##### Elevator Pitch
- Before: the table only ever shows one round: every row P 1, Netherwold Borough 6th on "-1".
- After: after "Play match" twice, Sam taps "Back" and "Table" and sees the screen title "League table" with every row on P 2 and his row adding up his two score lines (the 1–2 defeat and his matchday-2 result).
- Decision enabled: am I climbing or sinking, and is it worth changing the team again before the next match?

**Domain examples**
1. `?seed=31`, "Netherwold Borough", untouched tactics, matchday 1 (1–2) then matchday 2: every row P 2; Netherwold Borough's row has L at least 1 (the 1–2 stays), and its GD is -1 plus its matchday-2 goal difference; Marlbrook Athletic's row has W at least 1. DISTILL pins the full seed-31 table after matchday 2 as a golden.
2. `?seed=31`, between matchday 1 and 2 Sam moves to 4-3-3 with Kestrel Northcott: every row of the table after matchday 2 is its row after matchday 1 plus exactly one result (P + 1, exactly one of W, D, L + 1).
3. `?seed=7`, the 3rd club, 14 matchdays: every row P 14, the total of W equals the total of L, the total of D is even, GDs add up to 0, and the club's row equals the sum of its 14 score lines.

**Acceptance criteria (embedded UAT)**
```gherkin
Scenario Outline: After N matchdays the table counts all of them
  Given Sam opens a fresh page at "<seed>", taps "New game" and "<club>"
  And Sam taps "Play match" and "Back" <n> times, reading each score line
  When Sam taps "Table"
  Then every body row has P <n>
  And on every body row W + D + L = P
  And on every body row Pts = 3 x W + D
  And the total of W equals the total of L
  And the total of D is even
  And the GDs add up to 0
  And "<club>"'s row has W, D and L equal to its wins, draws and losses in those <n> score lines
  And "<club>"'s row has GD equal to its goals minus the other clubs' goals in those <n> score lines
  And "<club>"'s row has Pts equal to 3 per win plus 1 per draw in those <n> score lines
  Examples:
    | seed      | club                    | n  |
    | ?seed=31  | Netherwold Borough      | 3  |
    | ?seed=abc | Oakhampton Rise Borough | 2  |
    | ?seed=7   | the 3rd club            | 14 |

Scenario: Each matchday adds exactly one result to every row
  Given Sam at "?seed=31" managing "Netherwold Borough" has played matchday 1 and read the table
  When Sam taps "Back", chooses "4-3-3" in Tactics, taps "Play match", "Back" and "Table"
  Then every row has P one more than before
  And on every row exactly one of W, D and L is one more and the other two are as before
  And on every row with one more W, Pts is 3 more and GD is higher
  And on every row with one more D, Pts is 1 more and GD is the same
  And on every row with one more L, Pts is the same and GD is lower

Scenario: Changing the team between matches never changes a played result
  Given Sam at "?seed=31" managing "Netherwold Borough" has played 2 matchdays and read the table
  When Sam taps "Back", chooses "4-2-3-1" in Tactics, changes one slot on the Starting XI, visits "Squad", and taps "Table"
  Then the table reads exactly as before, cell for cell
```
Property-test notes: the totals, Sam's row as the sum of his score lines and the per-matchday delta are also unit and property tests over seeds, clubs, formations and picks (fast-check honours `FC_SEED`), for every N from 1 to 14. Unit-level invariants: the first 4 N entries of the record are the very same objects after matchday N + 1 is appended; with untouched tactics the record after N matchdays is the same whichever club is managed.

**Outcome KPI:** K2, K3 (below).
**Technical notes (for DESIGN, not AC):** standings already derive from the whole `results` list (ADR-0013); no table code change is expected. The S-007 order and tie-breaks are unchanged. Depends on US-1.

Notes for DESIGN and DISTILL (not part of the AC):
- "Has focus" means `document.activeElement` is the `<h1>`.
- The protected scenarios read the order of the two clubs from the score line (home first) and the table by role, as in S-006 and S-007 (`exact: true` for "Play match", "Back", "Table", the headings and the table "League table").
- The after-14 re-show (D7) is NOT pinned in `tests/protected/S-008/`; it is a rule of this version only, checked by e2e and unit tests.
- A 14-matchday protected walk is 28 taps plus reads; mark it `test.slow()` as S-006/S-007 do.
- "the 3rd club" at `?seed=7` means the 3rd item of that league's "Clubs" list (S-007 protected uses index 2 at `?seed=7`).

### Wave: DISCUSS / [REF] Outcome KPIs
| # | Who | Does what | By how much (target) | Baseline | Measured by |
|---|---|---|---|---|---|
| K1 | Sam on a 390px phone | Plays the next match of his season from the club home | 1 tap per matchday ("Play match"), back home in 1 tap; the whole season in 28 taps; 0 matchdays skipped or repeated over matchdays 1 to 14 | not possible (the second tap re-shows matchday 1; 1 matchday per session) | e2e click counter (as S-003..S-007) |
| K2 | Sam | Trusts the table over the season | 100% of rows after N matchdays have P N and the row rules; his row equals the sum of his N score lines in 100% of runs; 0 mismatches over seeds 1..200 x 8 managed clubs x N = 1..14 | 1 matchday only | property tests (`ci:test`, fresh `FC_SEED`) and the protected scenarios |
| K3 | Sam | Sees his team changes answered by the next result, never by an old one | 0 changes to recorded results over any run of up to 40 formation, pick, navigation and "Play match" taps; 100% of his club's goals in each match scored by an outfield player of his XI at that tap | not possible | property tests on `update` plus the protected scorer check |
| K4 | Sam | Replays the same season from the same seed | 100% identical 14-matchday records for two runs with the same seed and the same choices, over seeds 1..200 | matchday 1 only (S-007) | property test; protected determinism scenario (3 matchdays) |

Guardrails: S-001..S-007 protected scenarios stay green; league, squads, automatic XIs and the matchday-1 results unchanged for every seed (the S-006 and S-007 goldens); no sideways scroll at 390px and 0 console errors on the club home, match and table screens. Environments as in the DEVOPS environment matrix (`docs/feature/S-004/environments.yaml`): local-preview `http://localhost:4173/gaffer/` (`ci:serve`) for e2e and protected scenarios, and the production Pages URL for the post-deploy smoke, both on Chromium with the Pixel 7 profile at 390px. There is no analytics in the POC; the e2e tap count and the property tests are the only measurements. Performance: each "Play match" runs 4 quick-sims (as the S-007 first tap); a full season is 56, microseconds each; not separately measured.

### Wave: DISCUSS / [REF] DoD
- `tests/protected/S-008/` passes on main; `tests/protected/S-001/` to `S-007/` still pass.
- Unit and property tests pass for: next matchday (1 to 14, then season over), append (4 entries per tap, earlier entries the very same objects), sides (Sam's XI at the tap, others automatic 4-4-2), match screen reads the latest match, schedule seen from each club (7 opponents once, mirror), table after N (P N, totals, Sam's row as the sum, per-matchday delta), determinism, `NewGame` clears the record.
- The D11 amendments replace, never weaken, the superseded S-006/S-007 non-protected assertions; no other S-001..S-007 acceptance assertion is edited.
- The e2e phone-viewport smoke (local-preview and post-deploy) covers: "Play match" twice ("Matchday 1", "Matchday 2"), a formation and XI change in between, "Table" P 2, the 14-matchday walk ending on "Matchday 14", the after-14 re-show (this version), focus on each heading.
- The seed-31 matchday-2 and matchday-14 score lines and the seed-31 table after matchday 2 are pinned as regression locks.
- No ambient randomness or wall-clock time in `src/domain/`; no new RNG stream.
- Recorded by DESIGN: the change to the ADR-0012 re-show rule (D1, D7), as an amendment note or a new ADR.
- No sideways scroll at 390px and 0 console errors on every screen of the journey.
- The DELIVER change stays under 1100 changed lines including tests (445 budgeted in DISCUSS; 635 with the plan run's protected scenarios).

### Wave: DISCUSS / [REF] Out-of-scope
- End-of-season screen (final position, top scorer, "play again"); anything after matchday 14 beyond the D7 re-show.
- A results or fixtures list, match screens for the other 3 fixtures of a matchday, a "next opponent" or "Matchday N of 14" line on the club home.
- Commentary; stats (shots, possession, cards).
- Save and continue (localStorage); a reload loses the season (title screen).
- AI formations or picks for other clubs; condition or fatigue changes from playing; tie-break changes; new table columns.
- Every OUT tag: `match-2d`, `utility-ai`, `transfers`, `finances`, `training`, `youth`, `staff`, `multiplayer`, `backend`, `real-data`.

### Wave: DISCUSS / [REF] WS strategy
No new walking skeleton (brownfield). S-008 turns the existing "club home, play match, back, table" path into a loop: the same screens, the same buttons, one state change per tap (append the next matchday). The e2e journey "Play match, Back, Tactics change, Play match, Back, Table, ... 14 times, Play match (re-show)" is the end-to-end proof of a full season. One carpaccio slice (`slices/slice-01-next-matchday.md`) in one DELIVER.

### Wave: DISCUSS / [REF] Driving ports
UI actions only, reachable by role and accessible name at `http://localhost:4173/gaffer/`:
- the button named "Play match" on the club home (plays the next matchday, shows its match screen);
- the match screen: screen title "Matchday N", the score line, the list "Goals", the button "Back";
- the button named "Table" on the club home and the table "League table" (unchanged screen, now P N);
- "Tactics" and "Starting XI" between matches (unchanged screens; their choices count from the next match).

### Wave: DISCUSS / [REF] Pre-requisites
- S-001..S-007 delivered (league, squads, formation, `currentXI`, `automaticXI`, `fixturesOf`, `playMatch`, `playMatchday`, `results`, `matchFor`, `standings`, table screen).
- ADR-0001..0013 accepted. ADR-0010 builds all 14 matchdays; ADR-0011 defines streams 200..255; ADR-0012 makes `results` append-only and foresees matchdays 2..14; ADR-0013 derives standings from any list of results.
- `docs/product/jobs.yaml` now has J-08 (resolved). Roadmap entry S-008 appended (below).
- D11 lists the non-protected S-006/S-007 assertions DELIVER amends.
- Open item for DESIGN: how the after-14 rule and the next matchday are recorded in the ADRs (D1, D7).

### Wave: DISCUSS / [REF] Roadmap outcome (draft)
As appended to `docs/roadmap.yaml` (S-008, week 6, tags [league, match]):

From the club home screen (its heading is still the club's name and its "Squad", "Tactics", "Starting XI", "Play match" and "Table" buttons stay) each tap of the button named exactly "Play match" (44px or taller) plays the next matchday of the season that has not been played yet, for the whole league, and shows the player's match of that matchday: the first "Play match" of a new game plays matchday 1 as before, the second plays matchday 2, and so on up to matchday 14. The match screen's only top-level heading (h1) is "Matchday N", where N is that matchday (a whole number from 1 to 14), focused on arrival. Every rule of the S-006 match screen holds for every N: the score line and the "Goals" list are already visible when the heading has focus; the score line is exactly one piece of text on the match screen whose whole text reads the home club's name, one space, the home goals, an en dash (–), the away goals, one space and the away club's name, with no spaces around the dash (pattern ^(.+) (\d)–(\d) (.+)$), goals being whole numbers from 0 to 9, and no other text on the match screen reads in that format; one of the two clubs is the player's club and the other is a different club of the "Clubs" list; a list named "Goals" holds exactly one item per goal (for 0–0 the list is there with no items), in match order with minutes never decreasing, each reading exactly the minute (a whole number from 1 to 90), a straight apostrophe ('), one space, the scorer's name, one space and the scorer's club name in round brackets, for example "23' Ivo Elderkin (Netherwold Borough)"; the number of items naming each club equals that club's goals in the score line. Every goal for the player's club is scored by one of the 11 players on its Starting XI screen at the time of that match, never the one in the GK slot; every goal for the other club is scored by a player of that club's "Squad" list who is not a goalkeeper (GK). The player's match is played with the formation and the Starting XI chosen at the moment of the tap; the league's 3 other fixtures of that matchday are simulated at the same moment, and the 4 results are recorded. The fixtures come from the league's fixed double round-robin: on every matchday every club plays exactly one other club; over matchdays 1 to 7 the player's club meets each of the other 7 clubs exactly once; and matchday N + 7 (N from 1 to 7) is the same two clubs as matchday N in the opposite order (the club named second on matchday N is named first). Recorded results never change: changing the formation in Tactics or the Starting XI after a match changes only the matches not yet played. The "Table" reads every recorded result: after N matchdays ("Play match" N times, then "Back" and "Table"), every row has P N, the total of W equals the total of L, the total of D is even and the GDs add up to 0, and the player's club's row equals the sum of the score lines of its N matches (W, D and L count its wins, draws and losses, GD is its goals minus the other clubs' goals, Pts is 3 per win and 1 per draw). From one matchday to the next every row gains exactly one result: P is one more, exactly one of W, D and L is one more, Pts is 3 more for a win, 1 more for a draw and the same for a loss, and GD goes up for a win, stays the same for a draw and goes down for a loss. The season comes from the seed: two fresh visits with the same "?seed=" and the same club, making the same formation and Starting XI choices (or none) before each match, show identical match screens and tables, and "?seed=abc" shows the same season as no "?seed=" in the address. A button named exactly "Back" (44px or taller) on the match screen returns to the club home with focus on its heading, the club's name, and the formation in Tactics and the Starting XI are unchanged. The results last until the page is reloaded. In this version only, once matchday 14 has been played the season is over: a further "Play match" re-shows the matchday-14 match (the same score line and "Goals" list) and records nothing, so the table stays at P 14; a later end-of-season screen may replace this. These hold in every later version of the game: from a new game, the k-th "Play match" (k from 1 to 14) shows the match screen of matchday k, with the h1 "Matchday k", the one score line in this format and the "Goals" list in this format, both shown on arrival, and "Back" to the club home; the fixed double round-robin (every club plays exactly once on every matchday, each other club once over matchdays 1 to 7, matchday N + 7 the same two clubs as matchday N in the opposite order); and after N matchdays every table row has P N and the player's club's row equals the sum of its N score lines. Every S-001 to S-007 promise for later versions still holds, including "Matchday 1" for the first match of a new game and the all-zero table, in A to Z order, before it. The re-show after matchday 14 is a rule of this version only. No horizontal scroll at 390px and no console errors.

### Wave: DISCUSS / [REF] DoR validation
| # | Item | Status | Evidence |
|---|---|---|---|
| 1 | Problem clear, domain language | PASS | US-1: after a 1–2 defeat and a move to 4-3-3, a second "Play match" shows the same 1–2 again, so the change has no next match; US-2: a table that forgot matchday 1 or let a team change rewrite it would be a lie |
| 2 | Persona specific | PASS | Sam, 34, one-handed on a bus, 390px Android, 5 minutes, has played matchday 1 and sits 6th on "-1" |
| 3 | 3+ domain examples, real data | PASS | US-1 4, US-2 3: the seed-31 club order and Netherwold Borough's 14 fixtures from the ADR-0010 formula (Rushmoor Heath Albion away on matchday 2, Marlbrook Athletic named first on matchday 8, Tarnbeck Borough on 14), the S-006 golden pick "Kestrel Northcott 6" for "MF Calder Redfern 15", `?seed=abc` Oakhampton Rise Borough, `?seed=7` 14-matchday totals; scores after matchday 1 pinned by DISTILL, not invented |
| 4 | UAT Given/When/Then, 3-7 | PASS | 7 for S-008, an outline counts as one (US-1 4, one outline; US-2 3, one outline); one assertion per Then/And step; the after-14 rule in notes (not protected, D7) |
| 5 | AC derived from UAT | PASS | D1, D3, D4, D8, D10 by US-1 scenarios 1-2; D2 and D5 by US-1 scenario 3 and US-2 scenarios 2-3; D6 by US-2 scenarios 1-2; D9 by US-1 scenario 4; D7, D11, D14 by unit tests, e2e and review |
| 6 | Right-sized | PASS | 1 slice, about 1 day; DELIVER about 445 changed lines including tests (635 with protected), under the 1100 cap; 7 scenarios; one outcome |
| 7 | Technical notes | PASS | Per story: `playMatchday` and `results` already cover 14 matchdays; next matchday may be derived from the record; match screen reads the latest match; after-14 rule in the app; no table code change; no new stream |
| 8 | Dependencies tracked | PASS | S-001..S-007 delivered; ADR-0010..0013 accepted; DESIGN records the ADR-0012 re-show change; D11 amendments named by file and line; D12 deferred candidates |
| 9 | Outcome KPI measurable | PASS | K1 1 tap per matchday, 28 for the season, 0 skips; K2 100% consistent rows over 200 seeds x 8 clubs x 14; K3 0 rewritten results over 40-tap runs; K4 100% identical seasons; by e2e and property tests |

DoR status: PASSED (both stories). Every story has `job_id` J-08 and an Elevator Pitch.

### Wave: DISCUSS / [REF] Peer review
Placeholder: to be filled after `nw-product-owner-reviewer` review.
