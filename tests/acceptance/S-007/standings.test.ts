// @US-1 @US-2 (S-007 see the league table after my first match) @walking_skeleton
// CONTRACT_SHAPE: pure-function
// Outcome anchor: DISCUSS Elevator Pitch (US-2): after Netherwold Borough 1–2 Marlbrook Athletic at ?seed=31 the table reads 1 Tarnbeck
// Borough 1 1 0 0 +4 3 ... 6 Netherwold Borough 1 0 0 1 -1 0 ... 8 Rushmoor Heath Albion 1 0 0 1 -4 0 (US-2 example 1, derived from the ADR-0011
// fixture values and written out here before standings.ts exists). DELIVER makes it pass unchanged; a mismatch means the code is fixed.
// The all-zero A to Z table (US-1 example 1) is the same function on an empty list (D5). Rules: ADR-0013 (Pts, GD, goals for, then name
// in code-point order; GD text +N / 0 / -N with U+002D). Universe: the returned rows (whole StandingRow values) and the inputs, compared
// before and after (deep-frozen, never mutated).
// Destination: tests/acceptance/S-007/standings.test.ts (DELIVER step 01).
import { readFileSync } from "node:fs";
import { join } from "node:path";
import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { generateLeague, type Club } from "../../../src/domain/league";
import { formatGoalDifference, standings, type ScoredMatch, type StandingRow } from "../../../src/domain/standings";

const league = generateLeague(31);
const clubs = league.clubs;
const deepFreeze = <T>(value: T): T => {
  if (typeof value === "object" && value !== null && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const child of Object.values(value)) deepFreeze(child);
  }
  return value;
};
/** Eight clubs with the given names in club-index order (ids and colours from the seed-31 league). */
const named = (names: readonly string[]): readonly Club[] => clubs.map((club, i) => ({ ...club, name: names[i] ?? club.name }));
const game = (home: number, away: number, ...goals: readonly [homeGoals: number, awayGoals: number]): ScoredMatch => ({ home, away, result: { homeGoals: goals[0], awayGoals: goals[1] } });
const orderOf = (rows: readonly StandingRow[]): string[] => rows.map((row) => row.name);
const FILLER = ["Quarry Town", "Reed Rovers", "Sallow Park", "Tern United", "Umber City", "Vale Athletic", "Wren Albion", "Yew Borough"];

// What Sam's league looks like at ?seed=31 (club indices 0..7) and its four matchday-1 results (ADR-0010 fixtures, ADR-0011 goldens).
const SEED_31_NAMES = [
  "Netherwold Borough", "Fennimore Town", "Rushmoor Heath Albion", "Juniper Hollow United",
  "Oakhampton Rise Borough", "Tarnbeck Borough", "Valebridge Albion", "Marlbrook Athletic",
] as const;
const SEED_31_MATCHDAY_1: readonly ScoredMatch[] = [game(0, 7, 1, 2), game(1, 6, 2, 2), game(5, 2, 5, 1), game(3, 4, 1, 3)];
const SEED_31_TABLE: readonly (readonly [string, number, number, number, number, number, number, number, number])[] = [
  // name, P, W, D, L, GF, GA, GD, Pts
  ["Tarnbeck Borough", 1, 1, 0, 0, 5, 1, 4, 3],
  ["Oakhampton Rise Borough", 1, 1, 0, 0, 3, 1, 2, 3],
  ["Marlbrook Athletic", 1, 1, 0, 0, 2, 1, 1, 3],
  ["Fennimore Town", 1, 0, 1, 0, 2, 2, 0, 1],
  ["Valebridge Albion", 1, 0, 1, 0, 2, 2, 0, 1],
  ["Netherwold Borough", 1, 0, 0, 1, 1, 2, -1, 0],
  ["Juniper Hollow United", 1, 0, 0, 1, 1, 3, -2, 0],
  ["Rushmoor Heath Albion", 1, 0, 0, 1, 1, 5, -4, 0],
];

