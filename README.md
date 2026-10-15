# Gaffer

A mobile-first football management game for the browser: one fictional club, one season, five-minute sessions.

**Play:** https://baratrion.github.io/gaffer/

## How it gets built
This repo is an experiment in "lights-off" software delivery. An unattended Claude Code factory, governed by [nWave](https://github.com/nWave-ai/nWave), builds the game a story at a time from scheduled GitHub Actions runs. The owner checks in once a week, from a phone.

- **nWave decides:** plan runs (DISCUSS + DESIGN) write the stories (`docs/roadmap.yaml`) and the technical decisions (`docs/product/architecture/`: stack, rendering, architecture), and nWave's reviewer agents critique them.
- **Done means evidence:** a story is complete only when its black-box scenarios in `tests/protected/` pass on `main`. Every scenario must fail on `main` when it is added, and it can never be edited afterwards.
- **Merge gates:** lint, types and tests through the stack's `ci:*` scripts; locked-path, append-only, test-count and diff-size guards; story regression; a phone-viewport smoke test; and an AI reviewer that can block. No human approval is needed.
- **Kill switch:** any open issue labelled `factory:stop`, or `"paused": true` in `factory/config.json`.

The research behind the design is in `docs/research/autonomous-delivery/`.

## Security note
The factory never reads Issue, PR or comment text. Steering happens only through owner commits and labels. Please don't file instructions as issues; they're ignored by design.

## Develop
```sh
pnpm install
pnpm dev
pnpm check && pnpm test:e2e
```
