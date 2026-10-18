# Slice 01: Starting XI, see the automatic eleven, Back

**Story:** US-1 (S-005). **Depends on:** S-002 (squad), S-003 (derived overall), S-004 (formation, `lineUp`, club home actions). **Estimate:** about 1 day, about 500 changed lines, tests included: code about 160 (selection rule 50, state 30, Starting XI screen 50, club home 5, `main.ts` 15, CSS 10) and tests about 340 (selection unit and property 140, navigation 100, e2e 100). Slice 01 renders the 11 slot buttons and slice 02 wires them. Both slices ship in the one S-005 DELIVER, so no released build has slot buttons that are not wired. A pure domain precursor commit (the automatic pick) is allowed inside the slice.

## Goal
On the club home Sam taps "Starting XI" and sees the 11 best-rated players of the club, one per slot of the chosen formation, in the formation's line-up order. "Back" returns to the club home.

## IN
Precursor commit (optional, developer-facing):
- A pure automatic pick from a squad and a formation. For each position, it takes the players of that position with the highest overall, as many as the formation has slots of that position. They are listed from highest to lowest overall, ties in squad order. It has no seed of its own and no RNG draw: it reads only the generated squad (`generateSquad(league.seed, clubIndex)`, club index = position in `league.clubs`).

Player-visible commit:
- The club home gains a button named exactly "Starting XI" (44px or taller), stacked after "Squad" and "Tactics". The heading is still the club's name.
- The Starting XI screen:
  - exactly one heading "Starting XI", focused on arrival;
  - a list named "Starting XI" of exactly 11 items, each exactly one button (44px or taller) reading code, one space, name, one space, overall (for example "MF Ivo Elderkin 18"), with codes in `lineUp(formation)` order;
  - a button named exactly "Back" (44px or taller) to the club home, heading focused.
- An XI never changed follows the formation chosen in Tactics: 4-4-2 is 1/4/4/2, 4-3-3 is 1/4/3/3, 4-2-3-1 is 1/4/5/1.
- No sideways scroll at 390px; no console errors.

## OUT
Choosing players and session memory (slice 02), the Tactics screen and its "Line-up" list (unchanged), condition, bench, persistence, a match.

## Learning hypothesis
This slice disproves the following if it fails: "the squad already generated per seed is enough to derive a believable best eleven for every formation, shown as 11 one-line buttons at 390px, without touching the S-004 Tactics screen or any S-001..S-004 protected scenario".

## Acceptance (player-facing)
- `?seed=31`, "New game", "Netherwold Borough", "Starting XI" shows one focused heading "Starting XI". The list "Starting XI" reads "GK Tamsin Ingleby 17", "DF Bram Pemberly 19", "DF Calder Ashcombe 18", "DF Quill Crossley 4", "DF Quill Yarrow 3", "MF Ivo Elderkin 18", "MF Joren Dalrymple 16", "MF Calder Redfern 15", "MF Dorian Dunmore 7", "FW Merrick Hartwell 8", "FW Garrick Thistlewood 5".
- For any club, the 11 are different squad players. Each one's position equals the code and his overall equals the "Squad" row. In each position no player missing from the XI is rated higher, and starters are listed highest first, ties in squad order. Example, `?seed=abc`, "Oakhampton Rise Borough": DF Wystan Redfern 14, DF Ulric O'Garrity 8, DF Soren Dalrymple 8, DF Perrin Dunmore 6.
- "Tactics", "4-3-3", "Back", "Starting XI" at `?seed=31` gives 1/4/3/3 with FW Merrick Hartwell 8, Garrick Thistlewood 5, Finlay Fitch-Moreton 5. "4-2-3-1" at `?seed=abc` gives 1/4/5/1 with MF Orrin Lockhart 2 fifth and FW Joren Northcott 19.
- The same `?seed=` on two fresh pages gives the same XI.
- "Starting XI", each slot and "Back" are 44px or taller. "Back" shows the club name, focused. No sideways scroll; no console errors.

## Developer criteria (precursor commit, not story AC)
- Unit and property tests on the automatic pick, for all 3 formations, many seeds and all 8 clubs. The 11 are distinct squad players, each position equals the slot code, each position has its top n by overall, and the order is by overall then squad order. The input is never mutated.
- Unit tests on `update`: the XI opens only from a known club's home; "Back" goes to the club home; other screens are no-ops.

## Demonstrable
Open `/gaffer/?seed=31` on a phone, tap New game, "Netherwold Borough", "Starting XI", "Back", "Tactics", "4-3-3", "Back", "Starting XI".
