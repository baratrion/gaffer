#!/usr/bin/env node
// Deterministic PR guards. These, not AI reviewers, hold merge authority.
// Usage: node scripts/guards/pr-guards.mjs   (env: BASE_REF=origin/main, HUMAN_APPROVED=true|false)
import { execFileSync } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";

const git = (...args) => execFileSync("git", args, { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
const baseRef = process.env.BASE_REF ?? "origin/main";
const humanApproved = process.env.HUMAN_APPROVED === "true";
const base = git("merge-base", baseRef, "HEAD").trim();

// Paths only the owner may change (CODEOWNERS mirrors this list).
const PROTECTED = [
  /^tests\/protected\//,
  /^\.github\//,
  /^factory\//,
  /^docs\/product\//,
  /^scripts\/(guards|factory)\//,
  /^\.nwave\//,
  /^CLAUDE\.md$/,
  /^(tsconfig\.json|vitest\.config\.ts|playwright\.config\.ts|stryker\.config\.mjs|\.oxlintrc\.json|vite\.config\.ts)$/,
];
const MAX_CHANGED_LINES = 600;
const DIFF_SIZE_IGNORE = [/^pnpm-lock\.yaml$/, /^docs\//];

const failures = [];
const changed = git("diff", "--name-only", `${base}...HEAD`).split("\n").filter(Boolean);

// 1. Protected paths
const touchedProtected = changed.filter((f) => PROTECTED.some((re) => re.test(f)));
if (touchedProtected.length && !humanApproved) {
  failures.push(`Protected paths changed without the 'human-approved' label:\n  ${touchedProtected.join("\n  ")}`);
}

// 2. Diff size cap
const numstat = git("diff", "--numstat", `${base}...HEAD`).split("\n").filter(Boolean);
const changedLines = numstat
  .map((l) => l.split("\t"))
  .filter(([, , file]) => !DIFF_SIZE_IGNORE.some((re) => re.test(file)))
  .reduce((sum, [a, d]) => sum + (Number(a) || 0) + (Number(d) || 0), 0);
if (changedLines > MAX_CHANGED_LINES && !humanApproved) {
  failures.push(`Diff too large: ${changedLines} changed lines (cap ${MAX_CHANGED_LINES}). Split the step.`);
}

// 3. Test-count and assertion-count must never decrease
const TEST_RE = /\b(?:it|test)(?:\.each\([^)]*\))?\s*\(/g;
const EXPECT_RE = /\bexpect\s*\(/g;
const countIn = (text, re) => (text.match(re) ?? []).length;
const listTests = (ref) =>
  git("ls-tree", "-r", "--name-only", ref, "tests/").split("\n").filter((f) => /\.(test|spec)\.ts$/.test(f));
const totals = (ref) =>
  listTests(ref).reduce(
    (acc, f) => {
      const text = git("show", `${ref}:${f}`);
      return { tests: acc.tests + countIn(text, TEST_RE), expects: acc.expects + countIn(text, EXPECT_RE) };
    },
    { tests: 0, expects: 0 },
  );
const before = totals(base);
const after = totals("HEAD");
if (after.tests < before.tests) failures.push(`Test count decreased: ${before.tests} -> ${after.tests}`);
if (after.expects < before.expects) failures.push(`Assertion count decreased: ${before.expects} -> ${after.expects}`);

// 4. No focused/skipped tests anywhere
const SKIP_RE = /\b(?:it|test|describe)\.(?:skip|only|todo|fixme)\s*\(|\bx(?:it|describe)\s*\(/;
for (const f of listTests("HEAD")) {
  if (existsSync(f) && SKIP_RE.test(readFileSync(f, "utf8"))) failures.push(`Skipped/focused test in ${f}`);
}

// 5. Determinism: domain code must not use ambient randomness or time
const domainFiles = git("ls-files", "src/domain").split("\n").filter((f) => f.endsWith(".ts"));
for (const f of domainFiles) {
  if (/Math\.random|Date\.now|new Date\(/.test(readFileSync(f, "utf8"))) {
    failures.push(`Non-deterministic call in ${f} (use src/domain/rng.ts; pass time in)`);
  }
}

console.log(`Guards: ${changed.length} files changed, ${changedLines} lines; tests ${before.tests}->${after.tests}, expects ${before.expects}->${after.expects}; human-approved=${humanApproved}`);
if (failures.length) {
  console.error(`\nGUARD FAILURES (${failures.length}):\n- ${failures.join("\n- ")}`);
  process.exit(1);
}
console.log("All guards passed.");
