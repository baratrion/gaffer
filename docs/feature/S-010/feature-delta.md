# S-010: Save and continue my season

## Wave: DISCUSS

Lean, unattended, revision 3 (after `nw-product-owner-reviewer` cycles 1 and 2, see Peer review; DESIGN's ADR-0016 already exists and names the storage key "gaffer.save"). Reuses `discuss/journey.md` and `slices/slice-01..02`. North star: "manage one fictional club through one short season, on a phone browser, start to finish". Vision: 5-minute sessions on the bus. S-008 made a season of 14 matchdays and S-009 closed it with "End of season" and "Play again", but S-007, S-008 and S-009 all say "Results are kept until the page is reloaded": a season takes more than one sitting, and a reload, a closed tab or a phone that drops the page loses it. scope.md IN says: "Save and continue in the browser (localStorage)". S-009's DISCUSS named save and continue as next. The smallest next visible increment: the game saves itself after every tap that changes it, and after a reload the title screen offers "Continue", which lands on the saved club's home with everything as it was. Narrowed by scope.md precedence (ship less): several save slots, a save list, a "Delete save" button, export or import, sync, and restoring the exact screen are cut. Feature type: user-facing. UX depth: lightweight. Walking skeleton: no (brownfield, extends S-001..S-009). JTBD: yes, new job J-10. No DIVERGE artifact (accepted as lean, as for S-002..S-009).

### Wave: DISCUSS / [REF] Scope Assessment
PASS: 2 small user stories with 11 scenarios in total (US-1 5, US-2 6), 1 roadmap story, one title button, one action, one storage seam, one lookup refactor and one demonstrable outcome ("I reload and carry on where I was"). One new seam: browser storage, behind a pure save format and a thin shell adapter (ADR-0003 functional core, imperative shell). No new screen. The 2 carpaccio slices are ordered DELIVER commits of one story (S-010), shipped in ONE merge: slice 01's commits come first and slice 02's follow on the same branch. There is no separate release of slice 01, so main never gets a "Continue" that drops the player's formation or Starting XI, or a title screen that a damaged save or full storage can break. About 1 to 1.5 days. Integration points: app state (formation, XI, results), title screen, club home, browser storage, the address's seed: 5, at the limit, not over it. No oversized signal: slots, deletion, export and sync are cut (Out-of-scope).

Line budget (changed lines, code plus tests; file names are indicative, and DESIGN names the files). The one hard cap is the 1200-line PR guard.

| File | Kind | Lines |
|---|---|---|
| Save format: pure encode and decode with a version number and strict validation (for example `src/app/save.ts`, new) | code | 90 |
| Storage adapter and save-after-dispatch wiring in the shell (`src/main.ts` or a small shell module) | code | 35 |
| Continue: building the restored state, plus the refactor of `update` and the `render` switch to lookups that S-009 DESIGN's Open questions require before the next action (`src/app/state.ts`, `src/main.ts`; the `render` lookup was deferred by DESIGN D5, ADR-0016 Decision 4) | code | 45 |
| `src/ui/screens/title.ts` ("Continue" above "New game"), `src/ui/styles.css` | code | 15 |
| `tests/acceptance/S-010/*.test.ts` (round trip, strict decode, unreadable inputs, the save triggers, the D4 timing, D5 seed, names check) | tests | 220 |
| `tests/e2e/S-010-save-continue.spec.ts` (what protected does not cover: D4 timing including "Play again", D5, damaged and incompatible saves, blocked storage, full storage at load and during play) | tests | 160 |
| Amended non-protected S-008 e2e and S-009 acceptance test titles and assertion (D7) | tests | 15 |
| **DELIVER total** (code 185, tests 395) | code and tests | **580** |
| `tests/protected/S-010/*.spec.ts` (written in the plan run, outside DELIVER; estimate) | tests | 250 |
| **Grand total** (with protected) | code and tests | **830** (DESIGN re-estimates DELIVER at about 863, so about 1,113 with protected; that replaces 580 and 830) |

### Wave: DISCUSS / [REF] Persona
Sam, 34, a lapsed Championship Manager fan. He plays on the bus, one-handed, on a mid-range Android phone 390px wide, with 5 minutes to spare (persona from `docs/feature/S-001/feature-delta.md`). A season is 14 matches; he plays two or three per trip. His browser drops the tab between trips, and today that wipes the season.

### Wave: DISCUSS / [REF] JTBD one-liner
When I come back to the game after a break, I want to pick up my season where I left it, so that my club and my results carry on across short sessions. (Recorded as J-10 `carry-on-my-season` in `docs/product/jobs.yaml`. It makes J-08 "play out my season" possible across visits.)

### Wave: DISCUSS / [REF] Glossary
- **Saved game**: what the browser keeps for the player between visits: the league's seed, the managed club, the formation, the Starting XI (including the player's own picks) and the recorded results. It does not hold which screen was open. There is one saved game per browser.
- **Saving tap**: a tap that changes the saved game: picking the club, choosing a formation, picking a player for a Starting XI slot, and "Play match". Navigation ("Squad", "Table", "Back", etc.) changes nothing, so it does not save.
- **Continue**: the title-screen button that restores the saved game and lands on the saved club's home.
- **Unreadable save**: stored data that is not a complete, valid saved game of this version: damaged, from an incompatible older version, or inconsistent with its own league. It counts as no saved game.
- **Storage blocked**: the browser refuses to read and write site storage (a privacy setting or a private mode); the roadmap outcome calls it "unavailable".
- **Storage full**: the browser reads and removes site storage entries but refuses writes (quota exceeded). It may be full when the game loads (a **degraded** store, as is a blocked one) or become full during play.
- **Degraded store**: storage that is blocked or full when the game loads. There is no "Continue". The game makes a best-effort, silent removal of the stored saved game at load and on each saving tap, so a later visit never finds an older save. Residual: when access is blocked entirely nothing can be removed, so a save that existed before is offered again once access returns.
- **Failed save**: a saving tap whose write is refused. The game removes the stored saved game (best effort, silently), so "Continue" never offers a state older than the last one played. The exceptions are when the removal also fails or storage is blocked entirely, and several tabs open at once (out of scope). Later saving taps try again.
- **Uninterrupted season**: the same seed, club and choices played in one visit without a reload. A continued season must equal it.
- **Recorded result**, **Standings**, **Table row**, **Untouched tactics**, **Score line**, **Next matchday**, **End of season screen**: as in S-006..S-009.

### Wave: DISCUSS / [REF] Locked decisions
- D1 Automatic save, no Save button: once a club has been picked, the game is saved in the browser automatically after every saving tap: picking the club, choosing a formation, picking a Starting XI player, and "Play match". Saved: the league's seed, the managed club, the formation, the Starting XI (including the player's own picks) and the recorded results. Not saved: which screen was open.
- D2 Title screen: when a saved game exists, the title screen shows a button named exactly "Continue" (44px or taller) above "New game". The title's h1 ("Gaffer") stays, is focused on load, and is the only h1. When no saved game exists (first visit, or a fresh browser) there is no "Continue" button and the title is as before.
- D3 Continue lands on the club home of the saved club, with focus on its heading (the club's name). Everything is as it was before the reload: the Table screen shows the same rows (the same text in every cell), Tactics has the saved formation checked, the Starting XI screen lists the same 11 slot texts, and when N matches had been played the next "Play match" plays matchday N+1. A finished season shows "End of season", not "Play match", and the End of season screen shows the same "Final position" and "Top scorer" lines. The rest of the season played after Continue equals the uninterrupted season (the same match screens, the same table): saving and continuing changes nothing in the game.
- D4 New game with a saved game present: "New game" still starts a fresh game from the address's seed exactly as before: after picking a club the table is all zero in A to Z order, Tactics has 4-4-2 checked, the XI is the automatic one, and the next "Play match" is "Matchday 1". Tapping "New game" or "Play again" does not remove the saved game by itself. The pick-a-club screen (no club yet) writes nothing; the club-choice tap writes, and that replaces the save. This replacement timing is a rule of this version only. Accepted risk (J-10's anxiety, "tapping New game by mistake and losing the season"): "New game" followed by a club pick replaces the saved game, with no confirm dialog and no undo. The pick-a-club screen has no "Back" to the title, so the only way back to "Continue" after a mistaken "New game" is a reload before picking a club. Accepted to ship less (no dialog, no slots); recorded for a later story if the owner's demo shows it bites.
- D5 One save slot: Continue resumes the saved game whatever "?seed=" the address holds now, because the save carries its own seed. After Continue, "Play again" keeps the saved game's league (S-009: "the same seed"). Not protected-tested; unit and e2e tested.
- D6 Safety:
  - An unreadable save (damaged, or from an incompatible older version) gives no "Continue" button; the game plays as before and logs no console error.
  - When browser storage is blocked, or full, when the game loads (degraded), there is no "Continue" button (a readable older save is then not offered) and the game plays as before without saving. The game also makes a best-effort, silent removal of the stored saved game at load and on each saving tap, so a later visit never finds an older save. Residual: when access to storage is blocked entirely, nothing can be removed, so a save that existed before is offered again once access returns.
  - When a save fails during play, the stored saved game is removed (best effort, silently), so that "Continue" never offers a state older than the last one played; later saving taps try to save again. The guarantee has exceptions: the removal also fails, storage is blocked entirely, or several tabs are open at once.
  - Accepted exception (several tabs, out of scope): a tab still showing the title can offer a stale game after another tab played on. Its "Continue" restores the older state, and its next saving tap overwrites the newer save.
  - A failed save never interrupts play and logs no console error.
- D7 Amendment: S-007, S-008 and S-009 said "Results are kept until the page is reloaded". From S-010 on, a reload keeps the saved game, reachable through "Continue". Their durable lists are unchanged.
  - Protected scenarios: they are not all one fresh page per visit. Several reuse one page across visits (S-001 pick-club, S-002 squad, S-004 tactics), so from S-010 on a later visit can meet a title that offers "Continue". They still pass because each visit taps the exact "New game" (`exact: true` or the `button(page, "New game")` helper), which starts fresh from the address's seed (D4). The DoD runs them on the branch with the save in place.
  - S-009's "Play again ... nothing of the old season remains" holds once a club is picked. Until then, a reload's "Continue" still offers the finished season (D4). E2e intent: finish a season, tap "Play again", reload; "Continue" lands on the finished season's club home with "End of season".
  - Non-protected tests to amend (replaced, never weakened; DISTILL fixes the final list):
    - `tests/e2e/S-008-season.spec.ts`, the test "Reloading the page after two matches shows the title screen again ... (the season is lost, there is no save yet)". Its assertions stay true (New game starts fresh). Its title is reworded, and it gains a check that "Continue" is offered after the reload.
    - `tests/acceptance/S-009/existing-navigation-unchanged.test.ts` (about line 74), the test "... when the title is shown again and New game is tapped (a reload) ...". Only the title is reworded, since a reload no longer equals a title plus "New game"; the assertion is unchanged.
- D8 Protected pin list (written later by the plan run's protected-scenarios step; each must fail on today's app, which has no "Continue"):
  - P1: in a fresh browser the title has no "Continue". After "New game", picking a club and reloading, the title shows "Continue" (44px or taller) and "New game", with exactly one h1.
  - P2: at `?seed=31`, play 2 matches and read the Table; reload; tap "Continue". The h1 is the club's name and has focus, and the Table is identical. "Play match" shows "Matchday 3". That match screen, and the table after it, equal those of a fresh browser that plays 3 matches with the same seed and club without reloading.
  - P3: choose 4-3-3 in Tactics and swap a Starting XI slot to a non-starter; reload; tap "Continue". Tactics has 4-3-3 checked, and Starting XI shows the same 11 texts.
  - P4: with a saved game, reload. After first asserting that "Continue" is offered, tap "New game". The same club, once picked, shows an all-zero table in A to Z order and 4-4-2 checked, and "Play match" shows "Matchday 1".
  - P5: play all 14 matchdays and read the End of season lines; reload; tap "Continue". The club home shows "End of season" and no "Play match", and the End of season screen shows the same lines.
  - In all of them: no horizontal scroll at 390px and no console errors. Locators use `exact: true` ("Continue", "New game", the h1).
- D9 Durable (holds in every later version): with a saved game the title offers "Continue" (exact name), and without one it does not. "Continue" restores the saved club with its formation, Starting XI, recorded results and next matchday. "New game" always starts a fresh game. Version-only: Continue lands on the club home (a later version may restore the last screen); D4's replacement timing. Version-scoped exceptions to D3 and D9: a later save-version bump, or a model change that invalidates saved results, either makes saved games unreadable (no "Continue") or lets an old save continue with its recorded results (results already played are not replayed under the new model).
- D10 Phone first and regression: buttons 44px or taller, no horizontal scroll at 390px, no console errors, text through `el()`/`textContent` (ADR-0002), focus on the new h1 after every navigation (ADR-0008). Every S-001..S-009 protected scenario stays green. Deterministic game logic is unaffected: nothing in the save uses wall-clock time or randomness, and nothing in `src/domain/` touches storage.

### Wave: DISCUSS / [REF] Story map and priority
Backbone: **open the game (title: Continue or New game)**, pick club, club home, squad, tactics, starting XI, play next match, see table, end of season, play again. Walking skeleton: the existing S-001..S-009 loop. This story makes it span visits. One release; two thin slices, which are ordered DELIVER commits of one story shipped in ONE merge (no separate release of slice 01):
1. `slices/slice-01-save-and-continue.md` (US-1): automatic save of the seed, club and results; "Continue" on the title, whatever "?seed=" the address holds; land on the club home with the same table, the next matchday and a finished season's End of season; "New game" unaffected. Value 5 x urgency 5 / effort 2 = 12.5. It comes first because it is the season-across-sessions promise itself.
2. `slices/slice-02-team-sheet-and-safe-load.md` (US-2): the formation and Starting XI are saved and restored. A damaged or incompatible save, blocked storage, and storage full at load or during play never show a stale "Continue" or an error. 5 x 4 / 1.5 = 13.3, but it depends on slice 01. Without it a continued season can differ from the uninterrupted one (D3), and a damaged save could break the title screen.

Priority rationale: a 14-matchday season does not fit a 5-minute session, so without a save the brief's north star ("start to finish") only works for a player who never closes the tab. Every later story (inbox, commentary, a next season) adds content to a season that a reload still wipes. Rejected alternatives:
- Inbox or news first: more to read per match, but still lost on reload; scope lists it, and it comes later.
- Commentary or stats first: they deepen one match, not the season across sessions.
- A next season with the club carried over first: it needs a saved season to carry, and S-009 already gives "Play again".
- A manual "Save" button: an extra chore, and easy to forget on a bus stop; the automatic save is narrower for the player.
- Restoring the exact last screen: more state, more cases; the club home is one tap from every screen.

Slice-to-clause map (one roadmap outcome, two slices, one merge):

| Outcome clause | Slice | Durable or version-only |
|---|---|---|
| Automatic save after the saving taps, no Save button; screen not saved | 01 (club pick, Play match), 02 (formation, XI pick) | durable (the restore it enables) |
| "Continue" (44px or taller) above "New game" only with a saved game; h1 "Gaffer" focused, one h1 | 01 | durable (the offer, exact name) |
| Continue lands on the club home, heading focused | 01 | version-only (landing) |
| Same Table, next "Matchday N+1", finished season's "End of season" with the same lines | 01 | durable |
| Saved formation checked, same 11 Starting XI texts | 02 | durable |
| Continued season equals the uninterrupted season | 01 (untouched tactics), 02 (any choices) | durable |
| "New game" starts fresh from the address's seed; the save is replaced once a club is picked ("Play again" too) | 01 | durable (fresh); version-only (timing) |
| Continue ignores the address's "?seed=" | 01 | durable (one saved game carries its seed) |
| Damaged or incompatible save, blocked storage, storage full at load: no "Continue", play as before, no console error | 02 | durable |
| A failed save during play removes the stored game; later taps retry; play never interrupted | 02 | durable |
| No horizontal scroll at 390px, no console errors | 01, 02 | durable |

