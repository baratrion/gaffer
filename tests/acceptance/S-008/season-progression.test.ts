// @US-1 (S-008 play the season, matchday by matchday) @walking_skeleton
// CONTRACT_SHAPE: bounded-change
// Outcome anchor: DISCUSS US-1 Elevator Pitch and D1, D2, D5, D7, D8 (ADR-0014). On a known club's home, each "Play match" plays the NEXT
// matchday for the whole league: it appends the 4 results of that matchday (Sam's side is his formation and Starting XI at the moment of
// the tap, every other side its automatic 4-4-2) and shows his fixture; earlier entries stay the identical objects, so what is played stays
// played and a pick counts only from the next tap (K3). Sam, Netherwold Borough, ?seed=31: "Matchday 2", "Rushmoor Heath Albion 2–1
// Netherwold Borough", then P 2 on every row with Netherwold Borough eighth on Pts 0 and GD -2. Universe of the returned state:
// { league, screen, formation, xi, results }; only `screen` and `results` change on a tap; no-ops are the very same object (toBe);
// states are deep-frozen so nothing is mutated. The last section restates the S-006/S-007 re-show cases that ADR-0014 supersedes
// (upstream-issues U-1), never weakening them.
// Destination: tests/acceptance/S-008/season-progression.test.ts (DELIVER, same commit as src/app/state.ts).
import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { parseSeed } from "../../../src/app/seed";
import {
  currentXI, initialState, matchFor, nextMatchday, squadOf, standingsOf, update,
  type Action, type GameState, type MatchView, type Screen,
} from "../../../src/app/state";
import { FORMATIONS, lineUp, type FormationId } from "../../../src/domain/formation";
import { generateLeague } from "../../../src/domain/league";
import { playMatchday, type MatchSide, type PlayedMatch } from "../../../src/domain/match";
import { fixtureOf } from "../../../src/domain/schedule";
import { automaticXI, playersForPosition } from "../../../src/domain/selection";
import { PLAYERS_PER_SQUAD, type Player, type Position } from "../../../src/domain/squad";
import { standings } from "../../../src/domain/standings";
import { TABLE_AFTER_TWO_31 } from "./season-reference";

const league = generateLeague(31);
const clubIds = league.clubs.map((club) => club.id);
const clubId = clubIds[0]!;
const anySeed = fc.integer({ min: -(2 ** 31), max: 2 ** 31 - 1 });
const at = (screen: Screen, extras: { readonly results?: readonly PlayedMatch[] } = {}): GameState => ({ ...initialState(league), screen, ...extras });
const onHome = (id = clubId, world = league): GameState => ({ ...initialState(world), screen: { kind: "clubHome", clubId: id } });
const play: Action = { type: "PlayMatch" };
const back: Action = { type: "Back" };
const table: Action = { type: "ViewTable" };
const walk = (start: GameState, steps: readonly Action[]): GameState => steps.reduce(update, start);
/** Sam taps "Play match" and "Back" `times` times from a club home and lands on the club home again. */
const cycle = (start: GameState, times: number): GameState => Array.from({ length: times }).reduce<GameState>((state) => walk(state, [play, back]), start);
const deepFreeze = <T>(value: T): T => {
  if (typeof value === "object" && value !== null && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const child of Object.values(value)) deepFreeze(child);
  }
  return value;
};
/** The 4 results of `matchday`, worked out independently of the app: Sam's side is his eleven at that moment, every other side its automatic 4-4-2. */
const expectedMatchday = (state: GameState, managedId: string, matchday: number): readonly PlayedMatch[] => {
  const sides: MatchSide[] = state.league.clubs.map((club) => {
    const squad = squadOf(state.league, club.id)!;
    return { squad, xi: club.id === managedId ? currentXI(state, squad) : automaticXI(squad, "4-4-2") };
  });
  return playMatchday({ seed: state.league.seed, matchday, sides });
};
const scoreLine = (view: MatchView): string => `${view.home.club.name} ${view.result.homeGoals}–${view.result.awayGoals} ${view.away.club.name}`;
const managedOf = (state: GameState): string => (state.screen as { readonly clubId: string }).clubId;
const NORTHCOTT_IN_433 = [{ type: "ViewStartingXI" }, { type: "ChooseSlot", slot: 7 }, { type: "PickPlayer", playerIndex: 13 }, back] as const satisfies readonly Action[];
const CHOOSE_433 = [{ type: "ViewTactics" }, { type: "ChooseFormation", formation: "4-3-3" }, back] as const satisfies readonly Action[];
/** An arbitrary valid eleven of a squad: per position, the players ordered by random keys, dealt in line-up order. */
const xiFrom = (squad: readonly Player[], formation: FormationId, keys: readonly number[]): readonly number[] => {
  const taken: Record<Position, number> = { GK: 0, DF: 0, MF: 0, FW: 0 };
  const ordered = Object.fromEntries(
    (["GK", "DF", "MF", "FW"] as const).map((position) => [position, [...playersForPosition(squad, position)].sort((a, b) => keys[a]! - keys[b]! || a - b)]),
  ) as Record<Position, number[]>;
  return lineUp(formation).map((position) => ordered[position][taken[position]++]!);
};
const choose = (formation: FormationId): readonly Action[] => [{ type: "ViewTactics" }, { type: "ChooseFormation", formation }, back];
const anyActionFromTitle: fc.Arbitrary<Action> = fc.oneof(
  fc.constant<Action>({ type: "NewGame" }), fc.constant<Action>(play), fc.constant<Action>(back), fc.constant<Action>(table),
  fc.constant<Action>({ type: "ViewSquad" }), fc.constant<Action>({ type: "ViewTactics" }), fc.constant<Action>({ type: "ViewStartingXI" }),
  fc.constantFrom(...clubIds, "club-99").map((id): Action => ({ type: "ChooseClub", clubId: id })),
  fc.constantFrom(...FORMATIONS, "5-3-2").map((formation): Action => ({ type: "ChooseFormation", formation })),
  fc.integer({ min: -2, max: PLAYERS_PER_SQUAD + 1 }).map((playerIndex): Action => ({ type: "PickPlayer", playerIndex })),
  fc.integer({ min: -2, max: 12 }).map((slot): Action => ({ type: "ChooseSlot", slot })),
  fc.integer({ min: -2, max: PLAYERS_PER_SQUAD + 1 }).map((playerIndex): Action => ({ type: "ViewPlayer", playerIndex })),
);
const OFF_HOME: readonly [string, Screen][] = [
  ["the title", { kind: "title" }], ["the club list", { kind: "pickClub" }], ["the squad", { kind: "squad", clubId }],
  ["a player", { kind: "player", clubId, playerIndex: 3 }], ["the tactics", { kind: "tactics", clubId }], ["the Starting XI", { kind: "startingXI", clubId }],
  ["a slot's choice", { kind: "choosePlayer", clubId, slot: 8 }], ["the match", { kind: "match", clubId }], ["the table", { kind: "table", clubId }],
];

