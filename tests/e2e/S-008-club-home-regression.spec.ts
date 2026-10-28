// @US-1 @US-2 (S-008 play the season, matchday by matchday) @regression
// CONTRACT_SHAPE: bounded-change
// Outcome anchor: DISCUSS D1, D9 and DoD: while matchdays remain the club home keeps its six buttons (Squad, Tactics, Starting XI, Play match,
// Table, all 44px or taller) and says nothing about the season being over; the FIRST "Play match" of a new game is still "Matchday 1"
// (Netherwold Borough 1–2 Marlbrook Athletic at ?seed=31) with the heading focused; "Back" returns to the focused club heading with the
// button still there; "Table" still opens and every row reads P 1; nothing scrolls sideways at 390px and no console error appears.
// Passes before and after DELIVER: it plays once and never names the second tap. Environment: local-preview or BASE_URL.
import { expect, test } from "@playwright/test";

test.describe("@US-1 @US-2 S-008 the club home before the season ends keeps working", () => {
  test("@regression Six buttons and no End of season button; the first Play match is Matchday 1 with the golden score line; Back keeps the heading focused and Play match in place; Table reads P 1 on every row @contract-shape:bounded-change", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto("./?seed=31");
    await page.getByRole("button", { name: "New game" }).click();
    const first = page.getByRole("list", { name: "Clubs" }).getByRole("button").nth(0);
    const club = ((await first.innerText()).split("\n")[0] ?? "").trim();
    await first.click();

    const heading = page.getByRole("heading", { level: 1 });
    await expect(heading).toHaveText(club);
    await expect(heading).toBeFocused();
    const buttons = page.getByRole("button");
    expect((await buttons.allInnerTexts()).map((text) => text.trim())).toEqual(["Squad", "Tactics", "Starting XI", "Play match", "Table", "Inbox"]);
    for (const [index, each] of (await buttons.all()).entries()) expect((await each.boundingBox())?.height ?? 0, `club home button ${index}`).toBeGreaterThanOrEqual(44);
    await expect(page.getByRole("button", { name: "End of season", exact: true }), "no way to end the season before it is over").toHaveCount(0);
    await expect(page.getByText("Season over", { exact: true })).toHaveCount(0);

    await page.getByRole("button", { name: "Play match", exact: true }).click();
    await expect(heading).toHaveText("Matchday 1");
    await expect(heading).toBeFocused();
    await expect(page.getByText("Netherwold Borough 1–2 Marlbrook Athletic", { exact: true })).toBeVisible();
    await expect(page.getByRole("list", { name: "Goals", exact: true }).getByRole("listitem")).toHaveCount(3);
    await page.getByRole("button", { name: "Back", exact: true }).click();
    await expect(heading).toHaveText(club);
    await expect(heading).toBeFocused();
    await expect(page.getByRole("button", { name: "Play match", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "End of season", exact: true })).toHaveCount(0);
    await expect(page.getByText("Season over", { exact: true })).toHaveCount(0);

    await page.getByRole("button", { name: "Table", exact: true }).click();
    await expect(heading).toHaveText("League table");
    await expect(heading).toBeFocused();
    const table = page.getByRole("table", { name: "League table", exact: true });
    const rows = (await table.getByRole("row").all()).slice(1);
    expect(rows).toHaveLength(8);
    for (const row of rows) expect((await row.getByRole("cell").allInnerTexts())[1]?.trim(), "P on every row after one match").toBe("1");
    await page.getByRole("button", { name: "Back", exact: true }).click();
    await expect(heading).toHaveText(club);
    await expect(heading).toBeFocused();

    expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0);
    expect(errors).toEqual([]);
  });
});
