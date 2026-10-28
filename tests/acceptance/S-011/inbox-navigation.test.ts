// @US-1 @US-2 (S-011 read my club's news in the Inbox) held out until DELIVER
// CONTRACT_SHAPE: bounded-change
// Outcome anchor: DISCUSS D1, D2, D3, D6, D7 and US-1/US-2 unit notes; DESIGN DD2; brief port 41. ViewInbox is valid from a known club's club home
// only (else the very same state, toBe), Back from the Inbox returns the club home it was opened from, opening the Inbox leaves formation, xi and
// results the very same objects and the saved text equal (nothing is written), inboxOf agrees with what the match screens and the Table showed
// right after each tap (the time-travel oracle), a team change never rewrites a report, and a new season starts empty.
// States are built with the actions Sam can tap (helpers of S-010, committed). Layer 2 (in-memory driving port `update`).
// Destination: tests/acceptance/S-011/inbox-navigation.test.ts (DELIVER: git mv, dropping .pending, in the commit that adds ViewInbox and inboxOf).
import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { encodeSave, saveTextFor } from "../../../src/app/save";
import { focusPlan, initialState, inboxOf, matchFor, standingsOf, update, type Action, type GameState } from "../../../src/app/state";
import { FORMATIONS } from "../../../src/domain/formation";
import { generateLeague } from "../../../src/domain/league";
import { NETHERWOLD_31 } from "./inbox-reference";
import { afterMatchdays, homeOf, NEW_GAME, walk, withFormation, withPick } from "../S-010/save-world";

const VIEW: Action = { type: "ViewInbox" };
const BACK: Action = { type: "Back" };
const PLAY: Action = { type: "PlayMatch" };
const league = generateLeague(31);
const clubId = league.clubs[0]!.id;
const KEYS = ["league", "screen", "formation", "xi", "results"];
const reportsOf = (state: GameState) => inboxOf(state, clubId)!;

describe("@US-1 S-011 ViewInbox opens the Inbox from a known club's home and nowhere else", () => {
  it.each([0, 1, 13, 14])("Given the club home after %i matchdays, when Sam taps Inbox, then the screen is the Inbox of that club and nothing else changed (same objects) @walking_skeleton @driving_port @boundary @contract-shape:bounded-change", (played) => {
    const home = afterMatchdays(homeOf(31, 0), played);
    const open = update(home, VIEW);
    expect(open.screen).toEqual({ kind: "inbox", clubId });
    expect(Object.keys(open).sort()).toEqual(Object.keys(home).sort());
    expect(open.league).toBe(home.league);
    expect(open.formation).toBe(home.formation);
    expect(open.xi).toBe(home.xi);
    expect(open.results).toBe(home.results);
  });

  it("Given the title, the club picker, and every other screen of the club, when Inbox is tapped, then it is the very same state @error @boundary @contract-shape:bounded-change", () => {
    const home = afterMatchdays(homeOf(31, 0), 2);
    const states: readonly GameState[] = [
      initialState(league),
      update(initialState(league), NEW_GAME),
      walk(home, [{ type: "ViewSquad" }]),
      walk(home, [{ type: "ViewTactics" }]),
      walk(home, [{ type: "ViewStartingXI" }]),
      walk(home, [{ type: "ViewTable" }]),
      walk(home, [PLAY]),
      update(home, VIEW),
    ];
    for (const state of states) expect(update(state, VIEW), state.screen.kind).toBe(state);
  });

  it("Given a finished season's End of season screen, when Inbox is tapped there, then it is the very same state @error @boundary @contract-shape:bounded-change", () => {
    const end = walk(afterMatchdays(homeOf(31, 0), 14), [{ type: "ViewSeasonEnd" }]);
    expect(end.screen.kind).toBe("seasonEnd");
    expect(update(end, VIEW)).toBe(end);
  });

  it("Given a club home that names a club outside the league, when Inbox is tapped, then it is the very same state and inboxOf says undefined @error @boundary @contract-shape:bounded-change", () => {
    const stray: GameState = { ...homeOf(31, 0), screen: { kind: "clubHome", clubId: "nowhere-fc" } };
    expect(update(stray, VIEW)).toBe(stray);
    expect(inboxOf(stray, "nowhere-fc")).toBeUndefined();
  });
});

describe("@US-1 S-011 Back from the Inbox", () => {
  it.each([0, 3, 14])("Given the Inbox opened after %i matchdays, when Sam taps Back, then it is the club home he opened it from, equal in every key @driving_port @boundary @contract-shape:bounded-change", (played) => {
    const home = afterMatchdays(homeOf(31, 0), played);
    expect(update(update(home, VIEW), BACK)).toEqual(home);
  });

  it("Given an Inbox screen that names a club outside the league, when Back is tapped, then it is the very same state @error @boundary @contract-shape:bounded-change", () => {
    const stray: GameState = { ...homeOf(31, 0), screen: { kind: "inbox", clubId: "nowhere-fc" } };
    expect(update(stray, BACK)).toBe(stray);
  });

  it("Given the Inbox is already open, when Sam taps Back and Inbox again, then the Inbox is the same as before @boundary @contract-shape:bounded-change", () => {
    const open = update(afterMatchdays(homeOf(31, 0), 3), VIEW);
    expect(update(update(open, BACK), VIEW)).toEqual(open);
  });
});

