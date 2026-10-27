// Plain data, not a test: the reference Inbox of the S-011 DISCUSS (docs/feature/S-011/feature-delta.md, US-1/US-2 tables; score lines from
// docs/feature/S-008/discuss/reference-season.md). Every side plays the automatic 4-4-2. The positions were hand-derived in DISCUSS and are
// recomputed from the existing domain code by the committed inbox-inputs-pinned.test.ts, so these goldens never come from DELIVER output.
export interface ReferenceReport {
  readonly matchday: number;
  readonly scoreLine: string;
  readonly position: number;
  readonly ordinal: string;
}

/** "Netherwold Borough" (first club) at ?seed=31, matchdays 1..14 in play order (the Inbox lists them newest first). */
export const REFERENCE_INBOX_31: readonly ReferenceReport[] = [
  { matchday: 1, scoreLine: "Netherwold Borough 1–2 Marlbrook Athletic", position: 6, ordinal: "6th" },
  { matchday: 2, scoreLine: "Rushmoor Heath Albion 2–1 Netherwold Borough", position: 8, ordinal: "8th" },
  { matchday: 3, scoreLine: "Netherwold Borough 2–1 Oakhampton Rise Borough", position: 6, ordinal: "6th" },
  { matchday: 4, scoreLine: "Valebridge Albion 1–2 Netherwold Borough", position: 5, ordinal: "5th" },
  { matchday: 5, scoreLine: "Netherwold Borough 1–0 Fennimore Town", position: 3, ordinal: "3rd" },
  { matchday: 6, scoreLine: "Juniper Hollow United 2–0 Netherwold Borough", position: 3, ordinal: "3rd" },
  { matchday: 7, scoreLine: "Netherwold Borough 2–4 Tarnbeck Borough", position: 5, ordinal: "5th" },
  { matchday: 8, scoreLine: "Marlbrook Athletic 1–2 Netherwold Borough", position: 4, ordinal: "4th" },
  { matchday: 9, scoreLine: "Netherwold Borough 3–1 Rushmoor Heath Albion", position: 2, ordinal: "2nd" },
  { matchday: 10, scoreLine: "Oakhampton Rise Borough 1–1 Netherwold Borough", position: 4, ordinal: "4th" },
  { matchday: 11, scoreLine: "Netherwold Borough 2–0 Valebridge Albion", position: 4, ordinal: "4th" },
  { matchday: 12, scoreLine: "Fennimore Town 2–2 Netherwold Borough", position: 4, ordinal: "4th" },
  { matchday: 13, scoreLine: "Netherwold Borough 1–0 Juniper Hollow United", position: 3, ordinal: "3rd" },
  { matchday: 14, scoreLine: "Tarnbeck Borough 2–1 Netherwold Borough", position: 3, ordinal: "3rd" },
];

export const CLUB_31 = "Netherwold Borough";

/** "Oakhampton Rise Borough" (8th club, index 7) at ?seed=abc or no seed (seed 20260), matchday 1. */
export const REFERENCE_INBOX_20260 = {
  club: "Oakhampton Rise Borough",
  clubIndex: 7,
  report: { matchday: 1, scoreLine: "Harrowgate Lane United 0–1 Oakhampton Rise Borough", position: 3, ordinal: "3rd" } satisfies ReferenceReport,
} as const;

/**
 * The widest score line the generator makes (55 characters), found by sweeping seeds 1..300 x 8 clubs x 14 matchdays (inbox-inputs-pinned
 * re-runs the sweep): at ?seed=180 the club at index 1 plays "Harrowgate Lane Wanderers 1–2 Oakhampton Rise Wanderers". The 390px check
 * with 14 messages uses this seed and club (DISCUSS guardrail, DESIGN For DISTILL).
 */
export const LONGEST_NAMES = { seed: 180, query: "?seed=180", clubIndex: 1, widestLineLength: 55 } as const;
