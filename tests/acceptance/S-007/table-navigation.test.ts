// @US-1 @US-2 (S-007 see the league table after my first match) @walking_skeleton
// CONTRACT_SHAPE: bounded-change
// Outcome anchor: DISCUSS Elevator Pitches (US-1, US-2) and D1, D2, D3, D8, D9, D12. On a club home Sam taps "Table" and reaches the
// table screen; "Back" returns to the club home as it was (D8). The first "Play match" of a new game records the four matchday-1 results
// (D1: Sam's side is his current eleven, every other side its automatic 4-4-2), the match screen and the table then read only that record
// (D2), a second "Play match" re-shows the same match, and formation, picks and visits never move it (K3). "New game" drops it (D9, a
// unit-level invariant). Universe of the returned state: { league, screen, formation, xi, results }; no-ops are the very same object
// (toBe); changes are whole-state toEqual; states are deep-frozen so nothing is mutated.
// Section 5 restates the three S-006 cases that D12 supersedes ("changes nothing but the screen", "Back restores the whole state",
// "nothing is recorded"), now with the record; DELIVER replaces those three in tests/acceptance/S-006/match-navigation.test.ts (see
// upstream-issues U-2), never weakening them.
// Destination: tests/acceptance/S-007/table-navigation.test.ts (DELIVER step 03).
import fc from "fast-check";
import { describe, expect, it } from "vitest";
import {
  currentXI, focusPlan, initialState, matchFor, playOpeningMatchday, squadOf, standingsOf, update,
  type Action, type GameState, type Screen,
} from "../../../src/app/state";
import { parseSeed } from "../../../src/app/seed";
import { FORMATIONS, type FormationId } from "../../../src/domain/formation";
import { generateLeague } from "../../../src/domain/league";
import { playMatchday, type MatchSide, type PlayedMatch } from "../../../src/domain/match";
import { automaticXI } from "../../../src/domain/selection";
import { PLAYERS_PER_SQUAD } from "../../../src/domain/squad";
import { standings } from "../../../src/domain/standings";

const league = generateLeague(31);
const clubIds = league.clubs.map((club) => club.id);
const clubId = clubIds[0]!;
const rivalId = clubIds[7]!;
const at = (screen: Screen, formation: FormationId = "4-4-2", extras: { readonly xi?: readonly number[]; readonly results?: readonly PlayedMatch[] } = {}): GameState => ({
  ...initialState(league),
  screen,
  formation,
  ...extras,
});
const onHome = (id = clubId, formation: FormationId = "4-4-2", xi?: readonly number[]) => at({ kind: "clubHome", clubId: id }, formation, xi === undefined ? {} : { xi });
const play: Action = { type: "PlayMatch" };
const back: Action = { type: "Back" };
const table: Action = { type: "ViewTable" };
const walk = (start: GameState, steps: readonly Action[]): GameState => steps.reduce(update, start);
const deepFreeze = <T>(value: T): T => {
  if (typeof value === "object" && value !== null && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const child of Object.values(value)) deepFreeze(child);
  }
  return value;
};
const anySeed = fc.integer({ min: -(2 ** 31), max: 2 ** 31 - 1 });
/** The expected record, worked out independently of the app: Sam's side is his current eleven, every other side its automatic 4-4-2. */
const expectedRecord = (state: GameState, managedId: string): readonly PlayedMatch[] => {
  const sides: MatchSide[] = state.league.clubs.map((club) => {
    const squad = squadOf(state.league, club.id)!;
    return { squad, xi: club.id === managedId ? currentXI(state, squad) : automaticXI(squad, "4-4-2") };
  });
  return playMatchday({ seed: state.league.seed, matchday: 1, sides });
};
const NORTHCOTT_IN_433 = [{ type: "ViewStartingXI" }, { type: "ChooseSlot", slot: 7 }, { type: "PickPlayer", playerIndex: 13 }, back] as const satisfies readonly Action[];
const CHOOSE_433 = [{ type: "ViewTactics" }, { type: "ChooseFormation", formation: "4-3-3" }, back] as const satisfies readonly Action[];

