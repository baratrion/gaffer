// @US-1 (S-009 see how my season ended) held out until DELIVER
// CONTRACT_SHAPE: pure-function
// Outcome anchor: DISCUSS Elevator Pitch (US-1 and US-2); DISCUSS D2 and the test intents (ordinal 1st..8th, the top-scorer rule over constructed logs); DESIGN D1, D2; ADR-0015 decisions
// 1 and 2; brief port 32. formatOrdinal (1st..8th, the teens, 21-23, 101, 111, RangeError), topScorer (the club's own goals only, home and away,
// ties to the lowest squad index, none, order of the log irrelevant, RangeError for a counted player outside the squad, inputs never mutated)
// and formatTopScorer ("(N goals)", "(1 goal)", "none"; every line matches the one pattern). A property holds topScorer to an oracle that counts
// the "Goals" lists the way the match screen prints them (name from the squad of the side that scored) and never calls topScorer.
// Destination: tests/acceptance/S-009/season-rules.test.ts (DELIVER: git mv, dropping .pending, in the commit that adds src/domain/season.ts and
// formatOrdinal). Keep fc.property callbacks to 3 parameters (oxlint max-params).
import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { generateLeague } from "../../../src/domain/league";
import { formatTopScorer, topScorer, type ScoringMatch, type TopScorer } from "../../../src/domain/season";
import { generateSquad, PLAYERS_PER_SQUAD, type Player } from "../../../src/domain/squad";
import { formatOrdinal } from "../../../src/domain/standings";
import { CLUBS, goalItemsOf, oracleOrdinal, oracleTopScorer, oracleTopScorerLine, untouchedSeason } from "./season-oracle";

const squad: readonly Player[] = generateSquad(31, 0);
const name = (index: number): string => squad[index]!.name;
const LINE = /^Top scorer (none|(.+) \((\d+) goals?\))$/;
/** A played match as the log holds it: the clubs by index and the scoring side and squad index of every goal. */
const match = (home: number, away: number, ...goals: readonly (readonly ["home" | "away", number])[]): ScoringMatch => ({
  home,
  away,
  result: { goals: goals.map(([side, playerIndex]) => ({ side, playerIndex })) },
});
const deepFreeze = <T>(value: T): T => {
  if (typeof value === "object" && value !== null && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const inner of Object.values(value)) deepFreeze(inner);
  }
  return value;
};

describe("@US-1 S-009 the final position is written as an English ordinal", () => {
  it.each([[1, "1st"], [2, "2nd"], [3, "3rd"], [4, "4th"], [5, "5th"], [6, "6th"], [7, "7th"], [8, "8th"]] as const)(
    "Given position %s, when it is written, then it reads %s @example @walking_skeleton @driving_port @contract-shape:pure-function",
    (position, text) => {
      expect(formatOrdinal(position)).toBe(text);
    },
  );

  it.each([[10, "10th"], [11, "11th"], [12, "12th"], [13, "13th"], [14, "14th"], [20, "20th"], [21, "21st"], [22, "22nd"], [23, "23rd"], [24, "24th"], [101, "101st"], [102, "102nd"], [103, "103rd"], [111, "111th"], [112, "112th"], [113, "113th"], [1000, "1000th"]] as const)(
    "Given position %s beyond the eight clubs, when it is written, then it reads %s (11, 12 and 13 take th, so a bigger league never prints 11st) @boundary @contract-shape:pure-function",
    (position, text) => {
      expect(formatOrdinal(position)).toBe(text);
    },
  );

  it("Given any position from 1 to 100000, when it is written, then it equals the independent lookup and starts with the number itself @property @boundary @contract-shape:pure-function", () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 100_000 }), (position) => {
        expect(formatOrdinal(position)).toBe(oracleOrdinal(position));
        expect(formatOrdinal(position).startsWith(String(position))).toBe(true);
      }),
    );
  });

  it.each([0, -1, -8, 1.5, 0.5, Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])(
    "Given %s, which is not a position, when it is written, then it throws a RangeError @error @boundary @contract-shape:pure-function",
    (position) => {
      expect(() => formatOrdinal(position)).toThrow(RangeError);
    },
  );
});

