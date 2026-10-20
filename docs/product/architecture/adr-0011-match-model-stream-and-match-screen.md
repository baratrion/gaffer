# ADR-0011: Match model, its RNG stream, and the derived match screen (S-006)

- Status: Accepted (accepted after nw-solution-architect-reviewer cycle 1, approved_with_notes)
- Date: 2026-10-20
- Deciders: nWave solution-architect (S-006 DESIGN, `interaction_mode=propose`)
- Related: ADR-0003 (functional core), ADR-0005 (d) (derive on render), ADR-0006 (derived overall, stream table), ADR-0008 (focus), ADR-0009 (`currentXI`, `automaticXI`, optional `xi`, inline-flow text rule), ADR-0010 (schedule). Extends the stream table of ADR-0006 with 200..255. Supersedes nothing.

## Context
S-006 plays the managed club's matchday-1 fixture and shows the final score and the goals (DISCUSS D1-D15). The binding rules are:
- **D6**: the match is a pure function of the seed, the fixture and both sides (formation and XI). Its draws use a stream of their own, so streams -1, 0..7, 100..107 and every S-001..S-005 output stay unchanged.
- **D7**: event-based and seeded, with team strength from the XI's attributes. Over at least 1000 seeded matches:
  - (a) between two automatic 4-4-2 XIs, the mean goals per side is in 1.0-2.0 and under 20% of matches end 0–0;
  - (b) against the same opponent XI, an XI whose sum of 11 overalls is at least 20 higher scores more goals on average. DESIGN may refine "stronger", but (b) must hold for this measure;
  - (c) at most 9 goals per side.
- **D4**: scorers are outfield starters of the side (never the GK slot), and there are no own goals.
- **D3**: minutes are 1-90 and never decrease.
- **D8 and D10**: nothing is stored; `GameState` gains nothing; there is one new screen and one new action.
- **D13**: the result is on screen on arrival.
- **D14**: the durable black-box contract.
- **Out of scope** (DISCUSS Out-of-scope and D15): home advantage, condition, morale, opponent tactics, commentary and stats.

Facts checked in the code:
- `Player.overall` is `deriveOverall(position, attributes)`, a position-weighted mean of the four attributes (ADR-0006).
- `automaticXI(squad, formation)`, `currentXI(state, squad)` and `squadOf(league, clubId)` exist (ADR-0009).
- Slot 0 of every formation is the GK (`lineUp`).
- `nextFloat` returns a `value` in [0, 1), computed with integer operations and one division by 2^32.
- `GameState.xi` is optional, and the S-003/S-004 acceptance tests assert whole states with `toEqual` (ADR-0009).

Tooling:
- vitest has no DOM test environment (no jsdom or happy-dom in `package.json`).
- oxlint caps `max-params` at 3 and `complexity` at 15.
- Stryker mutates `src/domain/**` and `src/app/state.ts`.
- No library API is involved, and there is no new dependency.

## Options

### 1. How goals are generated
| Option | Pros | Cons |
|---|---|---|
| **A. Fixed chances: 9 chances per side, one per 10-minute window. Each chance draws exactly 3 floats (minute, conversion, scorer), whether or not it is a goal (chosen)** | 54 draws per match whatever the XIs, so changing the XI changes probabilities, never the random sequence (monotone coupling, see Consequences). The 9-goal cap holds by construction. Each side's minutes are sorted by construction. Every chance is a future commentary line ("a shot, saved") with no change to the draws | The chance count is a modelling constant: there are no extra chances for the better side, which is stronger only through conversion |
| B. Per-minute loop: 90 minutes x 2 sides, one goal draw each | Natural for a later minute-by-minute commentary | At least 180 draws plus scorer draws. The 9-goal cap is a rule, not a structure: stopping draws after 9 would shift the sequence. More code to mutate |
| C. A Poisson goal count per side, then place the goals | Classic football model | Inversion needs `Math.exp`, which ECMAScript leaves implementation-approximated, so engines may differ in the last bit and a comparison can flip. The draw count varies unless padded. The cap needs truncation. Not event-based |

