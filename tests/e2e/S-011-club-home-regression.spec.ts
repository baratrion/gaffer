// @US-1 @US-2 (S-011 read my club's news in the Inbox) @regression
// CONTRACT_SHAPE: bounded-change
// Outcome anchor: DISCUSS D1, D8, D10: adding the sixth button "Inbox" must leave the club home Sam knows working. The first five buttons keep
// their order and names (Squad, Tactics, Starting XI, Play match, Table), every button is 44px or taller, the first Play match is Matchday 1 with
// the golden score line, Table reads Pos 6 for Netherwold Borough (the position the first Inbox message will print as "6th"), Back keeps the
// heading focused, and nothing scrolls sideways at 390px. It never names "Inbox" and never counts the buttons, so it passes before and after
// DELIVER (the exact six-button lists live in the amended S-005..S-009 specs). Environment: local-preview or BASE_URL.
import { expect, test, type Page } from "@playwright/test";

const button = (page: Page, name: string) => page.getByRole("button", { name, exact: true });
const heading = (page: Page) => page.getByRole("heading", { level: 1 });
const FIRST_FIVE = ["Squad", "Tactics", "Starting XI", "Play match", "Table"];

test.describe("@US-1 @US-2 S-011 the club home keeps working", () => {
  test("@regression The first five club home buttons keep their order and are 44px or taller; the first Play match is Matchday 1 and Table then puts Netherwold Borough 6th; Back keeps the heading focused @walking_skeleton @boundary @contract-shape:bounded-change", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto("./?seed=31");
    await button(page, "New game").click();
    await page.getByRole("list", { name: "Clubs" }).getByRole("button").nth(0).click();
    await expect(heading(page)).toHaveText("Netherwold Borough");
    await expect(heading(page)).toBeFocused();
    const buttons = page.getByRole("button");
    expect((await buttons.allInnerTexts()).map((text) => text.trim()).slice(0, FIRST_FIVE.length)).toEqual(FIRST_FIVE);
    for (const [index, each] of (await buttons.all()).entries()) expect((await each.boundingBox())?.height ?? 0, `club home button ${index}`).toBeGreaterThanOrEqual(44);
    await button(page, "Play match").click();
    await expect(heading(page)).toHaveText("Matchday 1");
    await expect(page.getByText("Netherwold Borough 1–2 Marlbrook Athletic", { exact: true })).toBeVisible();
    await button(page, "Back").click();
    await expect(heading(page)).toHaveText("Netherwold Borough");
    await expect(heading(page)).toBeFocused();
    await button(page, "Table").click();
    const row = page.getByRole("table", { name: "League table", exact: true }).getByRole("row").filter({ has: page.getByRole("rowheader", { name: "Netherwold Borough", exact: true }) });
    expect((await row.getByRole("cell").first().innerText()).trim()).toBe("6");
    await button(page, "Back").click();
    await expect(heading(page)).toBeFocused();
    expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0);
    expect(errors).toEqual([]);
  });
});
