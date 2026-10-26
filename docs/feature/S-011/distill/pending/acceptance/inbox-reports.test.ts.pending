// @US-1 @US-2 (S-011 read my club's news in the Inbox) held out until DELIVER step 3
// CONTRACT_SHAPE: pure-function
// `matchdayReports(clubs, played, clubIndex)`: one report per matchday the club has played, newest first, each with the club's own match and its position right after that
// matchday. Goldens are the DISCUSS seed-31 table (inbox-reference.ts), pinned before any implementation exists.
import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { matchdayReports } from "../../../src/domain/inbox";
import type { PlayedMatch } from "../../../src/domain/match";
import { afterMatchdays, homeOf } from "../S-010/save-world";
import { playSeason } from "./inbox-oracle";
import { SEED_20260, SEED_20260_CLUB, SEED_20260_FIRST, SEED_31, SEED_31_REPORTS, SEED_31_TIES } from "./inbox-reference";

const { league, results } = playSeason(SEED_31);
const clubs = league.clubs;
const log = results!;
const NB = "Netherwold Borough";
const [OAK, MAR, VAL] = ["Oakhampton Rise Borough", "Marlbrook Athletic", "Valebridge Albion"];
const own = (name: string): number => clubs.findIndex((club) => club.name === name);
const entry = (matchday: number, [home, away]: readonly [string, string], [homeGoals, awayGoals]: readonly [number, number]) => ({ matchday, home: own(home), away: own(away), result: { homeGoals, awayGoals } });
const deepFreeze = <T>(value: T): T => (typeof value === "object" && value !== null ? (Object.values(value).forEach(deepFreeze), Object.freeze(value)) : value);

describe("@US-1 @US-2 S-011 matchdayReports gives the season's story of one club", () => {
  it.each(SEED_31_REPORTS)("Given the seed-31 season and Netherwold Borough, when the reports are read, then matchday $matchday is $home.name $home.goals–$away.goals $away.name at position $position @walking_skeleton @driving_port @contract-shape:pure-function", (expected) => {
    expect(matchdayReports(clubs, log, 0).find((report) => report.matchday === expected.matchday)).toEqual(expected);
  });
  it("Given the whole seed-31 season, when the reports are read, then there are exactly 14, newest first (Matchday 14 down to 1), equal to the reference table @property @contract-shape:pure-function", () => {
    expect(matchdayReports(clubs, log, 0)).toEqual([...SEED_31_REPORTS].reverse());
  });
  it("Given the default seed 20260 and Oakhampton Rise Borough after one match, when the reports are read, then the one report is Harrowgate Lane United 0–1 Oakhampton Rise Borough at position 3 @driving_port @boundary @contract-shape:pure-function", () => {
    const index = homeOf(SEED_20260, 0).league.clubs.findIndex((club) => club.name === SEED_20260_CLUB);
    expect(matchdayReports(homeOf(SEED_20260, 0).league.clubs, afterMatchdays(homeOf(SEED_20260, index), 1).results!, index)).toEqual([SEED_20260_FIRST]);
  });
  it.each(SEED_31_TIES)("Given the log up to matchday $matchday only, when the reports are read, then the newest is that matchday at the position the name tie-break with $rival gives @boundary @contract-shape:pure-function", ({ matchday }) => {
    expect(matchdayReports(clubs, log.filter((played) => played.matchday <= matchday), 0)[0]).toEqual(SEED_31_REPORTS[matchday - 1]);
  });
  const TIES = [
    { label: "the name decides when Pts, GD and goals for are level", played: [entry(1, [NB, OAK], [1, 0]), entry(1, [MAR, VAL], [1, 0])], name: NB, position: 2 },
    { label: "the same level pair, seen from the club that sorts first", played: [entry(1, [NB, OAK], [1, 0]), entry(1, [MAR, VAL], [1, 0])], name: MAR, position: 1 },
    { label: "goals for beats the name when Pts and GD are level", played: [entry(1, [NB, OAK], [2, 1]), entry(1, [MAR, VAL], [1, 0])], name: NB, position: 1 },
    { label: "goal difference beats goals for when Pts are level", played: [entry(1, [NB, OAK], [2, 0]), entry(1, [MAR, VAL], [5, 4])], name: NB, position: 1 },
    { label: "points beat goal difference", played: [entry(1, [NB, OAK], [1, 0]), entry(1, [MAR, VAL], [0, 0])], name: NB, position: 1 },
  ];
  it.each(TIES)("Given a one-matchday log where $label, when the club's report is read, then its position is $position: the Table's order @boundary @error @contract-shape:pure-function", ({ played, name, position }) => {
    expect(matchdayReports(clubs, played, own(name))).toEqual([expect.objectContaining({ matchday: 1, position })]);
  });
  it("Given matchday 2 moves the club down, when the reports are read, then matchday 1 keeps its position (only matchdays up to N count, N included) and matchday 2 has the new one @boundary @contract-shape:pure-function", () => {
    const played = [entry(1, [NB, OAK], [1, 0]), entry(2, [VAL, NB], [3, 0])];
    expect(matchdayReports(clubs, played, own(NB)).map(({ matchday, position }) => [matchday, position])).toEqual([[2, 2], [1, 1]]);
  });
  it("Given the same recorded results in any order, when the reports are read, then they are the same: the prefix is cut by matchday, not by place in the log @property @contract-shape:pure-function", () => {
    const expected = matchdayReports(clubs, log, 0);
    fc.assert(fc.property(fc.shuffledSubarray([...log], { minLength: log.length, maxLength: log.length }), (shuffled: PlayedMatch[]) => { expect(matchdayReports(clubs, shuffled, 0)).toEqual(expected); }), { numRuns: 100 });
  });
  it("Given 0 to 14 matchdays played, when the reports are read for every club, then each has exactly that many, newest first, the own club on one side every time @boundary @property @contract-shape:pure-function", () => {
    for (let played = 0; played <= 14; played++) {
      for (let index = 0; index < 8; index++) {
        const reports = matchdayReports(clubs, log.filter((each) => each.matchday <= played), index);
        expect(reports.map(({ matchday }) => matchday)).toEqual(Array.from({ length: played }, (_, n) => played - n));
        for (const report of reports) expect([report.home.name, report.away.name]).toContain(clubs[index]!.name);
      }
    }
  });
  it.each([-1, 8, 1.5, Number.NaN, Number.POSITIVE_INFINITY])("Given a club place of %s, when the reports are read, then a RangeError says the club is not in the league @error @boundary @contract-shape:pure-function", (clubIndex) => {
    expect(() => matchdayReports(clubs, log, clubIndex)).toThrow(RangeError);
  });
  it("Given a recorded match that names a club outside the league, when the reports are read, then a RangeError, as the Table gives @error @boundary @contract-shape:pure-function", () => {
    expect(() => matchdayReports(clubs, [{ matchday: 1, home: 8, away: 0, result: { homeGoals: 0, awayGoals: 0 } }], 0)).toThrow(RangeError);
  });
  it("Given frozen clubs and results, and nothing played, when the reports are read twice, then nothing is mutated, both reads are equal, and an empty log gives none @property @boundary @contract-shape:pure-function", () => {
    const [frozenClubs, frozenLog] = [deepFreeze(structuredClone(clubs)), deepFreeze(structuredClone(log))];
    expect(matchdayReports(frozenClubs, frozenLog, 3)).toEqual(matchdayReports(frozenClubs, frozenLog, 3));
    expect(frozenLog).toEqual(log);
    expect(matchdayReports(clubs, [], 0)).toEqual([]);
  });
});
