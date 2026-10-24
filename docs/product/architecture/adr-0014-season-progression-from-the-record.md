# ADR-0014: Season progression read from the record (S-008)

- Status: Accepted
- Date: 2026-10-24
- Deciders: nWave solution-architect (S-008 DESIGN, `interaction_mode=propose`)
- Related: ADR-0003 (functional core), ADR-0008 (focus plan), ADR-0009 (optional state field, `toEqual` constraint), ADR-0010 (schedule, 14 matchdays), ADR-0011 (streams 200..255), ADR-0012 (the record this extends), ADR-0013 (standings and table, which already read any list of results).
- **Supersedes in part ADR-0012** (quoted under "What this supersedes") and **corrects the Earned Trust 1 wording of ADR-0013**. Everything else in ADR-0012 and ADR-0013 stands: `PlayedMatch`, `playMatchday`, the append-only list, `NewGame` dropping `results`, the no-new-stream rule, the standings rules, the table markup and CSS rules.

## Context
S-008 turns "Play match" into the season (DISCUSS D1-D14). The binding rules:
- **D1**: each "Play match" from a known club's home plays the next matchday (matchdays played + 1) for the whole league, records its 4 results after the ones already recorded, and shows the match screen. The first tap of a new game is matchday 1.
- **D3**: the match screen shows Sam's latest match, h1 "Matchday N".
- **D5**: recorded results never change; earlier entries stay as they are when a matchday is appended.
- **D7** (this version only, a named known gap): after matchday 14 a further "Play match" shows the matchday-14 match again and records nothing. Not pinned in `tests/protected/S-008/`.
- **D6, D10**: the table reads the whole record; with two-digit P, W, D, L, GD and Pts it still fits 390px.
- **D9**: no persistence yet; the season is a pure function of the seed and Sam's formation and XI at each tap. No new RNG stream.

Facts checked in the code:
- `GameState` is `{ league, screen, formation, xi?, results? }`. `results` is optional because whole-state `toEqual` assertions (ADR-0009, ADR-0012) treat a `null` or `[]` as different from a missing key.
- Every `PlayedMatch` carries its `matchday`; the list is append-only and in matchday order, 4 entries per matchday.
- `playMatchday` already accepts matchdays 1..14 (`fixturesOf` throws `RangeError` outside) and `playMatch` uses stream `200 + (matchday - 1) x 4 + fixtureIndex`, so matchday 14 fixture 3 is stream 255. No domain change is needed.
- `playOpeningMatchday` and `OPENING_MATCHDAY` are imported by unedited S-006/S-007 acceptance tests (`match-navigation.test.ts`, `table-navigation.test.ts`); `matchFor`'s fallback over `playOpeningMatchday` is exercised by about 12 S-006 cases on states with no results and by the S-007 fallback-equivalence property.
- `main.ts` already maps `MatchView.matchday` to the h1 (`Matchday ${matchday}`); `renderMatch` and `renderTable` need no change.
- `.oxlintrc.json`: `max-params` 3, `complexity` 15, `max-lines` 400. `state.ts` is 256 lines. `tsconfig` lib is ES2022 (`Array.prototype.at` yes, `findLast` no).
- `#app` is `max-width: 480px` with 16px side padding: 358px of content at 390px.