### 2. Strength measure and conversion
| Option | Pros | Cons |
|---|---|---|
| **A. One strength per side, `S` = the sum of the 11 overalls. Strength share `S_own^3 / (S_own^3 + S_opp^3)`; conversion `p = 0.30 x share` (chosen)** | D7(b) holds for exactly the DISCUSS measure, and per seed. The overall already weighs each player's attributes for his position (ADR-0006), so attributes drive strength. Strictly increasing in `S_own`, decreasing in `S_opp`, bounded in (0, 0.30) with no clamp. Uses integer cubes (at most 220^3) and one division: correctly rounded IEEE operations, identical in every engine | Formation acts only through who plays. A team of good defenders and poor forwards converts like any team of the same sum |
| B. Attack and defence ratings from attributes: attack from outfield shooting and passing, defence from defending plus GK goalkeeping | Richer football flavour | Breaks D7(b) for the sum-of-overalls measure: an XI that is 20 higher only through its GK and defenders has a weaker attack and scores less. Property tests over arbitrary XIs can construct such pairs. Two ratings to calibrate |
| C. Linear in the strength difference, clamped to [min, max] | Simplest formula | At the clamp a stronger XI scores the same, so D7(b)'s "more" fails for extreme pairs |
| D. Logistic in the difference | Smooth | `Math.exp` is implementation-approximated (the same cross-engine determinism risk as 1C) |

### 3. Who scores
| Option | Pros | Cons |
|---|---|---|
| **A. Weighted among the side's outfield starters: weight = shooting x position factor (DF 1, MF 2, FW 4) (chosen)** | Simulated shares are close to real football: DF 12.5%, MF 36.3%, FW 51.2% (calibration below). Attributes visibly matter: a sharp-shooting midfielder scores more. Never the GK | Two tunable constants |
| B. Weight = shooting only | One rule | Not simulated. Desk estimate from the ADR-0006 offsets: DF shooting is quality minus 6 against FW quality plus 2, which leaves defenders roughly a quarter of the goals, far above real football |
| C. Uniform among the outfield starters | Simplest | Not simulated. By construction defenders take 4 of 10 shares in 4-4-2, and attributes do not matter |

### 4. RNG stream
| Option | Pros | Cons |
|---|---|---|
| **A. One stream per scheduled fixture: `deriveSeed(seed, MATCH_STREAM_BASE + (matchday - 1) x 4 + fixtureIndex)`, with `MATCH_STREAM_BASE = 200`, so streams 200..255 for the 14 matchdays (chosen)** | The stream numbers are disjoint from -1, 0..7 and 100..107, and 108..199 stay free. A fixture's result does not depend on whether other fixtures are simulated, so the season story can add them freely. Independent of which club is managed | 56 more stream numbers in the table |
| B. One stream per matchday, fixtures drawn in index order | Fewer streams | Playing fixture 3 requires drawing fixtures 0..2 first, so results couple across fixtures |
| C. A stream from the club pair (`200 + home x 8 + away`) | Unique over the double round-robin | A later cup tie or replay of the same pair collides. Ties the result to the pair instead of the schedule slot |

### 5. Where the result lives (D8)
| Option | Pros | Cons |
|---|---|---|
| **A. Not stored: a pure app selector `matchFor(state, clubId)` in `state.ts` derives it on render, and `main.ts` calls it (chosen)** | Same pattern as `currentXI` and `squadOf` (ADR-0005 (d)). `GameState` is unchanged, so every whole-state assertion in S-001..S-005 stays green. The derivation is unit-tested and under Stryker (`state.ts`), and `main.ts` stays a thin mapping | Recomputed on every render of the screen: two squads and 54 draws |
| B. Derive it inline in `main.ts` | No new export | `main.ts` is outside the unit tests and Stryker. Symmetry and the side choice would only be e2e-tested |
| C. Store the result in `GameState` on `PlayMatch` | Computed once | Stores derivable data. A new field breaks the whole-state `toEqual` assertions, and an optional field is a second source of truth. D8 says nothing is recorded |

