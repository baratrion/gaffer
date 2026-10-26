# S-010: Save and continue my season (evolution record)

Finalized 2026-10-26. Delivery history stays in `docs/feature/S-010/` (feature-delta, slices, discuss, distill, `open-questions.md`, `deliver/roadmap.json`, `deliver/execution-log.json`).

## Summary
The season survives a reload. Saving taps (pick club, formation, Starting XI pick, Play match) write a strict, versioned save to `localStorage` under "gaffer.save". The title shows "Continue" above "New game" when a readable save exists; it restores the game and lands on the club home. Damaged, incompatible, blocked or full storage means no "Continue", no console errors, and a failed write removes the stored save so "Continue" never offers an older state.

## Key decisions
- ADR-0016: pure save format (`src/app/save.ts`) behind a thin probing storage adapter (`src/adapters/save-store.ts`), per ADR-0003 (functional core, imperative shell). Amended in DISTILL to `createAutosave(write, lastText)`.
- `update` and the screen dispatch became lookups (S-009 DESIGN open question); `Continue` is a new action; `isLegalXI` validates restored team sheets.
- D7: the S-008 e2e reload test and an S-009 test title were reworded; assertions are unchanged or stricter.

## Work completed (roadmap steps 01-01 to 01-06)
| Step | Outcome | Commit |
|---|---|---|
| 01-01 | `isLegalXI` selection rule | 629959d |
| 01-02 | Strict versioned encode and decode, never throwing | 300687a |
| 01-03 | `Continue` action and handler table | 3e814a3 |
| 01-04 | Autosave trigger decisions | 814b38e |
| 01-05 | Probing store, Continue on the title, boot wiring | d5e53be |
| 01-06 | e2e, amended reload tests, mutation scope | 699abef, ac03472 |
| refactor | Trim, tighten titles and fixtures, open questions | cd97745, 95a57c3, de99697 |

Source touched: `src/app/save.ts` (new), `src/adapters/save-store.ts` (new), `src/app/state.ts`, `src/app/seed.ts`, `src/domain/selection.ts`, `src/main.ts`, `src/ui/screens/title.ts`, `src/ui/styles.css`, plus `.oxlintrc.json` and `stryker.config.mjs`.

## Issues and quality-gate notes (honest record)
- RED for 01-02 and 01-06 was logged SKIPPED (NOT_APPLICABLE), not executed; the reviewer called the RED evidence weak. Nothing was backdated.
- Mutation testing is nightly-delta; `/nw-deliver` Phase 5 skipped. The first nightly run is the baseline for `save.ts` and `src/adapters/**`.
- DESIGN rows in `feature-delta.md` still show `createAutosave(store, ...)`; ADR-0016 holds the amended signature.
- `tests/protected/S-010/` was not run locally; CI runs it on main. `ci:e2e` was not re-run at finalization.
- `des-verify-integrity` passed. `ci:lint`, `ci:typecheck`, `ci:test` (1124 passed) green.

## Migrated artifacts
None to copy: no `design/` directory exists. ADR-0016 and the architecture brief already live in `docs/product/architecture/`. `docs/feature/S-010/` is preserved as delivery history (as for S-009). Session artifacts removed: `.nwave/des/deliver-session.json` and `.nwave/des/des-task-active`.
