/** The Inbox screen (ADR-0017): one message per matchday played, newest first. */
import type { Action } from "../../app/state";
import type { MatchdayReport } from "../../domain/inbox";
import { el } from "../dom";
import { matchdayTitle, scoreLine } from "../score-line";

export interface InboxView {
  readonly messages: readonly MatchdayReport[];
}

const messageItem = (report: MatchdayReport): HTMLElement =>
  el("li", { class: "message" }, el("p", { class: "message-title" }, matchdayTitle(report.matchday)), scoreLine(report));

export const renderInbox = (
  root: HTMLElement,
  { messages }: InboxView,
  dispatch: (action: Extract<Action, { readonly type: "Back" }>) => void,
): void => {
  const back = el("button", { type: "button", class: "back-button" }, "Back");
  back.addEventListener("click", () => dispatch({ type: "Back" }));
  const empty = messages.length === 0 ? [el("p", { class: "inbox-empty" }, "No messages yet")] : [];
  root.replaceChildren(
    el(
      "section",
      { class: "inbox" },
      el("h1", { tabindex: "-1" }, "Inbox"),
      ...empty,
      el("ul", { role: "list", "aria-label": "Messages", class: "message-list" }, ...messages.map(messageItem)),
      back,
    ),
  );
};