### 6. Score line and goals markup
| Option | Pros | Cons |
|---|---|---|
| **A. One `<p class="score-line">` of inline spans and literal single-space text nodes (home name, `" "`, `"h–a"`, `" "`, away name), styled as a scoreboard panel. Then a visible `<p id="goals-label">Goals</p>` and a `<ul role="list" aria-labelledby="goals-label">` of one-line items (chosen)** | `textContent` and `innerText` both read exactly `Home 2–1 Away` (the brief's inline-flow rule). One element holds the whole score line. The list keeps its role and name when empty. One heading per screen | The scoreboard cannot use flex or grid columns. Long names wrap inside the panel |
| B. A three-column flex or grid scoreboard | Classic look | Blockified children drop the space text nodes and split `innerText` into lines (the ADR-0009 mechanism), which breaks D2 |
| C. A `<table>` or `<dl>` for the result | Semantic pairs | Splits the score line into cells, so no single element reads the whole D2 text. Adds table or list roles that tests could confuse with "Goals" |

## Decision
**1A, 2A, 3A, 4A, 5A, 6A.** There is no home advantage: it is out of scope (D15).

### Domain: `src/domain/match.ts` (pure)
**Types**
- `MatchSide = { readonly squad: readonly Player[]; readonly xi: StartingXI }`.
- `MatchInput = { readonly seed: number; readonly matchday: number; readonly fixtureIndex: number; readonly home: MatchSide; readonly away: MatchSide }`.
- `GoalEvent = { readonly minute: number; readonly side: "home" | "away"; readonly playerIndex: number }`, where `playerIndex` is the scorer's squad index.
- `MatchResult = { readonly homeGoals: number; readonly awayGoals: number; readonly goals: readonly GoalEvent[] }`.

**Functions**
- `teamStrength(side) => number` is the sum of `squad[xi[i]].overall` over the 11 slots (an integer, 11..220). It is exported so that tests use the same measure as D7(b).
- `playMatch(input: MatchInput) => MatchResult` takes one parameter, so `max-params` is safe. A `matchday` that is not an integer 1..14, or a `fixtureIndex` that is not an integer 0..3, throws `RangeError`, so no call can alias another stream. The steps:
  1. Compute `Sh = teamStrength(home)` and `Sa = teamStrength(away)`. Cube by multiplication (`S * S * S`), never with `**` or `Math.pow`. Compute `shareHome = Sh^3 / (Sh^3 + Sa^3)` and `shareAway = Sa^3 / (Sh^3 + Sa^3)` each directly, not as `1 - share`.
  2. Compute `p(side) = MAX_CONVERSION * share(side)`.
  3. Create `rng = createRng(deriveSeed(seed, MATCH_STREAM_BASE + (matchday - 1) * FIXTURES_PER_MATCHDAY + fixtureIndex))`.
  4. For each chance `c` = 0..8, and within it for the home side then the away side, always draw exactly three floats in this order: `uMinute`, `uConversion`, `uScorer`.
     - `minute = 10c + 1 + floor(uMinute * 10)`. Window `c` covers minutes `10c+1..10c+10`, so minutes run 1..90.
     - The chance is a goal when `uConversion < p(side)`.
     - For a goal, the scorer is chosen among the side's outfield starters (slots whose player's position is not `GK`), walked in slot order. Each weight is `shooting * SCORER_FACTOR[position]`. With `W` the total weight, `target = floor(uScorer * W)`, and the scorer is the first slot whose cumulative weight exceeds `target`. Shooting is at least 1, so `W > 0`.
  5. `goals` holds the goal events in generation order, stably sorted by minute (ties put home first, as generated). `homeGoals` and `awayGoals` are the counts per side, at most 9 by construction.

**Constants**
- `CHANCES_PER_SIDE = 9`, `MINUTES_PER_CHANCE = 10`, `MAX_CONVERSION = 0.30`, the strength exponent 3 (written as two multiplications), `SCORER_FACTOR = { DF: 1, MF: 2, FW: 4 }` (GK excluded) and `MATCH_STREAM_BASE = 200`.
- These constants and the draw order are frozen by this ADR. Changing any of them changes every result for every seed, so it needs an ADR amendment, like the name pools.
- The stream-table comment in `squad.ts` gains a pointer to this table.

