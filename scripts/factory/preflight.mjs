#!/usr/bin/env node
// Token-free preflight for every factory tick. Decides whether the agent runs, and in which mode.
// Reads ONLY machine state (labels, check results, workflow runs, repo files) - never Issue/PR/comment text.
// Writes GITHUB_OUTPUT: run, mode (plan|deliver|fix), story_id, story_title, pr, reason
import { execFileSync } from "node:child_process";
import { appendFileSync, existsSync, readFileSync } from "node:fs";

const OWNER = process.env.FACTORY_OWNER;
const REPO = process.env.GITHUB_REPOSITORY;
const config = JSON.parse(readFileSync("factory/config.json", "utf8"));
const gh = (...args) => execFileSync("gh", args, { encoding: "utf8" });
const ghJson = (...args) => JSON.parse(gh(...args) || "null");

const output = (fields) => {
  const lines = Object.entries(fields).map(([k, v]) => `${k}=${v ?? ""}`);
  console.log(lines.join("\n"));
  if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `${lines.join("\n")}\n`);
};
const stop = (reason) => {
  output({ run: "false", reason });
  process.exit(0);
};
const ensureIssue = (title, labels) => {
  const existing = ghJson("issue", "list", "--state", "open", "--label", labels[0], "--json", "number", "--limit", "1");
  if (existing.length) return;
  gh("issue", "create", "--title", title, "--body", "Opened automatically by the factory preflight. See the linked workflow run.", ...labels.flatMap((l) => ["--label", l]));
};

// 1. Actor allowlist (schedule runs as the last editor of the workflow; dispatch as the clicker)
const allowedActors = new Set([OWNER, "github-actions[bot]"]);
if (!allowedActors.has(process.env.GITHUB_ACTOR)) stop(`actor ${process.env.GITHUB_ACTOR} not allowed`);

// 2. Kill switch
if (config.paused === true) stop("factory/config.json paused=true");
const stopIssues = ghJson("issue", "list", "--state", "open", "--label", "factory:stop", "--json", "number");
if (stopIssues.length) stop(`kill switch: issue #${stopIssues[0].number} has label factory:stop`);

// 3. Weekly budget: count ticks in the last 7 days where the agent job actually ran
const since = new Date(Date.now() - 7 * 864e5).toISOString().slice(0, 10);
const runs = ghJson("api", `repos/${REPO}/actions/workflows/factory-tick.yml/runs?created=>=${since}&per_page=100`).workflow_runs ?? [];
let ticks = 0;
for (const run of runs) {
  const jobs = ghJson("api", `repos/${REPO}/actions/runs/${run.id}/jobs`).jobs ?? [];
  if (jobs.some((j) => j.name === "agent" && j.conclusion && j.conclusion !== "skipped")) ticks++;
}
if (ticks >= config.max_ticks_per_week) stop(`weekly budget reached: ${ticks}/${config.max_ticks_per_week} ticks in 7 days`);

// 3b. Real plan usage (whole account: factory + owner). Owner's headroom always wins.
const usageFile = process.env.USAGE_FILE;
const usage = usageFile && existsSync(usageFile) ? JSON.parse(readFileSync(usageFile, "utf8")) : { ok: false };
const u = config.usage;
const hour = Number(new Intl.DateTimeFormat("en-GB", { hour: "numeric", hourCycle: "h23", timeZone: u.timezone }).format(new Date()));
const night = u.night_start_hour > u.night_end_hour ? hour >= u.night_start_hour || hour < u.night_end_hour : hour >= u.night_start_hour && hour < u.night_end_hour;
const pct = (x) => `${Math.round((x ?? 0) * 100)}%`;
let usageNote = "usage: no reading (tick-count fallback only)";
if (usage.ok) {
  const fiveCap = night ? u.five_hour_night_max : u.five_hour_day_max;
  usageNote = `usage: 5h ${pct(usage.five_hour)}/${pct(fiveCap)} (${night ? "night" : "day"}), 7d ${pct(usage.seven_day)}/${pct(u.weekly_max)}`;
  if (usage.status && usage.status !== "allowed") stop(`plan usage status ${usage.status}; ${usageNote}`);
  if ((usage.seven_day ?? 0) >= u.weekly_max) stop(`weekly usage cap reached; ${usageNote}`);
  if ((usage.five_hour ?? 0) >= fiveCap) stop(`5-hour usage cap reached; ${usageNote}`);
}
const modelWindowFull = (name) => usage.ok && (usage[name] ?? 0) >= u.model_weekly_max;

