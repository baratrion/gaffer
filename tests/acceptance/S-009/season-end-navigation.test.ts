// @US-1 @US-2 (S-009 see how my season ended) held out until DELIVER
// CONTRACT_SHAPE: bounded-change
// Outcome anchor: DISCUSS Elevator Pitch (US-1 and US-2); DISCUSS D1, D3, D4, D5, D8 and the test intents (the offer at 14 and not 0..13, Back, Play again equals a fresh NewGame of the
// same league, a no-op elsewhere, nothing new stored); ADR-0015 decision 3; brief ports 33 and 34. ViewSeasonEnd is offered from a known club's
// club home only when nextMatchday is undefined (boundaries 13 and 14), changes only the screen, and is the very same state (toBe) everywhere
// else; Back from seasonEnd restores the club home (toEqual); NewGame ("Play again") from seasonEnd equals update(initialState(league), NewGame)
// also after a changed formation and picks, and elsewhere than title and seasonEnd is the very same state; focusPlan treats seasonEnd as a
// club screen; the state keeps exactly league, screen, formation, xi, results. Properties run up to 40 valid and invalid actions (K3).
// Destination: tests/acceptance/S-009/season-end-navigation.test.ts (DELIVER: git mv, dropping .pending, in the commit that widens update).
// Keep fc.property callbacks to 3 parameters (oxlint max-params).
import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { focusPlan, initialState, matchFor, nextMatchday, seasonSummaryOf, standingsOf, update, type Action, type GameState, type Screen } from "../../../src/app/state";
import { FORMATIONS } from "../../../src/domain/formation";
import { generateLeague } from "../../../src/domain/league";
import { PLAYERS_PER_SQUAD } from "../../../src/domain/squad";
import { REFERENCE_END_20260, REFERENCE_END_31 } from "./season-end-reference";
import { untouchedSeason } from "./season-oracle";

const play: Action = { type: "PlayMatch" };
const back: Action = { type: "Back" };
const table: Action = { type: "ViewTable" };
const newGame: Action = { type: "NewGame" };
const viewEnd: Action = { type: "ViewSeasonEnd" };
const league = generateLeague(31);
const clubId = league.clubs[0]!.id;
const walk = (start: GameState, steps: readonly Action[]): GameState => steps.reduce(update, start);
const homeOf = (id: string, world = league): GameState => walk(initialState(world), [newGame, { type: "ChooseClub", clubId: id }]);
const afterMatchdays = (start: GameState, matchdays: number): GameState => walk(start, Array.from({ length: matchdays }, () => [play, back]).flat());
const finished = afterMatchdays(homeOf(clubId), 14);
const fresh = update(initialState(league), newGame);
const CLUBS_LAST = 7;
const KEYS = ["league", "screen", "formation", "xi", "results"];
const deepFreeze = <T>(value: T): T => {
  if (typeof value === "object" && value !== null && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const inner of Object.values(value)) deepFreeze(inner);
  }
  return value;
};
const tuned = (state: GameState): GameState =>
  walk(state, [{ type: "ViewTactics" }, { type: "ChooseFormation", formation: "4-3-3" }, back, { type: "ViewStartingXI" }, { type: "ChooseSlot", slot: 7 }, { type: "PickPlayer", playerIndex: 13 }, back]);

