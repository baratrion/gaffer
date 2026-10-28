import { el } from "./dom";

export interface ScoreSide {
  readonly name: string;
  readonly goals: number;
}

export const matchdayTitle = (matchday: number): string => `Matchday ${matchday}`;

export const scoreLine = ({ home, away }: { readonly home: ScoreSide; readonly away: ScoreSide }): HTMLElement =>
  el(
    "p",
    { class: "score-line" },
    el("span", { class: "score-name" }, home.name),
    " ",
    el("span", { class: "score-goals" }, `${home.goals}–${away.goals}`),
    " ",
    el("span", { class: "score-name" }, away.name),
  );
