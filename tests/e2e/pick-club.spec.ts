import { expect, test, type Page } from "@playwright/test";

// @US-1 @walking_skeleton @driving_port @contract-shape:bounded-change
test.use({ viewport: { width: 390, height: 844 } });

const clubNames = async (page: Page): Promise<string[]> => {
  await page.getByRole("button", { name: "New game" }).click();
  const items = page.getByRole("list", { name: "Clubs" }).getByRole("listitem");
  await expect(items).toHaveCount(8);
  const texts = await items.allInnerTexts();
  return texts.map((t) => t.split("\n")[0]?.trim() ?? "");
};

test("new game lists 8 unique clubs and a tap lands on that club's home", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("./?seed=4242");
  const names = await clubNames(page);
  expect(new Set(names).size).toBe(8);
  await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0);
  const items = page.getByRole("list", { name: "Clubs" }).getByRole("listitem");
  for (const item of await items.all()) {
    await expect(item.getByRole("button")).toHaveCount(1);
    await expect(item.locator('[aria-hidden="true"]').first()).toBeAttached();
  }
  const buttons = page.getByRole("list", { name: "Clubs" }).getByRole("button");
  for (const b of await buttons.all()) expect((await b.boundingBox())?.height ?? 0).toBeGreaterThanOrEqual(44);
  await buttons.nth(5).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
  await expect(page.getByRole("heading", { level: 1 })).toContainText(names[5] ?? "?");
  expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0);
  expect(errors).toEqual([]);
});

test("the same seed gives the same league, different seeds differ, bad seed is the default", async ({ page }) => {
  await page.goto("./?seed=4242");
  const a = await clubNames(page);
  await page.goto("./?seed=4242");
  expect(await clubNames(page)).toEqual(a);
  await page.goto("./?seed=17");
  expect(await clubNames(page)).not.toEqual(a);
  await page.goto("./");
  const def = await clubNames(page);
  await page.goto("./?seed=abc");
  expect(await clubNames(page)).toEqual(def);
});
