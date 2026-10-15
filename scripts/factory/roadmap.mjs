// Shared roadmap loader + linter. The roadmap is owner-authored; story status is never stored in it.
// Status is derived from evidence: a story is DONE when its owner-protected scenarios pass on main.
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { parse } from "yaml";

const ID_RE = /^S-\d{3}$/;

export const loadRoadmap = (path = "factory/roadmap.yaml") => parse(readFileSync(path, "utf8"));

export const protectedSpecs = (id) => {
  const dir = `tests/protected/${id}`;
  return existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith(".spec.ts")) : [];
};

export const lintRoadmap = (roadmap) => {
  const errors = [];
  const outTags = new Set(roadmap.out_of_scope_tags ?? []);
  const seen = new Set();
  if (!Array.isArray(roadmap.stories) || roadmap.stories.length === 0) errors.push("roadmap has no stories");
  for (const s of roadmap.stories ?? []) {
    const where = s.id ?? JSON.stringify(s).slice(0, 40);
    if (!ID_RE.test(s.id ?? "")) errors.push(`${where}: id must match S-NNN`);
    if (seen.has(s.id)) errors.push(`${where}: duplicate id`);
    seen.add(s.id);
    if (!s.title) errors.push(`${where}: missing title`);
    if (!s.outcome) errors.push(`${where}: missing outcome (what the player can do afterwards)`);
    if (!Number.isInteger(s.week)) errors.push(`${where}: week must be an integer`);
    const banned = (s.tags ?? []).filter((t) => outTags.has(t));
    if (banned.length && s.approved_by_human !== true) {
      errors.push(`${where}: out-of-scope tags [${banned.join(", ")}] need approved_by_human: true`);
    }
  }
  return errors;
};

if (import.meta.url === `file://${process.argv[1]}`) {
  const errors = lintRoadmap(loadRoadmap());
  if (errors.length) {
    console.error(`Roadmap lint failed:\n- ${errors.join("\n- ")}`);
    process.exit(1);
  }
  console.log("Roadmap lint passed.");
}
