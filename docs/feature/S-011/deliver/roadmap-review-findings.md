# Roadmap review findings (Sentinel, haiku) and required revisions

Edit `docs/feature/S-011/deliver/roadmap.json` in place; keep its structure.

- **B1 (blocker):** the project rule is that no test or assertion may be deleted, skipped or weakened (counts only go up). Remove every instruction in the final close-out step and in `implementation_notes` that drops the call-count and indexOf checks, drops `it()` cases from `inbox-source.test.ts.pending`, or trims storage/club-home cases (trim lever 1). All 7 `it()` cases and all assertions move in unchanged. The line cap is handled by shipping across ticks instead: if the branch nears ~1200 changed lines (code and tests, docs excluded) the tick finishes the current step green, commits and stops, and the next tick resumes at the next step. Trim levers may only remove duplication that keeps every test and assertion.
- **F1:** the RENDERERS lookup step must not claim the inbox-source RENDERERS case goes green there (it needs the `inbox` entry added in the navigation/screen step). Verify it with the existing suite plus lint complexity; the file goes green by the close-out step.
- **F3:** the club-home button step's `test_file` is `tests/e2e/S-011-club-home-regression.spec.ts`; note the first pending e2e case is run locally.
- **F4:** remove the wrong `@walking_skeleton` clause from the close-out step.
- **F5:** add criteria to the navigation/screen step for the untraced behaviours: Back then Inbox again is the same; a fresh club home's save text; New game gives an empty Inbox; focusPlan heading focus on arrive and leave.
- **F6:** use one threshold wording everywhere (~1200 changed lines, docs excluded).
- **F7:** replace the placeholder `scenario_name` in the navigation/screen step with a real test title from `distill/pending/acceptance/inbox-navigation.test.ts.pending`.

Afterwards run `des-roadmap validate docs/feature/S-011/deliver/roadmap.json` if you have Bash. Keep `validation.status` "pending".
