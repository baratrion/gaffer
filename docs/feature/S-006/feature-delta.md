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
- D8 (superseded by ADR-0012, S-007) Not recorded: playing the match changes nothing in the game state except the screen. No table, no matchday advance, no condition change, no stats, no stored result (the result is derived on render, as the squad is, ADR-0005 (d), DESIGN's call). In this story "Play match" again replays the same match; this is NOT pinned by `tests/protected/S-006/` (the season story will advance matchdays). The protected scenarios only look at the first match of a new game in a fresh page.
- D9 Back: a button named exactly "Back" (44px or taller) returns to the club home with focus on its `<h1>`, the club's name. The XI and the formation are unchanged.
- D10 Navigation (names and shapes for DESIGN, ADR-0003): `Screen` gains a match variant (club id). `Action` gains one action, valid only from a known club's home. `Back` goes from the match to the club home. Wrong-screen actions and an unknown club are no-ops, as before. `GameState` gains nothing (D8) (superseded by ADR-0012, S-007: `GameState` gains the optional `results`). `sameScreen` gains the match case; every new navigation changes the screen, so focus goes to the new `<h1>` (ADR-0008).
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
- **Calibration**: a scratch spike (outside the repo, nothing committed) ran the exact ADR-0011 rules against the real generator to calibrate D7 before DELIVER. A second, independent run reproduced every value. Results are in ADR-0011, and the D7 statistics become a committed fixed-seed domain test (see the handoff).
- **Outcome collision check**: the orchestrator ran `nwave-ai outcomes check-delta` against the existing, empty registry `docs/product/outcomes/registry.yaml`, with 0 collisions. S-006 registers no outcome: the registry tracks typed contracts, and S-006 adds none beyond the brief's driving ports 19-23.

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
  - The RNG consumption (54 draws) is independent of the XIs. So, chance by chance, the weaker side's goal minutes are a subset of the stronger side's, and a stronger side never scores fewer on the same seed.

### Wave: DESIGN / [REF] Decisions
| # | Decision | Source |
|---|---|---|
| D1 | **Schedule**: a seed-independent circle method over club indices, in new pure `src/domain/schedule.ts`.<br>- Round `r`: {`r`, 7} with `r` at home when `r` is even; {`(r+k) mod 7`, `(r-k) mod 7`} for `k` = 1..3, the first at home when `k` is odd.<br>- Matchdays 8..14 mirror 1..7. Matchday 1 is `[0 v 7, 1 v 6, 5 v 2, 3 v 4]`.<br>- `fixturesOf(matchday)` and `fixtureOf(matchday, clubIndex)` read a deeply frozen table; out of range throws `RangeError`.<br>- All 14 matchdays now (a mirror is one expression).<br>Rejected: a seeded permutation (a stream for no visible gain, since `league.clubs` is already seeded); seeded home choice (home balance lost); a literal table (56 hand-typed pairs); matchday 1 only (the season story could pick another home rule). | ADR-0010; DISCUSS D5 |
| D2 | **Goal generation**: fixed chances. 9 per side, one per 10-minute window. Each chance always draws 3 floats (minute, conversion, scorer), so there are 54 draws per match whatever the XIs.<br>Rejected: a per-minute loop (180+ draws, and the cap is a rule instead of a structure); a Poisson count (needs `Math.exp`, implementation-approximated across engines; variable draws; truncation). | ADR-0011 (1); DISCUSS D3, D6, D7(c) |
| D3 | **Strength and conversion**: `S` = the sum of the XI's 11 overalls; the overall is the position-weighted attribute rating (ADR-0006). Conversion `p = 0.30 x S_own^3 / (S_own^3 + S_opp^3)`.<br>D7(b) holds for the DISCUSS measure itself, per seed (monotone coupling).<br>Overrules the brief's leaning towards attack and defence ratings from attributes: an XI 20 higher only through its GK and defenders would score less, which violates D7(b).<br>Rejected: linear with a clamp (equal at the clamp); logistic (`Math.exp`). | ADR-0011 (2); DISCUSS D7 |
| D4 | **No home advantage**. This overrules the brief's leaning: DISCUSS Out-of-scope and D15 list home advantage as deferred. The simulated home share is about 50%. | DISCUSS D15, Out-of-scope |
| D5 | **Scorer**: weighted among the side's outfield starters by shooting x {DF 1, MF 2, FW 4}, walked in slot order with integer cumulative weights. Never the GK, no own goals.<br>Simulated shares on the canonical set: DF 12.5%, MF 36.3%, FW 51.2%.<br>Rejected: shooting only (desk estimate, not simulated: defenders would take roughly a quarter of the goals); uniform (defenders get 4 of 10 shares in 4-4-2). | ADR-0011 (3); DISCUSS D4 |
| D6 | **Stream**: `deriveSeed(seed, 200 + (matchday - 1) x 4 + fixtureIndex)`, streams 200..255, one per scheduled fixture. Table: -1, 0..7, 100..107, 200..255. Distinct derived seeds are probabilistic, not proven: the spike sampled 10000 seeds with no collision, and the extended sampled guard test keeps checking.<br>The result is independent of other fixtures and of which club is managed.<br>Rejected: one stream per matchday (couples fixtures); a stream per club pair (collides on a cup or replay). | ADR-0011 (4); DISCUSS D6 |
| D7 | **Determinism across engines**: the model uses only `+ - * /`, comparisons and `Math.floor`. No `Math.pow`, `**`, `exp` or `log`: a grep unit test, plus the e2e comparing the browser's seed-31 screen with the expected golden.<br>Expected goldens are fixed by DESIGN and written RED-first by DISTILL; DELIVER must match them:<br>- Seed 31, matchday 1, fixture 0: "Netherwold Borough 1–2 Marlbrook Athletic", goals "17' Rurik Fairbourne (Marlbrook Athletic)", "22' Calder Redfern (Netherwold Borough)", "77' Rurik Fairbourne (Marlbrook Athletic)".<br>- Seed 20260: "Harrowgate Lane United 0–1 Oakhampton Rise Borough", goal "65' Joren Northcott (Oakhampton Rise Borough)".<br>A deviation means DELIVER fixes the code to follow the ADR's draw order. Changing constants or the draw order requires an ADR-0011 amendment. | ADR-0011 Earned Trust, Expected golden matches; DISCUSS D6 |
| D8 | **Result not stored**. A pure `matchFor(state, clubId)` in `state.ts` derives it on render; `main.ts` calls it and maps it to view props. Squads come through `squadOf(league, club.id)`. The managed side is `currentXI`; the other side is `automaticXI(squad, DEFAULT_FORMATION)`. `OPENING_MATCHDAY = 1`.<br>This refines the DISCUSS note "derived in `main.ts`": the derivation sits in a unit-tested, Stryker-covered selector, as `currentXI` does.<br>Rejected: inline in `main.ts` (untested, unmutated); storing the result in `GameState` (breaks D8 and whole-state assertions). | ADR-0011 (5); DISCUSS D8, D10 |
| D9 | **Navigation**: `Screen` adds `match{clubId}`. `Action` adds `PlayMatch`, valid only from a known club's clubHome. `Back` goes from match to clubHome. Every other case is a no-op.<br>`GameState` and `initialState` are unchanged. `sameScreen` adds `match` by `clubId`; every navigation changes the screen, so focus goes to the `<h1>` and no focus ids are added. | ADR-0011 App; ADR-0008; DISCUSS D9, D10 |
| D10 | **UI**:<br>- The club home gains a fourth `button.primary` "Play match".<br>- `renderMatch(root, view, dispatch)` delta: `root.replaceChildren(<section class="match">)`, and the section has exactly five children in order: `<h1 tabindex="-1">Matchday 1</h1>`; `<p class="score-line">` (inline spans and literal single-space text nodes, so `textContent` and `innerText` read exactly `Home 2–1 Away`); `<p id="goals-label">Goals</p>`; `<ul role="list" aria-labelledby="goals-label">` with items reading exactly `23' Name (Club)`; and "Back".<br>- Scoreboard look: a panel on the `<p>` (chalk border, pitch-light background, gold tabular score, centred, wrapping names). No flex, grid, float or inline-block on the score line, the items or their spans.<br>- The "Goals" label has no `text-transform` (so `.section-label` is not reused). The list keeps a non-zero box when empty.<br>Rejected: a flex or grid three-column scoreboard (breaks `innerText`); a `<table>` or `<dl>` (splits the score line). | ADR-0011 (6); DISCUSS D1-D3, D9, D12, D13, open item |
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

**Code total**: about 270 lines, against 309 in DISCUSS.

Test lines, re-estimated from the ADR-0010/0011 check lists:
- Finite domains use exhaustive loops, not fast-check.
- `RangeError` and no-op cases are table tests.
- `fixtureOf` and `fixturesOf` share one combined loop; nothing is tested twice.

| Test file (DISTILL) | Contents | Lines |
|---|---|---|
| `tests/acceptance/S-006/schedule.test.ts` | 3 goldens; per-matchday permutation; ordered pairs once; mirror; home counts; one combined `fixtureOf`/`fixturesOf` loop; frozen; one `RangeError` table | 70 |
| `tests/acceptance/S-006/match.test.ts` | 2 expected goldens (RED-first); determinism and no mutation; fast-check properties (goal ranges and counts, minutes, scorers outfield and in the XI); per-seed monotonicity; `RangeError` table; stream block disjointness plus the sampled derived-seed guard; grep for approximated functions | 145 |
| `tests/acceptance/S-006/match-calibration.test.ts` and `tests/acceptance/S-006/fixtures/lowest-rated-xi.ts` | Committed fixed-seed D7 test: seeds 1..1000 x 4 matchday-1 fixtures, D7(a) bounds; D7(b) automatic vs `lowestRatedXI`, and a +20 XI vs `lowestRatedXI`; the seed-8 fixture-3 0–0 pin for the e2e | 75 |
| `tests/acceptance/S-006/match-navigation.test.ts` | `PlayMatch` and `Back`, with a no-op table; `xi` and `formation` untouched; `focusPlan` cases; `matchFor` (unknown club, stored `xi`, automatic opponent, symmetry) | 105 |
| `tests/acceptance/S-006/names-avoid-match-words.test.ts` | D11 check over every `names.ts` array | 25 |
| `tests/e2e/S-006-match.spec.ts` | Seed-31 screen equal to the expected golden (cross-engine probe); focus on each heading; `textContent` equal to `innerText` for the score line and every item; 44px; no sideways scroll or console errors; a pick, then "Play match" and "Back"; the empty "Goals" list visible at `?seed=8` (club 3 or 4) | 110 |
| **Tests total** | | **530** |

**DELIVER total**: about 800 changed lines (270 code + 530 tests), under the ~900 target and the 1100 cap. No cut is needed. If DELIVER runs over, the cut order is:
1. The +20 XI case of D7(b): the automatic vs lowest case already proves (b), with a gap of 27 or more.
2. The 4-3-3 and 4-2-3-1 runs of the scorer property.
3. The e2e pick-then-replay walk: its `update` and `matchFor` units cover the logic.

### Wave: DESIGN / [REF] Driving ports
- **Domain**: `fixturesOf`, `fixtureOf` (ADR-0010); `playMatch` and `teamStrength` (ADR-0011).
- **App**: `update` with `PlayMatch` and `Back`; `matchFor`; `focusPlan` (extended).
- **Browser**:
  - "Play match" on the club home.
  - The match screen: `<h1>` "Matchday 1", the score line `<p>`, the list "Goals" and "Back".
- Detail and properties: brief, "For Acceptance Designer", ports 19-23.

### Wave: DESIGN / [REF] Driven ports and adapters
None: no storage, clock or network. The match is in memory and derived on render. Environment assumptions are named and probed (ADR-0011 Earned Trust):
1. **Cross-engine float determinism.** The browser must reproduce the expected golden that the Node test also asserts. Probes: the e2e compares the seed-31 screen with that expected golden, and a grep test forbids approximated functions in `match.ts`.
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
| `deriveSeed`, `createRng`, `nextFloat` | `src/domain/rng.ts` | Seeded draws | REUSE unchanged (new stream block 200..255 is a number choice, not a code change) | Pure return-only; stream table extended in ADR-0011; sampled derived-seed guard extended (probabilistic) |
| `generateSquad`, `Player`, `overall` | `src/domain/squad.ts` | Player ratings for strength and scorer weights | EXTEND (one comment line pointing at the stream table) | Pure; `overall` already is the position-weighted attribute rating (ADR-0006), so no new rating function |
| `automaticXI`, `StartingXI` | `src/domain/selection.ts` | The opponent's side; XI shape for `MatchSide` | REUSE unchanged | Pure; S-005 properties and goldens |
| `lineUp`, `DEFAULT_FORMATION` | `src/domain/formation.ts` | The opponent's formation | REUSE unchanged | Frozen data |
| `CLUBS_PER_LEAGUE`, `generateLeague` | `src/domain/league.ts` | Club count for the schedule; club names | REUSE unchanged | Pure |
| `parseSeed`, `DEFAULT_SEED` | `src/app/seed.ts` | `?seed=abc` gives the same match as no seed | REUSE unchanged | Pure; S-001 unit tests (invalid input falls back to the default) |
| `el()` | `src/ui/dom.ts` | Builds the score-line and goal-item spans and their single-space text nodes | REUSE unchanged | Bounded-change, detached nodes only; string children become text nodes (ADR-0002) |
| (none) | `src/domain/schedule.ts` | none | CREATE NEW | No schedule or fixture code exists in `src/` or `salvage/` (`salvage/` has an RNG, tactics and a formation resolver only). Contract: pure frozen data plus return-only functions; universe = the returned frozen arrays; goldens and properties |
| (none) | `src/domain/match.ts` | none | CREATE NEW | No match or simulation code exists (`salvage/random.ts` is the already-ported mulberry32). Contract: pure return-only; universe = the returned `MatchResult`; deep-equal on repeat, inputs frozen and compared, golden, properties |
| `update`, `focusPlan`, `currentXI`, `squadOf`, `back`, `sameScreen` | `src/app/state.ts` | Navigation, effective XI | EXTEND (screen, action, `Back` case, `sameScreen` case, `matchFor`, `OPENING_MATCHDAY`) | Pure return-only. Universe of the returned state: `{ league, screen, formation, xi? }`, with only `screen` changing; whole-state `toEqual`, `toBe` for no-ops, deep-freeze for no mutation. `matchFor` reuses `currentXI` (the only effective-XI derivation) and `squadOf` (the only squad lookup) |
| `renderClubHome` | `src/ui/screens/club-home.ts` | The club-actions stack | EXTEND (fourth button) | Bounded-change; existing club-home regression e2e stays green (it iterates every button for 44px) |
| `.section-label`, `.back-button`, `button.primary`, tokens | `src/ui/styles.css` | Label and button styles | EXTEND (reuse `.back-button`, `button.primary`, colour tokens; new match classes) | `.section-label` is NOT reused for "Goals": its `text-transform: uppercase` could change `innerText` and the exact accessible name |
| `renderStartingXI` markup | `src/ui/screens/starting-xi.ts` | Inline spans with space text nodes | REFERENCE (same inline-flow pattern, not shared code) | Different elements (paragraph, list items, no buttons); a shared helper would couple two screens for about 3 lines |
| (none) | `src/ui/screens/match.ts` | none | CREATE NEW | No match screen exists. Contract: bounded-change. Universe: exactly `root.replaceChildren(section.match)`, with the section's five children (h1, score-line `p`, goals label `p`, goals `ul`, Back button); nothing else written; never moves focus (grep test); e2e |
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
- **Model constants**: the constants and the draw order are frozen by ADR-0011 together with its expected goldens. If the owner later finds 1.36 goals per side or the 51% forward share off, the change needs an ADR-0011 amendment, because every result for every seed changes.
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
  - Not all 0–0: calibration on seeds 1..1000 (4000 matchday-1 matches): 0–0 in 5.5% of matches (220 of 4000), and no seed has all four at 0–0.
  - Back with formation and XI unchanged: D9.
  - Instant result: one synchronous render (D10).
  - No sideways scroll and no console errors: D10 CSS and the e2e.
- **Durable contract** (DISCUSS D14, carried into the brief and ADR-0011): for the first match of a new game, every later version keeps:
  - the only `<h1>` "Matchday 1", focused;
  - one score line in the D2 format and no other text in it;
  - the list "Goals" in the D3 format;
  - both visible when the heading has focus;
  - "Back" to the club home.
- **Handoff for DISTILL**:
  - Properties and checks: brief ports 19-22, and the ADR-0010/0011 Consequences. Test files and lines are in the table under Component decomposition.
  - **Expected goldens**, written RED-first: the values in D7 above and in ADR-0011 "Expected golden matches". DELIVER must match them; it never re-pins from its own output.
  - **The D7 statistics** as a committed fixed-seed domain test:
    - Seeds 1..1000 x 4 matchday-1 fixtures (4000 matches), both sides automatic 4-4-2.
    - Assert a mean per side in [1.0, 2.0], a 0–0 share under 20% and at most 9 goals per side. The spike observed 1.363, 5.5% and 6.
    - D7(b) with the test fixture `lowestRatedXI(squad, formation)` in `tests/acceptance/S-006/fixtures/` (per position, overall ascending, ties by ascending squad index). It must score fewer home goals on average (spike: 0.481 vs 1.384) and never more on any seed.
  - A domain unit test pinning seed 8, matchday 1, fixture 3 (clubs 3 v 4, "Mossdale Athletic 0–0 Pickering Dene Rovers") as 0–0, for the e2e empty-list probe.
  - The e2e comparison of the seed-31 screen with the expected golden.
  - The D11 names check.
  - Exact locators: "Play match", "Back", list "Goals", heading "Matchday 1".
  - `update` no-ops for `PlayMatch` on every other screen, with `xi` and `formation` untouched.
  - Extend the stream-distinctness test with 200..255.

### Wave: DESIGN / [REF] Peer review
`nw-solution-architect-reviewer` (haiku), cycle 1: **approved_with_notes**. Every finding was folded in, so there is no second cycle. Both ADRs are marked "Accepted (accepted after nw-solution-architect-reviewer cycle 1, approved_with_notes)".

| Finding | How it landed |
|---|---|
| H1 golden pinned from shipped code | The spike values are now EXPECTED values, written RED-first by DISTILL, and DELIVER must match them. Seed 31: "Netherwold Borough 1–2 Marlbrook Athletic" with 17'/22'/77' goals. Seed 20260: "Harrowgate Lane United 0–1 Oakhampton Rise Borough" with 65' Joren Northcott. A deviation means fixing the code; changing constants or the draw order needs an ADR-0011 amendment. An independent re-run reproduced the values exactly. Recorded in ADR-0011 (Expected golden matches), brief port 20, D7 and the handoff |
| M1 outcome collision statement | `nwave-ai outcomes check-delta` against the empty `docs/product/outcomes/registry.yaml` reported 0 collisions (run by the orchestrator). No outcome is registered, because there are no new typed contracts beyond ports 19-23 |
| M2 calibration reproducibility | The D7 statistics are a committed fixed-seed domain test (seeds 1..1000 x 4 matchday-1 fixtures, with the `lowestRatedXI` test fixture). There is one canonical figure set everywhere: 1.363 per side, 0–0 5.5% (220 of 4000), at most 6 goals |
| M3 test-line estimate | A per-file table derived from the ADR check lists, with table tests and no duplicate `fixtureOf` checks. 530 test + 270 code = about 800 lines. Cut order stated |
| M4 D14 durability | A "Durable contract" in ADR-0011 Consequences, the brief's S-006 acceptance section and the handoff |
| L max 6 vs 7 goals | Canonical set: at most 6 goals by one side. The wider first-pass runs are no longer quoted |
| L unevidenced rejected figures | "Shooting only" and "uniform" are labelled desk estimates (not simulated) in ADR-0011 and D5 |
| L superset wording | Now: "chance by chance, the weaker side's goal minutes are a subset of the stronger side's" |
| L REUSE labels | Unchanged modules are relabelled REUSE. Rows added for `ui/dom.ts` `el()` and `app/seed.ts` `parseSeed` |
| L `matchFor` squads | Squads come through `squadOf(league, club.id)` (ADR-0011, brief, D8) |
| L derived-seed distinctness | Called probabilistic: a sampled guard test, not a proof |
| L ADR status | "Accepted (accepted after nw-solution-architect-reviewer cycle 1, approved_with_notes)" on ADR-0010 and ADR-0011 |
| L lowest-rated XI | Named the DISTILL test fixture `lowestRatedXI` under `tests/acceptance/S-006/fixtures/` (not production code) |
| L `renderMatch` delta | Stated explicitly: `root.replaceChildren(section.match)`, whose exactly five children are h1, score-line `p`, label `p`, `ul` and Back; nothing else is written |

## Wave: DEVOPS

Lean, unattended. All nine decisions pre-answered. No platform change: phone-viewport Chromium in CI and the deployed Pages URL. Owner-locked paths (`.github/`, `factory/`, `scripts/`, `.nwave/`, `CLAUDE.md`, brief/scope, `tests/protected/`, `stryker.config.mjs`) are read-only. Machine-readable environments: `docs/feature/S-006/environments.yaml`. Inherits the S-005 DEVOPS setup (`docs/feature/S-005/environments.yaml`); only the deltas are recorded.

Checklist: ✓ existing infra reused | ✓ K1-K3 mapped to instruments | ✓ rollback defined | ✓ mutation strategy (nightly-delta, inherited; `schedule.ts`, `match.ts`, `state.ts` inside the mutate globs) | ⊘ new IaC/containers (none) | ⊘ server-side observability (no backend) | ⊘ continuous learning | ⊘ CLAUDE.md edit (already states strategy) | ⊘ `docs/product/kpi-contracts.yaml` (not created by S-001..S-005)

### Wave: DEVOPS / [REF] Environment matrix
| Env | URL | Runner | Purpose |
|---|---|---|---|
| local-dev | `http://localhost:5173/gaffer/` (`pnpm dev`) | dev machine | Iteration |
| local-preview | `http://localhost:4173/gaffer/` (`ci:serve`) | dev, CI, protected runner | Production build under test; unit, property, calibration, e2e and `tests/protected/S-001..S-006/` |
| production | `https://<owner>.github.io/gaffer/` | GitHub Pages | Live site; post-deploy smoke via `BASE_URL` |

Unchanged from S-005: no staging (static site, recreate); Chromium, Pixel 7 profile, 390px viewport in local-preview and production. Deltas:
- The match is derived on render (`matchFor`), never stored (ADR-0011 (5)), so every environment shows the same match for the same `?seed=`, club and tactics.
- Cross-engine float determinism (ADR-0011 Earned Trust 1): the e2e compares the browser's seed-31 screen with the expected golden the Node test asserts ("Netherwold Borough 1–2 Marlbrook Athletic", 17'/22'/77'). It runs in Chromium on local-preview and, through `smoke`, on the live site. WebKit and iOS Safari are expected to match (only IEEE-exact operations) but are not probed in CI.
- Inline-flow text (score line, goal items; `textContent` equals `innerText`) and the empty "Goals" list (`?seed=8`, club index 3 or 4) are probed in Chromium only.
- Every S-006 navigation is a screen change, so focus goes to the new `<h1>` (ADR-0008); no platform-specific focus path.