describe("@US-1 S-009 the top scorer is the club player with the most goals for the club", () => {
  it("Given one player scored most (squad index 5 twice, 7 once), when the top scorer is read, then he is named with his count @example @walking_skeleton @driving_port @contract-shape:pure-function", () => {
    const played = [match(0, 1, ["home", 5], ["home", 7]), match(2, 0, ["away", 5])];
    expect(topScorer(played, 0, squad)).toEqual({ playerIndex: 5, name: name(5), goals: 2 });
  });

  it("Given two players tie on 2 goals (squad indices 14 and 17), when the top scorer is read in either log order, then the one listed first in the Squad list is named, never the last @example @boundary @contract-shape:pure-function", () => {
    const log = [match(0, 1, ["home", 17], ["home", 14]), match(3, 0, ["away", 17]), match(0, 4, ["home", 14])];
    expect(topScorer(log, 0, squad)).toEqual({ playerIndex: 14, name: name(14), goals: 2 });
    expect(topScorer([...log].reverse(), 0, squad)).toEqual({ playerIndex: 14, name: name(14), goals: 2 });
  });

  it("Given a three-way tie on 1 goal (squad indices 12, 3 and 4), when the top scorer is read, then squad index 3 is named with (1 goal) @example @boundary @contract-shape:pure-function", () => {
    const log = [match(0, 1, ["home", 12]), match(5, 0, ["away", 4]), match(0, 6, ["home", 3])];
    expect(topScorer(log, 0, squad)).toEqual({ playerIndex: 3, name: name(3), goals: 1 });
    expect(formatTopScorer(topScorer(log, 0, squad))).toBe(`${name(3)} (1 goal)`);
  });

  it("Given a tie at the top between squad index 0 and the last squad index, when the top scorer is read, then squad index 0 is named (the lowest index wins at both ends) @boundary @contract-shape:pure-function", () => {
    const last = PLAYERS_PER_SQUAD - 1;
    expect(topScorer([match(0, 1, ["home", last], ["home", 0])], 0, squad)).toEqual({ playerIndex: 0, name: name(0), goals: 1 });
  });

  it("Given the club scored no goal (an empty log, goalless draws, and matches that only the opponent scored in), when the top scorer is read, then there is none @error @boundary @contract-shape:pure-function", () => {
    expect(topScorer([], 0, squad)).toBeUndefined();
    expect(topScorer([match(0, 1), match(2, 0)], 0, squad)).toBeUndefined();
    expect(topScorer([match(0, 1, ["away", 3], ["away", 3]), match(2, 0, ["home", 9])], 0, squad)).toBeUndefined();
  });

  it("Given the opponent scored more in the same matches, when the top scorer is read, then only the club's own goals count @error @boundary @contract-shape:pure-function", () => {
    const log = [match(0, 1, ["away", 3], ["away", 3], ["away", 3], ["home", 1]), match(2, 0, ["home", 4], ["home", 4], ["away", 1])];
    expect(topScorer(log, 0, squad)).toEqual({ playerIndex: 1, name: name(1), goals: 2 });
  });

  it("Given the club played at home (side home) and away (side away), when its goals are added, then both count for the same player @boundary @contract-shape:pure-function", () => {
    const log = [match(2, 5, ["home", 9], ["away", 8]), match(1, 2, ["away", 9], ["away", 9]), match(2, 6, ["home", 8])];
    expect(topScorer(log, 2, squad)).toEqual({ playerIndex: 9, name: name(9), goals: 3 });
  });

  it("Given matches the club did not play, when their goals are read, then they never count @error @boundary @contract-shape:pure-function", () => {
    const log = [match(1, 2, ["home", 5], ["away", 5]), match(0, 3, ["home", 6])];
    expect(topScorer(log, 4, squad)).toBeUndefined();
    expect(topScorer(log, 0, squad)).toEqual({ playerIndex: 6, name: name(6), goals: 1 });
  });

  it.each([[PLAYERS_PER_SQUAD], [-1], [1.5]])(
    "Given a goal of the club names squad index %s, which is not in the squad, when the top scorer is read, then it throws a RangeError @error @boundary @contract-shape:pure-function",
    (playerIndex) => {
      expect(() => topScorer([match(0, 1, ["home", playerIndex])], 0, squad)).toThrow(RangeError);
      expect(() => topScorer([match(1, 0, ["away", playerIndex])], 0, squad)).toThrow(RangeError);
    },
  );

  it("Given a deep-frozen log and squad, when the top scorer is read twice, then nothing is mutated and both answers are deep-equal @property @boundary @contract-shape:pure-function", () => {
    const log = deepFreeze([match(0, 1, ["home", 2], ["home", 2]), match(3, 0, ["away", 6])]);
    const frozenSquad = deepFreeze(generateSquad(31, 0));
    const first = topScorer(log, 0, frozenSquad);
    expect(topScorer(log, 0, frozenSquad)).toEqual(first);
    expect(first).toEqual({ playerIndex: 2, name: frozenSquad[2]!.name, goals: 2 });
  });
});

