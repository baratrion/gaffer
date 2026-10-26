# S-010: Save and continue my season

## Wave: DISCUSS

Lean, unattended, revision 1. Reuses `discuss/journey.md` and `slices/slice-01..02`. North star: "manage one fictional club through one short season, on a phone browser, start to finish". Vision: 5-minute sessions on the bus. S-008 made a season of 14 matchdays and S-009 closed it with "End of season" and "Play again", but S-007, S-008 and S-009 all say "Results are kept until the page is reloaded": a season takes more than one sitting, and a reload, a closed tab or a phone that drops the page loses it. scope.md IN says: "Save and continue in the browser (localStorage)". S-009's DISCUSS named save and continue as next. The smallest next visible increment: the game saves itself after every tap that changes it, and after a reload the title screen offers "Continue", which lands on the saved club's home with everything as it was. Narrowed by scope.md precedence (ship less): several save slots, a save list, a "Delete save" button, export or import, sync, and restoring the exact screen are cut. Feature type: user-facing. UX depth: lightweight. Walking skeleton: no (brownfield, extends S-001..S-009). JTBD: yes, new job J-10. No DIVERGE artifact (accepted as lean, as for S-002..S-009).

### Wave: DISCUSS / [REF] Scope Assessment
PASS: 2 small user stories with 8 scenarios in total (4, 4), 1 roadmap story, one new button on an existing screen and one demonstrable outcome ("I reload and carry on where I was"). One new seam: browser storage, behind a pure save format and a thin shell adapter (ADR-0003 functional core, imperative shell). No new screen. 2 carpaccio slices, one release: both ship in ONE DELIVER merge, with no separate release of slice 01, so a "Continue" that drops the player's formation or Starting XI, or a title screen that a damaged save can break, never ships. About 1 to 1.5 days. Integration points: app state (formation, XI, results), title screen, club home, browser storage, the address's seed: 5, at the limit, not over it. No oversized signal: slots, deletion, export and sync are cut (Out-of-scope).

Line budget (changed lines, code plus tests; file names are indicative, and DESIGN names the files). The one hard cap is the 1200-line PR guard.

| File | Kind | Lines |
|---|---|---|
| Save format: pure encode and decode with a version number and strict validation (for example `src/app/save.ts`, new) | code | 90 |
| Storage adapter and save-after-dispatch wiring in the shell (`src/main.ts` or a small shell module) | code | 35 |
| Continue: building the restored state, plus the refactor of `update` and the `render` switch to lookups that S-009 DESIGN's Open questions require before the next action (`src/app/state.ts`, `src/main.ts`) | code | 45 |
| `src/ui/screens/title.ts` ("Continue" above "New game"), `src/ui/styles.css` | code | 15 |
| `tests/acceptance/S-010/*.test.ts` (round trip, strict decode, unreadable inputs, the save triggers, the D4 timing, D5 seed, names check) | tests | 220 |
| `tests/e2e/S-010-save-continue.spec.ts` (what protected does not cover: D4 timing, D5, unreadable save, blocked and full storage) | tests | 110 |
| Amended non-protected S-008 e2e title and assertion (D7) | tests | 10 |
| **DELIVER total** (code 185, tests 340) | code and tests | **525** |
| `tests/protected/S-010/*.spec.ts` (written in the plan run, outside DELIVER; estimate) | tests | 250 |
| **Grand total** (with protected) | code and tests | **775** |

### Wave: DISCUSS / [REF] Persona
Sam, 34, a lapsed Championship Manager fan. He plays on the bus, one-handed, on a mid-range Android phone 390px wide, with 5 minutes to spare (persona from `docs/feature/S-001/feature-delta.md`). A season is 14 matches; he plays two or three per trip. His browser drops the tab between trips, and today that wipes the season.

### Wave: DISCUSS / [REF] JTBD one-liner
When I come back to the game after a break, I want to pick up my season where I left it, so that my club and my results carry on across short sessions. (Recorded as J-10 `carry-on-my-season` in `docs/product/jobs.yaml`. It makes J-08 "play out my season" possible across visits.)

### Wave: DISCUSS / [REF] Glossary
- **Saved game**: what the browser keeps for the player between visits: the league's seed, the managed club, the formation, the Starting XI (including the player's own picks) and the recorded results. It does not hold which screen was open. There is one saved game per browser.
- **Saving tap**: a tap that changes the saved game: picking the club, choosing a formation, picking a player for a Starting XI slot, and "Play match". Navigation ("Squad", "Table", "Back", etc.) changes nothing, so it does not save.
- **Continue**: the title-screen button that restores the saved game and lands on the saved club's home.
- **Unreadable save**: stored data that is not a complete, valid saved game of this version: damaged, from an incompatible older version, or inconsistent with its own league. It counts as no saved game.
- **Storage unavailable**: the browser refuses to read or write site storage (blocked by a setting, a private mode, or full).
- **Uninterrupted season**: the same seed, club and choices played in one visit without a reload. A continued season must equal it.
- **Recorded result**, **Standings**, **Table row**, **Untouched tactics**, **Score line**, **Next matchday**, **End of season screen**: as in S-006..S-009.

