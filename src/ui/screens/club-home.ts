import type { Club } from "../../app/types";
import { el } from "../dom";
import { COLOUR_HEX } from "./club-colours";

export const renderClubHome = (root: HTMLElement, club: Club): void => {
  const [first, second] = club.colours;
  root.replaceChildren(
    el(
      "section",
      { class: "club-home" },
      el("span", {
        class: "swatch swatch-large",
        "aria-hidden": "true",
        style: `--swatch-a: ${COLOUR_HEX[first]}; --swatch-b: ${COLOUR_HEX[second]}`,
      }),
      el("h1", { tabindex: "-1" }, club.name),
    ),
  );
};
