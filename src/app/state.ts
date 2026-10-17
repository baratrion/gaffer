import type { FormationId } from "../domain/formation";
import type { League } from "../domain/league";
import { PLAYERS_PER_SQUAD } from "../domain/squad";

export type Screen =
  | { readonly kind: "title" }
  | { readonly kind: "pickClub" }
  | { readonly kind: "clubHome"; readonly clubId: string }
  | { readonly kind: "squad"; readonly clubId: string }
  | { readonly kind: "player"; readonly clubId: string; readonly playerIndex: number }
  | { readonly kind: "tactics"; readonly clubId: string };

export interface GameState {
  readonly league: League;
  readonly screen: Screen;
  readonly formation: FormationId;
}

export type Action =
  | { readonly type: "NewGame" }
  | { readonly type: "ChooseClub"; readonly clubId: string }
  | { readonly type: "ViewSquad" }
  | { readonly type: "ViewPlayer"; readonly playerIndex: number }
  | { readonly type: "ViewTactics" }
  | { readonly type: "ChooseFormation"; readonly formation: FormationId }
  | { readonly type: "Back" };

type ActionOf<T extends Action["type"]> = Extract<Action, { readonly type: T }>;

const isKnownClub = (league: League, clubId: string): boolean =>
  league.clubs.some((club) => club.id === clubId);

const isSquadIndex = (index: number): boolean =>
  Number.isInteger(index) && index >= 0 && index < PLAYERS_PER_SQUAD;

const toScreen = (state: GameState, screen: Screen): GameState => ({ ...state, screen });

const newGame = (state: GameState): GameState =>
  state.screen.kind === "title" ? toScreen(state, { kind: "pickClub" }) : state;

const chooseClub = (state: GameState, { clubId }: ActionOf<"ChooseClub">): GameState =>
  state.screen.kind === "pickClub" && isKnownClub(state.league, clubId)
    ? toScreen(state, { kind: "clubHome", clubId })
    : state;

const viewSquad = (state: GameState): GameState =>
  state.screen.kind === "clubHome" && isKnownClub(state.league, state.screen.clubId)
    ? toScreen(state, { kind: "squad", clubId: state.screen.clubId })
    : state;

const viewPlayer = (state: GameState, { playerIndex }: ActionOf<"ViewPlayer">): GameState =>
  state.screen.kind === "squad" && isKnownClub(state.league, state.screen.clubId) && isSquadIndex(playerIndex)
    ? toScreen(state, { kind: "player", clubId: state.screen.clubId, playerIndex })
    : state;

const back = (state: GameState): GameState => {
  const { screen, league } = state;
  if (!("clubId" in screen) || !isKnownClub(league, screen.clubId)) return state;
  if (screen.kind === "squad") return toScreen(state, { kind: "clubHome", clubId: screen.clubId });
  if (screen.kind === "player" && isSquadIndex(screen.playerIndex)) {
    return toScreen(state, { kind: "squad", clubId: screen.clubId });
  }
  return state;
};

// __SCAFFOLD__ (S-004 DISTILL): RED-ready stubs for the new actions and helpers; DELIVER implements them per ADR-0007/0008.
const scaffold = (name: string): never => {
  throw new Error(`__SCAFFOLD__ ${name} is not implemented yet (S-004 DELIVER)`);
};

export type FocusPlan = { readonly kind: "heading" } | { readonly kind: "element"; readonly id: string };

export const initialState = (_league: League): GameState => scaffold("initialState");

export const focusPlan = (_previous: Screen | undefined, _next: Screen, _focusId: string | undefined): FocusPlan =>
  scaffold("focusPlan");

export const update = (state: GameState, action: Action): GameState => {
  switch (action.type) {
    case "NewGame":
      return newGame(state);
    case "ChooseClub":
      return chooseClub(state, action);
    case "ViewSquad":
      return viewSquad(state);
    case "ViewPlayer":
      return viewPlayer(state, action);
    case "ViewTactics":
      return scaffold("update ViewTactics");
    case "ChooseFormation":
      return scaffold("update ChooseFormation");
    case "Back":
      return back(state);
  }
};
