# S-001 DISTILL: acceptance scenarios (lean)

Decisions come from ADR-0002 (plain DOM), ADR-0003 (core/shell split) and ADR-0004 (seed and world). No new ADR is needed.
Mark each scenario `[x]` when its executable test in `tests/acceptance/` passes.

## Domain (driven through `generateLeague`, `tests/acceptance/league.test.ts`)
- [ ] **D1 Eight clubs.** Given any seed, when the league is generated, then it holds exactly 8 clubs.
- [ ] **D2 Unique names.** Given any seed, then the 8 club names are non-empty and pairwise distinct (property test over 32-bit seeds).
- [ ] **D3 Two colours.** Given any seed, then every club has two distinct colours from the fixed palette.
- [ ] **D4 Deterministic.** Given the same seed twice, then the leagues are deep-equal.
- [ ] **D5 Seed-sensitive.** Given seeds 1 and 2 (and 4242), then the club-name lists differ.
- [ ] **D6 Fictional.** Given a sample of seeds, then no club name is on the real-club denylist (`tests/unit/fixtures/real-club-denylist.ts`).

## Shell (driven through `parseSeed` and `update`, `tests/acceptance/shell.test.ts`)
- [ ] **S1 Seed parsing.** Given `?seed=4242`, `?seed=007` and `?seed=-5`, then the seeds are 4242, 7 and -5.
- [ ] **S2 Invalid seed.** Given no seed, `?seed=`, `?seed=abc`, `?seed=1.5` or `?seed=9999999999`, then `parseSeed` returns `DEFAULT_SEED`.
- [ ] **S3 New game.** Given the title screen, when the player dispatches "new game", then the screen is `pickClub`.
- [ ] **S4 Pick club.** Given `pickClub`, when the player picks club N, then the screen is `clubHome` for that club's id.

## UI (jsdom-free: e2e on the phone viewport, `tests/e2e/pick-club.spec.ts`)
- [ ] **U1 Picker.** Given the title screen, when the player taps "New game", then there is one `<h1>` and a list named "Clubs" with 8 items, each holding one button of at least 44px height whose first line is the club name.
- [ ] **U2 Club home.** When the player taps a club, then the one `<h1>` contains that club's name.
- [ ] **U3 Seeds in the address.** Given the same `?seed=` on two fresh visits the lists are equal; given different seeds they differ.
- [ ] **U4 Phone layout.** At 390px width there is no horizontal scroll, and the console has no errors.

## DELIVER step plan
1. `src/domain/names.ts` and `generateLeague` and `deriveSeed` in `src/domain/` (D1-D6), plus unit and property tests.
2. `src/app/` with `GameState`, `Screen`, `Action`, `update` and `parseSeed` (S1-S4).
3. `src/ui/dom.ts`, the pick-club and club-home screens, `main.ts` wiring and focus moved to the `<h1>` (U1-U4), plus the e2e smoke.

Each step is its own tick if the diff would pass the cap (~600 lines).
