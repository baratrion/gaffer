# S-004 open questions (from the DISTILL final-wave review)

- Reviewers: DISCUSS conditionally approved; DESIGN conditionally approved; DEVOPS rejected only on an inherited, owner-locked item; DISTILL rejected pending revisions. Two review cycles are not spent on the rest; items below go to DELIVER or the owner.
- Fixed in this tick: N12 (Back from an unknown club's tactics) now runs as a regression guard; DISTILL case total corrected to 185.
- DEVOPS F1 (owner): ci/deploy workflows have no SAST, dependency audit or secret scan. `.github/` is locked; S-004 adds no dependency or network surface. Needs an owner decision or written risk acceptance.
- DEVOPS F3/F4 (owner): the protected gate runs only on branch/PR builds, and deploy is not gated on ci; "must pass on main" is evidenced at PR time. Locked files.
- DISTILL error-path share is 29% (53/185), below the reviewer's 40% threshold; the waiver in the DISTILL section stands: the reachable invalid inputs are enumerated. The reviewer does not accept author waivers, so an owner may want to rule on it.
- DISTILL: environment trace for local-dev / production is only partly recorded; production is covered by the post-deploy smoke running the same e2e on BASE_URL.
- DESIGN H1/DISCUSS F1: the reviewers could not see `tests/protected/S-004/` (plan-run file, off limits to deliver ticks). Wording "re-created and focus restored" refines DISCUSS D5; the observable outcome is unchanged. The DESIGN claim of product-owner pre-approval is not recorded in DISCUSS: treat as unconfirmed.
- DESIGN M2: ADR-0003 line 56 (focus after each navigation) lacks a dated note pointing to ADR-0008; DELIVER should add it.
- DESIGN L3: DISTILL already did the three fixture edits and the `formation: DEFAULT_FORMATION` literal in `main.ts` (types only); DELIVER replaces the literal with `initialState(...)`.
- Optional (DELIVER): seed-independence unit case; unit test that the renderer's expansion equals `lineUp`; list semantics in grid verified on Chromium only; reduce the `%j` titles.
