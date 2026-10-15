## Mode: deliver (story {{STORY_ID}}: {{STORY_TITLE}})

Advance story {{STORY_ID}} by the next nWave step, as `/nw-continue` would. Look in `docs/feature/{{STORY_ID}}/` and `docs/adrs/` to see what exists. **Every tick must leave the branch fully green.** CI rejects failing, skipped or `.todo` tests, so never commit a test you have not made pass.

1. **No DISTILL scenarios yet:** write lean DISTILL acceptance scenarios (Given-When-Then) in `docs/feature/{{STORY_ID}}/distill/scenarios.md`, plus a short DELIVER step plan. If the story needs a technical decision no ADR covers, write that ADR first (nw-solution-architect, propose mode, reviewed by solution-architect-reviewer). Commit, then stop.
2. **Scenarios exist:** take the next unimplemented scenario(s). For each one, write the executable acceptance test (`tests/acceptance/`, driving the domain through its public interface), watch it fail, implement until it passes (RED → GREEN → refactor → COMMIT, with nWave crafter and reviewer per `.nwave/des-config.json`), then mark it done in `scenarios.md`. Continue until all scenarios are done, or until you approach the diff cap.
3. **All scenarios done:** wire the UI so the story outcome works end to end on a phone, and add or extend an e2e smoke test in `tests/e2e/`. The protected scenarios will judge the result.

Follow the accepted ADRs. If one turns out wrong, supersede it with a new ADR in a separate tick instead of silently deviating.

Story outcome: {{STORY_OUTCOME}}
Commit messages: `{{STORY_ID}}: <imperative summary>`.
