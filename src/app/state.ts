import type { League } from "../domain/league";

export type Screen =
  | { readonly kind: "title" }
  | { readonly kind: "pickClub" }
  | { readonly kind: "clubHome"; readonly clubId: string }
  | { readonly kind: "squad"; readonly clubId: string };

export interface GameState {
  readonly league: League;
  readonly screen: Screen;
}

export type Action =
  | { readonly type: "NewGame" }
  | { readonly type: "ChooseClub"; readonly clubId: string }
  | { readonly type: "ViewSquad" }
  | { readonly type: "Back" };

const isKnownClub = (league: League, clubId: string): boolean =>
  league.clubs.some((club) => club.id === clubId);

export const update = (state: GameState, action: Action): GameState => {
  switch (action.type) {
    case "NewGame":
      return state.screen.kind === "title" ? { ...state, screen: { kind: "pickClub" } } : state;
    case "ChooseClub":
      return state.screen.kind === "pickClub" && isKnownClub(state.league, action.clubId)
        ? { ...state, screen: { kind: "clubHome", clubId: action.clubId } }
        : state;
    case "ViewSquad":
      return state.screen.kind === "clubHome" && isKnownClub(state.league, state.screen.clubId)
        ? { ...state, screen: { kind: "squad", clubId: state.screen.clubId } }
        : state;
    case "Back":
      return state.screen.kind === "squad" && isKnownClub(state.league, state.screen.clubId)
        ? { ...state, screen: { kind: "clubHome", clubId: state.screen.clubId } }
        : state;
  }
};
