// Not a test: independent oracles for the S-009 specs. They never call topScorer, formatTopScorer, formatOrdinal or seasonSummaryOf (those are
// the rules under test); they count the goals the way Sam reads them, from the recorded results, naming the scorer from the squad of the side
// that scored (as the match screen prints the "Goals" list). Only domain code that already exists is used.
import { generateLeague } from "../../../src/domain/league";
import { playMatchday, type PlayedMatch } from "../../../src/domain/match";
import { automaticXI } from "../../../src/domain/selection";
import { generateSquad, type Player } from "../../../src/domain/squad";
import { standings } from "../../../src/domain/standings";

export const CLUBS = 8;

/** The 56 results of a whole league season with every side an automatic 4-4-2 (nobody's picks, nobody's formation). */
export const untouchedSeason = (seed: number): readonly PlayedMatch[] => {
  const sides = Array.from({ length: CLUBS }, (_, club) => {
    const squad = generateSquad(seed, club);
    return { squad, xi: automaticXI(squad, "4-4-2") };
  });
  return Array.from({ length: 14 }, (_, i) => playMatchday({ seed, matchday: i + 1, sides })).flat();
};

/** One item of a club's "Goals" lists: the scorer's name and the club he scored for. */
export interface GoalItem {
  readonly matchday: number;
  readonly scorer: string;
  readonly club: string;
}

/** Every item of the 14 "Goals" lists, in log order, as the match screens print them. */
export const goalItemsOf = (seed: number, played: readonly PlayedMatch[]): readonly GoalItem[] => {
  const league = generateLeague(seed);
  const squads = league.clubs.map((_, club) => generateSquad(seed, club));
  return played.flatMap(({ matchday, home, away, result }) =>
    result.goals.map(({ side, playerIndex }) => {
      const club = side === "home" ? home : away;
      return { matchday, scorer: squads[club]![playerIndex]!.name, club: league.clubs[club]!.name };
    }),
  );
};

export interface OracleScorer {
  readonly name: string;
  readonly goals: number;
  /** 0-based index in the club's squad (the 1-based "Squad" row is this plus one). */
  readonly squadIndex: number;
}

/** The club player with the most items naming him and his club; the one listed first in the "Squad" list when several tie; undefined when no item. */
export const oracleTopScorer = (items: readonly GoalItem[], club: string, squad: readonly Player[]): OracleScorer | undefined => {
  let best: OracleScorer | undefined;
  squad.forEach((player, squadIndex) => {
    const goals = items.filter((item) => item.club === club && item.scorer === player.name).length;
    if (goals > 0 && (best === undefined || goals > best.goals)) best = { name: player.name, goals, squadIndex };
  });
  return best;
};

/** The club's row of the final table: its Pos, from the standings of the whole log. */
export const finalPositionOf = (seed: number, played: readonly PlayedMatch[], club: string): number =>
  standings(generateLeague(seed).clubs, played).find((row) => row.name === club)!.position;

const SUFFIX = ["th", "st", "nd", "rd", "th", "th", "th", "th", "th", "th"] as const;
/** The English ordinal, written as a lookup (no copy of the rule under test): 11, 12 and 13 take "th". */
export const oracleOrdinal = (n: number): string => `${n}${n % 100 >= 11 && n % 100 <= 13 ? "th" : SUFFIX[n % 10]}`;

/** The text of the End of season lines for an oracle scorer. */
export const oracleTopScorerLine = (scorer: OracleScorer | undefined): string =>
  `Top scorer ${scorer === undefined ? "none" : `${scorer.name} (${scorer.goals} ${scorer.goals === 1 ? "goal" : "goals"})`}`;
