#!/usr/bin/env node
// Builds the tick prompt ONLY from owner-controlled files (factory/*, roadmap). Never from Issue/PR text.
// Usage: node scripts/factory/render-prompt.mjs <mode> <story-id> [pr]
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { loadRoadmap } from "./roadmap.mjs";

const [mode, storyId, pr = ""] = process.argv.slice(2);
if (!["deliver", "fix", "scenarios"].includes(mode)) throw new Error(`unknown mode ${mode}`);
if (!/^S-\d{3}$/.test(storyId ?? "")) throw new Error(`bad story id ${storyId}`);
if (pr && !/^\d+$/.test(pr)) throw new Error(`bad pr ${pr}`);

const story = loadRoadmap().stories.find((s) => s.id === storyId);
if (!story) throw new Error(`story ${storyId} not in roadmap`);

const vars = { STORY_ID: story.id, STORY_TITLE: story.title, STORY_OUTCOME: story.outcome.trim(), PR: pr };
const fill = (text) => text.replace(/\{\{(\w+)\}\}/g, (_, k) => vars[k] ?? "");
const prompt = [readFileSync("factory/PROMPT.md", "utf8"), fill(readFileSync(`factory/modes/${mode}.md`, "utf8"))].join("\n");

mkdirSync("factory-out", { recursive: true });
writeFileSync("factory-out/prompt.md", prompt);
console.log(prompt);
