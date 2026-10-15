## Mode: deliver (story {{STORY_ID}}: {{STORY_TITLE}})

Advance story {{STORY_ID}} by the next nWave step, as `/nw-continue` would. Look in `docs/feature/{{STORY_ID}}/` to see which artifacts already exist. **Every tick must leave the branch fully green.** CI rejects failing, skipped or `.todo` tests, so never commit a test you have not made pass.

1. **No DISCUSS/DESIGN artifacts yet:** produce lean DISCUSS + DESIGN artifacts for this story in one go (a small story, not an epic). Include the DISTILL scenarios as Given-When-Then in `docs/feature/{{STORY_ID}}/distill/scenarios.md`, plus a short DELIVER step plan. Commit the docs only, then stop.
2. **Design exists:** take the next unimplemented scenario(s) from `distill/scenarios.md`. For each one, write the executable acceptance test (`tests/acceptance/{{STORY_ID}}-*.test.ts`, driving the domain through its public functions), watch it fail, implement until it passes (RED → GREEN → refactor → COMMIT), then mark it done in `scenarios.md`. Continue until every scenario is done, or until you approach the diff cap. Use the rigor profile in `.nwave/des-config.json`.
3. **All scenarios done:** wire the UI so the story outcome works end to end on a phone, and add or extend an e2e smoke test in `tests/e2e/`. The owner's protected scenarios will judge the result.

Story outcome (from the owner's roadmap): {{STORY_OUTCOME}}
Commit messages: `{{STORY_ID}}: <imperative summary>`.
