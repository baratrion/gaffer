import type { Action } from "../../app/state";
import type { Club } from "../../app/types";
import { FORMATIONS, formationLines, isFormationId, type FormationId } from "../../domain/formation";
import { el } from "../dom";

export interface TacticsView {
  readonly club: Club;
  readonly formation: FormationId;
}

type Dispatch = (action: Action, focusId?: string) => void;

export const formationInputId = (formation: FormationId): string => `formation-${formation}`;

const formationOption = (formation: FormationId, chosen: FormationId, dispatch: Dispatch): HTMLElement => {
  const id = formationInputId(formation);
  const input = el("input", { type: "radio", name: "formation", id, value: formation });
  input.checked = formation === chosen;
  input.addEventListener("change", () => {
    if (isFormationId(input.value)) dispatch({ type: "ChooseFormation", formation: input.value }, id);
  });
  return el("label", { class: "formation-option", for: id }, input, el("span", { class: "dot", "aria-hidden": "true" }), formation);
};

const LINE_COLUMNS = 12;

/** One list item per slot in line-up order; each slot spans its share of a 12-column row, so a line fills a pitch row. */
const lineUpSlots = (formation: FormationId): readonly HTMLElement[] =>
  formationLines(formation).flatMap(({ position, count }) =>
    Array.from({ length: count }, () => el("li", { class: "slot", style: `grid-column: span ${LINE_COLUMNS / count}` }, position)),
  );

export const renderTactics = (root: HTMLElement, { formation }: TacticsView, dispatch: Dispatch): void => {
  const back = el("button", { type: "button", class: "back-button" }, "Back");
  back.addEventListener("click", () => dispatch({ type: "Back" }));
  root.replaceChildren(
    el(
      "section",
      { class: "tactics" },
      el("h1", { tabindex: "-1" }, "Tactics"),
      el("div", { role: "radiogroup", "aria-label": "Formation", class: "formation-group" }, ...FORMATIONS.map((option) => formationOption(option, formation, dispatch))),
      el("ul", { "aria-label": "Line-up", class: "lineup" }, ...lineUpSlots(formation)),
      back,
    ),
  );
};
