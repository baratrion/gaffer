# S-001: Start a new game and pick a club (DISCUSS, lean)

## Job to be done
"When I open Gaffer with a few spare minutes, I want to be in charge of a club in seconds,
so that the next thing I do is a managerial decision rather than a setup chore."

## Why this slice first
The north star is one club through one short season. Nothing else (squad, tactics, matches,
table) means anything until the player *has* a club. This is also the smallest change that turns
the static title screen into something the owner can tap through on their phone this week.

## Elevator pitch
- **Before:** the player opens Gaffer and sees a title screen with nothing behind "New game".
- **After:** two taps in, they manage a fictional club whose name heads the screen.
- **Decision enabled:** *which club do I take on?* This is the first managerial choice, and every later story (squad, XI, matches) hangs off it.

## Persona
Sam, 34, a lapsed Championship Manager fan. Sam plays on the bus, one-handed, on a mid-range Android phone, and has 5 minutes and no patience for setup screens (brief.md, "Player").

## Journey (phone, one thumb)
| Step | Player does | Player sees | Feels |
|---|---|---|---|
| 1 | Opens `/gaffer/` | Title screen, "New game" | Curious |
| 2 | Taps "New game" | A heading ("Choose your club") and a list named "Clubs" of 8 fictional clubs, each with its name and a two-colour swatch | Choice, ownership |
| 3 | Taps a club | Club home screen; the heading is the club's name | "This is my club" |

## Shared artifacts
- **Seed**: read from `?seed=<integer>` in the address, with a fixed default when it is absent (ADR-0004).
- **League**: 8 clubs, generated purely from the seed. Each club has a unique name and two colours.
- **Chosen club**: carried from the picker to the club home screen. It is not persisted yet; a later "save and continue" story will do that.

## Acceptance criteria (BDD)
- Given the title screen, when I tap "New game", then I see a heading and a list named "Clubs" with exactly 8 items, each holding exactly one button.
- Given the club list, then every club name (the first line of its item) is non-empty and unique.
- Given the club list, when I tap any club, then the screen heading contains that club's name.
- Given the same `?seed=` on two fresh visits, then the club lists are identical. Given different seeds, then the lists differ.
- Every club button is at least 44px tall, and the screen does not scroll horizontally at 390px.
- Given an address with `?seed=abc` or an empty `?seed=`, when I tap "New game", then I see the default league (the same as with no seed). This is unit-tested in the shell, not protected.

## Examples
1. Sam opens the game with no seed, taps "New game" and sees 8 clubs such as "Brindlecombe Rovers" and "Quarrow Athletic". Every visit shows the same 8.
2. Sam opens a shared link with `?seed=4242` and sees a different league. Reopening that link shows the same league.
3. Sam taps the 6th club and its name becomes the screen heading.

## Sizing and technical notes
- Estimate: about 350-450 changed lines. The domain is `generateLeague` and the name lists (ADR-0004). The shell is seed parsing and `update`/`Screen` (ADR-0003). The UI is the `el()` helper and the pick-club and club-home screens (ADR-0002). There are also unit/property tests and an e2e smoke.
- If the slice runs over budget, deliver the domain generator and its tests first, then the screens.

## Out of this slice
Persistence, club crests and badges, editing club names, the squad (S-002), and the seeding policy for a later "new season".
