# S-002: View my squad

## Wave: DISCUSS

Lean, unattended. Reuses `discuss/journey.md`. Outcome is fixed by `docs/roadmap.yaml` (S-002) and is not re-scoped here.

### Wave: DISCUSS / [REF] Persona
Sam, 34, a lapsed Championship Manager fan. Plays on the bus, one-handed, on a mid-range Android phone at 390px wide, with 5 minutes to spare (brief.md, "Player"). Wants to see the squad at a glance, scrolling only vertically.

### Wave: DISCUSS / [REF] JTBD one-liner
When I have just taken charge of a club, I want to see who I have got, so that I can start judging who should play. (Recorded as J-02 `know-my-squad` in `docs/product/jobs.yaml`; it follows J-01.)

### Wave: DISCUSS / [REF] Locked decisions
- Squad: 18 players per club, generated purely from the league seed and the club's index (ADR-0004: `generateSquad(seed, clubIndex)` from `deriveSeed(seed, clubIndex)`). Same seed gives the same squad on every visit.
- Position quota is exact: 2 GK, 6 DF, 6 MF, 4 FW (ADR-0004). This satisfies "at least 2 GK and players in every position".
- Player: `name`, `position` (GK, DF, MF, FW), `age`, `overall` (integer 1-20, stored). ADR-0004 narrows generated age to 17-35, inside the 16-40 the outcome allows; the UI and tests must accept anything in 16-40 and the generator stays within 17-35. No attributes or condition (deferred to the player-detail story).
- "Every club has different players": no two clubs in one league share a squad, and no full player name appears in two clubs of the same league. The mechanism is for DESIGN (draws from independent per-club seeds can collide, so uniqueness needs a construction, as for club names). Names within one squad are also unique.
- Names come from fictional first-name and surname lists in `src/domain/names.ts`. A unit test checks no generated name matches a small denylist of well-known real players (same approach as the club denylist, ADR-0004).
- Screens: club home gains a "Squad" button; new squad screen with one `<h1>` and a `<ul>` named "Squad" (one `<li>` per player); a button named exactly "Back" returns to club home (heading is the club's name). Real buttons, one `<h1>` per screen, lists for collections, 44px targets (CLAUDE.md "Phone first").
- Row text order: name, position, age, overall. Age and overall are the first two numbers in the row, so a player name must contain no digits. Row is built with `el()` (ADR-0002); generated text never goes through `innerHTML`.
- `Screen` gains `{ kind: "squad", clubId }` and `Action` gains `ViewSquad` and `Back` (ADR-0003). The squad is derived from the seed on render; it is not stored in state and not persisted.
- Squad rows are display-only (not buttons); player detail is a later story.
- `deriveSeed` is created in this story (ADR-0003/0004 name it; S-001 deferred it).
- UX depth: no mockups beyond the journey table.

### Wave: DISCUSS / [REF] User stories

#### US-1: See who is in my squad
**Problem:** Sam has taken charge of a club, but the club is only a name. Without seeing the players there is nothing to judge, so Sam cannot start thinking about who should play.
**job_id:** J-02
**Elevator Pitch**
- Before: the club home screen shows only the club's name.
- After: Sam taps "Squad" and sees 18 players, each with name, position, age and overall rating, then taps "Back" to return to the club's home.
- Decision enabled: who is my best player, and which position is weak?

**Domain examples**
1. Sam opens `?seed=31`, picks the first club and taps "Squad". A row reads "Tomas Brenning GK 27 14" (name, position, age, overall). The names are illustrative; the generated values are fixed by the implementation.
2. Sam taps "Back" and sees the club's name as the heading again. Sam taps the second club instead and sees a different 18 players. Reopening `?seed=31` and the first club shows the identical squad.
3. Sam opens `?seed=abc` (default seed) and views the squad of the 8th club: still exactly 18 players with 2 GK, 6 DF, 6 MF and 4 FW, none sharing a name with a player of any other club.

**Acceptance criteria (embedded UAT)**
- Scenario: Sam sees 18 players after tapping Squad.
  Given Sam is on a club's home screen, when Sam taps "Squad", then Sam sees one heading and a list named "Squad" with exactly 18 items.
- Scenario: Each row tells Sam who the player is.
  Given Sam is looking at the "Squad" list, then every row shows a name, then one of GK, DF, MF or FW, then an age from 16 to 40, then an overall from 1 to 20, and age and overall are the first two numbers in the row.
- Scenario: The squad is balanced.
  Given Sam is looking at any club's "Squad" list, then it has at least 2 goalkeepers and at least one DF, one MF and one FW (in fact exactly 2, 6, 6 and 4).
- Scenario: Every club has different players.
  Given Sam has viewed the squads of two different clubs in the same league, then the two lists of player names are not the same, and no player name appears in both.
- Scenario: The same link gives the same squad.
  Given Sam opened `?seed=31` and noted the first club's 18 rows, when Sam opens `?seed=31` again in a fresh visit and views the same club's squad, then the rows are identical and in the same order.
- Scenario: Back returns to the club home.
  Given Sam is looking at the "Squad" list, when Sam taps the button named "Back", then the screen heading is the club's name.
- Scenario: The squad is easy to use on a phone.
  Given Sam is on a 390px-wide phone viewport looking at the "Squad" list, then the page does not scroll sideways, the "Squad" and "Back" buttons are at least 44px tall, and no errors appear in the browser console.

Notes for DELIVER and DISTILL (not part of the AC): the domain property (18 players, exact quota, ages 17-35, overalls 1-20, deep-equal for the same seed, no duplicate names across clubs) is covered by property tests on `generateSquad`. `update` handles `ViewSquad` and `Back`; both are no-ops from the wrong screen (as `ChooseClub` is in S-001).

**Outcome KPI:** Sam goes from club home to seeing the squad in 1 tap (measured by the e2e smoke tap count; no analytics in the POC).
**Technical notes:** `generateSquad`, `deriveSeed` and player name lists in `src/domain/`. `Screen`/`Action`/`update` in `src/app/` (ADR-0003). `el()` for the squad view (ADR-0002). Depends on S-001 (league, club home).

### Wave: DISCUSS / [REF] DoD
- `tests/protected/S-002/` passes on main.
- Unit and property tests for `generateSquad`, `deriveSeed`, navigation and the player-name denylist pass. The `ci:*` scripts are green.
- The e2e phone-viewport smoke covers club home, squad and back.
- No ambient randomness or wall-clock time in `src/domain/`.
- S-001 behaviour and tests are unchanged (club home still headed by the club name).

### Wave: DISCUSS / [REF] Out-of-scope
Player detail view, attributes and condition, derived overall, sorting and filtering, formations and the starting XI, persistence, injuries, transfers, player photos or kits.

### Wave: DISCUSS / [REF] WS strategy
Extends the S-001 walking skeleton (title, pick-club, club-home) by one step: club-home, squad, back. The e2e journey "pick a club, Squad, Back" is the end-to-end proof. Two carpaccio slices: `slices/slice-01-squad-generator.md` (a precursor commit, not shipped alone since nothing is visible) then `slices/slice-02-squad-screen.md`.

### Wave: DISCUSS / [REF] Driving ports
- `generateSquad(seed: number, clubIndex: number) => readonly Player[]`, pure domain (ADR-0004). `deriveSeed(seed, clubIndex) => number`, pure.
- `update(GameState, Action) => GameState` with `ViewSquad` and `Back`.
- UI entry: the "Squad" button on club home, the list named "Squad", and the button named "Back", reachable by role and accessible name at `http://localhost:4173/gaffer/`. Row text order: name, position, age, overall.

### Wave: DISCUSS / [REF] Pre-requisites
- S-001 delivered (league, pick-club and club-home screens, `update`, `parseSeed`).
- ADR-0002, ADR-0003 and ADR-0004 accepted; no new ADR expected. Possible superseding note in ADR-0004 when overall becomes derived (later story).
- `docs/product/jobs.yaml` now has J-02 (resolved).
- Open risk: no DIVERGE artifact (accepted as lean). Open question for DESIGN: the construction that guarantees no shared player name across clubs.

## Wave: DESIGN

Mode: propose. Scope: application. One solo team. Paradigm: functional (ADR-0003). New ADR: `adr-0005-squad-generation.md`. Architecture: `docs/product/architecture/brief.md` ("Squad (S-002)", "For Acceptance Designer" ports 4-7). No new C4 container: the S-001 L1/L2 still hold.

### Wave: DESIGN / [REF] DDD list
- Same bounded context, "League setup", extended with `Player` and `Position`. Language: Squad, Player, Position, Overall.
- Value objects: `Player { name, position: GK|DF|MF|FW, age, overall }`; a squad is a `readonly Player[]` of 18. No aggregates, no events.
- Invariants by construction: exact quota 2/6/6/4; all names unique across the league (one league-wide draw without replacement, sliced per club); names have no digits.

### Wave: DESIGN / [REF] Decisions
| # | Decision | Source |
|---|---|---|
| D1 | Name uniqueness: partial Fisher-Yates of 144 draws from `FIRST_NAMES x SURNAMES` (900 or more combinations), seeded by `deriveSeed(seed, -1)`, club takes slice `clubIndex*18..+18`. Rejected: per-club draw plus retry; surname partition per club | ADR-0005 (a) |
| D2 | Quota 2/6/6/4 in order GK, DF, MF, FW; age 17-35; overall 1-20 uniform; no digits and no GK/DF/MF/FW tokens in names | ADR-0005 (b) |
| D3 | `deriveSeed(seed, stream)` = one mulberry32 step over `seed ^ imul(stream, 0x9e3779b9)`, in `rng.ts` | ADR-0005 (c) |
| D4 | Squad derived on render, not in `GameState`. Rejected: storing it; memoising | ADR-0005 (d) |
| D5 | `overall` stored; derived later (player-detail story) | ADR-0005 (e) |
| D6 | Denylist test enumerates the whole name pool, not just generated names | ADR-0005 (f) |
| D7 | `ViewSquad` only from clubHome, `Back` only from squad (returns to the same club); otherwise no-ops, like `ChooseClub` | ADR-0003 |
| D8 | Row built with `el()`: spans for name, position, age, overall in that order with a space between; `<li>` is not a button. `club-home.ts` gains `dispatch` and a "Squad" button | ADR-0002 |

### Wave: DESIGN / [REF] Component decomposition
| Component | Layer | Responsibility |
|---|---|---|
| `rng.ts` `deriveSeed` | domain | Pure int32 hash of (seed, stream) |
| `names.ts` | domain | Adds `FIRST_NAMES`, `SURNAMES` (30 or more each, letters/space/hyphen/apostrophe) |
| `squad.ts` | domain | `Player`, `Position`, `SQUAD_QUOTA`, `PLAYERS_PER_SQUAD`, `generateSquad` |
| `app/state.ts` | app | `Screen` + `squad`; `Action` + `ViewSquad`, `Back`; `update` |
| `ui/screens/squad.ts` | ui | `renderSquad(root, club, squad, dispatch)` |
| `ui/screens/club-home.ts` | ui | Adds "Squad" button |
| `main.ts` | shell | Renders squad screen: finds club index, calls `generateSquad(league.seed, index)` |

### Wave: DESIGN / [REF] Driving ports
- `generateSquad(seed, clubIndex) => readonly Player[]`, `deriveSeed(seed, stream) => number` (pure).
- `update(GameState, Action) => GameState` with `ViewSquad` and `Back`.
- Browser: "Squad" button on club home; `<h1>`; list "Squad" with 18 `listitem`s; "Back" button. Detail in the brief, "For Acceptance Designer".

### Wave: DESIGN / [REF] Driven ports and adapters
None: no storage, clock or network. The squad is derived, so nothing is persisted and no probe is needed. No external integrations, so no contract tests. Enforcement unchanged (oxlint boundary rules, PR guard, nightly Stryker on `src/domain/**`, which includes `squad.ts`).

### Wave: DESIGN / [REF] Technology choices
No new technology or dependency (ADR-0001, 0002, 0004 apply; all OSS). New word lists are plain data.

### Wave: DESIGN / [REF] Reuse Analysis
| Existing | Action | Contract shape / assertion |
|---|---|---|
| `src/domain/rng.ts` (`createRng`, `nextFloat`) | EXTEND: add `deriveSeed` | pure, return-only; deep-equal, int32 property |
| `src/domain/names.ts` | EXTEND: add name lists | pure data; test no duplicates, no digits, size 144 or more, denylist over whole pool |
| `src/domain/league.ts` (`drawWithoutReplacement`, `CLUBS_PER_LEAGUE`) | EXTEND: reuse the draw helper (export or move to a shared domain helper); `squad.ts` imports `CLUBS_PER_LEAGUE` | pure, return-only |
| `src/domain/squad.ts` | CREATE NEW (no existing alternative) | pure, return-only; property tests (quota, ranges, determinism, cross-club uniqueness) |
| `src/app/state.ts` | EXTEND: new `Screen` and `Action` variants | pure, return-only; unit tests including wrong-screen no-ops |
| `src/ui/screens/club-home.ts` | EXTEND: "Squad" button, `dispatch` parameter | bounded-change: root's children only; e2e |
| `src/ui/screens/squad.ts` | CREATE NEW | bounded-change; e2e |
| `src/main.ts` | EXTEND: render case for squad | unbounded shell, universe unchanged (reads `location.search` once, writes root and focus) |
| `src/ui/styles.css` | EXTEND: squad rows, 44px buttons, no sideways scroll | n/a |
| `tests/unit/fixtures/real-player-denylist.ts` | CREATE NEW | test fixture |
| `tests/e2e/` | EXTEND: new `S-002-squad.spec.ts` (shell.spec.ts untouched) | black-box |

### Wave: DESIGN / [REF] Open questions
- None blocking. Name pool size (30 x 30) is a floor; DELIVER may grow it. Squad list label: use `aria-labelledby` on the h1 or `aria-label="Squad"`; either gives the accessible name "Squad" the scenarios need.
- Deferred: skewed overall distribution, attributes, sort and filter (later stories).
- Handoff note for DISTILL: lean on property tests for `generateSquad` (all 8 clubs per seed, assert the 144 names are distinct) and role-based e2e; enumerate the full name pool in the denylist test.