describe("@US-1 S-009 End of season is offered exactly when all 14 matchdays are played", () => {
  it("Given Netherwold Borough with 14 matches played, when Sam taps End of season, then the End of season screen of his club opens and nothing but the screen changes @walking_skeleton @driving_port @boundary @contract-shape:bounded-change", () => {
    const after = update(finished, viewEnd);
    expect(after.screen).toEqual({ kind: "seasonEnd", clubId });
    expect(after).toEqual({ ...finished, screen: { kind: "seasonEnd", clubId } });
    expect(after.results).toBe(finished.results);
    expect(after.league).toBe(finished.league);
    expect(after.formation).toBe(finished.formation);
    expect(after.xi).toBe(finished.xi);
  });

  it("Given 0 to 13 matches played, when Sam taps End of season on the club home, then nothing happens (the very same state): the offer starts at exactly 14 @error @boundary @driving_port @contract-shape:bounded-change", () => {
    const start = homeOf(clubId);
    for (let played = 0; played <= 13; played++) {
      const state = afterMatchdays(start, played);
      expect(nextMatchday(state) === undefined, `${played} played`).toBe(false);
      expect(update(state, viewEnd), `${played} played`).toBe(state);
    }
    expect(nextMatchday(finished)).toBeUndefined();
  });

  it("Given the season is over, when End of season is tapped from any screen but a known club's home, then nothing happens (the very same state) @error @boundary @contract-shape:bounded-change", () => {
    const screens: Screen[] = [
      { kind: "title" }, { kind: "pickClub" }, { kind: "squad", clubId }, { kind: "player", clubId, playerIndex: 3 }, { kind: "tactics", clubId }, { kind: "startingXI", clubId },
      { kind: "choosePlayer", clubId, slot: 2 }, { kind: "match", clubId }, { kind: "table", clubId }, { kind: "seasonEnd", clubId }, { kind: "clubHome", clubId: "club-99" },
      { kind: "seasonEnd", clubId: "club-99" },
    ];
    for (const screen of screens) {
      const state = { ...finished, screen };
      expect(update(state, viewEnd), screen.kind).toBe(state);
    }
  });

  it("Given every club of the league managed in turn at seed 31, when the 14th match is played and Back tapped, then each club home offers End of season and opens its own club's screen @boundary @driving_port @contract-shape:bounded-change", () => {
    for (const club of league.clubs) {
      const over = afterMatchdays(homeOf(club.id), 14);
      expect(update(over, viewEnd).screen).toEqual({ kind: "seasonEnd", clubId: club.id });
    }
  });

  it("Given the season is over, when Sam taps Play match on the club home or on the End of season screen, then nothing happens and no match can be re-opened @error @boundary @contract-shape:bounded-change", () => {
    const onEnd = update(finished, viewEnd);
    expect(update(finished, play)).toBe(finished);
    expect(update(onEnd, play)).toBe(onEnd);
    expect(matchFor(onEnd, clubId)!.matchday).toBe(14);
  });
});

describe("@US-1 S-009 Back from the End of season screen returns to the finished season", () => {
  it("Given Sam is on the End of season screen, when he taps Back, then the club home is exactly as it was before End of season was tapped, offering End of season again @walking_skeleton @driving_port @boundary @contract-shape:bounded-change", () => {
    const onEnd = update(finished, viewEnd);
    const home = update(onEnd, back);
    expect(home).toEqual(finished);
    expect(home.screen).toEqual({ kind: "clubHome", clubId });
    expect(update(home, viewEnd)).toEqual(onEnd);
  });

  it("Given Sam went Back, when he opens Table, then every row reads P 14, and End of season opens the same summary again @boundary @driving_port @contract-shape:bounded-change", () => {
    const home = update(update(finished, viewEnd), back);
    const onTable = update(home, table);
    expect(standingsOf(onTable).every((row) => row.played === 14)).toBe(true);
    const again = walk(onTable, [back, viewEnd]);
    expect(seasonSummaryOf(again, clubId)).toEqual(seasonSummaryOf(finished, clubId));
  });

  it("Given Back on an End of season screen of a club that is not in the league, when it is tapped, then nothing happens (the very same state) @error @boundary @contract-shape:bounded-change", () => {
    const stray = { ...finished, screen: { kind: "seasonEnd", clubId: "club-99" } } satisfies GameState;
    expect(update(stray, back)).toBe(stray);
  });

  it("Given a tuned finished season (4-3-3 and a pick), when Sam opens End of season and goes Back, then formation, picks and the log are exactly as they were @boundary @contract-shape:bounded-change", () => {
    const state = tuned(finished);
    const home = update(update(state, viewEnd), back);
    expect(home).toEqual(state);
    expect(home.results).toBe(state.results);
    expect(home.xi).toEqual(state.xi);
  });
});

