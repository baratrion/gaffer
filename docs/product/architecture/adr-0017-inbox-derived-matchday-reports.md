# ADR-0017: The Inbox, matchday reports derived from the recorded results (S-011)

- Status: Accepted (peer review: revised, awaiting cycle 2. Cycle 1 of nw-solution-architect-reviewer was conditionally_approved; findings H1, M1-M9 and L1-L6 are resolved in this revision)
- Date: 2026-10-26
- Deciders: nWave solution-architect (S-011 DESIGN, `interaction_mode=propose`)
- DESIGN decisions DD1..DD9 (S-011 `feature-delta.md`, "Wave: DESIGN / Decisions") are the summary of this ADR and ADR-0018: DD1 = Option 1, DD2 = Option 2, DD3 = ADR-0018, DD4 = Option 3, DD5 = Option 4, DD6 = Earned Trust, DD7 = mutation scope, DD8 = complexity, DD9 = DELIVER commit order.
- Related: ADR-0002 (plain DOM, text through `el()`), ADR-0003 (functional core, imperative shell), ADR-0008 (focus plan), ADR-0009 (inline-flow text rule), ADR-0011 (score line markup of the match screen), ADR-0012 and ADR-0014 (the results log, derived `nextMatchday`), ADR-0013 (standings order; format functions in the domain; a renderer that emits only `Back`), ADR-0015 (`seasonSummaryOf`, `formatOrdinal`, `renderSeasonEnd` as the template), ADR-0016 (the save; `render` deferral, closed by ADR-0018).
- Adds no amendment to an earlier ADR. Everything in them stands.

## Context
S-011 (DISCUSS D1-D10, US-1, US-2) adds a sixth club-home button "Inbox" and a screen listing one matchday report per matchday played, newest first. Binding rules:
- **D1/D2**: "Inbox" after "Table"; the screen has the only h1 "Inbox" (focused), a list named "Messages", and "Back" to the club home.
- **D3/D4**: N items after N matchdays. Each item has three lines read as one piece of text each: the title "Matchday N" (the match screen's h1 text), the score line (the match screen's text exactly), and "League position <ordinal>" (the club's Pos in the table built from the results of matchdays 1..N only, with the Table's own order).
- **D5**: before any match the list is empty and a line reads "No messages yet" (this version only).
- **D6**: derived only. No new `GameState` key, no save-format change, no `SAVE_VERSION` bump, no new RNG stream. Opening the Inbox changes nothing and writes no save. Messages are text, not buttons.
- **D7**: the list is durable per season; later versions may add other message kinds with no "Matchday N" line.
- **D10**: text through `el()`, focus on the new h1, phone first.

Facts checked in the code:
- `GameState` is `{ league, screen, formation, xi?, results? }` (the S-009 five-key test). `results` is the `PlayedMatch[]` log, four entries per matchday in fixture order, each with `matchday`, `home`, `away` (club indices) and `result.homeGoals/awayGoals`. `standings(clubs, played)` needs only `home`, `away` and the two scores of each entry, so it accepts a prefix of the log filtered by `matchday`, and it is the single place the table order (Pts, GD, goals for, name by `<`) lives.
- `toSave` projects any screen that carries a known `clubId`: a state on a new `inbox{clubId}` screen encodes to the same text as the club home it came from, so `saveTextFor` returns `undefined` and the autosave writes nothing on navigation (verified by running the real code in this DESIGN run; the test is Earned Trust 4). `fromSave` always restores the club home, so a reload from the Inbox continues at the club home.
- `update` is a handler table (S-010, complexity 1): `ViewInbox` costs one entry and one small handler. `sameScreen`'s `default` handles every `clubId` kind. `HOME_RETURNING_KINDS` is a set.
- `main.ts` `render` is a switch at complexity 15 of 15 (S-009 Open question 1; deferred by ADR-0016 Decision 4 to "the next story that adds a screen, which must do it first"). Decided in ADR-0018.
- The match screen builds its score line inside `ui/screens/match.ts` (`scoreLine`, a private function): `<p class="score-line">` holding `span.score-name`, a literal `" "`, `span.score-goals` ("1–2", U+2013), `" "`, `span.score-name`. No test mentions `score-line`; only `match.ts` and `styles.css` do.
- `.oxlintrc.json` enforces `complexity` 15, `max-params` 3, `max-lines` 400, the layer rules and the DOM/time globals. `stryker.config.mjs` mutates `src/domain/**` (except `names.ts`), `src/app/state.ts`, `src/app/save.ts` and `src/adapters/**`.
- The seed-31 positions that DISCUSS derived by hand were confirmed against the real code in this run (all 14 equal, including the three name tie-breaks after matchdays 4, 5 and 7); seed 20260, Oakhampton Rise Borough, matchday 1 reads 3rd.

