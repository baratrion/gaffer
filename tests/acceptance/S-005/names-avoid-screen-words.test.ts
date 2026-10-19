// @US-1 (S-005 pick my starting XI) @regression
// CONTRACT_SHAPE: pure-function
// Outcome anchor: DISCUSS D12: no accessible name may collide with an existing one. Playwright matches names as
// case-insensitive substrings, so no club, player or slot button may contain a word that names a screen or a button.
// Passes before and after DELIVER: the name arrays are not touched by S-005.
import { describe, expect, it } from "vitest";
import { CLUB_SUFFIXES, COLOUR_PALETTE, FIRST_NAMES, SURNAMES, TOWNS } from "../../../src/domain/names";

const BANNED = ["Back", "Squad", "Tactics", "Starting", "Players", "Formation", "Line-up", "Clubs", "Choose"] as const;
const ARRAYS: readonly (readonly [string, readonly string[]])[] = [
  ["TOWNS", TOWNS],
  ["CLUB_SUFFIXES", CLUB_SUFFIXES],
  ["COLOUR_PALETTE", COLOUR_PALETTE],
  ["FIRST_NAMES", FIRST_NAMES],
  ["SURNAMES", SURNAMES],
];

describe("@US-1 S-005 generated names never read like a screen or a button", () => {
  it.each(ARRAYS)("Given every entry of %s, when searched for the nine screen words (any case, any part of a word), then none appears @regression @error @contract-shape:pure-function", (_name, entries) => {
    expect(entries.length).toBeGreaterThan(0);
    const clashes = entries.flatMap((entry) => BANNED.filter((word) => entry.toLowerCase().includes(word.toLowerCase())).map((word) => `${entry} contains ${word}`));
    expect(clashes).toEqual([]);
  });

  it("Given the name arrays, when a player's or club's full text is built from them, then it cannot hold a banned word across the joining space either @regression @boundary @contract-shape:pure-function", () => {
    const joined = [...FIRST_NAMES.flatMap((first) => SURNAMES.map((last) => `${first} ${last}`)), ...TOWNS.flatMap((town) => CLUB_SUFFIXES.map((suffix) => `${town} ${suffix}`))];
    const clashes = joined.filter((text) => BANNED.some((word) => text.toLowerCase().includes(word.toLowerCase())));
    expect(clashes).toEqual([]);
  });
});
