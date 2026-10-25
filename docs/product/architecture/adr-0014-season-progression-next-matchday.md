# ADR-0014: Season progression: "Play match" plays the next matchday (S-008)

- Status: Accepted. Superseded in part by ADR-0015 (S-009): decision 4, the "Season over" line in the Play match slot; the club home now offers an "End of season" button there, which opens the End of season screen.
- Date: 2026-10-25
- Deciders: nWave solution-architect (S-008 DESIGN, `interaction_mode=propose`)
- Related: ADR-0003 (functional core), ADR-0008 (focus plan), ADR-0009 (optional state field, `exactOptionalPropertyTypes`), ADR-0010 (schedule), ADR-0011 (streams 200..255), ADR-0012 (the results log this appends to), ADR-0013 (standings, unchanged).
- **Supersedes in part ADR-0012**: its rule "`PlayMatch` ... sets `results` to `state.results ?? playOpeningMatchday(...)`. So the first tap records, and any later tap leaves `results` as it is (the re-show, D2)", the sentence "the re-show ... is this version only", "`OPENING_MATCHDAY = 1` stays. The season story replaces its uses by a matchday held in state" (refined: the matchday is derived, not held), and the `matchFor` selector rule "the entry ... with `matchday === OPENING_MATCHDAY` that contains the club's index" (now `matchday === latest recorded`, see Decision). Also S-007 design D4. Everything else in ADR-0012 stands (record shape, `playMatchday`, `NewGame` drops `results`, fallback, forward compatibility).

## Context
S-008 makes every "Play match" play the next matchday (DISCUSS D1, D6, D7, D10).
- **D1**: each tap plays the next matchday for the league. Sam's fixture uses his formation and XI at the tap; the other 3 use automatic 4-4-2. The 4 results are appended, and earlier matchdays never change. The first tap of a new game is matchday 1 as before.
- **D2**: the match screen's h1 reads "Matchday N" (N just played), with the S-006 formats.
- **D6**: after matchday 14 the club home shows the plain line "Season over" instead of the button; a "Play match" action then is a no-op. This is this version only. (the line superseded by ADR-0015, S-009; the no-op stands)
- **D8**: no new RNG stream (matchday N uses streams 200 + 4(N-1) .. +3); same seed, club and picks give the same season.
- DISCUSS: derived, no second source of truth; "season over" is derived too.

Facts checked in the code:
- `PlayedMatch` carries its `matchday`; `playMatchday` accepts 1..14 and throws `RangeError` outside (`fixturesOf(15)` throws).
- `renderMatch` already prints `Matchday ${view.matchday}` and `main.ts` maps `MatchView.matchday` into it, so the match screen needs no change.
- `matchFor` has about 12 S-006 cases and `playOpeningMatchday` many S-007 call sites on states with no `results`; both rely on the matchday-1 fallback.
- `Screen` literals `{ kind: "match", clubId }` are asserted with `toEqual` in S-006/S-007 tests.
- `renderClubHome(root, club, dispatch)` is called only from `main.ts` (vitest has no DOM, so no unit test calls it).

## Options

### 1. How the next matchday is known
| Option | Pros | Cons |
|---|---|---|
| **A. Highest recorded matchday + 1 (the max over an empty log is taken as 0, so next = 1); `undefined` after 14 (chosen)** | One source (the log). No assumption about entry order or count per matchday. 56 entries at most | Reads the whole log per call (microseconds) |
| B. `results.length / 4 + 1` | Simplest arithmetic | Silently wrong if a partial or reordered log ever exists (a future loader) |
| C. A stored `matchday` counter in `GameState` | O(1) | A second source of truth; `initialState` gains a key or an optional field that can disagree with the log; every S-007 whole-state `toEqual` pattern needs care |

### 2. The producer
| Option | Pros | Cons |
|---|---|---|
| **A. A private `matchdayFor(state, clubId, matchday)` builds the 8 sides (managed `currentXI`, others `automaticXI(squad, DEFAULT_FORMATION)`) and calls `playMatchday`; `playOpeningMatchday` stays as its matchday-1 one-liner; `update` appends `matchdayFor(..., next)` (chosen)** | One side builder, one owner of the policy (ADR-0012 L9). `matchFor`'s fallback and the S-006/S-007 test call sites stay unedited | `playOpeningMatchday` is now used only by the fallback and tests (its name stays true: it produces matchday 1) |
| B. Replace it with a public `playNextMatchday(state, clubId)` | One producer name | Rewrites the fallback and every S-007 call site; the fallback needs a matchday constant anyway |
| C. Precompute the season at the first tap | One call | Freezes Sam's XI for 14 matchdays; contradicts D1 and D5 |

