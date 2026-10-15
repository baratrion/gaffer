import fc from "fast-check";

// CI contract (CLAUDE.md): fast-check honours FC_SEED so a failing property run can be replayed.
const seed = process.env.FC_SEED;
if (seed !== undefined && seed !== "" && Number.isInteger(Number(seed))) {
  fc.configureGlobal({ seed: Number(seed) });
}
