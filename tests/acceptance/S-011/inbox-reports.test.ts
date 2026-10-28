// @US-1 @US-2 (S-011 read my club's news in the Inbox) held out until DELIVER
// CONTRACT_SHAPE: pure-function
// Outcome anchor: DISCUSS D3, D4, D6, D7 and US-2 notes; DESIGN DD1, brief port 40. matchdayReports(clubs, played, clubIndex) is pure and returns
// one report per matchday in which the club has a fixture, newest first, with the club's own entry (names, goals) and its Pos right after that
// matchday. Goldens come from inbox-reference.ts (DISCUSS data, confirmed by the committed inbox-inputs-pinned test), the oracle from
// inbox-oracle.ts (never calls standings). Layer 1: property-based where the input space is unbounded, examples for the pinned figures.
// Destination: tests/acceptance/S-011/inbox-reports.test.ts (DELIVER: git mv, dropping .pending, in the commit that implements matchdayReports).
import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { matchdayReports, type MatchdayReport, type ReportableMatch } from "../../../src/domain/inbox";
import type { Club } from "../../../src/domain/league";
import { NETHERWOLD_31, OAKHAMPTON_20260_FIRST } from "./inbox-reference";
import { leagueOf, MATCHDAYS, oraclePosition, ownEntry, untouchedSeason } from "./inbox-oracle";

const lineOf = ({ home, away }: MatchdayReport): string => `${home.name} ${home.goals}–${away.goals} ${away.name}`;
const clubs31 = leagueOf(31);
const season31 = untouchedSeason(31);

/** Four literal clubs and a literal log: 1: Alder 1-0 Birch, Cedar 0-0 Dunmore; 2: Alder 0-3 Cedar, Birch 1-1 Dunmore. */
const club = (name: string): Club => ({ id: name.toLowerCase(), name, colours: ["#111111", "#eeeeee"] as unknown as Club["colours"] });
const FOUR = ["Alder", "Birch", "Cedar", "Dunmore"].map(club);
const game = (matchday: number, [home, away]: readonly [number, number], [homeGoals, awayGoals]: readonly [number, number]): ReportableMatch => ({ matchday, home, away, result: { homeGoals, awayGoals } });
const LOG: readonly ReportableMatch[] = [game(1, [0, 1], [1, 0]), game(1, [2, 3], [0, 0]), game(2, [0, 2], [0, 3]), game(2, [1, 3], [1, 1])];
const brief = (reports: readonly MatchdayReport[]) => reports.map((r) => ({ matchday: r.matchday, line: lineOf(r), position: r.position }));

describe("@US-1 @US-2 S-011 the reports for Netherwold Borough at seed 31 equal the DISCUSS goldens", () => {
  it("Given the 56 results of seed 31, when the reports of club 0 are built, then there are 14, newest first, with the golden score lines and positions @walking_skeleton @driving_port @contract-shape:pure-function", () => {
    const reports = matchdayReports(clubs31, season31, 0);
    expect(brief(reports)).toEqual([...NETHERWOLD_31].reverse().map((m) => ({ matchday: m.matchday, line: m.scoreLine, position: m.position })));
  });

  it.each([4, 5, 7])("Given the name tie at matchday %i, when the report is read, then its position is the one the Table listed then (ties broken A to Z) @boundary @contract-shape:pure-function", (matchday) => {
    const report = matchdayReports(clubs31, season31, 0).find((r) => r.matchday === matchday)!;
    expect(report.position).toBe(NETHERWOLD_31[matchday - 1]!.position);
  });

  it("Given seed 20260, when Oakhampton Rise Borough has played one match, then its one report is the golden score line and 3rd @boundary @contract-shape:pure-function", () => {
    const clubs = leagueOf(20260);
    const index = clubs.findIndex((c) => c.name === "Oakhampton Rise Borough");
    const first = untouchedSeason(20260).filter((entry) => entry.matchday === 1);
    expect(brief(matchdayReports(clubs, first, index))).toEqual([{ matchday: 1, line: OAKHAMPTON_20260_FIRST.scoreLine, position: OAKHAMPTON_20260_FIRST.position }]);
  });

  it("Given matchday 9 and then 10, when the reports are read after each, then the older one keeps its position (2nd) though the table moved (4th) @boundary @contract-shape:pure-function", () => {
    const nine = matchdayReports(clubs31, season31.filter((e) => e.matchday <= 9), 0);
    const ten = matchdayReports(clubs31, season31.filter((e) => e.matchday <= 10), 0);
    expect([nine[0]!.matchday, nine[0]!.position]).toEqual([9, 2]);
    expect([ten[0]!.matchday, ten[0]!.position, ten[1]!.matchday, ten[1]!.position]).toEqual([10, 4, 9, 2]);
  });
});

