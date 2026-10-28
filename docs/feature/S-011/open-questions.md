# S-011 open questions / hand-off

- **Line cap:** steps 01-01 to 01-05 are committed (~860 changed lines against the 1,200 cap, docs excluded). Moving in the held-out e2e spec (359 lines) plus the "League position" line (step 01-06) would pass the cap, so this tick stopped; the next tick resumes at step 01-06 and then 01-07 (inbox-source file move, close-out, delete `distill/pending/`). Remaining held-out: `pending/e2e/S-011-inbox.spec.ts.pending`, `pending/acceptance/inbox-source.test.ts.pending`. If step 01-06 still exceeds the cap, ship it as its own PR after this one merges (the diff is then measured from the new main).
- DELIVER phases not yet run: refactor pass, adversarial review, integrity verification, finalize, visual pass.