describe("@US-1 @US-2 S-011 opening the Inbox changes nothing and writes no save (K3)", () => {
  it("Given 100 random runs of formations, picks and matches, when Sam opens the Inbox and goes back, then formation, xi and results are the very same objects and the saved text is unchanged @property @driving_port @contract-shape:bounded-change", () => {
    const step = fc.oneof(
      fc.constant("play"),
      fc.constantFrom(...FORMATIONS).map((f) => `formation:${f}`),
      fc.integer({ min: 0, max: 10 }).map((slot) => `pick:${slot}`),
    );
    fc.assert(
      fc.property(fc.array(step, { maxLength: 18 }), (steps) => {
        const state = steps.reduce<GameState>((s, each) => (each === "play" ? afterMatchdays(s, 1) : each.startsWith("formation:") ? withFormation(s, each.slice(10)) : withPick(s, 0, Number(each.slice(5)))), homeOf(31, 0));
        const open = update(state, VIEW);
        const closed = update(open, BACK);
        expect(closed.formation).toBe(state.formation);
        expect(closed.xi).toBe(state.xi);
        expect(closed.results).toBe(state.results);
        expect(open.results).toBe(state.results);
        expect(encodeSave(open)).toBe(encodeSave(state));
        expect(encodeSave(closed)).toBe(encodeSave(state));
        expect(saveTextFor(encodeSave(state), open)).toBeUndefined();
        expect(saveTextFor(encodeSave(state), closed)).toBeUndefined();
      }),
      { numRuns: 100 },
    );
  });

  it("Given a fresh club home with nothing saved yet, when the Inbox opens, then the save text it would write is the club home's own @boundary @contract-shape:bounded-change", () => {
    const home = homeOf(31, 0);
    expect(saveTextFor(undefined, update(home, VIEW))).toBe(encodeSave(home));
  });
});

describe("@US-1 @US-2 S-011 inboxOf agrees with the screens Sam read (time-travel oracle)", () => {
  it("Given seed 31 played tap by tap, when the match screen and the Table are read right after each Play match, then inboxOf after N matches holds exactly those N readings, newest first @walking_skeleton @driving_port @contract-shape:bounded-change", () => {
    let state = homeOf(31, 0);
    const read: { matchday: number; home: string; away: string; homeGoals: number; awayGoals: number; position: number }[] = [];
    expect(inboxOf(state, clubId)).toEqual([]);
    for (let n = 1; n <= 14; n++) {
      state = update(state, PLAY);
      const view = matchFor(state, clubId)!;
      const row = standingsOf(state).find((r) => r.clubId === clubId)!;
      read.push({ matchday: view.matchday, home: view.home.club.name, away: view.away.club.name, homeGoals: view.result.homeGoals, awayGoals: view.result.awayGoals, position: row.position });
      state = update(state, BACK);
      expect(inboxOf(state, clubId), `after ${n}`).toHaveLength(n);
    }
    const reports = reportsOf(state);
    expect(reports.map((r) => ({ matchday: r.matchday, home: r.home.name, away: r.away.name, homeGoals: r.home.goals, awayGoals: r.away.goals, position: r.position }))).toEqual([...read].reverse());
    expect(reports.map((r) => r.position)).toEqual([...NETHERWOLD_31].reverse().map((m) => m.position));
  });

  it("Given N matches played for N from 0 to 14, when inboxOf is read, then it holds N reports for matchdays N down to 1 @boundary @contract-shape:bounded-change", () => {
    for (let n = 0; n <= 14; n++) expect(reportsOf(afterMatchdays(homeOf(31, 0), n)).map((r) => r.matchday)).toEqual(Array.from({ length: n }, (_, i) => n - i));
  });

  it("Given the club home after matchday 14, when inboxOf and the Table are read, then the newest position is the club's Pos on the Table @boundary @contract-shape:bounded-change", () => {
    const done = afterMatchdays(homeOf(31, 0), 14);
    expect(reportsOf(done)[0]!.position).toBe(standingsOf(done).find((r) => r.clubId === clubId)!.position);
  });

  it("Given a club outside the league, when inboxOf is read, then it is undefined @error @boundary @contract-shape:pure-function", () => {
    expect(inboxOf(homeOf(31, 0), "nowhere-fc")).toBeUndefined();
  });
});

