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