describe("@US-1 S-008 Sam's second Play match plays matchday 2 against a new opponent", () => {
  it("Given Sam played matchday 1 as Netherwold Borough and is back on the club home, when he taps Play match again, then the first four results are the very same entries and the next four are matchday 2, and the match screen reads Rushmoor Heath Albion 2–1 Netherwold Borough @walking_skeleton @driving_port @contract-shape:bounded-change", () => {
    const first = deepFreeze(update(onHome(), play));
    const atTheTap = walk(first, [back]);
    const second = update(atTheTap, play);
    expect(second.screen).toEqual({ kind: "match", clubId });
    expect(second.results).toHaveLength(8);
    first.results!.forEach((entry, index) => expect(second.results![index]).toBe(entry));
    expect(second.results!.slice(4)).toEqual(expectedMatchday(atTheTap, clubId, 2));
    const view = matchFor(second, clubId)!;
    expect(view.matchday).toBe(2);
    expect(scoreLine(view)).toBe("Rushmoor Heath Albion 2–1 Netherwold Borough");
    expect(second.formation).toBe(first.formation);
    expect(second.xi).toBe(first.xi);
    expect(second.league).toBe(league);
  });

  it("Given seed 31 and Netherwold Borough, when Sam has played two matches, then every row of the table reads P 2 and the table is US-1 example 1, Netherwold Borough eighth on Pts 0 and GD -2 @walking_skeleton @driving_port @contract-shape:pure-function", () => {
    const rows = standingsOf(walk(onHome(), [play, back, play, back, table]));
    expect(rows.map((r) => [r.name, r.played, r.won, r.drawn, r.lost, r.goalDifference, r.points])).toEqual(TABLE_AFTER_TWO_31.map((row) => [...row]));
    expect(rows.map((r) => r.position)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  });

  it("Given seed 31, when Sam has played three matches, then the third reads Netherwold Borough 2–1 Oakhampton Rise Borough and he is sixth on Pts 3 @driving_port @contract-shape:pure-function", () => {
    const third = update(cycle(onHome(), 2), play);
    expect(matchFor(third, clubId)!.matchday).toBe(3);
    expect(scoreLine(matchFor(third, clubId)!)).toBe("Netherwold Borough 2–1 Oakhampton Rise Borough");
    const row = standingsOf(third).find((r) => r.name === "Netherwold Borough")!;
    expect([row.position, row.played, row.won, row.drawn, row.lost, row.points]).toEqual([6, 3, 1, 0, 2, 3]);
  });

  it("Given ?seed=abc and Oakhampton Rise Borough, when Sam plays two matches, then matchday 1 is Harrowgate Lane United 0–1 Oakhampton Rise Borough, matchday 2 is Oakhampton Rise Borough 2–2 Mossdale Wanderers and its row reads P 2 W 1 D 1 L 0 GD +1 Pts 4 @example @boundary @contract-shape:pure-function", () => {
    const world = generateLeague(parseSeed("?seed=abc"));
    const id = world.clubs[7]!.id;
    const one = update(onHome(id, world), play);
    const two = update(walk(one, [back]), play);
    expect(scoreLine(matchFor(one, id)!)).toBe("Harrowgate Lane United 0–1 Oakhampton Rise Borough");
    expect(scoreLine(matchFor(two, id)!)).toBe("Oakhampton Rise Borough 2–2 Mossdale Wanderers");
    const row = standingsOf(two).find((r) => r.name === "Oakhampton Rise Borough")!;
    expect([row.played, row.won, row.drawn, row.lost, row.goalDifference, row.points]).toEqual([2, 1, 1, 0, 1, 4]);
  });

  it("Given any seed, any of the 8 clubs and any formation, when Sam taps Play match and Back k times, then each tap appends exactly the 4 results of the next matchday, the earlier entries are the very same objects, the matchdays run 1..k and the match screen reads matchday k @property @driving_port @contract-shape:bounded-change", () => {
    fc.assert(
      fc.property(fc.record({ seed: anySeed, club: fc.integer({ min: 0, max: 7 }), formation: fc.constantFrom(...FORMATIONS), taps: fc.integer({ min: 1, max: 14 }) }), ({ seed, club, formation, taps }) => {
        const world = generateLeague(seed);
        const id = world.clubs[club]!.id;
        let state = deepFreeze(walk(onHome(id, world), choose(formation)));
        for (let k = 1; k <= taps; k++) {
          const before = state;
          const after = deepFreeze(update(before, play));
          expect(nextMatchday(before)).toBe(k);
          expect(after.results).toHaveLength(4 * k);
          (before.results ?? []).forEach((entry, index) => expect(after.results![index]).toBe(entry));
          expect(after.results!.slice(4 * (k - 1))).toEqual(expectedMatchday(before, id, k));
          expect(after.results!.map((entry) => entry.matchday)).toEqual(Array.from({ length: 4 * k }, (_, index) => Math.floor(index / 4) + 1));
          expect(matchFor(after, id)!.matchday).toBe(k);
          expect(after.formation).toBe(formation);
          expect(after.xi).toBe(before.xi);
          state = deepFreeze(update(after, back));
        }
      }),
    );
  });
});

describe("@US-1 S-008 the match screen shows the match just played, never the first entry of the log", () => {
  it("Given seed 31 and each of the 8 clubs managed, when Sam has played k matches (k = 1 to 14), then his match is matchday k against the schedule's matchday-k opponent, home club first, and its result is the recorded one @boundary @driving_port @contract-shape:pure-function", () => {
    for (const [index, id] of clubIds.entries()) {
      let state = onHome(id);
      for (let k = 1; k <= 14; k++) {
        const played = update(state, play);
        const view = matchFor(played, id)!;
        const { fixture, index: fixtureIndex } = fixtureOf(k, index);
        expect(view.matchday, `club ${index} after ${k} matches`).toBe(k);
        expect([view.home.club.id, view.away.club.id], `club ${index} matchday ${k}`).toEqual([clubIds[fixture.home], clubIds[fixture.away]]);
        expect(view.result).toBe(played.results![4 * (k - 1) + fixtureIndex]!.result);
        state = update(played, back);
      }
    }
  });

  it("Given Sam played two matches, when his match is asked for, then it is matchday 2, not the matchday-1 entry the log starts with (the S-007 re-show must not survive) @error @boundary @contract-shape:pure-function", () => {
    const two = update(cycle(onHome(), 1), play);
    expect(matchFor(two, clubId)!.matchday).toBe(2);
    expect(matchFor(two, clubId)!.result).not.toBe(two.results![0]!.result);
    expect(scoreLine(matchFor(two, clubId)!)).not.toBe("Netherwold Borough 1–2 Marlbrook Athletic");
  });

  it("Given matchdays have been played, when the match of a club that is not in the league is asked for, then there is none; with nothing recorded the S-006 matchday-1 fallback is still the golden @error @boundary @contract-shape:pure-function", () => {
    expect(matchFor(cycle(onHome(), 3), "club-99")).toBeUndefined();
    const fallback = matchFor(onHome(), clubId)!;
    expect([fallback.matchday, scoreLine(fallback)]).toEqual([1, "Netherwold Borough 1–2 Marlbrook Athletic"]);
  });

  it("Given matchday k is on the screen, when the formation or the eleven changes afterwards, then the screen still shows the recorded match, not a new derivation @property @boundary @contract-shape:pure-function", () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 6 }), fc.constantFrom(...FORMATIONS), fc.integer({ min: 0, max: 7 }), (k, formation, club) => {
        const id = clubIds[club]!;
        const played = update(cycle(onHome(id), k - 1), play);
        const later = { ...played, formation, xi: automaticXI(squadOf(league, id)!, formation) };
        expect(matchFor(later, id)).toEqual(matchFor(played, id));
      }),
    );
  });
});

