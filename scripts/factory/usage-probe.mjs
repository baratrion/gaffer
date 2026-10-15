#!/usr/bin/env node
// Reads the owner's real Claude plan usage via the documented RateLimitEvent
// (Agent SDK reference; emitted in `claude -p --output-format stream-json --verbose`).
// One tiny Haiku request. Prints JSON: { ok, at, status, five_hour, seven_day, seven_day_opus, seven_day_sonnet, resets }
// Utilization values are fractions 0..1 of the WHOLE account (factory + the owner's own use).
// Usage: node scripts/factory/usage-probe.mjs [out.json]   (needs CLAUDE_CODE_OAUTH_TOKEN, `claude` on PATH)
import { spawnSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { tmpdir } from "node:os";

const out = process.argv[2];
const result = { ok: false, at: new Date().toISOString(), status: null, resets: {} };

const run = spawnSync(
  "claude",
  ["-p", "Reply with exactly: ok", "--model", "haiku", "--max-turns", "1", "--output-format", "stream-json", "--verbose"],
  { encoding: "utf8", timeout: 120_000, maxBuffer: 16 * 1024 * 1024, cwd: tmpdir() },
);

const events = (run.stdout ?? "")
  .split("\n")
  .filter(Boolean)
  .flatMap((line) => {
    try {
      return [JSON.parse(line)];
    } catch {
      return [];
    }
  })
  .filter((e) => e.type === "rate_limit_event" && e.rate_limit_info);

for (const { rate_limit_info: info } of events) {
  result.ok = true;
  // Worst status wins: rejected > allowed_warning > allowed
  const rank = { allowed: 0, allowed_warning: 1, rejected: 2 };
  if (result.status === null || (rank[info.status] ?? 0) > (rank[result.status] ?? 0)) result.status = info.status;
  // Per-window utilization: both the event's own window and the unified view, when present
  if (info.rateLimitType && typeof info.utilization === "number") {
    result[info.rateLimitType] = info.utilization;
    result.resets[info.rateLimitType] = info.resetsAt ?? null;
  }
  for (const [name, w] of Object.entries(info.unifiedWindows ?? {})) {
    if (typeof w?.utilization === "number") {
      result[name] = Math.max(result[name] ?? 0, w.utilization);
      result.resets[name] = w.resetsAt ?? result.resets[name] ?? null;
    }
  }
}
if (!result.ok) result.error = run.error?.message ?? (run.stderr || "no rate_limit_event in stream").slice(0, 300);

const json = JSON.stringify(result);
if (out) writeFileSync(out, json);
console.log(json);
