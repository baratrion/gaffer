import type { Club } from "./league";
import { standings, type ScoredMatch } from "./standings";

/** A recorded entry the reports read: a scored match plus its matchday (a `PlayedMatch` fits). */
export interface ReportableMatch extends ScoredMatch {
  readonly matchday: number;
}

export interface MatchdayReport {
  readonly matchday: number;
  readonly home: { readonly name: string; readonly goals: number };
  readonly away: { readonly name: string; readonly goals: number };
  readonly position: number;
}

const assertClubPlace = (clubIndex: number, clubCount: number): void => {
  if (!Number.isInteger(clubIndex) || clubIndex < 0 || clubIndex >= clubCount) {
    throw new RangeError(`The club is not in the league: ${clubIndex}`);
  }
};

const involves = (clubIndex: number, { home, away }: ReportableMatch): boolean => home === clubIndex || away === clubIndex;

/** The 1-based row of the club in the table over the entries given. */
const positionIn = (clubs: readonly Club[], entries: readonly ReportableMatch[], clubIndex: number): number =>
  standings(clubs, entries).findIndex((row) => row.clubId === clubs[clubIndex]!.id) + 1;

const reportOf = (clubs: readonly Club[], entry: ReportableMatch, position: number): MatchdayReport => ({
  matchday: entry.matchday,
  home: { name: clubs[entry.home]!.name, goals: entry.result.homeGoals },
  away: { name: clubs[entry.away]!.name, goals: entry.result.awayGoals },
  position,
});

/** The managed club's matchday reports, newest first, each with its position after that matchday. */
export const matchdayReports = (
  clubs: readonly Club[],
  played: readonly ReportableMatch[],
  clubIndex: number,
): readonly MatchdayReport[] => {
  assertClubPlace(clubIndex, clubs.length);
  const own = played.filter((entry) => involves(clubIndex, entry)).sort((a, b) => b.matchday - a.matchday);
  return own.map((entry) => reportOf(clubs, entry, positionIn(clubs, played.filter((other) => other.matchday <= entry.matchday), clubIndex)));
};
