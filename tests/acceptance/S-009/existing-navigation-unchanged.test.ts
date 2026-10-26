// @US-1 @US-2 (S-009 see how my season ended) @regression
// CONTRACT_SHAPE: bounded-change
// Outcome anchor: DISCUSS D1, D3, D4, D8 and DoD: giving the club home an "End of season" button and widening New game for "Play again" must keep
// S-001..S-008 working. Before matchday 14 is played the season is not over (the 14th Play match is still matchday 14 and the 13th Back leaves a
// club home with a Play match to tap); "New game" stays valid from the title only among the screens that exist today and gives the fresh game
// "Play again" must equal; Back, Table, Squad, Tactics and Starting XI are unchanged on a finished season; a Play match after matchday 14 is a
// no-op; nothing new is stored. States are built with the actions that exist today and nothing names ViewSeasonEnd or seasonEnd, so this file
// compiles and passes before and after DELIVER. The one held-out line it does not pin is the new behaviour (distill/pending).
import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { initialState, matchFor, nextMatchday, standingsOf, update, type Action, type GameState, type Screen } from "../../../src/app/state";
import { FORMATIONS } from "../../../src/domain/formation";
import { generateLeague } from "../../../src/domain/league";

const league = generateLeague(31);
const clubIds = league.clubs.map((club) => club.id);
const play: Action = { type: "PlayMatch" };
const back: Action = { type: "Back" };
const table: Action = { type: "ViewTable" };
const newGame: Action = { type: "NewGame" };
const walk = (start: GameState, steps: readonly Action[]): GameState => steps.reduce(update, start);
const homeOf = (clubId: string, world = league): GameState => walk(initialState(world), [newGame, { type: "ChooseClub", clubId }]);
/** The club home after `matchdays` times Play match and Back. */
const afterMatchdays = (start: GameState, matchdays: number): GameState => walk(start, Array.from({ length: matchdays }, () => [play, back]).flat());
const KEYS = ["league", "screen", "formation", "xi", "results"];

describe("@US-1 S-009 the season is not over until matchday 14 is played", () => {
  it("Given Netherwold Borough at seed 31 with 13 matches played, when Sam taps Play match and Back, then the 14th match is matchday 14 and nothing else changed @regression @walking_skeleton @boundary @driving_port @contract-shape:bounded-change", () => {
    const thirteen = afterMatchdays(homeOf(clubIds[0]!), 13);
    expect(thirteen.screen).toEqual({ kind: "clubHome", clubId: clubIds[0] });
    expect(nextMatchday(thirteen)).toBe(14);
    expect(thirteen.results).toHaveLength(52);
    const fourteenth = update(thirteen, play);
    expect(fourteenth.screen).toEqual({ kind: "match", clubId: clubIds[0] });
    expect(matchFor(fourteenth, clubIds[0]!)!.matchday).toBe(14);
    expect(fourteenth.results).toHaveLength(56);
    const over = update(fourteenth, back);
    expect(over.screen).toEqual({ kind: "clubHome", clubId: clubIds[0] });
    expect(nextMatchday(over)).toBeUndefined();
  });

  it("Given any boundary from 0 to 14 matches played, when the next matchday is read, then it is the one after the last played, and only 14 played ends the season @regression @boundary @contract-shape:pure-function", () => {
    const start = homeOf(clubIds[0]!);
    const next = Array.from({ length: 15 }, (_, played) => nextMatchday(afterMatchdays(start, played)));
    expect(next).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, undefined]);
  });

  it("Given a finished season, when Sam taps Play match on the club home, then nothing happens (the very same state), however often @regression @error @boundary @contract-shape:bounded-change", () => {
    const over = afterMatchdays(homeOf(clubIds[0]!), 14);
    expect(update(over, play)).toBe(over);
    expect(update(update(over, play), play)).toBe(over);
  });

  it("Given a finished season, when Sam taps Table, Squad, Tactics or Starting XI and comes Back, then each opens and returns to the club home with the 56 results untouched and every row at P 14 @regression @boundary @driving_port @contract-shape:bounded-change", () => {
    const over = afterMatchdays(homeOf(clubIds[0]!), 14);
    expect(standingsOf(update(over, table)).every((row) => row.played === 14)).toBe(true);
    for (const open of [table, { type: "ViewSquad" }, { type: "ViewTactics" }, { type: "ViewStartingXI" }] as const) {
      const opened = update(over, open);
      expect(opened.screen.kind).not.toBe("clubHome");
      expect(opened.results).toBe(over.results);
      expect(update(opened, back)).toEqual(over);
    }
  });
});

