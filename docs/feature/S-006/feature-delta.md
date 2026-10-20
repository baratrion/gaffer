# S-006: Play my first match

## Wave: DISCUSS

Lean, unattended, revision 1 (after `nw-product-owner-reviewer` cycle 1, see Peer review). Reuses `discuss/journey.md` and `slices/slice-01..02`. Toward the north star (manage a club through a season: pick team, play match, see table), the smallest next visible increment is playing ONE match: the club's matchday-1 league fixture, quick-simmed with Sam's own formation and Starting XI, showing the final score and who scored. scope.md IN says quick-sim matches are event-based, seeded, with live text commentary, final score and basic stats, and no pitch rendering. Narrowed by scope.md precedence (ship less): this story ships only the final score and the goal events (the first commentary lines). Live or timed commentary, stats (shots, possession, cards), the season, the table and persistence are later stories. Feature type: user-facing. UX depth: lightweight. Walking skeleton: no (brownfield, extends S-001..S-005). JTBD: yes, new job J-06. No DIVERGE artifact (accepted as lean, as for S-002..S-005).

### Wave: DISCUSS / [REF] Scope Assessment
PASS: 2 small user stories with 7 scenarios in total (5, 2), 1 roadmap story and one demonstrable outcome ("my eleven played, here is the result"). 1 new small context ("Match": the schedule and the quick-sim) plus the app navigation. 2 demonstrable carpaccio slices, one release (one DELIVER), about 2.5 days. Under 1100 changed lines including tests for DELIVER, and under 1100 also with the protected scenarios written in the plan run (budget below). Integration points: league clubs (S-001), squads and attributes (S-002/S-003), formation (S-004), `currentXI` (S-005), shell focus (ADR-0008): 5, at the limit, not over it. No oversized signal: commentary, stats, the season and the table are cut (D15).

Line budget (changed lines, code plus tests; file names are indicative, DESIGN names the files). The e2e covers only what the protected scenarios do not: focus on each heading, 44px, `innerText`/`textContent` equality with apostrophe and hyphen names, a pick then "Play match" again, and the post-deploy smoke.

| File | Kind | Lines |
|---|---|---|
| `src/domain/schedule.ts` (new: fixed round-robin, matchday 1) | code | 40 |
| `src/domain/match.ts` (new: team strength, goal events, scorers) | code | 135 |
| `src/app/state.ts` (match screen, "Play match" action, `Back` case) | code | 30 |
| `src/ui/screens/match.ts` (new) | code | 45 |
| `src/ui/screens/club-home.ts` (fourth button) | code | 4 |
| `src/main.ts` (match render case) | code | 30 |
| `src/ui/styles.css` | code | 25 |
| `tests/acceptance/S-006/schedule.test.ts` (unit and property) | tests | 90 |
| `tests/acceptance/S-006/match.test.ts` (unit, property, golden lock) | tests | 240 |
| `tests/acceptance/S-006/match-navigation.test.ts` (`update`, no-ops) | tests | 110 |
| `tests/acceptance/S-006/names-avoid-match-words.test.ts` | tests | 30 |
| `tests/e2e/S-006-match.spec.ts` (trimmed to what protected does not cover) | tests | 110 |
| **DELIVER total** (code 309, tests 580) | code and tests | **889** |
| `tests/protected/S-006/match.spec.ts` (written in the plan run, outside DELIVER) | tests | 150 |
| **Grand total** (with protected) | code and tests | **1039** |

### Wave: DISCUSS / [REF] Persona
Sam, 34, a lapsed Championship Manager fan. Plays on the bus, one-handed, on a mid-range Android phone at 390px wide, with 5 minutes to spare (persona from `docs/feature/S-001/feature-delta.md`; player from brief.md). Has looked at the squad, chosen a formation and picked a Starting XI. Now Sam wants to send the team out and see, at once, whether it worked, and who scored.

### Wave: DISCUSS / [REF] JTBD one-liner
When I have picked my team and set how it lines up, I want to send it out and see the result at once, so that I find out whether my choices worked. (Recorded as J-06 `see-my-team-play` in `docs/product/jobs.yaml`; it follows J-05.) S-006 serves J-06 in part: one match only, and the "see the table" consequence is the season story's.

### Wave: DISCUSS / [REF] Glossary
- **Schedule**: one fixed round-robin over the 8 clubs of the league (D5). A **matchday** is one round of it: 4 **fixtures**, every club in exactly one.
- **Fixture**: an ordered pair of clubs, the **home** club first and the **away** club second.
- **Opponent**: the other club in Sam's matchday-1 fixture.
- **Score line**: the one piece of text on the match screen whose whole text reads `<home> <home goals>–<away goals> <away>` (D2).
- **Goal item**: one item of the list "Goals" (D3): minute, scorer, club.
- **Side**: a club's formation plus its 11 players in slot order. Sam's side is `GameState.formation` with `currentXI` (S-005); the opponent's is its automatic XI in 4-4-2.
- **Untouched tactics**: a new game in which Sam has not chosen another formation nor picked a player (so his side is the automatic 4-4-2 XI).
- **Club index**: the club's position 0..7 in `league.clubs` (S-005 glossary).

