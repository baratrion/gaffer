# S-007 DISTILL: upstream issues

## U-1 (known, DESIGN D12 already plans the edit): two existing e2e assertions list the club-home buttons exactly
D17 adds a fifth button "Table" after "Play match", so two existing assertions become false. Found by running the full e2e suite against the DISTILL reference implementation: 111 pass, exactly these 2 fail (nothing else):
- `tests/e2e/S-005-starting-xi.spec.ts:173-177` ("Starting XI is the third of four club home buttons, after Squad and Tactics, before Play match") asserts `page.getByRole("button").allInnerTexts()` equals `["Squad", "Tactics", "Starting XI", "Play match"]`.
- `tests/e2e/S-006-match.spec.ts:145-149` ("Play match is the last of four club home buttons, ...") asserts the same four names in the same order.

Why DISTILL did not fix them: existing tests are never edited in DISTILL. Why it cannot be avoided: the protected scenario needs the "Table" button on the club home, and these two assertions list every button on that screen. DISCUSS D12 named both files and DEVOPS "Coexistence matrix" repeats it, so this is a planned edit, recorded here so DELIVER does not discover it by a red CI.

Proposed resolution (DELIVER step 04, same commit as the button): append `"Table"` to both expected lists and retitle the two tests ("...the fourth of five club home buttons, before Table" and "Table is the last of five club home buttons, after Squad, Tactics, Starting XI and Play match, and all five are 44px or taller"; the S-006 test also loops 44px over every button, which stays). The new held-out `S-007-table.spec.ts` test "The club home has five buttons in the order Squad, Tactics, Starting XI, Play match, Table, all 44px or taller" pins the new order. Each edit makes the assertion stricter (five exact names, in order), not weaker. With these two edits applied in the reference, the whole e2e suite passed (114 of 114).

## U-2 (known, DESIGN D12): three S-006 `match-navigation.test.ts` cases are superseded by the record
Against the reference, `tests/acceptance/S-006/match-navigation.test.ts` fails in exactly two cases (the full vitest run: 683 pass, 2 fail), and a third passes but now says something false:
- line 65-68 "when Sam taps Play match, then the match screen of that club is shown and nothing else in the game changes" asserts `toEqual({ ...state, screen: match })`; the state now also holds `results` (the first tap records, ADR-0012). FAILS.
- line 86-90 "when Sam taps Play match and then Back, then ... the whole state is what it was, picks included" asserts `toEqual(state)`; the state now holds `results`. FAILS.
- line 92-98 "...Play match, Back and Play match again, then the same match screen is shown (nothing is recorded, so the match is replayed)" still passes (the re-show is the same state), but its title claim "nothing is recorded" is false.
DISTILL restated all three with the record in the last section of the held-out `table-navigation.test.ts` ("the S-006 cases that D12 supersedes, restated with the record"): `toEqual({ ...state, screen, results: <the 4 expected entries> })`, `toEqual({ ...state, results })` after Back, and `second.results` is the very same array (`toBe`) on the re-show. DELIVER step 03 (same commit as the state change) replaces the three original cases in `match-navigation.test.ts` with equivalent restated assertions (or deletes them in favour of the S-007 ones; both are replace-not-weaken: the new ones assert the same fields plus the record). The formation, picks and league are still asserted untouched. With the three replaced in the reference, all 790 vitest cases passed.

## U-3 (informational, no action): Playwright's role counts cannot see a CSS `display` override, and Chromium here does not drop the roles
ADR-0013 Earned Trust 1 says the e2e role counts probe a `display` override on a table part ("Chromium drops table roles"). Two facts found in the reference run:
1. Playwright's `getByRole` uses its own role engine over the DOM (tag and attributes), which ignores CSS. So `toHaveCount` on rows, columnheaders, rowheaders and cells cannot detect a `display` override.
2. Even the browser's own accessibility tree (read through CDP, which DISTILL added as the `@environment-probe` test) kept 1 table, 9 rows, 8 columnheaders, 8 rowheaders and 56 cells with `display: block` on the rows, `display: flex` on the number cells or `display: grid` on the table (three seeded faults survived). In the Chromium bundled with this Playwright the roles are not dropped.
So the binding CSS rule "never set `display` on a table part" is enforced by no test in this Chromium, and the probe is kept for engines that do drop the roles (it passes today). A missing `scope` (an `<td>` Club cell) is caught: the rowheader count fails. Wording fix suggested for ADR-0013 Earned Trust 1 when it is next touched; not a DELIVER blocker.

## U-4 (informational, for DELIVER): adding the `table` case pushes two functions over oxlint's complexity limit
The reference first failed `ci:lint`: `sameScreen` reached cyclomatic complexity 16 (limit 15) once `table` joined the `clubId` group, and `back` reached 16 with a fifth screen kind in its home-returning condition. DESIGN D13 counted only `update` (13). The reference fixed both without disabling the rule: a small `sameClub(previous, next)` helper for the `clubId` group, and a `HOME_BACK` set of screen kinds in `back`. Any equivalent refactor works; the tests do not depend on it.

## U-5 (informational): `matchFor` must keep returning only `{ club, squad }` per side
The first reference version spread the whole side (including `xi`) into the `MatchView`. The held-out cases compare the whole `MatchView` before and after a formation or pick change (`toEqual`), so a view that leaks the live `xi` fails them. ADR-0012 option 3A already says "unchanged `MatchView`" (`home: { club, squad }`); this note only makes the consequence explicit.

## No contradictions
Wave-decision reconciliation across DISCUSS, DESIGN and DEVOPS found none. DISCUSS D12 and the DEVOPS coexistence matrix already name the S-005/S-006 amendments, so U-1 and U-2 are confirmations with exact lines, not new disagreements.
