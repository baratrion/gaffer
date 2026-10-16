// @US-1 (S-003 view a player's details)
// CONTRACT_SHAPE: e2e journey
// Outcome anchor: DISCUSS Elevator Pitch (feature-delta.md US-1): on the squad list Sam taps a player's row, sees the
// player's name, position, age, overall, four attributes and condition, then taps "Back" to return to the squad.
// Environment precondition: runs against local-preview (ci:serve, http://localhost:4173/gaffer/) or, via BASE_URL, the
// deployed Pages site; both serve the production build under /gaffer/. Not meant for local-dev (vite dev, :5173): waived.
// Destination: tests/e2e/S-003-player.spec.ts (DELIVER step 02).
import { expect, test, type Locator, type Page } from "@playwright/test";

// Viewport and device: the Pixel 7 profile at 390px comes from playwright.config.ts (no per-spec override).

const ROW = /^(\S.*?) (GK|DF|MF|FW) (\d+) (\d+)$/;
const ATTRIBUTES = ["Goalkeeping", "Defending", "Passing", "Shooting"] as const;
const clean = (text: string): string => text.replace(/\s+/g, " ").trim();

const openClubHome = async (page: Page, query: string, clubIndex: number): Promise<string> => {
  await page.goto(`./${query}`);
  await page.getByRole("button", { name: "New game" }).click();
  const button = page.getByRole("list", { name: "Clubs" }).getByRole("button").nth(clubIndex);
  const name = ((await button.innerText()).split("\n")[0] ?? "").trim();
  await button.click();
  await expect(page.getByRole("heading", { level: 1 })).toContainText(name);
  return name;
};

const openSquad = async (page: Page, query = "?seed=31", clubIndex = 0) => {
  const club = await openClubHome(page, query, clubIndex);
  await page.getByRole("button", { name: "Squad" }).click();
  const squad = page.getByRole("list", { name: "Squad" });
  await expect(squad.getByRole("listitem")).toHaveCount(18);
  return { club, squad };
};

const installTapCounter = (page: Page) =>
  page.evaluate(() => {
    const w = window as unknown as { __taps: number };
    w.__taps = 0;
    document.addEventListener("click", () => void w.__taps++, true);
  });
const tapsSoFar = (page: Page): Promise<number> => page.evaluate(() => (window as unknown as { __taps: number }).__taps);

const back = (page: Page): Locator => page.getByRole("button", { name: "Back", exact: true });
const rowButton = (squad: Locator, index: number): Locator => squad.getByRole("listitem").nth(index).getByRole("button");
const rowTexts = async (squad: Locator): Promise<string[]> => (await squad.getByRole("listitem").allInnerTexts()).map(clean);

interface Row { name: string; position: string; age: number; overall: number }
const parseRow = (text: string): Row => {
  const m = ROW.exec(text);
  expect(m, `row "${text}" reads name position age overall`).not.toBeNull();
  return { name: m![1]!, position: m![2]!, age: Number(m![3]), overall: Number(m![4]) };
};

/** Everything visible on the player screen, read as Sam would read it (visible text only). */
const readPlayerScreen = async (page: Page) => {
  const attributes = page.getByRole("list", { name: "Attributes" });
  await expect(attributes).toBeVisible();
  return {
    headings: await page.getByRole("heading", { level: 1 }).allInnerTexts(),
    lines: (await page.locator("p").allInnerTexts()).map((t) => t.trim()),
    attributeItems: await attributes.getByRole("listitem").allInnerTexts(),
    attributeListCount: await page.getByRole("list", { name: "Attributes" }).count(),
    listCount: await page.getByRole("list").count(),
  };
};

const parseAttributes = (items: string[]): number[] =>
  items.map((item, i) => {
    const m = new RegExp(`^${ATTRIBUTES[i]} (\\d+)$`).exec(item.trim());
    expect(m, `attribute item ${i} "${item}" reads "${ATTRIBUTES[i]} N" on one line`).not.toBeNull();
    expect(item.match(/\d+/g)).toHaveLength(1);
    return Number(m![1]);
  });

