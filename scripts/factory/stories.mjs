#!/usr/bin/env node
// Evidence-based story status: runs the protected Playwright scenarios (locked runner) and maps results to stories.
// Prints JSON: { stories: [{id, title, status: done|failing|no-scenarios}], doneCount, next }
// "doneCount" is the length of the contiguous done prefix: stories are delivered strictly in order.
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { resolve } from "node:path";
import { loadRoadmap, protectedSpecs } from "./roadmap.mjs";

const withoutSecrets = (env) =>
  Object.fromEntries(Object.entries(env).filter(([k]) => !/^(GH_TOKEN|GITHUB_TOKEN|ACTIONS_RUNTIME_TOKEN|ACTIONS_ID_TOKEN_REQUEST_TOKEN|CLAUDE_CODE_OAUTH_TOKEN)$/.test(k)));

const out = process.argv[2] ?? "test-results/stories.json";
mkdirSync("test-results", { recursive: true });
// Absolute: Playwright resolves a relative PLAYWRIGHT_JSON_OUTPUT_NAME against the config file's folder (scripts/factory/).
const report = resolve("test-results/protected.json");

const roadmap = loadRoadmap();
const anySpecs = roadmap.stories.some((s) => protectedSpecs(s.id).length > 0);
rmSync(report, { force: true }); // never read a stale report
if (anySpecs) {
  try {
    const [bin, ...pre] = (process.env.PMX ?? "pnpm exec").split(" ");
    execFileSync(bin, [...pre, "playwright", "test", "--config=scripts/factory/protected.playwright.config.ts", "--reporter=json"], {
      stdio: ["ignore", "pipe", "inherit"],
      // Agent-authored code builds and runs here: never hand it GitHub credentials.
      env: { ...withoutSecrets(process.env), PLAYWRIGHT_JSON_OUTPUT_NAME: report },
      maxBuffer: 64 * 1024 * 1024,
    });
  } catch {
    // Failing scenarios are expected for stories not yet delivered.
  }
}

const results = new Map(); // id -> { passed, failed }
const walk = (suite, file) => {
  const f = suite.file ?? file;
  for (const spec of suite.specs ?? []) {
    const id = (spec.file ?? f ?? "").split("/").find((p) => /^S-\d{3}$/.test(p));
    if (!id) continue;
    const r = results.get(id) ?? { passed: 0, failed: 0 };
    const ok = spec.ok && spec.tests.every((t) => t.status === "expected" || t.status === "flaky");
    if (ok) r.passed++;
    else r.failed++;
    results.set(id, r);
  }
  for (const child of suite.suites ?? []) walk(child, f);
};
if (anySpecs && existsSync(report)) {
  for (const suite of JSON.parse(readFileSync(report, "utf8")).suites ?? []) walk(suite);
}

const stories = roadmap.stories.map((s) => {
  const r = results.get(s.id);
  const status = protectedSpecs(s.id).length === 0 ? "no-scenarios" : r && r.failed === 0 && r.passed > 0 ? "done" : "failing";
  return { id: s.id, title: s.title, week: s.week, status };
});
const firstOpen = stories.findIndex((s) => s.status !== "done");
const doneCount = firstOpen === -1 ? stories.length : firstOpen;
const summary = { stories, doneCount, next: stories[doneCount] ?? null };

const json = JSON.stringify(summary, null, 2);
writeFileSync(out, json);
console.log(json);