**Arithmetic rule**: only `+ - * /`, comparisons and `Math.floor`, which are all exact or correctly rounded. So Chromium, WebKit and Node compute the same result. `match.ts` uses no `Math.pow`, `**`, `Math.exp`, `Math.log` or other approximated function.

**Imports**: `rng.ts`; types from `squad.ts` and `selection.ts`; `FIXTURES_PER_MATCHDAY` and `MATCHDAYS` from `schedule.ts`. No app or ui import.

**Stream table** (all in use after S-006):

| Streams | Use |
|---|---|
| -1 | Names (league-wide) |
| 0..7 | Club age and quality |
| 100..107 | Attributes and condition |
| 200..255 | Matches (`200 + (matchday - 1) x 4 + fixtureIndex`) |

Free: 8..99, 108..199, and 256 and up.

### Expected golden matches (RED-first contract for DISTILL and DELIVER)
The DESIGN spike computed these values against the real generator by implementing exactly the rules above. A second, independent re-run on 2026-10-20 reproduced every value. Both sides play `automaticXI(squad, "4-4-2")` (untouched tactics), on matchday 1, fixture 0 (club 0 at home to club 7).

DISTILL writes them as expected values before `match.ts` exists, so the tests start RED. DELIVER must make them pass unchanged. A deviation means the code does not follow this ADR's draw order or constants, and DELIVER fixes the code. Changing a constant or the draw order requires an amendment to this ADR, and only then may the expected values change.

**Seed 31**: strength `Sh = 130`, `Sa = 143`.
- Score line: `Netherwold Borough 1–2 Marlbrook Athletic`.
- Goals, in order:
  - `17' Rurik Fairbourne (Marlbrook Athletic)`
  - `22' Calder Redfern (Netherwold Borough)`
  - `77' Rurik Fairbourne (Marlbrook Athletic)`

**Seed 20260** (`?seed=abc`): strength `Sh = 152`, `Sa = 138`.
- Score line: `Harrowgate Lane United 0–1 Oakhampton Rise Borough`.
- Goals: `65' Joren Northcott (Oakhampton Rise Borough)`.

The other seed-31 fixtures are further references, optional for DISTILL:
- Fixture 1: `Fennimore Town 2–2 Valebridge Albion`.
- Fixture 2: `Tarnbeck Borough 5–1 Rushmoor Heath Albion`.
- Fixture 3: `Juniper Hollow United 1–3 Oakhampton Rise Borough`.

### Calibration (canonical seed set: seeds 1..1000, the 4 matchday-1 fixtures each, 4000 matches)
Both sides play automatic 4-4-2. All figures below come from this set, and the committed test reproduces it (see Consequences).

**Back-of-envelope**
- Equal strength gives a share of 0.5 and `p = 0.15`. Mean goals per side are 9 x 0.15 = 1.35, P(a side scores 0) = 0.85^9 = 0.23, and P(0–0) = 0.85^18 = 0.054.
- A gap of 20 at an `S` of about 148 moves the share by about 3 x 0.25 x 20 / 148 = 0.10. That moves `p` by 0.03 and the mean by about 0.27 goals.

**D7(a)**
- Mean goals per side: 1.363 (10901 goals over 8000 side-results). Home 1.384, away 1.342.
- 0–0: 5.5% (220 of 4000). No seed has all four matchday-1 matches at 0–0.
- Most goals by one side: 6.
- Goals per side: 0 in 1914 side-results, 1 in 2864, 2 in 2032, 3 in 871, 4 in 245, 5 in 64, 6 in 10.
- Margins: the mean is 0.36 above the 1.0 floor and 0.64 below the 2.0 cap. The 0–0 share is about a quarter of the 20% cap.

