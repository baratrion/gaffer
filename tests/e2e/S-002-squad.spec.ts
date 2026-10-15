// @US-1 (S-002 view my squad)
// @contract-shape:bounded-change (e2e journey)
// Outcome anchor: DISCUSS Elevator Pitch (feature-delta.md US-1)
// Runs against local-preview (ci:serve, localhost:4173/gaffer/) and, via BASE_URL, production smoke.
import { expect, test, type Page } from "@playwright/test";

test.use({ viewport: { width: 390, height: 844 } });

const openClubHome = async (page: Page, clubIndex = 0, query = "?seed=31") => {
  await page.goto(`./${query}`);
  await page.getByRole("button", { name: "New game" }).click();
  await page.getByRole("list", { name: "Clubs" }).getByRole("button").nth(clubIndex).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
};

const openSquad = async (page: Page, clubIndex = 0, query = "?seed=31") => {
  await openClubHome(page, clubIndex, query);
  await page.getByRole("button", { name: "Squad", exact: true }).click();
  const squad = page.getByRole("list", { name: "Squad" });
  await expect(squad.getByRole("listitem")).toHaveCount(18);
  return squad;
};

const rows = async (page: Page, clubIndex = 0, query = "?seed=31"): Promise<string[]> => {
  const squad = await openSquad(page, clubIndex, query);
  const items = squad.getByRole("listitem");
  const out: string[] = [];
  for (let i = 0; i < 18; i++) out.push((await items.nth(i).innerText()).replace(/\s+/g, " ").trim());
  return out;
};

const noHorizontalScroll = (page: Page) =>
  page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);

test.describe("@contract-shape:bounded-change @US-1 S-002 view my squad", () => {
  test("Sam taps Squad on club home and sees 18 players, then taps Back to the club home", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
    page.on("pageerror", (e) => errors.push(e.message));

    await openClubHome(page);
    const clubName = (await page.getByRole("heading", { level: 1 }).innerText()).trim();
    await page.getByRole("button", { name: "Squad", exact: true }).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    await expect(page.getByRole("list", { name: "Squad" }).getByRole("listitem")).toHaveCount(18);
    await page.getByRole("button", { name: "Back", exact: true }).click();
    await expect(page.getByRole("heading", { level: 1 })).toContainText(clubName);
    expect(errors).toEqual([]);
  });

  test("every row reads name, position, age, overall, with age then overall as the first two numbers", async ({ page }) => {
    for (const row of await rows(page)) {
      const m = /^(\D+?) (GK|DF|MF|FW) (\d+) (\d+)$/.exec(row);
      expect(m, row).not.toBeNull();
      expect(Number(m![3])).toBeGreaterThanOrEqual(17);
      expect(Number(m![3])).toBeLessThanOrEqual(35);
      expect(Number(m![4])).toBeGreaterThanOrEqual(1);
      expect(Number(m![4])).toBeLessThanOrEqual(20);
      expect((row.match(/\d+/g) ?? []).slice(0, 2)).toEqual([m![3], m![4]]);
    }
  });

  test("positions are only GK, DF, MF or FW and at least 2 are goalkeepers", async ({ page }) => {
    const positions = (await rows(page)).map((r) => /\b(GK|DF|MF|FW)\b/.exec(r)?.[1]);
    expect(positions.every((p) => p !== undefined)).toBe(true);
    expect(positions.filter((p) => p === "GK").length).toBeGreaterThanOrEqual(2);
    for (const p of ["DF", "MF", "FW"]) expect(positions).toContain(p);
  });

  test("the squad screen has no horizontal scroll at 390px", async ({ page }) => {
    expect(page.viewportSize()?.width).toBe(390);
    await openSquad(page);
    expect(await noHorizontalScroll(page)).toBeLessThanOrEqual(0);
  });

  test("Back and Squad buttons are at least 44px tall", async ({ page }) => {
    await openClubHome(page);
    const squadButton = page.getByRole("button", { name: "Squad", exact: true });
    await expect(squadButton).toBeVisible();
    const squadBox = await squadButton.boundingBox();
    expect(squadBox!.height).toBeGreaterThanOrEqual(44);
    await squadButton.click();
    await expect(page.getByRole("list", { name: "Squad" })).toBeVisible();
    const backButton = page.getByRole("button", { name: "Back", exact: true });
    await expect(backButton).toBeVisible();
    const backBox = await backButton.boundingBox();
    expect(backBox!.height).toBeGreaterThanOrEqual(44);
  });

  test("Back returns to the club home headed by the club's name", async ({ page }) => {
    await openClubHome(page, 2);
    const clubName = (await page.getByRole("heading", { level: 1 }).innerText()).trim();
    await page.getByRole("button", { name: "Squad", exact: true }).click();
    await expect(page.getByRole("list", { name: "Squad" })).toBeVisible();
    await page.getByRole("button", { name: "Back", exact: true }).click();
    await expect(page.getByRole("heading", { level: 1 })).toContainText(clubName);
    await expect(page.getByRole("button", { name: "Squad", exact: true })).toBeVisible();
  });

  test("the same seed gives the identical squad on a fresh visit and on a second look", async ({ browser, page }) => {
    const first = await rows(page);
    await page.getByRole("button", { name: "Back", exact: true }).click();
    await page.getByRole("button", { name: "Squad", exact: true }).click();
    await expect(page.getByRole("list", { name: "Squad" }).getByRole("listitem")).toHaveCount(18);
    const items = page.getByRole("list", { name: "Squad" }).getByRole("listitem");
    const again: string[] = [];
    for (let i = 0; i < 18; i++) again.push((await items.nth(i).innerText()).replace(/\s+/g, " ").trim());
    expect(again).toEqual(first);

    const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
    let fresh: string[];
    try {
      fresh = await rows(await context.newPage());
    } finally {
      await context.close();
    }
    expect(fresh).toEqual(first);
  });

  test("the 8 clubs of one league each show different players", async ({ page }) => {
    const squads: string[] = [];
    for (let i = 0; i < 8; i++) squads.push((await rows(page, i)).join("|"));
    expect(new Set(squads).size).toBe(8);
  });

  test("reloading the squad screen returns to the title because navigation is memory-only @error-boundary", async ({ page }) => {
    await openSquad(page);
    await page.reload();
    await expect(page.getByRole("button", { name: "New game" })).toBeVisible();
    await expect(page.getByRole("list", { name: "Squad" })).toHaveCount(0);
  });

  test("no console errors across club home, squad and back", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
    page.on("pageerror", (e) => errors.push(e.message));
    await openSquad(page);
    await page.getByRole("button", { name: "Back", exact: true }).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    expect(errors).toEqual([]);
  });
});
