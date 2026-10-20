# ADR-0011: Match model, its RNG stream, and the derived match screen (S-006)

- Status: Accepted
- Date: 2026-10-20
- Deciders: nWave solution-architect (S-006 DESIGN, `interaction_mode=propose`)
- Related: ADR-0003 (functional core), ADR-0005 (d) (derive on render), ADR-0006 (derived overall, stream table), ADR-0008 (focus), ADR-0009 (`currentXI`, `automaticXI`, optional `xi`, inline-flow text rule), ADR-0010 (schedule). Extends the stream table of ADR-0006 with 200..255. Supersedes nothing.

## Context
S-006 plays the managed club's matchday-1 fixture and shows the final score and the goals (DISCUSS D1-D15). Binding rules:
- D6: the match is a pure function of the seed, the fixture and both sides (formation and XI); its draws use a stream of their own so streams -1, 0..7, 100..107 and every S-001..S-005 output stay unchanged.
- D7: event-based and seeded; team strength from the XI's attributes. Over at least 1000 seeded matches: (a) between two automatic 4-4-2 XIs, mean goals per side in 1.0-2.0 and under 20% 0–0; (b) against the same opponent XI, an XI whose sum of 11 overalls is at least 20 higher scores more goals on average (DESIGN may refine "stronger", but (b) must hold for this measure); (c) at most 9 goals per side.
- D4: scorers are outfield starters of the side (never the GK slot), no own goals. D3: minutes 1-90, never decreasing.
- D8/D10: nothing is stored; `GameState` gains nothing; one new screen and one new action. D13: the result is on screen on arrival.
- Out of scope (DISCUSS Out-of-scope and D15): home advantage, condition, morale, opponent tactics, commentary, stats.

Facts checked in the code: `Player.overall` is `deriveOverall(position, attributes)`, a position-weighted mean of the four attributes (ADR-0006); `automaticXI(squad, formation)` and `currentXI(state, squad)` exist (ADR-0009); slot 0 of every formation is the GK (`lineUp`); `nextFloat` returns `value` in [0, 1) by integer operations and one division by 2^32; `GameState.xi` is optional and the S-003/S-004 acceptance tests assert whole states with `toEqual` (ADR-0009). Tooling: no DOM test environment in vitest (no jsdom or happy-dom in `package.json`); oxlint `max-params` 3, `complexity` 15; Stryker mutates `src/domain/**` and `src/app/state.ts`. No library API is involved (no new dependency).

## Options

### 1. How goals are generated
| Option | Pros | Cons |
|---|---|---|
| **A. Fixed chances: 9 chances per side, one per 10-minute window, each drawing exactly 3 floats (minute, conversion, scorer) whether or not it is a goal (chosen)** | 54 draws per match whatever the XIs, so changing the XI changes probabilities, never the random sequence (monotone coupling, below); the 9-goal cap holds by construction; minutes of one side are sorted by construction; every chance is a future commentary line ("a shot, saved") with no change to the draws | The chance count is a modelling constant (no "more chances for the better side": strength acts through conversion) |
| B. Per-minute loop (90 minutes x 2 sides, a goal draw each, p about 0.015) | Natural for a later minute-by-minute commentary | 180+ draws plus scorer draws; the 9-goal cap is a rule, not structure (stopping draws after 9 would shift the sequence); more to mutate |
| C. Poisson goal count per side, then place goals | Classic football model | Inversion needs `Math.exp`, which ECMAScript leaves implementation-approximated (Chromium, WebKit and Node may differ in the last bit, so a comparison can flip); variable draw count unless padded; truncation for the cap; not event-based |

