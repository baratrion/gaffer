# Slice 02: Team sheet restored, and a save that never breaks the game

**Story:** US-2 (S-010). **Depends on:** slice 01 (the save format, the adapter and "Continue"). **Estimate:** about 0.6 day, about 245 changed lines in DELIVER, tests included. Code is about 60 lines: formation and XI in the format and its validation 40, the adapter's failure handling and removal on a failed write 20. Tests are about 185 lines: unit and property 100, e2e 85 (the five storage fixtures). These are DISCUSS figures; DESIGN re-estimates the whole story at about 823 DELIVER lines. **Release:** these are the second set of ordered DELIVER commits of S-010, on the same branch as slice 01, shipped in ONE merge (no separate release); with them the roadmap outcome is complete.

## Goal
"Continue" brings back Sam's formation and his Starting XI picks, so the continued season equals the uninterrupted one whatever he chose. A damaged save, an old save, or storage that is blocked or full never shows a stale "Continue", never stops play and never logs a console error.

## IN
- Choosing a formation and picking a player for a slot are saving taps. Restore gives the saved formation checked and the same 11 slot texts in the same order.
- Continued equals uninterrupted for any formation and pick sequence (D3).
- Strict decode with a version number. An unreadable save (damaged, wrong version, unknown club, bad formation or XI, results that do not fit the league) counts as no saved game: no "Continue" and no error. A good save replaces it once a club is picked.
- Storage blocked, or full when the game loads (degraded): no "Continue" (a readable older save is not offered), play goes on unchanged without saving, and nothing is logged. The game also makes a best-effort, silent removal of "gaffer.save" at load and on each saving tap, so a later visit never finds an older save. Residual: when access is blocked entirely nothing can be removed, so a save that existed before is offered again once access returns.
- A failed write during play removes "gaffer.save" (best effort, silently), so "Continue" never offers a state older than the last one played; the next saving tap tries again. The exceptions are when the removal also fails or storage is blocked entirely, and several tabs open at once (out of scope, an accepted exception).

## OUT
Migrating old save versions (an incompatible save is simply ignored), several tabs (out of scope), a "Delete save" button, telling the player that saving failed.

## Learning hypothesis
If this slice fails, it disproves this: "Sam can trust Continue completely, because his team sheet comes back exactly and a bad save or a full phone never costs him the game or offers a stale one".

## Acceptance (player-facing)
Fixtures are named in the feature-delta under User stories.
- Team sheet, at `?seed=31` with "Netherwold Borough": "4-3-3", then "Kestrel Northcott 6" for "MF Calder Redfern 15". Reload, "Continue": "Tactics" has "4-3-3" checked, and "Starting XI" shows the same 11 texts in the same order.
- Damaged save (the seed-31 save text cut after 100 characters): no "Continue", a "New game" button, and no console error. Then "New game", club, "Play match", "Back", reload: "Continue", then "Play match" shows "Matchday 2".
- Incompatible save (version 0): no "Continue", a "New game" button, and no console error.
- Blocked storage: no "Continue". After 2 matches every "League table" row reads P 2. After a reload there is still no "Continue". No console error.
- Full at load, with the seed-31 save text stored: no "Continue". After 1 match every row reads P 1. Storage is made writable again and the page reloaded: still no "Continue", because the older save was removed. No console error.
- Full mid-session: after matchday 2 is saved, only writes to "gaffer.save" throw, and other keys such as the probe key still write. "Play match" shows "Matchday 3". After "Back" and a reload the store works, and there is no "Continue" (the removal), a "New game" button, and no console error.

## Developer criteria (not story AC)
- Property: decode never throws over arbitrary strings and over truncated, bit-flipped or wrong-version valid saves (numRuns 200); every rejection gives "no saved game" (K3).
- Property: continued equals uninterrupted over random formation, pick and Play match sequences with a restore at a random point (numRuns 100, fresh `FC_SEED`) (K2).
- Unit:
  - the adapter swallows `SecurityError` and `QuotaExceededError` without console output;
  - a failed write removes the key, and a failing remove is swallowed;
  - a degraded store attempts the removal at load and on each saving tap;
  - the next saving tap retries;
  - a full season and a constructed worst case encode to under 64 KB;
  - no generated name holds "Continue".

## Demonstrable
`/gaffer/?seed=31`: "New game", "Netherwold Borough", "Tactics", "4-3-3", "Back", "Starting XI", a swap, reload, "Continue", "Tactics", "Back", "Starting XI".
