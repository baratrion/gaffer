// @US-1 (S-007 see the league table after my first match) @regression
// CONTRACT_SHAPE: bounded-change
// Outcome anchor: DISCUSS Notes and DoD: the club home gains a fifth button (Table) and, from S-011, a sixth (Inbox), but "Squad", "Tactics", "Starting XI" and "Play match" keep
// working, Back still returns to a focused club heading, every button stays 44px or taller and nothing scrolls sideways at 390px.
// Passes before and after DELIVER: it never names the "Table" button and requires exactly six club-home buttons. Environment:
// local-preview or BASE_URL.
import { expect, test } from "@playwright/test";

test.describe("@US-1 S-007 the club home keeps working", () => {
  test("@regression Squad, Starting XI, Tactics and Play match still open and Back returns to the club home with its heading focused @contract-shape:bounded-change", async ({ page }) => {
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
    const buttons = await page.getByRole("button").all();
    expect(buttons, "exactly six club home buttons").toHaveLength(6);
    for (const [index, button] of buttons.entries()) {
      expect((await button.boundingBox())?.height ?? 0, `club home button ${index}`).toBeGreaterThanOrEqual(44);
    }

    await page.getByRole("button", { name: "Squad", exact: true }).click();
    await expect(page.getByRole("list", { name: "Squad" }).getByRole("listitem")).toHaveCount(18);
    await page.getByRole("button", { name: "Back", exact: true }).click();
    await expect(heading).toContainText(club);
    await expect(heading).toBeFocused();

    await page.getByRole("button", { name: "Starting XI", exact: true }).click();
    await expect(heading).toHaveText("Starting XI");
    await page.getByRole("button", { name: "Back", exact: true }).click();
    await expect(heading).toContainText(club);

    await page.getByRole("button", { name: "Tactics", exact: true }).click();
    await page.getByRole("radiogroup", { name: "Formation" }).getByText("4-3-3", { exact: true }).click();
    await page.getByRole("button", { name: "Back", exact: true }).click();
    await page.getByRole("button", { name: "Tactics", exact: true }).click();
    await expect(page.getByRole("radio", { name: "4-3-3", exact: true })).toBeChecked();
    await page.getByRole("button", { name: "Back", exact: true }).click();
    await expect(heading).toContainText(club);

    await page.getByRole("button", { name: "Play match", exact: true }).click();
    await expect(heading).toHaveText("Matchday 1");
    await expect(heading).toBeFocused();
    await page.getByRole("button", { name: "Back", exact: true }).click();
    await expect(heading).toContainText(club);
    await expect(heading).toBeFocused();

    expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0);
    expect(errors).toEqual([]);
  });
});