describe("@US-1 @US-2 S-007 Sam reads where his club stands after matchday 1", () => {
  it("Given the seed-31 league and its four matchday-1 results (1–2, 2–2, 5–1, 1–3), when the table is worked out, then it reads Tarnbeck Borough first with +4 and 3 points and Netherwold Borough sixth on -1 @walking_skeleton @driving_port @contract-shape:pure-function", () => {
    expect(orderOf(standings(clubs, []))).toHaveLength(8);
    expect(clubs.map((club) => club.name)).toEqual([...SEED_31_NAMES]);
    const rows = standings(deepFreeze([...clubs]), deepFreeze([...SEED_31_MATCHDAY_1]));
    const expected = SEED_31_TABLE.map(([name, played, won, drawn, lost, goalsFor, goalsAgainst, goalDifference, points], i) => ({
      position: i + 1,
      clubId: clubs.find((club) => club.name === name)!.id,
      name, played, won, drawn, lost, goalsFor, goalsAgainst, goalDifference, points,
    }));
    expect(rows).toEqual(expected);
  });

  it("Given a level pair (Fennimore Town and Valebridge Albion, both 2–2 draws), when the table is worked out, then the club name A to Z puts Fennimore Town first @boundary @contract-shape:pure-function", () => {
    const rows = standings(clubs, SEED_31_MATCHDAY_1);
    const [fennimore, valebridge] = ["Fennimore Town", "Valebridge Albion"].map((name) => rows.find((row) => row.name === name)!);
    expect([fennimore!.points, fennimore!.goalDifference, fennimore!.goalsFor]).toEqual([valebridge!.points, valebridge!.goalDifference, valebridge!.goalsFor]);
    expect(fennimore!.position).toBeLessThan(valebridge!.position);
  });

  it("Given no match has been played, when the table is worked out, then every row reads zero and the clubs are in A to Z order @driving_port @boundary @contract-shape:pure-function", () => {
    const rows = standings(clubs, []);
    expect(orderOf(rows)).toEqual([
      "Fennimore Town", "Juniper Hollow United", "Marlbrook Athletic", "Netherwold Borough",
      "Oakhampton Rise Borough", "Rushmoor Heath Albion", "Tarnbeck Borough", "Valebridge Albion",
    ]);
    rows.forEach((row, i) =>
      expect(row).toEqual({
        position: i + 1, clubId: clubs.find((club) => club.name === row.name)!.id, name: row.name,
        played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, goalDifference: 0, points: 0,
      }),
    );
  });

  it("Given any seed, when no match has been played, then the eight clubs of that league are in code-point name order, each exactly once @property @boundary @contract-shape:pure-function", () => {
    fc.assert(
      fc.property(fc.integer({ min: -(2 ** 31), max: 2 ** 31 - 1 }), (seed) => {
        const all = generateLeague(seed).clubs;
        const rows = standings(all, []);
        const names = all.map((club) => club.name);
        expect(orderOf(rows)).toEqual([...names].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0)));
        expect(rows.map((row) => row.clubId).sort()).toEqual(all.map((club) => club.id).sort());
      }),
    );
  });
});

