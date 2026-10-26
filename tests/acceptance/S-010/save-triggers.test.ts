// @US-1 @US-2 (S-010 save and continue my season)
// CONTRACT_SHAPE: bounded-change
// Outcome anchor: DISCUSS D1 and D4 (and the "Save triggers" and "D4" test intents): the game saves after the club pick, a formation change, a Starting XI
// pick and Play match, and after nothing else; "New game" and "Play again" with no club picked leave the stored game alone; the club-choice tap
// replaces it. Driving ports: saveTextFor (the pure decision) and createAutosave over a fake write (the effect). RED against the scaffolds.
import { afterEach, describe, expect, it, vi } from "vitest";
import { createAutosave } from "../../../src/adapters/save-store";
import { encodeSave, saveTextFor } from "../../../src/app/save";
import { initialState, update, type Action, type GameState } from "../../../src/app/state";
import { afterMatchdays, homeOf, NEW_GAME, walk, withFormation, withPick } from "./save-world";

afterEach(() => vi.restoreAllMocks());

const home = afterMatchdays(homeOf(31, 0), 2);
const stored = (): string | undefined => encodeSave(home);
const squad: Action = { type: "ViewSquad" };
const SAVES: readonly (readonly [string, readonly Action[]])[] = [
  ["Play match", [{ type: "PlayMatch" }]],
  ["a new formation, 4-3-3", [{ type: "ViewTactics" }, { type: "ChooseFormation", formation: "4-3-3" }]],
];
const NOTHING: readonly (readonly [string, readonly Action[]])[] = [
  ["Squad", [squad]],
  ["Player", [squad, { type: "ViewPlayer", playerIndex: 3 }]],
  ["Table", [{ type: "ViewTable" }]],
  ["Tactics", [{ type: "ViewTactics" }]],
  ["the formation it already has", [{ type: "ViewTactics" }, { type: "ChooseFormation", formation: "4-4-2" }]],
  ["Starting XI", [{ type: "ViewStartingXI" }]],
  ["a slot and Back", [{ type: "ViewStartingXI" }, { type: "ChooseSlot", slot: 5 }, { type: "Back" }]],
  ["Back", [squad, { type: "Back" }]],
];

describe("@US-1 @US-2 S-010 only a tap that changes the game saves it", () => {
  it.each(SAVES)("Given a saved game after two matches, when Sam taps %s, then a new text is to be saved @driving_port @contract-shape:pure-function", (_tap, taps) => {
    const text = saveTextFor(stored(), walk(home, taps));
    expect(text).toBeDefined();
    expect(text).not.toBe(stored());
  });

  it("Given a saved game after two matches, when Sam picks a player outside the eleven for a slot, then a new text is to be saved @driving_port @contract-shape:pure-function", () => {
    expect(saveTextFor(stored(), withPick(home, 0, 5))).toBe(encodeSave(withPick(home, 0, 5)));
    expect(saveTextFor(stored(), withPick(home, 0, 5))).not.toBe(stored());
  });

  it.each(NOTHING)("Given a saved game after two matches, when Sam taps %s, then nothing is to be saved @boundary @contract-shape:pure-function", (_tap, taps) => {
    expect(saveTextFor(stored(), walk(home, taps))).toBeUndefined();
  });

  it("Given a saved game, when New game or Continue is tapped, or the pick-a-club screen is shown, then nothing is saved until a club is picked, and the club choice saves the new game @boundary @contract-shape:pure-function", () => {
    const title: GameState = { ...home, screen: { kind: "title" } };
    expect(saveTextFor(stored(), title)).toBeUndefined();
    const pickClub = update(title, NEW_GAME);
    expect(pickClub.screen.kind).toBe("pickClub");
    expect(saveTextFor(stored(), pickClub)).toBeUndefined();
    const fresh = update(pickClub, { type: "ChooseClub", clubId: "club-1" });
    expect(saveTextFor(stored(), fresh)).toBe(encodeSave(homeOf(31, 0)));
    expect(saveTextFor(encodeSave(homeOf(31, 0)), homeOf(31, 0))).toBeUndefined();
  });

  it("Given a finished season, when Sam taps End of season and Play again, then nothing is saved, and the next club pick replaces the finished game @boundary @contract-shape:pure-function", () => {
    const over = afterMatchdays(homeOf(31, 0), 14);
    const last = encodeSave(over);
    expect(saveTextFor(last, walk(over, [{ type: "ViewSeasonEnd" }]))).toBeUndefined();
    const again = walk(over, [{ type: "ViewSeasonEnd" }, NEW_GAME]);
    expect(saveTextFor(last, again)).toBeUndefined();
    expect(saveTextFor(last, update(again, { type: "ChooseClub", clubId: "club-1" }))).toBe(encodeSave(homeOf(31, 0)));
  });

  it("Given a game with no club picked yet, when the title or the pick-a-club screen is shown, then no text exists to save @error @contract-shape:pure-function", () => {
    const title = initialState(home.league);
    expect(saveTextFor(undefined, title)).toBeUndefined();
    expect(saveTextFor(undefined, update(title, NEW_GAME))).toBeUndefined();
    expect(encodeSave(title)).toBeUndefined();
  });
});

const fakeWrite = (results: boolean[]): { write: (text: string) => boolean; written: string[] } => {
  const written: string[] = [];
  return { written, write: (text) => { written.push(text); return results.shift() ?? true; } };
};

describe("@US-1 @US-2 S-010 the autosave writes the stored game at the right moments only", () => {
  it("Given a stored game, when Sam taps New game (no club), picks Netherwold Borough and plays, then the old text stays until the club pick and each saving tap writes once @driving_port @contract-shape:bounded-change", () => {
    const { write, written } = fakeWrite([]);
    const autosave = createAutosave(write, stored());
    const states = [{ ...home, screen: { kind: "title" } } as GameState];
    states.push(update(states[0]!, NEW_GAME));
    states.push(update(states[1]!, { type: "ChooseClub", clubId: "club-1" }));
    states.push(update(states[2]!, { type: "PlayMatch" }));
    states.push(update(states[3]!, { type: "Back" }));
    for (const state of states) autosave(state);
    expect(written).toEqual([encodeSave(states[2]!), encodeSave(states[3]!)]);
  });

  it("Given a write that fails, when the next tap comes, then the game is saved again, earlier text included (T1 saved, T2 fails, back at T1 writes T1) @error @contract-shape:bounded-change", () => {
    const t1 = withFormation(home, "4-3-3");
    const t2 = withPick(t1, 0, 5);
    const { write, written } = fakeWrite([true, false]);
    const autosave = createAutosave(write, undefined);
    autosave(t1);
    autosave(t2);
    autosave(t1);
    expect(written).toEqual([encodeSave(t1), encodeSave(t2), encodeSave(t1)]);
  });

  it("Given a write that throws, or a state that cannot be saved, when a tap comes, then play carries on, nothing is logged, and saving is tried again @error @contract-shape:bounded-change", () => {
    const logged = [vi.spyOn(console, "error"), vi.spyOn(console, "warn")];
    const autosave = createAutosave(() => { throw new Error("quota"); }, undefined);
    expect(() => autosave(home)).not.toThrow();
    expect(() => autosave({ ...home, screen: { kind: "clubHome", clubId: "nobody" } })).not.toThrow();
    expect(() => autosave(home)).not.toThrow();
    for (const spy of logged) expect(spy).not.toHaveBeenCalled();
  });
});
