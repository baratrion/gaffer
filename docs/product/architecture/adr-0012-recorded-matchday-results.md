# ADR-0012: Recorded matchday results in session state (S-007)

- Status: Accepted. Superseded in part by ADR-0014 (S-008): the rule that later "Play match" taps re-show the recorded match (and `OPENING_MATCHDAY` as a matchday to be held in state); every later tap now appends the next matchday.
- Date: 2026-10-23
- Deciders: nWave solution-architect (S-007 DESIGN, `interaction_mode=propose`)
- Related: ADR-0003 (functional core; future `toSave`/`fromSave`), ADR-0005 (d) (derive on render), ADR-0009 (optional state field pattern, `exactOptionalPropertyTypes`), ADR-0010 (schedule), ADR-0011 (match model and streams), ADR-0013 (standings and table screen, which reads what this ADR records).
- **Supersedes in part: ADR-0011 section 5 ("Where the result lives", option 5A "Not stored") and the S-006 decision D8 ("Result not stored")**, together with the ADR-0011 App line "`GameState` and `initialState` are unchanged", the ADR-0011 Consequence "Nothing is stored", the claim that `matchFor` is the one place that derives a match (since S-007 `playOpeningMatchday` also derives), and the brief line "`GameState` gains nothing: the result is never stored (D8)". Everything else in ADR-0011 stands unchanged: the model, the constants, the draw order, the goldens, the streams, the screen markup.

## Context
S-007 shows a league table after matchday 1 (DISCUSS D1, D2, D9). The binding rules:
- **D1**: the first "Play match" of a new game plays matchday 1 for the whole league. Sam's fixture uses his formation and current XI (as in S-006); the other 3 fixtures use both clubs' automatic XI in 4-4-2. The 4 results are recorded in session state at that moment.
- **D2**: afterwards, the match screen and the table read only the recorded results. Changing the formation or XI never moves them. A second "Play match" re-shows the recorded matchday-1 match (this version only). (superseded by ADR-0014, S-008)
- **D9**: the user-visible lifetime is "until the page is reloaded" (no persistence yet); a new game after a page load starts from the all-zero table. "New game" is only on the title screen, which only a page load reaches, so "the `NewGame` action clears `results`" is a unit-level invariant, not a user-visible step. The results are a pure function of the seed, the fixtures and both sides; no new RNG stream.
- DISCUSS H1 requires this ADR, accepted, before DELIVER.

What S-006 decided, quoted so the supersession is explicit:
- S-006 D8: "**Result not stored**. A pure `matchFor(state, clubId)` in `state.ts` derives it on render; `main.ts` calls it and maps it to view props."
- ADR-0011 section 5, chosen option: "**A. Not stored: a pure app selector `matchFor(state, clubId)` in `state.ts` derives it on render, and `main.ts` calls it (chosen)**". Its stated reason was that `GameState` stays unchanged. Its rejected option 5C ("Store the result in `GameState` on `PlayMatch`") named two cons: "Stores derivable data" and "an optional field is a second source of truth".
- Why that reasoning no longer holds: it assumed one match, a function of the current tactics. With a table, the 4 results must not move when Sam changes his eleven afterwards (D2). A value derived from live tactics cannot give that. The result is now a fact, not a view, so storing it is not duplication.

Facts checked in the code:
- `GameState` is `{ league, screen, formation, xi? }`; `xi` is optional because the S-003/S-004 acceptance tests assert whole states with `toEqual` (ADR-0009: `toEqual` ignores a key holding `undefined` but not `null`, and not an empty array).
- `playMatch` has one parameter, streams are per fixture (`200 + (matchday - 1) x 4 + fixtureIndex`), so the 4 fixtures of a matchday are independent of each other and of who is managed.
- `matchFor(state, clubId)` has a `MatchView` return shape used by `main.ts` and by about 12 S-006 acceptance cases on states that hold no results.
- `NewGame` is reachable only from the title screen, and the title is reached only at page load, so a "New game" with results present cannot happen yet.
- Squad order and name pools are frozen (ADR-0005/0006), so a goal's `playerIndex` stays meaningful across sessions.

## Options

