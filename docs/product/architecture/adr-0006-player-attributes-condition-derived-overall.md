# ADR-0006: Player attributes, condition and a derived overall (S-003)

- Status: Accepted
- Date: 2026-10-16
- Deciders: nWave solution-architect (S-003 DESIGN, `interaction_mode=propose`)
- Refines ADR-0005 (e) and the `overall` note in ADR-0004. Supersedes the stored-overall decision in ADR-0005 (e): `overall` is now derived from attributes. Kept: `generateSquad(seed, clubIndex)` signature, quota 2/6/6/4, ages 17-35, league-wide unique names (stream -1), derive-on-render (ADR-0005 (d)). Also supersedes the brief's S-002 UI line "listitems, not buttons" (see Decision 6).

## Context
S-003 adds a player screen: four attributes (1-20), a condition (0-100%) and an overall that must lie between the player's lowest and highest attribute and equal the squad row's overall. ADR-0004/0005 anticipated this and deferred it: "`overall` becomes derived when the player-detail story adds attributes". The squad rows also become tappable, which the S-002 design ruled out ("display-only").

Constraints: pure domain, same seed same season (CLAUDE.md), no persistence, S-002 protected scenarios assert properties only (not values), the starting-XI stories (S-004/S-005) will want "best rating per position" from the attributes.

## Decision

### 1. Player model and a derived overall
`Player` gains `attributes` and `condition`. `overall` stays a field on `Player` but is computed by the generator, never drawn.
- `ATTRIBUTE_ORDER = ["goalkeeping", "defending", "passing", "shooting"]` (fixed display order, D2) and `ATTRIBUTE_LABELS` (`Goalkeeping`, `Defending`, `Passing`, `Shooting`) are exported from `src/domain/squad.ts`; the UI renders by iterating `ATTRIBUTE_ORDER`. `Attributes` is a readonly record keyed by those four names; each value is an integer 1-20. `condition` is an integer percentage.
- Formula, integer arithmetic only: `overall = floor((sum(w[position][i] * attribute[i]) + 5) / 10)`, with weights in tenths that sum to 10 per position (round half up):

| Position | Goalkeeping | Defending | Passing | Shooting |
|---|---|---|---|---|
| GK | 7 | 1 | 2 | 0 |
| DF | 0 | 6 | 3 | 1 |
| MF | 0 | 2 | 5 | 3 |
| FW | 0 | 1 | 3 | 6 |

- Why it satisfies D4: weights are non-negative and sum to 10, so the weighted sum S lies in [10*min, 10*max]; `floor((S+5)/10)` is monotone and maps multiples of 10 to themselves, so the result lies in [min, max], hence also in 1-20. No float arithmetic, so no drift.
- The weights and `deriveOverall(position, attributes) => number` are exported (pure) so tests can check the formula, and later stories can rate a player at another position.

Options:
| Option | Pros | Cons |
|---|---|---|
| **A. Overall derived from a per-position weighted mean (chosen)** | One source of truth; bounds hold by construction; GK/DF/MF/FW rate differently, which S-004/S-005 will need; integer maths | Four weight rows to maintain |
| B. Overall stays drawn, attributes drawn to fit it | S-002 values untouched | Two sources of truth that can drift; needs a repair step to hit the bounds; "fit" logic is the same maths in reverse |
| C. Overall = plain mean of the four | Simplest | Position-blind: a keeper's weak Shooting drags the overall; rounding of a mean also stays in bounds but says nothing useful about role |
| D. Drop `overall` from `Player`, compute in the UI | Domain smaller | Formula leaks into the shell; the property test would live in UI code; ADR-0003 wants rules in the core |

### 2. Generation: keep the club stream for age and a quality draw, add a separate attribute stream
The per-club stream `createRng(deriveSeed(seed, clubIndex))` keeps drawing, per player slot in position order, `age` (17-35) and then an integer 1-20 called `quality`, exactly where `overall` is drawn today. Ages (and names, positions, row order) are therefore unchanged for every seed. `quality` is internal: it is not on `Player`.

