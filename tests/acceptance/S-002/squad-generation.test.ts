// @US-1 (S-002 view my squad)
// @contract-shape:pure-function (generateSquad, deriveSeed)
// @contract-shape:unbounded-preservation (generateLeague regression describe at the end of this file)
// Outcome anchor: DISCUSS Elevator Pitch (feature-delta.md US-1)
import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { generateLeague } from "../../../src/domain/league";
import { deriveSeed } from "../../../src/domain/rng";
import { generateSquad, type Player } from "../../../src/domain/squad";

const anySeed = fc.integer({ min: -2147483648, max: 2147483647 });
const anyClub = fc.integer({ min: 0, max: 7 });
const count = (squad: readonly Player[], position: string) => squad.filter((p) => p.position === position).length;

describe("@contract-shape:pure-function @US-1 S-002 a squad is generated from a seed and a club", () => {
  describe("Given any 32-bit seed and any club of the league, when the squad is generated", () => {
    it("then it holds exactly 18 players @property @driving_port", () => {
      fc.assert(fc.property(anySeed, anyClub, (seed, club) => generateSquad(seed, club).length === 18));
    });

    it("then it has exactly 2 GK, 6 DF, 6 MF and 4 FW @property", () => {
      fc.assert(
        fc.property(anySeed, anyClub, (seed, club) => {
          const squad = generateSquad(seed, club);
          expect([count(squad, "GK"), count(squad, "DF"), count(squad, "MF"), count(squad, "FW")]).toEqual([2, 6, 6, 4]);
        }),
      );
    });

    it("then there are at least 2 goalkeepers and every position is covered @property", () => {
      fc.assert(
        fc.property(anySeed, anyClub, (seed, club) => {
          const squad = generateSquad(seed, club);
          expect(count(squad, "GK")).toBeGreaterThanOrEqual(2);
          for (const position of ["DF", "MF", "FW"]) expect(count(squad, position)).toBeGreaterThanOrEqual(1);
        }),
      );
    });

    it("then every age is a whole number from 17 to 35 @property", () => {
      fc.assert(
        fc.property(anySeed, anyClub, (seed, club) => {
          for (const p of generateSquad(seed, club)) {
            expect(Number.isInteger(p.age)).toBe(true);
            expect(p.age).toBeGreaterThanOrEqual(17);
            expect(p.age).toBeLessThanOrEqual(35);
          }
        }),
      );
    });

    it("then every overall is a whole number from 1 to 20 @property", () => {
      fc.assert(
        fc.property(anySeed, anyClub, (seed, club) => {
          for (const p of generateSquad(seed, club)) {
            expect(Number.isInteger(p.overall)).toBe(true);
            expect(p.overall).toBeGreaterThanOrEqual(1);
            expect(p.overall).toBeLessThanOrEqual(20);
          }
        }),
      );
    });

    it("then every name is non-empty and has no digit, so a row reads age then overall @property", () => {
      fc.assert(
        fc.property(anySeed, anyClub, (seed, club) => {
          for (const p of generateSquad(seed, club)) {
            expect(p.name.trim().length).toBeGreaterThan(0);
            expect(p.name).not.toMatch(/\d/);
          }
        }),
      );
    });

    it("then the players come in the fixed order GK, DF, MF, FW @property", () => {
      fc.assert(
        fc.property(anySeed, anyClub, (seed, club) => {
          const order = generateSquad(seed, club).map((p) => p.position);
          expect(order).toEqual([...Array(2).fill("GK"), ...Array(6).fill("DF"), ...Array(6).fill("MF"), ...Array(4).fill("FW")]);
        }),
      );
    });
  });

  describe("Given any seed and club, when the squad is read @error-boundary", () => {
    it("then no two players share a name @property", () => {
      fc.assert(
        fc.property(anySeed, anyClub, (seed, club) => {
          const names = generateSquad(seed, club).map((p) => p.name);
          expect(new Set(names).size).toBe(18);
        }),
      );
    });
  });

  describe("Given the same seed and club, when the squad is generated twice", () => {
    it("then both squads are identical and in the same order @property @determinism", () => {
      fc.assert(fc.property(anySeed, anyClub, (seed, club) => expect(generateSquad(seed, club)).toEqual(generateSquad(seed, club))));
    });
  });

  describe("Given any seed, when the squads of the 8 clubs are compared", () => {
    it("then no two clubs have the same squad @property", () => {
      fc.assert(
        fc.property(anySeed, (seed) => {
          const squads = Array.from({ length: 8 }, (_, i) => JSON.stringify(generateSquad(seed, i)));
          expect(new Set(squads).size).toBe(8);
        }),
      );
    });
  });

  describe("Given the boundary seeds, when each club's squad is generated @error-boundary", () => {
    it.each([0, -1, 2147483647, -2147483648])("then seed %i still gives a full valid squad @driving_port", (seed) => {
      for (let club = 0; club < 8; club++) {
        const squad = generateSquad(seed, club);
        expect(squad).toHaveLength(18);
        expect(squad.every((p) => !/\d/.test(p.name) && p.age >= 17 && p.age <= 35 && p.overall >= 1 && p.overall <= 20)).toBe(true);
      }
    });
  });
});

describe("@contract-shape:pure-function @US-1 S-002 a club seed is derived from the league seed and the club position", () => {
  it("then the same inputs give the same derived seed @property @determinism", () => {
    fc.assert(fc.property(anySeed, anyClub, (seed, club) => deriveSeed(seed, club) === deriveSeed(seed, club)));
  });

  it("then the derived seed is a 32-bit integer @property", () => {
    fc.assert(
      fc.property(anySeed, anyClub, (seed, club) => {
        const d = deriveSeed(seed, club);
        expect(Number.isInteger(d)).toBe(true);
        expect(d).toBeGreaterThanOrEqual(-2147483648);
        expect(d).toBeLessThanOrEqual(2147483647);
      }),
    );
  });

  it("then clubs 0 to 7 each get a different derived seed @property", () => {
    fc.assert(
      fc.property(anySeed, (seed) => {
        expect(new Set(Array.from({ length: 8 }, (_, i) => deriveSeed(seed, i))).size).toBe(8);
      }),
    );
  });
});

describe("@contract-shape:unbounded-preservation @US-1 S-002 adding squads leaves the league as S-001 generated it", () => {
  it("then seed 4242 still gives the same eight clubs @regression", () => {
    expect(generateLeague(4242).clubs.map((c) => c.name)).toEqual([
      "Juniper Hollow Town",
      "Netherwold Town",
      "Pennyfold Wanderers",
      "Larkmere Rangers",
      "Saltmarsh End Athletic",
      "Marlbrook Athletic",
      "Thornbury Cross Athletic",
      "Ironbridge Fen United",
    ]);
  });

  it("then every league keeps its shape: seed, 8 clubs with id, name and two colours @property @regression", () => {
    fc.assert(
      fc.property(anySeed, (seed) => {
        const league = generateLeague(seed);
        expect(Object.keys(league).sort()).toEqual(["clubs", "seed"]);
        expect(league.seed).toBe(seed);
        expect(league.clubs).toHaveLength(8);
        for (const club of league.clubs) {
          expect(Object.keys(club).sort()).toEqual(["colours", "id", "name"]);
          expect(club.colours).toHaveLength(2);
        }
      }),
    );
  });
});
