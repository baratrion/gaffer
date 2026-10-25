// @US-1 @US-2 (S-009 see how my season ended) @regression
// CONTRACT_SHAPE: pure-function
// Outcome anchor: DISCUSS reference season ends (discuss/reference-season-end.md): "Final position 3rd" and "Top scorer Garrick Thistlewood
// (5 goals)" at ?seed=31, "2nd" and "Joren Northcott (8 goals)" at ?seed=abc, "8th" and "Orrin Yarrow (1 goal)" at ?seed=13, "8th" and "Bram
// Fairbourne (3 goals)" at ?seed=1, and the 2400-season figures (444 ties at the top, no season without a goal). They are worked out here from
// the domain that already exists (generateLeague, generateSquad, playMatchday, standings) by counting the goals the way the match screen
// prints them, and compared with the plain data of season-end-reference.ts. If the generator, the match model or the standings rules ever
// change, THIS file turns red, not the End of season specs. S-009 changes none of them (no new stream), so it passes before and after DELIVER.
import { describe, expect, it } from "vitest";
import { generateLeague } from "../../../src/domain/league";
import { generateSquad } from "../../../src/domain/squad";
import { standings } from "../../../src/domain/standings";
import { REFERENCE_ENDS, SWEEP_FIGURES } from "./season-end-reference";
import { CLUBS, finalPositionOf, goalItemsOf, oracleOrdinal, oracleTopScorer, oracleTopScorerLine, untouchedSeason } from "./season-oracle";

describe.each(REFERENCE_ENDS.map((reference) => [reference] as const))("@US-1 S-009 the reference season end at seed $seed is pinned", (reference) => {
  const { seed, club } = reference;
  const league = generateLeague(seed);
  const played = untouchedSeason(seed);
  const clubIndex = league.clubs.findIndex((candidate) => candidate.name === club);
  const squad = generateSquad(seed, clubIndex);
  const items = goalItemsOf(seed, played);

  it("Given every side fields an automatic 4-4-2, when the 56 results are worked out, then the club is where the reference says in the Clubs list and finishes in the reference row of the table @regression @boundary @contract-shape:pure-function", () => {
    expect(clubIndex).toBe(reference.clubIndex);
    const row = standings(league.clubs, played).find((candidate) => candidate.name === club)!;
    expect([row.position, row.played, row.won, row.drawn, row.lost, row.goalsFor, row.goalsAgainst, row.goalDifference, row.points]).toEqual([
      reference.position, 14, reference.row.won, reference.row.drawn, reference.row.lost, reference.row.goalsFor, reference.row.goalsAgainst, reference.row.goalDifference, reference.row.points,
    ]);
    expect(oracleOrdinal(finalPositionOf(seed, played, club))).toBe(reference.ordinal);
    expect(`Final position ${reference.ordinal}`).toBe(reference.positionLine);
  });

  it("Given the 14 Goals lists, when the club's own items are counted per player, then they are the reference tallies, add up to the club's goals for, and the top scorer line is the reference line @regression @walking_skeleton @boundary @contract-shape:pure-function", () => {
    const tally = squad
      .map((player, index) => ({ name: player.name, row: index + 1, goals: items.filter((item) => item.club === club && item.scorer === player.name).length }))
      .filter((entry) => entry.goals > 0)
      .sort((a, b) => b.goals - a.goals || a.row - b.row);
    expect(tally).toEqual(reference.scorers.map((scorer) => ({ ...scorer })));
    expect(tally.reduce((sum, entry) => sum + entry.goals, 0)).toBe(reference.row.goalsFor);
    expect(oracleTopScorerLine(oracleTopScorer(items, club, squad))).toBe(reference.topScorerLine);
  });
});

describe("@US-1 S-009 the figures the stories quote are pinned", () => {
  it("Given Netherwold Borough at seed 31, when the top count is read, then two players share it and the one listed first in the Squad list (row 15, not row 18) is the top scorer: the tie that kills a last-index rule @regression @boundary @contract-shape:pure-function", () => {
    const tied = REFERENCE_ENDS[0]!.scorers.filter((scorer) => scorer.goals === 5);
    expect(tied.map((scorer) => [scorer.name, scorer.row])).toEqual([["Garrick Thistlewood", 15], ["Merrick Hartwell", 18]]);
  });

  it("Given Ashworth Vale Rovers at seed 13, when the top count is read, then three players share exactly one goal (rows 4, 5 and 13) and the first of them is the top scorer: the only (1 goal) season of seeds 1..300 @regression @boundary @contract-shape:pure-function", () => {
    expect(REFERENCE_ENDS[2]!.scorers.map((scorer) => [scorer.row, scorer.goals])).toEqual([[4, 1], [5, 1], [13, 1]]);
  });

  it("Given seeds 1 to 300 and each of the 8 clubs, when the 2400 seasons are counted, then 444 have a shared top count, none is without a goal, one has a top scorer on one goal and the highest top count is 16 @regression @boundary @error @contract-shape:pure-function", () => {
    let [seasons, sharedTop, noGoals, topOnOneGoal, highestTop] = [0, 0, 0, 0, 0];
    for (let seed = 1; seed <= 300; seed++) {
      const league = generateLeague(seed);
      const items = goalItemsOf(seed, untouchedSeason(seed));
      for (let club = 0; club < CLUBS; club++) {
        const name = league.clubs[club]!.name;
        const counts = generateSquad(seed, club).map((player) => items.filter((item) => item.club === name && item.scorer === player.name).length);
        const top = Math.max(...counts);
        seasons++;
        if (top === 0) noGoals++;
        if (top === 1) topOnOneGoal++;
        if (top > 0 && counts.filter((count) => count === top).length > 1) sharedTop++;
        highestTop = Math.max(highestTop, top);
      }
    }
    expect({ seasons, sharedTop, noGoals, topOnOneGoal, highestTop }).toEqual({ ...SWEEP_FIGURES });
  });

  it("Given positions 1 to 8, when the English ordinal is written by an independent lookup, then it reads 1st, 2nd, 3rd, 4th, 5th, 6th, 7th, 8th (the table the held-out formatOrdinal spec is held to) @regression @boundary @contract-shape:pure-function", () => {
    expect([1, 2, 3, 4, 5, 6, 7, 8].map(oracleOrdinal)).toEqual(["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th"]);
    expect([11, 12, 13, 21, 22, 23, 101, 111].map(oracleOrdinal)).toEqual(["11th", "12th", "13th", "21st", "22nd", "23rd", "101st", "111th"]);
  });
});