describe("@US-2 S-007 the table is ordered by points, then goal difference, then goals scored, then club name", () => {
  // Each case: High is above Low by the named rule although every LOWER rule (and the name) favours Low.
  const CASES: readonly (readonly [string, readonly ScoredMatch[]])[] = [
    // Points: High 6 pts (GD +2, 2 scored) v Low 3 pts (GD +7, 9 scored).
    ["points beat goal difference", [game(0, 2, 1, 0), game(0, 5, 1, 0), game(1, 2, 9, 0), game(3, 1, 1, 0), game(4, 1, 1, 0)]],
    // Goal difference: both 3 pts; High GD +3 (3 scored) v Low GD +2 (6 scored).
    ["goal difference beats goals scored", [game(0, 2, 3, 0), game(1, 3, 6, 4)]],
    // Goals scored: both 3 pts and GD +1; High scored 3, Low scored 1.
    ["goals scored beat the club name", [game(0, 2, 3, 2), game(1, 3, 1, 0)]],
  ];
  it.each(CASES)("Given two clubs level on everything above the rule, when %s, then the higher one is placed first even though its name sorts later @boundary @contract-shape:pure-function", (_rule, played) => {
    const rows = standings(named(["Zephyr Town", "Alder Town", ...FILLER.slice(0, 6)]), played);
    const high = rows.find((row) => row.name === "Zephyr Town")!;
    const low = rows.find((row) => row.name === "Alder Town")!;
    expect(high.position).toBeLessThan(low.position);
  });

  it("Given two clubs level on points, goal difference and goals scored, when the table is worked out, then the club name A to Z decides, whatever their order in the league list @boundary @contract-shape:pure-function", () => {
    for (const [first, second] of [["Alder Town", "Zephyr Town"], ["Zephyr Town", "Alder Town"]] as const) {
      const rows = standings(named([first, second, ...FILLER.slice(0, 6)]), [game(0, 2, 1, 0), game(1, 3, 1, 0)]);
      expect(rows.find((row) => row.name === "Alder Town")!.position).toBe(rows.find((row) => row.name === "Zephyr Town")!.position - 1);
    }
  });

  it("Given a name with a space and a longer name that continues with a letter (Oak Hill, Oakham), when they are level, then the space sorts before the letter and Oak Hill comes first @boundary @contract-shape:pure-function", () => {
    for (const [first, second] of [["Oak Hill", "Oakham"], ["Oakham", "Oak Hill"]] as const) {
      const rows = standings(named([first, second, ...FILLER.slice(0, 6)]), []);
      expect(orderOf(rows).slice(0, 2)).toEqual(["Oak Hill", "Oakham"]);
    }
  });

  it("Given a short name that is a prefix of a longer one (Oak, Oak Hill), when they are level, then the shorter comes first @boundary @contract-shape:pure-function", () => {
    expect(orderOf(standings(named(["Oak Hill", "Oak", ...FILLER.slice(0, 6)]), [])).slice(0, 2)).toEqual(["Oak", "Oak Hill"]);
  });

  it("Given a win, a draw and a loss, when the table is worked out, then a win is worth 3 points, a draw 1 and a loss 0 @boundary @contract-shape:pure-function", () => {
    const rows = standings(clubs, [game(0, 1, 2, 1), game(2, 3, 1, 1)]);
    const by = (index: number) => rows.find((row) => row.clubId === clubs[index]!.id)!;
    expect([by(0).points, by(0).won, by(0).goalDifference]).toEqual([3, 1, 1]);
    expect([by(1).points, by(1).lost, by(1).goalDifference]).toEqual([0, 1, -1]);
    expect([by(2).points, by(2).drawn, by(3).points, by(3).drawn]).toEqual([1, 1, 1, 1]);
  });

  it("Given a club that played twice (home and away), when the table is worked out, then both matches count for it @boundary @contract-shape:pure-function", () => {
    const row = standings(clubs, [game(0, 1, 3, 0), game(2, 0, 1, 1)]).find((r) => r.clubId === clubs[0]!.id)!;
    expect([row.played, row.won, row.drawn, row.lost, row.goalsFor, row.goalsAgainst, row.goalDifference, row.points]).toEqual([2, 1, 1, 0, 4, 1, 3, 4]);
  });
});

