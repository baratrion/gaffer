# Gaffer: scope and precedence rules

> DRAFT for the owner to correct. Owner-only file. When anything conflicts, **this file wins** and **the narrower scope wins**.

## IN (POC)
- One fictional league of 8 clubs, with generated names and colours.
- Pick a club; see its generated squad of 18 players (name, position, age, 4–6 attributes, condition).
- Choose a formation (4-4-2, 4-3-3, 4-2-3-1) and a starting XI.
- **Quick-sim matches**: event-based, seeded, with live text commentary, final score and basic stats (shots, possession, cards). No pitch rendering.
- Season: double round-robin (14 matchdays); other matches are simulated; league table.
- Save and continue in the browser (localStorage).
- Inbox/news feed with match reports and simple storylines.
- End-of-season screen (final position, top scorer, "play again").

## OUT (CI-enforced through roadmap tags; reopening needs `approved_by_human: true`)
| Tag | Excluded |
|---|---|
| `match-2d` | 2D/3D match rendering, physics and realism tuning (allowed only from week 6+, timeboxed to 2 weeks, owner approval) |
| `utility-ai` | Per-player decision AI in matches |
| `transfers` | Transfer market, contracts, scouting |
| `finances` | Money, wages, sponsorship, stadium |
| `training` | Training schedules, player development over time |
| `youth` | Youth academy, regens |
| `staff` | Coaches, physios, board |
| `multiplayer` | Accounts, leagues with friends, online anything |
| `backend` | Any server, database or API. The game is a static site. |
| `real-data` | Real clubs, players, leagues, logos |

## Technical constraints
- TypeScript (strict) + Vite + Vitest + Playwright, on Node 22 with pnpm. No UI framework unless a story proves the need. Plain DOM modules are fine.
- `src/domain/` is pure: no DOM, no storage, no `Math.random`/`Date.now`. All randomness comes from `src/domain/rng.ts` seeds.
- `src/ui/` renders the domain state; it may call the domain, never the reverse.
- Bundle budget: JS under 150 kB gzip for the POC.

## Precedence rules for unattended decisions
1. This file, then `brief.md`, then the story outcome in `factory/roadmap.yaml`, then nWave artifacts.
2. When two readings are possible, pick the one that ships less.
3. Visual style: the existing `src/ui/styles.css` tokens (pitch green, chalk and gold). Don't introduce new design systems.
