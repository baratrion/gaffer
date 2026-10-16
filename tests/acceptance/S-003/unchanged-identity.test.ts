// @US-1 (S-003 view a player's details)
// CONTRACT_SHAPE: pure-function
// Outcome anchor: DISCUSS Elevator Pitch (feature-delta.md US-1): Sam taps a player's row and sees that same player,
// so the names, positions and ages behind every existing ?seed= link must not move (ADR-0006 determinism note).
// Captured from the pre-S-003 generator (stored overall). Passes before and after DELIVER; it never inspects overall.
import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { createRng, deriveSeed, nextFloat, type Rng } from "../../../src/domain/rng";
import { generateSquad } from "../../../src/domain/squad";

const fnv1a = (text: string): number => {
  let hash = 0x811c9dc5;
  for (const char of text) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash >>> 0;
};

const identityOf = (seed: number, club: number): string =>
  generateSquad(seed, club)
    .map((p) => `${p.name}|${p.position}|${p.age}`)
    .join(";");

// FNV-1a of "name|position|age;..." for the 18 players of each of the 8 clubs, per seed (S-002 behaviour).
const GOLDEN_HASHES: Readonly<Record<number, readonly number[]>> = {
  31: [2104663016, 3919395790, 1443555316, 4168076670, 1909111208, 2575267364, 1391406786, 3740376007],
  4242: [842407207, 2946965804, 221716523, 1904668310, 2298793781, 551435500, 3296835126, 1162547902],
  20260: [3962679577, 95562884, 45772074, 3453570970, 1655425671, 75784252, 64481841, 72753283],
  [-1]: [1727003951, 2724549715, 3033136363, 1962170337, 817982187, 77917439, 1880419011, 3000421199],
};

// Independent copy of the S-002 club draw sequence: per slot an age 17-35, then an "overall" 1-20 that only advances the stream.
const draw = (rng: Rng, min: number, max: number) => {
  const { value, next } = nextFloat(rng);
  return { value: min + Math.floor(value * (max - min + 1)), next };
};
const s002AgesAndPositions = (seed: number, club: number): [string, number][] => {
  const positions = [...Array(2).fill("GK"), ...Array(6).fill("DF"), ...Array(6).fill("MF"), ...Array(4).fill("FW")] as string[];
  let rng = createRng(deriveSeed(seed, club));
  return positions.map((position): [string, number] => {
    const age = draw(rng, 17, 35);
    rng = draw(age.next, 1, 20).next;
    return [position, age.value];
  });
};

describe("@US-1 S-003 names, positions and ages are unchanged by player attributes", () => {
  it("Given seed 31, when the first club's squad is generated, then its 18 names, positions and ages are the S-002 ones @regression @driving_port @contract-shape:pure-function", () => {
    const rows = generateSquad(31, 0).map((p) => [p.name, p.position, p.age]);
    expect(rows).toEqual([
      ["Tamsin Ingleby", "GK", 34], ["Alden Zealby", "GK", 34],
      ["Quill Yarrow", "DF", 26], ["Calder Ashcombe", "DF", 20], ["Calder Kilbride", "DF", 17],
      ["Dacey Jessamy", "DF", 27], ["Quill Crossley", "DF", 20], ["Bram Pemberly", "DF", 28],
      ["Calder Redfern", "MF", 31], ["Ivo Elderkin", "MF", 30], ["Dorian Dunmore", "MF", 26],
      ["Finlay Ballantyne", "MF", 34], ["Joren Dalrymple", "MF", 22], ["Kestrel Northcott", "MF", 26],
      ["Garrick Thistlewood", "FW", 20], ["Emlyn Vexford", "FW", 28],
      ["Finlay Fitch-Moreton", "FW", 21], ["Merrick Hartwell", "FW", 25],
    ]);
  });

  it("Given seed 20260 (the default), when the 8th club's squad is generated, then its 18 names, positions and ages are the S-002 ones @regression @contract-shape:pure-function", () => {
    const rows = generateSquad(20260, 7).map((p) => [p.name, p.position, p.age]);
    expect(rows).toEqual([
      ["Dacey Marwood", "GK", 21], ["Alden Hartwell", "GK", 29],
      ["Ulric O'Garrity", "DF", 17], ["Bram Quarrie", "DF", 27], ["Zander Wetherby", "DF", 23],
      ["Wystan Redfern", "DF", 31], ["Soren Dalrymple", "DF", 27], ["Perrin Dunmore", "DF", 23],
      ["Ulric Everleigh", "MF", 21], ["Alden Underby", "MF", 27], ["Tamsin Stanhope", "MF", 25],
      ["Orrin Lockhart", "MF", 22], ["Niall Stanhope", "MF", 28], ["Brannock Cardew", "MF", 22],
      ["Cormac Marwood", "FW", 29], ["Rurik Pemberly", "FW", 19], ["Bram Stanhope", "FW", 27], ["Joren Northcott", "FW", 19],
    ]);
  });

  it.each(Object.keys(GOLDEN_HASHES).map(Number))(
    "Given seed %i, when all 8 clubs are generated, then every squad keeps its S-002 names, positions and ages @regression @contract-shape:pure-function",
    (seed) => {
      const actual = Array.from({ length: 8 }, (_, club) => fnv1a(identityOf(seed, club)));
      expect(actual).toEqual(GOLDEN_HASHES[seed]);
    },
  );

  it("Given any seed and club, when the squad is generated, then positions and ages equal an independent copy of the S-002 draw sequence (names: golden hashes above) @contract-shape:pure-function @property @regression", () => {
    fc.assert(
      fc.property(fc.integer({ min: -2147483648, max: 2147483647 }), fc.integer({ min: 0, max: 7 }), (seed, club) => {
        expect(generateSquad(seed, club).map((p): [string, number] => [p.position, p.age])).toEqual(s002AgesAndPositions(seed, club));
      }),
    );
  });
});
