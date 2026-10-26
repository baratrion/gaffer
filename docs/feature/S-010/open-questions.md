# S-010 open questions

1. **Step 01-02 RED not executed.** The crafter went straight to GREEN because the spec activated against a throwing scaffold; RED was logged afterwards as `SKIPPED (NOT_APPLICABLE)`, not as executed. 01-06's RED is likewise SKIPPED (spec activation only; behaviour came in 01-05). The Haiku reviewer flagged both as weak RED evidence. The test behaviour is covered by the passing specs; nothing was backdated.
2. **Mutation baseline for `src/app/save.ts` and `src/adapters/**`** (ADR-0016 Enforcement) is not measured in this tick (nightly-delta; Phase 5 skipped). The nightly run will produce the first baseline; thresholds are unchanged.
3. DESIGN rows in `feature-delta.md` still say `createAutosave(store, ...)`; ADR-0016 was amended to `createAutosave(write, lastText)` in DISTILL.
