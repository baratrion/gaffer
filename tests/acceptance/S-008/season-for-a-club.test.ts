// @US-2 (S-008 play the season, matchday by matchday) @walking_skeleton
// CONTRACT_SHAPE: bounded-change
// Outcome anchor: DISCUSS US-2 Elevator Pitch, D3, D4 and K2 (ADR-0014 Earned Trust 2a). Sam plays a whole season through `update` and
// reads it through `matchFor` and `standingsOf`: the reference season is the golden (seed 31 Netherwold Borough's 14 score lines and
// final table with the goals-scored tie, seed 20260 Oakhampton Rise Borough's season), every rival is met twice (named first once, named
// second once), and after the N-th match every row reads P N with the row rules, the totals, the order and Sam's row equal to the sum of
// the score lines he saw. K2 measurement: the schedule layer is exhaustive and seed-independent (season-schedule.test.ts, committed);
// here only the season and table layer is sampled, by fast-check (numRuns 100, fresh FC_SEED), whole seasons through `update`. The
// expected data is season-reference.ts (plain data from the plan run, never computed from the code under test).
// Destination: tests/acceptance/S-008/season-for-a-club.test.ts (DELIVER, same commit as src/app/state.ts).
import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { parseSeed } from "../../../src/app/seed";
import { initialState, matchFor, standingsOf, update, type Action, type GameState, type MatchView } from "../../../src/app/state";
import { FORMATIONS } from "../../../src/domain/formation";
import { generateLeague, type League } from "../../../src/domain/league";
import { fixtureOf } from "../../../src/domain/schedule";
import { REFERENCE_20260, REFERENCE_31, scoreLinesOf, type ReferenceSeason } from "./season-reference";

const play: Action = { type: "PlayMatch" };
const back: Action = { type: "Back" };
const anySeed = fc.integer({ min: -(2 ** 31), max: 2 ** 31 - 1 });
const onHome = (world: League, index: number): GameState => ({ ...initialState(world), screen: { kind: "clubHome", clubId: world.clubs[index]!.id } });
const scoreLine = (view: MatchView): string => `${view.home.club.name} ${view.result.homeGoals}–${view.result.awayGoals} ${view.away.club.name}`;

/** Sam plays `count` matches in a row; the state after each tap (on the match screen) and the match he saw are kept. */
const seasonOf = (start: GameState, count: number): readonly { readonly state: GameState; readonly view: MatchView }[] => {
  const seen: { state: GameState; view: MatchView }[] = [];
  let state = start;
  for (let k = 1; k <= count; k++) {
    state = update(state, play);
    seen.push({ state, view: matchFor(state, (state.screen as { readonly clubId: string }).clubId)! });
    state = update(state, back);
  }
  return seen;
};
/** The result log read back as the reference writes it: per matchday, the 4 score lines in fixture order. */
const logLines = (state: GameState): readonly (readonly string[])[] => {
  const names = state.league.clubs.map((club) => club.name);
  const log = state.results ?? [];
  return Array.from({ length: log.length / 4 }, (_, i) =>
    log.slice(4 * i, 4 * i + 4).map(({ home, away, result }) => `${names[home]} ${result.homeGoals}–${result.awayGoals} ${names[away]}`),
  );
};