const OFF_HOME: readonly [string, Screen][] = [
  ["the title", { kind: "title" }],
  ["the club list", { kind: "pickClub" }],
  ["the squad", { kind: "squad", clubId }],
  ["a player", { kind: "player", clubId, playerIndex: 3 }],
  ["the tactics", { kind: "tactics", clubId }],
  ["the Starting XI", { kind: "startingXI", clubId }],
  ["a slot's choice", { kind: "choosePlayer", clubId, slot: 8 }],
  ["the match", { kind: "match", clubId }],
  ["the table", { kind: "table", clubId }],
];
const fixedResults = (): readonly PlayedMatch[] => expectedRecord(onHome(), clubId);

describe("@US-1 S-007 Sam opens the league table from the club home and comes back to it unchanged", () => {
  it("Given a club home, when Sam taps Table, then the table of that club is shown and nothing else in the game changes @walking_skeleton @driving_port @contract-shape:bounded-change", () => {
    const state = deepFreeze(onHome());
    const after = update(state, table);
    expect(after).toEqual({ ...state, screen: { kind: "table", clubId } });
    expect(Object.keys(after)).not.toContain("results");
  });

  it("Given any club home, formation and picks, when Sam taps Table, then only the screen changes and the formation, picks and record are kept @property @contract-shape:bounded-change", () => {
    fc.assert(
      fc.property(fc.record({ id: fc.constantFrom(...clubIds), formation: fc.constantFrom(...FORMATIONS), picked: fc.boolean(), recorded: fc.boolean() }), ({ id, formation, picked, recorded }) => {
        const squad = squadOf(league, id)!;
        const base = onHome(id, formation, picked ? automaticXI(squad, formation) : undefined);
        const state = deepFreeze(recorded ? { ...base, results: playOpeningMatchday(base, id) } : base);
        const after = update(state, table);
        expect(after.screen).toEqual({ kind: "table", clubId: id });
        expect(after.formation).toBe(formation);
        expect(after.xi).toBe(state.xi);
        expect(after.results).toBe(state.results);
        expect(after.league).toBe(league);
      }),
    );
  });

  it("Given the table, when Sam taps Back, then the club home of that club is shown and the whole state is what it was before Table, picks and record included @walking_skeleton @driving_port @contract-shape:bounded-change", () => {
    for (const start of [onHome(), walk(onHome(), [...CHOOSE_433, ...NORTHCOTT_IN_433]), walk(onHome(), [play, back])]) {
      expect(update(update(deepFreeze(start), table), back)).toEqual(start);
    }
  });

  it("Given the table of a club that is not in the league, when Sam taps Back, then nothing happens (the very same state) @error @boundary @contract-shape:bounded-change", () => {
    const state = at({ kind: "table", clubId: "club-99" });
    expect(update(state, back)).toBe(state);
  });

  it("Given a club that is not in the league, when Table is tapped on its home, then nothing happens (the very same state) @error @boundary @contract-shape:bounded-change", () => {
    const state = onHome("club-99");
    expect(update(state, table)).toBe(state);
  });

  it.each(OFF_HOME)("Given %s, when Table is tapped there, then nothing happens (the very same state), with or without a record @driving_port @error @contract-shape:bounded-change", (_label, screen) => {
    const plain = at(screen);
    expect(update(plain, table)).toBe(plain);
    const recorded = at(screen, "4-4-2", { results: fixedResults() });
    expect(update(recorded, table)).toBe(recorded);
  });

  it("Given the table screen, when Sam taps anything else it offers no button for (Squad, Tactics, Starting XI, a player, a pick, Play match, New game, a club, a formation, Table), then nothing happens @error @contract-shape:bounded-change", () => {
    const state = at({ kind: "table", clubId }, "4-4-2", { results: fixedResults() });
    const others: Action[] = [
      { type: "ViewSquad" }, { type: "ViewTactics" }, { type: "ViewStartingXI" }, { type: "ViewPlayer", playerIndex: 2 }, { type: "ChooseSlot", slot: 3 },
      { type: "PickPlayer", playerIndex: 4 }, { type: "ChooseFormation", formation: "4-3-3" }, { type: "PlayMatch" }, { type: "NewGame" },
      { type: "ChooseClub", clubId: rivalId }, table,
    ];
    for (const action of others) expect(update(state, action), action.type).toBe(state);
  });
});

