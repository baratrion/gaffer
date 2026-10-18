import "./ui/styles.css";
import { parseSeed } from "./app/seed";
import { focusPlan, initialState, update, type Action, type FocusPlan, type GameState } from "./app/state";
import { formationLines } from "./domain/formation";
import { generateLeague, type League } from "./domain/league";
import { generateSquad } from "./domain/squad";
import { renderClubHome } from "./ui/screens/club-home";
import { renderPickClub } from "./ui/screens/pick-club";
import { renderPlayer } from "./ui/screens/player";
import { renderSquad } from "./ui/screens/squad";
import { renderTactics } from "./ui/screens/tactics";
import { renderTitle } from "./ui/screens/title";

const findClub = (league: League, clubId: string) => {
  const clubIndex = league.clubs.findIndex((candidate) => candidate.id === clubId);
  const club = league.clubs[clubIndex];
  if (!club) throw new Error(`Unknown club in game state: ${clubId}`);
  return { club, clubIndex };
};

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
      renderClubHome(root, club, dispatch);
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
