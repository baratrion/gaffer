import { el, mount } from "../dom";

export const renderTitle = (root: HTMLElement, onNewGame: () => void): void => {
  const heading = el("h1", {}, ["Gaffer"]);
  const button = el("button", { type: "button", class: "primary" }, ["New game"]);
  button.addEventListener("click", onNewGame);
  mount(root, el("section", { class: "title-screen" }, [heading, el("p", { class: "tagline" }, ["One club. One season. Your call."]), button]), heading);
};
