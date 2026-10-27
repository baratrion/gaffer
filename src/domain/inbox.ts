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

/** One report per matchday in which the club has a fixture, newest first; RangeError for a clubIndex outside the league. */
export const matchdayReports = (clubs: readonly Club[], played: readonly ReportableMatch[], clubIndex: number): readonly MatchdayReport[] => {
  if (!Number.isInteger(clubIndex) || clubIndex < 0 || clubIndex >= clubs.length) throw new RangeError(`Club index outside the league: ${clubIndex}`);
  const clubId = (clubs[clubIndex] as Club).id;
  const sideOf = (index: number, goals: number): ReportSide => ({ name: (clubs[index] as Club).name, goals });
  const positionAfter = (matchday: number): number => {
    const row = standings(clubs, played.filter((entry) => entry.matchday <= matchday)).find((candidate) => candidate.clubId === clubId);
    return (row as { readonly position: number }).position;
  };
  const matchdays = [...new Set(played.map((entry) => entry.matchday))].sort((a, b) => b - a);
  return matchdays.flatMap((matchday) => {
    const entry = played.find((candidate) => candidate.matchday === matchday && (candidate.home === clubIndex || candidate.away === clubIndex));
    if (!entry) return [];
    return [{ matchday, home: sideOf(entry.home, entry.result.homeGoals), away: sideOf(entry.away, entry.result.awayGoals), position: positionAfter(matchday) }];
  });
};
