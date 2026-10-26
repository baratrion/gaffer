// @US-1 @US-2 (S-010 save and continue my season)
// CONTRACT_SHAPE: pure-function
import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { decodeSave, encodeSave } from "../../../src/app/save";
import { currentXI, initialState, nextMatchday, seasonSummaryOf, squadOf, standingsOf, update, type Action, type GameState } from "../../../src/app/state";
import { FORMATIONS } from "../../../src/domain/formation";
import { generateLeague } from "../../../src/domain/league";
import { fixturesOf } from "../../../src/domain/schedule";
import { afterMatchdays, homeOf, NEW_GAME, PLAY_AND_BACK, walk, withFormation, withPick } from "./save-world";
import { SEED_31_SAVE_TEXT } from "./save-golden";
const roundTrip = (state: GameState): GameState | undefined => decodeSave(encodeSave(state));
describe("@US-1 S-010 a saved season comes back as it was", () => {
  it("Given Netherwold Borough at seed 31 after two matches, when the game is saved, then the stored text is the pinned golden and it decodes back to the club home of that state @walking_skeleton @driving_port @contract-shape:pure-function", () => {
    const played = afterMatchdays(homeOf(31, 0), 2);
    expect(encodeSave(played)).toBe(SEED_31_SAVE_TEXT);
    expect(decodeSave(SEED_31_SAVE_TEXT)).toEqual(played);
    expect(nextMatchday(decodeSave(SEED_31_SAVE_TEXT)!)).toBe(3);
  });
  it("Given every club of seeds 1 to 20 after each of 0 to 14 matches, when saved and restored, then the formation, results, table and next matchday are the same @property @boundary @contract-shape:pure-function", () => {
    for (let seed = 1; seed <= 20; seed++) {
      for (let club = 0; club < 8; club++) {
        let state = homeOf(seed, club);
        for (let matchdays = 0; matchdays <= 14; matchdays++, state = walk(state, PLAY_AND_BACK)) {
          const restored = roundTrip(state)!;
          expect(restored, `seed ${seed} club ${club} after ${matchdays}`).toEqual(state);
          expect(nextMatchday(restored)).toBe(nextMatchday(state));
          expect(standingsOf(restored)).toEqual(standingsOf(state));
        }
      }
    }
  });
  it("Given a finished season, when saved and restored, then the club home is the finished season and the End of season summary is the same @boundary @contract-shape:pure-function", () => {
    const over = afterMatchdays(homeOf(31, 4), 14);
    const restored = roundTrip(over)!;
    expect(nextMatchday(restored)).toBeUndefined();
    const clubId = generateLeague(31).clubs[4]!.id;
    expect(seasonSummaryOf(restored, clubId)).toEqual(seasonSummaryOf(over, clubId));
  });
  it("Given 4-3-3 and a player of his own pick, when saved and restored, then both are kept and the eleven reads the same, in the same order @boundary @contract-shape:pure-function", () => {
    const sheet = withPick(withFormation(homeOf(31, 0), "4-3-3"), 0, 7);
    expect(sheet.xi).toBeDefined();
    const restored = roundTrip(afterMatchdays(sheet, 2))!;
    expect(restored.formation).toBe("4-3-3");
    const squad = squadOf(restored.league, restored.screen.kind === "clubHome" ? restored.screen.clubId : "")!;
    expect(currentXI(restored, squad)).toEqual(currentXI(sheet, squadOf(sheet.league, "club-1")!));
  });
  it("Given a random mix of formations, picks and Play match taps with a save and restore at a random point, when the season goes on, then every state equals the uninterrupted season @property @driving_port @contract-shape:pure-function", () => {
    const op = fc.oneof(
      fc.constantFrom(...FORMATIONS).map((formation): ((s: GameState) => GameState) => (s) => withFormation(s, formation)),
      fc.integer({ min: 0, max: 10 }).map((slot): ((s: GameState) => GameState) => (s) => withPick(s, 0, slot)),
      fc.constant((s: GameState) => walk(s, PLAY_AND_BACK)),
    );
    fc.assert(
      fc.property(fc.array(op, { maxLength: 16 }), fc.nat(16), (ops, cut) => {
        const point = Math.min(cut, ops.length);
        const uninterrupted = ops.reduce((s, step) => step(s), homeOf(31, 0));
        const resumed = ops.slice(point).reduce((s, step) => step(s), roundTrip(ops.slice(0, point).reduce((s, step) => step(s), homeOf(31, 0)))!);
        expect(resumed).toEqual(uninterrupted);
      }),
      { numRuns: 100 },
    );
  });
  it("Given a saved season of seed 31 and a title that holds another league, when Continue is tapped, then the saved league and club come back, and Play again keeps the saved seed @boundary @contract-shape:bounded-change", () => {
    const saved = decodeSave(SEED_31_SAVE_TEXT)!;
    const title = initialState(generateLeague(20260));
    const continued = update(title, { type: "Continue", game: saved });
    expect(continued).toBe(saved);
    expect(continued.league.seed).toBe(31);
    expect(continued.league.clubs[0]!.name).toBe("Netherwold Borough");
    const finished = roundTrip(afterMatchdays(homeOf(31, 0), 14))!;
    const again = walk(finished, [{ type: "ViewSeasonEnd" }, NEW_GAME]);
    expect(again.league.seed).toBe(31);
    expect(again.screen).toEqual({ kind: "pickClub" });
  });
  it("Given any screen other than the title, when Continue is tapped, then nothing changes (the very same state) @error @contract-shape:pure-function", () => {
    const saved = decodeSave(SEED_31_SAVE_TEXT)!;
    const continuing: Action = { type: "Continue", game: saved };
    const states = [walk(homeOf(31, 0), [{ type: "ViewSquad" }]), walk(homeOf(31, 0), [{ type: "ViewTable" }]), homeOf(20260, 3), walk(initialState(saved.league), [NEW_GAME])];
    for (const state of states) expect(update(state, continuing)).toBe(state);
  });
  it("Given a constructed worst case of 56 results with 18 goals each, and the seed-31 season, when saved, then each text is under 64 KB and still restores @boundary @contract-shape:pure-function", () => {
    const base = homeOf(31, 0);
    const worst = Array.from({ length: 56 }, (_, i) => {
      const matchday = Math.floor(i / 4) + 1;
      const { home, away } = fixturesOf(matchday)[i % 4]!;
      const goals = Array.from({ length: 18 }, (_unused, g) => ({ minute: 1 + g * 5, side: g % 2 === 0 ? ("home" as const) : ("away" as const), playerIndex: 17 }));
      return { matchday, fixtureIndex: i % 4, home, away, result: { homeGoals: 9, awayGoals: 9, goals } };
    });
    const stuffed = { ...base, results: worst };
    expect(encodeSave(stuffed)!.length).toBeLessThan(65536);
    expect(roundTrip(stuffed)).toEqual(stuffed);
    expect(encodeSave(afterMatchdays(base, 14))!.length).toBeLessThan(65536);
  });
});
