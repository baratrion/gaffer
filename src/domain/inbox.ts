/** Matchday reports of the Inbox (ADR-0017): the club's own match per matchday and its league position then. */
import type { Club } from "./league";
import { standings, type ScoredMatch } from "./standings";

/** A recorded match with its matchday (a PlayedMatch fits). */
export interface ReportableMatch extends ScoredMatch {
  readonly matchday: number;
}

export interface ReportSide {
  readonly name: string;
  readonly goals: number;
}

export interface MatchdayReport {
  readonly matchday: number;
  readonly home: ReportSide;
  readonly away: ReportSide;
  /** The club's Pos in the standings of the entries with matchday <= this one. */
  readonly position: number;
}

const assertClubIndex = (clubIndex: number, clubCount: number): void => {
  if (!Number.isInteger(clubIndex) || clubIndex < 0 || clubIndex >= clubCount) {
    throw new RangeError(`Club index outside the league: ${clubIndex}`);
  }
};

const ownMatch = (played: readonly ReportableMatch[], clubIndex: number, matchday: number): ReportableMatch | undefined =>
  played.find((entry) => entry.matchday === matchday && (entry.home === clubIndex || entry.away === clubIndex));

interface Log {
  readonly clubs: readonly Club[];
  readonly played: readonly ReportableMatch[];
}

const positionAfter = (log: Log, clubIndex: number, matchday: number): number => {
  const prefix = log.played.filter((entry) => entry.matchday <= matchday);
  const clubId = (log.clubs[clubIndex] as Club).id;
  const row = standings(log.clubs, prefix).find((candidate) => candidate.clubId === clubId);
  return (row as { readonly position: number }).position;
};

const reportFor = (log: Log, clubIndex: number, entry: ReportableMatch): MatchdayReport => ({
  matchday: entry.matchday,
  home: { name: (log.clubs[entry.home] as Club).name, goals: entry.result.homeGoals },
  away: { name: (log.clubs[entry.away] as Club).name, goals: entry.result.awayGoals },
  position: positionAfter(log, clubIndex, entry.matchday),
});

const distinctMatchdaysNewestFirst = (played: readonly ReportableMatch[]): readonly number[] =>
  [...new Set(played.map((entry) => entry.matchday))].sort((a, b) => b - a);

/** One report per matchday in which the club has a fixture, newest first; RangeError for a clubIndex outside the league. */
export const matchdayReports = (
  clubs: readonly Club[],
  played: readonly ReportableMatch[],
  clubIndex: number,
): readonly MatchdayReport[] => {
  assertClubIndex(clubIndex, clubs.length);
  const log: Log = { clubs, played };
  return distinctMatchdaysNewestFirst(played).flatMap((matchday) => {
    const entry = ownMatch(played, clubIndex, matchday);
    return entry ? [reportFor(log, clubIndex, entry)] : [];
  });
};
