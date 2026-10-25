// S-008 reference season: the real generator's 14 matchdays at seeds 31 and 20260 with every side an automatic 4-4-2 (untouched tactics),
// copied from docs/feature/S-008/discuss/reference-season.md (produced in the plan run, before any S-008 code). Plain expected data,
// never computed here. Each matchday lists its 4 fixtures in fixture order, home club first; the table is the final standings after 14.
// Shared by season-inputs-pinned (domain proof, green now), the held-out season specs and the held-out e2e (cross-engine golden).
export interface ReferenceRow {
  readonly name: string;
  readonly played: number;
  readonly won: number;
  readonly drawn: number;
  readonly lost: number;
  readonly goalsFor: number;
  readonly goalsAgainst: number;
  readonly goalDifference: number;
  readonly points: number;
}

export interface ReferenceSeason {
  readonly seed: number;
  readonly matchdays: readonly (readonly string[])[];
  readonly table: readonly ReferenceRow[];
}

export const REFERENCE_31: ReferenceSeason = {
  seed: 31,
  matchdays: [
    ["Netherwold Borough 1–2 Marlbrook Athletic", "Fennimore Town 2–2 Valebridge Albion", "Tarnbeck Borough 5–1 Rushmoor Heath Albion", "Juniper Hollow United 1–3 Oakhampton Rise Borough"],
    ["Marlbrook Athletic 1–1 Fennimore Town", "Rushmoor Heath Albion 2–1 Netherwold Borough", "Valebridge Albion 0–2 Juniper Hollow United", "Oakhampton Rise Borough 1–1 Tarnbeck Borough"],
    ["Rushmoor Heath Albion 0–0 Marlbrook Athletic", "Juniper Hollow United 0–3 Fennimore Town", "Netherwold Borough 2–1 Oakhampton Rise Borough", "Tarnbeck Borough 2–2 Valebridge Albion"],
    ["Marlbrook Athletic 0–3 Juniper Hollow United", "Oakhampton Rise Borough 2–1 Rushmoor Heath Albion", "Fennimore Town 1–1 Tarnbeck Borough", "Valebridge Albion 1–2 Netherwold Borough"],
    ["Oakhampton Rise Borough 3–2 Marlbrook Athletic", "Tarnbeck Borough 0–1 Juniper Hollow United", "Rushmoor Heath Albion 2–2 Valebridge Albion", "Netherwold Borough 1–0 Fennimore Town"],
    ["Marlbrook Athletic 1–1 Tarnbeck Borough", "Valebridge Albion 1–3 Oakhampton Rise Borough", "Juniper Hollow United 2–0 Netherwold Borough", "Fennimore Town 1–2 Rushmoor Heath Albion"],
    ["Valebridge Albion 2–3 Marlbrook Athletic", "Netherwold Borough 2–4 Tarnbeck Borough", "Oakhampton Rise Borough 3–0 Fennimore Town", "Rushmoor Heath Albion 1–1 Juniper Hollow United"],
    ["Marlbrook Athletic 1–2 Netherwold Borough", "Valebridge Albion 0–1 Fennimore Town", "Rushmoor Heath Albion 1–3 Tarnbeck Borough", "Oakhampton Rise Borough 1–1 Juniper Hollow United"],
    ["Fennimore Town 2–2 Marlbrook Athletic", "Netherwold Borough 3–1 Rushmoor Heath Albion", "Juniper Hollow United 2–3 Valebridge Albion", "Tarnbeck Borough 1–1 Oakhampton Rise Borough"],
    ["Marlbrook Athletic 2–1 Rushmoor Heath Albion", "Fennimore Town 0–2 Juniper Hollow United", "Oakhampton Rise Borough 1–1 Netherwold Borough", "Valebridge Albion 0–3 Tarnbeck Borough"],
    ["Juniper Hollow United 3–1 Marlbrook Athletic", "Rushmoor Heath Albion 1–0 Oakhampton Rise Borough", "Tarnbeck Borough 2–0 Fennimore Town", "Netherwold Borough 2–0 Valebridge Albion"],
    ["Marlbrook Athletic 0–2 Oakhampton Rise Borough", "Juniper Hollow United 0–2 Tarnbeck Borough", "Valebridge Albion 0–2 Rushmoor Heath Albion", "Fennimore Town 2–2 Netherwold Borough"],
    ["Tarnbeck Borough 0–1 Marlbrook Athletic", "Oakhampton Rise Borough 1–0 Valebridge Albion", "Netherwold Borough 1–0 Juniper Hollow United", "Rushmoor Heath Albion 2–1 Fennimore Town"],
    ["Marlbrook Athletic 2–1 Valebridge Albion", "Tarnbeck Borough 2–1 Netherwold Borough", "Fennimore Town 0–1 Oakhampton Rise Borough", "Juniper Hollow United 0–0 Rushmoor Heath Albion"],
  ],
  table: [
    { name: "Oakhampton Rise Borough", played: 14, won: 8, drawn: 4, lost: 2, goalsFor: 23, goalsAgainst: 12, goalDifference: 11, points: 28 },
    { name: "Tarnbeck Borough", played: 14, won: 7, drawn: 5, lost: 2, goalsFor: 27, goalsAgainst: 13, goalDifference: 14, points: 26 },
    { name: "Netherwold Borough", played: 14, won: 7, drawn: 2, lost: 5, goalsFor: 21, goalsAgainst: 19, goalDifference: 2, points: 23 },
    { name: "Juniper Hollow United", played: 14, won: 6, drawn: 3, lost: 5, goalsFor: 18, goalsAgainst: 15, goalDifference: 3, points: 21 },
    { name: "Marlbrook Athletic", played: 14, won: 5, drawn: 4, lost: 5, goalsFor: 18, goalsAgainst: 22, goalDifference: -4, points: 19 },
    { name: "Rushmoor Heath Albion", played: 14, won: 5, drawn: 4, lost: 5, goalsFor: 17, goalsAgainst: 21, goalDifference: -4, points: 19 },
    { name: "Fennimore Town", played: 14, won: 2, drawn: 5, lost: 7, goalsFor: 14, goalsAgainst: 21, goalDifference: -7, points: 11 },
    { name: "Valebridge Albion", played: 14, won: 1, drawn: 3, lost: 10, goalsFor: 14, goalsAgainst: 29, goalDifference: -15, points: 6 },
  ],
};

