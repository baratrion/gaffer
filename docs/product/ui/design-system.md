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
