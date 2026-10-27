// @US-1 @US-2 (S-011 read my club's news in the Inbox) held out until DELIVER
// CONTRACT_SHAPE: bounded-change
// Outcome anchor: DISCUSS D1, D2, D3, D6 and the US-1 unit notes; ADR-0017 decisions 2 and 5; brief port 41. ViewInbox is valid from a known club's club home
// (at 0, 1, 13 and 14 matches played), changes only the screen, and is the very same state (toBe) everywhere else; Back from the Inbox restores the club
// home (toEqual the state it was opened from) with formation, xi and results the same objects; the encoded save of the Inbox equals that of the club home and
// saveTextFor is undefined (navigation writes no save); inboxOf is undefined for an unknown club, holds N reports after N matchdays, each equal to the match
// screen's view and the Table's row read right after the tap (the time-travel oracle), and never changes when tactics or picks change after a match
// (fast-check, numRuns 100, fresh FC_SEED); New game then a club gives []; the state keeps exactly five keys; focusPlan treats Inbox as a club screen; runs of up
// to 40 valid and invalid actions, with ViewInbox in the pool, never throw.
// Destination: tests/acceptance/S-011/inbox-navigation.test.ts (DELIVER: git mv, dropping .pending, in the commit that adds ViewInbox, the inbox screen and inboxOf).
// Keep fc.property callbacks to 3 parameters (oxlint max-params).
import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { encodeSave, saveTextFor } from "../../../src/app/save";
import { focusPlan, inboxOf, initialState, matchFor, standingsOf, update, type Action, type GameState, type Screen } from "../../../src/app/state";
import { FORMATIONS } from "../../../src/domain/formation";
import { generateLeague } from "../../../src/domain/league";
import { PLAYERS_PER_SQUAD } from "../../../src/domain/squad";
import { CLUB_31, REFERENCE_INBOX_31 } from "./inbox-reference";

const play: Action = { type: "PlayMatch" };
const back: Action = { type: "Back" };
const newGame: Action = { type: "NewGame" };
const viewInbox: Action = { type: "ViewInbox" };
const league = generateLeague(31);
const clubId = league.clubs[0]!.id;
const walk = (start: GameState, steps: readonly Action[]): GameState => steps.reduce(update, start);
const homeOf = (id: string): GameState => walk(initialState(league), [newGame, { type: "ChooseClub", clubId: id }]);
const afterMatchdays = (start: GameState, matchdays: number): GameState => walk(start, Array.from({ length: matchdays }, () => [play, back]).flat());
const inboxScreen = (id: string): Screen => ({ kind: "inbox", clubId: id });
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

describe("@US-1 S-011 the Inbox is offered from the club home, at any point of the season", () => {
  it("Given Netherwold Borough's club home with 3 matches played, when Sam taps Inbox, then the Inbox of his club opens and nothing but the screen changes @driving_port @boundary @contract-shape:bounded-change", () => {
    const home = afterMatchdays(homeOf(clubId), 3);
    const after = update(home, viewInbox);
    expect(after.screen).toEqual(inboxScreen(clubId));
    expect(after).toEqual({ ...home, screen: inboxScreen(clubId) });
    expect(after.results).toBe(home.results);
    expect(after.league).toBe(home.league);
    expect(after.formation).toBe(home.formation);
    expect(after.xi).toBe(home.xi);
  });

  it("Given 0, 1, 13 and 14 matches played, when Sam taps Inbox, then it opens every time (also on a finished season's club home) @boundary @driving_port @contract-shape:bounded-change", () => {
    for (const played of [0, 1, 13, 14]) expect(update(afterMatchdays(homeOf(clubId), played), viewInbox).screen, `${played} played`).toEqual(inboxScreen(clubId));
  });

  it("Given every screen but a known club's home, when Inbox is tapped, then nothing happens (the very same state), including from the Inbox itself @error @boundary @contract-shape:bounded-change", () => {
    const played = afterMatchdays(homeOf(clubId), 2);
    const screens: Screen[] = [
      { kind: "title" }, { kind: "pickClub" }, { kind: "squad", clubId }, { kind: "player", clubId, playerIndex: 3 }, { kind: "tactics", clubId }, { kind: "startingXI", clubId },
      { kind: "choosePlayer", clubId, slot: 2 }, { kind: "match", clubId }, { kind: "table", clubId }, { kind: "seasonEnd", clubId }, inboxScreen(clubId),
      { kind: "clubHome", clubId: "club-99" }, inboxScreen("club-99"),
    ];
    for (const screen of screens) {
      const state = { ...played, screen };
      expect(update(state, viewInbox), screen.kind).toBe(state);
    }
  });
});

