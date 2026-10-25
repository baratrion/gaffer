// @US-1 @US-2 (S-008 play the season, matchday by matchday) @regression
// CONTRACT_SHAPE: bounded-change
// Outcome anchor: DISCUSS D1, D9 and DoD: making "Play match" play the next matchday must keep S-001..S-007 working. The FIRST tap of a
// new game is still matchday 1, exactly as before: Netherwold Borough 1–2 Marlbrook Athletic at seed 31, the four matchday-1 results
// unchanged for every seed, the table after it at P 1 on every row, and Squad, Tactics, Starting XI, Table and Back unchanged. States
// are built with the actions that exist today and nothing names `nextMatchday`, so this file compiles and passes before and after
// DELIVER. It never plays a second time (that is the S-008 behaviour, held out in distill/pending).
import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { initialState, matchFor, standingsOf, update, type Action, type GameState } from "../../../src/app/state";
import { FORMATIONS } from "../../../src/domain/formation";
import { generateLeague } from "../../../src/domain/league";
import { fixtureOf } from "../../../src/domain/schedule";
import { PLAYERS_PER_SQUAD } from "../../../src/domain/squad";

const league = generateLeague(31);
const clubIds = league.clubs.map((club) => club.id);
const anySeed = fc.integer({ min: -(2 ** 31), max: 2 ** 31 - 1 });
const homeOf = (clubId: string, world = league, formation = "4-4-2"): GameState =>
  ({ ...initialState(world), screen: { kind: "clubHome", clubId }, formation }) as GameState;
const walk = (start: GameState, steps: readonly Action[]): GameState => steps.reduce(update, start);
const play: Action = { type: "PlayMatch" };
const back: Action = { type: "Back" };
const table: Action = { type: "ViewTable" };

describe("@US-1 S-008 the first Play match of a new game is still matchday 1", () => {
  it("Given Netherwold Borough at seed 31 with untouched tactics, when Sam taps Play match once, then the match screen shows matchday 1: Netherwold Borough 1–2 Marlbrook Athletic @regression @walking_skeleton @driving_port @contract-shape:bounded-change", () => {
    const after = update(homeOf(clubIds[0]!), play);
    expect(after.screen).toEqual({ kind: "match", clubId: clubIds[0] });
    const view = matchFor(after, clubIds[0]!)!;
    expect(view.matchday).toBe(1);
    expect([view.home.club.name, view.result.homeGoals, view.result.awayGoals, view.away.club.name]).toEqual(["Netherwold Borough", 1, 2, "Marlbrook Athletic"]);
  });

  it("Given any seed, any of the 8 clubs and any formation, when Sam taps Play match once, then the match is matchday 1 against the schedule's matchday-1 opponent and the table has P 1 on every row @regression @property @driving_port @contract-shape:bounded-change", () => {
    fc.assert(
      fc.property(anySeed, fc.integer({ min: 0, max: 7 }), fc.constantFrom(...FORMATIONS), (seed, club, formation) => {
        const world = generateLeague(seed);
        const id = world.clubs[club]!.id;
        const after = update(homeOf(id, world, formation), play);
        const view = matchFor(after, id)!;
        const { fixture } = fixtureOf(1, club);
        expect(view.matchday).toBe(1);
        expect([view.home.club.id, view.away.club.id]).toEqual([world.clubs[fixture.home]!.id, world.clubs[fixture.away]!.id]);
        expect(standingsOf(after).every((row) => row.played === 1)).toBe(true);
      }),
    );
  });

  it("Given seed 31, when Sam taps Play match, Back and Table, then the table is the matchday-1 golden: Tarnbeck Borough first on +4, Netherwold Borough sixth on -1 @regression @boundary @driving_port @contract-shape:bounded-change", () => {
    const rows = standingsOf(walk(homeOf(clubIds[0]!), [play, back, table]));
    expect(rows.map((r) => [r.name, r.played, r.goalDifference, r.points])).toEqual([
      ["Tarnbeck Borough", 1, 4, 3], ["Oakhampton Rise Borough", 1, 2, 3], ["Marlbrook Athletic", 1, 1, 3], ["Fennimore Town", 1, 0, 1],
      ["Valebridge Albion", 1, 0, 1], ["Netherwold Borough", 1, -1, 0], ["Juniper Hollow United", 1, -2, 0], ["Rushmoor Heath Albion", 1, -4, 0],
    ]);
  });
});