### 3. What the match screen reads
| Option | Pros | Cons |
|---|---|---|
| **A. `matchFor(state, clubId)` returns the managed club's entry of the latest recorded matchday (selection rule below); the matchday-1 derivation stays as its fallback when nothing is recorded (chosen)** | Same signature, same `MatchView`; `main.ts` and `renderMatch` unchanged; S-006 cases and the fallback-equivalence property stay green. The match screen is reachable only straight after a tap, so "latest" is "just played" | "Latest" is implicit; re-opening an older match (a later story) needs a matchday on the screen |
| B. `Screen` match carries `matchday` | Ready for re-open | Breaks the `toEqual({ kind: "match", clubId })` literals, extends `sameScreen`; no consumer today |
| C. `matchFor(state, clubId, matchday)` | Explicit | Same ripple in S-006 cases; `main.ts` must find the matchday somewhere |

### 4. "Season over"
| Option | Pros | Cons |
|---|---|---|
| **A. `nextMatchday(state) === undefined` computed in `main.ts`, passed to `renderClubHome` as `seasonOver`; the renderer swaps the "Play match" button for `<p class="season-over">Season over</p>` in the same slot of `div.club-actions` (chosen)** (superseded by ADR-0015, S-009: the slot holds an "End of season" button) | Derived, no second source. The line is not a button or heading. The guard and the flag use one selector | `renderClubHome` props change |
| B. A stored `seasonOver` flag | Trivial read | Second source; can disagree with the log |
| C. A `Screen` kind "seasonOver" | Room to grow | That is the later end-of-season story (final position, top scorer); out of scope (D6) (taken by ADR-0015, S-009) |
| D. A disabled "Play match" button | Fewest changes | Keeps the name "Play match", against D6; a dead tap target |

## Decision
**1A, 2A, 3A, 4A.** No new dependency.