### 1. What is recorded
| Option | Pros | Cons |
|---|---|---|
| **A. The results themselves: an append-only list `results?: readonly PlayedMatch[]`, each entry `{ matchday, fixtureIndex, home, away, result: MatchResult }`, plain numbers and strings only (chosen)** | Facts do not change when the model, a constant or an XI rule later changes ("what is played stays played" also across a future save). Self-contained: standings need only clubs and results, not the schedule. Plain JSON-able data, so a later `toSave` serialises it unchanged. One flat list grows to 14 matchdays x 4 with no shape change. Absent key means "nothing recorded", so every S-001..S-006 whole-state assertion on a never-played state stays valid (ADR-0009 pattern) | State now holds derivable-in-principle data; two fields (`home`, `away`) repeat what the frozen schedule says (accepted: independence from the schedule) |
| B. Store only the kick-off snapshot (formation and XI at the first tap) and re-derive all 4 results on every render | Smallest state | The history is re-derived from the current model: an ADR-0011 amendment, a change to the "other clubs play automatic 4-4-2" rule, or the first AI-chosen XI would silently rewrite old results. Needs one snapshot per matchday later, and recomputes 8 squads and 4 matches per render |
| C. Store only the standings rows | Smallest data for the table | The match screen needs the goal list, so it cannot be served. Loses the facts the table is derived from |
| D. A required `results: readonly PlayedMatch[]`, `[]` at the start | No optional-field reading | `initialState` gains `results: []`; vitest `toEqual` treats an empty array as different from a missing key, so S-004's `initialState` equality and the literal states in S-003 fail (the ADR-0009 option 1B argument) |

### 2. Where the 4-fixture simulation lives
| Option | Pros | Cons |
|---|---|---|
| **A. A pure domain function `playMatchday` in `match.ts`: takes the seed, the matchday and the 8 sides indexed by club index, returns the 4 `PlayedMatch` in fixture order (chosen)** | It is a game rule ("each fixture has its own stream; a matchday is its 4 fixtures"), so it belongs to the core (ADR-0003), under Stryker's domain glob and testable in Node with no state. The season story calls it unchanged for matchdays 2..14. Knows nothing about who is managed: the app decides the XIs | One more exported function and type in `match.ts` (no new file, no new import beyond `league.ts`'s club count) |
| B. A loop inside `state.ts` over `fixturesOf(1)` | About 8 fewer lines; no domain change | Ties the matchday rule to `GameState`; the season story would extend or copy it; the equivalence "one stream per fixture" lives outside the domain tests |
| C. Record only Sam's match at the tap; derive the other 3 on each table render | Less at the tap | Reintroduces on-demand derivation for the table, which then moves when Sam changes a formation unless frozen anyway; rejected by DISCUSS (a table with 2 clubs on P 1 and 6 on P 0 is not a league table) |

### 3. How the match screen reads
| Option | Pros | Cons |
|---|---|---|
| **A. `matchFor(state, clubId)` stays the one selector `main.ts` calls: it returns the club's recorded match when `state.results` holds one, else it derives the same match with the S-006 rules; same `MatchView` shape (chosen)** | `main.ts`'s `match` case does not change. Every S-006 `matchFor` case (golden, symmetry, follows a stored `xi`) stays green unedited. After the tap, the screen reads only the recorded results (D2). The fallback is a total function, unreachable through `update` (which records before it shows the screen); and it is the reversibility path | A fallback branch that `update` cannot reach: covered by the retained S-006 cases, flagged here so nobody treats it as a second source |
| B. A new reader `recordedMatchFor` and `matchFor` kept as an unused derivation | Two names, each pure | `matchFor` would have no production caller (dead code) and two selectors would answer one question |
| C. Delete `matchFor`, make the reader return `undefined` when nothing is recorded | One path only | Rewrites about 12 S-006 cases (DISCUSS D12 budgets 3), for a state `update` never produces |

## Decision
**1A, 2A, 3A.**