**D7(b)** (same seeds, home XI swapped, same automatic away XI)
- The automatic XI scores 1.384 goals and the lowest-rated XI 0.481.
- `S` difference: mean 64.5, minimum 27.
- The lowest XI never scored more (0 of 4000 cases).
- A first spike pass on the same seeds compared an XI exactly 20 above the lowest XI: 0.758 against 0.481 goals, with 0 reversals.

**Other figures**
- Scorers: DF 12.5%, MF 36.3%, FW 51.2%, GK 0.
- Strength `S` of automatic XIs (first spike pass, seeds 1..2000, all 8 clubs): 4-4-2 mean 148.6 (sd 16.3); 4-3-3 mean 148.1; 4-2-3-1 mean 142.5. The lowest-rated 4-4-2 XI has a mean of 84.1.
- Matchday-1 0–0s among seeds 1..30, as (seed, fixture, clubs): (8, 3, 3 v 4: "Mossdale Athletic 0–0 Pickering Dene Rovers"), (15, 3, 3 v 4), (16, 3, 3 v 4), (17, 3, 3 v 4), (25, 2, 5 v 2).
- Derived-seed distinctness is probabilistic, not proven: `deriveSeed`'s mixer is not proven injective. Over 10000 sampled seeds, the 73 streams (-1, 0..7, 100..107, 200..255) gave pairwise distinct derived seeds. The sampled guard test (extending the S-003 one) keeps checking this.

### App: `src/app/state.ts`
- `Screen` gains `{ kind: "match"; clubId: string }`.
- `Action` gains `{ type: "PlayMatch" }`.
  - It is valid only from `clubHome` of a known club, and goes to `match` of the same club.
  - From anywhere else it is a no-op.
- `Back` from `match` (known club) goes to `clubHome`; with an unknown club it is a no-op.
- `GameState` and `initialState` are unchanged. The two actions never touch `xi` or `formation`.
- `focusPlan`'s `sameScreen` gains `match`, compared by `clubId`. Every S-006 navigation changes the screen, so focus goes to the new `<h1>` and no focus ids are added.
- `OPENING_MATCHDAY = 1` is an exported constant; the season story replaces it with a matchday in state.
- `matchFor(state, clubId)` returns `undefined` for an unknown club. Otherwise, with `c` the club's index:
  1. Read `{ index, fixture } = fixtureOf(OPENING_MATCHDAY, c)`.
  2. For each of `fixture.home` and `fixture.away`, take that club `k` from `league.clubs`. Its squad is `squadOf(league, k.id)`, the single squad lookup shared with `update` and `main.ts`. Its XI is `currentXI(state, squad)` when it is the managed club, else `automaticXI(squad, DEFAULT_FORMATION)`.
  3. Return `{ matchday, home: { club, squad }, away: { club, squad }, result: playMatch({ seed: league.seed, matchday, fixtureIndex: index, home, away }) }`.
- `matchFor` is the one place that derives a match. With untouched tactics both sides are automatic 4-4-2, so both clubs of a fixture get the same result (symmetry, by purity).

### UI (ADR-0002: `el()` and `textContent` only; renderers never move focus)
**Club home**: a fourth `button.primary` "Play match" after "Starting XI" in `div.club-actions`, dispatching `PlayMatch`.

**`src/ui/screens/match.ts`**: `renderMatch(root, view, dispatch)`.
- `main.ts` passes the view `{ matchday, home: { name, goals }, away: { name, goals }, goals: { minute, scorer, club }[] }`.
- Scorer names come from the side's squad (`squad[playerIndex].name`), and club names from `league.clubs`. An index with no player throws, as the existing render cases do.
- Delta: `renderMatch` calls `root.replaceChildren(section)` once. Root's only child is `<section class="match">`, whose children are exactly these five elements, in this order:
  1. `<h1 tabindex="-1">Matchday 1</h1>`, from `matchday`.
  2. `<p class="score-line">`, a direct child of the section with no wrapper. It holds a home-name span, the text node `" "`, a goals span reading `2–1` (U+2013, no spaces), `" "`, and an away-name span. Its `textContent` is exactly `Home 2–1 Away`. It carries no ARIA.
  3. `<p id="goals-label" class="goals-label">Goals</p>`, visible and not a heading.
  4. `<ul role="list" aria-labelledby="goals-label" class="goal-list">`, with one `<li>` per goal in `goals` order. Each item holds a minute span `23'` (straight apostrophe), `" "`, a scorer span, `" "`, and a club span `(Club Name)`, so its `textContent` is exactly `23' Ivo Elderkin (Netherwold Borough)`. For 0–0 the `<ul>` is still rendered, with no items.
  5. `<button type="button" class="back-button">Back</button>`, dispatching `Back`.
