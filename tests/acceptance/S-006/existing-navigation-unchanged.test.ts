// @US-1 (S-006 play my first match) @regression
// CONTRACT_SHAPE: bounded-change
// Outcome anchor: DISCUSS D8/D10 and the DoD: adding "Play match" must keep the way to the squad, the tactics and the
// Starting XI working, and the game state gains nothing (the result is derived, never stored). A formation, a pick and a
// trip to the club home keep their values. States are built without naming any S-006 symbol, so this file compiles and
// passes before and after DELIVER.
import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { initialState, update, type Action, type GameState } from "../../../src/app/state";
import { FORMATIONS } from "../../../src/domain/formation";
import { generateLeague } from "../../../src/domain/league";

const league = generateLeague(31);
const clubIds = league.clubs.map((club) => club.id);
const NORTHCOTT_FOR_REDFERN = [0, 7, 3, 6, 2, 9, 12, 13, 17, 14, 16] as const;
const homeOf = (clubId: string, formation = "4-4-2"): GameState =>
  ({ ...initialState(league), screen: { kind: "clubHome", clubId }, formation }) as GameState;
const walk = (start: GameState, steps: readonly Action[]): GameState => steps.reduce(update, start);
const ALLOWED_KEYS = ["formation", "league", "screen", "xi"] as const;

describe("@US-1 S-006 Sam's way to the squad, the tactics and the Starting XI is unchanged", () => {
  it("Given any club home and formation, when Sam opens the Starting XI and taps Back, then the club home is shown again with the formation kept @regression @property @contract-shape:bounded-change", () => {
    fc.assert(
      fc.property(fc.constantFrom(...clubIds), fc.constantFrom(...FORMATIONS), (clubId, formation) => {
        const after = walk(homeOf(clubId, formation), [{ type: "ViewStartingXI" }, { type: "Back" }]);
        expect(after.screen).toEqual({ kind: "clubHome", clubId });
        expect(after.formation).toBe(formation);
        expect(after.league).toBe(league);
      }),
    );
  });

  it("Given Sam picked Kestrel Northcott for Calder Redfern in 4-3-3, when he visits Squad, Tactics (no change) and the Starting XI and returns home, then the club home keeps formation and picks @regression @contract-shape:bounded-change", () => {
    const clubId = clubIds[0]!;
    const steps: Action[] = [
      { type: "ChooseFormation", formation: "4-4-2" }, // not on the tactics screen: a no-op
      { type: "ViewTactics" }, { type: "ChooseFormation", formation: "4-3-3" }, { type: "Back" },
      { type: "ViewStartingXI" }, { type: "ChooseSlot", slot: 7 }, { type: "PickPlayer", playerIndex: 13 }, { type: "Back" },
      { type: "ViewSquad" }, { type: "Back" }, { type: "ViewTactics" }, { type: "ChooseFormation", formation: "4-3-3" }, { type: "Back" },
    ];
    const after = walk(homeOf(clubId), steps);
    expect(after).toEqual({ ...initialState(league), screen: { kind: "clubHome", clubId }, formation: "4-3-3", xi: NORTHCOTT_FOR_REDFERN });
  });

  it("Given any walk through the existing screens, when Sam taps any of the existing actions in any order, then the state holds only league, screen, formation and the optional xi (nothing about a match is stored) @regression @property @contract-shape:bounded-change", () => {
    const action = fc.oneof(
      fc.constantFrom<Action>({ type: "NewGame" }, { type: "ViewSquad" }, { type: "ViewTactics" }, { type: "ViewStartingXI" }, { type: "Back" }),
      fc.constantFrom(...clubIds).map((clubId): Action => ({ type: "ChooseClub", clubId })),
      fc.constantFrom(...FORMATIONS).map((formation): Action => ({ type: "ChooseFormation", formation })),
      fc.integer({ min: 0, max: 17 }).map((playerIndex): Action => ({ type: "ViewPlayer", playerIndex })),
      fc.integer({ min: 0, max: 10 }).map((slot): Action => ({ type: "ChooseSlot", slot })),
      fc.integer({ min: 0, max: 17 }).map((playerIndex): Action => ({ type: "PickPlayer", playerIndex })),
    );
    fc.assert(
      fc.property(fc.array(action, { maxLength: 40 }), (steps) => {
        const keys = Object.keys(walk(initialState(league), steps));
        expect(keys.filter((key) => !(ALLOWED_KEYS as readonly string[]).includes(key))).toEqual([]);
        expect(keys).toEqual(expect.arrayContaining(["league", "screen", "formation"]));
      }),
    );
  });

  it("Given a new game, when its state is built, then it has exactly a league, a screen and a formation (GameState gains nothing for S-006) @regression @boundary @contract-shape:pure-function", () => {
    expect(Object.keys(initialState(league)).sort()).toEqual(["formation", "league", "screen"]);
  });

  it("Given the club home, when Sam taps Back there, then nothing changes (the very same state) @regression @error @contract-shape:bounded-change", () => {
    const state = homeOf(clubIds[2]!);
    expect(update(state, { type: "Back" })).toBe(state);
  });
});
