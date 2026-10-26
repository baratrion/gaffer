import type { Club } from "./league";
import type { ScoredMatch } from "./standings";

/** S-011 DISTILL scaffold (Mandate 7): replaced by the real derivation in DELIVER commit 3; zero markers remain when S-011 is done. */
export const __SCAFFOLD__ = true;

/** A recorded entry the reports read: a scored match plus its matchday (a `PlayedMatch` fits). */
export interface ReportableMatch extends ScoredMatch {
  readonly matchday: number;
}

export interface MatchdayReport {
  readonly matchday: number;
  readonly home: { readonly name: string; readonly goals: number };
  readonly away: { readonly name: string; readonly goals: number };
  readonly position: number;
}

/** The managed club's matchday reports, newest first, each with its position after that matchday. */
export const matchdayReports = (
  _clubs: readonly Club[],
  _played: readonly ReportableMatch[],
  _clubIndex: number,
): readonly MatchdayReport[] => {
  throw new Error("__SCAFFOLD__ matchdayReports is not implemented yet (S-011 DELIVER step 3)");
};