describe("@US-1 S-011 Back from the Inbox returns to the club home and nothing is changed or saved", () => {
  it("Given Sam is in the Inbox, when he taps Back, then the club home is exactly the state he opened it from, and formation, picks and the log are the same objects @driving_port @boundary @contract-shape:bounded-change", () => {
    const state = tuned(afterMatchdays(homeOf(clubId), 3));
    const home = update(update(state, viewInbox), back);
    expect(home).toEqual(state);
    expect(home.screen).toEqual({ kind: "clubHome", clubId });
    expect(home.results).toBe(state.results);
    expect(home.xi).toBe(state.xi);
    expect(home.formation).toBe(state.formation);
  });

  it("Given Back on the Inbox of a club that is not in the league, when it is tapped, then nothing happens (the very same state) @error @boundary @contract-shape:bounded-change", () => {
    const stray = { ...afterMatchdays(homeOf(clubId), 1), screen: inboxScreen("club-99") } satisfies GameState;
    expect(update(stray, back)).toBe(stray);
  });

  it("Given a season at 0, 3 and 14 matches, when the Inbox is opened, then the encoded save is the club home's and nothing is written (saveTextFor is undefined) @boundary @driving_port @contract-shape:bounded-change", () => {
    for (const played of [0, 3, 14]) {
      const home = afterMatchdays(homeOf(clubId), played);
      const text = encodeSave(home);
      expect(text, `${played} played`).toBeDefined();
      expect(encodeSave(update(home, viewInbox)), `${played} played`).toBe(text);
      expect(saveTextFor(text, update(home, viewInbox)), `${played} played`).toBeUndefined();
      expect(saveTextFor(text, update(update(home, viewInbox), back)), `${played} played`).toBeUndefined();
    }
  });

  it("Given the states on the way to the Inbox and back, when their keys are read, then there are only league, screen, formation, xi and results @boundary @contract-shape:bounded-change", () => {
    const home = afterMatchdays(homeOf(clubId), 2);
    for (const state of [home, update(home, viewInbox), update(update(home, viewInbox), back), tuned(update(home, viewInbox))]) expect(Object.keys(state).filter((key) => !KEYS.includes(key))).toEqual([]);
  });

  it("Given any random formation, picks and Play match runs, when the Inbox is opened and Back tapped, then formation, xi and results are the same objects and the saved text is unchanged (K3) @property @driving_port @contract-shape:bounded-change", () => {
    fc.assert(
      fc.property(fc.array(fc.constantFrom<Action>(play, { type: "ViewTactics" }, { type: "ViewStartingXI" }, back, { type: "ChooseFormation", formation: "4-3-3" }, { type: "ChooseSlot", slot: 3 }, { type: "PickPlayer", playerIndex: 12 }), { maxLength: 40 }), fc.integer({ min: 0, max: 7 }), (actions, club) => {
        const state = walk(homeOf(league.clubs[club]!.id), actions);
        if (state.screen.kind !== "clubHome") return;
        const text = encodeSave(state);
        const after = update(update(state, viewInbox), back);
        expect(after).toEqual(state);
        expect(after.results).toBe(state.results);
        expect(after.xi).toBe(state.xi);
        expect(after.formation).toBe(state.formation);
        expect(saveTextFor(text, after)).toBeUndefined();
      }),
      { numRuns: 100 },
    );
  });
});

