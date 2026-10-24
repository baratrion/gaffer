# S-008: Play the season, one matchday at a time

## Wave: DISCUSS

Lean, unattended, revision 1 (after `nw-product-owner-reviewer` cycle 1, see Peer review). Reuses `discuss/journey.md` and `slices/slice-01-next-matchday.md`. Toward the north star (manage one fictional club through one short season, start to finish), S-006 shipped "play match" and S-007 "see table", both for matchday 1 only. The smallest next visible increment is the season itself: each "Play match" plays the next matchday, and the table counts them all. scope.md IN says: "Season: double round-robin (14 matchdays); other matches are simulated; league table." Narrowed by scope.md precedence (ship less): only "play the next matchday" and "the table reads the whole record". The end-of-season screen (the intended successor story), a results or fixtures list, a "next opponent" line, commentary, stats, save and continue, AI formations for other clubs, fatigue and tie-break changes are later stories. Feature type: user-facing. UX depth: lightweight. Walking skeleton: no (brownfield, extends S-001..S-007). JTBD: yes, new job J-08. No DIVERGE artifact (accepted as lean, as for S-002..S-007).

### Wave: DISCUSS / [REF] Scope Assessment
PASS: 2 small user stories with 7 scenarios in total (4, 3), 1 roadmap story and one demonstrable outcome ("each tap plays the next match, the table follows the season"). No new bounded context: the schedule (ADR-0010), the match model and its 56 streams (ADR-0011), `playMatchday` and the append-only `results` list (ADR-0012) and the standings (ADR-0013) already cover 14 matchdays. The change is in the app layer: which matchday "Play match" plays, and which recorded match the match screen shows. One carpaccio slice, one release, about 1 day. Integration points: schedule, `playMatchday`, recorded results, standings, `currentXI`: 5, at the limit, not over it. No oversized signal: end of season, results list, persistence and opponent tactics are cut (D12).

Line budget (changed lines, code plus tests; file names are indicative, DESIGN names the files). The e2e covers only what the protected scenarios do not: focus on each heading, 44px, the seed-31 season goldens, the after-14 re-show, no sideways scroll on the two-digit table.

| File | Kind | Lines |
|---|---|---|
| `src/app/state.ts` (next matchday from the record, append on "Play match", season over after 14, the match screen reads the latest recorded match, retire `OPENING_MATCHDAY` if DESIGN chooses) | code | 40 |
| `src/main.ts` (heading reads the recorded matchday, if not already) | code | 5 |
| `tests/acceptance/S-008/season.test.ts` (unit, property: next matchday, append, prefix kept, 14 cap, schedule seen from the club, table P N, per-matchday delta, opponent scorers for every N, determinism, goldens) | tests | 220 |
| `tests/e2e/S-008-season.spec.ts` (trimmed to what protected does not cover; includes the 390px check of the table after 14 matchdays) | tests | 145 |
| Amended S-006/S-007 tests (D11: 4 acceptance cases and 2 properties, 2 e2e read helpers, 4 e2e second-tap blocks, 3 header comments) | tests | 90 |
| **DELIVER total** (code 45, tests 455) | code and tests | **500** |
| `tests/protected/S-008/season.spec.ts` (written in the plan run, outside DELIVER) | tests | 190 |
| **Grand total** (with protected) | code and tests | **690** |

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
- **Fresh season**: the season of a new game, started by loading the page and tapping "New game" (the scope of the durable promises, D13).
- **Recorded result**, **Standings**, **Table row**, **Screen title**, **Untouched tactics**: as in S-007. **Club index**, **Fixture**, **Matchday**, **Score line**: as in S-006.

### Wave: DISCUSS / [REF] Locked decisions
- D1 Next matchday: each "Play match" on a known club's home, while the season is not over, plays the next matchday (matchdays played plus 1) for the whole league, records its 4 results after the ones already recorded, and shows the match screen. The first tap of a new game is matchday 1, exactly as S-006 and S-007. This supersedes the S-007 D2 re-show of matchday 1 on a second tap (a rule of that version only, deliberately not pinned in `tests/protected/S-007/`), as ADR-0012 "Forward compatibility" foresaw ("Matchdays 2..14: append the next `playMatchday` result"). A tap navigates away from the club home to the match screen, which has no "Play match", so a second tap cannot land on the same club home: one tap is one matchday, and the update-level property (any run of up to 40 actions: the record grows only by a "Play match" from a club home, by exactly 4 entries) covers it.
- D2 Sides: Sam's fixture uses his formation and Starting XI at the moment of the tap (`currentXI`); every other club fields its automatic XI in 4-4-2 (the ADR-0012 policy, owned by the side builder in `state.ts`, unchanged). No new RNG stream: matchday N uses streams `200 + (N - 1) × 4 + fixtureIndex` (ADR-0011), already defined for all 14.
- D3 Match screen: it shows Sam's latest match. Its screen title (only h1) is "Matchday N", N the matchday just played, focused on arrival. Every S-006 match-screen rule holds for every N: the one score line (pattern `^(.+) (\d)–(\d) (.+)$`, en dash, goals 0 to 9, no other text in that format), one club Sam's and the other a different "Clubs" club; the "Goals" list (one item per goal, minutes 1 to 90 never decreasing, "23' Ivo Elderkin (Netherwold Borough)" format, item count per club equals its goals); both visible on arrival; every goal for Sam's club by one of the 11 on his Starting XI screen at the time of that match, never the GK slot; every goal for the other club by a non-GK player of that club's "Squad" list. "Back" (44px or taller) returns to the club home, heading focused, formation and XI unchanged.
  - Where each rule is checked: the formats, the h1, Sam's scorer rule and "Back" by the protected scenarios for matchdays 1 to 14. The opponent-scorer rule (non-GK player of the other club's "Squad" list) is checked black-box for matchday 1 only (the S-006 protected route); for matchdays 2 to 14 it is checked by unit and acceptance tests over all fixtures, not by black-box scenarios. It stays in the outcome as a rule of the game.
- D4 Schedule seen from the club (ADR-0010, frozen): on every matchday every club plays exactly one other club; over matchdays 1 to 7 Sam's club meets each of the other 7 exactly once; matchday N + 7 (N = 1..7) is the same two clubs as matchday N in the opposite order. The score line names the home club first, so the protected scenarios read the order from the score line.
- D5 What is played stays played: recorded results never change. A formation or XI change after a match affects only matches not yet played. Earlier entries of the record are kept as they are when a matchday is appended (a unit-level invariant; black-box via D6).
- D6 Table reads the whole record: the "Table" screen is S-007's (screen title "League table", table "League table", columns "Pos", "Club", "P", "W", "D", "L", "GD", "Pts", Club the row header). After N matchdays every row has P N; total W = total L; total D is even; GDs sum to 0; Sam's row equals the sum of his N score lines (W, D, L, GD, Pts). Per-matchday delta: from matchday N to N + 1 every row gains exactly one result: P + 1, exactly one of W, D, L + 1, Pts + 3 for a win, + 1 for a draw, + 0 for a loss, GD up for a win, the same for a draw, down for a loss. This black-box rule proves no earlier result moved. The S-007 order and tie-breaks are unchanged (Pts, GD, goals scored, club name; the last two this version only). S-008 is the first story with two-digit P, W, L, GD and Pts (Netherwold Borough ends seed 31 on Pts 23): the table must still fit 390px with no sideways scroll (DoD).
- D7 Season over (this version only; a named known gap): after matchday 14 a further "Play match" shows the matchday-14 match again (same h1 "Matchday 14", score line and "Goals" list) and records nothing; the table stays at P 14. Nothing tells Sam the season is over; that is accepted for this version (scope.md: ship less) and closed by the successor story, the end-of-season screen (scope.md IN: final position, top scorer, "play again"), which must be free to replace this rule. So `tests/protected/S-008/` must not pin it; e2e and unit tests check it.
- D8 Club home unchanged: heading the club's name; "Squad", "Tactics", "Starting XI", "Play match", "Table" stay, labels unchanged; no new button, no "next opponent" or "Matchday N of 14" line (OUT, D12).
- D9 Determinism and lifetime: the season is a pure function of the seed and Sam's formation and XI at each tap. Two fresh visits with the same "?seed=", club and choices (or none) show identical match screens and tables; "?seed=abc" equals no "?seed=" in the address. Results last until the page is reloaded (reload: title screen, no persistence). The `NewGame` action clears the record (unit-level invariant, as S-007 D9).
- D10 Phone first and regression: no horizontal scroll at 390px (also on the two-digit table after 14 matchdays), every button 44px or taller, no console errors, text through `el()`/`textContent` (ADR-0002), renderers never move focus (ADR-0008). Every S-001..S-007 "every later version" promise holds: "Matchday 1" for the first match of a new game; the club home heading and its five buttons; the all-zero A→Z table before the first match; the table columns and row rules; "Back" to the club home.
- D11 Superseded non-protected assertions. DELIVER replaces each with the S-008 rule, never weakening it: a second tap now asserts "Matchday 2" and its own checks. `tests/protected/` is untouched; no protected scenario taps "Play match" twice in one page (every protected `newGame` helper starts with `page.goto`; checked). Found by grepping `tests/acceptance` and `tests/e2e` for every `PlayMatch`/"Play match" tap and every hard-coded "Matchday 1":
  - `tests/acceptance/S-006/match-navigation.test.ts`:
    - lines 100-106, "Play match, Back and Play match again, then the same match screen is shown (the recorded matchday is kept, not replayed)": becomes "the second tap shows matchday 2 and appends 4 results; the first 4 entries are the very same objects".
    - line 203 (`OPENING_MATCHDAY` is 1): only if DESIGN retires the constant; restated as "the first Play match of a new game is matchday 1".
  - `tests/acceptance/S-007/table-navigation.test.ts`:
    - lines 173-183, the first state of the list (`update(walk(played, [back]), play)` keeps "the very same array"): moved out and restated as "Play match again appends matchday 2; the first 4 entries are the very same objects".
    - lines 399-417 (40-tap property: "once recorded the very same array stays" and every row P 0 or 1): restated as "the record grows only by a Play match from a club home, 4 entries at a time, earlier entries kept, at most 56; every row P = matchdays played".
    - lines 419-441 (K3 property: `play` among the tinkering actions): restated without `play`; the D5 prefix rule for "Play match" is its own property.
    - lines 480-485 ("the re-show of this version"): replaced by "the second Play match plays matchday 2".
    - the header comment, line 6.
  - `tests/e2e/S-006-match.spec.ts`:
    - the read helper `playAndRead`, line 90 (`expect(reading.focusedText).toBe("Matchday 1")`): takes the expected matchday (1 unless the test says otherwise).
    - the "@example The goals of Sam's club name only the 11 on his Starting XI after a pick" test, lines 231-233 ("playing again replays the same match (nothing is recorded)"): the second tap asserts "Matchday 2", Rushmoor Heath Albion named first and Netherwold Borough second, and every Netherwold Borough scorer on the picked XI (Kestrel Northcott in, Dorian Dunmore out).
    - the "@walking_skeleton No console error and no sideways scroll across the whole journey: club home, Play match, Back, Starting XI, a pick, Back, Play match, Back" test, second `playAndRead` at line 304: asserts "Matchday 2".
    - the header comment, line 7 ("a pick then "Play match" again").
  - `tests/e2e/S-007-table.spec.ts`:
    - the read helper `readMatch`, line 178 (`toHaveText("Matchday 1")`): takes the expected matchday (1 unless the test says otherwise).
    - the "@walking_skeleton What is played stays played" test, lines 374-377 ("the re-show of this version"): "Play match" after tinkering shows "Matchday 2"; then "Back", "Table": P 2 on every row, Netherwold Borough still L at least 1 (the matchday-1 defeat kept).
    - the "@walking_skeleton No console error and no sideways scroll across the whole journey: ... Table, 4-3-3, Table, Play match, Back" test, lines 433-434 (`readMatch` then `toBe(SCORE_31)`): asserts "Matchday 2" and a score line naming Rushmoor Heath Albion first and Netherwold Borough second.
    - the header comment, lines 8-9.
  - Checked and still valid (no amendment): the S-006 40-tap property (`match-navigation.test.ts` 173-198, formation and XI never touched by playing); `tests/acceptance/S-007/existing-navigation-unchanged.test.ts` 53-72 (one tap per run; nothing recorded is matchday 1); the S-007 no-op cases (`table-navigation.test.ts` 120-128, 225-233); `tests/e2e/S-007-club-home-regression.spec.ts` line 48 (one tap per page); every other e2e "Play match" tap follows a fresh `openClubHome` (`page.goto`).