## Options

### 1. Where the per-matchday derivation lives
| Option | Pros | Cons |
|---|---|---|
| **A. A new pure domain module `src/domain/inbox.ts`: `matchdayReports(clubs, played, clubIndex)` returns the newest-first readonly list of reports, each the club's own match of that matchday plus its position from `standings` over the matchdays 1..N prefix (chosen)** | The rule "position after matchday N" is a domain fact, Node-testable with literal logs, inside Stryker's domain glob (no config change). Reuses `standings` unchanged, so the table's tie-breaks are the Table's by construction and cannot drift. Names resolved from `clubs` here, once, so the UI never maps indices | One new small file (about 40 lines) |
| B. Extend `standings.ts` or `season.ts` | No new file | `standings.ts` is the club-level table module whose only import is `Club` (ADR-0013); `season.ts` holds the end-of-season rules (ADR-0015). A "report" is a third concept; mixing widens both contracts |
| C. App only, in `state.ts` (`inboxOf` does the prefix loop) | One fewer file | The rule lives in the shell (ADR-0015 rejected the same for `topScorer`); `state.ts` grows toward `max-lines`; harder to unit-test with literal logs |
| D. Fold the table cumulatively (one running tally, one sort per matchday) | One pass | Needs a second implementation of the ranking or an export of `standings` internals: a second source for the tie-break order. The saving is nothing: at most 14 `standings` calls over at most 56 entries (about 800 tallies and 14 sorts of 8 rows), well under a millisecond (an estimate, not measured), and only when the Inbox renders |

An app selector `inboxOf(state, clubId)` in `state.ts` (EXTEND) composes `matchdayReports(state.league.clubs, state.results ?? [], clubIndex)`, and returns `undefined` for a club not in the league (as `seasonSummaryOf`). It is called only inside the Inbox render entry, never per dispatch.

