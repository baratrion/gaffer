// @US-1 (S-010 save and continue my season) @regression
// CONTRACT_SHAPE: pure-function
import { describe, expect, it } from "vitest";
import { CLUB_SUFFIXES, COLOUR_PALETTE, FIRST_NAMES, SURNAMES, TOWNS } from "../../../src/domain/names";
const has = (text: string, word: string): boolean => text.toLowerCase().includes(word.toLowerCase());
const ARRAYS = [["TOWNS", TOWNS], ["CLUB_SUFFIXES", CLUB_SUFFIXES], ["COLOUR_PALETTE", COLOUR_PALETTE], ["FIRST_NAMES", FIRST_NAMES], ["SURNAMES", SURNAMES]] as const;
describe("@US-1 S-010 generated names never read like the Continue button", () => {
  it.each(ARRAYS)("Given every entry of %s, when searched for Continue (any case, any part), then none contains it @regression @error @contract-shape:pure-function", (_name, entries) => {
    expect(entries.filter((entry) => has(entry, "Continue"))).toEqual([]);
  });
  it("Given a full club or player text, when joined across the space, then it cannot hold Continue, nor does Continue contain a locator word of an earlier screen @regression @boundary @contract-shape:pure-function", () => {
    const joined = [...FIRST_NAMES.flatMap((first) => SURNAMES.map((last) => `${first} ${last}`)), ...TOWNS.flatMap((town) => CLUB_SUFFIXES.map((suffix) => `${town} ${suffix}`))];
    expect(joined.filter((text) => has(text, "Continue"))).toEqual([]);
    expect(["New game", "Play match", "Play again", "End of season", "Table", "Back", "Squad"].filter((word) => has("Continue", word) || has(word, "Continue"))).toEqual([]);
  });
});
