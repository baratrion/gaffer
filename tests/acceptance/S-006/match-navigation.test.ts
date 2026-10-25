// @US-1 @US-2 (S-006 play my first match) @walking_skeleton
// CONTRACT_SHAPE: bounded-change
// Outcome anchor: DISCUSS Elevator Pitch (US-1): on a club home Sam taps "Play match" and reaches the match screen; "Back" returns to
// the club home with the formation and the Starting XI as he left them; playing records nothing (D8). D10: wrong-screen actions and an
// unknown club are no-ops. Universe of the returned state: { league, screen, formation, xi }, with only `screen` changing. No-ops are
// the very same state object (toBe); changes are whole-state toEqual; no input is mutated (deep-frozen states).
// Also: matchFor (the selector main.ts calls) and focusPlan with the match screen.
// Destination: tests/acceptance/S-006/match-navigation.test.ts (DELIVER step 03).
import fc from "fast-check";
import { describe, expect, it } from "vitest";
import {
  currentXI, focusPlan, initialState, matchFor, OPENING_MATCHDAY, squadOf, update,
  type Action, type GameState, type Screen,
} from "../../../src/app/state";
import { FORMATIONS, lineUp, type FormationId } from "../../../src/domain/formation";
import { generateLeague } from "../../../src/domain/league";
import { playMatch, playMatchday, type MatchSide, type PlayedMatch } from "../../../src/domain/match";
import { fixtureOf } from "../../../src/domain/schedule";
import { automaticXI, playersForPosition } from "../../../src/domain/selection";
import { generateSquad, PLAYERS_PER_SQUAD, type Player, type Position } from "../../../src/domain/squad";

const league = generateLeague(31);
const clubId = league.clubs[0]!.id;
const rivalId = league.clubs[7]!.id;
const at = (screen: Screen, formation: FormationId = "4-4-2", xi?: readonly number[]): GameState => ({
  ...initialState(league),
  screen,
  formation,
  ...(xi === undefined ? {} : { xi }),
});
const onHome = (id = clubId, formation: FormationId = "4-4-2", xi?: readonly number[]) => at({ kind: "clubHome", clubId: id }, formation, xi);
const play: Action = { type: "PlayMatch" };
const back: Action = { type: "Back" };
const walk = (start: GameState, steps: readonly Action[]): GameState => steps.reduce(update, start);
const deepFreeze = <T>(value: T): T => {
  if (typeof value === "object" && value !== null && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const child of Object.values(value)) deepFreeze(child);
  }
  return value;
};
/** An arbitrary valid XI of a squad: per position, the players ordered by random keys, dealt in lineUp order. */
const xiFrom = (squad: readonly Player[], formation: FormationId, keys: readonly number[]): readonly number[] => {
  const taken: Record<Position, number> = { GK: 0, DF: 0, MF: 0, FW: 0 };
  const ordered = Object.fromEntries(
    (["GK", "DF", "MF", "FW"] as const).map((position) => [position, [...playersForPosition(squad, position)].sort((a, b) => keys[a]! - keys[b]! || a - b)]),
  ) as Record<Position, number[]>;
  return lineUp(formation).map((position) => ordered[position][taken[position]++]!);
};
/** The matchday-1 record Play match makes (S-007 D1), worked out independently of the app: Sam's side is his current eleven, every other side its automatic 4-4-2. */
const expectedRecord = (state: GameState, managedId: string): readonly PlayedMatch[] => {
  const sides: MatchSide[] = state.league.clubs.map((club) => {
    const squad = squadOf(state.league, club.id)!;
    return { squad, xi: club.id === managedId ? currentXI(state, squad) : automaticXI(squad, "4-4-2") };
  });
  return playMatchday({ seed: state.league.seed, matchday: 1, sides });
};
const NORTHCOTT_FOR_DUNMORE = [0, 7, 3, 6, 2, 9, 12, 8, 13, 17, 14] as const; // slot 8 (Dorian Dunmore, squad row 10) -> Kestrel Northcott (row 13)

