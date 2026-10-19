# Gaffer design system

Tokens live in `src/ui/styles.css` (`:root`).

| Token | Value | Use |
|---|---|---|
| `--pitch` / `--pitch-light` | #0f3d2e / #1b5e45 | Page background gradient |
| `--chalk` / `--text` | #f4f1e8 | Text, borders at 25% alpha, tinted surfaces at 8% alpha |
| `--accent` | #f2c14e (gold) | Positions, primary actions, focus rings, key figures |

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