describe("@US-1 @US-2 S-011 inboxOf holds one report per matchday, equal to what the screens showed then", () => {
  it("Given a club that is not in the league, when the Inbox is read, then there is nothing (undefined) @error @boundary @contract-shape:pure-function", () => {
    expect(inboxOf(afterMatchdays(homeOf(clubId), 2), "club-99")).toBeUndefined();
  });

  it("Given N matches played at seed 31 (N from 0 to 14), when the Inbox is read, then there are N reports, Matchday N down to 1, with the DISCUSS score lines and positions @driving_port @boundary @contract-shape:pure-function", () => {
    let state = homeOf(clubId);
    expect(inboxOf(state, clubId)).toEqual([]);
    for (const reference of REFERENCE_INBOX_31) {
      state = afterMatchdays(state, 1);
      const reports = inboxOf(state, clubId)!;
      expect(reports, `after ${reference.matchday}`).toHaveLength(reference.matchday);
      expect(reports.map((r) => r.matchday)).toEqual(Array.from({ length: reference.matchday }, (_, i) => reference.matchday - i));
      expect(`${reports[0]!.home.name} ${reports[0]!.home.goals}–${reports[0]!.away.goals} ${reports[0]!.away.name}`).toBe(reference.scoreLine);
      expect(reports[0]!.position).toBe(reference.position);
    }
    expect(CLUB_31).toBe(league.clubs[0]!.name);
  });

  it("Given every tap of a season played through update, when the match screen's view and the Table's row are read right after each, then the final Inbox holds exactly those (the time-travel oracle) @property @driving_port @boundary @contract-shape:pure-function", () => {
    for (const club of league.clubs) {
      let state = homeOf(club.id);
      const seen: { matchday: number; home: string; away: string; homeGoals: number; awayGoals: number; position: number }[] = [];
      for (let matchday = 1; matchday <= 14; matchday++) {
        state = walk(state, [play]);
        const view = matchFor(state, club.id)!;
        const row = standingsOf(state).find((standing) => standing.clubId === club.id)!;
        seen.push({ matchday: view.matchday, home: view.home.club.name, away: view.away.club.name, homeGoals: view.result.homeGoals, awayGoals: view.result.awayGoals, position: row.position });
        state = walk(state, [back]);
      }
      const reports = inboxOf(state, club.id)!.map((r) => ({ matchday: r.matchday, home: r.home.name, away: r.away.name, homeGoals: r.home.goals, awayGoals: r.away.goals, position: r.position }));
      expect(reports, club.name).toEqual([...seen].reverse());
    }
  });

  it("Given a Play match played from the club home, when the Inbox is read, then the older reports are deep-equal to before (an older message keeps where the club stood then) @boundary @contract-shape:pure-function", () => {
    const nine = afterMatchdays(homeOf(clubId), 9);
    const before = inboxOf(nine, clubId)!;
    const after = inboxOf(afterMatchdays(nine, 1), clubId)!;
    expect(before[0]!.position).toBe(2);
    expect(after[0]!.position).toBe(4);
    expect(after.slice(1)).toEqual(before);
  });
});

describe("@US-1 S-011 a season's story is never rewritten by tactics or picks (K3)", () => {
  type Step = "play" | { readonly formation: string } | { readonly slot: number; readonly player: number };
  const steps = fc.array(
    fc.oneof(
      fc.constant<Step>("play"),
      fc.constantFrom(...FORMATIONS).map((formation): Step => ({ formation })),
      fc.record({ slot: fc.integer({ min: 0, max: 10 }), player: fc.integer({ min: 0, max: PLAYERS_PER_SQUAD - 1 }) }),
    ),
    { maxLength: 40 },
  );
  const apply = (state: GameState, step: Step): GameState =>
    step === "play"
      ? walk(state, [play, back])
      : "formation" in step
        ? walk(state, [{ type: "ViewTactics" }, { type: "ChooseFormation", formation: step.formation }, back])
        : walk(state, [{ type: "ViewStartingXI" }, { type: "ChooseSlot", slot: step.slot }, { type: "PickPlayer", playerIndex: step.player }, back, back]);

  it("Given any run of formation changes, picks and Play match taps, when the Inbox is read after each step, then the reports so far are never changed: only the newest is added by a match @property @driving_port @contract-shape:pure-function", () => {
    fc.assert(
      fc.property(steps, fc.integer({ min: 0, max: 7 }), fc.integer({ min: 1, max: 40 }), (run, club, seed) => {
        const world = generateLeague(seed);
        const id = world.clubs[club]!.id;
        let state: GameState = walk(initialState(world), [newGame, { type: "ChooseClub", clubId: id }]);
        let previous = inboxOf(state, id)!;
        for (const step of run) {
          state = apply(state, step);
          const now = inboxOf(state, id)!;
          if (step === "play") {
            expect(now.slice(now.length - previous.length)).toEqual(previous);
            expect(now.length - previous.length).toBeLessThanOrEqual(1);
          } else {
            expect(now).toEqual(previous);
          }
          previous = now;
        }
      }),
      { numRuns: 100 },
    );
  });

  it("Given Sam played 2 matches and read the Inbox, when he changes to 4-3-3 and picks another player, then the Inbox reads the same, line for line @driving_port @boundary @contract-shape:pure-function", () => {
    const state = afterMatchdays(homeOf(clubId), 2);
    const read = inboxOf(state, clubId)!;
    expect(inboxOf(tuned(state), clubId)).toEqual(read);
  });
});

