// Not a test: an independent oracle for "the club's position right after matchday N". It tallies and ranks with its own loops (counting the clubs
// strictly ahead) and never calls `standings`, so it cannot share a bug with the Table or the Inbox. Order: Pts, GD, goals for (descending), then name (code points).
import type { GameState } from "../../../src/app/state";
import type { PlayedMatch } from "../../../src/domain/match";
import { afterMatchdays, homeOf } from "../S-010/save-world";

export interface OracleRow { readonly name: string; readonly points: number; readonly goalDifference: number; readonly goalsFor: number }
/** The cumulative rows over the entries of matchdays 1..upTo. */
export const oracleRows = (names: readonly string[], entries: readonly PlayedMatch[], upTo: number): readonly OracleRow[] => {
  const tallies = names.map((name) => ({ name, points: 0, goalsFor: 0, goalsAgainst: 0 }));
  for (const { matchday, home, away, result } of entries) {
    if (matchday > upTo) continue;
    const [h, a] = [tallies[home]!, tallies[away]!];
    h.goalsFor += result.homeGoals; h.goalsAgainst += result.awayGoals; a.goalsFor += result.awayGoals; a.goalsAgainst += result.homeGoals;
    if (result.homeGoals === result.awayGoals) { h.points += 1; a.points += 1; } else if (result.homeGoals > result.awayGoals) h.points += 3; else a.points += 3;
  }
  return tallies.map((t) => ({ name: t.name, points: t.points, goalDifference: t.goalsFor - t.goalsAgainst, goalsFor: t.goalsFor }));
};
const isAhead = (o: OracleRow, me: OracleRow): boolean =>
  o.points !== me.points ? o.points > me.points : o.goalDifference !== me.goalDifference ? o.goalDifference > me.goalDifference : o.goalsFor !== me.goalsFor ? o.goalsFor > me.goalsFor : o.name < me.name;
/** 1 plus the number of clubs strictly ahead of `clubIndex`. */
export const oraclePosition = (rows: readonly OracleRow[], clubIndex: number): number => 1 + rows.filter((other, index) => index !== clubIndex && isAhead(other, rows[clubIndex]!)).length;
/** A whole season (14 x Play match, Back) for club `clubIndex` of the league of `seed`, tactics untouched. */
export const playSeason = (seed: number, clubIndex = 0): GameState => afterMatchdays(homeOf(seed, clubIndex), 14);