describe("@US-1 S-008 picks made between matches count from the next match on", () => {
  const squad = squadOf(league, clubId)!;

  it("Given Sam played matchday 1, when he chooses 4-3-3 and picks Kestrel Northcott for Calder Redfern, then the table and his match are exactly as before; the next Play match is matchday 2 against Rushmoor Heath Albion, played with the new eleven, and every Netherwold Borough goal is one of those 11, never the goalkeeper and never Calder Redfern @walking_skeleton @driving_port @contract-shape:bounded-change", () => {
    const afterOne = deepFreeze(walk(onHome(), [play, back]));
    const before = { rows: standingsOf(afterOne), match: matchFor(afterOne, clubId), results: afterOne.results };
    const redfern = currentXI(walk(afterOne, CHOOSE_433), squad)[7]!;
    expect(squad[redfern]!.name).toBe("Calder Redfern");
    expect(squad[13]!.name).toBe("Kestrel Northcott");
    const tuned = walk(afterOne, [...CHOOSE_433, ...NORTHCOTT_IN_433]);
    expect(tuned.formation).toBe("4-3-3");
    expect(standingsOf(tuned)).toEqual(before.rows);
    expect(standingsOf(tuned)[5]).toMatchObject({ name: "Netherwold Borough", played: 1, goalDifference: -1 });
    expect(matchFor(tuned, clubId)).toEqual(before.match);
    expect(tuned.results).toBe(before.results);

    const second = update(tuned, play);
    const eleven = currentXI(tuned, squad);
    expect(eleven).toContain(13);
    expect(eleven).not.toContain(redfern);
    expect(second.results!.slice(0, 4)).toEqual(before.results);
    second.results!.slice(0, 4).forEach((entry, index) => expect(entry).toBe(before.results![index]));
    expect(second.results!.slice(4)).toEqual(expectedMatchday(tuned, clubId, 2));
    const view = matchFor(second, clubId)!;
    expect(view.matchday).toBe(2);
    expect([view.home.club.name, view.away.club.name]).toEqual(["Rushmoor Heath Albion", "Netherwold Borough"]);
    for (const goal of view.result.goals.filter((g) => g.side === "away")) {
      expect(eleven, "scored by one of the 11 on the Starting XI screen").toContain(goal.playerIndex);
      expect(squad[goal.playerIndex]!.position, "never the goalkeeper").not.toBe("GK");
      expect(goal.playerIndex).not.toBe(redfern);
    }
  });

  it("Given Sam changed his formation and eleven after matchday 1, when matchday 2 is played, then only his own fixture is played with them and the other three fixtures are as with untouched tactics @boundary @contract-shape:bounded-change", () => {
    const afterOne = walk(onHome(), [play, back]);
    const tuned = walk(afterOne, [...CHOOSE_433, ...NORTHCOTT_IN_433]);
    const tunedTwo = update(tuned, play).results!.slice(4);
    const untouchedTwo = update(afterOne, play).results!.slice(4);
    tunedTwo.forEach((entry, index) => {
      if (entry.home !== 0 && entry.away !== 0) expect(entry).toEqual(untouchedTwo[index]);
    });
    expect(tunedTwo.filter((e) => e.home === 0 || e.away === 0)).toHaveLength(1);
  });

  it("Given any seed, club, formation and any valid eleven set before the second match, when Sam taps Play match, then his side is exactly that eleven and the other three fixtures are untouched by it (the eleven at the moment of the tap, not the first or the automatic one) @property @driving_port @contract-shape:bounded-change", () => {
    fc.assert(
      fc.property(
        fc.record({ seed: anySeed, club: fc.integer({ min: 0, max: 7 }), formation: fc.constantFrom(...FORMATIONS), keys: fc.array(fc.integer({ min: 0, max: 1000 }), { minLength: 18, maxLength: 18 }) }),
        ({ seed, club, formation, keys }) => {
          const world = generateLeague(seed);
          const id = world.clubs[club]!.id;
          const mine = squadOf(world, id)!;
          const eleven = xiFrom(mine, formation, keys);
          const afterOne = update(onHome(id, world), play);
          const state = deepFreeze({ ...walk(afterOne, [back]), formation, xi: eleven });
          const record = update(state, play).results!.slice(4);
          const sides: MatchSide[] = world.clubs.map((c, index) => {
            const squad = squadOf(world, c.id)!;
            return { squad, xi: index === club ? eleven : automaticXI(squad, "4-4-2") };
          });
          expect(record).toEqual(playMatchday({ seed: world.seed, matchday: 2, sides }));
        },
      ),
    );
  });

  it("Given Sam has played k matches (k = 1 to 3), when he taps any run of up to 40 formation, pick, Play match and navigation taps, then every earlier entry is still the very same object, the log stays whole matchdays 1..m, each Play match appends exactly what his eleven at that tap plays, and the table of the first k matchdays never changes (K3) @property @walking_skeleton @contract-shape:bounded-change", () => {
    const tinkering = fc.oneof(
      fc.constant<Action>(back), fc.constant<Action>(table), fc.constant<Action>({ type: "ViewSquad" }), fc.constant<Action>({ type: "ViewTactics" }),
      fc.constant<Action>({ type: "ViewStartingXI" }), fc.constant<Action>(play), fc.constant<Action>(play),
      fc.constantFrom(...FORMATIONS, "5-3-2").map((formation): Action => ({ type: "ChooseFormation", formation })),
      fc.integer({ min: -2, max: 12 }).map((slot): Action => ({ type: "ChooseSlot", slot })),
      fc.integer({ min: -2, max: PLAYERS_PER_SQUAD + 1 }).map((playerIndex): Action => ({ type: "PickPlayer", playerIndex })),
      fc.integer({ min: -2, max: PLAYERS_PER_SQUAD + 1 }).map((playerIndex): Action => ({ type: "ViewPlayer", playerIndex })),
    );
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 3 }), fc.array(tinkering, { maxLength: 40 }), (k, actions) => {
        const start = deepFreeze(cycle(onHome(), k));
        const prefix = start.results!;
        const prefixRows = standings(league.clubs, prefix);
        let state = start;
        for (const action of actions) {
          const next = deepFreeze(update(state, action));
          const recorded = next.results!;
          const kept = state.results!;
          expect(recorded.length % 4).toBe(0);
          expect(recorded.length).toBeLessThanOrEqual(56);
          prefix.forEach((entry, index) => expect(recorded[index]).toBe(entry));
          kept.forEach((entry, index) => expect(recorded[index]).toBe(entry));
          expect(recorded.map((entry) => entry.matchday)).toEqual(Array.from({ length: recorded.length }, (_, index) => Math.floor(index / 4) + 1));
          if (recorded.length > kept.length) {
            expect(action.type).toBe("PlayMatch");
            expect(recorded.slice(kept.length)).toEqual(expectedMatchday(state, managedOf(state), kept.length / 4 + 1));
          } else {
            expect(next.results).toBe(state.results);
          }
          expect(standings(league.clubs, recorded.slice(0, prefix.length))).toEqual(prefixRows);
          state = next;
        }
      }),
    );
  });
});

