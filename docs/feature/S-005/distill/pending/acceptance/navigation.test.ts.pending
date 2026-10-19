// @US-1 @US-2 @US-3 (S-005 pick my starting XI)
// CONTRACT_SHAPE: bounded-change
// Outcome anchor: DISCUSS Elevator Pitch (feature-delta.md US-3): Sam picks Kestrel Northcott, then taps "Back", "Squad",
// "Back", "Tactics", "Back" and "Starting XI", and still sees "MF Kestrel Northcott 6" in the 9th slot; another formation gives
// that formation's automatic XI; "New game" starts from the automatic XI again.
// Universe of the returned state: { league, screen, formation, xi }. No-ops are the very same state object (toBe); changes
// are whole-state toEqual with an explicit expected xi, and Object.hasOwn proves no xi key is added when none was stored.
// Destination: tests/acceptance/S-005/navigation.test.ts (DELIVER step 02).
import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { currentXI, initialState, squadOf, update, type Action, type GameState, type Screen } from "../../../src/app/state";
import { FORMATIONS, lineUp, type FormationId } from "../../../src/domain/formation";
import { generateLeague } from "../../../src/domain/league";
import { automaticXI } from "../../../src/domain/selection";
import { generateSquad, PLAYERS_PER_SQUAD, type Player } from "../../../src/domain/squad";

const league = generateLeague(31);
const clubId = league.clubs[0]!.id;
const otherClubId = league.clubs[3]!.id;
const squad = generateSquad(31, 0);
const GOLDEN_442 = [0, 7, 3, 6, 2, 9, 12, 8, 10, 17, 14] as const;
const GOLDEN_433 = [0, 7, 3, 6, 2, 9, 12, 8, 17, 14, 16] as const;
const PICKED_NORTHCOTT = [0, 7, 3, 6, 2, 9, 12, 8, 13, 17, 14] as const;

const at = (screen: Screen, formation: FormationId = "4-4-2", xi?: readonly number[]): GameState => ({
  ...initialState(league),
  screen,
  formation,
  ...(xi === undefined ? {} : { xi }),
});
const onHome = (formation: FormationId = "4-4-2", xi?: readonly number[]) => at({ kind: "clubHome", clubId }, formation, xi);
const onXI = (formation: FormationId = "4-4-2", xi?: readonly number[]) => at({ kind: "startingXI", clubId }, formation, xi);
const onChoose = (slot: number, formation: FormationId = "4-4-2", xi?: readonly number[]) => at({ kind: "choosePlayer", clubId, slot }, formation, xi);
const view: Action = { type: "ViewStartingXI" };
const slotAction = (slot: number): Action => ({ type: "ChooseSlot", slot });
const pickAction = (playerIndex: number): Action => ({ type: "PickPlayer", playerIndex });
const back: Action = { type: "Back" };
const walk = (start: GameState, steps: readonly Action[]): GameState => steps.reduce(update, start);
const hasXiKey = (state: GameState): boolean => Object.hasOwn(state, "xi");

const deepFreeze = <T>(value: T): T => {
  if (typeof value === "object" && value !== null && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const child of Object.values(value)) deepFreeze(child);
  }
  return value;
};

const OFF_HOME: readonly [string, GameState][] = [
  ["the title", at({ kind: "title" })],
  ["the club list", at({ kind: "pickClub" })],
  ["the squad", at({ kind: "squad", clubId })],
  ["a player", at({ kind: "player", clubId, playerIndex: 3 })],
  ["the tactics", at({ kind: "tactics", clubId })],
  ["the starting XI", onXI()],
  ["the choose screen", onChoose(8)],
  ["an unknown club's home", at({ kind: "clubHome", clubId: "no-such-club" })],
];