### 2. Strength measure and conversion
| Option | Pros | Cons |
|---|---|---|
| **A. One strength per side, `S` = sum of the 11 overalls; strength share `S_own^3 / (S_own^3 + S_opp^3)`; conversion `p = 0.30 x share` (chosen)** | D7(b) holds for exactly the DISCUSS measure, and per seed (see Consequences); the overall already weighs each player's attributes for his position (ADR-0006), so attributes drive strength; strictly increasing in `S_own`, decreasing in `S_opp`, bounded in (0, 0.30) with no clamp; integer cubes (at most 220^3) and one division: correctly rounded IEEE operations, identical in every engine | Formation acts only through who plays; a team of good defenders and poor forwards converts like any team of the same sum |
| B. Attack and defence ratings from attributes (attack from outfield shooting and passing, defence from defending plus GK goalkeeping) | Richer football flavour | Breaks D7(b) for the sum-of-overalls measure: an XI 20 higher only through its GK and defenders has a weaker attack and scores less; fast-check finds such pairs; two ratings to calibrate |
| C. Linear in the strength difference, clamped to [min, max] | Simplest formula | At the clamp, a stronger XI scores the same, so D7(b)'s "more" fails for extreme pairs |
| D. Logistic in the difference | Smooth | `Math.exp` is implementation-approximated (cross-engine determinism risk, as 1C) |

### 3. Who scores
| Option | Pros | Cons |
|---|---|---|
| **A. Weighted among the side's outfield starters: weight = shooting x position factor (DF 1, MF 2, FW 4) (chosen)** | Simulated shares DF 12%, MF 36%, FW 51%, close to real football; attributes visibly matter (a sharp-shooting midfielder scores more); never the GK | Two tunable constants |
| B. Weight = shooting only | One rule | Defenders score about 27% of goals (their shooting is quality minus 6, not low enough) |
| C. Uniform among outfield starters | Simplest | Defenders score 40%; attributes do not matter |

### 4. RNG stream
| Option | Pros | Cons |
|---|---|---|
| **A. One stream per scheduled fixture: `deriveSeed(seed, MATCH_STREAM_BASE + (matchday - 1) x 4 + fixtureIndex)`, `MATCH_STREAM_BASE = 200`, so streams 200..255 for the 14 matchdays (chosen)** | Disjoint from -1, 0..7, 100..107 (and leaves 108..199 free); a fixture's result does not depend on whether other fixtures are simulated (the season story adds them freely); independent of which club is managed | 56 more stream numbers in the table |
| B. One stream per matchday, fixtures drawn in index order | Fewer streams | Playing fixture 3 requires drawing fixtures 0..2 first; results couple across fixtures |
| C. Stream from the club pair (`200 + home x 8 + away`) | Unique over the double round-robin | A later cup or replay of the same pair collides; ties the result to the pair instead of the schedule slot |

### 5. Where the result lives (D8)
| Option | Pros | Cons |
|---|---|---|
| **A. Not stored: a pure app selector `matchFor(state, clubId)` in `state.ts` derives it on render; `main.ts` calls it (chosen)** | Same pattern as `currentXI` and `squadOf` (ADR-0005 (d)); `GameState` unchanged, so every whole-state assertion in S-001..S-005 stays green; the derivation is unit-tested and under Stryker (`state.ts`), and `main.ts` stays a thin mapping | Recomputed on every render of the screen (two squads and 54 draws: microseconds) |
| B. Derive inline in `main.ts` | No new export | `main.ts` is outside unit tests and Stryker; symmetry and side choice would only be e2e-tested |
| C. Store the result in `GameState` on `PlayMatch` | Computed once | Stores derivable data; adds a field that breaks whole-state `toEqual` assertions, or an optional field with a second source of truth; D8 says nothing is recorded |