### Wave: DEVOPS / [REF] CI/CD pipeline outline (existing, unchanged)
- `ci` (PR, push to main, dispatch): PR guards (locked paths, append-only protected, diff size 1200, `Math.random`/`Date` in `src/domain/`), roadmap lint, `ci:lint`, `ci:typecheck`, `ci:test` (fresh `FC_SEED`; the S-006 schedule and match properties honour it; the fixed-seed calibration test does not use fast-check), `ci:build`, `ci:e2e`, protected-scenario no-regression check vs main (new `tests/protected/S-006/match.spec.ts` must fail on main).
- `deploy` (push to main): `ci:build`, deploy-pages, then `smoke` runs `ci:e2e` against the live URL (includes the new S-006 spec and its golden probe).
- `nightly`: `ci:mutation`; failure opens a `mutation-alarm` issue.
- `ai-review`, `factory-tick`, `watchdog`, `weekly-demo`: factory-owned, untouched.
- S-006 needs no pipeline change: it adds unit, property, calibration and e2e specs run by the existing scripts, and no new dependency (ADR-0011: no new technology, no DOM test environment).
- Local gate: `pnpm run check` mirrors the commit stage. No git hooks (locked paths; CI is the gate).
- Security: no secrets, no runtime deps, no network. Club and player names enter the DOM only via `el()`/`textContent` (ADR-0002); a review check, not a scenario. SAST/SCA/SBOM not added (workflows locked; inherited open question).