describe("@US-1 S-005 Sam opens the starting XI from the club home", () => {
  it("Given a club home, when Sam taps Starting XI, then that club's starting XI is shown and nothing else changes, no xi stored @walking_skeleton @driving_port @contract-shape:bounded-change", () => {
    const next = update(onHome(), view);
    expect(next).toEqual(onXI());
    expect(hasXiKey(next)).toBe(false);
  });

  it("Given a club home that holds picks, when Sam taps Starting XI, then the picks are kept @contract-shape:bounded-change", () => {
    expect(update(onHome("4-4-2", PICKED_NORTHCOTT), view)).toEqual(onXI("4-4-2", PICKED_NORTHCOTT));
  });

  it("Given any club home and formation, when Sam taps Starting XI, then that club's screen opens and the league and formation are the same objects @property @contract-shape:bounded-change", () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 7 }), fc.constantFrom(...FORMATIONS), (club, formation) => {
        const id = league.clubs[club]!.id;
        const next = update(at({ kind: "clubHome", clubId: id }, formation), view);
        expect(next.screen).toEqual({ kind: "startingXI", clubId: id });
        expect(next.league).toBe(league);
        expect(next.formation).toBe(formation);
      }),
    );
  });

  it.each(OFF_HOME)("Given %s, when Sam taps Starting XI, then nothing happens (the very same state) @error @contract-shape:bounded-change", (_name, state) => {
    expect(update(state, view)).toBe(state);
  });
});

describe("@US-2 S-005 Sam taps a slot", () => {
  it.each([0, 5, 8, 10])("Given the starting XI, when Sam taps slot %i, then the choose screen of that slot opens, the XI untouched @driving_port @contract-shape:bounded-change", (slot) => {
    const next = update(onXI(), slotAction(slot));
    expect(next).toEqual(onChoose(slot));
    expect(hasXiKey(next)).toBe(false);
  });

  it("Given the starting XI with picks, when Sam taps a slot, then the picks are kept @contract-shape:bounded-change", () => {
    expect(update(onXI("4-4-2", PICKED_NORTHCOTT), slotAction(8))).toEqual(onChoose(8, "4-4-2", PICKED_NORTHCOTT));
  });

  it.each([-1, 11, 12, 1.5, Number.NaN, Number.POSITIVE_INFINITY, -0.5])("Given the starting XI, when the slot is %s, then nothing happens @error @boundary @contract-shape:bounded-change", (slot) => {
    const state = onXI();
    expect(update(state, slotAction(slot))).toBe(state);
  });

  it.each(OFF_HOME.filter(([name]) => name !== "the starting XI"))("Given %s, when a slot is tapped, then nothing happens (the very same state) @error @contract-shape:bounded-change", (_name, state) => {
    expect(update(state, slotAction(0))).toBe(state);
  });

  it("Given the starting XI of an unknown club, when a slot is tapped, then nothing happens @error @contract-shape:bounded-change", () => {
    const state = at({ kind: "startingXI", clubId: "no-such-club" });
    expect(update(state, slotAction(0))).toBe(state);
  });
});

