// @US-2 (S-008 play the season, matchday by matchday) @walking_skeleton
// CONTRACT_SHAPE: bounded-change
// Outcome anchor: DISCUSS US-2 Elevator Pitch and D6 (ADR-0014 decision 4, Earned Trust 3 and 4): after matchday 14 the season is over. It is
// derived from the log (14 matchdays recorded), never stored; a Play match then is a no-op that returns the very same state and never
// reaches fixturesOf(15); "Table" still opens and reads P 14; there is no way to re-open a played match. The "Season over" line and the
// missing button are this version only (D6), so nothing here is pinned in tests/protected; the browser side is in S-008-season.spec.ts.
// Boundaries 13 and 14 kill an off-by-one in the guard. Universe of the returned state: { league, screen, formation, xi, results }.
// Destination: tests/acceptance/S-008/season-end.test.ts (DELIVER, same commit as src/app/state.ts).
import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { initialState, matchFor, nextMatchday, standingsOf, update, type Action, type GameState } from "../../../src/app/state";
import { generateLeague } from "../../../src/domain/league";
import { fixtureOf } from "../../../src/domain/schedule";

const league = generateLeague(31);
const clubIds = league.clubs.map((club) => club.id);
const clubId = clubIds[0]!;
const onHome = (id = clubId, world = league): GameState => ({ ...initialState(world), screen: { kind: "clubHome", clubId: id } });
const play: Action = { type: "PlayMatch" };
const back: Action = { type: "Back" };
const table: Action = { type: "ViewTable" };
const walk = (start: GameState, steps: readonly Action[]): GameState => steps.reduce(update, start);
const cycle = (start: GameState, times: number): GameState => Array.from({ length: times }).reduce<GameState>((state) => walk(state, [play, back]), start);
const deepFreeze = <T>(value: T): T => {
  if (typeof value === "object" && value !== null && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const child of Object.values(value)) deepFreeze(child);
  }
  return value;
};
const NORTHCOTT_IN_433 = [{ type: "ViewStartingXI" }, { type: "ChooseSlot", slot: 7 }, { type: "PickPlayer", playerIndex: 13 }, back] as const satisfies readonly Action[];
const CHOOSE_433 = [{ type: "ViewTactics" }, { type: "ChooseFormation", formation: "4-3-3" }, back] as const satisfies readonly Action[];

