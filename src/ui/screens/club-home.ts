import type { Action } from "../../app/state";
import type { Club } from "../../app/types";
import { el } from "../dom";
import { COLOUR_HEX } from "./club-colours";

export const renderClubHome = (
  root: HTMLElement,
  { club, seasonOver }: { readonly club: Club; readonly seasonOver: boolean },
  dispatch: (action: Action) => void,
): void => {
  const actionButton = (label: string, action: Action): HTMLElement => {
    const button = el("button", { type: "button", class: "primary" }, label);
    button.addEventListener("click", () => dispatch(action));
    return button;
  };
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
      el(
        "div",
        { class: "club-actions" },
        actionButton("Squad", { type: "ViewSquad" }),
        actionButton("Tactics", { type: "ViewTactics" }),
        actionButton("Starting XI", { type: "ViewStartingXI" }),
        seasonOver ? actionButton("End of season", { type: "ViewSeasonEnd" }) : actionButton("Play match", { type: "PlayMatch" }),
        actionButton("Table", { type: "ViewTable" }),
      ),
    ),
  );
};
