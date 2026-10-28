import type { Club } from "./league";
import { standings, type ScoredMatch } from "./standings";

export interface ReportSide {
  readonly name: string;
  readonly goals: number;
}

/** One played matchday as the club's Inbox reports it: the club's own match and its position right after that matchday. */
export interface MatchdayReport {
  readonly matchday: number;
  readonly home: ReportSide;
  readonly away: ReportSide;
  readonly position: number;
}

export interface ReportableMatch extends ScoredMatch {
  readonly matchday: number;
}

const assertClubIndex = (clubIndex: number, clubCount: number): void => {
  if (!Number.isInteger(clubIndex) || clubIndex < 0 || clubIndex >= clubCount) {
    throw new RangeError(`Not a club of the league: ${clubIndex}`);
  }
};

const upToMatchday = (played: readonly ReportableMatch[], matchday: number): readonly ReportableMatch[] =>
  played.filter((entry) => entry.matchday <= matchday);

const involves = (entry: ReportableMatch, clubIndex: number): boolean => entry.home === clubIndex || entry.away === clubIndex;

const positionOf = (clubs: readonly Club[], played: readonly ReportableMatch[], clubId: string): number => {
  const row = standings(clubs, played).find((candidate) => candidate.clubId === clubId);
  return (row as { readonly position: number }).position;
};

const reportBuilder =
  (clubs: readonly Club[], played: readonly ReportableMatch[], clubIndex: number) =>
  (own: ReportableMatch): MatchdayReport => ({
    matchday: own.matchday,
    home: { name: (clubs[own.home] as Club).name, goals: own.result.homeGoals },
    away: { name: (clubs[own.away] as Club).name, goals: own.result.awayGoals },
    position: positionOf(clubs, upToMatchday(played, own.matchday), (clubs[clubIndex] as Club).id),
  });

/** The club's own match of every matchday it played, newest first, each with the club's position in the table right after that matchday. */
export const matchdayReports = (clubs: readonly Club[], played: readonly ReportableMatch[], clubIndex: number): readonly MatchdayReport[] => {
  assertClubIndex(clubIndex, clubs.length);
  return played
    .filter((entry) => involves(entry, clubIndex))
    .sort((a, b) => b.matchday - a.matchday)
    .map(reportBuilder(clubs, played, clubIndex));
};
