## Mode: deliver (story {{STORY_ID}}: {{STORY_TITLE}})

Advance story {{STORY_ID}} through nWave's documented flow, **DISCUSS → DESIGN → DEVOPS → DISTILL → DELIVER**, using nWave's commands, not your own approximation of them. CI reads this session's transcript and blocks a PR that didn't invoke the required nWave skills.
The story is an nWave feature with feature-id **`{{STORY_ID}}`**: everything lives in `docs/feature/{{STORY_ID}}/` (`feature-delta.md`, `slices/`, `deliver/`). Look at what exists, then continue from the first wave that is missing:

1. **DISCUSS, DESIGN or DEVOPS missing** (`feature-delta.md` lacks a `## Wave: DISCUSS`, `## Wave: DESIGN` or `## Wave: DEVOPS` section). This happens for stories planned before the factory used nWave properly. Run whichever is missing, in order: `/nw-discuss {{STORY_ID}} --interactive=moderate`, `/nw-design {{STORY_ID}}`, `/nw-devops {{STORY_ID}}`, with the pre-answers below. The story outcome is already decided, so don't re-scope it.
2. **DISTILL missing** (no `## Wave: DISTILL` section): run `/nw-distill {{STORY_ID}}`. Every port classification and the soft-gate table are approved as proposed. Driving ports come from the "For Acceptance Designer" section of `docs/product/architecture/brief.md`. Its mandatory reviewers run in the foreground.
3. **DELIVER:** run `/nw-deliver {{STORY_ID}}`. It creates or reuses the roadmap and the audit log, then executes steps in **resume mode**, picking up where the last tick stopped.
   - **Phase 1 (roadmap): the architect writes `roadmap.json`, but you set it up the way `/nw-roadmap` prescribes, not with your own brief.** (1) Run `des-roadmap init --project-id {{STORY_ID}} --goal "<story title>" --output docs/feature/{{STORY_ID}}/deliver/roadmap.json` for the skeleton (never write the file by hand). (2) Dispatch `nw-solution-architect` with `/nw-roadmap`'s minimal prompt: the skeleton path plus the goal, asking it to replace every TODO and keep the structure. Do not put step ids (`01-01` etc.) or a step breakdown in that prompt: the DES pre-Agent hook reads any `step NN-NN` text as step execution and blocks it with `DES_MARKERS_MISSING`. Point it at `docs/feature/{{STORY_ID}}/` and the DISTILL scenarios instead; the architect decides the steps. (3) Run `des-roadmap validate` on the file, then the rest of Phase 1 as `/nw-deliver` describes. (S-002's first attempt skipped `des-roadmap init`, wrote its own prompt that mentioned "step 01-01", and was blocked.)
   - **If a DES hook still blocks you:** don't add `DES-ENFORCEMENT : exempt` markers, don't reword a prompt to dodge the pattern, and don't write the file yourself. Record the exact block in `docs/feature/{{STORY_ID}}/open-questions.md`, commit what is done, and finish with the summary; nobody is there to answer a question.
   - Respect the rigor profile in `.nwave/des-config.json`.
   - Mutation testing strategy is `nightly-delta` (see `CLAUDE.md`), so Phase 5 is skipped.
   - **Phase 7 (Finalize):** archive and commit, but **do not push**; the workflow publishes the branch.
   - If you are running low on turns or approaching the diff cap (~1200 lines), finish the current step green, commit, and stop. The next tick resumes.
4. **Visual pass (only in the tick where DELIVER completes, i.e. Phase 7 archived the story to `docs/evolution/`, and only if the story's commits touched `src/ui/`, `index.html` or CSS).** nWave's crafters cannot load skills, so you do this yourself, after `/nw-deliver` returns:
   - Invoke the **frontend-design** skill. The brief is the story outcome plus `docs/product/scope.md`; it counts as the client's confirmation, so don't stop to ask. Keep the visual identity (pitch green, chalk and gold; tokens in the stylesheet) unless an ADR changes it.
   - Read `docs/product/ui/design-system.md` if it exists and extend it; if not, create it with the tokens, type scale and component patterns you settle on. Later stories build on it, so the game stays one design rather than a redesign per story.
   - Change presentation only: CSS, class names, wrapper elements, copy styling. Never touch `src/domain/`, game or navigation logic, or tests, and keep every accessible role and name (buttons, headings, list names) exactly as it is.
   - Serve the build (`ci:serve`), screenshot the story's screens in the Playwright browser, critique them against the plan, and iterate.
   - Then run `ci:lint`, `ci:typecheck`, `ci:test` and `ci:e2e`. If anything fails, revert the pass (`git restore`) rather than changing a test. Keep it within the story's screens and the shared design system, inside the diff cap.
   - Commit it on its own as `{{STORY_ID}}: visual pass (frontend-design)` and describe what changed in `factory-out/summary.md`. CI requires the frontend-design skill in this tick's transcript when a finished story touched UI.
5. Before your final commit, open the app in the Playwright browser on a phone viewport and walk the outcome so far. The protected scenarios judge the story once DELIVER is complete.

**Follow each skill, don't imitate it.** Every nWave command dispatches its own agents:
- DISCUSS → `nw-product-owner`
- DESIGN → an architect
- DEVOPS → `nw-platform-architect`
- DISTILL → `nw-acceptance-designer` plus reviewers
- DELIVER → the crafter for every step, plus reviewers, with `roadmap.json`, the DES log and `des-verify-integrity`

Writing a wave's artifacts yourself, or implementing code without the crafter, is a violation. The one exception is the presentation-only visual pass in step 4. CI checks the transcript and the DELIVER artifacts, and rejects the PR. Lean documentation density is fine; skipping the agents is not.
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
