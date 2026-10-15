import type { Club } from "../../domain/league";
import { el, mount } from "../dom";

export const renderClubHome = (root: HTMLElement, club: Club): void => {
  const heading = el("h1", {}, [club.name]);
  mount(root, el("section", { class: "club-home" }, [heading, el("p", {}, ["Your club. The season is yours to shape."])]), heading);
};