describe("@US-1 S-008 who scores in every match, and what is the same on every matchday", () => {
  it("Given any seed, club and formation chosen before each match, when Sam plays up to 6 matches, then in each the Goals follow the S-006 rules: minutes 1 to 90 never decreasing, one goal per count in the score line, his scorers outfield players of the eleven he had at the tap, the opponent's non-goalkeepers of its squad @property @driving_port @contract-shape:pure-function", () => {
    fc.assert(
      fc.property(fc.record({ seed: anySeed, club: fc.integer({ min: 0, max: 7 }), formations: fc.array(fc.constantFrom(...FORMATIONS), { minLength: 1, maxLength: 6 }) }), ({ seed, club, formations }) => {
        const world = generateLeague(seed);
        const id = world.clubs[club]!.id;
        let state = onHome(id, world);
        for (const [index, formation] of formations.entries()) {
          state = walk(state, choose(formation));
          const eleven = currentXI(state, squadOf(world, id)!);
          const played = update(state, play);
          const view = matchFor(played, id)!;
          expect(view.matchday).toBe(index + 1);
          const minutes = view.result.goals.map((g) => g.minute);
          expect(minutes.every((m) => Number.isInteger(m) && m >= 1 && m <= 90)).toBe(true);
          expect(minutes).toEqual([...minutes].sort((a, b) => a - b));
          expect(view.result.goals.filter((g) => g.side === "home")).toHaveLength(view.result.homeGoals);
          expect(view.result.goals.filter((g) => g.side === "away")).toHaveLength(view.result.awayGoals);
          for (const goal of view.result.goals) {
            const side = goal.side === "home" ? view.home : view.away;
            const scorer = side.squad[goal.playerIndex]!;
            expect(scorer.position, "never a goalkeeper").not.toBe("GK");
            if (side.club.id === id) expect(eleven, `${scorer.name} is on Sam's eleven`).toContain(goal.playerIndex);
          }
          state = update(played, back);
        }
      }),
    );
  });

  it("Given the same seed, club and choices in two fresh games, when Sam plays 3 matches in each, then the matches and the tables after each are identical; ?seed=abc plays the same season as no seed; another seed plays another @boundary @contract-shape:pure-function", () => {
    const threeMatches = (search: string, club: number): readonly unknown[] => {
      const world = generateLeague(parseSeed(search));
      let state = onHome(world.clubs[club]!.id, world);
      const seen: unknown[] = [];
      for (let k = 1; k <= 3; k++) {
        state = update(state, play);
        seen.push([matchFor(state, world.clubs[club]!.id), standingsOf(state)]);
        state = update(state, back);
      }
      return seen;
    };
    expect(threeMatches("?seed=31", 0)).toEqual(threeMatches("?seed=31", 0));
    expect(threeMatches("?seed=abc", 7)).toEqual(threeMatches("", 7));
    expect(threeMatches("?seed=31", 0)).not.toEqual(threeMatches("?seed=32", 0));
  });
});