### What this supersedes (ADR-0012, quoted)
1. Context D2: "A second "Play match" re-shows the recorded matchday-1 match (this version only)." Now: a second "Play match" plays matchday 2. The re-show survives only after matchday 14 (D7).
2. Decision, App: "`PlayMatch` ... sets `results` to `state.results ?? playOpeningMatchday(state, clubId)`. So the first tap records, and any later tap leaves `results` as it is (the re-show, D2)." Replaced by the append rule below.
3. Decision, App: "Once present it is the full set of recorded matches: 4 entries (matchday 1) in this story." Now 4 entries per matchday played, 4 to 56.
4. Decision, App: "`playOpeningMatchday` ... It is the only producer of recorded results." The only producer is now `playMatchdayFor`; `playOpeningMatchday` stays as its application to `OPENING_MATCHDAY`.
5. Decision, App: "`OPENING_MATCHDAY = 1` stays. The season story replaces its uses by a matchday held in state." Not done: the matchday is derived from the record, not held in state. `OPENING_MATCHDAY` stays, as "the matchday of the first tap and of `matchFor`'s fallback".
6. Decision, App, policy: "Its single owner is `playOpeningMatchday` (the side builder in `state.ts` ...)". The single owner is now `playMatchdayFor`. The policy itself (Sam's side `currentXI`, every other side `automaticXI(squad, DEFAULT_FORMATION)`) is unchanged.
7. Decision, App, `matchFor`: "the entry of `state.results ?? playOpeningMatchday(state, clubId)` with `matchday === OPENING_MATCHDAY` that contains the club's index". Now the club's entry of the highest recorded matchday.
8. Contract shapes, `update`: "only `screen` and, on the first tap, `results` change" and "property: any run of up to 40 actions never changes `results` once set except by `NewGame`". Now `results` changes only by `PlayMatch` from a known club's home, by appending exactly 4 entries (until 14 matchdays are recorded), and by `NewGame`.
9. Earned Trust 2: "first tap sets 4 entries; any later action keeps the same array object (`toBe`)". Now: a tap appends 4 and keeps the earlier entries as the very same objects; any other action, and a tap after matchday 14, keep the same array object.

## Options

### 1. How the next matchday is determined
| Option | Pros | Cons |
|---|---|---|
| **A. Derived from the record: the highest recorded matchday (the last entry's `matchday`, 0 when nothing is recorded) plus 1, and none when that exceeds `MATCHDAYS` (chosen)** | No new state, so `initialState`, the optional-field constraint and every whole-state assertion are untouched. One source of truth: it cannot disagree with the table or the match screen. A future save is still `{ seed, formation, xi, results }`. The "season over" state is a value (`undefined`), which the end-of-season story reads | Relies on the list being append-only in matchday order (already ADR-0012's invariant, now a property test) |
| B. A stored counter `matchday?: number` in `GameState` | O(1) read | A second fact that can disagree with `results` (a partial record, a reload that restores one and not the other); must be reset by `NewGame`; two fields to validate in a save; no benefit at 56 entries |
| C. `results.length / FIXTURES_PER_MATCHDAY` (or count of distinct matchdays) | Also derived | Encodes the "4 per matchday" shape as arithmetic and breaks on any partial list; the distinct count is O(n) for a number the last entry already holds |

### 2. What the match screen shows and how `matchFor` reads it
| Option | Pros | Cons |
|---|---|---|
| **A. The managed club's latest recorded match: the last entry of the record that involves the club (chosen)** | `Screen` unchanged, so `focusPlan`, `sameScreen`, `back` and about 15 unedited S-006/S-007 `{ kind: "match", clubId }` literals stay valid. After matchday 14 the re-show (D7) is not a rule in the screen: `PlayMatch` records nothing and the latest match is still 14. `MatchView` and `main.ts` unchanged | The screen cannot show an older match (not wanted: a results list is a later story) |
| B. `{ kind: "match", clubId, matchday }` | The screen names what it shows; ready for "view an old match" | Changes the `Screen` union: breaks the type and `toEqual` of the S-006/S-007 literals that D11 does not allow us to edit; `sameScreen` grows a field; a screen can name an unrecorded matchday (a new invalid state to guard) |
| C. A `lastMatch` pointer in state | Direct | A second source beside `results` |

### 3. Who builds a matchday's sides
| Option | Pros | Cons |
|---|---|---|
| **A. Generalise the builder to `playMatchdayFor(state, clubId, matchday)`; keep `playOpeningMatchday(state, clubId)` as its one-line application to `OPENING_MATCHDAY`, and keep `OPENING_MATCHDAY` (chosen)** | One owner of the side policy. The S-006/S-007 imports (`playOpeningMatchday`, `OPENING_MATCHDAY`) and the `matchFor` fallback stay as they are, so no extra test edit beyond D11 (the D11 `OPENING_MATCHDAY is 1` amendment is not needed). 3 parameters, within `max-params` | One alias function whose only caller is the fallback and tests |
| B. Retire `playOpeningMatchday` and `OPENING_MATCHDAY`; a `playNextMatchday(state, clubId)` that computes its own matchday | Fewest names | The fallback in `matchFor` needs "matchday 1" anyway; edits at least 8 lines of unedited S-006/S-007 tests that import the retired names; no behavioural gain |
| C. Add `playNextMatchday` next to an unchanged `playOpeningMatchday` | No existing line moves | Two producers, so the side policy would be stated twice (the ADR-0012 reviewer L9 concern) |

### 4. Table fit at 390px with two-digit values
Budget with the shipped CSS (body 1rem = 16px, tabular digits about 9px, header 0.85rem bold, cell padding 4px each side, `td:last-child` left padding 8px, content width 358px). Header texts are `nowrap`, so each column is the wider of its header and its widest value:

| Column | Header | Widest value | Width |
|---|---|---|---|
| Pos | "Pos" about 22px | "8" 9px | about 30px |
| P, W, D, L | 8 to 12px | "14" 18px | about 26px each, 104px |
| GD | "GD" about 20px | "+12", "-15" about 27px | about 35px |
| Pts | "Pts" about 20px | "42" 18px | about 32px (12px padding) |
| Numeric total | | | about 201px |
| **Club cell (rest)** | | | **about 157px of 358px** |

A bold managed-club row widens digits by about 10% (about 9px in total). The Club cell is `overflow-wrap: anywhere`, so its minimum width is one character and the table cannot be forced wider than 358px: the numeric columns alone are about 210px. The longest names ("Oakhampton Rise Borough", about 177px) wrap onto two lines.

| Option | Pros | Cons |
|---|---|---|
| **A. No CSS change; prove it with the e2e `scrollWidth` check after 14 matchdays at `?seed=31` and `?seed=abc` (chosen)** | Zero diff; ADR-0013 option 6A already chose content-sized numeric columns "as a season grows"; evidence-driven | The budget is arithmetic; the e2e is the proof. If it fails, the ladder is: headers 0.8rem, body 0.9rem (ADR-0013), then cell padding 3px; never a `display` override or a fixed width |
| B. Tighten padding or font now | More margin | A change without evidence; smaller text for no reason |
| C. `table-layout: fixed` with a `colgroup` | Predictable | Rejected by ADR-0013 6B (re-tuning per added column) |

### 5. How to record the supersession
| Option | Pros | Cons |
|---|---|---|
| **A. A new ADR that quotes what it supersedes, plus a one-line status note on ADR-0012 and ADR-0013 (chosen)** | ADRs stay immutable; the same pattern as ADR-0012 over ADR-0011 | One more ADR |
| B. Edit ADR-0012 in place | One document | Rewrites an accepted decision; the history of why the re-show existed is lost |

## Decision
**1A, 2A, 3A, 4A, 5A.** No new dependency, no domain change, no new RNG stream.

### Domain
No change. `playMatchday` and `playMatch` already serve matchdays 1..14 on streams 200..255; `schedule.ts` and `standings.ts` are untouched.

### App: `src/app/state.ts` (EXTEND, pure)
- `nextMatchday(state: GameState): number | undefined` (exported): `(state.results?.at(-1)?.matchday ?? 0) + 1` while that is at most `MATCHDAYS`, else `undefined` (season over). It reads only `results`.
- `playMatchdayFor(state: GameState, clubId: string, matchday: number): readonly PlayedMatch[] | undefined` (exported): `undefined` for a club not in the league; otherwise `playMatchday` for that matchday with the 8 sides. This is the side builder and the single owner of the policy: the managed club's XI is `currentXI(state, squad)`, every other club's is `automaticXI(squad, DEFAULT_FORMATION)`. A matchday outside 1..14 throws `RangeError` (a programming error, from `fixturesOf`).
- `playOpeningMatchday(state, clubId)` = `playMatchdayFor(state, clubId, OPENING_MATCHDAY)` (kept); `OPENING_MATCHDAY = 1` (kept).
- `PlayMatch` from a known club's `clubHome`: `screen` becomes `match` (same `clubId`). If `nextMatchday(state)` is a matchday `m`, `results` becomes the old list (or none) followed by the 4 entries of `playMatchdayFor(state, clubId, m)`: a new array whose first entries are the very same objects as before. If it is `undefined`, `results` is the very same value as before (D7). From any other screen or an unknown club: the very same state.
- `matchFor(state, clubId)`: `undefined` for an unknown club; otherwise, over `state.results ?? playOpeningMatchday(state, clubId)`, the last entry that involves the club, as the unchanged `MatchView`. Implemented with `filter` then `at(-1)` (ES2022). With nothing recorded it is the S-006 derivation (matchday 1), as before.
- Unchanged: `GameState`, `Screen`, `Action`, `initialState`, `NewGame` (drops `results`), `focusPlan`, `back`, `standingsOf`. `update` stays at 13 cases.

### UI and shell
No change in `main.ts`, `renderMatch`, `renderTable`, `renderClubHome` or `styles.css`. The h1 already reads `MatchView.matchday`.

### Determinism, goldens, streams
No new stream: matchdays 2..14 use streams 204..255, already reserved by ADR-0011 (stream table: -1 names; 0..7 clubs; 100..107 attributes; 200..255 matches). They are first exercised in play now, so the seed-31 season (14 score lines and Netherwold Borough's rows after matchdays 2, 3 and 14, DISCUSS "User stories") is pinned as goldens by DISTILL, RED-first, and DELIVER never re-pins from its own output. Matchday 1 is bit-identical to S-007. With untouched tactics every side is an automatic 4-4-2, so the record after N matchdays is the same whichever club is managed.

### Forward compatibility and reversibility
- The end-of-season story reads `nextMatchday(state) === undefined`; replacing the D7 re-show is a change to one branch of `PlayMatch`.
- Persistence stays `{ seed, formation, xi, results }`; the matchday needs no field.
- Reversal: stop appending in `PlayMatch` (one expression); `matchFor` already reads "the last entry", which for a one-matchday list is S-007's behaviour.
- `state.ts` grows from 256 to about 290 lines against `max-lines` 400. The end-of-season story should split the season selectors into `src/app/season.ts` before it adds more.

### Correction to ADR-0013 (Earned Trust 1)
ADR-0013 says: "Faults: `display: block` on a `tr`, or `scope` missing, drops roles and turns the counts red." This is wrong for `display`: Playwright's `getByRole` computes roles from the DOM and ARIA attributes, not from Chromium's CSS-dependent accessibility tree, so a `display` override on a table part leaves the role counts unchanged (S-007 open questions, DESIGN F-1). Corrected wording: the role counts detect a missing `scope` or a wrong element; **a `display` override is detected by reading `getComputedStyle(el).display` of one table, `thead`, `tbody`, `tr`, `th` and `td` and asserting `table`, `table-header-group`, `table-row-group`, `table-row`, `table-cell`, `table-cell`**. S-008's e2e adds that probe (it already loads the 14-matchday table).

## Consequences

### Positive
- The season needs no new state field, no new action, no new screen and no domain change: the diff is about 40 code lines in one file.
- One source of truth: the match screen, the table and the next matchday are all functions of `results`.
- The session record is persistence-ready unchanged.
- The side policy has one owner again.

### Negative
- Known gap (D7): after matchday 14 nothing tells Sam the season is over. Accepted for this version; the successor story closes it.
- `nextMatchday` depends on the append-only, matchday-ordered shape of `results`; a hand-built partial list would give a wrong next matchday (not reachable through `update`).
- `playOpeningMatchday` is an alias kept for the fallback and for unedited tests.
- The 390px fit is argued by arithmetic and proved only by the e2e.

### Contract shapes
| Component | Shape | Universe and assertion |
|---|---|---|
| `nextMatchday` | pure, return-only | Reads `results` only. Table over 0, 4, 8, ..., 52 and 56 entries (1..14 then `undefined`); property: after `update(PlayMatch)` from a home, `nextMatchday` grows by one; boundaries 13 to 14 and 14 to none (Stryker kills `<=`, `+ 1`, `?? 0`) |
| `playMatchdayFor` | pure, return-only | Universe: the returned array. Equals `playMatchday` with Sam's `currentXI` and the others' `automaticXI(squad, "4-4-2")`; deep-frozen state unchanged; `undefined` for an unknown club; `RangeError` for matchday 0, 15, 1.5; `playOpeningMatchday` deep-equals `playMatchdayFor(..., 1)` |
| `update` (`PlayMatch`) | bounded-change | Universe of the returned state: `{ league, screen, formation, xi?, results? }`; `screen` becomes the match; `results` is old + exactly 4 entries (earlier entries `toBe`-identical, entry `matchday` = previous + 1, `fixtureIndex` 0..3) or the very same array after 14. Whole-state `toEqual`, `toBe` for no-ops, deep-freeze, and the 40-action property "`results` grows only by a `PlayMatch` from a known club's home, 4 entries at a time, never above 56, never changes an earlier entry; every row has P = matchdays recorded" |
| `matchFor` | pure, return-only | Last entry involving the club; the S-006 fallback cases stay unedited; fallback-equivalence property (nothing recorded vs `playOpeningMatchday`) stays; new: with N matchdays recorded it returns matchday N; after 14 it still returns matchday 14 |
| `standingsOf` | pure, return-only | Unchanged; now exercised for P 1..14 (properties K2) |
| `renderMatch`, `renderTable`, `renderClubHome`, `main.ts` | unchanged | Their universes (ADR-0011, ADR-0013) stand; `main.ts` stays unbounded-preservation with no new render case |

Driving ports that only read (`nextMatchday`, `matchFor`, `standingsOf`) expose no write methods.

### Earned Trust (no adapter; environment assumptions named and probed)
1. **Chromium vs Node determinism over the whole season.** Matchdays 2..14 (streams 204..255) have never run in a browser. The e2e walks 14 taps at `?seed=31` and compares every score line with the goldens the Node test pins (DISCUSS season list). Fault: an approximated function in `match.ts` changes a last bit on a later stream; the existing grep test catches the cause, the golden walk the effect. WebKit and iOS Safari are not probed.
2. **The record is neither lost nor doubled.** Property: a tap appends exactly 4 (never 0 after the first, never 8); the earlier entries are the same objects; a tap after 14 keeps the same array. Fault: a rapid double tap. The tap navigates to a screen without "Play match" and `dispatch` runs `update` then `render` synchronously, so a second tap cannot land on the same club home; the e2e double-click expects the match screen of exactly one new matchday.
3. **The table fits 390px with two-digit values.** The e2e asserts `document.documentElement.scrollWidth <= clientWidth` and the table's `scrollWidth <= clientWidth` after 14 matchdays at `?seed=31` (Netherwold Borough P 14 W 7 D 2 L 5 "+2" 23) and `?seed=abc`, with the longest names. Faults: `overflow-wrap: anywhere` removed from the Club cell, a fixed width, `nowrap` removed from a header.
4. **Native table display survives the CSS** (corrected ADR-0013 probe 1). The e2e reads the computed `display` of table, thead, tbody, tr, th and td. Fault: any `display` override on a table part.
5. **Self-application.** The probes above are part of the e2e that DISTILL writes; the Stryker run over `state.ts` (nightly) is the check that the unit tests would notice a broken boundary (13 to 14, 14 to none).

### Enforcement
- Style: modular monolith, functional core and imperative shell (ADR-0003). Tool: oxlint (`.oxlintrc.json`) for the import boundaries (domain imports no app or ui; app imports no ui), `max-params` 3 (`playMatchdayFor` has exactly 3), `complexity` 15 (`update` 13; `playMatchAction` and `matchFor` each under 8), `max-lines` 400.
- Stryker's existing `mutate` glob covers `src/app/state.ts` and `src/domain/**`; no config change. Mutants to kill: `<=` versus `<` on the cap, `+ 1`, `?? 0`, `at(-1)` versus `at(0)` in `matchFor` and `nextMatchday`, spread order (append versus prepend).
- Existing grep tests stay: no `.focus(` under `src/ui/`, no `localeCompare` in `standings.ts`, no `Math.pow`/`exp`/`log`/`**` in `match.ts`; one `dispatch(` call in `table.ts`. The PR guard still rejects `Math.random`, `Date.now` and `new Date(` in `src/domain/`.
- No external integrations, so no contract tests. No new dependency.
