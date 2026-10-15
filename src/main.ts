import "./ui/styles.css";
import { parseSeed } from "./app/seed";
import { update, type Action, type GameState } from "./app/state";
import { generateLeague } from "./domain/league";
import { renderClubHome } from "./ui/screens/club-home";
import { renderPickClub } from "./ui/screens/pick-club";
import { renderTitle } from "./ui/screens/title";

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
      const club = league.clubs.find((candidate) => candidate.id === screen.clubId);
      if (club) renderClubHome(root, club);
      break;
    }
  }
  root.querySelector<HTMLElement>("h1")?.focus();
};

const root = document.querySelector<HTMLElement>("#app");
if (root) {
  let state: GameState = { league: generateLeague(parseSeed(location.search)), screen: { kind: "title" } };
  const dispatch = (action: Action): void => {
    state = update(state, action);
    render(root, state, dispatch);
  };
  render(root, state, dispatch);
}