describe("@US-2 S-009 Play again starts a fresh game of the same league", () => {
  it("Given Sam is on the End of season screen, when he taps Play again, then the pick-a-club screen shows and the game equals a new game of the same league: no results, 4-4-2, no picks, the same league @walking_skeleton @driving_port @boundary @contract-shape:bounded-change", () => {
    const after = update(update(finished, viewEnd), newGame);
    expect(after).toEqual(fresh);
    expect(after.screen).toEqual({ kind: "pickClub" });
    expect(after.formation).toBe("4-4-2");
    expect(after.results).toBeUndefined();
    expect(after.xi).toBeUndefined();
    expect(after.league).toBe(league);
    expect(nextMatchday(update(after, { type: "ChooseClub", clubId }))).toBe(1);
  });

  it("Given Sam chose 4-3-3 and picked a player in the finished season, when he taps Play again, then the formation and the pick are gone, as for a new game @boundary @driving_port @contract-shape:bounded-change", () => {
    const state = update(tuned(finished), viewEnd);
    expect(state.formation).toBe("4-3-3");
    expect(state.xi).toBeDefined();
    const after = update(state, newGame);
    expect(after).toEqual(fresh);
    expect(after.formation).toBe("4-4-2");
    expect(after.xi).toBeUndefined();
  });

  it("Given Play again was tapped, when Sam picks the same club and plays 14 matches with untouched tactics, then the 56 results and the summary are those of the first season (K3) @walking_skeleton @boundary @driving_port @contract-shape:bounded-change", () => {
    const again = afterMatchdays(update(update(update(finished, viewEnd), newGame), { type: "ChooseClub", clubId }), 14);
    expect(again.results).toEqual(finished.results);
    expect(again.results).not.toBe(finished.results);
    expect(seasonSummaryOf(again, clubId)).toEqual(seasonSummaryOf(finished, clubId));
    expect(seasonSummaryOf(again, clubId)).toEqual({ position: REFERENCE_END_31.position, topScorer: expect.objectContaining({ name: "Garrick Thistlewood", goals: 5 }) });
  });

  it("Given ?seed=abc and the End of season screen of Oakhampton Rise Borough, when Sam taps Play again and picks Valebridge Town, then its club home offers Play match (no End of season) and its first match is matchday 1 @boundary @driving_port @contract-shape:bounded-change", () => {
    const world = generateLeague(REFERENCE_END_20260.seed);
    const oakhampton = world.clubs[REFERENCE_END_20260.clubIndex]!;
    const valebridge = world.clubs.find((club) => club.name === "Valebridge Town")!;
    const over = afterMatchdays(homeOf(oakhampton.id, world), 14);
    const picked = walk(over, [viewEnd, newGame, { type: "ChooseClub", clubId: valebridge.id }]);
    expect(picked.screen).toEqual({ kind: "clubHome", clubId: valebridge.id });
    expect(update(picked, viewEnd)).toBe(picked);
    const first = update(picked, play);
    const view = matchFor(first, valebridge.id)!;
    expect(view.matchday).toBe(1);
    const entry = untouchedSeason(world.seed).find((m) => m.matchday === 1 && [m.home, m.away].includes(world.clubs.indexOf(valebridge)))!;
    expect(first.results![0]!.result).toEqual(untouchedSeason(world.seed)[0]!.result);
    expect([view.home.club.id, view.away.club.id]).toEqual([world.clubs[entry.home]!.id, world.clubs[entry.away]!.id]);
  });

  it("Given every screen except the title and the End of season screen, when New game is tapped in a finished season, then nothing happens (the very same state) @error @boundary @contract-shape:bounded-change", () => {
    const screens: Screen[] = [
      { kind: "pickClub" }, { kind: "clubHome", clubId }, { kind: "squad", clubId }, { kind: "player", clubId, playerIndex: 3 }, { kind: "tactics", clubId }, { kind: "startingXI", clubId },
      { kind: "choosePlayer", clubId, slot: 2 }, { kind: "match", clubId }, { kind: "table", clubId }, { kind: "clubHome", clubId: "club-99" }, { kind: "seasonEnd", clubId: "club-99" },
    ];
    for (const screen of screens.slice(0, -1)) {
      const state = { ...finished, screen };
      expect(update(state, newGame), screen.kind).toBe(state);
    }
  });

  it("Given the title with a finished season recorded, when New game is tapped, then it is still the fresh game (the S-008 invariant stands) @boundary @contract-shape:bounded-change", () => {
    expect(update({ ...finished, screen: { kind: "title" } }, newGame)).toEqual(fresh);
  });
});

describe("@US-1 @US-2 S-009 focus follows the screen (ADR-0008)", () => {
  const onEnd: Screen = { kind: "seasonEnd", clubId };
  it("Given Sam moves between the club home, End of season and the pick-a-club screen, when focus is planned, then it goes to the new heading each time @boundary @driving_port @contract-shape:pure-function", () => {
    expect(focusPlan({ kind: "clubHome", clubId }, onEnd, "x")).toEqual({ kind: "heading" });
    expect(focusPlan(onEnd, { kind: "clubHome", clubId }, "x")).toEqual({ kind: "heading" });
    expect(focusPlan(onEnd, { kind: "pickClub" }, "x")).toEqual({ kind: "heading" });
    expect(focusPlan(undefined, onEnd, undefined)).toEqual({ kind: "heading" });
    expect(focusPlan(onEnd, onEnd, undefined)).toEqual({ kind: "heading" });
  });

  it("Given the same club's End of season screen shown again with a focus id, when focus is planned, then the element is kept, and another club's screen takes the heading @boundary @contract-shape:pure-function", () => {
    expect(focusPlan(onEnd, onEnd, "x")).toEqual({ kind: "element", id: "x" });
    expect(focusPlan(onEnd, { kind: "seasonEnd", clubId: "club-2" }, "x")).toEqual({ kind: "heading" });
    expect(focusPlan({ kind: "table", clubId }, { kind: "table", clubId }, "x")).toEqual({ kind: "element", id: "x" });
    expect(focusPlan({ kind: "table", clubId }, onEnd, "x")).toEqual({ kind: "heading" });
  });
});

