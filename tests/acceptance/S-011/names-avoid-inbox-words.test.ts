// @US-1 (S-011 read my club's news in the Inbox) @regression
// CONTRACT_SHAPE: pure-function
// Outcome anchor: DISCUSS "Names check": no generated club or player name holds "Inbox", "Messages", "League position" or "No messages yet", so the
// exact-name locators of the Inbox screen can never match a generated name.
import { describe, expect, it } from "vitest";
import { CLUB_SUFFIXES, COLOUR_PALETTE, FIRST_NAMES, SURNAMES, TOWNS } from "../../../src/domain/names";

const WORDS = ["Inbox", "Messages", "League position", "No messages yet"] as const;
const has = (text: string, word: string): boolean => text.toLowerCase().includes(word.toLowerCase());
const ARRAYS = [["TOWNS", TOWNS], ["CLUB_SUFFIXES", CLUB_SUFFIXES], ["COLOUR_PALETTE", COLOUR_PALETTE], ["FIRST_NAMES", FIRST_NAMES], ["SURNAMES", SURNAMES]] as const;

describe("@US-1 S-011 generated names never read like the Inbox texts", () => {
  it.each(ARRAYS)("Given every entry of %s, when searched for each Inbox word (any case, any part), then none contains one @regression @error @contract-shape:pure-function", (_name, entries) => {
    for (const word of WORDS) expect(entries.filter((entry) => has(entry, word)), word).toEqual([]);
  });

  it("Given a full club or player text, when joined across the space, then it cannot hold an Inbox word @regression @boundary @contract-shape:pure-function", () => {
    const joined = [...FIRST_NAMES.flatMap((first) => SURNAMES.map((last) => `${first} ${last}`)), ...TOWNS.flatMap((town) => CLUB_SUFFIXES.map((suffix) => `${town} ${suffix}`))];
    for (const word of WORDS) expect(joined.filter((text) => has(text, word)), word).toEqual([]);
  });
});