### Wave: DEVOPS / [REF] Monitoring contracts (DISCUSS KPI/AC to instrument)
E2E instrument is the new `tests/e2e/S-006-match.spec.ts` (Pixel 7, 390px), run by `ci:e2e` on PR and main and by `smoke` on the live URL after each deploy. "Unit", "property" and "calibration" rows run in `ci:test` (properties with a fresh `FC_SEED`). `tests/protected/S-006/` runs on local-preview in `ci` and must pass on main.

| KPI / criterion (DISCUSS) | Instrument | Pass condition |
|---|---|---|
| K1: club home to the match result in 1 tap ("Play match"); score line and "Goals" already visible on arrival (D13); back home in 1 tap | e2e: page-side capture-phase click counter (as S-003..S-005); after "Play match" assert `document.activeElement` is h1 "Matchday 1", then read the score line and the list "Goals" (exact) with no wait; count clicks on "Back", heading is the club's name and has focus. Protected: the same, rule-based | 1 click in, result visible when the h1 has focus, 1 click back |
| K2: 100% of the managed club's goal items name one of the 11 on its Starting XI; 0 name the GK slot or a benched player | property (fast-check, `FC_SEED`, many seeds, all 8 clubs, all 3 formations): every scorer is in that side's `xi` and is not a GK; `matchFor` follows a stored `xi`. e2e: pick a bench player, "Play match", every item naming the club names one of the 11 Starting XI names and not the GK. Protected: scenarios 1 and 4 | 100%; 0 GK; 0 bench |
| K3: XI 20+ higher in overall sum scores more on average; mean goals per side 1.0-2.0; under 20% 0–0; at most 9 per side (D7) | calibration (`tests/acceptance/S-006/match-calibration.test.ts`, fixed seeds 1..1000 x 4 matchday-1 fixtures, 4000 matches): D7(a) bounds; D7(b) automatic vs `lowestRatedXI` and a +20 XI vs `lowestRatedXI`, never more on any seed. property: per-seed monotonicity in `teamStrength`, goals 0..9 | holds (spike: 1.363 per side, 5.5% 0–0, max 6; 1.384 vs 0.481) |
| Expected goldens (ADR-0011, RED-first) | unit: seed 31 fixture 0 and seed 20260 fixture 0 equal the ADR values; e2e: the browser's seed-31 screen equals the same golden (cross-engine probe), on local-preview and live | exact match |
| Approximated-function ban | unit grep: `match.ts` has no `Math.pow`, `**`, `Math.exp`, `Math.log` | holds |
| Schedule (D5, ADR-0010) | unit: matchday-1 golden `[0 v 7, 1 v 6, 5 v 2, 3 v 4]`, every matchday a perfect matching, ordered pairs once over 14, mirror, frozen, `RangeError` table. Protected: 8 clubs form 4 pairings, same order from both sides | holds |
| Determinism (D6) | unit: repeat calls deep-equal, frozen inputs unchanged; stream block 200..255 disjoint, sampled derived-seed guard extended. Protected: same seed same screen, `?seed=abc` equals no seed. PR guard: no `Math.random`/`Date` in `src/domain/` | holds |
| Score line and goal item text (D2, D3) | e2e: score line `textContent` equals `innerText` equals the D2 string; each item likewise "`<minute>' <scorer> (<club>)`", including an apostrophe or hyphen name where a seed provides one; exactly one element on the screen matches `^(.+) (\d)–(\d) (.+)$` | holds |
| Empty "Goals" list (M-D) | unit pins seed 8, matchday 1, fixture 3 as 0–0; e2e at `?seed=8`, club index 3 or 4: list "Goals" (exact) visible with 0 items | holds |
| Navigation, no-ops, no state change (D8, D10) | unit on `update`: `PlayMatch` only from a known club's home; `Back` from match to club home; table of no-ops (same object); `xi` and `formation` untouched; deep-freeze; `focusPlan` `sameScreen` match case by `clubId`; `.focus(` grep covers `renderMatch` | holds |
| Back keeps tactics and XI (D9) | e2e and protected: 4-3-3 and a pick, "Play match", "Back": club h1 focused, 4-3-3 still checked, Starting XI unchanged | holds |
| Names avoid match words (D11) | unit: "Play match", "Goals", "Matchday" in no `names.ts` array | holds |
| 44px tap targets | e2e: `boundingBox().height >= 44` on "Play match" and "Back"; club-home regression spec checks every club home button | holds |
| No horizontal scroll at 390px | `scrollWidth <= clientWidth` on club home and match screens (long names wrap) | holds |
| No console errors | `page.on("console"/"pageerror")` across the DoD journey (club home, Play match, Back, Starting XI, pick, Back, Play match, Back) | zero |
| S-001..S-005 unchanged | existing e2e specs, acceptance tests (no fixture or assertion edit) and `tests/protected/S-001..S-005/` | green |
| Domain test strength | Stryker on `src/domain/**` (covers `schedule.ts`, `match.ts`) and `src/app/state.ts` (covers `PlayMatch`, `Back` from match, `sameScreen`, `OPENING_MATCHDAY`, `matchFor`) | nightly, at or above break threshold (70) |

