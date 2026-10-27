# S-011: Read my club's news in the Inbox (evolution record)

Finalized 2026-10-27. Delivery history stays in `docs/feature/S-011/` (feature-delta, slices, discuss, distill, `deliver/roadmap.json`, `deliver/execution-log.json`).

## Summary
The club home gains a sixth button, "Inbox" (after "Table"). It opens a list named "Messages" with one message per matchday played, newest first: "Matchday N", the club's score line and "League position". "No messages yet" shows with no match played; Back returns to the club home. Everything is derived from the recorded results; nothing new is stored, `GameState` keeps its five keys and the save text is unchanged.

## Key decisions
- ADR-0017: pure `matchdayReports` in `src/domain/inbox.ts` reusing `standings` over entries up to and including each matchday; `inboxOf` in `state.ts`; `ViewInbox` and `Back` change only `screen`.
- ADR-0018: `render` became a `RENDERERS` mapped-type lookup (the S-009 open question), done as the first, behaviour-preserving commit.
- Shared `scoreLine` and `matchdayTitle` in `src/ui/score-line.ts` so the match screen and the Inbox cannot drift.
- Amendments under the 1200-line PR cap: no `ScoreSide` type; `RENDERERS` local to `render()` without a `RenderContext`; `.message-list` `min-height: 1px`; solid chalk card style. Behaviour contracts unchanged.

## Work completed (roadmap steps 01-01 to 01-05)
| Step | Outcome | Commit |
|---|---|---|
| 01-01 | `render` is the `RENDERERS` lookup | cdc85a6 |
| 01-02 | Shared score-line and matchday-title builders | ff44cc4 |
| 01-03 | `matchdayReports` with league positions | b7a42af |
| 01-04 | Inbox screen, sixth button, navigation | e3eed3f |
| 01-05 | League position line, e2e | af02a5e |
| refactor | Tighten code, share test helpers, record amendments | 80830b4, 76bbc86, 1d3b6fd |

Source touched: `src/domain/inbox.ts`, `src/ui/score-line.ts`, `src/ui/screens/inbox.ts` (new); `src/app/state.ts`, `src/main.ts`, `src/ui/screens/club-home.ts`, `src/ui/screens/match.ts`, `src/ui/styles.css`. Eight S-005..S-009 e2e specs had their five-button lists amended to six.

## Issues and quality-gate notes (honest record)
- RED for 01-01 and 01-02 was SKIPPED (NOT_APPLICABLE, behaviour-preserving refactors guarded by the existing suite).
- Haiku review: NEEDS_REVISION on evidence gaps D1-D3; treated as G9 parity (test and expect counts only went up; the PR guard passes at 1193 of 1200 lines).
- `ci:test` 63 files / 1197 tests and `ci:e2e` 154 green; `des-verify-integrity` passed. `tests/protected/S-011/` is run by CI on main, not locally.
- Mutation testing is nightly-delta; Phase 5 skipped. First nightly is the baseline for `inbox.ts`.
- The DESIGN rows in `feature-delta.md` still describe `RenderContext` and `ScoreSide`; the ADR amendments hold the final shape.

## Migrated artifacts
None to copy: no `design/` directory exists. ADR-0017/0018 and the architecture brief already live in `docs/product/architecture/` (brief component inventory already lists `inbox.ts`, `score-line.ts`, the Inbox screen and `RENDERERS`). `docs/roadmap.yaml` is unchanged (S-010 precedent). `docs/feature/S-011/` is preserved as delivery history. Session artifacts removed: `.nwave/des/deliver-session.json`, `.nwave/des/des-task-active*`.
