/** The one source of the match screen's score line and title, shared with the Inbox (ADR-0017). RED scaffold created by DISTILL. */
export const __SCAFFOLD__ = true;

export interface ScoreSide {
  readonly name: string;
  readonly goals: number;
}

export const scoreLine = (_sides: { readonly home: ScoreSide; readonly away: ScoreSide }): HTMLElement => {
  throw new Error("Not yet implemented -- RED scaffold (__SCAFFOLD__)");
};

export const matchdayTitle = (_matchday: number): string => {
  throw new Error("Not yet implemented -- RED scaffold (__SCAFFOLD__)");
};
