// @US-2 (S-010 save and continue my season)
// CONTRACT_SHAPE: pure-function
// Outcome anchor: DISCUSS D6 and K3: an unreadable save (damaged, incompatible, inconsistent with its own league) is "no saved game": decodeSave never
// throws and returns undefined, with nothing logged; a valid save with unknown extra keys still restores. One table row per rejection rule of
// ADR-0016 Decision (the strict reading of a stored text). RED against the scaffolds. The forced throw proves the single catch in decodeSave (Earned Trust 7).
import fc from "fast-check";
import { afterEach, describe, expect, it, vi } from "vitest";
import { decodeSave, encodeSave } from "../../../src/app/save";
import { afterMatchdays, homeOf } from "./save-world";
import { DAMAGED_SAVE_TEXT, INCOMPATIBLE_SAVE_TEXT, SEED_31_SAVE_TEXT } from "./save-golden";

const forcedThrow = vi.hoisted(() => ({ on: false }));
vi.mock("../../../src/domain/league", async (original) => {
  const real = await original<typeof import("../../../src/domain/league")>();
  return { ...real, generateLeague: (seed: number) => (forcedThrow.on ? (() => { throw new Error("forced"); })() : real.generateLeague(seed)) };
});

type Json = Record<string, any>;
const golden = (): Json => JSON.parse(SEED_31_SAVE_TEXT);
const edit = (change: (save: Json) => void): string => { const save = golden(); change(save); return JSON.stringify(save); };
const fullSeason = (): string => encodeSave(afterMatchdays(homeOf(31, 0), 14))!;

afterEach(() => vi.restoreAllMocks());

const REJECTED: readonly (readonly [string, string])[] = [
  ["the first 100 characters (damaged)", DAMAGED_SAVE_TEXT],
  ["version 0 (incompatible)", INCOMPATIBLE_SAVE_TEXT],
  ["version 2", edit((s) => { s.v = 2; })],
  ["version as text", edit((s) => { s.v = "1"; })],
  ["a seed that is not a 32-bit integer", edit((s) => { s.seed = 2 ** 40; })],
  ["a fractional seed", edit((s) => { s.seed = 31.5; })],
  ["a club that is not in the league", edit((s) => { s.clubId = "club-9"; })],
  ["a formation that does not exist", edit((s) => { s.formation = "5-3-2"; })],
  ["an eleven of ten players", edit((s) => { s.xi = [0, 2, 3, 4, 5, 6, 7, 8, 9, 10]; })],
  ["an eleven with a player twice", edit((s) => { s.xi = [0, 2, 2, 3, 4, 5, 6, 7, 8, 9, 10]; })],
  ["an eleven naming player 18", edit((s) => { s.xi = [0, 2, 3, 4, 5, 6, 7, 8, 9, 10, 18]; })],
  ["an eleven in the wrong positions", edit((s) => { s.xi = [17, 16, 15, 14, 13, 12, 11, 10, 9, 8, 7]; })],
  ["an empty log", edit((s) => { s.results = []; })],
  ["a log that is not a list", edit((s) => { s.results = { 0: 1 }; })],
  ["a log cut mid-matchday (7 entries)", edit((s) => { s.results = s.results.slice(0, 7); })],
  ["a log of 15 matchdays", edit((s) => { s.results = [...afterMatchdays(homeOf(31, 0), 14).results!, ...s.results.slice(0, 4).map((r: Json) => ({ ...r, matchday: 15 }))]; })],
  ["matchdays swapped", edit((s) => { s.results[0].matchday = 2; })],
  ["a fixture index swapped", edit((s) => { s.results[1].fixtureIndex = 0; })],
  ["home and away swapped", edit((s) => { [s.results[0].home, s.results[0].away] = [s.results[0].away, s.results[0].home]; })],
  ["a score that disagrees with its goals", edit((s) => { s.results[0].result.homeGoals += 1; })],
  ["a score above 9", edit((s) => { s.results[0].result.homeGoals = 10; })],
  ["a goal for neither side", edit((s) => { s.results[0].result.goals[0].side = "both"; })],
  ["a goal by player 18", edit((s) => { s.results[0].result.goals[0].playerIndex = 18; })],
  ["a goal in minute 0", edit((s) => { s.results[0].result.goals[0].minute = 0; })],
  ["a goal in minute 91", edit((s) => { s.results[0].result.goals[0].minute = 91; })],
  ["goal minutes running backwards", edit((s) => { s.results[0].result.goals.reverse(); })],
  ["nothing but null", "null"],
  ["a list", "[]"],
  ["no text at all", ""],
  ["a half-written object", "{"],
];