### 6. Score line and goals markup
| Option | Pros | Cons |
|---|---|---|
| **A. One `<p class="score-line">` of inline spans and literal single-space text nodes (home name, `" "`, `"h–a"`, `" "`, away name), styled as a scoreboard panel; a visible `<p id="goals-label">Goals</p>` and `<ul role="list" aria-labelledby="goals-label">` of one-line items (chosen)** | `textContent` and `innerText` both read exactly `Home 2–1 Away` (the brief's inline-flow rule); one element holds the whole score line; the list keeps its role and name when empty; one heading per screen | The scoreboard cannot use flex or grid columns; long names wrap inside the panel |
| B. Three-column flex or grid scoreboard | Classic look | Blockified children drop the space text nodes and split `innerText` into lines (ADR-0009 mechanism), breaking D2 |
| C. A `<table>` or `<dl>` for the result | Semantic pairs | Splits the score line into cells, so no single element reads the whole D2 text; adds table or list roles that tests could confuse with "Goals" |

## Decision
**1A, 2A, 3A, 4A, 5A, 6A.** No home advantage (out of scope, D15).

### Domain: `src/domain/match.ts` (pure)
- Types: `MatchSide = { readonly squad: readonly Player[]; readonly xi: StartingXI }`; `MatchInput = { readonly seed: number; readonly matchday: number; readonly fixtureIndex: number; readonly home: MatchSide; readonly away: MatchSide }`; `GoalEvent = { readonly minute: number; readonly side: "home" | "away"; readonly playerIndex: number }` (squad index of the scorer); `MatchResult = { readonly homeGoals: number; readonly awayGoals: number; readonly goals: readonly GoalEvent[] }`.
- `teamStrength(side) => number`: the sum of `squad[xi[i]].overall` over the 11 slots (integer, 11..220). Exported so tests use the same measure as D7(b).
- `playMatch(input: MatchInput) => MatchResult` (one parameter, `max-params` safe). A `matchday` that is not an integer 1..14 or a `fixtureIndex` that is not an integer 0..3 throws `RangeError`, so no call can alias another stream.
  1. `Sh = teamStrength(home)`, `Sa = teamStrength(away)`; cubes by multiplication (`S * S * S`, never `**` or `Math.pow`); `shareHome = Sh^3 / (Sh^3 + Sa^3)` and `shareAway = Sa^3 / (Sh^3 + Sa^3)`, each computed directly (not `1 - share`), so swapping the sides swaps the values exactly.
  2. `p(side) = MAX_CONVERSION * share(side)`.
  3. `rng = createRng(deriveSeed(seed, MATCH_STREAM_BASE + (matchday - 1) * FIXTURES_PER_MATCHDAY + fixtureIndex))`.
  4. For chance `c` = 0..8, for the side home then away, draw exactly three floats in this order, always: `uMinute`, `uConversion`, `uScorer`. `minute = 10c + 1 + floor(uMinute * 10)` (window `c` is minutes `10c+1..10c+10`, so 1..90). It is a goal when `uConversion < p(side)`. For a goal, the scorer is chosen among the side's outfield starters (slots whose player's position is not `GK`), walked in slot order, with weight `shooting * SCORER_FACTOR[position]`: with `W` the total weight, `target = floor(uScorer * W)`, and the scorer is the first slot whose cumulative weight exceeds `target`. Shooting is at least 1, so `W > 0`.
  5. `goals` = the goal events in generation order, stably sorted by minute (ties: home first, as generated). `homeGoals` and `awayGoals` are the counts per side (at most 9 by construction).
- Constants (tunable, frozen once DELIVER pins the golden; any change changes every result for every seed and needs an ADR note, like the name pools): `CHANCES_PER_SIDE = 9`, `MINUTES_PER_CHANCE = 10`, `MAX_CONVERSION = 0.30`, strength exponent 3 (written as two multiplications), `SCORER_FACTOR = { DF: 1, MF: 2, FW: 4 }` (GK excluded), `MATCH_STREAM_BASE = 200`. The stream table comment in `squad.ts` gains a pointer to this table.
- Arithmetic rule: only `+ - * /`, comparisons and `Math.floor` (all exact or correctly rounded), so Chromium, WebKit and Node compute the same result. No `Math.pow`, `**`, `Math.exp`, `Math.log` or other approximated functions in `match.ts`.
- Imports: `rng.ts`, types from `squad.ts` and `selection.ts`, `FIXTURES_PER_MATCHDAY` and `MATCHDAYS` from `schedule.ts`. No app or ui import.

Stream table (all in use after S-006): -1 names (league-wide); 0..7 club age and quality; 100..107 attributes and condition; 200..255 matches (`200 + (matchday - 1) x 4 + fixtureIndex`). Free: 8..99, 108..199, 256 and up.