### Domain: `src/domain/match.ts` (EXTEND, pure)
- `PlayedMatch = { readonly matchday: number; readonly fixtureIndex: number; readonly home: number; readonly away: number; readonly result: MatchResult }`. `home` and `away` are club indices as in `Fixture`. Plain data only: numbers, and the existing `MatchResult` (numbers and the `"home" | "away"` literals). No functions, no class instances, no `undefined` holes, so `JSON.parse(JSON.stringify(x))` deep-equals `x`.
- `playMatchday(input: { seed, matchday, sides }) => readonly PlayedMatch[]`, one parameter (oxlint `max-params`). `sides` is the 8 `MatchSide`s indexed by club index 0..7.
  - For each fixture `k` of `fixturesOf(matchday)`, in index order, it returns `{ matchday, fixtureIndex: k, home, away, result: playMatch({ seed, matchday, fixtureIndex: k, home: sides[home], away: sides[away] }) }`.
  - It reuses `playMatch` unchanged, so each result is bit-identical to the one `playMatch` gives for that fixture (same stream, same 54 draws). The stream table does not change: matchday 1 uses 200..203.
  - A `sides` array whose length is not 8, or a bad matchday, throws `RangeError` (a bad matchday through `fixturesOf`). Programming errors, never user input.
- ADR-0011's constants, draw order and goldens are untouched. The `match.ts` grep test (no `Math.pow`, `**`, `exp`, `log`) still holds.

