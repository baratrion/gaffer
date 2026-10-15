## Mode: deliver (story {{STORY_ID}}: {{STORY_TITLE}})

Advance story {{STORY_ID}} by the next nWave step, as `/nw-continue` would. Look in `docs/feature/{{STORY_ID}}/` to see which wave artifacts already exist:
- No DISCUSS/DESIGN artifacts yet: produce the lean DISCUSS + DESIGN artifacts for this story in one go (this is a small story, not an epic). Then stop.
- Design exists but no DISTILL: write the executable acceptance tests (`tests/acceptance/{{STORY_ID}}-*.test.ts`, Given-When-Then, driving the domain through its public port). They must fail against the current code. Then stop.
- Acceptance tests exist and a DELIVER roadmap exists or can be derived: run the next DELIVER step(s) RED → GREEN → COMMIT until the acceptance tests pass, or until you hit the diff cap. Use the project rigor profile in `.nwave/des-config.json`.

Story outcome (from the owner's roadmap): {{STORY_OUTCOME}}
Commit messages: `{{STORY_ID}}: <imperative summary>`.