### App: `src/app/state.ts` (EXTEND)
- `nextMatchday(state) => number | undefined` (exported, pure): highest `matchday` in `state.results` plus 1 (1 when none); `undefined` when that exceeds `MATCHDAYS` (14).
- `PlayMatch` (valid only from a known club's `clubHome`, as before): when `nextMatchday(state)` is `undefined` it returns the very same state (no-op, `toBe`); else it goes to `match` of the same club with `results` = the old entries followed by the 4 entries of `matchdayFor(state, clubId, next)`. The earlier entries are the same objects; `results` itself is a new array per tap.
- `matchFor` per 3A, with this **selection rule (binding)**: let `latest` = the highest `matchday` in the record, which is `nextMatchday(state) - 1` while matchdays remain and 14 when the season is over. Restrict the record to entries whose `matchday === latest`, then take the entry that contains the club's index. The S-007 body (`results.find(home === i || away === i)` over the whole log) returns the FIRST entry, matchday 1, and would ship the re-show; it must not survive. With nothing recorded, the record is the matchday-1 derivation (`latest` = 1).
- `OPENING_MATCHDAY = 1` stays as the fallback matchday and as the value `playOpeningMatchday` passes; `update` no longer reads it.
- Unchanged: `NewGame` drops `results`; no other action touches it; `Screen`, `Action`, `focusPlan`, `sameScreen`, `back`, `standingsOf`, `initialState`; `update` stays at 12 cases (complexity 13, limit 15).
- The domain is unchanged: `playMatchday`, `fixturesOf`, `standings`, the streams and every golden.

### UI
- `renderClubHome(root, { club, seasonOver }, dispatch)`: `div.club-actions` holds Squad, Tactics, Starting XI, then either the "Play match" `button.primary` or `<p class="season-over">Season over</p>`, then Table. The `<p>` is plain text (one text node via `el()`), no role, no heading, no listeners. (the `<p>` branch superseded by ADR-0015, S-009: the branch is a `button.primary` "End of season")
- CSS `.season-over`: block, centred, `min-height: 48px`, gold text, dashed chalk 25% border, no `text-transform`, no flex or grid. Noted in `docs/product/ui/design-system.md`. (superseded by ADR-0015, S-009: the rule is deleted)
- `main.ts`: the `clubHome` case passes `seasonOver: nextMatchday(state) === undefined`. The `match` case and `renderMatch` are unchanged.
- Focus (ADR-0008): renderers never move focus. Every navigation changes the screen (club home, match, table), so the shell focuses the new `<h1>`. The flag only changes on a re-render of the club home, which is a navigation. No focus ids.

### Determinism
No new stream or draw. Matchday 1 is bit-identical to S-007. The same seed, club and picks give the same 14 matchdays; with untouched tactics the 3 other fixtures do not depend on who is managed.

## Consequences

### Positive
- One log feeds the match screen, the table, the next matchday and "season over". Nothing new is stored.
- The change is one selector, one producer generalisation, one guard, one props flag. The domain and `main.ts`'s match case are untouched.
- K3 ("played stays played, only forward") holds by construction: appends only, the earlier entries are the same objects.

### Negative
- `results` identity is no longer stable across taps. The S-007 invariant "once set, the same array until `NewGame`" becomes "earlier entries are the same objects" (amended tests below).
- `nextMatchday` assumes a log that is contiguous (matchdays 1..k, 4 each). True by construction; a future loader must validate it (see Earned Trust).
- `playOpeningMatchday` is now a thin matchday-1 wrapper kept for the fallback.

### Contract shapes
| Component | Shape | Universe and assertion |
|---|---|---|
| `nextMatchday` | pure, return-only | 1 on none, k+1 for k recorded, `undefined` at 14; property: equals `results.length / 4 + 1` along any play-only run; frozen state unchanged |
| `update` (`PlayMatch`) | pure, return-only | Returned state is `{ ...state, screen, results }`: `screen` becomes `match`; `results` grows by exactly the 4 entries of matchday k+1 (equal to `playMatchday` with Sam's `currentXI` and automatic others); earlier entries `toBe` identical; after 14 the very same state (`toBe`); `NewGame` drops `results`; any other action keeps the same array (`toBe`) |
| `matchFor` | pure, return-only | Entries restricted to `matchday === latest`, then the club's entry (`matchday` = N, never the matchday-1 entry once 2 are recorded); unknown club `undefined`; nothing recorded: the S-006 fallback (cases unedited). Unit boundary cases at matchday 2 (not matchday 1) and 14 |
| `renderClubHome` | bounded-change | Universe: `section.club-home` = swatch, h1, `div.club-actions` of 5 children in the order Squad, Tactics, Starting XI, [`button.primary` "Play match" or `p.season-over` "Season over"], Table. The flag is the only input that changes it (superseded by ADR-0015, S-009: the second choice is a `button.primary` "End of season") |
| `main.ts` | bounded-change | Enumerated universe of the whole file: reads `location.search` once; writes only `root`'s children and focus. The S-008 delta: the `clubHome` case's props (the `seasonOver` flag); every other case, the loop and the focus calls are unchanged. (The earlier "unbounded-preservation" label is dropped.) |

### Earned Trust (no adapter; environment assumptions named and probed)
1. **Chromium vs Node over 14 matchdays.** The e2e reads all 14 score lines at `?seed=31` and compares them with the reference season pinned by the Node test (DISCUSS `reference-season.md`). WebKit and iOS Safari are not probed. Fault: an approximated function in `match.ts` (the grep test also covers it).
2. **Append-only.** fast-check property over seeds, 8 clubs and runs of up to 80 actions (`numRuns` 100, fresh `FC_SEED`): every earlier entry stays `toBe` identical; `results.length` is 0, 4, ..., 56; matchdays contiguous. Fault: a re-record or reorder.
2a. **K2 measurement (DISCUSS: 100% over seeds 1..1000 x 8 managed clubs).** Two layers. (i) The schedule invariants are one exhaustive, seed-independent check over 8 clubs x 14 matchdays (`fixturesOf`): over matchdays 1..7 and 8..14 the club meets each other club once, and is named first against each exactly once. A committed loop over seeds 1..1000 is only a cheap guard that the mapping from club names to indices does not matter. (ii) Only the season and table layer is sampled: fast-check (`numRuns` 100, fresh `FC_SEED`, whole seasons through `update`) for row rules, totals, `played` = N after every tap, Sam's row equals the sum of his score lines. The full 8000 seasons are not simulated; the claim is the sample plus the exhaustive schedule layer.
3. **The guard.** Fourteen taps then a 15th `PlayMatch` returns `toBe` the same state and never throws; boundary cases at 13, 14 (kills an off-by-one mutant in Stryker's nightly run on `state.ts`).
4. **Derived equals counted.** `nextMatchday` equals `results.length / 4 + 1` on every reachable state (reachable states are contiguous); a future persistence story must validate shape, order and contiguity of a loaded log, with its own `probe()`.
5. **"Season over" is plain text.** The e2e asserts: no button named "Play match", one element reading exactly "Season over" that is no heading and no button, the other four buttons present and 44px or taller, no sideways scroll, `innerText` equals `textContent`. Fault: a disabled button, a `text-transform`, a heading. (superseded by ADR-0015, S-009: the slot holds a button; its Earned Trust is ADR-0015 item 4 and 6)
6. **Names.** "Season over" in no `names.ts` string (unit check, as D9). (kept as a harmless guard; ADR-0015 item 7 adds the new phrases)

### Enforcement
- oxlint boundaries unchanged (`state.ts` imports domain only, ui imports app and domain). `max-params` 3 (`renderClubHome` keeps 3 through a props object), `complexity` 15 (`update` stays at 12 cases, complexity 13).
- Stryker's globs already cover `state.ts`; no config change. The `.focus(` grep test over `src/ui/` still holds.

No external integrations, no contract tests, no new dependency.
