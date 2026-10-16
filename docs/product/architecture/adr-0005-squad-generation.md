# ADR-0005: Squad generation (league-wide unique names, deriveSeed, derived on render)

- Status: Accepted
- Date: 2026-10-16
- Deciders: nWave solution-architect (S-002 DESIGN, `interaction_mode=propose`)
- Refines ADR-0004 (squad bullet). Does not supersede it: signature, quota and 17-35 age range are kept.

## Context
S-002 shows 18 players per club. Outcome: every club has different players, no shared player name in a league. `generateSquad(seed, clubIndex)` is pure and per club, so independent per-club draws from a finite name list can collide across clubs (birthday problem), and a retry loop would need league-wide state. The guarantee has to come from the construction, as it does for club names (ADR-0004).

## Decision

**(a) Uniqueness by construction: one league-wide name draw without replacement.**
Player names are `firstName + " " + surname`. The name pool is the cross product of `FIRST_NAMES` (30 or more) and `SURNAMES` (30 or more), so 900 or more combinations against 144 needed (8 clubs x 18). `generateSquad(seed, clubIndex)` performs a partial Fisher-Yates over the pool's index space, seeded from the league-wide stream `deriveSeed(seed, NAMES_STREAM)`, and takes 144 distinct indices. Club `clubIndex` takes slice `[clubIndex*18, clubIndex*18+18)`. Slices of one permutation are disjoint, so no full name repeats within a club or across the league, for every seed, with no retries. Every call recomputes the same 144 draws (cheap, pure), so per-club calls stay independent and consistent. `clubIndex` outside 0..7 throws `RangeError` (programming error, never user input). Rejected: per-club independent draws plus retry (needs league state, unbounded loop); a surname partition per club (needs 144 surnames, shrinks variety); a global counter (ambient state).

**(b) Shape of a squad.**
- Exactly 18 players: 2 GK, 6 DF, 6 MF, 4 FW, listed in that position order (GK, DF, MF, FW), then in draw order within a position. Fixed order means the same seed gives the same row order.
- `age`: integer 17-35 (ADR-0004; UI and tests accept 16-40). `overall`: integer 1-20, uniform draw (no skew in this story).
- Names contain no digits: word lists are letters, spaces, hyphens and apostrophes only; and names must not contain the standalone tokens GK, DF, MF or FW. A unit test over the whole list (not a sample) checks both, so age and overall stay the first two numbers in a row.
- Name pool size, ranges and quota are exported constants for tests.

**(c) `deriveSeed(seed: number, stream: number): number`** in `src/domain/rng.ts`: one mulberry32 step over `(seed ^ Math.imul(stream, 0x9e3779b9)) | 0`, returned as a signed 32-bit integer. Pure, return-only. Club streams are `clubIndex` 0..7; the league-wide name stream is `NAMES_STREAM = -1`. Per-club attribute draws (positions are fixed by the quota; age and overall) use `createRng(deriveSeed(seed, clubIndex))`.

**(d) Derived on render, not stored.** `GameState` keeps only `league` and `screen`. The shell calls `generateSquad(league.seed, clubIndex)` when rendering the squad screen. Reasons: determinism makes storage redundant, state stays small, and there is no persistence to migrate. Rejected: storing squads in `GameState` (duplicates derivable data; invites drift); memoising (premature, 144 draws is microseconds).

**(e) `overall` is a stored integer 1-20** in `Player`. It becomes derived when the player-detail story adds attributes; that story supersedes this field note. No attributes or condition are added now (ADR-0004).

**(f) Real-player denylist.** `tests/unit/fixtures/real-player-denylist.ts` lists well-known real footballers' full names. A unit test enumerates the whole name pool (every first-name and surname combination, not only generated ones) and fails on any match, case-insensitively. This is stronger than the club test in ADR-0004, which checks generated names only. Lists are written fictional-by-design (invented surnames, not common famous ones).

## Consequences
- Property tests: for any 32-bit seed, every club has 18 players with the exact quota; ages 17-35; overalls 1-20; same seed deep-equal; the 144 names across all 8 clubs are distinct; no name has digits.
- Cost: 144 draws per `generateSquad` call, once per squad render.
- `names.ts` grows by two lists; the mutation scope (`src/domain/**`) already covers the new file.
- Adding a club beyond 8 needs a pool check (`CLUBS_PER_LEAGUE * 18 <= pool size`); a unit test asserts it.
