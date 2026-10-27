// S-011 @regression: the club home keeps working with the sixth "Inbox" button: the first five buttons keep order, names and 44px height, each screen opens and
// Back returns to the focused club name, Matchday 1 and 2 keep their score lines, no sideways scroll at 390px, no console error. Never taps the Inbox button.
import { expect, test, type Page } from "@playwright/test";
const button = (page: Page, name: string) => page.getByRole("button", { name, exact: true });
const heading = (page: Page) => page.getByRole("heading", { level: 1 });
const FIVE = ["Squad", "Tactics", "Starting XI", "Play match", "Table"];

test.describe("@US-1 @US-2 S-011 the club home keeps working", () => {
  test("@regression The five known buttons keep their order and height; Squad, Tactics, Starting XI and Table open and Back returns to the focused club name; Matchday 1 and 2 keep their score lines @contract-shape:bounded-change", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto("./?seed=31");
    await button(page, "New game").click();
    await page.getByRole("list", { name: "Clubs" }).getByRole("button").nth(0).click();
    await expect(heading(page)).toHaveText("Netherwold Borough");
    await expect(heading(page)).toBeFocused();
    const known = async (): Promise<void> => {
      const buttons = page.getByRole("button");
      expect((await buttons.allInnerTexts()).map((text) => text.trim()).slice(0, 5)).toEqual(FIVE);
      for (const [index, each] of (await buttons.all()).entries()) expect((await each.boundingBox())?.height ?? 0, `club home button ${index}`).toBeGreaterThanOrEqual(44);
    };
    await known();
    for (const name of ["Squad", "Tactics", "Starting XI", "Table"]) {
      await button(page, name).click();
      await expect(button(page, "Back"), name).toBeVisible();
      await expect(button(page, "Play match"), `${name} replaces the club home`).toHaveCount(0);
      await expect(heading(page), name).toBeFocused();
      await button(page, "Back").click();
      await expect(heading(page), `Back from ${name}`).toHaveText("Netherwold Borough");
      await expect(heading(page), `Back from ${name}`).toBeFocused();
    }
    await button(page, "Play match").click();
    await expect(heading(page)).toHaveText("Matchday 1");
    await expect(page.getByText("Netherwold Borough 1–2 Marlbrook Athletic", { exact: true })).toBeVisible();
    await button(page, "Back").click();
    await expect(heading(page)).toBeFocused();
    await known();
    await button(page, "Play match").click();
    await expect(heading(page)).toHaveText("Matchday 2");
    await expect(page.getByText("Rushmoor Heath Albion 2–1 Netherwold Borough", { exact: true })).toBeVisible();
    await button(page, "Back").click();
    await known();
    await button(page, "Table").click();
    const rows = (await page.getByRole("table", { name: "League table", exact: true }).getByRole("row").all()).slice(1);
    expect(rows).toHaveLength(8);
    for (const row of rows) expect(((await row.getByRole("cell").allInnerTexts())[1] ?? "").trim()).toBe("2");
    await button(page, "Back").click();
    expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0);
    expect(errors).toEqual([]);
  });
});