### Wave: DISCUSS / [REF] Locked decisions
- D1 Automatic save, no Save button: once a club has been picked, the game is saved in the browser automatically after every saving tap: picking the club, choosing a formation, picking a Starting XI player, and "Play match". Saved: the league's seed, the managed club, the formation, the Starting XI (including the player's own picks) and the recorded results. Not saved: which screen was open.
- D2 Title screen: when a saved game exists, the title screen shows a button named exactly "Continue" (44px or taller) above "New game". The title's h1 ("Gaffer") stays, is focused on load, and is the only h1. When no saved game exists (first visit, or a fresh browser) there is no "Continue" button and the title is as before.
- D3 Continue lands on the club home of the saved club, with focus on its heading (the club's name). Everything is as it was before the reload: the Table screen shows the same rows (the same text in every cell), Tactics has the saved formation checked, the Starting XI screen lists the same 11 slot texts, and when N matches had been played the next "Play match" plays matchday N+1. A finished season shows "End of season", not "Play match", and the End of season screen shows the same "Final position" and "Top scorer" lines. The rest of the season played after Continue equals the uninterrupted season (the same match screens, the same table): saving and continuing changes nothing in the game.
- D4 New game with a saved game present: "New game" still starts a fresh game from the address's seed exactly as before: after picking a club the table is all zero in A to Z order, Tactics has 4-4-2 checked, the XI is the automatic one, and the next "Play match" is "Matchday 1". Tapping "New game" or "Play again" does not remove the saved game by itself; the save is replaced as soon as a club is picked in the new game. This replacement timing is a rule of this version only.
- D5 One save slot: Continue resumes the saved game whatever "?seed=" the address holds now, because the save carries its own seed. After Continue, "Play again" keeps the saved game's league (S-009: "the same seed"). Not protected-tested; unit and e2e tested.
- D6 Safety: an unreadable save, or browser storage that is unavailable or full, gives no "Continue" button; the game plays as before and logs no console error. A failed save never interrupts play and logs no console error.
- D7 Amendment: S-007, S-008 and S-009 said "Results are kept until the page is reloaded". From S-010 on, a reload keeps the saved game, reachable through "Continue". Their durable lists are unchanged. Their protected scenarios always start with "New game" in a fresh browser context, so they are unaffected. Non-protected test to amend (replaced, never weakened): `tests/e2e/S-008-season.spec.ts`, the test "Reloading the page after two matches shows the title screen again ... (the season is lost, there is no save yet)". Its assertions stay true (New game starts fresh). Its title is reworded, and it gains a check that "Continue" is offered after the reload. DISTILL fixes the final list.
- D8 Protected pin list (written later by the plan run's protected-scenarios step; each must fail on today's app, which has no "Continue"):
  - P1: in a fresh browser the title has no "Continue". After "New game", picking a club and reloading, the title shows "Continue" (44px or taller) and "New game", with exactly one h1.
  - P2: at `?seed=31`, play 2 matches and read the Table; reload; tap "Continue". The h1 is the club's name and has focus, and the Table is identical. "Play match" shows "Matchday 3". That match screen, and the table after it, equal those of a fresh browser that plays 3 matches with the same seed and club without reloading.
  - P3: choose 4-3-3 in Tactics and swap a Starting XI slot to a non-starter; reload; tap "Continue". Tactics has 4-3-3 checked, and Starting XI shows the same 11 texts.
  - P4: with a saved game, reload. After first asserting that "Continue" is offered, tap "New game". The same club, once picked, shows an all-zero table in A to Z order and 4-4-2 checked, and "Play match" shows "Matchday 1".
  - P5: play all 14 matchdays and read the End of season lines; reload; tap "Continue". The club home shows "End of season" and no "Play match", and the End of season screen shows the same lines.
  - In all of them: no horizontal scroll at 390px and no console errors. Locators use `exact: true` ("Continue", "New game", the h1).
- D9 Durable (holds in every later version): with a saved game the title offers "Continue" (exact name), and without one it does not. "Continue" restores the saved club with its formation, Starting XI, recorded results and next matchday. "New game" always starts a fresh game. Version-only: Continue lands on the club home (a later version may restore the last screen); D4's replacement timing.
- D10 Phone first and regression: buttons 44px or taller, no horizontal scroll at 390px, no console errors, text through `el()`/`textContent` (ADR-0002), focus on the new h1 after every navigation (ADR-0008). Every S-001..S-009 protected scenario stays green. Deterministic game logic is unaffected: nothing in the save uses wall-clock time or randomness, and nothing in `src/domain/` touches storage.

### Wave: DISCUSS / [REF] Story map and priority
Backbone: **open the game (title: Continue or New game)**, pick club, club home, squad, tactics, starting XI, play next match, see table, end of season, play again. Walking skeleton: the existing S-001..S-009 loop. This story makes it span visits. One release with two thin slices, both shipped in ONE DELIVER merge (no separate release of slice 01):
1. `slices/slice-01-save-and-continue.md` (US-1): automatic save of the seed, club and results; "Continue" on the title; land on the club home with the same table, the next matchday and a finished season's End of season; "New game" unaffected. Value 5 x urgency 5 / effort 2 = 12.5. It comes first because it is the season-across-sessions promise itself.
2. `slices/slice-02-team-sheet-and-safe-load.md` (US-2): the formation and Starting XI are saved and restored, an unreadable save or blocked storage never shows "Continue" or an error, and the save carries its own seed. 5 x 4 / 1.5 = 13.3, but it depends on slice 01. Without it a continued season can differ from the uninterrupted one (D3), and a damaged save could break the title screen.

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
| "New game" starts fresh from the address's seed; the save is replaced once a club is picked | 01 | durable (fresh); version-only (timing) |
| Continue ignores the address's "?seed=" | 02 | durable (one saved game carries its seed) |
| Unreadable save or unavailable or full storage: no "Continue", play as before, no console error | 02 | durable |
| No horizontal scroll at 390px, no console errors | 01, 02 | durable |

### Wave: DISCUSS / [REF] User stories
Fixtures from the real generator, read from `docs/feature/S-008/discuss/reference-season.md` and S-009's `discuss/reference-season-end.md` (untouched tactics: every side plays the automatic 4-4-2). At `?seed=31` "Netherwold Borough" (1st in the "Clubs" list) plays "Matchday 1": "Netherwold Borough 1–2 Marlbrook Athletic"; "Matchday 2": "Rushmoor Heath Albion 2–1 Netherwold Borough"; "Matchday 3": "Netherwold Borough 2–1 Oakhampton Rise Borough". After matchday 2 the table reads, top to bottom: Tarnbeck Borough (Pts 4, GD "+4"), Oakhampton Rise Borough (4, "+2"), Marlbrook Athletic (4, "+1"), Juniper Hollow United (3, "0"), Rushmoor Heath Albion (3, "-3"), Fennimore Town (2, "0"), Valebridge Albion (1, "-2") and Netherwold Borough (P 2, W 0, D 0, L 2, GD "-2", Pts 0). These table figures were worked out by hand from the reference season, and DISTILL confirms them with the domain code. The season ends with "Final position 3rd" and "Top scorer Garrick Thistlewood (5 goals)". The golden pick (S-006..S-009): in the Starting XI, slot "MF Calder Redfern 15" gets "Kestrel Northcott 6" (each number is the player's overall, as the S-005 screens print it). The default seed 20260 (`?seed=abc`) is a different league; its "Clubs" list includes "Oakhampton Rise Borough" and "Valebridge Town".

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
```
Notes: scenarios 1 to 4 are pins P1, P2, P5 and P4. D4's replacement timing (example 3) is version-only: it is tested by e2e and unit tests and is not pinned. Unit: the saving taps write and navigation does not; "Continue" yields a club-home state whose formation, XI and results equal the saved ones; `nextMatchday` after Continue is N+1, and `undefined` after 14; "New game" ignores the saved game.

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
2. Saved at `?seed=31` with Netherwold Borough after 2 matches, Sam opens a shared link `/gaffer/?seed=abc`. "Continue" still lands on "Netherwold Borough", and "Play match" is "Matchday 3", "Netherwold Borough 2–1 Oakhampton Rise Borough". "New game" instead lists the seed-20260 clubs ("Oakhampton Rise Borough", "Valebridge Town", ...).
3. The browser holds a damaged save (cut off halfway), or a save from an incompatible older format: the title has no "Continue" and works as on a first visit, with no console error. After "New game" and a club, a good save replaces it. With storage blocked (a privacy setting) or full: no "Continue"; Sam plays matchdays 1 and 2 with no console error; a reload loses the season, as before S-010.

**Acceptance criteria (embedded UAT)**
```gherkin
Scenario: Continue restores the formation and the Starting XI
  Given Sam at "?seed=31" managing "Netherwold Borough" has chosen "4-3-3" in "Tactics"
  And on "Starting XI" Sam has tapped "MF Calder Redfern 15", picked "Kestrel Northcott 6" and read the 11 slot texts
  When Sam reloads the page and taps "Continue"
  Then "Tactics" has the radio "4-3-3" checked
  And "Starting XI" lists the same 11 slot texts in the same order

Scenario: Continue resumes the saved game whatever seed the address holds
  Given Sam has a saved game of "Netherwold Borough" at "?seed=31" with 2 matches played
  When Sam opens "/gaffer/?seed=abc" and taps "Continue"
  Then the heading is "Netherwold Borough"
  And "Play match" shows "Matchday 3" and "Netherwold Borough 2–1 Oakhampton Rise Borough"

Scenario: An unreadable saved game is ignored
  Given the browser holds a saved game that is damaged, or from an incompatible older version
  When Sam opens "/gaffer/?seed=31"
  Then the title has no button named "Continue" and has "New game"
  And there is no console error
  When Sam taps "New game", "Netherwold Borough" and "Play match", and reloads
  Then the title offers "Continue", and it lands on "Netherwold Borough" with "Matchday 2" next

Scenario: Blocked or full storage never interrupts the game
  Given the browser refuses to read and write site storage, or its storage is full
  When Sam opens "/gaffer/?seed=31", taps "New game" and "Netherwold Borough", plays 2 matches and opens "Table"
  Then there is no "Continue" on the title, every screen works as before S-010, and there is no console error
