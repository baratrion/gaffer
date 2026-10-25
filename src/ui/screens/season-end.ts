import type { Action, SeasonSummary } from "../../app/state";
import { formatTopScorer } from "../../domain/season";
import { formatOrdinal } from "../../domain/standings";
import { el } from "../dom";

type SeasonEndAction = Extract<Action, { readonly type: "NewGame" | "Back" }>;

const seasonLine = (label: string, value: string, valueClass: string): HTMLElement =>
  el("p", { class: "season-line" }, el("span", { class: "season-label" }, label), " ", el("span", { class: valueClass }, value));

export const renderSeasonEnd = (root: HTMLElement, { position, topScorer }: SeasonSummary, dispatch: (action: SeasonEndAction) => void): void => {
  const playAgain = el("button", { type: "button", class: "primary" }, "Play again");
  playAgain.addEventListener("click", () => dispatch({ type: "NewGame" }));
  const back = el("button", { type: "button", class: "back-button" }, "Back");
  back.addEventListener("click", () => dispatch({ type: "Back" }));
  root.replaceChildren(
    el(
      "section",
      { class: "season-end" },
      el("h1", { tabindex: "-1" }, "End of season"),
      seasonLine("Final position", formatOrdinal(position), "season-value"),
      seasonLine("Top scorer", formatTopScorer(topScorer), "season-value"),
      el("div", { class: "season-actions" }, playAgain, back),
    ),
  );
};