describe("@US-2 S-005 Sam picks a player into the slot", () => {
  it("Given the automatic XI, when Sam taps MF Dorian Dunmore 7 and then Kestrel Northcott 6, then the starting XI shows Northcott in the 9th slot and the pick is stored @walking_skeleton @driving_port @contract-shape:bounded-change", () => {
    const next = update(onChoose(8), pickAction(13));
    expect(next).toEqual(onXI("4-4-2", PICKED_NORTHCOTT));
    expect(next.xi).toEqual([...PICKED_NORTHCOTT]);
  });

  it("Given the automatic XI, when Sam taps MF Ivo Elderkin 18 and then Joren Dalrymple 16 Starting, then the two swap @driving_port @contract-shape:bounded-change", () => {
    expect(update(onChoose(5), pickAction(12))).toEqual(onXI("4-4-2", [0, 7, 3, 6, 2, 12, 9, 8, 10, 17, 14]));
  });

  it("Given a picked XI, when Sam picks Dunmore back into the 9th slot, then the XI is the automatic XI again (stored, equal in value) @contract-shape:bounded-change", () => {
    const next = update(onChoose(8, "4-4-2", PICKED_NORTHCOTT), pickAction(10));
    expect(next.screen).toEqual({ kind: "startingXI", clubId });
    expect(currentXI(next, squad)).toEqual([...GOLDEN_442]);
  });

  it("Given the automatic XI, when Sam taps the slot's own player, then the starting XI is shown and no xi key is added (still never changed) @boundary @contract-shape:bounded-change", () => {
    const next = update(onChoose(8), pickAction(10));
    expect(next).toEqual(onXI());
    expect(hasXiKey(next)).toBe(false);
  });

  it("Given a picked XI, when Sam taps the slot's own player, then the starting XI is shown and the stored XI is the very same array @boundary @contract-shape:bounded-change", () => {
    const state = onChoose(8, "4-4-2", PICKED_NORTHCOTT);
    const next = update(state, pickAction(13));
    expect(next.screen).toEqual({ kind: "startingXI", clubId });
    expect(next.xi).toBe(state.xi);
  });

  it.each([0, 1, 2, 14, 17])("Given the MF choose screen, when a player of another position (row %i) is tapped, then nothing happens @error @contract-shape:bounded-change", (row) => {
    const state = onChoose(8);
    expect(update(state, pickAction(row))).toBe(state);
  });

  it.each([-1, 18, 1.5, Number.NaN, 100, Number.POSITIVE_INFINITY])("Given the MF choose screen, when the row is %s, then nothing happens @error @boundary @contract-shape:bounded-change", (row) => {
    const state = onChoose(8);
    expect(update(state, pickAction(row))).toBe(state);
  });

  it.each(OFF_HOME.filter(([name]) => name !== "the choose screen"))("Given %s, when a player is tapped, then nothing happens (the very same state) @error @contract-shape:bounded-change", (_name, state) => {
    expect(update(state, pickAction(13))).toBe(state);
  });

  it("Given a choose screen of an unknown club, or a slot outside 0..10, when a player is tapped, then nothing happens @error @contract-shape:bounded-change", () => {
    const unknown = at({ kind: "choosePlayer", clubId: "no-such-club", slot: 8 });
    expect(update(unknown, pickAction(13))).toBe(unknown);
    for (const slot of [-1, 11, 1.5, Number.NaN]) {
      const state = onChoose(slot);
      expect(update(state, pickAction(13))).toBe(state);
      expect(update(state, back)).toBe(state);
    }
  });

  it("Given a club that is not the first, when Sam picks, then that club's own squad decides (rows of its own position) @contract-shape:bounded-change", () => {
    const other = generateSquad(31, 3);
    const rowOfOtherFW = other.findIndex((player) => player.position === "FW");
    const home = at({ kind: "choosePlayer", clubId: otherClubId, slot: 10 });
    const next = update(home, pickAction(rowOfOtherFW));
    expect(next.screen).toEqual({ kind: "startingXI", clubId: otherClubId });
    expect(currentXI(next, other)[10]).toBe(rowOfOtherFW);
  });
});

describe("@US-2 S-005 Back from the new screens", () => {
  it("Given the choose screen, when Sam taps Back, then the starting XI is shown, the XI unchanged @driving_port @contract-shape:bounded-change", () => {
    expect(update(onChoose(8), back)).toEqual(onXI());
    expect(hasXiKey(update(onChoose(8), back))).toBe(false);
    expect(update(onChoose(8, "4-3-3", GOLDEN_433), back)).toEqual(onXI("4-3-3", GOLDEN_433));
  });

  it("Given the starting XI, when Sam taps Back, then that club's home is shown with the picks and formation kept @driving_port @contract-shape:bounded-change", () => {
    expect(update(onXI("4-3-3", PICKED_NORTHCOTT), back)).toEqual(onHome("4-3-3", PICKED_NORTHCOTT));
  });

  it("Given the starting XI or the choose screen of an unknown club, when Sam taps Back, then nothing happens @error @contract-shape:bounded-change", () => {
    for (const screen of [{ kind: "startingXI", clubId: "no-such-club" }, { kind: "choosePlayer", clubId: "no-such-club", slot: 3 }] as const) {
      const state = at(screen);
      expect(update(state, back)).toBe(state);
    }
  });
});