describe("@US-1 @US-2 S-008 the way to the squad, the tactics, the Starting XI, the table and back is unchanged", () => {
  it("Given any club home, formation and slot, when Sam walks Squad, Tactics, Starting XI and Table and comes Back each time, then the club home is shown again with the formation kept @regression @property @contract-shape:bounded-change", () => {
    fc.assert(
      fc.property(fc.constantFrom(...clubIds), fc.constantFrom(...FORMATIONS), fc.integer({ min: 0, max: PLAYERS_PER_SQUAD - 1 }), (clubId, formation, row) => {
        const start = homeOf(clubId, league, formation);
        const squad = walk(start, [{ type: "ViewSquad" }, { type: "ViewPlayer", playerIndex: row }, back, back]);
        const tactics = walk(start, [{ type: "ViewTactics" }, { type: "ChooseFormation", formation }, back]);
        const xi = walk(start, [{ type: "ViewStartingXI" }, { type: "ChooseSlot", slot: row % 11 }, back, back]);
        const standings = walk(start, [table, back]);
        for (const after of [squad, tactics, xi, standings]) {
          expect(after.screen).toEqual({ kind: "clubHome", clubId });
          expect(after.formation).toBe(formation);
          expect(after.league).toBe(league);
        }
      }),
    );
  });

  it("Given a club home before any match, when Sam taps Table, then every row reads P 0 and Back returns to the club home as it was @regression @boundary @contract-shape:bounded-change", () => {
    const start = homeOf(clubIds[0]!);
    const onTable = update(start, table);
    expect(onTable.screen).toEqual({ kind: "table", clubId: clubIds[0] });
    expect(standingsOf(onTable).every((row) => row.played === 0 && row.points === 0)).toBe(true);
    expect(update(onTable, back)).toEqual(start);
  });

  it("Given Sam chose 4-3-3 and then played, when he taps Back, then the club home is shown with 4-3-3 and his picks as they were @regression @boundary @contract-shape:bounded-change", () => {
    const tuned = walk(homeOf(clubIds[0]!), [{ type: "ViewTactics" }, { type: "ChooseFormation", formation: "4-3-3" }, back, { type: "ViewStartingXI" }, { type: "ChooseSlot", slot: 7 }, { type: "PickPlayer", playerIndex: 13 }, back]);
    const after = walk(tuned, [play, back]);
    expect(after.screen).toEqual({ kind: "clubHome", clubId: clubIds[0] });
    expect(after.formation).toBe("4-3-3");
    expect(after.xi).toEqual([0, 7, 3, 6, 2, 9, 12, 13, 17, 14, 16]);
  });

  it("Given Play match, Table or Back tapped where they offer no button (the title, the club list, an unknown club), then nothing happens (the very same state) @regression @error @boundary @contract-shape:bounded-change", () => {
    const states: GameState[] = [initialState(league), { ...initialState(league), screen: { kind: "pickClub" } }, homeOf("club-99")];
    for (const state of states) {
      for (const action of [play, table, back]) {
        expect(update(state, action), `${state.screen.kind} ${action.type}`).toBe(state);
      }
    }
  });

  it("Given any run of up to 40 taps from the title (valid and invalid), when the table is read after each, then the game never throws and every row keeps W + D + L = P and Pts = 3 x W + D with the totals balanced @regression @property @error @contract-shape:bounded-change", () => {
    const anyAction: fc.Arbitrary<Action> = fc.oneof(
      fc.constant<Action>({ type: "NewGame" }), fc.constant<Action>(play), fc.constant<Action>(back), fc.constant<Action>(table),
      fc.constant<Action>({ type: "ViewSquad" }), fc.constant<Action>({ type: "ViewTactics" }), fc.constant<Action>({ type: "ViewStartingXI" }),
      fc.constantFrom(...clubIds, "club-99").map((id): Action => ({ type: "ChooseClub", clubId: id })),
      fc.constantFrom(...FORMATIONS, "5-3-2").map((formation): Action => ({ type: "ChooseFormation", formation })),
      fc.integer({ min: -2, max: PLAYERS_PER_SQUAD + 1 }).map((playerIndex): Action => ({ type: "PickPlayer", playerIndex })),
      fc.integer({ min: -2, max: 12 }).map((slot): Action => ({ type: "ChooseSlot", slot })),
    );
    fc.assert(
      fc.property(fc.array(anyAction, { maxLength: 40 }), (actions) => {
        let state = initialState(league);
        for (const action of actions) {
          state = update(state, action);
          const rows = standingsOf(state);
          const total = (pick: (r: (typeof rows)[number]) => number) => rows.reduce((sum, r) => sum + pick(r), 0);
          for (const row of rows) {
            expect(row.won + row.drawn + row.lost).toBe(row.played);
            expect(row.points).toBe(3 * row.won + row.drawn);
          }
          expect(total((r) => r.won)).toBe(total((r) => r.lost));
          expect(total((r) => r.goalDifference)).toBe(0);
          if (state.screen.kind === "match") expect(clubIds).toContain(state.screen.clubId);
        }
      }),
    );
  });
});