No analytics (POC). The e2e tap count, the property tests and the fixed-seed calibration test are the KPIs' sole measurements.

### Wave: DEVOPS / [REF] Deployment strategy and rollback
- Strategy: recreate. Merge to main triggers `deploy`, replacing the whole static artifact. Idempotent: redeploying the same ref yields the same artifact.
- Rollback (designed first): revert the S-006 squash commit on main; the merge triggers `deploy` and `smoke` validates the restored site. Alternative: `workflow_dispatch` of `deploy.yml` on a known-good ref (the commit before the S-006 squash). Fallback: fix-forward on a `claude/*` branch. As in S-003..S-005, the append-only protected-tests and no-regression guards may block a plain revert of a squash that added `tests/protected/S-006/`; if so, the dispatch route is the owner action. Time to restore: one deploy cycle (about 5 minutes).
- Failure detection: a red `smoke` job marks the deploy run red. A cross-engine determinism fault shows as a red golden probe in `smoke` while `ci:test` stays green.
- Data: nothing is persisted (the result is derived on render; `GameState` is unchanged), so no migration and no user data at risk. Rolling back removes the "Play match" button and the match screen only.
- Result stability across deploys: results are frozen by ADR-0011 (constants, draw order, streams 200..255). Any later change to them changes every seed's match and needs an ADR-0011 amendment; it is not a deploy concern.
- Blast radius: one static page.

### Wave: DEVOPS / [REF] Mutation testing strategy
nightly-delta, inherited from `CLAUDE.md`; `/nw-deliver` Phase 5 skipped. `stryker.config.mjs` mutates `src/domain/**/*.ts` except `names.ts`, plus `src/app/state.ts`; thresholds high 85, low 70, break 70. Glob check:
- `src/domain/schedule.ts` (new): matches `src/domain/**/*.ts`, not excluded. Mutants are killed by the matchday-1 golden, the perfect-matching and ordered-pairs-once loops, the mirror, the home counts, and the `RangeError` table (0, 15, 1.5).
- `src/domain/match.ts` (new): matches, not excluded. Mutants are killed by the two expected goldens (any change to the draw order, the minute formula, `MAX_CONVERSION`, `SCORER_FACTOR`, `MATCH_STREAM_BASE` or the sort shifts a golden), the `RangeError` table, per-seed monotonicity, the GK-never-scores property and the calibration bounds. Expected equivalent survivors: `<` vs `<=` on `uConversion < p` and on the cumulative-weight walk (float equality has near-zero probability on the tested seeds); they cost a few points, not the break threshold.
- `src/app/state.ts` (`match` screen, `PlayMatch`, `Back` from match, `sameScreen` case, `OPENING_MATCHDAY`, `matchFor`): already listed. The whole-state `toEqual`, same-object `toBe` for no-ops, the `focusPlan` screen-pair tests and the `matchFor` cases (unknown club, stored `xi`, automatic opponent, symmetry) carry it.
- UI renderers (`match.ts` screen, `club-home.ts`) and `main.ts` are outside the globs (as before); the e2e covers them.
- Runtime watch: the 4000-match calibration test covers every `match.ts` mutant, so it reruns per mutant. If the nightly run nears its 45-minute timeout, DELIVER may lower its cost (it shares squads per seed); the bounds stay. Recorded as an open question, not a blocker.
- No `stryker.config.mjs` change needed. Run by `nightly.yml` via `ci:mutation`; failure opens `mutation-alarm`, `needs-human`.

### Wave: DEVOPS / [REF] Observability stack
Browser console plus Playwright smoke on the deployed URL only. No RUM, error tracking, logs or tracing. SLO: smoke green per deploy (including the seed-31 golden probe). Alerting: a red `deploy` run; a red nightly opens `mutation-alarm`. No dashboards.

### Wave: DEVOPS / [REF] Branching strategy
Trunk-based. Short-lived `claude/S-006-*` branches, PR to main, squash merge. CI green and protected scenarios not regressing. Deploy fires on merge. No release branches. The DELIVER diff (about 800 lines planned) stays under the 1200-line PR guard; `docs/` is outside the count.

### Wave: DEVOPS / [REF] Coexistence matrix
| Component | S-006 impact | Action |
|---|---|---|
| `ci.yml`, `deploy.yml`, `nightly.yml` | none; run existing `ci:*` scripts | reuse |
| `ci:*` scripts, `playwright.config.ts` | none; Pixel 7, 390px, `BASE_URL` already fit | reuse |
| `stryker.config.mjs` | `src/domain/**` covers `schedule.ts` and `match.ts`; `src/app/state.ts` covers the new state code; no change needed | none |
| `scripts/guards/pr-guards.mjs` | determinism grep covers the new domain files; diff cap 1200 vs about 800 planned | none |
| `tests/protected/S-001..S-005/` | club home gains a fourth button "Play match" (no name collision with "Squad", "Tactics", "Starting XI", "Back"; does not contain "Players"); they do not count club home buttons | must stay green |
| `tests/protected/S-006/` | locked scenario for this story (written in the plan run) | must pass on main |
| `tests/acceptance/S-001..S-005/` | none: `GameState` and `initialState` unchanged; streams -1, 0..7, 100..107 untouched, so every generator output is unchanged; no fixture or assertion edit | reuse unchanged, must stay green |
| S-003 sampled derived-seed guard test | extended with streams 200..255 (DISTILL) | extend, not weaken |
| `tests/e2e/S-004-club-home-regression.spec.ts`, `S-005-club-home-regression.spec.ts` | check every club home button is 44px or taller: the new `button.primary` is 48px | reuse unchanged |
| `tests/e2e/S-001..S-005*.spec.ts`, `shell.spec.ts` | focus on `<h1>` after navigation still holds (ADR-0008) | reuse unchanged, regression-watch |
| `tests/e2e/S-006-match.spec.ts`, `tests/acceptance/S-006/` | new specs | add (DISTILL) |
| `src/domain/schedule.ts`, `src/domain/match.ts`, `src/ui/screens/match.ts` | new | S-006 tests guard |
| `src/app/state.ts`, `src/domain/squad.ts` (comment), `src/ui/screens/club-home.ts`, `src/main.ts`, `src/ui/styles.css` | extended | S-001..S-005 tests guard |
| Pages artifact | grows slightly; base path `/gaffer/` unchanged | none |

### Wave: DEVOPS / [REF] Pre-requisites
- S-005 delivered and deployed; GitHub Pages source "GitHub Actions" enabled (✓).
- Node 22 or later, pnpm 10.12.4 pinned, Playwright chromium via `.github/actions/setup`.
- ADR-0001..0011 accepted (✓; ADR-0010 and ADR-0011 landed in DESIGN, before DELIVER).
- `tests/protected/S-006/match.spec.ts` committed by the plan run (append-only from then on).
- `BASE_URL` derived from repository owner and name (no secret).

