// @US-1 (S-009 see how my season ended) held out until DELIVER
// CONTRACT_SHAPE: pure-function
// Outcome anchor: DISCUSS Elevator Pitch US-1 and D2, D5: after 14 matchdays "Final position 3rd" and "Top scorer Garrick Thistlewood (5 goals)"
// (?seed=31, Netherwold Borough, a 5-5 tie broken by Squad order); "2nd" and "Joren Northcott (8 goals)" (?seed=abc = 20260); "8th" and "Orrin
// Yarrow (1 goal)" (?seed=13); "8th" and "Bram Fairbourne (3 goals)" (?seed=1). seasonSummaryOf (ADR-0015 decision 4, brief port 33) is held to the
// goldens of season-end-reference.ts (recomputed from the existing domain by the committed season-end-inputs-pinned.test.ts), to the table
// (Pos), and to an independent oracle that sums the club's goals from every matchday's recorded entry and never calls topScorer: K2 over seeds 1..300
// x 8 clubs, and through the match screens (matchFor after each of the 14 taps) for the four goldens x 8 clubs. Tactics or Starting XI changes
// after matchday 14 leave it unchanged; the same seed gives the same summary and ?seed=abc equals no seed; "Top scorer none" on a goalless log.
// Destination: tests/acceptance/S-009/season-summary.test.ts (DELIVER: git mv, dropping .pending, in the commit that adds seasonSummaryOf).
import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { parseSeed } from "../../../src/app/seed";
import { initialState, matchFor, nextMatchday, seasonSummaryOf, squadOf, standingsOf, update, type Action, type GameState } from "../../../src/app/state";
import { FORMATIONS } from "../../../src/domain/formation";
import { generateLeague } from "../../../src/domain/league";
import { formatTopScorer } from "../../../src/domain/season";
import { formatOrdinal } from "../../../src/domain/standings";
import { REFERENCE_ENDS, SWEEP_FIGURES } from "./season-end-reference";
import { CLUBS, oracleOrdinal, oracleTopScorer, oracleTopScorerLine, untouchedSeason, type GoalItem } from "./season-oracle";

const play: Action = { type: "PlayMatch" };
const back: Action = { type: "Back" };
const walk = (start: GameState, steps: readonly Action[]): GameState => steps.reduce(update, start);
const seasonOf = (seed: number, clubIndex: number): GameState => {
  const world = generateLeague(seed);
  const home = walk(initialState(world), [{ type: "NewGame" }, { type: "ChooseClub", clubId: world.clubs[clubIndex]!.id }]);
  return walk(home, Array.from({ length: 14 }, () => [play, back]).flat());
};
/** A finished season built from the recorded log directly (what 28 taps record with untouched tactics), cheap enough for 300 seeds. */
const recordedSeason = (seed: number): GameState => ({ ...initialState(generateLeague(seed)), screen: { kind: "clubHome", clubId: "club-1" }, results: untouchedSeason(seed) });
/** The same finished season viewed as another club's (untouched tactics make the 56 results club-independent). */
const asClub = (state: GameState, clubIndex: number): GameState => ({ ...state, screen: { kind: "clubHome", clubId: state.league.clubs[clubIndex]!.id } });
/** Every item of the Goals lists of the recorded results, grouped by matchday entry as the match screens print them. */
const itemsOf = (state: GameState): readonly GoalItem[] =>
  (state.results ?? []).flatMap(({ matchday, home, away, result }) =>
    result.goals.map(({ side, playerIndex }) => {
      const club = state.league.clubs[side === "home" ? home : away]!;
      return { matchday, scorer: squadOf(state.league, club.id)![playerIndex]!.name, club: club.name };
    }),
  );
const linesOf = (state: GameState, clubId: string): readonly [string, string] => {
  const summary = seasonSummaryOf(state, clubId)!;
  return [`Final position ${formatOrdinal(summary.position)}`, `Top scorer ${formatTopScorer(summary.topScorer)}`];
};

