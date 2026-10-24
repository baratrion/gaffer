# S-007 open questions and review dispositions

Final Wave Review Gate (DISTILL, iteration 1). Verdicts: DISCUSS approved; DESIGN conditionally approved; DEVOPS rejected_pending_revisions (blocker is inherited owner-locked infrastructure); DISTILL rejected_pending_revisions (title wording).

## Accepted into DELIVER scope
- **DESIGN F-1 / DISTILL U-3**: ADR-0013 Earned Trust 1 is wrong: Playwright role counts cannot detect a `display` override on a table part. DELIVER must not set `display` on any table part and should add an e2e probe reading `getComputedStyle(el).display` of table, thead, tbody, tr, th, td. The ADR wording is to be corrected by the next design pass.
- **DESIGN F-2 / U-4**: `sameScreen` and `back` reach cyclomatic complexity 16 once `table` joins; refactor with a shared club comparison and a set of home-returning screen kinds.
- **DESIGN F-3, F-4, F-5, F-6**: wording and classification notes (matchFor fallback is never reached by `update`; main.ts is the imperative shell; renderTable's restriction is by parameter type; the fallback property proves record lookup only, the seed-31 golden is the independent check).
- **DISTILL L8**: tighten the committed club-home regression to exactly five buttons in the same commit as the Table button.
- **DISTILL L13 / DEVOPS F10**: protected spec filename is referenced inconsistently in the feature-delta; not edited (tests/protected is not opened in this mode).
- **U-1, U-2 (upstream-issues.md)**: amend the two exact-four-button e2e assertions and replace the two S-006 `match-navigation` cases in DELIVER.

## Not changed, with reason
- **DISTILL B1 (technical words in titles)**: titles follow the S-003..S-006 convention (domain-level describe/it titles with `RangeError`-style guards). Kept.
- **DISTILL H1, H2, H5**: error share, walking-skeleton tag count and scenario volume are judgement calls carried over from the S-004..S-006 precedent; the DELIVER diff cap (~1200 lines) governs. Held-out files are not part of the diff until moved.
- **DISTILL H4**: seeds 1..100 in the K2 loop keep ci:test fast; the property over arbitrary seeds covers the rest.
- **DEVOPS F1-F9, F11-F13**: inherited, owner-locked (.github/); no security scan, deploy not gated on ci, smoke uses a fixed sleep. Recorded for the owner; not changeable by the factory.