/** Opens row `index` of the open squad, asserts the whole player screen against the tapped row, returns the screen text. */
const checkPlayerScreen = async (page: Page, squad: Locator, index: number): Promise<string> => {
  const row = parseRow((await rowTexts(squad))[index]!);
  await rowButton(squad, index).click();
  const screen = await readPlayerScreen(page);

  expect(screen.headings, `row ${index}: exactly one heading, the player's name`).toEqual([row.name]);
  expect(screen.lines).toContain(`Position ${row.position}`);
  expect(screen.lines).toContain(`Age ${row.age}`);
  expect(screen.lines).toContain(`Overall ${row.overall}`);

  expect(screen.attributeListCount).toBe(1);
  expect(screen.attributeItems).toHaveLength(4);
  const values = parseAttributes(screen.attributeItems);
  for (const v of values) {
    expect(Number.isInteger(v) && v >= 1 && v <= 20, `attribute ${v} is a whole number 1-20`).toBe(true);
  }
  expect(row.overall, "overall is at least the lowest attribute").toBeGreaterThanOrEqual(Math.min(...values));
  expect(row.overall, "overall is at most the highest attribute").toBeLessThanOrEqual(Math.max(...values));

  const condition = screen.lines.filter((l) => /^Condition \d+%$/.test(l));
  expect(condition, "one Condition line, outside the Attributes list").toHaveLength(1);
  const percent = Number(/(\d+)%/.exec(condition[0]!)![1]);
  expect(percent).toBeGreaterThanOrEqual(0);
  expect(percent).toBeLessThanOrEqual(100);
  await expect(page.getByRole("list", { name: "Attributes" }).getByText(/Condition/)).toHaveCount(0);

  const screenText = [screen.headings.join(), ...screen.lines, ...screen.attributeItems.map(clean)].join("|");
  await back(page).click();
  await expect(squad).toBeVisible();
  return screenText;
};

