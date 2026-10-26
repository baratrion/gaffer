// Not a test: states reached the way Sam reaches them (the actions that exist), shared by the S-010 specs. No save code is imported here.
import { initialState, update, type Action, type GameState } from "../../../src/app/state";
import { generateLeague } from "../../../src/domain/league";
import { automaticXI, playersForPosition } from "../../../src/domain/selection";
import { generateSquad } from "../../../src/domain/squad";
export const walk = (start: GameState, steps: readonly Action[]): GameState => steps.reduce(update, start);
export const NEW_GAME: Action = { type: "NewGame" };
export const PLAY_AND_BACK: readonly Action[] = [{ type: "PlayMatch" }, { type: "Back" }];
/** The club home of club `clubIndex` of the league of `seed`, nothing played, untouched tactics. */
export const homeOf = (seed: number, clubIndex: number): GameState => {
  const league = generateLeague(seed);
  return walk(initialState(league), [NEW_GAME, { type: "ChooseClub", clubId: league.clubs[clubIndex]!.id }]);
};
export const afterMatchdays = (state: GameState, matchdays: number): GameState =>
  walk(state, Array.from({ length: matchdays }, () => PLAY_AND_BACK).flat());
/** Taps Tactics, the formation, Back. */
export const withFormation = (state: GameState, formation: string): GameState =>
  walk(state, [{ type: "ViewTactics" }, { type: "ChooseFormation", formation }, { type: "Back" }]);
/** Taps Starting XI, slot `slot`, then the first player of that position who is not in the eleven, then Back (a real change of the XI). */
export const withPick = (state: GameState, clubIndex: number, slot: number): GameState => {
  const squad = generateSquad(state.league.seed, clubIndex);
  const xi = state.xi ?? automaticXI(squad, state.formation);
  const position = squad[xi[slot]!]!.position;
  const outsider = playersForPosition(squad, position).find((index) => !xi.includes(index))!;
  return walk(state, [{ type: "ViewStartingXI" }, { type: "ChooseSlot", slot }, { type: "PickPlayer", playerIndex: outsider }, { type: "Back" }]);
};