### Wave: DEVOPS / [REF] Open questions
Owner-only items inherited from S-001..S-005 (smoke `sleep 20`, no security scanning, smoke has no commit-SHA check, deploy not gated on `ci`, squash revert possibly blocked by the append-only guards, no uptime probe) are unchanged and none block S-006. New:
1. No `.github/` or `stryker.config.mjs` change is needed for S-006 (`schedule.ts`, `match.ts` and the `state.ts` changes are inside the existing `mutate` globs).
2. Cross-engine determinism is probed in Chromium only. A WebKit project in `playwright.config.ts` would extend the ADR-0011 golden probe to Safari's engine; not added (no platform change, and it would slow `ci:e2e` and `smoke`). Owner's call.
3. Nightly mutation runtime: the 4000-match calibration test reruns for every `match.ts` mutant. Watch the first nightly after the S-006 merge against the 45-minute `nightly.yml` timeout; if it nears it, DELIVER trims the test's cost (not its bounds), or the owner raises the timeout.
4. Smoke on the live URL runs the S-006 e2e spec too; its golden and the `?seed=8` empty-list probe rely on `?seed=` being honoured on Pages (same as S-001..S-005).

## Plan run: protected scenarios

`tests/protected/S-006/match.spec.ts`, 4 black-box scenarios (Pixel 7, 390px; roles, accessible names and visible text only). They check rules that hold for any seed (formats, pairing, who may score) and pin no generated result, so the expected goldens of ADR-0011 stay in DISTILL's unit and e2e tests:
1. "Play match" (44px) on the club home (`?seed=31`, 1st club; "Squad", "Tactics", "Starting XI" still there) opens one focused top-level heading "Matchday 1". Read at once when the heading has focus, with no waiting: exactly one deepest element on the screen whose text reads `^(.+) (\d)–(\d) (.+)$`, visible, naming the player's club and another club of the "Clubs" list. The list "Goals" is visible on arrival and holds home + away goals items, each reading `MINUTE' Name (Club)` (minutes 1–90, never decreasing), with per-club counts equal to the score. Each goal for the player's club is by an outfield player on the Starting XI screen, and the opponent's scorers are not in the player's squad. No sideways scroll. "Back" (44px) returns to the club home with its heading focused; Tactics still has "4-4-2" checked and the Starting XI is unchanged. No console errors.
2. All 8 clubs of `?seed=31`, each in a new game: every club's opponent shows the same two clubs in the same order (a perfect pairing). Opponent scorers are non-GK players of the opponent's "Squad" list. Not all matches end 0–0. (`test.slow()`: 8 new games in one test.)
3. Determinism: `?seed=abc` twice and no seed (8th club) give an identical score line and "Goals" items.
4. After 4-3-3 and a bench forward into the last FW slot (`?seed=7`, 3rd club), the player's goals are by outfield players of the current Starting XI. "Back" leaves the picked XI unchanged.

Not pinned, by design: the same score from both sides of a fixture (DISCUSS M-C, unit-level), replaying the match (D8, the season story advances matchdays), and the empty "Goals" list (conditional on a 0–0, which DISTILL covers with the `?seed=8` e2e). All 4 fail on the current app (no "Play match" button). The plan run checked that they are achievable and discriminating. Against a throwaway prototype (not committed: circle-method matchday 1, 9 chances per side, outfield scorers from the XI), all 27 protected scenarios S-001..S-006 passed. Three faulty variants were each caught: a duplicated score line (all 4 failed), the managed club always named first (scenario 2 failed) and a score line revealed 300 ms after arrival (failed on "visible on arrival").

## Wave: DISTILL

Unattended. Language: TypeScript; runners: vitest + fast-check (`FC_SEED` honoured through `tests/setup/fast-check-seed.ts`) and Playwright (Pixel 7, 390px); package manager pnpm. No Gherkin runner exists, so scenarios are `describe/it` blocks whose titles read Given/When/Then in domain language, with `@tags` and `@contract-shape:<pure-function|bounded-change|unbounded-preservation>` in every title and a `CONTRACT_SHAPE` + outcome-anchor header, as in S-003..S-005 (`schedule.ts`, `match.ts`, `matchFor` and `focusPlan` are `pure-function`; `update` navigation and the e2e specs are `bounded-change`; no `unbounded-preservation` shape applies: nothing is written outside the screen). Wave-decision reconciliation: DISCUSS, DESIGN and DEVOPS read, 0 contradictions (DESIGN refines DISCUSS's "derived in `main.ts`" to the `matchFor` selector and overrules the brief's home-advantage leaning, both recorded in DESIGN "Changed Assumptions"; the tests use DESIGN's names). The test sources were not derived from `tests/protected/` (not opened). One upstream issue is open for the orchestrator: `distill/upstream-issues.md` U-1 (an existing S-005 e2e assertion lists exactly three club-home buttons, which D1 makes false).

### Wave: DISTILL / [REF] Hand-off model: green tree, new-behaviour specs held out until DELIVER (Mandate 7 adapted)
CI forbids committing failing, skipped or `.todo` tests, and test counts may only go up. As in S-004 and S-005:
- **Committed and running now (green regression guards, 4 files, 19 cases):**
  - `tests/acceptance/S-006/existing-navigation-unchanged.test.ts` (6): club home, Squad, a player, Tactics, a formation, Starting XI, a slot, Back still work for any club and formation; states are built without naming `match` or `PlayMatch`, so it compiles before and after DELIVER.
  - `tests/acceptance/S-006/fixture-matches-pinned.test.ts` (5): pins the inputs of the ADR-0011 goldens: the 8 club names of seed 31, the sum of the 11 overalls of each automatic 4-4-2 (130 v 143, 131 v 124, 154 v 141, 144 v 171 at seed 31; 152 v 138 at seed 20260; 153 v 161 at seed 8), and that Rurik Fairbourne, Calder Redfern and Joren Northcott are the forward, midfielder and forward the goldens name. A generator change turns this file red, not the match specs.
  - `tests/acceptance/S-006/names-avoid-match-words.test.ts` (7): DISCUSS D11. No entry of `TOWNS`, `CLUB_SUFFIXES`, `COLOUR_PALETTE`, `FIRST_NAMES`, `SURNAMES` (nor any "First Last" or "Town Suffix" text built from them) contains "Play match", "Goals" or "Matchday" (case-insensitive substrings); "Play match", "Goals" and "Matchday" contain none of the nine S-001..S-005 locator words. It passes today, so it is committed, not held out.
  - `tests/e2e/S-006-club-home-regression.spec.ts` (1): heading is the club name and focused, every club-home button is 44px or taller, Squad, Starting XI and Tactics still open and Back returns with the heading focused, a 4-3-3 choice survives, no sideways scroll, no console error; it never names "Play match".
  - The renderers-never-move-focus guard is reused: `tests/unit/ui/renderers-never-move-focus.test.ts` scans every file under `src/ui`, so it covers `match.ts`.
  - Net: `ci:test` 573 to 591 tests (+18, 27 files), `ci:e2e` +1. `ci:lint`, `ci:typecheck`, `ci:test` green on the committed tree; the new e2e passes on the current app.
- **Held out, complete and verified:** five executable specs and one fixture stored as `docs/feature/S-006/distill/pending/{acceptance,acceptance/fixtures,e2e}/*.pending` (outside every glob: `vitest include`, `tsc include`, `oxlint .`, Playwright `testDir`). Nothing skipped, weakened or marked todo; they are simply not in the tree yet. 93 vitest cases and 11 e2e cases (about 1260 lines including the fixture).
- **Verification done in DISTILL** (`distill/verification-note.md`): a throwaway reference implementation in a scratch git worktree (since removed), written from ADR-0010/0011 only, reproduced the ADR goldens and the canonical 4000-match figures exactly and made all 93 held-out vitest cases and all 11 held-out e2e cases pass (`ci:test` 684 passed, `ci:typecheck` and `ci:lint` clean), with 19 seeded domain faults and 6 UI faults caught (the one survivor is the documented equivalent `<` v `<=` mutant). In the real repo the same files are lint-clean and fail only for missing modules and symbols (RED for missing functionality).
- **No scaffold stubs in `src/`:** a throwing stub would turn the committed run red. The scaffold equivalent is the `.pending` files plus the exact-symbol list below.
- **DELIVER mechanics:** `git mv` each file to its destination, dropping `.pending`, in the same commit as the code that makes it green. Never edit an assertion to fit the implementation; if one is wrong, record it in `distill/upstream-issues.md`. The ADR goldens are expected values: a mismatch means the code is fixed, never the golden.

### Wave: DISTILL / [REF] Scenario list with tags
Tier A only (production code: real `generateSquad`, `automaticXI`, `fixturesOf`, `playMatch`, `matchFor`, `update`, `focusPlan`, the built app). Tier B skipped: the journey is a few chained steps, and the pure rules and `update` are already covered by fast-check properties over seeds, all 8 clubs, all 3 formations and arbitrary action runs, which explore the state space directly.

Committed now:

| # | Scenario (title in the file) | File | Tags | Kind |
|---|---|---|---|---|
| R1 | Any club home, Squad, a player, Back, Back: club home again, formation kept | `existing-navigation-unchanged.test.ts` | `@regression @property` | PBT |
| R2 | Any club home, Tactics, another formation, Back: club home with that formation | same | `@regression @property` | PBT |
| R3 | Any club home, Starting XI, a slot, Back, Back: club home, formation kept | same | `@regression @property` | PBT |
| R4 | Club home: Squad, Tactics, Starting XI each open that club's screen | same | `@regression @driving_port` | example |
| R5 | Tactics, 4-3-3: only the formation changes | same | `@regression` | example |
| R6 | Back on the club home changes nothing | same | `@regression @error` | example |
| Q1 | Seed 31: the 8 club names | `fixture-matches-pinned.test.ts` | `@regression` | example |
| Q2 | Seed 31 matchday 1: the four strength pairs | same | `@regression` | example |
| Q3 | Seed 20260 clubs 0 and 7: names and strengths 152 v 138 | same | `@regression` | example |
| Q4 | Seed 8 clubs 3 and 4: names and strengths 153 v 161 (the 0–0) | same | `@regression @boundary` | example |
| Q5 | The three golden scorers' positions | same | `@regression` | example |
| W1 | Each of the 5 name arrays holds none of "Play match", "Goals", "Matchday" | `names-avoid-match-words.test.ts` | `@regression @error` | example (5) |
| W2 | Built "First Last" and "Town Suffix" texts hold none either | same | `@regression @boundary` | example |
| W3 | The new names hold none of the nine existing locator words | same | `@regression @boundary` | example |
| C1 | Club home keeps working: heading, 44px, Squad, Starting XI, Tactics, kept formation, no scroll, no errors | `tests/e2e/S-006-club-home-regression.spec.ts` | `@regression` | e2e |

Held out (`distill/pending/`):

| # | Scenario (title in the file) | File | Tags | Kind |
|---|---|---|---|---|
| H1 | Matchday 1, 2, 8 goldens `[0v7, 1v6, 5v2, 3v4]`, `[7v1, 2v0, 6v3, 4v5]`, `[7v0, 6v1, 2v5, 4v3]`; matchday 14 golden | `schedule.test.ts` | `@walking_skeleton @driving_port @boundary` | example (3 rows; the matchday-14 golden is in the edges case) |
| H2 | Constants 14 / 4 / 8; every club in exactly one fixture of every matchday | same | `@property @boundary` | exhaustive (2) |
| H3 | Every ordered pair once over 14 matchdays; matchday m+7 mirrors m; home counts 4,3,4,3,4,3,4,3 and 7 each | same | `@property @boundary` | exhaustive (3) |
| H4 | `fixtureOf` returns the very fixture at its index, holding the club, the opponent sees the same; matchday-1 clubs 0/7 and 3/4 | same | `@driving_port @property` | exhaustive (2) |
| H5 | Frozen at every level, writes throw, table unchanged | same | `@boundary` | example |
| H6 | RangeError for matchday 0, 15, 1.5, NaN, -1, 100 and club -1, 8, 1.5, NaN, 100; edges 1 and 14 work | same | `@error @boundary` | example (12) |
| M1 | Seed 31 fixture 0: Netherwold Borough 1–2 Marlbrook Athletic, the three ADR goals, strengths 130 and 143 | `match.test.ts` | `@walking_skeleton @driving_port` | golden |
| M2 | Seed 20260 fixture 0: Harrowgate Lane United 0–1 Oakhampton Rise Borough, 65' Joren Northcott | same | `@walking_skeleton @driving_port` | golden |
| M3 | Seed 31 fixtures 1-3 score lines (2–2, 5–1, 1–3); seed 8 fixture 3 0–0 with no goals | same | `@boundary` | golden (4) |
| M4 | Seed 11 / seed 15 fixture 0 have an apostrophe / a hyphen scorer (e2e name probe) | same | `@environment-probe @boundary` | pin (2) |
| M5 | Played twice: deep-equal, deep-frozen inputs unchanged; seed, fixture and matchday each change the draws | same | `@property @boundary` | PBT + example (2) |
| M6 | Any seed, matchday, fixture, formation, eleven: 0..9 goals per side, counts add up, minutes 1..90 non-decreasing home first at a tie | same | `@property` | PBT (2) |
| M7 | Every scorer is in that side's eleven and never a GK | same | `@property` | PBT |
| M8 | Per-seed monotonicity: a higher sum of overalls never scores fewer and concedes no more; a stronger opponent never raises the side's goals | same | `@property` | PBT (2) |
| M9 | `teamStrength` is the sum of the 11 overalls, 11..220; Netherwold 4-4-2 is 130 | same | `@driving_port @property @boundary` | PBT + example (2) |
| M10 | RangeError for matchday 0, 15, 1.5, NaN and fixture -1, 4, 1.5, NaN; edges (1,0) and (14,3) work | same | `@error @boundary` | example (9) |
| M11 | 73 stream numbers (-1, 0..7, 100..107, 200..255) pairwise distinct; 73 derived seeds distinct over sampled seeds | same | `@boundary @property` | example + PBT (2) |
| M12 | `match.ts` source has no `Math.pow/exp/log`, no `**`, no `Math.random`, `Date`, `performance.now`, `crypto.` | same | `@determinism @error` | grep (2) |
| K1 | 4000 matches: mean goals per side in [1.0, 2.0], under 20% 0–0 | `match-calibration.test.ts` | `@kpi @property` | fixed seeds |
| K2 | The canonical figures of ADR-0011 exactly: 10901 goals, 220 goalless, distribution, home 1.384, scorers 12.5/36.3/51.2% | same | `@kpi @determinism` | fixed seeds |
| K3 | No side above 9; no GK scores; forwards over midfielders over defenders | same | `@kpi @boundary @property` | fixed seeds (2) |
| K4 | No league's four matches all 0–0 (seeds 1..1000), and seeds 31 and 20260 are not | same | `@kpi @boundary` | fixed seeds |
| K5 | Lowest-rated XI is 20+ weaker, scores fewer home goals (0.481) and never more on any seed; an XI 20+ above scores more and never fewer | same | `@kpi @property` | fixed seeds (2) |
| N1 | `PlayMatch` from a club home: only the screen changes, any club, formation, picks; Back after it restores the whole state; replay is identical | `match-navigation.test.ts` | `@walking_skeleton @driving_port @property` | example + PBT (4) |
| N2 | Unknown club home: same object; every other screen (8) and with picks stored: same object | same | `@driving_port @error @boundary` | example (10) |
| N3 | `Back` from the match: club home with formation and picks as they were; unknown club same object; any other action on the match screen: same object | same | `@driving_port @error` | example (3) |
| N4 | Whole walks: title, club list, club home, match, club home; 4-3-3 and a pick survive a match; any run of up to 40 taps never throws, playing taps never touch formation or picks, a match is always for a league club | same | `@walking_skeleton @property @error` | example + PBT (3) |
| N5 | `matchFor`: `OPENING_MATCHDAY` is 1; unknown club gives `undefined`; Netherwold at seed 31 is the golden | same | `@walking_skeleton @driving_port @error` | example (3) |
| N6 | `matchFor` symmetry: the opponent's screen has the same two clubs in the same order and an equal result; any seed: 8 clubs form 4 pairings, home first as scheduled | same | `@driving_port @property` | example + PBT (2) |
| N7 | `matchFor` any seed, club, formation, optional picks equals the schedule's fixture played with the managed side's current XI and the opponent's automatic 4-4-2; stored XI followed; 4-3-3 followed; opponent stays 4-4-2 also when away; repeatable and non-mutating | same | `@driving_port @property @boundary` | PBT + example (5) |
| P1 | `focusPlan`: club home to match and match to club home: heading; any other screen to match: heading; match redrawn: element only when same club and non-empty id | same | `@walking_skeleton @driving_port @boundary` | example (3) |
| E1 | Club home to the golden result in 1 tap, heading focused, one score line (a `P`, visible, `textContent` = `innerText`, the only en dash), list Goals with the three golden items, 44px, Back 1 tap to the club home focused | `S-006-match.spec.ts` | `@walking_skeleton @kpi` | e2e |
| E2 | "Play match" is the last of four club-home buttons, all 44px or taller | same | | e2e |
| E3 | `?seed=abc` and no seed: Harrowgate Lane United 0–1 Oakhampton Rise Borough with 65' Joren Northcott | same | `@example` | e2e |
| E4 | Managing Marlbrook Athletic shows the same names in the same order and the same match | same | `@boundary` | e2e |
| E5 | The same seed in a second fresh page gives the same screen | same | `@boundary` | e2e |
| E6 | Environment probe: an apostrophe (O'Garrity) and a hyphen (Fitch-Moreton) scorer read as in the Squad list | same | `@environment-probe @boundary` | e2e |
| E7 | After Northcott for Dunmore: Sam's goals name only the 11, never the GK or Dunmore; the pick survives; replay is the same match; the opponent's scorers are in its Squad | same | `@example` | e2e |
| E8 | The empty list at `?seed=8` (clubs 3 and 4): 0–0, list Goals visible, named exactly, no items, label not upper-cased, keeps a box | same | `@boundary` | e2e |
| E9 | One Back, one list, one heading on the match screen | same | `@boundary` | e2e |
| E10 | 4-3-3, play, Back: club home focused, 4-3-3 still checked | same | `@boundary` | e2e |
| E11 | Whole DoD journey with no console error and no sideways scroll: club home, Play match, Back, Starting XI, a pick, Back, Play match, Back | same | `@walking_skeleton` | e2e |

Counts: 19 committed now (18 vitest: R 6, Q 5, W 7; 1 e2e: C1); 93 vitest cases held out (schedule 23, match 30, calibration 7, navigation 33) and 11 e2e cases. Error/edge share: estimated by tag over the expanded `it.each` cases (not machine-counted), at about half of the vitest cases (RangeError tables, off-home screens, unknown clubs, forbidden functions, bounds) and low in e2e (about 5 of 11 carry `@boundary`; the UI cannot send a wrong-screen action or an unknown club, so N2/N3 enumerate them at the `update` level). **Waiver (share):** the whole-suite share is estimated at or above the 40% target, not the e2e share. **Waiver (environment):** E1-E11 run on local-preview and on a `BASE_URL` deployment; local-dev is not a supported target (inherited). Viewport is the Pixel 7 profile at 390px from `playwright.config.ts`; "fresh visits" are new pages of the same browser context (nothing is persisted). **Waiver (line budget):** DESIGN budgeted 530 test lines; the held-out and committed tests total about 1340. They are written and verified in DISTILL, not part of DELIVER's authoring; DELIVER's code (about 270 lines per DESIGN) is within budget and DELIVER records the measured count. Held-out files move one step per tick and `docs/` is outside the 1200-line PR guard.

### Wave: DISTILL / [REF] WS strategy (Architecture of Reference)
- Driving ports: in-process pure calls (`fixturesOf`, `fixtureOf`, `playMatch`, `teamStrength`, `initialState`, `update`, `matchFor`, `focusPlan`) and the built browser app at `http://localhost:4173/gaffer/`. All real; no DI container exists.
- Driven ports: none (no storage, clock or network; the match is derived in memory). Nothing to fake. The seeded `createRng`/`deriveSeed` are the production ones.
- Walking skeleton: extends the S-001..S-005 skeleton by one branch (club home, Play match, Back). Browser proof: E1, E10, E11. Domain proof: H1 + M1 + M2 and N1 + N4 + N5. Litmus: the title is a user goal (send my team out, read the result and who scored) and the Then is what Sam reads.
- Infrastructure policy: as S-003..S-005, no `docs/architecture/atdd-infrastructure-policy.md`; "everything real, nothing faked". Mandate 8 is met by comparing whole `GameState` values (league + screen + formation + xi, a closed universe), the whole `MatchResult` (homeGoals, awayGoals, goals) and deep-freeze no-mutation properties (M5, N1-N4, N7).

### Wave: DISTILL / [REF] Adapter coverage table
There are no driven adapters (DESIGN, "Driven ports and adapters": none).

| Adapter | @real-io scenario | Covered by |
|---|---|---|
| (none) | n/a | n/a; the three named environment assumptions are probed on the built app: (1) cross-engine float determinism by E1, E3, E4 (the browser equals the Node goldens M1 and M2) plus the grep M12; (2) inline flow (`textContent` = `innerText`, apostrophe and hyphen names) by E1, E6, E7; (3) the empty "Goals" list by E8, kept honest by the unit pin M3 |

### Wave: DISTILL / [REF] Scaffolds
No `__SCAFFOLD__` stubs are written under `src/` (a throwing stub would turn the committed run red). Symbols DELIVER must export, all used by the held-out tests:
- `src/domain/schedule.ts`: `Fixture = { readonly home: number; readonly away: number }`, `MATCHDAYS = 14`, `FIXTURES_PER_MATCHDAY = 4`, `fixturesOf(matchday): readonly Fixture[]` (the same frozen array on every call), `fixtureOf(matchday, clubIndex): { readonly index: number; readonly fixture: Fixture }` (the very object at `fixturesOf(matchday)[index]`); `RangeError` for a matchday not an integer 1..14 or a club not an integer 0..7; every level `Object.freeze`d; imports only `league.ts` (oxlint boundary).
- `src/domain/match.ts`: `MatchSide { squad, xi }`, `MatchInput { seed, matchday, fixtureIndex, home, away }`, `GoalEvent { minute, side: "home" | "away", playerIndex }`, `MatchResult { homeGoals, awayGoals, goals }`, `teamStrength(side): number`, `playMatch(input): MatchResult` (one parameter; `RangeError` for matchday not 1..14 or fixtureIndex not 0..3; draws from stream `200 + (matchday - 1) x 4 + fixtureIndex`; rules and draw order exactly as ADR-0011; only `+ - * /`, comparisons, `Math.floor`; no `Math.pow`, `**`, `Math.exp`, `Math.log`, `Math.random`, `Date`, `performance.now`, `crypto.` in the file, M12 greps the source with comments stripped); imports `rng.ts`, `schedule.ts` and types only.
- `src/app/state.ts`: `Screen` gains `{ kind: "match"; clubId }`; `Action` gains `{ type: "PlayMatch" }`; `OPENING_MATCHDAY = 1`; `matchFor(state, clubId): { matchday, home: { club, squad }, away: { club, squad }, result } | undefined` (`club` is the `League` club with `id` and `name`; home first as the schedule says; squads through `squadOf`; managed side `currentXI`, the other `automaticXI(squad, "4-4-2")`); `PlayMatch` valid only from `clubHome` of a known club; `Back` from `match` of a known club goes to `clubHome`; every other case returns the very same state object; `GameState` and `initialState` unchanged (no new key, `xi` and `formation` untouched); `sameScreen` gains `match` by `clubId`.
- UI contract (brief ports 19-23; roles and names only): the club-home button "Play match" (exact name, 44px or taller, the fourth after "Squad", "Tactics" and "Starting XI", the only four buttons); the match screen has exactly one heading "Matchday 1" (focused on arrival, no other heading), exactly one deepest element whose whole text matches `^(.+) (\d)–(\d) (.+)$`, a `P` that is direct child of the screen section (no wrapper), `textContent` equal to `innerText`, and no other en dash on the screen; a visible non-heading label "Goals" (not upper-cased) and exactly one `list` on the page named exactly "Goals" with one `listitem` per goal reading exactly `<minute>' <scorer> (<club>)` (`textContent` = `innerText`), present with a non-zero box even with no items; exactly one button "Back" (44px or taller) and no other button. The score line and the list are in the DOM, visible, when the heading has focus (no timers).
- Learned from the scratch run: the score line and the items must stay in inline flow (no flex, grid, float or `inline-block`; `display: grid` on the score line turns the `innerText` check red) with literal single-space text nodes between the spans; the "Goals" label must not reuse `.section-label` (it uppercases); the empty list needs a `min-height`; `oxlint` caps `max-params` at 3 (`playMatch` takes one object) and cyclomatic complexity at 15; the `main.ts` `match` case maps goals to `{ minute, scorer, club }` and keeps the `never` guard; the test-side `max-params` is 3 too.

### Wave: DISTILL / [REF] Test placement
`tests/acceptance/S-006/` (vitest, same convention as S-001..S-005; the fixture `fixtures/lowest-rated-xi.ts` is a test helper per DESIGN), `tests/e2e/S-006-club-home-regression.spec.ts` (committed) and `tests/e2e/S-006-match.spec.ts` (held out; DEVOPS coexistence matrix). Held-out sources live in `docs/feature/S-006/distill/pending/{acceptance,acceptance/fixtures,e2e}/` as `*.pending`. Existing tests are untouched. DESIGN's "extend the S-003 sampled derived-seed guard" lives in new cases of `match.test.ts` (M11) because the S-003 file is existing. Exactly one existing assertion will go red on the DELIVER button commit (see Open points).

### Wave: DISTILL / [REF] Driving port coverage
| Port (brief 19-23) | Scenarios |
|---|---|
| 19 schedule (`fixturesOf`, `fixtureOf`) | H1-H6, N6, N7 |
| 20 match (`playMatch`, `teamStrength`) | M1-M12, K1-K5, N5, N7 |
| 21 `update` with `PlayMatch`, `Back`, `matchFor` | N1-N7, R1-R6 |
| 22 `focusPlan` (extended) | P1, E1, E10, E11 (heading focus), the reused `.focus(` guard |
| 23 UI: "Play match", Matchday 1 screen, score line, list "Goals", "Back" | E1-E11, C1 |
Ports 1-18 are unchanged and covered by S-001..S-005 tests. Driving adapters (CLI/HTTP/hook): none; the browser app is covered by E1-E11.

### Wave: DISTILL / [REF] DEVOPS monitoring-contract trace
| Contract row | Scenario |
|---|---|
| K1: 1 tap to the result, score line and Goals already visible with the heading focused (D13), 1 tap back | E1 (pointerdown counter, snapshot taken in the same evaluate as the focus check, no wait) |
| K2: 100% of the managed club's goal items name one of the 11 on the Starting XI; 0 GK; 0 benched | M7, E7, K3 |
| K3: stronger XI scores more; mean 1.0-2.0; under 20% 0–0; at most 9 | K1, K3, K5, M6, M8 |
| Expected goldens (cross-engine) | M1, M2, M3, E1, E3, E4 |
| Approximated-function ban | M12 |
| Schedule (D5, ADR-0010) | H1-H6, N6 |
| Determinism (D6) and stream disjointness | M5, M11, E3, E5 |
| Score line and goal item text (D2, D3) | E1, E3, E6, E9 (exactly one score line, `textContent` = `innerText`) |
| Empty "Goals" list (M-D) | M3, Q4, E8 |
| Navigation, no-ops, no state change (D8, D10) | N1-N4, R1-R6 |
| Back keeps tactics and XI (D9) | N3, N4, E7, E10 |
| Names avoid match words (D11) | W1-W3 |
| 44px tap targets | E1, E2, C1 |
| No horizontal scroll at 390px | E1, E2, E8, E11, C1 |
| No console errors | E1, E8, E11, C1 |
| S-001..S-005 unchanged | R1-R6, Q1-Q5, C1, existing suites (see Open points for the one S-005 assertion) |
| Domain test strength (Stryker) | H1-H6 (goldens, exhaustive loops, RangeError table, frozen), M1-M12 and K2 (goldens, exact canonical figures, draw order, constants, stream block), N2-N3 (same-object no-ops), N7 (managed side, stored XI, formation), P1 (club field) |

### Wave: DISTILL / [REF] DELIVER step plan (which files to add, and when)
1. **Step 01, schedule**: implement `src/domain/schedule.ts` per ADR-0010. First run the committed guards and see them green. `git mv docs/feature/S-006/distill/pending/acceptance/schedule.test.ts.pending tests/acceptance/S-006/schedule.test.ts`; confirm RED for the missing module before coding, then GREEN. Gates: `ci:lint`, `ci:typecheck`, `ci:test`.
2. **Step 02, match model**: implement `src/domain/match.ts` per ADR-0011 (exact draw order and constants; the goldens are expected values) and the one-line stream-table comment in `squad.ts`. In the same commit `git mv` `match.test.ts.pending`, `match-calibration.test.ts.pending` and `fixtures/lowest-rated-xi.ts.pending` to `tests/acceptance/S-006/` (`match.test.ts`, `match-calibration.test.ts`, `fixtures/lowest-rated-xi.ts`). Watch the calibration test cost (about 0.4 s) for the nightly mutation run.
3. **Step 03, state, focus and the club-home button** (one commit, so the tree is never red): `match` screen, `PlayMatch`, `Back` and `sameScreen` cases, `OPENING_MATCHDAY`, `matchFor` in `src/app/state.ts`; in the same commit `git mv` `match-navigation.test.ts.pending` to `tests/acceptance/S-006/match-navigation.test.ts`. No existing fixture or assertion changes. `existing-navigation-unchanged.test.ts` and `tests/acceptance/S-001..S-005/` stay green and unedited.
4. **Step 04, screen, button, shell, CSS** (one commit): `src/ui/screens/match.ts`, the club-home "Play match" button in `div.club-actions`, the `main.ts` `match` case (map `matchFor` to the view, throw on an unknown club, keep the `never` guard), CSS per ADR-0011 (inline flow, no `text-transform` on the label, list `min-height`). In the same commit `git mv` `e2e/S-006-match.spec.ts.pending` to `tests/e2e/S-006-match.spec.ts` and resolve upstream-issues U-1 (the one S-005 e2e assertion listing three club-home buttons). `ci:e2e`, `tests/e2e/S-006-club-home-regression.spec.ts`, `S-004/S-005-club-home-regression.spec.ts` and `tests/protected/S-001..S-006` must pass.
5. Delete `docs/feature/S-006/distill/pending/` once all six files are moved; zero `.pending` files is the DISTILL-to-DELIVER completion check.

### Wave: DISTILL / [REF] Pre-requisites
DESIGN: ADR-0010, ADR-0011, ADR-0008, ADR-0009 and brief ports 19-23 (read). DEVOPS: local-preview `http://localhost:4173/gaffer/` via `ci:serve`, Pixel 7 at 390px, `FC_SEED` per CI run (the fast-check properties honour it; the calibration test uses fixed seeds), `BASE_URL` for post-deploy smoke (the e2e uses `?seed=`, roles and names only, so it holds on Pages). No new dependency, no `.github/`, `stryker.config.mjs` or other locked-path change.

### Wave: DISTILL / [REF] Mandate checks (adapted)
- CM-A: tests import only `fixturesOf`, `fixtureOf`, `playMatch`, `teamStrength`, `automaticXI`, `playersForPosition`, `generateSquad`, `generateLeague`, `deriveSeed`, `initialState`, `update`, `currentXI`, `squadOf`, `matchFor`, `focusPlan`, `OPENING_MATCHDAY`; UI tests enter through the built app by role and name (plus one in-page snapshot of the DOM for the score line, which is the shape being specified). CM-B: titles use domain terms (match, score line, goals, scorer, eleven, fixture, Back, Squad). CM-D: pure rules are tested against independent expected data (ADR goldens written out, a hand-written matchday-14 table, an independent fixture-plus-`playMatch` oracle in N7, a published-figures pin in K2) and the e2e reads expected names from the Squad and Starting XI screens. CM-F: PBT only in layer 1-2 files; e2e is example-only with named sad paths (E8 empty list, E4/E5 repeat, E9 collisions). Mandate-12 domain types/DSL and step-reuse-ratio do not apply: there are no Gherkin steps; e2e helpers (`openClubHome`, `playAndRead`, `readNow`) hold no business logic beyond the expected tables written out in the file.
- Open points for DELIVER: (1) **U-1**: `tests/e2e/S-005-starting-xi.spec.ts:173-177` asserts the club home has exactly the buttons Squad, Tactics, Starting XI; D1 adds "Play match", so that one assertion must change in DELIVER step 04 (stricter: four names in order) or get an owner exception; see `distill/upstream-issues.md`. (2) The ADR goldens do not by themselves pin `MAX_CONVERSION` (U-3), so K2 pins the canonical figures; if K2 fails and the goldens pass, the constants or the draw order differ from ADR-0011. (3) M4/E6 depend on seeds 11 and 15 (apostrophe and hyphen scorers), which follow from the frozen model. (4) `focusPlan` tests for the match screen live in `match-navigation.test.ts` so they are counted with the story.

### Wave: DISTILL / [REF] Reviewer outcome (Final Wave Review Gate, one cycle, Haiku, foreground)
| Reviewer | Verdict | Disposition |
|---|---|---|
| nw-product-owner-reviewer (DISCUSS) | needs_revision (1 blocker, 1 high, 1 medium, 3 low) | The blocker and the high are U-1: DISCUSS's DoD ("assertions not edited") and the claim "no club-home count" (line 167, repeated in DESIGN, DEVOPS) are false for `S-005-starting-xi.spec.ts:173-177`. Needs a DISCUSS/DESIGN/DEVOPS wording fix plus an explicit decision; not DISTILL's to make. Others (row count of outlines, slice line estimates, "h1" jargon) are DISCUSS notes, no test impact |
| nw-solution-architect-reviewer (DESIGN) | needs_revision (1 blocker, 1 high, 1 medium, 3 low) | Blocker: same U-1. High: ADR-0011 and DESIGN say any constant change "changes every result for every seed"; DISTILL showed it does not for the two goldens (U-3, K2 pins the canonical figures). Wording fix for the ADR. Medium/low: add the matchday-14 golden to ADR-0010, exact scorer counts to ADR-0011; no test change |
| nw-platform-architect-reviewer (DEVOPS) | conditionally_approved (0 blockers, 2 high) | High 1: U-1 again (and the "existing tests are never edited" rule is the lead's instruction, not a CI guard: `pr-guards.mjs` only makes `tests/protected/` append-only). High 2: rollback by reverting the squash cannot merge while `tests/protected/S-006` stays on main; dispatch of `deploy.yml` on the pre-S-006 SHA is the real route (owner action). Medium: per-step PR sizes stay under 1200 only if one PR per step; nightly mutation runtime unmeasured |
| nw-acceptance-designer-reviewer (DISTILL) | conditionally_approved (0 blockers, 1 high, 3 medium, 7 low) | High: U-1. Fixed here: H1 and N1 row counts, E7 tag. DELIVER-scope action items: per-club item count in the e2e `playAndRead`, extend the M12 source grep to `schedule.ts`, whole-`MatchResult` equality next to the goldens, a `src/ui` guard against `innerHTML`/`outerHTML`/`insertAdjacentHTML`, the E6 check also for an opponent-scored marked name. Error share by `@error` tag alone is about a third of cases (about half when `@boundary` counts): the waiver above stands on the `@error or @boundary` rule |

Unresolved, for the orchestrator or owner before DELIVER step 04: U-1 (explicit decision on the one-line edit of the S-005 e2e assertion, then fix the false "no club-home count" statements in DISCUSS/DESIGN/DEVOPS).
