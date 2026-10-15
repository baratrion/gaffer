## Mode: fix (PR #{{PR}}, work item {{STORY_ID}})

You are on this PR's branch. Its required checks failed. The failing check logs are in `factory-out/failures.txt`, and the AI reviewer's findings (if any) are in `factory-out/review.md`. Both were produced by this repository's own workflows.
Fix the root cause with the smallest change. Never weaken tests or checks, and never edit locked paths. If the PR is a plan and CI says a new protected scenario already passes on main, make that scenario test real new behaviour; it is still unmerged, so you may edit it. If a review finding is wrong, explain why in `factory-out/summary.md` instead of complying.
Commit messages: `{{STORY_ID}}: fix <what>`.