### Calibration (DESIGN spike on 2026-10-20 against the real generator, not shipped)
A scratch script imported the real `generateLeague`, `generateSquad`, `automaticXI`, `deriveSeed`, `createRng` and `nextFloat` and implemented the rules above exactly. Results:
- Strength `S` of automatic XIs (seeds 1..2000, 8 clubs): 4-4-2 mean 148.6 (sd 16.3, 77..200); 4-3-3 148.1; 4-2-3-1 142.5. The XI of each position's lowest-rated players: mean 84.1 (32..152); automatic minus lowest: mean 64.5, minimum 26.
- Back-of-envelope: equal strength gives share 0.5, `p = 0.15`, mean goals per side 9 x 0.15 = 1.35, P(a side scores 0) = 0.85^9 = 0.23, P(0–0) = 0.85^18 = 0.054. A gap of 20 at S about 148 moves the share by about 3 x 0.25 x 20 / 148 = 0.10, so `p` by 0.03 and the mean by about 0.27 goals.
- D7(a), matchday 1, both sides automatic 4-4-2, 8000 matches (seeds 1..2000): mean goals per side 1.355 (home 1.38, away 1.33), 0–0 5.7%, maximum 6 goals by one side; distribution per side 0: 24%, 1: 35%, 2: 25%, 3: 11%, 4: 3%, 5+: under 1%. With 2000 random 32-bit seeds: 1.345 per side, 0–0 5.2%. All 14 matchdays, seeds 1..500: 1.352, 0–0 5.3%. Home, draw and away: about 37%, 25%, 37% (no home advantage). Margins against D7(a): the mean is 0.35 inside the lower bound and 0.65 inside the upper bound; the 0–0 rate is under a third of the 20% cap.
- D7(b), seeds 1..1000, 4000 matchday-1 cases, home XI swapped against the same automatic away XI: automatic 1.38 vs lowest 0.48 goals; an XI exactly 20 above the lowest: 0.76 vs 0.48. In 0 of 4000 cases did the lower-sum XI score more (monotone coupling).
- Scorers: DF 12.4%, MF 36.2%, FW 51.4%, GK 0.
- No seed in 1..2000 has all four matchday-1 matches 0–0. Seeds with a 0–0 on matchday 1 (fixture index, clubs): 8 (3: clubs 3 v 4), 15 (3: 3 v 4), 16 (3: 3 v 4), 17 (3: 3 v 4), 25 (2: 5 v 2).
- Stream sanity: the 73 streams -1, 0..7, 100..107, 200..255 gave pairwise distinct derived seeds for 10000 sampled seeds.
- Reference output under this spec (both sides automatic 4-4-2): seed 31, matchday 1 = "Netherwold Borough 1–2 Marlbrook Athletic" (17' Rurik Fairbourne, 22' Calder Redfern, 77' Rurik Fairbourne), "Fennimore Town 2–2 Valebridge Albion", "Tarnbeck Borough 5–1 Rushmoor Heath Albion", "Juniper Hollow United 1–3 Oakhampton Rise Borough"; seed 20260 (`?seed=abc`): "Harrowgate Lane United 0–1 Oakhampton Rise Borough" (65' Joren Northcott). DELIVER pins its own golden from the shipped code. If that golden differs from this reference, the implementation deviates from the draw order above, and DELIVER fixes the code, not the reference.

### App: `src/app/state.ts`
- `Screen` gains `{ kind: "match"; clubId: string }`. `Action` gains `{ type: "PlayMatch" }`: valid only from `clubHome` of a known club, to `match` of the same club; otherwise a no-op. `Back`: `match` (known club) goes to `clubHome`; with an unknown club it is a no-op. `GameState` and `initialState` are unchanged. `xi` and `formation` are never touched by the two actions.
- `focusPlan`'s `sameScreen` gains `match` (compared by `clubId`). Every S-006 navigation changes the screen, so focus goes to the new `<h1>`, and no focus ids are added.
- `OPENING_MATCHDAY = 1` (exported constant; the season story replaces it with a matchday in state).
- `matchFor(state, clubId)`: `undefined` for an unknown club. Otherwise, with the club index `c`, `{ index, fixture } = fixtureOf(OPENING_MATCHDAY, c)`; for each of `fixture.home` and `fixture.away`, the squad is `generateSquad(league.seed, i)` and the XI is `currentXI(state, squad)` when `i === c` (the managed club), else `automaticXI(squad, DEFAULT_FORMATION)`. It returns `{ matchday, home: { club, squad }, away: { club, squad }, result: playMatch({ seed: league.seed, matchday, fixtureIndex: index, home, away }) }`. It is the one place that derives a match. With untouched tactics both sides are automatic 4-4-2, so both clubs of a fixture get the same result (symmetry, by purity).

