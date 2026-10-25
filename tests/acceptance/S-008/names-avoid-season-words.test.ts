// @US-2 (S-008 play the season, matchday by matchday) @regression
// CONTRACT_SHAPE: pure-function
// Outcome anchor: DISCUSS D9 (DESIGN D8): "Season over" is the exact text of the line that replaces "Play match" after matchday 14. No
// generated name may contain it (case-insensitive), so a text locator for "Season over" can never match a club, player or colour name, and
// it must not collide with the other locator words of S-001..S-007. Passes before and after DELIVER: S-008 does not touch the name arrays.
import { describe, expect, it } from "vitest";
import { CLUB_SUFFIXES, COLOUR_PALETTE, FIRST_NAMES, SURNAMES, TOWNS } from "../../../src/domain/names";

const SEASON_OVER = "Season over";
const EXISTING_LOCATOR_WORDS = [
  "Squad", "Tactics", "Starting", "Players", "Back", "Clubs", "Choose", "Formation", "Line-up", "Play match", "Goals", "Matchday", "Table", "League table",
] as const;
const ARRAYS: readonly (readonly [string, readonly string[]])[] = [
  ["TOWNS", TOWNS], ["CLUB_SUFFIXES", CLUB_SUFFIXES], ["COLOUR_PALETTE", COLOUR_PALETTE], ["FIRST_NAMES", FIRST_NAMES], ["SURNAMES", SURNAMES],
];
const contains = (text: string, word: string): boolean => text.toLowerCase().includes(word.toLowerCase());

describe("@US-2 S-008 generated names never read like the Season over line", () => {
  it.each(ARRAYS)("Given every entry of %s, when searched for Season over (any case, any part), then none contains it @regression @error @contract-shape:pure-function", (_name, entries) => {
    expect(entries.length).toBeGreaterThan(0);
    expect(entries.filter((entry) => contains(entry, SEASON_OVER))).toEqual([]);
  });

  it("Given the name arrays, when a club's or player's full text is built from them, then it cannot hold Season over across the joining space either @regression @boundary @contract-shape:pure-function", () => {
    const joined = [...FIRST_NAMES.flatMap((first) => SURNAMES.map((last) => `${first} ${last}`)), ...TOWNS.flatMap((town) => CLUB_SUFFIXES.map((suffix) => `${town} ${suffix}`))];
    expect(joined.filter((text) => contains(text, SEASON_OVER))).toEqual([]);
  });

  it("Given the name arrays, when searched for the word season on its own, then no entry contains it (a stricter guard than the whole phrase) @regression @boundary @contract-shape:pure-function", () => {
    expect(ARRAYS.flatMap(([, entries]) => entries).filter((entry) => contains(entry, "season"))).toEqual([]);
  });

  it("Given Season over and the locator words of every earlier screen, when compared, then neither contains the other @regression @boundary @contract-shape:pure-function", () => {
    expect(EXISTING_LOCATOR_WORDS.filter((word) => contains(SEASON_OVER, word) || contains(word, SEASON_OVER))).toEqual([]);
  });
});
