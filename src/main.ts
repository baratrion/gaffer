import "./ui/styles.css";
import { parseSeed } from "./app/seed";
import { currentXI, focusPlan, initialState, matchFor, nextMatchday, type MatchView, squadOf, standingsOf, update, type Action, type FocusPlan, type GameState } from "./app/state";
import { formationLines, lineUp } from "./domain/formation";
import { generateLeague, type League } from "./domain/league";
import { playersForPosition } from "./domain/selection";
import { generateSquad } from "./domain/squad";
import { renderChoosePlayer } from "./ui/screens/choose-player";
import { renderClubHome } from "./ui/screens/club-home";
import { renderMatch, type MatchScreenView } from "./ui/screens/match";
import { renderPickClub } from "./ui/screens/pick-club";
import { renderPlayer } from "./ui/screens/player";
import { renderSquad } from "./ui/screens/squad";
import { renderStartingXI } from "./ui/screens/starting-xi";
import { renderTable } from "./ui/screens/table";
import { renderTactics } from "./ui/screens/tactics";
import { renderTitle } from "./ui/screens/title";

const findClub = (league: League, clubId: string) => {
  const clubIndex = league.clubs.findIndex((candidate) => candidate.id === clubId);
  const club = league.clubs[clubIndex];
  if (!club) throw new Error(`Unknown club in game state: ${clubId}`);
  return { club, clubIndex };
};

const squadOrThrow = (league: League, clubId: string) => {
  const squad = squadOf(league, clubId);
  if (!squad) throw new Error(`Unknown club in game state: ${clubId}`);
  return squad;
};

const scorerName = (side: MatchView["home"], playerIndex: number): string => {
  const player = side.squad[playerIndex];
  if (!player) throw new Error(`Unknown player in game state: ${playerIndex}`);
  return player.name;
};

const matchScreenView = ({ matchday, home, away, result }: MatchView): MatchScreenView => ({
  matchday,
  home: { name: home.club.name, goals: result.homeGoals },
  away: { name: away.club.name, goals: result.awayGoals },
  goals: result.goals.map(({ minute, side, playerIndex }) => {
    const scoring = side === "home" ? home : away;
    return { minute, scorer: scorerName(scoring, playerIndex), club: scoring.club.name };
  }),
});

type Dispatch = (action: Action, focusId?: string) => void;

const render = (root: HTMLElement, state: GameState, dispatch: Dispatch): void => {
  const { screen, league } = state;
  switch (screen.kind) {
    case "title":
      renderTitle(root, dispatch);
      break;
    case "pickClub":
      renderPickClub(root, league, dispatch);
      break;
    case "clubHome": {
      const { club } = findClub(league, screen.clubId);
      renderClubHome(root, { club, seasonOver: nextMatchday(state) === undefined }, dispatch);
      break;
    }
    case "squad": {
      const { club, clubIndex } = findClub(league, screen.clubId);
      renderSquad(root, { club, squad: generateSquad(league.seed, clubIndex) }, dispatch);
      break;
    }
    case "player": {
      const { clubIndex } = findClub(league, screen.clubId);
      const player = generateSquad(league.seed, clubIndex)[screen.playerIndex];
      if (!player) throw new Error(`Unknown player in game state: ${screen.playerIndex}`);
      renderPlayer(root, player, dispatch);
      break;
    }
    case "tactics":
      renderTactics(root, { formation: state.formation, lines: formationLines(state.formation) }, dispatch);
      break;
    case "startingXI": {
      const squad = squadOrThrow(league, screen.clubId);
      renderStartingXI(root, { squad, xi: currentXI(state, squad) }, dispatch);
      break;
    }
    case "choosePlayer": {
      const squad = squadOrThrow(league, screen.clubId);
      const position = lineUp(state.formation)[screen.slot];
      if (!position) throw new Error(`Unknown slot in game state: ${screen.slot}`);
      const candidates = playersForPosition(squad, position);
      renderChoosePlayer(root, { squad, position, candidates, xi: currentXI(state, squad) }, dispatch);
      break;
    }
    case "match": {
      const match = matchFor(state, screen.clubId);
      if (!match) throw new Error(`Unknown club in game state: ${screen.clubId}`);
      renderMatch(root, matchScreenView(match), dispatch);
      break;
    }
    case "table":
      renderTable(root, { rows: standingsOf(state), managedClubId: screen.clubId }, dispatch);
      break;
    default: {
      const unhandled: never = screen;
      throw new Error(`Unhandled screen: ${JSON.stringify(unhandled)}`);
    }
  }
};

const applyFocus = (root: HTMLElement, plan: FocusPlan): void => {
  const target = plan.kind === "element" ? root.querySelector<HTMLElement>(`[id="${CSS.escape(plan.id)}"]`) : null;
  (target ?? root.querySelector<HTMLElement>("h1"))?.focus();
};

const root = document.querySelector<HTMLElement>("#app");
if (root) {
  let state: GameState = initialState(generateLeague(parseSeed(location.search)));
  const dispatch: Dispatch = (action, focusId) => {
    const previousScreen = state.screen;
    state = update(state, action);
    render(root, state, dispatch);
    applyFocus(root, focusPlan(previousScreen, state.screen, focusId));
  };
  render(root, state, dispatch);
  applyFocus(root, focusPlan(undefined, state.screen, undefined));
}