describe("@US-2 S-007 the first Play match records the matchday for the whole league", () => {
  it("Given a new game on Netherwold Borough with untouched tactics, when Sam taps Play match, then the match screen is shown and the four matchday-1 results are recorded, Sam's side being his current eleven and every other side its automatic 4-4-2 @walking_skeleton @driving_port @contract-shape:bounded-change", () => {
    const state = deepFreeze(onHome());
    const after = update(state, play);
    expect(after.screen).toEqual({ kind: "match", clubId });
    expect(after.results).toHaveLength(4);
    expect(after.results).toEqual(expectedRecord(state, clubId));
    expect(after.results!.map((entry) => `${entry.result.homeGoals}–${entry.result.awayGoals}`)).toEqual(["1–2", "2–2", "5–1", "1–3"]);
    expect(after.formation).toBe(state.formation);
    expect(after.xi).toBe(state.xi);
  });

  it("Given any seed, any of the 8 clubs, any formation and optional picks, when Sam taps Play match, then the record is exactly the four fixtures of matchday 1 and only Sam's own fixture reads his tactics @property @driving_port @contract-shape:bounded-change", () => {
    fc.assert(
      fc.property(fc.record({ seed: anySeed, club: fc.integer({ min: 0, max: 7 }), formation: fc.constantFrom(...FORMATIONS), picked: fc.boolean() }), ({ seed, club, formation, picked }) => {
        const world = generateLeague(seed);
        const id = world.clubs[club]!.id;
        const squad = squadOf(world, id)!;
        const state = deepFreeze<GameState>({
          ...initialState(world), screen: { kind: "clubHome", clubId: id }, formation,
          ...(picked ? { xi: automaticXI(squad, "4-4-2") } : {}),
        });
        const record = update(state, play).results!;
        expect(record).toEqual(expectedRecord(state, id));
        const untouched = update({ ...state, formation: "4-4-2" as const, xi: undefined }, play).results!;
        record.forEach((entry, k) => {
          if (entry.home !== club && entry.away !== club) expect(entry).toEqual(untouched[k]);
        });
      }),
    );
  });

  it("Given untouched tactics, when each of the 8 clubs is managed in turn and plays, then the record is the same set of results whoever is managed @property @boundary @contract-shape:bounded-change", () => {
    fc.assert(
      fc.property(anySeed, (seed) => {
        const world = generateLeague(seed);
        const records = world.clubs.map((c) => update({ ...initialState(world), screen: { kind: "clubHome", clubId: c.id } }, play).results);
        for (const record of records) expect(record).toEqual(records[0]);
      }),
    );
  });

  it("Given the record exists, when Sam taps Play match again, Back, Table or anything on the way, then the very same array stays; Play match again appends the next four @driving_port @contract-shape:bounded-change", () => {
    const played = walk(onHome(), [play]);
    const record = played.results!;
    const states = [
      walk(played, [back, table]), walk(played, [back, table, back]),
      walk(played, [back, ...CHOOSE_433]), walk(played, [back, ...CHOOSE_433, ...NORTHCOTT_IN_433]),
      walk(played, [back, { type: "ViewSquad" }, { type: "ViewPlayer", playerIndex: 3 }, back, back]),
      walk(played, [back, { type: "ViewTactics" }, back, { type: "ViewStartingXI" }, back]),
    ];
    for (const state of states) expect(state.results).toBe(record);
    const again = update(walk(played, [back]), play);
    expect(again.results).toHaveLength(8);
    record.forEach((entry, i) => expect(again.results![i]).toBe(entry));
  });

  it("Given Sam has played, when he changes the formation, picks Kestrel Northcott for Calder Redfern and visits Squad and Tactics, then the table and his match are exactly as before @walking_skeleton @driving_port @contract-shape:bounded-change", () => {
    const played = walk(onHome(), [play, back]);
    const before = { table: standingsOf(played), match: matchFor(played, clubId) };
    const tinkered = walk(played, [...CHOOSE_433, ...NORTHCOTT_IN_433, { type: "ViewSquad" }, back, { type: "ViewTactics" }, back]);
    expect(tinkered.formation).toBe("4-3-3");
    expect(currentXI(tinkered, squadOf(league, clubId)!)[7]).toBe(13);
    expect(standingsOf(tinkered)).toEqual(before.table);
    expect(matchFor(tinkered, clubId)).toEqual(before.match);
    expect(tinkered.results).toBe(played.results);
  });

  it("Given a new game, when Sam changes to 4-3-3 and picks before the first Play match, then his own fixture is played with that eleven and the other three are as with untouched tactics @boundary @contract-shape:bounded-change", () => {
    const tuned = walk(onHome(), [...CHOOSE_433, ...NORTHCOTT_IN_433]);
    const record = update(tuned, play).results!;
    const untouched = update(onHome(), play).results!;
    expect(record).toEqual(expectedRecord(tuned, clubId));
    expect(record.slice(1)).toEqual(untouched.slice(1));
  });

  it("Given a recorded matchday, when it is written out and read back, then nothing is lost (plain data only) @boundary @contract-shape:bounded-change", () => {
    const record = walk(onHome(), [play]).results!;
    expect(JSON.parse(JSON.stringify(record))).toEqual(record);
  });

  it("Given a state that never played, when Sam walks Squad, a player, Tactics, a formation, Starting XI, Table and Back, then no record appears @boundary @contract-shape:bounded-change", () => {
    const after = walk(onHome(), [{ type: "ViewSquad" }, { type: "ViewPlayer", playerIndex: 1 }, back, back, ...CHOOSE_433, ...NORTHCOTT_IN_433, table, back]);
    expect(Object.keys(after)).not.toContain("results");
    expect(after.results).toBeUndefined();
  });

  it("Given the title with a record, when New game is tapped, then the record is gone and the formation is 4-4-2 again (a unit-level invariant: New game is only reachable by loading the page) @error @boundary @contract-shape:bounded-change", () => {
    const state = deepFreeze({ ...at({ kind: "title" }, "4-3-3", { xi: [0, 7, 3, 6, 2, 9, 12, 13, 17, 14, 16] }), results: fixedResults() });
    const after = update(state, { type: "NewGame" });
    expect(after.screen).toEqual({ kind: "pickClub" });
    expect(after.results).toBeUndefined();
    expect(after.xi).toBeUndefined();
    expect(after.formation).toBe("4-4-2");
    expect(standingsOf(after).every((row) => row.played === 0 && row.points === 0)).toBe(true);
  });

  it("Given a record, when Play match is tapped off a known club's home (any other screen or an unknown club), then nothing happens (the very same state) @error @boundary @contract-shape:bounded-change", () => {
    for (const [, screen] of OFF_HOME) {
      const state = at(screen, "4-4-2", { results: fixedResults() });
      expect(update(state, play)).toBe(state);
    }
    const unknown = onHome("club-99");
    expect(update(unknown, play)).toBe(unknown);
    expect(Object.keys(update(unknown, play))).not.toContain("results");
  });
});

