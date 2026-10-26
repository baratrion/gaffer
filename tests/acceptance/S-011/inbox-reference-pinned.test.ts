// @US-1 @US-2 (S-011 read my club's news in the Inbox) @regression
// CONTRACT_SHAPE: pure-function
// Passes before and after DELIVER: it pins the reference data (inbox-reference.ts, from DISCUSS) and the independent oracle (inbox-oracle.ts) to the game as it plays
// today, using only code that exists (`update`, `matchFor`, `standingsOf`, `standings`). So the RED-first goldens of the held-out files are known to be true of the real
// generator, and the oracle that judges the Inbox is known to agree with the Table, not just with itself.
import { describe, expect, it } from "vitest";
import { DEFAULT_SEED } from "../../../src/app/seed";
import { matchFor, standingsOf, update, type GameState } from "../../../src/app/state";
import { standings } from "../../../src/domain/standings";
import { homeOf } from "../S-010/save-world";
import { oraclePosition, oracleRows, playSeason } from "./inbox-oracle";
import { SEED_20260, SEED_20260_CLUB, SEED_20260_FIRST, SEED_31, SEED_31_CLUB, SEED_31_REPORTS, SEED_31_TIES, type ReferenceReport } from "./inbox-reference";

/** Taps Play match, reads the match screen's view and the club's Pos in the table, taps Back; one reference-shaped record per matchday. */
const playAndRead = (start: GameState, clubId: string, matchdays: number): readonly ReferenceReport[] => {
  const seen: ReferenceReport[] = [];
  let state = start;
  for (let n = 1; n <= matchdays; n++) {
    state = update(state, { type: "PlayMatch" });
    const view = matchFor(state, clubId)!;
    seen.push({ matchday: view.matchday, home: { name: view.home.club.name, goals: view.result.homeGoals }, away: { name: view.away.club.name, goals: view.result.awayGoals }, position: standingsOf(state).find((row) => row.clubId === clubId)!.position });
    state = update(state, { type: "Back" });
  }
  return seen;
};

describe("@US-1 @US-2 S-011 the reference season is the season the game plays", () => {
  it("Given ?seed=31 and Netherwold Borough, when Sam plays 14 matches reading each match screen and the table, then the score lines and positions are the DISCUSS table (6th, 8th, 6th, 5th, 3rd, 3rd, 5th, 4th, 2nd, 4th, 4th, 4th, 3rd, 3rd) @regression @walking_skeleton @contract-shape:pure-function", () => {
    const start = homeOf(SEED_31, 0);
    expect(start.league.clubs[0]!.name).toBe(SEED_31_CLUB);
    expect(playAndRead(start, start.league.clubs[0]!.id, 14)).toEqual(SEED_31_REPORTS);
    expect(SEED_31_REPORTS.map(({ position }) => position)).toEqual([6, 8, 6, 5, 3, 3, 5, 4, 2, 4, 4, 4, 3, 3]);
  });
  it("Given the default seed 20260 (also ?seed=abc) and Oakhampton Rise Borough, when Sam plays one match, then it is Harrowgate Lane United 0–1 Oakhampton Rise Borough and the club is 3rd @regression @boundary @contract-shape:pure-function", () => {
    expect(DEFAULT_SEED).toBe(SEED_20260);
    const league = homeOf(SEED_20260, 0).league;
    const start = homeOf(SEED_20260, league.clubs.findIndex((club) => club.name === SEED_20260_CLUB));
    expect(playAndRead(start, (start.screen as { clubId: string }).clubId, 1)).toEqual([SEED_20260_FIRST]);
  });
  it.each(SEED_31_TIES)("Given the table after matchday $matchday, when Netherwold Borough and $rival are compared, then they are level on Pts, GD and goals for and the name order alone puts the club where the DISCUSS table says @regression @boundary @contract-shape:pure-function", ({ matchday, rival }) => {
    const { results, league } = playSeason(SEED_31);
    const rows = oracleRows(league.clubs.map((club) => club.name), results!, matchday);
    const [own, other] = [rows.find((row) => row.name === SEED_31_CLUB)!, rows.find((row) => row.name === rival)!];
    expect([other.points, other.goalDifference, other.goalsFor]).toEqual([own.points, own.goalDifference, own.goalsFor]);
    const rivalPosition = standings(league.clubs, results!.filter((entry) => entry.matchday <= matchday)).find((row) => row.name === rival)!.position;
    expect(rivalPosition < SEED_31_REPORTS[matchday - 1]!.position).toBe(rival < SEED_31_CLUB);
  });
});
describe("@US-2 S-011 the independent oracle agrees with the Table's own order, and the 390px seed is still the longest", () => {
  it("Given seeds 1 to 100 and a whole season each, when the oracle ranks every club after every matchday without calling standings, then it gives the position standings gives @regression @property @contract-shape:pure-function", () => {
    const disagreements: string[] = [];
    for (let seed = 1; seed <= 100; seed++) {
      const { league, results } = playSeason(seed);
      for (let matchday = 1; matchday <= 14; matchday++) {
        const rows = oracleRows(league.clubs.map((club) => club.name), results!, matchday);
        standings(league.clubs, results!.filter((entry) => entry.matchday <= matchday)).forEach(({ clubId, position }) => {
          if (oraclePosition(rows, league.clubs.findIndex((club) => club.id === clubId)) !== position) disagreements.push(`seed ${seed} matchday ${matchday} ${clubId}`);
        });
      }
    }
    expect(disagreements.slice(0, 5)).toEqual([]);
  });
  it("Given seed 585 and the fourth club, when its 14 score lines are written, then it is Oakhampton Rise Wanderers, the longest line is 55 characters and the 14 lines hold 656 name characters (a sweep of seeds 1 to 1500 x 8 clubs found no club with more) @regression @boundary @contract-shape:pure-function", () => {
    const { league, results } = playSeason(585, 3);
    expect(league.clubs[3]!.name).toBe("Oakhampton Rise Wanderers");
    const own = results!.filter((entry) => entry.home === 3 || entry.away === 3);
    const lines = own.map(({ home, away, result }) => `${league.clubs[home]!.name} ${result.homeGoals}–${result.awayGoals} ${league.clubs[away]!.name}`);
    expect([lines.length, Math.max(...lines.map((line) => line.length))]).toEqual([14, 55]);
    expect(lines).toContain("Stoneleigh Moor Wanderers 1–4 Oakhampton Rise Wanderers");
    expect(own.reduce((total, { home, away }) => total + league.clubs[home]!.name.length + league.clubs[away]!.name.length, 0)).toBe(656);
  });
});
