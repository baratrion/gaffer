# ADR-0008: Focus on a same-screen update (S-004)

- Status: Accepted
- Date: 2026-10-17
- Deciders: nWave solution-architect (S-004 DESIGN, `interaction_mode=propose`)
- Refines ADR-0003 "Bootstrap" ("after each navigation, the shell moves focus to the new screen's `<h1>`") and the brief's "renderers do not move focus" contract. ADR-0003 is not superseded; the focus rule narrows from "after every render" to "after a render that changed the screen".

## Context
Today `main.ts` runs `dispatch` then `update` then `render` and ends every render with `root.querySelector("h1")?.focus()`; each renderer replaces all of root's children. That is right for navigation (S-001..S-003 protected tests assert focus on the new `<h1>` after each tap). S-004 adds the first same-screen update: tapping or arrow-keying a formation radio changes state while the screen stays "Tactics". The outcome requires the heading to stay "Tactics" and focus to be on the tapped formation's radio button, also for arrow keys; a full re-render destroys the focused radio, and the unconditional `<h1>` focus would throw a keyboard or screen-reader user back to the top of the screen.

## Options
| Option | Pros | Cons |
|---|---|---|
| **A. Shell rule, expressed as a pure plan: heading focus only when the `Screen` changed; otherwise restore focus to the element whose `id` matches the previously focused element's `id` (chosen)** | Smallest change (one pure function plus a few lines in `main.ts`); renderers still never move focus (brief contract kept); works for every future same-screen widget that gives its controls stable ids; plan is unit-testable in Node; S-001..S-003 behaviour is identical (every navigation changes the screen) | Controls on same-screen-updating screens must carry stable ids; a browser that does not focus a radio on tap (Safari/iOS touch) has no previous id, so the fallback applies (see Decision) |
| B. The tactics renderer patches the line-up and radios in place and `main` skips the re-render | No focus loss by construction | Splits "render replaces root's children" (ADR-0002) into a second path; `main` needs a per-screen "skip render" rule; native radio state can drift from `GameState`; every later same-screen screen repeats the special case |
| C. Keyed DOM diff in the shell (or a tiny vdom) | General; preserves focus and scroll | A reactive layer for one screen; contradicts ADR-0002's "no reactivity" and its revisit trigger (the match feed, not a radio group); more code than the feature |
| D. Renderers take a "focus this id" hint and move focus themselves | Local | Breaks "renderers never move focus"; focus rules scatter across screens |

## Decision
**Option A.**
- New pure `src/app/focus.ts`: `focusPlan(previous: Screen | undefined, next: Screen, focusedId: string | undefined) => FocusPlan`, where `FocusPlan` is `{ kind: "heading" } | { kind: "element"; id: string }`. Plan-value pattern: the function only returns data; `main.ts` is the only code that touches focus.
  - `previous` undefined (first render) or a different screen (compared by kind and every field, `clubId` and `playerIndex` included): `heading`.
  - Same screen and `focusedId` a non-empty string: `element` with that id.
  - Same screen and no focused id (nothing focused, or the focused element has no id): `heading`, so focus is never left on `<body>` (ADR-0003's original intent).
- `main.ts` keeps the previously rendered `Screen`. Before each render it reads `document.activeElement` and, only when it is inside `root`, its `id`. After the render it executes the plan: `heading` focuses `root.querySelector("h1")`; `element` focuses the element with that id inside `root`, falling back to the `<h1>` if the id no longer exists. The renderers are unchanged in contract: `(root, props, dispatch)`, write only root's children, never move focus.
- Contract on renderers: any control that must keep focus across a same-screen re-render carries a stable, unique `id` derived from data, never from position or a counter (radios: `formation-4-4-2`, `formation-4-3-3`, `formation-4-2-3-1`).
- The tactics radios dispatch from the native `change` event (not `click`), so the already-checked formation dispatches nothing, and the arrow-key path works: the browser moves focus to the next radio and checks it before `change` fires, so `document.activeElement` at that moment is the newly checked radio, whose id is restored after the re-render.
- Accepted limitation: where the platform does not focus a radio on tap (Safari/iOS touch), the plan falls back to the heading after a choice. This is the old behaviour, never worse than today, and touch players are unaffected visually; keyboard and screen-reader paths (the ones D5 protects) are covered.

## Consequences
- Positive: the S-001..S-003 focus tests hold unchanged (a navigation always changes the screen); same-screen updates keep focus; the rule lives in one tested pure function, not in each screen.
- Negative: `main.ts` gains one effect it did not have (reading `document.activeElement.id`); the id convention must be remembered by future screens.
- Contract shapes: `focusPlan` pure return-only (unit tests: first render, each navigation incl. same club different screen and different player index, same-screen with id, same-screen without id; inputs not mutated). `main.ts` stays the unbounded shell; its universe is now: reads `location.search` once; reads `document.activeElement.id` (inside root only) once per render; writes root's children (via render) and focus (the `<h1>`, or the element with the previously focused id); no other globals.
- Earned Trust (environment lies about focus): the assumption is "a native radio gets focus on tap or arrow key, and an id survives a re-render". It is probed by the phone-viewport e2e, which asserts after tapping "4-3-3" that the radio named "4-3-3" is the focused element and its group still has exactly one checked radio; the arrow-key e2e (focus a radio, press `ArrowRight`, assert the next radio is checked and focused, the heading is still "Tactics"); and the three focus-on-arrival checks for S-001..S-003 plus "Tactics" and "Back". Fault injected: the re-render that destroys the focused node. The fallback to the heading covers a missing id.
- Enforcement: oxlint boundaries (app may not import ui; `focus.ts` imports only the `Screen` type); the rule "renderers never call `focus()`" is a code-review check, with a recommended grep-style unit test over `src/ui/` that fails if `.focus(` appears (cheap structural check; the e2e is the behavioural layer).
- No external integrations, no contract tests, no new dependency.
