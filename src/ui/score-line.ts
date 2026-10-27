import { el } from "./dom";

/** The one source of the match screen's score line and title, shared with the Inbox (ADR-0017). */
export interface ScoreSide {
  readonly name: string;
  readonly goals: number;
}

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

export const matchdayTitle = (matchday: number): string => `Matchday ${matchday}`;
