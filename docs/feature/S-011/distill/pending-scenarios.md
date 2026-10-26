# S-011 held-out scenarios (DISTILL, green hand-off)

The repo forbids committed failing, skipped, `.only`, `.todo` or `.fixme` tests (`scripts/guards/pr-guards.mjs` check 4; the test count may never fall), so the not-yet-passing scenarios are held out, as in S-006..S-010: they are `*.pending` files outside every glob (vitest `include`, `tsc include`, `oxlint .`, Playwright `testDir`). Nothing is skipped or weakened; they are simply not in the tree yet. Each is complete and was run (RED against the scaffolds, GREEN against a throwaway implementation, see `red-classification.md`). All of them are also lint- and type-clean once moved (checked with the throwaway).

| Held-out file | Destination (`git mv`, dropping `.pending`) | Cases | Goes green with |
|---|---|---|---|
| `pending/acceptance/inbox-reports.test.ts.pending` | `tests/acceptance/S-011/inbox-reports.test.ts` | 34 (14 goldens, 1 whole list, 1 default seed, 3 name ties, 5 Table-order rows, 3 prefix/order/count rules, 6 `RangeError` rows, 1 frozen inputs) | DELIVER step 3: `matchdayReports` in `src/domain/inbox.ts` |
| `pending/acceptance/inbox-oracle.test.ts.pending` | `tests/acceptance/S-011/inbox-oracle.test.ts` | 3 (seeds 1..100, 101..200, 201..300 x 8 clubs x 14 matchdays each) | step 3 |
| `pending/acceptance/inbox-time-travel.test.ts.pending` | `tests/acceptance/S-011/inbox-time-travel.test.ts` | 2 (1 fast-check property, 1 seed-31 walk) | step 3: `inboxOf` in `src/app/state.ts` |
| `pending/acceptance/inbox-navigation.test.ts.pending` | `tests/acceptance/S-011/inbox-navigation.test.ts` | 26 (25 RED, `focusPlan` case already passes); needs the `inbox` `Screen` kind | step 3: `ViewInbox`, `Screen` `inbox`, `HOME_RETURNING_KINDS` |
| `pending/acceptance/inbox-readonly.test.ts.pending` | `tests/acceptance/S-011/inbox-readonly.test.ts` | 2 (fast-check, 40 actions incl. `ViewInbox`) | step 3 |
| `pending/acceptance/inbox-source.test.ts.pending` | `tests/acceptance/S-011/inbox-source.test.ts` | 5 (1 already passes) | step 3, **after** step 1 (`RENDERERS`, no `switch (` in `main.ts`) and step 2 (`src/ui/score-line.ts`); also needs `src/ui/screens/inbox.ts`, the club-home button and zero `__SCAFFOLD__` in `src/` |
| `pending/amend-existing-tests.patch` | `git apply` in the step-3 commit (the same commit as the club-home "Inbox" button) | 8 amended files, 19 tests/lines changed each way (D8 list, replace never weaken) | step 3 |
| `pending/e2e/S-011-inbox.spec.ts.pending` | `tests/e2e/S-011-inbox.spec.ts` | 9 | step 4 (the "League position" line, plus the button, screen and CSS of step 3); in step 3 the message has two lines, so the spec cannot pass earlier |

Committed now (green before and after DELIVER, 17 cases): `tests/acceptance/S-011/inbox-reference-pinned.test.ts` (7: the seed-31 table, seed 20260, the three name ties, the oracle against `standings` over seeds 1..100, the longest-names seed), `inbox-save-unchanged.test.ts` (5: `SAVE_VERSION` still 1; an `inbox` screen encodes to the club home's text and the autosave decision is "no write"), `names-avoid-inbox-words.test.ts` (5), and the data/helpers `inbox-reference.ts` (DISCUSS goldens) and `inbox-oracle.ts` (independent oracle, no call to `standings`). Scaffolds committed (Mandate 7): `src/domain/inbox.ts` (types and a throwing `matchdayReports`, `__SCAFFOLD__`), and in `src/app/state.ts` `Action` gains `ViewInbox` with a throwing `viewInbox`, plus a throwing `inboxOf`; the `inbox` `Screen` kind is NOT added (it would break the exhaustive `render` switch of `main.ts`), so no UI path reaches the scaffolds.

Mechanics: move a file in the same commit as the code that makes it green; confirm RED first (the scaffolds throw), then GREEN. Never edit an assertion to fit the implementation; the goldens in `inbox-reference.ts` are pinned from DISCUSS, never re-pinned from DELIVER output. DELIVER step 3 must replace the three scaffolds (`matchdayReports`, `viewInbox`, `inboxOf`) and delete every `__SCAFFOLD__` marker. Completion check: zero `*.pending` files and `grep -r __SCAFFOLD__ src/` empty (the source test asserts the latter); delete `docs/feature/S-011/distill/pending/`. The e2e `.pending` imports `../acceptance/S-011/inbox-reference` and `../acceptance/S-010/save-golden` (both committed; do not move them).

## The D8 amend list (applied by the patch, never weakened)
Checked by grep over `tests/` (non-protected) for `five`, `club-actions`, `toHaveLength(5)` and the exact name lists; it equals DISCUSS D8 (8 files). `tests/e2e/S-010-club-home-regression.spec.ts` holds no button list (checked, no edit). The `five` hits in `tests/acceptance/S-004/formation.test.ts` and `S-005/selection.test.ts` are about midfielders (unrelated). Applied to the throwaway implementation, the 8 amended files and the S-010 regression ran 78 passed.

| File | Change |
|---|---|
| `tests/e2e/S-005-starting-xi.spec.ts` | title "third of six club home buttons ... before Play match, Table and Inbox"; list gains "Inbox" last |
| `tests/e2e/S-006-match.spec.ts` | title "fourth of six ... and all six are 44px or taller"; list gains "Inbox" |
| `tests/e2e/S-007-table.spec.ts` | title "six buttons in the order ... Table, Inbox"; list gains "Inbox"; the 44px loop covers all buttons already |
| `tests/e2e/S-007-club-home-regression.spec.ts` | `toHaveLength(6)`, message "exactly six club home buttons", both header comments restated (it holds no name list, so there is nothing to extend) |
| `tests/e2e/S-008-club-home-regression.spec.ts` | list gains "Inbox", header comment and test title say six |
| `tests/e2e/S-008-season.spec.ts` | the End of season list and the `.club-actions > *` children gain "Inbox" (`BUTTON:Inbox`); message says six |
| `tests/e2e/S-009-club-home-regression.spec.ts` | list gains "Inbox", header comment says six |
| `tests/e2e/S-009-end-of-season.spec.ts` | the End of season list and the `.club-actions > *` children gain "Inbox"; message says six |