### 2. Navigation: the screen, the action, the way back
| Option | Pros | Cons |
|---|---|---|
| **A. `Screen` adds `inbox{clubId}`; `Action` adds `ViewInbox` (a known club's `clubHome` only, else a `toBe` no-op); `Back` from it via `HOME_RETURNING_KINDS`; the table precedent (chosen)** | Exactly `viewTable`'s shape; one handler entry; `sameScreen` default and `focusPlan` need no change (a screen change focuses the new h1); `GameState` stays at five keys; `toSave` is unchanged for the screen | One more `Screen` kind (and one more render entry, ADR-0018) |
| B. A generic `ViewScreen { kind }` action | Fewer action types in future | Bypasses per-screen guards (the `seasonEnd` guard needs `nextMatchday`); a larger refactor than one story needs |
| C. Show the messages inside the club home | No new screen | D2: its own h1 "Inbox", and the club home would hold two headings |

### 3. One source for the score-line text
| Option | Pros | Cons |
|---|---|---|
| **A. Extract the match screen's `scoreLine` into a shared UI module `src/ui/score-line.ts` (`scoreLine({ home, away })` over `{ name, goals }` sides) used by `renderMatch` and `renderInbox`; the same module also holds `matchdayTitle(n)` (returns "Matchday N"), used by `renderMatch`'s h1 and by the Inbox title line (chosen)** | One builder per text, so the markup (spans, literal single-space nodes, U+2013) and the text can never differ, and the title "Matchday N" has one source too (it was a template literal in `match.ts`); both views already hold `{ name, goals }` sides (`MatchSideLine`), so the report type matches structurally; the S-006 binding markup rules move with it unchanged | A small refactor of `match.ts` (behaviour-preserving, covered by every S-006..S-010 e2e) |
| B. A pure string formatter in the domain, each renderer builds spans from it | Node-testable text | The spans need name and goals separately; a string cannot be split back, so the renderers would still build from parts and the formatter would be a second source |
| C. The Inbox copies the markup | No refactor | Two copies that drift; D4 and the DISCUSS technical note forbid it |
| D. `renderInbox` imports `scoreLine` from `match.ts` | No new file | A screen module importing a sibling screen module; the shared piece belongs beside `dom.ts` (as `club-colours.ts` sits beside its screens) |

The match screen's `p.score-line` has a big box style (2px border, 20px padding, 1.5rem). In the Inbox it sits inside a message card: a descendant rule `.message .score-line` overrides size, padding and border. That rule sets no `display`, `float`, `position`, `text-transform` or `content` (inline flow, so `innerText` equals `textContent`); the e2e computed-style check of Earned Trust 2 proves it in the browser.

**Where "score-line text equals the match screen's" is proved (M3).** It is guaranteed *by construction* (the shared `scoreLine` and `matchdayTitle`, one source each) and *probed in e2e* (the Inbox's lines read next to the match screens' own text, in a real browser). Node vitest runs with environment `node` and has no DOM, so the unit tier cannot build or read the element: it covers only the `matchdayReports` output (names and goals per side, matchday, position) and `inboxOf`. No unit test claims the rendered text.

### 4. Markup of the screen
| Choice | Option chosen | Rejected | Why |
|---|---|---|---|
| Message title | **`<p class="message-title">`** | `<h2>` | The project keeps one heading per screen (S-004 brief: labels are `<p>`; the Goals label is a `<p>`), and 14 headings would flood heading navigation for no gain: a message is a list item and the list already offers item navigation. Later message kinds (D7) need not be headings. The protected pins only require "Inbox" to be the only h1 |
| Name of the list | **`aria-label="Messages"` on `<ul role="list">`** | a visible `<p id>` plus `aria-labelledby` | The h1 "Inbox" already labels the screen; a visible "Messages" line would repeat it. `choose-player.ts` names its list "Players" the same way. `role="list"` stays explicit because `list-style: none` drops list semantics in Safari |
| Empty state | **`<p class="inbox-empty">No messages yet</p>` before the list, only when empty; the `<ul>` is always rendered (with `min-height: 1.5rem`, the Goals list precedent, so an empty list has a box)** | the line inside the list as an `<li>` | D5: "no item" before any match; the pins count items. The line is version-only text |
| Three lines per message | **three one-element lines: `p.message-title`, the shared `p.score-line`, `p.message-position` = `span.message-label` "League position", a literal `" "`, `span.message-value` "3rd"** | one text node per line; a `<dl>` | The ADR-0015 season-line technique: inline flow, one element per line, a styling hook for the value (gold) |

`renderInbox(root, { messages }, dispatch)` has `dispatch` narrowed at compile time to `Extract<Action, { type: "Back" }>` (the `renderTable` precedent). It writes one `section.inbox` = `<h1 tabindex="-1">Inbox</h1>`, [`p.inbox-empty`], `ul.message-list` (an `li.message` per report), `button.back-button` "Back". No other listener, no `innerHTML`, no focus call, no `<button>` or `<a>` inside the list.

The club home's `div.club-actions` gains a sixth `button.primary` "Inbox" (dispatches `ViewInbox`) after "Table"; `renderClubHome`'s input is unchanged.

CSS stays in the pitch green / chalk / gold identity (design-system.md): `li.message` is a card (chalk 8% fill, 1px chalk 25% border, 4px gold left border, 10px radius, 12px by 14px padding, 10px gap between cards, `overflow-wrap: anywhere`); the title is muted chalk bold (the season-label colour), the score line 1.1rem bold chalk left-aligned, the position value gold bold. `Back` is the shared 48px `.back-button`; the "Inbox" button is a `button.primary` at 48px. At 390px a card is about 100px tall, 14 cards about 1.4k px (vertical scroll only).

## Decision
**1A, 2A, 3A, 4 as listed.** No new dependency. No `GameState` key, no save change, no stream.

### Domain, pure: `src/domain/inbox.ts` (CREATE NEW)
- `MatchdayReport = { matchday: number; home: { name: string; goals: number }; away: { name: string; goals: number }; position: number }` (readonly). **Slice-01 intermediate shape (M6):** `position` is part of the type and of `matchdayReports` from the first Inbox commit (DELIVER commit 3, DD9); slice 01 only skips *rendering* the "League position" line and slice 02 (commit 4) adds that line. So there is no commit at which the type lacks `position`, and the goldens and oracles for `position` can be green from commit 3 (the pins stay RED-first per DISTILL). `ReportableMatch` = a `ScoredMatch` plus `matchday` (a `PlayedMatch` satisfies it).
- `matchdayReports(clubs: readonly Club[], played: readonly ReportableMatch[], clubIndex: number): readonly MatchdayReport[]`:
  - one report for every distinct matchday of `played` in which the club has a fixture, **newest first** (highest matchday first, whatever the order of `played`);
  - `home`/`away` are the club's own entry of that matchday (club names from `clubs`, goals from the entry's score);
  - `position` is the club's `position` in `standings(clubs, entries with matchday <= N)` (the prefix is a filter by `matchday`, not by index, so a log in any order gives the same reports);
  - an empty log gives an empty list; `clubIndex` not an integer inside the league throws `RangeError` (as `standings` does for a bad club); inputs are never mutated; no clock, no RNG, no `Intl`.
  - Position stays a number here; the ordinal text is made in the renderer with `formatOrdinal` (ADR-0015 option 4A), so a report compares as raw data.
