// Not a test: the independent oracles of the S-011 specs. They never call `standings`, `standingsOf`, `formatOrdinal` or `matchdayReports` (the
// rules under test): they add up Pts, GD and goals for per club over the entries of matchdays 1..N and sort them the way the Table reads
// (Pts, GD, goals for, all descending, then club name A to Z by code point, ADR-0013). Only domain data that already exists is used.
import type { Club } from "../../../src/domain/league";

export interface OracleEntry {
  readonly matchday: number;
  readonly home: number;
  readonly away: number;
  readonly result: { readonly homeGoals: number; readonly awayGoals: number };
}

export interface OracleRow {
  readonly club: number;
  readonly name: string;
  readonly points: number;
  readonly goalDifference: number;
  readonly goalsFor: number;
}

/** The table after matchdays 1..upTo, best first. */
export const oracleTable = (clubs: readonly Club[], season: readonly OracleEntry[], upTo: number): readonly OracleRow[] => {
  const rows = clubs.map((club, index) => ({ club: index, name: club.name, points: 0, goalDifference: 0, goalsFor: 0 }));
  for (const { matchday, home, away, result } of season) {
    if (matchday > upTo) continue;
    const h = rows[home]!;
    const a = rows[away]!;
    h.goalsFor += result.homeGoals;
    a.goalsFor += result.awayGoals;
    h.goalDifference += result.homeGoals - result.awayGoals;
    a.goalDifference += result.awayGoals - result.homeGoals;
    h.points += result.homeGoals > result.awayGoals ? 3 : result.homeGoals === result.awayGoals ? 1 : 0;
    a.points += result.awayGoals > result.homeGoals ? 3 : result.homeGoals === result.awayGoals ? 1 : 0;
  }
  return [...rows].sort((x, y) => y.points - x.points || y.goalDifference - x.goalDifference || y.goalsFor - x.goalsFor || (x.name < y.name ? -1 : x.name > y.name ? 1 : 0));
};

export interface OracleWorld {
  readonly clubs: readonly Club[];
  readonly season: readonly OracleEntry[];
}

/** The club's Pos after matchdays 1..upTo. */
export const oraclePosition = ({ clubs, season }: OracleWorld, upTo: number, clubIndex: number): number =>
  oracleTable(clubs, season, upTo).findIndex((row) => row.club === clubIndex) + 1;

/** The score line as the match screen prints it: "Home 2–1 Away" with an en dash. */
export const scoreLineText = (clubs: readonly Club[], { home, away, result }: OracleEntry): string =>
  `${clubs[home]!.name} ${result.homeGoals}–${result.awayGoals} ${clubs[away]!.name}`;

export const ORDINALS = ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th"] as const;
