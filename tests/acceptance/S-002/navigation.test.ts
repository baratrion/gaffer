// @US-1 (S-002 view my squad)
// @contract-shape:bounded-change
// Outcome anchor: DISCUSS Elevator Pitch (feature-delta.md US-1)
import { describe, expect, it } from "vitest";
import { update, type GameState } from "../../../src/app/state";
import { generateLeague } from "../../../src/domain/league";

const league = generateLeague(31);
const clubId = league.clubs[0]!.id;
const onClubHome: GameState = { league, screen: { kind: "clubHome", clubId } };
const onSquad: GameState = { league, screen: { kind: "squad", clubId } };

describe("@contract-shape:bounded-change @US-1 S-002 Sam opens the squad from club home and goes back", () => {
  it("Given club home, when Sam taps Squad, then that club's squad screen is shown @driving_port", () => {
    expect(update(onClubHome, { type: "OpenSquad" }).screen).toEqual({ kind: "squad", clubId });
  });

  it("Given the squad screen, when Sam taps Back, then the same club's home is shown @driving_port", () => {
    expect(update(onSquad, { type: "Back" }).screen).toEqual({ kind: "clubHome", clubId });
  });

  it("Given any club, when Sam opens the squad and goes back, then Sam is on the same club home", () => {
    for (const club of league.clubs) {
      const home: GameState = { league, screen: { kind: "clubHome", clubId: club.id } };
      expect(update(update(home, { type: "OpenSquad" }), { type: "Back" })).toEqual(home);
    }
  });

  it("Given club home, when Sam opens the squad, then the league itself is unchanged", () => {
    expect(update(onClubHome, { type: "OpenSquad" }).league).toEqual(league);
  });

  it.each([
    ["title", { kind: "title" }],
    ["pickClub", { kind: "pickClub" }],
    ["squad", { kind: "squad", clubId }],
  ] as const)("Given the %s screen, when Squad is tapped, then nothing changes @error", (_name, screen) => {
    const state: GameState = { league, screen };
    expect(update(state, { type: "OpenSquad" })).toEqual(state);
  });

  it.each([
    ["title", { kind: "title" }],
    ["pickClub", { kind: "pickClub" }],
    ["clubHome", { kind: "clubHome", clubId }],
  ] as const)("Given the %s screen, when Back is tapped, then nothing changes @error", (_name, screen) => {
    const state: GameState = { league, screen };
    expect(update(state, { type: "Back" })).toEqual(state);
  });
});
