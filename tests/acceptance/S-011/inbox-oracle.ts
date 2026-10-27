// Not a test: independent oracles for S-011. They never call standings, standingsOf, formatOrdinal or matchdayReports: they add up Pts, GD and
// goals for over matchdays 1..N and sort like the Table (Pts, GD, goals for descending, then name A to Z by code point, ADR-0013).
import { initialState, update, type Action, type GameState } from "../../../src/app/state";
import type { Club, League } from "../../../src/domain/league";
export interface OracleEntry { readonly matchday: number; readonly home: number; readonly away: number; readonly result: { readonly homeGoals: number; readonly awayGoals: number } }
export interface OracleWorld { readonly clubs: readonly Club[]; readonly season: readonly OracleEntry[] }
/** The table after matchdays 1..upTo, best first. */
export const oracleTable = (clubs: readonly Club[], season: readonly OracleEntry[], upTo: number) => {
  const rows = clubs.map((club, index) => ({ club: index, name: club.name, points: 0, goalDifference: 0, goalsFor: 0 }));
  const award = (row: (typeof rows)[number], own: number, other: number): void => {
    row.goalsFor += own;
    row.goalDifference += own - other;
    row.points += own > other ? 3 : own === other ? 1 : 0;
  };
  for (const { matchday, home, away, result } of season) {
    if (matchday > upTo) continue;
    award(rows[home]!, result.homeGoals, result.awayGoals);
    award(rows[away]!, result.awayGoals, result.homeGoals);
  }
  return [...rows].sort((x, y) => y.points - x.points || y.goalDifference - x.goalDifference || y.goalsFor - x.goalsFor || (x.name < y.name ? -1 : x.name > y.name ? 1 : 0));
};
/** The club's Pos after matchdays 1..upTo. */
export const oraclePosition = ({ clubs, season }: OracleWorld, upTo: number, clubIndex: number): number => oracleTable(clubs, season, upTo).findIndex((row) => row.club === clubIndex) + 1;
/** The score line as the match screen prints it: "Home 2–1 Away" with an en dash. */
export const scoreLineText = (clubs: readonly Club[], { home, away, result }: OracleEntry): string => `${clubs[home]!.name} ${result.homeGoals}–${result.awayGoals} ${clubs[away]!.name}`;
export const play: Action = { type: "PlayMatch" };
export const back: Action = { type: "Back" };
export const newGame: Action = { type: "NewGame" };
export const walk = (start: GameState, steps: readonly Action[]): GameState => steps.reduce(update, start);
export const newGameOf = (league: League, clubIndex: number): GameState => walk(initialState(league), [newGame, { type: "ChooseClub", clubId: league.clubs[clubIndex]!.id }]);
export const deepFreeze = <T>(value: T): T => {
  if (typeof value === "object" && value !== null && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const inner of Object.values(value)) deepFreeze(inner);
  }
  return value;
};
