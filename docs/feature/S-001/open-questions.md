# Open questions (plan run, 2026-10-15)

These came from the nWave reviewers. Each is resolved with the narrower choice and recorded here for the owner.

1. **JTBD traceability (`job_id`).** The product-owner reviewer asked for a `job_id` per story pointing
   at `docs/product/jobs.yaml`. That folder is owner-locked and the roadmap schema
   (`scripts/factory/roadmap.mjs`) has no such field. Resolution: each journey quotes the brief's single
   job verbatim. If the owner wants formal job IDs, they can add `jobs.yaml`.
2. **Locking test and ratchet configs.** `stryker.config.mjs` says the factory cannot edit it, but it
   is not in the locked list (CLAUDE.md, `scripts/guards/pr-guards.mjs`), and neither are `vitest.config.ts`
   or `playwright.config.ts`. Resolution: leave them as is. This plan PR only *adds* a setupFiles entry for
   `FC_SEED`. The owner may want to lock them.
3. **Protected scenarios vs owner drafts.** S-001 and S-002 scenarios extend
   `docs/archive/owner-drafts/S-00x/*.spec.ts`. They add seed pinning, a 390px viewport, 44px tap
   targets, every-club coverage and a Back button. They are stricter than the drafts, never looser.
4. **Variety between new games.** With no `?seed=`, every new game shows the same league (ADR-0004).
   A later "new season" or "play again" story must decide how a fresh seed is chosen. The wall clock is
   allowed in the shell, never in the domain.
