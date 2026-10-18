// @US-1 (S-004 choose a formation)
// CONTRACT_SHAPE: bounded-change
// Outcome anchor: DISCUSS Elevator Pitch (feature-delta.md US-1): from the club home Sam taps "Tactics", taps "4-3-3",
// taps "Back"; after "Squad", "Back", "Tactics" the choice is still there. Every new game starts at 4-4-2.
// Assertions compare the whole GameState (universe = league + screen + formation), a closed universe.
// Destination: tests/acceptance/S-004/tactics-navigation.test.ts (DELIVER step 02).
import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { initialState, update, type Action, type GameState, type Screen } from "../../../src/app/state";
import { DEFAULT_FORMATION, FORMATIONS, lineUp, type FormationId } from "../../../src/domain/formation";
import { generateLeague } from "../../../src/domain/league";

const league = generateLeague(4242);
const clubId = league.clubs[2]!.id;
const at = (screen: Screen, formation: FormationId = DEFAULT_FORMATION): GameState => ({ ...initialState(league), screen, formation });
const onTitle = at({ kind: "title" });
const onPickClub = at({ kind: "pickClub" });
const onClubHome = at({ kind: "clubHome", clubId });
const onSquad = at({ kind: "squad", clubId });
const onPlayer = at({ kind: "player", clubId, playerIndex: 3 });
const onTactics = (formation: FormationId = DEFAULT_FORMATION, club = clubId): GameState => at({ kind: "tactics", clubId: club }, formation);
const choose = (formation: FormationId): Action => ({ type: "ChooseFormation", formation });
const viewTactics: Action = { type: "ViewTactics" };
const anyFormation = fc.constantFrom(...FORMATIONS);
const UNKNOWN_FORMATIONS = ["3-5-2", "", "4-4-2 ", " 4-3-3", "4-2-3-1\n", "constructor", "__proto__"];

const deepFreeze = <T>(value: T): T => {
  if (typeof value === "object" && value !== null && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const child of Object.values(value)) deepFreeze(child);
  }
  return value;
};

