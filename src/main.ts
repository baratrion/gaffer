import "./ui/styles.css";
import { parseSeed } from "./app/seed";
import { initialState, update, type Action, type GameState } from "./app/state";
import { generateLeague, type League } from "./domain/league";
import { generateSquad } from "./domain/squad";
import { renderClubHome } from "./ui/screens/club-home";
import { renderPickClub } from "./ui/screens/pick-club";
import { renderPlayer } from "./ui/screens/player";
import { renderSquad } from "./ui/screens/squad";
import { renderTitle } from "./ui/screens/title";

const findClub = (league: League, clubId: string) => {
  const clubIndex = league.clubs.findIndex((candidate) => candidate.id === clubId);
  const club = league.clubs[clubIndex];
  if (!club) throw new Error(`Unknown club in game state: ${clubId}`);
  return { club, clubIndex };
};

const render = (root: HTMLElement, state: GameState, dispatch: (action: Action) => void): void => {
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
      break;
  }
  root.querySelector<HTMLElement>("h1")?.focus();
};

const root = document.querySelector<HTMLElement>("#app");
if (root) {
  let state: GameState = initialState(generateLeague(parseSeed(location.search)));
  const dispatch = (action: Action): void => {
    state = update(state, action);
    render(root, state, dispatch);
  };
  render(root, state, dispatch);
}