describe.each(REFERENCE_ENDS.map((reference) => [reference] as const))("@US-1 S-009 the End of season verdict at seed $seed is the reference", (reference) => {
  const finished = seasonOf(reference.seed, reference.clubIndex);
  const clubId = finished.league.clubs[reference.clubIndex]!.id;

  it("Given a season of 14 matches by untouched tactics, when the summary is read, then the position and the top scorer are the reference ones and the two lines read exactly as Sam sees them @walking_skeleton @driving_port @boundary @contract-shape:pure-function", () => {
    expect(finished.league.clubs[reference.clubIndex]!.name).toBe(reference.club);
    const top = reference.scorers[0]!;
    expect(seasonSummaryOf(finished, clubId)).toEqual({ position: reference.position, topScorer: { playerIndex: top.row - 1, name: top.name, goals: top.goals } });
    expect(linesOf(finished, clubId)).toEqual([reference.positionLine, reference.topScorerLine]);
  });

  it("Given the same finished season, when the summary is read, then the position is the Pos of the club's row in the table @boundary @driving_port @contract-shape:pure-function", () => {
    const row = standingsOf(finished).find((candidate) => candidate.clubId === clubId)!;
    expect(row.position).toBe(reference.position);
    expect(seasonSummaryOf(finished, clubId)!.position).toBe(row.position);
  });

  it("Given each of the 8 clubs managed in turn, when its summary is read, then the position is its table Pos and the top scorer is the oracle's, counted from the Goals lists after each of the 14 taps (never one read at the end) @boundary @driving_port @contract-shape:pure-function", () => {
    for (let club = 0; club < CLUBS; club++) {
      const world = finished.league;
      let state = walk(initialState(world), [{ type: "NewGame" }, { type: "ChooseClub", clubId: world.clubs[club]!.id }]);
      const seen: GoalItem[] = [];
      for (let matchday = 1; matchday <= 14; matchday++) {
        state = update(state, play);
        const view = matchFor(state, world.clubs[club]!.id)!;
        expect(view.matchday).toBe(matchday);
        for (const { side, playerIndex } of view.result.goals) {
          const scoring = side === "home" ? view.home : view.away;
          seen.push({ matchday, scorer: scoring.squad[playerIndex]!.name, club: scoring.club.name });
        }
        state = update(state, back);
      }
      const summary = seasonSummaryOf(state, world.clubs[club]!.id)!;
      expect(summary.position).toBe(standingsOf(state).find((row) => row.clubId === world.clubs[club]!.id)!.position);
      expect(`Top scorer ${formatTopScorer(summary.topScorer)}`, world.clubs[club]!.name).toBe(oracleTopScorerLine(oracleTopScorer(seen, world.clubs[club]!.name, squadOf(world, world.clubs[club]!.id)!)));
    }
  });
});

describe("@US-1 S-009 the verdict agrees with the evidence for every season of seeds 1 to 300 (K2)", () => {
  it("Given seeds 1, 7, 99 and 300 played tap by tap, when the log is read, then it is the log the sweep below is built from (untouched tactics, club-independent) @boundary @driving_port @contract-shape:pure-function", () => {
    for (const seed of [1, 7, 99, 300]) {
      expect(seasonOf(seed, seed % CLUBS).results).toEqual(untouchedSeason(seed));
    }
  });

  it("Given 300 seeds and each of the 8 clubs (2400 seasons), when the summary is read, then position equals the table Pos and the top scorer equals the oracle's tally of the recorded Goals items, ties to the Squad order; 444 of them have a shared top count and none has no goal @boundary @driving_port @contract-shape:pure-function", () => {
    let [compared, shared, none] = [0, 0, 0];
    for (let seed = 1; seed <= 300; seed++) {
      const finished = recordedSeason(seed);
      expect(nextMatchday(finished)).toBeUndefined();
      const items = itemsOf(finished);
      for (let club = 0; club < CLUBS; club++) {
        const { id, name } = finished.league.clubs[club]!;
        const state = asClub(finished, club);
        const summary = seasonSummaryOf(state, id)!;
        const squad = squadOf(finished.league, id)!;
        const expected = oracleTopScorer(items, name, squad);
        expect(summary.position, `${seed} ${name} position`).toBe(standingsOf(state).find((row) => row.clubId === id)!.position);
        expect(oracleOrdinal(summary.position), `${seed} ${name} ordinal`).toBe(formatOrdinal(summary.position));
        expect(`Top scorer ${formatTopScorer(summary.topScorer)}`, `${seed} ${name} top scorer`).toBe(oracleTopScorerLine(expected));
        expect(summary.topScorer?.playerIndex, `${seed} ${name} tie rule`).toBe(expected?.squadIndex);
        compared++;
        if (expected === undefined) none++;
        else if (squad.filter((player) => items.filter((item) => item.club === name && item.scorer === player.name).length === expected.goals).length > 1) shared++;
      }
    }
    expect({ compared, shared, none }).toEqual({ compared: SWEEP_FIGURES.seasons, shared: SWEEP_FIGURES.sharedTop, none: SWEEP_FIGURES.noGoals });
  }, 60_000);
});

