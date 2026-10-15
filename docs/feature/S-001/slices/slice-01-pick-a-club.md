# Slice 01: pick a club

Goal: from the title screen, reach a club home screen for one of 8 seeded clubs.

IN: `generateLeague`, seed parsing, `update`, pick-club and club-home screens, tests.
OUT: squads, persistence, crests, new-season seeding.

Learning hypothesis: disproves "a pure seed-to-league generator plus a plain-DOM shell is enough for two-tap onboarding" if the protected scenarios cannot pass without a framework or ambient state.

Acceptance: see `feature-delta.md` DISCUSS section. Effort: under one day, about 400 lines. Dependencies: none. Dogfood: owner taps through on a phone.
