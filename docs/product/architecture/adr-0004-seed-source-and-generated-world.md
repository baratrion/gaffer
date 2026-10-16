# ADR-0004: Seed source and the generated world (league and squads)

- Status: Accepted
- Date: 2026-10-15
- Deciders: nWave solution-architect (factory plan run, `interaction_mode=propose`)

## Context
S-001 and S-002 generate a fictional league of 8 clubs and an 18-player squad per club. The brief
requires "same seed, same season" and fictional names only. A seed has to come from somewhere outside
the domain, and the black-box protected scenarios need a way to pin it.

## Options (seed source)
| Option | Pros | Cons |
|---|---|---|
| **A. `?seed=<int>` query parameter, fixed default when it is absent** | Reproducible bug reports ("open this link"); scenarios can pin seeds; no wall clock | Every "New game" without a param gives the same league |
| B. Wall-clock seed on "New game", shown on screen | Variety | Untestable black-box unless shown; the first-run experience varies for demos |
| C. Seed text input on the title screen | Explicit | Extra UI and friction against the five-minute loop |

## Decision
**Option A.** Only the shell (`main.ts`) reads `location.search`, once, and passes the string to the pure `parseSeed(search: string)` in `src/app/`, which parses `new URLSearchParams(search).get("seed")`.
A value matching `^-?\d{1,10}$` whose number lies in the signed 32-bit range (-2147483648..2147483647)
is used as is. Leading zeros are allowed, so `007` is 7. Anything else (missing, empty, non-numeric,
fractional or out of range, such as `9999999999`) silently falls back to `DEFAULT_SEED` (a constant).
The domain receives only the number.
Variety between seasons (a future "New season" or "play again") will be decided in its own story
and ADR. The narrower choice ships now.

**World generation (domain):**
- `generateLeague(seed) => League`: 8 clubs, each with an `id`, a unique `name` built from fictional
  word lists (town plus suffix, for example "Brindlecombe Rovers") and two distinct `colours` from a fixed palette.
  Name uniqueness is guaranteed by construction: the 8 **towns** are drawn without replacement from a
  town list of at least 24 entries, so names stay unique whatever suffix is drawn. Suffixes may repeat.
  No retry loops.
- `generateSquad(seed, clubIndex) => Player[]`: 18 players from `deriveSeed(seed, clubIndex)`.
  *Refinement note 2026-10-16 (ADR-0005 (a), (c)): the return type is `readonly Player[]`; names come from a
  league-wide name stream `deriveSeed(seed, -1)` sliced per club (for league-wide uniqueness), while per-club
  age and overall draws still use `deriveSeed(seed, clubIndex)`. Quota and 17-35 age range unchanged.*
  `deriveSeed` is a pure integer hash (for example one mulberry32 step over `seed ^ (clubIndex * 0x9e3779b9)`),
  the same helper ADR-0003 names. Position quota: exactly 2 GK, 6 DF, 6 MF, 4 FW. Age 17-35, which is
  deliberately narrower than the 16-40 the S-002 outcome allows. `overall` is an integer from 1 to 20,
  stored for now. It becomes derived when the player-detail story adds the 4-6 attributes and condition
  that scope.md lists. Those fields are deferred, so do not add them ad hoc.
  *Refinement note 2026-10-16 (S-003, ADR-0006): done. Four attributes (1-20) and a condition (75-100 generated, 0-100 accepted by the UI) are added, and `overall` is derived from the attributes; see ADR-0006.* Names come from fictional
  first-name and surname lists. No real players or clubs.
- Word lists live in `src/domain/names.ts` as plain data. A unit test checks that no generated club name
  matches a small denylist of well-known real club names (`tests/unit/fixtures/real-club-denylist.ts`).

## Consequences
- Protected scenarios can assert determinism (same `?seed=` twice) and sensitivity (different seeds give different leagues).
- Property tests: for any 32-bit seed, there are 8 unique club names with two distinct colours each, every squad matches the exact quota (2/6/6/4), ages are 17-35, overalls are 1-20, and the same seed gives deep-equal output.
- The default seed makes the owner's demo identical each time, which helps the Friday demo.