describe("@US-2 S-007 the match screen and the table read the same record", () => {
  it("Given a club that is not in the league, when its match or the opening matchday is asked for, then there is none @error @driving_port @contract-shape:pure-function", () => {
    expect(matchFor(onHome(), "club-99")).toBeUndefined();
    expect(matchFor(at({ kind: "clubHome", clubId }, "4-4-2", { results: fixedResults() }), "club-99")).toBeUndefined();
    expect(playOpeningMatchday(onHome(), "club-99")).toBeUndefined();
  });

  it("Given Sam played as Netherwold Borough at seed 31, when his match is asked for, then it is the recorded matchday-1 entry: Netherwold Borough 1–2 Marlbrook Athletic @walking_skeleton @driving_port @contract-shape:pure-function", () => {
    const played = walk(onHome(), [play]);
    const view = matchFor(played, clubId)!;
    expect(view.matchday).toBe(1);
    expect([view.home.club.name, view.away.club.name]).toEqual(["Netherwold Borough", "Marlbrook Athletic"]);
    expect(view.result).toBe(played.results![0]!.result);
    expect([view.result.homeGoals, view.result.awayGoals]).toEqual([1, 2]);
  });

  it("Given a record, when each of the 8 clubs asks for its match, then the 8 matches form the 4 recorded pairings and each club reads the recorded result of its own fixture @property @driving_port @contract-shape:pure-function", () => {
    fc.assert(
      fc.property(anySeed, (seed) => {
        const world = generateLeague(seed);
        const first = world.clubs[0]!.id;
        const played = update({ ...initialState(world), screen: { kind: "clubHome", clubId: first } }, play);
        world.clubs.forEach((c, index) => {
          const view = matchFor(played, c.id)!;
          const entry = played.results!.find((e) => e.home === index || e.away === index)!;
          expect([view.home.club.id, view.away.club.id]).toEqual([world.clubs[entry.home]!.id, world.clubs[entry.away]!.id]);
          expect(view.result).toBe(entry.result);
        });
      }),
    );
  });

  it("Given a recorded match, when the formation or the eleven changes afterwards, then the match is still the recorded one, not a new derivation @property @contract-shape:pure-function", () => {
    fc.assert(
      fc.property(fc.constantFrom(...FORMATIONS), fc.integer({ min: 0, max: 7 }), (formation, club) => {
        const id = clubIds[club]!;
        const played = update(onHome(id), play);
        const later = { ...played, formation, xi: automaticXI(squadOf(league, id)!, formation) };
        expect(matchFor(later, id)).toEqual(matchFor(played, id));
      }),
    );
  });

  it("Given any seed, club, formation and optional picks and nothing recorded, when a match is asked for, then it equals the match of the record that playing would make (the fallback and the record never disagree) @property @driving_port @boundary @contract-shape:pure-function", () => {
    fc.assert(
      fc.property(fc.record({ seed: anySeed, club: fc.integer({ min: 0, max: 7 }), formation: fc.constantFrom(...FORMATIONS), picked: fc.boolean() }), ({ seed, club, formation, picked }) => {
        const world = generateLeague(seed);
        const id = world.clubs[club]!.id;
        const squad = squadOf(world, id)!;
        const state: GameState = {
          ...initialState(world), screen: { kind: "clubHome", clubId: id }, formation,
          ...(picked ? { xi: automaticXI(squad, "4-2-3-1") } : {}),
        };
        expect(matchFor(state, id)).toEqual(matchFor({ ...state, results: playOpeningMatchday(state, id) }, id));
      }),
    );
  });

  it("Given nothing is recorded, when Sam's match is asked for at seed 31, then it is still the S-006 golden Netherwold Borough 1–2 Marlbrook Athletic @boundary @contract-shape:pure-function", () => {
    const view = matchFor(onHome(), clubId)!;
    expect([view.home.club.name, view.result.homeGoals, view.result.awayGoals, view.away.club.name]).toEqual(["Netherwold Borough", 1, 2, "Marlbrook Athletic"]);
  });
});

