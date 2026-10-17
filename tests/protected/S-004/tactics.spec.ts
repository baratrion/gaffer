import { expect, test, type Browser, type Page } from "@playwright/test";

// S-004: Choose a formation. Black-box, phone viewport, roles, labels and visible text only.

test.use({ viewport: { width: 390, height: 844 } });

const FORMATIONS = ["4-4-2", "4-3-3", "4-2-3-1"] as const;
type Formation = (typeof FORMATIONS)[number];

const lineUpOf = ([gk, df, mf, fw]: readonly [number, number, number, number]) => [
  ...Array<string>(gk).fill("GK"),
  ...Array<string>(df).fill("DF"),
  ...Array<string>(mf).fill("MF"),
  ...Array<string>(fw).fill("FW"),
];

const LINE_UPS: Record<Formation, string[]> = {
  "4-4-2": lineUpOf([1, 4, 4, 2]),
  "4-3-3": lineUpOf([1, 4, 3, 3]),
  "4-2-3-1": lineUpOf([1, 4, 5, 1]),
};

const escape = (text: string) => text.replace(/[.*+?^${}()|[\]\\-]/g, "\\$&");
const heading = (page: Page) => page.getByRole("heading", { level: 1 });
const formationGroup = (page: Page) => page.getByRole("radiogroup", { name: "Formation", exact: true });
const radio = (page: Page, name: Formation) => formationGroup(page).getByRole("radio", { name, exact: true });
// The visible label of a formation's radio: the text the player taps.
const label = (page: Page, name: Formation) =>
  page.locator("label").filter({ hasText: new RegExp(`^\\s*${escape(name)}\\s*$`) });
const lineUpItems = (page: Page) => page.getByRole("list", { name: "Line-up", exact: true }).getByRole("listitem");
const overflow = (page: Page) => page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
const height = async (locator: ReturnType<Page["locator"]>) => (await locator.boundingBox())?.height ?? 0;

const openClubHome = async (page: Page, club: number, query: string) => {
  await page.goto(`./${query}`);
  await page.getByRole("button", { name: "New game", exact: true }).click();
  const item = page.getByRole("list", { name: /clubs/i }).getByRole("listitem").nth(club);
  const clubName = ((await item.innerText()).trim().split("\n")[0] ?? "").trim();
  await item.getByRole("button").click();
  await expect(heading(page)).toContainText(clubName);
  return clubName;
};

const openTactics = async (page: Page) => {
  const tactics = page.getByRole("button", { name: "Tactics", exact: true });
  expect(await height(tactics), '"Tactics" is at least 44px tall').toBeGreaterThanOrEqual(44);
  await tactics.click();
  await expect(heading(page)).toHaveCount(1);
  await expect(heading(page)).toHaveText("Tactics");
  await expect(heading(page)).toBeFocused();
};

const expectChecked = async (page: Page, chosen: Formation) => {
  for (const name of FORMATIONS) {
    if (name === chosen) await expect(radio(page, name), `${name} is checked`).toBeChecked();
    else await expect(radio(page, name), `${name} is not checked`).not.toBeChecked();
  }
};

const expectLineUp = async (page: Page, formation: Formation) => {
  await expect(lineUpItems(page)).toHaveCount(11);
  const codes = (await lineUpItems(page).allInnerTexts()).map((text) => text.trim());
  expect(codes, `line-up of ${formation}`).toEqual(LINE_UPS[formation]);
};

const readLineUps = async (browser: Browser, club: number, query: string) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await openClubHome(page, club, query);
  await openTactics(page);
  await expectChecked(page, "4-4-2");
  const lineUps: Record<string, string[]> = {};
  for (const name of ["4-2-3-1", "4-3-3", "4-4-2"] as const) {
    await label(page, name).click();
    await expectChecked(page, name);
    await expect(lineUpItems(page)).toHaveCount(11);
    lineUps[name] = (await lineUpItems(page).allInnerTexts()).map((text) => text.trim());
  }
  await context.close();
  return lineUps;
};

test("Tactics opens on its own focused heading with the three formations in order and 4-4-2 checked in a new game", async ({ page }) => {
  await openClubHome(page, 0, "?seed=31");
  await openTactics(page);
  const radios = formationGroup(page).getByRole("radio");
  await expect(radios).toHaveCount(3);
  for (const [i, name] of FORMATIONS.entries()) await expect(radios.nth(i)).toHaveAccessibleName(name);
  await expectChecked(page, "4-4-2");
  await expectLineUp(page, "4-4-2");
  for (const name of FORMATIONS) {
    await expect(label(page, name), `one visible label reads ${name}`).toHaveCount(1);
    expect(await height(label(page, name)), `the ${name} label is at least 44px tall`).toBeGreaterThanOrEqual(44);
  }
});

test("tapping a formation's label checks only it, updates the line-up at once and keeps focus on its radio", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(e.message));

  await openClubHome(page, 3, "?seed=7");
  expect(await overflow(page)).toBeLessThanOrEqual(0);
  await openTactics(page);
  for (const name of ["4-3-3", "4-2-3-1", "4-4-2", "4-2-3-1"] as const) {
    await label(page, name).click();
    await expectChecked(page, name);
    await expectLineUp(page, name);
    await expect(heading(page)).toHaveCount(1);
    await expect(heading(page)).toHaveText("Tactics");
    await expect(radio(page, name), `focus is on the tapped ${name} radio`).toBeFocused();
    expect(await overflow(page)).toBeLessThanOrEqual(0);
  }
  expect(errors).toEqual([]);
});

test("the chosen formation is kept after Back, Squad and Back, for the rest of the session", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(e.message));

  const clubName = await openClubHome(page, 5, "?seed=31");
  await openTactics(page);
  await label(page, "4-2-3-1").click();
  await expectChecked(page, "4-2-3-1");

  const back = page.getByRole("button", { name: "Back", exact: true });
  expect(await height(back), '"Back" is at least 44px tall').toBeGreaterThanOrEqual(44);
  await back.click();
  await expect(heading(page)).toContainText(clubName);
  await expect(formationGroup(page)).toHaveCount(0);

  await page.getByRole("button", { name: "Squad", exact: true }).click();
  await expect(page.getByRole("list", { name: /squad/i }).getByRole("listitem")).toHaveCount(18);
  await page.getByRole("button", { name: "Back", exact: true }).click();
  await expect(heading(page)).toContainText(clubName);

  await openTactics(page);
  await expectChecked(page, "4-2-3-1");
  await expectLineUp(page, "4-2-3-1");
  await label(page, "4-3-3").click();
  await page.getByRole("button", { name: "Back", exact: true }).click();
  await openTactics(page);
  await expectChecked(page, "4-3-3");
  await expectLineUp(page, "4-3-3");
  expect(errors).toEqual([]);
});

test("every new game starts at 4-4-2 and the line-ups are the same whatever the seed", async ({ browser }) => {
  const seeded = await readLineUps(browser, 0, "?seed=31");
  const invalid = await readLineUps(browser, 7, "?seed=abc");
  expect(seeded).toEqual(LINE_UPS);
  expect(invalid).toEqual(seeded);
});
