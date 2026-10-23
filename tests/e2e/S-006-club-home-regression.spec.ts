// @US-1 (S-006 play my first match) @regression
// CONTRACT_SHAPE: bounded-change
// Outcome anchor: DISCUSS Notes and DoD: the club home gains a fourth button, but "Squad", "Tactics" and "Starting XI" keep
// working, Back still returns to a focused club heading, every button stays 44px or taller and nothing scrolls sideways at 390px.
// Passes before and after DELIVER (it never names the "Play match" button). Environment: local-preview or BASE_URL.
import { expect, test } from "@playwright/test";

test.describe("@US-1 S-006 the club home keeps working", () => {
  test("@regression Squad, Tactics and Starting XI still open and Back returns to the club home with its heading focused @contract-shape:bounded-change", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto("./?seed=31");
    await page.getByRole("button", { name: "New game" }).click();
    const first = page.getByRole("list", { name: "Clubs" }).getByRole("button").nth(0);
    const club = ((await first.innerText()).split("\n")[0] ?? "").trim();
    await first.click();

    const heading = page.getByRole("heading", { level: 1 });
    await expect(heading).toContainText(club);
    await expect(heading).toBeFocused();
    for (const [index, button] of (await page.getByRole("button").all()).entries()) {
      expect((await button.boundingBox())?.height ?? 0, `club home button ${index}`).toBeGreaterThanOrEqual(44);
    }

    await page.getByRole("button", { name: "Squad", exact: true }).click();
    await expect(page.getByRole("list", { name: "Squad" }).getByRole("listitem")).toHaveCount(18);
    await page.getByRole("button", { name: "Back", exact: true }).click();
    await expect(heading).toContainText(club);
    await expect(heading).toBeFocused();

    await page.getByRole("button", { name: "Starting XI", exact: true }).click();
    await expect(heading).toHaveText("Starting XI");
    await expect(page.getByRole("list", { name: "Starting XI" }).getByRole("listitem")).toHaveCount(11);
    await page.getByRole("button", { name: "Back", exact: true }).click();
    await expect(heading).toContainText(club);
    await expect(heading).toBeFocused();

    await page.getByRole("button", { name: "Tactics", exact: true }).click();
    await expect(heading).toHaveText("Tactics");
    await page.getByRole("radiogroup", { name: "Formation" }).getByText("4-3-3", { exact: true }).click();
    await page.getByRole("button", { name: "Back", exact: true }).click();
    await expect(heading).toContainText(club);
    await page.getByRole("button", { name: "Tactics", exact: true }).click();
    await expect(page.getByRole("radio", { name: "4-3-3", exact: true })).toBeChecked();
    await page.getByRole("button", { name: "Back", exact: true }).click();
    await expect(heading).toContainText(club);

    expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0);
    expect(errors).toEqual([]);
  });
});