- D12 Scope cuts and deferred candidates (not planned here; the plan run may queue them): **the end-of-season screen (final position, top scorer, "play again"; scope.md IN), the intended successor that closes the D7 gap**; a results or fixtures list of the other matches; a "next opponent" or "Matchday N of 14" line on the club home; commentary; stats (shots, possession, cards); save and continue (localStorage); AI formations or picks for other clubs; condition or fatigue changes from playing; tie-break changes; form or home/away columns.
- D13 Durability, for a fresh season started with "New game" (a later season restart, such as "play again", or save and continue is governed by its own story): in every later version the k-th "Play match" (k = 1..14) shows the match screen of matchday k with h1 "Matchday k", the score line and "Goals" list in the S-006 formats, both on arrival, and "Back" to the club home; the double round-robin of D4; after N matchdays every table row has P N and Sam's row equals the sum of his N score lines. Not durable: what happens after matchday 14 (D7), the goals-scored and club-name tie-breaks (S-007).
- D14 Accessible names: no new accessible name. "Matchday N" extends the existing "Matchday" heading; the locator words list (S-007 D11) is unchanged.
- UX depth: no mockups beyond the journey table.

### Wave: DISCUSS / [REF] Story map and priority
Backbone: pick club, club home, squad, player, tactics, starting XI, **play match (next matchday)**, **see table (whole record)**, (next: end of season, other results, save). Walking skeleton: the existing S-001..S-007 path; S-008 turns the "play match, see table" pair into a loop that runs 14 times. One release, one thin slice, one DELIVER:
1. `slices/slice-01-next-matchday.md` (US-1 and US-2): "Play match" plays the next matchday; the match screen shows it; the table counts every recorded matchday; season over after 14 (this version). Value 5 x urgency 5 / effort 2 = 12.5.
Priority rationale: the brief's north star is a season start to finish; without matchdays 2..14 the loop stops after one round. US-2 needs no new table code (standings already read any list of results), so it is the same slice, not a second one: splitting it would ship a slice whose table is already correct.
Rejected alternatives: a "Matchday N of 14" or "next opponent" line on the club home first (information without consequence; ships more text); a "Play rest of season" button (skips the decisions, against "decisions over simulation"); an end-of-season screen in the same story (a second outcome; it would double the protected surface; it is the successor, D12); recording only Sam's matches from matchday 2 (the table would show uneven P, not a league table).

### Wave: DISCUSS / [REF] User stories
Fixtures: at `?seed=31` the clubs by index are 0 Netherwold Borough, 1 Fennimore Town, 2 Rushmoor Heath Albion, 3 Juniper Hollow United, 4 Oakhampton Rise Borough, 5 Tarnbeck Borough, 6 Valebridge Albion, 7 Marlbrook Athletic (S-007). Netherwold Borough's season with untouched tactics (every club in its automatic 4-4-2; computed by the orchestrator from the model, home club first; DISTILL pins the goldens in tests): 1 Netherwold Borough 1–2 Marlbrook Athletic; 2 Rushmoor Heath Albion 2–1 Netherwold Borough; 3 Netherwold Borough 2–1 Oakhampton Rise Borough; 4 Valebridge Albion 1–2 Netherwold Borough; 5 Netherwold Borough 1–0 Fennimore Town; 6 Juniper Hollow United 2–0 Netherwold Borough; 7 Netherwold Borough 2–4 Tarnbeck Borough; 8 Marlbrook Athletic 1–2 Netherwold Borough; 9 Netherwold Borough 3–1 Rushmoor Heath Albion; 10 Oakhampton Rise Borough 1–1 Netherwold Borough; 11 Netherwold Borough 2–0 Valebridge Albion; 12 Fennimore Town 2–2 Netherwold Borough; 13 Netherwold Borough 1–0 Juniper Hollow United; 14 Tarnbeck Borough 2–1 Netherwold Borough. Netherwold Borough's row: after matchday 2 P 2 W 0 D 0 L 2 GD "-2" Pts 0; after matchday 3 P 3 W 1 D 0 L 2 GD "-1" Pts 3; after matchday 14 P 14 W 7 D 2 L 5 GD "+2" Pts 23. At `?seed=abc` (default 20260), Oakhampton Rise Borough (club 7, 8th in its "Clubs" list) is away at Harrowgate Lane United on matchday 1 (golden 0–1) and at home to the 2nd club of its list on matchday 2. At `?seed=7` the "Clubs" list reads Brindlecombe Rovers, Juniper Hollow United, Larkmere Albion, Quillbourne Wanderers, Wexcombe Wanderers, Stoneleigh Moor Rangers, Kettlewick Town, Thornbury Cross Rangers. The acceptance criteria state rules; goldens are regression locks, not protected scenarios.

#### US-1: Play the next match of the season
**Problem:** Sam lost 1–2 at home to Marlbrook Athletic, sits 6th, and has just moved to 4-3-3 with Kestrel Northcott in midfield. He taps "Play match" to see if it works, and the game shows him the same 1–2 again. His change has no next match to answer it, and the season never moves past its first day.
**job_id:** J-08

##### Elevator Pitch
- Before: a second "Play match" re-shows "Matchday 1", "Netherwold Borough 1–2 Marlbrook Athletic", whatever Sam changed.
- After: on Netherwold Borough's home Sam taps "Play match" again and sees the screen title "Matchday 2" and one score line naming Rushmoor Heath Albion first and Netherwold Borough second, with a "Goals" list whose Netherwold Borough scorers are all on his current Starting XI.
- Decision enabled: do I keep this eleven for matchday 3 at home to Oakhampton Rise Borough, or change it?

