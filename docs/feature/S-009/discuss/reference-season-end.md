# Reference season ends (real generator, untouched tactics: every side automatic 4-4-2)

Produced in the S-009 plan run (DISCUSS revision 2) with the current domain code. Each season follows the app's steps: `generateLeague(parseSeed("?seed=N"))` (an empty query gives the default seed 20260), `initialState`, `NewGame`, `ChooseClub`, then 14 x (`PlayMatch`, `Back`), with no tactics touched. Every season recorded 56 results, and the per-player tallies always add up to the club's GF in the table. A goal's scorer is `squad[playerIndex]` of the home club when `side` is "home", else of the away club, as the match screen prints it. "Row" is the player's 1-based row in the club's "Squad" list. Top scorer rule: most goals; on a tie, the lowest row.

Reproduction: the script below (kept here, not in the source tree, so it is neither linted nor built). Copy it to a scratch directory outside the repository, adjust its import paths to the checkout, and run it from the repository root with `vite-node` (bundled with vitest; about 50 s), for example `node node_modules/.pnpm/vite-node@*/node_modules/vite-node/vite-node.mjs /tmp/seasonend/run.ts`. DISTILL pins the same figures as unit goldens in `tests/acceptance/S-009/`, which become the reproduction of record.

<details><summary>run.ts (scratch, as run in this plan)</summary>

```ts
import { parseSeed } from "/home/runner/work/gaffer/gaffer/src/app/seed";
import { initialState, update, standingsOf, matchFor, type GameState } from "/home/runner/work/gaffer/gaffer/src/app/state";
import { generateLeague } from "/home/runner/work/gaffer/gaffer/src/domain/league";
import { generateSquad } from "/home/runner/work/gaffer/gaffer/src/domain/squad";

const R = "/home/runner/work/gaffer/gaffer";
function season(seedParam: string, clubIdx: number) {
  const league = generateLeague(parseSeed(seedParam));
  const club = league.clubs[clubIdx]!;
  let s: GameState = initialState(league);
  s = update(s, { type: "NewGame" });
  s = update(s, { type: "ChooseClub", clubId: club.id });
  for (let i = 0; i < 14; i++) {
    s = update(s, { type: "PlayMatch" });
    if (s.screen.kind !== "match") throw new Error("not match screen");
    // sanity: matchFor matches latest
    matchFor(s, club.id);
    s = update(s, { type: "Back" });
  }
  const results = s.results ?? [];
  if (results.length !== 56) throw new Error("results " + results.length);
  const squads = league.clubs.map((_, i) => generateSquad(league.seed, i));
  const tally = new Map<number, number>();
  for (const m of results) {
    for (const g of m.result.goals) {
      const ci = g.side === "home" ? m.home : m.away;
      if (ci !== clubIdx) continue;
      if (!squads[ci]![g.playerIndex]) throw new Error("bad idx");
      tally.set(g.playerIndex, (tally.get(g.playerIndex) ?? 0) + 1);
    }
  }
  const squad = squads[clubIdx]!;
  const scorers = [...tally.entries()].map(([pi, n]) => ({ name: squad[pi]!.name, pos: squad[pi]!.position, row: pi + 1, goals: n }))
    .sort((a, b) => b.goals - a.goals || a.row - b.row);
  const table = standingsOf(s);
  const row = table.find((r) => r.clubId === club.id)!;
  const top = scorers[0];
  const tiedWith = top ? scorers.filter((x) => x.goals === top.goals && x.row !== top.row) : [];
  return { league, club, table, row, scorers, top, tiedWith, seed: league.seed };
}
const fmtRow = (r: any) => `Pos ${r.position} P${r.played} W${r.won} D${r.drawn} L${r.lost} GF${r.goalsFor} GA${r.goalsAgainst} GD${r.goalDifference} Pts${r.points}`;
const topLine = (t: any) => t ? `Top scorer ${t.name} (${t.goals} ${t.goals === 1 ? "goal" : "goals"})` : "(no scorer)";

console.log("=== A ===");
for (const [sp, name] of [["?seed=31", "Netherwold Borough"], ["", "Oakhampton Rise Borough"], ["?seed=13", "Ashworth Vale Rovers"]] as const) {
  const lg = generateLeague(parseSeed(sp));
  const idx = lg.clubs.findIndex((c) => c.name === name);
  if (idx < 0) { console.log(`seed ${lg.seed}: club ${name} NOT FOUND; clubs: ${lg.clubs.map(c=>c.name).join(", ")}`); continue; }
  const r = season(sp, idx);
  console.log(`seed ${r.seed} "${name}" (club #${idx + 1}): ${fmtRow(r.row)}`);
  for (const x of r.scorers) console.log(`  ${x.name} ${x.pos} row ${x.row}: ${x.goals}`);
  console.log(`  ${topLine(r.top)}; tie: ${r.tiedWith.length ? "YES with " + r.tiedWith.map(x => `${x.name} (row ${x.row})`).join(", ") : "no"}`);
}

