#!/usr/bin/env node
// Did this tick actually use nWave, not just name it? Reads the Claude transcript and checks that
// (a) the required wave commands were invoked for the mode, and
// (b) every invoked wave command was FOLLOWED: its delegated nWave agents appear in the transcript
//     (run 7 invoked /nw-deliver etc. but wrote everything itself).
// (c) a story that finishes DELIVER in this tick with UI changes got the frontend-design visual pass
//     (nWave's crafters can't load skills, so the main session runs it; see factory/modes/deliver.md).
// Prints JSON { ok, mode, skills, agents, missing, warnings }.
// Usage: node scripts/factory/nwave-check.mjs <mode> <transcript.json> [<story-id> <tick-start-sha>]
import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";

const [mode, path, story, start] = process.argv.slice(2);
const git = (...args) => execFileSync("git", args, { encoding: "utf8" }).trim();
const raw = JSON.parse(readFileSync(path, "utf8"));
const messages = Array.isArray(raw) ? raw : (raw.messages ?? []);

const skills = new Set();
const agents = new Set();
for (const m of messages) {
  for (const c of m?.message?.content ?? []) {
    if (c?.type !== "tool_use") continue;
    const input = c.input ?? {};
    if (c.name === "Skill" && typeof input.skill === "string") skills.add(input.skill.replace(/^\//, ""));
    if ((c.name === "Task" || c.name === "Agent") && typeof input.subagent_type === "string") agents.add(input.subagent_type);
    if (c.name === "SlashCommand" && typeof input.command === "string") skills.add(input.command.replace(/^\//, "").split(" ")[0]);
  }
}

const anyAgent = (...names) => names.some((n) => agents.has(n));
const anyReviewer = () => [...agents].some((a) => /^nw-.*-reviewer$/.test(a));
const CRAFTERS = ["nw-software-crafter", "nw-functional-software-crafter"];
const ARCHITECTS = ["nw-solution-architect", "nw-system-designer", "nw-ddd-architect"];

// Each wave command must dispatch its own agents; invoking the skill and then writing the artifacts yourself is a violation.
const delegation = {
  "nw-discuss": ["nw-product-owner", () => anyAgent("nw-product-owner")],
  "nw-design": ["an nWave architect agent", () => anyAgent(...ARCHITECTS)],
  "nw-devops": ["nw-platform-architect", () => anyAgent("nw-platform-architect")],
  "nw-distill": ["nw-acceptance-designer and a reviewer", () => anyAgent("nw-acceptance-designer") && anyReviewer()],
  "nw-deliver": ["a crafter agent and a reviewer", () => anyAgent(...CRAFTERS) && anyReviewer()],
  "nw-execute": ["a crafter agent", () => anyAgent(...CRAFTERS)],
};

const requirements = [];
if (mode === "plan") {
  requirements.push(["/nw-discuss", skills.has("nw-discuss")]);
  requirements.push(["/nw-design", skills.has("nw-design")]);
  requirements.push(["/nw-devops", skills.has("nw-devops")]);
  requirements.push(["nw-product-owner-reviewer", agents.has("nw-product-owner-reviewer")]);
  requirements.push(["nw-solution-architect-reviewer", agents.has("nw-solution-architect-reviewer")]);
}
if (mode === "deliver") {
  requirements.push(["/nw-distill or /nw-deliver", skills.has("nw-distill") || skills.has("nw-deliver")]);
}
const warnings = [];
if (mode === "deliver" && story && start) try {
  // Finalize (Phase 7) archives the story as docs/evolution/<date>-<story>.md.
  const finalized = git("diff", "--name-only", "--diff-filter=A", `${start}..HEAD`, "--", "docs/evolution")
    .split("\n").some((f) => f.endsWith(`-${story}.md`));
  const touchedUi = finalized && git("log", "--format=", "--name-only", `--grep=^${story}:`, "HEAD", "--",
    "src/ui", "index.html", ":(glob)src/**/*.css") !== "";
  if (touchedUi) requirements.push(["frontend-design visual pass (finished story touched UI)",
    [...skills].some((s) => /(^|:)frontend-design$/.test(s))]);
} catch (e) {
  warnings.push(`visual-pass check skipped: ${e.message.split("\n")[0]}`);
}
if (mode !== "fix") {
  for (const [skill, [need, followed]] of Object.entries(delegation)) {
    if (skills.has(skill)) requirements.push([`/${skill} followed (dispatched ${need})`, followed()]);
  }
}

const missing = requirements.filter(([, ok]) => !ok).map(([name]) => name);
const result = { ok: missing.length === 0, mode, skills: [...skills].sort(), agents: [...agents].sort(), missing, warnings };
console.log(JSON.stringify(result));
