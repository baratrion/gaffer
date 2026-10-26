# Slice 02: Team sheet restored, and a save that never breaks the game

**Story:** US-2 (S-010). **Depends on:** slice 01 (the save format, the adapter and "Continue"). **Estimate:** about 0.5 day, about 205 changed lines in DELIVER, tests included. Code is about 60 lines: formation and XI in the format and its validation 40, the adapter's failure handling and the saved seed 20. Tests are about 145 lines: unit and property 100, e2e 45 (seeded and blocked storage). **Release:** ships in ONE DELIVER merge with slice 01 (no separate release); with it the roadmap outcome is complete.

## Goal
"Continue" brings back Sam's formation and his Starting XI picks, so the continued season equals the uninterrupted one whatever he chose. A damaged save, an old save, or storage that is blocked or full never shows "Continue", never stops play and never logs a console error.

## IN
- Choosing a formation and picking a player for a slot are saving taps. Restore gives the saved formation checked and the same 11 slot texts in the same order.
- Continued equals uninterrupted for any formation and pick sequence (D3).
- The save carries its own seed: "Continue" ignores the address's "?seed=" (D5), and "Play again" after "Continue" keeps the saved league.
- Strict decode with a version number. An unreadable save (damaged, wrong version, unknown club, bad formation or XI, results that do not match the schedule) counts as no saved game: no "Continue" and no error. A good save replaces it once a club is picked.
- Storage that throws on read or write, or is full: no "Continue", play goes on unchanged, and nothing is logged.

## OUT
Migrating old save versions (an incompatible save is simply ignored), several tabs (last write wins, not tested), a "Delete save" button, telling the player that saving failed.

## Learning hypothesis
If this slice fails, it disproves this: "Sam can trust Continue completely, because his team sheet comes back exactly and a bad save never costs him the game".

## Acceptance (player-facing)
- `?seed=31`, "Netherwold Borough": "4-3-3", then "Kestrel Northcott 6" for "MF Calder Redfern 15". Reload, "Continue": "Tactics" has "4-3-3" checked, and "Starting XI" shows the same 11 texts in the same order.
- Saved at `?seed=31` after 2 matches, open `?seed=abc`, "Continue": "Netherwold Borough", "Matchday 3", "Netherwold Borough 2–1 Oakhampton Rise Borough".
- A damaged or old-version save: no "Continue" and no console error. "New game", club, "Play match", reload: "Continue" now resumes with "Matchday 2" next.
- Blocked or full storage: no "Continue"; 2 matches and "Table" work as before; no console error.

## Developer criteria (not story AC)
- Property: decode never throws over arbitrary strings and over truncated, bit-flipped or wrong-version valid saves (numRuns 200); every rejection gives "no saved game" (K3).
- Property: continued equals uninterrupted over random formation, pick and Play match sequences with a restore at a random point (numRuns 100, fresh `FC_SEED`) (K2).
- Unit: the adapter swallows `SecurityError` and `QuotaExceededError` without console output; restore uses the saved seed; a full season encodes to under 16 KB; no generated name holds "Continue".

## Demonstrable
`/gaffer/?seed=31`: "New game", "Netherwold Borough", "Tactics", "4-3-3", "Back", "Starting XI", a swap, reload, "Continue", "Tactics", "Back", "Starting XI".
