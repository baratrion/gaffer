type Attributes = Readonly<Record<string, string>>;
type Child = Node | string;

export const el = <K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attributes: Attributes = {},
  ...children: readonly Child[]
): HTMLElementTagNameMap[K] => {
  const node = document.createElement(tag);
  for (const [name, value] of Object.entries(attributes)) node.setAttribute(name, value);
  node.append(...children);
  return node;
};

export const replaceChildren = (root: HTMLElement, ...nodes: readonly Node[]): void => {
  root.replaceChildren(...nodes);
};
