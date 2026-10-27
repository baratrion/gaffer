// @US-1 @US-2 (S-011 read my club's news in the Inbox) held out until DELIVER
// CONTRACT_SHAPE: pure-function
// Outcome anchor: DISCUSS D3, D4, D7 and US-1/US-2 notes; ADR-0017 decision 1; brief port 40. matchdayReports(clubs, played, clubIndex) gives one report per
// matchday in which the club has a fixture, newest first whatever the order of the log; each report holds the club's own entry (names and goals) and
// its Pos in the standings of the entries with matchday <= N (boundary: an entry of matchday N counts for N, not for N-1). The goldens come from
// inbox-reference.ts (DISCUSS, recomputed by the committed inbox-inputs-pinned.test.ts), never from DELIVER output. Two independent oracles (inbox-oracle.ts,
// no standings call) cover K2 over seeds 1..300 x 8 clubs x 14 matchdays (the floor is seeds 1..100).
// Destination: tests/acceptance/S-011/matchday-reports.test.ts (DELIVER: git mv, dropping .pending, in the commit that adds src/domain/inbox.ts).
// Keep fc.property callbacks to 3 parameters (oxlint max-params).
import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { matchdayReports, type MatchdayReport, type ReportableMatch } from "../../../src/domain/inbox";
import { generateLeague } from "../../../src/domain/league";
import { untouchedSeason } from "../S-009/season-oracle";
import { oraclePosition, scoreLineText } from "./inbox-oracle";
import { REFERENCE_INBOX_20260, REFERENCE_INBOX_31 } from "./inbox-reference";

const league31 = generateLeague(31);
const season31 = untouchedSeason(31);
const lineOf = ({ home, away }: MatchdayReport): string => `${home.name} ${home.goals}–${away.goals} ${away.name}`;
const deepFreeze = <T>(value: T): T => {
  if (typeof value === "object" && value !== null && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const inner of Object.values(value)) deepFreeze(inner);
  }
  return value;
};
const entry = (matchday: number, [home, away]: readonly [number, number], [homeGoals, awayGoals]: readonly [number, number]): ReportableMatch => ({ matchday, home, away, result: { homeGoals, awayGoals } });

describe("@US-1 @US-2 S-011 the Inbox reports are the reference season, newest first", () => {
  it("Given Netherwold Borough's 14 recorded matchdays at seed 31, when the reports are built, then there are 14, from Matchday 14 down to 1, with the DISCUSS score lines and positions @driving_port @boundary @contract-shape:pure-function", () => {
    const reports = matchdayReports(league31.clubs, season31, 0);
    const newestFirst = [...REFERENCE_INBOX_31].reverse();
    expect(reports.map((r) => r.matchday)).toEqual(newestFirst.map((r) => r.matchday));
    expect(reports.map(lineOf)).toEqual(newestFirst.map((r) => r.scoreLine));
    expect(reports.map((r) => r.position)).toEqual(newestFirst.map((r) => r.position));
    expect(reports[0]!.position).toBe(3);
    expect(reports[13]!.position).toBe(6);
  });

  it("Given Oakhampton Rise Borough at seed 20260 with only matchday 1 recorded, when the reports are built, then the one report reads Harrowgate Lane United 0–1 Oakhampton Rise Borough and 3rd @boundary @contract-shape:pure-function", () => {
    const { clubIndex, report } = REFERENCE_INBOX_20260;
    const league = generateLeague(20260);
    const reports = matchdayReports(league.clubs, untouchedSeason(20260).filter((m) => m.matchday === 1), clubIndex);
    expect(reports).toHaveLength(1);
    expect(reports[0]!.matchday).toBe(report.matchday);
    expect(lineOf(reports[0]!)).toBe(report.scoreLine);
    expect(reports[0]!.position).toBe(report.position);
  });

  it("Given the matchday 4, 5 and 7 name tie-breaks, when the reports are built, then Netherwold Borough is 5th, 3rd and 5th exactly as the Table showed then @boundary @contract-shape:pure-function", () => {
    const byMatchday = new Map(matchdayReports(league31.clubs, season31, 0).map((r) => [r.matchday, r.position]));
    expect([byMatchday.get(4), byMatchday.get(5), byMatchday.get(7)]).toEqual([5, 3, 5]);
  });
});

describe("@US-1 S-011 an empty log, a missing club and a wrong club index", () => {
  it("Given no match recorded, when the reports are built for every club, then each list is empty @boundary @contract-shape:pure-function", () => {
    for (let club = 0; club < 8; club++) expect(matchdayReports(league31.clubs, [], club)).toEqual([]);
  });

  it("Given a log in which the club has no fixture, when its reports are built, then there are none (only the club's own matches make a report) @boundary @contract-shape:pure-function", () => {
    expect(matchdayReports(league31.clubs, [entry(1, [0, 1], [2, 0]), entry(2, [2, 3], [1, 1])], 5)).toEqual([]);
  });

  it.each([[-1], [8], [100], [1.5], [Number.NaN], [Number.POSITIVE_INFINITY]])(
    "Given club index %s, when the reports are built, then it throws a RangeError, also for an empty log @error @boundary @contract-shape:pure-function",
    (clubIndex) => {
      expect(() => matchdayReports(league31.clubs, season31, clubIndex)).toThrow(RangeError);
      expect(() => matchdayReports(league31.clubs, [], clubIndex)).toThrow(RangeError);
    },
  );
});