describe("@US-2 S-008 the season is over after matchday 14 and Play match then does nothing", () => {
  it("Given Sam has played 13 matches, when he taps Play match and Back, then 14 matchdays are recorded and there is no next matchday; at 13 there still is one (14) @walking_skeleton @driving_port @boundary @contract-shape:bounded-change", () => {
    const thirteen = cycle(onHome(), 13);
    expect(nextMatchday(thirteen)).toBe(14);
    expect(thirteen.results).toHaveLength(52);
    const fourteen = walk(thirteen, [play, back]);
    expect(fourteen.results).toHaveLength(56);
    expect(nextMatchday(fourteen)).toBeUndefined();
    expect(fourteen.results!.at(-1)!.matchday).toBe(14);
  });

  it("Given the matchday-14 match screen, when Sam taps Back, then the club home is shown and the season is still over (the match of matchday 14 is what matchFor reads) @driving_port @boundary @contract-shape:bounded-change", () => {
    const onMatch = update(cycle(onHome(), 13), play);
    expect(nextMatchday(onMatch)).toBeUndefined();
    expect(matchFor(onMatch, clubId)!.matchday).toBe(14);
    const home = update(onMatch, back);
    expect(home.screen).toEqual({ kind: "clubHome", clubId });
    expect(matchFor({ ...home, screen: { kind: "match", clubId } }, clubId)!.matchday).toBe(14);
  });

  it("Given the season is over, when Sam taps Play match from the club home, then nothing happens (the very same state), however often he taps, and it never throws @walking_skeleton @error @boundary @contract-shape:bounded-change", () => {
    const over = deepFreeze(cycle(onHome(), 14));
    expect(update(over, play)).toBe(over);
    expect(update(update(update(over, play), play), play)).toBe(over);
    expect(() => walk(over, [play, play, play])).not.toThrow();
    expect(over.results).toHaveLength(56);
  });

  it("Given the season is over for each of the 8 clubs at seeds 31 and 20260, when Sam taps Play match, then nothing happens and his match is still matchday 14 against the schedule's matchday-14 opponent @error @boundary @contract-shape:bounded-change", () => {
    for (const world of [league, generateLeague(20260)]) {
      for (const [index, club] of world.clubs.entries()) {
        const over = deepFreeze(cycle(onHome(club.id, world), 14));
        expect(update(over, play), `${world.seed} ${club.name}`).toBe(over);
        const view = matchFor(over, club.id)!;
        const { fixture } = fixtureOf(14, index);
        expect(view.matchday).toBe(14);
        expect([view.home.club.id, view.away.club.id]).toEqual([world.clubs[fixture.home]!.id, world.clubs[fixture.away]!.id]);
      }
    }
  });

  it("Given the season is over and Sam changed the formation or the eleven afterwards, when he taps Play match, then still nothing happens and nothing recorded moves @error @boundary @contract-shape:bounded-change", () => {
    const over = cycle(onHome(), 14);
    const tuned = deepFreeze(walk(over, [...CHOOSE_433, ...NORTHCOTT_IN_433]));
    expect(tuned.formation).toBe("4-3-3");
    expect(tuned.results).toBe(over.results);
    expect(update(tuned, play)).toBe(tuned);
  });

  it("Given the season is over, when Sam opens Table, then every row reads P 14 and Back returns to the club home exactly as it was; Squad, Tactics and Starting XI still open and leave the log alone @driving_port @boundary @contract-shape:bounded-change", () => {
    const over = deepFreeze(cycle(onHome(), 14));
    const onTable = update(over, table);
    expect(onTable.screen).toEqual({ kind: "table", clubId });
    expect(standingsOf(onTable).every((row) => row.played === 14)).toBe(true);
    expect(update(onTable, back)).toEqual(over);
    for (const open of [{ type: "ViewSquad" }, { type: "ViewTactics" }, { type: "ViewStartingXI" }] as const) {
      const opened = update(over, open);
      expect(opened.screen.kind).not.toBe("clubHome");
      expect(opened.results).toBe(over.results);
      expect(update(opened, back)).toEqual(over);
    }
  });

  it("Given the season is over, when Sam taps any run of up to 40 taps (valid and invalid), then no match screen is ever reached, the log never changes and the game never throws (there is no way to re-open a played match) @property @error @contract-shape:bounded-change", () => {
    const anyAction: fc.Arbitrary<Action> = fc.oneof(
      { weight: 3, arbitrary: fc.constant<Action>(play) }, { weight: 2, arbitrary: fc.constant<Action>(back) }, { weight: 2, arbitrary: fc.constant<Action>(table) },
      { weight: 1, arbitrary: fc.constant<Action>({ type: "NewGame" }) }, { weight: 1, arbitrary: fc.constant<Action>({ type: "ViewSquad" }) },
      { weight: 1, arbitrary: fc.constant<Action>({ type: "ViewTactics" }) }, { weight: 1, arbitrary: fc.constant<Action>({ type: "ViewStartingXI" }) },
      { weight: 1, arbitrary: fc.integer({ min: -2, max: 12 }).map((slot): Action => ({ type: "ChooseSlot", slot })) },
      { weight: 1, arbitrary: fc.integer({ min: -2, max: 20 }).map((playerIndex): Action => ({ type: "PickPlayer", playerIndex })) },
      { weight: 1, arbitrary: fc.integer({ min: -2, max: 20 }).map((playerIndex): Action => ({ type: "ViewPlayer", playerIndex })) },
      { weight: 1, arbitrary: fc.constantFrom("4-4-2", "4-3-3", "5-3-2").map((formation): Action => ({ type: "ChooseFormation", formation })) },
    );
    const over = cycle(onHome(), 14);
    fc.assert(
      fc.property(fc.array(anyAction, { maxLength: 40 }), (actions) => {
        let state = deepFreeze(over);
        for (const action of actions) {
          state = deepFreeze(update(state, action));
          expect(state.screen.kind).not.toBe("match");
          expect(state.results).toBe(over.results);
          expect(nextMatchday(state)).toBeUndefined();
        }
      }),
      { numRuns: 100 },
    );
  });

  it("Given a season over or not, when the state is read, then it holds no season-over flag of its own (the line is derived from the log) @boundary @contract-shape:pure-function", () => {
    const allowed = ["league", "screen", "formation", "xi", "results"];
    for (const state of [onHome(), cycle(onHome(), 7), cycle(onHome(), 14), update(cycle(onHome(), 14), table)]) {
      expect(Object.keys(state).filter((key) => !allowed.includes(key))).toEqual([]);
    }
  });

  it("Given the title with a finished season recorded, when New game is tapped, then the whole log is gone and the next matchday is 1 again (a unit-level invariant) @error @boundary @contract-shape:bounded-change", () => {
    const state = deepFreeze<GameState>({ ...cycle(onHome(), 14), screen: { kind: "title" } });
    const after = update(state, { type: "NewGame" });
    expect(after.results).toBeUndefined();
    expect(nextMatchday(after)).toBe(1);
  });
});
