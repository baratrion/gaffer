import { expect, test, type Page } from "@playwright/test";

// S-002: View my squad. Owner-approved, black-box, phone viewport.

const openSquad = async (page: Page) => {
  await page.goto("./");
  await page.getByRole("button", { name: "New game" }).click();
  await page.getByRole("list", { name: /clubs/i }).getByRole("listitem").first().getByRole("button").click();
  await page.getByRole("button", { name: "Squad" }).click();
  return page.getByRole("list", { name: /squad/i });
};

test("the squad lists 18 players", async ({ page }) => {
  const squad = await openSquad(page);
  await expect(squad.getByRole("listitem")).toHaveCount(18);
});

test("every player shows a name, a position, an age and an overall rating", async ({ page }) => {
  const squad = await openSquad(page);
  const rows = await squad.getByRole("listitem").allInnerTexts();
  for (const row of rows) {
    expect(row).toMatch(/[A-Za-z]{2,}/); // a name
    expect(row).toMatch(/\b(GK|DF|MF|FW)\b/); // a position
    const numbers = (row.match(/\b\d{1,3}\b/g) ?? []).map(Number);
    expect(numbers.some((n) => n >= 16 && n <= 40)).toBe(true); // a plausible age
    expect(numbers.length).toBeGreaterThanOrEqual(2); // age + overall rating
  }
});

test("the squad has at least two goalkeepers and covers every position", async ({ page }) => {
  const squad = await openSquad(page);
  const rows = await squad.getByRole("listitem").allInnerTexts();
  const positions = rows.map((r) => (r.match(/\b(GK|DF|MF|FW)\b/) ?? [""])[0]);
  expect(positions.filter((p) => p === "GK").length).toBeGreaterThanOrEqual(2);
  for (const pos of ["DF", "MF", "FW"]) expect(positions).toContain(pos);
});

test("the squad screen fits a phone without horizontal scroll", async ({ page }) => {
  await openSquad(page);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(0);
});
