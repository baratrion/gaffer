# ADR-0002: UI: plain TypeScript DOM screens, no framework, no canvas

- Status: Accepted
- Date: 2026-10-15
- Deciders: nWave solution-architect (factory plan run, `interaction_mode=propose`)

## Context
The POC is a handful of list-and-button screens (club picker, club home, squad, tactics, match
commentary, table, inbox). Scope rules out pitch rendering (`match-2d` is OUT), so there is no
need for a canvas or WebGL renderer. The protected scenarios depend on semantic markup: real
buttons, one `<h1>` per screen, lists for collections, and accessible names.

## Options
| Option | Pros | Cons |
|---|---|---|
| **A. Plain TS + DOM APIs**: one module per screen that builds elements with a tiny `el()` helper | Zero runtime dependencies; smallest bundle for mid-range phones; semantic HTML by default; trivial to test | Manual re-render; no reactivity |
| B. Preact (+ htm or JSX) | Components and diffing; about 4 kB | A new dependency and build config; reactivity buys little for screens that redraw on navigation |
| C. Lit / web components | Standards-based | Shadow DOM complicates role and name queries and global styles |
| D. pixi.js canvas | Good for a 2D pitch | That is OUT of scope; canvas content is invisible to role queries |

## Decision
**Option A.** Each screen is a DOM-writing shell function `render<Screen>(root, props)` (imperative shell, never in `src/domain`) in `src/ui/screens/`
that replaces the root's children with freshly built DOM:
- Build nodes with `document.createElement` and `textContent` through a small `el(tag, attrs, children)`
  helper in `src/ui/dom.ts`. **Never interpolate generated text into `innerHTML`.** Generated names
  are data, and this rules out HTML injection by construction.
- Every screen renders exactly one `<h1>`. Collections are `<ul>`/`<li>` with an accessible name
  (`aria-labelledby` pointing at a visible heading, or `aria-label`). Actions are `<button type="button">`.
- Tap targets are at least 44px (`min-height: 44px` on buttons). Layout is a single column, max 480px.
- Decorative visuals, such as club colour swatches, are `aria-hidden="true"` so they don't pollute accessible names.

Revisit (with a superseding ADR) if a screen needs fine-grained live updates that full re-render makes janky.
The match commentary feed is the likely candidate.

## Consequences
- No new dependencies. The existing `title-screen.ts` (`innerHTML` with static text only) stays valid and can migrate to `el()` when touched.
- Navigation is handled by the app shell (ADR-0003), not by screens.
