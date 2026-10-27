// S-011 @regression: the DISCUSS goldens (inbox-reference.ts) are recomputed from the existing domain code, and the independent oracle (inbox-oracle.ts)
// is proven equal to the Table's own order over seeds 1..300 x 8 clubs x 14 matchdays (K2 floor: seeds 1..100). Passes before and after DELIVER.
import { describe, expect, it } from "vitest";
import { matchFor, standingsOf } from "../../../src/app/state";
import { generateLeague } from "../../../src/domain/league";
import { standings } from "../../../src/domain/standings";
import { untouchedSeason } from "../S-009/season-oracle";
import { back, newGameOf, oraclePosition, oracleTable, play, scoreLineText, walk } from "./inbox-oracle";
import { CLUB_31, LONGEST_NAMES, ORDINALS, REFERENCE_INBOX_20260, REFERENCE_INBOX_31 } from "./inbox-reference";

describe("@US-1 @US-2 S-011 the reference Inbox of the DISCUSS is what the game plays", () => {
  it("Given Netherwold Borough at seed 31, when each matchday is played and the Table is read right after it, then score lines and positions equal the DISCUSS table @regression @driving_port @boundary @contract-shape:pure-function", () => {
    let state = newGameOf(generateLeague(31), 0);
    const clubId = state.league.clubs[0]!.id;
    expect(state.league.clubs[0]!.name).toBe(CLUB_31);
    for (const reference of REFERENCE_INBOX_31) {
      state = walk(state, [play]);
      const view = matchFor(state, clubId)!;
      expect(view.matchday).toBe(reference.matchday);
      expect(`${view.home.club.name} ${view.result.homeGoals}–${view.result.awayGoals} ${view.away.club.name}`).toBe(reference.scoreLine);
      const row = standingsOf(state).find((standing) => standing.clubId === clubId)!;
      expect(row.position, `after matchday ${reference.matchday}`).toBe(reference.position);
      expect(ORDINALS[row.position - 1]).toBe(reference.ordinal);
      state = walk(state, [back]);
    }
  });
  it("Given the seed-31 season, when the cumulative table is rebuilt by the independent oracle, then the positions equal the DISCUSS table, including the three name tie-breaks (matchdays 4, 5 and 7) @regression @boundary @contract-shape:pure-function", () => {
    const league = generateLeague(31);
    const season = untouchedSeason(31);
    for (const reference of REFERENCE_INBOX_31) expect(oraclePosition({ clubs: league.clubs, season }, reference.matchday, 0), `matchday ${reference.matchday}`).toBe(reference.position);
    const tie = (upTo: number, other: string, otherFirst: boolean): void => {
      const table = oracleTable(league.clubs, season, upTo);
      const ours = table.find((row) => row.club === 0)!;
      const theirs = table.find((row) => row.name === other)!;
      expect([ours.points, ours.goalDifference, ours.goalsFor], `level with ${other} after matchday ${upTo}`).toEqual([theirs.points, theirs.goalDifference, theirs.goalsFor]);
      expect(other < CLUB_31, "the name decides, A to Z").toBe(otherFirst);
      expect(table.indexOf(theirs)).toBe(table.indexOf(ours) + (otherFirst ? -1 : 1));
    };
    tie(4, "Juniper Hollow United", true);
    tie(5, "Juniper Hollow United", true);
    tie(7, "Rushmoor Heath Albion", false);
  });
  it("Given Oakhampton Rise Borough at the default seed 20260, when matchday 1 is played, then it reads Harrowgate Lane United 0–1 Oakhampton Rise Borough and 3rd @regression @boundary @contract-shape:pure-function", () => {
    const { club, clubIndex, report } = REFERENCE_INBOX_20260;
    const state = walk(newGameOf(generateLeague(20260), clubIndex), [play]);
    const season = untouchedSeason(20260);
    expect(state.league.clubs[clubIndex]!.name).toBe(club);
    expect(scoreLineText(state.league.clubs, season.find(({ matchday, home, away }) => matchday === 1 && (home === clubIndex || away === clubIndex))!)).toBe(report.scoreLine);
    expect(ORDINALS[standingsOf(state).find((standing) => standing.name === club)!.position - 1]).toBe(report.ordinal);
    expect(oraclePosition({ clubs: state.league.clubs, season }, 1, clubIndex)).toBe(report.position);
  });
});

describe("@US-1 @US-2 S-011 the independent oracle agrees with the Table's own order (K2 floor and beyond)", () => {
  it("Given seeds 1..300, 8 clubs and matchdays 1..14 with untouched tactics, when the oracle and standings rank every prefix, then every club's Pos is equal @regression @boundary @contract-shape:pure-function", () => {
    for (let seed = 1; seed <= 300; seed++) {
      const league = generateLeague(seed);
      const season = untouchedSeason(seed);
      for (let matchday = 1; matchday <= 14; matchday++) {
        const table = standings(league.clubs, season.filter((entry) => entry.matchday <= matchday));
        for (let club = 0; club < league.clubs.length; club++) {
          const own = table.find((row) => row.clubId === league.clubs[club]!.id)!.position;
          if (oraclePosition({ clubs: league.clubs, season }, matchday, club) !== own) expect.fail(`seed ${seed} matchday ${matchday} club ${club}`);
        }
      }
    }
  });
  it("Given seeds 1..300, when the widest score line of any club is measured, then 55 characters is the maximum and seed 180 club 1 reaches it (the 390px seed) @regression @boundary @contract-shape:pure-function", () => {
    let widest = 0;
    let reached = false;
    for (let seed = 1; seed <= 300; seed++) {
      const league = generateLeague(seed);
      for (const entry of untouchedSeason(seed)) {
        const length = scoreLineText(league.clubs, entry).length;
        widest = Math.max(widest, length);
        if (seed === LONGEST_NAMES.seed && length === widest && (entry.home === LONGEST_NAMES.clubIndex || entry.away === LONGEST_NAMES.clubIndex)) reached = reached || length === LONGEST_NAMES.widestLineLength;
      }
    }
    expect(widest).toBe(LONGEST_NAMES.widestLineLength);
    expect(reached).toBe(true);
  });
});