describe("@US-1 @US-2 S-007 the table Sam reads", () => {
  const ROWS_31: readonly (readonly [string, number, number, number, number, number, number])[] = [
    // club, P, W, D, L, GD, Pts (US-2 example 1)
    ["Tarnbeck Borough", 1, 1, 0, 0, 4, 3], ["Oakhampton Rise Borough", 1, 1, 0, 0, 2, 3], ["Marlbrook Athletic", 1, 1, 0, 0, 1, 3],
    ["Fennimore Town", 1, 0, 1, 0, 0, 1], ["Valebridge Albion", 1, 0, 1, 0, 0, 1], ["Netherwold Borough", 1, 0, 0, 1, -1, 0],
    ["Juniper Hollow United", 1, 0, 0, 1, -2, 0], ["Rushmoor Heath Albion", 1, 0, 0, 1, -4, 0],
  ];
  const readRows = (state: GameState) => standingsOf(state).map((r) => [r.name, r.played, r.won, r.drawn, r.lost, r.goalDifference, r.points]);

  it("Given a new game, when the table is read before any match, then every row is zero and the clubs are in A to Z order @walking_skeleton @driving_port @contract-shape:pure-function", () => {
    const rows = standingsOf(onHome());
    expect(rows.map((r) => r.name)).toEqual([
      "Fennimore Town", "Juniper Hollow United", "Marlbrook Athletic", "Netherwold Borough",
      "Oakhampton Rise Borough", "Rushmoor Heath Albion", "Tarnbeck Borough", "Valebridge Albion",
    ]);
    expect(rows.every((r) => r.played + r.won + r.drawn + r.lost + r.goalDifference + r.points + r.goalsFor + r.goalsAgainst === 0)).toBe(true);
  });

  it("Given Sam played at seed 31 with untouched tactics, when the table is read, then it is the golden: Tarnbeck Borough +4 first, Netherwold Borough sixth on -1 @walking_skeleton @driving_port @contract-shape:pure-function", () => {
    expect(readRows(walk(onHome(), [play, back, table]))).toEqual(ROWS_31.map((row) => [...row]));
  });

  it("Given untouched tactics, when any of the 8 clubs is managed and plays, then the table is the same whoever is managed @property @boundary @contract-shape:pure-function", () => {
    const tables = clubIds.map((id) => readRows(update(onHome(id), play)));
    for (const rows of tables) expect(rows).toEqual(ROWS_31.map((row) => [...row]));
  });

  it("Given ?seed=abc and Oakhampton Rise Borough, when Sam plays, then Oakhampton Rise Borough reads P 1 W 1 GD +1 Pts 3 and Harrowgate Lane United P 1 L 1 GD -1 Pts 0 @example @boundary @contract-shape:pure-function", () => {
    const world = generateLeague(parseSeed("?seed=abc"));
    const rows = standingsOf(update({ ...initialState(world), screen: { kind: "clubHome", clubId: world.clubs[7]!.id } }, play));
    const pick = (name: string) => rows.find((r) => r.name === name)!;
    expect([pick("Oakhampton Rise Borough").played, pick("Oakhampton Rise Borough").won, pick("Oakhampton Rise Borough").goalDifference, pick("Oakhampton Rise Borough").points]).toEqual([1, 1, 1, 3]);
    expect([pick("Harrowgate Lane United").played, pick("Harrowgate Lane United").lost, pick("Harrowgate Lane United").goalDifference, pick("Harrowgate Lane United").points]).toEqual([1, 1, -1, 0]);
  });

  it("Given any seed and any of the 8 clubs, when Sam plays and reads the table, then every row has P 1, Sam's row agrees with his score line and the opponent's row is its mirror, and the totals balance @property @driving_port @contract-shape:pure-function", () => {
    fc.assert(
      fc.property(anySeed, fc.integer({ min: 0, max: 7 }), (seed, club) => {
        const world = generateLeague(seed);
        const id = world.clubs[club]!.id;
        const played = update({ ...initialState(world), screen: { kind: "clubHome", clubId: id } }, play);
        const rows = standingsOf(played);
        const view = matchFor(played, id)!;
        const [mine, theirs] = view.home.club.id === id ? [view.result.homeGoals, view.result.awayGoals] : [view.result.awayGoals, view.result.homeGoals];
        const opponentId = (view.home.club.id === id ? view.away : view.home).club.id;
        const [sam, rival] = [id, opponentId].map((cid) => rows.find((r) => r.clubId === cid)!) as [typeof rows[number], typeof rows[number]];
        expect(rows.every((r) => r.played === 1)).toBe(true);
        expect([sam.won, sam.drawn, sam.lost]).toEqual([mine > theirs ? 1 : 0, mine === theirs ? 1 : 0, mine < theirs ? 1 : 0]);
        expect(sam.points).toBe(mine > theirs ? 3 : mine === theirs ? 1 : 0);
        expect(sam.goalDifference).toBe(mine - theirs);
        expect([rival.won, rival.drawn, rival.lost]).toEqual([sam.lost, sam.drawn, sam.won]);
        expect(rival.goalDifference + sam.goalDifference).toBe(0);
        const sum = (pick: (r: typeof sam) => number) => rows.reduce((total, r) => total + pick(r), 0);
        expect(sum((r) => r.won)).toBe(sum((r) => r.lost));
        expect(sum((r) => r.drawn) % 2).toBe(0);
        expect(sum((r) => r.goalDifference)).toBe(0);
        for (const r of rows) {
          expect(r.won + r.drawn + r.lost).toBe(r.played);
          expect(r.points).toBe(3 * r.won + r.drawn);
        }
      }),
    );
  });

  it("Given seeds 1 to 100 and each of the 8 clubs managed, when Sam plays, then Sam's row agrees with his score line every time (K2) @boundary @contract-shape:pure-function", () => {
    for (let seed = 1; seed <= 100; seed++) {
      const world = generateLeague(seed);
      for (const c of world.clubs) {
        const played = update({ ...initialState(world), screen: { kind: "clubHome", clubId: c.id } }, play);
        const view = matchFor(played, c.id)!;
        const row = standingsOf(played).find((r) => r.clubId === c.id)!;
        const [mine, theirs] = view.home.club.id === c.id ? [view.result.homeGoals, view.result.awayGoals] : [view.result.awayGoals, view.result.homeGoals];
        expect([row.played, row.goalDifference, row.points], `seed ${seed} ${c.name}`).toEqual([1, mine - theirs, mine > theirs ? 3 : mine === theirs ? 1 : 0]);
      }
    }
  });

  it("Given the same seed and club in two fresh games, when Sam plays in both, then the two tables are identical; ?seed=abc and no seed give the same table; another seed gives another table @boundary @contract-shape:pure-function", () => {
    const tableFor = (search: string, index: number) => {
      const world = generateLeague(parseSeed(search));
      return readRows(update({ ...initialState(world), screen: { kind: "clubHome", clubId: world.clubs[index]!.id } }, play));
    };
    expect(tableFor("?seed=31", 0)).toEqual(tableFor("?seed=31", 0));
    expect(tableFor("?seed=abc", 7)).toEqual(tableFor("", 7));
    expect(tableFor("?seed=31", 0)).not.toEqual(tableFor("?seed=32", 0));
  });
});

