import { generateLeague, type League } from "../domain/league";
import { parseSeed } from "./seed";

export type Screen = { readonly kind: "title" } | { readonly kind: "pickClub" } | { readonly kind: "clubHome"; readonly clubId: string };

export type Action = { readonly type: "newGame" } | { readonly type: "pickClub"; readonly clubId: string };

export interface GameState {
  readonly league: League;
  readonly screen: Screen;
}

export const initialState = (search: string): GameState => ({
  league: generateLeague(parseSeed(search)),
  screen: { kind: "title" },
});

export const update = (state: GameState, action: Action): GameState => {
  switch (action.type) {
    case "newGame":
      return { ...state, screen: { kind: "pickClub" } };
    case "pickClub":
      return state.league.clubs.some((c) => c.id === action.clubId)
        ? { ...state, screen: { kind: "clubHome", clubId: action.clubId } }
        : state;
  }
};
