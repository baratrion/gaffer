import { initialState, update, type Action, type GameState } from "./app/state";
import "./ui/styles.css";
import { renderClubHome } from "./ui/screens/club-home";
import { renderPickClub } from "./ui/screens/pick-club";
import { renderTitle } from "./ui/screens/title";

const root = document.querySelector<HTMLElement>("#app");
if (root) {
  let state: GameState = initialState(location.search);
  const dispatch = (action: Action): void => {
    state = update(state, action);
    render(root);
  };
  const render = (target: HTMLElement): void => {
    const { screen, league } = state;
    if (screen.kind === "title") return renderTitle(target, () => dispatch({ type: "newGame" }));
    if (screen.kind === "pickClub") return renderPickClub(target, league, (clubId) => dispatch({ type: "pickClub", clubId }));
    const club = league.clubs.find((c) => c.id === screen.clubId);
    if (club) renderClubHome(target, club);
  };
  render(root);
}