describe("@US-3 S-005 Sam looks around and the XI is kept", () => {
  const picked = walk(at({ kind: "title" }), [
    { type: "NewGame" },
    { type: "ChooseClub", clubId },
    view,
    slotAction(8),
    pickAction(13),
  ]);

  it("Given a new game from the title, when Sam picks Kestrel Northcott into the 9th slot, then the starting XI shows it @walking_skeleton @driving_port @contract-shape:bounded-change", () => {
    expect(picked.screen).toEqual({ kind: "startingXI", clubId });
    expect(currentXI(picked, squad)).toEqual([...PICKED_NORTHCOTT]);
  });

  it("Given the pick, when Sam walks Back, Squad, Calder Redfern's row, Back, Back, Tactics, 4-4-2 (already checked), Back and Starting XI, then the XI is exactly as before @walking_skeleton @contract-shape:bounded-change", () => {
    const after = walk(picked, [
      back, { type: "ViewSquad" }, { type: "ViewPlayer", playerIndex: 8 }, back, back,
      { type: "ViewTactics" }, { type: "ChooseFormation", formation: "4-4-2" }, back, view,
    ]);
    expect(after).toEqual(picked);
    expect(after.xi).toBe(picked.xi);
  });

  it("Given the pick, when Sam opens a slot, taps Back, then the XI is exactly as before @contract-shape:bounded-change", () => {
    expect(walk(picked, [slotAction(2), back])).toEqual(picked);
  });

  it("Given the pick, when Sam walks Back, Tactics, 4-3-3, Back and Starting XI, then the picks are dropped and the automatic 4-3-3 XI is shown @walking_skeleton @driving_port @contract-shape:bounded-change", () => {
    const after = walk(picked, [back, { type: "ViewTactics" }, { type: "ChooseFormation", formation: "4-3-3" }, back, view]);
    expect(after.screen).toEqual({ kind: "startingXI", clubId });
    expect(after.formation).toBe("4-3-3");
    expect(after.xi).toBeUndefined();
    expect(currentXI(after, squad)).toEqual([...GOLDEN_433]);
  });

  it("Given a picked XI, when any other formation is chosen, then the stored XI is dropped (xi is undefined) and the formation is the new one @property @contract-shape:bounded-change", () => {
    fc.assert(
      fc.property(fc.constantFrom(...FORMATIONS), fc.constantFrom(...FORMATIONS), (from, to) => {
        fc.pre(from !== to);
        const start = at({ kind: "tactics", clubId }, from, automaticXI(squad, from));
        const next = update(start, { type: "ChooseFormation", formation: to });
        expect(next).toEqual({ ...start, formation: to, xi: undefined });
        expect(next.xi === undefined).toBe(true);
        expect(currentXI(next, squad)).toEqual(automaticXI(squad, to));
      }),
    );
  });

  it("Given a picked XI, when Sam taps the formation already chosen, then the very same state comes back and the picks stay @boundary @contract-shape:bounded-change", () => {
    const start = at({ kind: "tactics", clubId }, "4-4-2", PICKED_NORTHCOTT);
    expect(update(start, { type: "ChooseFormation", formation: "4-4-2" })).toBe(start);
  });

  it.each(["3-5-2", "", "4-3-3 ", "constructor", "__proto__"])("Given a picked XI, when the formation text is %j, then nothing happens and the picks stay @error @contract-shape:bounded-change", (text) => {
    const start = at({ kind: "tactics", clubId }, "4-4-2", PICKED_NORTHCOTT);
    expect(update(start, { type: "ChooseFormation", formation: text })).toBe(start);
  });

  it("Given an XI never changed, when Sam chooses another formation, then exactly the formation changes and no xi key appears (S-004's rule holds) @driving_port @contract-shape:bounded-change", () => {
    const start = at({ kind: "tactics", clubId }, "4-4-2");
    const next = update(start, { type: "ChooseFormation", formation: "4-3-3" });
    expect(next).toEqual({ ...start, formation: "4-3-3" });
    expect(hasXiKey(next)).toBe(false);
  });

  it("Given a picked XI, when a formation is chosen off the tactics screen or for an unknown club, then nothing happens and the picks stay @error @contract-shape:bounded-change", () => {
    for (const screen of [{ kind: "clubHome", clubId }, { kind: "startingXI", clubId }, { kind: "tactics", clubId: "no-such-club" }] as const) {
      const state = at(screen, "4-4-2", PICKED_NORTHCOTT);
      expect(update(state, { type: "ChooseFormation", formation: "4-3-3" })).toBe(state);
    }
  });
});