/** An independent oracle: for each club, its own matches, tallied one by one. */
const oracle = (all: readonly Club[], played: readonly ScoredMatch[]) => {
  const tallies = all.map((club, index) => {
    const mine = played.filter((m) => m.home === index || m.away === index);
    const scored = mine.map((m): readonly [number, number] => (m.home === index ? [m.result.homeGoals, m.result.awayGoals] : [m.result.awayGoals, m.result.homeGoals]));
    const won = scored.filter(([a, b]) => a > b).length;
    const drawn = scored.filter(([a, b]) => a === b).length;
    const goalsFor = scored.reduce((sum, [a]) => sum + a, 0);
    const goalsAgainst = scored.reduce((sum, [, b]) => sum + b, 0);
    return { clubId: club.id, name: club.name, played: scored.length, won, drawn, lost: scored.length - won - drawn, goalsFor, goalsAgainst, goalDifference: goalsFor - goalsAgainst, points: 3 * won + drawn };
  });
  return [...tallies]
    .sort((a, b) => b.points - a.points || b.goalDifference - a.goalDifference || b.goalsFor - a.goalsFor || (a.name < b.name ? -1 : 1))
    .map((tally, i) => ({ position: i + 1, ...tally }));
};
const anyMatches = fc.array(
  fc
    .tuple(fc.integer({ min: 0, max: 7 }), fc.integer({ min: 1, max: 7 }), fc.integer({ min: 0, max: 9 }), fc.integer({ min: 0, max: 9 }))
    .map(([home, shift, homeGoals, awayGoals]) => game(home, (home + shift) % 8, homeGoals, awayGoals)),
  { maxLength: 30 },
);

