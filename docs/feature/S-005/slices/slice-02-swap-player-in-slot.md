# Slice 02: Tap a slot, pick a player, swap

**Story:** US-2 (S-005). **Depends on:** slice 01 (Starting XI screen and the XI in state). **Estimate:** about 150 changed lines, 1 day. Releasable: Sam now decides who starts.

## Goal
On the Starting XI screen Sam taps a slot, sees the squad's players of that position with the starters marked, taps one, and is back on the Starting XI with that player in the slot (or swapped with the slot he came from).

## IN
- Each slot button opens a choose screen: exactly one heading "Choose GK", "Choose DF", "Choose MF" or "Choose FW" (the slot's code), focused on arrival; a list named "Players" with one button (44px or taller) per squad player of that position (2 GK, 6 DF, 6 MF or 4 FW) in squad order, each reading name then overall, and for players currently in the XI also "Starting" after the overall; exactly as many read "Starting" as the formation has slots of that position (the tapped slot's own player included).
- Tapping a player returns to the Starting XI screen (heading focused): a player not in the XI replaces the slot's player; a player in another slot swaps with the slot's player; the slot's own player changes nothing. The XI always holds 11 different players.
- A button named exactly "Back" (44px or taller) on the choose screen returns to Starting XI unchanged.
- Wrong-screen or invalid actions (a slot outside 0..10, a player not of the slot's position or outside 0..17, an unknown club) are no-ops.

## OUT
Players of another position (no out-of-position play), condition or attributes on the choose screen, a bench, drag and drop, formation follow (slice 03), persistence.

## Learning hypothesis
Disproves "tap a slot, tap a player is enough to set any XI within positions in 2 taps per change, with swaps instead of duplicates and focus always on the new screen's heading" if it fails.

## Acceptance (player-facing)
- Tapping the 4th MF slot at 4-4-2 shows one focused heading "Choose MF" and a list "Players" of 6 midfielders in squad order, 4 reading "Starting".
- Tapping a midfielder not starting returns to "Starting XI" (heading focused) with him in that slot and the previous player out of the XI.
- Tapping a midfielder starting in another slot swaps the two players; still 11 different players.
- Tapping the slot's own player, or "Back", returns to "Starting XI" unchanged.
- "Choose GK" lists 2 goalkeepers, 1 "Starting"; "Choose FW" lists 4 forwards, 2 "Starting" at 4-4-2.
- Each player button and "Back" are 44px or taller; no sideways scroll; no console errors.

## Developer criteria (not story AC)
- Unit and property tests on the pick/swap rule: any slot, any eligible player: 11 distinct, every slot's position equals its player's position, swap symmetry, own-player identity (same state returned); inputs never mutated.
- Unit on `update` no-ops listed above; "Back" from the choose screen to Starting XI.

## Demonstrable
`/gaffer/?seed=31`, New game, a club, "Starting XI", the 4th MF slot, a non-starting midfielder; then the 1st MF slot and that midfielder ("Starting") to swap.
