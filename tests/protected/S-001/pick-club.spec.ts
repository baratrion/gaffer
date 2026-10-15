import { expect, test, type Browser, type Page } from "@playwright/test";

// S-001: Start a new game and pick a club. Black-box, phone viewport, roles and visible text only.

test.use({ viewport: { width: 390, height: 844 } });

const openClubList = async (page: Page, query = "") => {
  await page.goto(`./${query}`);
  await page.getByRole("button", { name: "New game", exact: true }).click();
  const clubs = page.getByRole("list", { name: /clubs/i });
  await expect(clubs.getByRole("listitem")).toHaveCount(8);
  return clubs;
};

const clubNames = async (page: Page, query = "") => {
  const clubs = await openClubList(page, query);
  return (await clubs.getByRole("listitem").allInnerTexts()).map((t) => (t.trim().split("\n")[0] ?? "").trim());
};

const leagueInFreshContext = async (browser: Browser, query: string) => {
  const context = await browser.newContext();
  const page = await context.newPage();
  const names = await clubNames(page, query);
  await context.close();
  return names;
};

test("New game shows a league of 8 tappable clubs under a heading", async ({ page }) => {
  const clubs = await openClubList(page);
  await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  for (const item of await clubs.getByRole("listitem").all()) {
    const button = item.getByRole("button");
    await expect(button).toHaveCount(1);
    const box = await button.boundingBox();
    expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
  }
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(0);
});

test("club names are unique and non-empty", async ({ page }) => {
  const names = await clubNames(page);
  expect(names).toHaveLength(8);
  for (const name of names) expect(name).toMatch(/[A-Za-z]{2,}/);
  expect(new Set(names).size).toBe(8);
});

test("tapping any club lands on that club's home screen", async ({ page }) => {
  for (const index of [0, 5]) {
    const clubs = await openClubList(page);
    const item = clubs.getByRole("listitem").nth(index);
    const name = ((await item.innerText()).trim().split("\n")[0] ?? "").trim();
    expect(name.length).toBeGreaterThan(0);
    await item.getByRole("button").click();
    await expect(page.getByRole("heading", { level: 1 })).toContainText(name);
    await expect(page.getByRole("list", { name: /clubs/i })).toHaveCount(0);
  }
});

test("the same seed generates the same league on every fresh visit", async ({ browser }) => {
  const first = await leagueInFreshContext(browser, "?seed=4242");
  const second = await leagueInFreshContext(browser, "?seed=4242");
  expect(first).toHaveLength(8);
  expect(second).toEqual(first);

  const defaultOnce = await leagueInFreshContext(browser, "");
  const defaultTwice = await leagueInFreshContext(browser, "");
  expect(defaultTwice).toEqual(defaultOnce);
});

test("different seeds generate different leagues", async ({ browser }) => {
  const leagues = new Set<string>();
  for (const seed of [1, 2, 3, 4]) {
    const names = await leagueInFreshContext(browser, `?seed=${seed}`);
    expect(names).toHaveLength(8);
    leagues.add(names.join("|"));
  }
  expect(leagues.size).toBeGreaterThanOrEqual(3);
});
