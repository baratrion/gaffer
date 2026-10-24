import { DEFAULT_FORMATION, isFormationId, type FormationId } from "../domain/formation";
import type { Club, League } from "../domain/league";
import { playMatchday, type MatchResult, type MatchSide, type PlayedMatch } from "../domain/match";
import { automaticXI, isSlotIndex, pickForSlot, type StartingXI } from "../domain/selection";
import { generateSquad, PLAYERS_PER_SQUAD, type Player } from "../domain/squad";
import { standings, type StandingRow } from "../domain/standings";

export type Screen =
  | { readonly kind: "title" }
  | { readonly kind: "pickClub" }
  | { readonly kind: "clubHome"; readonly clubId: string }
  | { readonly kind: "squad"; readonly clubId: string }
  | { readonly kind: "player"; readonly clubId: string; readonly playerIndex: number }
  | { readonly kind: "tactics"; readonly clubId: string }
  | { readonly kind: "startingXI"; readonly clubId: string }
  | { readonly kind: "choosePlayer"; readonly clubId: string; readonly slot: number }
  | { readonly kind: "match"; readonly clubId: string }
  | { readonly kind: "table"; readonly clubId: string };

export interface GameState {
  readonly league: League;
  readonly screen: Screen;
  readonly formation: FormationId;
  readonly xi?: StartingXI | undefined;
  /** The recorded matchday-1 results; absent until the first Play match (ADR-0012). */
  readonly results?: readonly PlayedMatch[] | undefined;
}

export type Action =
  | { readonly type: "NewGame" }
  | { readonly type: "ChooseClub"; readonly clubId: string }
  | { readonly type: "ViewSquad" }
  | { readonly type: "ViewPlayer"; readonly playerIndex: number }
  | { readonly type: "ViewTactics" }
  | { readonly type: "ChooseFormation"; readonly formation: string }
  | { readonly type: "ViewStartingXI" }
  | { readonly type: "ChooseSlot"; readonly slot: number }
  | { readonly type: "PickPlayer"; readonly playerIndex: number }
  | { readonly type: "PlayMatch" }
  | { readonly type: "ViewTable" }
  | { readonly type: "Back" };

type ActionOf<T extends Action["type"]> = Extract<Action, { readonly type: T }>;

const isKnownClub = (league: League, clubId: string): boolean =>
  league.clubs.some((club) => club.id === clubId);

const isSquadIndex = (index: number): boolean =>
  Number.isInteger(index) && index >= 0 && index < PLAYERS_PER_SQUAD;

/** The club's generated squad; undefined for a club not in the league. */
export const squadOf = (league: League, clubId: string): readonly Player[] | undefined => {
  const clubIndex = league.clubs.findIndex((club) => club.id === clubId);
  return clubIndex < 0 ? undefined : generateSquad(league.seed, clubIndex);
};

/** The stored XI, else the automatic XI of the current formation. */
export const currentXI = (state: GameState, squad: readonly Player[]): StartingXI =>
  state.xi ?? automaticXI(squad, state.formation);

const withoutPicks = (state: GameState): GameState => (state.xi === undefined ? state : { ...state, xi: undefined });

export const initialState = (league: League): GameState => ({
  league,
  screen: { kind: "title" },
  formation: DEFAULT_FORMATION,
});

export type FocusPlan = { readonly kind: "heading" } | { readonly kind: "element"; readonly id: string };

const sameClub = (previous: Screen & { readonly clubId: string }, next: Screen): boolean =>
  next.kind === previous.kind && "clubId" in next && next.clubId === previous.clubId;

const sameScreen = (previous: Screen, next: Screen): boolean => {
  switch (previous.kind) {
    case "title":
    case "pickClub":
      return next.kind === previous.kind;
    case "clubHome":
    case "match":
    case "tactics":
    case "squad":
    case "startingXI":
    case "table":
      return sameClub(previous, next);
    case "choosePlayer":
      return sameClub(previous, next) && next.kind === "choosePlayer" && next.slot === previous.slot;
    case "player":
      return sameClub(previous, next) && next.kind === "player" && next.playerIndex === previous.playerIndex;
  }
};

export const focusPlan = (previous: Screen | undefined, next: Screen, focusId: string | undefined): FocusPlan =>
  previous !== undefined && sameScreen(previous, next) && focusId !== undefined && focusId !== ""
    ? { kind: "element", id: focusId }
    : { kind: "heading" };

const toScreen = (state: GameState, screen: Screen): GameState => ({ ...state, screen });

const newGame = (state: GameState): GameState =>
  state.screen.kind === "title"
    ? { ...withoutPicks(toScreen(state, { kind: "pickClub" })), formation: DEFAULT_FORMATION, results: undefined }
    : state;

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

const viewTactics = (state: GameState): GameState =>
  state.screen.kind === "clubHome" && isKnownClub(state.league, state.screen.clubId)
    ? toScreen(state, { kind: "tactics", clubId: state.screen.clubId })
    : state;

const chooseFormation = (state: GameState, { formation }: ActionOf<"ChooseFormation">): GameState =>
  state.screen.kind === "tactics" &&
  isKnownClub(state.league, state.screen.clubId) &&
  isFormationId(formation) &&
  formation !== state.formation
    ? { ...withoutPicks(state), formation }
    : state;

