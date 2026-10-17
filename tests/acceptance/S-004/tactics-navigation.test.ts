// @US-1 (S-004 choose a formation): moving to the tactics screen, choosing, and coming back (brief port 12, ADR-0007 (2)).
// CONTRACT_SHAPE: bounded-change (only `formation` or `screen` changes; the whole GameState is compared with toEqual,
// the repo's closed universe: league + screen + formation).
// Outcome anchor: DISCUSS Elevator Pitch: from the club home Sam taps "Tactics", then "4-3-3", and the list "Line-up"
// reads GK, DF, DF, DF, DF, MF, MF, MF, FW, FW, FW; "Back" then "Tactics" again shows "4-3-3" still chosen.
import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { initialState, update, type Action, type GameState, type Screen } from "../../../src/app/state";
import { DEFAULT_FORMATION, FORMATIONS, isFormationId, lineUp, type FormationId } from "../../../src/domain/formation";
import { generateLeague } from "../../../src/domain/league";

const league = generateLeague(4242);
const clubId = league.clubs[2]!.id;
const at = (screen: Screen, formation: FormationId = DEFAULT_FORMATION): GameState => ({ league, formation, screen });
const onTitle = at({ kind: "title" });
const onPickClub = at({ kind: "pickClub" });
const onClubHome = (formation?: FormationId): GameState => at({ kind: "clubHome", clubId }, formation);
const onSquad = at({ kind: "squad", clubId });
const onPlayer = at({ kind: "player", clubId, playerIndex: 3 });
const onTactics = (formation?: FormationId, club = clubId): GameState => at({ kind: "tactics", clubId: club }, formation);
const choose = (formation: string): Action => ({ type: "ChooseFormation", formation: formation as FormationId });
const VIEW: Action = { type: "ViewTactics" };
const BACK: Action = { type: "Back" };
const ALL: readonly FormationId[] = ["4-4-2", "4-3-3", "4-2-3-1"];
const ids = fc.constantFrom<FormationId>(...ALL);