test.describe("@US-1 S-003 view a player's details", () => {
  test("@walking_skeleton @kpi Sam taps a player's row in 1 tap, sees the player, taps Back in 1 tap, then Back to the club home @contract-shape:bounded-change", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
    page.on("pageerror", (e) => errors.push(e.message));
    const { club, squad } = await openSquad(page);
    const first = parseRow((await rowTexts(squad))[0]!);

    expect(new URL(page.url()).pathname, "precondition: production build served under /gaffer/").toBe("/gaffer/");
    await installTapCounter(page);

    await rowButton(squad, 0).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(first.name);
    expect(await tapsSoFar(page), "squad to player is 1 tap").toBe(1);

    await back(page).click();
    await expect(page.getByRole("list", { name: "Squad" }).getByRole("listitem")).toHaveCount(18);
    expect(await tapsSoFar(page), "player to squad is 1 more tap").toBe(2);

    await back(page).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(club);
    await expect(page.getByRole("list", { name: "Squad" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Squad" })).toBeVisible();
    expect(errors).toEqual([]);
  });

  test("each squad row holds exactly one button, 44px or taller, with the row text unchanged @contract-shape:bounded-change", async ({ page }) => {
    const { squad } = await openSquad(page);
    const items = squad.getByRole("listitem");
    for (let i = 0; i < 18; i++) {
      const item = items.nth(i);
      await expect(item.getByRole("button"), `row ${i} holds exactly one button`).toHaveCount(1);
      expect((await item.getByRole("button").boundingBox())?.height ?? 0, `row ${i} button height`).toBeGreaterThanOrEqual(44);
      const text = clean(await item.innerText());
      expect(ROW.test(text), `row ${i} "${text}" still reads name position age overall`).toBe(true);
      expect(text.match(/\d+/g)).toHaveLength(2);
    }
  });

  for (const clubIndex of [0, 7]) {
    test(`all 18 players of club ${clubIndex} show name, position, age, overall equal to the row, four attributes in order and a condition @contract-shape:bounded-change`, async ({ page }) => {
      const { squad } = await openSquad(page, "?seed=31", clubIndex);
      for (let i = 0; i < 18; i++) await checkPlayerScreen(page, squad, i);
    });
  }

  test("the player screen has one heading, one list named Attributes, and no other list @contract-shape:bounded-change", async ({ page }) => {
    const { squad } = await openSquad(page);
    await rowButton(squad, 5).click();
    const screen = await readPlayerScreen(page);
    expect(screen.headings).toHaveLength(1);
    expect(screen.attributeListCount).toBe(1);
    expect(screen.listCount).toBe(1);
  });

  test("Back from a player shows the same club's squad of 18; Back again shows the club home @contract-shape:bounded-change", async ({ page }) => {
    const { club, squad } = await openSquad(page, "?seed=31", 4);
    const before = await rowTexts(squad);
    await rowButton(squad, 17).click();
    await back(page).click();
    await expect(page.getByRole("heading", { level: 1 })).toContainText(club);
    await expect(page.getByRole("list", { name: "Squad" }).getByRole("listitem")).toHaveCount(18);
    expect(await rowTexts(page.getByRole("list", { name: "Squad" }))).toEqual(before);
    await back(page).click();
    await expect(page.getByRole("heading", { level: 1 })).toContainText(club);
    await expect(page.getByRole("list", { name: "Squad" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Squad" })).toBeVisible();
  });

  test("@determinism the same seed gives identical player screens on two fresh visits, and the players differ @contract-shape:bounded-change", async ({ page: first }) => {
    const visit = async (page: Page): Promise<string[]> => {
      const { squad } = await openSquad(page, "?seed=31", 0);
      const screens: string[] = [];
      for (let i = 0; i < 18; i++) screens.push(await checkPlayerScreen(page, squad, i));
      return screens;
    };
    const firstVisit = await visit(first);
    const second = await visit(await first.context().newPage());
    expect(second).toEqual(firstVisit);
    const tuples = firstVisit.map((s) => s.split("|").filter((l) => ATTRIBUTES.some((a) => l.startsWith(a))).join(","));
    expect(new Set(tuples).size, "the 18 players do not all share the same four attributes").toBeGreaterThan(1);
  });

  test("@error ?seed=abc: the 8th club's goalkeeper and forward both open, identically on a fresh visit @contract-shape:bounded-change", async ({ page: first }) => {
    const visit = async (page: Page) => {
      const { squad } = await openSquad(page, "?seed=abc", 7);
      const rows = (await rowTexts(squad)).map(parseRow);
      const gk = rows.findIndex((r) => r.position === "GK");
      const fw = rows.findIndex((r) => r.position === "FW");
      expect(gk).toBeGreaterThanOrEqual(0);
      expect(fw).toBeGreaterThanOrEqual(0);

      await rowButton(squad, gk).click();
      const keeper = await readPlayerScreen(page);
      expect(keeper.lines).toContain("Position GK");
      expect(keeper.attributeItems).toHaveLength(4);
      expect(keeper.lines.some((l) => /^Condition \d+%$/.test(l))).toBe(true);
      await back(page).click();
      await expect(squad).toBeVisible();

      await rowButton(squad, fw).click();
      const forward = await readPlayerScreen(page);
      expect(forward.lines).toContain("Position FW");
      expect(forward.attributeItems).toHaveLength(4);
      expect(forward.lines.some((l) => /^Condition \d+%$/.test(l))).toBe(true);
      return JSON.stringify([keeper, forward]);
    };
    expect(await visit(first)).toBe(await visit(await first.context().newPage()));
  });

  test("the Back button on the player screen is at least 44px tall @contract-shape:bounded-change", async ({ page }) => {
    const { squad } = await openSquad(page);
    await rowButton(squad, 0).click();
    await expect(page.getByRole("list", { name: "Attributes" })).toBeVisible();
    expect((await back(page).boundingBox())?.height ?? 0).toBeGreaterThanOrEqual(44);
  });

  test("no horizontal scroll at 390px on the squad and on every player screen of the 8th club @contract-shape:bounded-change", async ({ page }) => {
    const overflow = () => page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    const { squad } = await openSquad(page, "?seed=31", 7);
    expect(await overflow()).toBeLessThanOrEqual(0);
    for (let i = 0; i < 18; i++) {
      await rowButton(squad, i).click();
      await expect(page.getByRole("list", { name: "Attributes" })).toBeVisible();
      expect(await overflow(), `player ${i}`).toBeLessThanOrEqual(0);
      await back(page).click();
      await expect(squad).toBeVisible();
    }
  });

  test("focus moves to the new h1 after tapping a row and after Back @contract-shape:bounded-change", async ({ page }) => {
    const { squad } = await openSquad(page);
    await rowButton(squad, 0).click();
    await expect(page.getByRole("list", { name: "Attributes" })).toBeVisible();
    await expect(page.getByRole("heading", { level: 1 })).toBeFocused();
    await back(page).click();
    await expect(page.getByRole("list", { name: "Squad" })).toBeVisible();
    await expect(page.getByRole("heading", { level: 1 })).toBeFocused();
  });

  test("no console errors across squad, player, back, back @contract-shape:bounded-change", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
    page.on("pageerror", (e) => errors.push(e.message));
    const { squad } = await openSquad(page);
    await rowButton(squad, 3).click();
    await expect(page.getByRole("list", { name: "Attributes" })).toBeVisible();
    await back(page).click();
    await expect(squad).toBeVisible();
    await back(page).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    expect(errors).toEqual([]);
  });
});
