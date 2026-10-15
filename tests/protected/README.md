# Protected story scenarios (append-only)

`tests/protected/<story-id>/*.spec.ts`: black-box Playwright scenarios written in nWave plan runs.
- They run under the locked runner `scripts/factory/protected.playwright.config.ts`, against the production build served by the `ci:serve` script.
- Adding files is allowed. **Modifying or deleting a merged file fails CI.**
- Every new scenario must FAIL against `main` when it is added, so it can't pass trivially. CI checks this.
- Use only what a player sees: roles, accessible names and visible text, on a phone viewport. No CSS classes, test IDs or internals.
