// @US-1 @US-2 (S-009 see how my season ended) @regression
// CONTRACT_SHAPE: pure-function
// Outcome anchor: DISCUSS D8 (DESIGN D11, S-008 D9 precedent): "End of season", "Final position", "Top scorer" and "Play again" are the exact texts of
// the new club-home button, the two lines and the new button. No generated name may contain any of them (case-insensitive), so a text locator
// can never match a club, player or colour name (the town "Saltmarsh End" holds "End" and is why locators use exact: true), and none may
// collide with the locator words of S-001..S-008. Passes before and after DELIVER: S-009 does not touch the name arrays.
import { describe, expect, it } from "vitest";
import { CLUB_SUFFIXES, COLOUR_PALETTE, FIRST_NAMES, SURNAMES, TOWNS } from "../../../src/domain/names";

const PHRASES = ["End of season", "Final position", "Top scorer", "Play again"] as const;
const EXISTING_LOCATOR_WORDS = [
  "Squad", "Tactics", "Starting", "Players", "Back", "Clubs", "Choose", "Formation", "Line-up", "Play match", "Goals", "Matchday", "Table", "League table", "Season over",
] as const;
const ARRAYS: readonly (readonly [string, readonly string[]])[] = [
  ["TOWNS", TOWNS], ["CLUB_SUFFIXES", CLUB_SUFFIXES], ["COLOUR_PALETTE", COLOUR_PALETTE], ["FIRST_NAMES", FIRST_NAMES], ["SURNAMES", SURNAMES],
];
const contains = (text: string, word: string): boolean => text.toLowerCase().includes(word.toLowerCase());

describe("@US-1 @US-2 S-009 generated names never read like the End of season screen", () => {
  it.each(PHRASES.flatMap((phrase) => ARRAYS.map(([name, entries]) => [name, phrase, entries] as const)))(
    "Given every entry of %s, when searched for %s (any case, any part), then none contains it @regression @error @contract-shape:pure-function",
    (_name, phrase, entries) => {
      expect(entries.length).toBeGreaterThan(0);
      expect(entries.filter((entry) => contains(entry, phrase))).toEqual([]);
    },
  );

  it("Given the name arrays, when a club's or player's full text is built from them, then it cannot hold any of the four phrases across the joining space either @regression @boundary @contract-shape:pure-function", () => {
    const joined = [...FIRST_NAMES.flatMap((first) => SURNAMES.map((last) => `${first} ${last}`)), ...TOWNS.flatMap((town) => CLUB_SUFFIXES.map((suffix) => `${town} ${suffix}`))];
    for (const phrase of PHRASES) expect(joined.filter((text) => contains(text, phrase)), phrase).toEqual([]);
  });

  it("Given the name arrays, when searched for the words season, scorer and position on their own, then no entry contains them (a stricter guard than the whole phrases) @regression @boundary @contract-shape:pure-function", () => {
    const all = ARRAYS.flatMap(([, entries]) => entries);
    for (const word of ["season", "scorer", "position", "again"]) expect(all.filter((entry) => contains(entry, word)), word).toEqual([]);
  });

  it("Given the four phrases and the locator words of every earlier screen, when compared, then neither contains the other @regression @boundary @contract-shape:pure-function", () => {
    const clashes = PHRASES.flatMap((phrase) => EXISTING_LOCATOR_WORDS.filter((word) => contains(phrase, word) || contains(word, phrase)).map((word) => [phrase, word]));
    expect(clashes).toEqual([]);
  });

  it("Given the four phrases, when compared with each other, then no phrase contains another @regression @boundary @contract-shape:pure-function", () => {
    const clashes = PHRASES.flatMap((phrase) => PHRASES.filter((other) => other !== phrase && contains(phrase, other)));
    expect(clashes).toEqual([]);
  });
});