describe("@US-1 S-011 what was played is never rewritten (K3)", () => {
  it("Given up to 18 random formation changes, XI picks and matches, when a team change is made, then every existing report is toEqual unchanged, and a match only prepends @property @driving_port @contract-shape:bounded-change", () => {
    const step = fc.oneof(
      fc.constant("play"),
      fc.constantFrom(...FORMATIONS).map((f) => `formation:${f}`),
      fc.integer({ min: 0, max: 10 }).map((slot) => `pick:${slot}`),
    );
    fc.assert(
      fc.property(fc.array(step, { maxLength: 18 }), fc.integer({ min: 0, max: 7 }), (steps, clubIndex) => {
        const id = league.clubs[clubIndex]!.id;
        let state = homeOf(31, clubIndex);
        for (const each of steps) {
          const before = inboxOf(state, id)!;
          state = each === "play" ? afterMatchdays(state, 1) : each.startsWith("formation:") ? withFormation(state, each.slice(10)) : withPick(state, clubIndex, Number(each.slice(5)));
          const after = inboxOf(state, id)!;
          if (each === "play") expect(after.slice(after.length - before.length)).toEqual(before);
          else expect(after).toEqual(before);
        }
      }),
      { numRuns: 100 },
    );
  });

  it("Given two matches played, when Sam switches to 4-3-3 and back to 4-4-2, then both reports read the same @boundary @contract-shape:bounded-change", () => {
    const two = afterMatchdays(homeOf(31, 0), 2);
    const before = reportsOf(two);
    expect(reportsOf(withFormation(withFormation(two, "4-3-3"), "4-4-2"))).toEqual(before);
  });
});

describe("@US-1 S-011 a new season starts with an empty Inbox (a rule of this version)", () => {
  it("Given a finished season, when Sam taps Play again and picks a club, then inboxOf is empty, whichever club he picks @boundary @contract-shape:bounded-change", () => {
    const end = walk(afterMatchdays(homeOf(31, 0), 14), [{ type: "ViewSeasonEnd" }]);
    for (const id of league.clubs.map((c) => c.id)) {
      const fresh = walk(end, [NEW_GAME, { type: "ChooseClub", clubId: id }]);
      expect(inboxOf(fresh, id)).toEqual([]);
    }
  });

  it("Given a season in progress, when the title's New game starts over with a club, then inboxOf is empty @boundary @contract-shape:bounded-change", () => {
    const fresh = walk({ ...afterMatchdays(homeOf(31, 0), 3), screen: { kind: "title" } }, [NEW_GAME, { type: "ChooseClub", clubId }]);
    expect(inboxOf(fresh, clubId)).toEqual([]);
  });
});

describe("@US-1 S-011 focus and robustness", () => {
  it("Given the club home and the Inbox, when focusPlan compares them, then arriving at or leaving the Inbox focuses the heading, and the same Inbox keeps a focused element @boundary @contract-shape:pure-function", () => {
    const home = { kind: "clubHome", clubId } as const;
    const inbox = { kind: "inbox", clubId } as const;
    expect(focusPlan(home, inbox, "btn")).toEqual({ kind: "heading" });
    expect(focusPlan(inbox, home, "btn")).toEqual({ kind: "heading" });
    expect(focusPlan(inbox, inbox, "btn")).toEqual({ kind: "element", id: "btn" });
    expect(focusPlan(inbox, { kind: "inbox", clubId: "other" }, "btn")).toEqual({ kind: "heading" });
  });

  it("Given up to 40 random actions including ViewInbox, when Sam taps them in any order, then the game never throws and the state keeps its five keys @property @error @contract-shape:bounded-change", () => {
    const anyAction: fc.Arbitrary<Action> = fc.oneof(
      fc.constant<Action>(PLAY), fc.constant<Action>(BACK), fc.constant<Action>(VIEW), fc.constant<Action>({ type: "ViewTable" }),
      fc.constant<Action>({ type: "ViewSquad" }), fc.constant<Action>({ type: "ViewTactics" }), fc.constant<Action>({ type: "ViewStartingXI" }), fc.constant<Action>(NEW_GAME),
      fc.constant<Action>({ type: "ViewSeasonEnd" }),
      fc.constantFrom(...FORMATIONS, "5-3-2").map((formation): Action => ({ type: "ChooseFormation", formation })),
      fc.integer({ min: -2, max: 19 }).map((playerIndex): Action => ({ type: "PickPlayer", playerIndex })),
      fc.integer({ min: -2, max: 12 }).map((slot): Action => ({ type: "ChooseSlot", slot })),
      fc.integer({ min: 0, max: 7 }).map((i): Action => ({ type: "ChooseClub", clubId: league.clubs[i]!.id })),
    );
    fc.assert(
      fc.property(fc.array(anyAction, { maxLength: 40 }), (actions) => {
        let state = initialState(league);
        for (const action of actions) {
          state = update(state, action);
          expect(Object.keys(state).filter((key) => !KEYS.includes(key))).toEqual([]);
        }
      }),
      { numRuns: 100 },
    );
  });
});
