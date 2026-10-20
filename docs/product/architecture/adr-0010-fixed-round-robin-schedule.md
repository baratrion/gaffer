# ADR-0010: Fixed round-robin schedule (S-006)

- Status: Accepted
- Date: 2026-10-20
- Deciders: nWave solution-architect (S-006 DESIGN, `interaction_mode=propose`)
- Related: ADR-0003 (functional core), ADR-0004 (seed and world: `league.clubs` order is already seeded), ADR-0007 (frozen read-only domain data). Supersedes nothing. ADR-0011 (match model) consumes it.

## Context
S-006 plays the managed club's matchday-1 league fixture. DISCUSS D5: matchday 1 of one fixed round-robin over the 8 clubs, 4 fixtures, every club in exactly one, the schedule fixes which club is home (named first); symmetric (managing the opponent shows the same two clubs in the same order); the season story reuses the schedule for all 14 matchdays (double round-robin, scope.md IN). DESIGN chooses the algorithm and whether it depends on the seed.

Constraints and facts checked:
- `CLUBS_PER_LEAGUE = 8` (`src/domain/league.ts`); a club is identified in the domain by its index 0..7 in `league.clubs` (S-005 glossary, `squadOf`). The order of `league.clubs` is drawn from the seed (`generateLeague`: towns drawn without replacement), so the names behind index 0..7 already differ per seed.
- Domain purity (ADR-0003, oxlint `no-restricted-globals`, PR guard): no `Date`, no `Math.random`. Read-only domain data is deeply frozen (ADR-0007 precedent).
- Streams in use: -1, 0..7, 100..107 (ADR-0005/0006). A seeded schedule would need another stream.
- `tests/protected/S-006/` checks black-box only: perfect pairing on matchday 1 and the same order from both clubs' screens; it never pins which clubs meet.
- No library is involved (no API to verify).

## Options

### 1. Algorithm and seed dependence
| Option | Pros | Cons |
|---|---|---|
| **A. Circle (polygon) method over club indices, seed-independent, with a fixed home rule; second half mirrored (chosen)** | A constant table: testable as exact goldens, no stream, no RNG; every matchday is a perfect matching by construction; the names behind the indices still vary per seed because `league.clubs` is seeded; the formula is ~15 lines and provably a 1-factorisation | The same indices meet on the same matchday in every league (invisible to the player, who sees names) |
| B. Circle method over a seeded permutation of the 8 indices (new stream) | Different index pairings per seed | Adds a stream and an RNG draw for no visible gain (the club order is already seeded); goldens move with the seed; one more frozen constant set |
| C. Seeded random home/away per pairing | Varied home patterns | Home balance no longer by construction (a club could get 6 home games of 7); needs a stream; harder properties |
| D. Hard-coded 14 x 4 literal table | Readable as data | 56 hand-typed pairs; a typo breaks the matching silently unless every property is tested anyway; the formula is shorter than the table |

### 2. How much of the season to build now
| Option | Pros | Cons |
|---|---|---|
| **A. All 14 matchdays now: rounds 1..7 from the formula, 8..14 as the mirror (home and away swapped) (chosen)** | The rule the season story needs is fixed once, in one module, by this ADR; the mirror is one expression; the double round-robin property (each ordered pair exactly once) is cheap to test | About 3 more lines of code and one more property test than matchday 1 alone |
| B. Matchday 1 only | Ships the least code | The season story would have to extend or re-derive the same formula and could pick a different home rule, contradicting matchday 1 results already seen |

## Decision
**1A, 2A.** New pure module `src/domain/schedule.ts` (name from the DISCUSS glossary: Schedule, Matchday, Fixture).

- `Fixture = { readonly home: number; readonly away: number }` (club indices 0..7, home first). `MATCHDAYS = 14`, `FIXTURES_PER_MATCHDAY = 4`.
- With `n = CLUBS_PER_LEAGUE` (8), the last index `n - 1` (7) is the fixed vertex and `R = n - 1` (7) rounds. For matchday `m` in 1..7, round `r = m - 1`; for `m` in 8..14, `r = m - 8` and every fixture of that round has home and away swapped (mirror). Fixtures in index order `k = 0..3`:
  - `k = 0`: the pair {`r`, 7}; home is `r` when `r` is even, else 7.
  - `k = 1..3`: `a = (r + k) mod 7`, `b = (r - k + 7) mod 7`; home is `a` when `k` is odd, else `b`; away is the other.
- Goldens (exact, seed-independent): matchday 1 = `[0 v 7, 1 v 6, 5 v 2, 3 v 4]`; matchday 2 = `[7 v 1, 2 v 0, 6 v 3, 4 v 5]`; matchday 8 = `[7 v 0, 6 v 1, 2 v 5, 4 v 3]` (home first). At `?seed=31`, club 0 ("Netherwold Borough") is at home to club 7 on matchday 1; at `?seed=abc`, club 7 ("Oakhampton Rise Borough") is away at club 0 of that league.
- Home balance: in matchdays 1..7, clubs 0, 2, 4, 6 are at home 4 times and clubs 1, 3, 5, 7 three times (for each club `t` other than 7 and each round `r` other than `t`, the offset `(t - r) mod 7` takes every value 1..6 once, and the club is at home for offsets 1, 3 and 5; in round `t` it is at home when `t` is even; club 7 is at home in rounds 1, 3, 5). Over 14 matchdays every club is at home exactly 7 times and every ordered pair meets exactly once.
- Ports (pure, read-only, no RNG, no seed): `fixturesOf(matchday: number): readonly Fixture[]` (4 fixtures in index order); `fixtureOf(matchday: number, clubIndex: number): { readonly index: number; readonly fixture: Fixture }` (the club's fixture and its index 0..3 in that matchday). A `matchday` that is not an integer 1..14, or a `clubIndex` that is not an integer 0..7, throws `RangeError` (programming error, never user input; as `generateSquad`). The table is computed once at module load and deeply frozen (the outer array, each matchday's array and every `Fixture`), so readers cannot write to it.
- Imports: `CLUBS_PER_LEAGUE` from `league.ts` only.

## Consequences
- Positive: D5 by construction (perfect matching, fixed home, symmetric because both clubs read the same table entry); no stream, no seed, no RNG; the season story inherits the full double round-robin and its home rule unchanged; Stryker mutates it (domain glob) and exact goldens kill arithmetic mutants.
- Negative: index pairings are identical across leagues (only names differ); the home pattern has some breaks (two home or two away matchdays in a row), which nothing in scope measures. Changing the formula later changes every fixture for every seed: it is frozen with this ADR (any change needs a superseding ADR).
- Contract shape: pure data plus pure return-only functions; universe = the returned frozen arrays; assertion = goldens, `Object.isFrozen` at each level, and properties.
- Properties to test (DISTILL, fast-check where a generator helps): for every matchday 1..14, the 8 indices of its 4 fixtures are a permutation of 0..7 and `home !== away`; over 1..14 every ordered pair of distinct clubs occurs exactly once; matchday `m + 7` is matchday `m` with home and away swapped; `fixtureOf(m, c).fixture` contains `c` and equals `fixturesOf(m)[index]`; both clubs of a fixture get the same `index` and the same `Fixture` object; home counts over 1..7 are 4 for even clubs and 3 for odd clubs; matchday 0, 15, 1.5, NaN and club -1, 8, 1.5 throw `RangeError`; the three goldens above.
- Earned Trust: no adapter and no environment dependency (pure integer arithmetic), so nothing to probe beyond the goldens.
- Enforcement: oxlint domain boundaries (imports only `league.ts`); the PR guard; Stryker domain glob; no new dependency.
