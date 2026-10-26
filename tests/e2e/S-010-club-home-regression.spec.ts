// @US-1 @US-2 (S-010 save and continue my season) @regression
// CONTRACT_SHAPE: bounded-change
// Outcome anchor: DISCUSS D2, D4, D10 and the roadmap outcome: what S-010 must leave exactly as it was. In a fresh browser the title has the one h1
// "Gaffer" (focused), a "New game" button 44px or taller and no "Continue"; after a reload, "New game" still starts a fresh game from the address's
// seed (every row P 0 in A to Z order, "4-4-2" checked, "Play match" reading "Matchday 1", Netherwold Borough 1-2 Marlbrook Athletic at ?seed=31),
// whether or not a saved game is offered; nothing scrolls sideways at 390px and nothing logs a console error. It never taps "Continue", so it passes
// before and after DELIVER (the held-out S-010-save-continue spec covers the new behaviour). Environment: local-preview (ci:serve) or BASE_URL.
import { expect, test, type Page } from "@playwright/test";

const button = (page: Page, name: string) => page.getByRole("button", { name, exact: true });
const heading = (page: Page) => page.getByRole("heading", { level: 1 });
const watchErrors = (page: Page): string[] => {
  const errors: string[] = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(e.message));
  return errors;
};

/** Taps New game and the first club (Netherwold Borough at ?seed=31), then reads the table: every row at zero, in A to Z order. */
const startFresh = async (page: Page): Promise<void> => {
  await button(page, "New game").click();
  await page.getByRole("list", { name: "Clubs" }).getByRole("button").nth(0).click();
  await expect(heading(page)).toHaveText("Netherwold Borough");
  await button(page, "Table").click();
  const rows = (await page.getByRole("table", { name: "League table", exact: true }).getByRole("row").all()).slice(1);
  const names = await Promise.all(rows.map(async (row) => (await row.getByRole("rowheader").innerText()).trim()));
  expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b)));
  for (const row of rows) expect((await row.getByRole("cell").allInnerTexts()).slice(1).map((c) => c.trim())).toEqual(["0", "0", "0", "0", "0", "0"]);
  await button(page, "Back").click();
  await button(page, "Tactics").click();
  await expect(page.getByRole("radio", { name: "4-4-2", exact: true })).toBeChecked();
  await button(page, "Back").click();
  await button(page, "Play match").click();
  await expect(heading(page)).toHaveText("Matchday 1");
  await expect(page.getByText("Netherwold Borough 1–2 Marlbrook Athletic", { exact: true })).toBeVisible();
};

test.describe("@US-1 @US-2 S-010 the title and New game keep working", () => {
  test("@regression In a fresh browser the title is Gaffer, focused, with a tall New game button and no Continue; New game starts a fresh game, and after a reload it starts exactly the same fresh game @walking_skeleton @contract-shape:bounded-change", async ({ page }) => {
    const errors = watchErrors(page);
    await page.goto("./?seed=31");
    await expect(heading(page)).toHaveText("Gaffer");
    await expect(heading(page)).toBeFocused();
    await expect(page.getByRole("heading")).toHaveCount(1);
    await expect(button(page, "Continue")).toHaveCount(0);
    expect((await button(page, "New game").boundingBox())?.height ?? 0).toBeGreaterThanOrEqual(44);
    await startFresh(page);
    await page.reload();
    await expect(heading(page)).toBeFocused();
    await startFresh(page);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0);
    expect(errors).toEqual([]);
  });
});
