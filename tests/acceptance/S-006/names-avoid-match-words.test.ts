// @US-1 @US-2 (S-006 play my first match) @regression
// CONTRACT_SHAPE: pure-function
// Outcome anchor: DISCUSS D11: no new accessible name may collide with an existing one, nor a generated name with a new
// one. Playwright matches names as case-insensitive substrings, so no club, player or colour may contain "Play match",
// "Goals" or "Matchday", and the three new names must not contain, or sit inside, any name a screen already has.
// Passes before and after DELIVER: the name arrays are not touched by S-006.
import { describe, expect, it } from "vitest";
import { CLUB_SUFFIXES, COLOUR_PALETTE, FIRST_NAMES, SURNAMES, TOWNS } from "../../../src/domain/names";

const NEW_WORDS = ["Play match", "Goals", "Matchday"] as const;
const NEW_FIXED_NAMES = ["Play match", "Goals", "Matchday 1"] as const;
const EXISTING_FIXED_NAMES = [
  "Gaffer", "New game", "Choose your club", "Clubs", "Squad", "Tactics", "Formation", "Line-up", "Starting XI", "Players",
  "Back", "Attributes", "Goalkeeping", "Defending", "Passing", "Shooting", "Position", "Age", "Overall", "Condition",
  "Choose GK", "Choose DF", "Choose MF", "Choose FW", "Starting", "4-4-2", "4-3-3", "4-2-3-1",
] as const;
const ARRAYS: readonly (readonly [string, readonly string[]])[] = [
  ["TOWNS", TOWNS],
  ["CLUB_SUFFIXES", CLUB_SUFFIXES],
  ["COLOUR_PALETTE", COLOUR_PALETTE],
  ["FIRST_NAMES", FIRST_NAMES],
  ["SURNAMES", SURNAMES],
];
const holds = (text: string, word: string): boolean => text.toLowerCase().includes(word.toLowerCase());

describe("@US-1 @US-2 S-006 generated names never read like the match button, the goals list or the matchday heading", () => {
  it.each(ARRAYS)("Given every entry of %s, when searched for Play match, Goals and Matchday (any case, any part of a word), then none appears @regression @error @contract-shape:pure-function", (_name, entries) => {
    expect(entries.length).toBeGreaterThan(0);
    const clashes = entries.flatMap((entry) => NEW_WORDS.filter((word) => holds(entry, word)).map((word) => `${entry} contains ${word}`));
    expect(clashes).toEqual([]);
  });

  it("Given the name arrays, when a player's or club's full text is built from them, then it cannot hold a new word across the joining space either @regression @boundary @contract-shape:pure-function", () => {
    const joined = [...FIRST_NAMES.flatMap((first) => SURNAMES.map((last) => `${first} ${last}`)), ...TOWNS.flatMap((town) => CLUB_SUFFIXES.map((suffix) => `${town} ${suffix}`))];
    const clashes = joined.filter((text) => NEW_WORDS.some((word) => holds(text, word)));
    expect(clashes).toEqual([]);
  });

  it.each(NEW_FIXED_NAMES)("Given the new name %s and every name a screen already has, when compared as case-insensitive substrings either way, then neither holds the other @regression @boundary @contract-shape:pure-function", (fresh) => {
    const clashes = EXISTING_FIXED_NAMES.filter((old) => holds(old, fresh) || holds(fresh, old));
    expect(clashes).toEqual([]);
  });
});
