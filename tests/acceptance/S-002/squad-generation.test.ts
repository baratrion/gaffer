// @US-1 (S-002 view my squad)
// CONTRACT_SHAPE: pure-function
// Outcome anchor: DISCUSS Elevator Pitch (feature-delta.md US-1): Sam sees 18 players, each with name, position, age and overall
import fc from "fast-check";
import { describe, expect, it, vi } from "vitest";
import { CLUBS_PER_LEAGUE } from "../../../src/domain/league";
import { generateSquad, PLAYERS_PER_SQUAD, type Player, type Position } from "../../../src/domain/squad";

const anySeed = fc.integer({ min: -2147483648, max: 2147483647 });
const anyClub = fc.integer({ min: 0, max: CLUBS_PER_LEAGUE - 1 });
const count = (squad: readonly Player[], position: Position) => squad.filter((p) => p.position === position).length;
const wholeLeague = (seed: number) => Array.from({ length: CLUBS_PER_LEAGUE }, (_, i) => generateSquad(seed, i));

describe("@US-1 S-002 a squad is generated from a seed and a club index", () => {
  describe("Given any 32-bit seed and any club of the league, when the squad is generated", () => {
    it("then it holds exactly 18 players @property @driving_port", () => {
      fc.assert(fc.property(anySeed, anyClub, (seed, club) => generateSquad(seed, club).length === PLAYERS_PER_SQUAD));
    });

    it("then it has exactly 2 GK, 6 DF, 6 MF and 4 FW @property", () => {
      fc.assert(
        fc.property(anySeed, anyClub, (seed, club) => {
          const squad = generateSquad(seed, club);
          expect([count(squad, "GK"), count(squad, "DF"), count(squad, "MF"), count(squad, "FW")]).toEqual([2, 6, 6, 4]);
        }),
      );
    });

    it("then players are listed in position order GK, DF, MF, FW @property", () => {
      fc.assert(
        fc.property(anySeed, anyClub, (seed, club) => {
          const order = generateSquad(seed, club).map((p) => p.position);
          expect(order).toEqual([...Array(2).fill("GK"), ...Array(6).fill("DF"), ...Array(6).fill("MF"), ...Array(4).fill("FW")]);
        }),
      );
    });

    it("then every age is a whole number from 17 to 35 @property", () => {
      fc.assert(
        fc.property(anySeed, anyClub, (seed, club) =>
          generateSquad(seed, club).every((p) => Number.isInteger(p.age) && p.age >= 17 && p.age <= 35),
        ),
      );
    });

    it("then every overall is a whole number from 1 to 20 @property", () => {
      fc.assert(
        fc.property(anySeed, anyClub, (seed, club) =>
          generateSquad(seed, club).every((p) => Number.isInteger(p.overall) && p.overall >= 1 && p.overall <= 20),
        ),
      );
    });

    it("then no name contains a digit and none is blank @property", () => {
      fc.assert(
        fc.property(anySeed, anyClub, (seed, club) =>
          generateSquad(seed, club).every((p) => p.name.trim().length > 0 && !/\d/.test(p.name)),
        ),
      );
    });

    it("then no name contains a standalone GK, DF, MF or FW token @property", () => {
      fc.assert(
        fc.property(anySeed, anyClub, (seed, club) =>
          generateSquad(seed, club).every((p) => !p.name.split(/\s+/).some((token) => /^(GK|DF|MF|FW)$/i.test(token))),
        ),
      );
    });

    it("then names within the squad are unique @property", () => {
      fc.assert(
        fc.property(anySeed, anyClub, (seed, club) => {
          const names = generateSquad(seed, club).map((p) => p.name);
          expect(new Set(names).size).toBe(PLAYERS_PER_SQUAD);
        }),
      );
    });
  });

  describe("Given any 32-bit seed, when all 8 clubs' squads are generated", () => {
    it("then the 144 player names are distinct across the whole league @property", () => {
      fc.assert(
        fc.property(anySeed, (seed) => {
          const names = wholeLeague(seed).flatMap((squad) => squad.map((p) => p.name));
          expect(names.length).toBe(CLUBS_PER_LEAGUE * PLAYERS_PER_SQUAD);
          expect(new Set(names).size).toBe(names.length);
        }),
      );
    });

    it("then no two clubs share the same squad @property", () => {
      fc.assert(
        fc.property(anySeed, (seed) => {
          const keys = wholeLeague(seed).map((squad) => JSON.stringify(squad));
          expect(new Set(keys).size).toBe(CLUBS_PER_LEAGUE);
        }),
      );
    });
  });

  describe("Given the same seed and club, when the squad is generated twice", () => {
    it("then the squads are deep-equal, in the same order @property @determinism", () => {
      fc.assert(
        fc.property(anySeed, anyClub, (seed, club) => {
          expect(generateSquad(seed, club)).toEqual(generateSquad(seed, club));
        }),
      );
    });
  });

  describe("Given ambient randomness and wall-clock time are unavailable, when a squad is generated", () => {
    it("then the squad is unchanged @determinism @driving_port", () => {
      const expected = generateSquad(4242, 3);
      const forbidden = () => {
        throw new Error("ambient nondeterminism used");
      };
      vi.spyOn(Math, "random").mockImplementation(forbidden);
      vi.spyOn(Date, "now").mockImplementation(forbidden);
      try {
        expect(generateSquad(4242, 3)).toEqual(expected);
      } finally {
        vi.restoreAllMocks();
      }
    });
  });

  describe("Given different seeds", () => {
    it("then seeds 1 and 4242 give different squads for the first club @driving_port", () => {
      expect(generateSquad(1, 0)).not.toEqual(generateSquad(4242, 0));
    });

    it.each([0, -1, 2147483647, -2147483648])("then the boundary seed %i still gives a full squad @error-boundary", (seed) => {
      expect(wholeLeague(seed).every((squad) => squad.length === PLAYERS_PER_SQUAD)).toBe(true);
    });
  });

  describe("Given a club index outside the league, when the squad is requested", () => {
    it.each([-1, 8, 100, 1.5, Number.NaN])("then club index %s is rejected with a RangeError @error", (club) => {
      expect(() => generateSquad(4242, club)).toThrow(RangeError);
    });
  });
});