**Domain examples**
1. `?seed=31`, "Netherwold Borough", untouched tactics: "Play match" shows "Matchday 1" and "Netherwold Borough 1–2 Marlbrook Athletic"; "Back", "Play match" shows "Matchday 2" and "Rushmoor Heath Albion 2–1 Netherwold Borough"; "Back", "Play match" shows "Matchday 3" and "Netherwold Borough 2–1 Oakhampton Rise Borough".
2. `?seed=31`, after matchday 1 Sam chooses "4-3-3" and picks "Kestrel Northcott 6" for "MF Calder Redfern 15" (the S-006 golden pick), then "Play match": "Matchday 2", Rushmoor Heath Albion first and Netherwold Borough second; every "(Netherwold Borough)" item of the "Goals" list names one of the 10 outfield players now on his Starting XI screen, never Calder Redfern, never the GK.
3. `?seed=31`, 7 taps of "Play match" (each followed by "Back"): the opponents read Marlbrook Athletic, Rushmoor Heath Albion, Oakhampton Rise Borough, Valebridge Albion, Fennimore Town, Juniper Hollow United, Tarnbeck Borough: all 7 other clubs, once each. Tap 8 shows "Matchday 8" and "Marlbrook Athletic 1–2 Netherwold Borough": the return game, the other club named first.
4. `?seed=31` after 14 taps: "Matchday 14", "Tarnbeck Borough 2–1 Netherwold Borough". A 15th "Play match" shows "Matchday 14" and the same score line and "Goals" list again (this version only; known gap, D7).

**Acceptance criteria (embedded UAT)**
```gherkin
Scenario Outline: Each Play match plays the next matchday of the season
  Given Sam has started a new game at "<seed>" managing "<club>" and is on its club home
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
  Given Sam has started a new game at "?seed=31" managing "Netherwold Borough" and is on its club home
  When Sam taps "Play match" and "Back" 14 times, reading each score line
  Then the 14 screen titles read "Matchday 1" to "Matchday 14", in order
  And the other clubs of matchdays 1 to 7 are the 7 other clubs of the "Clubs" list, each exactly once
  And for each N from 1 to 7, matchday N + 7 names the same two clubs as matchday N, in the opposite order

Scenario: A change to the team counts from the next match on
  Given Sam at "?seed=31" managing "Netherwold Borough" has a season with matchday 1 played
  When Sam chooses "4-3-3" in Tactics, picks "Kestrel Northcott 6" for "MF Calder Redfern 15" on the Starting XI and taps "Play match"
  Then the screen title is "Matchday 2"
  And every "Goals" item for "Netherwold Borough" names a player on the Starting XI screen who is not in its GK slot
  And no "Goals" item names "Calder Redfern"

Scenario: The same seed and the same choices give the same season
  Given two fresh pages, one at "?seed=abc" and one with no "?seed=" in the address
  When in each page Sam taps "New game" and "Oakhampton Rise Borough", plays 3 matchdays reading each match screen, and opens "Table"
  Then the 3 match screens read the same in both pages, score line and "Goals" list
  And the two tables read the same rows, cell for cell
```
Checked by unit and e2e tests, not protected (D7): after matchday 14 a further "Play match" shows "Matchday 14" with the same score line and "Goals" list and the table stays at P 14. Checked by unit and acceptance tests, not black-box, for matchdays 2 to 14 (D3): every goal for the other club is by a non-GK player of that club's squad. Also checked inside these scenarios or by the e2e: "Play match" and "Back" are at least 44px tall; the club home keeps its five buttons; no sideways scroll at 390px; no console error.

