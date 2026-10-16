// @US-1 (S-003 view a player's details)
// CONTRACT_SHAPE: pure-function
// Outcome anchor: DISCUSS Elevator Pitch (feature-delta.md US-1): Sam sees four attributes (1-20), a condition and an
// overall that agrees with them, identical on every visit of the same ?seed=.
// Destination: tests/acceptance/S-003/player-attributes.test.ts (DELIVER step 01).
import fc from "fast-check";
import { describe, expect, it, vi } from "vitest";
import { CLUBS_PER_LEAGUE } from "../../../src/domain/league";
import { deriveSeed } from "../../../src/domain/rng";
import {
  ATTRIBUTE_LABELS,
  ATTRIBUTE_ORDER,
  ATTRIBUTE_STREAM_BASE,
  CONDITION_MAX,
  CONDITION_MIN,
  deriveOverall,
  generateSquad,
  PLAYERS_PER_SQUAD,
  type Player,
} from "../../../src/domain/squad";

const anySeed = fc.integer({ min: -2147483648, max: 2147483647 });
const wholeLeague = (seed: number): readonly (readonly Player[])[] =>
  Array.from({ length: CLUBS_PER_LEAGUE }, (_, club) => generateSquad(seed, club));
const everyPlayer = (seed: number): readonly Player[] => wholeLeague(seed).flat();
const values = (p: Player): number[] => ATTRIBUTE_ORDER.map((key) => p.attributes[key]);