describe("@US-1 S-008 the next matchday is read from what has been played", () => {
  it("Given a new game, when the next matchday is read, then it is 1, with no record or an empty one; after k whole matchdays it is k + 1, and after 13 it is 14 @boundary @driving_port @contract-shape:pure-function", () => {
    expect(nextMatchday(onHome())).toBe(1);
    expect(nextMatchday({ ...onHome(), results: [] })).toBe(1);
    for (const k of [1, 2, 3, 7, 13]) expect(nextMatchday(cycle(onHome(), k)), `after ${k}`).toBe(k + 1);
  });

  it("Given 14 matchdays are recorded, when the next matchday is read, then there is none @error @boundary @contract-shape:pure-function", () => {
    expect(nextMatchday(cycle(onHome(), 14))).toBeUndefined();
  });

  it("Given a log whose entries are not whole matchdays 1..k in order (unreachable in the app), when the next matchday is read, then it is the highest recorded matchday + 1, never the count / 4 + 1 (a loader must validate the log) @error @boundary @contract-shape:pure-function", () => {
    const log = (...matchdays: number[]): readonly PlayedMatch[] => matchdays.flatMap((m) => expectedMatchday(onHome(), clubId, m));
    expect(nextMatchday({ ...onHome(), results: log(3) })).toBe(4);
    expect(nextMatchday({ ...onHome(), results: log(2, 1) })).toBe(3);
    expect(nextMatchday({ ...onHome(), results: log(14) })).toBeUndefined();
    expect(nextMatchday({ ...onHome(), results: log(1, 2, 14) })).toBeUndefined();
  });

  it("Given any play-only run, when the next matchday is read after each tap, then it equals the number of recorded results / 4 + 1 and reading it changes nothing @property @boundary @contract-shape:pure-function", () => {
    fc.assert(
      fc.property(anySeed, fc.integer({ min: 0, max: 7 }), (seed, club) => {
        const world = generateLeague(seed);
        let state = deepFreeze(onHome(world.clubs[club]!.id, world));
        for (let k = 0; k <= 14; k++) {
          const expected = k < 14 ? k + 1 : undefined;
          expect(nextMatchday(state)).toBe(expected);
          expect((state.results?.length ?? 0) / 4 + 1).toBe(k + 1);
          state = deepFreeze(walk(state, [play, back]));
        }
      }),
      { numRuns: 25 },
    );
  });
});