// 4. main must be green
const mainRuns = ghJson("run", "list", "--workflow", "ci.yml", "--branch", "main", "--limit", "1", "--json", "conclusion,status");
if (mainRuns[0] && mainRuns[0].status === "completed" && mainRuns[0].conclusion !== "success") stop("main is red; fix it first");

// 5. One factory PR at a time
const prs = ghJson("pr", "list", "--state", "open", "--json", "number,headRefName,labels,statusCheckRollup", "--limit", "50")
  .filter((p) => p.headRefName.startsWith("claude/"));
if (prs.length) {
  const pr = prs[0];
  const labels = pr.labels.map((l) => l.name);
  const checks = pr.statusCheckRollup ?? [];
  const pending = checks.some((c) => (c.status && c.status !== "COMPLETED") || c.state === "PENDING");
  const failed = checks.filter((c) => ["FAILURE", "ERROR", "TIMED_OUT", "CANCELLED"].includes(c.conclusion ?? c.state));
  const storyId = (pr.headRefName.match(/S-\d{3}|plan/) ?? [""])[0];
  if (labels.includes("needs-human")) stop(`PR #${pr.number} waits for the owner (needs-human)`);
  if (pending || checks.length === 0) stop(`PR #${pr.number} checks still running`);
  if (!failed.length) stop(`PR #${pr.number} is green and should auto-merge`);
  const fixes = labels.filter((l) => /^fix-\d$/.test(l)).length;
  if (fixes >= config.max_fix_cycles) {
    gh("pr", "close", String(pr.number), "--comment", `Closed after ${fixes} fix cycles. Story ${storyId} will be retried from main.`);
    stop(`PR #${pr.number} closed after ${fixes} fix cycles`);
  }
  gh("pr", "edit", String(pr.number), "--add-label", `fix-${fixes + 1}`);
  output({ run: "true", mode: "fix", story_id: storyId, story_title: "", pr: pr.number, reason: `fixing ${failed.map((c) => c.name ?? c.context).join(", ")}` });
  process.exit(0);
}

// 6. Next work item by evidence (protected scenarios on main)
const stories = JSON.parse(execFileSync("node", ["scripts/factory/stories.mjs"], { encoding: "utf8", stdio: ["ignore", "pipe", "inherit"] }));
const next = stories.next;
// No story with scenarios left -> nWave plan run (DISCUSS/DESIGN: next stories, their scenarios, ADRs)
const needsPlan = !next || next.status === "no-scenarios";
const workId = needsPlan ? "plan" : next.id;
const attempts = ghJson("pr", "list", "--state", "closed", "--search", `head:claude/${workId}-`, "--json", "number,mergedAt,closedAt", "--limit", "50")
  .filter((p) => !p.mergedAt && (workId !== "plan" || Date.now() - new Date(p.closedAt).getTime() < 7 * 864e5)).length;
if (attempts >= config.max_story_attempts) {
  ensureIssue(`Factory blocked on ${workId} after ${attempts} failed attempts`, ["factory:stop", "needs-human"]);
  stop(`${workId} blocked after ${attempts} attempts`);
}
const progress = `done ${stories.doneCount}/${stories.stories.length}, ticks ${ticks}/${config.max_ticks_per_week}, ${usageNote}`;
// Opus weekly window nearly full -> plan with Sonnet instead (keeps the factory moving)
const planModel = modelWindowFull("seven_day_opus") ? "sonnet" : "";
if (needsPlan) {
  output({ run: "true", mode: "plan", story_id: "plan", story_title: "Plan the next stories", pr: "", model_override: planModel, reason: `plan (${progress})` });
} else {
  output({ run: "true", mode: "deliver", story_id: next.id, story_title: next.title, pr: "", reason: `deliver ${next.id} (${progress})` });
}