const OFF_HOME: readonly [string, GameState][] = [
  ["the title", at({ kind: "title" })],
  ["the club list", at({ kind: "pickClub" })],
  ["the squad", at({ kind: "squad", clubId })],
  ["a player", at({ kind: "player", clubId, playerIndex: 3 })],
  ["the tactics", at({ kind: "tactics", clubId })],
  ["the Starting XI", at({ kind: "startingXI", clubId })],
  ["a slot's choice", at({ kind: "choosePlayer", clubId, slot: 8 })],
  ["the match", at({ kind: "match", clubId })],
];

describe("@US-1 S-006 Sam sends his team out from the club home and comes back to it unchanged", () => {
  describe("Given a club home", () => {
    it("when Sam taps Play match, then the match screen of that club is shown and nothing else in the game changes @walking_skeleton @driving_port @contract-shape:bounded-change", () => {
      const state = deepFreeze(onHome());
      expect(update(state, play)).toEqual({ ...state, screen: { kind: "match", clubId }, results: expectedRecord(state, clubId) });
    });

    it("when Sam taps Play match from any club home, with any formation and any picks, then only the screen changes and the formation and picks are kept @property @contract-shape:bounded-change", () => {
      fc.assert(
        fc.property(fc.constantFrom(...league.clubs.map((club) => club.id)), fc.constantFrom(...FORMATIONS), fc.boolean(), (id, formation, picked) => {
          const squad = squadOf(league, id)!;
          const xi = picked ? automaticXI(squad, formation) : undefined;
          const state = deepFreeze(onHome(id, formation, xi));
          const after = update(state, play);
          expect(after.screen).toEqual({ kind: "match", clubId: id });
          expect(after.formation).toBe(formation);
          expect(after.league).toBe(league);
          expect(after.xi).toBe(state.xi);
          expect(Object.hasOwn(after, "xi")).toBe(Object.hasOwn(state, "xi"));
        }),
      );
    });

    it("when Sam taps Play match and then Back, then the club home is shown again and the whole state is what it was, picks included @walking_skeleton @driving_port @contract-shape:bounded-change", () => {
      for (const state of [onHome(), onHome(clubId, "4-3-3"), onHome(clubId, "4-4-2", NORTHCOTT_FOR_DUNMORE), onHome(rivalId, "4-2-3-1")]) {
        expect(walk(deepFreeze(state), [play, back])).toEqual({ ...state, results: expectedRecord(state, state.screen.kind === "clubHome" ? state.screen.clubId : clubId) });
      }
    });

    it("when Sam taps Play match, Back and Play match again, then the second match screen is matchday 2 (eight entries, the first four the very same objects) @boundary @contract-shape:bounded-change", () => {
      const first = update(onHome(), play);
      const again = walk(first, [back, play]);
      expect(again.results).toHaveLength(8);
      first.results!.forEach((entry, i) => expect(again.results![i]).toBe(entry));
      expect(again.screen).toEqual({ kind: "match", clubId });
      expect(matchFor(again, clubId)!.matchday).toBe(2);
      expect(matchFor(again, clubId)).not.toEqual(matchFor(first, clubId));
      expect(again.formation).toBe(first.formation);
      expect(again.xi).toBe(first.xi);
    });

    it("when the club is not in the league, then Play match changes nothing (the very same state) @error @boundary @contract-shape:bounded-change", () => {
      const state = deepFreeze(onHome("club-99"));
      expect(update(state, play)).toBe(state);
    });
  });

  describe("Given any screen but a known club's home", () => {
    it.each(OFF_HOME)("when Sam taps Play match on %s, then nothing happens (the very same state) @driving_port @error @contract-shape:bounded-change", (_label, state) => {
      const frozen = deepFreeze(state);
      expect(update(frozen, play)).toBe(frozen);
    });

    it("when Sam taps Play match with picks stored on any of those screens, then nothing happens either @error @boundary @contract-shape:bounded-change", () => {
      for (const [, state] of OFF_HOME) {
        const withPicks = deepFreeze({ ...state, xi: NORTHCOTT_FOR_DUNMORE });
        expect(update(withPicks, play)).toBe(withPicks);
      }
    });
  });

  describe("Given the match screen", () => {
    it("when Sam taps Back, then the club home of that club is shown with the formation and the picks as they were @driving_port @contract-shape:bounded-change", () => {
      const state = deepFreeze(at({ kind: "match", clubId }, "4-3-3", NORTHCOTT_FOR_DUNMORE));
      expect(update(state, back)).toEqual({ ...state, screen: { kind: "clubHome", clubId } });
    });

    it("when the club is not in the league, then Back changes nothing (the very same state) @error @boundary @contract-shape:bounded-change", () => {
      const state = deepFreeze(at({ kind: "match", clubId: "club-99" }));
      expect(update(state, back)).toBe(state);
    });

    it("when Sam taps anything else the match screen offers no button for (Squad, Tactics, Starting XI, a player, a pick, New game, a club, a formation), then nothing happens @error @contract-shape:bounded-change", () => {
      const state = deepFreeze(at({ kind: "match", clubId }));
      const actions: Action[] = [
        { type: "ViewSquad" }, { type: "ViewTactics" }, { type: "ViewStartingXI" }, { type: "ViewPlayer", playerIndex: 0 },
        { type: "ChooseSlot", slot: 0 }, { type: "PickPlayer", playerIndex: 0 }, { type: "NewGame" }, { type: "ChooseClub", clubId }, { type: "ChooseFormation", formation: "4-3-3" },
        play,
      ];
      for (const action of actions) expect(update(state, action)).toBe(state);
    });
  });

  describe("Given Sam's whole way from the title", () => {
    it("when he starts a new game, picks the first club, plays the match and goes back, then he is on that club's home, the screen walk was title, club list, club home, match, club home @walking_skeleton @driving_port @contract-shape:bounded-change", () => {
      const steps: Action[] = [{ type: "NewGame" }, { type: "ChooseClub", clubId }, play];
      const screens = [initialState(league)];
      for (const action of [...steps, back]) screens.push(update(screens.at(-1)!, action));
      expect(screens.map((s) => s.screen.kind)).toEqual(["title", "pickClub", "clubHome", "match", "clubHome"]);
      expect(screens.at(-1)!.screen).toEqual({ kind: "clubHome", clubId });
      expect(screens.at(-1)!.formation).toBe("4-4-2");
    });

    it("when he changes the formation to 4-3-3, picks Kestrel Northcott, plays the match and goes back, then 4-3-3 and the pick are still there @walking_skeleton @driving_port @contract-shape:bounded-change", () => {
      const after = walk(onHome(), [
        { type: "ViewTactics" }, { type: "ChooseFormation", formation: "4-3-3" }, back,
        { type: "ViewStartingXI" }, { type: "ChooseSlot", slot: 7 }, { type: "PickPlayer", playerIndex: 13 }, back,
        play, back,
      ]);
      expect(after.screen).toEqual({ kind: "clubHome", clubId });
      expect(after.formation).toBe("4-3-3");
      const squad = squadOf(league, clubId)!;
      expect(after.xi).toEqual([0, 7, 3, 6, 2, 9, 12, 13, 17, 14, 16]);
      expect(currentXI(after, squad)).toBe(after.xi);
    });

    it("when he plays any run of up to 40 taps (valid and invalid, Play match and Back among them), then the game never throws, the playing taps never touch the formation or the picks, and a match screen is always for a club in the league @property @error @contract-shape:bounded-change", () => {
      const anyAction: fc.Arbitrary<Action> = fc.oneof(
        fc.constant<Action>({ type: "NewGame" }), fc.constant<Action>(play), fc.constant<Action>(back),
        fc.constant<Action>({ type: "ViewSquad" }), fc.constant<Action>({ type: "ViewTactics" }), fc.constant<Action>({ type: "ViewStartingXI" }),
        fc.constantFrom(...league.clubs.map((c) => c.id), "club-99").map((id): Action => ({ type: "ChooseClub", clubId: id })),
        fc.constantFrom(...FORMATIONS, "5-3-2").map((formation): Action => ({ type: "ChooseFormation", formation })),
        fc.integer({ min: -2, max: PLAYERS_PER_SQUAD + 1 }).map((playerIndex): Action => ({ type: "PickPlayer", playerIndex })),
        fc.integer({ min: -2, max: 12 }).map((slot): Action => ({ type: "ChooseSlot", slot })),
        fc.integer({ min: -2, max: PLAYERS_PER_SQUAD + 1 }).map((playerIndex): Action => ({ type: "ViewPlayer", playerIndex })),
      );
      fc.assert(
        fc.property(fc.array(anyAction, { maxLength: 40 }), (actions) => {
          let state = deepFreeze(initialState(league));
          for (const action of actions) {
            const next = deepFreeze(update(state, action));
            if (action.type === "PlayMatch" || (action.type === "Back" && state.screen.kind === "match")) {
              expect(next.formation).toBe(state.formation);
              expect(next.xi).toBe(state.xi);
              expect(next.league).toBe(state.league);
            }
            if (next.screen.kind === "match") expect(league.clubs.map((c) => c.id)).toContain(next.screen.clubId);
            state = next;
          }
        }),
      );
    });
  });
});