describe("@US-1 @US-2 S-009 nothing new is stored and every run stays honest", () => {
  it("Given the states of a season on the way to End of season, Back and Play again, when their keys are read, then there are only league, screen, formation, xi and results @boundary @contract-shape:bounded-change", () => {
    const onEnd = update(finished, viewEnd);
    for (const state of [finished, onEnd, update(onEnd, back), update(onEnd, newGame), update(tuned(finished), viewEnd)]) {
      expect(Object.keys(state).filter((key) => !KEYS.includes(key))).toEqual([]);
    }
  });

  const anyAction = (clubIds: readonly string[]): fc.Arbitrary<Action> =>
    fc.oneof(
      fc.constant<Action>(viewEnd), fc.constant<Action>(newGame), fc.constant<Action>(back), fc.constant<Action>(play), fc.constant<Action>(table),
      fc.constant<Action>({ type: "ViewSquad" }), fc.constant<Action>({ type: "ViewTactics" }), fc.constant<Action>({ type: "ViewStartingXI" }),
      fc.constantFrom(...clubIds, "club-99").map((id): Action => ({ type: "ChooseClub", clubId: id })),
      fc.constantFrom(...FORMATIONS, "5-3-2").map((formation): Action => ({ type: "ChooseFormation", formation })),
      fc.integer({ min: -2, max: PLAYERS_PER_SQUAD + 1 }).map((playerIndex): Action => ({ type: "PickPlayer", playerIndex })),
      fc.integer({ min: -2, max: 12 }).map((slot): Action => ({ type: "ChooseSlot", slot })),
      fc.integer({ min: -2, max: PLAYERS_PER_SQUAD + 1 }).map((playerIndex): Action => ({ type: "ViewPlayer", playerIndex })),
    );

  it("Given a finished season, when Sam taps any run of up to 40 valid and invalid actions, then the game never throws, End of season is only ever the screen of a finished season, the log changes only by Play again or by playing a new season's next matchday, and Play again always equals a fresh game @property @error @driving_port @contract-shape:bounded-change", () => {
    const ids = league.clubs.map((club) => club.id);
    fc.assert(
      fc.property(fc.array(anyAction(ids), { maxLength: 40 }), (actions) => {
        let state = deepFreeze(finished);
        for (const action of actions) {
          const before = state;
          state = deepFreeze(update(state, action));
          const startedFresh = before.screen.kind === "title" || before.screen.kind === "seasonEnd";
          const appends = action.type === "PlayMatch" && before.screen.kind === "clubHome" && nextMatchday(before) !== undefined && ids.includes(before.screen.clubId);
          if (action.type === "NewGame" && startedFresh) {
            expect(state).toEqual(update(initialState(league), newGame));
          } else if (appends) {
            // after Play again the new season may be played: it only appends whole matchdays and keeps the earlier entries
            const kept = before.results ?? [];
            expect(state.results).toHaveLength(kept.length + 4);
            kept.forEach((entry, index) => expect(state.results![index]).toBe(entry));
          } else {
            expect(state.results).toBe(before.results);
          }
          if (action.type === "NewGame" && !startedFresh) expect(state).toBe(before);
          if (state.screen.kind === "seasonEnd") expect(nextMatchday(state)).toBeUndefined();
          expect(Object.keys(state).filter((key) => !KEYS.includes(key))).toEqual([]);
        }
      }),
      { numRuns: 100 },
    );
  });

  it("Given any seed, club and run of up to 40 actions before the season is finished, when the season is finished and Sam taps End of season and Play again, then the game equals a new game of that league (K3) @property @error @driving_port @contract-shape:bounded-change", () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 300 }), fc.integer({ min: 0, max: CLUBS_LAST }), fc.array(anyAction(league.clubs.map((club) => club.id)), { maxLength: 40 }), (seed, club, prelude) => {
        const world = generateLeague(seed);
        const id = world.clubs[club]!.id;
        let state = prelude.reduce(update, initialState(world));
        for (let step = 0; step < 6 && state.screen.kind !== "clubHome"; step++) {
          state = update(state, state.screen.kind === "title" ? newGame : state.screen.kind === "pickClub" ? { type: "ChooseClub", clubId: id } : back);
        }
        expect(state.screen.kind).toBe("clubHome");
        while (nextMatchday(state) !== undefined) state = update(update(state, play), back);
        const onEnd = update(state, viewEnd);
        expect(onEnd.screen.kind).toBe("seasonEnd");
        expect(update(onEnd, newGame)).toEqual(update(initialState(world), newGame));
      }),
      { numRuns: 25 },
    );
  });
});
