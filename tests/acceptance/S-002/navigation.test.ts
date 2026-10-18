// @US-1 (S-002 view my squad)
// CONTRACT_SHAPE: bounded-change
// Outcome anchor: DISCUSS Elevator Pitch (feature-delta.md US-1): taps "Squad", then "Back" to the club's home
import { describe, expect, it } from "vitest";
import { update, type GameState } from "../../../src/app/state";
import { DEFAULT_FORMATION } from "../../../src/domain/formation";
import { generateLeague } from "../../../src/domain/league";

const league = generateLeague(4242);
const clubId = league.clubs[2]!.id;
const onTitle: GameState = { league, screen: { kind: "title" }, formation: DEFAULT_FORMATION };
const onPickClub: GameState = { league, screen: { kind: "pickClub" }, formation: DEFAULT_FORMATION };
const onClubHome: GameState = { league, screen: { kind: "clubHome", clubId }, formation: DEFAULT_FORMATION };
const onSquad: GameState = { league, screen: { kind: "squad", clubId }, formation: DEFAULT_FORMATION };

describe("@US-1 S-002 Sam moves between club home and the squad", () => {
  it("Given a club home, when Sam taps Squad, then that club's squad is shown @walking_skeleton @driving_port", () => {
    expect(update(onClubHome, { type: "ViewSquad" }).screen).toEqual({ kind: "squad", clubId });
  });

  it("Given the squad, when Sam taps Back, then the same club's home is shown @walking_skeleton", () => {
    expect(update(onSquad, { type: "Back" }).screen).toEqual({ kind: "clubHome", clubId });
  });

  it("Given a club home, when Sam views the squad and goes back, then the league is unchanged", () => {
    const back = update(update(onClubHome, { type: "ViewSquad" }), { type: "Back" });
    expect(back).toEqual(onClubHome);
  });

  it.each([
    ["the title", onTitle],
    ["the club list", onPickClub],
    ["the squad", onSquad],
  ])("Given %s, when Sam taps Squad, then nothing changes @error", (_name, state) => {
    expect(update(state, { type: "ViewSquad" })).toEqual(state);
  });

  it.each([
    ["the title", onTitle],
    ["the club list", onPickClub],
    ["a club home", onClubHome],
  ])("Given %s, when Sam taps Back, then nothing changes @error", (_name, state) => {
    expect(update(state, { type: "Back" })).toEqual(state);
  });

  it("Given a club home for an unknown club, when Sam taps Squad, then nothing changes @error", () => {
    const state: GameState = { league, screen: { kind: "clubHome", clubId: "no-such-club" }, formation: DEFAULT_FORMATION };
    expect(update(state, { type: "ViewSquad" })).toEqual(state);
  });

  it("Given a squad for an unknown club, when Sam taps Back, then nothing changes @error", () => {
    const state: GameState = { league, screen: { kind: "squad", clubId: "no-such-club" }, formation: DEFAULT_FORMATION };
    expect(update(state, { type: "Back" })).toEqual(state);
  });

  it("Given a club home, when Sam taps Squad, then the previous state is not mutated", () => {
    const before = JSON.stringify(onClubHome);
    update(onClubHome, { type: "ViewSquad" });
    expect(JSON.stringify(onClubHome)).toBe(before);
  });
});
