import type { Club } from "./league";

/** A played match: club indices into the league's club list and the final score. */
export interface ScoredMatch {
  readonly home: number;
  readonly away: number;
  readonly result: { readonly homeGoals: number; readonly awayGoals: number };
}

export interface StandingRow {
  readonly position: number;
  readonly clubId: string;
  readonly name: string;
  readonly played: number;
  readonly won: number;
  readonly drawn: number;
  readonly lost: number;
  readonly goalsFor: number;
  readonly goalsAgainst: number;
  readonly goalDifference: number;
  readonly points: number;
}

interface Tally {
  readonly played: number;
  readonly won: number;
  readonly drawn: number;
  readonly lost: number;
  readonly goalsFor: number;
  readonly goalsAgainst: number;
}

const EMPTY_TALLY: Tally = { played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0 };

const addGame = (tally: Tally, scored: number, conceded: number): Tally => ({
  played: tally.played + 1,
  won: tally.won + (scored > conceded ? 1 : 0),
  drawn: tally.drawn + (scored === conceded ? 1 : 0),
  lost: tally.lost + (scored < conceded ? 1 : 0),
  goalsFor: tally.goalsFor + scored,
  goalsAgainst: tally.goalsAgainst + conceded,
});

const assertClubIndex = (index: number, clubCount: number): void => {
  if (!Number.isInteger(index) || index < 0 || index >= clubCount) {
    throw new RangeError(`Match names a club outside the league: ${index}`);
  }
};

const tallyMatches = (clubCount: number, played: readonly ScoredMatch[]): readonly Tally[] => {
  const tallies: Tally[] = Array.from({ length: clubCount }, () => EMPTY_TALLY);
  for (const { home, away, result } of played) {
    assertClubIndex(home, clubCount);
    assertClubIndex(away, clubCount);
    tallies[home] = addGame(tallies[home] as Tally, result.homeGoals, result.awayGoals);
    tallies[away] = addGame(tallies[away] as Tally, result.awayGoals, result.homeGoals);
  }
  return tallies;
};

type UnrankedRow = Omit<StandingRow, "position">;

const toRow = (club: Club, tally: Tally): UnrankedRow => ({
  clubId: club.id,
  name: club.name,
  ...tally,
  goalDifference: tally.goalsFor - tally.goalsAgainst,
  points: 3 * tally.won + tally.drawn,
});

const compareNames = (a: string, b: string): number => (a < b ? -1 : a > b ? 1 : 0);

const byRank = (a: UnrankedRow, b: UnrankedRow): number =>
  b.points - a.points ||
  b.goalDifference - a.goalDifference ||
  b.goalsFor - a.goalsFor ||
  compareNames(a.name, b.name);

/** The league table: Pts, then GD, then goals for (all descending), then club name in code-point order. */
export const standings = (clubs: readonly Club[], played: readonly ScoredMatch[]): readonly StandingRow[] => {
  const tallies = tallyMatches(clubs.length, played);
  return clubs
    .map((club, index) => toRow(club, tallies[index] as Tally))
    .sort(byRank)
    .map((row, index) => ({ position: index + 1, ...row }));
};

/** +N, 0 or -N, with the ASCII hyphen-minus. */
export const formatGoalDifference = (goalDifference: number): string =>
  goalDifference > 0 ? `+${goalDifference}` : goalDifference < 0 ? `-${-goalDifference}` : "0";