describe("@US-3 S-005 a new game starts from the automatic XI, and one session holds one club", () => {
  it("Given the title that still holds picks, when Sam taps New game, then the picks are dropped (xi is undefined) and the formation is 4-4-2 @driving_port @contract-shape:bounded-change", () => {
    const next = update(at({ kind: "title" }, "4-3-3", PICKED_NORTHCOTT), { type: "NewGame" });
    expect(next).toEqual({ ...initialState(league), screen: { kind: "pickClub" }, formation: "4-4-2" });
    expect(next.xi).toBeUndefined();
  });

  it("Given a new title with no picks, when Sam taps New game, then no xi key appears @boundary @contract-shape:bounded-change", () => {
    expect(hasXiKey(update(at({ kind: "title" }), { type: "NewGame" }))).toBe(false);
  });

  it("Given any screen but the title holding picks, when New game is tapped, then nothing happens and the picks stay @error @contract-shape:bounded-change", () => {
    for (const [, state] of OFF_HOME) {
      if (state.screen.kind === "title") continue;
      const withPicks: GameState = { ...state, xi: PICKED_NORTHCOTT };
      expect(update(withPicks, { type: "NewGame" })).toBe(withPicks);
    }
  });

  it("Given any screen but the club list, when a club is chosen, then nothing happens (so a club is never swapped under stored picks) @error @contract-shape:bounded-change", () => {
    for (const [, state] of OFF_HOME) {
      if (state.screen.kind === "pickClub") continue;
      const withPicks: GameState = { ...state, xi: PICKED_NORTHCOTT };
      expect(update(withPicks, { type: "ChooseClub", clubId: otherClubId })).toBe(withPicks);
    }
  });
});

describe("@US-2 S-005 the effective XI and the squad of a club", () => {
  it("Given no stored picks, when the effective XI is read, then it is the automatic XI of the formation, for every formation @driving_port @contract-shape:pure-function", () => {
    expect(currentXI(onHome(), squad)).toEqual([...GOLDEN_442]);
    expect(currentXI(onHome("4-3-3"), squad)).toEqual([...GOLDEN_433]);
    for (const formation of FORMATIONS) expect(currentXI(onHome(formation), squad)).toEqual(automaticXI(squad, formation));
  });

  it("Given stored picks, when the effective XI is read, then it is the stored XI itself @contract-shape:pure-function", () => {
    const state = onHome("4-4-2", PICKED_NORTHCOTT);
    expect(currentXI(state, squad)).toBe(state.xi);
  });

  it("Given each of the 8 clubs, when its squad is asked for, then it is generateSquad(seed, club position) @driving_port @contract-shape:pure-function", () => {
    league.clubs.forEach((club, index) => {
      expect(squadOf(league, club.id)).toEqual(generateSquad(league.seed, index));
    });
  });

  it.each(["no-such-club", "", "__proto__"])("Given the club %j that is not in the league, when its squad is asked for, then there is none @error @contract-shape:pure-function", (id) => {
    expect(squadOf(league, id)).toBeUndefined();
  });
});

