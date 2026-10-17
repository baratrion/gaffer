# ADR-0007: Formation data and tactics state (S-004)

- Status: Accepted
- Date: 2026-10-17
- Deciders: nWave solution-architect (S-004 DESIGN, `interaction_mode=propose`)
- Related: ADR-0003 (functional core, imperative shell), ADR-0002 (plain DOM), ADR-0005 and ADR-0006 (precedent for extending `Screen`, `Action` and `Back` with the squad and player screens), ADR-0008 (focus on a same-screen update)

## Context
S-004 adds a "Tactics" screen where the player picks 4-4-2, 4-3-3 or 4-2-3-1 and sees the 11-slot line-up (position codes only). The choice lives for the session, every new game starts at 4-4-2, and S-005 (starting XI) will fill the same 11 slots with players. Constraints: formations are fixed data (no seed, no RNG), pure domain (ADR-0003), `Position` codes shared with the squad (GK, DF, MF, FW), ADR-0002 markup rules, and the line-up must read goalkeeper first, then defenders, midfielders and forwards. `salvage/tactics.ts` holds 4-4-2 and 4-3-3 with finer roles (LB, CB, ST) and 0-1 pitch coordinates; it is reference only.

## Decision

### 1. Formation data: `src/domain/formation.ts`, pure and frozen
- `FormationId = "4-4-2" | "4-3-3" | "4-2-3-1"`; `FORMATIONS` is the ordered, frozen list of the three ids (UI order and tests); `DEFAULT_FORMATION = "4-4-2"`; `isFormationId(value: string): value is FormationId` is the runtime type guard used by `update` (and by anything that reads a formation from an untyped string, such as a DOM `value`).
- The source of truth is a frozen line structure: per formation, an ordered list of lines `{ position: Position, count: number }`, goalkeeper line first. 4-4-2 = GK 1, DF 4, MF 4, FW 2. 4-3-3 = GK 1, DF 4, MF 3, FW 3. 4-2-3-1 = GK 1, DF 4, MF 2, MF 3, FW 1 (the "2" and the "3" are two midfield lines, both `MF`; so 5 MF slots in two rows).
- Two pure read-only functions: `formationLines(formation) => readonly FormationLine[]` (to group slots into pitch rows; the two MF lines of 4-2-3-1 become two rows) and `lineUp(formation) => readonly Position[]` (11 codes in GK, DF, MF, FW order, derived from the lines, so they cannot disagree). The screen draws the lines top to bottom in the same order as the DOM (GK row first, FW row last; the team attacks downward), so reading order and visual order are the same.
- Everything is deeply frozen: the `FORMATIONS` array, each formation's lines array and every `FormationLine` object (`Object.isFrozen` on each level).
- `Position` is imported as a type from `squad.ts` (shared kernel between the squad and tactics; no move needed until a third consumer exists).
- Ported from `salvage/tactics.ts`: the formation names 4-4-2 and 4-3-3 only. Not ported: coordinates (the screen is a CSS line layout; pitch coordinates belong to `match-2d`, OUT), finer roles (the outcome fixes position codes only; S-005 matches players to GK/DF/MF/FW, so LB/CB/ST would be unused data), `Mentality` and `TeamTactics` (OUT). 4-2-3-1 is new. Salvage is not imported (not built).
- S-005 reuse: a slot is its index 0..10 in `lineUp(formation)`; its position code is the element at that index and its row is derived from `formationLines`. S-005 stores "slot index to player index" in state, with no change to this module. Finer roles, if S-005 needs them, arrive through a new ADR that extends the line structure.
- The data is frozen after S-004: changing a count or the order changes every line-up and needs an ADR note (as the name pools in ADR-0005).

