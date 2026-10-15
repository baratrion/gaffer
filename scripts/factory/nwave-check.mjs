#!/usr/bin/env node
// Did this tick actually use nWave? Reads the Claude transcript and lists the nWave skills and agents invoked
// at the top level of the session. Prints JSON { ok, mode, skills, agents, missing, warnings }.
// Usage: node scripts/factory/nwave-check.mjs <mode> <transcript.json>
import { readFileSync } from "node:fs";

const [mode, path] = process.argv.slice(2);
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
    // A slash command typed into the session as text also counts
    if (c.name === "SlashCommand" && typeof input.command === "string") skills.add(input.command.replace(/^\//, "").split(" ")[0]);
  }
}

const usedAny = (skillNames, agentNames) =>
  skillNames.some((s) => skills.has(s)) || agentNames.some((a) => agents.has(a));
const reviewerUsed = skills.has("nw-review") || [...agents].some((a) => /^nw-.*-reviewer$/.test(a));

const requirements = {
  plan: [
    ["DISCUSS (/nw-discuss or nw-product-owner)", usedAny(["nw-discuss"], ["nw-product-owner"])],
    ["DESIGN (/nw-design or an nWave architect)", usedAny(["nw-design"], ["nw-solution-architect", "nw-system-designer", "nw-ddd-architect"])],
    ["product-owner review (nw-product-owner-reviewer)", agents.has("nw-product-owner-reviewer")],
    ["architect review (nw-solution-architect-reviewer)", agents.has("nw-solution-architect-reviewer")],
    ["DEVOPS (/nw-devops or nw-platform-architect)", usedAny(["nw-devops"], ["nw-platform-architect"])],
  ],
  deliver: [
    [
      "/nw-distill or /nw-deliver (or their agents: acceptance-designer, crafter)",
      usedAny(["nw-distill", "nw-deliver"], ["nw-acceptance-designer", "nw-software-crafter", "nw-functional-software-crafter"]),
    ],
  ],
  fix: [],
};
// /nw-execute doesn't review by itself; the deliver prompt requires /nw-review after each executed step.
if (mode === "deliver" && skills.has("nw-execute")) requirements.deliver.push(["/nw-review after /nw-execute", reviewerUsed]);

const missing = (requirements[mode] ?? []).filter(([, ok]) => !ok).map(([name]) => name);
const warnings = mode === "deliver" && !reviewerUsed && !skills.has("nw-execute") ? ["no nWave reviewer visible at top level"] : [];
const result = { ok: missing.length === 0, mode, skills: [...skills].sort(), agents: [...agents].sort(), missing, warnings };
console.log(JSON.stringify(result));
