// @US-1 @US-2 (S-011 read my club's news in the Inbox) held out until DELIVER step 3
// CONTRACT_SHAPE: pure-function
// The time-travel oracle (K2, K3): Sam plays any mix of Play match, formation changes and starting-XI picks, and after each Play match we read what the match screen shows
// (`matchFor`) and what the Table shows (`standingsOf`) RIGHT THEN. After every single tap the Inbox must equal those readings: every message is exactly what was on screen when
// it was played, and nothing Sam does with Tactics or the Starting XI rewrites one. It never filters the log, so a wrong `<=` cannot hide in both.
import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { inboxOf, matchFor, nextMatchday, standingsOf, update, type GameState } from "../../../src/app/state";
import { FORMATIONS } from "../../../src/domain/formation";
import type { MatchdayReport } from "../../../src/domain/inbox";
import { homeOf, withFormation, withPick } from "../S-010/save-world";
import { SEED_31, SEED_31_REPORTS } from "./inbox-reference";

type Step = { readonly kind: "play" } | { readonly kind: "formation"; readonly formation: string } | { readonly kind: "pick"; readonly slot: number };
const steps: fc.Arbitrary<Step> = fc.oneof(
  { weight: 3, arbitrary: fc.constant<Step>({ kind: "play" }) },
  { weight: 1, arbitrary: fc.constantFrom(...FORMATIONS).map<Step>((formation) => ({ kind: "formation", formation })) },
  { weight: 1, arbitrary: fc.integer({ min: 0, max: 10 }).map<Step>((slot) => ({ kind: "pick", slot })) },
);
const readNow = (state: GameState, clubId: string): MatchdayReport => {
  const view = matchFor(state, clubId)!;
  return { matchday: view.matchday, home: { name: view.home.club.name, goals: view.result.homeGoals }, away: { name: view.away.club.name, goals: view.result.awayGoals }, position: standingsOf(state).find((row) => row.clubId === clubId)!.position };
};
describe("@US-1 @US-2 S-011 every message is what was on screen when it was played", () => {
  it("Given any seed, club and mix of Play match, formation changes and picks, when the Inbox is read after every tap, then it equals the match screen and Table readings taken right after each Play match, newest first, and never changes between plays @property @kpi @contract-shape:pure-function", () => {
    fc.assert(fc.property(fc.integer({ min: 1, max: 5000 }), fc.integer({ min: 0, max: 7 }), fc.array(steps, { minLength: 1, maxLength: 30 }), (seed, clubIndex, plan) => {
      let state = homeOf(seed, clubIndex);
      const clubId = state.league.clubs[clubIndex]!.id;
      const seen: MatchdayReport[] = [];
      expect(inboxOf(state, clubId)).toEqual([]);
      for (const step of plan) {
        if (step.kind === "play") {
          if (nextMatchday(state) === undefined) continue;
          state = update(state, { type: "PlayMatch" });
          seen.unshift(readNow(state, clubId));
          state = update(state, { type: "Back" });
        } else state = step.kind === "formation" ? withFormation(state, step.formation) : withPick(state, clubIndex, step.slot);
        expect(inboxOf(state, clubId)).toEqual(seen);
      }
    }), { numRuns: 100 });
  });
  it("Given ?seed=31 and Netherwold Borough, when matches are played one by one and Sam then switches to 4-3-3 and picks another player, then after each tap the Inbox is the reference table so far (newest first) and the team change rewrites nothing @walking_skeleton @driving_port @contract-shape:pure-function", () => {
    let state = homeOf(SEED_31, 0);
    const clubId = state.league.clubs[0]!.id;
    for (let played = 1; played <= 14; played++) {
      state = update(update(state, { type: "PlayMatch" }), { type: "Back" });
      expect(inboxOf(state, clubId)).toEqual(SEED_31_REPORTS.slice(0, played).reverse());
    }
    expect(inboxOf(withPick(withFormation(state, "4-3-3"), 0, 1), clubId)).toEqual([...SEED_31_REPORTS].reverse());
  });
});