describe("@US-2 S-007 the table cannot disagree with the results it is made from", () => {
  it("Given any league and any results, when the table is worked out, then it equals an independent tally and sort of the same results @property @driving_port @contract-shape:pure-function", () => {
    fc.assert(
      fc.property(fc.integer({ min: -(2 ** 31), max: 2 ** 31 - 1 }), anyMatches, (seed, played) => {
        const all = generateLeague(seed).clubs;
        expect(standings(all, played)).toEqual(oracle(all, played));
      }),
    );
  });

  it("Given any results, when the table is worked out, then on every row W + D + L = P, Pts = 3W + D and GD = scored minus conceded @property @contract-shape:pure-function", () => {
    fc.assert(
      fc.property(anyMatches, (played) => {
        for (const row of standings(clubs, played)) {
          expect(row.won + row.drawn + row.lost).toBe(row.played);
          expect(row.points).toBe(3 * row.won + row.drawn);
          expect(row.goalDifference).toBe(row.goalsFor - row.goalsAgainst);
        }
      }),
    );
  });

  it("Given any results, when the table is worked out, then total W equals total L, total D is even, total GD is 0 and every match is counted for two clubs @property @contract-shape:pure-function", () => {
    fc.assert(
      fc.property(anyMatches, (played) => {
        const rows = standings(clubs, played);
        const sum = (pick: (row: StandingRow) => number) => rows.reduce((total, row) => total + pick(row), 0);
        expect(sum((row) => row.won)).toBe(sum((row) => row.lost));
        expect(sum((row) => row.drawn) % 2).toBe(0);
        expect(sum((row) => row.goalDifference)).toBe(0);
        expect(sum((row) => row.goalsFor)).toBe(sum((row) => row.goalsAgainst));
        expect(sum((row) => row.played)).toBe(2 * played.length);
      }),
    );
  });

  it("Given any results, when the table is worked out, then there are 8 rows, a permutation of the clubs, with positions 1 to 8 and a total order: Pts, GD and goals scored never increase down the table, ties go to the name @property @boundary @contract-shape:pure-function", () => {
    fc.assert(
      fc.property(anyMatches, (played) => {
        const rows = standings(clubs, played);
        expect(rows.map((row) => row.position)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
        expect(rows.map((row) => row.clubId).sort()).toEqual(clubs.map((club) => club.id).sort());
        for (let i = 1; i < rows.length; i++) {
          const [above, below] = [rows[i - 1]!, rows[i]!];
          expect(above.points).toBeGreaterThanOrEqual(below.points);
          if (above.points === below.points) {
            expect(above.goalDifference).toBeGreaterThanOrEqual(below.goalDifference);
            if (above.goalDifference === below.goalDifference) {
              expect(above.goalsFor).toBeGreaterThanOrEqual(below.goalsFor);
              if (above.goalsFor === below.goalsFor) expect(above.name < below.name).toBe(true);
            }
          }
        }
      }),
    );
  });

  it("Given the same results in any order, when the table is worked out, then it is the same table @property @contract-shape:pure-function", () => {
    fc.assert(
      fc.property(anyMatches.chain((played) => fc.tuple(fc.constant(played), fc.shuffledSubarray(played, { minLength: played.length, maxLength: played.length }))), ([played, shuffled]) => {
        expect(standings(clubs, shuffled)).toEqual(standings(clubs, played));
      }),
    );
  });

  it("Given frozen clubs and results, when the table is worked out twice, then nothing is changed and the two tables are deep-equal @property @boundary @contract-shape:pure-function", () => {
    fc.assert(
      fc.property(anyMatches, (played) => {
        const frozenClubs = deepFreeze([...clubs]);
        const frozenPlayed = deepFreeze([...played].map((m) => ({ ...m, result: { ...m.result } })));
        const before = JSON.stringify([frozenClubs, frozenPlayed]);
        expect(standings(frozenClubs, frozenPlayed)).toEqual(standings(frozenClubs, frozenPlayed));
        expect(JSON.stringify([frozenClubs, frozenPlayed])).toBe(before);
      }),
    );
  });

  it("Given results that name a club outside the league (index -1, 8, 1.5 or NaN, as home or away), when the table is worked out, then it is refused with a RangeError @error @boundary @contract-shape:pure-function", () => {
    for (const bad of [-1, 8, 1.5, Number.NaN, 100]) {
      expect(() => standings(clubs, [game(bad, 1, 1, 0)]), `home ${bad}`).toThrow(RangeError);
      expect(() => standings(clubs, [game(0, bad, 1, 0)]), `away ${bad}`).toThrow(RangeError);
    }
    expect(() => standings(clubs, [game(0, 7, 1, 0)])).not.toThrow();
  });
});

describe("@US-1 @US-2 S-007 a goal difference reads +N, 0 or -N", () => {
  it.each([
    [4, "+4"], [1, "+1"], [12, "+12"], [0, "0"], [-0, "0"], [-1, "-1"], [-4, "-4"], [-12, "-12"],
  ] as const)("Given a goal difference of %s, when it is written for the table, then it reads %s @boundary @contract-shape:pure-function", (value, text) => {
    expect(formatGoalDifference(value)).toBe(text);
  });

  it("Given a negative goal difference, when it is written, then the sign is the ASCII hyphen-minus (U+002D), never a Unicode minus; zero has no sign @error @boundary @contract-shape:pure-function", () => {
    expect(formatGoalDifference(-3).charCodeAt(0)).toBe(0x2d);
    expect(formatGoalDifference(-3)).not.toContain("−");
    expect(formatGoalDifference(0)).toBe("0");
    expect(formatGoalDifference(3).charCodeAt(0)).toBe(0x2b);
  });

  it("Given any whole goal difference, when it is written, then it matches the pattern the protected checks read and reads back to the same number @property @contract-shape:pure-function", () => {
    fc.assert(
      fc.property(fc.integer({ min: -90, max: 90 }), (n) => {
        const text = formatGoalDifference(n);
        expect(text).toMatch(/^(\+[1-9]\d*|0|-[1-9]\d*)$/);
        expect(Number(text)).toBe(n);
      }),
    );
  });
});

describe("@US-2 S-007 the order does not depend on the machine (no locale rules, no chance, no clock)", () => {
  const code = readFileSync(join(import.meta.dirname, "..", "..", "..", "src", "domain", "standings.ts"), "utf8")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\/\/.*$/gm, "");
  it("Given the standings source, when searched, then it uses no localeCompare or toLocale* @error @determinism @contract-shape:pure-function", () => {
    expect(code).not.toMatch(/localeCompare|toLocale|Intl\./);
  });
  it("Given the standings source, when searched, then it uses no Math.random, Date or performance.now @error @determinism @contract-shape:pure-function", () => {
    expect(code).not.toMatch(/Math\.random|\bDate\b|performance\.now/);
  });
});
