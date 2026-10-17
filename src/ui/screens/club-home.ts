import type { Action } from "../../app/state";
import type { Club } from "../../app/types";
import { el } from "../dom";
import { COLOUR_HEX } from "./club-colours";

export const renderClubHome = (root: HTMLElement, club: Club, dispatch: (action: Action) => void): void => {
  const squadButton = el("button", { type: "button", class: "primary" }, "Squad");
  squadButton.addEventListener("click", () => dispatch({ type: "ViewSquad" }));
  const tacticsButton = el("button", { type: "button", class: "primary" }, "Tactics");
  tacticsButton.addEventListener("click", () => dispatch({ type: "ViewTactics" }));
  const [first, second] = club.colours;
  root.replaceChildren(
    el(
      "section",
      { class: "club-home" },
      el("span", {
        class: "swatch swatch-large",
        "aria-hidden": "true",
        style: `--swatch-a: ${COLOUR_HEX[first]}; --swatch-b: ${COLOUR_HEX[second]}`,
      }),
      el("h1", { tabindex: "-1" }, club.name),
      squadButton,
      tacticsButton,
    ),
  );
};