describe("@US-1 S-008 what Sam taps in other places, and starting a new game", () => {
  it("Given eight results are recorded, when Play match is tapped off a known club's home (any other screen or an unknown club), then nothing happens (the very same state) @error @boundary @contract-shape:bounded-change", () => {
    const results = cycle(onHome(), 2).results!;
    for (const [label, screen] of OFF_HOME) {
      const state = deepFreeze(at(screen, { results }));
      expect(update(state, play), label).toBe(state);
    }
    const unknown = deepFreeze({ ...onHome("club-99"), results });
    expect(update(unknown, play)).toBe(unknown);
  });

  it("Given eight results are recorded, when Sam taps Table, Back, Squad, Tactics, Starting XI or anything else that is not Play match, then the very same array of results stays @driving_port @contract-shape:bounded-change", () => {
    const played = cycle(onHome(), 2);
    const states = [
      walk(played, [table]), walk(played, [table, back]), walk(played, CHOOSE_433), walk(played, [...CHOOSE_433, ...NORTHCOTT_IN_433]),
      walk(played, [{ type: "ViewSquad" }, { type: "ViewPlayer", playerIndex: 3 }, back, back]), walk(played, [{ type: "ViewStartingXI" }, back]),
    ];
    for (const state of states) expect(state.results).toBe(played.results);
  });

  it("Given the title with eight recorded results, when New game is tapped, then the whole log, the picks and the formation are gone and the next matchday is 1 again (a unit-level invariant: New game is only reachable by loading the page) @error @boundary @contract-shape:bounded-change", () => {
    const played = cycle(walk(onHome(), [...CHOOSE_433, ...NORTHCOTT_IN_433]), 2);
    const state = deepFreeze<GameState>({ ...played, screen: { kind: "title" } });
    const after = update(state, { type: "NewGame" });
    expect(after.screen).toEqual({ kind: "pickClub" });
    expect(after.results).toBeUndefined();
    expect(after.xi).toBeUndefined();
    expect(after.formation).toBe("4-4-2");
    expect(nextMatchday(after)).toBe(1);
    expect(standingsOf(after).every((row) => row.played === 0 && row.points === 0)).toBe(true);
  });
});

