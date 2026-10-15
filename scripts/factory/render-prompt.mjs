#!/usr/bin/env node
// Builds the tick prompt ONLY from owner-controlled files (factory/*) plus the roadmap. Never from Issue/PR text.
// Usage: node scripts/factory/render-prompt.mjs <mode> <story-id|plan> [pr]
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { loadRoadmap } from "./roadmap.mjs";

const [mode, workId, pr = ""] = process.argv.slice(2);
if (!["plan", "deliver", "fix"].includes(mode)) throw new Error(`unknown mode ${mode}`);
if (!/^(S-\d{3}|plan)$/.test(workId ?? "")) throw new Error(`bad work id ${workId}`);
if (pr && !/^\d+$/.test(pr)) throw new Error(`bad pr ${pr}`);

const config = JSON.parse(readFileSync("factory/config.json", "utf8"));
const story = loadRoadmap().stories.find((s) => s.id === workId);
if (mode === "deliver" && !story) throw new Error(`story ${workId} not in roadmap`);

const vars = {
  STORY_ID: workId,
  STORY_TITLE: story?.title ?? "",
  STORY_OUTCOME: story?.outcome?.trim() ?? "",
  PR: pr,
  OUT_OF_SCOPE_TAGS: config.out_of_scope_tags.join(", "),
};
const fill = (text) => text.replace(/\{\{(\w+)\}\}/g, (_, k) => vars[k] ?? "");
const prompt = [readFileSync("factory/PROMPT.md", "utf8"), fill(readFileSync(`factory/modes/${mode}.md`, "utf8"))].join("\n");

mkdirSync("factory-out", { recursive: true });
writeFileSync("factory-out/prompt.md", prompt);
console.log(prompt);
