// Not a test: the S-011 reference data, pinned RED-first from the DISCUSS "User stories" table (hand-derived there, confirmed against the generator by
// inbox-reference-pinned.test.ts). DELIVER never re-pins these from its own output.
export interface ReferenceReport {
  readonly matchday: number;
  readonly home: { readonly name: string; readonly goals: number };
  readonly away: { readonly name: string; readonly goals: number };
  readonly position: number;
}
type Side = readonly [name: string, goals: number];
const report = (matchday: number, [home, away]: readonly [Side, Side], position: number): ReferenceReport => ({ matchday, home: { name: home[0], goals: home[1] }, away: { name: away[0], goals: away[1] }, position });
export const SEED_31 = 31;
export const SEED_31_CLUB = "Netherwold Borough";
const NB = SEED_31_CLUB;
/** Netherwold Borough (first club) at ?seed=31, untouched tactics: matchdays 1..14, oldest first, with the position right after each. */
export const SEED_31_REPORTS: readonly ReferenceReport[] = [
  report(1, [[NB, 1], ["Marlbrook Athletic", 2]], 6), report(2, [["Rushmoor Heath Albion", 2], [NB, 1]], 8), report(3, [[NB, 2], ["Oakhampton Rise Borough", 1]], 6),
  report(4, [["Valebridge Albion", 1], [NB, 2]], 5), report(5, [[NB, 1], ["Fennimore Town", 0]], 3), report(6, [["Juniper Hollow United", 2], [NB, 0]], 3),
  report(7, [[NB, 2], ["Tarnbeck Borough", 4]], 5), report(8, [["Marlbrook Athletic", 1], [NB, 2]], 4), report(9, [[NB, 3], ["Rushmoor Heath Albion", 1]], 2),
  report(10, [["Oakhampton Rise Borough", 1], [NB, 1]], 4), report(11, [[NB, 2], ["Valebridge Albion", 0]], 4), report(12, [["Fennimore Town", 2], [NB, 2]], 4),
  report(13, [[NB, 1], ["Juniper Hollow United", 0]], 3), report(14, [["Tarnbeck Borough", 2], [NB, 1]], 3),
];
/** The three name tie-breaks of the table (DISCUSS): at matchday N the managed club is level with `rival` on Pts, GD and goals for, and name order decides. */
export const SEED_31_TIES = [{ matchday: 4, rival: "Juniper Hollow United" }, { matchday: 5, rival: "Juniper Hollow United" }, { matchday: 7, rival: "Rushmoor Heath Albion" }] as const;
/** The default seed: Oakhampton Rise Borough plays Matchday 1 and is 3rd after it. */
export const SEED_20260 = 20260;
export const SEED_20260_CLUB = "Oakhampton Rise Borough";
export const SEED_20260_FIRST: ReferenceReport = report(1, [["Harrowgate Lane United", 0], [SEED_20260_CLUB, 1]], 3);
/** The text of a score line as the match screen shows it (en dash). */
export const scoreText = ({ home, away }: ReferenceReport): string => `${home.name} ${home.goals}–${away.goals} ${away.name}`;