describe("@US-1 S-008 whatever Sam taps over a season, what is played stays played", () => {
  const anyAction: fc.Arbitrary<Action> = fc.oneof(
    { weight: 3, arbitrary: fc.constant<Action>(play) }, { weight: 3, arbitrary: fc.constant<Action>(back) }, { weight: 1, arbitrary: fc.constant<Action>(table) },
    { weight: 1, arbitrary: fc.constant<Action>({ type: "NewGame" }) }, { weight: 1, arbitrary: fc.constant<Action>({ type: "ViewSquad" }) },
    { weight: 1, arbitrary: fc.constant<Action>({ type: "ViewTactics" }) }, { weight: 1, arbitrary: fc.constant<Action>({ type: "ViewStartingXI" }) },
    { weight: 1, arbitrary: fc.constantFrom(...clubIds, "club-99").map((id): Action => ({ type: "ChooseClub", clubId: id })) },
    { weight: 1, arbitrary: fc.constantFrom(...FORMATIONS, "5-3-2").map((formation): Action => ({ type: "ChooseFormation", formation })) },
    { weight: 1, arbitrary: fc.integer({ min: -2, max: PLAYERS_PER_SQUAD + 1 }).map((playerIndex): Action => ({ type: "PickPlayer", playerIndex })) },
    { weight: 1, arbitrary: fc.integer({ min: -2, max: 12 }).map((slot): Action => ({ type: "ChooseSlot", slot })) },
    { weight: 1, arbitrary: fc.integer({ min: -2, max: PLAYERS_PER_SQUAD + 1 }).map((playerIndex): Action => ({ type: "ViewPlayer", playerIndex })) },
  );

  it("Given any seed, any of the 8 clubs and a run of up to 80 valid and invalid taps from its club home, when the table is read after each, then the game never throws, earlier entries never change, the log is whole matchdays 1..k (k at most 14), every row has P = k and the row rules hold @property @error @contract-shape:bounded-change", () => {
    fc.assert(
      fc.property(anySeed, fc.integer({ min: 0, max: 7 }), fc.array(anyAction, { maxLength: 80 }), (seed, club, actions) => {
        const world = generateLeague(seed);
        let state = deepFreeze(onHome(world.clubs[club]!.id, world));
        for (const action of actions) {
          const next = deepFreeze(update(state, action));
          const before = state.results ?? [];
          const recorded = next.results ?? [];
          if (action.type === "NewGame" && state.screen.kind === "title") {
            expect(recorded).toHaveLength(0);
          } else {
            before.forEach((entry, index) => expect(recorded[index]).toBe(entry));
          }
          expect([0, 4, 8, 12, 16, 20, 24, 28, 32, 36, 40, 44, 48, 52, 56]).toContain(recorded.length);
          expect(recorded.map((entry) => entry.matchday)).toEqual(Array.from({ length: recorded.length }, (_, index) => Math.floor(index / 4) + 1));
          for (const row of standingsOf(next)) {
            expect(row.played).toBe(recorded.length / 4);
            expect(row.won + row.drawn + row.lost).toBe(row.played);
            expect(row.points).toBe(3 * row.won + row.drawn);
          }
          if (next.screen.kind === "match") expect(next.results).toBeDefined();
          state = next;
        }
      }),
      { numRuns: 100 },
    );
  });
});

