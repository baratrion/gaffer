// @US-2 (S-008 play the season, matchday by matchday) @regression
// CONTRACT_SHAPE: pure-function
// Outcome anchor: DISCUSS US-2 Elevator Pitch and D3 (K2, schedule layer): over the 14 matchdays Sam's club meets each of the other 7 clubs
// exactly once in matchdays 1..7 and once again in 8..14, and is named first against each of them exactly once and named second exactly
// once. The pairing and the order come from the fixed double round-robin (ADR-0010) and are the same for every seed; only the club names
// vary. DESIGN (Earned Trust 2a): the schedule layer is ONE exhaustive, seed-independent check over 8 clubs x 14 matchdays; the loop over
// seeds 1..1000 is only a cheap guard that the mapping from club names to indices does not matter. The domain (fixtureOf) is unchanged by
// S-008, so this file passes before and after DELIVER; the same rule is then held through the app in the held-out season-for-a-club spec.
import { describe, expect, it } from "vitest";
import { CLUBS_PER_LEAGUE, generateLeague } from "../../../src/domain/league";
import { fixtureOf, MATCHDAYS } from "../../../src/domain/schedule";

interface Meeting {
  readonly matchday: number;
  readonly opponent: number;
  readonly named: "first" | "second";
}

/** The club's 14 meetings in matchday order, read through the one driving port that answers "who does this club play". */
const season = (club: number): readonly Meeting[] =>
  Array.from({ length: MATCHDAYS }, (_, i) => {
    const matchday = i + 1;
    const { fixture } = fixtureOf(matchday, club);
    return fixture.home === club ? { matchday, opponent: fixture.away, named: "first" } : { matchday, opponent: fixture.home, named: "second" };
  });
const clubs = Array.from({ length: CLUBS_PER_LEAGUE }, (_, i) => i);
const others = (club: number): readonly number[] => clubs.filter((c) => c !== club);
const sorted = (values: readonly number[]): readonly number[] => [...values].sort((a, b) => a - b);

describe("@US-2 S-008 over the 14 matchdays a club meets every other club twice, named first once and named second once", () => {
  it.each(clubs)("Given club %s, when its 14 meetings are listed, then matchdays 1 to 7 hold each of the 7 other clubs once and matchdays 8 to 14 hold each once more @walking_skeleton @driving_port @contract-shape:pure-function", (club) => {
    const meetings = season(club);
    expect(meetings).toHaveLength(14);
    expect(sorted(meetings.slice(0, 7).map((m) => m.opponent))).toEqual(others(club));
    expect(sorted(meetings.slice(7).map((m) => m.opponent))).toEqual(others(club));
  });

  it.each(clubs)("Given club %s, when its 14 meetings are listed, then it is named first against each other club exactly once and named second exactly once @boundary @contract-shape:pure-function", (club) => {
    const meetings = season(club);
    for (const rival of others(club)) {
      expect(meetings.filter((m) => m.opponent === rival).map((m) => m.named).sort(), `club ${club} against club ${rival}`).toEqual(["first", "second"]);
    }
    expect(meetings.filter((m) => m.named === "first")).toHaveLength(7);
    expect(meetings.filter((m) => m.named === "second")).toHaveLength(7);
  });

  it.each(clubs)("Given club %s, when matchday m is compared with matchday m + 7, then it meets the same club again with the naming swapped @boundary @contract-shape:pure-function", (club) => {
    const meetings = season(club);
    for (let m = 0; m < 7; m++) {
      expect(meetings[m + 7]!.opponent).toBe(meetings[m]!.opponent);
      expect(meetings[m + 7]!.named).toBe(meetings[m]!.named === "first" ? "second" : "first");
    }
  });

  it.each(clubs)("Given club %s, when its meetings are listed, then it never meets itself and the other club of every matchday also sees this club as its opponent @error @boundary @contract-shape:pure-function", (club) => {
    for (const { matchday, opponent } of season(club)) {
      expect(opponent).not.toBe(club);
      expect(season(opponent)[matchday - 1]!.opponent).toBe(club);
    }
  });

  it("Given any seed from 1 to 1000 and each of the 8 managed clubs, when the other clubs are read by name, then each rival name appears exactly once in matchdays 1 to 7 and once in 8 to 14, with the club named first once and second once (the names do not matter) @boundary @contract-shape:pure-function", () => {
    for (let seed = 1; seed <= 1000; seed++) {
      const names = generateLeague(seed).clubs.map((club) => club.name);
      expect(new Set(names).size, `seed ${seed} has 8 distinct names`).toBe(CLUBS_PER_LEAGUE);
      for (const club of clubs) {
        const meetings = season(club).map((m) => ({ ...m, rival: names[m.opponent]! }));
        const rivals = names.filter((_, index) => index !== club).sort();
        expect(meetings.slice(0, 7).map((m) => m.rival).sort(), `seed ${seed} club ${club}`).toEqual(rivals);
        expect(meetings.slice(7).map((m) => m.rival).sort(), `seed ${seed} club ${club}`).toEqual(rivals);
        for (const rival of rivals) {
          expect(meetings.filter((m) => m.rival === rival).map((m) => m.named).sort(), `seed ${seed} ${names[club]} against ${rival}`).toEqual(["first", "second"]);
        }
      }
    }
  });
});
