// @US-1 (S-001 start a new game and pick a club)
// Runs against local-preview (ci:serve, localhost:4173/gaffer/) and, via BASE_URL, production smoke;
// local-dev is covered by the same URL-relative spec.
import { expect, test, type Page } from "@playwright/test";

test.use({ viewport: { width: 390, height: 844 } });

const openClubList = async (page: Page, query = "") => {
  await page.goto(`./${query}`);
  await page.getByRole("button", { name: "New game" }).click();
  const clubs = page.getByRole("list", { name: "Clubs" });
  await expect(clubs.getByRole("listitem")).toHaveCount(8);
  return clubs;
};

const clubNames = async (page: Page, query = ""): Promise<string[]> => {
  const clubs = await openClubList(page, query);
  const buttons = clubs.getByRole("button");
  const names: string[] = [];
  for (let i = 0; i < 8; i++) names.push(((await buttons.nth(i).innerText()).split("\n")[0] ?? "").trim());
  return names;
};

const noHorizontalScroll = (page: Page) =>
  page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);

test.describe("@US-1 S-001 start a new game and pick a club", () => {
  test("@walking_skeleton Sam taps New game, picks a club and lands on its home in 2 taps", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
    page.on("pageerror", (e) => errors.push(e.message));

    await page.goto("./");
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    await page.getByRole("button", { name: "New game" }).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    const first = page.getByRole("list", { name: "Clubs" }).getByRole("button").first();
    const name = ((await first.innerText()).split("\n")[0] ?? "").trim();
    await first.click();

    await expect(page.getByRole("heading", { level: 1 })).toContainText(name);
    expect(errors).toEqual([]);
  });

  test("the club list has 8 clubs, one button each, and one heading", async ({ page }) => {
    const clubs = await openClubList(page);
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    const items = clubs.getByRole("listitem");
    for (let i = 0; i < 8; i++) {
      await expect(items.nth(i).getByRole("button")).toHaveCount(1);
      await expect(items.nth(i).getByRole("button").locator('[aria-hidden="true"]').first()).toBeAttached();
    }
  });

  test("every club button is at least 44px tall", async ({ page }) => {
    const clubs = await openClubList(page);
    const buttons = clubs.getByRole("button");
    for (let i = 0; i < 8; i++) {
      const box = await buttons.nth(i).boundingBox();
      expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
    }
  });

  test("club names are non-empty and unique", async ({ page }) => {
    const names = await clubNames(page);
    expect(names.every((n) => n.length > 0)).toBe(true);
    expect(new Set(names).size).toBe(8);
  });

  test("tapping any of the 8 clubs shows its name in the heading", async ({ page }) => {
    const names = await clubNames(page, "?seed=4242");
    for (let i = 0; i < 8; i++) {
      await openClubList(page, "?seed=4242");
      await page.getByRole("list", { name: "Clubs" }).getByRole("button").nth(i).click();
      const headings = page.getByRole("heading", { level: 1 });
      await expect(headings).toHaveCount(1);
      await expect(headings).toContainText(names[i]!);
    }
  });

  test("no horizontal scroll at 390px on the club list and club home", async ({ page }) => {
    expect(page.viewportSize()?.width).toBe(390);
    const clubs = await openClubList(page);
    expect(await noHorizontalScroll(page)).toBeLessThanOrEqual(0);
    await clubs.getByRole("button").first().click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    expect(await noHorizontalScroll(page)).toBeLessThanOrEqual(0);
  });

  test("the same seed gives the same league on two fresh visits", async ({ browser }) => {
    const names = async () => {
      const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
      const page = await context.newPage();
      const result = await clubNames(page, "?seed=4242");
      await context.close();
      return result;
    };
    const a = await names();
    const b = await names();
    expect(b).toEqual(a);
  });

  test("different seeds give different leagues", async ({ page }) => {
    const a = await clubNames(page, "?seed=1");
    const b = await clubNames(page, "?seed=4242");
    expect(b).not.toEqual(a);
  });

  for (const bad of ["?seed=abc", "?seed=", "?seed=9999999999"]) {
    test(`an invalid seed (${bad}) gives the default league`, async ({ page }) => {
      const dflt = await clubNames(page);
      expect(await clubNames(page, bad)).toEqual(dflt);
    });
  }

  test("no console errors across title, club list and club home", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
    page.on("pageerror", (e) => errors.push(e.message));
    const clubs = await openClubList(page);
    await clubs.getByRole("button").first().click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    expect(errors).toEqual([]);
  });
});