- Imports only `Club` and `ScoredMatch` types and `standings`. Under Stryker's `src/domain/**` glob (no config change).

### App: `src/app/state.ts` (EXTEND)
- `Screen` adds `{ kind: "inbox"; clubId: string }`; `Action` adds `{ type: "ViewInbox" }`; `HANDLERS` gains `ViewInbox: viewInbox` (a compile error if missing).
- `viewInbox`: from a known club's `clubHome`, `screen` becomes `inbox` (same `clubId`) and nothing else changes; from any other screen or an unknown club the very same state (`toBe`). `HOME_RETURNING_KINDS` gains `"inbox"`, so `Back` returns the club home exactly as it was (`toEqual`). `sameScreen` and `focusPlan` need no change: club home to Inbox and back are screen changes (heading focus, ADR-0008); no focus ids.
- `inboxOf(state, clubId): readonly MatchdayReport[] | undefined` (exported, pure): `undefined` for an unknown club, else `matchdayReports(league.clubs, results ?? [], clubIndex)`.
- `GameState` unchanged; `save.ts` unchanged (`toSave` already projects a `clubId` screen). No `SAVE_VERSION` bump: a restored log yields the same messages by construction.

### UI
- `src/ui/score-line.ts` (CREATE NEW, extracted): `scoreLine({ home, away })` returning the `p.score-line` element, moved verbatim from `match.ts`; and `matchdayTitle(n)` returning the string "Matchday N" (M2), the one source of that text.
- `src/ui/screens/match.ts` (EXTEND): imports the shared builder and `matchdayTitle` (its h1 text is `matchdayTitle(view.matchday)`, the same text as before); its public `MatchScreenView` and markup are unchanged (behaviour-preserving, DELIVER commit 2).
- `src/ui/screens/inbox.ts` (CREATE NEW): `renderInbox` as above; its title line is `p.message-title` with `matchdayTitle(report.matchday)` as text.
- `src/ui/screens/club-home.ts` (EXTEND): the sixth button. `src/ui/styles.css` (EXTEND): the `.inbox`, `.inbox-empty`, `.message-list`, `.message*` rules and the `.message .score-line` override.
- `src/main.ts` (EXTEND): the render lookup of ADR-0018 gains an `inbox` entry (`renderInbox(root, { messages: inboxOrThrow(state, screen.clubId) }, dispatch)`, the `inboxOrThrow` helper as `seasonSummaryOrThrow`).

### Determinism
No new stream or draw, no clock. The same seed, club and choices give the same log, hence the same messages; `?seed=abc` equals no seed; a restored log gives the same messages (the round-trip law of ADR-0016). Messages come from what was recorded, not from re-playing, so a later change to the match model never rewrites an old message ("what is played stays played", ADR-0012).

## Consequences

### Positive
- The season's story is re-readable with no new stored data: two small pure functions (`matchdayReports`, `inboxOf`), one screen, one action, one shared UI builder.
- The Inbox cannot disagree with the Table (it calls `standings`) or with the match screen (it calls the same `scoreLine`); K2 compares them against independent oracles.
- No save-format change; autosave stays silent on navigation by construction (`saveTextFor` returns `undefined`).
- Forward-compatible (D7): other message kinds can join the list later with their own producer; today's prop is `messages: readonly MatchdayReport[]` and widens to a union then.

