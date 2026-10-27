// @US-1 @US-2 (S-009 see how my season ended) @regression
// CONTRACT_SHAPE: bounded-change
// Outcome anchor: DISCUSS D1, D8 and DoD: before matchday 14 is played the club home is the one Sam knows: six buttons (Inbox last, S-011), "Play match" among them
// (all 44px or taller), no "End of season" button and no "Final position" or "Top scorer" text anywhere. At ?seed=31 after 13 matches the
// 14th "Play match" still opens "Matchday 14" (Tarnbeck Borough 2–1 Netherwold Borough, the reference season's last score line) with the heading
// focused, "Back" returns to the focused club name, "Table" reads P 13 before it and P 14 after it on every row, and nothing scrolls sideways
// at 390px nor logs a console error. It never taps anything after the 14th Back, so it passes before and after DELIVER (that is the held-out
// S-009-end-of-season spec). Environment: local-preview (ci:serve) or BASE_URL.
import { expect, test, type Page } from "@playwright/test";

const button = (page: Page, name: string) => page.getByRole("button", { name, exact: true });

test.describe("@US-1 @US-2 S-009 the club home before the season ends keeps working", () => {
  test("@regression Thirteen matches in, the club home still has Play match and no End of season; the 14th match is Matchday 14 and Back returns to the focused club name; Table reads P 13, then P 14 @contract-shape:bounded-change", async ({ page }) => {
    test.slow();
    const errors: string[] = [];
    page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto("./?seed=31");
    await page.getByRole("button", { name: "New game" }).click();
    await page.getByRole("list", { name: "Clubs" }).getByRole("button").nth(0).click();
    const heading = page.getByRole("heading", { level: 1 });
    await expect(heading).toHaveText("Netherwold Borough");

    const readTable = async (): Promise<string[]> => {
      await button(page, "Table").click();
      await expect(heading).toHaveText("League table");
      const rows = (await page.getByRole("table", { name: "League table", exact: true }).getByRole("row").all()).slice(1);
      expect(rows).toHaveLength(8);
      const played = await Promise.all(rows.map(async (row) => ((await row.getByRole("cell").allInnerTexts())[1] ?? "").trim()));
      await button(page, "Back").click();
      await expect(heading).toBeFocused();
      return played;
    };

    for (let matchday = 1; matchday <= 13; matchday++) {
      await button(page, "Play match").click();
      await expect(heading).toHaveText(`Matchday ${matchday}`);
      await expect(heading).toBeFocused();
      await button(page, "Back").click();
      await expect(heading).toHaveText("Netherwold Borough");
      await expect(heading).toBeFocused();
    }

    const buttons = page.getByRole("button");
    expect((await buttons.allInnerTexts()).map((text) => text.trim())).toEqual(["Squad", "Tactics", "Starting XI", "Play match", "Table", "Inbox"]);
    for (const [index, each] of (await buttons.all()).entries()) expect((await each.boundingBox())?.height ?? 0, `club home button ${index}`).toBeGreaterThanOrEqual(44);
    await expect(button(page, "End of season"), "no way to end the season before matchday 14 is played").toHaveCount(0);
    await expect(page.getByRole("button", { name: /end of season/i })).toHaveCount(0);
    await expect(page.getByText("Final position"), "no verdict yet").toHaveCount(0);
    await expect(page.getByText("Top scorer"), "no top scorer yet").toHaveCount(0);
    await expect(page.getByText("Season over", { exact: true })).toHaveCount(0);
    expect(await readTable(), "P 13 on every row").toEqual(Array(8).fill("13"));

    await button(page, "Play match").click();
    await expect(heading).toHaveText("Matchday 14");
    await expect(heading).toBeFocused();
    await expect(page.getByText("Tarnbeck Borough 2–1 Netherwold Borough", { exact: true })).toBeVisible();
    await button(page, "Back").click();
    await expect(heading).toHaveText("Netherwold Borough");
    await expect(heading).toBeFocused();
    expect(await readTable(), "P 14 on every row").toEqual(Array(8).fill("14"));

    expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0);
    expect(errors).toEqual([]);
  });
});
