## Mode: deliver (story {{STORY_ID}}: {{STORY_TITLE}})

Advance story {{STORY_ID}} using **nWave's commands, not your own approximation of them**. CI reads this session's transcript, and a deliver PR that didn't invoke the required nWave skills or agents is blocked.
Check `docs/feature/{{STORY_ID}}/` and `docs/adrs/` for what exists, then do as many of these as fit in one run:

1. **No DISTILL output** (`docs/feature/{{STORY_ID}}/distill/` missing): run `/nw-distill {{STORY_ID}}`. Pre-answered: every port classification and the soft-gate table are approved as proposed. Choose in-memory or real adapters per ADR-0003, and note your choices in the distill output. Its mandatory peer review must run.
2. **No build plan** (`docs/feature/{{STORY_ID}}/deliver/roadmap.json` missing): run `/nw-roadmap @<crafter> "{{STORY_ID}}: {{STORY_TITLE}}. <outcome below>"`. Keep it to 2–5 small steps.
3. **Build**: run `/nw-execute @<crafter> {{STORY_ID}} <next pending step-id>` for the next step, then the one after if it still fits under the diff cap. Each step goes RED → GREEN → COMMIT with the crafter's reviewer, per `.nwave/des-config.json`.
4. **All steps done**: wire the UI so the outcome works end to end on a phone, check it in the Playwright browser, and extend `tests/e2e/`. Then the protected scenarios judge it.

`<crafter>` is `@nw-functional-software-crafter` when the accepted ADRs choose a functional paradigm (ADR-0003 does), otherwise `@nw-software-crafter`.
**Every tick must leave the branch fully green.** Never commit a failing, skipped or `.todo` test. Commit after each green step.
Follow the accepted ADRs. If one is wrong, write a superseding ADR through `/nw-design` in a later tick; never deviate silently.

Story outcome: {{STORY_OUTCOME}}
Commit messages: `{{STORY_ID}}: <imperative summary>`.
