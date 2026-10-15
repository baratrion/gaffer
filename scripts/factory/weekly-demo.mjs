#!/usr/bin/env node
// Friday demo issue: the owner's single weekly interface to the factory.
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const REPO = process.env.GITHUB_REPOSITORY;
const [owner, name] = REPO.split("/");
const gh = (...args) => execFileSync("gh", args, { encoding: "utf8" });
const ghJson = (...args) => JSON.parse(gh(...args) || "null");
const since = new Date(Date.now() - 7 * 864e5).toISOString().slice(0, 10);

const stories = JSON.parse(readFileSync("test-results/stories.json", "utf8"));
const merged = ghJson("pr", "list", "--state", "merged", "--search", `merged:>=${since}`, "--json", "number,title", "--limit", "100");
const waiting = ghJson("pr", "list", "--state", "open", "--label", "needs-human", "--json", "number,title");
const issues = ghJson("issue", "list", "--state", "open", "--label", "needs-human", "--json", "number,title");
const runs = ghJson("api", `repos/${REPO}/actions/workflows/factory-tick.yml/runs?created=>=${since}&per_page=100`).workflow_runs ?? [];
const config = JSON.parse(readFileSync("factory/config.json", "utf8"));

const week = process.env.WEEK ?? new Date().toISOString().slice(0, 10);

const body = `## Play it: https://${owner}.github.io/${name}/

**Stories done:** ${stories.doneCount}/${stories.stories.length}. Next: ${stories.next ? `${stories.next.id} ${stories.next.title} (${stories.next.status})` : "roadmap complete"}

### Merged this week (${merged.length})
${merged.map((p) => `- #${p.number} ${p.title}`).join("\n") || "- nothing merged"}

### Waiting for you
${[...waiting.map((p) => `- PR #${p.number} ${p.title}`), ...issues.map((i) => `- #${i.number} ${i.title}`)].join("\n") || "- nothing"}

### Budget
Tick workflow runs this week: ${runs.length} (agent cap ${config.max_ticks_per_week}/week). Check claude.ai/settings/usage and adjust \`factory/config.json\` if needed.

### Your 10-minute check-in
1. Play the build on your phone.
2. Skim new ADRs in \`docs/adrs/\` and new stories in \`docs/roadmap.yaml\`. nWave decided them; you only intervene if something's off.
3. Steer by editing \`docs/product/scope.md\` or \`docs/product/brief.md\`. **Comments are never read by the factory.**
4. To pause: add the label \`factory:stop\` to this issue.`;

gh("issue", "create", "--title", `Weekly demo ${week}`, "--label", "weekly-demo", "--body", body);
console.log(body);
