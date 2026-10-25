# Reference season ends (real generator, untouched tactics: every side automatic 4-4-2)

Produced in the S-009 plan run (DISCUSS revision 2) with the current domain code. Each season follows the app's steps: `generateLeague(parseSeed("?seed=N"))` (an empty query gives the default seed 20260), `initialState`, `NewGame`, `ChooseClub`, then 14 x (`PlayMatch`, `Back`), with no tactics touched. Every season recorded 56 results, and the per-player tallies always add up to the club's GF in the table. A goal's scorer is `squad[playerIndex]` of the home club when `side` is "home", else of the away club, as the match screen prints it. "Row" is the player's 1-based row in the club's "Squad" list. Top scorer rule: most goals; on a tie, the lowest row.

Command (scratch script outside the repo, `git status` left clean; about 50 s):
`cd /home/runner/work/gaffer/gaffer && node node_modules/.pnpm/vite-node@3.2.4_@types+node@22.20.5_yaml@2.9.1/node_modules/vite-node/vite-node.mjs /tmp/seasonend/run.ts`

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
