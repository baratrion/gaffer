# Gaffer design system

Tokens live in `src/ui/styles.css` (`:root`).

| Token | Value | Use |
|---|---|---|
| `--pitch` / `--pitch-light` | #0f3d2e / #1b5e45 | Page background gradient |
| `--chalk` / `--text` | #f4f1e8 | Text, borders at 25% alpha, tinted surfaces at 8% alpha |
| `--accent` | #f2c14e (gold) | Positions, primary actions, focus rings, key figures |
| `--highlight` | rgba(242, 193, 78, 0.18) | Gold at 18%: the highlighted row of the managed club in the table |

Type: system sans, 1.75rem screen headings (`h1`), 1.1rem body lines, tabular numerals for every number.

Patterns:
- **Row button** (`.player-row`): full-width tappable list row, 44px or taller, chalk border at 25%, 10px radius.
- **Chalk panel** (`.attribute-item`): same surface as a row; a gold left edge marks an attribute.
- **Stat lines** (`.player-line`): label, one space, value on one line; the last line (Condition) is gold.
- **Back button** (`.back-button`): outlined gold, 48px tall, full width.
- Accessible roles and names are part of the contract (see `docs/product/scope.md`); presentation changes never rename them.
- **Club actions** (`.club-actions`): "Squad" and "Tactics" stacked, full width, 48px.
- **Formation card** (`label` in the "Formation" radio group): same surface as a row, 48px tall; the native radio is stretched over it with `opacity: 0`; a gold ring marks the checked card and the keyboard focus (no `:has()`).
- **Pitch line-up** (`ul` "Line-up"): 12-column grid on a chalk-outlined pitch panel; each position code is a chalk disc, one row per formation line, goalkeeper at the top.
- **Club actions** now stack "Squad", "Tactics" and "Starting XI".
- **Pick button** (`.pick-button`, in a `.pick-list`): the row-button surface for the Starting XI slots and the Choose list. The position code is gold (`.pick-code`), the name bold (`.pick-name`), the overall plain, and "Starting" gold (`.pick-starting`). The button is `display: block` with inline spans and literal single-space text nodes, so its `innerText`, `textContent` and accessible name are identical; long names wrap inside it (`overflow-wrap: anywhere`). Reviewed at 390px for S-005: no change needed.

## Match screen (S-006)
- **Score line**: one block `p` in a chalk 2px-bordered card on `--pitch-light`, 12px radius, centred, 1.5rem bold; the digits (`1–2`) are the only gold element and use tabular numerals. Names and score stay inline text so the whole line reads as one string.
- **Goals**: gold 1rem label, then a list of rows with a 4px gold left edge on a faint chalk wash, minute in bold gold with tabular numerals. An empty list keeps a minimum height so 0–0 does not collapse the layout.
- **Back**: the shared outlined gold `.back-button` (48px high), placed after the list.
- **Club home**: "Play match" is the fourth primary action button, same pitch-gold fill as Squad, Tactics and Starting XI.

## League table (S-007)
- **Standings table** (`table.standings`): native table markup, no `display` override on any part and no `text-transform`, so the browser keeps its table roles. Automatic layout, 100% wide; numeric cells are `nowrap` at `width: 1%` with tabular numerals, the Club cell takes the rest and wraps (`overflow-wrap: anywhere`). 1rem body, 0.85rem gold headers; fits 390px with no sideways scroll.
- **Highlighted row** (`tr[aria-current="true"]`): the managed club's row, `--highlight` background, a 4px gold inset edge on its first cell and bold text. The state is exposed as `aria-current`, not colour alone.
- **Club home**: "Table" is the fifth primary action button, after "Play match".
- **Table refinements (visual pass)**: the header row has a 2px gold rule; Pos is muted chalk (full chalk on the managed row); Pts is bold gold, the one number the eye should land on; the last row closes with a heavier rule. Still no `display` override or `text-transform`.