**Outcome KPI:** K1, K3, K4 (below).
**Technical notes (for DESIGN, not AC):** `playMatchday` and the append-only `results` list already cover matchdays 2..14 (ADR-0012 "Forward compatibility"); the next matchday may be derived from the record (DESIGN's call: no new state field is required by the AC). The match screen must read the latest recorded match of Sam's club; the S-006 fallback derivation (`matchFor` with nothing recorded) stays matchday 1. The after-14 rule (D7) lives in the app, not in the data. DESIGN records the change to the ADR-0012 re-show rule (an amendment note or a new ADR, DESIGN's choice). Depends on S-006, S-007.

#### US-2: See the table follow the season
**Problem:** a season is only a season if every match counts. If Sam's table forgot matchday 1 when he played matchday 2, or if moving to 4-3-3 quietly rewrote his opening defeat, the table would be a lie and his choices would mean nothing.
**job_id:** J-08

##### Elevator Pitch
- Before: the table only ever shows one round: every row P 1, Netherwold Borough 6th on "-1".
- After: after "Play match" twice, Sam taps "Back" and "Table" and sees the screen title "League table" with every row on P 2 and his row reading P 2, W 0, D 0, L 2, GD "-2", Pts 0: the 1–2 and the 2–1 at Rushmoor Heath Albion, both counted.
- Decision enabled: am I climbing or sinking, and is it worth changing the team again before the next match?

**Domain examples**
1. `?seed=31`, "Netherwold Borough", untouched tactics, 3 matchdays (1–2, 2–1 away, 2–1 home): every row P 3; Netherwold Borough's row reads P 3, W 1, D 0, L 2, GD "-1", Pts 3; Marlbrook Athletic's row has W at least 1.
2. `?seed=31`, between matchday 1 and 2 Sam moves to 4-3-3 with Kestrel Northcott: every row of the table after matchday 2 is its row after matchday 1 plus exactly one result (P + 1, exactly one of W, D, L + 1).
3. `?seed=7`, "Larkmere Albion" (3rd in that league's "Clubs" list), 14 matchdays: every row P 14, the total of W equals the total of L, the total of D is even, GDs add up to 0, and Larkmere Albion's row equals the sum of its 14 score lines. At `?seed=31` after 14 matchdays Netherwold Borough reads P 14, W 7, D 2, L 5, GD "+2", Pts 23: two-digit values that must still fit 390px.

**Acceptance criteria (embedded UAT)**
```gherkin
Scenario Outline: After N matchdays the table counts all of them
  Given Sam has started a new game at "<seed>" managing "<club>" and is on its club home
  When Sam taps "Play match" and "Back" <n> times, reading each score line, and then taps "Table"
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
    | ?seed=7   | Larkmere Albion         | 14 |

Scenario: Each matchday adds exactly one result to every row
  Given Sam at "?seed=31" managing "Netherwold Borough" has a season with matchday 1 played
  When Sam opens "Table" and reads it, taps "Back", chooses "4-3-3" in Tactics, taps "Play match", "Back" and "Table"
  Then every row has P one more than before
  And on every row exactly one of W, D and L is one more and the other two are as before
  And on every row with one more W, Pts is 3 more and GD is higher
  And on every row with one more D, Pts is 1 more and GD is the same
  And on every row with one more L, Pts is the same and GD is lower

Scenario: Changing the team between matches never changes a played result
  Given Sam at "?seed=31" managing "Netherwold Borough" has a season with 2 matchdays played
  When Sam opens "Table" and reads it, taps "Back", chooses "4-2-3-1" in Tactics, changes one slot on the Starting XI, visits "Squad", and opens "Table" again
  Then the table reads exactly as before, cell for cell
```
"Has a season with N matchdays played" is a precondition state, reached in the test by "Play match", "Back" N times after "New game" at that seed and club. Property-test notes: the totals, Sam's row as the sum of his score lines and the per-matchday delta are also unit and property tests over seeds, clubs, formations and picks (fast-check honours `FC_SEED`), for every N from 1 to 14. Unit-level invariants: the first 4 N entries of the record are the very same objects after matchday N + 1 is appended; with untouched tactics the record after N matchdays is the same whichever club is managed.

**Outcome KPI:** K2, K3 (below).
**Technical notes (for DESIGN, not AC):** standings already derive from the whole `results` list (ADR-0013); no table code change is expected, except what 390px needs for two-digit values (DESIGN checks the column widths). The S-007 order and tie-breaks are unchanged. Depends on US-1.

Notes for DESIGN and DISTILL (not part of the AC):
- "Has focus" means `document.activeElement` is the `<h1>`.
- The protected scenarios read the order of the two clubs from the score line (home first) and the table by role, as in S-006 and S-007 (`exact: true` for "Play match", "Back", "Table", the headings and the table "League table").
- The after-14 re-show (D7) is NOT pinned in `tests/protected/S-008/`; it is a rule of this version only, checked by e2e and unit tests.
- The opponent-scorer rule for matchdays 2 to 14 is a unit and acceptance check (D3), not a protected one.
- A 14-matchday protected walk is 28 taps plus reads; mark it `test.slow()` as S-006/S-007 do.

### Wave: DISCUSS / [REF] Outcome KPIs
| # | Who | Does what | By how much (target) | Baseline | Measured by |
|---|---|---|---|---|---|
| K1 | Sam on a 390px phone | Plays the next match of his season from the club home | 1 tap per matchday ("Play match"), back home in 1 tap; the whole season in 28 taps; 0 matchdays skipped or repeated over matchdays 1 to 14 | not possible (the second tap re-shows matchday 1; 1 matchday per session) | e2e click counter (as S-003..S-007) |
| K2 | Sam | Trusts the table over the season | 100% of rows after N matchdays have P N and the row rules; his row equals the sum of his N score lines in 100% of runs; 0 mismatches over seeds 1..200 x 8 managed clubs x N = 1..14 | 1 matchday only | property tests (`ci:test`, fresh `FC_SEED`) and the protected scenarios |
| K3 | Sam | Sees his team changes answered by the next result, never by an old one | 0 changes to recorded results over any run of up to 40 formation, pick, navigation and "Play match" taps; 100% of his club's goals in each match scored by an outfield player of his XI at that tap | not possible | property tests on `update` plus the protected scorer check |
| K4 | Sam | Replays the same season from the same seed | 100% identical 14-matchday records for two runs with the same seed and the same choices, over seeds 1..200 | matchday 1 only (S-007) | property test; protected determinism scenario (3 matchdays) |

Guardrails: S-001..S-007 protected scenarios stay green; league, squads, automatic XIs and the matchday-1 results unchanged for every seed (the S-006 and S-007 goldens); no sideways scroll at 390px and 0 console errors on the club home, match and table screens, including the League table after 14 matchdays with two-digit values at `?seed=31` and `?seed=abc` (S-007's longest-name seeds). Environments as in the DEVOPS environment matrix (`docs/feature/S-004/environments.yaml`): local-preview `http://localhost:4173/gaffer/` (`ci:serve`) for e2e and protected scenarios, and the production Pages URL for the post-deploy smoke, both on Chromium with the Pixel 7 profile at 390px. There is no analytics in the POC; the e2e tap count and the property tests are the only measurements. Performance: each "Play match" runs 4 quick-sims (as the S-007 first tap); a full season is 56, microseconds each; not separately measured.

### Wave: DISCUSS / [REF] DoD
- `tests/protected/S-008/` passes on main; `tests/protected/S-001/` to `S-007/` still pass.
- Unit and property tests pass for: next matchday (1 to 14, then season over), append (4 entries per tap, earlier entries the very same objects), sides (Sam's XI at the tap, others automatic 4-4-2), match screen reads the latest match, opponent scorers non-GK of their squad for every fixture of matchdays 1 to 14, schedule seen from each club (7 opponents once, mirror), table after N (P N, totals, Sam's row as the sum, per-matchday delta), determinism, `NewGame` clears the record.
- The D11 amendments replace, never weaken, the superseded S-006/S-007 non-protected assertions (each second tap asserts "Matchday 2"); no other S-001..S-007 acceptance assertion is edited.
- The e2e phone-viewport smoke (local-preview and post-deploy) covers: "Play match" twice ("Matchday 1", "Matchday 2"), a formation and XI change in between, "Table" P 2, the 14-matchday walk ending on "Matchday 14", the after-14 re-show (this version), focus on each heading.
- The e2e asserts no horizontal scroll at 390px (document and table `scrollWidth`) on the League table after 14 matchdays at `?seed=31` and `?seed=abc`, with the longest club names and two-digit values visible.
- The seed-31 season goldens (the 14 score lines above and Netherwold Borough's row after matchdays 2, 3 and 14) are pinned as regression locks.
- No ambient randomness or wall-clock time in `src/domain/`; no new RNG stream.
- Recorded by DESIGN: the change to the ADR-0012 re-show rule (D1, D7), as an amendment note or a new ADR.
- The DELIVER change stays under 1100 changed lines including tests (500 budgeted in DISCUSS; 690 with the plan run's protected scenarios).

### Wave: DISCUSS / [REF] Out-of-scope
- **The end-of-season screen (final position, top scorer, "play again"; scope.md IN): the intended successor story.** It closes the D7 known gap; until then anything after matchday 14 is only the D7 re-show.
- A results or fixtures list, match screens for the other 3 fixtures of a matchday, a "next opponent" or "Matchday N of 14" line on the club home.
- Commentary; stats (shots, possession, cards).
- Save and continue (localStorage); a reload loses the season (title screen).
- AI formations or picks for other clubs; condition or fatigue changes from playing; tie-break changes; new table columns.
- Every OUT tag: `match-2d`, `utility-ai`, `transfers`, `finances`, `training`, `youth`, `staff`, `multiplayer`, `backend`, `real-data`.

### Wave: DISCUSS / [REF] WS strategy
No new walking skeleton (brownfield). S-008 turns the existing "club home, play match, back, table" path into a loop: the same screens, the same buttons, one state change per tap (append the next matchday). The e2e journey "Play match, Back, Tactics change, Play match, Back, Table, ... 14 times, Table, Play match (re-show)" is the end-to-end proof of a full season. One carpaccio slice (`slices/slice-01-next-matchday.md`) in one DELIVER.

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
- D11 lists every non-protected S-006/S-007 assertion DELIVER amends.
- Open items for DESIGN: how the after-14 rule and the next matchday are recorded in the ADRs (D1, D7); table column widths for two-digit values at 390px.

### Wave: DISCUSS / [REF] Roadmap outcome (draft)
As appended to `docs/roadmap.yaml` (S-008, week 6, tags [league, match]):

From the club home screen (its heading is still the club's name and its "Squad", "Tactics", "Starting XI", "Play match" and "Table" buttons stay) each tap of the button named exactly "Play match" (44px or taller) plays the next matchday of the season that has not been played yet (up to matchday 14; see the season-over rule below), for the whole league, and shows the player's match of that matchday: the first "Play match" of a new game plays matchday 1 as before, the second plays matchday 2, and so on up to matchday 14. The match screen's only top-level heading (h1) is "Matchday N", where N is that matchday (a whole number from 1 to 14), focused on arrival. Every rule of the S-006 match screen holds for every N: the score line and the "Goals" list are already visible when the heading has focus; the score line is exactly one piece of text on the match screen whose whole text reads the home club's name, one space, the home goals, an en dash (–), the away goals, one space and the away club's name, with no spaces around the dash (pattern ^(.+) (\d)–(\d) (.+)$), goals being whole numbers from 0 to 9, and no other text on the match screen reads in that format; one of the two clubs is the player's club and the other is a different club of the "Clubs" list; a list named "Goals" holds exactly one item per goal (for 0–0 the list is there with no items), in match order with minutes never decreasing, each reading exactly the minute (a whole number from 1 to 90), a straight apostrophe ('), one space, the scorer's name, one space and the scorer's club name in round brackets, for example "23' Ivo Elderkin (Netherwold Borough)"; the number of items naming each club equals that club's goals in the score line. Every goal for the player's club is scored by one of the 11 players on its Starting XI screen at the time of that match, never the one in the GK slot; every goal for the other club is scored by a player of that club's "Squad" list who is not a goalkeeper (GK). The player's match is played with the formation and the Starting XI chosen at the moment of the tap; the league's 3 other fixtures of that matchday are simulated at the same moment, and the 4 results are recorded. The fixtures come from the league's fixed double round-robin: on every matchday every club plays exactly one other club; over matchdays 1 to 7 the player's club meets each of the other 7 clubs exactly once; and matchday N + 7 (N from 1 to 7) is the same two clubs as matchday N in the opposite order (the club named second on matchday N is named first). Recorded results never change: changing the formation in Tactics or the Starting XI after a match changes only the matches not yet played. The "Table" button opens the league table screen of S-007 (its screen title, the only top-level heading (h1), is "League table"; the table named "League table" has one body row per club and the column headers "Pos", "Club", "P", "W", "D", "L", "GD" and "Pts" in this order, Club being the row header; on every row W + D + L = P and Pts = 3 × W + D), and it reads every recorded result: after N matchdays ("Play match" N times, each followed by "Back", then "Table"), every row has P N, the total of W equals the total of L, the total of D is even and the GDs add up to 0, and the player's club's row equals the sum of the score lines of its N matches (W, D and L count its wins, draws and losses, GD is its goals minus the other clubs' goals, Pts is 3 per win and 1 per draw). From one matchday to the next every row gains exactly one result: P is one more, exactly one of W, D and L is one more, Pts is 3 more for a win, 1 more for a draw and the same for a loss, and GD goes up for a win, stays the same for a draw and goes down for a loss. The season comes from the seed: two fresh visits with the same "?seed=" and the same club, making the same formation and Starting XI choices (or none) before each match, show identical match screens and tables, and "?seed=abc" shows the same season as no "?seed=" in the address. A button named exactly "Back" (44px or taller) on the match screen returns to the club home with focus on its heading, the club's name, and the formation in Tactics and the Starting XI are unchanged. The results last until the page is reloaded. In this version only, once matchday 14 has been played the season is over: a further "Play match" re-shows the matchday-14 match (the same score line and "Goals" list) and records nothing, so the table stays at P 14; a later end-of-season screen may replace this. These hold in every later version of the game, for a fresh season started with "New game" (a later season restart, such as "play again", or save and continue is governed by its own story): the k-th "Play match" (k from 1 to 14) shows the match screen of matchday k, with the h1 "Matchday k", the one score line in this format and the "Goals" list in this format, both shown on arrival, and "Back" to the club home; the fixed double round-robin (every club plays exactly once on every matchday, each other club once over matchdays 1 to 7, matchday N + 7 the same two clubs as matchday N in the opposite order); and after N matchdays every table row has P N and the player's club's row equals the sum of its N score lines. Every S-001 to S-007 promise for later versions still holds, including "Matchday 1" for the first match of a new game and the all-zero table, in A to Z order, before it. The re-show after matchday 14 is a rule of this version only. No horizontal scroll at 390px, also on the League table after 14 matchdays when values have two digits, and no console errors.

### Wave: DISCUSS / [REF] DoR validation
| # | Item | Status | Evidence |
|---|---|---|---|
| 1 | Problem clear, domain language | PASS | US-1: after a 1–2 defeat and a move to 4-3-3, a second "Play match" shows the same 1–2 again, so the change has no next match; US-2: a table that forgot matchday 1 or let a team change rewrite it would be a lie |
| 2 | Persona specific | PASS | Sam, 34, one-handed on a bus, 390px Android, 5 minutes, has played matchday 1 and sits 6th on "-1" |
| 3 | 3+ domain examples, real data | PASS | US-1 4, US-2 3, all with real names and model-computed scores: Netherwold Borough's full seed-31 season (1–2 Marlbrook Athletic, 2–1 at Rushmoor Heath Albion, ... 2–1 at Tarnbeck Borough) and its rows after matchdays 2, 3 and 14 (P 14 W 7 D 2 L 5 "+2" 23); the S-006 golden pick "Kestrel Northcott 6" for "MF Calder Redfern 15"; `?seed=abc` Oakhampton Rise Borough; `?seed=7` Larkmere Albion (3rd of Brindlecombe Rovers, Juniper Hollow United, Larkmere Albion, ...). No placeholder club or score remains |
| 4 | UAT Given/When/Then, 3-7 | PASS | 7 for S-008, an outline counts as one (US-1 4, one outline; US-2 3, one outline); Givens are states, actions are in When; one assertion per Then/And step; the after-14 rule in notes (not protected, D7) |
| 5 | AC derived from UAT | PASS | D1, D3, D4, D8, D10 by US-1 scenarios 1-2; D2 and D5 by US-1 scenario 3 and US-2 scenarios 2-3; D6 by US-2 scenarios 1-2; D9 by US-1 scenario 4; D3 opponent scorers for matchdays 2-14, D7, D11, D14 by unit tests, e2e and review |
| 6 | Right-sized | PASS | 1 slice, about 1 day; DELIVER about 500 changed lines including tests (690 with protected), under the 1100 cap; 7 scenarios; one outcome |
| 7 | Technical notes | PASS | Per story: `playMatchday` and `results` already cover 14 matchdays; next matchday may be derived from the record; match screen reads the latest match; after-14 rule in the app; table column widths for two digits; no new stream |
| 8 | Dependencies tracked | PASS | S-001..S-007 delivered; ADR-0010..0013 accepted; DESIGN records the ADR-0012 re-show change; D11 amendments named by file, test and line after a full grep; D12 deferred candidates with the end-of-season successor |
| 9 | Outcome KPI measurable | PASS | K1 1 tap per matchday, 28 for the season, 0 skips; K2 100% consistent rows over 200 seeds x 8 clubs x 14; K3 0 rewritten results over 40-tap runs; K4 100% identical seasons; by e2e and property tests |

DoR status: PASSED (both stories). Every story has `job_id` J-08 and an Elevator Pitch.

### Wave: DISCUSS / [REF] Peer review
`nw-product-owner-reviewer` (haiku), cycle 1: rejected_pending_revisions (H-1..H-3, M-1..M-4, L-1..L-7). Revision 1 applied as below. Season data used in the revision (Netherwold Borough's 14 score lines at `?seed=31`, the `?seed=7` "Clubs" order) was computed by the orchestrator by running the model; DISTILL still pins the goldens in tests.

| Finding | How it landed |
|---|---|
| H-1 D11 missed second-tap e2e tests | Re-grepped `tests/acceptance` and `tests/e2e` for every "Play match"/`PlayMatch` tap and hard-coded "Matchday 1". D11 now also lists both e2e read helpers (`S-006-match.spec.ts` `playAndRead` line 90, `S-007-table.spec.ts` `readMatch` line 178), the S-006 "No console error ... Play match, Back, Starting XI, a pick, Back, Play match, Back" test (line 304), the S-007 "No console error ... Table, 4-3-3, Table, Play match, Back" test (lines 433-434) and the header comments, each restated as "the second tap asserts Matchday 2". It also lists what was checked and stays valid. Budget: amendments 60 → 90 lines, DELIVER 445 → 500, grand total 635 → 690 |
| H-2 "the 3rd club" | Replaced by "Larkmere Albion" (3rd of the `?seed=7` "Clubs" list, named in full) in US-2 example 3, the outline table and the slice; the note defining it removed. DoR item 3 re-run: PASS, no placeholder left |
| H-3 after-14 state | Named a known gap of this version in D7 and journey.md (nothing tells Sam the season is over; accepted under scope.md "ship less"). The "Calm: nothing breaks" feel line is dropped from the journey. The end-of-season screen (final position, top scorer, "play again"; scope.md IN) is named the intended successor in D7, D12 and Out-of-scope |
| M-1 outcome not self-contained on the table | The outcome's table sentence now names the screen title "League table", the table "League table", the columns "Pos", "Club", "P", "W", "D", "L", "GD", "Pts", Club as the row header and the row rules, as in S-007 (roadmap, draft and D6) |
| M-2 two-digit values at 390px | D6, D10, guardrails, DoD and the slice: an e2e assertion of no horizontal scroll (document and table `scrollWidth`) on the League table after 14 matchdays at `?seed=31` and `?seed=abc`, longest names and two-digit values; the outcome's last sentence says so too. Open item for DESIGN: column widths |
| M-3 invented score in the US-1 pitch | The "lost 5–1" clause is removed. The pitch now uses the real matchday-2 result "Rushmoor Heath Albion 2–1 Netherwold Borough" (untouched tactics) |
| M-4 opponent scorers for matchdays 2..14 | D3, US-1 notes, DISTILL notes and DoD: black-box for matchday 1 only (S-006 protected route); for matchdays 2 to 14 a unit and acceptance check over every fixture. The rule stays in the outcome |
| L-1 actions in Given | Givens are now states ("has started a new game ... and is on its club home", "has a season with N matchdays played", "two fresh pages"); every tap is in a When. A note says how a test reaches "a season with N matchdays played" |
| L-2 durable scope | D13, the Glossary ("Fresh season") and the outcome: the durable promises hold for a fresh season started with "New game"; a later restart ("play again") or save and continue is governed by its own story |
| L-3 first sentence | The outcome's first sentence adds "(up to matchday 14; see the season-over rule below)" |
| L-4 | Recorded; no content change beyond the revisions above (PO's call) |
| L-5 | Recorded; no content change beyond the revisions above (PO's call) |
| L-6 one tap, one matchday | D1: the tap leaves the club home for a match screen without "Play match", so a second tap cannot hit the same screen; one tap = one matchday is covered by the update-level property (the record grows only by a "Play match" from a club home, by exactly 4 entries) |
| L-7 | Recorded; no content change beyond the revisions above (PO's call) |

Cycle 2 (`nw-product-owner-reviewer`): **approved**, DoR 9/9, no critical or high issues.

| Finding | Disposition |
|---|---|
| N-1 the US-1 pitch quoted the untouched-tactics score after a 4-3-3 change | Fixed: the pitch now states only the observable shape (h1 "Matchday 2", Rushmoor Heath Albion named first, Netherwold Borough second, scorers on the current XI); the exact score stays in the untouched-tactics domain example |
| N-2 the 14 seed-31 score lines are not pinned in the repository | Accepted: DISTILL reproduces them by running `playMatchday` (seed 31, untouched 4-4-2 sides) and pins them as goldens before any example uses them; if one differs, the examples change with it |
| N-3 opponent-scorer rule could be read as black-box for matchdays 2-14 | No change: D3 states it is black-box for matchday 1 only; the plan run's protected scenarios follow D3 |
| N-4 rapid double tap is argued, not tested in the DOM | Accepted for DISTILL: an e2e double-click on "Play match" expects the match screen of exactly one new matchday |

## Wave: DESIGN

- **Setup**: mode propose; scope application; one solo developer plus the unattended factory, so no Conway constraint. Paradigm: functional core, imperative shell (ADR-0003; recorded in the ADRs and the brief, not in CLAUDE.md). Unattended run; no questions asked.
- **New ADR**: `docs/product/architecture/adr-0014-season-progression-from-the-record.md` (next matchday derived from the record; the match screen shows the latest match; the generalised side builder; the 390px budget; the supersession of ADR-0012's re-show and its dependents; the correction of ADR-0013 Earned Trust 1). ADR-0012 and ADR-0013 get a one-line "Superseded in part by ADR-0014" note in their status lines, nothing else.
- **Brief**: `docs/product/architecture/brief.md` gains the "Season progression (S-008, ADR-0014)" subsection, updated effect-isolation, inventory and L2 text, struck-through now-false S-007 lines, and "For Acceptance Designer" ports 29-31 plus the S-008 observable bullet.
- **No new C4 container** and no new file: the diff is in `src/app/state.ts` (and tests). The domain, the UI renderers, `main.ts` and `styles.css` do not change.
- **Library check**: no library involved (no new dependency; web-platform facts only: `getComputedStyle().display` of table parts, Playwright `getByRole` semantics). No Context7 lookup applies; none was run.
- **Outcome collision check**: S-008 registers no outcome (no new typed contract beyond brief ports 29-31), as S-006/S-007. The `nwave-ai outcomes check-delta` result is recorded under Open questions.

### Wave: DESIGN / [REF] DDD list
- **No new context.** "Match" (schedule, model, matchday) and "Standings" are unchanged; the app-layer "season record" (the append-only `results` list of ADR-0012) now grows to 14 matchdays. No new aggregate: `results` stays a log of facts, not an aggregate with behaviour.
- **Language** (extends the DISCUSS glossary): Matchdays played (the last recorded entry's `matchday`, 0 when none), Next matchday (`nextMatchday`), Season over (`nextMatchday` is `undefined`), Latest match (the managed club's last recorded entry), Side builder (`playMatchdayFor`).
- **Value objects**: unchanged (`PlayedMatch`, `StandingRow`, `MatchView`).
- **Invariants by construction / by test**:
  - The record is append-only, in matchday order, 4 entries per matchday, at most 56; earlier entries are never replaced (the new list shares the old objects).
  - Next matchday, match screen and table are all functions of `results`, so they cannot disagree.
  - Each fixture is its own stream, so appending matchday N + 1 cannot change matchday N; with untouched tactics every side is an automatic 4-4-2, so the record is the same whichever club is managed.
  - Standings invariants (W = L in total, D even, GD 0, Pts = 3W + D) hold for any prefix of the season.

### Wave: DESIGN / [REF] Decisions
| # | Decision | Source |
|---|---|---|
| DD1 | **Next matchday is derived from the record**: `nextMatchday(state)` = the last recorded entry's `matchday` (0 when nothing is recorded) + 1, `undefined` when that exceeds `MATCHDAYS`. No new `GameState` field. It takes the `GameState` (not the results list) like the S-005..S-007 selectors `currentXI`, `matchFor`, `standingsOf` (one signature style); a property (changing `screen`, `formation` or `xi` leaves its result unchanged) carries the purity claim.<br>Rejected: a stored counter (a second fact that can disagree with `results`; reset in `NewGame`; two fields to validate in a save); `results.length / 4` (encodes the shape as arithmetic). | ADR-0014 (1); DISCUSS D1 |
| DD2 | **The match screen shows the managed club's latest recorded match**: `matchFor` returns the last entry that involves the club (via `filter` then `at(-1)`; the lib is ES2022, no `findLast`). `Screen`, `focusPlan`, `MatchView`, `renderMatch` and `main.ts` unchanged. The after-14 re-show then needs no rule in the screen.<br>Rejected: `{ kind: "match", clubId, matchday }` (breaks the 17 occurrences in 3 unedited S-006/S-007 acceptance files that D11 does not let us edit, grows `sameScreen`, allows a screen for an unrecorded matchday); a `lastMatch` pointer (second source). | ADR-0014 (2); DISCUSS D3, D7 |
| DD3 | **`PlayMatch` appends**: from a known club's home, `results` = old list + the 4 entries of `playMatchdayFor(state, clubId, nextMatchday)` (a new array; earlier entries the very same objects, D5). After matchday 14: `screen` becomes the match and `results` is the very same array (D7). No new action; `update` keeps its 12 switch cases (complexity 13 of 15). Check order of `playMatchdayFor`: unknown club gives `undefined` first, then `RangeError` on a bad matchday; for a known club an `undefined` result is unreachable, and `PlayMatch` would then be a no-op returning the same state. | ADR-0014; DISCUSS D1, D5, D7 |
| DD4 | **One side builder**: `playMatchdayFor(state, clubId, matchday)` (3 parameters) owns the policy (Sam's `currentXI`, every other side `automaticXI(squad, DEFAULT_FORMATION)`); `playOpeningMatchday(state, clubId)` stays as its application to `OPENING_MATCHDAY`, and `OPENING_MATCHDAY` stays (first tap and `matchFor` fallback).<br>Rejected: retiring both (edits the 8 occurrences in 2 unedited S-006/S-007 acceptance files; no gain); a second producer `playNextMatchday` (the policy twice). | ADR-0014 (3); ADR-0012 reviewer L9; DISCUSS D2 |
| DD5 | **No domain change and no new stream**: `playMatchday` and `playMatch` serve matchdays 1..14 on streams 200..255; 204..255 are used in play for the first time, so the seed-31 season goldens are the independent check. | ADR-0011; ADR-0014; DISCUSS D2, D9 |
| DD6 | **Table: no code or CSS change.** Budget at 390px (358px content): numeric columns about 201px (Pos 30, P/W/D/L 26 each, GD 35, Pts 32), Club cell about 157px, `overflow-wrap: anywhere`, so the table cannot overflow; the e2e proves it after 14 matchdays at `?seed=31` and `?seed=abc`. Ladder if it fails: headers 0.8rem and body 0.9rem, then cell padding 3px; never a `display` override or a fixed width.<br>Rejected: pre-emptive tightening (no evidence); `table-layout: fixed` with `colgroup` (ADR-0013 6B). | ADR-0014 (4); ADR-0013 (6); DISCUSS D6, D10 |
| DD7 | **ADR-0012 is superseded in part** (nine quoted points, ADR-0014 "What this supersedes") by a new ADR, with one-line status notes on ADR-0012 and ADR-0013; nothing else in either is edited. | ADR-0014 (5); DISCUSS DoD |
| DD8 | **ADR-0013 Earned Trust 1 corrected**: role counts do not see a `display` value that keeps the element in the accessibility tree (`block`, `flex`, `grid`, `inline` and the like), while `display: none` removes it from the counts; the computed-display probe covers every value: the S-008 e2e reads `getComputedStyle(el).display` of table, thead, tbody, tr, th, td (`table`, `table-header-group`, `table-row-group`, `table-row`, `table-cell`, `table-cell`). Closes the S-007 open question F-1. | ADR-0014; `docs/feature/S-007/open-questions.md` |
| DD9 | **Known gap D7 stays in the app, not the data**: `nextMatchday` returning `undefined` is the hook for the end-of-season story, which replaces one branch of `PlayMatch`. It is not pinned in `tests/protected/S-008/`; e2e and unit tests check it. `state.ts` grows to about 290 of 400 lines; that story should split the season selectors into `src/app/season.ts`. | ADR-0014; DISCUSS D7, D12 |
| DD10 | **Unchanged on purpose**: club home (five buttons), `renderMatch`, `renderTable`, `styles.css`, `main.ts`, `focusPlan`, `back`, `NewGame`, `standingsOf`, the schedule, the names (no new accessible name, D14). | DISCUSS D8, D14 |

### Wave: DESIGN / [REF] Component decomposition
| Path | Change | Responsibility | Indicative lines |
|---|---|---|---|
| `src/app/state.ts` | EXTEND | `nextMatchday` (new, exported); `playMatchdayFor` (generalises the 8-sides builder); `playOpeningMatchday` becomes its one-line application; `playMatchAction` appends or keeps; `matchFor` reads the latest entry; import `MATCHDAYS`; field comment | 42 |
| `src/main.ts`, `src/ui/**`, `src/domain/**`, `src/ui/styles.css` | UNCHANGED | `main.ts` already maps `MatchView.matchday` to the h1 (the DISCUSS 5-line `main.ts` item is not needed) | 0 |

**Code total**: about 42 lines, against 45 in DISCUSS.

| Test file (DISTILL) | Contents | Lines |
|---|---|---|
| `tests/acceptance/S-008/season.test.ts` | `nextMatchday` table (0..56 entries), boundary 13 to 14 to none, and the property that changing `screen`, `formation` or `xi` leaves it unchanged; `PlayMatch` appends exactly the 4 entries of `playMatchdayFor` (earlier entries `toBe`), after 14 the same array; no-ops (other screens, unknown club); `NewGame` clears; `playMatchdayFor` equals `playMatchday` with Sam's `currentXI` and the others' automatic 4-4-2, `RangeError` table, unknown club first (even with a bad matchday), `playOpeningMatchday` equals matchday 1; `matchFor` latest and after-14, fallback cases untouched; goldens (seed-31 14 score lines, rows after 2, 3, 14; `?seed=abc` Oakhampton Rise Borough); schedule seen from every club (7 opponents once, mirror N + 7); fast-check over seeds, clubs, formations, picks, N = 1..14: row rules, totals, managed row = sum of its score lines, per-matchday delta, opponent scorers non-GK of their squad, managed scorers in `currentXI` never the GK slot; 40-action property (record grows only by `PlayMatch` from a home, 4 at a time, at most 56); record identical whichever club is managed; determinism | 220 |
| `tests/e2e/S-008-season.spec.ts` | Focus on each heading ("Matchday 1" to "Matchday 14" over 28 taps, `test.slow()`); 44px; the 14 goldens read in Chromium vs the Node-pinned values; a team change between taps; after-14 re-show and table P 14; after a `dblclick` on "Play match" at k matchdays played (k from 0 to 13; at k = 14 the record is unchanged and P stays 14) the screen is the match screen of matchday k + 1 or the club home, and "Table" shows P = k + 1 on every row, never k + 2 (layout-dependent second click, so only that is asserted); no sideways scroll (document and table `scrollWidth`) on the 14-matchday table at `?seed=31` and `?seed=abc`; computed `display` of table, thead, tbody, tr, th, td (DD8); no console errors | 157 |
| Amended S-006/S-007 tests (D11) | As DISCUSS D11 except the `OPENING_MATCHDAY is 1` case (S-006 `match-navigation.test.ts` line 203), which stays because the constant stays: 3 acceptance cases and 2 properties, 2 e2e read helpers, 4 e2e second-tap blocks, 3 header comments | 86 |
| **Tests total** | | **463** |

**DELIVER total**: about 505 changed lines (42 code + 463 tests), against 500 in DISCUSS; about 695 with the plan run's 190 protected lines. Far under the factory's hard limit of about 1200 per PR (target at or under 1100): headroom is about 500 lines (1200 - 695), about 400 against the 1100 target even counting the protected lines. Basis of the 220-line acceptance estimate (the DISCUSS figure, re-derived): `nextMatchday` table, boundary and independence property 25; append and after-14 and no-ops 35; `playMatchdayFor` 25; `matchFor` latest and fallback 20; goldens 35; schedule per club 20; fast-check season properties 50; 40-action property and determinism 10. If DELIVER runs over, the cut order is: (1) the `?seed=abc` rows of the e2e walk; (2) the double-click e2e (units cover the logic); (3) the 40-action property (the unit cases carry it).

### Wave: DESIGN / [REF] Driving ports
- **App** (pure): `update` with `PlayMatch` (appends), `nextMatchday`, `playMatchdayFor`, `playOpeningMatchday`, `matchFor` (latest match), `standingsOf`, `focusPlan` (unchanged).
- **Domain** (unchanged): `playMatchday` for matchdays 1..14, `fixturesOf`, `fixtureOf`, `standings`, `formatGoalDifference`.
- **Browser**: club home "Play match" (k-th tap, matchday k) to the match screen (h1 "Matchday k", score line, "Goals", "Back"); "Table" (every row P = matchdays played).
- Detail, signatures and properties: brief, "For Acceptance Designer", ports 29-31.

Exact signatures for the acceptance designer:
- `nextMatchday(state: GameState): number | undefined`
- `playMatchdayFor(state: GameState, clubId: string, matchday: number): readonly PlayedMatch[] | undefined`
- `playOpeningMatchday(state: GameState, clubId: string): readonly PlayedMatch[] | undefined` (kept)
- `matchFor(state: GameState, clubId: string): MatchView | undefined` (kept; latest match)
- `standingsOf(state: GameState): readonly StandingRow[]` (kept)
- `update(state: GameState, action: Action): GameState` (kept; `PlayMatch` semantics change)
- `GameState`, `Screen`, `Action`, `PlayedMatch`, `MatchView`, `StandingRow`: unchanged shapes.

### Wave: DESIGN / [REF] Driven ports and adapters
None new: no storage, clock or network. The record still lives in memory for the page's life. Environment assumptions are named and probed (ADR-0014 Earned Trust):
1. **Chromium vs Node determinism over the whole season** (streams 204..255 first run in a browser): the 14-tap walk at `?seed=31` equals the Node-pinned goldens. WebKit and iOS Safari are not probed. Fault: an approximated function in `match.ts` (the grep test also covers it).
2. **The record is neither lost nor doubled**: append property; double-click e2e (only the layout-independent claim: after a `dblclick` at k matchdays played (k from 0 to 13; at k = 14 the record is unchanged and P stays 14) the screen is the match screen of matchday k + 1 or the club home, and the table then shows P = k + 1 on every row, never k + 2). Fault: a second tap landing on the same club home (impossible: the match screen has no "Play match", and `dispatch` is synchronous).
3. **390px fit with two-digit values**: document and table `scrollWidth` after 14 matchdays at `?seed=31` and `?seed=abc`. Faults: `overflow-wrap` removed, a fixed width, `nowrap` removed from a header.
4. **Native table display survives the CSS** (the corrected ADR-0013 probe): computed `display` of each table part. Fault: any `display` override.
5. **Future persistence** (not this story) is the first real adapter and gets its own `probe()` and shape validator; `results` is unchanged JSON-able data, and the matchday needs no save field.

No external integrations, so no contract tests.

**Enforcement**:
- Style: modular monolith, functional core and imperative shell. Tool: oxlint with the existing `.oxlintrc.json` boundaries (domain imports no app or ui; app imports no ui); `max-params` 3 (`playMatchdayFor` has exactly 3); `complexity` 15 (`update` 13; the changed functions under 8); `max-lines` 400 (`state.ts` about 290).
- Stryker's existing globs cover `state.ts` and `src/domain/**`; no config change. Mutants to kill: the cap `<=`, `+ 1`, `?? 0`, `at(-1)` versus `at(0)`, append versus prepend.
- Existing grep tests stay (no `.focus(` under `src/ui/`; no `localeCompare` in `standings.ts`; no `Math.pow`/`exp`/`log`/`**` in `match.ts`; one `dispatch(` in `table.ts`). The PR guard still rejects `Math.random`, `Date.now` and `new Date(` in `src/domain/`.

### Wave: DESIGN / [REF] Technology choices
- Unchanged (ADR-0001, 0002, 0003 apply; all OSS: TypeScript, Vite, Vitest, fast-check, Playwright, oxlint, Stryker, MIT or Apache-2.0). No new dependency. `Array.prototype.at` is ES2022 (the configured lib).
- No DOM test environment is added; the screens are covered by the e2e.

### Wave: DESIGN / [REF] Reuse Analysis
| Existing Component | File | Overlap | Decision | Justification / contract shape |
|---|---|---|---|---|
| `playMatchday`, `playMatch`, `matchStream`, `PlayedMatch` | `src/domain/match.ts` | The 4 fixtures of any matchday 1..14 | REUSE unchanged | Pure return-only; streams 200..255 already reserved; no domain change |
| `fixturesOf`, `fixtureOf`, `MATCHDAYS`, `FIXTURES_PER_MATCHDAY` | `src/domain/schedule.ts` | Opponents and the cap | REUSE unchanged | Frozen data (ADR-0010); `MATCHDAYS` is the cap in `nextMatchday` |
| `standings`, `formatGoalDifference`, `standingsOf` | `src/domain/standings.ts`, `state.ts` | The table over the whole record | REUSE unchanged | Pure return-only; already a function of any list of results |
| `playOpeningMatchday`, `OPENING_MATCHDAY`, `sideFor` | `src/app/state.ts` | The 8-sides builder for matchday 1 | EXTEND (generalise to `playMatchdayFor`; keep the two names as the application to matchday 1) | Pure return-only; universe = the returned array; deep-equal to `playMatchday` with the policy sides, frozen state unchanged, `RangeError` table. Single owner of the side policy |
| (none for the season cursor) | `src/app/state.ts` | Which matchday is next | CREATE NEW `nextMatchday` (a function, not state) | No selector for it exists; deriving from `results` adds no field. Pure return-only; universe = a number or `undefined`; table over 0..56 entries, boundary tests |
| `playMatchAction` | `src/app/state.ts` | Recording on a tap | EXTEND (append instead of set-once) | Bounded-change: universe `{ league, screen, formation, xi?, results? }`; `screen` becomes the match; `results` = old + 4 entries (earlier `toBe`) or the very same array after 14; `toEqual`, `toBe` for no-ops, deep-freeze, 40-action property |
| `matchFor`, `MatchView`, `sideViewOf` | `src/app/state.ts` | Which recorded match the screen reads | EXTEND (latest entry of the club) | Pure return-only; the S-006 cases and the fallback-equivalence property stay unedited |
| `update`, `back`, `focusPlan`, `sameScreen`, `newGame` | `src/app/state.ts` | Navigation and reset | REUSE unchanged (the `PlayMatch` case changes through the `playMatchAction` EXTEND row above) | `Screen` and `Action` do not change; `update` keeps its 12 switch cases (complexity 13 of 15) |
| `renderMatch`, `renderTable`, `renderClubHome`, `el()` | `src/ui/` | Screens | REUSE unchanged | Bounded-change universes as in ADR-0011/0013; `renderMatch` already prints `Matchday ${matchday}` |
| `main.ts` | `src/main.ts` | Render switch | REUSE unchanged | The ADR-0003 imperative shell (render, `applyFocus`, `dispatch`): side-effecting by design, no closed-world assertion claimed. S-008 behaviour unchanged, no new render case; covered by the bounded-change universes of `update` and the pure `matchFor`, and verified by the e2e |
| `.standings` rules | `src/ui/styles.css` | Two-digit values at 390px | REUSE unchanged (verified by budget, proved by e2e) | Contract shape: not applicable (static CSS); budget argued and probed by the e2e. No `display` override; the Club cell wraps |
| S-001..S-007 acceptance, e2e and protected tests | `tests/` | Regression | REUSE unchanged, except the D11 amendments | Protected tests tap "Play match" once per page (D11), so none needs an edit |
| (none) | `tests/acceptance/S-008/`, `tests/e2e/S-008-season.spec.ts` | Season tests | CREATE NEW | No S-008 test exists; the D11 amendments cover the superseded ones |

### Wave: DESIGN / [REF] Changed Assumptions
- **ADR-0012** (`docs/product/architecture/adr-0012-recorded-matchday-results.md`), Context D2, quoted: "A second "Play match" re-shows the recorded matchday-1 match (this version only)." Superseded by ADR-0014: a second tap plays matchday 2; the re-show survives only after matchday 14 (DISCUSS D7).
- **ADR-0012**, Decision, App, quoted: "So the first tap records, and any later tap leaves `results` as it is (the re-show, D2)." Superseded: each tap appends the next matchday.
- **ADR-0012**, quoted: "Once present it is the full set of recorded matches: 4 entries (matchday 1) in this story." Superseded: 4 entries per matchday played, 4 to 56.
- **ADR-0012**, quoted: "It is the only producer of recorded results." Superseded: `playMatchdayFor` is the producer; `playOpeningMatchday` is its application to matchday 1.
- **ADR-0012**, quoted: "`OPENING_MATCHDAY = 1` stays. The season story replaces its uses by a matchday held in state." Not done as foreseen: the matchday is derived from the record, not held in state, and `OPENING_MATCHDAY` stays (first tap and `matchFor` fallback).
- **ADR-0012**, quoted: "Its single owner is `playOpeningMatchday` (the side builder in `state.ts`, using the `DEFAULT_FORMATION` constant); no other code restates it." The owner is now `playMatchdayFor`; the policy is unchanged.
- **ADR-0013** (`docs/product/architecture/adr-0013-league-standings-and-table-screen.md`), Earned Trust 1, quoted: "Faults: `display: block` on a `tr`, or `scope` missing, drops roles and turns the counts red." Wrong for `display` (S-007 open questions F-1); corrected in ADR-0014 (computed `display` probe).
- **S-007 feature-delta** (`docs/feature/S-007/feature-delta.md`), DESIGN Open questions, quoted: "The season story replaces it with "play the next matchday" by appending to `results` and keeping a matchday in state; `OPENING_MATCHDAY` then goes away." Refined: appending yes; no matchday in state; the constant stays.
- **S-007 feature-delta** D18, quoted: "is an app-level policy owned by `playOpeningMatchday` alone; the season story revisits it." The policy is kept (AI formations are OUT, DISCUSS D12); its owner is `playMatchdayFor`.
- **This file, DISCUSS line budget**, quoted: "`src/main.ts` (heading reads the recorded matchday, if not already)". It already does (`matchScreenView` maps `matchday`; `renderMatch` prints it), so `main.ts` is not touched.
- **This file, DISCUSS D11**, quoted: "line 203 (`OPENING_MATCHDAY` is 1): only if DESIGN retires the constant". DESIGN keeps the constant, so that case needs no amendment (4 lines fewer).
- **This file, DISCUSS Technical notes**, quoted: "the next matchday may be derived from the record (DESIGN's call: no new state field is required by the AC)". Confirmed: derived.
- **Brief**: the S-007 lines that said `playOpeningMatchday` is the only producer, that later taps re-show, that `results` is the same array once set, and the S-007 observable bullet on a second "Play match" are struck through with a pointer to ADR-0014.
- No change to the roadmap outcome text.

### Wave: DESIGN / [REF] Open questions
- **None blocking.**
- **`nwave-ai outcomes check-delta docs/feature/S-008/feature-delta.md`** (CLI present at `~/.local/bin/nwave-ai`): "0 outcomes checked, 0 collisions found across 0 outcomes", exit 0. Consistent with S-008 registering no outcome.
- **Goldens** (seed-31 season, rows after matchdays 2, 3, 14, `?seed=abc` season): computed by the DISCUSS orchestrator from the model; DISTILL reproduces them by running `playMatchday` with untouched 4-4-2 sides and pins them RED-first; if one differs, the examples change with it. DELIVER never re-pins from its own output.
- **390px** is argued by arithmetic (DD6) and proved only by the e2e; the fallback ladder is in ADR-0014. `aria-current` bold digits add about 9px to the numeric columns; included in the budget margin.
- **Rapid double tap**: argued (the match screen has no "Play match"; `dispatch` is synchronous), tested by the e2e double-click (DISCUSS N-4) with a layout-independent expectation: the second click of a `dblclick` may land on "Back", so the screen is either the match screen of matchday k + 1 or the club home, and the table then shows exactly one more matchday (P = k + 1); never two.
- **`tests/protected/S-008/` is written later in this same plan run (after DEVOPS)**, not in DESIGN or DELIVER. It must not pin the after-14 re-show, the goals-scored and club-name tie-breaks, or tap "Play match" twice expecting a re-show; it follows DISCUSS D3 (opponent scorers black-box for matchday 1 only) and D13 (durable promises).
- **`nextMatchday` assumes the append-only, matchday-ordered shape** of `results`; a hand-built partial list would give a wrong next matchday. Not reachable through `update`; the 40-action property and the table test guard the shape.
- **End of season**: the successor story reads `nextMatchday(state) === undefined`, replaces one branch of `PlayMatch`, and should split `state.ts` (about 290 of 400 lines) into `src/app/season.ts`. Its screen, "play again" and top scorer need their own ADR.
- **Persistence** (a later story) still needs a probe, a shape validator and a save version; the matchday needs no field.
- **Outcome trace**:
  - "Play match" plays the next matchday, h1 "Matchday N" focused: DD1, DD2, DD3.
  - Score line and "Goals" formats for every N, "Back": DD2, DD10 (renderers unchanged).
  - Sam's XI at the tap, others automatic 4-4-2, no new stream: DD4, DD5.
  - Schedule seen from the club: DD5 (ADR-0010 frozen, tests per club).
  - Recorded results never change: DD3 (earlier entries the same objects).
  - Table reads the whole record, per-matchday delta, two-digit fit: DD6, DD10.
  - Same seed same season: DD5.
  - After matchday 14: DD3, DD9.
- **Handoff for DISTILL**:
  - Properties and checks: brief ports 29-31 and the ADR-0014 Consequences; test files and lines in Component decomposition.
  - Goldens: the 14 score lines and Netherwold Borough's rows after matchdays 2, 3 and 14 (DISCUSS "User stories"), `?seed=abc` Oakhampton Rise Borough matchday 1 (0–1 away at Harrowgate Lane United) and matchday 2 (home to the 2nd club of its list).
  - D11 amendments: replace, never weaken; the `OPENING_MATCHDAY is 1` case stays. The pending-then-activate pattern of S-006/S-007 applies, in the same commit as the production change.
  - Locators: `exact: true` for "Play match", "Back", "Table", the heading and the table "League table".
  - e2e: the 28-tap walk (`test.slow()`), the double-click (layout-independent expectation above), the after-14 re-show (not protected), no sideways scroll, computed `display` of the table parts.
  - The protected scenarios must not pin the after-14 re-show or the goals-scored and club-name tie-breaks.
- **Contract-test annotation**: no external integrations; none recommended.

### Wave: DESIGN / [REF] Peer review
`nw-solution-architect-reviewer`, cycle 1: **conditionally_approved** (H-1, M-1..M-4, L-1..L-7). Revision applied as below (docs only). Cycle 2: **approved** (0 critical, 0 high, 0 medium). Its lows: R-1 double-click expectation bounded to k = 0..13 (at k = 14 the record is unchanged, P stays 14), applied in ADR-0014, this section and the brief; R-2 the brief's main.ts row now marks the S-007 label as superseded; R-3 tests/protected/S-008/ is written later in this plan run and must obey D3, D7 and D13 (checked at the plan commit).

| Finding | Disposition |
|---|---|
| H-1 `main.ts` labelled unbounded-preservation | Relabelled as the ADR-0003 imperative shell (render, `applyFocus`, `dispatch`): no closed-world assertion claimed; S-008 behaviour unchanged, covered by the bounded-change universes of `update` and the pure `matchFor`, and verified by the e2e. Changed in ADR-0014 contract shapes, this section's Reuse row and the brief's effect table (S-007 label kept in the row for history) |
| M-1 ADR-0013 correction too broad | Restated in ADR-0014, DD8, the brief (3 places) and the ADR-0013 status note: role counts do not see a `display` value that keeps the element in the accessibility tree (`block`, `flex`, `grid`, `inline`...), while `display: none` removes it from the counts; the computed-display probe covers every value. The unsourced mechanism sentence is dropped |
| M-2 double-click expectation layout-dependent | ADR-0014 Earned Trust 2, Driven ports, test row, Open questions, handoff and the brief: after a `dblclick` at k played, the screen is the match screen of k + 1 or the club home, and the table shows P = k + 1 on every row; never two |
| M-3 protected S-008 written later | Open questions: written later in this plan run (after DEVOPS); must not pin the after-14 re-show, the goals-scored and club-name tie-breaks, or two taps expecting a re-show |
| M-4 `nextMatchday(state)` signature | Kept, with the reason (the S-005..S-007 selectors take the state; one signature style) in ADR-0014, DD1 and the brief; added the property that changing `screen`, `formation` or `xi` leaves its result unchanged (ADR-0014 contract shapes, brief port 30, test row) |
| L-1 `update` cases | "12 switch cases, complexity 13 of 15" in ADR-0014, DD3, the Reuse row and the brief (which had said 13 cases) |
| L-2 check order and narrowing | ADR-0014 Decision (App), DD3, brief port 30: `playMatchdayFor` checks the club first (`undefined`), then the matchday (`RangeError`); for a known club an `undefined` result is unreachable and `PlayMatch` would be a no-op returning the same state; test rows added |
| L-3 styles.css and `update` rows | Reuse row for `styles.css`: "contract shape: not applicable (static CSS); budget argued and probed by the e2e" (also in ADR-0014); the `update` row points to the `playMatchAction` EXTEND row |
| L-4 literal counts | "17 occurrences in 3 unedited files" (the `{ kind: "match", clubId }` literal) replaces "about 15" in ADR-0014 and DD2; "8 occurrences in 2 files" (`playOpeningMatchday`, `OPENING_MATCHDAY`) replaces "at least 8 lines" in ADR-0014 and DD4. Both re-counted by grep |
| L-5 headroom and estimate basis | Headroom stated (about 500 lines under 1200; about 400 under the 1100 target, protected lines counted); the 220-line basis is itemised; cut order kept |
| L-6 ADR status | "Accepted (after nw-solution-architect-reviewer cycle 1 ... see the S-008 feature-delta Peer review)" |
| L-7 brief Technology | Added "No library is involved in S-008 either (no new dependency)." |
