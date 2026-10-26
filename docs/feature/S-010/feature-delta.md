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
