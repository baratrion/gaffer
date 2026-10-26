# S-010: Save and continue my season (DISCUSS, lean)

## Job to be done
J-10 `carry-on-my-season`: "When I come back to the game after a break, I want to pick up my season where I
left it, so that my club and my results carry on across short sessions."

## Why this slice next
A season is 14 matchdays, but a session is 5 minutes. S-007, S-008 and S-009 keep results only until the page
is reloaded, so a dropped tab wipes the season. scope.md IN lists "Save and continue in the browser
(localStorage)", and S-009 named it next.

## Persona
Sam (see S-001, S-008): 34, one-handed on a bus, 390px Android, 5 minutes a session, two or three matches
per trip. His browser drops the tab between trips.

## Journey (phone, one thumb)
Real data: `?seed=31`, "Netherwold Borough" (1st in the "Clubs" list), untouched tactics, then 4-3-3 and the
golden pick; the season is in `S-008/discuss/reference-season.md`.

| Step | Precondition | Player does | Player sees | Feels |
|---|---|---|---|---|
| 1 | Morning bus, fresh browser | Opens the game | "Gaffer" (focused), "New game", no "Continue" | Curious, as before |
| 2 | Title | "New game", "Netherwold Borough", 2 x ("Play match", "Back") | "Matchday 1" 1–2 loss, "Matchday 2" 2–1 loss; 8th on "Table" | Stung, determined to turn it round; then his stop |
| 3 | Lunch; the tab was dropped | Opens the game again | "Continue" above "New game", "Gaffer" focused | Relief: "it's still there" |
| 4 | Title | "Continue" | Club home "Netherwold Borough" (focused); "Table" the same, 8th at P 2, Pts 0 | Trust: nothing was lost or changed |
| 5 | Club home | "Play match" | "Matchday 3", "Netherwold Borough 2–1 Oakhampton Rise Borough", the same as without the reload | The season moves on from where it was; a first win |
| 6 | Club home | "Tactics", "4-3-3"; "Starting XI", "Kestrel Northcott 6" for "MF Calder Redfern 15" | His new team sheet | In charge: building on the win |
| 7 | Evening, tab dropped again | "Continue", "Tactics", "Starting XI" | "4-3-3" checked, his same 11 | Confidence: the game remembers his decisions |
| 8 | Days later, matchday 14 played, reload | "Continue", "End of season" | "End of season" instead of "Play match"; the same "Final position" and "Top scorer" lines as before the reload | Closure kept: the verdict survives the reload |

Emotional arc: curious, then the sting of two defeats and the worry of a lost season, relief at "Continue",
trust when the table is unchanged and the next match is the one it would have been, a first win, control
when his team sheet comes back, and the satisfaction of a season
that spans many short sessions. Every arrival focuses the screen's title; "Continue" is one tap.

## Shared artifacts (single source each)
- **Saved game**: one entry in the browser's site storage under "gaffer.save" (ADR-0016), written by the shell
  after a saving tap (the pick-a-club screen, which has no club yet, writes nothing; the club-choice tap
  writes), and read once on load. It holds the seed, the managed club, the formation, the XI picks and the
  recorded results. A failed write removes it (best effort).
- **Recorded results**: `GameState.results` (ADR-0012, ADR-0014), the single source for the table, the next
  matchday and the End of season screen, before and after a reload.
- **Formation and Starting XI**: `GameState.formation` and `GameState.xi` (ADR-0007, ADR-0009), saved and
  restored as they are.
- **Managed club**: today only on the screen (`clubId`). The saved game carries it, and "Continue" lands on its
  club home.
- **Seed**: the address's "?seed=" for "New game"; the saved seed for "Continue" (D5).

## Error and boundary paths

| Path | Player sees | Feels |
|---|---|---|
| First visit, or a fresh browser | No "Continue"; the title as before | Curious, as before; nothing to lose yet |
| "New game" tapped by accident | The pick-a-club screen. The old saved game is kept until a club is picked. There is no "Back" to the title on that screen (out of scope), so a reload is the only way back to "Continue" | A jolt of panic ("did I just lose it?"), then relief when the reload still offers "Continue". Not obvious: he has to think of reloading |
| Picks a club after a mistaken "New game" (accepted risk, D4) | The old saved game is replaced (version-only rule); a later "Continue" resumes the new game. No confirm, no undo | The sting of a lost season, J-10's anxiety made real. Accepted to ship less; watched in the owner's demo |
| A damaged save, or one from an incompatible older version | No "Continue", no error; the game plays as on a first visit, and the next club pick writes a good save | Mild surprise at a missing "Continue", but never stuck or shown an error |
| Storage blocked (privacy setting, private mode) | No "Continue", no error; the game plays, nothing is saved, and a reload loses the season as before S-010 | No worse than before S-010; the game never complains |
| Storage full when the game loads | No "Continue", even if a readable older save is stored; the game plays without saving, and the older save is removed (best effort), so it is not offered later either. If access is blocked entirely nothing can be removed, and the older save comes back once access returns | As above: honest rather than offering something it cannot keep |
| Storage fills up during play | The match plays as usual; that save fails, so the stored game is removed, and after a reload there is no "Continue" rather than a stale matchday. The exceptions are a failing removal, storage blocked entirely, and several tabs (out of scope) | Disappointment if he notices, but never a "Continue" that silently rewinds his season, which would break his trust far more |
| A different "?seed=" in the address | "Continue" still resumes the saved league; "New game" uses the address's seed | Reassured: a shared link does not overwrite his season |
| A finished season | "Continue" shows "End of season" and no "Play match". "Play again" keeps the save until a club is picked, so a reload before that still offers the finished season | Closure kept; another go is one tap away |