### Wave: DISCUSS / [REF] User stories
Fixtures from the real generator, read from `docs/feature/S-008/discuss/reference-season.md` and S-009's `discuss/reference-season-end.md` (untouched tactics: every side plays the automatic 4-4-2). At `?seed=31` "Netherwold Borough" (1st in the "Clubs" list) plays "Matchday 1": "Netherwold Borough 1–2 Marlbrook Athletic"; "Matchday 2": "Rushmoor Heath Albion 2–1 Netherwold Borough"; "Matchday 3": "Netherwold Borough 2–1 Oakhampton Rise Borough". After matchday 2 the table reads, top to bottom: Tarnbeck Borough (Pts 4, GD "+4"), Oakhampton Rise Borough (4, "+2"), Marlbrook Athletic (4, "+1"), Juniper Hollow United (3, "0"), Rushmoor Heath Albion (3, "-3"), Fennimore Town (2, "0"), Valebridge Albion (1, "-2") and Netherwold Borough (P 2, W 0, D 0, L 2, GD "-2", Pts 0). These table figures were hand-derived from the reference season's matchdays 1 and 2 and checked in review (cycle 1); DISTILL confirms them with the domain code. The season ends with "Final position 3rd" and "Top scorer Garrick Thistlewood (5 goals)". The golden pick (S-006..S-009): in the Starting XI, slot "MF Calder Redfern 15" gets "Kestrel Northcott 6" (each number is the player's overall, as the S-005 screens print it). The default seed 20260 (`?seed=abc`) is a different league; its "Clubs" list includes "Oakhampton Rise Borough" and "Valebridge Town".

Named storage fixtures, for the e2e. The key is "gaffer.save" (ADR-0016).
- **Seed-31 save text**: the exact text the game stores under "gaffer.save" after "New game", "Netherwold Borough" and 2 x ("Play match", "Back") at `?seed=31`. DISTILL computes it once with the real generator and pins it as a golden.
- **Damaged save**: the seed-31 save text cut after its first 100 characters.
- **Incompatible save**: the seed-31 save text with its version number set to 0.
- **Blocked storage**: every read and write of site storage throws (as a privacy setting does).
- **Full at load**: reads and removals work, and every write throws a quota error, from before load. The test can make storage writable again before a reload.
- **Full mid-session**: after matchday 2 has been saved, only writes to the key "gaffer.save" throw a quota error. Other keys, such as the probe key, still write, so at the reload the store works.

#### US-1: Continue my saved season
**Problem:** Sam plays two matches on the morning bus. At lunch he opens the game again, and his browser has dropped the tab: he gets the title screen and "New game", and his season is gone. To get back to matchday 3 he would have to replay matchdays 1 and 2 with the same choices, and he has not written them down. A 14-matchday season cannot be finished in 5-minute sessions.
**job_id:** J-10

##### Elevator Pitch
- Before: after a reload the title shows only "New game"; Netherwold Borough's two results, 8th place and the next fixture are gone.
- After: Sam opens `/gaffer/?seed=31` again and taps "Continue" above "New game". He sees the club home "Netherwold Borough" (focused); "Table" shows Netherwold Borough 8th at P 2, Pts 0, and "Play match" shows "Matchday 3", "Netherwold Borough 2–1 Oakhampton Rise Borough".
- Decision enabled: do I play the next matchday now, or change my team first, knowing my season is still there?

**Domain examples**
1. `?seed=31`, "New game", "Netherwold Borough", untouched tactics, "Play match", "Back", "Play match", "Back" (the match screens read "Matchday 1" and "Matchday 2", as above). He reloads, and the title shows "Continue" (44px or taller) above "New game", with "Gaffer" focused. He taps "Continue": "Netherwold Borough" focused, and "Table" shows the 8 rows above, the same text in every cell. "Back", "Play match": "Matchday 3", "Netherwold Borough 2–1 Oakhampton Rise Borough", the same as in a browser that never reloaded.
2. `?seed=31`, all 14 matchdays played. "End of season" reads "Final position 3rd" and "Top scorer Garrick Thistlewood (5 goals)". He reloads and taps "Continue": the club home shows "End of season" and no "Play match", and "End of season" reads the same two lines.
3. With that saved game, Sam taps "New game" by mistake and sees the pick-a-club screen. He reloads without picking a club: "Continue" is still there, and it still lands on Netherwold Borough with two matches played (D4). Had he picked "Netherwold Borough", the table would read all zero in A to Z order, Tactics "4-4-2", and "Play match" "Matchday 1", "Netherwold Borough 1–2 Marlbrook Athletic". After one more reload, "Continue" would land in that new game.
4. Saved at `?seed=31` with Netherwold Borough after 2 matches, Sam opens a shared link `/gaffer/?seed=abc`. "Continue" still lands on "Netherwold Borough", and "Play match" is "Matchday 3", "Netherwold Borough 2–1 Oakhampton Rise Borough". "New game" instead lists the seed-20260 clubs ("Oakhampton Rise Borough", "Valebridge Town", ...).

**Acceptance criteria (embedded UAT)**
```gherkin
Scenario: The title offers Continue once a club has been picked
  Given Sam opens "/gaffer/" in a fresh browser
  Then the title has the h1 "Gaffer", focused, a button named "New game" and no button named "Continue"
  When Sam taps "New game", taps "Netherwold Borough" and reloads the page
  Then the title has a button named "Continue", 44px or taller, above the button named "New game"
  And "Gaffer" is the only h1 and has focus

Scenario: Continue picks up the season at the next matchday with the same table
  Given Sam at "?seed=31" managing "Netherwold Borough" has tapped "Play match" and "Back" twice, tapped "Table" and read its rows
  And a second fresh browser at "?seed=31" has played 3 matches with "Netherwold Borough" without reloading, reading its third match screen and the table after it
  When Sam reloads the page and taps "Continue"
  Then the heading "Netherwold Borough" is the only h1 and has focus
  When Sam taps "Table"
  Then every row reads the same, cell for cell, as before the reload
  When Sam taps "Back" and "Play match"
  Then the screen title is "Matchday 3" and the score line and "Goals" list equal the second browser's third match screen
  When Sam taps "Back" and "Table"
  Then the table equals the second browser's table, cell for cell

Scenario: A finished season continues to its End of season
  Given Sam at "?seed=31" managing "Netherwold Borough" has played all 14 matches and read the End of season lines
  When Sam reloads the page and taps "Continue"
  Then the club home has a button named "End of season" and no button named "Play match"
  When Sam taps "End of season"
  Then the "Final position" and "Top scorer" lines read the same as before the reload

Scenario: New game starts fresh even when a saved game exists
  Given Sam at "?seed=31" managing "Netherwold Borough" has chosen "4-3-3" and played 2 matches, and has reloaded the page
  And the title offers "Continue"
  When Sam taps "New game" and "Netherwold Borough"
  Then "Table" shows every row at P 0, W 0, D 0, L 0, GD 0 and Pts 0, in A to Z order of club name
  And "Tactics" has "4-4-2" checked
  And "Play match" shows "Matchday 1"

Scenario: Continue resumes the saved game whatever seed the address holds
  Given Sam has a saved game of "Netherwold Borough" at "?seed=31" with 2 matches played
  When Sam opens "/gaffer/?seed=abc" and taps "Continue"
  Then the heading is "Netherwold Borough"
  And "Play match" shows "Matchday 3" and "Netherwold Borough 2–1 Oakhampton Rise Borough"
```
Notes: scenarios 1 to 4 are pins P1, P2, P5 and P4. Scenario 5 (D5) is e2e and unit tested, not pinned. D4's replacement timing (example 3, and "Play again" then a reload, D7) is version-only: it is tested by e2e and unit tests and is not pinned. Unit: the saving taps write and navigation does not; "Continue" yields a club-home state whose formation, XI and results equal the saved ones; `nextMatchday` after Continue is N+1, and `undefined` after 14; "New game" ignores the saved game.

**Outcome KPI:** K1, K2 (below).
**Technical notes (for DESIGN, not AC):**
- The save lives outside `GameState`. `tests/acceptance/S-009/existing-navigation-unchanged.test.ts` asserts that the state holds only `league`, `screen`, `formation`, `xi` and `results`.
- The saved game is a projection of the state. It needs the managed club, which today exists only as the screen's `clubId`. So the shell writes only while the screen carries a club, and compares the encoded projection before and after each dispatch, writing only when it changed. That gives D1's triggers and D4's timing ("New game" and "Play again" reach `pickClub`, which has no club) without new state.
- "Continue" needs a new action or a shell-built state. S-009 DESIGN's Open questions: `update` is at complexity 14 of 15 and the `main.ts` `render` switch is at 15 of 15, so the next action or screen must first move both to lookups. That refactor is budgeted here.
- DESIGN records the persistence decision (storage key, format version, validation, shell boundary) in a new ADR. Depends on S-007, S-008, S-009.

#### US-2: Keep my team sheet, and never break the game
**Problem:** Sam's season is more than results: he plays 4-3-3 and starts Kestrel Northcott over Calder Redfern. If "Continue" brought back his results but reset his team to 4-4-2 and the automatic eleven, his next match would be played by a side he never picked, without him noticing. And a saved game must never get in his way: a damaged save, a browser that blocks storage or a full phone must not break the title screen or the match.
**job_id:** J-10

##### Elevator Pitch
- Before: today a reload loses his 4-3-3 and his pick with the rest of the season; he must tap through "Tactics" and "Starting XI" again from memory.
- After: Sam taps "Continue", then "Tactics", and sees "4-3-3" checked. "Starting XI" lists his 11, including "MF Kestrel Northcott 6", in the same order as before the reload.
- Decision enabled: do I keep my team sheet for the next match, or change it, knowing what is actually going out?

**Domain examples**
1. `?seed=31`, "Netherwold Borough": "Tactics", "4-3-3", "Back", "Starting XI". He taps "MF Calder Redfern 15", picks "Kestrel Northcott 6" and reads the 11. He reloads and taps "Continue": "Tactics" has "4-3-3" checked, and "Starting XI" reads the same 11 texts in the same order. His next "Play match" equals an uninterrupted browser's match with the same choices.
2. The browser holds the damaged save (the seed-31 save text cut after 100 characters), or the incompatible save (version 0): the title has no "Continue" and works as on a first visit, with no console error. After "New game", "Netherwold Borough" and "Play match", a good save replaces it, and a reload offers "Continue" with "Matchday 2" next.
3. Storage problems, at `?seed=31`:
   - Blocked (a privacy setting): no "Continue". Sam plays matchdays 1 and 2, and every "Table" row reads P 2. No console error. A reload loses the season, as before S-010.
   - Full when the game loads: no "Continue", even with a readable save stored, and the game plays without saving. The stored save is removed (best effort), so once storage is writable again a reload still shows no "Continue" rather than the older game.
   - Fills up during play: saved after matchday 2, then the phone's storage fills up and Sam plays matchday 3. Its save fails, the stored game is removed, and after a reload there is no "Continue" rather than a stale matchday-2 offer. No console error.

**Acceptance criteria (embedded UAT)**
```gherkin
Scenario: Continue restores the formation and the Starting XI
  Given Sam at "?seed=31" managing "Netherwold Borough" has chosen "4-3-3" in "Tactics"
  And on "Starting XI" Sam has tapped "MF Calder Redfern 15", picked "Kestrel Northcott 6" and read the 11 slot texts
  When Sam reloads the page and taps "Continue"
  Then "Tactics" has the radio "4-3-3" checked
  And "Starting XI" lists the same 11 slot texts in the same order

Scenario: A damaged saved game is ignored
  Given "gaffer.save" holds the seed-31 save text cut after its first 100 characters
  When Sam opens "/gaffer/?seed=31"
  Then the title has no button named "Continue" and has a button named "New game"
  And there is no console error
  When Sam taps "New game", "Netherwold Borough", "Play match" and "Back", and reloads
  Then the title has a button named "Continue", and "Continue" then "Play match" shows "Matchday 2"

Scenario: A saved game from an incompatible older version is ignored
  Given "gaffer.save" holds the seed-31 save text with its version number set to 0
  When Sam opens "/gaffer/?seed=31"
  Then the title has no button named "Continue" and has a button named "New game"
  And there is no console error

Scenario: Blocked storage never interrupts the game
  Given every read and write of site storage throws
  When Sam opens "/gaffer/?seed=31"
  Then the title has no button named "Continue" and has a button named "New game"
  When Sam taps "New game", "Netherwold Borough", taps "Play match" and "Back" twice, and taps "Table"
  Then every row of the "League table" reads P 2
  When Sam reloads the page
  Then the title has no button named "Continue"
  And there was no console error at any step

Scenario: Storage that is full when the game loads offers no Continue and leaves no older save behind
  Given "gaffer.save" holds the seed-31 save text and every write to site storage throws a quota error
  When Sam opens "/gaffer/?seed=31"
  Then the title has no button named "Continue" and has a button named "New game"
  When Sam taps "New game", "Netherwold Borough", "Play match", "Back" and "Table"
  Then every row of the "League table" reads P 1
  When site storage becomes writable again and Sam reloads the page
  Then the title has no button named "Continue" and has a button named "New game"
  And there was no console error at any step

Scenario: Storage that fills up during play never offers a stale Continue
  Given Sam at "?seed=31" managing "Netherwold Borough" has played 2 matches, and the game has saved them
  And from then on every write to the key "gaffer.save" throws a quota error, while other keys still write
  When Sam taps "Play match" and sees "Matchday 3", taps "Back" and reloads the page
  Then the title has no button named "Continue" and has a button named "New game"
  And there was no console error at any step
```
Notes: scenario 1 is pin P3. Scenarios 2 to 6 are e2e and unit tests, not protected (D6). The e2e seeds or blocks the storage before load (for example with a Playwright init script), makes it full at load and writable again before a reload, or, after matchday 2, makes only writes to "gaffer.save" fail. In scenario 6 the store works at reload (the probe key still writes), so the missing "Continue" shows the removal, not a degraded store. Unit and property:
- the decoder never throws and returns "no saved game" for arbitrary strings, truncated or bit-flipped valid saves, a wrong version, an unknown club, an invalid formation, an XI that is not 11 different players in the formation's positions, and results that do not match the league's schedule (missing or extra matchdays, wrong fixtures, goals outside 0..9);
- a round trip over reachable states restores the same formation, XI, results and next matchday;
- the storage adapter swallows read and write failures silently;
- a failed write during play removes "gaffer.save" (best effort; a failing remove is swallowed too), and the next saving tap tries to write again;
- a degraded store (blocked or full at load) offers no "Continue" and attempts a silent removal of "gaffer.save" at load and on each saving tap; when the removal throws (blocked entirely), it is swallowed.

**Outcome KPI:** K1 (via US-1), and guardrails K2, K3 (below).
**Technical notes (for DESIGN, not AC):**
- Pure encode and decode in the functional core, with an explicit version number and strict validation. Decode regenerates the league from the saved seed and checks every field against it. A failure means "no saved game"; partial restores are not allowed.
- A localStorage adapter in the imperative shell catches every exception (`SecurityError`, `QuotaExceededError`, access throwing on read) and writes nothing to the console. On a failed write it removes the stored game (D6).
- No timestamps or random ids in the save. A full season (56 results) stays under 64 KB, about 1% of a 5 MB quota (guardrail below).
- Several tabs are out of scope (one player, one phone). Depends on US-1.

Notes for DESIGN and DISTILL (not part of the AC):
- "Has focus" means `document.activeElement` is the `<h1>`. Locators use `exact: true` for "Continue", "New game", "Play match", "End of season" and the h1.
- Each Playwright test uses a fresh browser context, so storage starts empty. `page.reload()` keeps the context's storage.
- A protected season is 28+ taps: one seed per scenario, and `test.setTimeout(90_000)` as headroom (S-008 and S-009 precedent).

Test intents for DISTILL (unit and property, not protected):
- Round trip: for states reached over seeds 1..300 x 8 clubs after each matchday 0..14 (untouched tactics), restore equals the saved formation, XI, results and next matchday. DISTILL may trim the sweep for runtime.
- Continued equals uninterrupted: fast-check (numRuns 100, fresh `FC_SEED`) over random formation, pick and Play match sequences with a save and restore at a random point. The rest of the season gives the same results and standings.
- Save triggers: club pick, formation, pick and Play match change the saved game; "Squad", "Player", "Table", "Tactics" with no change, "Starting XI", "Back", "End of season", "New game" and "Play again" do not.
- D4: after "New game" or "Play again" with no club picked, the stored game is the old one (the pick-a-club screen writes nothing); after the club-choice tap, it is the new one. E2e (D7): finish a season, tap "Play again", reload; "Continue" lands on the finished season's club home with "End of season".
- D5: restore uses the saved seed, not the address's.
- Unreadable inputs (US-2 notes) give "no saved game" and never throw; storage failures are swallowed; a failed write removes the stored game, and the next saving tap retries; a degraded store removes the stored game at load and on each saving tap (best effort).
- Size: a full season, and a constructed worst case, encode to under 64 KB.
- Names check: no generated club or player name holds "Continue".

### Wave: DISCUSS / [REF] Outcome KPIs
K1 is the one user outcome KPI. K2 and K3 are CI guardrails: they keep the KPI honest, and they do not measure behaviour.

| # | Kind | Who | Does what | By how much (target) | Baseline | Measured by |
|---|---|---|---|---|---|---|
| K1 | User outcome KPI | Sam on a 390px phone | Picks up his season after a reload | The next match screen in 2 taps from the title ("Continue", "Play match") at any point of the season; 1 tap to his club home | Impossible: the season is lost. Rebuilding matchday N+1 takes 2 + 2(N+1) taps plus every choice from memory (18 taps after 7 matches) | e2e tap counter (as S-003..S-009) |
| K2 | CI guardrail | the CI run | Proves that continuing changes nothing | 0 differences between a continued and an uninterrupted season (results, table, End of season) over the round-trip sweep and 100 fast-check runs per CI run; 100% of restores keep formation and XI | not possible | the round-trip and continued-equals-uninterrupted property tests, plus pins P2, P3, P5 |
| K3 | CI guardrail | the CI run | Proves the save never blocks play | 0 thrown errors and 0 console errors over 200 fast-check runs of unreadable inputs per CI run, and in the 5 storage e2e (damaged, incompatible, blocked, full at load, full mid-session); 100% of those show no "Continue" | n/a (no save) | property test on decode, e2e with seeded, blocked and full storage |

Other guardrails:
- S-001..S-009 protected scenarios stay green.
- The league, squads, schedule, every result and the S-006..S-009 goldens are unchanged for every seed.
- A full saved season stays under 64 KB, about 1% of a 5 MB quota (unit check).
- No ambient randomness or wall-clock time in `src/domain/`, and no storage access there.
- No sideways scroll at 390px and 0 console errors on the title and the club home.
- No analytics in the POC. In the owner's Friday demo, the owner closes the tab mid-season and carries on with "Continue".

### Wave: DISCUSS / [REF] DoD
- `tests/protected/S-010/` passes on main. It is written by this plan run's protected-scenarios step from the D8 pin list, and the pin files are committed RED on main before the first DELIVER commit. It is append-only and does not exist before that step.
- `tests/protected/S-001/` to `S-009/` are run on the DELIVER branch with the save in place (pages reused across visits included, D7) and still pass.
- Unit and property tests pass for the test intents above: round trip, continued equals uninterrupted, the save triggers, D4 timing, D5 seed, unreadable inputs, swallowed storage failures, removal on a failed write, the 64 KB guardrail and the names check. The `ci:*` scripts are green.
- The e2e phone smoke covers the seed-31 reload and "Continue" (focus, 44px, no sideways scroll at 390px), D4's timing ("New game" and "Play again"), D5, and the damaged, incompatible, blocked, full-at-load and full-mid-session fixtures, each with 0 console errors.
- Slices 01 and 02 are ordered commits in one DELIVER merge.
- The D7 amendments (the S-008 e2e reload test, and the S-009 acceptance test title) replace, never weaken; no other S-001..S-009 acceptance assertion is edited.
- DESIGN records the persistence decision in ADR-0016. The DELIVER change stays under the 1200-line PR guard: about 863 lines, tests included (DESIGN's re-estimate, which replaces 580), and about 1,113 with the protected file.

### Wave: DISCUSS / [REF] Out-of-scope
- Several save slots, a save list or naming; export or import; a "Delete save" button or a confirm dialog; cloud or account sync (`multiplayer` and `backend` are OUT); restoring the exact last screen; carrying a finished season into a next season; a "Back" from the pick-a-club screen to the title; telling the player that a save failed; migrating old save versions; several tabs open at once (one player, one phone; not specified or tested; the stale offer in another tab is an accepted exception, D6); an inbox, commentary, stats.
- Every OUT tag: `match-2d`, `utility-ai`, `transfers`, `finances`, `training`, `youth`, `staff`, `multiplayer`, `backend`, `real-data`.

### Wave: DISCUSS / [REF] WS strategy
No new walking skeleton (brownfield). The story adds one seam (browser storage, behind a pure format) and one button ("Continue"). The e2e journey "New game, club, 2 x (Play match, Back), reload, Continue, Play match" is the end-to-end proof that a season spans sessions. Two carpaccio slices in order (`slices/slice-01..02`), both delivered in the one S-010 DELIVER.

### Wave: DISCUSS / [REF] Driving ports
- UI entry, by role and accessible name, at `http://localhost:4173/gaffer/` (the built app). The title screen has the h1 "Gaffer" and the buttons "Continue" (with a saved game) and "New game", and `page.reload()` between steps. Then the club home, "Table", "Tactics", "Starting XI", "Play match", "End of season" and "Back", as in S-001..S-009.
- In-process, for unit and property tests:
  - pure app functions: encode the saved game from a state, decode a stored text into a saved game or "none" against the regenerated league, and build the continued state;
  - `update`;
  - the shell's storage adapter, behind an injectable storage, so failures can be simulated.

### Wave: DISCUSS / [REF] Pre-requisites
- S-001..S-009 are delivered: the `results` log, `nextMatchday`, `standingsOf`, `seasonSummaryOf`, `currentXI`, and "New game" and "Play again" through `NewGame`. ADR-0001..0015 are accepted, and ADR-0016 (this story's DESIGN, key "gaffer.save") now exists.
- `docs/product/jobs.yaml` now has J-10 (resolved). Roadmap entry S-010 is appended from the draft below (done in this run).
- `tests/protected/S-010/` is written by this plan run's protected-scenarios step from the D8 pin list, after this DISCUSS (append-only); it is not claimed to exist yet.
- D7 lists the non-protected tests DELIVER amends (the S-008 e2e reload test and the S-009 acceptance test title) and the protected specs that reuse one page across visits.
- S-009 DESIGN Open question 1 (`update` and `render` at their complexity limits) must be resolved in this story's DESIGN before a new action is added. The `render` lookup was deferred by DESIGN D5 (ADR-0016 Decision 4).

### Wave: DISCUSS / [REF] Roadmap outcome (draft)
Once a club has been picked, the game is saved in the browser automatically, with no Save button, after every tap that changes it: picking the club, choosing a formation in "Tactics" (the radio buttons named exactly "4-4-2", "4-3-3" and "4-2-3-1", as in S-004), picking a Starting XI player (as in the S-005 outcome: tapping a slot's button in the list named "Starting XI", then a player's button in the list named "Players"), and "Play match". The pick-a-club screen (no club yet) writes nothing; the tap that picks the club writes. The saved game holds the league's seed, the managed club, the formation, the Starting XI (including the player's own picks) and the recorded results; which screen was open is not saved. Every control named here is named exactly: the buttons "Continue", "New game", "Play match", "Table", "Tactics", "Starting XI", "End of season", "Play again" and "Back", and the radio buttons above. When a saved game exists, the title screen shows a button named exactly "Continue" (44px or taller) above the button named exactly "New game"; its only top-level heading (h1) still reads "Gaffer", focused on load. On a first visit, or in a fresh browser, there is no "Continue" button and the title screen is as before. Tapping "Continue" shows the club home of the saved club with focus on its heading, the club's name, and everything is as it was before the reload. "Table" shows the table named "League table" with the same rows, the same text in every cell. "Tactics" has the saved formation checked ("4-4-2", "4-3-3" or "4-2-3-1"). "Starting XI" lists the same 11 slot texts in the same order. When N matches had been played, the next "Play match" shows the match screen whose h1 reads "Matchday N+1"; for example, after two matches it is "Matchday 3". When all 14 had been played, the club home shows "End of season" and no "Play match", and the End of season screen shows the same "Final position" and "Top scorer" lines. "Back" works on every screen as before. Saving and continuing changes nothing in the game: the rest of the season played after "Continue" gives the same match screens (the score line and the "Goals" list) and the same table as the same seed, club and choices played in one visit without a reload. There is one saved game: "Continue" resumes it whatever "?seed=" the address holds now. "New game" still starts a fresh game from the address's seed exactly as before: after picking a club, the table reads P 0, W 0, D 0, L 0, GD 0 and Pts 0 on every row in A to Z order, "Tactics" has "4-4-2" checked, the Starting XI is the automatic one, and the next "Play match" shows "Matchday 1". Tapping "New game" or "Play again" does not by itself remove the saved game; it is replaced as soon as a club is picked in the new game. Until then a reload's "Continue" still offers the earlier game, a finished one included: S-009's "nothing of the old season remains" holds once a club is picked. A saved game that cannot be read (damaged, or from an incompatible older version) is ignored: there is no "Continue" button and the game plays as before. When browser storage is unavailable or full when the game loads, there is no "Continue" button (a readable older save is then not offered), the game plays as before without saving, and the stored saved game is removed (best effort, silently) at load and on each tap that would save, so a later visit never finds an older save; when access to storage is blocked entirely nothing can be removed, so a save that existed before is offered again once access returns. When a save fails during play, the stored saved game is removed (best effort, silently), so that "Continue" never offers an older state than the last one played, except when the removal also fails or storage is blocked entirely, and except with several tabs open at once (out of scope); later taps try to save again. A failed save never interrupts play and logs no console error. This version amends S-007, S-008 and S-009, which said that results are kept until the page is reloaded: from this version on, a reload keeps the saved game, reachable through "Continue". Their durable lists are unchanged, and "New game" still starts fresh. These hold in every later version of the game: with a saved game the title screen offers "Continue" (exact name), and without one it does not; "Continue" restores the saved club with its formation, Starting XI, recorded results and next matchday; and "New game" always starts a fresh game. That "Continue" lands on the club home, and that the saved game is replaced only once a club is picked in a new game, are rules of this version only; and a later version that changes the save format, or the game model in a way that invalidates saved results, may either make saved games unreadable (no "Continue") or let an old save continue with its recorded results. No horizontal scroll at 390px and no console errors.

### Wave: DISCUSS / [REF] DoR validation
| # | Item | Status | Evidence |
|---|---|---|---|
| 1 | Problem clear, domain language | PASS | US-1: a dropped tab wipes the season, and 14 matchdays do not fit a 5-minute session. US-2: a continue that resets his 4-3-3 and his pick would field a side he never chose, and a bad save must not block the game |
| 2 | Persona specific | PASS | Sam, 34, one-handed on a bus, 390px Android, 5 minutes, two or three matches per trip, and the browser drops the tab between trips |
| 3 | 3+ domain examples, real data | PASS | Real generator output from `S-008/discuss/reference-season.md` and S-009's `reference-season-end.md`: seed-31 Netherwold Borough matchdays 1 to 3 and the table after 2 (hand-derived from the reference matchdays 1-2, checked in review; DISTILL confirms), "Final position 3rd" and "Top scorer Garrick Thistlewood (5 goals)", the golden pick "Kestrel Northcott 6" for "MF Calder Redfern 15", and the seed-20260 league for D5. 3 examples per story |
| 4 | UAT Given/When/Then, 3-7 | PASS | 11 for S-010 (US-1 5, US-2 6). Every Given is a single condition: no "or" in any Given, and one named storage fixture per scenario. Every Given and When is a tap sequence, a reload or a named storage fixture on the real app. Every Then reads only what an earlier step read, or a fixed label |
| 5 | AC derived from UAT | PASS | Project convention since S-001: the AC are the embedded Gherkin scenarios. D1, D2 and D3 are in US-1 scenarios 1 to 3 and US-2 scenario 1; D4 in US-1 scenario 4; D5 in US-1 scenario 5; D6 in US-2 scenarios 2 to 6; D7 to D10 are covered by the pin list, unit tests, e2e and review |
| 6 | Right-sized | PASS | 2 slices (ordered commits, one merge) in about 1 to 1.5 days; about 863 changed lines in DELIVER including tests (DESIGN's re-estimate, which replaces DISCUSS's 580), about 1,113 with the protected file, under the 1200-line PR guard (the one hard cap); one outcome |
| 7 | Technical notes | PASS | Per story: the save lives outside `GameState` (the five-key test), a projection written while the screen carries a club, the `update` and `render` complexity refactor first, a pure versioned encode and decode with strict validation, an exception-swallowing storage adapter in the shell, and a new ADR |
| 8 | Dependencies tracked | PASS | S-001..S-009 delivered. The D7 amendment of "kept until the page is reloaded" leaves the durable lists unchanged. Several protected specs reuse one page across visits (S-001 pick-club, S-002 squad, S-004 tactics); they pass because each visit taps the exact "New game", and the DoD runs them on the branch with the save in place. S-009's "nothing of the old season remains" holds once a club is picked (D7). The S-008 e2e reload test and the S-009 acceptance test title are listed for amendment. S-009 DESIGN Open question 1 must be resolved first. J-10 added. `tests/protected/S-010/` follows from this plan run's protected-scenarios step and is committed RED before DELIVER |
| 9 | Outcome KPI measurable | PASS | K1, the user KPI: 2 taps to the next match after a reload (e2e tap counter). Guardrails: K2, 0 differences between continued and uninterrupted seasons (round-trip sweep plus fast-check); K3, 0 errors over 200 runs of unreadable inputs plus the 5 storage e2e; a full season under 64 KB |

DoR status: PASSED (both stories). Every story has `job_id` J-10 and an Elevator Pitch.

### Wave: DISCUSS / [REF] Peer review
`nw-product-owner-reviewer` (haiku), cycle 1: rejected_pending_revisions (3 high, 10 medium, 5 low). Revision 2 applied the orchestrator's decisions as below. Only the DISCUSS section, the journey, the slices and the S-010 roadmap entry were edited; DESIGN and DEVOPS were untouched.

| Finding | How it landed |
|---|---|
| H-01 failed writes | D6 split: storage blocked or full at load gives no "Continue" (a readable older save is then not offered); a failed save during play removes the stored game (best effort, silently), and later taps retry. New Glossary entries "Storage full" and "Failed save". New US-2 scenario "Storage that fills up during play never offers a stale Continue". Roadmap outcome, slice 02 and the journey updated |
| H-02 controls named exactly | The roadmap outcome names the S-004 radios "4-4-2", "4-3-3", "4-2-3-1" and the S-005 pick path (a slot's button in the list "Starting XI", then a player's button in the list "Players"), and states that every control is named exactly. No club name is pinned in the outcome; Netherwold Borough stays example data in the stories |
| H-03 disjunctive Givens | "Every screen works as before" is replaced by checkable clauses (no button "Continue", a button "New game", every Table row at P 2, no console error). Each storage case is its own scenario with a named fixture (damaged = the seed-31 save text cut after 100 characters; incompatible = version 0; blocked; full at load; full mid-session). D5 moved to US-1 so that US-1 has 5 scenarios and US-2 has 6 |
| M-01 protected reuse | D7 and DoR 8 now say that several protected specs (S-001 pick-club, S-002 squad, S-004 tactics) reuse one page across visits and pass because each visit taps the exact "New game"; the DoD runs S-001..S-009 protected on the branch with the save in place |
| M-02 S-009 test title | D7 amend list adds the `tests/acceptance/S-009/existing-navigation-unchanged.test.ts` test (about line 74) that calls a title plus "New game" "a reload": its title is reworded and its assertion is unchanged |
| M-03 "Play again" and the save | D7, the roadmap outcome and the test intents: S-009's "nothing of the old season remains" holds once a club is picked; until then a reload's "Continue" offers the finished season (e2e intent) |
| M-04 slice release | Scope Assessment, Story map, DoD and both slices: the slices are ordered DELIVER commits of one story, shipped in one merge |
| M-05, M-06 accepted risk and recovery | D4 records as an accepted risk (J-10's anxiety) that "New game" plus a club pick replaces the save with no confirm or undo; a reload before picking a club is the only way back to "Continue". The journey's error paths gained emotional annotations |
| M-07 wording | D4, the roadmap outcome and the test intents: "the pick-a-club screen (no club yet) writes nothing; the club-choice tap writes" |
| M-08 KPI kinds | K1 is the one user outcome KPI (e2e tap counter); K2 and K3 are relabelled as CI guardrails |
| M-09 named fixtures | The storage fixtures are named under User stories (the seed-31 save text, damaged, incompatible, blocked, full at load, full mid-session; key "gaffer.save") |
| M-10 RED pins | DoD: the pin files are committed RED on main before the first DELIVER commit (written in this plan run) |
| L-01 peer review record | This table |
| L-04 several tabs | Moved to Out-of-scope (one player, one phone) |
| L-02, L-03, L-05 | Landed in revision 2: the Scope Assessment (line 8), DoR row 3, and the journey's "Feels" column for the error paths |
| Orchestrator (DESIGN alignment) | The size guardrail is relaxed from 16 KB to "a full saved season stays under 64 KB (about 1% of a 5 MB quota)", because DESIGN is asked to store the results log as-is in a plain versioned envelope |

Cycle 2 (`nw-product-owner-reviewer`): rejected_pending_revisions (2 high, 4 medium, 2 low). Every finding was folded in by the orchestrator, as below:

| Finding | How it landed |
|---|---|
| H2-01 older save after a degraded load | Decision: a degraded store (blocked or full at load) makes a best-effort, silent removal of "gaffer.save" at load and on each saving tap, so a later visit never finds an older save. Residual stated: when access is blocked entirely nothing can be removed, so a save that existed before is offered again once access returns. Glossary ("Storage full", "Degraded store", "Failed save"), D6, test intents, slice 02 and the roadmap outcome |
| H2-02 the full-mid-session test proves the removal | US-2 scenario 6 and slice 02: after matchday 2 is saved, only writes to "gaffer.save" throw; other keys, such as the probe key, still write, so at reload the store works and "no Continue" shows the removal. The degraded path is merged into US-2 scenario 5: a valid save stored, full at load, play one match, storage writable again, reload, no "Continue". US-2 stays at 6 scenarios |
| M2-01 qualified guarantee | "Never offers an older state ..." is qualified everywhere: except when the removal also fails or storage is blocked entirely, and except several tabs open at once. The several-tabs stale offer is an accepted exception in D6 and Out-of-scope |
| M2-02 version-scoped exceptions | D9 and the roadmap's version-only text: a save-version bump, or a model change that invalidates saved results, either makes saved games unreadable (no "Continue") or lets an old save continue with its recorded results |
| M2-03 budget | DoR 6, DoD and the budget table use DESIGN's re-estimate (about 863 DELIVER after DESIGN cycle 2, about 1,113 with the protected file), which replaces DISCUSS's 580 |
| R-5 render lookup | Budget row and Pre-requisites: "render lookup deferred by DESIGN D5 (ADR-0016 Decision 4)" |
| L2-01 L-02/L-03/L-05 row | Corrected in the cycle-1 table: they landed (Scope Assessment, DoR row 3, the journey's "Feels" column) |
| L2-02 two worst-case sizes | One figure everywhere (about 51 KB worst case, under the 64 KB guardrail), applied by the DESIGN cycle-2 fold-in |

Final: the maximum of 2 review cycles was reached, so there is no cycle 3. The reviewer's last verdict was rejected_pending_revisions; every finding was folded in by the orchestrator after cycle 2. No disagreement of substance remains.

## Wave: DESIGN

- **Setup**: mode propose; scope application; one solo team plus the factory, no Conway constraint. Paradigm: functional core, imperative shell (ADR-0003; recorded in the ADRs and the brief, not in CLAUDE.md). Unattended; no questions asked. Precedence used: scope.md, then brief.md, then accepted ADRs; the narrower choice wins.
- **Checklist**: ✓ DISCUSS (D1-D10, US-1/US-2, K1-K3, P1-P5, line budget) | ✓ both slices | ✓ S-009 DESIGN as the template and its Open questions | ✓ brief, ADR-0002/0003/0008/0012/0014/0015 | ✓ code (`main.ts`, `state.ts`, `seed.ts`, `league.ts`, `match.ts`, `selection.ts`, `title.ts`, `dom.ts`, `styles.css`, `.oxlintrc.json`, vitest/playwright/stryker configs) | ✓ design system | ✓ existing tests (the S-009 five-key test, the S-008 reload e2e, the source/grep tests) | ⊘ Context7 and web (no tool in this run; browser API semantics are stated from knowledge and flagged) | ⊘ residuality, DDD expansion, formal verification (lean) | ⊘ CLAUDE.md edit (locked).
- **New ADR**: `adr-0016-save-and-continue-local-storage.md` (format, structural strictness, where the pure functions and the adapter live, how Continue enters `update`, the write trigger and the failed-write rule, the Earned Trust catalogue, the Stryker scope amendment). ADR-0012, ADR-0014 and ADR-0015 get a status-line note "(amended by ADR-0016, S-010)", and ADR-0003, ADR-0005, ADR-0006 and ADR-0011 a one-line save-relevance note.
- **Brief**: `docs/product/architecture/brief.md` gains "Save and continue (S-010, ADR-0016)", effect-isolation rows, component rows, ports 36-39, the S-010 observable bullet, a struck Earned Trust line and updated C4 L1 and L2 (a new external system "Browser localStorage" and a new container "Adapters"). `docs/product/ui/design-system.md` gains "Title with a saved game (S-010)".
- **C4**: one new external system (browser localStorage) and one new container (`src/adapters`, the first driven adapter).
- **Outcome collision check**: `nwave-ai outcomes check-delta docs/feature/S-010/feature-delta.md` exited 0 ("0 outcomes checked, 0 collisions found across 0 outcomes"); `docs/product/outcomes/registry.yaml` is still empty (`outcomes: []`), so no collision is possible and nothing was linked or superseded.

### Wave: DESIGN / [REF] DDD list
- **No new bounded context.** The save is a persistence concern at the edge: a projection of session state, not a domain concept. Squad, Selection, Match, Schedule and Standings are untouched; `isLegalXI` is one new rule of the existing Selection context.
- **Language**: Saved game (the projection of the state: seed, club, formation, XI if changed, the recorded results as they are), Saving tap (a tap that changes the encoded save), Continue (the title action that restores it), Offer (the restored state held by the title while a readable save exists), Unreadable save (anything `fromSave` rejects), Degraded store (a store whose probe failed: treated as absent), Save version (`v`).
- **Invariants by construction**: the encoded text is a pure function of the state (equal states, equal text), so the save triggers and D4's timing are properties of data (`saveTextFor`), not of the shell; a decoded save equals the saved state apart from the screen (round-trip law), so a continued season equals the uninterrupted one because `update` is a pure function (K2); a save either decodes whole or not at all (K3); a stored game is either the last played state or absent (a failed write removes it, D6).

### Wave: DESIGN / [REF] Decisions
| # | Decision | Source |
|---|---|---|
| D1 | **Format: a plain versioned envelope storing the recorded results as they are**: `{ v: 1, seed, clubId, formation, xi?, results? }` under the single key `gaffer.save`; `xi` only when the player changed it; `results` the `PlayedMatch[]` log unchanged (one representation of a result everywhere, no second schema or transform; the ADR-0012 JSON round trip already holds). Size: about 230 bytes per match, about 13 KB for an average season (2.73 goals per match, 45 bytes per goal), about 51 KB if every chance scored in every match, under the 64 KB guardrail (about 1% of a 5 MB quota). Rejected: the compact per-match goal triples (about 1.9 KB; a second schema and transform to keep in step with `PlayedMatch`, harder to read, solves a problem the relaxed guardrail no longer has); per-matchday choices plus replay (past XIs are not kept and cannot be added without a sixth `GameState` key); a full state snapshot (stores derivable data and the screen). | ADR-0016 (1); DISCUSS D1, guardrail |
| D2 | **Pure module `src/app/save.ts`**: `toSave(state) => SaveData or undefined` (only when the screen carries a known club), `fromSave(raw: unknown) => GameState or undefined`, `encodeSave(state) => string or undefined`, `decodeSave(text) => GameState or undefined` (**one try/catch around `JSON.parse` and `fromSave`**), and the pure write decision `saveTextFor(lastText, state) => string or undefined`. The restored screen is the club home. `GameState` gains no key. Rejected: inline in `main.ts` (untestable without a DOM); `src/domain` (the domain has no `GameState`, ADR-0003); `src/app/storage.ts` (blurs the pure-app rule). | ADR-0016 (3, 5); DISCUSS tech notes |
| D3 | **Strictness: structural truth, no replay.** `fromSave` checks `v === SAVE_VERSION`, int32 seed, club in the regenerated league, formation id, XI legal for the squad and formation (`isLegalXI`, EXTEND `selection.ts`), and the log: a non-empty whole number of complete matchdays (length a multiple of 4, at most 56) where entry `i` has `matchday` `i/4 + 1`, `fixtureIndex` `i%4`, `home` and `away` equal to the schedule's fixture (ADR-0010), `homeGoals`/`awayGoals` integers 0..9 equal to the goal counts by side, and every goal `{ minute 1..90 integer, side "home"|"away", playerIndex integer 0..17 }` with minutes non-decreasing. Unknown extra keys are ignored and entries rebuilt in canonical key order. Anything off is `undefined`; no partial restore. Replay-verify was **rejected**: it couples decode to the current match model and AI policy (an intentional change would silently delete players' seasons), cannot verify the managed fixture (past XIs unknown) and drags `save.ts` into the model for a risk CI already guards. Model drift is a process rule: an ADR that invalidates saved results bumps `SAVE_VERSION`; unannounced drift turns the existing goldens (ADR-0011, S-007, S-008, S-009 references) red. | ADR-0016 (2); S-009 Open question 4 |
| D4 | **Adapter `src/adapters/save-store.ts`, the first driven adapter**: `createSaveStore(getStorage)` takes a restricted capability (`getItem`, `setItem`, `removeItem`), probes during construction (sentinel write, read back, remove) and returns `{ health, read(), write(text) => boolean }` that never throw or log; a failed probe is `degraded` (reads `undefined`, writes nothing: blocked or full **at load** gives no "Continue", a readable older save is not offered); a failed `write` **removes the stored save** (best effort, silent) and returns `false` (**full during play**: the stored game is the last played state or absent; if the removal also fails the previous save remains, a stated residual). **A degraded store cleans up too (R-1)**: when the storage getter worked (the probe failed on `setItem`, `getItem` or a mismatch), the factory makes one best-effort, silent `removeItem("gaffer.save")` at construction and a degraded `write()` repeats it on each saving tap, so a later visit never finds an older save; when the getter itself throws (access blocked entirely) nothing can be removed, so a pre-existing save is offered again once access returns (residual). `createAutosave(store, lastText)` runs `saveTextFor`, the encode and `write` inside **one silent try**; it remembers the written text on success and **`undefined` on failure** (R-2), so the next dispatch re-attempts, earlier texts included (T1 saved, T2 fails, back at T1 writes T1). The probe degrades instead of refusing to start (DISCUSS D6: the game plays as before; no console output). | ADR-0016 (3, 5); Earned Trust; DISCUSS D6 |
| D5 | **Continue is an `update` action**: `Action` adds `{ type: "Continue"; game: GameState }` (the state `decodeSave` returned at boot); from `title` the state becomes the payload, elsewhere a `toBe` no-op. **`update` is first turned into a handler table** keyed by `Action["type"]` (a missing key is a compile error), behaviour-preserving. Rejected: the shell swapping state outside `update` with an `onContinue` callback (a transition outside the pure core, a second focus path, breaks the `render<Screen>(root, props, dispatch)` convention); adding the case without the refactor (`update` at exactly 15 of 15, the S-009 debt compounds); raw `SaveData` in the action (an import cycle between `state.ts` and `save.ts`). **This closes S-009 Open question 1 for `update` only**: `render` stays a switch at 15 of 15 (no new screen, no new branch), and converting it to a lookup is deferred to the next story that adds a screen, which must do it first; `ci:lint` is the gate for both counts. | ADR-0016 (4); S-009 Open question 1 |
| D6 | **Title**: `renderTitle(root, { offer }, dispatch)`, `dispatch` narrowed to `NewGame` and `Continue`. With an offer: h1, tagline, `button.primary` "Continue", `button.secondary` "New game" (outlined gold, shares the `.back-button` colours and border, 200px minimum width). Without an offer: exactly today's markup (`button.primary` "New game"), so every protected test, which starts in a fresh context, sees an unchanged title on its first visit. Several protected specs reuse one page across visits (S-001 pick-club, S-002 squad, S-004 tactics, DISCUSS D7); a later visit there meets "Continue" and the secondary "New game", and they still pass because each visit taps the exact "New game", which starts fresh (D4); the DoD runs them on the branch. The offer is a module constant of `main.ts` read once at boot (the title is never re-shown after a page load). | ADR-0016 UI; design-system |
| D7 | **Focus** (ADR-0008) unchanged: title to club home is a screen change, so the shell focuses the club home `<h1>`; the title's h1 is focused on load through the existing first-render plan; renderers never move focus; no focus ids. | ADR-0008; DISCUSS D2, D3 |
| D8 | **Determinism**: the league is regenerated from the saved seed, so a saved seed 31 restores the seed-31 league whatever `?seed=` holds (D5 of DISCUSS), and `NewGame` from `seasonEnd` keeps that league ("Play again" keeps the saved seed). No new stream, no clock, no randomness in the save; nothing in `src/domain/` names storage. | ADR-0016 Determinism |
| D9 | **Complexity (counted as S-007..S-009 did; `ci:lint` confirms)**: `update` 14 to 1 (the table; new handler `continueGame` 2); `main.ts` `render` stays 15 of 15 (the title case gains a prop, no branch); `renderTitle` 1 to 2; every new function in `save.ts` and `save-store.ts` is designed at 10 or less by splitting (envelope, XI, one results entry, one goal each their own function); `max-lines` 400: `state.ts` about 285, `save.ts` about 115, `main.ts` about 165. **`ci:lint` confirms every count in DELIVER**; if a count differs, extract the nearest helper (behaviour-preserving). | ADR-0016 Context, Enforcement; `.oxlintrc.json` |
| D10 | **Triggers and D4 from data**: the saving taps are exactly the actions that change `encodeSave(state)`; the decision is the pure `saveTextFor(lastText, state)` in `save.ts` (the adapter only performs effects). `NewGame` and "Play again" land on `pickClub`, which has no club, so `toSave` is `undefined` and the old text stays; the first `ChooseClub` of the new game writes the new text; "Continue" writes nothing. No action-name list in the shell. Rejected: an action whitelist (writes on no-ops, misses new saving actions); write on every dispatch; write on `visibilitychange` (unreliable on mobile). | ADR-0016 (5); DISCUSS D1, D4 |
| D11 | **Enforcement**: `.oxlintrc.json` gains (a strengthening) `no-restricted-imports` of `**/adapters/**` for `src/domain`, `src/app`, `src/ui`, of `**/ui/**` for `src/adapters`, and `localStorage`/`sessionStorage` in `no-restricted-globals` for `src/app` and `src/ui`; grep tests: storage names only in `src/adapters/` and the `() => localStorage` getter in `main.ts`, `main.ts` never calls `fromSave` (only `decodeSave`), one `"Continue"` dispatch site in `title.ts`, at most two `dispatch(` there, no `.focus(` under `src/ui/` (existing), no `console` in `src/adapters/`. **Mutation scope (ADR-0016 Enforcement amendment)**: `stryker.config.mjs` and `playwright.config.ts` are not in the CLAUDE.md lock list (only `scripts/factory/protected.playwright.config.ts` is), so DELIVER adds `src/app/save.ts` and `src/adapters/**/*.ts` to `mutate` in the S-010 PR, measures a local mutation baseline for them, and never lowers a threshold; if the PR guard rejects the edit anyway, DELIVER records an owner request and ships without it. | ADR-0016 Enforcement |
| D12 | **Test tooling**: vitest (node) unit and property tests on the pure functions and on the adapter with injected fake storages (no DOM needed); Playwright e2e for the shell wiring (reload in the same context, `page.addInitScript` and `page.evaluate` to seed, corrupt, block or fill storage, in non-protected specs only). A forced throw inside `fromSave` (a mocked collaborator) must be caught by `decodeSave`: unit returns `undefined`, nothing logged; the boot path calls only `decodeSave` (grep), so the title renders without "Continue" and without console output. Playwright gives each test a fresh context, so every test, protected ones included, starts with empty storage; repeated `goto` or `reload` in one test share storage (several protected specs reuse one page across visits, DISCUSS D7), which is fine because each visit taps the exact "New game", which always starts fresh. | DISCUSS notes; ADR-0016 Earned Trust |
| D13 | **Names**: "Continue" is in no `names.ts` string (grep: none; locators use `exact: true`); DISTILL adds the unit check (S-008 D9 precedent). | DISCUSS test intents |

### Wave: DESIGN / [REF] Component decomposition
| Path | Change | Responsibility | Indicative lines |
|---|---|---|---|
| `src/app/save.ts` | CREATE NEW | `SAVE_VERSION`, `SaveData`, `toSave`, `fromSave` (envelope, XI, one results entry, one goal as small functions), `encodeSave`, `decodeSave` (one try/catch), `saveTextFor` | 115 |
| `src/app/state.ts` | EXTEND | `Continue` action and handler; `update` switch becomes the handler table (about 28 lines out, 20 in) | 55 |
| `src/app/seed.ts` | EXTEND | export `isInt32` | 1 |
| `src/domain/selection.ts` | EXTEND | `isLegalXI(squad, formation, xi)` (the file must keep passing the S-005 source test: no `Math.random`, `Date`, `performance.now` or `crypto.` anywhere in the file, comments included) | 10 |
| `src/adapters/save-store.ts` | CREATE NEW | `SaveStorage`, `SaveStore`, `createSaveStore` (probing; `write` returns a boolean and removes the stored save on failure), `createAutosave` (one silent try around the whole step; remembers the text on success and `undefined` on failure); a degraded store removes `gaffer.save` best effort at construction and on each saving tap | 63 |
| `src/ui/screens/title.ts` | EXTEND | `{ offer }` prop, "Continue" button, secondary "New game" with an offer, narrowed `dispatch` | 14 |
| `src/ui/styles.css` | EXTEND | `button.secondary` shares the `.back-button` rule; title sizing | 10 |
| `src/main.ts` | EXTEND | three imports, the store, the read, the offer, `createAutosave`, the `title` case props, one `autosave(state)` call per dispatch | 12 |
| `.oxlintrc.json` | EXTEND | the D11 overrides | 14 |
| `stryker.config.mjs` | EXTEND | add `src/app/save.ts` and `src/adapters/**/*.ts` to `mutate` (ADR-0016 Enforcement amendment; thresholds untouched; DELIVER also corrects the file's header comment "The factory cannot edit this file") | 3 |

**Code total about 297** (rows: 115 + 55 + 1 + 10 + 63 + 14 + 10 + 12 + 14 + 3; DISCUSS 185: the strict structural decoder, the probing adapter with removal on failure and on a degraded store, the `isLegalXI` rule, the handler table churn, the lint overrides and the Stryker scope were not in the estimate; replay-verify and the compact format were dropped). Tests: `tests/acceptance/S-010/*.test.ts` about 375 (round trip, triggers and `saveTextFor` 85; strict decode with one case per rejection rule, damaged saves, forced throw, golden save pair, size 100; store, probe faults, degraded-store removal, failed-write removal, T1/T2/T1 retry, autosave throwing, D4 timing 105; `Continue`, handler-table, five-key and D5 45; source/grep and names 40), `tests/e2e/S-010-save-continue.spec.ts` about 175 (D4 timing including "Play again" then reload, D5, damaged and `v: 0` saves seeded before load, blocked storage, full at load with a restore-and-reload step, full mid-session with only `gaffer.save` writes failing, click-everything on the title, 44px, focus, no scroll, no console errors), amendments about 16 (S-008 e2e 12, S-009 acceptance title 4). **DELIVER total about 863** (code 297, tests 566) against the DISCUSS 580. With the 250-line protected file (written in the plan run, outside DELIVER) the grand total is about 1,113, under the 1200-line PR guard (the one hard cap), 87 lines of headroom; applying levers 2 to 5 below would bring it to about 1,040. Slices 01 and 02 ship in ONE DELIVER merge. **DELIVER checkpoint**: after the first green DELIVER commit, compute the projected grand total (changed lines so far, plus the estimate for what remains, plus the 250 protected lines); if it is above about 1,000, apply trim levers 1 to 3 before writing more tests. **Trim levers, in this order**: (1) cut the round-trip sweep to seeds 1..60 (runtime only); (2) one table-driven test for the rejection rules instead of one `it` each (about -25); (3) merge the grep/source tests into one file (about -15); (4) parametrise the damaged and `v: 0` e2e into one test (about -20); (5) drop the dedicated handler-table regression (the S-001..S-009 suites already cover it, about -15). Never split the slices.

**Amend list** (non-protected tests DELIVER must update, replacing, never weakening; DISTILL fixes the exact text). `grep` of `reload`/`goto`/title assertions over `tests/` (non-protected):
| File | Test / part | Why it must change | Replace with |
|---|---|---|---|
| `tests/e2e/S-008-season.spec.ts` | the test at line 478 (title: "Reloading the page after two matches shows the title screen again; ... (the season is lost, there is no save yet)") and the header comment line 10 ("reload loses the season") | The season is no longer lost; the title after a reload also shows "Continue" | Title reworded ("... shows the title with Continue and New game; New game and the same club start at Matchday 1 with every row at P 0 (the saved game is kept, New game starts fresh)"); keep every assertion; add `expect(getByRole("button", { name: "Continue", exact: true })).toBeVisible()` after the reload and before "New game"; comments restated |
| `tests/acceptance/S-009/existing-navigation-unchanged.test.ts` | the test at about line 74 (title: "... when the title is shown again and New game is tapped (a reload), then the game is the same fresh game") | A reload no longer equals "title plus New game"; the test itself builds `{ ...over, screen: title }` in memory and is unaffected in behaviour | Title only reworded (for example "... when the title is shown with a finished season in memory and New game is tapped ..."); the assertion is unchanged (DISCUSS D7) |
Checked and **unaffected** (no edit): `S-001-pick-club.spec.ts` (single `goto`, finds "New game" by name), `shell.spec.ts` (title heading and "New game" visible; no save in a fresh context), `S-002..S-009` e2e (`goto` per test, "New game" by non-exact name, which "Continue" does not match; helpers that `goto` again in one test only meet a "Continue" next to "New game"), every `tests/acceptance/S-001..S-009` file (the `update` handler table is behaviour-preserving; `existing-navigation-unchanged` five-key test untouched because no state key is added; the S-005 `selection.ts` and S-009 `season-end-source.ts` source checks do not look at the new code), `tests/unit/ui/renderers-never-move-focus.test.ts` (scans `src/ui` only; the new adapter is outside). Protected specs that reuse one page across visits (S-001 pick-club, S-002 squad, S-004 tactics, DISCUSS D7) meet a title with "Continue" and a secondary "New game" on later visits; they pass because each visit taps the exact "New game", which is still a button of that name; the DoD runs them on the branch. DISTILL re-greps before pinning.

### Wave: DESIGN / [REF] Driving ports
- **App, pure**: `toSave`, `fromSave`, `encodeSave`, `decodeSave`, `saveTextFor`; `update` with `Continue`; `isLegalXI`.
- **Adapter (injectable)**: `createSaveStore(getStorage)`, `createAutosave(store, lastText)`.
- **Browser**: the title (h1 "Gaffer", "Continue" when saved, "New game"), then the club home, "Table", "Tactics", "Starting XI", "Play match", "End of season", "Back", with `page.reload()` between steps; storage seeded, corrupted, blocked or filled through `page.addInitScript`.
- Detail and properties: brief, "For Acceptance Designer", ports 36-39.

New and changed shapes, for the acceptance designer (contracts only):
- `SaveData = { v: 1; seed: number; clubId: string; formation: FormationId; xi?: readonly number[]; results?: readonly PlayedMatch[] }`; `toSave(state: GameState): SaveData | undefined`; `fromSave(raw: unknown): GameState | undefined`; `encodeSave(state: GameState): string | undefined`; `decodeSave(text: string | null | undefined): GameState | undefined` (never throws); `saveTextFor(lastText: string | undefined, state: GameState): string | undefined`.
- `Action` adds `{ type: "Continue"; game: GameState }`; `GameState`, `Screen`, `PlayedMatch` unchanged; `isLegalXI(squad: readonly Player[], formation: FormationId, xi: readonly number[]): boolean`.
- `SaveStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">`; `SaveStore = { readonly health: "ok" | "degraded"; read(): string | undefined; write(text: string): boolean }`; `createSaveStore(getStorage: () => SaveStorage, key?: string): SaveStore`; `createAutosave(store: SaveStore, lastText: string | undefined): (state: GameState) => void`.
- `renderTitle(root, { offer }, dispatch)` with `offer: GameState | undefined`; not reachable from vitest, covered by e2e and grep tests.

### Wave: DESIGN / [REF] Driven ports and adapters
**`localStorage` is the first driven port.** Port: `SaveStore` (read one text, write one text, with a `health`). Adapter: `createSaveStore` over an injected `() => SaveStorage`, so tests pass fakes and production passes `() => localStorage` (the getter is inside the adapter's try, because merely reading the property can throw). It probes while constructing (wire, probe, use), degrades silently, and never logs. Environment lies and their fault scenarios (full table in ADR-0016 Earned Trust):
1. **Blocked access** (`SecurityError` reading the property): the getter throws; `degraded`; nothing can be removed (residual: a pre-existing save is offered again once access returns); e2e blocks storage with an init script and plays two matches.
2. **Full or disabled at load** (`QuotaExceededError` on `setItem`): the sentinel write fails, so `degraded`: no "Continue" even with a readable older save, no throw, no console, the game plays. The getter worked, so the factory makes one best-effort, silent `removeItem("gaffer.save")` and a degraded `write()` repeats it on each saving tap, so a later visit never finds the older save. Unit: `setItem` throws for every key, `removeItem` works: the stored save is gone after construction; a throwing `removeItem` is swallowed. e2e "full at load": a valid save stored, `setItem` made to throw for every key, reload: no "Continue"; `setItem` restored, reload: still no "Continue".
3. **Fills up during play**: `write` returns `false` and removes `gaffer.save` (a throwing remove swallowed; if the removal fails the previous save remains, a stated residual); the autosave remembers `undefined`, so the next dispatch re-attempts, earlier texts included. Unit: T1 saved, T2 fails, back at T1 writes T1. e2e "full mid-session": after matchday 2 saved, **only writes to `gaffer.save` throw** (the probe key still writes, so the store is `ok` at reload and the missing "Continue" shows the removal, not a degraded store), matchday 3 plays, a reload shows no "Continue".
4. **Silent no-op** (`setItem` ignored, `getItem` returns `null` or stale): the sentinel read-back mismatch gives `degraded`, so no "Continue" is offered on a lie.
5. **Odd reads** (`getItem` throws, or returns a non-string): `read()` is `undefined`.
6. **Foreign, stale or damaged text** (another project on the shared origin, an old format, truncation, hand editing): one try/catch in `decodeSave` around parse and decode, and a strict structural `fromSave`; e2e seeds garbage, the truncated seed-31 save and a `v: 0` object before load.
7. **The decoder itself throws**: the single catch; a unit test forces a throw inside `fromSave`; `main.ts` calls only `decodeSave` (grep).
8. **Model drift** (a later story changes squads, streams, the match model or the AI-side policy): no decoder defence (replay-verify rejected); existing goldens go red, the invalidating ADR bumps `SAVE_VERSION`; a golden save text (seed 31, two matchdays, pinned by DISTILL from the reference season, never re-pinned from DELIVER output) equals `encodeSave` of the played state and decodes back to it.
9. **Round trip loses information**: the round-trip sweep and the fast-check continued-equals-uninterrupted property.
10. **Write timing (D4)**: `saveTextFor` as a pure table, and `createAutosave` with a fake store.
11. **The adapters claim a probe but skip it**: three orthogonal layers: type (the factory is the only constructor of `SaveStore` and probes inside it; `health` is in the type), structure (grep test), behaviour (the fault catalogue above).
12. **The autosave step throws** (encode, `saveTextFor` or `write`): the whole step is inside one silent try in `createAutosave`; unit: a store whose `write` throws and a mocked encode that throws, `autosave` returns normally, nothing logged, the remembered text becomes `undefined`.

Deviation recorded: the generic "refuse to start" rule is replaced by "degrade silently", because saving is optional and DISCUSS D6 forbids console output; no `health.startup.refused` event exists. No external integrations (a platform API), so no contract tests. **Enforcement**: see D11.

### Wave: DESIGN / [REF] Technology choices
- No new dependency (ADR-0001, 0002, 0003 apply; all OSS). The Web Storage API (`localStorage`: `getItem`, `setItem`, `removeItem`; string values) is part of the browser platform. Semantics relied on, from MDN's Web Storage documentation **as known to the architect, not looked up in this run (no browsing or Context7 tool)**: reading `window.localStorage` can throw `SecurityError` when storage is blocked; `getItem` returns `null` for an absent key; `setItem` can throw `QuotaExceededError` when storage is full or disabled. The design is robust to a different behaviour because every call sits in a try/catch and the probe round-trips a sentinel. DELIVER may verify with Context7 (`/mdn/content`, Web Storage) and amend only this bullet.
- `JSON.parse` / `JSON.stringify` for the text (ECMAScript built-ins; fixed key order from the encoder).

### Wave: DESIGN / [REF] Reuse Analysis
| Existing Component | File | Overlap | Decision | Justification / contract shape |
|---|---|---|---|---|
| `GameState`, `Action`, `update`, `initialState` | `src/app/state.ts` | Where the new action and the restored state live | EXTEND (`Continue`; `update` becomes a handler table) | Pure return-only; universe `{ league, screen, formation, xi?, results? }` (the five-key test stays); `Continue` from `title` returns the payload, else `toBe`; every S-001..S-009 `update` suite unedited; deep-freeze; 40-action property; complexity D9 |
| `sideFor`, `matchdayFor` (private) | `src/app/state.ts` | The AI-side policy; not needed by the save (replay-verify dropped) | REUSE unchanged | Untouched; no export, no split |
| `PlayedMatch`, `GoalEvent`, `MatchResult` | `src/domain/match.ts` | The log shape stored and restored as is | REUSE unchanged (types only) | Plain JSON-able data (ADR-0012 tests the JSON round trip); the decoder rebuilds entries in canonical key order; the save never touches the frozen ADR-0011 model |
| `fixturesOf`, `MATCHDAYS`, `FIXTURES_PER_MATCHDAY` | `src/domain/schedule.ts` | The fixtures each stored entry must equal; the 14-matchday bound | REUSE unchanged | Pure data and return-only; frozen table; a `RangeError` for a bad matchday is avoided by checking `1..MATCHDAYS` first |
| `generateLeague`, `squadOf`, `generateSquad`, `PLAYERS_PER_SQUAD` | `src/domain/league.ts`, `squad.ts`, `state.ts` | Regenerate the league and squads from the saved seed | REUSE unchanged | Pure return-only; deterministic; the reason the save holds no names |
| `automaticXI`, `pickForSlot`, `isSlotIndex`, `lineUp` | `src/domain/selection.ts`, `formation.ts` | XI legality | EXTEND `selection.ts` (`isLegalXI`) | No existing predicate validates a whole XI (`pickForSlot` validates one pick; `isSquadIndex` is private). Pure return-only; universe = the boolean; table of 11 distinct indices, wrong count, duplicate, out of range, wrong position, wrong formation; Stryker covers `src/domain/**`; the file keeps its no-ambient-randomness source test |
| `isFormationId`, `FORMATIONS` | `src/domain/formation.ts` | Validate the stored formation | REUSE unchanged | Pure type guard |
| `parseSeed`, `isInt32` (private) | `src/app/seed.ts` | Validate the stored seed with the same int32 rule | EXTEND (export `isInt32`) | Pure return-only; one source for "a valid seed" (no duplicate range constants) |
| `standingsOf`, `seasonSummaryOf`, `nextMatchday`, `matchFor` | `src/app/state.ts` | Derived from the restored log | REUSE unchanged | Pure return-only; the round-trip tests compare their outputs before and after a restore |
| `focusPlan`, `sameScreen` | `src/app/state.ts` | Title to club home is a screen change | REUSE unchanged | Pure return-only; the existing suites; one new case in the `Continue` test |
| (none) | `src/app/` | A pure, versioned encode, strict structural decode and the write decision | CREATE NEW `save.ts` | No existing serialiser, validator or write rule (grep: no `JSON.parse`, `JSON.stringify` or storage in `src/`). Pure return-only; universe = the returned text / state; round trip, never-throws (and a forced throw caught in `decodeSave`), one case per rejection rule, `saveTextFor` table, size, golden pair |
| (none) | `src/adapters/` | Reading and writing the browser's storage with probe, silence and removal of the stored save on a failed write | CREATE NEW `save-store.ts` | No existing storage code (grep: none). Bounded-change: keys `gaffer.save` (read, write, remove on a failed write, at a degraded construction and on a degraded saving tap) and `gaffer.probe` on the injected storage only; never throws or logs; the autosave step is one silent try; fault-injection unit tests; grep that no other file names a storage API. The adapter only performs effects; the decision is `saveTextFor` |
| `renderTitle` | `src/ui/screens/title.ts` | The title with its one button | EXTEND | Bounded-change; universe = one `section.title-screen` (h1, tagline, [Continue], New game); `dispatch` narrowed to `NewGame` and `Continue`; the no-offer markup is exactly today's; e2e click-everything, grep (at most two `dispatch(`), `.focus(` grep |
| `el`, `button.primary`, `.back-button`, `.title-screen` | `src/ui/dom.ts`, `styles.css` | Buttons and the title layout | REUSE (`button.secondary` shares the `.back-button` rule) | Bounded-change (presentation only); no `display` change that affects the accessible name |
| `render`, `findClub`, `applyFocus`, `dispatch` loop | `src/main.ts` | Maps state to props; owns the loop | EXTEND (store, offer, `autosave` call, `title` props) | Bounded-change with an enumerated universe (adds: one storage read at boot, the sentinel round trip, writes of `gaffer.save` through the adapter); `render` complexity unchanged; e2e |
| `.oxlintrc.json` | repo root | Layer rules | EXTEND (D11) | A strengthening of checks, so no weakening ADR is needed |
| `stryker.config.mjs` | repo root | Which files the nightly mutates | EXTEND (`mutate` gains `src/app/save.ts`, `src/adapters/**/*.ts`) | A strengthening, recorded as an ADR-0016 Enforcement amendment; thresholds untouched; local baseline measured in DELIVER; the same edit corrects the file's header comment ("The factory cannot edit this file"), and ADR-0009 carries a pointer note |
| S-008 reload e2e | `tests/e2e/S-008-season.spec.ts` | Asserts "no save yet" in its title | REUSE, except the amend list | Equal-or-stronger: same assertions plus "Continue" visible |

### Wave: DESIGN / [REF] Changed Assumptions
- **S-007, S-008, S-009 "Results are kept until the page is reloaded", quoted**: S-008 D8: "Results are kept until the page is reloaded (no persistence). `NewGame` clears them (unit-level invariant, as S-007 D9)."; S-009 D5: "Results still last only until the page is reloaded (save and continue is a later story)." Superseded in part (DISCUSS D7): after a reload the saved game is reachable through "Continue"; "New game" still starts fresh; their durable lists are unchanged and their protected scenarios start in fresh contexts.
- **ADR-0012 Context D9, quoted**: "the user-visible lifetime is "until the page is reloaded" (no persistence yet)". And Earned Trust 3: "Future persistence will be the first real adapter (`localStorage` lies: quota, private mode, stale versions). It needs its own `probe()` and a shape validator; not in this story." Taken by this story (ADR-0016); ADR-0012's status line carries the amendment note.
- **ADR-0012 Forward compatibility, quoted**: "a save is `{ seed, formation, xi, results }`, all JSON-able. ... A loader validates shape". Followed: the stored `results` is the `PlayedMatch` log unchanged inside a versioned envelope (D1); the loader validates structure, fixtures and scores (D3). ADR-0012's "what is played stays played" is the reason replay-verify was rejected.
- **ADR-0014 Earned Trust 4, quoted**: "a future persistence story must validate shape, order and contiguity of a loaded log, with its own `probe()`." Done: `fromSave` checks shape, order, contiguity and the schedule's fixtures entry by entry; the adapter has its probe.
- **ADR-0003, quoted**: "Future persistence ... A pure `toSave(state)` / `fromSave(data)` works over the seed plus the player's choices and results, and a separate storage port in the shell does the I/O." Followed, with `fromSave` taking `unknown`.
- **ADR-0005 (d) and ADR-0006, quoted**: "there is no persistence to migrate" (ADR-0005 (d)); "There is no persistence; the S-002 protected scenarios assert properties" (ADR-0006, determinism break). Persistence now exists: the frozen squad and attribute tables are save-relevant (a change that invalidates saved results needs a `SAVE_VERSION` bump; ADR-0005, 0006, 0011 carry a status-line note).
- **ADR-0015, quoted**: "There is no storage, clock, network or vendor SDK, so there is no `probe()` to specify". No longer true for the app as a whole; the S-009 screen itself is unchanged.
- **S-009 Open question 1 / DISCUSS slice 01**: "the `update` and `render` switches move to lookups before the new action". Refined and closed for `update` only: `update` moves (it gains the action); `render` gains no screen and no branch, so it stays a switch at 15 of 15 and is deferred to the next story that adds a screen; `ci:lint` is the gate.
- **S-009 five-key test (`existing-navigation-unchanged.test.ts`)**: kept; the save adds no `GameState` key, and the restored state holds only those five keys.
- **DISCUSS line budget**: DELIVER about 863 (DISCUSS 580): code 297 (185), tests 566 (395). Grand total with protected about 1,113, under the 1200-line PR guard (the one hard cap), with the DELIVER checkpoint and trim levers in Component decomposition.
- **DISCUSS D6, revised (twice)**: blocked or full storage at load gives no "Continue" (a readable older save is then not offered): the probe makes the store `degraded`, and a degraded store makes a best-effort, silent removal of `gaffer.save` at construction and on each saving tap (residual: access blocked entirely, nothing can be removed, so an older save is offered again once access returns). A save that fails during play removes the stored save (best effort, silent) and later taps retry: `write` returns a boolean; the autosave remembers the written text on success and `undefined` on failure.
- **DISCUSS D7, protected scenarios**: each test starts in a fresh context, but several protected specs reuse one page across visits (S-001 pick-club, S-002 squad, S-004 tactics); a later visit meets "Continue" and a secondary "New game" and passes because each visit taps the exact "New game". The "unaffected" claims in this section mean "first visit in a fresh context".
- **DISCUSS size guardrail**: relaxed from 16 KB to 64 KB (about 1% of a 5 MB quota) because the results are stored as recorded (about 13 KB average, about 51 KB worst by hand count).
- **DESIGN first pass, superseded in this revision** (peer review cycle 1): the compact goal-triple format (about 1.9 KB) and the replay-verify of the unmanaged fixtures (with the `sidesFor` split of `state.ts`) are rejected options in ADR-0016, with the reviewer's reasons.
- **Locked-path wording, corrected**: `stryker.config.mjs` and `playwright.config.ts` are not locked (CLAUDE.md's list); only `scripts/factory/protected.playwright.config.ts` is.
- **Pre-requisite**: `tests/protected/S-010/` is written by this plan run's protected-scenarios step (the orchestrator, after this DESIGN, append-only) and must exist before DELIVER starts.
- No change to the roadmap outcome text.

### Wave: DESIGN / [REF] Open questions
- **None blocking.**
- **`render` stays at 15 of 15**: the next story that adds a screen must first move the `render` switch to a lookup (this story moved `update`, which it needed). Counts are by hand; DELIVER confirms with `ci:lint` (D9 has the fallback).
- **Stryker scope (decided, not open)**: `stryker.config.mjs` is not locked (CLAUDE.md lists only `.github/`, `factory/`, the product brief and scope, `scripts/`, `.nwave/`, `CLAUDE.md`, `tests/protected/`); DELIVER adds `src/app/save.ts` and `src/adapters/**/*.ts` to `mutate` in the S-010 PR (ADR-0016 Enforcement amendment), measures a local mutation baseline for the new files, and never lowers a threshold. Residual: the file's own comment says the factory cannot edit it; if the PR guard rejects the edit, DELIVER records an owner request and the property tests, the golden pair and the fault-injection tests are the guard. `isLegalXI` is covered by the domain glob.
- **Model drift is a process rule, not a decoder check**: an ADR that intentionally invalidates saved results bumps `SAVE_VERSION`; unannounced drift turns an existing golden red. The residual case (a model change no golden catches and no bump announces) lets an old save continue with its recorded results; accepted.
- **No user-visible "saving failed"** (OUT in DISCUSS): the player is not told when storage is degraded or a save fails; a later UX story may add it.
- **Several tabs (OUT, not tested)**: last write wins, and the offer is read once at boot, so a tab still showing the title can offer a stale game after another tab played on; its "Continue" restores the older state and its next saving tap overwrites the newer save.
- **Shared origin**: GitHub Pages serves all of a user's project sites from one origin; the key `gaffer.save` is a namespace convention, not isolation.
- **Outcome trace**: save after the saving taps, no Save button: D1, D10. "Continue" above "New game" only with a save, h1 focused: D6, D7. Lands on the club home with the same table, next matchday, End of season: D2, D5, D8. Formation and XI restored: D1. Continued equals uninterrupted: D1, D5, D8 (round-trip law). New game fresh, replaced when a club is picked: D6 (offer ignored by `NewGame`), D10. Seed from the save: D8. Unreadable save, blocked or full storage, no console error: D3, D4. 44px, no sideways scroll: D6.
- **Handoff for DISTILL**:
  - Properties and checks: brief ports 36-39 and ADR-0016 Consequences and Earned Trust. Test files and lines are under Component decomposition, with the amend list.
  - **Goldens, RED-first** (never re-pinned from DELIVER output): the seed-31 two-matchday save text, equal to `encodeSave` of the state reached by "New game", Netherwold Borough and 2 x ("Play match", "Back"), and decoding back to that state (source: the `discuss/reference-season.md` figures: Netherwold Borough "Matchday 2" Rushmoor Heath Albion 2-1; DISTILL computes the text with the real generator once and a reviewer checks it against the reference; the DISCUSS named fixtures "Damaged save" = its first 100 characters and "Incompatible save" = `v` set to 0 derive from it); the encoded size of a constructed worst-case log (18 goals every match) and of the seed-31 season, both under 64 KB.
  - Unit and property: round trip over seeds 1..300 x 8 clubs x matchdays 0..14 (untouched tactics, trim allowed); fast-check (numRuns 100, fresh `FC_SEED`) continued equals uninterrupted over random formation, pick and Play match sequences with a restore at a random point; `fromSave` never throws and returns `undefined` over `fc.jsonValue()`, arbitrary strings, truncated, bit-flipped, key-dropped, version-changed, matchday-swapped, fixture-swapped and score-changed valid saves (numRuns 200); one case per rejection rule of port 36 (table-driven); **a forced throw inside `fromSave` (a mocked collaborator) is caught by `decodeSave`, which returns `undefined` with nothing logged**; `saveTextFor` (club pick, formation, XI pick, Play match give new text; Squad, Player, Table, Tactics with no change, Starting XI, Back, End of season, New game, Play again, a no-op pick, the same formation give `undefined`); D4 through `createAutosave` and a fake store; **a failing `setItem` after the probe: `write` returns `false`, `gaffer.save` is removed (a throwing `removeItem` swallowed too), the autosave remembers `undefined`, and the next dispatch retries and succeeds when `setItem` recovers; T1 saved, T2 fails, back at T1 writes T1 (R-2)**; **a degraded store (`setItem` throwing for every key, `removeItem` working) removes a pre-existing `gaffer.save` at construction and on each saving tap, and swallows a throwing `removeItem` (R-1)**; **`autosave` returns normally when `write` or the encode throws, logs nothing, and remembers `undefined` (R-4)**; D5 (restore uses the saved seed; `NewGame` from `seasonEnd` after `Continue` keeps it); `Continue` from every non-title screen is `toBe`; the five-key check on restored states; the handler-table regression (the whole S-001..S-009 suite); source checks (D11, including `main.ts` never calling `fromSave`); the names check for "Continue".
  - e2e (390px, `exact: true`): title without a save has no "Continue" and the old markup; with a save "Continue" is 44px and above "New game", "Gaffer" the only h1 and focused; after Continue the club name is focused; the seed-31 two-match reload (Table cells, "Matchday 3" and score line, equal to a second fresh context that plays three matches); D4 timing (New game, reload, "Continue" still resumes the old game; after a club pick and a reload it resumes the new one; finish a season, "Play again", reload, "Continue" lands on the finished season, DISCUSS D7); D5 (`?seed=abc` after a seed-31 save); the DISCUSS named fixtures seeded with `addInitScript` (writing only when the key is absent): damaged and incompatible saves (no "Continue", no console error, a later save replaces it), blocked storage (the property throws), full at load (valid save stored, `setItem` made to throw for every key: no "Continue", then `setItem` restored and a reload: still no "Continue", because the degraded store removed the save), full mid-session (after matchday 2 was saved, **only writes to `gaffer.save` throw, the probe key still writes**: matchday 3 plays, after a reload no "Continue" because the failed write removed the save, not because the store is degraded); click-everything on the title dispatches only `NewGame` and `Continue`. The seed-31 reload and "Continue" smoke runs under 90 s with the 28-tap season in the protected file.
  - The pending-then-activate pattern of S-006..S-009 applies to the amend list, in the same commit as the production change.

### Wave: DESIGN / [REF] Peer review
`nw-solution-architect-reviewer`, cycle 1: **conditionally_approved** (0 critical, 3 high, 5 medium, 8 low). Revision 1 applied the orchestrator's decisions below (ADR-0016, this section, the DEVOPS section, `environments.yaml`, the brief, the status-line notes). The DISCUSS section had meanwhile been revised (D6 failed-write removal, the 64 KB guardrail, named fixtures) and was re-read first. Finding ids follow the reviewer's report as relayed by the orchestrator; where the relay gave only the decision, the row states the decision.

| Finding | Resolution |
|---|---|
| H-1 replay-verify | Dropped entirely. ADR-0016 option 2C is a rejected option with the reasons (couples decode to the current model and AI policy; managed fixture unverifiable; drags `save.ts` into the model for a risk CI goldens already guard). Model drift is a process rule (`SAVE_VERSION` bump) plus the existing goldens. `sidesFor` split removed from `state.ts` |
| H-2 decode can throw | `decodeSave` wraps `JSON.parse` and `fromSave` in one try/catch; `main.ts` calls only `decodeSave` (grep); a unit test forces a throw inside `fromSave` (mocked collaborator) and expects `undefined` and no console output (D2, D12, ADR-0016 Earned Trust 7) |
| H-3 Stryker scope and "locked" wording | `stryker.config.mjs` and `playwright.config.ts` are not locked; DELIVER adds `src/app/save.ts` and `src/adapters/**/*.ts` to `mutate` in the S-010 PR as an ADR-0016 Enforcement amendment, measures a local baseline, never lowers a threshold; fallback to an owner request only if the PR guard rejects the edit. Wording corrected in ADR-0016, this section, the DEVOPS section, `environments.yaml` and the brief |
| M-1 failed write | `write` returns a boolean; the remembered text advances only on success (retry on the next dispatch); a failed write removes the stored save (best effort, silent), per DISCUSS D6; new Earned Trust row and tests |
| M-2 write decision in the adapter | The decision is the pure `saveTextFor(lastText, state)` in `save.ts`; the adapter only performs effects |
| M-3 render at 15 of 15 | Recorded as a decision closing S-009 Open question 1 for `update` only; `render` deferred to the next screen story; `ci:lint` gate (D5, D9, ADR-0016 Decision 4) |
| M-4 budget | Re-estimated: DELIVER about 823 (code 287, tests 536), grand total about 1,073; ordered trim levers listed; slices never split (superseded by cycle 2: about 863 and 1,113) |
| M-5 compact format | Replaced by the plain envelope storing `PlayedMatch[]` as is (about 13 KB average, about 51 KB worst, under 64 KB); the compact format is a rejected option with the reviewer's reason |
| L-1 ADR status | ADR-0016 Status recorded the review (final wording in cycle 2, R-6) |
| L-2 save-relevant ADRs | One-line status notes added to ADR-0003, ADR-0005, ADR-0006, ADR-0011 |
| L-3 locked wording | See H-3 |
| L-4 boot cost | The replay boot-cost bullet is gone with the replay |
| L-5 MDN | The "not looked up" flag is kept in ADR-0016 and Technology choices |
| L-6 | Optional; not taken |
| L-7 stale offer | Recorded next to "last write wins" in ADR-0016 Consequences and Open questions |
| L-8 counts | `ci:lint` confirms every complexity count in DELIVER (D9) |
| Also | Remaining "16 KB" references replaced by the 64 KB guardrail in DESIGN, DEVOPS, the brief and `environments.yaml` |

**Cycle 2** (`nw-solution-architect-reviewer`): **conditionally_approved** (R-1 high; R-2, R-3 medium; R-4 to R-8 low). The product-owner reviewer flagged the same R-1 hole, and DISCUSS revision 3 (D6, Glossary "Degraded store", US-2 scenarios 5 and 6) was re-read first. Folded into ADR-0016, this section, the DEVOPS section, `environments.yaml`, the brief and ADR-0009.

| Finding | Resolution |
|---|---|
| R-1 (high) a degraded store leaves an older save | When the probe fails but the storage getter works, the factory makes one best-effort, silent `removeItem("gaffer.save")` at construction, and a degraded `write()` repeats it on each saving tap. Residual stated: blocked access (the getter throws) cannot remove anything, so a pre-existing save is offered again once access returns. New unit case (`setItem` throwing for every key, `removeItem` working, also a throwing `removeItem`) and e2e step (valid save, `setItem` throwing for every key, reload: no "Continue"; `setItem` restored, reload: still none). ADR-0016 Earned Trust row 2, brief port 38, `environments.yaml` `full_at_load`, DEVOPS matrix |
| PO H2-02 mid-session discrimination | The full-mid-session e2e makes only writes to `gaffer.save` throw (the probe key still writes), so the store is `ok` at reload and "no Continue" shows the removal, not a degraded store. ADR-0016 Earned Trust row 3, driven-ports item 3, DEVOPS matrix, `environments.yaml` |
| R-2 (medium) retry after a failed write | The autosave remembers `undefined` after a failed write, so the next dispatch re-attempts, earlier texts included; unit case T1 saved, T2 fails, back at T1 writes T1 |
| R-3 (medium) "never older" claim | ADR-0016 Positive consequence reworded as best effort; stated residual: if the removal also fails (or access is blocked) the previous save remains |
| R-4 (low) autosave step can throw | The whole step (`saveTextFor`, the encode, `write`) runs inside one silent try; unit case; new Earned Trust row 12 |
| R-5 (low) | Applied in the DISCUSS section (budget row, Pre-requisites, slice 01): "render lookup deferred by DESIGN D5 (ADR-0016 Decision 4)" |
| R-6 (low) ADR status | "Accepted (peer review: cycle 1 conditionally approved, cycle 2 conditionally approved; all findings folded in, max 2 cycles)" |
| R-7 (low) stale Stryker comment | DELIVER corrects the `stryker.config.mjs` header comment ("The factory cannot edit this file") in the same edit as the `mutate` widening; ADR-0009 gets a one-line status note pointing at ADR-0016 Enforcement |
| R-8 (low) arithmetic and cap | Code row sum fixed (115 + 55 + 1 + 10 + 63 + 14 + 10 + 12 + 14 + 3 = 297); budget re-estimated for the new cases: DELIVER about 863 (code 297, tests 566), grand total about 1,113, 87 lines under the cap; DELIVER checkpoint added (after the first green commit, a projected grand total above about 1,000 means trim levers 1 to 3 before more tests) |
| PO M2-04 protected reuse | D6, D12, the amend list and Changed Assumptions now say: each test starts in a fresh context, but several protected specs reuse one page across visits (S-001 pick-club, S-002 squad, S-004 tactics) and pass because each visit taps the exact "New game" (DISCUSS D7) |
| PO L2-02 one size figure | One worst-case figure everywhere: about 51 KB (the "60 KB with a margin" and "under 60 KB" wordings are gone) |

Max 2 cycles reached; no disagreement of substance remains.

## Wave: DEVOPS

Lean, unattended. All nine decisions pre-answered; no platform change. Locked paths (CLAUDE.md: `.github/`, `factory/`, `scripts/`, `.nwave/`, `CLAUDE.md`, the product brief and scope, `tests/protected/`; of the Playwright configs only `scripts/factory/protected.playwright.config.ts`) are read-only. Machine-readable: `docs/feature/S-010/environments.yaml`. Inherits S-009 (and S-001..S-008); only deltas are recorded. `.oxlintrc.json`, `stryker.config.mjs` and `playwright.config.ts` are **not** locked: the D11 layer overrides and the widened Stryker `mutate` are ordinary DELIVER changes, not platform changes (the Stryker edit is an ADR-0016 Enforcement amendment).

Checklist: ✓ existing infra reused | ✓ K1-K3 mapped to instruments | ✓ rollback defined | ✓ storage-state matrix for DISTILL | ✓ mutation strategy (nightly-delta; `state.ts` and `selection.ts` already inside the mutate globs; DELIVER adds `save.ts` and `src/adapters/**/*.ts` to `mutate`, ADR-0016) | ✓ protected-runner timeout constraint carried over | ⊘ new IaC/containers | ⊘ server-side observability | ⊘ continuous learning | ⊘ CLAUDE.md edit

### Wave: DEVOPS / [REF] Environment matrix
| Env | URL | Runner | Purpose |
|---|---|---|---|
| local-dev | `http://localhost:5173/gaffer/` (`pnpm dev`) | dev machine | Iteration |
| local-preview | `http://localhost:4173/gaffer/` (`ci:serve`) | dev, CI, protected runner | Production build under test: phone-viewport Chromium (Pixel 7 profile, 390px); unit, property, e2e, `tests/protected/S-001..S-010/` |
| production | `https://<owner>.github.io/gaffer/` | GitHub Pages | Live site; post-deploy smoke through `BASE_URL` (same Pixel 7, 390px) |

Unchanged: no staging (static, recreate); Chromium only. Deltas, all about the one new platform surface, browser storage (the first state that outlives a page load):

**Storage states DISTILL must cover** (one e2e or unit case each; "fresh" = a new Playwright context, which is the default per test):

| State | How it is produced | Expected | Instrument |
|---|---|---|---|
| empty | fresh context, no seeding | no "Continue", title markup exactly as before S-010 | e2e; protected P1 |
| valid save | play in the test and `page.reload()`, or seed a valid text under `gaffer.save` before load | "Continue" (44px or taller) above "New game"; lands on the club home | e2e; protected P1-P5 |
| damaged or incompatible | the DISCUSS fixtures: the seed-31 save text cut after 100 characters, and the same text with `v` set to 0; plus garbage, before load | no "Continue", no console error; a later club pick replaces it | e2e (non-protected); unit property on `decodeSave` |
| blocked (access throws) | init script that makes reading `window.localStorage` throw `SecurityError` | no "Continue", 2 matches and "Table" work (every row P 2), a reload shows no "Continue", no console error | e2e (non-protected); unit with a throwing getter |
| full at load (write throws) | a valid seed-31 save stored, then an init script making `Storage.prototype.setItem` throw `QuotaExceededError` for every key; later a reload with `setItem` restored | no "Continue" (the probe write fails, store `degraded`, a readable older save is not offered), play unaffected, no console error; the degraded store removed `gaffer.save` best effort, so after `setItem` is restored and the page reloaded there is still no "Continue" | e2e (non-protected); unit with a throwing `setItem` and a working `removeItem` (also on each saving tap; a throwing `removeItem` swallowed) |
| blocked entirely (residual) | the getter throws | nothing can be removed: a save that existed before is offered again once access returns (stated residual, not tested end to end) | unit: getter throws, no throw, no console |
| full mid-session | play 2 matches (saved), then make only writes to `gaffer.save` throw (the probe key still writes), play matchday 3, reload | the failed write removed `gaffer.save` (best effort), the store works at reload, so the missing "Continue" shows the removal (never a stale matchday-2 offer), no console error | e2e (non-protected); unit: `write` returns `false`, key removed, T1 saved / T2 fails / back at T1 writes T1 |
| autosave step throws | unit only: `write` or the encode throws | `autosave` returns normally, nothing logged | unit |
| decoder throws | unit only: a mocked collaborator makes `fromSave` throw | `decodeSave` returns `undefined`, nothing logged; the title shows no "Continue" | unit (`main.ts` calls only `decodeSave`, grep) |

Notes:
- **Seeding pattern.** `page.addInitScript` re-runs on every navigation, `page.reload()` included, so an init script that writes the save would overwrite whatever the app saved between `goto` and `reload`. The seeding script must write only when the key is absent (or the case must not reload). Blocking and filling scripts are meant to run on every load.
- **Fresh contexts, in CI and on the live URL.** Playwright gives each test a fresh context, and the deployed-site `smoke` (`BASE_URL`) runs in fresh contexts too, so a stale save from an older deploy cannot reach CI or smoke. `goto` and `reload` inside one test share storage; that is fine because "New game" always starts fresh (DISTILL D12). Smoke never writes to a real player's browser.
- **Real players can hold a stale save.** A browser that played an earlier deploy keeps `gaffer.save`. The `v` check plus the strict structural decode (ADR-0016) turn any save of another format into "no saved game"; a change to the format, squads, streams, the match model or the AI-side policy that invalidates saved results must bump `SAVE_VERSION` (see Deployment strategy and rollback); the existing goldens turn red on unannounced drift. Nothing is migrated.
- **Shared origin.** GitHub Pages serves every project of `<owner>.github.io` from one origin, so `localStorage` is shared with the owner's other Pages sites. The key is namespaced (`gaffer.save`, probe key `gaffer.probe`); this is a convention, not isolation. The decoder rejects foreign text under the key (Earned Trust 5), and the adapter touches only those two keys. The local-preview origin (`localhost:4173`) is separate from production.
- **Boot cost.** One storage round trip (sentinel) plus, with a save, a structural decode of up to 56 entries (microseconds to milliseconds); no budget is imposed here.
- **Focus** (ADR-0008) unchanged: title to club home after "Continue" is a screen change, so the club home `<h1>` is focused; the title's h1 is focused on load with or without "Continue".
- **e2e runtime.** The seed-31 reload test plays 3 matches in each of two contexts (no full season in non-protected e2e); the protected file has the only full-season reload (P5, 28 taps). See the timeout constraint in the coexistence section.

### Wave: DEVOPS / [REF] CI/CD pipeline outline (existing, unchanged)
- `ci` (PR, push to main, dispatch; 30 min): PR guards (locked paths, append-only protected, diff cap 1200, `Math.random`/`Date` in `src/domain/`, which covers the `selection.ts` extension), roadmap lint, `ci:lint` (confirms the D9 complexity counts and enforces the D11 `.oxlintrc.json` layer overrides, which DELIVER adds), `ci:typecheck` (the handler table's missing-key compile error), `ci:test` (fresh `FC_SEED`), `ci:build`, `ci:e2e`, protected no-regression check vs main (a new `tests/protected/S-010/*.spec.ts` must fail on main until DELIVER).
- `deploy` (push to main): `ci:build`, deploy-pages, then `smoke` (10 min) runs `ci:e2e` against the live URL, including the new S-010 spec and the amended S-008 reload spec.
- `nightly` (03:00, 45 min): `ci:mutation`; failure opens a `mutation-alarm` issue. `ai-review`, `factory-tick`, `watchdog`, `weekly-demo`: factory-owned, untouched.
- No pipeline change: S-010 adds unit, property and e2e specs run by existing scripts, and no dependency. DELIVER diff about 863 lines (about 1,113 with protected), under the 1200 guard; `docs/` is outside the count.
- Local gate: `pnpm run check` mirrors the commit stage; no git hooks (locked). Security: no secrets, no runtime deps, no network; the save is untrusted input and is validated strictly before use (shift-left through the decoder property tests); stored text never reaches the DOM except through `el()`/`textContent` after decoding (ADR-0002). SAST/SCA/SBOM not added (inherited owner-only item).

### Wave: DEVOPS / [REF] Monitoring contracts (DISCUSS KPI to instrument)
E2E instrument: `tests/e2e/S-010-save-continue.spec.ts` (Pixel 7, 390px) via `ci:e2e` on PR and main and `smoke` on the live URL. Unit/property rows run in `ci:test` with a fresh `FC_SEED`. `tests/protected/S-010/` runs on local-preview in `ci` and must pass on main.

| KPI (DISCUSS) | Instrument | Pass condition |
|---|---|---|
| K1: next match screen in 2 taps from the title ("Continue", "Play match") at any point of the season; 1 tap to the club home | e2e: page-side capture-phase click counter (as S-003..S-009) after a reload at seed 31 with 2 matches played: 1 click ("Continue") to the focused club home, 2 clicks to "Matchday 3" with the golden score line "Netherwold Borough 2–1 Oakhampton Rise Borough". Protected P2 pins the focus, the table and the Matchday 3 equality. Manual: owner's Friday demo (closes the tab mid-season, carries on; no analytics in the POC) | 1 and 2 clicks |
| K2: 0 differences between a continued and an uninterrupted season; 100% of restores keep formation and XI | unit: round-trip sweep (seeds 1..300 x 8 clubs x matchdays 0..14, untouched tactics; DISTILL may trim) restores the same formation, XI, results and next matchday; fast-check (`numRuns` 100, fresh `FC_SEED`) continued equals uninterrupted over random formation, pick and Play match sequences with a restore at a random point; golden save text for seed 31, two matchdays (RED-first, never re-pinned from DELIVER output; equals `encodeSave` of the played state and decodes back to it); size under 64 KB for a constructed worst case and for the seed-31 season. Protected: P2, P3, P5 | 0 differences; golden exact |
| K3: 0 thrown errors and 0 console errors over 200 fast-check runs of unreadable inputs; 100% of unreadable saves show no "Continue" | unit: property on `decodeSave`/`fromSave` (`fc.jsonValue()`, arbitrary strings, truncated, bit-flipped, key-dropped, version-changed, matchday-swapped, fixture-swapped, score-changed, `numRuns` 200) never throws and returns `undefined`; a forced throw inside `fromSave` is caught by `decodeSave`; adapter fault catalogue with injected storages (throwing getter, throwing `setItem`, a `setItem` that fails only after the probe with removal of `gaffer.save` and a retry, ignored writes, odd reads). e2e: damaged, incompatible, blocked, full-at-load and full-mid-session storage states (matrix above), each with 0 console errors | 0 throws; 0 console errors |
| Save triggers and D4 timing | unit on `createAutosave` with a fake store: club pick, formation, XI pick, Play match write; Squad, Player, Table, Tactics unchanged, Starting XI, Back, End of season, New game, Play again, no-op pick, same formation do not; after New game with no club the stored text is the old one, after a club pick the new one. e2e: reload after New game still resumes the old game; after a club pick and reload, the new one | holds |
| D5 seed from the save | unit: restore uses the saved seed; `NewGame` from `seasonEnd` after `Continue` keeps it. e2e: `?seed=abc` after a seed-31 save, "Continue" lands on Netherwold Borough at Matchday 3 | holds |
| 44px, no sideways scroll at 390px, 0 console errors, focus | e2e on the title with a save (Continue 44px or taller, above "New game", "Gaffer" the only h1 and focused) and the club home after Continue (club name focused); click-everything on the title dispatches only `NewGame` and `Continue` | holds |
| Names, determinism, layering | unit: "Continue" in no `names.ts` string (locators `exact: true`); grep tests per D11 (storage names only in `src/adapters/` and the `() => localStorage` getter in `main.ts`; one `"Continue"` dispatch site; no `console` in `src/adapters/`); no `Math.random`/`Date` in `src/domain/` (PR guard) | holds |
| S-001..S-009 unchanged | existing e2e and acceptance (only the DESIGN amend list: the S-008 reload test is replaced and strengthened) and `tests/protected/S-001..S-009/` | green |
| Domain test strength | Stryker on `src/domain/**` (`selection.ts` `isLegalXI`) and `src/app/state.ts` (`Continue` handler, the handler table, `sidesFor`) | nightly, at or above break 70 |

No analytics (POC). The e2e tap counter, the property tests and the owner's demo are the KPIs' sole measurements.

### Wave: DEVOPS / [REF] Deployment strategy and rollback
- Strategy: recreate. Merge to main triggers `deploy`, replacing the whole static artifact; idempotent.
- Rollback (designed first): revert the S-010 squash commit on main; the merge triggers `deploy` and `smoke` validates the restored site. Alternative: `workflow_dispatch` of `deploy.yml` on the pre-S-010 commit (the S-009 deploy). Fallback: fix-forward on a `claude/*` branch. The append-only protected guards may block a plain revert of a squash that added `tests/protected/S-010/`; the dispatch route is then the owner action. Time to restore: one deploy cycle (about 5 minutes).
- **Rolling back across saves.** A pre-S-010 build has no storage code, so it ignores `gaffer.save`: the title shows only "New game" and the game plays as in S-009. The save stays in players' browsers untouched; rolling forward again offers "Continue" if the save still decodes (same `SAVE_VERSION`, same squads and match model). Nothing to clean up, nothing at risk.
- **Rolling forward with a changed save format.** Any later deploy that changes the format, squads, streams, the match model or the AI-side policy must bump `SAVE_VERSION` (ADR-0016); old saves then read as "no saved game" (no "Continue", no console error, no migration). There is no decoder-side model check: an unannounced change is caught by the existing goldens in `ci:test` before merge, and the bump is the deploy-side rule.
- Failure detection: a red `smoke` marks the deploy run red (including the seeded-storage, reload and "Continue" probes on the live origin); a golden save text that stops decoding shows as a red `ci:test` before merge.
- Data: the only persisted data is one client-side key per player, about 13 KB average (about 51 KB worst case, under the 64 KB guardrail), no server data, no personal data. Blast radius: one static page and the player's own browser.
- Result stability: no new RNG stream and no change to any result, schedule or squad for any seed; a continued season equals an uninterrupted one by construction (the round-trip law).

### Wave: DEVOPS / [REF] Mutation testing strategy
nightly-delta, inherited from `CLAUDE.md`; `/nw-deliver` Phase 5 skipped. `stryker.config.mjs` today mutates `src/domain/**/*.ts` except `names.ts`, plus `src/app/state.ts`; thresholds high 85, low 70, break 70. **This story widens `mutate`** (see below) and never touches the thresholds.
- `src/domain/selection.ts` (`isLegalXI`): INSIDE the existing glob. Killed by the DISTILL table (11 distinct indices, wrong count, duplicate, out of range, wrong position, wrong formation).
- `src/app/state.ts` (the `Continue` handler, the handler table, the exported `sidesFor`): INSIDE. Killed by `Continue` from `title` returning the payload and `toBe` no-ops elsewhere, the whole S-001..S-009 `update` suites, and the 40-action property.
- `src/app/save.ts` (the strict structural decoder, `saveTextFor`, `encodeSave`; the logic where mutants matter most) and `src/adapters/save-store.ts` (probe, degrade, failed-write removal, autosave): **DELIVER adds `src/app/save.ts` and `src/adapters/**/*.ts` to `mutate`** in the S-010 PR (ADR-0016 Enforcement amendment; CLAUDE.md requires an ADR for changes to what a `ci:*` script checks, and this strengthens it). `stryker.config.mjs` is not in the lock list. DELIVER measures a local mutation baseline for the new files and records it; thresholds are never lowered. Fallback only if the PR guard rejects the edit (the file's own comment says the factory cannot edit it): an owner request, and the property tests, the golden pair and the fault-injection tests are the guard.
- `src/ui/screens/title.ts` and `src/main.ts` stay outside (`src/ui/` and `main.ts` never were); covered by the e2e and the grep tests.
- Runtime watch: the widened `mutate` re-runs the round-trip sweep and the fast-check properties per mutant; see Open questions 3.

### Wave: DEVOPS / [REF] Observability stack
Browser console plus Playwright smoke on the deployed URL only. No RUM, error tracking, logs or tracing. The adapter and decoder write nothing to the console by design (D6), so the e2e "0 console errors" check is the only runtime signal for storage faults. SLO: smoke green per deploy (including the seed-31 reload and "Continue" probe). Alerting: a red `deploy` run; a red nightly opens `mutation-alarm`. No dashboards.

### Wave: DEVOPS / [REF] Branching strategy
Trunk-based. Short-lived `claude/S-010-*` branches, PR to main, squash merge, deploy on merge, no release branches. CI green and protected scenarios not regressing. DESIGN estimates the DELIVER diff at about 863 lines (about 1,113 with protected), under the 1200 guard, so no cut is needed; the DELIVER checkpoint (projected grand total above about 1,000 after the first green commit: apply levers 1 to 3) and the ordered trim levers are in DESIGN Component decomposition. Slices 01 and 02 ship in ONE DELIVER merge; if DELIVER nears the guard, trim test duplication (the 2400-state sweep can become a seeds 1..60 sample), never split the slices.

### Wave: DEVOPS / [REF] Coexistence matrix
| Component | S-010 impact | Action |
|---|---|---|
| `ci.yml`, `deploy.yml`, `nightly.yml`, `ci:*` scripts, `playwright.config.ts` | none; Pixel 7, 390px, `BASE_URL` fit; no new script or dependency | reuse |
| `stryker.config.mjs` | `state.ts` and `selection.ts` already inside the globs; DELIVER adds `save.ts` and `src/adapters/**/*.ts` to `mutate` (ADR-0016 amendment; not locked; thresholds untouched) | DELIVER edits |
| `scripts/guards/pr-guards.mjs` | determinism grep and 1200 cap fit | none |
| `.oxlintrc.json` | gains the D11 overrides (a strengthening, unlocked path) | DELIVER edits |
| `tests/protected/S-001..S-009/` | untouched; they start with "New game" in fresh contexts, where the title is exactly today's | must stay green |
| `tests/protected/S-010/` | locked scenarios (plan run, pins P1-P5); P5 plays a full season (28 taps) plus a reload | must pass on main |
| Amend list (`tests/e2e/S-008-season.spec.ts`, the reload test at line 478 and the header comment) | title reworded, every assertion kept, "Continue" visible added | replace, never weaken, in the same commit as the production change |
| `tests/acceptance/S-009/existing-navigation-unchanged.test.ts` (five-key test), `focusPlan` suites, `renderers-never-move-focus` | unedited (no state key added; the new adapter is outside `src/ui`) | reuse, regression-watch |
| `tests/e2e/S-001..S-009*.spec.ts`, `shell.spec.ts` | one `goto` per test in a fresh context; "New game" found by non-exact name, which "Continue" does not match | reuse, regression-watch |
| `src/app/state.ts`, `seed.ts`, `selection.ts`, `title.ts`, `main.ts`, `styles.css`, new `save.ts`, `save-store.ts` | extended / created | S-001..S-009 tests guard |
| `docs/product/architecture/brief.md`, `adr-0016`, `design-system.md` | updated in DESIGN | none |
| Pages artifact, base path `/gaffer/`, shared `<owner>.github.io` origin | negligible growth; storage key namespaced | none |

**Constraint for the protected scenarios and DISTILL (timeouts).** As in S-009: the locked runner `scripts/factory/protected.playwright.config.ts` sets `timeout: 20_000` per test, `expect` and `actionTimeout` 2 s, `retries: 0`, `workers: 4`. Any protected S-010 scenario that plays more than a few matchdays must call `test.setTimeout(90_000)`; P5 (28 taps, a reload, the End of season reads) certainly does, and P2 (two contexts, 3 matches each, plus reads) should. One seed and one club per scenario; keep reads per matchday minimal; per-action 2 s is unchanged and enough for one tap. Four parallel workers each simulate a season, so headroom matters. The agent e2e (`playwright.config.ts`: 30 s per test, `retries: 1` in CI) needs `test.setTimeout` for the multi-context seed-31 test; `retries: 1` re-runs a failed test in a fresh context, so storage-seeded tests stay independent.

### Wave: DEVOPS / [REF] Pre-requisites
- S-009 delivered and deployed; Pages source "GitHub Actions" enabled (✓). Node 22+, pnpm 10.12.4, Playwright chromium via `.github/actions/setup`.
- ADR-0001..0016 accepted (✓; ADR-0016 landed in DESIGN). `docs/product/jobs.yaml` has J-10 (✓).
- **`tests/protected/S-010/`** does not exist yet. It is written by the plan run's protected-scenarios step from the D8 pin list (append-only, with `test.setTimeout(90_000)` per the constraint above) and must be committed before DELIVER starts; the `ci` no-regression check expects it to fail on main until DELIVER.
- `BASE_URL` derived from owner and repo name (no secret).

### Wave: DEVOPS / [REF] Open questions
Owner-only items inherited from S-001..S-009 (smoke `sleep 20`, no security scanning, no commit-SHA check in smoke, deploy not gated on `ci`, squash revert blocked by append-only guards, no uptime probe, WebKit not probed; see `docs/feature/S-007/feature-delta.md` to `S-009/feature-delta.md`) are unchanged and none block S-010. New:
1. **Stryker scope (decided, no longer an owner request)**: DELIVER adds `src/app/save.ts` and `src/adapters/**/*.ts` to `mutate` in the S-010 PR as an ADR-0016 amendment, with a local baseline and no lowered threshold. Only if the PR guard rejects the edit does it fall back to an owner request. `src/ui/screens/*.ts` and `main.ts` remain outside (inherited S-009 question 2).
2. **Browser coverage**: storage behaviour (blocked, quota, private mode) is probed in Chromium only, by init-script simulation, not by a real private-mode or WebKit/iOS Safari run. Real engines differ in when `SecurityError` or `QuotaExceededError` fires; the design is robust to that (every call sits in a try/catch and the probe round-trips a sentinel), but only the simulated faults are tested. Owner awareness only.
3. **Nightly runtime**: the widened `mutate` re-runs the round-trip sweep and the properties per mutant, and `state.ts` mutants re-run them already. DELIVER keeps the sweep bounded (a trimmed seed sample is allowed) and `numRuns` at 100/200; watch the first nightly after the merge against the 45-minute timeout; if it nears it, trim test cost, not bounds, or the owner raises the timeout.
4. **Smoke on the live URL** runs the S-010 spec in fresh contexts on the shared `<owner>.github.io` origin: init-script seeding is per context, so it cannot touch a real player's storage; it relies on `?seed=` on Pages (as S-001..S-009).
5. **MDN Web Storage semantics** in DESIGN Technology choices are unverified (no lookup tool in that run); DELIVER may check them with Context7 and amend that bullet only. The e2e fault simulations do not depend on it.
6. Changes needed in locked paths: none (`stryker.config.mjs`, `playwright.config.ts` and `.oxlintrc.json` are not locked).
7. Missing `tests/protected/S-010/` (see Pre-requisites) is a plan-run item, not a DEVOPS change; flagged for the orchestrator.

### Wave: DEVOPS / [REF] Peer review
No per-wave review (none triggered); covered by the architect review (DESIGN peer review cycle 1) where it overlapped: the Stryker scope and "locked" wording, the failed-write rule, the 64 KB guardrail, the dropped replay-verify and the storage-state matrix were corrected here in the same revision.

## Plan run: protected scenarios

`tests/protected/S-010/save-and-continue.spec.ts` holds 5 black-box scenarios (Pixel 7, 390px; roles, accessible names and visible text, plus the S-006 "innermost element whose whole text matches" scan for the score line and the End of season lines). They pin only the durable clause (DISCUSS D9): with a saved game the title offers "Continue" (exact name, 44px or taller) and without one it does not; "Continue" restores the saved club with its formation, Starting XI, recorded results and next matchday, and the season carries on exactly as one played without a reload (same seed, same season); "New game" always starts a fresh game. Every reload happens while the club home is showing, so the scenarios also hold if a later version makes "Continue" restore the last screen (the club-home landing is version-only). Clubs and players are read from the "Clubs", "Squad", "Starting XI" and "Players" lists, so no generated name is pinned and the reference figures of US-1 stay unit and e2e goldens for DISTILL. Every scenario checks no console errors; three check no sideways scroll at 390px.

1. **P1, offer** (`?seed=31`, 4th club). A fresh browser's title has no "Continue" and has "New game"; after a club is picked, a reload shows exactly one h1, focused, with "Continue" (44px or taller) and "New game".
2. **P2, resume and determinism** (`?seed=31`, 3rd club; `test.setTimeout(90_000)`). Two matches, then the table (every row P 2); reload, "Continue": the club's home with its h1 focused, the identical table, "Play match" offered and reading "Matchday 3". The Matchday 3 screen (h1, score line, Goals list) and the table after it equal those of a fresh browser that plays 3 matches with the same seed and club without reloading.
3. **P3, team sheet** (`?seed=31`, 1st club). "4-3-3" checked in Tactics, the last MF slot given a midfielder outside the XI (the S-005 pick path); reload, "Continue": exactly "4-3-3" checked, and the Starting XI lists the same 11 slot texts.
4. **P4, New game stays fresh** (`?seed=31`, 2nd club). "4-2-3-1" and one match, reload ("Continue" offered), "New game", the same club: every row reads P, W, D, L, GD and Pts 0 in A to Z order, "4-4-2" is checked, and "Play match" reads "Matchday 1".
5. **P5, finished season** (`?seed=31`, 5th club; `test.setTimeout(90_000)`). All 14 matchdays, then the End of season lines and the table; reload, "Continue": no "Play match", and "End of season" shows the same "Final position" and "Top scorer" lines, and "Table" the same final table.

Not pinned, by design (version-only or unit/e2e level): where "Continue" lands, the "above New game" order, the h1 text "Gaffer", the save replacement timing (D4), the address seed being ignored (D5), every storage-fault path (D6: damaged, version 0, blocked, full at load, full mid-session), and the save format and key.

All 5 fail on the current app at the first "Continue" check (no saved game is ever offered). The plan run checked the rest of each scenario against the real app: a throwaway copy (not committed, deleted) with the reload-and-Continue step replaced by staying on the club home, and the title check without "Continue", passed 5 of 5 under the locked runner in 7.3 s, so every other step (table, Tactics, Starting XI pick, New game freshness, the uninterrupted comparison, the 14-matchday season) is known to hold. A throwaway save prototype in `src/` was not run in this plan run (plan runs do not implement features), so DELIVER is the first to run the Continue path end to end.

## Wave: DISTILL

Lean, unattended, all approvals pre-answered. Reconciliation passed: 0 contradictions between DISCUSS, DESIGN and DEVOPS (DESIGN's ADR-0016 folds in DISCUSS D6, the 64 KB guardrail and the named fixtures; DEVOPS' storage-state matrix matches). `tests/protected/S-010/` was not opened. Language: TypeScript, vitest + fast-check (`FC_SEED` honoured through `tests/setup/fast-check-seed.ts`), Playwright on the Pixel 7 profile. Project conventions win (`describe`/`it` files named after the behaviour, as S-009).

**Commit state (read this first).** The repo forbids committed failing, skipped, `.only`, `.todo` tests (PR guard check 4), so the suite is green at hand-off by construction, as in S-006..S-009: tests that pass today are committed; the not-yet-passing ones are complete, run-checked `*.pending` files in `docs/feature/S-010/distill/pending/` (outside every glob), moved in with `git mv` in the DELIVER commit that makes them green. Index, order and mechanics: `distill/pending-scenarios.md`. RED gate: `distill/red-classification.md`.

### Wave: DISTILL / [REF] Scenario list with tags
Tags: `@walking_skeleton @driving_port @real-io @property @error @boundary @regression @contract-shape:<shape>` on every case. No new walking skeleton (brownfield); the two `@walking_skeleton` cases are the end-to-end proofs ("a season spans visits").

| Scenario (outcome clause) | File | Layer | Tags | State |
|---|---|---|---|---|
| Fresh title: h1 "Gaffer" focused, tall "New game", no "Continue"; New game fresh, also after a reload (D2, D4) | `tests/e2e/S-010-club-home-regression.spec.ts` | e2e | `@walking_skeleton @regression` | committed, green |
| Two matches, reload: "Continue" above "New game" (44px, focused h1), 1 tap to the focused club home, same table, "Matchday 3" `Netherwold Borough 2–1 Oakhampton Rise Borough` in 2 taps (K1, D2, D3) | `S-010-save-continue.spec.ts.pending` | e2e | `@walking_skeleton @driving_port @real-io` | held out |
| "Continue" ignores `?seed=abc`; "New game" there lists the other league (D5) | same | e2e | `@boundary @real-io` | held out |
| "New game" alone keeps the save; a club pick replaces it (D4) | same | e2e | `@boundary @real-io` | held out |
| Finished season, "Play again", reload: "Continue" lands on "End of season" with the same lines (D4, D7, D3) | same | e2e | `@boundary @real-io` | held out |
| Damaged, version 0, foreign text: no "Continue", no console error, first club pick replaces it (D6) x3 | same | e2e | `@error @real-io` | held out |
| Blocked storage; full at load with a valid save inside (then writable, reload: still none); full mid-session (only `gaffer.save` writes fail) (D6) | same | e2e | `@error @real-io` | held out |
| The golden save text equals the played state's stored form; reference scores and table figures confirmed (DISCUSS figures hand-derived, now computed); damaged and version-0 fixtures derive from it | `save-inputs-pinned.test.ts` | unit | `@regression @boundary` | committed, green |
| No generated name contains "Continue" (D13) | `names-avoid-continue.test.ts` | unit | `@regression @error` | committed, green |
| Round trip over seeds 1..20 x 8 clubs x 0..14 matches (trimmed from 300, lever 1), finished season, 4-3-3 and a pick; save-golden pair (K2) | `save-round-trip.test.ts.pending` | unit | `@walking_skeleton @driving_port @property @boundary` | held out |
| Continued equals uninterrupted: fast-check 100 runs over random formation, pick, Play match with a restore at a random point (K2) | same | unit | `@property @driving_port` | held out |
| `Continue` from the title returns the saved game (saved seed beats the title's); `toBe` no-op elsewhere; "Play again" keeps the saved seed (D5) | same | unit | `@boundary @error` | held out |
| Size: constructed worst case (56 x 18 goals) and the seed-31 season under 64 KB | same | unit | `@boundary` | held out |
| 30 rejection rows (version, seed, club, formation, XI x4, log x7, goals x5, root) give "no saved game", never throw, never log; extra keys ignored; arbitrary strings, JSON, truncations, one-character changes (200 runs each); a forced throw inside `fromSave` is caught by `decodeSave` (K3) | `save-unreadable.test.ts.pending` | unit | `@error @boundary @property` | held out |
| Saving taps (Play match, formation, XI pick) write; Squad, Player, Table, Tactics, same formation, Starting XI, slot + Back, Back, New game, Continue, End of season, Play again do not; D4 timing through `createAutosave`; failed write retried (T1/T2/T1); a throwing store or state never reaches `dispatch` | `save-triggers.test.ts.pending` | unit | `@driving_port @error @boundary` | held out |
| Adapter faults: working store, odd reads, blocked, full at load (removes the stored game), degraded write removes a reappeared game, silent no-op write, failed write during play removes the game and retries, throwing removal swallowed | `save-store.test.ts.pending` | unit | `@real-io @error @boundary` | held out |
| `isLegalXI`: automatic XI of every formation legal; 7 illegal rows; property (every pick Sam can make is legal) | `legal-xi.test.ts.pending` | unit | `@boundary @error @property` | held out |
| Grep tests (folded into the store file): storage named only in the adapter and `() => localStorage` in `main.ts`; `main.ts` calls `decodeSave` never `fromSave`; one `type: "Continue"` dispatch in the title, at most two `dispatch(`; adapter never logs, probes `gaffer.probe`, imports no UI | `save-store.test.ts.pending` | unit | `@boundary @error` | held out |

Error and edge share: 33 of 40 acceptance test definitions (86 cases once table rows are counted) and 10 of the 11 held-out e2e are `@error` or `@boundary` (well over 40%). Tier B (state-machine PBT) is not declared: the journey is Tier A shaped and the fast-check sequence property over the real reducer already models it (the "reachable states" space is `update` itself). Per-layer PBT: `@property` cases are layer 1-2 only (pure functions, in-memory fakes); e2e are example-only with enumerated sad paths. Contract shapes: pure functions `pure-function`; adapter, autosave, title, e2e `bounded-change`; none is `unbounded-preservation`.

### Wave: DISTILL / [REF] WS strategy
Architecture of Reference, no per-feature strategy: driving = the real built app in Chromium (Pixel 7, 390px) and the pure `update` and save functions; driven internal = browser `localStorage`, real in e2e (Playwright context) and an in-memory fake `SaveStorage` in unit (it can never model real quota or private-mode behaviour: only simulated, DEVOPS open question 2); driven external / non-deterministic = none (no clock, randomness or network in the save). Policy file `docs/architecture/atdd-infrastructure-policy.md` is absent: not bootstrapped, because this repo records its test mechanisms in the feature deltas and ADRs (recorded as a deviation).

### Wave: DISTILL / [REF] Adapter coverage table
| Adapter | @real-io scenario | Covered by |
|---|---|---|
| `localStorage` through `createSaveStore` (the one driven adapter) | YES | e2e: reload and Continue (real storage in the browser context), seeded damaged / version 0 / foreign text, blocked, full at load, full mid-session (init scripts on the real Storage); unit: fault catalogue with injected storages |
| `main.ts` composition root (probe, offer, autosave wiring) | YES | e2e as above, plus `save-source` grep tests |

### Wave: DISTILL / [REF] Scaffolds
Committed (Mandate 7; each carries `__SCAFFOLD__` and throws an `Error`, never an import error; `grep -r __SCAFFOLD__ src/` must be empty after DELIVER): `src/app/save.ts` (`SAVE_VERSION`, `SaveData`, `toSave`, `fromSave`, `encodeSave`, `decodeSave`, `saveTextFor`), `src/adapters/save-store.ts` (`SaveStorage`, `SaveStore`, `createSaveStore`, `createAutosave`), `isLegalXI` in `src/domain/selection.ts`, and `Action` gaining `{ type: "Continue"; game: GameState }` with a throwing `case "Continue"` in `update` (typecheck, lint and all existing suites stay green; DELIVER step 2 replaces it with the handler table). `src/ui/screens/title.ts` and `src/main.ts` are not scaffolded: their tests are e2e and grep tests, which fail on missing behaviour. Constants an implementer must not re-derive: `SEED_31_SAVE_TEXT` in `tests/acceptance/S-010/save-golden.ts`.

### Wave: DISTILL / [REF] Test placement
`tests/acceptance/S-010/*.test.ts` (vitest `include` already matches; precedent S-001..S-009), helpers `save-world.ts` and data `save-golden.ts` beside them (precedent `season-oracle.ts`, `season-end-reference.ts`); `tests/e2e/S-010-*.spec.ts` (Playwright `testDir`; DEVOPS names `S-010-save-continue.spec.ts`; the club-home regression follows `S-00N-club-home-regression.spec.ts`). Held-out sources: `docs/feature/S-010/distill/pending/{acceptance,e2e}/`.

### Wave: DISTILL / [REF] Driving Adapter coverage
Driving port = the browser page (title, "Continue", club home, Table, Tactics, Starting XI, Play match, End of season, Back, `page.reload()`): every e2e above enters there. No CLI, endpoint or hook. In-process driving ports: `update` (with `Continue`), `encodeSave`, `decodeSave`, `saveTextFor`, `createSaveStore`, `createAutosave`, `isLegalXI`. Brief ports 36-39 are each covered: 36 (format and strictness) by round-trip, unreadable and legal-xi; 37 (Continue action) by round-trip; 38 (adapter) by save-store and e2e; 39 (title) by e2e and save-source.

### Wave: DISTILL / [REF] Pre-requisites
DESIGN ports above and ADR-0016; DEVOPS storage-state matrix (empty, valid, damaged or incompatible, blocked, full at load, full mid-session; all covered, "blocked entirely, residual" by the unit throwing getter) on local-preview; `tests/protected/S-010/` exists from the plan run (not opened here). Seeding follows the DEVOPS note: init scripts re-run on every navigation, so seeds are written once per tab (a `sessionStorage` marker), and cookies flip a fault on or off (`writable`, `failing`) between steps. The agent e2e config (30 s per test, `retries` 1 in CI): the season test uses `test.setTimeout(90_000)`.

### Wave: DISTILL / [REF] Mandate-12 and completeness notes
Step bodies are plain `it`/`test` code over production services (no step-method DSL in this repo: informational step-reuse ratio not applicable). Domain types are the production types (`GameState`, `Action`, `FormationId`). AT-completeness: C1-C7 covered by the rows above; no SPECIFICATION_AMBIGUITY found. DISCUSS' hand-derived table figures were confirmed with the domain code (see `save-inputs-pinned`). Upstream issues: none.

### Wave: DISTILL / [REF] Open points for DELIVER
1. **Size**: the DISTILL files total about 830 held-out plus 155 committed lines of tests (DESIGN estimated 566), and DELIVER code about 297, so the DELIVER-plus-DISTILL branch diff projects to about 1,280 against the 1,200 PR guard (docs excluded; the protected file is already on main). Apply DESIGN's trim levers when the checkpoint trips: drop `save-source` (42 lines, keep only the `main.ts` and storage-name greps in `save-store`), fold `legal-xi` into `save-unreadable`, parametrise the three seeded e2e (already one loop), shorten comments; the numbers of cases stay.
2. **Amend patch**: `git apply docs/feature/S-010/distill/pending/amend-existing-tests.patch` in the step-4 commit (S-008 e2e reload test reworded plus "Continue" visible; S-009 test title reworded; assertions unchanged).
3. **Stryker**: `save.ts` and `src/adapters/**/*.ts` into `mutate` per ADR-0016; `isLegalXI` rows are written to kill its mutants.
4. **Review fold-in (coordinator)**: `createAutosave(write, lastText)` now takes only the write capability `(text) => boolean` (`main.ts` passes `store.write`), in the scaffold, the held-out tests and ADR-0016 (amended; the DESIGN rows above still say `store`). `save-source` is folded into `save-store`. A new e2e keeps the 4-3-3 team sheet through Continue. `createSaveStore` is the driven adapter under test.
5. **State-delta waiver**: no `tests/common/state_delta.ts` port exists in this repo; universes are asserted directly as port-exposed values (returned text, restored `GameState`, written texts, remaining storage entries), which is the Mandate 8 intent. Waived for this project; a port may be bootstrapped later.
6. **Suggested DELIVER order**: (1) `isLegalXI` + `legal-xi`; (2) `save.ts`, the `update` handler table with `Continue`, `save-round-trip`, `save-unreadable`, `save-triggers` (the `saveTextFor` cases); (3) `save-store.ts` with `save-store` and the `createAutosave` cases of `save-triggers`; (4) `title.ts`, CSS (`button.secondary`, 44px), `main.ts`, `.oxlintrc.json`, `save-source`, the e2e spec and the amend patch.


## Wave: DELIVER

### Wave: DELIVER / [REF] Implementation summary
The season now survives a reload (ADR-0016). A pure, strict, versioned save format (`encodeSave`, `decodeSave`, `saveTextFor`) sits behind a probing `localStorage` adapter (`createSaveStore`, `createAutosave(write, lastText)`). The title shows "Continue" above "New game" only when a readable save exists; `Continue` restores the saved game and lands on the club home. Saving taps (club, formation, Starting XI pick, Play match) autosave; a failed write removes the stored save; blocked, full or unreadable storage means no "Continue" and no console errors. `update` became a handler table, and `isLegalXI` guards restored team sheets.

### Wave: DELIVER / [REF] Files modified
- New: `src/app/save.ts`, `src/adapters/save-store.ts`, `tests/acceptance/S-010/*` (legal-xi, names-avoid-continue, save-inputs-pinned, save-round-trip, save-store, save-triggers, save-unreadable, helpers), `tests/e2e/S-010-save-continue.spec.ts`, `tests/e2e/S-010-club-home-regression.spec.ts`.
- Changed: `src/app/state.ts` (handler table, `Continue`), `src/app/seed.ts`, `src/domain/selection.ts` (`isLegalXI`), `src/main.ts`, `src/ui/screens/title.ts`, `src/ui/styles.css`, `.oxlintrc.json`, `stryker.config.mjs` (mutate scope), ADR-0016 (amended to `createAutosave(write, lastText)`).
- Amended without weakening (D7): `tests/e2e/S-008-season.spec.ts`, `tests/acceptance/S-009/existing-navigation-unchanged.test.ts`.
- Commits: 629959d (01-01), 300687a (01-02), 3e814a3 (01-03), 814b38e (01-04), d5e53be (01-05), 699abef (01-06), then refactor and test tidy-ups cd97745, 95a57c3, de99697.

### Wave: DELIVER / [REF] Scenarios green
`ci:test`: 58 files, 1124 tests passed, including all `tests/acceptance/S-010/*` cases. The S-010 e2e specs (reload and Continue, D4 timing, D5 seed, damaged, version 0, foreign text, blocked, full at load, full mid-session, club-home regression) were added in step 01-06; `ci:e2e` was not re-run at finalization. `tests/protected/S-010/` was not run locally; CI runs it on main.

### Wave: DELIVER / [REF] DoD check
- Protected S-010 passes on main: verified by CI, not run locally.
- Round trip, continued equals uninterrupted, save triggers, unreadable inputs, swallowed storage failures, removal on a failed write, names check: met (unit and property).
- e2e phone smoke for the storage-state matrix: specs committed; not re-run at finalization.
- D7 amendments replace, never weaken: met.
- `ci:*` scripts: lint, typecheck and test green. No ambient randomness or clock in `src/domain/`: met.
- PR size guard (1200 lines, docs excluded): the branch diff is about 1,130 changed lines of code and tests against main, under the guard.

### Wave: DELIVER / [REF] Quality gates
Roadmap: 6 steps, all DONE; `des-verify-integrity` passed ("All 6 steps have complete DES traces"). `ci:lint`, `ci:typecheck`, `ci:test` (1124 passed) green. Mutation testing is nightly-delta, so `/nw-deliver` Phase 5 was skipped; the first nightly run gives the baseline for `src/app/save.ts` and `src/adapters/**` (now in Stryker `mutate`).

### Wave: DELIVER / [REF] Open questions (from `open-questions.md`)
1. Step 01-02 and 01-06 RED were SKIPPED (NOT_APPLICABLE: spec activation against a throwing scaffold, or behaviour already implemented in 01-05). The reviewer flagged this as weak RED evidence. Nothing was backdated.
2. Mutation baseline for `save.ts` and `src/adapters/**` (ADR-0016 Enforcement) is not measured; thresholds unchanged.
3. The DESIGN rows above still say `createAutosave(store, ...)`; ADR-0016 and DISTILL amended it to `createAutosave(write, lastText)`.
