## Mode: deliver (story {{STORY_ID}}: {{STORY_TITLE}})

Advance story {{STORY_ID}} through nWave's documented flow, **using nWave's commands, not your own approximation of them**. CI reads this session's transcript and blocks a PR that didn't invoke the required nWave skills or agents.
The story is an nWave feature with feature-id **`{{STORY_ID}}`**: every artifact lives in `docs/feature/{{STORY_ID}}/`. Check what exists there, then do as many of these steps as fit in one run, in order:

0. **No DISCUSS/DESIGN for this feature** (`docs/feature/{{STORY_ID}}/feature-delta.md` is missing, or has no `## Wave: DISCUSS` or `## Wave: DESIGN` section). This applies to older stories planned before the factory used nWave properly. Run `/nw-discuss {{STORY_ID}} --interactive=moderate`, then `/nw-design {{STORY_ID}}`, with the plan-mode pre-answers below. Keep both lean: the story outcome below is already decided, so don't re-scope it.
1. **No DISTILL** (`feature-delta.md` has no `## Wave: DISTILL` section): run `/nw-distill {{STORY_ID}}`. Pre-answered: every port classification and the soft-gate table are approved as proposed. Driving ports come from the "For Acceptance Designer" section of `docs/product/architecture/brief.md`. Choose in-memory or real adapters per the accepted ADRs, and record the choice. Its mandatory reviewers must run, in the foreground.
2. **No build plan** (`docs/feature/{{STORY_ID}}/deliver/roadmap.json` missing): run `/nw-roadmap @nw-solution-architect "{{STORY_ID}}: {{STORY_TITLE}}"` and state that the feature-id is `{{STORY_ID}}`. The skill derives a folder from the goal text, so if it wrote anywhere other than `docs/feature/{{STORY_ID}}/deliver/roadmap.json`, move the file there and re-run `des-roadmap validate`. Make **one step per DISTILL scenario**, each with its `test_file` and `scenario_name`. UI wiring belongs inside the steps (port-to-port), not after them. Then, if `docs/feature/{{STORY_ID}}/deliver/execution-log.json` is missing, run `des-init-log --project-dir docs/feature/{{STORY_ID}}/deliver --feature-id {{STORY_ID}}`.
3. **Build:** for the next pending step, run `/nw-execute @<crafter> {{STORY_ID}} <step-id>` (RED → GREEN → COMMIT). `/nw-execute` does **not** review, so after each step run `/nw-review @nw-software-crafter implementation "docs/feature/{{STORY_ID}}/deliver/execution-log.json" step_id=<step-id>` and fold in its findings (at most 2 revision cycles). Then take the next step if it still fits under the diff cap.
4. **All steps done:** run `des-verify-integrity docs/feature/{{STORY_ID}}/deliver/` and fix any violation by re-running `/nw-execute` for that step. Open the app in the Playwright browser on a phone viewport and walk the outcome. Extend `tests/e2e/`. The protected scenarios then judge the story.

`<crafter>` is `@nw-functional-software-crafter` when the accepted ADRs choose a functional paradigm (ADR-0003 does), otherwise `@nw-software-crafter`.
Plan-mode pre-answers, for step 0: design scope (Decision 0) is Application, in propose mode. The team is one solo developer plus this factory. Don't write the paradigm into `CLAUDE.md`, which is locked; the ADR records it. The project brief is `docs/product/brief.md`. Expansion menus: always skip.
**Every tick must leave the branch fully green.** Never commit a failing, skipped or `.todo` test. Commit after each green step.
Follow the accepted ADRs. If one is wrong, write a superseding ADR through `/nw-design`; never deviate silently.

Story outcome: {{STORY_OUTCOME}}
Commit messages: `{{STORY_ID}}: <imperative summary>`.
