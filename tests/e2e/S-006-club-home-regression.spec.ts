// @US-1 (S-006 play my first match) @regression
// CONTRACT_SHAPE: bounded-change
// Outcome anchor: DISCUSS D1 and the DoD: the club home gains a fourth button, but "Squad", "Tactics" and "Starting XI" keep
// working with their exact names, every club-home button stays 44px or taller, the heading is the club's name and focused,
// and nothing scrolls sideways at 390px. Passes before and after DELIVER (it never names the "Play match" button).
// Environment: local-preview or BASE_URL (production build under /gaffer/).
import { expect, test } from "@playwright/test";

test.describe("@US-1 S-006 the club home keeps working", () => {
  test("@regression Squad, Tactics and Starting XI still open by their exact names and Back returns to the club home with its heading focused @contract-shape:bounded-change", async ({ page }) => {
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

    const opens: readonly (readonly [string, string])[] = [["Squad", club], ["Tactics", "Tactics"], ["Starting XI", "Starting XI"]];
    for (const [name, expected] of opens) {
      await page.getByRole("button", { name, exact: true }).click();
      await expect(heading).toContainText(expected);
      await expect(heading).toBeFocused();
      await page.getByRole("button", { name: "Back", exact: true }).click();
      await expect(heading).toContainText(club);
      await expect(heading).toBeFocused();
    }

    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0);
    expect(errors).toEqual([]);
  });
});