### Negative
- `standings` runs up to 14 times per Inbox render (negligible; see option D).
- With 14 messages "Back" sits about 1.4k px down the page; consistent with every other screen, but one-handed reach is worse than elsewhere. Open question for the owner's demo, with a trigger: if the owner reports that Back is hard to reach with a full season of messages, a later story adds a top Back or a sticky Back (the pins do not fix its position).
- `match.ts` changes (a pure extraction) in a story that is not about the match screen; covered by the whole S-006..S-010 e2e suite.
- `state.ts` grows to about 310 lines (limit 400) and `update` keeps complexity 1.
- **Bundle (M4), an estimate, not a measurement.** `src` is about 2,330 lines today (about 2,000 of TypeScript, 347 of CSS); a typical minified size for that is roughly 35 KB, roughly 12 KB gzip (rough, from line counts only). The Inbox adds about 150 lines of TypeScript and about 35 of CSS in the shipped bundle (the `render` lookup is size-neutral), so the delta is roughly +3 to +4 KB minified and roughly +1.5 KB gzip, about 10 percent. There is no size budget in `ci:*`; the project's constraint is "no runtime dependencies" (brief line 8), which holds. DELIVER may read the real figure from `ci:build` output; this ADR does not rely on it.

### Contract shapes
Vocabulary (M1): this ADR keeps the project's established terms from `brief.md`, "pure, return-only" and "bounded-change". "Pure, return-only" is exactly the Principle-6 *pure-function* shape (a return value only, no mutation of inputs, no effect). "Bounded-change" is a declared mutation set within a closed universe. `update` with `ViewInbox` and `Back` is **bounded-change** with universe `{ league, screen, formation, xi?, results? }` and delta "`screen` only" (the other four keys keep the same objects); it returns a new state value and never mutates its input, which is why the older rows call it return-only.

| Component | Shape | Universe and assertion |
|---|---|---|
| `matchdayReports` | pure, return-only | Deep-equal on repeat; inputs (deep-frozen) unchanged; golden seed-31 14 reports; the prefix boundary (a log whose entry at matchday N decides the position); any order of `played` gives the same output (property); empty log; `RangeError` table; independent oracle sweep |
| `inboxOf` | pure, return-only | `undefined` for an unknown club; N reports after N matchdays (0..14), newest first; each report's sides equal the `matchFor` view read right after its tap; each position equals the `standingsOf` row read right after its tap (time-travel oracle) |
| `update` `ViewInbox`, `Back` | bounded-change (returns a new state; input never mutated) | Universe `{ league, screen, formation, xi?, results? }`, delta "`screen` only". `ViewInbox` changes only `screen` from a known club's `clubHome`, else `toBe` no-op; `Back` returns the club home `toEqual` to what it was; `formation`, `xi`, `results` are the same objects across the round trip; `toSave`/`encodeSave` equal on the club home and the Inbox; deep-freeze; the existing 40-action properties keep their pools and stay unedited, with one new property whose pool includes `ViewInbox` |
| `src/ui/score-line.ts` (EXTEND by extraction): `scoreLine` | bounded-change | Creates detached nodes only (like `el()`); the S-006 markup rules; the only builder of the score line text and markup |
| `src/ui/score-line.ts`: `matchdayTitle(n)` | pure, return-only | Returns "Matchday N"; used by `renderMatch`'s h1 and the Inbox title line, so the two texts have one source; the match screen's h1 is unchanged |
| `src/ui/screens/inbox.ts` (CREATE NEW): `renderInbox` | bounded-change, emits only `Back` | Universe: `root`'s single `section.inbox` = h1, optional `p.inbox-empty`, `ul` list "Messages", `button.back-button`; `dispatch` narrowed at compile time to `Back`; assertions: e2e click-everything, e2e universe check (no `button`, `a` or `[role=button]` in `.message`), grep test (one `dispatch(`, one `addEventListener`, no `.focus(`, no `innerHTML`, no `"button"`/`"a"` element in the list code) |
| `renderClubHome` (S-011 delta) | bounded-change | Closed universe: six `button.primary` in the order Squad, Tactics, Starting XI, [Play match or End of season], Table, Inbox |
| `main.ts` (S-011 delta) | bounded-change (universe unchanged) | The `inbox` render entry, the helper and imports; the loop and the focus calls unchanged (ADR-0018 for the lookup) |