Attributes and condition come from a separate per-club stream: `createRng(deriveSeed(seed, ATTRIBUTE_STREAM_BASE + clubIndex))` with `ATTRIBUTE_STREAM_BASE = 100` (streams 100..107). Stream numbers in use: -1 names, 0..7 clubs (age, quality), 100..107 attributes and condition. They are distinct integers, so the mixed seeds are distinct pre-images and cannot collide by construction (`clubIndex` is validated to 0..7). A future stream must pick a number outside that set; `squad.ts` documents the table next to the constants, and a unit test asserts the stream numbers are pairwise distinct.

Per player, in slot order, the attribute stream draws exactly 5 values, always, even when a result is clamped: noise for goalkeeping, defending, passing, shooting (each integer -2..+2), then condition. A fixed draw count keeps each slot independent of the others' clamping.
- `attribute[i] = clamp(quality + offset[position][i] + noise[i], 1, 20)`, with offsets (chosen so the weighted offset is 0 and the derived overall lands near `quality`):

| Position | Goalkeeping | Defending | Passing | Shooting |
|---|---|---|---|---|
| GK | +2 | -4 | -5 | -8 |
| DF | -10 | +2 | -2 | -6 |
| MF | -10 | -2 | +2 | -2 |
| FW | -10 | -6 | -2 | +2 |

- `condition` = integer in 75..100 (uniform), constants `CONDITION_MIN = 75`, `CONDITION_MAX = 100`. Pre-season squads are fit; the UI accepts 0-100. It is fixed per player and does not change in this story (there are no matches).
- `overall = deriveOverall(position, attributes)`. It is close to `quality` but not equal (noise and clamping), and so differs from the S-002 stored value for most players.
- "Players of a squad do not all share the same attributes": different positions have different offsets and each slot has its own noise, so 18 identical tuples are practically impossible, but not excluded by construction. A property test over many seeds/clubs covers it (S-003 slice 01 acceptance).

Options:
| Option | Pros | Cons |
|---|---|---|
| **A. Keep age/quality on the club stream, attributes and condition on a new stream (chosen)** | Ages, names, positions, order unchanged for every existing link; only overall values move; adding attribute logic later cannot reshuffle ages | One extra stream number to document; `quality` is a hidden intermediate |
| B. Redraw everything from the club stream (age, then four attributes, condition) | No new stream, simplest to read | Draw count per slot changes, so every age after the first slot changes: a bigger determinism break for no gain |
| C. Draw attributes first, derive nothing else, drop `quality` | Most natural model of a player | Same break as B; position shaping needs a base level anyway |
| D. Attributes from the league-wide names stream | No new stream | Couples attributes to the frozen name pool; any pool change would reshuffle attributes too |

Condition range options: **75-100** (chosen: fit but varied, can show 100%, leaves 0-74 for later injury/fatigue stories); uniform 0-100 (rejected: half the squad looks unfit before a match has been played, which misleads the "fit enough to start?" decision); fixed 100 (rejected: looks fake and would hide condition bugs in the UI).

Determinism break (acknowledged): for any seed, names, positions, ages and row order are identical to S-002; `overall` values differ. There is no persistence; the S-002 protected scenarios assert properties (1-20, position tokens, two numbers) which still hold. The attribute stream table and weights/offsets are now frozen like the name pools (ADR-0005): changing them reshuffles attributes for every seed and needs an ADR note.

### 3. Navigation
`Screen` gains `{ kind: "player"; clubId: string; playerIndex: number }`. `Action` gains `{ type: "ViewPlayer"; playerIndex: number }`.
- `ViewPlayer` is valid only from `squad` with a known `clubId` and `playerIndex` an integer in 0..17 (`PLAYERS_PER_SQUAD - 1`); otherwise the state is returned unchanged (as `ChooseClub`/`isKnownClub`).
- `Back` from `player` with a known club and a valid index goes to `{ kind: "squad", clubId }`; with an unknown club or invalid index it is a no-op. `Back` from `squad` still goes to `clubHome`; from anywhere else, a no-op.
- The `Player` is never stored in `GameState`: the shell derives `generateSquad(league.seed, clubIndex)[playerIndex]` on render (ADR-0005 (d)).

