import type { Action } from "../../app/state";
import { el, replaceChildren } from "../dom";

export const renderTitle = (root: HTMLElement, dispatch: (action: Action) => void): void => {
  const newGame = el("button", { type: "button", class: "primary" }, "New game");
  newGame.addEventListener("click", () => dispatch({ type: "NewGame" }));
  replaceChildren(
    root,
    el(
      "section",
      { class: "title-screen" },
      el("h1", { tabindex: "-1" }, "Gaffer"),
      el("p", { class: "tagline" }, "One club. One season. Your call."),
      newGame,
    ),
  );
};