describe.each([
  { reference: REFERENCE_31, search: "?seed=31", club: 0, name: "Netherwold Borough" },
  { reference: REFERENCE_20260, search: "?seed=abc", club: 7, name: "Oakhampton Rise Borough" },
] as readonly { readonly reference: ReferenceSeason; readonly search: string; readonly club: number; readonly name: string }[])("@US-2 S-008 $name plays the reference season at $search", ({ reference, search, club, name }) => {
  const world = generateLeague(parseSeed(search));
  const season = seasonOf(onHome(world, club), 14);
  const last = season.at(-1)!.state;

  it("Given untouched tactics, when Sam plays the 14 matches, then the screens read the 14 score lines of the reference season, in order, with the matchdays 1 to 14 @walking_skeleton @driving_port @contract-shape:pure-function", () => {
    expect(season.map(({ view }) => view.matchday)).toEqual(Array.from({ length: 14 }, (_, i) => i + 1));
    expect(season.map(({ view }) => scoreLine(view))).toEqual(scoreLinesOf(reference, name));
  });

  it("Given the 14 matches, when the whole log is read, then every matchday holds the four score lines of the reference season in fixture order (the three other fixtures are simulated with automatic 4-4-2) @boundary @contract-shape:pure-function", () => {
    expect(logLines(last)).toEqual(reference.matchdays);
  });

  it("Given the 14 matches, when the table is read, then it is the reference final table: every row at P 14, the ties broken as in the reference @walking_skeleton @driving_port @contract-shape:pure-function", () => {
    const rows = standingsOf(last);
    expect(rows.map(({ name: clubName, played, won, drawn, lost, goalsFor, goalsAgainst, goalDifference, points }) => ({ name: clubName, played, won, drawn, lost, goalsFor, goalsAgainst, goalDifference, points }))).toEqual(reference.table);
    expect(rows.map((r) => r.position)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  });

  it("Given the 14 matches, when Sam's row is read, then it is the sum of his 14 score lines @boundary @contract-shape:pure-function", () => {
    const mine = standingsOf(last).find((row) => row.name === name)!;
    const goals = season.map(({ view }) => (view.home.club.name === name ? [view.result.homeGoals, view.result.awayGoals] : [view.result.awayGoals, view.result.homeGoals]) as [number, number]);
    const sum = (pick: (g: [number, number]) => number) => goals.reduce((total, g) => total + pick(g), 0);
    expect([mine.won, mine.drawn, mine.lost]).toEqual([sum(([f, a]) => (f > a ? 1 : 0)), sum(([f, a]) => (f === a ? 1 : 0)), sum(([f, a]) => (f < a ? 1 : 0))]);
    expect([mine.goalsFor, mine.goalsAgainst, mine.goalDifference]).toEqual([sum(([f]) => f), sum(([, a]) => a), sum(([f, a]) => f - a)]);
    expect(mine.points).toBe(3 * mine.won + mine.drawn);
  });
});

describe("@US-2 S-008 the season for a club is the same whoever is managed and wherever it is read", () => {
  it("Given untouched tactics and seed 31 or 20260, when each of the 8 clubs plays the 14 matches in turn, then the result log is the same whichever club is managed and equals the reference season @property @boundary @contract-shape:bounded-change", () => {
    for (const reference of [REFERENCE_31, REFERENCE_20260]) {
      const world = generateLeague(reference.seed);
      for (let club = 0; club < 8; club++) {
        const final = seasonOf(onHome(world, club), 14).at(-1)!.state;
        expect(logLines(final), `${world.clubs[club]!.name} managed at seed ${reference.seed}`).toEqual(reference.matchdays);
      }
    }
  });

  it("Given seed 31 and Netherwold Borough, when Sam has played three matches, then the table agrees with the three score lines he saw: W 1 D 0 L 2, GD -1, Pts 3, sixth @example @boundary @contract-shape:pure-function", () => {
    const row = standingsOf(seasonOf(onHome(generateLeague(31), 0), 3).at(-1)!.state).find((r) => r.name === "Netherwold Borough")!;
    expect([row.position, row.played, row.won, row.drawn, row.lost, row.goalDifference, row.points]).toEqual([6, 3, 1, 0, 2, -1, 3]);
  });

  it("Given the same seed and club in two fresh games, when Sam plays the whole season in both, then every screen and the final table are identical; ?seed=abc and no seed play the same season @boundary @contract-shape:pure-function", () => {
    const read = (search: string, club: number) => seasonOf(onHome(generateLeague(parseSeed(search)), club), 14).map(({ state, view }) => [scoreLine(view), view.result.goals, standingsOf(state)]);
    expect(read("?seed=31", 0)).toEqual(read("?seed=31", 0));
    expect(read("?seed=abc", 7)).toEqual(read("", 7));
  });
});

describe("@US-2 S-008 over the season Sam meets every rival twice, named first once and named second once (K2, season layer through the app)", () => {
  it("Given any seed and any of the 8 clubs, when Sam plays the 14 matches, then the other club of the screens is each other club once in matches 1 to 7 and once again in 8 to 14, and Sam's club is named first against each exactly once and second exactly once @property @driving_port @contract-shape:pure-function", () => {
    fc.assert(
      fc.property(anySeed, fc.integer({ min: 0, max: 7 }), (seed, club) => {
        const world = generateLeague(seed);
        const mine = world.clubs[club]!;
        const season = seasonOf(onHome(world, club), 14).map(({ view }) => view);
        const rivals = world.clubs.filter((c) => c.id !== mine.id).map((c) => c.name).sort();
        const otherOf = (view: MatchView) => (view.home.club.id === mine.id ? view.away : view.home).club.name;
        expect(season.slice(0, 7).map(otherOf).sort()).toEqual(rivals);
        expect(season.slice(7).map(otherOf).sort()).toEqual(rivals);
        for (const rival of rivals) {
          const named = season.filter((view) => otherOf(view) === rival).map((view) => (view.home.club.id === mine.id ? "first" : "second")).sort();
          expect(named, `${mine.name} against ${rival}`).toEqual(["first", "second"]);
        }
        season.forEach((view, i) => {
          const { fixture } = fixtureOf(i + 1, club);
          expect([view.home.club.id, view.away.club.id]).toEqual([world.clubs[fixture.home]!.id, world.clubs[fixture.away]!.id]);
        });
      }),
    );
  });
});

describe("@US-2 S-008 after the N-th match the table is a league table that agrees with the season Sam played (K2, table layer)", () => {
  it("Given any seed, any of the 8 clubs and a formation chosen before the season, when Sam plays the matches one by one, then after the N-th every row reads P N, W + D + L = P, Pts = 3 x W + D, total W = total L, total D is even, the GDs add up to 0, Pts never increases down the table and between equal Pts GD never increases, and Sam's row is the sum of his N score lines @property @driving_port @contract-shape:pure-function", () => {
    const formations = fc.constantFrom(...FORMATIONS);
    fc.assert(
      fc.property(fc.record({ seed: anySeed, club: fc.integer({ min: 0, max: 7 }), formation: formations, matches: fc.integer({ min: 1, max: 14 }) }), ({ seed, club, formation, matches }) => {
        const world = generateLeague(seed);
        const mine = world.clubs[club]!.name;
        const start = update(update(update(onHome(world, club), { type: "ViewTactics" }), { type: "ChooseFormation", formation }), back);
        const season = seasonOf(start, matches);
        const tally = { won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0 };
        season.forEach(({ state, view }, index) => {
          const [f, a] = view.home.club.name === mine ? [view.result.homeGoals, view.result.awayGoals] : [view.result.awayGoals, view.result.homeGoals];
          tally.won += f > a ? 1 : 0;
          tally.drawn += f === a ? 1 : 0;
          tally.lost += f < a ? 1 : 0;
          tally.goalsFor += f;
          tally.goalsAgainst += a;
          const rows = standingsOf(state);
          const total = (pick: (r: (typeof rows)[number]) => number) => rows.reduce((sum, r) => sum + pick(r), 0);
          expect(rows).toHaveLength(8);
          for (const row of rows) {
            expect(row.played, `${row.name} after ${index + 1}`).toBe(index + 1);
            expect(row.won + row.drawn + row.lost).toBe(row.played);
            expect(row.points).toBe(3 * row.won + row.drawn);
            expect(row.goalDifference).toBe(row.goalsFor - row.goalsAgainst);
          }
          expect(total((r) => r.won)).toBe(total((r) => r.lost));
          expect(total((r) => r.drawn) % 2).toBe(0);
          expect(total((r) => r.goalDifference)).toBe(0);
          expect(total((r) => r.goalsFor)).toBe(total((r) => r.goalsAgainst));
          for (let i = 1; i < rows.length; i++) {
            const [above, below] = [rows[i - 1]!, rows[i]!];
            expect(above.points).toBeGreaterThanOrEqual(below.points);
            if (above.points === below.points) expect(above.goalDifference).toBeGreaterThanOrEqual(below.goalDifference);
          }
          const own = rows.find((r) => r.name === mine)!;
          expect({ won: own.won, drawn: own.drawn, lost: own.lost, goalsFor: own.goalsFor, goalsAgainst: own.goalsAgainst }).toEqual(tally);
          expect(own.points).toBe(3 * tally.won + tally.drawn);
          expect(own.goalDifference).toBe(tally.goalsFor - tally.goalsAgainst);
        });
      }),
    );
  });
});
