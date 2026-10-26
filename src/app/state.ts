import { DEFAULT_FORMATION, isFormationId, type FormationId } from "../domain/formation";
import type { Club, League } from "../domain/league";
import { playMatchday, type MatchResult, type MatchSide, type PlayedMatch } from "../domain/match";
import { automaticXI, isSlotIndex, pickForSlot, type StartingXI } from "../domain/selection";
import { generateSquad, PLAYERS_PER_SQUAD, type Player } from "../domain/squad";
import { MATCHDAYS } from "../domain/schedule";
import { topScorer, type TopScorer } from "../domain/season";
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
  | { readonly kind: "table"; readonly clubId: string }
  | { readonly kind: "seasonEnd"; readonly clubId: string };

export interface GameState {
  readonly league: League;
  readonly screen: Screen;
  readonly formation: FormationId;
  readonly xi?: StartingXI | undefined;
  /** The recorded results, four per matchday, appended on each Play match; absent until the first one (ADR-0012, ADR-0014). */
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
  | { readonly type: "ViewSeasonEnd" }
  | { readonly type: "Back" }
  | { readonly type: "Continue"; readonly game: GameState };

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
    case "choosePlayer":
      return sameClub(previous, next) && next.kind === "choosePlayer" && next.slot === previous.slot;
    case "player":
      return sameClub(previous, next) && next.kind === "player" && next.playerIndex === previous.playerIndex;
    default:
      return sameClub(previous, next);
  }
};

export const focusPlan = (previous: Screen | undefined, next: Screen, focusId: string | undefined): FocusPlan =>
  previous !== undefined && sameScreen(previous, next) && focusId !== undefined && focusId !== ""
    ? { kind: "element", id: focusId }
    : { kind: "heading" };

const toScreen = (state: GameState, screen: Screen): GameState => ({ ...state, screen });

/** NewGame is "New game" on the title and "Play again" on the End of season screen. */
const newGame = (state: GameState): GameState =>
  state.screen.kind === "title" || state.screen.kind === "seasonEnd"
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

const highestMatchday = (results: readonly PlayedMatch[] | undefined): number =>
  (results ?? []).reduce((highest, { matchday }) => Math.max(highest, matchday), 0);

/** The matchday the next Play match plays: the highest recorded plus one (1 when none); undefined once all 14 are recorded. */
export const nextMatchday = (state: GameState): number | undefined => {
  const next = highestMatchday(state.results) + 1;
  return next > MATCHDAYS ? undefined : next;
};

const playMatchAction = (state: GameState): GameState => {
  const { screen } = state;
  const matchday = nextMatchday(state);
  if (screen.kind !== "clubHome" || !isKnownClub(state.league, screen.clubId) || matchday === undefined) return state;
  const played = matchdayFor(state, screen.clubId, matchday);
  return { ...toScreen(state, { kind: "match", clubId: screen.clubId }), results: [...(state.results ?? []), ...played] };
};

const viewTable = (state: GameState): GameState =>
  state.screen.kind === "clubHome" && isKnownClub(state.league, state.screen.clubId)
    ? toScreen(state, { kind: "table", clubId: state.screen.clubId })
    : state;

const viewSeasonEnd = (state: GameState): GameState =>
  state.screen.kind === "clubHome" && isKnownClub(state.league, state.screen.clubId) && nextMatchday(state) === undefined
    ? toScreen(state, { kind: "seasonEnd", clubId: state.screen.clubId })
    : state;

const HOME_RETURNING_KINDS: ReadonlySet<Screen["kind"]> = new Set(["squad", "match", "tactics", "startingXI", "table", "seasonEnd"]);

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

/** The matchday a state with nothing recorded falls back to. */
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

const matchdayFor = (state: GameState, clubId: string, matchday: number): readonly PlayedMatch[] =>
  playMatchday({
    seed: state.league.seed,
    matchday,
    sides: state.league.clubs.map((club) => sideFor(state, club.id, clubId)),
  });

/** Plays matchday 1 for the whole league: the managed side with its current eleven, every other side an automatic 4-4-2. */
export const playOpeningMatchday = (state: GameState, clubId: string): readonly PlayedMatch[] | undefined =>
  isKnownClub(state.league, clubId) ? matchdayFor(state, clubId, OPENING_MATCHDAY) : undefined;

export const standingsOf = (state: GameState): readonly StandingRow[] => standings(state.league.clubs, state.results ?? []);

const sideViewOf = (state: GameState, clubIndex: number): MatchSideView => {
  const club = state.league.clubs[clubIndex]!;
  return { club, squad: squadOf(state.league, club.id)! };
};

/** The managed club's match of the latest recorded matchday (matchday 1, derived, when nothing is recorded); undefined for a club not in the league. */
export const matchFor = (state: GameState, clubId: string): MatchView | undefined => {
  const clubIndex = state.league.clubs.findIndex((club) => club.id === clubId);
  const results = clubIndex < 0 ? undefined : (state.results ?? playOpeningMatchday(state, clubId));
  const latest = highestMatchday(results);
  const entry = results?.find(({ home, away, matchday }) => matchday === latest && (home === clubIndex || away === clubIndex));
  return entry === undefined
    ? undefined
    : { matchday: entry.matchday, home: sideViewOf(state, entry.home), away: sideViewOf(state, entry.away), result: entry.result };
};

export interface SeasonSummary {
  readonly position: number;
  readonly topScorer: TopScorer | undefined;
}

/** The club's final position (its Pos in the table) and top scorer over the recorded results; undefined for a club not in the league. */
export const seasonSummaryOf = (state: GameState, clubId: string): SeasonSummary | undefined => {
  const clubIndex = state.league.clubs.findIndex((club) => club.id === clubId);
  const row = standingsOf(state).find((standing) => standing.clubId === clubId);
  const squad = squadOf(state.league, clubId);
  return row === undefined || squad === undefined
    ? undefined
    : { position: row.position, topScorer: topScorer(state.results ?? [], clubIndex, squad) };
};

const continueGame = (state: GameState, { game }: ActionOf<"Continue">): GameState =>
  state.screen.kind === "title" ? game : state;

type Handlers = { readonly [T in Action["type"]]: (state: GameState, action: ActionOf<T>) => GameState };

const HANDLERS: Handlers = {
  NewGame: newGame,
  ChooseClub: chooseClub,
  ViewSquad: viewSquad,
  ViewPlayer: viewPlayer,
  ViewTactics: viewTactics,
  ChooseFormation: chooseFormation,
  ViewStartingXI: viewStartingXI,
  ChooseSlot: chooseSlot,
  PickPlayer: pickPlayer,
  PlayMatch: playMatchAction,
  ViewTable: viewTable,
  ViewSeasonEnd: viewSeasonEnd,
  Back: back,
  Continue: continueGame,
};

export const update = (state: GameState, action: Action): GameState =>
  (HANDLERS[action.type] as (state: GameState, action: Action) => GameState)(state, action);
