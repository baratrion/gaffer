# Gaffer: product brief

> DRAFT for the owner to correct. Owner-only file (CODEOWNERS); the factory reads it but never edits it.

## Vision
A football management game you can play one-handed on a phone browser, on the bus, in 5-minute sessions. It is inspired by the *feel* of Football Manager Mobile (you pick the team, set the tactics, watch the result unfold) without its depth or its licences.

## Player
- **Who:** an adult football fan who used to love management games but no longer has hours to spend on them.
- **Job to be done:** "When I have a few spare minutes, I want to make meaningful managerial decisions and see their consequences quickly, so that I feel the satisfaction of building a winning team."

## North star for the POC
**Manage one fictional club through one short season, on a phone browser, start to finish.**

## Experience principles
1. **Decisions over simulation.** Every screen exists to let the player make a choice or see the result of one. No realism for its own sake.
2. **Five-minute loop.** Pick team → play match → see table should take under 5 minutes.
3. **Thumb-first.** Everything is reachable with one thumb at 390px width, with tap targets of 44px or more and no horizontal scroll.
4. **Deterministic and replayable.** Same seed, same season. Bugs are reproducible.
5. **Fictional world.** Generated clubs and players only. No real names, badges or the "Football Manager" brand.

## What success looks like (POC)
- The owner plays a full season on their phone and *wants* to start a second one.
- Each Friday demo shows a visible, playable increment.

## Lessons from the 7 stalled attempts (do not repeat)
- Building the 2D match engine first (realism rabbit hole) instead of the management loop.
- Agents declaring work "done" without evidence. Here, a story is done only when the owner's protected scenarios pass.
- Tests blind to visual bugs. Every merge has a phone-viewport smoke test.
- Switching tools mid-project. The stack and tools are fixed for the POC.
