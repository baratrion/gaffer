// @US-1 (S-011 read my club's news in the Inbox) held out until DELIVER step 3
// CONTRACT_SHAPE: bounded-change
// `update` with ViewInbox and Back, `inboxOf`, `focusPlan`: the Inbox is reached from a known club's home only, changes the screen and nothing else, and Back returns the club home
// exactly as it was. Opening it records nothing and moves nothing.
import { describe, expect, it } from "vitest";
import { decodeSave, encodeSave, saveTextFor } from "../../../src/app/save";
import { focusPlan, inboxOf, initialState, update, type Action, type GameState, type Screen } from "../../../src/app/state";
import { generateLeague } from "../../../src/domain/league";
import { PLAY_AND_BACK, afterMatchdays, homeOf, walk, withFormation, withPick } from "../S-010/save-world";
import { SEED_20260, SEED_20260_CLUB, SEED_20260_FIRST, SEED_31, SEED_31_REPORTS } from "./inbox-reference";

const [VIEW, BACK]: [Action, Action] = [{ type: "ViewInbox" }, { type: "Back" }];
const inbox = (clubId: string): Screen => ({ kind: "inbox", clubId });
const clubOf = (state: GameState): string => (state.screen as { clubId: string }).clubId;
const home = homeOf(SEED_31, 0);
const id = clubOf(home);
const HOMES: readonly (readonly [string, GameState])[] = [["nothing played", home], ["3 matches played", afterMatchdays(home, 3)], ["all 14 matches played", afterMatchdays(home, 14)], ["4-3-3 and a pick after 2 matches", withPick(withFormation(afterMatchdays(homeOf(SEED_31, 4), 2), "4-3-3"), 4, 3)]];
const OTHER_SCREENS: readonly (readonly [string, GameState])[] = [
  ["the title", initialState(generateLeague(SEED_31))], ["Choose your club", walk(initialState(generateLeague(SEED_31)), [{ type: "NewGame" }])], ["the squad", update(home, { type: "ViewSquad" })],
  ["a player", walk(home, [{ type: "ViewSquad" }, { type: "ViewPlayer", playerIndex: 2 }])], ["Tactics", update(home, { type: "ViewTactics" })], ["Starting XI", update(home, { type: "ViewStartingXI" })],
  ["a slot's players", walk(home, [{ type: "ViewStartingXI" }, { type: "ChooseSlot", slot: 1 }])], ["the match", update(home, { type: "PlayMatch" })], ["the Table", update(home, { type: "ViewTable" })],
  ["End of season", update(afterMatchdays(home, 14), { type: "ViewSeasonEnd" })], ["the Inbox itself", { ...home, screen: inbox(id) }], ["a club that is not in the league", { ...home, screen: { kind: "clubHome", clubId: "nobody-fc" } }],
];
describe("@US-1 S-011 the Inbox opens from the club home and Back returns to it", () => {
  it.each(HOMES)("Given the club home with %s, when Sam taps Inbox, then the screen is the Inbox of that club and the formation, eleven and results are the same objects @walking_skeleton @driving_port @contract-shape:bounded-change", (_label, start) => {
    const opened = update(start, VIEW);
    expect(opened.screen).toEqual(inbox(clubOf(start)));
    expect([opened.league, opened.formation, opened.xi, opened.results]).toEqual([start.league, start.formation, start.xi, start.results]);
    expect(opened.results).toBe(start.results);
    expect(opened.xi).toBe(start.xi);
    expect(Object.keys(opened).sort()).toEqual(Object.keys(start).sort());
  });
  it.each(HOMES)("Given the Inbox opened from the club home with %s, when Sam taps Back, then the club home is exactly as it was, and the saved text is the same throughout (the autosave writes nothing) @driving_port @kpi @contract-shape:bounded-change", (_label, start) => {
    const opened = update(start, VIEW);
    const returned = update(opened, BACK);
    expect(returned).toEqual(start);
    expect(returned.results).toBe(start.results);
    expect([encodeSave(opened), saveTextFor(encodeSave(start), opened), saveTextFor(encodeSave(start), returned)]).toEqual([encodeSave(start), undefined, undefined]);
  });
  it.each(OTHER_SCREENS)("Given %s, when ViewInbox arrives, then nothing happens (the very same state): the Inbox is reached from a known club's home only @error @boundary @contract-shape:bounded-change", (_label, state) => {
    expect(update(state, VIEW)).toBe(state);
  });
  it("Given the Inbox of a club that is not in the league, when Back arrives, then nothing happens; and from the Inbox no other screen opens (Squad, Tactics, Starting XI, Play match, Table, End of season, New game) @error @boundary @contract-shape:bounded-change", () => {
    const stranger: GameState = { ...home, screen: inbox("nobody-fc") };
    expect(update(stranger, BACK)).toBe(stranger);
    const opened = update(afterMatchdays(home, 14), VIEW);
    for (const type of ["ViewSquad", "ViewTactics", "ViewStartingXI", "PlayMatch", "ViewTable", "ViewSeasonEnd", "NewGame"] as const) expect(update(opened, { type })).toBe(opened);
  });
  it("Given Sam goes from the club home to the Inbox and back, when the focus plan is asked, then each arrival focuses the new heading (the Inbox's h1, then the club's name) @driving_port @contract-shape:pure-function", () => {
    expect([focusPlan(home.screen, inbox(id), undefined), focusPlan(inbox(id), home.screen, undefined)]).toEqual([{ kind: "heading" }, { kind: "heading" }]);
  });
});
describe("@US-1 @US-2 S-011 inboxOf reads the club's messages from the recorded results", () => {
  it("Given a club that is not in the league, when its Inbox is read, then there is none (undefined) @error @boundary @contract-shape:pure-function", () => {
    expect(inboxOf(home, "nobody-fc")).toBeUndefined();
  });
  it("Given 0 to 14 matches played at ?seed=31, when the Inbox is read, then there are exactly that many messages, newest first, equal to the reference table (3 matches: positions 6th, 8th, 6th) @walking_skeleton @driving_port @boundary @contract-shape:pure-function", () => {
    for (let played = 0; played <= 14; played++) expect(inboxOf(afterMatchdays(home, played), id)).toEqual(SEED_31_REPORTS.slice(0, played).reverse());
    expect(inboxOf(walk(home, [...PLAY_AND_BACK, ...PLAY_AND_BACK, ...PLAY_AND_BACK]), id)!.map(({ position }) => position)).toEqual([6, 8, 6]);
  });
  it("Given the default seed and Oakhampton Rise Borough after one match, when the Inbox is read, then the one message is Harrowgate Lane United 0–1 Oakhampton Rise Borough at position 3 @driving_port @boundary @contract-shape:pure-function", () => {
    const index = generateLeague(SEED_20260).clubs.findIndex((club) => club.name === SEED_20260_CLUB);
    const state = afterMatchdays(homeOf(SEED_20260, index), 1);
    expect(inboxOf(state, clubOf(state))).toEqual([SEED_20260_FIRST]);
  });
  it("Given a saved season restored from its own text, when the Inbox is read, then it equals the Inbox of the season that was saved (the log is all there is) @boundary @contract-shape:pure-function", () => {
    const played = afterMatchdays(home, 9);
    expect(inboxOf(decodeSave(encodeSave(played))!, id)).toEqual(inboxOf(played, id));
  });
});