const viewStartingXI = (state: GameState): GameState =>
  state.screen.kind === "clubHome" && isKnownClub(state.league, state.screen.clubId)
    ? toScreen(state, { kind: "startingXI", clubId: state.screen.clubId })
    : state;

const chooseSlot = (state: GameState, { slot }: ActionOf<"ChooseSlot">): GameState =>
  state.screen.kind === "startingXI" && isKnownClub(state.league, state.screen.clubId) && isSlotIndex(slot)
    ? toScreen(state, { kind: "choosePlayer", clubId: state.screen.clubId, slot })
    : state;

const pickPlayer = (state: GameState, { playerIndex }: ActionOf<"PickPlayer">): GameState => {
  const { screen } = state;
  if (screen.kind !== "choosePlayer" || !isSlotIndex(screen.slot)) return state;
  const squad = squadOf(state.league, screen.clubId);
  if (squad === undefined) return state;
  const base = currentXI(state, squad);
  const next = pickForSlot({ squad, formation: state.formation, xi: base }, screen.slot, playerIndex);
  if (next === undefined) return state;
  const backToXI = toScreen(state, { kind: "startingXI", clubId: screen.clubId });
  return next === base ? backToXI : { ...backToXI, xi: next };
};

const playMatchAction = (state: GameState): GameState => {
  const { screen } = state;
  if (screen.kind !== "clubHome" || !isKnownClub(state.league, screen.clubId)) return state;
  return { ...toScreen(state, { kind: "match", clubId: screen.clubId }), results: state.results ?? playOpeningMatchday(state, screen.clubId) };
};

const viewTable = (state: GameState): GameState =>
  state.screen.kind === "clubHome" && isKnownClub(state.league, state.screen.clubId)
    ? toScreen(state, { kind: "table", clubId: state.screen.clubId })
    : state;

const HOME_RETURNING_KINDS: ReadonlySet<Screen["kind"]> = new Set(["squad", "match", "tactics", "startingXI", "table"]);

const back = (state: GameState): GameState => {
  const { screen, league } = state;
  if (!("clubId" in screen) || !isKnownClub(league, screen.clubId)) return state;
  if (HOME_RETURNING_KINDS.has(screen.kind)) return toScreen(state, { kind: "clubHome", clubId: screen.clubId });
  if (screen.kind === "player" && isSquadIndex(screen.playerIndex)) {
    return toScreen(state, { kind: "squad", clubId: screen.clubId });
  }
  if (screen.kind === "choosePlayer" && isSlotIndex(screen.slot)) {
    return toScreen(state, { kind: "startingXI", clubId: screen.clubId });
  }
  return state;
};

/** Matchday of the one match played until the season story keeps a matchday in state. */
export const OPENING_MATCHDAY = 1;

export interface MatchSideView {
  readonly club: Club;
  readonly squad: readonly Player[];
}

export interface MatchView {
  readonly matchday: number;
  readonly home: MatchSideView;
  readonly away: MatchSideView;
  readonly result: MatchResult;
}

const sideFor = (state: GameState, clubId: string, managedId: string): MatchSide => {
  const squad = squadOf(state.league, clubId)!;
  return { squad, xi: clubId === managedId ? currentXI(state, squad) : automaticXI(squad, DEFAULT_FORMATION) };
};

/** Plays matchday 1 for the whole league: the managed side with its current eleven, every other side an automatic 4-4-2. */
export const playOpeningMatchday = (state: GameState, clubId: string): readonly PlayedMatch[] | undefined =>
  isKnownClub(state.league, clubId)
    ? playMatchday({
        seed: state.league.seed,
        matchday: OPENING_MATCHDAY,
        sides: state.league.clubs.map((club) => sideFor(state, club.id, clubId)),
      })
    : undefined;

export const standingsOf = (state: GameState): readonly StandingRow[] => standings(state.league.clubs, state.results ?? []);

const sideViewOf = (state: GameState, clubIndex: number): MatchSideView => {
  const club = state.league.clubs[clubIndex]!;
  return { club, squad: squadOf(state.league, club.id)! };
};

/** The managed club's matchday-1 match, read from the record (derived when nothing is recorded yet); undefined for a club not in the league. */
export const matchFor = (state: GameState, clubId: string): MatchView | undefined => {
  const clubIndex = state.league.clubs.findIndex((club) => club.id === clubId);
  const results = clubIndex < 0 ? undefined : (state.results ?? playOpeningMatchday(state, clubId));
  const entry = results?.find(({ home, away }) => home === clubIndex || away === clubIndex);
  return entry === undefined
    ? undefined
    : { matchday: entry.matchday, home: sideViewOf(state, entry.home), away: sideViewOf(state, entry.away), result: entry.result };
};

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
      return viewTactics(state);
    case "ChooseFormation":
      return chooseFormation(state, action);
    case "ViewStartingXI":
      return viewStartingXI(state);
    case "ChooseSlot":
      return chooseSlot(state, action);
    case "PickPlayer":
      return pickPlayer(state, action);
    case "PlayMatch":
      return playMatchAction(state);
    case "ViewTable":
      return viewTable(state);
    case "Back":
      return back(state);
  }
};
