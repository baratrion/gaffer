// Not a test: the independent oracle for the S-011 specs (ADR-0017 Earned Trust 3). It never calls standings, matchdayReports, formatOrdinal or
// inboxOf (the rules under test): it sums Pts, GD and goals for per club over the matchdays <= N and sorts them the Table's way (Pts, GD, goals
// for, all descending, then name by code point). Only the existing generator and match engine are used for the data.
import { generateLeague, type Club } from "../../../src/domain/league";
import type { PlayedMatch } from "../../../src/domain/match";
import { untouchedSeason } from "../S-009/season-oracle";

export { untouchedSeason };
export const MATCHDAYS = 14;

export const scoreLineOf = (clubs: readonly Club[], entry: PlayedMatch): string =>
  `${clubs[entry.home]!.name} ${entry.result.homeGoals}–${entry.result.awayGoals} ${clubs[entry.away]!.name}`;

/** The club's Pos right after matchday `upTo`, by the oracle's own sort. */
export const oraclePosition = (clubs: readonly Club[], played: readonly PlayedMatch[], { clubIndex, upTo }: { readonly clubIndex: number; readonly upTo: number }): number => {
  const table = clubs.map((club) => ({ name: club.name, pts: 0, gf: 0, ga: 0 }));
  for (const { matchday, home, away, result } of played) {
    if (matchday > upTo) continue;
    table[home]!.gf += result.homeGoals;
    table[home]!.ga += result.awayGoals;
    table[away]!.gf += result.awayGoals;
    table[away]!.ga += result.homeGoals;
    if (result.homeGoals === result.awayGoals) {
      table[home]!.pts += 1;
      table[away]!.pts += 1;
    } else table[result.homeGoals > result.awayGoals ? home : away]!.pts += 3;
  }
  const sorted = [...table].sort((a, b) => b.pts - a.pts || b.gf - b.ga - (a.gf - a.ga) || b.gf - a.gf || (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
  return sorted.findIndex((row) => row.name === clubs[clubIndex]!.name) + 1;
};

/** The club's own entry on matchday `matchday` (every club plays every matchday in an 8-club league). */
export const ownEntry = (played: readonly PlayedMatch[], clubIndex: number, matchday: number): PlayedMatch =>
  played.find((entry) => entry.matchday === matchday && (entry.home === clubIndex || entry.away === clubIndex))!;

export const leagueOf = (seed: number): readonly Club[] => generateLeague(seed).clubs;