### 2. State and navigation (`src/app/state.ts`)
- `GameState` gains `formation: FormationId`. New `initialState(league: League) => GameState` in `state.ts` (title screen, `DEFAULT_FORMATION`) replaces the literal in `main.ts`, so the default has one home and tests build states the same way.
- `NewGame` (title to pickClub) also sets `formation` to `DEFAULT_FORMATION`. Today the title is unreachable after leaving it, so this is belt-and-braces; it makes "every new game starts at 4-4-2" a property of `update` and keeps it true when "Save and continue" or "play again" later adds a way back to the title. The architecture review called it unneeded today (simplicity); it is kept deliberately as cheap future-proofing (one assignment, one unit test).
- `Screen` gains `{ kind: "tactics"; clubId: string }`. `Action` gains `{ type: "ViewTactics" }` (valid only from `clubHome` of a known club) and `{ type: "ChooseFormation"; formation: FormationId }` (valid only on `tactics` of a known club with `isFormationId(formation)`; else the state is returned unchanged). Choosing the current formation returns the same state object. Choosing returns `{ ...state, formation }` (screen untouched). `Back` from `tactics` of a known club goes to `clubHome`; an unknown club is a no-op, as for squad and player.
- `formation` is a plain field, not a screen field, so it survives Back, Squad, a player and Back (D6). The line-up is derived on render from `formation` and is never stored. No input is mutated. `update` keeps one helper per action (oxlint complexity cap 15).

Options:
| Option | Pros | Cons |
|---|---|---|
| **A. Line structure as the source, `lineUp` derived; `formation` on `GameState`; actions as above (chosen)** | One source of truth; the layout needs line grouping anyway; 4-2-3-1's two midfield rows fall out naturally; S-005 slot = index; no new dependency; state stays one small value | Frozen data shape; a required `GameState` field forces three existing test fixtures to add it |
| B. Literal 11-element arrays per formation | Trivially readable; no derivation | No line grouping, so the UI would recompute the rows (and 4-2-3-1's 2+3 split is lost); two places to keep the counts right |
| C. Port salvage as is (roles plus coordinates) | Already written for two formations | Needs a role-to-position mapping; coordinates serve a pitch renderer that is OUT; carries `match-state` types the repo does not build |
| D. Hold the formation in the `tactics` Screen or in UI-local state | No `GameState` change | Lost on Back, which breaks D6; hides state from `update` tests |
| E. Optional `formation?` on `GameState` (no fixture edits) | Existing fixtures compile | Every reader needs a fallback; "always has a formation" is no longer a type fact |

## Consequences
- Positive: determinism untouched (no RNG); formation logic is unit-testable in Node; S-005 builds on `lineUp`; focus and markup concerns stay out of the domain (ADR-0008).
- Negative: DELIVER edits three existing acceptance test files that build `GameState` literals (`tests/acceptance/S-001/navigation.test.ts`, `S-002/navigation.test.ts`, `S-003/player-navigation.test.ts`) to include `formation: DEFAULT_FORMATION` (or use `initialState`): types only, assertions and test counts unchanged. Protected tests are black-box and unaffected.
- Contract shapes: `FORMATIONS`, `DEFAULT_FORMATION`, line data frozen constants; `formationLines`, `lineUp`, `isFormationId`, `update`, `initialState` pure return-only (deep-equal on repeat, `Object.isFrozen` on the data at every level: the outer array, each lines array and each `FormationLine`; inputs not mutated). Driving ports that only read expose no write methods.
- Properties to test (domain, unit): exactly three ids in order; each `lineUp` has 11 codes from GK/DF/MF/FW, one GK first, non-decreasing in GK, DF, MF, FW order, counts 1/4/4/2, 1/4/3/3, 1/4/5/1; `lineUp` equals the expansion of `formationLines`; the data is deeply frozen; `isFormationId` accepts only the three ids; the data does not depend on any seed. On `update`: `ViewTactics` from a known club home only (not from title, pickClub, squad, player, tactics, an unknown club); `ChooseFormation` only on tactics with a known club and a known id (`"3-5-2"`, `""` and `"4-4-2 "` are no-ops); same-formation choice returns the same object; choosing changes only `formation`; `Back` from tactics goes to clubHome, no-op for an unknown club; `NewGame` resets `formation`; inputs not mutated.
- Earned Trust: no new adapter (no storage, clock or network), so nothing to probe here; persistence of the formation arrives with "Save and continue" and its own probe. The environmental assumption (focus and native radio behaviour) is probed in ADR-0008.
- No external integrations, so no contract tests. Enforcement: oxlint boundary rules unchanged (domain may not import app or ui; formation.ts imports only a type from squad.ts); the PR guard still rejects `Math.random` and `Date` in `src/domain/`; Stryker already mutates `src/domain/**` and `src/app/state.ts` (which also holds `focusPlan`, ADR-0008).
