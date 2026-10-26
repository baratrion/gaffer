// @US-2 (S-011 read my club's news in the Inbox) held out until DELIVER step 3
// CONTRACT_SHAPE: pure-function
// K2: the Inbox never disagrees with the Table. Every report's position is compared with an oracle that does not call `standings` (inbox-oracle.ts), and its sides and goals
// with the club's own recorded entry. Sweep: seeds 1..300 x 8 clubs x 14 matchdays (the K2 floor is seeds 1..100: widen, never narrow). Untouched tactics make the 56 results
// club-independent, so one season per seed serves all 8 clubs (tactics changes are the time-travel file's job).
import { describe, expect, it } from "vitest";
import { matchdayReports } from "../../../src/domain/inbox";
import { oraclePosition, oracleRows, playSeason } from "./inbox-oracle";

const disagreementsFor = (seed: number): string[] => {
  const { league, results } = playSeason(seed);
  const names = league.clubs.map((club) => club.name);
  const found: string[] = [];
  for (let index = 0; index < 8; index++) {
    const reports = matchdayReports(league.clubs, results!, index);
    if (reports.map(({ matchday }) => matchday).join() !== "14,13,12,11,10,9,8,7,6,5,4,3,2,1") found.push(`seed ${seed} club ${index}: not 14 reports newest first`);
    for (const report of reports) {
      const played = results!.find((each) => each.matchday === report.matchday && (each.home === index || each.away === index))!;
      const position = oraclePosition(oracleRows(names, results!, report.matchday), index);
      if (report.position !== position) found.push(`seed ${seed} club ${index} matchday ${report.matchday}: position ${report.position}, oracle ${position}`);
      if (JSON.stringify([report.home, report.away]) !== JSON.stringify([{ name: names[played.home], goals: played.result.homeGoals }, { name: names[played.away], goals: played.result.awayGoals }])) found.push(`seed ${seed} club ${index} matchday ${report.matchday}: wrong sides or goals`);
    }
  }
  return found;
};
describe("@US-2 S-011 every report's position is the Table's position, judged by an independent oracle", () => {
  it.each([[1, 100], [101, 200], [201, 300]])("Given seeds %i to %i, 8 clubs and 14 matchdays each, when every report is compared with the oracle and the club's own recorded match, then there is not one difference @property @kpi @contract-shape:pure-function", (from, to) => {
    const found: string[] = [];
    for (let seed = from; seed <= to; seed++) found.push(...disagreementsFor(seed));
    expect(found.slice(0, 5)).toEqual([]);
  });
});