describe("@US-2 S-009 New game is the fresh game that Play again must equal", () => {
  const fresh = update(initialState(league), newGame);

  it("Given the title, when Sam taps New game, then the pick-a-club screen shows with 4-4-2, no picks and no results, and the same league @regression @walking_skeleton @boundary @driving_port @contract-shape:bounded-change", () => {
    expect(fresh).toEqual({ league, screen: { kind: "pickClub" }, formation: "4-4-2", xi: undefined, results: undefined });
    expect(fresh.league).toBe(league);
  });

  it("Given a finished season with 4-3-3 and a pick, when the title is shown with a finished season in memory and New game is tapped, then the game is the same fresh game @regression @boundary @contract-shape:bounded-change", () => {
    const tuned = walk(homeOf(clubIds[0]!), [{ type: "ViewTactics" }, { type: "ChooseFormation", formation: "4-3-3" }, back, { type: "ViewStartingXI" }, { type: "ChooseSlot", slot: 7 }, { type: "PickPlayer", playerIndex: 13 }, back]);
    const over = afterMatchdays(tuned, 14);
    expect(over.formation).toBe("4-3-3");
    expect(over.xi).toBeDefined();
    expect(update({ ...over, screen: { kind: "title" } }, newGame)).toEqual(fresh);
  });

  it("Given every screen that exists today except the title, when New game is tapped, then nothing happens (the very same state) @regression @error @boundary @contract-shape:bounded-change", () => {
    const over = afterMatchdays(homeOf(clubIds[0]!), 14);
    const id = clubIds[0]!;
    const screens: Screen[] = [
      { kind: "pickClub" }, { kind: "clubHome", clubId: id }, { kind: "squad", clubId: id }, { kind: "player", clubId: id, playerIndex: 3 }, { kind: "tactics", clubId: id },
      { kind: "startingXI", clubId: id }, { kind: "choosePlayer", clubId: id, slot: 2 }, { kind: "match", clubId: id }, { kind: "table", clubId: id },
      { kind: "clubHome", clubId: "club-99" },
    ];
    for (const screen of screens) {
      for (const state of [{ ...over, screen }, { ...fresh, screen }]) expect(update(state, newGame), `New game on ${screen.kind}`).toBe(state);
    }
  });

  it("Given any seed, any of the 8 clubs and any formation, when a season is played, then the state holds only league, screen, formation, xi and results (nothing is stored for the season being over) @regression @property @boundary @contract-shape:bounded-change", () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 40 }), fc.integer({ min: 0, max: 7 }), fc.constantFrom(...FORMATIONS), (seed, club, formation) => {
        const world = generateLeague(seed);
        const start = walk(homeOf(world.clubs[club]!.id, world), [{ type: "ViewTactics" }, { type: "ChooseFormation", formation }, back]);
        for (const state of [start, afterMatchdays(start, 7), afterMatchdays(start, 13), afterMatchdays(start, 14), update(afterMatchdays(start, 14), table)]) {
          expect(Object.keys(state).filter((key) => !KEYS.includes(key))).toEqual([]);
        }
      }),
      { numRuns: 25 },
    );
  });
});

describe("@US-1 @US-2 S-009 a finished season is only ever changed by the actions that exist today", () => {
  it("Given a finished season, when Sam taps any run of up to 40 existing actions, then the game never throws and the 56 results stay the very same array @regression @property @error @contract-shape:bounded-change", () => {
    const clubId = clubIds[3]!;
    const over = afterMatchdays(homeOf(clubId), 14);
    const anyAction: fc.Arbitrary<Action> = fc.oneof(
      fc.constant<Action>(play), fc.constant<Action>(back), fc.constant<Action>(table), fc.constant<Action>({ type: "ViewSquad" }),
      fc.constant<Action>({ type: "ViewTactics" }), fc.constant<Action>({ type: "ViewStartingXI" }), fc.constant<Action>(newGame),
      fc.constantFrom(...FORMATIONS, "5-3-2").map((formation): Action => ({ type: "ChooseFormation", formation })),
      fc.integer({ min: -2, max: 19 }).map((playerIndex): Action => ({ type: "PickPlayer", playerIndex })),
      fc.integer({ min: -2, max: 12 }).map((slot): Action => ({ type: "ChooseSlot", slot })),
      fc.integer({ min: -2, max: 19 }).map((playerIndex): Action => ({ type: "ViewPlayer", playerIndex })),
    );
    fc.assert(
      fc.property(fc.array(anyAction, { maxLength: 40 }), (actions) => {
        let state = over;
        for (const action of actions) {
          state = update(state, action);
          expect(state.results).toBe(over.results);
          expect(nextMatchday(state)).toBeUndefined();
          expect(standingsOf(state).every((row) => row.played === 14)).toBe(true);
        }
      }),
      { numRuns: 50 },
    );
  });
});
