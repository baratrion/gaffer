// Not a test: the S-011 goldens, plain expected data copied from the DISCUSS "User stories" table (hand-derived from
// docs/feature/S-008/discuss/reference-season.md) and never computed here. Pinned independently of any DELIVER output.
// inbox-inputs-pinned.test.ts recomputes them in Node from the existing generator and standings (green now).
export interface ReferenceMessage {
  readonly matchday: number;
  readonly scoreLine: string;
  readonly position: number;
}

/** Seed 31, "Netherwold Borough" (1st in the "Clubs" list), untouched tactics: its 14 matchdays and the Pos right after each. */
export const NETHERWOLD_31: readonly ReferenceMessage[] = [
  { matchday: 1, scoreLine: "Netherwold Borough 1–2 Marlbrook Athletic", position: 6 },
  { matchday: 2, scoreLine: "Rushmoor Heath Albion 2–1 Netherwold Borough", position: 8 },
  { matchday: 3, scoreLine: "Netherwold Borough 2–1 Oakhampton Rise Borough", position: 6 },
  { matchday: 4, scoreLine: "Valebridge Albion 1–2 Netherwold Borough", position: 5 },
  { matchday: 5, scoreLine: "Netherwold Borough 1–0 Fennimore Town", position: 3 },
  { matchday: 6, scoreLine: "Juniper Hollow United 2–0 Netherwold Borough", position: 3 },
  { matchday: 7, scoreLine: "Netherwold Borough 2–4 Tarnbeck Borough", position: 5 },
  { matchday: 8, scoreLine: "Marlbrook Athletic 1–2 Netherwold Borough", position: 4 },
  { matchday: 9, scoreLine: "Netherwold Borough 3–1 Rushmoor Heath Albion", position: 2 },
  { matchday: 10, scoreLine: "Oakhampton Rise Borough 1–1 Netherwold Borough", position: 4 },
  { matchday: 11, scoreLine: "Netherwold Borough 2–0 Valebridge Albion", position: 4 },
  { matchday: 12, scoreLine: "Fennimore Town 2–2 Netherwold Borough", position: 4 },
  { matchday: 13, scoreLine: "Netherwold Borough 1–0 Juniper Hollow United", position: 3 },
  { matchday: 14, scoreLine: "Tarnbeck Borough 2–1 Netherwold Borough", position: 3 },
];

/** Seed 20260 (also "?seed=abc" and no seed), "Oakhampton Rise Borough" (index 1 of the "Clubs" list), matchday 1 only. */
export const OAKHAMPTON_20260_FIRST: ReferenceMessage = { matchday: 1, scoreLine: "Harrowgate Lane United 0–1 Oakhampton Rise Borough", position: 3 };

/** The Inbox text of a message as the app prints it, newest first is the caller's job. */
export const messageLines = ({ matchday, scoreLine, position }: ReferenceMessage): readonly string[] => [
  `Matchday ${matchday}`,
  scoreLine,
  `League position ${["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th"][position - 1]}`,
];
