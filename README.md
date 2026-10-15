# Gaffer

A mobile-first football management game for the browser: one fictional club, one season, five-minute sessions.

**Play:** https://baratrion.github.io/gaffer/

## How it gets built
This repo is an experiment in "lights-off" software delivery. An unattended Claude Code factory, governed by [nWave](https://github.com/nWave-ai/nWave), builds the game a story at a time from scheduled GitHub Actions runs. The owner checks in once a week, from a phone.

- **Stories:** `factory/roadmap.yaml`, delivered in order.
- **Done means evidence:** a story is complete only when its owner-approved black-box scenarios in `tests/protected/` pass on `main`.
- **Merge authority is deterministic:** lint, types, tests, protected-path, test-count and diff-size guards, story regression, and a phone-viewport smoke test. An AI reviewer can block but cannot approve on its own.
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
