import type { Action } from "../../app/state";
import type { StartingXI } from "../../domain/selection";
import type { Player, Position } from "../../domain/squad";
import { el } from "../dom";

export interface ChoosePlayerView {
  readonly squad: readonly Player[];
  readonly position: Position;
  readonly candidates: readonly number[];
  readonly xi: StartingXI;
}

interface Choice {
  readonly player: Player;
  readonly playerIndex: number;
  readonly isStarter: boolean;
}

const choiceItem = ({ player, playerIndex, isStarter }: Choice, dispatch: (action: Action) => void): HTMLElement => {
  const button = el(
    "button",
    { type: "button", class: "pick-button" },
    el("span", { class: "pick-name" }, player.name),
    " ",
    el("span", { class: "pick-overall" }, String(player.overall)),
    ...(isStarter ? [" ", el("span", { class: "pick-starting" }, "Starting")] : []),
  );
  button.addEventListener("click", () => dispatch({ type: "PickPlayer", playerIndex }));
  return el("li", {}, button);
};

export const renderChoosePlayer = (
  root: HTMLElement,
  { squad, position, candidates, xi }: ChoosePlayerView,
  dispatch: (action: Action) => void,
): void => {
  const back = el("button", { type: "button", class: "back-button" }, "Back");
  back.addEventListener("click", () => dispatch({ type: "Back" }));
  root.replaceChildren(
    el(
      "section",
      { class: "choose-player" },
      el("h1", { tabindex: "-1" }, `Choose ${position}`),
      el(
        "ul",
        { role: "list", "aria-label": "Players", class: "pick-list" },
        ...candidates.map((playerIndex) =>
          choiceItem({ player: squad[playerIndex] as Player, playerIndex, isStarter: xi.includes(playerIndex) }, dispatch),
        ),
      ),
      back,
    ),
  );
};
