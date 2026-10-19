// @US-1 (S-005 pick my starting XI) @regression
// CONTRACT_SHAPE: bounded-change
// Outcome anchor: DISCUSS Notes and DoD: adding "Starting XI" to the club home must keep S-001..S-004 working: club home,
// "Squad", a player, "Tactics", a formation, "Back". A formation choice with an XI never changed changes only `formation`.
// States are built without naming the S-005 `xi` field, so this file compiles and passes before and after DELIVER.
import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { initialState, update, type Action, type GameState } from "../../../src/app/state";
import { FORMATIONS } from "../../../src/domain/formation";
import { generateLeague } from "../../../src/domain/league";
import { PLAYERS_PER_SQUAD } from "../../../src/domain/squad";

const league = generateLeague(31);
const clubIds = league.clubs.map((club) => club.id);
const homeOf = (clubId: string, formation = "4-4-2"): GameState =>
  ({ ...initialState(league), screen: { kind: "clubHome", clubId }, formation }) as GameState;
const walk = (start: GameState, steps: readonly Action[]): GameState => steps.reduce(update, start);

describe("@US-1 S-005 Sam's way to the squad, a player and the tactics is unchanged", () => {
  it("Given any club home, when Sam walks Squad, a player, Back, Back, then the club home is shown again with the formation kept @regression @property @contract-shape:bounded-change", () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...clubIds),
        fc.integer({ min: 0, max: PLAYERS_PER_SQUAD - 1 }),
        fc.constantFrom(...FORMATIONS),
        (clubId, row, formation) => {
          const steps: Action[] = [{ type: "ViewSquad" }, { type: "ViewPlayer", playerIndex: row }, { type: "Back" }, { type: "Back" }];
          const after = walk(homeOf(clubId, formation), steps);
          expect(after.screen).toEqual({ kind: "clubHome", clubId });
          expect(after.formation).toBe(formation);
          expect(after.league).toBe(league);
        },
      ),
    );
  });

  it("Given any club home, when Sam opens Tactics, chooses another formation and taps Back, then the club home is shown with that formation @regression @property @contract-shape:bounded-change", () => {
    fc.assert(
      fc.property(fc.constantFrom(...clubIds), fc.constantFrom(...FORMATIONS), (clubId, formation) => {
        const after = walk(homeOf(clubId), [{ type: "ViewTactics" }, { type: "ChooseFormation", formation }, { type: "Back" }]);
        expect(after.screen).toEqual({ kind: "clubHome", clubId });
        expect(after.formation).toBe(formation);
      }),
    );
  });

  it("Given a club home, when Sam taps Squad, then that club's squad is shown @regression @driving_port @contract-shape:bounded-change", () => {
    const clubId = clubIds[1]!;
    expect(update(homeOf(clubId), { type: "ViewSquad" }).screen).toEqual({ kind: "squad", clubId });
  });

  it("Given a club home, when Sam taps Tactics, then that club's tactics are shown @regression @driving_port @contract-shape:bounded-change", () => {
    const clubId = clubIds[2]!;
    expect(update(homeOf(clubId), { type: "ViewTactics" }).screen).toEqual({ kind: "tactics", clubId });
  });

  it("Given the tactics screen, when Sam chooses 4-3-3, then only the formation changes @regression @contract-shape:bounded-change", () => {
    const clubId = clubIds[0]!;
    const onTactics = walk(homeOf(clubId), [{ type: "ViewTactics" }]);
    expect(update(onTactics, { type: "ChooseFormation", formation: "4-3-3" })).toEqual({ ...onTactics, formation: "4-3-3" });
  });

  it("Given the club home, when Sam taps Back, then nothing happens (there is nowhere further back) @regression @error @contract-shape:bounded-change", () => {
    const state = homeOf(clubIds[0]!);
    expect(update(state, { type: "Back" })).toEqual(state);
  });
});
