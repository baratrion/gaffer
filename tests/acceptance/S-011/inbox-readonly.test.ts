// @US-1 (S-011 read my club's news in the Inbox) held out until DELIVER step 3
// CONTRACT_SHAPE: bounded-change
// K3: opening the Inbox changes nothing in the game and writes no save (D6). The pool is the 40-action property's, now WITH ViewInbox: the existing 40-action properties keep
// their pools (and stay unedited); this is the one new property that includes the new action.
import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { encodeSave, saveTextFor } from "../../../src/app/save";
import { initialState, update, type Action, type GameState } from "../../../src/app/state";
import { FORMATIONS } from "../../../src/domain/formation";
import { generateLeague } from "../../../src/domain/league";

const league = generateLeague(31);
const plain = (type: Exclude<Action["type"], "ChooseClub" | "ViewPlayer" | "ChooseFormation" | "ChooseSlot" | "PickPlayer" | "Continue">): fc.Arbitrary<Action> => fc.constant({ type } as Action);
const withoutInbox: fc.Arbitrary<Action> = fc.oneof(
  { weight: 4, arbitrary: plain("PlayMatch") }, { weight: 3, arbitrary: plain("Back") }, { weight: 2, arbitrary: plain("NewGame") }, { weight: 1, arbitrary: plain("ViewSquad") },
  { weight: 1, arbitrary: plain("ViewTactics") }, { weight: 1, arbitrary: plain("ViewStartingXI") }, { weight: 1, arbitrary: plain("ViewTable") }, { weight: 1, arbitrary: plain("ViewSeasonEnd") },
  { weight: 2, arbitrary: fc.constantFrom(...league.clubs.map((club) => club.id)).map<Action>((clubId) => ({ type: "ChooseClub", clubId })) },
  { weight: 1, arbitrary: fc.integer({ min: 0, max: 17 }).map<Action>((playerIndex) => ({ type: "ViewPlayer", playerIndex })) },
  { weight: 2, arbitrary: fc.constantFrom(...FORMATIONS).map<Action>((formation) => ({ type: "ChooseFormation", formation })) },
  { weight: 1, arbitrary: fc.integer({ min: 0, max: 10 }).map<Action>((slot) => ({ type: "ChooseSlot", slot })) },
  { weight: 1, arbitrary: fc.integer({ min: 0, max: 17 }).map<Action>((playerIndex) => ({ type: "PickPlayer", playerIndex })) },
);
const withInbox: fc.Arbitrary<Action> = fc.oneof({ weight: 1, arbitrary: plain("ViewInbox") }, { weight: 5, arbitrary: withoutInbox });
const FORTY = { minLength: 40, maxLength: 40 };
const [OPEN, BACK]: [Action, Action] = [{ type: "ViewInbox" }, { type: "Back" }];

describe("@US-1 S-011 opening the Inbox changes nothing", () => {
  it("Given any 40 taps of the game including Inbox, when the screen is a club home, then Inbox and Back return exactly that state, with the same formation, eleven and results, and the same saved text; an Inbox screen names a club of the league @property @kpi @contract-shape:bounded-change", () => {
    fc.assert(fc.property(fc.array(withInbox, FORTY), (taps) => {
      let state: GameState = initialState(league);
      for (const tap of taps) {
        state = update(state, tap);
        if (state.screen.kind === "inbox") expect(league.clubs.map((club) => club.id)).toContain(state.screen.clubId);
        if (state.screen.kind !== "clubHome") continue;
        const opened = update(state, OPEN);
        const returned = update(opened, BACK);
        expect(returned).toEqual(state);
        expect(returned.results).toBe(state.results);
        expect(returned.xi).toBe(state.xi);
        expect([encodeSave(opened), saveTextFor(encodeSave(state), opened)]).toEqual([encodeSave(state), undefined]);
      }
    }), { numRuns: 100 });
  });
  it("Given any 40 taps of the game, when the Inbox is opened and left after every tap that lands on a club home, then the season ends in exactly the state it ends in without ever opening it @property @kpi @contract-shape:bounded-change", () => {
    fc.assert(fc.property(fc.array(withoutInbox, FORTY), (taps) => {
      let [plainState, peeking]: [GameState, GameState] = [initialState(league), initialState(league)];
      for (const tap of taps) {
        plainState = update(plainState, tap);
        peeking = update(peeking, tap);
        if (peeking.screen.kind === "clubHome") peeking = update(update(peeking, OPEN), BACK);
      }
      expect(peeking).toEqual(plainState);
    }), { numRuns: 100 });
  });
});