describe("@US-1 @US-2 S-006 the match behind the screen is worked out from the game as it stands", () => {
  it("Given the opening matchday, when read, then it is matchday 1 @boundary @contract-shape:pure-function", () => {
    expect(OPENING_MATCHDAY).toBe(1);
  });

  it("Given a club that is not in the league, when its match is asked for, then there is none @error @driving_port @contract-shape:pure-function", () => {
    expect(matchFor(onHome(), "club-99")).toBeUndefined();
    expect(matchFor(onHome(), "")).toBeUndefined();
  });

  it("Given Sam manages Netherwold Borough at seed 31 with untouched tactics, when his match is asked for, then it is matchday 1, Netherwold Borough at home to Marlbrook Athletic, and the golden result 1–2 @walking_skeleton @driving_port @contract-shape:pure-function", () => {
    const shown = matchFor(deepFreeze(onHome()), clubId)!;
    expect(shown.matchday).toBe(1);
    expect([shown.home.club.name, shown.away.club.name]).toEqual(["Netherwold Borough", "Marlbrook Athletic"]);
    expect([shown.result.homeGoals, shown.result.awayGoals]).toEqual([1, 2]);
    expect(shown.result.goals.map((g) => [g.minute, g.side, (g.side === "home" ? shown.home : shown.away).squad[g.playerIndex]!.name])).toEqual([
      [17, "away", "Rurik Fairbourne"], [22, "home", "Calder Redfern"], [77, "away", "Rurik Fairbourne"],
    ]);
  });

  it("Given Sam manages the opponent instead (same seed, untouched tactics), when its match is asked for, then the same two clubs come in the same order with a deep-equal result @driving_port @contract-shape:pure-function", () => {
    const mine = matchFor(onHome(clubId), clubId)!;
    const theirs = matchFor(onHome(rivalId), rivalId)!;
    expect([theirs.home.club.name, theirs.away.club.name]).toEqual([mine.home.club.name, mine.away.club.name]);
    expect(theirs.result).toEqual(mine.result);
  });

  it("Given any seed and any of the 8 clubs managed in turn with untouched tactics, when their matches are asked for, then the 8 matches form 4 pairings with every club in exactly one, home first as the schedule says, and both clubs of a pairing see the same result @property @contract-shape:pure-function", () => {
    fc.assert(
      fc.property(fc.integer({ min: -(2 ** 31), max: 2 ** 31 - 1 }), (seed) => {
        const lg = generateLeague(seed);
        const matches = lg.clubs.map((club) => matchFor({ ...initialState(lg), screen: { kind: "clubHome", clubId: club.id } }, club.id)!);
        const pairings = new Set(matches.map((m) => `${m.home.club.id}|${m.away.club.id}`));
        expect(pairings.size).toBe(4);
        lg.clubs.forEach((club, index) => {
          const { fixture } = fixtureOf(OPENING_MATCHDAY, index);
          expect([matches[index]!.home.club.id, matches[index]!.away.club.id]).toEqual([lg.clubs[fixture.home]!.id, lg.clubs[fixture.away]!.id]);
          const mirror = matches[index === fixture.home ? fixture.away : fixture.home]!;
          expect(mirror.result).toEqual(matches[index]!.result);
        });
      }),
    );
  });

  it("Given any seed, club, formation and optional picks, when the managed club's match is asked for, then it is the schedule's matchday-1 fixture played with the managed side's current eleven and the other side's automatic 4-4-2 @driving_port @property @contract-shape:pure-function", () => {
    const anyGame = fc.record({
      seed: fc.integer({ min: -(2 ** 31), max: 2 ** 31 - 1 }),
      club: fc.integer({ min: 0, max: 7 }),
      formation: fc.constantFrom(...FORMATIONS),
      keys: fc.option(fc.array(fc.integer({ min: 0, max: 1000 }), { minLength: 18, maxLength: 18 }), { nil: undefined }),
    });
    fc.assert(
      fc.property(anyGame, ({ seed, club, formation, keys }) => {
        const lg = generateLeague(seed);
        const id = lg.clubs[club]!.id;
        const mine = generateSquad(seed, club);
        const xi = keys === undefined ? undefined : xiFrom(mine, formation, keys);
        const state = deepFreeze({ ...initialState(lg), screen: { kind: "clubHome", clubId: id } as Screen, formation, ...(xi === undefined ? {} : { xi }) });
        const { index, fixture } = fixtureOf(OPENING_MATCHDAY, club);
        const sideFor = (k: number) => {
          const squad = generateSquad(seed, k);
          return { squad, xi: k === club ? (xi ?? automaticXI(squad, formation)) : automaticXI(squad, "4-4-2") };
        };
        const expected = playMatch({ seed, matchday: 1, fixtureIndex: index, home: sideFor(fixture.home), away: sideFor(fixture.away) });
        const shown = matchFor(state, id)!;
        expect(shown.result).toEqual(expected);
        expect([shown.home.club.id, shown.away.club.id]).toEqual([lg.clubs[fixture.home]!.id, lg.clubs[fixture.away]!.id]);
        expect(shown.home.squad).toEqual(generateSquad(seed, fixture.home));
      }),
    );
  });

  it("Given Sam has picked Kestrel Northcott for Dorian Dunmore, when his match is asked for, then his side is that stored eleven and the opponent still fields its automatic 4-4-2 @driving_port @contract-shape:pure-function", () => {
    const state = deepFreeze(onHome(clubId, "4-4-2", NORTHCOTT_FOR_DUNMORE));
    const shown = matchFor(state, clubId)!;
    const opponent = squadOf(league, rivalId)!;
    expect(shown.result).toEqual(
      playMatch({
        seed: 31, matchday: 1, fixtureIndex: 0,
        home: { squad: squadOf(league, clubId)!, xi: NORTHCOTT_FOR_DUNMORE },
        away: { squad: opponent, xi: automaticXI(opponent, "4-4-2") },
      }),
    );
    for (const goal of shown.result.goals.filter((g) => g.side === "home")) {
      expect(NORTHCOTT_FOR_DUNMORE).toContain(goal.playerIndex);
      expect(goal.playerIndex).not.toBe(10);
      expect(goal.playerIndex).not.toBe(0);
    }
  });

  it("Given Sam chose 4-3-3 and picked nothing, when his match is asked for, then his side is the automatic 4-3-3 eleven and the opponent's is still the automatic 4-4-2 @driving_port @contract-shape:pure-function", () => {
    const shown = matchFor(onHome(clubId, "4-3-3"), clubId)!;
    const [mine, theirs] = [squadOf(league, clubId)!, squadOf(league, rivalId)!];
    expect(shown.result).toEqual(
      playMatch({ seed: 31, matchday: 1, fixtureIndex: 0, home: { squad: mine, xi: automaticXI(mine, "4-3-3") }, away: { squad: theirs, xi: automaticXI(theirs, "4-4-2") } }),
    );
  });

  it("Given Sam manages the away club with 4-3-3, when his match is asked for, then the home club (the opponent) still fields 4-4-2 @boundary @contract-shape:pure-function", () => {
    const shown = matchFor(onHome(rivalId, "4-3-3"), rivalId)!;
    const [home, away] = [squadOf(league, clubId)!, squadOf(league, rivalId)!];
    expect(shown.result).toEqual(
      playMatch({ seed: 31, matchday: 1, fixtureIndex: 0, home: { squad: home, xi: automaticXI(home, "4-4-2") }, away: { squad: away, xi: automaticXI(away, "4-3-3") } }),
    );
  });

  it("Given the same game asked twice, when the match is derived, then the two are deep-equal and the game is not changed (nothing is stored) @property @contract-shape:pure-function", () => {
    fc.assert(
      fc.property(fc.constantFrom(...league.clubs.map((c) => c.id)), fc.constantFrom(...FORMATIONS), (id, formation) => {
        const state = deepFreeze(onHome(id, formation));
        const before = JSON.stringify(state);
        expect(matchFor(state, id)).toEqual(matchFor(state, id));
        expect(JSON.stringify(state)).toBe(before);
      }),
    );
  });
});

