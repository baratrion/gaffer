# S-011 held-out scenarios (DISTILL, green hand-off)

The repo forbids committed failing, skipped, `.only`, `.todo` or `.fixme` tests (`scripts/guards/pr-guards.mjs` check 4; the test count may never fall), so the not-yet-passing scenarios are held out, as in S-006..S-010: they are `*.pending` files outside every glob (vitest `include`, `tsc include`, `oxlint .`, Playwright `testDir`). Nothing is skipped or weakened; they are simply not in the tree yet. Each is complete, and was run (RED against the scaffolds, GREEN against a throwaway implementation, see `red-classification.md`).

| Held-out file | Destination (`git mv`, dropping `.pending`) | Cases | Goes green with |
|---|---|---|---|
| `pending/acceptance/inbox-reports.test.ts.pending` | `tests/acceptance/S-011/inbox-reports.test.ts` | 20 (seed-31 goldens, name ties, seed 20260, literal logs, RangeError x6, frozen inputs, 2 fast-check properties, the seeds 1..300 oracle sweep) | DELIVER commit 3: `matchdayReports` in `src/domain/inbox.ts` (replace the scaffold) |
| `pending/acceptance/inbox-navigation.test.ts.pending` | `tests/acceptance/S-011/inbox-navigation.test.ts` | 24 (22 RED today; 2 already pass, see red-classification) | commit 3: `Screen` `inbox`, `ViewInbox`, `Back`, `inboxOf` in `src/app/state.ts` |
| `pending/acceptance/inbox-source.test.ts.pending` | `tests/acceptance/S-011/inbox-source.test.ts` | 7 source checks | its checks go green as the files land: `inbox.ts` (commit 3), `score-line.ts` + `match.ts` import (commit 2), `RENDERERS` in `main.ts` (commit 1), `renderInbox` and the club-home button (commit 3) |
| `pending/e2e/S-011-inbox.spec.ts.pending` | `tests/e2e/S-011-inbox.spec.ts` | 11 | commit 3 (screen, button, CSS, wiring) for all but the position lines, which need commit 4 (slice 02) |
| `pending/amend-existing-tests.patch` | `git apply` in the commit that adds the club-home button | 8 files, 17 lines | DELIVER duty (below) |

Committed now (green before and after DELIVER): `tests/acceptance/S-011/{inbox-inputs-pinned,names-avoid-inbox-words}.test.ts` (15 cases), data/helpers `inbox-reference.ts` and `inbox-oracle.ts`, `tests/e2e/S-011-club-home-regression.spec.ts` (1 test). Scaffold committed (Mandate 7): `src/domain/inbox.ts` (`matchdayReports` throws, carries `__SCAFFOLD__`). `src/app/state.ts`, `main.ts` and the UI are not scaffolded: a new `Screen` kind or `Action` would break the typecheck of `render` and `HANDLERS`; the state-level cases were run RED against a temporary, uncommitted throwing scaffold (see `red-classification.md`).

## DELIVER duty: the amended five-button lists (D8)

No test that passes today may be edited here, so the eight D8 amendments (each exact five-button list gains `"Inbox"` last, titles and messages say six; replaced, never weakened) are in `pending/amend-existing-tests.patch`, produced by editing the files and `git diff`, then reverting, and checked with `git apply --check` against the current tree. Apply it with `git apply docs/feature/S-011/distill/pending/amend-existing-tests.patch` in the same commit that adds the "Inbox" button to `club-home.ts`; those eight specs go red from that commit on without it. The files and lines:

| File | What changes |
|---|---|
| `tests/e2e/S-005-starting-xi.spec.ts` | title (line 173) "third of five" to "third of six"; list (176) gains `"Inbox"` |
| `tests/e2e/S-006-match.spec.ts` | title (145) "fourth of five ... all five" to six; list (148) |
| `tests/e2e/S-007-table.spec.ts` | title (225) six buttons, "Table, Inbox"; list (228) |
| `tests/e2e/S-007-club-home-regression.spec.ts` | header (5) and `toHaveLength(6)` with the message "exactly six club home buttons" (24) |
| `tests/e2e/S-008-club-home-regression.spec.ts` | header (3), title (11) "Six buttons ...", list (25) |
| `tests/e2e/S-008-season.spec.ts` | message and list (252), `.club-actions` children (254) gain `BUTTON:Inbox` |
| `tests/e2e/S-009-club-home-regression.spec.ts` | header (3), list (46) |
| `tests/e2e/S-009-end-of-season.spec.ts` | message and list (137), `.club-actions` children (139) |

The grep for "five", `toHaveLength(5)`, `club-actions` and the exact lists over `tests/` outside `tests/protected/` finds exactly these eight files plus unrelated hits (S-004 formation counts, S-005 selection text, S-008 "five behind"). `tests/e2e/S-010-club-home-regression.spec.ts` holds no button list or count: no edit. `tests/protected/` was not opened.

Mechanics: move a file in the same commit as the code that makes it green; confirm RED first (the scaffold throws or the source is missing), then GREEN. Never edit an assertion to fit the implementation; the goldens in `inbox-reference.ts` are DISCUSS data, pinned from the existing generator (`inbox-inputs-pinned`), never re-pinned from DELIVER output. Zero `*.pending` files and zero `__SCAFFOLD__` markers (`grep -r __SCAFFOLD__ src/`) is the completion check; then delete `docs/feature/S-011/distill/pending/`. The e2e `.pending` imports `../acceptance/S-011/inbox-reference` (committed; do not move it); the acceptance files import `./inbox-oracle`, `./inbox-reference` and `../S-010/save-world` (all committed). Suggested order, DESIGN DD9: (1) `RENDERERS` lookup, then `inbox-source` cases for it go green last; (2) `score-line.ts` extraction; (3) `inbox.ts`, `state.ts`, screen, button, CSS and wiring with `inbox-reports`, `inbox-navigation`, the e2e and the amend patch; (4) the "League position" line.
