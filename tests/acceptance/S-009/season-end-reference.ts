// Plain data, not a test: the reference season ends of the S-009 plan run (docs/feature/S-009/discuss/reference-season-end.md), every side an
// automatic 4-4-2, recomputed in DISTILL from the existing domain by season-end-inputs-pinned.test.ts. "row" is the player's 1-based row in the
// club's "Squad" list (playerIndex + 1). Held-out specs and the held-out e2e import this module (Playwright compiles it from outside testDir).
export interface ReferenceScorer {
  readonly name: string;
  readonly row: number;
  readonly goals: number;
}
export interface ReferenceSeasonEnd {
  readonly query: string;
  readonly seed: number;
  readonly club: string;
  /** Position of the club in the "Clubs" list of the pick-a-club screen (0-based). */
  readonly clubIndex: number;
  readonly position: number;
  readonly ordinal: string;
  readonly row: { readonly won: number; readonly drawn: number; readonly lost: number; readonly goalsFor: number; readonly goalsAgainst: number; readonly goalDifference: number; readonly points: number };
  readonly scorers: readonly ReferenceScorer[];
  readonly positionLine: string;
  readonly topScorerLine: string;
}

export const REFERENCE_END_31: ReferenceSeasonEnd = {
  query: "?seed=31", seed: 31, club: "Netherwold Borough", clubIndex: 0, position: 3, ordinal: "3rd",
  row: { won: 7, drawn: 2, lost: 5, goalsFor: 21, goalsAgainst: 19, goalDifference: 2, points: 23 },
  scorers: [
    { name: "Garrick Thistlewood", row: 15, goals: 5 }, { name: "Merrick Hartwell", row: 18, goals: 5 }, { name: "Calder Ashcombe", row: 4, goals: 3 },
    { name: "Ivo Elderkin", row: 10, goals: 3 }, { name: "Bram Pemberly", row: 8, goals: 2 }, { name: "Calder Redfern", row: 9, goals: 1 },
    { name: "Dorian Dunmore", row: 11, goals: 1 }, { name: "Joren Dalrymple", row: 13, goals: 1 },
  ],
  positionLine: "Final position 3rd", topScorerLine: "Top scorer Garrick Thistlewood (5 goals)",
};
export const REFERENCE_END_20260: ReferenceSeasonEnd = {
  query: "?seed=abc", seed: 20260, club: "Oakhampton Rise Borough", clubIndex: 7, position: 2, ordinal: "2nd",
  row: { won: 5, drawn: 6, lost: 3, goalsFor: 21, goalsAgainst: 17, goalDifference: 4, points: 21 },
  scorers: [
    { name: "Joren Northcott", row: 18, goals: 8 }, { name: "Alden Underby", row: 10, goals: 4 }, { name: "Bram Stanhope", row: 17, goals: 4 },
    { name: "Niall Stanhope", row: 13, goals: 2 }, { name: "Wystan Redfern", row: 6, goals: 1 }, { name: "Ulric Everleigh", row: 9, goals: 1 },
    { name: "Tamsin Stanhope", row: 11, goals: 1 },
  ],
  positionLine: "Final position 2nd", topScorerLine: "Top scorer Joren Northcott (8 goals)",
};
export const REFERENCE_END_13: ReferenceSeasonEnd = {
  query: "?seed=13", seed: 13, club: "Ashworth Vale Rovers", clubIndex: 7, position: 8, ordinal: "8th",
  row: { won: 0, drawn: 1, lost: 13, goalsFor: 3, goalsAgainst: 34, goalDifference: -31, points: 1 },
  scorers: [{ name: "Orrin Yarrow", row: 4, goals: 1 }, { name: "Fenwick Ballantyne", row: 5, goals: 1 }, { name: "Yorick Yarrow", row: 13, goals: 1 }],
  positionLine: "Final position 8th", topScorerLine: "Top scorer Orrin Yarrow (1 goal)",
};
export const REFERENCE_END_1: ReferenceSeasonEnd = {
  query: "?seed=1", seed: 1, club: "Wexcombe Athletic", clubIndex: 5, position: 8, ordinal: "8th",
  row: { won: 1, drawn: 3, lost: 10, goalsFor: 6, goalsAgainst: 28, goalDifference: -22, points: 6 },
  scorers: [{ name: "Bram Fairbourne", row: 15, goals: 3 }, { name: "Rurik Dunmore", row: 11, goals: 2 }, { name: "Dorian Crossley", row: 10, goals: 1 }],
  positionLine: "Final position 8th", topScorerLine: "Top scorer Bram Fairbourne (3 goals)",
};
export const REFERENCE_ENDS: readonly ReferenceSeasonEnd[] = [REFERENCE_END_31, REFERENCE_END_20260, REFERENCE_END_13, REFERENCE_END_1];

/** Seeds 1..300 x 8 managed clubs (2400 seasons, untouched tactics): the figures of the plan run. */
export const SWEEP_FIGURES = { seasons: 2400, sharedTop: 444, noGoals: 0, topOnOneGoal: 1, highestTop: 16 } as const;
