// @US-1 @US-2 (S-007 see the league table after my first match) @regression
// CONTRACT_SHAPE: pure-function
// Outcome anchor: DISCUSS D11 and D14: no new accessible name may collide with an existing one, nor a generated name with a new one.
// Playwright matches names as case-insensitive substrings, so no club, player or colour name may contain "Table" or "League table", the
// new button name may not contain a word that names an existing screen or button (nor the reverse), and the eight column headers must be
// matched exactly: none of them may equal a generated name, and "Club" differs from the list "Clubs" only by role and exactness.
// Passes before and after DELIVER: the name arrays are not touched by S-007.
import { describe, expect, it } from "vitest";
import { CLUB_SUFFIXES, COLOUR_PALETTE, FIRST_NAMES, SURNAMES, TOWNS } from "../../../src/domain/names";

const NEW_NAMES = ["Table", "League table"] as const;
const COLUMN_NAMES = ["Pos", "Club", "P", "W", "D", "L", "GD", "Pts"] as const;
const EXISTING_LOCATOR_WORDS = ["Squad", "Tactics", "Starting", "Players", "Back", "Clubs", "Choose", "Formation", "Line-up", "Play match", "Goals", "Matchday"] as const;
const ARRAYS: readonly (readonly [string, readonly string[]])[] = [
  ["TOWNS", TOWNS],
  ["CLUB_SUFFIXES", CLUB_SUFFIXES],
  ["COLOUR_PALETTE", COLOUR_PALETTE],
  ["FIRST_NAMES", FIRST_NAMES],
  ["SURNAMES", SURNAMES],
];
const contains = (text: string, word: string): boolean => text.toLowerCase().includes(word.toLowerCase());
const joined = (): string[] => [
  ...FIRST_NAMES.flatMap((first) => SURNAMES.map((last) => `${first} ${last}`)),
  ...TOWNS.flatMap((town) => CLUB_SUFFIXES.map((suffix) => `${town} ${suffix}`)),
];

describe("@US-1 @US-2 S-007 generated names never read like the Table button or the League table screen", () => {
  it.each(ARRAYS)("Given every entry of %s, when searched for the new names (any case, any part of a word), then none appears @regression @error @contract-shape:pure-function", (_name, entries) => {
    expect(entries.length).toBeGreaterThan(0);
    const clashes = entries.flatMap((entry) => NEW_NAMES.filter((word) => contains(entry, word)).map((word) => `${entry} contains ${word}`));
    expect(clashes).toEqual([]);
  });

  it("Given the name arrays, when a player's or club's full text is built from them, then it cannot hold a new name across the joining space either @regression @boundary @contract-shape:pure-function", () => {
    expect(joined().filter((text) => NEW_NAMES.some((word) => contains(text, word)))).toEqual([]);
  });

  it("Given the new names, when compared with the words that locate the S-001..S-006 screens, then neither contains the other @regression @boundary @contract-shape:pure-function", () => {
    for (const word of EXISTING_LOCATOR_WORDS) {
      for (const name of NEW_NAMES) {
        expect(contains(name, word), `"${name}" contains "${word}"`).toBe(false);
        expect(contains(word, name), `"${word}" contains "${name}"`).toBe(false);
      }
    }
  });
});

describe("@US-1 @US-2 S-007 the column headers can be told apart from every generated name", () => {
  it("Given the eight column headers, when compared with each other, then they are eight different names (Pos, Club, P, W, D, L, GD, Pts) @regression @boundary @contract-shape:pure-function", () => {
    expect(new Set(COLUMN_NAMES.map((name) => name.toLowerCase())).size).toBe(COLUMN_NAMES.length);
  });

  it("Given the name arrays and the built texts, when compared with the column headers, then no generated text equals a header, so an exact locator finds only the header @regression @error @contract-shape:pure-function", () => {
    const generated = [...ARRAYS.flatMap(([, entries]) => entries), ...joined()];
    const clashes = generated.filter((text) => COLUMN_NAMES.some((name) => text.toLowerCase() === name.toLowerCase()));
    expect(clashes).toEqual([]);
  });

  it("Given the header Club and the list Clubs, when matched as plain text, then Club is a part of Clubs, which is why every header locator must be exact @regression @boundary @contract-shape:pure-function", () => {
    expect(contains("Clubs", "Club")).toBe(true);
    expect(contains("Clubs", "Pos") || contains("Clubs", "Pts") || contains("Clubs", "GD")).toBe(false);
  });
});
