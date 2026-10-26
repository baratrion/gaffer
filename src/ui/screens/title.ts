import type { Action, GameState } from "../../app/state";
import { el } from "../dom";

export interface TitleProps {
  readonly offer: GameState | undefined;
}

export const renderTitle = (
  root: HTMLElement,
  { offer }: TitleProps,
  dispatch: (action: Extract<Action, { type: "NewGame" | "Continue" }>) => void,
): void => {
  const newGame = el("button", { type: "button", class: offer ? "secondary" : "primary" }, "New game");
  newGame.addEventListener("click", () => dispatch({ type: "NewGame" }));
  const buttons = [newGame];
  if (offer) {
    const resume = el("button", { type: "button", class: "primary" }, "Continue");
    resume.addEventListener("click", () => dispatch({ type: "Continue", game: offer }));
    buttons.unshift(resume);
  }
  root.replaceChildren(
    el(
      "section",
      { class: "title-screen" },
      el("h1", { tabindex: "-1" }, "Gaffer"),
      el("p", { class: "tagline" }, "One club. One season. Your call."),
      ...buttons,
    ),
  );
};