- It writes nothing else: no `document`, no `window`, no focus, no timers.
- Everything is rendered in the one synchronous render, so the score line and the goals are present when `main.ts` focuses the `<h1>` (D13).

**CSS rules (binding)**
- The score line, the goal items and their spans stay in inline flow: no flex, grid, float or `inline-block`.
- The scoreboard look comes from the `<p>` box: a block, a pitch-light panel, a 2px chalk border, a radius, centred text and a large bold font. The goals span is gold (`--accent`) with tabular numerals. Names have `overflow-wrap: anywhere`.
- The goal list may be a grid of `<li>`s, because each item reads alone. Each item has a gold left border and a gold minute.
- The list has a non-zero box when empty (for example `min-height: 1.5rem`).
- The "Goals" label has no `text-transform`, so `.section-label`, which uppercases, is not reused.
- Buttons are 48px tall, and nothing scrolls sideways at 390px.

**Accessible names**
- "Play match", "Goals" and "Matchday" collide with no existing name and appear in no `names.ts` array. Checked by hand; DISTILL adds the D11 unit check.
- "Play match" does not contain "Players", and "Goals" is not a substring of "Goalkeeping".
- The match screen has exactly one "Back".
- No other text on the screen contains an en dash: names use only letters, spaces, apostrophes and the hyphen-minus.

### Shell: `src/main.ts`
- A `match` render case calls `matchFor(state, screen.clubId)`. When that returns `undefined`, it throws "Unknown club in game state". Otherwise it maps the result to the view and calls `renderMatch`.
- The `never` guard keeps the switch exhaustive.
- Focus handling is unchanged.

## Consequences

### Positive
- D7(a) and (c) hold with wide margins on the canonical set, and D7(b) holds for the DISCUSS measure by construction.
- The result is a pure function of the seed, the matchday, the fixture index and both sides. It does not depend on which club is managed.
- Nothing is stored, and no S-001..S-005 test or generator output changes.
- Later commentary is additive.
- The rules live in the domain, under Stryker. There is no new dependency, adapter or C4 container.

### Negative
- Formation has no tactical effect beyond who plays.
- Strength ignores condition, home advantage and morale.
- The constants, the draw order and the 200..255 stream block are frozen by this ADR (see Expected golden matches).
- `matchFor` regenerates two squads on each render (microseconds).

### Durable contract (DISCUSS D14, for the first match of a new game in every later version)
- The only `<h1>` is "Matchday 1", focused on arrival.
- Exactly one element's whole text is the score line `<home> <h>–<a> <away>` (`^(.+) (\d)–(\d) (.+)$`, U+2013), and no other text on the screen has that format.
- The list "Goals" holds items reading `<minute>' <scorer> (<club>)`, minutes non-decreasing, with as many items per club as its goals.
- Both the score line and the list are visible when the heading has focus. They are never revealed over time: any later commentary is additive.
- "Back" returns to the club home.
- Later stories (season, live commentary, save) must keep these. Not durable: the matchday advance on replay, the opponent's formation, the model's numbers and the symmetric score lines, which are unit-level only.

### Monotone coupling (why D7(b) holds per seed)
- The draw sequence depends only on the seed and the fixture, never on the XIs. A side scores in chance `c` exactly when `uConversion(c) < p`.
- When a side's strength rises against the same opponent, its `p` rises strictly. So, chance by chance, the weaker version's goal chances, and hence its goal minutes, are a subset of the stronger version's.
- So on every seed the stronger XI scores at least as many goals, and the opponent at most as many. Over 1000+ seeds the stronger XI scores strictly more on average.

