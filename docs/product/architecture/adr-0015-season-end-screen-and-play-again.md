# ADR-0015: End of season screen and Play again (S-009)

- Status: Accepted (amended by ADR-0016, S-010: "There is no storage" in Earned Trust no longer holds; the game saves to localStorage, and "Play again" after "Continue" keeps the saved league's seed)
- Date: 2026-10-25
- Deciders: nWave solution-architect (S-009 DESIGN, `interaction_mode=propose`)
- Related: ADR-0003 (functional core), ADR-0005 (squad order, derive on demand), ADR-0008 (focus plan), ADR-0009 (inline-flow text rule, optional state field), ADR-0011 (goal events), ADR-0012 (the results log; `NewGame` drops it), ADR-0013 (standings; format functions in the domain; a renderer that emits only named actions), ADR-0014 (season progression; the derived "season over").
- **Supersedes in part ADR-0014**: its decision 4 ("Season over"): "the renderer swaps the "Play match" button for `<p class="season-over">Season over</p>` in the same slot of `div.club-actions`", the sentence "The `<p>` is plain text (one text node via `el()`), no role, no heading, no listeners", the CSS rule `.season-over`, the `renderClubHome` contract row (a `p.season-over` child), Earned Trust 5 ("Season over" is plain text) and 6 (the names check for "Season over"), and the rejection of option 4C (a `Screen` kind for the end of the season: "That is the later end-of-season story ... out of scope"), which this story is. Everything else in ADR-0014 stands (the derived `nextMatchday`, the append, the guard at 14, `matchFor`, `matchdayFor`, the `seasonOver` flag as a derived boolean).
- **Refines**: the S-005 rule "`NewGame` keeps its title-only guard" (it is now valid from the title or the End of season screen) and the S-007 statement that "New game" is "only on the title screen, which only a page load reaches" (ADR-0012 Context, D9): `NewGame` is now user-visible after a season, with no page load.

## Context
S-009 closes the S-001..S-008 loop with the End of season screen (DISCUSS D1-D8, US-1, US-2). The binding rules:
- **D1**: once 14 matchdays are recorded the club home offers a button named exactly "End of season" in the "Play match" slot; "Season over" is gone. Before matchday 14 there is no such button.
- **D2**: the screen has the only h1 "End of season" (focused), the line "Final position 3rd" (the ordinal of the club's Pos in the table), the line "Top scorer Name (N goals)" ("(1 goal)" for one; "Top scorer none" with no goal; ties to the lowest squad index; one pattern `^Top scorer (none|(.+) \((\d+) goals?\))$`), then "Play again" and "Back" (44px or taller).
- **D3**: "Play again" starts a new game of the same league at once and lands on the pick-a-club screen. Everything of the old season is gone (results, formation "4-4-2", picks).
- **D4**: "Back" returns to the club home (heading focused), still showing "End of season".
- **D5**: derived only: nothing new is stored, no new RNG stream.
- **D6/D7**: the clause is durable per season; where "Play again" lands is this version only; S-008's "Season over" checks are replaced, never weakened.
- **D8**: phone first; text through `el()`; renderers never move focus; exact locators.

Facts checked in the code:
- `PlayedMatch.result.goals` holds `{ minute, side, playerIndex }`. `playerIndex` indexes the squad of the side that scored (`squadOf(league, club.id)`, ADR-0005, frozen order), and `side` says whether that is the match's `home` or `away` club index. The match screen already maps it that way (`main.ts` `matchScreenView`).
- With untouched tactics all 56 results are the same whichever club is managed (every side is the automatic 4-4-2); the managed club only chooses which row of the table and which squad is read.
- `standings.ts` is the club-level module (ADR-0013): imports only `Club`, holds `formatGoalDifference` (a format function in the domain, next to the rule it describes). `match.ts` is the frozen model of ADR-0011.
- Complexity (oxlint `complexity` max 15, counted as S-007/S-008 did: base 1, plus every `case` label, `if`, ternary, `&&`, `||`): `update` has 12 cases (13); `sameScreen` is a 10-label switch with four `&&` (15, at the limit); `main.ts` `render` is a 10-case switch with three `if` (14). `max-lines` is 400 per file; `state.ts` is 270 lines.
- `NewGame` today: valid only from the title; returns `{ ...withoutPicks(toScreen(pickClub)), formation: DEFAULT_FORMATION, results: undefined }`, keeping `league`. The S-004 brief already says it resets `formation` "as future-proofing for 'Save and continue' or 'play again'".
- `renderClubHome(root, { club, seasonOver }, dispatch)` has the flag already; vitest has no DOM, so renderers are covered by e2e and by grep tests.
- No generated name holds "Final position", "Top scorer", "Play again" or "End of season" (`names.ts`: only the town "Saltmarsh End" holds "End"); locators use `exact: true`.

## Options

### 1. Where the top-scorer rule lives
| Option | Pros | Cons |
|---|---|---|
| **A. A new pure domain module `src/domain/season.ts`: `topScorer(played, clubIndex, squad)` and `formatTopScorer` (chosen)** | A rule over goal events belongs with the core: Node-testable with literal logs, inside Stryker's domain glob, no DOM. A structural `ScoringMatch` input (as `ScoredMatch` in ADR-0013) lets tests pass small literals | One new small file (about 40 lines) |
| B. Extend `standings.ts` | No new file | `standings.ts` is the club-level table module whose only import is `Club`; a per-player tally mixes two concepts and widens an ADR-0013 contract |
| C. Extend `match.ts` | `PlayedMatch` lives there | `match.ts` is the frozen model (constants, draw order, a no-`Math.pow` grep test); a consumer statistic does not belong in it, and review would have to re-read ADR-0011 |
| D. Compute in `state.ts` or `main.ts` | Fewest files | Rule outside the domain or in the shell; `state.ts` is near its size budget; the tie rule is hard to unit-test in the shell |

### 2. Where the ordinal text is made ("1st".."8th")
| Option | Pros | Cons |
|---|---|---|
| **A. `formatOrdinal(position)` exported from `standings.ts`, next to `formatGoalDifference`; plain English suffix rule (11-13 "th", else by last digit), no `Intl` (chosen)** | Same placement logic as ADR-0013 option 3A (a format of a `StandingRow` field, pure, Stryker-covered). Total over any position, so a bigger league cannot print "11st" | A presentation-flavoured function in the domain (accepted precedent) |
| B. In the renderer | Closest to the DOM | Unmutated and e2e-only; a suffix mistake is caught only in a browser |
| C. `Intl.PluralRules` with `type: "ordinal"` | Standard | ICU- and engine-dependent: a lie risk against "same seed, same screen" (the reason ADR-0013 forbids `localeCompare`); more code than the suffix rule |

### 3. Navigation: the screen, the way in and "Play again"
| Option | Pros | Cons |
|---|---|---|
| **A. `Screen` adds `seasonEnd{clubId}`; `Action` adds `ViewSeasonEnd` (valid only from a known club's `clubHome` when `nextMatchday(state)` is `undefined`); `Back` from it goes to the club home; `NewGame` is widened to be valid from the title or from `seasonEnd`, and "Play again" dispatches `NewGame` (chosen)** | One new action; `update` goes to 13 cases (complexity 14 of 15). "Play again" is by definition a new game of the same league, which `NewGame` already is (the S-004 brief kept its `formation` reset for it); the reset (formation, picks, results) is already one tested function. The unit rule "Play again equals `initialState` plus `NewGame`" is then true by construction | `NewGame`'s guard widens from one screen kind to two, and its title-only unit tests must stay green (they do: other screens are still no-ops) |
| B. `ViewSeasonEnd` plus a new `PlayAgain` action | Intent in the type | A second action with the same effect as `NewGame` (two resets to keep in step); `update` reaches 14 cases (complexity 15 of 15, zero headroom) |
| C. Restructure `update` into a handler table now | Frees complexity for good | Rewrites a mature function and its Stryker surface in a story that does not need it |
| D. No screen kind: swap the club home's content in place | No `Screen` change | D2 wants its own h1 "End of season" and D4 a "Back" to the club home; the club home would hold two headings |

`sameScreen` is at the complexity limit, so the new kind cannot be one more `case` label: the six `clubId` labels (club home, match, tactics, squad, startingXI, table) become the switch's `default` (the new kind falls in it), leaving `title`, `pickClub`, `choosePlayer` and `player` as labels. Behaviour-preserving (the `focusPlan` suite is unedited) and compile-time safe (TypeScript rejects `sameClub(previous, ...)` if a remaining kind has no `clubId`). Alternatively `HOME_RETURNING_KINDS` (for `Back`) just gains `"seasonEnd"`.

### 4. The selector and what it returns
| Option | Pros | Cons |
|---|---|---|
| **A. `seasonSummaryOf(state, clubId)` in `state.ts` returns a `SeasonSummary` (`{ position: number; topScorer: TopScorer or undefined }`), or `undefined` for an unknown club, composing `standingsOf` and `topScorer`; raw data, text made by the formatters in the renderer (chosen)** | One selector, as `matchFor` and `standingsOf`; `undefined` for an unknown club; K2 compares raw numbers (`position` equals the table row's `position`) | The renderer joins label and value (e2e-covered, three lines) |
| B. The summary carries the finished text lines | Renderer is trivial | Presentation in the app layer; raw numbers harder to compare in K2 |
| C. Compute the summary in `main.ts` | No app change | Logic in the shell, outside unit tests |

`main.ts` takes the summary through a module-level `seasonSummaryOrThrow(state, clubId)` (as `squadOrThrow` does), so the new `render` case adds one to the complexity (15 of 15) and no `if`.

### 5. Markup of the two lines
| Option | Pros | Cons |
|---|---|---|
| **A. `<p>` with inline `<span>` label and value joined by a literal single-space text node, no flex/grid/float/`text-transform` (chosen)** | `textContent`, `innerText` and the accessible name read exactly "Final position 3rd" / "Top scorer Name (5 goals)"; the value can be styled (gold) without extra text; same technique as the score line and ADR-0009 pick buttons | A CSS rule to keep (probed by e2e) |
| B. One text node per line (`${label} ${value}`) as `renderPlayer`'s `line()` | Simplest | No styling hook for the value |
| C. A `<dl>` | Semantic pairs | Exact "one line of text" reads and `getByText` are less direct; the roles are not in the contract |

### 6. The club-home offer
| Option | Pros | Cons |
|---|---|---|
| **A. The slot of "Play match" holds `button.primary` "End of season" when `seasonOver` is true; `p.season-over` and its CSS are removed (chosen)** | D1; `renderClubHome` keeps its props (`seasonOver` stays a derived boolean), so `main.ts`'s `clubHome` case is untouched; the closed universe returns to five `button.primary` | The prop name still says "season over" (it is the derived state, which is still true) |
| B. Keep the line and add a link or a sixth button | Keeps S-008 text | Against D1 (the line is removed; the button takes the slot) |
| C. Jump to the screen after the 14th match | One tap fewer | Hides the matchday-14 screen and changes "Back" (rejected in DISCUSS) |

## Decision
**1A, 2A, 3A, 4A, 5A, 6A.** No new dependency.

### Domain
- `src/domain/season.ts` (new, pure; imports only the `Player` type from `squad.ts`, because `ScoringMatch` is structural and needs nothing from `match.ts`):
  - `ScoringMatch = { home: number; away: number; result: { goals: readonly { side: "home" | "away"; playerIndex: number }[] } }` (a `PlayedMatch` satisfies it); `TopScorer = { playerIndex: number; name: string; goals: number }`.
  - `topScorer(played, clubIndex, squad) => TopScorer | undefined` (3 parameters). Counts the goals the club scored: those of a match whose `home` is `clubIndex` with `side` "home", and of a match whose `away` is `clubIndex` with `side` "away"; the opponent's goals in the same matches are not counted. The result is the player with the most such goals; **ties go to the lowest squad index**; `undefined` when the club scored none. A counted `playerIndex` outside `squad` throws `RangeError` (programming error, as ADR-0013). Order of `played` does not matter. Inputs are never mutated.
  - `formatTopScorer(scorer | undefined) => string`: `"none"`, or `"<name> (<N> goals)"`, with `"goal"` exactly when N is 1.
- `src/domain/standings.ts` (EXTEND): `formatOrdinal(position: number) => string`: positive integer to "1st", "2nd", "3rd", "4th" ... ; 11, 12, 13 are "th"; anything not a positive integer throws `RangeError`. No `Intl`, no `toLocale` (grep test).

### App: `src/app/state.ts` (EXTEND)
- `Screen` adds `{ kind: "seasonEnd"; clubId: string }`. `Action` adds `{ type: "ViewSeasonEnd" }`.
- `ViewSeasonEnd`: from a known club's `clubHome` **and** `nextMatchday(state) === undefined`, goes to `seasonEnd` (same `clubId`), else returns the very same state (`toBe`). Changes only `screen`.
- `Back` from `seasonEnd` of a known club goes to `clubHome` (same club); nothing else changes, so the club home is exactly as it was (`toEqual`).
- `NewGame` is valid from `title` or `seasonEnd`; elsewhere the same state (`toBe`). Its result is unchanged: `pickClub`, `formation` "4-4-2", picks dropped, `results` dropped, `league` kept (same seed). From `seasonEnd` it equals `update(initialState(league), NewGame)` under `toEqual`.
- `seasonSummaryOf(state, clubId)` (exported, pure; returns a `SeasonSummary`, or `undefined` for an unknown club): `position` = the club's row in `standingsOf(state)`; `topScorer` = `topScorer(state.results ?? [], clubIndex, squad)`. Total over any log (it is the summary of whatever is recorded; the screen is reachable only after 14).
- `sameScreen` per the note under option 3; `HOME_RETURNING_KINDS` gains `"seasonEnd"`; `focusPlan` is otherwise unchanged. Every new navigation (club home to End of season, Back, Play again) changes the screen, so focus goes to the new `<h1>` (ADR-0008); no focus ids.
- `GameState` is unchanged; nothing is stored.

### UI
- `renderClubHome` (EXTEND): the "Play match" slot holds a `button.primary` "End of season" (dispatching `ViewSeasonEnd`) when `seasonOver`, else the "Play match" button (dispatching `PlayMatch`); the `p.season-over` child is gone. Five `button.primary` again.
- `src/ui/screens/season-end.ts` (new): `renderSeasonEnd(root, summary, dispatch)` with `dispatch` typed `(action: Extract<Action, { type: "NewGame" | "Back" }>) => void` (compile-time "emits only these two", the `renderTable` precedent). It calls `root.replaceChildren(<section class="season-end">)` once; the section has exactly four children in order:
  1. `<h1 tabindex="-1">End of season</h1>`.
  2. `<p class="season-line">`: `<span class="season-label">Final position</span>`, the text node `" "`, `<span class="season-value">3rd</span>` (`formatOrdinal(summary.position)`).
  3. `<p class="season-line">`: `<span class="season-label">Top scorer</span>`, `" "`, `<span class="season-value">Garrick Thistlewood (5 goals)</span>` (`formatTopScorer(summary.topScorer)`; "none" for none).
  4. `<div class="season-actions">` holding `<button type="button" class="primary">Play again</button>` (dispatches `NewGame`) and `<button type="button" class="back-button">Back</button>` (dispatches `Back`).
  No other element, no listener except those two, no `innerHTML`, no focus call.
- CSS (binding): `p.season-line` and its spans keep inline flow: no `display`, `position`, `float`, flex or grid on the spans or the `<p>`, no `text-transform`, no generated content; `overflow-wrap: anywhere` on the `<p>`. Value bold (the position value gold); label muted chalk. Same type scale as the stat lines (1.1rem body, tabular numerals) but a new class: `.player-line` carries `:nth-of-type`/`:last-of-type` rules that belong to the player screen. `.season-end h1` follows the other screens (1.75rem, 16px bottom margin). `.season-actions` is a grid with a 10px gap (like `.club-actions`); its `button.primary` is full width and 48px, "Back" the shared `.back-button`. The `.club-actions .season-over` rule is deleted.
- `main.ts`: a `seasonEnd` case (`renderSeasonEnd(root, seasonSummaryOrThrow(state, screen.clubId), dispatch)`), the helper and two imports. The `clubHome` case is unchanged (the flag already exists).

### Determinism
No new stream or draw; nothing stored. The same seed, club and choices give the same log, hence the same screen. `?seed=abc` equals no seed.

## Consequences

### Positive
- The season now has an ending and a way back in: two derived selectors, one screen, one action, one guard widened.
- `NewGame` stays the single reset, so "Play again equals a fresh game" holds by construction (K3).
- The top-scorer rule is a pure, mutation-tested domain function with literal-log tests; the shell only joins text.
- `renderClubHome`'s universe returns to five `button.primary`, simpler than S-008's.
- The screen and "Play again" ship in ONE DELIVER merge (DISCUSS H-2); a "Play again" that does nothing never ships. If the 1200-line cap is ever at risk, trim test duplication; never split the slices.

### Negative
- `update` is at 13 cases (complexity 14 of 15). `main.ts` `render` goes from 14 to 15 of 15. `sameScreen` goes from 15 to 9 with the `default` refactor. The next story that adds an action or a screen must first move `update` and `render` to lookups.
- `NewGame` now has two valid screens; its guard is a small set test, and the S-004/S-005/S-007/S-008 "no-op off the title" tests must keep passing (they test other screens).
- The prop name `seasonOver` outlives the "Season over" line.
- Any later "next season" story that keeps a club (squads, form) must replace "Play again lands on the pick-a-club screen" (a rule of this version only).

### Contract shapes
| Component | Shape | Universe and assertion |
|---|---|---|
| `topScorer`, `formatTopScorer`, `formatOrdinal` | pure, return-only | Deep-equal on repeat, inputs (deep-frozen) unchanged; ordinal table 1..8 plus 11, 12, 13, 21, 22, 23, 101, 111 and a `RangeError` table; top scorer: outright, two- and three-way ties by squad order, exactly 1 goal, none, opponent's goals ignored, home and away both counted, log order irrelevant (property), `RangeError` for a player outside the squad; grep test: no `Intl`, `toLocale` in `season.ts` and `formatOrdinal` |
| `seasonSummaryOf` | pure, return-only | `position` equals the club's `standingsOf` row (by construction); `topScorer` equals an independent count summed over every matchday's recorded entry (not one end-of-season `matchFor` read); `undefined` for an unknown club; seeds 1..300 x 8 clubs (K2) |
| `update` (`ViewSeasonEnd`, `Back`, `NewGame`) | pure, return-only | Universe `{ league, screen, formation, xi?, results? }`. `ViewSeasonEnd` changes only `screen`, `toBe` no-op at matchday 13 and below, from any other screen and for an unknown club; `Back` returns the club home `toEqual` to what it was; `NewGame` from `seasonEnd` `toEqual` `update(initialState(league), NewGame)`; `NewGame` elsewhere than title and `seasonEnd` is a `toBe` no-op; deep-freeze; a 40-action property |
| `renderClubHome` | bounded-change | Universe: `section.club-home` = swatch, h1, `div.club-actions` of exactly 5 `button.primary` in the order Squad, Tactics, Starting XI, [Play match or End of season], Table. The flag is the only input that changes it |
| `renderSeasonEnd` | bounded-change, emits only `NewGame` and `Back` | Universe: root's one `section.season-end` with exactly h1, two `p.season-line`, `div.season-actions` (two buttons); compile-time narrowed `dispatch`; e2e click-everything check; grep: two `dispatch(` calls and two `addEventListener` in `season-end.ts`; the `.focus(` grep over `src/ui/` |
| `main.ts` | bounded-change (enumerated universe unchanged) | The S-009 delta: the `seasonEnd` render case, `seasonSummaryOrThrow` and two imports; `clubHome` case, loop and focus calls unchanged |

### Earned Trust (no adapter; environment assumptions named and probed)
There is no storage, clock, network or vendor SDK, so there is no `probe()` to specify; the environment lies this design could suffer are named and probed instead. Where the environment can lie (layout, text rendering, engine arithmetic), the probe exercises the lie.
1. **Chromium vs Node, the screen's values.** The e2e reads the browser's End of season screen at `?seed=31` (Netherwold Borough: "Final position 3rd", "Top scorer Garrick Thistlewood (5 goals)", the 5-5 tie), `?seed=abc` (Oakhampton Rise Borough: "2nd", "Joren Northcott (8 goals)") and, for "(1 goal)", `?seed=13` (Ashworth Vale Rovers: "8th", "Orrin Yarrow (1 goal)") and `?seed=1` (Wexcombe Athletic: "8th", "Bram Fairbourne (3 goals)"); the same values are pinned by the Node test, written RED-first from `docs/feature/S-009/discuss/reference-season-end.md` (the DISCUSS plan-run recomputation) (DELIVER never re-pins from its own output). Fault: an approximated function upstream (the ADR-0011 grep test already covers `match.ts`).
2. **Text reads exactly as one line (the layout lie).** The e2e asserts for both lines that `innerText`, `textContent` equal the exact line and that the `<p>` is one box (no line break from blockified children). Fault: a flex/grid/float rule on the spans or `text-transform` turns it red (the S-005 lesson).
3. **The verdict agrees with the evidence (K2).** For seeds 1..300 x 8 managed clubs (2400 seasons; each seed's 56 results are played once, since untouched tactics make them club-independent), `seasonSummaryOf` is compared with an oracle that does not call `topScorer`: the oracle sums the club's goals from every matchday's recorded entry (it reads `state.results` directly, or `matchFor` after each of the 14 `PlayMatch` taps, naming scorer and club as the match screen does), never one `matchFor` read at the end, because `matchFor` returns only the latest matchday; ties by `Squad` order. The position agrees with the table **by construction** (both come from `standingsOf`), so it is not counted as an independent check; the independent position check is the e2e comparing the rendered "Final position" ordinal with the Table's Pos cell for the club's row (seed 31 "3rd", seed 20260 "2nd", seeds 13 and 1 "8th"). Plus fast-check (`numRuns` 100, fresh `FC_SEED`) over constructed logs for ties, one goal and none. Fault: counting the opponent's goals, `playerIndex` read against the wrong squad, a tie resolved by last index (the seed-31 5-5 tie kills the last).
4. **The offer is exactly at 14.** `ViewSeasonEnd` and the club-home button at 13 and at 14 matchdays (boundary cases kill an off-by-one; nightly Stryker on `state.ts`); the e2e at 13 and 14 taps.
5. **Play again equals a fresh game.** Property: after any season and any run of up to 40 valid and invalid actions before it, `NewGame` from `seasonEnd` `toEqual`s `update(initialState(league), NewGame)`; the e2e replays the seed-31 season with untouched tactics and reads the same screen (K3). Fault: a field forgotten in the reset (`xi`, `formation`, `results`).
6. **Focus and universe.** h1 focused on arrival at End of season, after Back and after Play again (the pick-a-club h1); the e2e clicks every element and sees only `NewGame` and `Back` dispatches; buttons 44px or taller; no sideways scroll at 390px; no console errors.
7. **Names.** "End of season", "Final position", "Top scorer", "Play again" in no `names.ts` string (case-insensitive unit check, as D9 of S-008); the town "Saltmarsh End" is why locators use `exact: true`.

### Enforcement
- Style: modular monolith, functional core and imperative shell (ADR-0003). Tool: oxlint (existing `.oxlintrc.json`): `season.ts` and `standings.ts` may not import `app`/`ui` or touch `document`/`window`/`Date`; `max-params` 3 (`topScorer` has 3); `complexity` 15 (see Consequences); `max-lines` 400. Stryker's globs already cover `src/domain/**` and `state.ts`, no config change. Grep tests: no `.focus(` under `src/ui/` (existing), no `Intl`/`toLocale` in `season.ts`, the two-`dispatch(` rule on `season-end.ts`.
- No external integrations, no contract tests, no new dependency, no library (so no Context7 lookup).