describe("@US-2 S-007 whatever Sam taps afterwards, what is played stays played", () => {
  const anyAction: fc.Arbitrary<Action> = fc.oneof(
    fc.constant<Action>({ type: "NewGame" }), fc.constant<Action>(play), fc.constant<Action>(back), fc.constant<Action>(table),
    fc.constant<Action>({ type: "ViewSquad" }), fc.constant<Action>({ type: "ViewTactics" }), fc.constant<Action>({ type: "ViewStartingXI" }),
    fc.constantFrom(...clubIds, "club-99").map((id): Action => ({ type: "ChooseClub", clubId: id })),
    fc.constantFrom(...FORMATIONS, "5-3-2").map((formation): Action => ({ type: "ChooseFormation", formation })),
    fc.integer({ min: -2, max: PLAYERS_PER_SQUAD + 1 }).map((playerIndex): Action => ({ type: "PickPlayer", playerIndex })),
    fc.integer({ min: -2, max: 12 }).map((slot): Action => ({ type: "ChooseSlot", slot })),
    fc.integer({ min: -2, max: PLAYERS_PER_SQUAD + 1 }).map((playerIndex): Action => ({ type: "ViewPlayer", playerIndex })),
  );

  it("Given any run of up to 40 taps from the title (valid and invalid), when Sam plays, then the game never throws, earlier entries stay the very same objects, the table keeps its row rules and a table screen is always for a club in the league @property @error @contract-shape:bounded-change", () => {
    fc.assert(
      fc.property(fc.array(anyAction, { maxLength: 40 }), (actions) => {
        let state = deepFreeze(initialState(league));
        for (const action of actions) {
          const next = deepFreeze(update(state, action));
          if (state.results !== undefined && !(action.type === "NewGame" && state.screen.kind === "title")) {
            state.results.forEach((entry, i) => expect(next.results![i]).toBe(entry));
            expect(next.results!.length % 4).toBe(0);
            expect(next.results!.length).toBeLessThanOrEqual(56);
          }
          if (state.results === undefined && next.results !== undefined) expect(action.type).toBe("PlayMatch");
          if (next.screen.kind === "table") expect(clubIds).toContain(next.screen.clubId);
          for (const row of standingsOf(next)) {
            expect(row.won + row.drawn + row.lost).toBe(row.played);
            expect(row.points).toBe(3 * row.won + row.drawn);
            expect(row.played).toBe((next.results?.length ?? 0) / 4);
          }
          state = next;
        }
      }),
    );
  });

  it("Given Sam has played, when he taps any run of up to 40 formation, pick and navigation taps, then the table and his match never change (K3) @property @walking_skeleton @contract-shape:bounded-change", () => {
    const tinkering = fc.oneof(
      fc.constant<Action>(back), fc.constant<Action>(table), fc.constant<Action>({ type: "ViewSquad" }), fc.constant<Action>({ type: "ViewTactics" }),
      fc.constant<Action>({ type: "ViewStartingXI" }), fc.constant<Action>(play),
      fc.constantFrom(...FORMATIONS, "5-3-2").map((formation): Action => ({ type: "ChooseFormation", formation })),
      fc.integer({ min: -2, max: 12 }).map((slot): Action => ({ type: "ChooseSlot", slot })),
      fc.integer({ min: -2, max: PLAYERS_PER_SQUAD + 1 }).map((playerIndex): Action => ({ type: "PickPlayer", playerIndex })),
      fc.integer({ min: -2, max: PLAYERS_PER_SQUAD + 1 }).map((playerIndex): Action => ({ type: "ViewPlayer", playerIndex })),
    );
    const played = walk(onHome(), [play, back]);
    const before = { rows: standingsOf(played), results: played.results };
    fc.assert(
      fc.property(fc.array(tinkering, { maxLength: 40 }), (actions) => {
        let state = deepFreeze(played);
        for (const action of actions) {
          state = deepFreeze(update(state, action));
          before.results!.forEach((entry, i) => expect(state.results![i]).toBe(entry));
          expect(standings(league.clubs, state.results!.slice(0, 4))).toEqual(before.rows);
        }
      }),
    );
  });
});

