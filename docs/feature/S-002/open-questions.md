# S-002 open questions

## DISTILL reconciliation (DISCUSS vs DESIGN vs DEVOPS): 0 real contradictions

One wording inconsistency, resolved to the narrower option:
- DISCUSS acceptance criterion "Each row tells Sam who the player is" says age 16 to 40 (the roadmap outcome range). DISCUSS locked decisions, DESIGN and ADR-0004 fix generated ages at 17-35, and DISCUSS itself notes that tests assert the generated range. Tests assert **17-35** (the narrower range). The wider range stays a looser outer bound, not a generated one.