describe("@US-1 S-003 every player of every club has attributes, a condition and an agreeing overall", () => {
  describe("Given any 32-bit seed, when all 8 clubs' squads are generated", () => {
    it("then every player has exactly the four attributes goalkeeping, defending, passing, shooting @property @driving_port @contract-shape:pure-function", () => {
      fc.assert(
        fc.property(anySeed, (seed) =>
          everyPlayer(seed).every((p) => JSON.stringify(Object.keys(p.attributes).sort()) === JSON.stringify([...ATTRIBUTE_ORDER].sort())),
        ),
      );
    });

    it("then every attribute is a whole number from 1 to 20 @property @contract-shape:pure-function", () => {
      fc.assert(fc.property(anySeed, (seed) => everyPlayer(seed).every((p) => values(p).every((v) => Number.isInteger(v) && v >= 1 && v <= 20))));
    });

    it("then every condition is a whole percentage from 75 to 100, inside the 0-100 the screen accepts @property @contract-shape:pure-function", () => {
      fc.assert(
        fc.property(anySeed, (seed) =>
          everyPlayer(seed).every((p) => Number.isInteger(p.condition) && p.condition >= CONDITION_MIN && p.condition <= CONDITION_MAX && p.condition >= 0 && p.condition <= 100),
        ),
      );
    });

    it("then every overall is the position-weighted figure derived from the player's attributes @property @contract-shape:pure-function", () => {
      fc.assert(fc.property(anySeed, (seed) => everyPlayer(seed).every((p) => p.overall === deriveOverall(p.position, p.attributes))));
    });

    it("then every overall is a whole number between the player's lowest and highest attribute, and from 1 to 20 @property @contract-shape:pure-function", () => {
      fc.assert(
        fc.property(anySeed, (seed) =>
          everyPlayer(seed).every((p) => {
            const v = values(p);
            return Number.isInteger(p.overall) && p.overall >= Math.min(...v) && p.overall <= Math.max(...v) && p.overall >= 1 && p.overall <= 20;
          }),
        ),
      );
    });

    it("then the 18 players of a squad do not all share the same four attribute values @property @contract-shape:pure-function", () => {
      fc.assert(
        fc.property(anySeed, (seed) =>
          wholeLeague(seed).every((squad) => new Set(squad.map((p) => values(p).join(","))).size > 1),
        ),
      );
    });

    it("then each squad still holds 18 players with unique names @property @contract-shape:pure-function", () => {
      fc.assert(
        fc.property(anySeed, (seed) =>
          wholeLeague(seed).every((squad) => squad.length === PLAYERS_PER_SQUAD && new Set(squad.map((p) => p.name)).size === PLAYERS_PER_SQUAD),
        ),
      );
    });
  });

  describe("Given the same seed and club, when the squad is generated twice", () => {
    it("then the squads are deep-equal, attributes and condition included @property @determinism @contract-shape:pure-function", () => {
      fc.assert(
        fc.property(anySeed, fc.integer({ min: 0, max: CLUBS_PER_LEAGUE - 1 }), (seed, club) => {
          expect(generateSquad(seed, club)).toEqual(generateSquad(seed, club));
        }),
      );
    });

    it("then ambient randomness and wall-clock time are never used by the squad or by deriveOverall @determinism @contract-shape:pure-function", () => {
      const expected = generateSquad(31, 0);
      const keeper = { goalkeeping: 15, defending: 12, passing: 11, shooting: 4 };
      const forbidden = () => {
        throw new Error("ambient nondeterminism used");
      };
      vi.spyOn(Math, "random").mockImplementation(forbidden);
      vi.spyOn(Date, "now").mockImplementation(forbidden);
      try {
        expect(generateSquad(31, 0)).toEqual(expected);
        expect(deriveOverall("GK", keeper)).toBe(14);
      } finally {
        vi.restoreAllMocks();
      }
    });
  });

  describe("Given many seeds and clubs, when the generated figures are surveyed", () => {
    const survey = Array.from({ length: 200 }, (_, seed) => everyPlayer(seed)).flat();

    it("then conditions of exactly 75 and exactly 100 both occur, and none outside @boundary @design-derived @contract-shape:pure-function", () => {
      const conditions = survey.map((p) => p.condition);
      expect(Math.min(...conditions)).toBe(CONDITION_MIN);
      expect(Math.max(...conditions)).toBe(CONDITION_MAX);
      expect(CONDITION_MIN).toBe(75);
      expect(CONDITION_MAX).toBe(100);
    });

    it("then attributes of exactly 1 and exactly 20 both occur (clamped, never beyond) @boundary @design-derived @contract-shape:pure-function", () => {
      const all = survey.flatMap(values);
      expect(Math.min(...all)).toBe(1);
      expect(Math.max(...all)).toBe(20);
    });

    it("then goalkeepers are better at Goalkeeping than at Shooting on average, and forwards the reverse @position-lean @design-derived @contract-shape:pure-function", () => {
      const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;
      const gk = survey.filter((p) => p.position === "GK");
      const fw = survey.filter((p) => p.position === "FW");
      expect(mean(gk.map((p) => p.attributes.goalkeeping))).toBeGreaterThan(mean(gk.map((p) => p.attributes.shooting)));
      expect(mean(fw.map((p) => p.attributes.shooting))).toBeGreaterThan(mean(fw.map((p) => p.attributes.goalkeeping)));
    });
  });

  describe("Given the fixed display order and labels", () => {
    it("then the attributes are listed Goalkeeping, Defending, Passing, Shooting @driving_port @contract-shape:pure-function", () => {
      expect([...ATTRIBUTE_ORDER]).toEqual(["goalkeeping", "defending", "passing", "shooting"]);
      expect(ATTRIBUTE_ORDER.map((key) => ATTRIBUTE_LABELS[key])).toEqual(["Goalkeeping", "Defending", "Passing", "Shooting"]);
    });
  });

  describe("Given the random streams used by the generator, when the seeds derived for them are compared", () => {
    const streams = [-1, ...Array.from({ length: CLUBS_PER_LEAGUE }, (_, i) => i), ...Array.from({ length: CLUBS_PER_LEAGUE }, (_, i) => ATTRIBUTE_STREAM_BASE + i)];

    it("then the 17 stream numbers (names, 8 club streams, 8 attribute streams) are pairwise distinct @contract-shape:pure-function", () => {
      expect(ATTRIBUTE_STREAM_BASE).toBe(100);
      expect(new Set(streams).size).toBe(17);
    });

    it("then the 17 derived seeds are pairwise distinct over sampled seeds @property @contract-shape:pure-function", () => {
      fc.assert(fc.property(anySeed, (seed) => new Set(streams.map((s) => deriveSeed(seed, s))).size === streams.length));
    });
  });

  describe("Given a club index outside the league, when the squad is requested", () => {
    it.each([-1, 8, 100, 1.5, Number.NaN])("then club index %s is still rejected with a RangeError @error @contract-shape:pure-function", (club) => {
      expect(() => generateSquad(31, club)).toThrow(RangeError);
    });
  });
});
