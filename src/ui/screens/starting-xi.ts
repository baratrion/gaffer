import type { Action } from "../../app/state";
import type { StartingXI } from "../../domain/selection";
import type { Player } from "../../domain/squad";
import { el } from "../dom";

export interface StartingXIView {
  readonly squad: readonly Player[];
  readonly xi: StartingXI;
}

const slotItem = (player: Player, slot: number, dispatch: (action: Action) => void): HTMLElement => {
  const button = el(
    "button",
    { type: "button", class: "pick-button" },
    el("span", { class: "pick-code" }, player.position),
    " ",
    el("span", { class: "pick-name" }, player.name),
    " ",
    el("span", { class: "pick-overall" }, String(player.overall)),
  );
  button.addEventListener("click", () => dispatch({ type: "ChooseSlot", slot }));
  return el("li", {}, button);
};

export const renderStartingXI = (root: HTMLElement, { squad, xi }: StartingXIView, dispatch: (action: Action) => void): void => {
  const back = el("button", { type: "button", class: "back-button" }, "Back");
  back.addEventListener("click", () => dispatch({ type: "Back" }));
  root.replaceChildren(
    el(
      "section",
      { class: "starting-xi" },
      el("h1", { id: "starting-xi-heading", tabindex: "-1" }, "Starting XI"),
      el(
        "ul",
        { role: "list", "aria-labelledby": "starting-xi-heading", class: "pick-list" },
        ...xi.map((playerIndex, slot) => slotItem(squad[playerIndex] as Player, slot, dispatch)),
      ),
      back,
    ),
  );
};