### UI (ADR-0002: `el()` and `textContent` only; renderers never move focus)
- Club home: a fourth `button.primary` "Play match" after "Starting XI" in `div.club-actions`, dispatching `PlayMatch`.
- `src/ui/screens/match.ts`, `renderMatch(root, view, dispatch)`. `main.ts` passes the view `{ matchday, home: { name, goals }, away: { name, goals }, goals: { minute, scorer, club }[] }`: scorer names come from the side's squad (`squad[playerIndex].name`), club names from `league.clubs`, and an index with no player throws, as the existing render cases do.
- Markup, top to bottom, as children of `<section class="match">`:
  1. `<h1 tabindex="-1">Matchday 1</h1>` (from `matchday`).
  2. `<p class="score-line">`, a direct child of the section with no wrapper: a home-name span, the text node `" "`, a goals span reading `2–1` (U+2013, no spaces), `" "`, and an away-name span. The `textContent` is exactly `Home 2–1 Away`. No ARIA on it.
  3. `<p id="goals-label" class="goals-label">Goals</p>` (visible, not a heading).
  4. `<ul role="list" aria-labelledby="goals-label" class="goal-list">`, with one `<li>` per goal in `goals` order. Each item is a minute span `23'` (straight apostrophe), `" "`, a scorer span, `" "`, and a club span `(Club Name)`, so the `textContent` is exactly `23' Ivo Elderkin (Netherwold Borough)`. For 0–0 the `<ul>` is still rendered, with no items.
  5. `.back-button` "Back", dispatching `Back`.
- Everything is rendered in the one synchronous render, so the score line and the goals are present when `main.ts` focuses the `<h1>` (D13). No timers.
- CSS rules (binding):
  - The score line, the goal items and their spans stay in inline flow: no flex, grid, float or `inline-block` on them or their spans.
  - The scoreboard look comes from the `<p>` box: `display: block`, a pitch-light panel, a 2px chalk border, a radius, centred text, a large bold font, the goals span in gold (`--accent`) with tabular numerals, and `overflow-wrap: anywhere` on the names.
  - The goal list may be a grid of `<li>`s (each item reads alone). Each item has a gold left border and a gold minute.
  - The list has a non-zero box when empty (for example `min-height: 1.5rem`), so the empty "Goals" list is visible, not only present.
  - The "Goals" label has no `text-transform`, so its DOM text, `innerText` and accessible name are all "Goals" (`.section-label` uppercases, so it is not reused here).
  - Buttons are 48px tall. Nothing scrolls sideways at 390px.
- Accessible names: "Play match", "Goals" and "Matchday" collide with no existing name and appear in no `names.ts` array (checked by hand; DISTILL adds the D11 unit check). "Play match" does not contain "Players", and "Goals" is not a substring of "Goalkeeping". The match screen has exactly one "Back". No other text on the screen contains an en dash: club and player names use only letters, spaces, apostrophes and the hyphen-minus.

### Shell: `src/main.ts`
- A `match` render case calls `matchFor(state, screen.clubId)`, which throws "Unknown club in game state" for `undefined`, maps the result to the view, and calls `renderMatch`. The `never` guard keeps the switch exhaustive. Focus handling is unchanged.

## Consequences
- Positive:
  - D7(a) and (c) hold with wide margins (calibration above), and D7(b) holds for the DISCUSS measure by construction.
  - The result is a pure function of (seed, matchday, fixture index, both sides). It does not depend on who manages, and two visits with the same seed and tactics read the same screen.
  - No stored state, no change to `GameState`, and no S-001..S-005 test or generator output changes (new stream only).
  - The fixed draws make later commentary additive: missed chances are already drawn.
  - Rules are in the domain, under Stryker. There is no new dependency, adapter or C4 container.
- Negative:
  - Formation has no tactical effect beyond who plays.
  - Strength ignores condition, home and morale (all deferred).
  - The model constants and the 200..255 stream block are frozen once the golden is pinned.
  - `matchFor` regenerates two squads per render (microseconds).
