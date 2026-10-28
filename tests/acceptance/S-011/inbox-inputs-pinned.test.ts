// @US-1 @US-2 (S-011 read my club's news in the Inbox) @regression
// CONTRACT_SHAPE: pure-function
// Outcome anchor: DISCUSS "User stories" table (hand-derived positions) and DESIGN "Verified, not assumed". The goldens in inbox-reference.ts are
// plain data from DISCUSS; this file recomputes them in Node with the EXISTING generator, match engine and standings (nothing from S-011 is
// imported), so the held-out specs pin the same figures independently of DELIVER, and the independent oracle is proven against standings first.
import { describe, expect, it } from "vitest";
import { generateLeague } from "../../../src/domain/league";
import { formatOrdinal, standings } from "../../../src/domain/standings";
import { NETHERWOLD_31, OAKHAMPTON_20260_FIRST } from "./inbox-reference";
import { leagueOf, MATCHDAYS, oraclePosition, ownEntry, scoreLineOf, untouchedSeason } from "./inbox-oracle";

const clubs31 = leagueOf(31);
const season31 = untouchedSeason(31);
const netherwold = clubs31.findIndex((club) => club.name === "Netherwold Borough");

describe("@US-1 @US-2 S-011 the DISCUSS goldens equal the existing generator and standings", () => {
  it("Given seed 31, when the club list is read, then Netherwold Borough is 1st in it @regression @boundary @contract-shape:pure-function", () => {
    expect(netherwold).toBe(0);
  });

  it("Given seed 31 untouched, when Netherwold Borough's 14 matches are read, then their score lines equal the DISCUSS table @regression @contract-shape:pure-function", () => {
    const lines = Array.from({ length: MATCHDAYS }, (_, i) => scoreLineOf(clubs31, ownEntry(season31, netherwold, i + 1)));
    expect(lines).toEqual(NETHERWOLD_31.map((message) => message.scoreLine));
  });

  it("Given seed 31 untouched, when the Table is built from matchdays 1..N, then Netherwold Borough's Pos after each N equals the DISCUSS table (6th, 8th, 6th, 5th, 3rd, 3rd, 5th, 4th, 2nd, 4th, 4th, 4th, 3rd, 3rd) @regression @contract-shape:pure-function", () => {
    const viaStandings = NETHERWOLD_31.map(({ matchday }) => standings(clubs31, season31.filter((entry) => entry.matchday <= matchday)).find((row) => row.name === "Netherwold Borough")!.position);
    expect(viaStandings).toEqual(NETHERWOLD_31.map((message) => message.position));
    expect(viaStandings.map(formatOrdinal)).toEqual(["6th", "8th", "6th", "5th", "3rd", "3rd", "5th", "4th", "2nd", "4th", "4th", "4th", "3rd", "3rd"]);
  });

  it("Given the independent oracle, when it ranks seed 31 after each matchday, then it equals the DISCUSS table without calling standings @regression @contract-shape:pure-function", () => {
    expect(NETHERWOLD_31.map(({ matchday }) => oraclePosition(clubs31, season31, { clubIndex: netherwold, upTo: matchday }))).toEqual(NETHERWOLD_31.map((message) => message.position));
  });

  it.each([
    [4, "Juniper Hollow United", -1],
    [5, "Juniper Hollow United", -1],
    [7, "Rushmoor Heath Albion", 1],
  ])("Given matchday %i, when the rows level with Netherwold Borough are read, then %s is level on Pts, GD and goals and sits %i places from it, ordered by name (the name tie-break) @regression @boundary @contract-shape:pure-function", (matchday, rival, offset) => {
    const rows = standings(clubs31, season31.filter((entry) => entry.matchday <= matchday));
    const own = rows.find((row) => row.name === "Netherwold Borough")!;
    const other = rows.find((row) => row.name === rival)!;
    expect([other.points, other.goalDifference, other.goalsFor]).toEqual([own.points, own.goalDifference, own.goalsFor]);
    expect(other.position).toBe(own.position + offset);
  });

  it("Given the default seed 20260, when Oakhampton Rise Borough has played one match, then it is the golden score line and 3rd, behind Juniper Hollow Rovers and Ironbridge Fen Wanderers (the name tie-break does not apply) @regression @boundary @contract-shape:pure-function", () => {
    const clubs = leagueOf(20260);
    const season = untouchedSeason(20260);
    const index = clubs.findIndex((club) => club.name === "Oakhampton Rise Borough");
    expect(scoreLineOf(clubs, ownEntry(season, index, 1))).toBe(OAKHAMPTON_20260_FIRST.scoreLine);
    const rows = standings(clubs, season.filter((entry) => entry.matchday <= 1));
    expect(rows.find((row) => row.name === "Oakhampton Rise Borough")!.position).toBe(OAKHAMPTON_20260_FIRST.position);
    expect(rows.slice(0, 2).map((row) => row.name)).toEqual(["Juniper Hollow Rovers", "Ironbridge Fen Wanderers"]);
    expect(generateLeague(20260).clubs.map((club) => club.name)).toContain("Oakhampton Rise Borough");
  });
});

describe("@US-2 S-011 the independent oracle agrees with the Table over the K2 floor", () => {
  it("Given seeds 1..100 x 8 clubs x matchdays 1..14 untouched, when the oracle and standings over the prefix rank each club, then they never differ @regression @boundary @property @contract-shape:pure-function", () => {
    const differences: string[] = [];
    for (let seed = 1; seed <= 100; seed++) {
      const clubs = leagueOf(seed);
      const season = untouchedSeason(seed);
      for (let matchday = 1; matchday <= MATCHDAYS; matchday++) {
        const table = standings(clubs, season.filter((entry) => entry.matchday <= matchday));
        clubs.forEach((club, index) => {
          if (table.find((row) => row.clubId === club.id)!.position !== oraclePosition(clubs, season, { clubIndex: index, upTo: matchday })) differences.push(`${seed}/${club.name}/${matchday}`);
        });
      }
    }
    expect(differences).toEqual([]);
  });
});
