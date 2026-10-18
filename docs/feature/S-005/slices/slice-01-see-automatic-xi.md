# Slice 01: Starting XI, see the automatic eleven, Back

**Story:** US-1 (S-005). **Depends on:** S-002 (squad), S-004 (formation, `lineUp`, club home actions). **Estimate:** about 200 changed lines, 1 day. Releasable: a new club home button and screen show who starts. A domain precursor commit for the automatic pick (pure, no RNG) is allowed inside the slice, not shipped alone.

## Goal
On the club home Sam taps "Starting XI" and sees the 11 best-rated players of the club, one per slot of the chosen formation, in the formation's line-up order; "Back" returns to the club home.

## IN
Precursor commit (optional, developer-facing):
- Pure automatic pick from a squad and a formation: for each position, the players of that squad position with the highest overall, as many as the formation has slots of that position, listed from highest to lowest overall, ties in squad order. No seed of its own and no RNG draw: it reads only the generated squad, so the same `?seed=` gives the same XI.

Player-visible commit:
- Club home gains a button named exactly "Starting XI" (44px or taller), stacked after "Squad" and "Tactics"; heading still the club's name; "Squad" and "Tactics" unchanged.
- Starting XI screen: exactly one heading "Starting XI", focused on arrival; a list named "Starting XI" with exactly 11 items, each exactly one button (44px or taller) reading code, name, overall (for example "MF Tom Barrow 14"), overall the only number; codes in `lineUp(formation)` order; a button named exactly "Back" (44px or taller) to the club home.
- The slot buttons do nothing yet in this slice (no choose screen); slice 02 wires them. (The roadmap outcome is only complete after slice 02 and 03.)
- The XI follows the formation chosen in Tactics before it is opened (for example 4-3-3 gives GK, 4 DF, 3 MF, 3 FW). No sideways scroll at 390px; no console errors.

## OUT
Choosing players (slice 02), keeping picks across a formation change (slice 03), the Tactics screen and its "Line-up" list (unchanged), condition, bench, persistence, a match.

## Learning hypothesis
Disproves "the squad already generated per seed is enough to derive a believable best eleven for every formation, shown as 11 one-line buttons at 390px, without touching the S-004 Tactics screen or any S-001..S-004 protected scenario" if it fails.

## Acceptance (player-facing)
- "Starting XI" on the club home opens one focused heading "Starting XI" and a list "Starting XI" of 11 buttons, codes GK, DF, DF, DF, DF, MF, MF, MF, MF, FW, FW for 4-4-2.
- Each button reads code, name, overall; the 11 players are different, each one's squad position equals the code, each overall equals the "Squad" list.
- In each position no player outside the XI has a higher overall than a starter; starters of a position are listed highest first, ties in squad order.
- After choosing "4-3-3" or "4-2-3-1" in Tactics, the list follows that line-up (1/4/3/3, 1/4/5/1).
- `?seed=31` on two fresh visits gives the same XI; `?seed=abc` gives the default seed's XI.
- "Starting XI", each slot and "Back" are 44px or taller; "Back" shows the club name; no sideways scroll; no console errors.

## Developer criteria (precursor commit, not story AC)
- Unit and property tests on the automatic pick for all 3 formations, many seeds and all 8 clubs: 11 distinct squad players, position equals slot code, per-position top-n by overall, order by overall then squad order; input never mutated.
- Unit on `update`: opening the XI only from a known club's home; "Back" to the club home; other screens no-op.

## Demonstrable
Open `/gaffer/?seed=31` on a phone, tap New game, a club, "Starting XI", "Back", "Tactics", "4-3-3", "Back", "Starting XI".