- Monotone coupling (why D7(b) holds per seed): the draw sequence depends only on the seed and the fixture, never on the XIs. A side scores in chance `c` exactly when `uConversion(c) < p`. If the side's strength rises against the same opponent, `p` rises strictly, so every chance that was a goal stays a goal. So for every seed, the stronger XI scores at least as many goals, and the opponent scores at most as many. Averaged over at least 1000 seeds, the stronger XI scores strictly more.
- Contract shapes:
  - `playMatch`, `teamStrength` and `matchFor` are pure and return-only. The universe is the returned value only: repeat calls are deep-equal, and inputs are frozen and compared.
  - `update` and `focusPlan` are pure. `renderMatch` is bounded-change (root's children only).
  - Read-only driving ports expose no write methods.
- Properties and checks to test (DISTILL; fast-check honours `FC_SEED`; at least 1000 seeds for the statistics):
  - Determinism and purity.
  - Goals per side in 0..9, and `homeGoals + awayGoals = goals.length`. Events per side equal that side's goals.
  - Minutes are integers 1..90, non-decreasing, and ties put home first.
  - Every scorer is in that side's `xi`, and that player's position is not GK.
  - Fixed draw count: for the same seed and fixture, replacing either XI never changes the minutes of the goals that both versions share. Each goal's minute comes from its chance window, and a stronger side's goals are a superset of the weaker side's, by chance.
  - D7(a) over all 4 matchday-1 fixtures of at least 250 seeds, and D7(b) for the automatic XI against the lowest XI and for a +20 XI.
  - Per-seed monotonicity: with the opponent and seed fixed, the side with the higher `teamStrength` scores at least as many goals. With the side fixed, a stronger opponent leaves the side's goals the same or fewer.
  - `RangeError` for matchday 0, 15 and 1.5, and for fixture index -1, 4 and 1.5.
  - The stream numbers 200..255 are disjoint from -1, 0..7 and 100..107, and the derived seeds are distinct over sampled seeds (extend the S-003 test).
  - A golden match (seed 31, club 0, untouched tactics).
  - A grep unit test: `src/domain/match.ts` uses no `Math.pow`, `Math.exp`, `Math.log` or `**` operator.
  - `update`: `PlayMatch` and `Back` per the App section, including the no-ops (title, pickClub, squad, player, tactics, startingXI, choosePlayer, match, and an unknown club), with `xi` and `formation` untouched. `matchFor`: an unknown club gives `undefined`; the managed side uses a stored `xi`; the other side is always automatic 4-4-2; both clubs of a fixture agree under untouched tactics.
  - The D11 names check.
- Earned Trust (no adapter; environment assumptions named and probed):
  1. Cross-engine determinism: the browser computes the same match as Node. Probe: the e2e reads the seed-31 match screen and compares it with the Node golden that DELIVER pins. Fault: an approximated function (`Math.pow`) gives a last-bit difference; the grep test catches it structurally.
  2. Inline flow: `textContent` and `innerText` of the score line and the goal items equal the D2/D3 strings, including names with an apostrophe or a hyphen. Fault: flex or grid on the score line turns the `innerText` check red; missing space nodes turn the `textContent` check red.
  3. The empty "Goals" list is visible and named. The browser cannot force a 0–0, so DISTILL pins a seed with a matchday-1 0–0 (for example seed 8, fixture 3, clubs 3 v 4), using a domain unit test that asserts that seed still gives 0–0. That keeps the e2e fixture honest if the model changes. The e2e then opens that club's match and asserts the list "Goals" (exact) is visible with 0 items. Fault: `text-transform` on the label or a zero-height list turns this red.
- Enforcement:
  - oxlint boundaries: `match.ts` and `schedule.ts` import only domain modules, and `state.ts` imports no ui.
  - `max-params` 3: `playMatch` takes one object and `matchFor` takes two parameters.
  - `complexity` 15: `back` gains one kind in its first branch.
  - The PR guard and oxlint `no-restricted-globals` keep `Date` and `Math.random` out.
  - Stryker covers `schedule.ts` and `match.ts` (domain glob) and the new `state.ts` code, with no config change. The `.focus(` grep unit test covers `renderMatch`.
- No external integrations, no contract tests.