describe("@US-2 S-010 an unreadable saved game is ignored, never an error", () => {
  it.each(REJECTED)("Given a stored game with %s, when the title reads it, then there is no saved game and nothing is thrown or logged @error @boundary @contract-shape:pure-function", (_rule, text) => {
    const logged = [vi.spyOn(console, "error"), vi.spyOn(console, "warn"), vi.spyOn(console, "log")];
    expect(decodeSave(text)).toBeUndefined();
    expect(decodeSave(undefined)).toBeUndefined();
    expect(decodeSave(null)).toBeUndefined();
    for (const spy of logged) expect(spy).not.toHaveBeenCalled();
  });

  it("Given a valid saved game with unknown extra entries and no results, when read, then it comes back as the saved club's home (the extras are ignored) @boundary @contract-shape:pure-function", () => {
    const withExtras = edit((s) => { s.note = "hello"; delete s.results; });
    expect(decodeSave(withExtras)).toEqual(homeOf(31, 0));
    expect(decodeSave(JSON.stringify({ v: 1, seed: 31, clubId: "club-1", formation: "4-4-2" }))).toEqual(homeOf(31, 0));
  });

  it("Given any text, any JSON value, any truncation or any one-character change of a valid save, when decoded, then reading never throws, a cut-short text is never a saved game, and a changed text gives nothing or a game that saves back to itself @property @error @contract-shape:pure-function", () => {
    const FULL_SEASON = fullSeason();
    fc.assert(fc.property(fc.string(), (text) => { expect(() => decodeSave(text)).not.toThrow(); }), { numRuns: 200 });
    fc.assert(fc.property(fc.jsonValue(), (value) => { expect(() => decodeSave(JSON.stringify(value))).not.toThrow(); expect(decodeSave(JSON.stringify(value))).toBeUndefined(); }), { numRuns: 200 });
    fc.assert(fc.property(fc.nat(FULL_SEASON.length - 1), (cut) => { expect(decodeSave(FULL_SEASON.slice(0, cut))).toBeUndefined(); }), { numRuns: 200 });
    fc.assert(
      fc.property(fc.nat(FULL_SEASON.length - 1), fc.string({ minLength: 1, maxLength: 1 }), (at, replacement) => {
        const changed = decodeSave(FULL_SEASON.slice(0, at) + replacement + FULL_SEASON.slice(at + 1));
        if (changed !== undefined) expect(decodeSave(encodeSave(changed)!)).toEqual(changed);
      }),
      { numRuns: 200 },
    );
  });

  it("Given a reading of the stored game that fails inside on a text nobody thought of, when the title reads it, then there is no saved game and nothing is logged @error @contract-shape:pure-function", () => {
    const logged = [vi.spyOn(console, "error"), vi.spyOn(console, "warn")];
    forcedThrow.on = true;
    try {
      expect(decodeSave(SEED_31_SAVE_TEXT)).toBeUndefined();
    } finally {
      forcedThrow.on = false;
    }
    for (const spy of logged) expect(spy).not.toHaveBeenCalled();
    expect(decodeSave(SEED_31_SAVE_TEXT)).toBeDefined();
  });
});