describe("@US-1 S-004 Sam opens the tactics, chooses a formation and comes back", () => {
  describe("Given a new game", () => {
    it("then it starts on the title screen with 4-4-2 chosen @driving_port @contract-shape:bounded-change", () => {
      expect(initialState(league)).toEqual({ league, screen: { kind: "title" }, formation: "4-4-2" });
    });

    it("then New game from the title keeps the 4-4-2 and goes to the club list @contract-shape:bounded-change", () => {
      expect(update(onTitle, { type: "NewGame" })).toEqual(at({ kind: "pickClub" }, "4-4-2"));
    });

    it.each(["4-3-3", "4-2-3-1"] as const)(
      "then New game from a title that still holds %s starts over at 4-4-2 @contract-shape:bounded-change",
      (formation) => {
        expect(update(at({ kind: "title" }, formation), { type: "NewGame" })).toEqual(at({ kind: "pickClub" }, "4-4-2"));
      },
    );

    it("then New game anywhere but the title changes nothing, so a choice is not reset by it @error @contract-shape:bounded-change", () => {
      for (const state of [onPickClub, onClubHome, onSquad, onPlayer, onTactics("4-3-3")]) {
        const chosen = { ...state, formation: "4-3-3" as const };
        expect(update(chosen, { type: "NewGame" })).toEqual(chosen);
      }
    });
  });

  describe("Given a club home", () => {
    it("when Sam taps Tactics, then that club's tactics screen is shown and the formation is unchanged @walking_skeleton @driving_port @contract-shape:bounded-change", () => {
      expect(update(onClubHome, viewTactics)).toEqual(onTactics("4-4-2"));
    });

    it("when Sam taps Tactics on any club, then that club's tactics screen is shown, whatever formation is held @property @contract-shape:bounded-change", () => {
      fc.assert(
        fc.property(fc.integer({ min: 0, max: league.clubs.length - 1 }), anyFormation, (club, formation) => {
          const id = league.clubs[club]!.id;
          const home = at({ kind: "clubHome", clubId: id }, formation);
          expect(update(home, viewTactics)).toEqual(at({ kind: "tactics", clubId: id }, formation));
        }),
      );
    });
  });

  describe("Given the tactics screen", () => {
    it("when Sam taps 4-3-3, then only the formation changes and the screen stays Tactics @walking_skeleton @driving_port @contract-shape:bounded-change", () => {
      expect(update(onTactics("4-4-2"), choose("4-3-3"))).toEqual(onTactics("4-3-3"));
    });

    it("when Sam taps any formation from any formation, then exactly that one is held, the league and screen untouched @property @contract-shape:bounded-change", () => {
      fc.assert(
        fc.property(anyFormation, anyFormation, (from, to) => {
          const before = onTactics(from);
          const after = update(before, choose(to));
          expect(after).toEqual(onTactics(to));
          expect(after.league).toBe(before.league);
          expect(after.screen).toBe(before.screen);
        }),
      );
    });

    it.each(FORMATIONS)("when Sam taps the formation already chosen (%s), then the very same state comes back @boundary @contract-shape:bounded-change", (formation) => {
      const state = onTactics(formation);
      expect(update(state, choose(formation))).toBe(state);
    });

    it("when Sam taps Back, then the same club's home is shown with the chosen formation kept @walking_skeleton @contract-shape:bounded-change", () => {
      expect(update(onTactics("4-3-3"), { type: "Back" })).toEqual(at({ kind: "clubHome", clubId }, "4-3-3"));
    });

    it("when the league has a different seed, then the same choice gives the same line-up @property @contract-shape:bounded-change", () => {
      fc.assert(
        fc.property(fc.integer({ min: -1_000_000, max: 1_000_000 }), anyFormation, (seed, formation) => {
          const other = generateLeague(seed);
          const state: GameState = { ...initialState(other), screen: { kind: "tactics", clubId: other.clubs[0]!.id } };
          expect([...lineUp(update(state, choose(formation)).formation)]).toEqual([...lineUp(formation)]);
        }),
      );
    });
  });

  describe("Given Sam has chosen a formation", () => {
    it("when Sam goes Back, to Squad, to a player, Back, Back and Tactics again, then the same formation is held @walking_skeleton @property @contract-shape:bounded-change", () => {
      fc.assert(
        fc.property(anyFormation, fc.integer({ min: 0, max: 17 }), (formation, row) => {
          const steps: Action[] = [
            choose(formation),
            { type: "Back" },
            { type: "ViewSquad" },
            { type: "ViewPlayer", playerIndex: row },
            { type: "Back" },
            { type: "Back" },
            viewTactics,
          ];
          expect(steps.reduce(update, onTactics("4-4-2"))).toEqual(onTactics(formation));
        }),
      );
    });

    it("when Sam taps Back, Squad, Back, Tactics, then 4-3-3 is still held (the DISCUSS example) @contract-shape:bounded-change", () => {
      const steps: Action[] = [choose("4-3-3"), { type: "Back" }, { type: "ViewSquad" }, { type: "Back" }, viewTactics];
      expect(steps.reduce(update, onTactics("4-4-2"))).toEqual(onTactics("4-3-3"));
    });

    it("when the whole walk from the title is made, then each screen is the expected one in turn @contract-shape:bounded-change", () => {
      const walk: [Action, GameState][] = [
        [{ type: "NewGame" }, at({ kind: "pickClub" })],
        [{ type: "ChooseClub", clubId }, onClubHome],
        [viewTactics, onTactics("4-4-2")],
        [choose("4-2-3-1"), onTactics("4-2-3-1")],
        [{ type: "Back" }, at({ kind: "clubHome", clubId }, "4-2-3-1")],
      ];
      let state = onTitle;
      for (const [action, expected] of walk) {
        state = update(state, action);
        expect(state).toEqual(expected);
      }
    });
  });

  describe("Given a screen where Tactics cannot be opened", () => {
    it.each([
      ["the title", onTitle],
      ["the club list", onPickClub],
      ["a squad", onSquad],
      ["a player's screen", onPlayer],
      ["the tactics screen itself", onTactics("4-3-3")],
      ["a club home of an unknown club", at({ kind: "clubHome", clubId: "no-such-club" })],
    ])("when Sam taps Tactics on %s, then nothing changes @error @contract-shape:bounded-change", (_name, state) => {
      expect(update(state, viewTactics)).toEqual(state);
    });
  });

  describe("Given a choice that cannot be made", () => {
    it.each([
      ["the title", onTitle],
      ["the club list", onPickClub],
      ["a club home", onClubHome],
      ["a squad", onSquad],
      ["a player's screen", onPlayer],
      ["the tactics screen of an unknown club", onTactics("4-4-2", "no-such-club")],
    ])("when a formation is chosen on %s, then nothing changes @error @contract-shape:bounded-change", (_name, state) => {
      for (const formation of FORMATIONS) expect(update(state, choose(formation))).toEqual(state);
    });

    it.each(UNKNOWN_FORMATIONS)("when the formation %j is chosen on the tactics screen, then nothing changes @error @contract-shape:bounded-change", (formation) => {
      const state = onTactics("4-3-3");
      expect(update(state, choose(formation as FormationId))).toEqual(state);
    });

    it("when any text that is not a formation is chosen, then nothing changes @property @error @contract-shape:bounded-change", () => {
      fc.assert(
        fc.property(
          fc.string().filter((text) => !(FORMATIONS as readonly string[]).includes(text)),
          anyFormation,
          (text, held) => {
            const state = onTactics(held);
            expect(update(state, choose(text as FormationId))).toEqual(state);
          },
        ),
      );
    });

    it("when Sam taps Back on the tactics screen of an unknown club, then nothing changes @error @contract-shape:bounded-change", () => {
      const state = onTactics("4-3-3", "no-such-club");
      expect(update(state, { type: "Back" })).toEqual(state);
    });

    it("when other actions arrive on the tactics screen, then nothing changes @error @contract-shape:bounded-change", () => {
      const state = onTactics("4-3-3");
      const others: Action[] = [{ type: "NewGame" }, { type: "ChooseClub", clubId }, { type: "ViewSquad" }, { type: "ViewPlayer", playerIndex: 0 }];
      for (const action of others) expect(update(state, action)).toEqual(state);
    });
  });

  describe("Given states that must not be changed behind Sam's back", () => {
    it("when Sam opens Tactics, chooses and goes Back, then the earlier states are not mutated @contract-shape:bounded-change", () => {
      const states = [onClubHome, onTactics("4-4-2"), onTactics("4-3-3")].map(deepFreeze);
      const before = JSON.stringify(states);
      update(update(update(states[0]!, viewTactics), choose("4-3-3")), { type: "Back" });
      update(states[1]!, choose("4-2-3-1"));
      update(states[2]!, choose("3-5-2" as FormationId));
      expect(JSON.stringify(states)).toBe(before);
    });
  });

  describe("Given the S-001 to S-003 journey with a formation held", () => {
    it("when Sam walks squad, player, back, back, then the formation is untouched and the screens are the S-003 ones @contract-shape:bounded-change", () => {
      const start = at({ kind: "clubHome", clubId }, "4-2-3-1");
      const steps: Action[] = [{ type: "ViewSquad" }, { type: "ViewPlayer", playerIndex: 17 }, { type: "Back" }, { type: "Back" }];
      expect(steps.reduce(update, start)).toEqual(start);
    });
  });
});
