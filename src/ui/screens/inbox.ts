import type { Action } from "../../app/state";
import type { MatchdayReport } from "../../domain/inbox";
import { el } from "../dom";
import { matchdayTitle, scoreLine } from "../score-line";

export interface InboxView {
  readonly reports: readonly MatchdayReport[];
}

const message = (report: MatchdayReport): HTMLElement =>
  el("li", { class: "message" }, el("p", { class: "message-title" }, matchdayTitle(report.matchday)), scoreLine(report));

export const renderInbox = (
  root: HTMLElement,
  { reports }: InboxView,
  dispatch: (action: Extract<Action, { type: "Back" }>) => void,
): void => {
  const back = el("button", { type: "button", class: "back-button" }, "Back");
  back.addEventListener("click", () => dispatch({ type: "Back" }));
  root.replaceChildren(
    el(
      "section",
      { class: "inbox" },
      el("h1", { tabindex: "-1" }, "Inbox"),
      ...(reports.length === 0 ? [el("p", { class: "inbox-empty" }, "No messages yet")] : []),
      el("ul", { role: "list", "aria-label": "Messages", class: "message-list" }, ...reports.map(message)),
      back,
    ),
  );
};
