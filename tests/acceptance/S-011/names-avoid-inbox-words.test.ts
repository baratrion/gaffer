// @US-1 @US-2 (S-011 read my club's news in the Inbox) @regression
// CONTRACT_SHAPE: pure-function
// Passes before and after DELIVER: the Inbox's fixed texts must never be mistaken for generated names, because the pins and the e2e locate them by text.
import { describe, expect, it } from "vitest";
import { CLUB_SUFFIXES, COLOUR_PALETTE, FIRST_NAMES, SURNAMES, TOWNS } from "../../../src/domain/names";
const has = (text: string, word: string): boolean => text.toLowerCase().includes(word.toLowerCase());
const INBOX_TEXTS = ["Inbox", "Messages", "League position", "No messages yet"] as const;
const ARRAYS = [["TOWNS", TOWNS], ["CLUB_SUFFIXES", CLUB_SUFFIXES], ["COLOUR_PALETTE", COLOUR_PALETTE], ["FIRST_NAMES", FIRST_NAMES], ["SURNAMES", SURNAMES]] as const;
describe("@US-1 @US-2 S-011 generated names never read like the Inbox's own texts", () => {
  it.each(INBOX_TEXTS)("Given every generated name part, when searched for %s (any case, any part), then none contains it @regression @error @contract-shape:pure-function", (text) => {
    for (const [, entries] of ARRAYS) expect(entries.filter((entry) => has(entry, text) || has(text, entry))).toEqual([]);
  });
  it("Given a full club or player name, when the parts are joined across the space, then none holds an Inbox text, and the texts do not hold each other's locator words @regression @boundary @contract-shape:pure-function", () => {
    const joined = [...FIRST_NAMES.flatMap((first) => SURNAMES.map((last) => `${first} ${last}`)), ...TOWNS.flatMap((town) => CLUB_SUFFIXES.map((suffix) => `${town} ${suffix}`))];
    for (const text of INBOX_TEXTS) expect(joined.filter((name) => has(name, text))).toEqual([]);
    expect(["Back", "Table", "Squad", "Tactics", "Play match", "End of season", "New game", "Continue", "Matchday"].filter((word) => has("Inbox", word) || has("Messages", word))).toEqual([]);
  });
});