### Wave: DISCUSS / [REF] Locked decisions
- D1 Entry: the club home gains a button named exactly "Play match" (44px or taller), stacked after "Squad", "Tactics" and "Starting XI" (the `div.club-actions` stack). The club home `<h1>` is still the club's name; the other three buttons are unchanged.
- D2 Match screen: its only top-level heading (`<h1>`) is "Matchday 1", focused on arrival. The score line is exactly one piece of text on the match screen (an element that is not a heading) whose whole text reads `<home club name> <home goals>–<away goals> <away club name>`: one space, the home goals, an EN DASH (U+2013) with no spaces around it, the away goals, one space. Pattern: `^(.+) (\d)–(\d) (.+)$`. No other text on the match screen (commentary or stats included, now or later) reads in that format. Example: "Netherwold Borough 2–1 Brindlecombe Rovers". Goals are whole numbers 0-9. Club names hold no digits, dashes or brackets (`TOWNS` and `CLUB_SUFFIXES`, `names.ts`), so the pattern parses unambiguously. One club is Sam's; the other is a different club of the same league (a name in the "Clubs" list). Timing is D13; there is no time cap in milliseconds.
- D3 Goals list: a list named "Goals" (visible non-heading label, as the Tactics "Line-up" label) below the score line holds exactly one item per goal, home goals plus away goals. For 0–0 it is still present, with zero items. Items are in match order, minutes never decreasing (two goals may share a minute). Each item reads exactly `<minute>' <scorer name> (<club name>)`: minute a whole number 1-90 (no stoppage or extra time), a straight apostrophe (U+0027), one space, the scorer's name as in the "Squad" list, one space, the scorer's club name in round brackets. Example: "23' Ivo Elderkin (Netherwold Borough)". Scorer names may hold an apostrophe or a hyphen ("61' Ulric O'Garrity (Oakhampton Rise Borough)"); the scorer is everything between "' " and the last " (". The number of items naming each club equals that club's goals in the score line.
- D4 Who plays and who scores: Sam's club fields its current formation and Starting XI (S-004/S-005 state: the stored picks, else the automatic XI of the formation; `currentXI`). The opponent fields its automatic XI in 4-4-2 (the default) in this story. Every scorer for Sam's club is one of the 11 names on its Starting XI screen at the time of the match, and never the player in the GK slot. Every scorer for the opponent is an outfield player of the opponent's XI: so a player of the opponent's "Squad" list and never a name from Sam's squad (names are unique league-wide, S-002). No goalkeeper scores, no own goals, in this story.
- D5 Fixture: matchday 1 of one fixed round-robin schedule over the 8 clubs (4 fixtures; every club plays exactly one other; the schedule fixes which club is home). Symmetric: managing the opponent instead, in a new game with the same seed, shows the same two clubs in the same order (home first). DESIGN chooses the schedule algorithm (the circle method is expected; whether it depends on the seed is DESIGN's call) and records it in an ADR; the season story reuses it for all 14 matchdays (double round-robin, scope.md).
- D6 Determinism: the match is a pure function of the seed, the fixture, both formations and both XIs. No wall clock, no `Math.random`. Its seeded draws use a stream of their own that leaves the league, name, club and attribute streams (-1, 0..7, 100..107, ADR-0005/0006) and so every S-001..S-005 output unchanged. Two fresh visits with the same `?seed=`, the same club and untouched tactics show an identical match screen; `?seed=abc` shows the same match as the default seed (no seed). Changing the formation or the XI may change the result.
- D7 Match model floor (DESIGN defines the model and records it in an ADR): event-based, seeded; team strength comes from the XI's attributes (S-003), so a better eleven helps. Unit-level properties (not black-box), each over at least 1000 seeded matches: (a) between two automatic XIs (any clubs, 4-4-2), the mean goals per side is between 1.0 and 2.0 and under 20% of matches end 0–0; (b) a stronger XI scores more on average: "stronger" means a higher sum of the 11 players' overalls, and against the same opponent XI, an XI whose sum is at least 20 higher scores more goals on average than the lower one (for example a club's automatic XI against its XI of the lowest-rated players of each position). DESIGN may refine "stronger" in the ADR (for example by line or attribute) but must keep (b) for this measure; (c) goals per side never exceed 9. Condition, home advantage, morale and opponent strength beyond its XI's attributes are not required. Black-box realism floor: over the 8 clubs of a league (its 4 matchday-1 fixtures), not every match ends 0–0 (protected tests may check this at a few seeds).
- D8 Not recorded: playing the match changes nothing in the game state except the screen. No table, no matchday advance, no condition change, no stats, no stored result (the result is derived on render, as the squad is, ADR-0005 (d), DESIGN's call). In this story "Play match" again replays the same match; this is NOT pinned by `tests/protected/S-006/` (the season story will advance matchdays). The protected scenarios only look at the first match of a new game in a fresh page.
- D9 Back: a button named exactly "Back" (44px or taller) returns to the club home with focus on its `<h1>`, the club's name. The XI and the formation are unchanged.
- D10 Navigation (names and shapes for DESIGN, ADR-0003): `Screen` gains a match variant (club id). `Action` gains one action, valid only from a known club's home. `Back` goes from the match to the club home. Wrong-screen actions and an unknown club are no-ops, as before. `GameState` gains nothing (D8). `sameScreen` gains the match case; every new navigation changes the screen, so focus goes to the new `<h1>` (ADR-0008).
- D11 Accessible names: no new accessible name may collide with an existing one, nor a generated name with a new one. "Play match", "Goals" and "Matchday" appear (case-insensitive substrings, as Playwright matches by default) in no string array of `src/domain/names.ts` (`TOWNS`, `CLUB_SUFFIXES`, `COLOUR_PALETTE`, `FIRST_NAMES`, `SURNAMES`), nor in any "First Last" or "Town Suffix" text built from them. DISTILL adds a unit check, like S-005 D12 (checked by hand today: none collide). "Play match" contains none of the S-001..S-005 locator words ("Squad", "Tactics", "Starting", "Players", "Back", "Clubs", "Choose", "Formation", "Line-up"), and the match screen has the only "Back" on its screen.
- D12 Phone first: no horizontal scroll at 390px (long score lines and goal items wrap), all buttons 44px or taller, no console errors, generated text through `el()`/`textContent` only (ADR-0002). Renderers never move focus (ADR-0008).
- D13 Instant result (durable): on arrival, the score line and the Goals list are already shown (the result is not revealed over time); any later commentary is additive and never delays them. Testable as: when the `<h1>` "Matchday 1" has focus, the score line and the list "Goals" with all its items are already visible. No millisecond cap is set; there is nothing to wait for. A later live-commentary story may add a reveal of commentary lines, but not of the score line or the goal items.
- D14 Protected-scenario durability: everything in the roadmap outcome becomes a permanent black-box test, so it must hold after later stories (season, live commentary, save). The heading "Matchday 1" and the instant result are pinned for the first match of a new game only. Replaying, the opponent's identical result under symmetric untouched tactics, the opponent's formation and the model's numbers are unit-level, not protected. Later stories must keep, on the match screen of a new game's first match: the `<h1>` "Matchday 1"; one score line in the D2 format and no other text in that format; the list "Goals" in the D3 format; both shown on arrival (D13); and "Back" to the club home.
- D15 Deferred candidates (not planned here; the plan run may queue them): live minute-by-minute commentary reveal; match stats (shots, possession, cards); the season's fixtures, other results and the league table; opponent tactics (formation choice, picks); condition and home advantage in the model.
- UX depth: no mockups beyond the journey table.

### Wave: DISCUSS / [REF] Story map and priority
Backbone: pick club, club home, squad, player, tactics, starting XI, **play match** (play, see score, see scorers, back), (next: commentary, stats, season, table). Walking skeleton: the existing S-001..S-005 path plus one branch from the club home (club home, match, back). One release, two thin slices, both in the one S-006 DELIVER:
1. `slices/slice-01-play-and-see-score.md` (US-1): the club home button, the schedule, the match model, the match screen with the score line, and Back. Value 5 x urgency 5 / effort 3 = 8.3. It comes first: it is the "play match" step of the loop and proves the whole chain (seed, schedule, sides, model, screen).
2. `slices/slice-02-see-who-scored.md` (US-2): the list "Goals" and the scorer rules. 4 x 4 / 1.5 = 10.7, but it depends on slice 01. It turns a number into Sam's players, the proof that his picks played.
Priority rationale: "play match" is the second step of the brief's five-minute loop and the first time Sam's decisions have a consequence (brief principle 1). The slices are ordered by dependency, then by outcome value. The roadmap outcome and `tests/protected/S-006/` are complete only after slice 02.
Rejected alternatives: commentary-first (a live text reveal before any result exists is presentation without a consequence, and it bloats the first match story); season or table first (a table needs many matches, so it ships more and still needs this story's single match first).

### Wave: DISCUSS / [REF] User stories
Fixtures: Netherwold Borough is club index 0 at `?seed=31`, with its real automatic 4-4-2 XI from S-005 (GK Tamsin Ingleby 17; DF Bram Pemberly 19, Calder Ashcombe 18, Quill Crossley 4, Quill Yarrow 3; MF Ivo Elderkin 18, Joren Dalrymple 16, Calder Redfern 15, Dorian Dunmore 7; FW Merrick Hartwell 8, Garrick Thistlewood 5) and its bench (Alden Zealby, Calder Kilbride, Dacey Jessamy, Finlay Ballantyne, Kestrel Northcott, Emlyn Vexford, Finlay Fitch-Moreton). Oakhampton Rise Borough is club index 7 at `?seed=abc` (default 20260). The opponent, the score and the minutes cannot be known before DESIGN fixes the schedule and the model, so the examples mark them illustrative ("Brindlecombe Rovers" is an S-001 example name); the acceptance criteria state rules, never a golden score. A golden match is pinned as a regression lock in DELIVER's first green commit.

#### US-1: Play my matchday-1 fixture and see the score
**Problem:** Sam has picked an eleven and a formation, and nothing happens with them. Without a match there is no consequence, so the choices feel like admin, not management.
**job_id:** J-06

##### Elevator Pitch
- Before: the club home offers "Squad", "Tactics" and "Starting XI"; Sam's eleven never plays.
- After: on Netherwold Borough's home Sam taps "Play match" and sees the heading "Matchday 1" and one line such as "Netherwold Borough 2–1 Brindlecombe Rovers" (opponent and score illustrative).
- Decision enabled: did my eleven and formation work, or do I change them?

**Domain examples**
1. `?seed=31`, "New game", "Netherwold Borough", "Play match": "Matchday 1" and a line such as "Netherwold Borough 2–1 Brindlecombe Rovers", or "Brindlecombe Rovers 0–0 Netherwold Borough" if the schedule makes Netherwold Borough the away side. The other club is one of the 7 other "Clubs" names.
2. Symmetry: a new game at `?seed=31` managing that opponent instead shows the same two names in the same order. Managing each of the 8 clubs in turn gives 4 pairings, every club in exactly one, and at least one of the 4 lines is not 0–0.
3. `?seed=abc`, 8th club "Oakhampton Rise Borough", with untouched tactics: the same match screen as with no seed. After "Tactics", "4-3-3", "Back", "Play match", "Back", the club home heading "Oakhampton Rise Borough" has focus and Tactics still has 4-3-3 checked.

**Acceptance criteria (embedded UAT)**
```gherkin
Scenario: Sam plays his matchday-1 fixture and the final score is there on arrival
  Given Sam opens a fresh page at "?seed=31" on a 390px-wide viewport, taps "New game", reads the 8 names of the "Clubs" list and taps "Netherwold Borough"
  When Sam taps the button named "Play match"
  Then its only top-level heading (h1) is "Matchday 1", focused on arrival, and while it has focus exactly one piece of text on the screen already reads in full "<home> <h>–<a> <away>" (h and a whole numbers 0-9, an en dash), one club being "Netherwold Borough" and the other a different name from the "Clubs" list

Scenario Outline: The same seed always plays the same match
  Given Sam opens a fresh page at "<first>", taps "New game" and "<club>", and taps "Play match"
  When Sam does the same in a second fresh page at "<second>"
  Then both match screens read the same heading, score line and "Goals" items
  Examples:
    | first     | second    | club                    |
    | ?seed=31  | ?seed=31  | Netherwold Borough      |
    | ?seed=abc | (no seed) | Oakhampton Rise Borough |

Scenario: Every club meets one opponent on matchday 1, and both see the same fixture
  Given fresh pages at "?seed=31", one per club of the "Clubs" list, each with "New game", that club and untouched tactics
  When Sam taps "Play match" in each
  Then every club's score line names it and exactly one other club, the 8 lines form 4 pairings with every club in exactly one, and both clubs of a pairing see the same two names in the same order

Scenario Outline: A league's matchday is not all goalless
  Given Sam has played the matchday-1 match of each of the 8 clubs at "<seed>" with untouched tactics
  When Sam compares the 4 different score lines
  Then at least one of them is not "0–0"
  Examples:
    | seed      |
    | ?seed=31  |
    | ?seed=abc |

Scenario: Back returns to the club home with the team as Sam left it
  Given Sam at "?seed=31" managing "Netherwold Borough" has chosen "4-3-3" in Tactics and picked "Kestrel Northcott 6" for "MF Calder Redfern 15" on the Starting XI
  When Sam taps "Play match" and then "Back"
  Then the club home heading "Netherwold Borough" has focus, Tactics still has "4-3-3" checked, and the Starting XI reads the same 11 buttons as before the match, the 8th "MF Kestrel Northcott 6"
```
Checked inside these scenarios or by the e2e (to keep 7 scenarios): "Play match" and "Back" are at least 44px tall; "Play match" sits after "Starting XI" and the club home still shows "Squad", "Tactics" and "Starting XI"; nothing scrolls sideways at 390px and no console error appears on the club home and match screens.

**Outcome KPI:** K1, K3 (below).
**Technical notes (for DESIGN, not AC):** the schedule and the model are pure domain modules (no RNG import beyond `rng.ts`, no `Date`); the model's stream is new (D6). Both squads derive on render (`squadOf`, ADR-0005); Sam's side uses `currentXI(state, squad)` and `state.formation`; the opponent's uses `automaticXI(squad, "4-4-2")` (ADR-0009). `update` adds one screen and one action with the usual guards; the result is derived in `main.ts`, not stored (D8). Expected ADR(s): the schedule algorithm and home/away rule; the match model (strength from attributes, event draw, scorer weighting, goal cap 9, stream number). Depends on S-001..S-005.

#### US-2: See who scored, from my eleven
**Problem:** a bare score does not tell Sam whether his picks mattered. He swapped Kestrel Northcott into midfield; he wants to see his names on the scoresheet, and never a player he left out.
**job_id:** J-06

##### Elevator Pitch
- Before: the match screen shows only the score line.
- After: on Netherwold Borough's home Sam taps "Play match" and, under the score line ("Netherwold Borough 2–1 Brindlecombe Rovers"), reads the list "Goals": "23' Ivo Elderkin (Netherwold Borough)", "61' Rurik Fairbourne (Brindlecombe Rovers)", "78' Merrick Hartwell (Netherwold Borough)" (illustrative).
- Decision enabled: who earned his place, and who do I drop or keep for the next match?

**Domain examples**
1. Netherwold Borough's automatic XI: its goals are credited to names such as Ivo Elderkin or Merrick Hartwell, never to Tamsin Ingleby (the GK slot), never to a bench name such as Kestrel Northcott.
2. Sam picks "Kestrel Northcott 6" for "MF Dorian Dunmore 7" before the match: Kestrel Northcott may now score for Netherwold Borough, Dorian Dunmore cannot.
3. A 0–0 (for example "Brindlecombe Rovers 0–0 Netherwold Borough"): the list "Goals" is present and empty. At `?seed=abc`, when Oakhampton Rise Borough is the opponent, a goal by its defender Ulric O'Garrity (in its automatic 4-4-2 XI: DF Wystan Redfern 14, Ulric O'Garrity 8, Soren Dalrymple 8, Perrin Dunmore 6) reads "61' Ulric O'Garrity (Oakhampton Rise Borough)"; its goalkeeper Alden Hartwell never scores.

**Acceptance criteria (embedded UAT)**
```gherkin
Scenario: Every goal in the score is listed with its minute, scorer and club
  Given Sam has played the matchday-1 match of each of the 8 clubs at "?seed=31", in fresh pages with untouched tactics
  When Sam reads each match screen's list named "Goals"
  Then it is present and holds exactly home goals plus away goals items (none when the score line reads 0–0), each reading "<minute>' <scorer> (<club>)" with minute a whole number 1-90, minutes never decreasing, and the items naming each club equal that club's goals in the score line

Scenario: My goals come from my eleven on the pitch, theirs from their squad
  Given Sam at "?seed=31" managing "Netherwold Borough" has picked "Kestrel Northcott 6" for "MF Dorian Dunmore 7", and has read the 11 names on the Starting XI and the 18 of the "Squad" list
  When Sam taps "Play match" and reads the list "Goals"
  Then every item naming "Netherwold Borough" names one of those 11 and not "Tamsin Ingleby", and every item naming the opponent names a player outside Netherwold Borough's "Squad" list who is in the opponent's "Squad" list (read in a new game managing the opponent)
```
Also checked by the e2e: names with an apostrophe or a hyphen read as in the squad; no sideways scroll and no console errors.

**Outcome KPI:** K2 (below).
**Technical notes (for DESIGN, not AC):** goal events carry the side and the scorer's squad index; the screen maps them to names through the derived squads, so the score line and the list read the same result. The list uses `role="list"` with a visible label (as "Line-up"), so it stays exposed when empty. Item text is one text node or inline spans with literal single spaces (S-005 inline-flow rule). Depends on US-1.

Notes for DESIGN and DISTILL (not part of the AC):
- "Has focus" means `document.activeElement` is the `<h1>`.
- D10 no-ops (the match action off a known club's home, `Back` with an unknown club) and "playing changes no state but the screen" are unit tests on `update`.
- D5 (perfect matching, fixed home) and D7 (ranges, stronger scores more, mean 1.0-2.0, cap 9) and the D4 scorer rules get property tests over many seeds, all 8 clubs and all 3 formations (fast-check honours `FC_SEED`).
- Protected scenarios are rule-based: they parse the score line and goal items with the D2/D3 patterns and read names from the "Clubs", "Squad" and Starting XI screens. They never pin a golden score, opponent or minute.
- D11 is a unit check over the name arrays, plus review.
- DISTILL hand-off: protected and e2e locators use `exact: true` for "Play match", "Back" and "Goals" (button "Play match", button "Back", list "Goals"), and for the heading "Matchday 1".
- D13 is checked by reading the score line and the "Goals" items right after asserting focus on the `<h1>`, with no wait for text to change.
- Adding "Play match" must keep `tests/protected/S-001..S-005` green: they find "Squad", "Tactics", "Starting XI" and "Back" by name and do not count club home buttons.

### Wave: DISCUSS / [REF] Outcome KPIs
| # | Who | Does what | By how much (target) | Baseline | Measured by |
|---|---|---|---|---|---|
| K1 | Sam on a 390px phone | Sees his club's match result from the club home | 1 tap ("Play match"); on arrival the score line and the "Goals" list are already shown (no reveal, no second tap, D13); back home in 1 tap | not possible (no match) | e2e click counter (as S-003..S-005) |
| K2 | Sam | Recognises his own players among his club's scorers | 100% of his club's goal items name one of the 11 on his Starting XI screen; 0 name the GK slot or a player he left out | not possible | e2e and property tests (`ci:test`, fresh `FC_SEED`) |
| K3 | Sam | Finds that his choices matter and results look like football | an XI whose overall sum is at least 20 higher scores more on average against the same opponent; mean goals per side 1.0-2.0 and under 20% 0–0 between two automatic XIs (D7) | not possible | property tests over at least 1000 seeded matches |

Guardrails: S-001..S-005 protected scenarios stay green; league, squads, attributes and automatic XIs unchanged for every seed; no sideways scroll at 390px and 0 console errors on the club home and match screens. Environments as in the DEVOPS environment matrix (`docs/feature/S-004/environments.yaml`): local-preview `http://localhost:4173/gaffer/` (`ci:serve`) for e2e and protected scenarios, and the production Pages URL for the post-deploy smoke, both on Chromium with the Pixel 7 profile at 390px. There is no analytics in the POC; the e2e tap count and the property tests are the only measurements.

### Wave: DISCUSS / [REF] DoD
- `tests/protected/S-006/` passes on main; `tests/protected/S-001/` to `S-005/` still pass.
- Unit and property tests pass for the schedule, the match model (determinism, ranges, strength, mean goals, scorer rules) and navigation (including no-ops and "no state change but the screen"). The D11 names check passes. The `ci:*` scripts are green.
- The e2e phone-viewport smoke (local-preview and the post-deploy smoke, per the DEVOPS matrix) covers: club home, "Play match", score line, "Goals", "Back" (heading focused), then a pick in Starting XI and "Play match" again. It checks focus on each new heading.
- A golden match (seed 31, Netherwold Borough, untouched tactics) is pinned as a regression lock once the model is green.
- The DELIVER change stays under 1100 changed lines including tests (889 budgeted; 1039 with the plan run's protected scenarios).
- `tests/acceptance/S-001..S-005/` assertions are not edited or weakened; generator outputs are unchanged.
- No ambient randomness or wall-clock time in `src/domain/`. The schedule and match ADR(s) are accepted.

### Wave: DISCUSS / [REF] Out-of-scope
- Live or timed commentary, any commentary line other than goals, a "Skip" control (D15; D13 already keeps the result instant for any later commentary).
- Match stats: shots, possession, cards; assists, penalties, own goals, ratings, injuries, substitutions.
- The season: other fixtures' results, matchday advance, the league table, top scorers; persistence across reloads.
- Opponent tactics (formation choice, picks); condition, home advantage or morale in the model; any state change from playing.
- Every OUT tag, notably `match-2d` (no pitch, no 2D rendering) and `utility-ai` (no per-player decisions), plus `transfers`, `finances`, `training`, `youth`, `staff`, `multiplayer`, `backend`, `real-data`.

### Wave: DISCUSS / [REF] WS strategy
No new walking skeleton (brownfield). This story extends the S-001..S-005 skeleton by one branch from the club home: club home, match, back. The e2e journey "Starting XI, a pick, Back, Play match, Goals, Back" is the end-to-end proof. Two carpaccio slices in order (`slices/slice-01..02`), both delivered in the one S-006 DELIVER. Pure domain precursor commits (the schedule, then the model) are allowed inside slice 01, not as separate slices.

### Wave: DISCUSS / [REF] Driving ports
- Schedule (pure; shape for DESIGN): the fixtures of a matchday for the 8 clubs, home first.
- Match (pure; shape for DESIGN): from the seed, the fixture and both sides, the goals of each side and the goal events (minute, side, scorer).
- `update(GameState, Action) => GameState` with the match action and `Back` from the match; `focusPlan` with the match screen.
- UI entry, reachable by role and accessible name at `http://localhost:4173/gaffer/`:
  - the button named "Play match" on the club home;
  - the match screen (`<h1>` "Matchday 1", the score line, list "Goals", "Back").

### Wave: DISCUSS / [REF] Pre-requisites
- S-001..S-005 delivered (league, squads with attributes, formation, `currentXI`, `automaticXI`, `squadOf`, `focusPlan`, club home actions).
- ADR-0001..0009 accepted. Expected from DESIGN: ADR-0010 (and ADR-0011 if DESIGN splits them), covering the schedule algorithm and home rule, the match model and its RNG stream, the scorer choice, and where the result is derived (D8).
- `docs/product/jobs.yaml` now has J-06 (resolved). Roadmap entry S-006 to be appended by the orchestrator from the draft below.
- Open item for DESIGN: the visual weight of the score line (it is a paragraph, not a heading, D2) and the layout of goal items at 390px.

### Wave: DISCUSS / [REF] Roadmap outcome (draft)
From the club home screen the player taps a button named exactly "Play match" (44px or taller; the club home's heading is still the club's name and its "Squad", "Tactics" and "Starting XI" buttons stay) and sees the match screen of the club's matchday-1 league fixture, already played (quick-sim, no pitch): its only top-level heading (h1) is "Matchday 1", focused on arrival. On arrival, the score line and the Goals list are already visible when the heading has focus (the result is not revealed over time); any later commentary is additive and never delays them. The score line is exactly one piece of text on the match screen whose whole text reads the home club's name, one space, the home goals, an en dash (–), the away goals, one space and the away club's name, with no spaces around the dash (pattern ^(.+) (\d)–(\d) (.+)$), for example "Netherwold Borough 2–1 Brindlecombe Rovers"; no other text on the match screen (commentary or stats included) reads in that format. Goals are whole numbers from 0 to 9. One of the two clubs is the player's club and the other is a different club from the "Clubs" list of the same league. On matchday 1 every club of the league plays exactly one other club, and the pairing and which club is named first come from the league's fixed schedule: in a new game with the same seed, picking the opponent instead shows the same two clubs in the same order. A list named "Goals" holds exactly one item per goal (home goals plus away goals; for 0–0 the list is there with no items), in match order with minutes never decreasing. Each item reads exactly the minute (a whole number from 1 to 90), a straight apostrophe ('), one space, the scorer's name, one space and the scorer's club name in round brackets, for example "23' Ivo Elderkin (Netherwold Borough)"; names may hold an apostrophe or a hyphen, as in "61' Ulric O'Garrity (Oakhampton Rise Borough)". The number of items naming each club equals that club's goals in the score line. Every goal for the player's club is scored by one of the 11 players on its Starting XI screen at the time of the match, never the one in the GK slot; every goal for the opponent is scored by a player of the opponent's "Squad" list who is not a goalkeeper (GK), never by a player of the player's squad. The match comes from the seed: two fresh visits with the same "?seed=" and the same club, without changing the formation or the Starting XI, show the identical match screen, and "?seed=abc" shows the same match as no seed. Over the 8 clubs of a league, not every matchday-1 match ends 0–0. A button named exactly "Back" (44px or taller) returns to the club home with focus on its heading, the club's name, and the formation in Tactics and the Starting XI are unchanged. These hold for the first match of a new game in every later version of the game: the h1 "Matchday 1", the one score line in this format, the "Goals" list in this format, both shown on arrival, and "Back" to the club home. No horizontal scroll at 390px and no console errors.

### Wave: DISCUSS / [REF] DoR validation
| # | Item | Status | Evidence |
|---|---|---|---|
| 1 | Problem clear, domain language | PASS | US-1: the picks have no consequence without a match; US-2: a bare score does not show whether his picks played |
| 2 | Persona specific | PASS | Sam, 34, one-handed on a bus, 390px Android, 5 minutes, has picked an XI and a formation |
| 3 | 3+ domain examples, real data | PASS | Real generator values: Netherwold Borough (`?seed=31`, club 0) with its real XI and bench, Oakhampton Rise Borough (`?seed=abc`, club 7), real names with an apostrophe; 3 examples per story. Opponent, score and minutes are marked illustrative (not knowable before DESIGN); the ACs state rules only |
| 4 | UAT Given/When/Then, 3-7 | PASS | Counting rule: scenarios are counted per roadmap story (all its user stories together, as S-005), and a Scenario Outline counts as one scenario whatever its Examples rows. 7 for S-006: US-1 5 (two of them outlines), US-2 2; exact step sequences, one Then each; the 0–0 empty-list check is inside US-2's first Then, not a separate scenario |
| 5 | AC derived from UAT | PASS | Embedded scenarios are the AC: D1-D6, D9, D12 and D13 by scenario; D7 properties, D8, D10 no-ops and D11 by unit tests and review (Notes) |
| 6 | Right-sized | PASS | 2 slices in about 2.5 days; DELIVER 889 of at most 1100 changed lines including tests (1039 with the plan run's 150 protected lines); 7 scenarios; one outcome |
| 7 | Technical notes | PASS | Labelled per story: pure schedule and model, new RNG stream, squads derived on render, `currentXI` and `automaticXI` reuse, result not stored, list exposed when empty |
| 8 | Dependencies tracked | PASS | S-001..S-005 delivered; ADR-0010 (and maybe 0011) expected from DESIGN; D15 deferred candidates; live commentary constrained by D13/D14 (no longer an open consideration); open layout item |
| 9 | Outcome KPI measurable | PASS | K1 1 tap, result shown on arrival, 1 tap back; K2 100% from the XI and 0 GK; K3 overall-sum stronger XI scores more, mean 1.0-2.0, under 20% 0–0 over at least 1000 matches; by e2e and property tests |

DoR status: PASSED (both stories). Every story has `job_id` J-06 and an Elevator Pitch.

### Wave: DISCUSS / [REF] Peer review
`nw-product-owner-reviewer` (haiku), cycle 1: rejected_pending_revisions (H1-H4, M1-M5, L1-L5). Revision 1 applied as below.

| Finding | How it landed |
|---|---|
| H1 instant result not durable | New locked D13: "On arrival, the score line and the Goals list are already shown (the result is not revealed over time); any later commentary is additive and never delays them", testable as both already visible when the `<h1>` has focus. Same sentence in the roadmap outcome; the open consideration is removed; D14 (durability) and D15 (deferred) renumbered |
| H2 heading wording and must-keep list | "its only top-level heading (h1) is "Matchday 1", focused on arrival" in the outcome, D2 and the US-1 Gherkin; the D14 must-keep list is copied briefly into the outcome |
| H3 score line unit | D2, Glossary and outcome: exactly one piece of text whose whole text reads `<home> <h>–<a> <away>` (`^(.+) (\d)–(\d) (.+)$`), and no other text on the match screen, commentary or stats included, in that format. "At once / no waiting" replaced by the D13 wording; no millisecond cap (M3) |
| H4 US-2 entry point | US-2 After now starts: Sam taps "Play match" and, under the score line, reads the list "Goals" |
| M1 KPI and property thresholds | D7, K3 and slice-01 developer criteria: at least 1000 seeded matches; between two automatic XIs mean goals per side 1.0-2.0 and under 20% 0–0; "stronger" = higher sum of the 11 overalls, an XI at least 20 higher scores more on average against the same opponent; DESIGN may refine in the ADR but keeps that property |
| M2 protected lines in budget | Budget table adds `tests/protected/S-006/` (150, plan run, outside DELIVER); e2e trimmed from 195 to 110 (only what protected does not cover); DELIVER 889, grand total 1039, both under 1100; slices re-estimated |
| M3 no timing cap | No 500 ms or other cap; D13 is the timing rule (see H3) |
| M4 | Not restated in the revision brief; no separate change beyond the above |
| M5 0–0 check and counting rule | The 0–0 empty list is inside US-2's first Then; DoR item 4 states the counting rule (per roadmap story, an outline counts as one) |
| L1 example 3 | "with untouched tactics" added to US-1 example 3 |
| L2 rejected alternatives | Story map: commentary-first and season/table-first rejected, one line |
| L3 J-06 functional | `docs/product/jobs.yaml` J-06 functional adds "starting with the first match of the season" |
| L4 exact locators | Notes for DISTILL: `exact: true` for "Play match", "Back", "Goals" (and the heading "Matchday 1") |
| L5 textContent in slice IN | Moved from slice-02 IN to a technical-notes line |

Cycle 2 (final): approved_with_notes. Cycle-1 findings all resolved. Notes folded in by the orchestrator:
| Finding | How it landed |
|---|---|
| M-A opponent scorer weaker than D4 | Outcome now says the opponent's scorer is a non-GK player of its "Squad" list (black-box checkable by managing the opponent). "From the opponent's automatic XI" stays unit-level (D14), because a later opponent-tactics story may change who the opponent fields |
| M-B "in the DOM" vs "shown" | D13, slice-01 and the outcome say "already visible when the heading has focus" |
| M-C symmetric score lines | **Not adopted (recorded disagreement).** Same score from both sides holds today (both use 4-4-2 and automatic XIs in a new game), but a permanent black-box test of it would break as soon as an opponent-tactics story lets non-managed clubs choose a formation other than the managed club's 4-4-2 default. Kept as a unit-level property in DISTILL (`playMatch` is a pure function of fixture and both sides). The protected scenario pins only the symmetric pairing (same two clubs, same order) |
| M-D 0–0 empty list coverage | DISTILL adds a view-level test rendering an injected 0–0 result (list "Goals" present, 0 items); the protected check of the empty list is conditional on a 0–0 occurring |
| M-E US-2 pitch used a bench player | After line now reads "78' Merrick Hartwell (Netherwold Borough)" |
| L-1 roadmap fields | Appended as week 4, title "Play my first match", tags [match, league] |
| L-2 button order durability | Outcome no longer pins the order of the club-home buttons, only that "Play match" exists and the other three stay |
| L-3 journey wording | "never decreasing", "44px or taller" |
| L-4..L-8 | Accepted as notes for DISTILL; no outcome change |

## Wave: DESIGN

- **Setup**: mode propose; scope application; one solo team, so no Conway constraint. Paradigm: functional core, imperative shell (ADR-0003; recorded in the ADRs and the brief, not in CLAUDE.md).
- **New ADRs**: `adr-0010-fixed-round-robin-schedule.md` (schedule algorithm and home rule) and `adr-0011-match-model-stream-and-match-screen.md` (match model, RNG stream, where the result is derived, navigation and screen).
- **Brief**: `docs/product/architecture/brief.md` gains the "Match (S-006, ADR-0010, ADR-0011)" subsection, effect-isolation and inventory rows, the C4 L2 descriptions, and "For Acceptance Designer" ports 19-23 plus the S-006 observable bullet.
- **No new C4 container.**
- **Calibration**: a scratch spike (outside the repo, nothing committed) ran the exact ADR-0011 rules against the real generator to calibrate D7 before DELIVER. Results are in ADR-0011.
- **No outcomes registry**: `docs/product/outcomes/` does not exist, so the collision check is skipped.

### Wave: DESIGN / [REF] DDD list
- **New small context**: "Match" (supporting), made of two pure modules.
  - "Schedule" (`schedule.ts`): seed-free fixed data.
  - "Match" (`match.ts`): the seeded quick-sim.
  - Both are built over "League setup" (squads, overall) and "Selection" (`StartingXI`).
- **Language**: Schedule, Matchday, Fixture (home first), Fixture index, Side (squad plus XI), Strength (sum of 11 overalls), Chance, Conversion, Goal event, Score line, Goal item.
- **Value objects**: `Fixture { home, away }`, `MatchSide { squad, xi }`, `MatchInput`, `GoalEvent { minute, side, playerIndex }`, `MatchResult { homeGoals, awayGoals, goals }`.
- **No aggregate and no stored entity**: the match is derived on render (D8).
- **Invariants by construction**:
  - Every matchday is a perfect matching with a fixed home.
  - Each ordered pair meets once over the 14 matchdays.
  - At most 9 goals per side (9 chances).
  - Minutes 1..90 in windows.
  - Scorers are outfield starters.
  - The RNG consumption (54 draws) is independent of the XIs, so a stronger side never scores fewer on the same seed.

### Wave: DESIGN / [REF] Decisions
| # | Decision | Source |
|---|---|---|
| D1 | **Schedule**: a seed-independent circle method over club indices, in new pure `src/domain/schedule.ts`.<br>- Round `r`: {`r`, 7} with `r` at home when `r` is even; {`(r+k) mod 7`, `(r-k) mod 7`} for `k` = 1..3, the first at home when `k` is odd.<br>- Matchdays 8..14 mirror 1..7. Matchday 1 is `[0 v 7, 1 v 6, 5 v 2, 3 v 4]`.<br>- `fixturesOf(matchday)` and `fixtureOf(matchday, clubIndex)` read a deeply frozen table; out of range throws `RangeError`.<br>- All 14 matchdays now (a mirror is one expression).<br>Rejected: a seeded permutation (a stream for no visible gain, since `league.clubs` is already seeded); seeded home choice (home balance lost); a literal table (56 hand-typed pairs); matchday 1 only (the season story could pick another home rule). | ADR-0010; DISCUSS D5 |
| D2 | **Goal generation**: fixed chances. 9 per side, one per 10-minute window. Each chance always draws 3 floats (minute, conversion, scorer), so there are 54 draws per match whatever the XIs.<br>Rejected: a per-minute loop (180+ draws, and the cap is a rule instead of a structure); a Poisson count (needs `Math.exp`, implementation-approximated across engines; variable draws; truncation). | ADR-0011 (1); DISCUSS D3, D6, D7(c) |
| D3 | **Strength and conversion**: `S` = the sum of the XI's 11 overalls; the overall is the position-weighted attribute rating (ADR-0006). Conversion `p = 0.30 x S_own^3 / (S_own^3 + S_opp^3)`.<br>D7(b) holds for the DISCUSS measure itself, per seed (monotone coupling).<br>Overrules the brief's leaning towards attack and defence ratings from attributes: an XI 20 higher only through its GK and defenders would score less, which violates D7(b).<br>Rejected: linear with a clamp (equal at the clamp); logistic (`Math.exp`). | ADR-0011 (2); DISCUSS D7 |
| D4 | **No home advantage**. This overrules the brief's leaning: DISCUSS Out-of-scope and D15 list home advantage as deferred. The simulated home share is about 50%. | DISCUSS D15, Out-of-scope |
| D5 | **Scorer**: weighted among the side's outfield starters by shooting x {DF 1, MF 2, FW 4}, walked in slot order with integer cumulative weights. Never the GK, no own goals.<br>Simulated shares: DF 12%, MF 36%, FW 51%.<br>Rejected: shooting only (DF 27%); uniform. | ADR-0011 (3); DISCUSS D4 |
| D6 | **Stream**: `deriveSeed(seed, 200 + (matchday - 1) x 4 + fixtureIndex)`, streams 200..255, one per scheduled fixture. Table: -1, 0..7, 100..107, 200..255; the spike found no derived-seed collision over 10000 seeds.<br>The result is independent of other fixtures and of which club is managed.<br>Rejected: one stream per matchday (couples fixtures); a stream per club pair (collides on a cup or replay). | ADR-0011 (4); DISCUSS D6 |
| D7 | **Determinism across engines**: the model uses only `+ - * /`, comparisons and `Math.floor`. No `Math.pow`, `**`, `exp` or `log`: a grep unit test, plus the e2e comparing the browser's seed-31 screen with the Node golden. | ADR-0011 Earned Trust; DISCUSS D6 |
| D8 | **Result not stored**. A pure `matchFor(state, clubId)` in `state.ts` derives it on render; `main.ts` calls it and maps it to view props. The managed side is `currentXI`; the other side is `automaticXI(squad, DEFAULT_FORMATION)`. `OPENING_MATCHDAY = 1`.<br>This refines the DISCUSS note "derived in `main.ts`": the derivation sits in a unit-tested, Stryker-covered selector, as `currentXI` does.<br>Rejected: inline in `main.ts` (untested, unmutated); storing the result in `GameState` (breaks D8 and whole-state assertions). | ADR-0011 (5); DISCUSS D8, D10 |
| D9 | **Navigation**: `Screen` adds `match{clubId}`. `Action` adds `PlayMatch`, valid only from a known club's clubHome. `Back` goes from match to clubHome. Every other case is a no-op.<br>`GameState` and `initialState` are unchanged. `sameScreen` adds `match` by `clubId`; every navigation changes the screen, so focus goes to the `<h1>` and no focus ids are added. | ADR-0011 App; ADR-0008; DISCUSS D9, D10 |
| D10 | **UI**:<br>- The club home gains a fourth `button.primary` "Play match".<br>- `renderMatch(root, view, dispatch)` renders as section children: `<h1 tabindex="-1">Matchday 1</h1>`; `<p class="score-line">` (inline spans and literal single-space text nodes, so `textContent` and `innerText` read exactly `Home 2–1 Away`); `<p id="goals-label">Goals</p>`; `<ul role="list" aria-labelledby="goals-label">` with items reading exactly `23' Name (Club)`; and "Back".<br>- Scoreboard look: a panel on the `<p>` (chalk border, pitch-light background, gold tabular score, centred, wrapping names). No flex, grid, float or inline-block on the score line, the items or their spans.<br>- The "Goals" label has no `text-transform` (so `.section-label` is not reused). The list keeps a non-zero box when empty.<br>Rejected: a flex or grid three-column scoreboard (breaks `innerText`); a `<table>` or `<dl>` (splits the score line). | ADR-0011 (6); DISCUSS D1-D3, D9, D12, D13, open item |
| D11 | **Names**: "Play match", "Goals" and "Matchday" are in no `names.ts` array (checked by hand: no "play", "match" or "goal" substring in `TOWNS`, `CLUB_SUFFIXES`, `COLOUR_PALETTE`, `FIRST_NAMES` or `SURNAMES`). "Play match" does not contain "Players". "Goals" is not a substring of "Goalkeeping". The match screen has one "Back". DISTILL adds the unit check. | DISCUSS D11 |

### Wave: DESIGN / [REF] Component decomposition
| Path | Change | Responsibility | Indicative lines |
|---|---|---|---|
| `src/domain/schedule.ts` | CREATE | `Fixture`, `MATCHDAYS`, `FIXTURES_PER_MATCHDAY`, frozen table, `fixturesOf`, `fixtureOf` | 35 |
| `src/domain/match.ts` | CREATE | Types, constants, `teamStrength`, `playMatch` (chances, conversion, scorer, sort) | 95 |
| `src/domain/squad.ts` | EXTEND (comment only) | The stream-table comment points at ADR-0011's 200..255 block | 1 |
| `src/app/state.ts` | EXTEND | `match` screen, `PlayMatch` action and helper, `Back` and `sameScreen` cases, `OPENING_MATCHDAY`, `matchFor` | 35 |
| `src/ui/screens/match.ts` | CREATE | `renderMatch` | 45 |
| `src/ui/screens/club-home.ts` | EXTEND | Fourth button "Play match" | 3 |
| `src/main.ts` | EXTEND | `match` render case: `matchFor`, map to view (scorer and club names), `renderMatch` | 25 |
| `src/ui/styles.css` | EXTEND | `.match h1`, `.score-line` panel, `.score-goals`, `.goals-label`, `.goal-list` (min-height), goal item accents | 30 |

**Code total**: about 270 lines, against 309 in DISCUSS. **Tests**: 580, as in DISCUSS. That gives about 850 changed lines for DELIVER, within the 889 budget and well under 1100.

### Wave: DESIGN / [REF] Driving ports
- **Domain**: `fixturesOf`, `fixtureOf` (ADR-0010); `playMatch` and `teamStrength` (ADR-0011).
- **App**: `update` with `PlayMatch` and `Back`; `matchFor`; `focusPlan` (extended).
- **Browser**:
  - "Play match" on the club home.
  - The match screen: `<h1>` "Matchday 1", the score line `<p>`, the list "Goals" and "Back".
- Detail and properties: brief, "For Acceptance Designer", ports 19-23.

### Wave: DESIGN / [REF] Driven ports and adapters
None: no storage, clock or network. The match is in memory and derived on render. Environment assumptions are named and probed (ADR-0011 Earned Trust):
1. **Cross-engine float determinism.** The browser must reproduce the Node golden. Probes: the e2e compares the seed-31 screen with the golden, and a grep test forbids approximated functions in `match.ts`.
2. **Inline flow.** The score line and the items must give exact `textContent` and `innerText`. Probe: the e2e checks equality, including apostrophe and hyphen names. Faults: flex or grid turns `innerText` red; missing space nodes turn `textContent` red.
3. **The empty "Goals" list is visible and named exactly.** Probe: an e2e at a seed pinned by a domain unit test as having a matchday-1 0–0 (seed 8, fixture 3, clubs 3 v 4, found by the spike). Faults: `text-transform` on the label or a zero-height list.

No external integrations, so no contract tests.

**Enforcement**:
- oxlint boundaries are unchanged: the new domain modules import only domain, and `state.ts` imports no ui.
- `max-params` 3: `playMatch` takes one object.
- `complexity` 15.
- The PR guard and oxlint globals.
- Stryker's existing globs cover `schedule.ts`, `match.ts` and `state.ts` with no config change.
- The `.focus(` grep covers `renderMatch`.

### Wave: DESIGN / [REF] Technology choices
- No new technology or dependency (ADR-0001, 0002 and 0003 apply; all OSS).
- No DOM test environment is added: the M-D 0–0 case is probed by the e2e at a domain-pinned seed, not by a jsdom view test, which would be a new dependency.
- No newer CSS is relied on.

### Wave: DESIGN / [REF] Reuse Analysis
| Existing Component | File | Overlap | Decision | Justification / contract shape |
|---|---|---|---|---|
| `deriveSeed`, `createRng`, `nextFloat` | `src/domain/rng.ts` | Seeded draws | EXTEND (use; new stream block 200..255, no code change) | Pure return-only; stream table extended in ADR-0011; distinct-derived-seed property extended |
| `generateSquad`, `Player`, `overall` | `src/domain/squad.ts` | Player ratings for strength and scorer weights | EXTEND (use; one comment line) | Pure; `overall` already is the position-weighted attribute rating (ADR-0006), so no new rating function |
| `automaticXI`, `StartingXI` | `src/domain/selection.ts` | The opponent's side; XI shape for `MatchSide` | EXTEND (use unchanged) | Pure; S-005 properties and goldens |
| `lineUp`, `DEFAULT_FORMATION` | `src/domain/formation.ts` | The opponent's formation | EXTEND (use unchanged) | Frozen data |
| `CLUBS_PER_LEAGUE`, `generateLeague` | `src/domain/league.ts` | Club count for the schedule; club names | EXTEND (use unchanged) | Pure |
| (none) | `src/domain/schedule.ts` | none | CREATE NEW | No schedule or fixture code exists in `src/` or `salvage/` (`salvage/` has an RNG, tactics and a formation resolver only). Contract: pure frozen data plus return-only functions; universe = the returned frozen arrays; goldens and properties |
| (none) | `src/domain/match.ts` | none | CREATE NEW | No match or simulation code exists (`salvage/random.ts` is the already-ported mulberry32). Contract: pure return-only; universe = the returned `MatchResult`; deep-equal on repeat, inputs frozen and compared, golden, properties |
| `update`, `focusPlan`, `currentXI`, `squadOf`, `back`, `sameScreen` | `src/app/state.ts` | Navigation, effective XI | EXTEND (screen, action, `Back` case, `sameScreen` case, `matchFor`, `OPENING_MATCHDAY`) | Pure return-only. Universe of the returned state: `{ league, screen, formation, xi? }`, with only `screen` changing; whole-state `toEqual`, `toBe` for no-ops, deep-freeze for no mutation. `matchFor` reuses `currentXI` (the only effective-XI derivation) |
| `renderClubHome` | `src/ui/screens/club-home.ts` | The club-actions stack | EXTEND (fourth button) | Bounded-change; existing club-home regression e2e stays green (it iterates every button for 44px) |
| `.section-label`, `.back-button`, `button.primary`, tokens | `src/ui/styles.css` | Label and button styles | EXTEND (reuse `.back-button`, `button.primary`, colour tokens; new match classes) | `.section-label` is NOT reused for "Goals": its `text-transform: uppercase` could change `innerText` and the exact accessible name |
| `renderStartingXI` markup | `src/ui/screens/starting-xi.ts` | Inline spans with space text nodes | REFERENCE (same inline-flow pattern, not shared code) | Different elements (paragraph, list items, no buttons); a shared helper would couple two screens for about 3 lines |
| (none) | `src/ui/screens/match.ts` | none | CREATE NEW | No match screen exists. Contract: bounded-change; universe = root's children; never moves focus (grep test); e2e |
| `render`, `findClub`/`squadOrThrow` | `src/main.ts` | Render switch | EXTEND (`match` case under the existing `never` guard) | Unbounded shell; universe unchanged (reads `location.search` once, writes root and focus) |
| S-001..S-005 acceptance, e2e and protected tests | `tests/` | Regression | REUSE unchanged | `GameState` and every generator output unchanged; no club-home button count is asserted |

### Wave: DESIGN / [REF] Changed Assumptions
- **DISCUSS note "the result is derived in `main.ts`"**: it is derived on render through the pure `matchFor` selector in `state.ts`, which `main.ts` calls. It is still not stored (D8). The reason: unit tests and Stryker reach it.
- **Home advantage**: the brief's leaning was a small one; it is not adopted, per DISCUSS Out-of-scope and D15. Strength comes only from the XIs.
- **"Team strength from the XI's attributes" (D7)**: realised as the sum of the 11 overalls, each a position-weighted attribute rating (ADR-0006), plus scorer weights from the shooting attribute. No separate attack or defence rating, so D7(b) holds for the DISCUSS measure itself.
- **DISCUSS M-D**: the injected 0–0 view-level test becomes an e2e at a domain-pinned 0–0 seed. There is no DOM unit-test environment, and adding one would be a new dependency.
- **DISCUSS open item** (visual weight of the score line, goal items at 390px): a scoreboard panel on the `<p>` in inline flow; goal items as single wrapping lines with a gold minute.
- No change to the roadmap outcome text.

### Wave: DESIGN / [REF] Open questions
- **None blocking.**
- **Model constants**: they are tunable but freeze with DELIVER's golden. If the owner later finds 1.35 goals per side or the 51% forward share off, the change needs an ADR note: every result for every seed changes.
- **Formation effect**: the formation has no effect beyond who plays. A later opponent-tactics or formation-effect story may add a factor; D7(b) must then be re-checked for the sum measure.
- **Outcome trace**:
  - "Play match" 44px: D10.
  - h1 "Matchday 1", focused: D9, D10.
  - Score line format, one element, en dash: D10, ADR-0011.
  - Goals 0-9: D2.
  - Opponent another club, every club exactly one opponent, the same order from both sides: D1, D8.
  - Goals list format, order, counts: D2, D5, D10.
  - Scorers from the XI, never the GK, the opponent's from its squad: D5, D8.
  - Determinism, and `?seed=abc` the same as no seed: D6, D7 (and `parseSeed`).
  - Not all 0–0: calibration (no seed in 1..2000 had all four at 0–0; 5.5% per match).
  - Back with formation and XI unchanged: D9.
  - Instant result: one synchronous render (D10).
  - No sideways scroll and no console errors: D10 CSS and the e2e.
- **Handoff for DISTILL**:
  - Properties and goldens: brief ports 19-22 and ADR-0010/0011 Consequences.
  - The D7 statistics over at least 1000 matches: all 4 matchday-1 fixtures of 250+ seeds, plus fast-check seeds honouring `FC_SEED`.
  - A domain unit test pinning a matchday-1 0–0 seed, for the e2e empty-list probe (seed 8, fixture 3, clubs 3 v 4 under the ADR rules).
  - The e2e golden comparison at seed 31.
  - The D11 names check.
  - Exact locators: "Play match", "Back", list "Goals", heading "Matchday 1".
  - `update` no-ops for `PlayMatch` on every other screen, with `xi` and `formation` untouched.
  - Extend the stream-distinctness test with 200..255.

### Wave: DESIGN / [REF] Peer review
pending

