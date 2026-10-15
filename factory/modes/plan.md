## Mode: plan (nWave decides what to build next, and how)

No story in `docs/roadmap.yaml` is ready for delivery, so plan **exactly one** next story through nWave's DISCUSS → DESIGN → DEVOPS waves, **using nWave's commands, not your own approximation of them**. CI reads this session's transcript and blocks a plan PR that didn't invoke `/nw-discuss`, `/nw-design`, `/nw-devops` and the nWave reviewer agents. There is no human to ask. The plan merges automatically if CI and the AI reviewer accept it, so make it good.

**Feature-id:** the next free story id, `S-NNN` (one more than the highest in `docs/roadmap.yaml`). Use it as the nWave feature-id everywhere, so DISTILL, roadmap and execute in later deliver runs find these artifacts in `docs/feature/S-NNN/`.

Pre-answered nWave questions:
- `/nw-discuss S-NNN --interactive=moderate`. Every confirmation is approved as proposed. The project brief is `docs/product/brief.md`; scope and precedence are in `docs/product/scope.md`. JTBD is on: add or extend jobs in `docs/product/jobs.yaml`, and trace the story to a `job_id`.
- `/nw-design S-NNN`: design scope (Decision 0) is **Application**, in **propose** mode. The team is one solo developer plus this factory, as one team with no Conway constraints. Paradigm follows the accepted ADRs; don't write it into `CLAUDE.md`, which is locked.
- `/nw-devops S-NNN`, with all nine decisions fixed by the platform. Deployment target: static site on GitHub Pages. Container orchestration: none. CI/CD: the existing GitHub Actions workflows (`ci`, `deploy`, `nightly`, factory). These are owner-locked, so record any change you need under "Open questions" in `feature-delta.md` rather than editing `.github/`. Existing infrastructure: yes, as above. Observability: browser console and Playwright smoke tests on the deployed URL only. Deployment strategy: recreate (deploy on merge to main). Continuous learning: no. Branching: trunk-based, short-lived `claude/*` branches, squash merge. Mutation testing: `nightly-delta`.
- Expansion menus: always skip.

Inputs, in precedence order:
1. `docs/product/brief.md` (vision, north star, principles)
2. `docs/product/scope.md` (IN/OUT; OUT is absolute)
3. `docs/product/architecture/` (`brief.md` and the accepted `adr-*.md`)
4. `docs/roadmap.yaml` (what exists)
5. the current code

Steps:
1. **DISCUSS** via `/nw-discuss S-NNN`. Find the smallest next increment that moves the player toward the north star and gives a visible, playable change on a phone this week. nWave writes `docs/feature/S-NNN/feature-delta.md`, plus slices, jobs, journeys and personas under `docs/product/`. Append the story to `docs/roadmap.yaml` (`id`, `week`, `title`, `tags`, `outcome`), keeping existing stories and ids unchanged. The `outcome` must be phone-observable and must spell out every label, role, range and format the scenarios will check. Never use the out-of-scope tags: {{OUT_OF_SCOPE_TAGS}}.
2. **DESIGN** via `/nw-design S-NNN`. Make the technical decisions this story needs, such as rendering approach and libraries (pixi.js or not), UI framework or none, state and domain architecture (ECS, functional pipeline, plain modules), persistence, package manager and test tooling.
   - Keep `docs/product/architecture/brief.md` current, including its **"For Acceptance Designer" driving-ports section**, which DISTILL depends on.
   - Record each new decision as `docs/product/architecture/adr-NNNN-title.md` (Context, Options with trade-offs, Decision, Consequences). Prefer reversible, boring, small-dependency choices.
   - To change an accepted ADR, write a new one that supersedes it and says why.
   - If an ADR changes tooling, implement the switch in this PR only if it stays within the diff cap and keeps every `ci:*` script (see `CLAUDE.md`) working.
3. **DEVOPS** via `/nw-devops S-NNN` (answers above). It writes the DEVOPS section of `feature-delta.md`, including the environment matrix DISTILL reads. Keep it lean: usually "no platform change; phone-viewport Chromium in CI and the deployed Pages URL".
4. **Peer review.** In the foreground, dispatch the `nw-product-owner-reviewer` agent on the DISCUSS sections of `feature-delta.md`, and the `nw-solution-architect-reviewer` agent on the DESIGN sections, `architecture/brief.md` and any new ADRs. Ask each for a YAML `approval_status`, fold in their findings (at most 2 revision cycles), and record unresolved disagreements in the ADR. `/nw-review` only accepts roadmap, step, task, implementation and baseline artifacts, so dispatch these reviewers directly.
5. **Protected scenarios** for the story: `tests/protected/S-NNN/*.spec.ts`, 2–5 black-box Playwright scenarios.
   - Use only what a player sees (roles, accessible names, visible text) on a phone viewport.
   - Prefer properties that hold for any seed over hard-coded values.
   - **They must fail on the current app.** CI checks this. Once merged they're permanent and can't be changed, so write the player's real expectations, not easy targets.
6. Don't implement features in this run. Deliver runs do that with DISTILL, then DELIVER. Tooling or architecture scaffolding that an ADR requires is allowed.

Commit messages: `plan: S-NNN <summary>`.