describe("@US-2 S-011 the position counts the entries up to and including its own matchday", () => {
  it("Given the alphabetically last club wins matchday 1 and loses heavily on matchday 2, when the reports are built, then it leads after matchday 1 and is 2nd after matchday 2 (`<=`, not `<`, and the newest does not leak into the older) @error @boundary @contract-shape:pure-function", () => {
    const order = league31.clubs.map((club, index) => ({ index, name: club.name })).sort((a, b) => (a.name < b.name ? -1 : 1));
    const last = order[7]!.index;
    const other = order[0]!.index;
    const third = order[1]!.index;
    const log = [entry(1, [last, other], [1, 0]), entry(2, [third, last], [5, 0])];
    const [second, first] = matchdayReports(league31.clubs, log, last);
    expect([first!.matchday, first!.position]).toEqual([1, 1]);
    expect([second!.matchday, second!.position]).toEqual([2, 2]);
    expect(lineOf(first!)).toBe(`${league31.clubs[last]!.name} 1–0 ${league31.clubs[other]!.name}`);
    expect(lineOf(second!)).toBe(`${league31.clubs[third]!.name} 5–0 ${league31.clubs[last]!.name}`);
  });

  it("Given a drawn match and a lost match, when the reports are built, then the draw earns a point and the position is the Table's, level clubs ordered A to Z (the sides keep their home and away places) @boundary @contract-shape:pure-function", () => {
    const [report] = matchdayReports(league31.clubs, [entry(1, [3, 4], [2, 2])], 4);
    expect(report!.home).toEqual({ name: league31.clubs[3]!.name, goals: 2 });
    expect(report!.away).toEqual({ name: league31.clubs[4]!.name, goals: 2 });
    const names = league31.clubs.map((club) => club.name);
    const drawn = [names[3]!, names[4]!].sort();
    // The two drawing clubs have 1 Pt each and the six others 0, so the pair is first, A to Z.
    expect(report!.position).toBe(drawn.indexOf(league31.clubs[4]!.name) + 1);
  });
});

describe("@US-1 @US-2 S-011 properties of the reports (layer 1, pure)", () => {
  it("Given any order of the 56 recorded results and any club, when the reports are built, then they equal those of the log in play order (newest first, whatever the order) @property @driving_port @contract-shape:pure-function", () => {
    fc.assert(
      fc.property(fc.shuffledSubarray([...season31], { minLength: season31.length }), fc.integer({ min: 0, max: 7 }), (shuffled, club) => {
        expect(matchdayReports(league31.clubs, shuffled, club)).toEqual(matchdayReports(league31.clubs, season31, club));
      }),
      { numRuns: 100 },
    );
  });

  it("Given any seed, club and number of matchdays played N (0..14), when the reports are built, then there are N, Matchday N down to 1, each on the club's own match with a position from 1st to 8th equal to the oracle's @property @driving_port @boundary @contract-shape:pure-function", () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 100 }), fc.integer({ min: 0, max: 7 }), fc.integer({ min: 0, max: 14 }), (seed, club, played) => {
        const league = generateLeague(seed);
        const season = untouchedSeason(seed);
        const log = season.filter((m) => m.matchday <= played);
        const reports = matchdayReports(league.clubs, log, club);
        expect(reports.map((r) => r.matchday)).toEqual(Array.from({ length: played }, (_, i) => played - i));
        for (const report of reports) {
          const own = log.find((m) => m.matchday === report.matchday && (m.home === club || m.away === club))!;
          expect(lineOf(report)).toBe(scoreLineText(league.clubs, own));
          expect(report.position).toBe(oraclePosition({ clubs: league.clubs, season }, report.matchday, club));
          expect(report.position).toBeGreaterThanOrEqual(1);
          expect(report.position).toBeLessThanOrEqual(8);
        }
      }),
      { numRuns: 100 },
    );
  });

  it("Given a deep-frozen log, when the reports are built twice, then the input is untouched, the lists are deep-equal and a new array @property @boundary @contract-shape:pure-function", () => {
    const frozen = deepFreeze(season31.map((m) => ({ ...m, result: { ...m.result } })));
    const first = matchdayReports(league31.clubs, frozen, 0);
    const second = matchdayReports(league31.clubs, frozen, 0);
    expect(second).toEqual(first);
    expect(first).not.toBe(frozen);
    expect(frozen).toEqual(season31);
  });
});

describe("@US-1 @US-2 S-011 K2: every report agrees with an independent oracle", () => {
  it("Given seeds 1..300, all 8 clubs and matchdays 1..14, when the reports are built, then each score line and position equals the oracle's, which never calls standings (K2 floor: seeds 1..100) @property @driving_port @boundary @contract-shape:pure-function", () => {
    for (let seed = 1; seed <= 300; seed++) {
      const league = generateLeague(seed);
      const season = untouchedSeason(seed);
      for (let club = 0; club < league.clubs.length; club++) {
        const reports = matchdayReports(league.clubs, season, club);
        if (reports.length !== 14) expect.fail(`seed ${seed} club ${club}: ${reports.length} reports`);
        for (const report of reports) {
          const own = season.find((m) => m.matchday === report.matchday && (m.home === club || m.away === club))!;
          if (lineOf(report) !== scoreLineText(league.clubs, own)) expect.fail(`seed ${seed} club ${club} matchday ${report.matchday}: ${lineOf(report)}`);
          if (report.position !== oraclePosition({ clubs: league.clubs, season }, report.matchday, club)) expect.fail(`seed ${seed} club ${club} matchday ${report.matchday}: position ${report.position}`);
        }
      }
    }
  });
});
