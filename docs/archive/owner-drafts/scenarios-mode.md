## Mode: scenarios (story {{STORY_ID}}: {{STORY_TITLE}})

The next story has no owner-protected scenarios yet. Propose them. **The owner must approve them before any delivery starts.**
- Write `tests/protected/{{STORY_ID}}/*.spec.ts`: 2–5 black-box Playwright scenarios that use only what a player sees (roles, accessible names, visible text) on a phone viewport. Never use CSS classes or test IDs, and never use internals.
- Every scenario must describe the story outcome: {{STORY_OUTCOME}}
- Prefer properties that hold for any seed or club over hard-coded values. Example: "every listed player has a position", not "player 3 is called X".
- The scenarios must FAIL against the current app. Run them to check.
- Touch nothing else. This PR will be labelled `needs-human` and waits for the owner.
Commit message: `{{STORY_ID}}: propose protected scenarios`.