describe("@US-1 S-011 literal logs: side, order, prefix and gaps", () => {
  it("Given the literal log, when Birch's reports are built, then matchday 2 and 1 come with Birch's own match and the position counting that matchday (4th both times) @boundary @contract-shape:pure-function", () => {
    expect(brief(matchdayReports(FOUR, LOG, 1))).toEqual([
      { matchday: 2, line: "Birch 1–1 Dunmore", position: 4 },
      { matchday: 1, line: "Alder 1–0 Birch", position: 4 },
    ]);
  });

  it("Given the literal log, when Cedar's reports are built, then the away side is Cedar's name and goals (1st, then 2nd) @boundary @contract-shape:pure-function", () => {
    expect(brief(matchdayReports(FOUR, LOG, 2))).toEqual([
      { matchday: 2, line: "Alder 0–3 Cedar", position: 1 },
      { matchday: 1, line: "Cedar 0–0 Dunmore", position: 2 },
    ]);
  });

  it("Given an empty log, when the reports are built, then there are none, for every club @error @boundary @contract-shape:pure-function", () => {
    for (let i = 0; i < FOUR.length; i++) expect(matchdayReports(FOUR, [], i)).toEqual([]);
  });

  it("Given a log where Alder plays only matchday 1 and Cedar and Dunmore only matchday 3, when Alder's reports are built, then there is one, for matchday 1 @boundary @contract-shape:pure-function", () => {
    const gappy = [game(1, [0, 1], [2, 2]), game(3, [2, 3], [1, 0])];
    expect(brief(matchdayReports(FOUR, gappy, 0))).toEqual([{ matchday: 1, line: "Alder 2–2 Birch", position: 1 }]);
  });

  it.each([-1, 4, 8, 1.5, Number.NaN, Number.POSITIVE_INFINITY])("Given a club index of %s, when the reports are built, then it is a RangeError, not a quiet empty list @error @boundary @contract-shape:pure-function", (clubIndex) => {
    expect(() => matchdayReports(FOUR, LOG, clubIndex)).toThrow(RangeError);
  });

  it("Given frozen inputs, when the reports are built twice, then nothing is mutated and the two lists are deeply equal @boundary @contract-shape:pure-function", () => {
    const frozen = LOG.map((entry) => Object.freeze({ ...entry, result: Object.freeze({ ...entry.result }) }));
    const clubs = FOUR.map((c) => Object.freeze({ ...c }));
    const first = matchdayReports(Object.freeze(clubs), Object.freeze(frozen), 1);
    expect(matchdayReports(Object.freeze(clubs), Object.freeze(frozen), 1)).toEqual(first);
  });
});

describe("@US-1 @US-2 S-011 properties of the reports", () => {
  it("Given any order of the recorded results of seed 31, when the reports of any club are built, then they are the same list, newest first @property @contract-shape:pure-function", () => {
    fc.assert(
      fc.property(fc.shuffledSubarray([...season31], { minLength: season31.length, maxLength: season31.length }), fc.integer({ min: 0, max: 7 }), (shuffled, clubIndex) => {
        const reports = matchdayReports(clubs31, shuffled, clubIndex);
        expect(reports).toEqual(matchdayReports(clubs31, season31, clubIndex));
        expect(reports.map((r) => r.matchday)).toEqual(Array.from({ length: MATCHDAYS }, (_, i) => MATCHDAYS - i));
      }),
      { numRuns: 100 },
    );
  });

  it("Given any prefix of the season, when the reports are built, then they are exactly the tail of the full season's reports (a played matchday is never rewritten) @property @contract-shape:pure-function", () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 20000 }), fc.integer({ min: 0, max: 14 }), fc.integer({ min: 0, max: 7 }), (seed, upTo, clubIndex) => {
        const clubs = leagueOf(seed);
        const season = untouchedSeason(seed);
        const prefix = matchdayReports(clubs, season.filter((e) => e.matchday <= upTo), clubIndex);
        expect(prefix).toEqual(matchdayReports(clubs, season, clubIndex).slice(MATCHDAYS - upTo));
        expect(prefix).toHaveLength(upTo);
      }),
      { numRuns: 100 },
    );
  });
});

describe("@US-2 S-011 K2 oracle sweep: seeds 1..300 x 8 clubs x matchdays 1..14 (never below the floor of seeds 1..100)", () => {
  it("Given every club of every seed, when the reports are built, then each report's matchday, score line and position equal the independent oracle's @property @boundary @contract-shape:pure-function", () => {
    const differences: string[] = [];
    for (let seed = 1; seed <= 300; seed++) {
      const clubs = leagueOf(seed);
      const season = untouchedSeason(seed);
      for (let clubIndex = 0; clubIndex < clubs.length; clubIndex++) {
        const reports = matchdayReports(clubs, season, clubIndex);
        if (reports.length !== MATCHDAYS) differences.push(`${seed}/${clubIndex}: ${reports.length} reports`);
        reports.forEach((report, i) => {
          const matchday = MATCHDAYS - i;
          const entry = ownEntry(season, clubIndex, matchday);
          const expectedLine = `${clubs[entry.home]!.name} ${entry.result.homeGoals}–${entry.result.awayGoals} ${clubs[entry.away]!.name}`;
          if (report.matchday !== matchday || lineOf(report) !== expectedLine || report.position !== oraclePosition(clubs, season, { clubIndex, upTo: matchday })) differences.push(`${seed}/${clubIndex}/${matchday}`);
        });
      }
    }
    expect(differences).toEqual([]);
  });
});
