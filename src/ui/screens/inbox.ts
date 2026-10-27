/** The Inbox screen (ADR-0017). RED scaffold created by DISTILL: DELIVER replaces the body. */
import type { Action } from "../../app/state";
import type { MatchdayReport } from "../../domain/inbox";

export const __SCAFFOLD__ = true;

export const renderInbox = (
  _root: HTMLElement,
  _view: { readonly messages: readonly MatchdayReport[] },
  _dispatch: (action: Extract<Action, { readonly type: "Back" }>) => void,
): void => {
  throw new Error("Not yet implemented -- RED scaffold (__SCAFFOLD__)");
};
