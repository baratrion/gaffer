import type { Action } from "../../app/state";
import { el } from "../dom";
import { matchdayTitle, scoreLine, type ScoreSide } from "../score-line";

export interface MatchGoalView {
  readonly minute: number;
  readonly scorer: string;
  readonly club: string;
}

export type MatchSideLine = ScoreSide;

export interface MatchScreenView {
  readonly matchday: number;
  readonly home: MatchSideLine;
  readonly away: MatchSideLine;
  readonly goals: readonly MatchGoalView[];
}

const goalItem = ({ minute, scorer, club }: MatchGoalView): HTMLElement =>
  el(
    "li",
    { class: "goal-item" },
    el("span", { class: "goal-minute" }, `${minute}'`),
    " ",
    el("span", { class: "goal-scorer" }, scorer),
    " ",
    el("span", { class: "goal-club" }, `(${club})`),
  );

export const renderMatch = (root: HTMLElement, view: MatchScreenView, dispatch: (action: Action) => void): void => {
  const back = el("button", { type: "button", class: "back-button" }, "Back");
  back.addEventListener("click", () => dispatch({ type: "Back" }));
  root.replaceChildren(
    el(
      "section",
      { class: "match" },
      el("h1", { tabindex: "-1" }, matchdayTitle(view.matchday)),
      scoreLine(view),
      el("p", { id: "goals-label", class: "goals-label" }, "Goals"),
      el("ul", { role: "list", "aria-labelledby": "goals-label", class: "goal-list" }, ...view.goals.map(goalItem)),
      back,
    ),
  );
};