### Earned Trust (no adapter; the environment lies this design could suffer are named and probed)
There is no storage, clock, network or vendor SDK that the Inbox itself touches (the save is read-only here), so there is no `probe()` to specify. Where the environment can lie, the probe exercises the lie.
1. **Chromium vs Node (values).** The e2e reads the browser's Inbox at `?seed=31` ("Netherwold Borough") after 14 matches and compares all 14 messages with the Node goldens pinned RED-first (source: the verified table below, from the real generator; DELIVER never re-pins from its own output). Seed 20260, Oakhampton Rise Borough, one match: "Harrowgate Lane United 0–1 Oakhampton Rise Borough", 3rd. Positions after matchdays 1..14: 6th, 8th, 6th, 5th, 3rd, 3rd, 5th, 4th, 2nd, 4th, 4th, 4th, 3rd, 3rd.
2. **One line per element (the layout lie).** For every message the three lines' `innerText` and `textContent` equal the exact text, the score line reads `^(.+) (\d)–(\d) (.+)$` and the position line `^League position (1st|…|8th)$`. **An e2e computed-style check replaces any CSS source grep (M8)**, which would be brittle against equivalent rewrites: in the real browser, each `.message-label` and `.message-value` span and the `.message .score-line` `.score-name` and `.score-goals` spans have computed `display` `inline`; each `p.message-title`, `p.message-position` and the `.message .score-line` `<p>` has computed `display` `block`; and none of them has `float` other than `none` or `position` other than `static`. Together with `innerText` equal to `textContent` this catches the layout lie (a flex or grid span would read "League position\n3rd").
3. **The verdict agrees with the evidence (K2).** For seeds 1..300 x 8 clubs (one season per seed, since untouched tactics make the 56 results club-independent; trimmable) every report's position is compared with an **oracle that does not call `standings`**: it sums points, goals for and against per club over the entries of matchdays <= N and sorts by Pts, GD, goals for, name by `<` (ADR-0013). A second, **time-travel oracle** plays each tap and reads `standingsOf(state)` and `matchFor` right then, then compares them with the reports of the final state: this checks the prefix filter without sharing it. Fault: `<` for `<=` in the prefix, a missing tie-break, the wrong club's row, names or goals of the wrong side.
4. **Navigation writes nothing (K3).** Unit: `encodeSave` equal and `saveTextFor` `undefined` on the Inbox state; `formation`, `xi`, `results` the same objects after `ViewInbox` then `Back`; fast-check (`numRuns` 100, fresh `FC_SEED`) over random formation, pick and Play match sequences. e2e: an init script counts `setItem` calls and `gaffer.save` reads the same text before and after opening the Inbox and going back (a fake that writes on navigation turns it red).
5. **Messages are text.** e2e click-everything on the Inbox sees only `Back` dispatches; the DOM holds no `button`, `a` or `[role=button]` inside `.message`. The count is per matchday played (N items), and tactics changes after a match never change a message (fast-check, `toEqual` before and after).
6. **Focus and universe.** h1 focused on arrival at the Inbox and after Back (the club name); the Inbox h1 is the only h1; "Inbox" and "Back" 44px or taller; no horizontal scroll at 390px with 14 messages and the longest club names (e2e `scrollWidth <= clientWidth`); no console errors.
7. **Names.** "Inbox", "Messages", "League position", "No messages yet" appear in no `names.ts` string (case-insensitive unit check, the S-008 D9 precedent); locators use `exact: true`.
8. **The refactor claims behaviour preservation.** The `scoreLine` and `matchdayTitle` extraction and the render lookup are proved by every S-006..S-010 protected scenario and e2e on the branch. The probe for the lookup is ADR-0018 Earned Trust 2 (every screen kind reached by an existing e2e; swapping two entries turns both screens' scenarios red); the probe for the extraction is the same suite on DELIVER commit 2 alone (the match screen's h1 and score line texts are asserted by S-006..S-010).

### Enforcement
- Style: modular monolith, functional core, imperative shell (ADR-0003). Tool: oxlint (existing `.oxlintrc.json`): `inbox.ts` (domain) may not import `app` or `ui` or touch DOM/time globals; `max-params` 3 (`matchdayReports` has 3); `complexity` 15; `max-lines` 400. No config change. `src/domain/inbox.ts` and `inboxOf` in `state.ts` fall under the existing Stryker `mutate` globs, so no `stryker.config.mjs` edit; mutants to kill: the prefix comparison, the newest-first order, the club-row pick, the own-entry pick.
- Grep tests (vitest has no DOM): `inbox.ts` (domain) has no `Intl`, `toLocale`, `Date`, `Math.random` and imports only `Club`, `ScoredMatch` and `standings`; `ui/screens/inbox.ts` has one `dispatch(` and one `addEventListener(`, no `.focus(` (the existing `src/ui` scan), no `innerHTML`. The layout rules of the message lines are checked by the e2e computed-style check (Earned Trust 2), not by a CSS source grep.
- No external integrations, no contract tests, no new dependency, no library (so no Context7 lookup).
