// @US-1 @US-2 (S-006 play my first match) @regression
// CONTRACT_SHAPE: pure-function
// Outcome anchor: DISCUSS D11: no new accessible name may collide with an existing one, nor a generated name with a new one.
// Playwright matches names as case-insensitive substrings, so no club, player or colour name may contain "Play match", "Goals"
// or "Matchday", and the new button name may not contain a word that names an existing screen or button.
// Passes before and after DELIVER: the name arrays are not touched by S-006.
import { describe, expect, it } from "vitest";
import { CLUB_SUFFIXES, COLOUR_PALETTE, FIRST_NAMES, SURNAMES, TOWNS } from "../../../src/domain/names";

const NEW_NAMES = ["Play match", "Goals", "Matchday"] as const;
const EXISTING_LOCATOR_WORDS = ["Squad", "Tactics", "Starting", "Players", "Back", "Clubs", "Choose", "Formation", "Line-up"] as const;
const ARRAYS: readonly (readonly [string, readonly string[]])[] = [
  ["TOWNS", TOWNS],
  ["CLUB_SUFFIXES", CLUB_SUFFIXES],
  ["COLOUR_PALETTE", COLOUR_PALETTE],
  ["FIRST_NAMES", FIRST_NAMES],
  ["SURNAMES", SURNAMES],
];
const contains = (text: string, word: string): boolean => text.toLowerCase().includes(word.toLowerCase());

describe("@US-1 @US-2 S-006 generated names never read like the match button, the goals list or the matchday heading", () => {
  it.each(ARRAYS)("Given every entry of %s, when searched for the three new names (any case, any part of a word), then none appears @regression @error @contract-shape:pure-function", (_name, entries) => {
    expect(entries.length).toBeGreaterThan(0);
    const clashes = entries.flatMap((entry) => NEW_NAMES.filter((word) => contains(entry, word)).map((word) => `${entry} contains ${word}`));
    expect(clashes).toEqual([]);
  });

  it("Given the name arrays, when a player's or club's full text is built from them, then it cannot hold a new name across the joining space either @regression @boundary @contract-shape:pure-function", () => {
    const joined = [...FIRST_NAMES.flatMap((first) => SURNAMES.map((last) => `${first} ${last}`)), ...TOWNS.flatMap((town) => CLUB_SUFFIXES.map((suffix) => `${town} ${suffix}`))];
    const clashes = joined.filter((text) => NEW_NAMES.some((word) => contains(text, word)));
    expect(clashes).toEqual([]);
  });

  it("Given the new button name, when compared with the words that locate the S-001..S-005 screens, then it contains none of them @regression @boundary @contract-shape:pure-function", () => {
    const clashes = EXISTING_LOCATOR_WORDS.filter((word) => contains("Play match", word));
    expect(clashes).toEqual([]);
    expect(EXISTING_LOCATOR_WORDS.filter((word) => contains("Goals", word) || contains("Matchday", word))).toEqual([]);
  });
});
