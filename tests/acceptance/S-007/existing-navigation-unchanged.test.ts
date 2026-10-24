// @US-1 @US-2 (S-007 see the league table after my first match) @regression
// CONTRACT_SHAPE: bounded-change
// Outcome anchor: DISCUSS D10 and DoD: adding "Table" and recording the matchday must keep S-001..S-006 working: club home, "Squad", a
// player, "Tactics", a formation, "Starting XI", a slot, "Play match" and "Back", and the first match of a new game is still Matchday 1,
// Netherwold Borough 1–2 Marlbrook Athletic at seed 31. States are built without naming the S-007 `table` screen, the `ViewTable`
// action or `results`, and assertions look at screen, formation, picks and league only (never the whole state), so this file compiles
// and passes before and after DELIVER.
import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { initialState, matchFor, update, type Action, type GameState } from "../../../src/app/state";
import { FORMATIONS } from "../../../src/domain/formation";
import { generateLeague } from "../../../src/domain/league";
import { PLAYERS_PER_SQUAD } from "../../../src/domain/squad";

const league = generateLeague(31);
const clubIds = league.clubs.map((club) => club.id);
const homeOf = (clubId: string, formation = "4-4-2"): GameState =>
  ({ ...initialState(league), screen: { kind: "clubHome", clubId }, formation }) as GameState;
const walk = (start: GameState, steps: readonly Action[]): GameState => steps.reduce(update, start);

describe("@US-1 @US-2 S-007 Sam's way to the squad, the tactics, the Starting XI and the match is unchanged", () => {
  it("Given any club home, when Sam walks Squad, a player, Back, Back, then the club home is shown again with the formation kept @regression @property @contract-shape:bounded-change", () => {
    fc.assert(
      fc.property(fc.constantFrom(...clubIds), fc.integer({ min: 0, max: PLAYERS_PER_SQUAD - 1 }), fc.constantFrom(...FORMATIONS), (clubId, row, formation) => {
        const after = walk(homeOf(clubId, formation), [{ type: "ViewSquad" }, { type: "ViewPlayer", playerIndex: row }, { type: "Back" }, { type: "Back" }]);
        expect(after.screen).toEqual({ kind: "clubHome", clubId });
        expect(after.formation).toBe(formation);
        expect(after.league).toBe(league);
      }),
    );
  });

  it("Given any club home, when Sam opens Tactics, chooses a formation and taps Back, then the club home is shown with that formation @regression @property @contract-shape:bounded-change", () => {
    fc.assert(
      fc.property(fc.constantFrom(...clubIds), fc.constantFrom(...FORMATIONS), (clubId, formation) => {
        const after = walk(homeOf(clubId), [{ type: "ViewTactics" }, { type: "ChooseFormation", formation }, { type: "Back" }]);
        expect(after.screen).toEqual({ kind: "clubHome", clubId });
        expect(after.formation).toBe(formation);
      }),
    );
  });

  it("Given any club home, when Sam opens the Starting XI, taps a slot and Back twice, then the club home is shown again with the formation kept @regression @property @contract-shape:bounded-change", () => {
    fc.assert(
      fc.property(fc.constantFrom(...clubIds), fc.integer({ min: 0, max: 10 }), fc.constantFrom(...FORMATIONS), (clubId, slot, formation) => {
        const after = walk(homeOf(clubId, formation), [{ type: "ViewStartingXI" }, { type: "ChooseSlot", slot }, { type: "Back" }, { type: "Back" }]);
        expect(after.screen).toEqual({ kind: "clubHome", clubId });
        expect(after.formation).toBe(formation);
      }),
    );
  });

  it("Given any club home, when Sam taps Play match and then Back, then the club home is shown again with the formation, the picks and the league as they were @regression @property @driving_port @contract-shape:bounded-change", () => {
    fc.assert(
      fc.property(fc.constantFrom(...clubIds), fc.constantFrom(...FORMATIONS), (clubId, formation) => {
        const start = homeOf(clubId, formation);
        const playing = update(start, { type: "PlayMatch" });
        expect(playing.screen).toEqual({ kind: "match", clubId });
        const after = update(playing, { type: "Back" });
        expect(after.screen).toEqual({ kind: "clubHome", clubId });
        expect(after.formation).toBe(formation);
        expect(after.xi).toBe(start.xi);
        expect(after.league).toBe(league);
      }),
    );
  });

  it("Given Netherwold Borough at seed 31 with untouched tactics, when Sam asks for his match, then it is still matchday 1: Netherwold Borough 1–2 Marlbrook Athletic @regression @walking_skeleton @driving_port @contract-shape:pure-function", () => {
    const view = matchFor(homeOf(clubIds[0]!), clubIds[0]!)!;
    expect(view.matchday).toBe(1);
    expect([view.home.club.name, view.result.homeGoals, view.result.awayGoals, view.away.club.name]).toEqual(["Netherwold Borough", 1, 2, "Marlbrook Athletic"]);
  });

  it("Given a club home, when Sam taps Squad, Tactics, Starting XI or Play match, then that club's screen is shown @regression @driving_port @contract-shape:bounded-change", () => {
    const clubId = clubIds[1]!;
    expect(update(homeOf(clubId), { type: "ViewSquad" }).screen).toEqual({ kind: "squad", clubId });
    expect(update(homeOf(clubId), { type: "ViewTactics" }).screen).toEqual({ kind: "tactics", clubId });
    expect(update(homeOf(clubId), { type: "ViewStartingXI" }).screen).toEqual({ kind: "startingXI", clubId });
    expect(update(homeOf(clubId), { type: "PlayMatch" }).screen).toEqual({ kind: "match", clubId });
  });

  it("Given the club home, when Sam taps Back, then nothing happens (there is nowhere further back) @regression @error @contract-shape:bounded-change", () => {
    const state = homeOf(clubIds[0]!);
    expect(update(state, { type: "Back" })).toEqual(state);
  });
});
