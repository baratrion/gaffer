# ADR-0013: League standings and the table screen (S-007)

- Status: Accepted
- Date: 2026-10-23
- Deciders: nWave solution-architect (S-007 DESIGN, `interaction_mode=propose`)
- Related: ADR-0002 (plain DOM, `el()`, `textContent`), ADR-0003 (functional core), ADR-0008 (focus plan, `sameScreen`), ADR-0009 (inline-flow text rule, list named by the heading), ADR-0011 (inline text, no `text-transform` on exact names), ADR-0012 (the recorded results this reads). Supersedes nothing.

## Context
S-007 adds a "Table" button and a "League table" screen (DISCUSS D3-D8, D10, D11, D14). The binding rules:
- **D4**: a table named "League table" with one header row "Pos", "Club", "P", "W", "D", "L", "GD", "Pts" and 8 body rows. Per body row: Pos (cell), Club (row header), then P, W, D, L, GD, Pts (cells). Order: Pts, then GD, then goals scored, then club name in code-point order. GD reads "+N", "0" or "-N" with an ASCII hyphen-minus. W + D + L = P and Pts = 3W + D on every row. Goals scored is not shown, so its tie-break is unit-tested only.
- **D5**: before any match, all rows are zero and in A to Z order.
- **D7**: Sam's row is highlighted visually, without changing any cell text or the row's accessible structure.
- **D10**: no horizontal scroll at 390px with 8 narrow columns, long club names wrap, buttons 44px or taller, no console errors, text through `el()`/`textContent`, renderers never move focus.
- **D14**: the first 8 columns stay in this order with these formats in every later version; later versions may only add columns after "Pts".
- Visual identity (scope.md, design-system.md): pitch green, chalk, gold; system sans; tabular numerals for numbers.

Facts checked in the code:
- `#app` is `max-width: 480px` with 16px side padding, so the content is 358px wide at 390px.
- `Club.name` values are unique per league (ADR-0004), so a name tie-break gives a total order. Club names are a town plus a suffix word from frozen lists, so they hold letters and spaces only.
- The club-home buttons are `button.primary` in `div.club-actions` (48px); the Back button is `.back-button` (48px).
- `sameScreen` in `state.ts` groups kinds that are compared by `clubId`.
- vitest has no DOM environment; the table renderer is covered by the e2e and the protected scenarios, and its data by unit tests.
- `Math.random`, `Date` and approximated maths are out; sorting uses only comparisons.

## Options

### 1. Standings: where and how
| Option | Pros | Cons |
|---|---|---|
| **A. A pure domain function `standings(clubs, results)` in new `src/domain/standings.ts`, computed from the recorded results on each render; the table is never stored (chosen)** | A table is a view of the results, so it cannot disagree with them (K2) or drift. Testable in Node with literal results, under Stryker's domain glob. All-zero A to Z for an empty list falls out of the same code (D5). Grows to 14 matchdays unchanged | Recomputed per render (8 clubs, a few results: microseconds) |
| B. Keep a running table in `GameState`, updated at the tap | No recompute | A second source of truth beside `results`; breaks the whole-state assertions; must be re-synced by any future correction |
| C. Compute in the renderer or `main.ts` | No new module | Rules in the shell, outside unit tests and Stryker |

### 2. Ordering and the comparison
| Option | Pros | Cons |
|---|---|---|
| **A. Pts desc, GD desc, goals scored desc, then name ascending by JS string order (`<`, UTF-16 code units, equal to code-point order for the letters and spaces of club names) (chosen)** | Exactly D4. Deterministic in every engine; a space sorts before a letter; total, because names are unique | Code-unit order is not alphabetical for accents or case; club names are ASCII letters and spaces by construction (ADR-0004) |
| B. `localeCompare` | Familiar | Locale- and engine-dependent (ICU), and it ignores punctuation rules differently; breaks "same seed, same table" across browsers. A grep test forbids it in `standings.ts` |

### 3. Where the GD text ("+N", "0", "-N") is made
| Option | Pros | Cons |
|---|---|---|
| **A. `formatGoalDifference(n)` exported from `standings.ts`, called by the renderer (chosen)** | Pure, inside Stryker's domain glob, unit-tested with a sign table; the durable D4 format sits next to the rule it describes; no DOM | A presentation-flavoured function in the domain (no DOM, no locale; the format is part of the table's contract) |
| B. In the renderer | Closest to the DOM | Unmutated and e2e-only; a sign mistake is only caught in a browser |
| C. An app view function in `state.ts` | Layer-correct | `state.ts` is already the largest app file; it mixes screen state with text formatting |

