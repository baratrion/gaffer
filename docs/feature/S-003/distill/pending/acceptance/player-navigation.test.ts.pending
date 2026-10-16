// @US-1 (S-003 view a player's details)
// CONTRACT_SHAPE: bounded-change
// Outcome anchor: DISCUSS Elevator Pitch (feature-delta.md US-1): from the squad Sam taps a player's row, then "Back"
// to the same squad, then "Back" to the club home.
// Assertions compare the whole GameState (universe = league + screen), the repo's equivalent of a closed universe.
// Destination: tests/acceptance/S-003/player-navigation.test.ts (DELIVER step 02).
import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { update, type GameState } from "../../../src/app/state";
import { generateLeague } from "../../../src/domain/league";
import { PLAYERS_PER_SQUAD } from "../../../src/domain/squad";

const league = generateLeague(4242);
const clubId = league.clubs[2]!.id;
const onTitle: GameState = { league, screen: { kind: "title" } };
const onPickClub: GameState = { league, screen: { kind: "pickClub" } };
const onClubHome: GameState = { league, screen: { kind: "clubHome", clubId } };
const onSquad: GameState = { league, screen: { kind: "squad", clubId } };
const onPlayer = (playerIndex: number, club = clubId): GameState => ({ league, screen: { kind: "player", clubId: club, playerIndex } });
const viewPlayer = (playerIndex: number) => ({ type: "ViewPlayer", playerIndex }) as const;
const BAD_INDEXES = [-1, 18, 100, 1.5, Number.NaN, Number.POSITIVE_INFINITY];

describe("@US-1 S-003 Sam moves between the squad, a player and back", () => {
  it("Given the squad, when Sam taps the first player's row, then that club's player 0 is shown @walking_skeleton @driving_port @contract-shape:bounded-change", () => {
    expect(update(onSquad, viewPlayer(0))).toEqual({ league, screen: { kind: "player", clubId, playerIndex: 0 } });
  });

  it("Given a player's screen, when Sam taps Back, then the same club's squad is shown @walking_skeleton @contract-shape:bounded-change", () => {
    expect(update(onPlayer(7), { type: "Back" })).toEqual({ league, screen: { kind: "squad", clubId } });
  });

  it("Given a player's screen, when Sam taps Back twice, then the same club's home is shown @contract-shape:bounded-change", () => {
    const home = update(update(onPlayer(7), { type: "Back" }), { type: "Back" });
    expect(home).toEqual(onClubHome);
  });

  it("Given a club home, when Sam walks squad, player, back, back, then the state is the original one @contract-shape:bounded-change", () => {
    const steps = [{ type: "ViewSquad" }, viewPlayer(17), { type: "Back" }, { type: "Back" }] as const;
    expect(steps.reduce(update, onClubHome)).toEqual(onClubHome);
  });

  it("Given any of the 18 rows of any club, when Sam taps it and then Back, then the squad of that club is shown @property @contract-shape:bounded-change", () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 7 }), fc.integer({ min: 0, max: PLAYERS_PER_SQUAD - 1 }), (club, index) => {
        const squad: GameState = { league, screen: { kind: "squad", clubId: league.clubs[club]!.id } };
        const player = update(squad, viewPlayer(index));
        expect(player.screen).toEqual({ kind: "player", clubId: league.clubs[club]!.id, playerIndex: index });
        expect(update(player, { type: "Back" })).toEqual(squad);
      }),
    );
  });

  it.each(BAD_INDEXES)("Given the squad, when a player at row %s is requested, then nothing changes @error @contract-shape:bounded-change", (index) => {
    expect(update(onSquad, viewPlayer(index))).toEqual(onSquad);
  });

  it("Given a squad for an unknown club, when Sam taps a row, then nothing changes @error @contract-shape:bounded-change", () => {
    const state: GameState = { league, screen: { kind: "squad", clubId: "no-such-club" } };
    expect(update(state, viewPlayer(0))).toEqual(state);
  });

  it.each([
    ["the title", onTitle],
    ["the club list", onPickClub],
    ["a club home", onClubHome],
    ["a player's screen", onPlayer(3)],
  ])("Given %s, when a player is requested, then nothing changes @error @contract-shape:bounded-change", (_name, state) => {
    expect(update(state, viewPlayer(0))).toEqual(state);
  });

  it.each(BAD_INDEXES)("Given a player's screen at row %s, when Sam taps Back, then nothing changes @error @contract-shape:bounded-change", (index) => {
    expect(update(onPlayer(index), { type: "Back" })).toEqual(onPlayer(index));
  });

  it("Given a player's screen for an unknown club, when Sam taps Back, then nothing changes @error @contract-shape:bounded-change", () => {
    expect(update(onPlayer(3, "no-such-club"), { type: "Back" })).toEqual(onPlayer(3, "no-such-club"));
  });

  it("Given the squad, when Sam taps a row and goes back, then the previous states are not mutated @contract-shape:bounded-change", () => {
    const before = JSON.stringify([onSquad, onPlayer(4)]);
    update(update(onSquad, viewPlayer(4)), { type: "Back" });
    expect(JSON.stringify([onSquad, onPlayer(4)])).toBe(before);
  });
});
