import type { Action } from "../../app/state";
import { FORMATIONS, type FormationId, type FormationLine } from "../../domain/formation";
import { el } from "../dom";

export interface TacticsView {
  readonly formation: FormationId;
  readonly lines: readonly FormationLine[];
}

type DispatchWithFocus = (action: Action, focusId?: string) => void;

const GRID_COLUMNS = 12;

const formationRadioId = (formation: FormationId): string => `formation-${formation}`;

const formationOption = (option: FormationId, chosen: FormationId, dispatch: DispatchWithFocus): HTMLElement => {
  const radio = el("input", { type: "radio", name: "formation", id: formationRadioId(option), value: option, class: "formation-radio" });
  radio.checked = option === chosen;
  radio.addEventListener("change", () =>
    dispatch({ type: "ChooseFormation", formation: option }, formationRadioId(option)),
  );
  return el(
    "label",
    { class: "formation-option" },
    radio,
    el("span", { class: "formation-mark", "aria-hidden": "true" }),
    el("span", { class: "formation-frame", "aria-hidden": "true" }),
    option,
  );
};

const lineUpSlots = ({ position, count }: FormationLine): HTMLElement[] =>
  Array.from({ length: count }, () => el("li", { class: "lineup-slot", style: `--span: ${GRID_COLUMNS / count}` }, position));

export const renderTactics = (root: HTMLElement, { formation, lines }: TacticsView, dispatch: DispatchWithFocus): void => {
  const back = el("button", { type: "button", class: "back-button" }, "Back");
  back.addEventListener("click", () => dispatch({ type: "Back" }));
  root.replaceChildren(
    el(
      "section",
      { class: "tactics" },
      el("h1", { tabindex: "-1" }, "Tactics"),
      el("p", { id: "formation-heading", class: "section-label" }, "Formation"),
      el(
        "div",
        { role: "radiogroup", "aria-labelledby": "formation-heading", class: "formation-group" },
        ...FORMATIONS.map((option) => formationOption(option, formation, dispatch)),
      ),
      el("p", { id: "lineup-heading", class: "section-label" }, "Line-up"),
      el("ul", { role: "list", "aria-labelledby": "lineup-heading", class: "lineup" }, ...lines.flatMap(lineUpSlots)),
      back,
    ),
  );
};
