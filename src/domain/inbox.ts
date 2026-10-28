// __SCAFFOLD__ (S-011 DISTILL, Mandate 7): signatures only. DELIVER replaces the body (ADR-0017) and deletes this marker.
import type { Club } from "./league";
import type { ScoredMatch } from "./standings";

export interface ReportSide {
  readonly name: string;
  readonly goals: number;
}

/** One played matchday as the club's Inbox reports it: the club's own match and its position right after that matchday. */
export interface MatchdayReport {
  readonly matchday: number;
  readonly home: ReportSide;
  readonly away: ReportSide;
  readonly position: number;
}

export interface ReportableMatch extends ScoredMatch {
  readonly matchday: number;
}

export const matchdayReports = (_clubs: readonly Club[], _played: readonly ReportableMatch[], _clubIndex: number): readonly MatchdayReport[] => {
  throw new Error("__SCAFFOLD__ matchdayReports is not implemented yet (S-011 RED scaffold)");
};
