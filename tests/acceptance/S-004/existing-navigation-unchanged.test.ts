// @US-1 (S-004 choose a formation) @regression
// CONTRACT_SHAPE: bounded-change
// Outcome anchor: DISCUSS Notes: adding "Tactics" must keep S-001..S-003 working: club home, "Squad", a player, "Back".
// States are built without naming the S-004 formation field, so this file compiles and passes before and after DELIVER.
import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { update, type Action, type GameState } from "../../../src/app/state";
import { generateLeague } from "../../../src/domain/league";
import { PLAYERS_PER_SQUAD } from "../../../src/domain/squad";

const league = generateLeague(31);
const clubIds = league.clubs.map((club) => club.id);
const homeOf = (clubId: string): GameState => ({ league, screen: { kind: "clubHome", clubId } }) as GameState;

describe("@US-1 S-004 Sam's way to the squad and a player is unchanged", () => {
  it("Given any club home, when Sam walks Squad, a player, Back, Back, then the club home is shown again @regression @property @contract-shape:bounded-change", () => {
    fc.assert(
      fc.property(fc.constantFrom(...clubIds), fc.integer({ min: 0, max: PLAYERS_PER_SQUAD - 1 }), (clubId, row) => {
        const steps: Action[] = [{ type: "ViewSquad" }, { type: "ViewPlayer", playerIndex: row }, { type: "Back" }, { type: "Back" }];
        const start = homeOf(clubId);
        const after = steps.reduce(update, start);
        expect(after.screen).toEqual({ kind: "clubHome", clubId });
        expect(after.league).toBe(league);
      }),
    );
  });

  it("Given a club home, when Sam taps Squad, then that club's squad is shown @regression @driving_port @contract-shape:bounded-change", () => {
    const clubId = clubIds[1]!;
    expect(update(homeOf(clubId), { type: "ViewSquad" }).screen).toEqual({ kind: "squad", clubId });
  });

  it("Given the club home, when Sam taps Back, then nothing happens (there is nowhere further back) @regression @error @contract-shape:bounded-change", () => {
    const state = homeOf(clubIds[0]!);
    expect(update(state, { type: "Back" })).toEqual(state);
  });
});