describe("@US-2 S-005 no sequence of taps leaves a gap or a duplicate, and nothing is mutated", () => {
  const rows = fc.integer({ min: -2, max: PLAYERS_PER_SQUAD + 2 });
  const anyAction: fc.Arbitrary<Action> = fc.oneof(
    fc.constant<Action>({ type: "NewGame" }),
    fc.constantFrom(...league.clubs.map((club) => club.id), "no-such-club").map((id): Action => ({ type: "ChooseClub", clubId: id })),
    fc.constant<Action>({ type: "ViewSquad" }),
    rows.map((playerIndex): Action => ({ type: "ViewPlayer", playerIndex })),
    fc.constant<Action>({ type: "ViewTactics" }),
    fc.constantFrom(...FORMATIONS, "3-5-2").map((formation): Action => ({ type: "ChooseFormation", formation })),
    fc.constant<Action>(view),
    fc.integer({ min: -2, max: 12 }).map(slotAction),
    rows.map(pickAction),
    fc.constant<Action>(back),
  );
  const validFor = (state: GameState, players: readonly Player[]): boolean => {
    const xi = state.xi;
    return (
      xi === undefined ||
      (xi.length === 11 && new Set(xi).size === 11 && xi.every((index, slot) => players[index]?.position === lineUp(state.formation)[slot]))
    );
  };

  it("Given any seed and any run of taps from the title, then a stored XI always has 11 different players of the right positions, and the shown XI is valid on the starting XI and choose screens @property @contract-shape:bounded-change", () => {
    fc.assert(
      fc.property(fc.integer({ min: -(2 ** 31), max: 2 ** 31 - 1 }), fc.array(anyAction, { maxLength: 40 }), (seed, actions) => {
        let state = initialState(generateLeague(seed));
        for (const action of actions) {
          state = update(state, action);
          if ("clubId" in state.screen) {
            const players = squadOf(state.league, state.screen.clubId)!;
            expect(validFor(state, players)).toBe(true);
            if (state.screen.kind === "startingXI" || state.screen.kind === "choosePlayer") {
              const xi = currentXI(state, players);
              expect(xi.length).toBe(11);
              expect(new Set(xi).size).toBe(11);
            }
          } else {
            expect(state.xi).toBeUndefined();
          }
        }
      }),
    );
  });

  it("Given the same taps twice, then the same state comes out (no ambient randomness or clock) @property @contract-shape:bounded-change", () => {
    fc.assert(
      fc.property(fc.array(anyAction, { maxLength: 30 }), (actions) => {
        expect(walk(initialState(league), actions)).toEqual(walk(initialState(league), actions));
      }),
    );
  });

  it("Given a deeply frozen state, when any action is taken (including bad ones), then it never throws or mutates @property @contract-shape:bounded-change", () => {
    fc.assert(
      fc.property(fc.array(anyAction, { maxLength: 25 }), (actions) => {
        let state = deepFreeze(initialState(league));
        for (const action of actions) state = deepFreeze(update(state, action));
        expect(state.league).toBe(league);
      }),
    );
  });

  it("Given a picked XI in a frozen state, when Sam picks again, then the stored array is not changed @contract-shape:bounded-change", () => {
    const state = deepFreeze(onChoose(5, "4-4-2", [...PICKED_NORTHCOTT]));
    const next = update(state, pickAction(12));
    expect(state.xi).toEqual([...PICKED_NORTHCOTT]);
    expect(next.xi).toEqual([0, 7, 3, 6, 2, 12, 9, 8, 13, 17, 14]);
  });
});
