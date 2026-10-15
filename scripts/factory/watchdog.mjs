#!/usr/bin/env node
// Daily watchdog: judges the factory on outcomes (merged PRs, main health), not on run status.
// Trips the kill switch by opening a `factory:stop` issue. The owner removes the label to resume.
import { execFileSync } from "node:child_process";

const REPO = process.env.GITHUB_REPOSITORY;
const gh = (...args) => execFileSync("gh", args, { encoding: "utf8" });
const ghJson = (...args) => JSON.parse(gh(...args) || "null");
const hoursAgo = (iso) => (Date.now() - new Date(iso).getTime()) / 36e5;

const alarms = [];

// main red for more than 12h
const main = ghJson("run", "list", "--workflow", "ci.yml", "--branch", "main", "--limit", "20", "--json", "conclusion,createdAt,status");
const lastGreen = main.find((r) => r.conclusion === "success");
if (main[0]?.conclusion === "failure" && (!lastGreen || hoursAgo(main[0].createdAt) > 12)) alarms.push("main has been red for more than 12h");

// Last 3 agent jobs failed
const ticks = ghJson("api", `repos/${REPO}/actions/workflows/factory-tick.yml/runs?per_page=30`).workflow_runs ?? [];
const agentResults = [];
for (const run of ticks) {
  const job = (ghJson("api", `repos/${REPO}/actions/runs/${run.id}/jobs`).jobs ?? []).find((j) => j.name === "agent");
  if (job && job.conclusion && job.conclusion !== "skipped") agentResults.push({ conclusion: job.conclusion, at: job.started_at });
  if (agentResults.length >= 6) break;
}
if (agentResults.length >= 3 && agentResults.slice(0, 3).every((r) => r.conclusion !== "success")) {
  alarms.push("the last 3 agent ticks failed");
}

// No merged factory PR in 48h despite at least 3 agent ticks in that window
const recentTicks = agentResults.filter((r) => hoursAgo(r.at) <= 48).length;
const merged = ghJson("pr", "list", "--state", "merged", "--search", "head:claude/", "--json", "mergedAt", "--limit", "20")
  .filter((p) => hoursAgo(p.mergedAt) <= 48).length;
if (recentTicks >= 3 && merged === 0) alarms.push(`no factory PR merged in 48h (${recentTicks} agent ticks ran)`);

console.log(alarms.length ? `ALARMS:\n- ${alarms.join("\n- ")}` : "Factory healthy.");
if (alarms.length) {
  const open = ghJson("issue", "list", "--label", "factory-stalled", "--state", "open", "--json", "number");
  if (!open.length) {
    gh("issue", "create", "--title", "Factory stalled - kill switch engaged", "--label", "factory:stop", "--label", "factory-stalled", "--label", "needs-human",
      "--body", `The watchdog stopped the factory:\n- ${alarms.join("\n- ")}\n\nInvestigate, then close this issue (or remove \`factory:stop\`) to resume.`);
  }
}
