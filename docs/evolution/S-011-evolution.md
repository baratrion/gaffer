# S-011: Read my club's news in the Inbox (evolution record)

Finalized 2026-10-26. Delivery history stays in `docs/feature/S-011/` (feature-delta, slices, discuss, distill, `deliver/roadmap.json`, `deliver/execution-log.json`).

## Summary
The club home gains an "Inbox" button. Its screen lists one read-only message per matchday played, newest first: "Matchday N", the match score line and "League position" (ordinal after that matchday). Before any match it shows "No messages yet". All derived from recorded results: no new state, no save change.

## Key decisions
- ADR-0018: `render` becomes a lookup (the S-009 DESIGN open question deferred by S-010).
- D6: derived only; per-season reset (an empty Inbox after New game or Play again).
- D8: the sixth club-home button amends the exact button lists of earlier non-protected e2e specs (replaced, never weakened).

## Work completed (roadmap steps)
| Step | Outcome | Commit |
|---|---|---|
| 01-01 | `render` lookup | bbff2a0 |
| 01-02 | Shared score line and matchday title | b2cb486 |
| 02-01 | Inbox screen with matchday messages | 96d4b32 |
| 03-01 | League position in each message | c86af68 |
| refactor | Inbox derivation helper, empty list height, stale comment | e212122 |

Source touched: `src/domain/inbox.ts`, `src/ui/score-line.ts`, `src/ui/screens/inbox.ts` (new); `src/app/state.ts`, `src/main.ts`, `src/ui/screens/club-home.ts`, `src/ui/screens/match.ts`, `src/ui/styles.css`.

## Issues and quality-gate notes (honest record)
- 02-01 RED was logged without a separate observed run (same timestamp as GREEN); the scaffolds threw by construction. 01-01 and 01-02 RED were SKIPPED (NOT_APPLICABLE, refactors).
- Reviewer (Haiku) found no production defects. Blocker B1 (missing "Outcome anchor" tag in tests) declined: earlier stories do not carry it; it is an nWave template convention.
- Mutation testing is nightly-delta; `/nw-deliver` Phase 5 skipped.
- Acceptance 1213 tests and e2e 155 passing. `des-verify-integrity` passed. `tests/protected/S-011/` runs in CI on main.

## Migrated artifacts
None to copy: no `design/` directory exists; ADR-0018 and the architecture brief already live in `docs/product/architecture/`. `docs/feature/S-011/` is preserved as delivery history. Session artifacts removed: `.nwave/des/deliver-session.json` and `.nwave/des/des-task-active`.