describe("@US-1 S-008 the S-006 and S-007 re-show cases that ADR-0014 supersedes, restated (the formation and picks are still never touched)", () => {
  it("Given Sam taps Play match, Back and Play match again, then the second match screen is matchday 2: eight entries, the first four the very same objects (S-006 again, S-007 re-show) @boundary @contract-shape:bounded-change", () => {
    const first = update(onHome(), play);
    const again = walk(first, [back, play]);
    expect(again.results).toHaveLength(8);
    first.results!.forEach((entry, index) => expect(again.results![index]).toBe(entry));
    expect(matchFor(again, clubId)!.matchday).toBe(2);
    expect(matchFor(again, clubId)).not.toEqual(matchFor(first, clubId));
    expect(again.formation).toBe(first.formation);
    expect(again.xi).toBe(first.xi);
  });

  it("Given the record exists, when Sam taps Back, Table, Squad, Tactics, Starting XI or any run of them, then the very same array stays; when he taps Play match again, the log is that array's entries followed by the next four @driving_port @contract-shape:bounded-change", () => {
    const played = walk(onHome(), [play]);
    const record = played.results!;
    const quiet = [walk(played, [back, table]), walk(played, [back, table, back]), walk(played, [back, ...CHOOSE_433]), walk(played, [back, ...CHOOSE_433, ...NORTHCOTT_IN_433]), walk(played, [back, { type: "ViewStartingXI" }, back])];
    for (const state of quiet) expect(state.results).toBe(record);
    const replay = update(walk(played, [back]), play);
    expect(replay.results).toHaveLength(8);
    record.forEach((entry, index) => expect(replay.results![index]).toBe(entry));
  });

  it("Given any run of up to 40 taps from the title (valid and invalid), when Sam plays, then the game never throws, earlier entries stay the very same objects, the log grows by whole matchdays up to 56 and every row's P equals the matchdays recorded @property @error @contract-shape:bounded-change", () => {
    fc.assert(
      fc.property(fc.array(anyActionFromTitle, { maxLength: 40 }), (actions) => {
        let state = deepFreeze(initialState(league));
        for (const action of actions) {
          const next = deepFreeze(update(state, action));
          const before = state.results ?? [];
          const recorded = next.results ?? [];
          if (!(action.type === "NewGame" && state.screen.kind === "title")) before.forEach((entry, index) => expect(recorded[index]).toBe(entry));
          expect(recorded.length % 4).toBe(0);
          expect(recorded.length).toBeLessThanOrEqual(56);
          if (next.screen.kind === "table") expect(clubIds).toContain(next.screen.clubId);
          for (const row of standingsOf(next)) expect(row.played).toBe(recorded.length / 4);
          state = next;
        }
      }),
    );
  });

  it("Given Sam has played, when he taps any run of up to 40 formation, pick, Play match and navigation taps, then the first matchday's table never changes and his first match entry is still the very same object (K3, with Play match in the pool) @property @walking_skeleton @contract-shape:bounded-change", () => {
    const tinkering = fc.oneof(
      fc.constant<Action>(back), fc.constant<Action>(table), fc.constant<Action>({ type: "ViewTactics" }), fc.constant<Action>({ type: "ViewStartingXI" }), fc.constant<Action>(play),
      fc.constantFrom(...FORMATIONS, "5-3-2").map((formation): Action => ({ type: "ChooseFormation", formation })),
      fc.integer({ min: -2, max: PLAYERS_PER_SQUAD + 1 }).map((playerIndex): Action => ({ type: "PickPlayer", playerIndex })),
    );
    const played = walk(onHome(), [play, back]);
    const firstFour = played.results!;
    const firstRows = standingsOf(played);
    fc.assert(
      fc.property(fc.array(tinkering, { maxLength: 40 }), (actions) => {
        let state = deepFreeze(played);
        for (const action of actions) {
          state = deepFreeze(update(state, action));
          firstFour.forEach((entry, index) => expect(state.results![index]).toBe(entry));
          expect(standings(league.clubs, state.results!.slice(0, 4))).toEqual(firstRows);
        }
      }),
    );
  });
});