describe("@US-1 S-011 a new season starts with an empty Inbox (a rule of this version)", () => {
  it("Given a finished season, when Sam taps End of season, Play again and picks the same or another club, then the Inbox is empty @driving_port @boundary @contract-shape:bounded-change", () => {
    const finished = afterMatchdays(homeOf(clubId), 14);
    expect(inboxOf(finished, clubId)).toHaveLength(14);
    for (const club of [clubId, league.clubs[5]!.id]) {
      const again = walk(finished, [{ type: "ViewSeasonEnd" }, newGame, { type: "ChooseClub", clubId: club }]);
      expect(inboxOf(again, club)).toEqual([]);
      expect(update(again, viewInbox).screen).toEqual(inboxScreen(club));
    }
  });

  it("Given a finished season, when Sam goes back to the title and taps New game and a club, then the Inbox is empty too @boundary @contract-shape:bounded-change", () => {
    const finished = afterMatchdays(homeOf(clubId), 14);
    const fresh = walk({ ...finished, screen: { kind: "title" } }, [newGame, { type: "ChooseClub", clubId }]);
    expect(inboxOf(fresh, clubId)).toEqual([]);
  });
});

describe("@US-1 @US-2 S-011 focus follows the screen (ADR-0008)", () => {
  const onInbox = inboxScreen(clubId);
  it("Given Sam moves between the club home and the Inbox, when focus is planned, then it goes to the new heading each time @boundary @driving_port @contract-shape:pure-function", () => {
    expect(focusPlan({ kind: "clubHome", clubId }, onInbox, "x")).toEqual({ kind: "heading" });
    expect(focusPlan(onInbox, { kind: "clubHome", clubId }, "x")).toEqual({ kind: "heading" });
    expect(focusPlan(undefined, onInbox, undefined)).toEqual({ kind: "heading" });
    expect(focusPlan(onInbox, onInbox, undefined)).toEqual({ kind: "heading" });
  });

  it("Given the same club's Inbox shown again with a focus id, when focus is planned, then the element is kept, and another club's Inbox takes the heading @boundary @contract-shape:pure-function", () => {
    expect(focusPlan(onInbox, onInbox, "x")).toEqual({ kind: "element", id: "x" });
    expect(focusPlan(onInbox, inboxScreen("club-2"), "x")).toEqual({ kind: "heading" });
    expect(focusPlan({ kind: "table", clubId }, onInbox, "x")).toEqual({ kind: "heading" });
  });
});

describe("@US-1 @US-2 S-011 every run stays honest", () => {
  const anyAction = (clubIds: readonly string[]): fc.Arbitrary<Action> =>
    fc.oneof(
      fc.constant<Action>(viewInbox), fc.constant<Action>(newGame), fc.constant<Action>(back), fc.constant<Action>(play), fc.constant<Action>({ type: "ViewTable" }),
      fc.constant<Action>({ type: "ViewSeasonEnd" }), fc.constant<Action>({ type: "ViewSquad" }), fc.constant<Action>({ type: "ViewTactics" }), fc.constant<Action>({ type: "ViewStartingXI" }),
      fc.constantFrom(...clubIds, "club-99").map((id): Action => ({ type: "ChooseClub", clubId: id })),
      fc.constantFrom(...FORMATIONS, "5-3-2").map((formation): Action => ({ type: "ChooseFormation", formation })),
      fc.integer({ min: -2, max: PLAYERS_PER_SQUAD + 1 }).map((playerIndex): Action => ({ type: "PickPlayer", playerIndex })),
      fc.integer({ min: -2, max: 12 }).map((slot): Action => ({ type: "ChooseSlot", slot })),
    );

  it("Given a new game, when Sam taps any run of up to 40 valid and invalid actions including Inbox, then the game never throws, keeps its five keys, the Inbox only ever shows a club in the league and every Inbox state encodes like its club home (K3) @property @driving_port @error @contract-shape:bounded-change", () => {
    const ids = league.clubs.map((club) => club.id);
    fc.assert(
      fc.property(fc.array(anyAction(ids), { maxLength: 40 }), (actions) => {
        let state = deepFreeze(update(initialState(league), newGame));
        for (const action of actions) {
          const before = state;
          state = deepFreeze(update(state, action));
          expect(Object.keys(state).filter((key) => !KEYS.includes(key))).toEqual([]);
          if (state.screen.kind === "inbox") {
            expect(ids).toContain(state.screen.clubId);
            expect(inboxOf(state, state.screen.clubId)).toHaveLength((state.results ?? []).length / 4);
            expect(encodeSave(state)).toBe(encodeSave({ ...state, screen: { kind: "clubHome", clubId: state.screen.clubId } }));
          }
          if (action.type === "ViewInbox" && before.screen.kind !== "clubHome") expect(state).toBe(before);
        }
      }),
      { numRuns: 100 },
    );
  });
});
