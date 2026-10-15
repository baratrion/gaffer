import { expect, test } from "@playwright/test";

// S-001: Start a new game and pick a club. Owner-approved, black-box, phone viewport.

test("new game shows a league of 8 clubs to choose from", async ({ page }) => {
  await page.goto("./");
  await page.getByRole("button", { name: "New game" }).click();

  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  const clubList = page.getByRole("list", { name: /clubs/i });
  await expect(clubList).toBeVisible();
  await expect(clubList.getByRole("listitem")).toHaveCount(8);
  // every club is tappable
  for (const item of await clubList.getByRole("listitem").all()) {
    await expect(item.getByRole("button")).toHaveCount(1);
  }
});

test("club names are unique and non-empty", async ({ page }) => {
  await page.goto("./");
  await page.getByRole("button", { name: "New game" }).click();

  const names = (await page.getByRole("list", { name: /clubs/i }).getByRole("listitem").allInnerTexts()).map((t) => t.trim());
  expect(names).toHaveLength(8);
  expect(names.every((n) => n.length > 0)).toBe(true);
  expect(new Set(names).size).toBe(8);
});

test("picking a club lands on that club's home screen", async ({ page }) => {
  await page.goto("./");
  await page.getByRole("button", { name: "New game" }).click();

  const third = page.getByRole("list", { name: /clubs/i }).getByRole("listitem").nth(2);
  const clubName = (await third.innerText()).trim().split("\n")[0]!.trim();
  await third.getByRole("button").first().click();

  await expect(page.getByRole("heading", { level: 1 })).toContainText(clubName);
});

test("the generated league is the same across fresh visits (deterministic seed)", async ({ browser }) => {
  const leagueOnce = async () => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto("./");
    await page.getByRole("button", { name: "New game" }).click();
    const names = await page.getByRole("list", { name: /clubs/i }).getByRole("listitem").allInnerTexts();
    await context.close();
    return names;
  };
  expect(await leagueOnce()).toEqual(await leagueOnce());
});