Rule inside A: positive gives `+` and the number, zero gives `0` (no sign), negative gives ASCII `-` and the absolute value. Never U+2212 and never `toLocaleString`.

### 4. Table markup
| Option | Pros | Cons |
|---|---|---|
| **A. A native `<table aria-labelledby>` pointing at the `<h1 id>`; `<thead>` with one `<tr>` of `<th scope="col">`; `<tbody>` with 8 `<tr>`; per row a `<td>` Pos, a `<th scope="row">` Club, and six `<td>` (chosen)** | Native roles with no ARIA role attributes: `table`, `columnheader`, `row`, `rowheader`, `cell`. The name comes from the heading (one source, as ADR-0009's list). Matches D4's role structure: 9 rows, 8 columnheaders, 8 rowheaders, 56 cells | Table semantics are lost if CSS changes any table part's `display` (see the CSS rule). The Club cell is the second cell, so it is a row header that is not first: valid HTML with `scope="row"` |
| B. `<caption>` instead of `aria-labelledby` | Native name | A visible caption repeats the heading ("League table" twice, which confuses `getByText`); a visually hidden caption means hidden text |
| C. `div`s with `role="table"`, `row`, `cell` | Free layout (flex/grid) | ARIA roles re-implement what the platform gives; more attributes for no gain; the tap-target problem it solves does not exist (no interactive cells) |
| D. A list of cards, one per club | Easy to fit 390px | Not a table: D4 requires table roles and column headers |

### 5. Sam's row highlight
| Option | Pros | Cons |
|---|---|---|
| **A. `aria-current="true"` on his `<tr>`, styled through the attribute selector `tr[aria-current="true"]` with a new token `--highlight` (a gold wash, a 4px gold left edge on the first cell, bold name) (chosen)** | One hook for both meaning and style, so they cannot diverge. Assistive technology hears "current" without any text change. Colour is not the only cue (an edge and weight, WCAG 1.4.1). Does not alter a cell's text or the row's role | `aria-current` on a `row` is allowed (global attribute) but support in screen readers varies; the visual cue does not depend on it |
| B. A CSS class only | Simplest | Meaning is visual only |
| C. A visible "(you)" text in the Club cell | Explicit | Changes the row header text, which D4 and the protected scenarios read exactly |

### 6. Fitting 8 columns at 390px
| Option | Pros | Cons |
|---|---|---|
| **A. Automatic table layout at `width: 100%`; numeric columns `white-space: nowrap`, narrow padding, `width: 1%` so they take their content width; the Club column takes the rest and wraps with `overflow-wrap: anywhere`; 0.9rem text, `font-variant-numeric: tabular-nums`, numbers right-aligned (chosen)** | Keeps native table display. With `overflow-wrap: anywhere` the Club cell's minimum width is tiny, so the table cannot force a horizontal scroll. Numeric columns follow their widest value ("+12", "42") as a season grows | Column widths follow content; headers and rows can shift a few pixels between states (acceptable for a static table) |
| B. `table-layout: fixed` with a `<colgroup>` of set widths | Predictable | Extra nodes; fixed widths need re-tuning when D14 adds columns, and clip or wrap two-digit season values |
| C. `overflow-x: auto` wrapper | Always fits | Horizontal scroll is forbidden by D10 |
| D. Hide columns on small screens | Fits | D4 requires all 8 columns |

Budget (an estimate at 0.9rem = 14.4px; the e2e measures the real thing): Pos, P, W, D, L about 24px each, GD about 34px, Pts about 28px, together about 180px, leaving the Club cell about 170px of the 358px, enough for most club names on one line and the rest on two.

### 7. Navigation
| Option | Pros | Cons |
|---|---|---|
| **A. `Screen` adds `{ kind: "table"; clubId }`; `Action` adds `{ type: "ViewTable" }`; `Back` from the table goes to the club home; `sameScreen` groups `table` with the `clubId` kinds (chosen)** | Same pattern as `squad`, `tactics`, `match`; no focus ids; focus always lands on the `<h1>` because every table navigation changes the screen | `update` reaches 13 cases (limit 15); the next screen should move to a lookup table |
| B. Table as a panel on the club home | No new screen | The club home would hold two headings or a long page; D4 wants its own h1 "League table" |

## Decision
**1A, 2A, 3A, 4A, 5A, 6A, 7A.** No new dependency.

### Domain: `src/domain/standings.ts` (new, pure)
- Input: `standings(clubs: readonly Club[], played: readonly ScoredMatch[]) => readonly StandingRow[]`, two parameters. `ScoredMatch = { home: number; away: number; result: { homeGoals: number; awayGoals: number } }`, which a `PlayedMatch` satisfies structurally, so tests can pass small literals. `home` and `away` are indices into `clubs`; an index outside `clubs` throws `RangeError` (programming error).
- Output: one `StandingRow` per club, ordered per decision 2A: `{ position, clubId, name, played, won, drawn, lost, goalsFor, goalsAgainst, goalDifference, points }`. `position` is 1..8 down the table, never shared. `goalsFor` and `goalsAgainst` are kept internally for the tie-break and for later GF/GA columns; the screen does not show them (D4).
- Rules: a win is 3 points, a draw 1, a loss 0. `goalDifference = goalsFor - goalsAgainst`. With no matches every row is zero and the order is name ascending.
- Invariants (properties): `won + drawn + lost = played`, `points = 3 x won + drawn`, total won = total lost, total drawn is even, total goal difference is 0, the rows are a permutation of the clubs, and the order is non-increasing in (points, goal difference, goals for).
- `formatGoalDifference(n: number) => string` as in option 3A.
- Imports: the `Club` type from `league.ts` only. No app or ui import. A grep unit test forbids `localeCompare` and `toLocale` in the file.

### App: `src/app/state.ts` (EXTEND)
- `Screen` adds `{ kind: "table"; clubId: string }`. `Action` adds `{ type: "ViewTable" }`, valid only from the `clubHome` of a known club (else a no-op, the same state object).
- `Back` from `table` of a known club goes to `clubHome` of the same club; an unknown club is a no-op.
- `ViewTable` and `Back` never touch `formation`, `xi` or `results`.
- `standingsOf(state) => readonly StandingRow[]` = `standings(state.league.clubs, state.results ?? [])` (pure, exported; the one table selector).
- `sameScreen` adds `table` to the `clubId` group. Every table navigation changes the screen, so focus goes to the `<h1>` (ADR-0008).

### UI: `src/ui/screens/table.ts` (new) and `club-home.ts` (EXTEND)
- Club home: a fifth `button.primary` "Table" after "Play match" in `div.club-actions`, dispatching `ViewTable`. The order is a layout choice, not part of the durable outcome.
- `renderTable(root, { rows, managedClubId }, dispatch)`; bounded-change: it calls `root.replaceChildren(<section class="league-table">)` once, and the section has exactly three children in order:
  1. `<h1 id="table-title" tabindex="-1">League table</h1>`.
  2. `<table class="standings" aria-labelledby="table-title">` with:
     - `<thead><tr>` of 8 `<th scope="col">` reading, in order, `Pos`, `Club`, `P`, `W`, `D`, `L`, `GD`, `Pts`;
     - `<tbody>` of 8 `<tr>` (rows in `rows` order), each holding in order a `<td>` Pos (the position), a `<th scope="row">` with the club name, then `<td>` for P, W, D, L, GD (through `formatGoalDifference`) and Pts;
     - the row of `managedClubId` carries `aria-current="true"`; no other row has the attribute.
  3. `<button type="button" class="back-button">Back</button>` dispatching `Back`.
- Every cell is text set through `el()` (a string child, so `textContent`). No `innerHTML`, no focus call, no timers, no `document` or `window` access.
- Text rules: a cell's `textContent` is exactly its value ("1", "+4", "0", "-1", the club name). No `text-transform` on any header or cell, so `innerText` equals `textContent`. The only text on the screen besides the table is the `<h1>` and "Back".

### CSS (binding; tokens extend design-system.md)
- Never set `display` (to `block`, `flex`, `grid`, `inline-*`) on `table`, `thead`, `tbody`, `tr`, `th` or `td`: Chromium drops table roles from elements whose display is not a table value. The e2e role counts probe this.
- `.standings`: `width: 100%`, `border-collapse: collapse`, `font-size: 0.9rem`, `font-variant-numeric: tabular-nums`.
- Cells: `padding: 10px 4px`; numeric cells right-aligned, `white-space: nowrap`, `width: 1%`. The Club `th` is left-aligned, `font-weight: 600` and `overflow-wrap: anywhere`. Header cells use the gold `--accent`, `font-size: 0.8rem`, `font-weight: 700`, a chalk 25% bottom border, no `text-transform`. Body rows have a chalk 25% bottom border on a faint chalk wash (the row-surface language of the design system).
- New token `:root { --highlight: rgba(242, 193, 78, 0.18); }` (gold at 18%). `tr[aria-current="true"]` uses it as the background, a 4px `--accent` left edge on its first cell (an inset box-shadow, not a border, so column widths do not move) and bold text.
- The `.league-table h1` follows the other screens (1.75rem, 16px bottom margin, `overflow-wrap: anywhere`); the table has a 16px bottom margin before "Back".
- Buttons stay 48px. Nothing scrolls sideways at 390px; the Club cell wraps.

### Shell: `src/main.ts`
- A `table` render case: `findClub(league, screen.clubId)` (throws on an unknown club, as the other cases), then `renderTable(root, { rows: standingsOf(state), managedClubId: screen.clubId }, dispatch)`. The `never` guard keeps the switch exhaustive. The `match` case is unchanged.

### Names (D11)
- "Table" and "League table" appear (as case-insensitive substrings) in no array of `names.ts` (checked by grep: none). DISTILL adds the unit check, as for "Play match".
- "Table" is a substring of no existing accessible name, and none of "Squad", "Tactics", "Starting", "Players", "Back", "Clubs", "Choose", "Formation", "Line-up", "Play match", "Goals", "Matchday" is a substring of it. The column header "Club" is a `columnheader`, the list "Clubs" a `list`: different roles.
- Short exact names ("P", "W", "D", "L", "GD", "Pts", "Pos") are substrings of other texts, so every locator for them must use `exact: true` (DISCUSS hand-off, restated in the brief).

## Consequences

### Positive
- The table is a pure function of the recorded results: K2 holds by property tests over seeds x clubs, and K3 follows from ADR-0012 (the results never move).
- D14: later versions add GF/GA, form or the matchday-2 results by appending columns after "Pts" and data to `results`, with no change to the first 8 columns.
- Native table semantics with no ARIA roles, one `aria-current` hook for meaning and style.
- No dependency, no new container.

### Negative
- The CSS has one hard rule (no `display` on table parts) that only the e2e enforces.
- The GD formatter lives in the domain.
- `update` is at 13 of 15 cases.
- Automatic layout lets column widths vary slightly with content.

### Contract shapes
| Component | Shape | Universe and assertion |
|---|---|---|
| `standings`, `formatGoalDifference`, `standingsOf` | pure, return-only | Deep-equal on repeat, inputs (deep-frozen) unchanged, properties above, goldens (the seed-31 table), a sign table for the formatter, a code-point order case with a space |
| `update` (`ViewTable`, `Back`) | pure, return-only | Returned state is `{ ...state, screen }`; whole-state `toEqual`, `toBe` for no-ops, deep-freeze |
| `renderTable` | bounded-change | Universe: root's one `section.league-table` child with exactly h1, table and Back; e2e role counts; the `.focus(` grep test over `src/ui/` |

### Earned Trust (no adapter; environment assumptions named and probed)
1. **Native table roles survive the CSS and the browser's role mapping** (`th[scope=row]` is a `rowheader` in Chromium; no `display` override).
   - Probe: the e2e reads the table by role and asserts: 1 table named "League table"; 9 rows; 8 columnheaders with the exact names in order; 8 rowheaders; 56 cells; each body row's first cell is Pos 1..8 and its rowheader is a club of the "Clubs" list.
   - Faults: `display: block` on a `tr`, or `scope` missing, drops roles and turns the counts red.
2. **The table fits 390px**: the e2e asserts `document.documentElement.scrollWidth <= clientWidth` and the table's `scrollWidth <= clientWidth` with the longest club names of `?seed=31` and `?seed=abc`, after matchday 1 (two-digit values appear in later seasons; the nowrap cells would grow, which the same check catches then). Fault: removing `overflow-wrap: anywhere` or adding a fixed width turns it red.
3. **Text equality**: each cell's `innerText` equals `textContent` and the GD cells read `+4`, `0`, `-1` with U+002D. Fault: `text-transform` or a Unicode minus.
4. **Highlight**: exactly one row has `aria-current="true"` and its rowheader is the managed club. Fault: a class-only highlight or two rows marked.
5. **Cross-engine determinism of the table**: the seed-31 table after matchday 1 equals the Node-pinned table (shared with ADR-0012 probe 1).
6. **Sort order is engine-independent**: no `localeCompare` (grep test) and a unit case where a name with a space precedes a longer-prefix name.

### Enforcement
- oxlint boundaries unchanged (`standings.ts` imports only domain; ui imports app and domain). `max-params` 3, `complexity` 15.
- Stryker's existing domain glob covers `standings.ts`; `state.ts` is already covered. No config change.
- The grep tests: no `localeCompare` in `standings.ts`; no `.focus(` under `src/ui/` (existing).

No external integrations, no contract tests, no new dependency.