describe("@US-1 S-006 focus goes to the new heading when Sam opens the match or comes back", () => {
  const home: Screen = { kind: "clubHome", clubId };
  const match: Screen = { kind: "match", clubId };

  it("Given the club home, when the match screen opens, or the match screen goes back to the club home, then focus goes to the heading (with or without an element id) @walking_skeleton @driving_port @contract-shape:pure-function", () => {
    expect(focusPlan(home, match, undefined)).toEqual({ kind: "heading" });
    expect(focusPlan(home, match, "x")).toEqual({ kind: "heading" });
    expect(focusPlan(match, home, undefined)).toEqual({ kind: "heading" });
    expect(focusPlan(match, home, "x")).toEqual({ kind: "heading" });
    expect(focusPlan(undefined, match, undefined)).toEqual({ kind: "heading" });
  });

  it("Given any screen that is not the match, when the match screen opens, then focus goes to the heading @property @boundary @contract-shape:pure-function", () => {
    for (const [, state] of OFF_HOME.filter(([label]) => label !== "the match")) expect(focusPlan(state.screen, match, "x")).toEqual({ kind: "heading" });
  });

  it("Given the match screen of one club redrawn, when an element id is given, then that element is focused; without an id or with an empty one, the heading; for another club, the heading @boundary @contract-shape:pure-function", () => {
    expect(focusPlan(match, { kind: "match", clubId }, "goals-label")).toEqual({ kind: "element", id: "goals-label" });
    expect(focusPlan(match, { kind: "match", clubId }, undefined)).toEqual({ kind: "heading" });
    expect(focusPlan(match, { kind: "match", clubId }, "")).toEqual({ kind: "heading" });
    expect(focusPlan(match, { kind: "match", clubId: rivalId }, "goals-label")).toEqual({ kind: "heading" });
  });
});