### 4. UI (ADR-0002: `el()`, `textContent` only)
- `renderSquad`: each `<li>` holds exactly one `<button type="button" class="player-row-button">` containing the same four spans in the same order; the button is the row's grid (min height 44px, full width); the click dispatches `ViewPlayer` with the row's index in `squad`. Row text is unchanged, so age and overall are still the first two numbers.
- New `src/ui/screens/player.ts`: `renderPlayer(root, { club, player }, dispatch)`. Contract: one `<h1 tabindex="-1">` with the player's name; three `<p>` lines "Position GK", "Age 27", "Overall 14" (label, one literal space, value, on one line; label and value may be separate inline spans); `<ul aria-label="Attributes">` with four `<li>` in `ATTRIBUTE_ORDER`, each reading "Goalkeeping 14" in inline flow (no other digit in the item); a `<p>` "Condition 92%" outside the list; `<button type="button">` "Back" (44px or taller). A bar for attributes, if drawn, is CSS-only (a pseudo-element sized from a custom property): no extra DOM node, no text, nothing in the accessibility tree. No other `list` role on the screen. Layout rule: do not use flex or grid on the label/value pairs, because blockified children would make `innerText` read "Position\nGK".
- Rejected for the facts: a `<dl>` (semantically apt, but some engines expose it as a list, which could collide with role queries for the single "Attributes" list); a `<table>` (heavier on 390px).
- `main.ts` gains the `player` render case and keeps focusing the new `<h1>`.

### 5. Reading the squad row as a button
The accessible name of a row button is its content (name, position, age, overall). Row buttons never share the name "Back", "Squad" or "New game", so the existing exact-name queries are unaffected.

### 6. Test-suite supersession
- The S-002 e2e test "squad rows are display-only, not buttons" (`tests/e2e/S-002-squad.spec.ts`) contradicts S-003 D1. DELIVER replaces its assertion with "each of the 18 rows holds exactly one button" (same test, same count, a stronger assertion; never deleted).
- The brief's S-002 UI contract line "exactly 18 `listitem`s, not buttons" is superseded: each listitem holds exactly one button (updated in the brief).
- S-002 acceptance tests that assert `overall` is an integer 1-20 still hold (the derived overall is in 1-20). No S-002 test pins the stored-overall semantics (checked: `squad-generation.test.ts` asserts the range only). DISTILL re-checks this when it adds the S-003 tests and may add a small golden of (name, position, age) for one seed captured from pre-change code to prove ages are unchanged.
- Protected S-002 scenarios read rows via `listitem` inner text and role names: they stay valid with the row button inside the `<li>`.

## Consequences
- Positive: one source of truth for overall; bounds guaranteed by arithmetic; ages/names/positions untouched; the same `deriveOverall` can later rate players at any position (S-004/S-005).
- Negative: the overall of existing S-002 links changes (accepted: no persistence); `quality` is a hidden intermediate; weights, offsets, noise range, stream numbers and the 75-100 range are frozen after S-003.
- Properties to test (domain, fast-check, `FC_SEED`): four attributes 1-20, in `ATTRIBUTE_ORDER`; condition integer in 75..100; `overall === deriveOverall(position, attributes)` and `min <= overall <= max`; same `(seed, clubIndex)` deep-equal; players of a squad do not all share attributes; ages/names/positions as S-002.
- Contract shapes: `generateSquad`, `deriveOverall`, `update` pure return-only; `renderPlayer`, `renderSquad` bounded-change (root's children only). Driving ports that only read expose no write methods.
- Earned Trust: no new external adapter, nothing to probe. The one environmental assumption is browser layout (a `<button>` as a grid, no horizontal overflow at 390px), proven by the existing phone-viewport e2e.
- No external integrations; no contract tests. Enforcement unchanged (oxlint boundaries, PR guard, nightly Stryker on `src/domain/**`).
