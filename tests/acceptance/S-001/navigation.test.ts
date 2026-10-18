// @US-1 (S-001 start a new game and pick a club)
// CONTRACT_SHAPE: bounded-change
// Outcome anchor: DISCUSS Elevator Pitch (feature-delta.md US-1)
import { describe, expect, it } from "vitest";
import { update, type GameState } from "../../../src/app/state";
import { DEFAULT_FORMATION } from "../../../src/domain/formation";
import { generateLeague } from "../../../src/domain/league";

const onTitle = (seed: number): GameState => ({ league: generateLeague(seed), screen: { kind: "title" }, formation: DEFAULT_FORMATION });

describe("@US-1 S-001 Sam moves from the title to a chosen club", () => {
  it("Given the title, when Sam taps New game, then the club list is shown @walking_skeleton @driving_port", () => {
    const next = update(onTitle(4242), { type: "NewGame" });
    expect(next.screen).toEqual({ kind: "pickClub" });
  });

  it("Given the club list, when Sam picks a club, then that club's home is shown @walking_skeleton", () => {
    const picking = update(onTitle(4242), { type: "NewGame" });
    const club = picking.league.clubs[3]!;
    const next = update(picking, { type: "ChooseClub", clubId: club.id });
    expect(next.screen).toEqual({ kind: "clubHome", clubId: club.id });
  });

  it("Given a league, when Sam chooses a club, then the league itself is unchanged", () => {
    const picking = update(onTitle(1), { type: "NewGame" });
    const next = update(picking, { type: "ChooseClub", clubId: picking.league.clubs[0]!.id });
    expect(next.league).toEqual(picking.league);
  });

  it("Given the title, when a club is chosen before New game, then the title stays @error", () => {
    const state = onTitle(1);
    const next = update(state, { type: "ChooseClub", clubId: state.league.clubs[0]!.id });
    expect(next.screen).toEqual({ kind: "title" });
  });

  it("Given the club list, when an unknown club is chosen, then the club list stays @error", () => {
    const picking = update(onTitle(1), { type: "NewGame" });
    const next = update(picking, { type: "ChooseClub", clubId: "no-such-club" });
    expect(next.screen).toEqual({ kind: "pickClub" });
  });
});