export const REFERENCE_20260: ReferenceSeason = {
  seed: 20260,
  matchdays: [
    ["Harrowgate Lane United 0–1 Oakhampton Rise Borough", "Mossdale Wanderers 0–2 Ironbridge Fen Wanderers", "Valebridge Town 1–1 Ashworth Vale Rangers", "Juniper Hollow Rovers 3–1 Quillbourne Albion"],
    ["Oakhampton Rise Borough 2–2 Mossdale Wanderers", "Ashworth Vale Rangers 2–2 Harrowgate Lane United", "Ironbridge Fen Wanderers 3–1 Juniper Hollow Rovers", "Quillbourne Albion 0–4 Valebridge Town"],
    ["Ashworth Vale Rangers 1–3 Oakhampton Rise Borough", "Juniper Hollow Rovers 3–0 Mossdale Wanderers", "Harrowgate Lane United 1–1 Quillbourne Albion", "Valebridge Town 1–0 Ironbridge Fen Wanderers"],
    ["Oakhampton Rise Borough 0–2 Juniper Hollow Rovers", "Quillbourne Albion 1–1 Ashworth Vale Rangers", "Mossdale Wanderers 1–2 Valebridge Town", "Ironbridge Fen Wanderers 1–2 Harrowgate Lane United"],
    ["Quillbourne Albion 1–1 Oakhampton Rise Borough", "Valebridge Town 5–1 Juniper Hollow Rovers", "Ashworth Vale Rangers 1–1 Ironbridge Fen Wanderers", "Harrowgate Lane United 2–2 Mossdale Wanderers"],
    ["Oakhampton Rise Borough 1–3 Valebridge Town", "Ironbridge Fen Wanderers 1–2 Quillbourne Albion", "Juniper Hollow Rovers 3–1 Harrowgate Lane United", "Mossdale Wanderers 4–2 Ashworth Vale Rangers"],
    ["Ironbridge Fen Wanderers 1–1 Oakhampton Rise Borough", "Harrowgate Lane United 1–1 Valebridge Town", "Quillbourne Albion 0–0 Mossdale Wanderers", "Ashworth Vale Rangers 3–1 Juniper Hollow Rovers"],
    ["Oakhampton Rise Borough 1–0 Harrowgate Lane United", "Ironbridge Fen Wanderers 2–0 Mossdale Wanderers", "Ashworth Vale Rangers 0–1 Valebridge Town", "Quillbourne Albion 1–1 Juniper Hollow Rovers"],
    ["Mossdale Wanderers 2–3 Oakhampton Rise Borough", "Harrowgate Lane United 1–0 Ashworth Vale Rangers", "Juniper Hollow Rovers 0–0 Ironbridge Fen Wanderers", "Valebridge Town 1–1 Quillbourne Albion"],
    ["Oakhampton Rise Borough 1–2 Ashworth Vale Rangers", "Mossdale Wanderers 0–0 Juniper Hollow Rovers", "Quillbourne Albion 1–0 Harrowgate Lane United", "Ironbridge Fen Wanderers 0–3 Valebridge Town"],
    ["Juniper Hollow Rovers 1–1 Oakhampton Rise Borough", "Ashworth Vale Rangers 3–0 Quillbourne Albion", "Valebridge Town 1–2 Mossdale Wanderers", "Harrowgate Lane United 0–0 Ironbridge Fen Wanderers"],
    ["Oakhampton Rise Borough 5–1 Quillbourne Albion", "Juniper Hollow Rovers 0–1 Valebridge Town", "Ironbridge Fen Wanderers 1–2 Ashworth Vale Rangers", "Mossdale Wanderers 1–3 Harrowgate Lane United"],
    ["Valebridge Town 0–0 Oakhampton Rise Borough", "Quillbourne Albion 0–1 Ironbridge Fen Wanderers", "Harrowgate Lane United 4–1 Juniper Hollow Rovers", "Ashworth Vale Rangers 2–1 Mossdale Wanderers"],
    ["Oakhampton Rise Borough 1–1 Ironbridge Fen Wanderers", "Valebridge Town 1–1 Harrowgate Lane United", "Mossdale Wanderers 2–1 Quillbourne Albion", "Juniper Hollow Rovers 1–1 Ashworth Vale Rangers"],
  ],
  table: [
    { name: "Valebridge Town", played: 14, won: 8, drawn: 5, lost: 1, goalsFor: 25, goalsAgainst: 9, goalDifference: 16, points: 29 },
    { name: "Oakhampton Rise Borough", played: 14, won: 5, drawn: 6, lost: 3, goalsFor: 21, goalsAgainst: 17, goalDifference: 4, points: 21 },
    { name: "Ashworth Vale Rangers", played: 14, won: 5, drawn: 5, lost: 4, goalsFor: 21, goalsAgainst: 19, goalDifference: 2, points: 20 },
    { name: "Harrowgate Lane United", played: 14, won: 4, drawn: 6, lost: 4, goalsFor: 18, goalsAgainst: 16, goalDifference: 2, points: 18 },
    { name: "Ironbridge Fen Wanderers", played: 14, won: 4, drawn: 5, lost: 5, goalsFor: 14, goalsAgainst: 14, goalDifference: 0, points: 17 },
    { name: "Juniper Hollow Rovers", played: 14, won: 4, drawn: 5, lost: 5, goalsFor: 18, goalsAgainst: 21, goalDifference: -3, points: 17 },
    { name: "Mossdale Wanderers", played: 14, won: 3, drawn: 4, lost: 7, goalsFor: 17, goalsAgainst: 25, goalDifference: -8, points: 13 },
    { name: "Quillbourne Albion", played: 14, won: 2, drawn: 6, lost: 6, goalsFor: 11, goalsAgainst: 24, goalDifference: -13, points: 12 },
  ],
};

