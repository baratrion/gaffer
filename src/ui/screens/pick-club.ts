import type { League } from "../../domain/league";
import { el, mount } from "../dom";

export const renderPickClub = (root: HTMLElement, league: League, onPick: (clubId: string) => void): void => {
  const heading = el("h1", {}, ["Choose your club"]);
  const items = league.clubs.map((club) => {
    const button = el("button", { type: "button", class: "club" }, [
      el("span", { class: "club-name" }, [club.name]),
      el("span", { class: "swatch", "aria-hidden": "true" }, [
        el("span", { style: `background:${club.colours[0]}` }),
        el("span", { style: `background:${club.colours[1]}` }),
      ]),
    ]);
    button.addEventListener("click", () => onPick(club.id));
    return el("li", {}, [button]);
  });
  const list = el("ul", { class: "clubs", "aria-label": "Clubs" }, items);
  mount(root, el("section", { class: "pick-club" }, [heading, list]), heading);
};
