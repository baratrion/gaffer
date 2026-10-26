# ADR-0016: Save and continue in browser localStorage (S-010)

- Status: Accepted
- Date: 2026-10-26
- Deciders: nWave solution-architect (S-010 DESIGN, `interaction_mode=propose`)
- Related: ADR-0003 (functional core, imperative shell; its "Future persistence" note is taken here), ADR-0005 (squads derived on demand, frozen order), ADR-0006 (frozen attribute tables), ADR-0008 (focus plan), ADR-0009 (optional state fields), ADR-0010 (schedule), ADR-0011 (match model, streams), ADR-0012 (the results log; "persistence ... validates shape, a separate story with its own probe"), ADR-0014 (derived `nextMatchday`; "a future persistence story must validate shape, order and contiguity of a loaded log, with its own `probe()`"), ADR-0015 (`NewGame` from `seasonEnd`).
- **Amends** (status-line notes only): ADR-0012 (D9 "no persistence yet"; Earned Trust 3 "Future persistence"), ADR-0014 (Earned Trust 4), ADR-0015 (its "no storage" statement). Everything else in them stands.

## Context
S-010 (DISCUSS D1-D10, US-1, US-2) makes a season span visits. Binding rules:
- **D1**: after a club is picked, the game is saved automatically after each saving tap (club picked, formation chosen, Starting XI player picked, Play match). Saved: seed, club, formation, XI (with picks), results. Not saved: the screen.
- **D2/D3**: the title shows "Continue" (44px or taller) above "New game" only with a saved game; "Continue" lands on the club home of the saved club, heading focused, everything as before the reload; the continued season equals the uninterrupted one.
- **D4**: "New game" starts fresh from the address's seed; the save is replaced only once a club is picked in the new game.
- **D5**: one slot; "Continue" ignores the address's `?seed=`; "Play again" after "Continue" keeps the saved league.
- **D6**: an unreadable save, or unavailable or full storage, gives no "Continue", no console error, and never interrupts play.