describe("@US-1 @US-2 S-007 focus goes to the new heading when Sam opens the table or comes back", () => {
  const home: Screen = { kind: "clubHome", clubId };
  const tableScreen: Screen = { kind: "table", clubId };

  it("Given the club home, when the table opens, or the table goes back to the club home, then focus goes to the heading (with or without an element id) @walking_skeleton @driving_port @contract-shape:pure-function", () => {
    for (const id of [undefined, "x", ""]) {
      expect(focusPlan(home, tableScreen, id)).toEqual({ kind: "heading" });
      expect(focusPlan(tableScreen, home, id)).toEqual({ kind: "heading" });
    }
    expect(focusPlan(undefined, tableScreen, undefined)).toEqual({ kind: "heading" });
  });

  it("Given any screen that is not the table, when the table opens, then focus goes to the heading @boundary @contract-shape:pure-function", () => {
    for (const [label, screen] of OFF_HOME.filter(([name]) => name !== "the table")) expect(focusPlan(screen, tableScreen, "x"), label).toEqual({ kind: "heading" });
  });

  it("Given the table of one club redrawn, when an element id is given, then that element is focused; without an id or with an empty one, the heading; for another club, the heading @boundary @contract-shape:pure-function", () => {
    expect(focusPlan(tableScreen, { kind: "table", clubId }, "table-title")).toEqual({ kind: "element", id: "table-title" });
    expect(focusPlan(tableScreen, { kind: "table", clubId }, undefined)).toEqual({ kind: "heading" });
    expect(focusPlan(tableScreen, { kind: "table", clubId }, "")).toEqual({ kind: "heading" });
    expect(focusPlan(tableScreen, { kind: "table", clubId: rivalId }, "table-title")).toEqual({ kind: "heading" });
    expect(focusPlan({ kind: "match", clubId }, tableScreen, "x")).toEqual({ kind: "heading" });
  });
});

