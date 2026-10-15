## Mode: deliver (story {{STORY_ID}}: {{STORY_TITLE}})

Advance story {{STORY_ID}} through nWave's documented flow, **DISCUSS → DESIGN → DEVOPS → DISTILL → DELIVER**, using nWave's commands, not your own approximation of them. CI reads this session's transcript and blocks a PR that didn't invoke the required nWave skills.
The story is an nWave feature with feature-id **`{{STORY_ID}}`**: everything lives in `docs/feature/{{STORY_ID}}/` (`feature-delta.md`, `slices/`, `deliver/`). Look at what exists, then continue from the first wave that is missing:

1. **DISCUSS, DESIGN or DEVOPS missing** (`feature-delta.md` lacks a `## Wave: DISCUSS`, `## Wave: DESIGN` or `## Wave: DEVOPS` section). This happens for stories planned before the factory used nWave properly. Run whichever is missing, in order: `/nw-discuss {{STORY_ID}} --interactive=moderate`, `/nw-design {{STORY_ID}}`, `/nw-devops {{STORY_ID}}`, with the pre-answers below. The story outcome is already decided, so don't re-scope it.
2. **DISTILL missing** (no `## Wave: DISTILL` section): run `/nw-distill {{STORY_ID}}`. Every port classification and the soft-gate table are approved as proposed. Driving ports come from the "For Acceptance Designer" section of `docs/product/architecture/brief.md`. Its mandatory reviewers run in the foreground.
3. **DELIVER:** run `/nw-deliver {{STORY_ID}}`. It creates or reuses the roadmap and the audit log, then executes steps in **resume mode**, picking up where the last tick stopped.
   - Respect the rigor profile in `.nwave/des-config.json`.
   - Mutation testing strategy is `nightly-delta` (see `CLAUDE.md`), so Phase 5 is skipped.
   - **Phase 7 (Finalize):** archive and commit, but **do not push**; the workflow publishes the branch.
   - If you are running low on turns or approaching the diff cap (~1200 lines), finish the current step green, commit, and stop. The next tick resumes.
4. Before your final commit, open the app in the Playwright browser on a phone viewport and walk the outcome so far. The protected scenarios judge the story once DELIVER is complete.

**Follow each skill, don't imitate it.** Every nWave command dispatches its own agents:
- DISCUSS → `nw-product-owner`
- DESIGN → an architect
- DEVOPS → `nw-platform-architect`
- DISTILL → `nw-acceptance-designer` plus reviewers
- DELIVER → the crafter for every step, plus reviewers, with `roadmap.json`, the DES log and `des-verify-integrity`

Writing a wave's artifacts yourself, or implementing code without the crafter, is a violation. CI checks the transcript and the DELIVER artifacts, and rejects the PR. Lean documentation density is fine; skipping the agents is not.
**DES hook:** nWave 3.22.x's pre-bash hook wrongly blocked its own `des-*` commands. This runner patches it, so `des-commit`, `des-log-phase`, `des-init-log` and `des-verify-integrity` work as the skills describe. **Never obfuscate a command to get past a hook or guard.** If it's still blocked, stop and record it in `docs/feature/{{STORY_ID}}/open-questions.md`.

**Pre-answers** (for any wave you run):
- DISCUSS: the project brief is `docs/product/brief.md`, and scope is in `docs/product/scope.md`. JTBD is on.
- DESIGN: Decision 0 (scope) is Application, in propose mode, with one solo team. Don't write the paradigm into `CLAUDE.md`; the ADR records it.
- `/nw-devops {{STORY_ID}}`, with all nine decisions fixed by the platform. Deployment target: static site on GitHub Pages. Container orchestration: none. CI/CD: the existing GitHub Actions workflows (`ci`, `deploy`, `nightly`, factory). These are owner-locked, so record any change you need under "Open questions" in `feature-delta.md` rather than editing `.github/`. Existing infrastructure: yes, as above. Observability: browser console and Playwright smoke tests on the deployed URL only. Deployment strategy: recreate (deploy on merge to main). Continuous learning: no. Branching: trunk-based, short-lived `claude/*` branches, squash merge. Mutation testing: `nightly-delta`.
- Expansion menus: always skip.

**Every tick must leave the branch fully green.** Never commit a failing, skipped or `.todo` test.
Follow the accepted ADRs in `docs/product/architecture/`. If one is wrong, supersede it through `/nw-design`; never deviate silently.

Story outcome: {{STORY_OUTCOME}}
Commit messages: `{{STORY_ID}}: <imperative summary>`.