### Contract shapes
- `playMatch`, `teamStrength` and `matchFor` are pure and return-only. The universe is the returned value: repeat calls are deep-equal, and frozen inputs are compared before and after.
- `update` and `focusPlan` are pure.
- `renderMatch` is bounded-change. Its universe is exactly root's one `section` child with its five children (see the UI delta above).
- Read-only driving ports expose no write methods.

### Tests for DISTILL (fast-check honours `FC_SEED`)
**Committed fixed-seed calibration test** (reproducible; this is the D7 contract)
- A domain test over seeds 1..1000 and the 4 matchday-1 fixtures each (4000 matches, both sides automatic 4-4-2) asserts:
  - mean goals per side in [1.0, 2.0];
  - a 0–0 share under 20%;
  - no side above 9 goals.
- D7(b) on the same seeds: the home XI replaced by the `lowestRatedXI(squad, formation)` test fixture scores fewer home goals on average than the automatic XI against the same away side, and never more on any seed.
  - `lowestRatedXI` is a DISTILL test helper under `tests/acceptance/S-006/`, not production code. Per position, it takes squad indices by overall ascending, ties by ascending squad index, dealt in `lineUp` order. Its `teamStrength` is at least 20 below the automatic XI's on these seeds (minimum gap 27).
  - A second case uses an XI at least 20 above the lowest.
- The spike's figures above are what this test should observe. Its assertions are the D7 bounds, not the exact figures.

**Properties and units**
- Determinism and no input mutation.
- Goals per side are in 0..9, and `homeGoals + awayGoals = goals.length`. Events per side equal that side's goals.
- Minutes are integers 1..90, non-decreasing, with ties home first.
- Every scorer is in that side's `xi` and is not a GK.
- Per-seed monotonicity:
  - with the opponent and seed fixed, the side with the higher `teamStrength` scores at least as many goals;
  - a stronger opponent never raises the side's goals.
- `RangeError` cases as one table test: matchday 0, 15 and 1.5; fixture index -1, 4 and 1.5.
- Stream numbers 200..255 are disjoint from the others. The sampled derived-seed guard is extended.
- The expected goldens above.
- A grep unit test: `match.ts` uses no `Math.pow`, `Math.exp`, `Math.log` or `**` operator.

**`update` and `matchFor`**
- `update`: `PlayMatch` and `Back` per the App section, with the no-ops as one table test, and `xi` and `formation` untouched.
- `matchFor`:
  - an unknown club gives `undefined`;
  - the managed side follows a stored `xi`;
  - the other side is always automatic 4-4-2;
  - both clubs of a fixture agree under untouched tactics.
- The D11 names check.

### Earned Trust (no adapter; environment assumptions named and probed)
1. **Cross-engine determinism**: the browser computes the same match as Node.
   - Probe: the e2e reads the seed-31 match screen and compares it with the expected golden above. That is the same value the Node test asserts.
   - Fault: an approximated function such as `Math.pow` gives a last-bit difference. The grep test catches it structurally.
2. **Inline flow**: `textContent` and `innerText` equal the D2/D3 strings, including names with an apostrophe or a hyphen.
   - Faults: flex or grid turns the `innerText` check red; missing space nodes turn the `textContent` check red.
3. **Empty list**: the empty "Goals" list is visible and named exactly.
   - Probe: a domain unit test pins seed 8, matchday 1, fixture 3 as 0–0, keeping the e2e fixture honest. The e2e opens club index 3 or 4 at `?seed=8` and asserts that the list "Goals" (exact) is visible with 0 items.
   - Faults: `text-transform` on the label, or a zero-height list.

### Enforcement
- oxlint boundaries: the new domain modules import only domain code, and `state.ts` imports no ui.
- `max-params` 3, and `complexity` 15 (`back` gains one kind).
- The PR guard and oxlint `no-restricted-globals` keep `Date` and `Math.random` out.
- Stryker's existing globs cover `schedule.ts`, `match.ts` and `state.ts`, with no config change.
- The `.focus(` grep unit test covers `renderMatch`.

No external integrations, no contract tests.