describe("@US-1 S-009 the verdict is derived from the recorded results and the seed only (D5)", () => {
  it("Given Netherwold Borough's finished season, when Sam changes Tactics to 4-3-3 and picks another player on the Starting XI, then the summary, the table and the log are exactly as before @boundary @driving_port @contract-shape:pure-function", () => {
    const finished = seasonOf(31, 0);
    const clubId = finished.league.clubs[0]!.id;
    const changed = walk(finished, [
      { type: "ViewTactics" }, { type: "ChooseFormation", formation: "4-3-3" }, back,
      { type: "ViewStartingXI" }, { type: "ChooseSlot", slot: 7 }, { type: "PickPlayer", playerIndex: 13 }, back,
    ]);
    expect(changed.formation).toBe("4-3-3");
    expect(changed.xi).toBeDefined();
    expect(seasonSummaryOf(changed, clubId)).toEqual(seasonSummaryOf(finished, clubId));
    expect(standingsOf(changed)).toEqual(standingsOf(finished));
    expect(changed.results).toBe(finished.results);
    expect(linesOf(changed, clubId)).toEqual(["Final position 3rd", "Top scorer Garrick Thistlewood (5 goals)"]);
  });

  it("Given any seed, club and formation, when Sam changes Tactics and the Starting XI after matchday 14, then the lines read the same @property @boundary @driving_port @contract-shape:pure-function", () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 300 }), fc.integer({ min: 0, max: CLUBS - 1 }), fc.constantFrom(...FORMATIONS), (seed, club, formation) => {
        const finished = seasonOf(seed, club);
        const clubId = finished.league.clubs[club]!.id;
        const changed = walk(finished, [{ type: "ViewTactics" }, { type: "ChooseFormation", formation }, back, { type: "ViewStartingXI" }, { type: "ChooseSlot", slot: seed % 11 }, back, back]);
        expect(linesOf(changed, clubId)).toEqual(linesOf(finished, clubId));
      }),
      { numRuns: 25 },
    );
  });

  it("Given the same seed, club and choices in two fresh games, when the summaries are read, then they are equal; ?seed=abc equals no seed in the address @boundary @contract-shape:pure-function", () => {
    expect(seasonSummaryOf(seasonOf(31, 0), "club-1")).toEqual(seasonSummaryOf(seasonOf(31, 0), "club-1"));
    expect(parseSeed("?seed=abc")).toBe(parseSeed(""));
    const [abc, bare] = [parseSeed("?seed=abc"), parseSeed("")].map((seed) => seasonOf(seed, 7));
    expect(seasonSummaryOf(abc!, "club-8")).toEqual(seasonSummaryOf(bare!, "club-8"));
    expect(linesOf(abc!, "club-8")).toEqual(["Final position 2nd", "Top scorer Joren Northcott (8 goals)"]);
  });
});

describe("@US-1 S-009 the summary is total and honest on any recorded log", () => {
  it("Given a club that is not in the league, when the summary is read, then there is none @error @boundary @contract-shape:pure-function", () => {
    expect(seasonSummaryOf(seasonOf(31, 0), "club-99")).toBeUndefined();
    expect(seasonSummaryOf(initialState(generateLeague(31)), "club-99")).toBeUndefined();
  });

  it("Given a finished season in which no goal was scored, when the summary is read, then every club's top scorer is none and the line reads exactly Top scorer none @error @boundary @contract-shape:pure-function", () => {
    const finished = seasonOf(31, 0);
    const goalless: GameState = { ...finished, results: finished.results!.map((entry) => ({ ...entry, result: { homeGoals: 0, awayGoals: 0, goals: [] } })) };
    for (const { id } of goalless.league.clubs) {
      const summary = seasonSummaryOf(goalless, id)!;
      expect(summary.topScorer).toBeUndefined();
      expect(`Top scorer ${formatTopScorer(summary.topScorer)}`).toBe("Top scorer none");
    }
    expect(seasonSummaryOf(goalless, "club-1")!.position).toBe(standingsOf(goalless).find((row) => row.clubId === "club-1")!.position);
  });

  it("Given a season not yet over (nothing, 3 or 13 matches), when the summary is read, then it counts only what is recorded: the position is the table Pos and the scorers are those of the recorded matches @boundary @contract-shape:pure-function", () => {
    const world = generateLeague(31);
    const home = walk(initialState(world), [{ type: "NewGame" }, { type: "ChooseClub", clubId: "club-1" }]);
    for (const matches of [0, 3, 13]) {
      const state = walk(home, Array.from({ length: matches }, () => [play, back]).flat());
      const summary = seasonSummaryOf(state, "club-1")!;
      expect(summary.position).toBe(standingsOf(state).find((row) => row.clubId === "club-1")!.position);
      const expected = oracleTopScorer(itemsOf(state), "Netherwold Borough", squadOf(world, "club-1")!);
      expect(`Top scorer ${formatTopScorer(summary.topScorer)}`).toBe(oracleTopScorerLine(expected));
    }
    expect(seasonSummaryOf(home, "club-1")).toEqual({ position: standingsOf(home).find((row) => row.clubId === "club-1")!.position, topScorer: undefined });
  });
});
