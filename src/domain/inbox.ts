/** Matchday reports of the Inbox (ADR-0017). RED scaffold created by DISTILL: DELIVER replaces the body. */
import type { Club } from "./league";
import type { ScoredMatch } from "./standings";

export const __SCAFFOLD__ = true;

/** A recorded match with its matchday (a PlayedMatch fits). */
export interface ReportableMatch extends ScoredMatch {
  readonly matchday: number;
}

export interface ReportSide {
  readonly name: string;
  readonly goals: number;
}

export interface MatchdayReport {
  readonly matchday: number;
  readonly home: ReportSide;
  readonly away: ReportSide;
  /** The club's Pos in the standings of the entries with matchday <= this one. */
  readonly position: number;
}

/** One report per matchday in which the club has a fixture, newest first; RangeError for a clubIndex outside the league. */
export const matchdayReports = (
  _clubs: readonly Club[],
  _played: readonly ReportableMatch[],
  _clubIndex: number,
): readonly MatchdayReport[] => {
  throw new Error("Not yet implemented -- RED scaffold (__SCAFFOLD__)");
};
