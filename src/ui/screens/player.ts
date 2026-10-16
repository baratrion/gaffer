import type { Action } from "../../app/state";
import { ATTRIBUTE_LABELS, ATTRIBUTE_ORDER, type Player } from "../../domain/squad";
import { el } from "../dom";

const line = (label: string, value: string | number): HTMLElement =>
  el("p", { class: "player-line" }, `${label} ${value}`);

const attributeItem = (player: Player, name: (typeof ATTRIBUTE_ORDER)[number]): HTMLElement =>
  el("li", { class: "attribute-item" }, `${ATTRIBUTE_LABELS[name]} ${player.attributes[name]}`);

export const renderPlayer = (root: HTMLElement, player: Player, dispatch: (action: Action) => void): void => {
  const back = el("button", { type: "button", class: "back-button" }, "Back");
  back.addEventListener("click", () => dispatch({ type: "Back" }));
  root.replaceChildren(
    el(
      "section",
      { class: "player" },
      el("h1", { tabindex: "-1" }, player.name),
      line("Position", player.position),
      line("Age", player.age),
      line("Overall", player.overall),
      el(
        "ul",
        { "aria-label": "Attributes", role: "list", class: "attribute-list" },
        ...ATTRIBUTE_ORDER.map((name) => attributeItem(player, name)),
      ),
      line("Condition", `${player.condition}%`),
      back,
    ),
  );
};