describe("@US-1 S-009 the Top scorer line has one format", () => {
  const scorer = (goals: number): TopScorer => ({ playerIndex: 14, name: "Garrick Thistlewood", goals });

  it("Given the top scorer, when his line is written, then it reads Name (N goals), (1 goal) for one, and none when nobody scored @example @boundary @contract-shape:pure-function", () => {
    expect(formatTopScorer(scorer(5))).toBe("Garrick Thistlewood (5 goals)");
    expect(formatTopScorer(scorer(2))).toBe("Garrick Thistlewood (2 goals)");
    expect(formatTopScorer(scorer(1))).toBe("Garrick Thistlewood (1 goal)");
    expect(formatTopScorer(scorer(16))).toBe("Garrick Thistlewood (16 goals)");
    expect(formatTopScorer(undefined)).toBe("none");
  });

  it("Given any count from 1 to 60, when the line is written after its label, then it matches the one pattern and goal is singular exactly when the count is 1 @property @boundary @contract-shape:pure-function", () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 60 }), (goals) => {
        const match1 = LINE.exec(`Top scorer ${formatTopScorer(scorer(goals))}`)!;
        expect(match1[2]).toBe("Garrick Thistlewood");
        expect(Number(match1[3])).toBe(goals);
        expect(match1[0].endsWith(goals === 1 ? "(1 goal)" : `(${goals} goals)`)).toBe(true);
      }),
    );
    expect(LINE.exec(`Top scorer ${formatTopScorer(undefined)}`)![1]).toBe("none");
  });
});

describe("@US-1 S-009 the top scorer agrees with the Goals lists", () => {
  it("Given any constructed log of up to 30 matches, when the top scorer is read, then it equals an independent count, is the same for any order of the log, and its line matches the pattern @property @driving_port @contract-shape:pure-function", () => {
    const anyMatch = fc
      .record({
        home: fc.integer({ min: 0, max: CLUBS - 1 }),
        shift: fc.integer({ min: 1, max: CLUBS - 1 }),
        goals: fc.array(fc.tuple(fc.constantFrom<"home" | "away">("home", "away"), fc.integer({ min: 0, max: 5 })), { maxLength: 6 }),
      })
      .map(({ home, shift, goals }) => match(home, (home + shift) % CLUBS, ...goals));
    fc.assert(
      fc.property(fc.array(anyMatch, { maxLength: 30 }), fc.integer({ min: 0, max: CLUBS - 1 }), fc.boolean(), (log, club, reversed) => {
        const counts = squad.map((_, index) => log.reduce((sum, m) => sum + m.result.goals.filter(({ side, playerIndex }) => playerIndex === index && (side === "home" ? m.home : m.away) === club).length, 0));
        const top = Math.max(...counts);
        const expected = top === 0 ? undefined : { playerIndex: counts.indexOf(top), name: name(counts.indexOf(top)), goals: top };
        const found = topScorer(reversed ? [...log].reverse() : log, club, squad);
        expect(found).toEqual(expected);
        expect(LINE.test(`Top scorer ${formatTopScorer(found)}`)).toBe(true);
      }),
    );
  });

  it("Given any seed and each of the 8 clubs, when the 56 results are played with untouched tactics, then the top scorer is the player most often named with his club in the 14 Goals lists, ties to the Squad order, and the line is the oracle's @property @boundary @driving_port @contract-shape:pure-function", () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 100_000 }), (seed) => {
        const played = untouchedSeason(seed);
        const items = goalItemsOf(seed, played);
        const league = generateLeague(seed);
        for (let club = 0; club < CLUBS; club++) {
          const clubSquad = generateSquad(seed, club);
          const clubName = league.clubs[club]!.name;
          const found = topScorer(played, club, clubSquad);
          const expected = oracleTopScorer(items, clubName, clubSquad);
          expect(found === undefined ? undefined : [found.name, found.goals, found.playerIndex]).toEqual(expected === undefined ? undefined : [expected.name, expected.goals, expected.squadIndex]);
          expect(`Top scorer ${formatTopScorer(found)}`).toBe(oracleTopScorerLine(expected));
        }
      }),
      { numRuns: 25 },
    );
  });
});
