import type { Action } from "../../app/state";
import type { Club, League } from "../../domain/league";
import { el, replaceChildren } from "../dom";
import { COLOUR_HEX } from "./club-colours";

const swatch = ({ colours: [first, second] }: Club): HTMLElement =>
  el("span", {
    class: "swatch",
    "aria-hidden": "true",
    style: `--swatch-a: ${COLOUR_HEX[first]}; --swatch-b: ${COLOUR_HEX[second]}`,
  });

const clubItem = (club: Club, dispatch: (action: Action) => void): HTMLElement => {
  const button = el(
    "button",
    { type: "button", class: "club-button" },
    el("span", { class: "club-name" }, club.name),
    swatch(club),
  );
  button.addEventListener("click", () => dispatch({ type: "ChooseClub", clubId: club.id }));
  return el("li", {}, button);
};

export const renderPickClub = (root: HTMLElement, league: League, dispatch: (action: Action) => void): void => {
  replaceChildren(
    root,
    el(
      "section",
      { class: "pick-club" },
      el("h1", { tabindex: "-1" }, "Choose your club"),
      el("ul", { "aria-label": "Clubs", class: "club-list" }, ...league.clubs.map((club) => clubItem(club, dispatch))),
    ),
  );
};
