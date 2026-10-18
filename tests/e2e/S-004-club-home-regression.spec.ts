// @US-1 (S-004 choose a formation) @regression
// CONTRACT_SHAPE: e2e journey
// Outcome anchor: DISCUSS D1/D8: the club home may gain a second button, but its heading is still the club's name, "Squad"
// still opens the squad, every button stays 44px or taller and nothing scrolls sideways at 390px.
// Passes before and after DELIVER (it never names the "Tactics" button). Environment: local-preview or BASE_URL.
import { expect, test } from "@playwright/test";

test.describe("@US-1 S-004 the club home keeps working", () => {
  test("@regression the club home is headed by the club's name, every button is 44px or taller, nothing scrolls sideways, Squad and Back still work @contract-shape:bounded-change", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto("./?seed=31");
    await page.getByRole("button", { name: "New game" }).click();
    const first = page.getByRole("list", { name: "Clubs" }).getByRole("button").nth(0);
    const club = ((await first.innerText()).split("\n")[0] ?? "").trim();
    await first.click();

    const heading = page.getByRole("heading", { level: 1 });
    await expect(heading).toHaveCount(1);
    await expect(heading).toContainText(club);
    await expect(heading).toBeFocused();
    const buttons = page.getByRole("button");
    expect(await buttons.count()).toBeGreaterThanOrEqual(1);
    for (const [index, button] of (await buttons.all()).entries()) {
      expect((await button.boundingBox())?.height ?? 0, `club home button ${index}`).toBeGreaterThanOrEqual(44);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0);

    await page.getByRole("button", { name: "Squad", exact: true }).click();
    await expect(page.getByRole("list", { name: "Squad" }).getByRole("listitem")).toHaveCount(18);
    await page.getByRole("button", { name: "Back", exact: true }).click();
    await expect(heading).toContainText(club);
    await expect(page.getByRole("list", { name: "Squad" })).toHaveCount(0);
    await expect(heading).toBeFocused();
    expect(errors).toEqual([]);
  });
});
