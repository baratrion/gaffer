type Child = Node | string;

/** Builds an element with text and attributes only; generated text never goes through innerHTML (ADR-0002). */
export const el = <K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs: Readonly<Record<string, string>> = {},
  children: readonly Child[] = [],
): HTMLElementTagNameMap[K] => {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, value);
  node.append(...children);
  return node;
};

/** Replaces the root's children with a screen and moves focus to its heading. */
export const mount = (root: HTMLElement, screen: HTMLElement, heading: HTMLElement): void => {
  root.replaceChildren(screen);
  heading.setAttribute("tabindex", "-1");
  heading.focus({ preventScroll: true });
};
