// @US-1 (S-002 view my squad)
// CONTRACT_SHAPE: e2e journey
// Outcome anchor: DISCUSS Elevator Pitch (feature-delta.md US-1): Sam taps "Squad", sees 18 players, taps "Back"
// Runs against local-preview (ci:serve, localhost:4173/gaffer/) and, via BASE_URL, production smoke.
import { expect, test, type Page } from "@playwright/test";

test.use({ viewport: { width: 390, height: 844 } });

const openClubHome = async (page: Page, query = "", clubIndex = 0): Promise<string> => {
  await page.goto(`./${query}`);
  await page.getByRole("button", { name: "New game" }).click();
  const button = page.getByRole("list", { name: "Clubs" }).getByRole("button").nth(clubIndex);
  const name = ((await button.innerText()).split("\n")[0] ?? "").trim();
  await button.click();
  await expect(page.getByRole("heading", { level: 1 })).toContainText(name);
  return name;
};

const openSquad = async (page: Page, query = "", clubIndex = 0) => {
  const club = await openClubHome(page, query, clubIndex);
  await page.getByRole("button", { name: "Squad" }).click();
  const squad = page.getByRole("list", { name: "Squad" });
  await expect(squad.getByRole("listitem")).toHaveCount(18);
  return { club, squad };
};

const rows = async (page: Page, query = "", clubIndex = 0): Promise<string[]> => {
  const { squad } = await openSquad(page, query, clubIndex);
  return (await squad.getByRole("listitem").allInnerTexts()).map((t) => t.replace(/\s+/g, " ").trim());
};

const ROW = /^(\S.*?) (GK|DF|MF|FW) (\d+) (\d+)$/;

const balanceOf = async (page: Page, query: string, clubIndex: number): Promise<number[]> => {
  const positions = (await rows(page, query, clubIndex)).map((r) => ROW.exec(r)?.[2]);
  return ["GK", "DF", "MF", "FW"].map((p) => positions.filter((x) => x === p).length);
};

test.describe("@US-1 S-002 view my squad", () => {
  test("@walking_skeleton Sam taps Squad from the club home, sees 18 players, and taps Back", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
    page.on("pageerror", (e) => errors.push(e.message));

    const club = await openClubHome(page);
    await page.getByRole("button", { name: "Squad" }).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    await expect(page.getByRole("list", { name: "Squad" }).getByRole("listitem")).toHaveCount(18);
    await page.getByRole("button", { name: "Back", exact: true }).click();
    await expect(page.getByRole("heading", { level: 1 })).toContainText(club);
    expect(errors).toEqual([]);
  });

  test("each row reads name, position, age, overall, with age and overall the first two numbers", async ({ page }) => {
    for (let club = 0; club < 8; club++) {
      for (const row of await rows(page, "?seed=31", club)) {
        const m = ROW.exec(row);
        expect(m, `club ${club} row "${row}" matches name position age overall`).not.toBeNull();
        expect(row.match(/\d+/g)).toHaveLength(2);
        expect(Number(m![3])).toBeGreaterThanOrEqual(16);
        expect(Number(m![3])).toBeLessThanOrEqual(40);
        expect(Number(m![4])).toBeGreaterThanOrEqual(1);
        expect(Number(m![4])).toBeLessThanOrEqual(20);
      }
    }
  });

  test("the squad is balanced: 2 GK, 6 DF, 6 MF and 4 FW", async ({ page }) => {
    for (let club = 0; club < 8; club++) {
      expect(await balanceOf(page, "?seed=31", club), `club ${club}`).toEqual([2, 6, 6, 4]);
    }
  });

  test("squad rows are display-only, not buttons", async ({ page }) => {
    const { squad } = await openSquad(page);
    await expect(squad.getByRole("button")).toHaveCount(0);
  });

  test("@determinism the same seed gives the same squad, in the same order, on two fresh visits", async ({ browser }) => {
    const visit = async () => {
      const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
      const page = await context.newPage();
      const result = await rows(page, "?seed=31");
      await context.close();
      return result;
    };
    const a = await visit();
    const b = await visit();
    expect(b).toEqual(a);
  });

  test("every club of the league has a different squad and no player name is shared", async ({ page }) => {
    const names: string[] = [];
    const keys: string[] = [];
    for (let i = 0; i < 8; i++) {
      const squad = await rows(page, "?seed=31", i);
      keys.push(squad.join("|"));
      names.push(...squad.map((r) => ROW.exec(r)![1]!));
    }
    expect(new Set(keys).size).toBe(8);
    expect(names).toHaveLength(144);
    expect(new Set(names).size).toBe(144);
  });

  test("Back returns to the club home whose heading is the club's name", async ({ page }) => {
    const club = await openClubHome(page, "?seed=31", 4);
    await page.getByRole("button", { name: "Squad" }).click();
    await expect(page.getByRole("list", { name: "Squad" })).toBeVisible();
    await page.getByRole("button", { name: "Back", exact: true }).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(club);
    await expect(page.getByRole("list", { name: "Squad" })).toHaveCount(0);
  });

  for (const bad of ["abc", "9999999999", ""]) {
    test(`@error an invalid seed "${bad}" falls back to the default and the 8th club still has a balanced 18-player squad`, async ({ page }) => {
      expect(await rows(page, `?seed=${bad}`, 7)).toHaveLength(18);
      expect(await balanceOf(page, `?seed=${bad}`, 7)).toEqual([2, 6, 6, 4]);
    });
  }

  test("no horizontal scroll at 390px on club home and the squad", async ({ page }) => {
    await openClubHome(page);
    const overflow = () => page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(await overflow()).toBeLessThanOrEqual(0);
    await page.getByRole("button", { name: "Squad" }).click();
    await expect(page.getByRole("list", { name: "Squad" }).getByRole("listitem")).toHaveCount(18);
    expect(await overflow()).toBeLessThanOrEqual(0);
  });

  test("the Squad and Back buttons are at least 44px tall", async ({ page }) => {
    await openClubHome(page);
    const squadButton = page.getByRole("button", { name: "Squad" });
    expect((await squadButton.boundingBox())?.height ?? 0).toBeGreaterThanOrEqual(44);
    await squadButton.click();
    const back = page.getByRole("button", { name: "Back", exact: true });
    expect((await back.boundingBox())?.height ?? 0).toBeGreaterThanOrEqual(44);
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

  test("focus moves to the new h1 after Squad and after Back", async ({ page }) => {
    await openClubHome(page);
    await page.getByRole("button", { name: "Squad" }).click();
    await expect(page.getByRole("list", { name: "Squad" })).toBeVisible();
    await expect(page.getByRole("heading", { level: 1 })).toBeFocused();
    await page.getByRole("button", { name: "Back", exact: true }).click();
    await expect(page.getByRole("list", { name: "Squad" })).toHaveCount(0);
    await expect(page.getByRole("heading", { level: 1 })).toBeFocused();
  });
});
