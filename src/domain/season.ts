import type { Player } from "./squad";

/** A played match as the log holds it: club indices and the scoring side and squad index of every goal. */
export interface ScoringMatch {
  readonly home: number;
  readonly away: number;
  readonly result: {
    readonly goals: readonly { readonly side: "home" | "away"; readonly playerIndex: number }[];
  };
}

export interface TopScorer {
  readonly playerIndex: number;
  readonly name: string;
  readonly goals: number;
}

const assertSquadIndex = (playerIndex: number, squad: readonly Player[]): void => {
  if (!Number.isInteger(playerIndex) || playerIndex < 0 || playerIndex >= squad.length) {
    throw new RangeError(`Goal names a player outside the squad: ${playerIndex}`);
  }
};

/** Goals per squad index, counting only the club's own goals (home goals of a home match, away goals of an away match). */
const countClubGoals = (played: readonly ScoringMatch[], clubIndex: number, squad: readonly Player[]): readonly number[] => {
  const counts: number[] = squad.map(() => 0);
  for (const { home, away, result } of played) {
    for (const { side, playerIndex } of result.goals) {
      if ((side === "home" ? home : away) !== clubIndex) continue;
      assertSquadIndex(playerIndex, squad);
      counts[playerIndex] = (counts[playerIndex] as number) + 1;
    }
  }
  return counts;
};

/** The club's own top scorer: most goals, ties to the lowest squad index; undefined when the club scored nothing. */
export const topScorer = (played: readonly ScoringMatch[], clubIndex: number, squad: readonly Player[]): TopScorer | undefined => {
  const counts = countClubGoals(played, clubIndex, squad);
  const goals = Math.max(0, ...counts);
  if (goals === 0) return undefined;
  const playerIndex = counts.indexOf(goals);
  return { playerIndex, name: (squad[playerIndex] as Player).name, goals };
};

/** "Name (N goals)", "Name (1 goal)" or "none". */
export const formatTopScorer = (scorer: TopScorer | undefined): string =>
  scorer === undefined ? "none" : `${scorer.name} (${scorer.goals} ${scorer.goals === 1 ? "goal" : "goals"})`;
