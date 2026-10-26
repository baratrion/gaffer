# S-011: Read my club's news in the Inbox (DISCUSS, lean)

## Job to be done
J-11 `follow-my-seasons-story`: "When I come back between matches, I want to look back over how my season has
gone, so that I can see whether my decisions are paying off."

## Why this slice next
Since S-010 a season spans many sessions, but a played match can never be re-opened and the Table shows only
today. After "Continue", Sam has no way to re-read how earlier matchdays went or how his position moved. scope.md
IN lists "Inbox/news feed with match reports and simple storylines". The smallest form, matchday reports derived
from the recorded results, needs no match-model change, no new RNG stream and no save change.

## Persona
Sam (see S-001, S-008, S-010): 34, one-handed on a bus, 390px Android, 5 minutes a session, two or three matches
per trip, carrying on days later with "Continue".

## Journey (phone, one thumb)
Real data: `?seed=31`, "Netherwold Borough" (1st in the "Clubs" list), untouched tactics. The season is in
`S-008/discuss/reference-season.md`. The positions after each matchday are hand-derived in the feature-delta
(User stories table), and DISTILL confirms them.

| Step | Precondition | Player does | Player sees | Feels |
|---|---|---|---|---|
| 1 | Monday, a new game, club picked | Looks at the club home | Six buttons: "Squad", "Tactics", "Starting XI", "Play match", "Table", "Inbox" | Curious: "news?" |
| 2 | Club home, no match yet | "Inbox" | "Inbox" (focused), an empty "Messages" list, "No messages yet"; "Back" | Calm: nothing has happened yet, and it says so |
| 3 | Bus | 3 x ("Play match", "Back") | 1–2 loss, 2–1 loss, then a 2–1 win over Oakhampton Rise Borough | The sting of two defeats, then relief |
| 4 | Wednesday, the tab was dropped | "Continue", then "Inbox" | Newest first: "Matchday 3 / Netherwold Borough 2–1 Oakhampton Rise Borough / League position 6th", "Matchday 2 / Rushmoor Heath Albion 2–1 Netherwold Borough / League position 8th", "Matchday 1 / Netherwold Borough 1–2 Marlbrook Athletic / League position 6th" | Oriented: "right, we were bottom after two and the win lifted us" |
| 5 | Messages read | "Back" | Club home "Netherwold Borough" (focused); "Play match" for matchday 4 | Ready to decide: keep the winning eleven |
| 6 | Days later, 9 played | "Inbox" | Newest "Matchday 9 / Netherwold Borough 3–1 Rushmoor Heath Albion / League position 2nd"; further down "Matchday 7 / Netherwold Borough 2–4 Tarnbeck Borough / League position 5th" | Pride: the climb from 8th to 2nd, visible at a glance |
| 7 | Matchday 10 played (1–1) | "Inbox" | Newest "League position 4th"; "Matchday 9" still reads "2nd" | Honest: the slip is shown, and the high point is kept |
| 8 | All 14 played | "Inbox", then "Back", "End of season" | "Matchday 14 / Tarnbeck Borough 2–1 Netherwold Borough / League position 3rd"; "Final position 3rd" agrees | Closure: the whole story of the season, ending where the verdict says |
| 9 | End of season | "Play again", "Netherwold Borough", "Inbox" | An empty list, "No messages yet" | A clean sheet for another go |

Emotional arc: curious, then the sting and relief of the first matches. Then orientation when he comes back days
later, pride in the climb, honesty about a slip, and the closure of a season whose story he can tell. Every arrival
focuses the screen's title, and "Inbox" is one tap from the club home.

## Shared artifacts (single source each)
- **Recorded results**: `GameState.results` (ADR-0012, ADR-0014). They are the one source for every message, the
  match screens, the Table and the End of season screen. The Inbox stores nothing.
- **Score line text**: the match screen's score line (S-006 format). One builder is shared by the match screen and
  the Inbox (today it is inside `src/ui/screens/match.ts`; DESIGN extracts it), so the two can never differ.
- **"Matchday N" title**: the same text as the match screen's h1 for that matchday.
- **League position after N**: `standings` (ADR-0013) over the results of matchdays 1..N, with the Table's own
  order and tie-breaks, written with `formatOrdinal` (S-009, as in "Final position").
- **Managed club**: the screen's `clubId`, saved and restored by S-010; the Inbox screen carries it like the Table.
- **Seed**: the league's seed (from the address for "New game", from the save for "Continue").
- **Saved game** ("gaffer.save", ADR-0016): read-only here. It is not written when the Inbox is opened, and its
  format is unchanged.

## Error and boundary paths

| Path | Player sees | Feels |
|---|---|---|
| No match played yet (new game, "Play again" then a club, a damaged save then "New game") | An empty "Messages" list and "No messages yet" | Calm: an honest blank, not a broken screen |
| Tactics or the Starting XI changed after some matches | The same messages; only the next match counts the change | Trust: what was played is never rewritten |
| Reload, then "Continue" | The same messages as before the reload | Trust: the story of the season survives the break |
| A tie on points, goal difference and goals | The position the Table showed then, with its A to Z name tie-break (matchday 4: 5th behind Juniper Hollow United) | No surprise: the Inbox agrees with the Table |
| Tapping a message | Nothing happens: messages are text, not buttons, and a played match still cannot be re-opened | A small "oh"; nothing to undo, nothing lost |
| All 14 played | 14 messages; the newest position equals "Final position" | Closure, consistent with the verdict |
| Long club names on a 390px screen | Score lines wrap within the message; no sideways scroll | Readable one-handed |
| A different "?seed=" with no save | A different league and its own Inbox; "?seed=abc" equals no seed | As before: a seed is a league |