### App: `src/app/state.ts` (EXTEND)
- `GameState` gains `readonly results?: readonly PlayedMatch[] | undefined`. Absent or `undefined` means "nothing recorded". Once present it is the full set of recorded matches: 4 entries (matchday 1) in this story. `initialState` is unchanged.
- `playOpeningMatchday(state, managedClubId) => readonly PlayedMatch[] | undefined` (exported, pure): `undefined` for a club not in the league. Otherwise it builds the 8 sides through `squadOf(league, club.id)`: the managed club's XI is `currentXI(state, squad)`, every other club's is `automaticXI(squad, DEFAULT_FORMATION)`, then calls `playMatchday({ seed: league.seed, matchday: OPENING_MATCHDAY, sides })`. It is the only producer of recorded results.
- `PlayMatch` (valid only from a known club's `clubHome`, as before) goes to `match` of the same club, and sets `results` to `state.results ?? playOpeningMatchday(state, clubId)`. So the first tap records, and any later tap leaves `results` as it is (the re-show, D2). (superseded by ADR-0014, S-008: every tap appends the next matchday) Nothing else about `PlayMatch` changes.
- No other action touches `results`. `ChooseFormation`, `PickPlayer`, `Back`, `ViewSquad`, `ViewTable` and the rest return states that keep it (they spread the state), so Sam's changes never move the record (K3).
- **The re-show is not pinned in `tests/protected/S-007`**: a second "Play match" showing the same recorded match is this version only (DISCUSS D2, D14). It is covered by the e2e and unit tests, so the season story may replace it with "play the next matchday" without amending a protected scenario.
- **Policy, with one owner (reviewer L9)**: "every club but the managed one fields `automaticXI(squad, DEFAULT_FORMATION)`" is an app-level policy, not a domain rule. Its single owner is `playOpeningMatchday` (the side builder in `state.ts`, using the `DEFAULT_FORMATION` constant); no other code restates it. The season story, which may give AI clubs their own formation or XI, revisits it there.
- `NewGame` also drops `results` (a `withoutResults` helper that returns the same state when none is stored, like `withoutPicks`, so a never-played state keeps its exact keys). It is future-proofing today, as for `xi`.
- `matchFor(state, clubId)` per option 3A: unknown club gives `undefined`; else the entry of `state.results ?? playOpeningMatchday(state, clubId)` with `matchday === OPENING_MATCHDAY` that contains the club's index, returned as the unchanged `MatchView` `{ matchday, home: { club, squad }, away: { club, squad }, result }`.
- `OPENING_MATCHDAY = 1` stays. The season story replaces its uses by a matchday held in state.

### Determinism, goldens, streams
- No new stream, no new draw. The opponent of Sam's fixture is `automaticXI(squad, DEFAULT_FORMATION)` exactly as in S-006, so the S-006 goldens (seed 31: Netherwold Borough 1–2 Marlbrook Athletic; seed 20260: Harrowgate Lane United 0–1 Oakhampton Rise Borough) and every S-001..S-006 output stay identical.
- The 3 other fixtures do not depend on who is managed (independent streams, automatic XIs on both sides), so with untouched tactics the whole record is the same whichever club Sam manages. Only Sam's own fixture reads his formation and XI.

### Forward compatibility and reversibility
- Matchdays 2..14: append the next `playMatchday` result to `results`; each entry carries its matchday. The table is a function of the whole list. The re-show rule (second "Play match" shows matchday 1) is this version only and lives in `matchFor`/`PlayMatch`, not in the data. (superseded by ADR-0014, S-008)
- Persistence: a save is `{ seed, formation, xi, results }`, all JSON-able. The league and squads regenerate from the seed (name pools and squad order are frozen). A loader validates shape, a separate story with its own probe (Earned Trust below).
- Reversal (if the owner wants the derivation back): stop setting `results` in `PlayMatch`. `matchFor` already contains the S-006 derivation as its fallback, so the screen keeps working; the table would need a recompute, which is what `playOpeningMatchday` already is. One line in `state.ts`, plus deleting the field.

## Consequences

### Positive
- "What is played stays played" holds by construction, across formation and XI changes, and later across saves and model amendments.
- One source for the match screen and the table, and `main.ts`'s `match` case is untouched.
- The matchday rule is a domain function, ready for the season story.
- Whole-state assertions on never-played states stay valid (absent key), so S-001..S-006 acceptance tests need only the three D12 `update` amendments (plus the e2e button lists).

### Negative
- `GameState` holds game history for the first time. The derivable parts (home, away from the schedule) are repeated on purpose.
- A fallback path in `matchFor` that `update` never reaches.
- Recorded `playerIndex` values depend on the frozen squad order. A future reshuffle of squads would need a save-version story first.
- `playOpeningMatchday` generates 8 squads at the tap and `matchFor` generates 2 per render (microseconds).

### Contract shapes
| Component | Shape | Universe and assertion |
|---|---|---|
| `playMatchday` | pure, return-only | The returned array: deep-equal on repeat, inputs (deep-frozen sides) unchanged, each entry equal to `playMatch` for that fixture, plain-JSON round trip, `RangeError` table |
| `playOpeningMatchday`, `matchFor` | pure, return-only | Unit tests on frozen states; `matchFor` after a tactics change still returns the recorded value. **Fallback equivalence property** (M5): over seeds, all 8 clubs, formations and optional picks, `matchFor(state without results, clubId)` deep-equals `matchFor({ ...state, results: playOpeningMatchday(state, clubId) }, clubId)`, so the fallback and the record can never disagree |
| `update` (`PlayMatch`, `NewGame`) | pure, return-only | Returned state is `{ ...state, screen, results }`: only `screen` and, on the first tap, `results` change; whole-state `toEqual`, `toBe` for no-ops; deep-freeze for no mutation; property: any run of up to 40 actions never changes `results` once set except by `NewGame` |

### Earned Trust (no adapter; environment assumptions named and probed)
1. **Chromium vs Node determinism of all 4 fixtures** (Chromium must compute what Node computes; WebKit and iOS Safari are not probed): the e2e compares the seed-31 table after matchday 1 with the table pinned by the Node test (the DISCUSS example, derived from the ADR-0011 fixture values). Fault: an approximated function in `match.ts` changes a last bit; the existing grep test catches it structurally.
2. **Recording is not silently lost or doubled**: the property "first tap sets 4 entries; any later action keeps the same array object (`toBe`)" fails if a spread or a re-record sneaks in.
3. **Future persistence** will be the first real adapter (`localStorage` lies: quota, private mode, stale versions). It needs its own `probe()` and a shape validator; not in this story. The JSON round-trip test keeps the data honest until then.

### Enforcement
- oxlint boundaries unchanged (`match.ts` imports only domain; `state.ts` imports no ui). `max-params` 3, `complexity` 15 (`update` goes to 13 cases, `back` to about 12).
- Stryker's existing globs cover `match.ts` and `state.ts`; no config change.
- No new dependency, no external integration, no contract test.