```
Notes: scenario 1 is pin P3. Scenarios 2 to 4 are e2e and unit tests, not protected (D5, D6); the e2e seeds the storage before load (for example with a Playwright init script). Unit and property:
- the decoder never throws and returns "no saved game" for arbitrary strings, truncated or bit-flipped valid saves, a wrong version, an unknown club, an invalid formation, an XI that is not 11 different players in the formation's positions, and results that do not match the league's schedule (missing or extra matchdays, wrong fixtures, goals outside 0..9);
- a round trip over reachable states restores the same formation, XI, results and next matchday;
- the storage adapter swallows read and write failures silently.

**Outcome KPI:** K2, K3 (below).
**Technical notes (for DESIGN, not AC):**
- Pure encode and decode in the functional core, with an explicit version number and strict validation. Decode regenerates the league from the saved seed and checks every field against it. A failure means "no saved game"; partial restores are not allowed.
- A localStorage adapter in the imperative shell catches every exception (`SecurityError`, `QuotaExceededError`, access throwing on read) and writes nothing to the console.
- No timestamps or random ids in the save. A full season (56 results) stays small (guardrail below).
- Several tabs: last write wins (not tested; one player, one phone). Depends on US-1.

Notes for DESIGN and DISTILL (not part of the AC):
- "Has focus" means `document.activeElement` is the `<h1>`. Locators use `exact: true` for "Continue", "New game", "Play match", "End of season" and the h1.
- Each Playwright test uses a fresh browser context, so storage starts empty. `page.reload()` keeps the context's storage.
- A protected season is 28+ taps: one seed per scenario, and `test.setTimeout(90_000)` as headroom (S-008 and S-009 precedent).

Test intents for DISTILL (unit and property, not protected):
- Round trip: for states reached over seeds 1..300 x 8 clubs after each matchday 0..14 (untouched tactics), restore equals the saved formation, XI, results and next matchday. DISTILL may trim the sweep for runtime.
- Continued equals uninterrupted: fast-check (numRuns 100, fresh `FC_SEED`) over random formation, pick and Play match sequences with a save and restore at a random point. The rest of the season gives the same results and standings.
- Save triggers: club pick, formation, pick and Play match change the saved game; "Squad", "Player", "Table", "Tactics" with no change, "Starting XI", "Back", "End of season", "New game" and "Play again" do not.
- D4: after "New game" or "Play again" with no club picked, the stored game is the old one; after a club is picked, it is the new one.
- D5: restore uses the saved seed, not the address's.
- Unreadable inputs (US-2 notes) give "no saved game" and never throw; storage failures are swallowed.
- Names check: no generated club or player name holds "Continue".

### Wave: DISCUSS / [REF] Outcome KPIs
| # | Who | Does what | By how much (target) | Baseline | Measured by |
|---|---|---|---|---|---|
| K1 | Sam on a 390px phone | Picks up his season after a reload | The next match screen in 2 taps from the title ("Continue", "Play match") at any point of the season; 1 tap to his club home | Impossible: the season is lost. Rebuilding matchday N+1 takes 2 + 2(N+1) taps plus every choice from memory (18 taps after 7 matches) | e2e click counter (as S-003..S-009) |
| K2 | Sam | Trusts that continuing changes nothing | 0 differences between a continued and an uninterrupted season (results, table, End of season) over the round-trip sweep and 100 fast-check runs per CI run; 100% of restores keep formation and XI | not possible | the round-trip and continued-equals-uninterrupted property tests, plus pins P2, P3, P5 |
| K3 | Sam | Is never blocked by the save | 0 thrown errors and 0 console errors over 200 fast-check runs of unreadable inputs per CI run, and in the blocked-storage and full-storage e2e; 100% of unreadable saves show no "Continue" | n/a (no save) | property test on decode, e2e with seeded and blocked storage |

Guardrails:
- S-001..S-009 protected scenarios stay green.
- The league, squads, schedule, every result and the S-006..S-009 goldens are unchanged for every seed.
- A saved full season stays under 16 KB (unit check).
- No ambient randomness or wall-clock time in `src/domain/`, and no storage access there.
- No sideways scroll at 390px and 0 console errors on the title and the club home.
- No analytics in the POC. In the owner's Friday demo, the owner closes the tab mid-season and carries on with "Continue".

### Wave: DISCUSS / [REF] DoD
- `tests/protected/S-010/` passes on main. It is written by this plan run's protected-scenarios step from the D8 pin list; it is append-only and does not exist before that step. `tests/protected/S-001/` to `S-009/` still pass.
- Unit and property tests pass for the test intents above: round trip, continued equals uninterrupted, the save triggers, D4 timing, D5 seed, unreadable inputs, swallowed storage failures, the 16 KB guardrail and the names check. The `ci:*` scripts are green.
- The e2e phone smoke covers the seed-31 reload and "Continue" (focus, 44px, no sideways scroll at 390px), D4's timing, D5, an unreadable save, and blocked and full storage, each with 0 console errors.
- Slices 01 and 02 land in one DELIVER merge.
- The D7 amendment replaces, never weakens, the S-008 reload test; no other S-001..S-009 acceptance assertion is edited.
- DESIGN records the persistence decision in an ADR. The DELIVER change stays under the 1200-line PR guard (525 budgeted, tests included).

### Wave: DISCUSS / [REF] Out-of-scope
- Several save slots, a save list or naming; export or import; a "Delete save" button or a confirm dialog; cloud or account sync (`multiplayer` and `backend` are OUT); restoring the exact last screen; carrying a finished season into a next season; a "Back" from the pick-a-club screen to the title; an inbox, commentary, stats.
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
- S-001..S-009 are delivered: the `results` log, `nextMatchday`, `standingsOf`, `seasonSummaryOf`, `currentXI`, and "New game" and "Play again" through `NewGame`. ADR-0001..0015 are accepted.
- `docs/product/jobs.yaml` now has J-10 (resolved). Roadmap entry S-010 is appended from the draft below (done in this run).
- `tests/protected/S-010/` is written by this plan run's protected-scenarios step from the D8 pin list, after this DISCUSS (append-only); it is not claimed to exist yet.
- D7 lists the non-protected assertion DELIVER amends.
- S-009 DESIGN Open question 1 (`update` and `render` at their complexity limits) must be resolved in this story's DESIGN before a new action is added.

### Wave: DISCUSS / [REF] Roadmap outcome (draft)
Once a club has been picked, the game is saved in the browser automatically, with no Save button, after every tap that changes it: picking the club, choosing a formation in "Tactics", picking a player for a "Starting XI" slot, and "Play match". The saved game holds the league's seed, the managed club, the formation, the Starting XI (including the player's own picks) and the recorded results; which screen was open is not saved. When a saved game exists, the title screen shows a button named exactly "Continue" (44px or taller) above the button named exactly "New game"; its only top-level heading (h1) still reads "Gaffer", focused on load. On a first visit, or in a fresh browser, there is no "Continue" button and the title screen is as before. Tapping "Continue" shows the club home of the saved club with focus on its heading, the club's name, and everything is as it was before the reload. "Table" shows the table named "League table" with the same rows, the same text in every cell. "Tactics" has the saved formation checked ("4-4-2", "4-3-3" or "4-2-3-1"). "Starting XI" lists the same 11 slot texts in the same order. When N matches had been played, the next "Play match" shows the match screen whose h1 reads "Matchday N+1"; for example, after two matches it is "Matchday 3". When all 14 had been played, the club home shows "End of season" and no "Play match", and the End of season screen shows the same "Final position" and "Top scorer" lines. "Back" works on every screen as before. Saving and continuing changes nothing in the game: the rest of the season played after "Continue" gives the same match screens (the score line and the "Goals" list) and the same table as the same seed, club and choices played in one visit without a reload. There is one saved game: "Continue" resumes it whatever "?seed=" the address holds now. "New game" still starts a fresh game from the address's seed exactly as before: after picking a club, the table reads P 0, W 0, D 0, L 0, GD 0 and Pts 0 on every row in A to Z order, "Tactics" has "4-4-2" checked, the Starting XI is the automatic one, and the next "Play match" shows "Matchday 1". Tapping "New game" or "Play again" does not by itself remove the saved game; it is replaced as soon as a club is picked in the new game. A saved game that cannot be read (damaged, or from an incompatible older version) is ignored: there is no "Continue" button and the game plays as before. When browser storage is unavailable or full, there is no "Continue" button and the game plays as before without saving; a failed save never interrupts play. This version amends S-007, S-008 and S-009, which said that results are kept until the page is reloaded: from this version on, a reload keeps the saved game, reachable through "Continue". Their durable lists are unchanged, and "New game" still starts fresh. These hold in every later version of the game: with a saved game the title screen offers "Continue" (exact name), and without one it does not; "Continue" restores the saved club with its formation, Starting XI, recorded results and next matchday; and "New game" always starts a fresh game. That "Continue" lands on the club home, and that the saved game is replaced only once a club is picked in a new game, are rules of this version only. No horizontal scroll at 390px and no console errors.

### Wave: DISCUSS / [REF] DoR validation
| # | Item | Status | Evidence |
|---|---|---|---|
| 1 | Problem clear, domain language | PASS | US-1: a dropped tab wipes the season, and 14 matchdays do not fit a 5-minute session. US-2: a continue that resets his 4-3-3 and his pick would field a side he never chose, and a bad save must not block the game |
| 2 | Persona specific | PASS | Sam, 34, one-handed on a bus, 390px Android, 5 minutes, two or three matches per trip, and the browser drops the tab between trips |
| 3 | 3+ domain examples, real data | PASS | Real generator output from `S-008/discuss/reference-season.md` and S-009's `reference-season-end.md`: seed-31 Netherwold Borough matchdays 1 to 3 and the table after 2 (worked out by hand; DISTILL confirms), "Final position 3rd" and "Top scorer Garrick Thistlewood (5 goals)", the golden pick "Kestrel Northcott 6" for "MF Calder Redfern 15", and the seed-20260 league for D5. 3 examples per story |
| 4 | UAT Given/When/Then, 3-7 | PASS | 8 for S-010 (US-1 4, US-2 4). Every Given and When is a tap sequence, a reload or seeded storage on the real app; every Then reads only what an earlier step read, or a fixed label |
| 5 | AC derived from UAT | PASS | Project convention since S-001: the AC are the embedded Gherkin scenarios. D1, D2 and D3 are in US-1 scenarios 1 to 3 and US-2 scenario 1; D4 in US-1 scenario 4; D5 in US-2 scenario 2; D6 in US-2 scenarios 3 and 4; D7 to D10 are covered by the pin list, unit tests, e2e and review |
| 6 | Right-sized | PASS | 2 slices in about 1 to 1.5 days; 525 changed lines in DELIVER including tests, under the 1200-line PR guard (the one hard cap); one outcome |
| 7 | Technical notes | PASS | Per story: the save lives outside `GameState` (the five-key test), a projection written while the screen carries a club, the `update` and `render` complexity refactor first, a pure versioned encode and decode with strict validation, an exception-swallowing storage adapter in the shell, and a new ADR |
| 8 | Dependencies tracked | PASS | S-001..S-009 delivered. The D7 amendment of "kept until the page is reloaded" leaves the durable lists unchanged, and the protected scenarios start in fresh contexts. The S-008 reload e2e test is listed for amendment. S-009 DESIGN Open question 1 must be resolved first. J-10 added. `tests/protected/S-010/` follows from this plan run's protected-scenarios step |
| 9 | Outcome KPI measurable | PASS | K1: 2 taps to the next match after a reload (e2e click counter). K2: 0 differences between continued and uninterrupted seasons (round-trip sweep plus fast-check). K3: 0 errors over 200 runs of unreadable inputs, plus blocked and full storage e2e |

DoR status: PASSED (both stories). Every story has `job_id` J-10 and an Elevator Pitch.

### Wave: DISCUSS / [REF] Peer review

## Wave: DESIGN

- **Setup**: mode propose; scope application; one solo team plus the factory, no Conway constraint. Paradigm: functional core, imperative shell (ADR-0003; recorded in the ADRs and the brief, not in CLAUDE.md). Unattended; no questions asked. Precedence used: scope.md, then brief.md, then accepted ADRs; the narrower choice wins.
- **Checklist**: ✓ DISCUSS (D1-D10, US-1/US-2, K1-K3, P1-P5, line budget) | ✓ both slices | ✓ S-009 DESIGN as the template and its Open questions | ✓ brief, ADR-0002/0003/0008/0012/0014/0015 | ✓ code (`main.ts`, `state.ts`, `seed.ts`, `league.ts`, `match.ts`, `selection.ts`, `title.ts`, `dom.ts`, `styles.css`, `.oxlintrc.json`, vitest/playwright/stryker configs) | ✓ design system | ✓ existing tests (the S-009 five-key test, the S-008 reload e2e, the source/grep tests) | ⊘ Context7 and web (no tool in this run; browser API semantics are stated from knowledge and flagged) | ⊘ residuality, DDD expansion, formal verification (lean) | ⊘ CLAUDE.md edit (locked).
- **New ADR**: `adr-0016-save-and-continue-local-storage.md` (format, strictness and replay-verify, where the pure functions and the adapter live, how Continue enters `update`, the write trigger, the Earned Trust catalogue). ADR-0012, ADR-0014 and ADR-0015 get a status-line note "(amended by ADR-0016, S-010)" only.
- **Brief**: `docs/product/architecture/brief.md` gains "Save and continue (S-010, ADR-0016)", effect-isolation rows, component rows, ports 36-39, the S-010 observable bullet, a struck Earned Trust line and updated C4 L1 and L2 (a new external system "Browser localStorage" and a new container "Adapters"). `docs/product/ui/design-system.md` gains "Title with a saved game (S-010)".
- **C4**: one new external system (browser localStorage) and one new container (`src/adapters`, the first driven adapter).
- **Outcome collision check**: `nwave-ai outcomes check-delta docs/feature/S-010/feature-delta.md` exited 0 ("0 outcomes checked, 0 collisions found across 0 outcomes"); `docs/product/outcomes/registry.yaml` is still empty (`outcomes: []`), so no collision is possible and nothing was linked or superseded.

### Wave: DESIGN / [REF] DDD list
- **No new bounded context.** The save is a persistence concern at the edge: a projection of session state, not a domain concept. Squad, Selection, Match, Schedule and Standings are untouched; `isLegalXI` is one new rule of the existing Selection context.
- **Language**: Saved game (the projection of the state: seed, club, formation, XI if changed, per-match goal lists), Saving tap (a tap that changes the encoded save), Continue (the title action that restores it), Offer (the restored state held by the title while a readable save exists), Unreadable save (anything `fromSave` rejects), Degraded store (a store whose probe failed: treated as absent), Save version (`v`).
- **Invariants by construction**: the encoded text is a pure function of the state (equal states, equal text), so the save triggers and D4's timing are properties of data, not of the shell; a decoded save equals the saved state apart from the screen (round-trip law), so a continued season equals the uninterrupted one because `update` is a pure function (K2); a save either decodes whole or not at all (K3); matchday, fixture, clubs and scores are not stored, so they cannot disagree with the log.

### Wave: DESIGN / [REF] Decisions
| # | Decision | Source |
|---|---|---|
| D1 | **Format: a compact, irredundant envelope** `{ v: 1, seed, clubId, formation, xi?, results? }` under the single key `gaffer.save`. `xi` only when the player changed it; `results` only when recorded, as one goal list per match in schedule order, each goal `[minute, side 0/1, playerIndex]`. Matchday, fixture, clubs and scores are derived on decode (position in the log, `fixturesOf`, goal counts). Size: about 32 bytes per match, about 1.9 KB for an average season (2.73 goals per match), at most about 10.5 KB if all 18 chances scored every match, under the 16 KB guardrail by construction. Rejected: the log as-is (about 13 KB average, about 52 KB worst, five redundant fields to cross-check); per-matchday choices plus replay (past XIs are not kept and cannot be added without a sixth `GameState` key); a full state snapshot (stores derivable data and the screen). | ADR-0016 (1); DISCUSS D1, guardrail |
| D2 | **Pure module `src/app/save.ts`**: `toSave(state) => SaveData or undefined` (only when the screen carries a known club), `fromSave(raw: unknown) => GameState or undefined`, `encodeSave(state) => string or undefined`, `decodeSave(text) => GameState or undefined`. The restored screen is the club home. `GameState` gains no key. Rejected: inline in `main.ts` (untestable without a DOM); `src/domain` (the domain has no `GameState`, ADR-0003); `src/app/storage.ts` (blurs the pure-app rule). | ADR-0016 (3); DISCUSS tech notes |
| D3 | **Strictness: structural truth plus replay-verify.** `fromSave` checks the envelope, int32 seed, club in the regenerated league, formation id, XI legal for the squad and formation (`isLegalXI`, EXTEND `selection.ts`), whole matchdays 1..14, well-formed goals (minute integer 1..90 non-decreasing, side, player index 0..17, at most 9 per side), then replays every recorded matchday with `sidesFor` and `playMatchday` and requires the 3 fixtures that do not involve the managed club to equal the stored ones; the managed fixture is shape-checked and its scorers must be non-goalkeepers. Any failure is `undefined`. The replay turns the next unannounced change to the match model, squads or the AI-side XI policy into "unreadable save". Rejected: shape-only (accepts a save written by another model); full replay (impossible, the managed XI per matchday is not recorded). | ADR-0016 (2); S-009 Open question 4 |
| D4 | **Adapter `src/adapters/save-store.ts`, the first driven adapter**: `createSaveStore(getStorage)` takes a restricted capability (`getItem`, `setItem`, `removeItem`), probes during construction (sentinel write, read back, remove) and returns `{ health, read(), write() }` that never throw or log; a failed probe is `degraded` (reads `undefined`, writes nothing); `createAutosave(store, lastText)` writes after a dispatch only when `encodeSave(state)` is defined and differs from the last text read or written. The probe degrades instead of refusing to start (D6 of DISCUSS: the game plays as before; no console output). | ADR-0016 (3, 5); Earned Trust |
| D5 | **Continue is an `update` action**: `Action` adds `{ type: "Continue"; game: GameState }` (the state `fromSave` returned at boot); from `title` the state becomes the payload, elsewhere a `toBe` no-op. **`update` is first turned into a handler table** keyed by `Action["type"]` (a missing key is a compile error), behaviour-preserving. Rejected: the shell swapping state outside `update` with an `onContinue` callback (a transition outside the pure core, a second focus path, breaks the `render<Screen>(root, props, dispatch)` convention); adding the case without the refactor (`update` at exactly 15 of 15, the S-009 debt compounds); raw `SaveData` in the action (an import cycle between `state.ts` and `save.ts`). | ADR-0016 (4); S-009 Open question 1 |
| D6 | **Title**: `renderTitle(root, { offer }, dispatch)`, `dispatch` narrowed to `NewGame` and `Continue`. With an offer: h1, tagline, `button.primary` "Continue", `button.secondary` "New game" (outlined gold, shares the `.back-button` colours and border, 200px minimum width). Without an offer: exactly today's markup (`button.primary` "New game"), so protected scenarios, which start in fresh contexts, see an unchanged title. The offer is a module constant of `main.ts` read once at boot (the title is never re-shown after a page load). | ADR-0016 UI; design-system |
| D7 | **Focus** (ADR-0008) unchanged: title to club home is a screen change, so the shell focuses the club home `<h1>`; the title's h1 is focused on load through the existing first-render plan; renderers never move focus; no focus ids. | ADR-0008; DISCUSS D2, D3 |
| D8 | **Determinism**: the league is regenerated from the saved seed, so a saved seed 31 restores the seed-31 league whatever `?seed=` holds (D5 of DISCUSS), and `NewGame` from `seasonEnd` keeps that league ("Play again" keeps the saved seed). No new stream, no clock, no randomness in the save; nothing in `src/domain/` names storage. | ADR-0016 Determinism |
| D9 | **Complexity (counted as S-007..S-009 did; `ci:lint` confirms)**: `update` 14 to 1 (the table; new handler `continueGame` 2); `main.ts` `render` stays 15 of 15 (the title case gains a prop, no branch); `renderTitle` 1 to 2; every new function in `save.ts` and `save-store.ts` is designed at 10 or less by splitting (envelope, goals, results, replay, XI each their own function); `max-lines` 400: `state.ts` about 285, `save.ts` about 130, `main.ts` about 165. If a count differs, extract the nearest helper (behaviour-preserving). | ADR-0016 Context, Enforcement; `.oxlintrc.json` |
| D10 | **Triggers and D4 from data**: the saving taps are exactly the actions that change `encodeSave(state)`; `NewGame` and "Play again" land on `pickClub`, which has no club, so `toSave` is `undefined` and the old text stays; the first `ChooseClub` of the new game writes the new text; "Continue" writes nothing. No action-name list in the shell. Rejected: an action whitelist (writes on no-ops, misses new saving actions); write on every dispatch; write on `visibilitychange` (unreliable on mobile). | ADR-0016 (5); DISCUSS D1, D4 |
| D11 | **Enforcement**: `.oxlintrc.json` gains (a strengthening) `no-restricted-imports` of `**/adapters/**` for `src/domain`, `src/app`, `src/ui`, of `**/ui/**` for `src/adapters`, and `localStorage`/`sessionStorage` in `no-restricted-globals` for `src/app` and `src/ui`; grep tests: storage names only in `src/adapters/` and the `() => localStorage` getter in `main.ts`, one `"Continue"` dispatch site in `title.ts`, at most two `dispatch(` there, no `.focus(` under `src/ui/` (existing), no `console` in `src/adapters/`. | ADR-0016 Enforcement |
| D12 | **Test tooling**: vitest (node) unit and property tests on the pure functions and on the adapter with injected fake storages (no DOM needed); Playwright e2e for the shell wiring (reload in the same context, `page.addInitScript` and `page.evaluate` to seed, corrupt, block or fill storage, in non-protected specs only). Playwright gives each test a fresh context, so protected scenarios start with empty storage; repeated `goto` or `reload` in one test share storage, which is fine because "New game" always starts fresh. | DISCUSS notes; ADR-0016 Earned Trust |
| D13 | **Names**: "Continue" is in no `names.ts` string (grep: none; locators use `exact: true`); DISTILL adds the unit check (S-008 D9 precedent). | DISCUSS test intents |

### Wave: DESIGN / [REF] Component decomposition
| Path | Change | Responsibility | Indicative lines |
|---|---|---|---|
| `src/app/save.ts` | CREATE NEW | `SAVE_VERSION`, `SaveData`, `toSave`, `fromSave` (envelope, XI, goals, results, replay-verify as small functions), `encodeSave`, `decodeSave` | 130 |
| `src/app/state.ts` | EXTEND | `Continue` action and handler; `update` switch becomes the handler table (about 28 lines out, 20 in); `sideFor`/`matchdayFor` split into exported `sidesFor` plus `matchdayFor` | 60 |
| `src/app/seed.ts` | EXTEND | export `isInt32` | 1 |
| `src/domain/selection.ts` | EXTEND | `isLegalXI(squad, formation, xi)` (the file must keep passing the S-005 source test: no `Math.random`, `Date`, `performance.now` or `crypto.` anywhere in the file, comments included) | 10 |
| `src/adapters/save-store.ts` | CREATE NEW | `SaveStorage`, `SaveStore`, `createSaveStore` (probing), `createAutosave` | 65 |
| `src/ui/screens/title.ts` | EXTEND | `{ offer }` prop, "Continue" button, secondary "New game" with an offer, narrowed `dispatch` | 14 |
| `src/ui/styles.css` | EXTEND | `button.secondary` shares the `.back-button` rule; title sizing | 10 |
| `src/main.ts` | EXTEND | three imports, the store, the read, the offer, `createAutosave`, the `title` case props, one `autosave(state)` call per dispatch | 12 |
| `.oxlintrc.json` | EXTEND | the D11 overrides | 14 |

**Code total about 316** (DISCUSS 185: the strict decoder with replay-verify, the probing adapter, the `isLegalXI` rule, the handler table churn and the lint overrides were not in the estimate). Tests: `tests/acceptance/S-010/*.test.ts` about 345 (round trip and triggers 85; strict decode, damaged saves, replay-verify, golden save text, size 90; store, probe faults, autosave and D4 timing 85; `Continue`, handler-table regression, five-key and D5 45; source/grep and names 40), `tests/e2e/S-010-save-continue.spec.ts` about 120 (D4 timing, D5, unreadable and old-version saves seeded before load, blocked storage, full storage, click-everything on the title, 44px, focus, no scroll, no console errors), S-008 amendment about 12. **DELIVER total about 793** (code 316, tests 477) against the DISCUSS 525. With the 250-line protected file (written in the plan run, outside DELIVER) the grand total is about 1,043, under the 1200-line PR guard (the one hard cap). No cut needed. Slices 01 and 02 ship in ONE DELIVER merge. If the cap is at risk, trim test duplication (the 2400-state sweep can be a 1..60 seed sample); never split the slices.

**Amend list** (non-protected tests DELIVER must update, replacing, never weakening; DISTILL fixes the exact text). `grep` of `reload`/`goto`/title assertions over `tests/` (non-protected):
| File | Test / part | Why it must change | Replace with |
|---|---|---|---|
| `tests/e2e/S-008-season.spec.ts` | the test at line 478 (title: "Reloading the page after two matches shows the title screen again; ... (the season is lost, there is no save yet)") and the header comment line 10 ("reload loses the season") | The season is no longer lost; the title after a reload also shows "Continue" | Title reworded ("... shows the title with Continue and New game; New game and the same club start at Matchday 1 with every row at P 0 (the saved game is kept, New game starts fresh)"); keep every assertion; add `expect(getByRole("button", { name: "Continue", exact: true })).toBeVisible()` after the reload and before "New game"; comments restated |
Checked and **unaffected** (no edit): `S-001-pick-club.spec.ts` (single `goto`, finds "New game" by name), `shell.spec.ts` (title heading and "New game" visible; no save in a fresh context), `S-002..S-009` e2e (`goto` per test, "New game" by non-exact name, which "Continue" does not match; helpers that `goto` again in one test only meet a "Continue" next to "New game"), every `tests/acceptance/S-001..S-009` file (the `update` handler table is behaviour-preserving; `existing-navigation-unchanged` five-key test untouched because no state key is added; the S-005 `selection.ts` and S-009 `season-end-source.ts` source checks do not look at the new code), `tests/unit/ui/renderers-never-move-focus.test.ts` (scans `src/ui` only; the new adapter is outside). DISTILL re-greps before pinning.

### Wave: DESIGN / [REF] Driving ports
- **App, pure**: `toSave`, `fromSave`, `encodeSave`, `decodeSave`; `update` with `Continue`; `isLegalXI`; `sidesFor`.
- **Adapter (injectable)**: `createSaveStore(getStorage)`, `createAutosave(store, lastText)`.
- **Browser**: the title (h1 "Gaffer", "Continue" when saved, "New game"), then the club home, "Table", "Tactics", "Starting XI", "Play match", "End of season", "Back", with `page.reload()` between steps; storage seeded, corrupted, blocked or filled through `page.addInitScript`.
- Detail and properties: brief, "For Acceptance Designer", ports 36-39.

New and changed shapes, for the acceptance designer (contracts only):
- `SaveData = { v: 1; seed: number; clubId: string; formation: FormationId; xi?: readonly number[]; results?: readonly (readonly (readonly [number, 0 | 1, number])[])[] }`; `toSave(state: GameState): SaveData | undefined`; `fromSave(raw: unknown): GameState | undefined`; `encodeSave(state: GameState): string | undefined`; `decodeSave(text: string | null | undefined): GameState | undefined`.
- `Action` adds `{ type: "Continue"; game: GameState }`; `GameState`, `Screen`, `PlayedMatch` unchanged; `sidesFor(state: GameState, clubId: string): readonly MatchSide[]`; `isLegalXI(squad: readonly Player[], formation: FormationId, xi: readonly number[]): boolean`.
- `SaveStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">`; `SaveStore = { readonly health: "ok" | "degraded"; read(): string | undefined; write(text: string): void }`; `createSaveStore(getStorage: () => SaveStorage, key?: string): SaveStore`; `createAutosave(store: SaveStore, lastText: string | undefined): (state: GameState) => void`.
- `renderTitle(root, { offer }, dispatch)` with `offer: GameState | undefined`; not reachable from vitest, covered by e2e and grep tests.

### Wave: DESIGN / [REF] Driven ports and adapters
**`localStorage` is the first driven port.** Port: `SaveStore` (read one text, write one text, with a `health`). Adapter: `createSaveStore` over an injected `() => SaveStorage`, so tests pass fakes and production passes `() => localStorage` (the getter is inside the adapter's try, because merely reading the property can throw). It probes while constructing (wire, probe, use), degrades silently, and never logs. Environment lies and their fault scenarios (full table in ADR-0016 Earned Trust):
1. **Blocked access** (`SecurityError` reading the property): the getter throws; `degraded`; e2e blocks storage with an init script and plays two matches.
2. **Full or disabled** (`QuotaExceededError` on `setItem`): the sentinel write fails, or only the save write fails; no throw, no console, the game plays; e2e fills storage.
3. **Silent no-op** (`setItem` ignored, `getItem` returns `null` or stale): the sentinel read-back mismatch gives `degraded`, so no "Continue" is offered on a lie.
4. **Odd reads** (`getItem` throws, or returns a non-string): `read()` is `undefined`.
5. **Foreign, stale or damaged text** (another project on the shared origin, an old format, truncation, hand editing): `decodeSave` catches the parse and `fromSave` is strict; e2e seeds garbage and an old-version object before load.
6. **Model drift** (a later story changes squads, streams, the match model or the AI-side policy): the replay of the 3 unmanaged fixtures and `v`; a golden save text (seed 31, two matchdays, pinned by DISTILL from the reference season, never re-pinned from DELIVER output) must decode to the expected state.
7. **Round trip loses information**: the round-trip sweep and the fast-check continued-equals-uninterrupted property.
8. **Write timing (D4)**: unit tests on `createAutosave` with a fake store.
9. **The adapters claim a probe but skip it**: three orthogonal layers: type (the factory is the only constructor of `SaveStore` and probes inside it; `health` is in the type), structure (grep test), behaviour (the fault catalogue above).

Deviation recorded: the generic "refuse to start" rule is replaced by "degrade silently", because saving is optional and DISCUSS D6 forbids console output; no `health.startup.refused` event exists. No external integrations (a platform API), so no contract tests. **Enforcement**: see D11.

### Wave: DESIGN / [REF] Technology choices
- No new dependency (ADR-0001, 0002, 0003 apply; all OSS). The Web Storage API (`localStorage`: `getItem`, `setItem`, `removeItem`; string values) is part of the browser platform. Semantics relied on, from MDN's Web Storage documentation **as known to the architect, not looked up in this run (no browsing or Context7 tool)**: reading `window.localStorage` can throw `SecurityError` when storage is blocked; `getItem` returns `null` for an absent key; `setItem` can throw `QuotaExceededError` when storage is full or disabled. The design is robust to a different behaviour because every call sits in a try/catch and the probe round-trips a sentinel. DELIVER may verify with Context7 (`/mdn/content`, Web Storage) and amend only this bullet.
- `JSON.parse` / `JSON.stringify` for the text (ECMAScript built-ins; fixed key order from the encoder).

### Wave: DESIGN / [REF] Reuse Analysis
| Existing Component | File | Overlap | Decision | Justification / contract shape |
|---|---|---|---|---|
| `GameState`, `Action`, `update`, `initialState` | `src/app/state.ts` | Where the new action and the restored state live | EXTEND (`Continue`; `update` becomes a handler table) | Pure return-only; universe `{ league, screen, formation, xi?, results? }` (the five-key test stays); `Continue` from `title` returns the payload, else `toBe`; every S-001..S-009 `update` suite unedited; deep-freeze; 40-action property; complexity D9 |
| `sideFor`, `matchdayFor` (private) | `src/app/state.ts` | The 8 sides and the "others field `automaticXI(squad, DEFAULT_FORMATION)`" policy that the replay needs | EXTEND (split out an exported `sidesFor`; `matchdayFor` calls it) | Pure return-only; universe = the 8 `MatchSide`s; inputs never mutated; the policy still has one owner; tested through `update` (unchanged) and directly (equals the old inline sides) |
| `playMatchday`, `PlayedMatch`, `GoalEvent` | `src/domain/match.ts` | The log shape and the replay | REUSE unchanged | Pure return-only; the decoder rebuilds `PlayedMatch` entries and replay-compares them; the save never touches the frozen ADR-0011 model |
| `fixturesOf`, `MATCHDAYS`, `FIXTURES_PER_MATCHDAY` | `src/domain/schedule.ts` | Matchday, fixture and clubs derived from position | REUSE unchanged | Pure data and return-only; frozen table |
| `generateLeague`, `squadOf`, `generateSquad`, `PLAYERS_PER_SQUAD` | `src/domain/league.ts`, `squad.ts`, `state.ts` | Regenerate the league and squads from the saved seed | REUSE unchanged | Pure return-only; deterministic; the reason the save holds no names |
| `automaticXI`, `pickForSlot`, `isSlotIndex`, `lineUp` | `src/domain/selection.ts`, `formation.ts` | XI legality | EXTEND `selection.ts` (`isLegalXI`) | No existing predicate validates a whole XI (`pickForSlot` validates one pick; `isSquadIndex` is private). Pure return-only; universe = the boolean; table of 11 distinct indices, wrong count, duplicate, out of range, wrong position, wrong formation; Stryker covers `src/domain/**`; the file keeps its no-ambient-randomness source test |
| `isFormationId`, `FORMATIONS` | `src/domain/formation.ts` | Validate the stored formation | REUSE unchanged | Pure type guard |
| `parseSeed`, `isInt32` (private) | `src/app/seed.ts` | Validate the stored seed with the same int32 rule | EXTEND (export `isInt32`) | Pure return-only; one source for "a valid seed" (no duplicate range constants) |
| `standingsOf`, `seasonSummaryOf`, `nextMatchday`, `matchFor` | `src/app/state.ts` | Derived from the restored log | REUSE unchanged | Pure return-only; the round-trip tests compare their outputs before and after a restore |
| `focusPlan`, `sameScreen` | `src/app/state.ts` | Title to club home is a screen change | REUSE unchanged | Pure return-only; the existing suites; one new case in the `Continue` test |
| (none) | `src/app/` | A pure, versioned encode and strict decode of the state | CREATE NEW `save.ts` | No existing serialiser or validator (grep: no `JSON.parse`, `JSON.stringify` or storage in `src/`). Pure return-only; universe = the returned text / state; round trip, never-throws, size, golden |
| (none) | `src/adapters/` | Reading and writing the browser's storage with probe and silence | CREATE NEW `save-store.ts` | No existing storage code (grep: none). Bounded-change: keys `gaffer.save` and `gaffer.probe` on the injected storage only; never throws or logs; fault-injection unit tests; grep that no other file names a storage API |
| `renderTitle` | `src/ui/screens/title.ts` | The title with its one button | EXTEND | Bounded-change; universe = one `section.title-screen` (h1, tagline, [Continue], New game); `dispatch` narrowed to `NewGame` and `Continue`; the no-offer markup is exactly today's; e2e click-everything, grep (at most two `dispatch(`), `.focus(` grep |
| `el`, `button.primary`, `.back-button`, `.title-screen` | `src/ui/dom.ts`, `styles.css` | Buttons and the title layout | REUSE (`button.secondary` shares the `.back-button` rule) | Bounded-change (presentation only); no `display` change that affects the accessible name |
| `render`, `findClub`, `applyFocus`, `dispatch` loop | `src/main.ts` | Maps state to props; owns the loop | EXTEND (store, offer, `autosave` call, `title` props) | Bounded-change with an enumerated universe (adds: one storage read at boot, the sentinel round trip, writes of `gaffer.save` through the adapter); `render` complexity unchanged; e2e |
| `.oxlintrc.json` | repo root | Layer rules | EXTEND (D11) | A strengthening of checks, so no weakening ADR is needed |
| S-008 reload e2e | `tests/e2e/S-008-season.spec.ts` | Asserts "no save yet" in its title | REUSE, except the amend list | Equal-or-stronger: same assertions plus "Continue" visible |

### Wave: DESIGN / [REF] Changed Assumptions
- **S-007, S-008, S-009 "Results are kept until the page is reloaded", quoted**: S-008 D8: "Results are kept until the page is reloaded (no persistence). `NewGame` clears them (unit-level invariant, as S-007 D9)."; S-009 D5: "Results still last only until the page is reloaded (save and continue is a later story)." Superseded in part (DISCUSS D7): after a reload the saved game is reachable through "Continue"; "New game" still starts fresh; their durable lists are unchanged and their protected scenarios start in fresh contexts.
- **ADR-0012 Context D9, quoted**: "the user-visible lifetime is "until the page is reloaded" (no persistence yet)". And Earned Trust 3: "Future persistence will be the first real adapter (`localStorage` lies: quota, private mode, stale versions). It needs its own `probe()` and a shape validator; not in this story." Taken by this story (ADR-0016); ADR-0012's status line carries the amendment note.
- **ADR-0012 Forward compatibility, quoted**: "a save is `{ seed, formation, xi, results }`, all JSON-able. ... A loader validates shape". Refined: the stored `results` is the compact per-match goal list, not the `PlayedMatch` JSON (D1); the loader validates and replay-verifies (D3).
- **ADR-0014 Earned Trust 4, quoted**: "a future persistence story must validate shape, order and contiguity of a loaded log, with its own `probe()`." Done: contiguity and order hold by construction of the compact format; the adapter has its probe.
- **ADR-0003, quoted**: "Future persistence ... A pure `toSave(state)` / `fromSave(data)` works over the seed plus the player's choices and results, and a separate storage port in the shell does the I/O." Followed, with `fromSave` taking `unknown`.
- **ADR-0005 (d) and ADR-0006, quoted**: "there is no persistence to migrate" (ADR-0005 (d)); "There is no persistence; the S-002 protected scenarios assert properties" (ADR-0006, determinism break). Persistence now exists: the frozen squad and attribute tables are save-format-relevant (a change needs a `SAVE_VERSION` bump, or the replay drops old saves).
- **ADR-0015, quoted**: "There is no storage, clock, network or vendor SDK, so there is no `probe()` to specify". No longer true for the app as a whole; the S-009 screen itself is unchanged.
- **S-009 Open question 1 / DISCUSS slice 01**: "the `update` and `render` switches move to lookups before the new action". Refined: `update` moves (it gains the action); `render` gains no screen and no branch, so it stays a switch at 15 of 15; the next story that adds a screen must convert it first.
- **S-009 five-key test (`existing-navigation-unchanged.test.ts`)**: kept; the save adds no `GameState` key, and the restored state holds only those five keys.
- **DISCUSS line budget**: DELIVER about 793 (DISCUSS 525): code 316 (185), tests 477 (340). Under the 1200-line PR guard (the one hard cap).
- **DISCUSS D6 "full storage gives no Continue"**: read as "a store that cannot honour its contract is treated as absent", so a full store with an old save also offers no "Continue" (a `degraded` store neither reads nor writes). The e2e "full" case starts from an empty context, where both readings agree.
- **Pre-requisite**: `tests/protected/S-010/` is written by this plan run's protected-scenarios step (the orchestrator, after this DESIGN, append-only) and must exist before DELIVER starts.
- No change to the roadmap outcome text.

### Wave: DESIGN / [REF] Open questions
- **None blocking.**
- **`render` stays at 15 of 15**: the next story that adds a screen must first move the `render` switch to a lookup (this story moved `update`, which it needed). Counts are by hand; DELIVER confirms with `ci:lint` (D9 has the fallback).
- **Stryker scope**: `stryker.config.mjs` (owner-locked) mutates `src/domain/**` and `src/app/state.ts` only, so `src/app/save.ts` (the strict decoder, where mutants matter most) is not in the nightly run. The owner may add it; until then the property tests and the golden save are the guard. `isLegalXI` is covered (domain glob).
- **Boot cost of decode plus replay**: estimated at a few milliseconds (8 squads and at most 56 matches); DELIVER measures it once (e2e timing log or a unit timing bound well above the estimate) and, if it is large on a phone, narrows the replay to the last matchday and the first.
- **No user-visible "saving failed"** (OUT in DISCUSS): the player is not told when storage is degraded; a later UX story may add it.
- **Several tabs**: last write wins and a tab's remembered last text may be stale (not tested; one player, one phone).
- **Shared origin**: GitHub Pages serves all of a user's project sites from one origin; the key `gaffer.save` is a namespace convention, not isolation.
- **Outcome trace**: save after the saving taps, no Save button: D1, D10. "Continue" above "New game" only with a save, h1 focused: D6, D7. Lands on the club home with the same table, next matchday, End of season: D2, D5, D8. Formation and XI restored: D1. Continued equals uninterrupted: D1, D5, D8 (round-trip law). New game fresh, replaced when a club is picked: D6 (offer ignored by `NewGame`), D10. Seed from the save: D8. Unreadable save, blocked or full storage, no console error: D3, D4. 44px, no sideways scroll: D6.
- **Handoff for DISTILL**:
  - Properties and checks: brief ports 36-39 and ADR-0016 Consequences and Earned Trust. Test files and lines are under Component decomposition, with the amend list.
  - **Goldens, RED-first** (never re-pinned from DELIVER output): the seed-31 two-matchday save text and its decoded state (source: the `discuss/reference-season.md` figures: Netherwold Borough "Matchday 2" Rushmoor Heath Albion 2-1; DISTILL computes the text with the real generator once and a reviewer checks it against the reference); the encoded size of a constructed worst-case log (18 goals every match) under 16 KB and of the seed-31 season under 3 KB.
  - Unit and property: round trip over seeds 1..300 x 8 clubs x matchdays 0..14 (untouched tactics, trim allowed); fast-check (numRuns 100, fresh `FC_SEED`) continued equals uninterrupted over random formation, pick and Play match sequences with a restore at a random point; `fromSave` never throws and returns `undefined` over `fc.jsonValue()`, arbitrary strings, truncated, bit-flipped, key-dropped, version-changed and matchday-swapped valid saves (numRuns 200); one case per rejection rule of port 36; replay-verify kills (alter one unmanaged goal, alter a model constant in a copy, another `v`); save triggers (club pick, formation, XI pick, Play match change the text; Squad, Player, Table, Tactics with no change, Starting XI, Back, End of season, New game, Play again, a no-op pick, the same formation do not); D4 through `createAutosave` and a fake store; D5 (restore uses the saved seed; `NewGame` from `seasonEnd` after `Continue` keeps it); `Continue` from every non-title screen is `toBe`; the five-key check on restored states; the handler-table regression (the whole S-001..S-009 suite); source checks (D11); the names check for "Continue".
  - e2e (390px, `exact: true`): title without a save has no "Continue" and the old markup; with a save "Continue" is 44px and above "New game", "Gaffer" the only h1 and focused; after Continue the club name is focused; the seed-31 two-match reload (Table cells, "Matchday 3" and score line, equal to a second fresh context that plays three matches); D4 timing (New game, reload, "Continue" still resumes the old game; after a club pick and a reload it resumes the new one); D5 (`?seed=abc` after a seed-31 save); a damaged and an old-version save seeded with `addInitScript` (no "Continue", no console error, a later save replaces it); storage blocked (init script making the property throw) and full (`setItem` throwing `QuotaExceededError`): 2 matches and "Table" work, no "Continue", no console error; click-everything on the title dispatches only `NewGame` and `Continue`. The seed-31 reload and "Continue" smoke runs under 90 s with the 28-tap season in the protected file.
  - The pending-then-activate pattern of S-006..S-009 applies to the amend list, in the same commit as the production change.

### Wave: DESIGN / [REF] Peer review

## Wave: DEVOPS

Lean, unattended. All nine decisions pre-answered; no platform change. Owner-locked paths (`.github/`, `factory/`, `scripts/`, `.nwave/`, `CLAUDE.md`, brief/scope, `tests/protected/`, `stryker.config.mjs`, `playwright.config.ts`) are read-only. Machine-readable: `docs/feature/S-010/environments.yaml`. Inherits S-009 (and S-001..S-008); only deltas are recorded. `.oxlintrc.json` is not locked: the D11 layer overrides are an ordinary DELIVER change, not a platform change.

Checklist: ✓ existing infra reused | ✓ K1-K3 mapped to instruments | ✓ rollback defined | ✓ storage-state matrix for DISTILL | ✓ mutation strategy (nightly-delta; `state.ts` and `selection.ts` inside the mutate globs, `save.ts` and `src/adapters/` outside, recorded as an owner request, no config change) | ✓ protected-runner timeout constraint carried over | ⊘ new IaC/containers | ⊘ server-side observability | ⊘ continuous learning | ⊘ CLAUDE.md edit

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
| damaged or incompatible | seed garbage, a truncated valid save, and an object with another `v` before load | no "Continue", no console error; a later club pick replaces it | e2e (non-protected); unit property on `decodeSave` |
| blocked (access throws) | init script that makes reading `window.localStorage` throw `SecurityError` | no "Continue", 2 matches and "Table" work, no console error | e2e (non-protected); unit with a throwing getter |
| full (write throws) | init script making `Storage.prototype.setItem` throw `QuotaExceededError` | no "Continue" (the probe write fails, store `degraded`), play unaffected, no console error | e2e (non-protected); unit with a throwing `setItem` |

Notes:
- **Seeding pattern.** `page.addInitScript` re-runs on every navigation, `page.reload()` included, so an init script that writes the save would overwrite whatever the app saved between `goto` and `reload`. The seeding script must write only when the key is absent (or the case must not reload). Blocking and filling scripts are meant to run on every load.
- **Fresh contexts, in CI and on the live URL.** Playwright gives each test a fresh context, and the deployed-site `smoke` (`BASE_URL`) runs in fresh contexts too, so a stale save from an older deploy cannot reach CI or smoke. `goto` and `reload` inside one test share storage; that is fine because "New game" always starts fresh (DISTILL D12). Smoke never writes to a real player's browser.
- **Real players can hold a stale save.** A browser that played an earlier deploy keeps `gaffer.save`. The `v` check plus the strict decode and replay-verify (ADR-0016) turn any save the current build cannot honour into "no saved game"; a save format change must bump `SAVE_VERSION` (see Deployment strategy and rollback). Nothing is migrated.
- **Shared origin.** GitHub Pages serves every project of `<owner>.github.io` from one origin, so `localStorage` is shared with the owner's other Pages sites. The key is namespaced (`gaffer.save`, probe key `gaffer.probe`); this is a convention, not isolation. The decoder rejects foreign text under the key (Earned Trust 5), and the adapter touches only those two keys. The local-preview origin (`localhost:4173`) is separate from production.
- **Boot cost.** One storage round trip (sentinel) plus, with a save, decode and replay (estimated a few milliseconds). DELIVER measures it once in the e2e (ADR-0016 Consequences); no budget is imposed here.
- **Focus** (ADR-0008) unchanged: title to club home after "Continue" is a screen change, so the club home `<h1>` is focused; the title's h1 is focused on load with or without "Continue".
- **e2e runtime.** The seed-31 reload test plays 3 matches in each of two contexts (no full season in non-protected e2e); the protected file has the only full-season reload (P5, 28 taps). See the timeout constraint in the coexistence section.

### Wave: DEVOPS / [REF] CI/CD pipeline outline (existing, unchanged)
- `ci` (PR, push to main, dispatch; 30 min): PR guards (locked paths, append-only protected, diff cap 1200, `Math.random`/`Date` in `src/domain/`, which covers the `selection.ts` extension), roadmap lint, `ci:lint` (confirms the D9 complexity counts and enforces the D11 `.oxlintrc.json` layer overrides, which DELIVER adds), `ci:typecheck` (the handler table's missing-key compile error), `ci:test` (fresh `FC_SEED`), `ci:build`, `ci:e2e`, protected no-regression check vs main (a new `tests/protected/S-010/*.spec.ts` must fail on main until DELIVER).
- `deploy` (push to main): `ci:build`, deploy-pages, then `smoke` (10 min) runs `ci:e2e` against the live URL, including the new S-010 spec and the amended S-008 reload spec.
- `nightly` (03:00, 45 min): `ci:mutation`; failure opens a `mutation-alarm` issue. `ai-review`, `factory-tick`, `watchdog`, `weekly-demo`: factory-owned, untouched.
- No pipeline change: S-010 adds unit, property and e2e specs run by existing scripts, and no dependency. DELIVER diff about 793 lines (about 1,043 with protected), under the 1200 guard; `docs/` is outside the count.
- Local gate: `pnpm run check` mirrors the commit stage; no git hooks (locked). Security: no secrets, no runtime deps, no network; the save is untrusted input and is validated strictly before use (shift-left through the decoder property tests); stored text never reaches the DOM except through `el()`/`textContent` after decoding (ADR-0002). SAST/SCA/SBOM not added (inherited owner-only item).

### Wave: DEVOPS / [REF] Monitoring contracts (DISCUSS KPI to instrument)
E2E instrument: `tests/e2e/S-010-save-continue.spec.ts` (Pixel 7, 390px) via `ci:e2e` on PR and main and `smoke` on the live URL. Unit/property rows run in `ci:test` with a fresh `FC_SEED`. `tests/protected/S-010/` runs on local-preview in `ci` and must pass on main.

| KPI (DISCUSS) | Instrument | Pass condition |
|---|---|---|
| K1: next match screen in 2 taps from the title ("Continue", "Play match") at any point of the season; 1 tap to the club home | e2e: page-side capture-phase click counter (as S-003..S-009) after a reload at seed 31 with 2 matches played: 1 click ("Continue") to the focused club home, 2 clicks to "Matchday 3" with the golden score line "Netherwold Borough 2–1 Oakhampton Rise Borough". Protected P2 pins the focus, the table and the Matchday 3 equality. Manual: owner's Friday demo (closes the tab mid-season, carries on; no analytics in the POC) | 1 and 2 clicks |
| K2: 0 differences between a continued and an uninterrupted season; 100% of restores keep formation and XI | unit: round-trip sweep (seeds 1..300 x 8 clubs x matchdays 0..14, untouched tactics; DISTILL may trim) restores the same formation, XI, results and next matchday; fast-check (`numRuns` 100, fresh `FC_SEED`) continued equals uninterrupted over random formation, pick and Play match sequences with a restore at a random point; golden save text for seed 31, two matchdays (RED-first, never re-pinned from DELIVER output); size under 16 KB worst case and under 3 KB for seed 31. Protected: P2, P3, P5 | 0 differences; golden exact |
| K3: 0 thrown errors and 0 console errors over 200 fast-check runs of unreadable inputs; 100% of unreadable saves show no "Continue" | unit: property on `decodeSave`/`fromSave` (`fc.jsonValue()`, arbitrary strings, truncated, bit-flipped, key-dropped, version-changed, matchday-swapped, `numRuns` 200) never throws and returns `undefined`; adapter fault catalogue with injected storages (throwing getter, throwing `setItem`, ignored writes, odd reads). e2e: damaged, old-version, blocked and full storage states (matrix above), each with 0 console errors | 0 throws; 0 console errors |
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
- **Rolling forward with a changed save format.** Any later deploy that changes the format, squads, streams, the match model or the AI-side policy must bump `SAVE_VERSION` (ADR-0016); old saves then read as "no saved game" (no "Continue", no console error, no migration). The replay-verify is a safety net for an unannounced change, not a substitute for the bump.
- Failure detection: a red `smoke` marks the deploy run red (including the seeded-storage, reload and "Continue" probes on the live origin); a golden save text that stops decoding shows as a red `ci:test` before merge.
- Data: the only persisted data is one client-side key per player, about 2 KB average (under 10.5 KB worst case), no server data, no personal data. Blast radius: one static page and the player's own browser.
- Result stability: no new RNG stream and no change to any result, schedule or squad for any seed; a continued season equals an uninterrupted one by construction (the round-trip law).

### Wave: DEVOPS / [REF] Mutation testing strategy
nightly-delta, inherited from `CLAUDE.md`; `/nw-deliver` Phase 5 skipped. `stryker.config.mjs` (read) mutates `src/domain/**/*.ts` except `names.ts`, plus `src/app/state.ts`; thresholds high 85, low 70, break 70. No config change by this story.
- `src/domain/selection.ts` (`isLegalXI`): INSIDE the existing glob. Killed by the DISTILL table (11 distinct indices, wrong count, duplicate, out of range, wrong position, wrong formation).
- `src/app/state.ts` (the `Continue` handler, the handler table, the exported `sidesFor`): INSIDE. Killed by `Continue` from `title` returning the payload and `toBe` no-ops elsewhere, the whole S-001..S-009 `update` suites, and the 40-action property.
- `src/app/save.ts` (the strict decoder, replay-verify, the compact encoding; the logic where mutants matter most): **OUTSIDE** the globs. Gap: a mutant there is caught only by the property tests, the golden save text and the round-trip sweep, not by the nightly. `src/adapters/save-store.ts` (probe, degrade, autosave write rule), `src/ui/screens/title.ts` and `src/main.ts` are outside too (`src/ui/` and `main.ts` never were); covered by the fault-injection unit tests, the e2e and the grep tests.
- **Owner request** (the DESIGN open question, recorded here for the owner; `stryker.config.mjs` is locked): add `src/app/save.ts` and `src/adapters/**/*.ts` to `mutate`. Not a blocker for S-010.
- Runtime watch: if the owner widens `mutate` to `save.ts`, each mutant re-runs the round-trip sweep and the fast-check properties, and `state.ts` mutants already re-run the sweep once it exists; see Open questions 3.

### Wave: DEVOPS / [REF] Observability stack
Browser console plus Playwright smoke on the deployed URL only. No RUM, error tracking, logs or tracing. The adapter and decoder write nothing to the console by design (D6), so the e2e "0 console errors" check is the only runtime signal for storage faults. SLO: smoke green per deploy (including the seed-31 reload and "Continue" probe). Alerting: a red `deploy` run; a red nightly opens `mutation-alarm`. No dashboards.

### Wave: DEVOPS / [REF] Branching strategy
Trunk-based. Short-lived `claude/S-010-*` branches, PR to main, squash merge, deploy on merge, no release branches. CI green and protected scenarios not regressing. DESIGN estimates the DELIVER diff at about 793 lines (about 1,043 with protected), under the 1200 guard, so no cut is needed. Slices 01 and 02 ship in ONE DELIVER merge; if DELIVER nears the guard, trim test duplication (the 2400-state sweep can become a seeds 1..60 sample), never split the slices.

### Wave: DEVOPS / [REF] Coexistence matrix
| Component | S-010 impact | Action |
|---|---|---|
| `ci.yml`, `deploy.yml`, `nightly.yml`, `ci:*` scripts, `playwright.config.ts` | none; Pixel 7, 390px, `BASE_URL` fit; no new script or dependency | reuse |
| `stryker.config.mjs`, `scripts/guards/pr-guards.mjs` | `state.ts` and `selection.ts` already inside the globs; `save.ts`, `src/adapters/` outside (owner request); determinism grep and 1200 cap fit | none |
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
1. **Owner request, Stryker scope**: `stryker.config.mjs` `mutate` should list `src/app/save.ts` (the strict decoder and replay-verify) and `src/adapters/**/*.ts` (the probing adapter and autosave rule). Both are new logic that matters and are outside the nightly run; until the owner adds them, the property tests, the golden save text and the fault-injection tests are the guard. `src/ui/screens/*.ts` and `main.ts` remain outside (inherited S-009 question 2). Not a blocker.
2. **Browser coverage**: storage behaviour (blocked, quota, private mode) is probed in Chromium only, by init-script simulation, not by a real private-mode or WebKit/iOS Safari run. Real engines differ in when `SecurityError` or `QuotaExceededError` fires; the design is robust to that (every call sits in a try/catch and the probe round-trips a sentinel), but only the simulated faults are tested. Owner awareness only.
3. **Nightly runtime**: widening `mutate` to `save.ts` would re-run the round-trip sweep and the properties per mutant, and `state.ts` mutants re-run them already. DELIVER keeps the sweep bounded (a trimmed seed sample is allowed) and `numRuns` at 100/200; watch the first nightly after the merge against the 45-minute timeout; if it nears it, trim test cost, not bounds, or the owner raises the timeout.
4. **Smoke on the live URL** runs the S-010 spec in fresh contexts on the shared `<owner>.github.io` origin: init-script seeding is per context, so it cannot touch a real player's storage; it relies on `?seed=` on Pages (as S-001..S-009).
5. **MDN Web Storage semantics** in DESIGN Technology choices are unverified (no lookup tool in that run); DELIVER may check them with Context7 and amend that bullet only. The e2e fault simulations do not depend on it.
6. Changes I would need in locked paths: none, other than the Stryker owner request in 1.
7. Missing `tests/protected/S-010/` (see Pre-requisites) is a plan-run item, not a DEVOPS change; flagged for the orchestrator.

### Wave: DEVOPS / [REF] Peer review
