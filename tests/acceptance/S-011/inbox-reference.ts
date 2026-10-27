// Plain data, not a test: the S-011 DISCUSS reference Inbox (hand-derived; every side plays the automatic 4-4-2), recomputed from the existing
// domain code by inbox-inputs-pinned.test.ts, so these goldens never come from DELIVER output.
export interface ReferenceReport { readonly matchday: number; readonly scoreLine: string; readonly position: number; readonly ordinal: string }
/** Netherwold Borough (first club) at ?seed=31, matchdays 1..14 in play order. */
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
export const ORDINALS = ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th"] as const;
export const CLUB_31 = "Netherwold Borough";
/** The three lines of a message, as the Inbox prints them. */
export const messageLines = (r: ReferenceReport): string[] => [`Matchday ${r.matchday}`, r.scoreLine, `League position ${r.ordinal}`];
/** Oakhampton Rise Borough (index 7) at ?seed=abc or no seed (seed 20260), matchday 1. */
export const REFERENCE_INBOX_20260 = {
  club: "Oakhampton Rise Borough",
  clubIndex: 7,
  report: { matchday: 1, scoreLine: "Harrowgate Lane United 0–1 Oakhampton Rise Borough", position: 3, ordinal: "3rd" } satisfies ReferenceReport,
} as const;
/** The widest score line the generator makes (55 characters; inbox-inputs-pinned re-runs the sweep): ?seed=180, club 1, "Harrowgate Lane Wanderers 1–2 Oakhampton Rise Wanderers". */
export const LONGEST_NAMES = { seed: 180, query: "?seed=180", clubIndex: 1, widestLineLength: 55 } as const;