console.log("=== B / C ===");
let shared = 0, zero = 0, minGoals = Infinity, minAt = "", oneTop = 0, maxTop = 0, maxAt = "", total = 0;
const eighth: any[] = [];
for (let seed = 1; seed <= 300; seed++) {
  for (let c = 0; c < 8; c++) {
    const r = season(`?seed=${seed}`, c);
    total++;
    const gf = r.scorers.reduce((a, x) => a + x.goals, 0);
    if (gf !== r.row.goalsFor) throw new Error("GF mismatch");
    if (gf === 0) zero++;
    if (gf < minGoals) { minGoals = gf; minAt = `seed ${seed} ${r.club.name}`; }
    if (r.top) {
      if (r.tiedWith.length) shared++;
      if (r.top.goals === 1) oneTop++;
      if (r.top.goals > maxTop) { maxTop = r.top.goals; maxAt = `seed ${seed}, ${r.club.name}, ${r.top.name} (${r.top.pos}, row ${r.top.row})`; }
    }
    if (r.row.position === 8) eighth.push({ seed, c, r });
  }
}
console.log(`seasons ${total}; shared top ${shared} (${(100*shared/total).toFixed(2)}%); zero-goal ${zero}; min GF ${minGoals} (first at ${minAt}); top=1 goal ${oneTop}; max top ${maxTop} at ${maxAt}`);
console.log(`8th-place seasons: ${eighth.length}`);
for (const { seed, c, r } of eighth.slice(0, 6)) {
  console.log(`seed ${seed} club#${c + 1} ${r.club.name}: ${fmtRow(r.row)} | ${topLine(r.top)} | tied: ${r.tiedWith.length ? r.tiedWith.map((x: any) => x.name).join(", ") : "no"}`);
  for (const x of r.scorers) console.log(`    ${x.name} ${x.pos} row ${x.row}: ${x.goals}`);
}

console.log("=== D ===");
const base = JSON.stringify(season("?seed=31", 0).table);
let same = true;
for (let c = 1; c < 8; c++) if (JSON.stringify(season("?seed=31", c).table) !== base) same = false;
console.log(`seed 31 table identical across all 8 managed clubs: ${same}`);
for (const r of JSON.parse(base)) console.log(`  ${r.position} ${r.name} P${r.played} W${r.won} D${r.drawn} L${r.lost} GF${r.goalsFor} GA${r.goalsAgainst} GD${r.goalDifference} Pts${r.points}`);
// also check across seeds 1..300 that full results are identical regardless of managed club
let allSame = true;
for (let seed = 1; seed <= 300 && allSame; seed++) {
  const b = JSON.stringify(season(`?seed=${seed}`, 0).table);
  for (let c = 1; c < 8; c++) if (JSON.stringify(season(`?seed=${seed}`, c).table) !== b) { allSame = false; console.log("differs at seed", seed, c); break; }
}
console.log(`tables identical across managed club for all seeds 1..300: ${allSame}`);
```

</details>

## Seed 31, Netherwold Borough (1st in the "Clubs" list)
Final position 3rd: P 14, W 7, D 2, L 5, GF 21, GA 19, GD "+2", Pts 23 (table as `S-008/discuss/reference-season.md`).

| Player | Pos | Row | Goals |
|---|---|---|---|
| Garrick Thistlewood | FW | 15 | 5 |
| Merrick Hartwell | FW | 18 | 5 |
| Calder Ashcombe | DF | 4 | 3 |
| Ivo Elderkin | MF | 10 | 3 |
| Bram Pemberly | DF | 8 | 2 |
| Calder Redfern | MF | 9 | 1 |
| Dorian Dunmore | MF | 11 | 1 |
| Joren Dalrymple | MF | 13 | 1 |

Screen: "Final position 3rd", "Top scorer Garrick Thistlewood (5 goals)" (tied with Merrick Hartwell; row 15 before row 18).

## Seed 20260 (`?seed=abc` or no seed), Oakhampton Rise Borough (8th in the "Clubs" list)
Final position 2nd: P 14, W 5, D 6, L 3, GF 21, GA 17, GD "+4", Pts 21.

| Player | Pos | Row | Goals |
|---|---|---|---|
| Joren Northcott | FW | 18 | 8 |
| Alden Underby | MF | 10 | 4 |
| Bram Stanhope | FW | 17 | 4 |
| Niall Stanhope | MF | 13 | 2 |
| Wystan Redfern | DF | 6 | 1 |
| Ulric Everleigh | MF | 9 | 1 |
| Tamsin Stanhope | MF | 11 | 1 |

Screen: "Final position 2nd", "Top scorer Joren Northcott (8 goals)" (outright).

## Seed 13, Ashworth Vale Rovers (8th in the "Clubs" list)
Final position 8th: P 14, W 0, D 1, L 13, GF 3, GA 34, GD "-31", Pts 1.

| Player | Pos | Row | Goals |
|---|---|---|---|
| Orrin Yarrow | DF | 4 | 1 |
| Fenwick Ballantyne | DF | 5 | 1 |
| Yorick Yarrow | MF | 13 | 1 |

Screen: "Final position 8th", "Top scorer Orrin Yarrow (1 goal)" (three-way tie at 1; row 4 first).

## Seed 1, Wexcombe Athletic (6th in the "Clubs" list): the first 8th-place finish in seeds 1..300
Final position 8th: P 14, W 1, D 3, L 10, GF 6, GA 28, GD "-22", Pts 6.

| Player | Row | Goals |
|---|---|---|
| Bram Fairbourne | 15 | 3 |
| Rurik Dunmore | 11 | 2 |
| Dorian Crossley | 10 | 1 |

Screen: "Final position 8th", "Top scorer Bram Fairbourne (3 goals)" (outright).

## Seeds 1..300 x 8 managed clubs (2400 seasons)
- Shared top count (a tie): 444 seasons (18.50%).
- Seasons with 0 club goals: 0 (so "Top scorer none" is a unit-level rule on a constructed log). Lowest club total: 3 (seed 13, Ashworth Vale Rovers).
- Top scorer on exactly 1 goal: 1 season (seed 13, Ashworth Vale Rovers).
- Highest top-scorer count: 16 (seed 40, Netherwold Albion, Lorcan Garrowby, FW, row 15).
- Every seed has exactly one 8th-place club (300 seasons).
- With untouched tactics the final table never depends on which club is managed (checked for every seed 1..300), so one table per seed serves all 8 managed clubs.
