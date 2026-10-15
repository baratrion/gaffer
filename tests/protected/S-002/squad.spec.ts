import { expect, test, type Page } from "@playwright/test";

// S-002: View my squad. Black-box, phone viewport, roles and visible text only.

test.use({ viewport: { width: 390, height: 844 } });

const POSITION = /\b(GK|DF|MF|FW)\b/g;

const pickClub = async (page: Page, index: number, query = "") => {
  await page.goto(`./${query}`);
  await page.getByRole("button", { name: "New game", exact: true }).click();
  const item = page.getByRole("list", { name: /clubs/i }).getByRole("listitem").nth(index);
  const clubName = ((await item.innerText()).trim().split("\n")[0] ?? "").trim();
  await item.getByRole("button").click();
  return clubName;
};

const openSquad = async (page: Page, index = 0, query = "") => {
  const clubName = await pickClub(page, index, query);
  await page.getByRole("button", { name: "Squad", exact: true }).click();
  const squad = page.getByRole("list", { name: /squad/i });
  await expect(squad.getByRole("listitem")).toHaveCount(18);
  return { clubName, rows: await squad.getByRole("listitem").allInnerTexts() };
};

test("the squad lists 18 players and fits a phone", async ({ page }) => {
  await openSquad(page);
  await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(0);
});

test("every player shows a name, one position, then age, then overall rating", async ({ page }) => {
  const { rows } = await openSquad(page, 3);
  for (const row of rows) {
    expect(row).toMatch(/[A-Za-z]{2,}/);
    expect(row.match(POSITION) ?? []).toHaveLength(1);
    const [age, overall] = (row.match(/\b\d{1,3}\b/g) ?? []).map(Number);
    expect(age).toBeGreaterThanOrEqual(16);
    expect(age).toBeLessThanOrEqual(40);
    expect(overall).toBeGreaterThanOrEqual(1);
    expect(overall).toBeLessThanOrEqual(20);
  }
});

test("every club's squad has at least two goalkeepers and covers every position", async ({ page }) => {
  test.setTimeout(90_000);
  const cases = [...[0, 1, 2, 3, 4, 5, 6, 7].map((club) => ({ club, seed: 7 })), { club: 0, seed: 99 }, { club: 4, seed: 123456 }];
  for (const { club, seed } of cases) {
    const { rows } = await openSquad(page, club, `?seed=${seed}`);
    const positions = rows.map((r) => (r.match(POSITION) ?? [""])[0]);
    expect(positions.filter((p) => p === "GK").length).toBeGreaterThanOrEqual(2);
    for (const pos of ["DF", "MF", "FW"]) expect(positions).toContain(pos);
  }
});

test("every club has different players, and the same seed gives the same squad", async ({ page }) => {
  test.setTimeout(90_000);
  const squads: string[] = [];
  for (const club of [0, 1, 2, 3, 4, 5, 6, 7]) squads.push((await openSquad(page, club, "?seed=31")).rows.join("|"));
  expect(new Set(squads).size).toBe(8);
  const again = await openSquad(page, 0, "?seed=31");
  expect(again.rows.join("|")).toEqual(squads[0]);
});

test("Back returns from the squad to the club home screen", async ({ page }) => {
  const { clubName } = await openSquad(page, 2);
  await page.getByRole("button", { name: "Back", exact: true }).click();
  await expect(page.getByRole("heading", { level: 1 })).toContainText(clubName);
  await expect(page.getByRole("list", { name: /squad/i })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Squad", exact: true })).toBeVisible();
});
