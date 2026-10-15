# Gaffer: scope and precedence rules

> DRAFT for the owner to correct. Owner-only file. When anything conflicts, **this file wins** and **the narrower scope wins**.

## IN (POC): the direction, not a backlog. nWave plans the stories.
- One fictional league of 8 clubs, with generated names and colours.
- Pick a club; see its generated squad of 18 players (name, position, age, 4–6 attributes, condition).
- Choose a formation (4-4-2, 4-3-3, 4-2-3-1) and a starting XI.
- **Quick-sim matches**: event-based, seeded, with live text commentary, final score and basic stats (shots, possession, cards). No pitch rendering.
- Season: double round-robin (14 matchdays); other matches are simulated; league table.
- Save and continue in the browser (localStorage).
- Inbox/news feed with match reports and simple storylines.
- End-of-season screen (final position, top scorer, "play again").

## OUT (CI-enforced through roadmap tags in `factory/config.json`; only the owner can reopen one)
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

## Technical decisions
Not decided here. nWave's DESIGN wave makes them and records each one as an ADR in `docs/product/architecture/`: language and framework, rendering (for example pixi.js), architecture patterns (for example ECS or a functional pipeline), package manager, and test tooling. The only fixed constraints come from the product:
- It must be a static site deployable to GitHub Pages under `/gaffer/`, with no backend (see OUT).
- Same seed, same season: game logic must be deterministic and replayable.
- It must run well on a mid-range phone browser.

## Precedence rules for unattended decisions
1. This file, then `brief.md`, then accepted ADRs, then the story outcome in `docs/roadmap.yaml`, then other nWave artifacts.
2. When two readings are possible, pick the one that ships less.
3. Visual identity: pitch green, chalk and gold, as in the current shell. nWave may evolve it through an ADR.