describe("@US-2 S-007 the S-006 cases that D12 supersedes, restated with the record (the formation and picks are still never touched)", () => {
  it("Given a club home, when Sam taps Play match, then the screen changes and the four results are recorded; formation, picks and league are untouched @walking_skeleton @driving_port @contract-shape:bounded-change", () => {
    const state = deepFreeze(onHome());
    expect(update(state, play)).toEqual({ ...state, screen: { kind: "match", clubId }, results: expectedRecord(state, clubId) });
  });

  it("Given a club home, when Sam taps Play match and then Back, then the club home is shown again with formation and picks as they were, and the record is kept @walking_skeleton @driving_port @contract-shape:bounded-change", () => {
    const state = deepFreeze(walk(onHome(), [...CHOOSE_433, ...NORTHCOTT_IN_433]));
    expect(walk(state, [play, back])).toEqual({ ...state, results: expectedRecord(state, clubId) });
  });

  it("Given Sam taps Play match, Back and Play match again, then the second match screen is matchday 2 (eight entries, the first four the very same objects) @boundary @contract-shape:bounded-change", () => {
    const first = update(onHome(), play);
    const second = walk(first, [back, play]);
    expect(second.results).toHaveLength(8);
    first.results!.forEach((entry, i) => expect(second.results![i]).toBe(entry));
    expect(matchFor(second, clubId)!.matchday).toBe(2);
    expect(matchFor(second, clubId)).not.toEqual(matchFor(first, clubId));
  });
});