describe("@US-1 S-004 Sam opens the tactics screen, chooses a formation and goes back", () => {
  it("Given a new game, when the game starts, then it is on the title with 4-4-2 chosen @walking_skeleton @driving_port @contract-shape:bounded-change", () => {
    expect(initialState(league)).toEqual({ league, formation: "4-4-2", screen: { kind: "title" } });
  });

  it("Given a club home, when Sam taps Tactics, then that club's tactics screen is shown and nothing else changes @walking_skeleton @driving_port @contract-shape:bounded-change", () => {
    expect(update(onClubHome(), VIEW)).toEqual(onTactics());
    expect(update(onClubHome("4-2-3-1"), VIEW)).toEqual(onTactics("4-2-3-1"));
  });

  it("Given the tactics screen, when Sam taps 4-3-3, then only the chosen formation changes and its line-up reads GK, 4 DF, 3 MF, 3 FW @walking_skeleton @driving_port @contract-shape:bounded-change", () => {
    const next = update(onTactics(), choose("4-3-3"));
    expect(next).toEqual(onTactics("4-3-3"));
    expect([...lineUp(next.formation)]).toEqual(["GK", "DF", "DF", "DF", "DF", "MF", "MF", "MF", "FW", "FW", "FW"]);
  });

  it("Given the tactics screen with any formation chosen, when Sam taps any formation, then only the formation changes @property @contract-shape:bounded-change", () => {
    fc.assert(
      fc.property(ids, ids, fc.integer({ min: 0, max: 7 }), (from, to, club) => {
        const state = onTactics(from, league.clubs[club]!.id);
        expect(update(state, choose(to))).toEqual({ ...state, formation: to });
      }),
    );
  });

  it("Given the formation already chosen, when Sam taps it again, then nothing changes (the very same state) @property @contract-shape:bounded-change", () => {
    fc.assert(
      fc.property(ids, (formation) => {
        const state = onTactics(formation);
        expect(update(state, choose(formation))).toBe(state);
      }),
    );
  });

  it("Given the tactics screen, when Sam taps Back, then the same club's home is shown with the formation kept @contract-shape:bounded-change", () => {
    fc.assert(
      fc.property(ids, (formation) => {
        expect(update(onTactics(formation), BACK)).toEqual(onClubHome(formation));
      }),
    );
  });

  it("Given 4-3-3 chosen, when Sam goes Back, Squad, a player, Back, Back, Tactics, then 4-3-3 is still chosen on the same tactics screen @walking_skeleton @contract-shape:bounded-change", () => {
    const steps: readonly Action[] = [BACK, { type: "ViewSquad" }, { type: "ViewPlayer", playerIndex: 3 }, BACK, BACK, VIEW];
    expect(steps.reduce(update, onTactics("4-3-3"))).toEqual(onTactics("4-3-3"));
  });

  it("Given a new game, when Sam picks a club, opens Tactics and taps 4-3-3, then the line-up reads 1 GK, 4 DF, 3 MF, 3 FW @walking_skeleton @driving_port @contract-shape:bounded-change", () => {
    const steps: readonly Action[] = [{ type: "NewGame" }, { type: "ChooseClub", clubId }, VIEW, choose("4-3-3")];
    const end = steps.reduce(update, initialState(league));
    expect(end).toEqual(onTactics("4-3-3"));
    expect(["GK", "DF", "MF", "FW"].map((p) => lineUp(end.formation).filter((code) => code === p).length)).toEqual([1, 4, 3, 3]);
  });

  it.each([
    ["the title", onTitle],
    ["the club list", onPickClub],
    ["a squad", onSquad],
    ["a player's screen", onPlayer],
    ["the tactics screen", onTactics()],
    ["a club home of an unknown club", at({ kind: "clubHome", clubId: "no-such-club" })],
  ])("Given %s, when Tactics is requested, then nothing changes @error @contract-shape:bounded-change", (_name, state) => {
    expect(update(state, VIEW)).toEqual(state);
  });

  it.each([
    ["the title", onTitle],
    ["the club list", onPickClub],
    ["a club home", onClubHome("4-3-3")],
    ["a squad", onSquad],
    ["a player's screen", onPlayer],
    ["the tactics screen of an unknown club", onTactics("4-4-2", "no-such-club")],
  ])("Given %s, when a formation is chosen, then nothing changes @error @contract-shape:bounded-change", (_name, state) => {
    expect(update(state, choose("4-2-3-1"))).toEqual(state);
  });

  it.each(["3-5-2", "", "4-4-2 ", " 4-3-3", "4-2-3-1\n", "442"])(
    "Given the tactics screen with 4-3-3 chosen, when the unknown formation %j is chosen, then nothing changes @error @contract-shape:bounded-change",
    (unknown) => {
      expect(update(onTactics("4-3-3"), choose(unknown))).toEqual(onTactics("4-3-3"));
    },
  );

  it("Given the tactics screen of an unknown club, when Sam taps Back, then nothing changes @error @contract-shape:bounded-change", () => {
    const state = onTactics("4-3-3", "no-such-club");
    expect(update(state, BACK)).toEqual(state);
  });

  it("Given a title with 4-2-3-1 left over, when a new game starts, then the formation is back to 4-4-2 @error @contract-shape:bounded-change", () => {
    expect(update(at({ kind: "title" }, "4-2-3-1"), { type: "NewGame" })).toEqual(at({ kind: "pickClub" }, "4-4-2"));
  });

  it("Given any run of taps, when they are applied one after another, then the formation is always one of the three known ones @property @contract-shape:bounded-change", () => {
    const actions = fc.oneof(
      fc.constant<Action>({ type: "NewGame" }),
      fc.constantFrom(...league.clubs).map((club): Action => ({ type: "ChooseClub", clubId: club.id })),
      fc.constant<Action>({ type: "ViewSquad" }),
      fc.integer({ min: -1, max: 18 }).map((playerIndex): Action => ({ type: "ViewPlayer", playerIndex })),
      fc.constant<Action>(VIEW),
      fc.oneof(ids, fc.string()).map((f) => choose(f)),
      fc.constant<Action>(BACK),
    );
    fc.assert(
      fc.property(fc.array(actions, { maxLength: 40 }), (taps) => {
        let state = initialState(league);
        for (const tap of taps) {
          state = update(state, tap);
          expect(isFormationId(state.formation)).toBe(true);
        }
        expect(FORMATIONS).toContain(state.formation);
      }),
    );
  });

  it("Given the tactics screen, when Sam chooses and goes back, then the earlier states are not mutated @contract-shape:bounded-change", () => {
    const states = [onClubHome(), onTactics(), onTactics("4-3-3")];
    const before = JSON.stringify(states);
    update(states[0]!, VIEW);
    update(states[1]!, choose("4-3-3"));
    update(states[2]!, BACK);
    update(states[2]!, choose("nonsense"));
    expect(JSON.stringify(states)).toBe(before);
  });
});
