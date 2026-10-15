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
  | { readonly type: "OpenSquad" }
  | { readonly type: "Back" };

// S-002 RED scaffold (created by DISTILL). DELIVER implements OpenSquad/Back and removes the marker.
export const __SCAFFOLD__ = true;

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
    case "OpenSquad":
    case "Back":
      throw new Error("Not yet implemented -- RED scaffold");
  }
};
