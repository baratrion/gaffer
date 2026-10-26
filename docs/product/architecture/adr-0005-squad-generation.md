# ADR-0005: Squad generation (league-wide unique names, deriveSeed, derived on render)

- Status: Accepted (note, ADR-0016, S-010: persistence now exists, so squad order and the name pools are save-relevant; a change that makes saved `playerIndex` values wrong must bump `SAVE_VERSION`)
- Date: 2026-10-16
- Deciders: nWave solution-architect (S-002 DESIGN, `interaction_mode=propose`)
- Refines ADR-0004 (squad bullet) and ADR-0003 (per-entity seed example). Does not supersede them. Changes: (1) player names come from one league-wide stream `deriveSeed(seed, -1)` sliced per club, not from the per-club seed; per-club seeds still drive age and overall; (2) return type is `readonly Player[]`; (3) `deriveSeed` gets `stream` (any integer, -1 reserved for names) and the exact expression below. Kept: signature `generateSquad(seed, clubIndex)`, quota, 17-35 age range.

## Context
S-002 shows 18 players per club. Outcome: every club has different players, no shared player name in a league. `generateSquad(seed, clubIndex)` is pure and per club, so independent per-club draws from a finite name list can collide across clubs (birthday problem), and a retry loop would need league-wide state. The guarantee has to come from the construction, as it does for club names (ADR-0004).

## Decision

**(a) Uniqueness by construction: one league-wide name draw without replacement.**
Player names are `firstName + " " + surname`. The name pool is the cross product of `FIRST_NAMES` (30 or more) and `SURNAMES` (30 or more), so 900 or more combinations against 144 needed (8 clubs x 18). `generateSquad(seed, clubIndex)` performs a partial Fisher-Yates over the pool's index space, seeded from the league-wide stream `deriveSeed(seed, NAMES_STREAM)`, and takes 144 distinct indices. Club `clubIndex` takes slice `[clubIndex*18, clubIndex*18+18)`. The index permutation is a new helper in `squad.ts` (partial Fisher-Yates over indices, `0..pool-1`); `drawWithoutReplacement` in `league.ts` works on item arrays and is not reused as is. Name-list entries are single words (letters, hyphen, apostrophe allowed; no spaces), so a full name has exactly one space. A whole-pool unit test asserts all `firstName + " " + surname` strings are distinct (guards against duplicate or colliding list entries). Slices of one permutation are disjoint, so no full name repeats within a club or across the league, for every seed, with no retries. Every call recomputes the same 144 draws (cheap, pure), so per-club calls stay independent and consistent. `clubIndex` outside 0..7 throws `RangeError` (programming error, never user input). Rejected: per-club independent draws plus retry (needs league state, unbounded loop); a surname partition per club (needs 144 surnames, shrinks variety); a global counter (ambient state).

**(b) Shape of a squad.**
- Exactly 18 players: 2 GK, 6 DF, 6 MF, 4 FW, listed in that position order (GK, DF, MF, FW), then in draw order within a position. Fixed order means the same seed gives the same row order.
- `age`: integer 17-35 (ADR-0004; UI and tests accept 16-40). `overall`: integer 1-20, uniform draw (no skew in this story).
- Names contain no digits: word lists are letters, spaces, hyphens and apostrophes only; and names must not contain the standalone tokens GK, DF, MF or FW. A unit test over the whole list (not a sample) checks both, so age and overall stay the first two numbers in a row.
- Name pool size, ranges and quota are exported constants for tests.

**(c) `deriveSeed(seed: number, stream: number): number`** in `src/domain/rng.ts`: one mulberry32 step over `(seed ^ Math.imul(stream, 0x9e3779b9)) | 0`, returned as a signed 32-bit integer: the mulberry32 mixed state is returned as `(t ^ (t >>> 14)) | 0` (the final mixed value, with `| 0` forcing signed int32), not a float. Pure, return-only. A `clubIndex` that is not an integer in 0..7 throws `RangeError` (in `generateSquad`). Club streams are `clubIndex` 0..7; the league-wide name stream is `NAMES_STREAM = -1`. Per-club attribute draws (positions are fixed by the quota; age and overall) use `createRng(deriveSeed(seed, clubIndex))`.

**(d) Derived on render, not stored.** `GameState` keeps only `league` and `screen`. The shell calls `generateSquad(league.seed, clubIndex)` when rendering the squad screen. Reasons: determinism makes storage redundant, state stays small, and there is no persistence to migrate. Rejected: storing squads in `GameState` (duplicates derivable data; invites drift); memoising (premature, 144 draws is microseconds).

**(e) `overall` is a stored integer 1-20** in `Player`. It becomes derived when the player-detail story adds attributes; that story supersedes this field note. No attributes or condition are added now (ADR-0004).
*Refinement note 2026-10-16 (S-003, ADR-0006): superseded. `overall` is now derived from four attributes with a per-position weighted mean (integer arithmetic); the club stream keeps drawing age and an internal 1-20 `quality` where `overall` was drawn, and attributes and condition come from a separate per-club stream `deriveSeed(seed, 100 + clubIndex)`. Ages, names and positions are unchanged; overall values differ from S-002.*

**(f) Real-player denylist.** `tests/unit/fixtures/real-player-denylist.ts` lists well-known real footballers' full names. A unit test enumerates the whole name pool (every first-name and surname combination, not only generated ones) and fails on any match, case-insensitively. This is stronger than the club test in ADR-0004, which checks generated names only. Lists are written fictional-by-design (invented surnames, not common famous ones).

## Consequences
- Property tests: for any 32-bit seed, every club has 18 players with the exact quota; ages 17-35; overalls 1-20; same seed deep-equal; the 144 names across all 8 clubs are distinct; no name has digits.
- Cost: 144 draws per `generateSquad` call, once per squad render.
- `names.ts` grows by two lists; the mutation scope (`src/domain/**`) already covers the new file.
- Negative (accepted trade-off vs ADR-0003): slices come from one shared permutation, so changing the pool size or list order, or the club count, reshuffles every squad for every seed. ADR-0003 wanted per-entity isolation; we give it up for league-wide uniqueness without retries. The name pools are therefore frozen after S-002; any change needs an ADR note acknowledging the determinism break (old links give different squads).
- Adding a club beyond 8 needs a pool check (`CLUBS_PER_LEAGUE * 18 <= pool size`); a unit test asserts it.