/** Seed 31 after matchday 2, from DISCUSS US-1 example 1: club, P, W, D, L, GD, Pts, in table order. */
export const TABLE_AFTER_TWO_31: readonly (readonly [string, number, number, number, number, number, number])[] = [
  ["Tarnbeck Borough", 2, 1, 1, 0, 4, 4],
  ["Oakhampton Rise Borough", 2, 1, 1, 0, 2, 4],
  ["Marlbrook Athletic", 2, 1, 1, 0, 1, 4],
  ["Juniper Hollow United", 2, 1, 0, 1, 0, 3],
  ["Rushmoor Heath Albion", 2, 1, 0, 1, -3, 3],
  ["Fennimore Town", 2, 0, 2, 0, 0, 2],
  ["Valebridge Albion", 2, 0, 1, 1, -2, 1],
  ["Netherwold Borough", 2, 0, 0, 2, -2, 0],
];

/** The score lines of one club in order, one per matchday: the club's fixture of each matchday of a reference season. */
export const scoreLinesOf = (season: ReferenceSeason, club: string): readonly string[] =>
  season.matchdays.map((fixtures) => fixtures.find((line) => line.startsWith(`${club} `) || line.endsWith(` ${club}`))!);

/** A goal difference as the table writes it: +N, 0 or -N (ASCII hyphen-minus). */
export const goalDifferenceText = (goalDifference: number): string =>
  goalDifference > 0 ? `+${goalDifference}` : goalDifference === 0 ? "0" : `-${Math.abs(goalDifference)}`;