## Season over (S-008)
- ~~**Season over line** (`p.season-over`): in the "Play match" slot of `.club-actions` after matchday 14. Plain text, not a button: block, centred, 48px minimum height, gold text, dashed chalk 25% border, no fill, no `text-transform`, no flex or grid.~~ Superseded by S-009 (ADR-0015): the slot holds the "End of season" primary button and the `.season-over` rule is deleted.

## End of season (S-009)
- **Club home**: after matchday 14 "End of season" is a primary action button (same gold fill, 48px) in the "Play match" slot; the five club actions are primary buttons again.
- **Stat lines** (`p.season-line`): label, one space, value on one line, 1.1rem with tabular numerals, same scale as the player stat lines but a new class (`.player-line` has `:nth-of-type` rules for the player screen). Label muted chalk, value bold; the "Final position" value is gold. Inline flow only: spans and `<p>` take no `display`, `position`, `float`, flex or grid and no `text-transform`, so `innerText` and `textContent` read exactly "Final position 3rd" and "Top scorer Name (5 goals)". Long names wrap (`overflow-wrap: anywhere`).
- **Actions** (`div.season-actions`): a one-column grid, 10px gap, below the lines. "Play again" is the pitch-gold primary button (`button.primary`, full width, 48px); "Back" is the shared outlined gold `.back-button` (48px). Both stay 44px or taller.
- **Heading**: `.season-end h1` 1.75rem with a 16px bottom margin, like the other screens.

## End of season (S-009)
- **Season lines** (`p.season-line`): the chalk-panel surface (1px chalk 25% border, 8% wash, 10px radius) with a 4px gold left edge; label in muted chalk (`.season-label`), value bold gold at 1.25rem (`.season-value`). The `p` and its spans keep inline flow, with no flex, grid, float, position, `display` override, `text-transform` or generated content, so the line reads as one string of text.
- **Actions** (`.season-actions`): "Play again" is the primary gold button, "Back" the shared outlined `.back-button`; one column, 10px gap, 48px tall.
- **Club home**: "End of season" takes the "Play match" slot as the fifth primary button.

## Title with a saved game (S-010)
- **Continue** (`button.primary`): the pitch-gold primary button above "New game", 48px, 200px minimum width, like the title's one button today. It is the primary action because it resumes the season.
- **New game** (`button.secondary`, only while "Continue" is offered): the outlined gold style of `.back-button` (transparent fill, 1px gold border, gold text, 48px, 12px radius), sized like the title's primary button (200px minimum width, not full width); the colours and border are one shared rule with `.back-button`, not a copy, and only the width differs. Without a saved game "New game" stays the gold `button.primary`, so the first-visit title is unchanged.
- The h1 "Gaffer" and the tagline are unchanged; the stack (h1, tagline, Continue, New game) keeps the title's 16px gap and centred column; no sideways scroll at 390px. Focus rings follow the shared rule (3px gold, 2px offset).

## Inbox (S-011)
- **Club home**: "Inbox" is the sixth `button.primary`, after "Table", 48px, same gold fill.
- **Message cards** (`li.message` in `ul.message-list`): a one-column grid, 10px gap; chalk 8% wash, 10px radius, 4px gold left edge, 10px by 12px padding. The list keeps a 1.5rem box when empty.
- **Lines**: `p.message-title` ("Matchday N") 0.9rem bold muted chalk; the shared `p.score-line` from the match screen at 1.1rem with its own box, border and background removed by the descendant rule `.message .score-line`; `p.message-position` 0.9rem with a muted `span.message-label` and a bold gold `span.message-value`. Inline flow only (no `display`, flex, grid, float, position or `text-transform` on the spans), so `innerText` equals `textContent`. Long names wrap (`overflow-wrap: anywhere`).
- **Empty state**: `p.inbox-empty` "No messages yet", gold, 600 weight, outside the list. "Back" is the shared outlined `.back-button`, 48px.
- **Visual pass**: the build could not be served in the pass session (shell denied the preview server), so no screenshot critique was done and no CSS was changed; the layout is covered by the e2e computed-style and 390px checks.