Facts checked in the code:
- `GameState` is exactly `{ league, screen, formation, xi?, results? }`; `tests/acceptance/S-009/existing-navigation-unchanged.test.ts` asserts no other key, and tests may never be weakened. The managed club exists only as the screen's `clubId`, so a save is a projection of the state while the screen carries a club.
- `results` is `PlayedMatch[]`, 4 entries per matchday in fixture order, each `{ matchday, fixtureIndex, home, away, result: { homeGoals, awayGoals, goals: { minute, side, playerIndex }[] } }`. `matchday`, `fixtureIndex`, `home`, `away` are fully determined by the entry's position in the log (frozen schedule, ADR-0010); the two scores equal the goal counts by side.
- Of the 4 results of a matchday, the 3 that do not involve the managed club depend only on the seed (every other side is `automaticXI(squad, DEFAULT_FORMATION)`, independent streams, ADR-0012). The managed club's own result depends on its XI at the time, and past XIs are not kept.
- `topScorer` throws `RangeError` for a goal naming a player outside the squad, `main.ts` `scorerName` throws for an unknown player, and `render` throws for an unknown club. A loaded log must therefore be validated before it reaches the state (S-009 Open question).
- `update` is at 13 cases (complexity 14 of 15); `main.ts` `render` is at 15 of 15 (S-009 Open question 1). `.oxlintrc.json` forbids `localStorage` in `src/domain/` only. There is no storage code anywhere in `src/`.
- Squads, attributes, the schedule, the match model and the AI-side policy are frozen by ADRs 0005, 0006, 0010, 0011 and 0012. A change to any of them makes an old save disagree with the current game.
- GitHub Pages serves every project of a user from one origin (`<user>.github.io`), and `localStorage` is per origin, so the key must be namespaced.
- Browser behaviour relied on (MDN, Web Storage API; from the architect's knowledge, not looked up in this unattended run, which had no browsing tool): reading the `localStorage` property can throw `SecurityError` when storage is blocked; `getItem` returns `null` for an absent key; `setItem` can throw `QuotaExceededError` when storage is full or disabled; values are strings.

## Options

### 1. What is stored
| Option | Pros | Cons |
|---|---|---|
| A. The state as is: `results` serialised unchanged (`PlayedMatch[]` JSON), plus seed, club, formation, XI | Trivial encode; the ADR-0012 JSON round-trip already holds | About 230 bytes per match (`matchday`, `fixtureIndex`, `home`, `away`, both scores repeated): about 13 KB for an average season (2.7 goals per match, 46 bytes per goal) and about 52 KB if every chance scored; breaks the 16 KB guardrail on high-scoring seeds; five redundant fields per entry that can disagree and must each be cross-checked |
| **B. Irredundant: seed, club, formation, XI (only when picked) and, per match in schedule order, only the goal list as `[minute, side 0/1, playerIndex]` triples (chosen)** | About 32 bytes per match: about 1.9 KB for an average season; at most 9 goals per side, so the absolute worst season (18 goals in every match, about 10 bytes each) is about 10.5 KB, under the 16 KB guardrail by construction. Position in the log *is* matchday, fixture and clubs, so contiguity, "4 per matchday" and "fixtures equal the schedule" cannot be violated, and scores cannot disagree with the goals | The stored shape is not the `PlayedMatch` shape (a pure expand step on decode, a pure compress on encode) |
| C. Per-matchday choices (formation, XI) and replay the whole season | Smallest | The history of past XIs is not in `GameState` (adding it breaks the five-key test) and is not recoverable; couples every save to the current model |
| D. A full `GameState` snapshot including `league` and `screen` | No projection logic | Stores derivable data (league, names); stores the screen (D1 says no); hides name-pool changes behind stored names |

Envelope: a single object `{ v, seed, clubId, formation, xi?, results? }`, `v` the integer format version (1). `xi` is present only when the player changed the XI (absent means "follows the formation", ADR-0009). `results` is present only when at least one matchday is recorded. Key order is fixed by the encoder, so equal states encode to equal text. One `localStorage` key: **`gaffer.save`** (namespaced; the origin is shared with other projects of the same user).

### 2. How strictly a stored save is validated
| Option | Pros | Cons |
|---|---|---|
| A. Shape and ranges only | Smallest | A save that parses but was written by a different model, squad or AI policy would be accepted and continue a season that disagrees with the current game |
| B. A plus structural truth: seed int32, club in the regenerated league, formation id, XI legal for the squad and formation, goals well-formed (minute integer 1..90 non-decreasing, side 0 or 1, player index integer 0..17, at most 9 per side), log length a multiple of 4 and at most 56 | Covers corruption, truncation, tampering; with encoding B the schedule and score checks are by construction | Cannot tell a model change from a valid save |
| **C. B plus replay-verify (chosen): re-play every recorded matchday with the current model and require the 3 fixtures that do not involve the managed club to equal the stored ones exactly; the managed club's fixture is checked for shape, and its scorers must be non-goalkeepers of the club's squad** | Turns the next unannounced change to the match model, a squad or name pool, an attribute table or the AI-side XI policy into "unreadable save" instead of a silently inconsistent season; costs 8 squads and at most 14 x 4 matches, a few milliseconds at boot | The managed fixture cannot be replayed (past XIs unknown), so a well-formed wrong scorer there is accepted (no realistic cause but hand editing; no security boundary in a single-player client) |
| D. Full replay | Strongest | Impossible: the managed club's XI per matchday is not recorded |

The replay safety net is not a substitute for bumping `v`: any ADR that changes squads, streams, the match model or the AI-side policy must bump `SAVE_VERSION` (or consciously accept that old saves are dropped by replay).

### 3. Where the pure functions and the adapter live
| Option | Pros | Cons |
|---|---|---|
| **A. Pure `src/app/save.ts` (`toSave`, `fromSave`, `encodeSave`, `decodeSave`) and an effectful `src/adapters/save-store.ts` (the driven adapter), wired in `main.ts` (chosen)** | `GameState` lives in `src/app`; the functions are Node-testable with no DOM; the only code that may name `localStorage` is a small file with an injectable storage getter, so failures are simulated in vitest; boundaries enforceable with oxlint plus one grep test | One new folder for the first driven adapter |
| B. Everything in `main.ts` | No new files | Untestable without a browser (vitest has no DOM); `main.ts` grows; the lie catalogue is e2e-only |
| C. `src/domain/save.ts` | Near the rules | The domain has no `GameState`; ADR-0003 and `.oxlintrc.json` keep storage out of it |
| D. `src/app/storage.ts` | No new folder | `src/app` is the *pure* shell state; mixing an effectful adapter blurs the layer rule the brief states |

### 4. How "Continue" enters the state machine
| Option | Pros | Cons |
|---|---|---|
| **A. A `Continue` action carrying the already-validated restored `GameState` (what `fromSave` returned at boot): valid only from `title` (then the state becomes the payload), else a `toBe` no-op; together with turning `update`'s switch into a handler table so `update` has headroom (chosen)** | Every transition, including this one, runs through `update`, so `focusPlan` (title to club home is a screen change, so the club home `<h1>` is focused, ADR-0008) and the loop are unchanged; the title renderer just dispatches; the no-op and swap are unit-testable; the five-key test is untouched (no new state key); `update` complexity drops from 14 to 1 | A "rehydrate"-style action carries a whole state (guarded to the title screen; only `fromSave` constructs it; a grep test pins the one dispatch site) |
| B. The shell swaps `state` outside `update`; the title renderer takes an `onContinue` callback | `update` untouched | A transition outside the pure core, a second path to repeat `focusPlan`, a renderer that takes a bare callback instead of `dispatch` (breaks the `render<Screen>(root, props, dispatch)` convention); e2e-only |
| C. `Continue` action *without* lookups refactor | Smallest diff | `update` lands at exactly 15 of 15 with zero headroom; S-009 Open question 1 ("the next action must first move `update` ... to lookups") is ignored and the debt compounds |
| D. `Continue` carries the raw `SaveData` and `update` calls `fromSave` | One validation path | The state machine re-validates and regenerates on every call; `update` would depend on `save.ts` (and `save.ts` on `state.ts`): an import cycle |

`render` stays a switch: no new screen is added, and the title case only gains a prop (no branch), so it stays at 15 of 15. The next story that adds a *screen* must first move `render` to a lookup (carried as an open question).

### 5. What triggers a write
| Option | Pros | Cons |
|---|---|---|
| **A. After each dispatch, encode the state; write only when the text differs from the last text read or written; nothing is written when the screen carries no club (chosen)** | D1's triggers fall out of the data (a no-op pick or the same formation changes nothing, so writes nothing); D4's timing falls out too (`NewGame` and "Play again" reach `pickClub`, which has no club, so the old save stays; the first `ChooseClub` writes the new game); "Continue" itself writes nothing; no list of action names in the shell; the trigger is a pure function of state, unit-testable | One `JSON.stringify` of at most about 12 KB per tap (microseconds) |
| B. A whitelist of action types (`ChooseClub`, `ChooseFormation`, `PickPlayer`, `PlayMatch`) | Cheap | Writes on no-ops, couples the shell to action names, misses any future saving action |
| C. Write on every dispatch | Simplest | Writes on every navigation tap; needless storage churn on a phone |
| D. Write on `visibilitychange` / `pagehide` only | Few writes | Unreliable on mobile (tab discarded without events): the exact failure S-010 exists to remove |

### 6. The storage technology
`localStorage` (scope.md IN). Rejected: IndexedDB (asynchronous, heavy, nothing to index for about 2 KB), cookies (4 KB cap, sent with requests, no server needs them).

## Decision
**1B, 2C, 3A, 4A, 5A, 6 localStorage.** No new dependency; browser API only.

### App, pure: `src/app/save.ts` (CREATE NEW)
- `SAVE_VERSION = 1`. `SaveData = { v, seed, clubId, formation, xi?, results? }` (plain JSON data; `results` is a list of matches, each a list of `[minute, side, playerIndex]`, side 0 home, 1 away).
- `toSave(state: GameState): SaveData | undefined`: `undefined` unless the screen carries a `clubId` that is in the league. Otherwise projects seed, club, formation, XI (only if stored) and the compressed log (only if non-empty).
- `fromSave(raw: unknown): GameState | undefined`: total, never throws. In order: envelope shape (object, `v === SAVE_VERSION`, `seed` an int32, `clubId` a string, `formation` a known id, `xi` absent or an array of numbers, `results` absent or an array of arrays); regenerate the league from the seed (`generateLeague`) and require the club in it; `xi`, when present, legal for the club's squad and formation (`isLegalXI`, EXTEND `selection.ts`); `results`: 1..14 whole matchdays (length a multiple of 4, at most 56), every goal well-formed (see option 2B), expanded to `PlayedMatch` entries whose `matchday`, `fixtureIndex`, `home`, `away` come from position and `fixturesOf`, scores from the goal counts; then replay-verify (option 2C) with `sidesFor` (state.ts) and `playMatchday`. Any failure returns `undefined`; no partial restore. The restored state is `{ league, screen: { kind: "clubHome", clubId }, formation, xi?, results? }` with the optional keys present only when stored, so it holds no key beyond the existing five.
- `encodeSave(state): string | undefined` (`toSave` then `JSON.stringify`, fixed key order) and `decodeSave(text: string | null | undefined): GameState | undefined` (`JSON.parse` inside a catch, then `fromSave`). These two are what the shell calls; `toSave` and `fromSave` are the object-level pair the property tests drive.
- The law: for every reachable state `s` on a screen with a known club, `fromSave(JSON.parse(encodeSave(s)))` `toEqual`s `s` with `screen` set to the club home; `update` is a pure function of state and action, so a continued season equals the uninterrupted one by construction (K2).

### App: `src/app/state.ts` (EXTEND)
- `Action` adds `{ type: "Continue"; game: GameState }`. Handler: from `title`, return `action.game`; from any other screen, the same state (`toBe`). `focusPlan` is untouched (title to club home is a screen change).
- `update` becomes a handler table keyed by `Action["type"]` and typed so a missing key is a compile error (it replaces the switch's exhaustiveness). Behaviour-preserving: every existing handler function is unchanged, and the S-001..S-009 `update` suites pass unedited. One documented cast at the lookup (TypeScript cannot correlate the union).
- The private `sideFor`/`matchdayFor` pair splits into an exported `sidesFor(state, clubId)` (the 8 sides; the single owner of the "other clubs field `automaticXI(squad, DEFAULT_FORMATION)`" policy) and `matchdayFor` calling it. `save.ts` uses `sidesFor` for the replay, so the policy is still stated once.
- `GameState` is unchanged.

### Domain, pure: `src/domain/selection.ts` (EXTEND)
- `isLegalXI(squad, formation, xi): boolean`: 11 distinct integers 0..17 with `squad[xi[i]].position === lineUp(formation)[i]`. A rule about selections, so it sits with `pickForSlot` and under Stryker's domain glob. `src/app/seed.ts` exports its existing `isInt32`.

### Adapter, effectful: `src/adapters/save-store.ts` (CREATE NEW, the first driven adapter)
- `createSaveStore(getStorage: () => SaveStorage, key = "gaffer.save"): SaveStore`, with `SaveStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">` (capability injection: never `window`). The factory is the only constructor and **probes during construction** (wire, probe, then use). `SaveStore = { health: "ok" | "degraded"; read(): string | undefined; write(text: string): void }`.
- `probe` (inside the factory): obtain the storage through the getter, write a sentinel to a second key (`gaffer.probe`), read it back and require equality, remove it. Any throw (getter, `setItem`, `getItem`, `removeItem`) or a mismatch makes the store `degraded`: `read()` always returns `undefined` and `write()` does nothing. When `ok`, `read()` returns the stored string or `undefined` (absent, not a string, or a throw), and `write(text)` swallows every throw. Nothing is ever logged (D6, `no-console`).
- Deliberate deviation from the generic "refuse to start" rule (Earned Trust, health.startup.refused): saving is optional; D6 requires the game to play as before, so a failed probe degrades silently instead of refusing. The effect of `degraded` is exactly "no save is offered and none is written", also when an old save would be readable (a store that cannot honour its write contract is treated as absent; a full store with an old save therefore offers no "Continue", the literal reading of D6).
- `createAutosave(store, lastText): (state: GameState) => void`: encodes, and writes only when the text is defined and differs from the last read or written text (option 5A). The text is remembered even when the write fails, so a failing store is not hammered; the next saving tap changes the text and retries.
- Boot, in `main.ts` (composition root): `store = createSaveStore(() => localStorage)`; `stored = store.read()`; `offer = decodeSave(stored)`; `autosave = createAutosave(store, stored)`; after each `dispatch`, `autosave(state)`. These are the only storage reads and writes of the page (one read, one probe round trip, then writes of `gaffer.save`).

### UI: `src/ui/screens/title.ts` (EXTEND), `src/ui/styles.css`, `src/main.ts`
- `renderTitle(root, { offer }, dispatch)` with `dispatch` narrowed at compile time to `NewGame` and `Continue`. With an offer: `section.title-screen` = h1 "Gaffer" (still focused on load), tagline, `button.primary` "Continue" (dispatches `{ type: "Continue", game: offer }`), `button.secondary` "New game". Without an offer the markup is exactly today's (`button.primary` "New game" only), so every protected scenario that starts in a fresh context sees an unchanged title. `.secondary` is the outlined gold button of `.back-button` (same 48px, same colours) with the title's `min-width: 200px`; within the design system's gold-fill-means-primary-action rule.
- `main.ts`: the `title` case passes `{ offer }` (a module constant read at boot; the title is never shown again after a page load, because no action returns to it). `render` gains no branch.
- After "Continue" the loop focuses the club home `<h1>` (the club's name) through `focusPlan`; renderers still never move focus.

### Determinism
No new stream, draw, clock or randomness. The league is regenerated from the saved seed, so "Play again" after "Continue" (`NewGame` keeps `league`) keeps the saved seed (D5). `nextMatchday` is derived from the restored log. The format carries no timestamp and no id.

## Consequences

### Positive
- A season spans visits; the save is a tiny irredundant projection (about 1.9 KB average, under 10.5 KB worst case) of the state, with no new `GameState` key.
- Corruption, truncation, old versions and model drift all land on one outcome: "no saved game".
- The adapter is the only file naming a storage API, with an injectable getter; every lie below has a fault-injection test.
- `update` goes from complexity 14 to 1, clearing the S-009 debt for actions; `render` stays at 15 of 15 and the next screen pays.
- `sidesFor` keeps the AI-side policy in one place while serving two callers.

### Negative
- A rehydrate-style `Continue` action carries a whole state (guarded to the title, one dispatch site).
- Any future change to the match model, squads or the AI-side policy invalidates saves (replay catches it; the change must bump `SAVE_VERSION` or accept the loss). There is no migration (OUT).
- The managed fixture is not replay-verified (past XIs unknown).
- A `degraded` store also hides a readable old save (literal D6); the player is not told that saving failed (OUT).
- Several tabs: last write wins (not tested); the shared origin means the namespaced key is a convention, not isolation.
- Boot does one storage round trip (sentinel) and, with a save, a decode plus replay (a few milliseconds; DELIVER measures it in the e2e and reports it).

### Contract shapes
| Component | Shape | Universe and assertion |
|---|---|---|
| `toSave`, `fromSave`, `encodeSave`, `decodeSave`, `isLegalXI`, `sidesFor` | pure, return-only | Inputs (deep-frozen) unchanged, deep-equal on repeat; round trip law over reachable states; `fromSave` and `decodeSave` never throw (property over arbitrary JSON, arbitrary strings, truncated, bit-flipped, key-dropped, version-changed and matchday-swapped valid saves) and return `undefined` on each; encode size under 16 KB for the worst-case log |
| `update` (`Continue`, handler table) | pure, return-only | Universe `{ league, screen, formation, xi?, results? }`; `Continue` from `title` returns the payload, elsewhere `toBe` no-op; the S-001..S-009 `update` suites pass unedited; 40-action property unchanged |
| `createSaveStore` | bounded-change (effectful adapter) | Universe: keys `gaffer.save` (read, write) and `gaffer.probe` (write, read, remove) on the injected storage; never throws, never logs, `degraded` reads `undefined` and writes nothing |
| `createAutosave` | bounded-change | Writes `gaffer.save` through the store only; one write per changed text; none for navigation, `Continue`, `NewGame` or a no-op pick |
| `renderTitle` | bounded-change, emits only `NewGame` and `Continue` | Universe: root's one `section.title-screen` = h1, tagline, [Continue], New game; compile-time narrowed `dispatch`; e2e click-everything; grep (at most two `dispatch(`) and `.focus(` grep |
| `main.ts` | bounded-change | Enumerated universe adds: one `localStorage` read, one sentinel round trip and writes of `gaffer.save` through the adapter |

### Earned Trust (the first real adapter; every dependency probed, each lie exercised)
`localStorage` lies. Each row has a fault-injection scenario the adapter or the decoder must survive, in vitest with injected storages unless noted.
| # | Lie or hazard | Probe or defence | Fault scenario |
|---|---|---|---|
| 1 | Access blocked: reading the property throws `SecurityError` (sandboxed frame, cookies blocked) | The getter is called inside the factory's try | `getStorage` throws: `degraded`, no throw, no console; e2e blocks storage with an init script, play continues |
| 2 | Full or disabled: `setItem` throws `QuotaExceededError` | Probe write fails: `degraded`; a later write failure is swallowed | `setItem` throws on the sentinel, then only on the save: no throw, no console, the game plays |
| 3 | Silent no-op: `setItem` succeeds but `getItem` returns `null` or stale data | The probe reads the sentinel back and compares | A fake that ignores writes: `degraded`, so no "Continue" is ever offered on a lie |
| 4 | Odd reads: `getItem` throws or returns a non-string | `read()` returns `undefined` | Fakes that throw, return `undefined`, a number |
| 5 | Foreign, stale or damaged text under the key (other project on the origin, old format, truncation, hand edit) | `decodeSave`: catch around `JSON.parse`, then strict `fromSave` | Property over arbitrary strings and damaged valid saves; e2e seeds garbage and an old-version object before load: no "Continue", no console error |
| 6 | Model drift: a later story changes squads, streams, the match model or the AI-side policy | Replay-verify of the 3 unmanaged fixtures per matchday plus `v` | A valid save whose unmanaged fixture is altered, and one written with another `v`, both give `undefined`; a golden save text (seed 31, two matchdays) pinned by DISTILL from the reference season decodes to the expected state, so an accidental change breaks CI visibly |
| 7 | Round trip loses information | The law in Decision | Property over seeds 1..300 x 8 clubs x matchdays 0..14 (untouched tactics) and fast-check over random formation, pick and Play match sequences with a save and restore at a random point |
| 8 | A write at the wrong moment (D4) or a missed one | `encodeSave` is a pure function of state; compare with the last text | `NewGame`/"Play again" with no club picked leaves the stored text; the first `ChooseClub` replaces it; navigation writes nothing |
| 9 | The adapters claim a probe but do not do it | Three orthogonal layers: type (the factory is the only constructor of `SaveStore` and probes inside it, `health` is in the type), structure (grep test: `localStorage` and `sessionStorage` appear only in `src/adapters/` and as `() => localStorage` in `main.ts`; the adapter calls its probe), behaviour (the six fault catalogues above) | Removing the probe turns the structural and the fault-injection tests red |

No `health.startup.refused` event is emitted: saving is optional and D6 forbids console output, so the degrade is silent by design (see Decision).

### Enforcement
- Style: modular monolith, functional core, imperative shell (ADR-0003). `.oxlintrc.json` (DELIVER adds, a strengthening): `src/domain/**`, `src/app/**` and `src/ui/**` may not import `**/adapters/**`; `src/app/**` and `src/ui/**` gain `localStorage` and `sessionStorage` in `no-restricted-globals` (the domain already has `localStorage`); `src/adapters/**` may not import `**/ui/**`. Existing `complexity` 15, `max-params` 3, `max-lines` 400 apply; no existing function gains a branch except `renderTitle` (+1).
- Stryker: `src/domain/**` and `src/app/state.ts` are already mutated; `src/app/save.ts` is new logic that matters, so the owner-locked `stryker.config.mjs` should list it (not editable by the factory; flagged as an open question, not a blocker).
- Grep tests: storage names only in `src/adapters/` and the `main.ts` getter; one `"Continue"` dispatch site (`title.ts`); at most two `dispatch(` in `title.ts`; no `.focus(` under `src/ui/`; no `console` in `src/adapters/` (oxlint `no-console` already errors).
- No external integrations (a browser API, not a service), so no contract tests; no new dependency, no library, so no Context7 lookup applies.
