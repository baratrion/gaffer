import type { Action } from "../../app/state";
import type { Club } from "../../app/types";
import type { Player } from "../../domain/squad";
import { el } from "../dom";

const playerRow = ({ name, position, age, overall }: Player): HTMLElement =>
  el(
    "li",
    { class: "player-row" },
    el("span", { class: "player-name" }, name),
    el("span", { class: "player-position" }, position),
    el("span", { class: "player-age" }, String(age)),
    el("span", { class: "player-overall" }, String(overall)),
  );

export interface SquadView {
  readonly club: Club;
  readonly squad: readonly Player[];
}

export const renderSquad = (root: HTMLElement, { club, squad }: SquadView, dispatch: (action: Action) => void): void => {
  const back = el("button", { type: "button", class: "back-button" }, "Back");
  back.addEventListener("click", () => dispatch({ type: "Back" }));
  root.replaceChildren(
    el(
      "section",
      { class: "squad" },
      el("h1", { tabindex: "-1" }, club.name),
      el("ul", { "aria-label": "Squad", class: "squad-list" }, ...squad.map(playerRow)),
      back,
    ),
  );
};
