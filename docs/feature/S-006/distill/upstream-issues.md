# S-006 DISTILL: upstream issues

## U-1 (needs an orchestrator or owner decision): one existing S-005 e2e assertion contradicts DISCUSS D1
`tests/e2e/S-005-starting-xi.spec.ts:173-177` ("Starting XI is the last of three club home buttons, after Squad and Tactics") asserts
`page.getByRole("button").allInnerTexts()` on the club home equals `["Squad", "Tactics", "Starting XI"]`. DISCUSS D1 adds a fourth
button "Play match" after "Starting XI", so this assertion cannot stay true once S-006 is delivered. DISCUSS, DESIGN and DEVOPS all state
that no existing test counts the club-home buttons ("they do not count club home buttons"); that holds for the protected tests and the
S-004 and S-005 regression specs, but not for this one assertion. Found by running the full e2e suite against the DISTILL reference
implementation: 96 pass, this 1 fails (nothing else).

Why DISTILL did not fix it: existing tests are never edited (factory rule). Why it cannot be avoided: the protected scenario needs a
button named "Play match" on the club home, and this assertion lists every button on that screen.

Proposed resolution (DELIVER step 04, same commit as the button): change that single expectation to
`["Squad", "Tactics", "Starting XI", "Play match"]` and the test title to "...last of three of the four club home buttons" or similar.
It is a fact the story changes by design (D1), not a weakening (it gets stricter: four exact names, in order). The new
`tests/e2e/S-006-match.spec.ts` test "Play match is the last of four club home buttons" already pins the new order. If the factory rule
allows no edit at all, the alternative is an owner exception for this one line. Recorded here so DELIVER does not discover it by a red CI.

## U-2 (informational, no action): DESIGN's "extend the S-003 sampled derived-seed guard" lives in a new file
DESIGN and DEVOPS say the S-003 guard test is extended with streams 200..255. S-003's test file is existing and must not be edited, so
the extension is a new pair of cases in `match.test.ts` (73 stream numbers pairwise distinct; 73 derived seeds distinct over sampled
seeds). The S-003 guard is unchanged and stays green.

## U-3 (informational): the two ADR goldens alone do not pin the model constants
The reference run showed `MAX_CONVERSION = 0.31` instead of `0.30` leaves both ADR goldens (seed 31 and seed 20260, fixture 0) unchanged:
no conversion draw of those two matches falls in the gap. DESIGN's claim "any change to a constant shifts a golden" is therefore not
guaranteed per golden. DISTILL added an exact pin of the ADR-0011 canonical-set figures (10901 goals, 220 goalless, the goals-per-side
distribution, home mean 1.384, lowest-rated 0.481, scorer shares 12.5/36.3/51.2) to `match-calibration.test.ts`. These are DESIGN's
published expected values (two independent runs), reproduced exactly by the reference, not figures re-pinned from DELIVER's output.

## Decision on U-1 (orchestrator, DISTILL close)
The S-005 e2e assertion at `tests/e2e/S-006`-adjacent `S-005-starting-xi.spec.ts:173-177` lists the club-home buttons. D1 adds "Play match", so the expected list becomes `["Squad", "Tactics", "Starting XI", "Play match"]`, edited in DELIVER step 04 in the same commit as the button. This updates an expected value to the new required behaviour; the assertion count is unchanged and nothing is weakened, deleted or skipped. The "no club-home count is asserted" statements in DISCUSS, DESIGN and DEVOPS were wrong and are superseded by this note.
