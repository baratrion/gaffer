# S-006: Play my first match (DISCUSS, lean)

## Job to be done
J-06 `see-my-team-play`: "When I have picked my team and set how it lines up, I want to send it out and
see the result at once, so that I find out whether my choices worked."

## Why this slice next
Sam has a squad, a formation and a Starting XI (S-002..S-005), but nothing to send them out for. The brief's
loop is "pick team, play match, see table"; this story ships the middle step at its thinnest: one match,
the club's matchday-1 league fixture, quick-simmed, with the final score and the goals.

## Elevator pitch
- **Before:** Sam can pick an eleven and a formation, and nothing happens with them.
- **After:** on Netherwold Borough's home Sam taps "Play match" and, on arrival, sees the heading
  "Matchday 1" (the only h1, focused), with the score line and the list "Goals" already shown: a score
  line such as "Netherwold Borough 2–1 Brindlecombe Rovers" and a list "Goals" such as
  "23' Ivo Elderkin (Netherwold Borough)" (opponent, score and minutes illustrative: they depend on the
  schedule and match model DESIGN picks).
- **Decision enabled:** did my eleven and my formation work, and who do I keep or drop?

## Persona
Sam (see S-001, S-005): 34, one-handed on a bus, 390px Android, 5 minutes. Wants the result in one tap,
readable at a glance, and wants to recognise his own players among the scorers.

## Journey (phone, one thumb)
Real data where the generator fixes it: `?seed=31`, club 0 "Netherwold Borough", automatic 4-4-2 XI from
S-005 (GK Tamsin Ingleby 17 ... FW Garrick Thistlewood 5). The opponent, the score and the minutes are
illustrative until DESIGN fixes the schedule and the model; the rules are not.
Precondition for step 1: a fresh page at `/gaffer/?seed=31`, "New game", "Netherwold Borough".

| Step | Precondition | Player does | Player sees | Feels |
|---|---|---|---|---|
| 1 | Club home, new game | Looks at the actions | "Squad", "Tactics", "Starting XI", then "Play match" (stacked, 44px or taller) | Anticipation: "Let's see what they can do" |
| 2 | Club home | Taps "Play match" | Only h1 "Matchday 1" (focused); already shown on arrival, not revealed over time: the one score line "Netherwold Borough 2–1 Brindlecombe Rovers" and the list "Goals" | Tension released: "We won" (or "We lost") |
| 3 | Match screen | Reads the list "Goals" | "23' Ivo Elderkin (Netherwold Borough)", "61' Rurik Fairbourne (Brindlecombe Rovers)", "78' Merrick Hartwell (Netherwold Borough)": as many items per club as its goals, minutes never decreasing | Pride or blame: "Elderkin again; my pick up front delivered" |
| 4 | Match screen | Taps "Back" | Club home, heading "Netherwold Borough" (focused) | Oriented, in charge |
| 5 | Club home after the match | "Starting XI" or "Tactics" | The same XI and formation as before the match | Safe: "Nothing moved" |

Emotional arc: anticipation (one tap, no setup), then release (the score first, big and plain), then
pride or blame with names Sam knows (scorers from his own eleven), then back in charge (nothing changed,
the next decision is his). No step leaves Sam waiting or lost: one focused heading per screen, and the
result is already there on arrival (D13: any later commentary is additive and never delays the score line
or the goals).

The score line is exactly one piece of text on the match screen whose whole text reads
`<home> <h>–<a> <away>` (`^(.+) (\d)–(\d) (.+)$`); no other text there, commentary or stats included,
reads in that format (D2).

## Shared artifacts (single source each)
- **Seed** and **league**: `league.seed`, `league.clubs` (S-001); the opponent's name is a "Clubs" name.
- **Schedule**: one fixed round-robin over the 8 clubs (DESIGN, ADR); matchday 1 pairs every club with
  exactly one other and fixes which club is home (named first). Read by the match screen; reused by the
  season story.
- **Squads**: `generateSquad(league.seed, clubIndex)` for both clubs (S-002/S-003), derived, never copied;
  scorer names are squad names.
- **Formation** (`GameState.formation`, S-004) and **the XI** (`currentXI`, S-005) of Sam's club. The
  opponent: its automatic XI in 4-4-2.
- **The match**: a pure function of seed, fixture, both formations and both XIs. Not stored (D8): the score
  line and the "Goals" list are both read from the one result, so they cannot disagree.

## Error and boundary paths
- 0–0: the score line reads "... 0–0 ..." and the list "Goals" is present with no items.
- Invalid seed (`?seed=abc`): the default seed 20260; the match equals the one with no seed.
- Names with an apostrophe or hyphen: "61' Ulric O'Garrity (Oakhampton Rise Borough)"; the scorer is
  everything between "' " and the last " (".
- Sam's goalkeeper (the GK slot) never scores; nor does any goalkeeper in this story.
- Changed XI: Sam swapped Kestrel Northcott in for Dorian Dunmore; Northcott may score, Dunmore cannot.
- "Play match" off a known club's home, or "Back" with an unknown club: no-op (unit tests on `update`).
- "Play match" again: the same match (this story only; not pinned). Reload: title screen.
