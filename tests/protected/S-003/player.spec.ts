import { expect, test, type Browser, type Page } from "@playwright/test";

// S-003: View a player's details. Black-box, phone viewport, roles and visible text only.

test.use({ viewport: { width: 390, height: 844 } });

const ATTRIBUTES = ["Goalkeeping", "Defending", "Passing", "Shooting"];
const ROW = /^(.+?)\s+(GK|DF|MF|FW)\s+(\d{1,3})\s+(\d{1,3})\b/;

const norm = (text: string) => text.replace(/\s+/g, " ").trim();

// A labelled value read as one line of text: label, a space, value.
const line = (text: string, label: string, value: string) =>
  new RegExp(`^[ \\t]*${label}[ \\t\\u00a0]+(${value})[ \\t]*$`, "m").exec(text)?.[1];

const openSquad = async (page: Page, club = 0, query = "") => {
  await page.goto(`./${query}`);
  await page.getByRole("button", { name: "New game", exact: true }).click();
  const item = page.getByRole("list", { name: /clubs/i }).getByRole("listitem").nth(club);
  const clubName = ((await item.innerText()).trim().split("\n")[0] ?? "").trim();
  await item.getByRole("button").click();
  await page.getByRole("button", { name: "Squad", exact: true }).click();
  const squad = page.getByRole("list", { name: /squad/i });
  await expect(squad.getByRole("listitem")).toHaveCount(18);
  return { clubName, squad };
};

const rowAt = async (page: Page, index: number) => {
  const item = page.getByRole("list", { name: /squad/i }).getByRole("listitem").nth(index);
  const match = ROW.exec(norm(await item.innerText()));
  expect(match, `row ${index} reads name, position, age, overall`).not.toBeNull();
  const [, name, position, age, overall] = match!;
  return { item, name: name!, position: position!, age: Number(age), overall: Number(overall) };
};

const readPlayer = async (page: Page) => {
  const heading = page.getByRole("heading", { level: 1 });
  await expect(heading).toHaveCount(1);
  const attributes = page.getByRole("list", { name: /^attributes$/i });
  await expect(attributes.getByRole("listitem")).toHaveCount(4);
  const items = (await attributes.getByRole("listitem").allInnerTexts()).map(norm);
  const text = await page.locator("body").innerText();
  return {
    name: norm(await heading.innerText()),
    position: line(text, "Position", "GK|DF|MF|FW"),
    age: Number(line(text, "Age", "\\d{1,3}")),
    overall: Number(line(text, "Overall", "\\d{1,3}")),
    condition: line(text, "Condition", "\\d{1,3}[ \\t\\u00a0]*%"),
    items,
  };
};

const openPlayer = async (page: Page, index: number) => {
  const row = await rowAt(page, index);
  await row.item.getByRole("button").click();
  await expect(page.getByRole("list", { name: /^attributes$/i })).toBeVisible();
  return { row, player: await readPlayer(page) };
};

const backToSquad = async (page: Page, clubName: string) => {
  await page.getByRole("button", { name: "Back", exact: true }).click();
  await expect(page.getByRole("heading", { level: 1 })).toContainText(clubName);
  await expect(page.getByRole("list", { name: /squad/i }).getByRole("listitem")).toHaveCount(18);
};

const expectValidDetails = (player: Awaited<ReturnType<typeof readPlayer>>) => {
  const values = player.items.map((item, i) => {
    const match = /^(\S+) (\d{1,3})$/.exec(item);
    expect(match, `attribute item "${item}" reads name then one whole number`).not.toBeNull();
    expect(match![1]).toBe(ATTRIBUTES[i]);
    return Number(match![2]);
  });
  for (const value of values) {
    expect(value).toBeGreaterThanOrEqual(1);
    expect(value).toBeLessThanOrEqual(20);
  }
  expect(player.overall).toBeGreaterThanOrEqual(Math.min(...values));
  expect(player.overall).toBeLessThanOrEqual(Math.max(...values));
  expect(player.condition, "a line reads Condition N%").toBeDefined();
  const condition = Number(/\d+/.exec(player.condition!)![0]);
  expect(condition).toBeGreaterThanOrEqual(0);
  expect(condition).toBeLessThanOrEqual(100);
  return values;
};

const allPlayers = async (page: Page, club: number, query: string) => {
  const { clubName } = await openSquad(page, club, query);
  const players = [];
  for (let i = 0; i < 18; i++) {
    players.push((await openPlayer(page, i)).player);
    await backToSquad(page, clubName);
  }
  return players;
};

const playersInFreshContext = async (browser: Browser, club: number, query: string) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  const players = await allPlayers(page, club, query);
  await context.close();
  return players;
};

test("tapping any player row opens that player's screen, with the same position, age and overall", async ({ page }) => {
  test.setTimeout(60_000);
  const { clubName, squad } = await openSquad(page, 2, "?seed=7");
  for (let i = 0; i < 18; i++) {
    const buttons = squad.getByRole("listitem").nth(i).getByRole("button");
    await expect(buttons, `row ${i} is one tappable button`).toHaveCount(1);
    expect((await buttons.boundingBox())?.height ?? 0).toBeGreaterThanOrEqual(44);
    const { row, player } = await openPlayer(page, i);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(row.name);
    await expect(page.getByRole("heading", { level: 1 })).toBeFocused();
    expect(player.name).toBe(row.name);
    expect(player.position).toBe(row.position);
    expect(player.age).toBe(row.age);
    expect(player.overall).toBe(row.overall);
    await backToSquad(page, clubName);
  }
});

test("every player shows Goalkeeping, Defending, Passing and Shooting 1-20, a condition 0-100%, and an overall within them", async ({ page }) => {
  test.setTimeout(90_000);
  for (const { club, query } of [{ club: 0, query: "?seed=31" }, { club: 5, query: "?seed=4242" }]) {
    const players = await allPlayers(page, club, query);
    const profiles = players.map((player) => expectValidDetails(player).join(","));
    expect(new Set(profiles).size, "the players do not all share the same attributes").toBeGreaterThan(1);
  }
  // Goalkeepers and forwards open too, even when the seed is invalid and the default is used.
  const { clubName } = await openSquad(page, 7, "?seed=abc");
  const positions = [];
  for (let i = 0; i < 18; i++) positions.push((await rowAt(page, i)).position);
  for (const wanted of ["GK", "FW"]) {
    const { player } = await openPlayer(page, positions.indexOf(wanted));
    expect(player.position).toBe(wanted);
    expectValidDetails(player);
    await backToSquad(page, clubName);
  }
});

test("the same seed always shows the same player details, and an invalid seed uses the default", async ({ browser }) => {
  test.setTimeout(90_000);
  const first = await playersInFreshContext(browser, 1, "?seed=31");
  const again = await playersInFreshContext(browser, 1, "?seed=31");
  expect(again).toEqual(first);
  const invalid = await playersInFreshContext(browser, 6, "?seed=abc");
  const fallback = await playersInFreshContext(browser, 6, "");
  expect(invalid).toEqual(fallback);
});

test("Back goes from the player to the squad, then to the club home, and every screen fits a phone without errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(e.message));
  const overflow = () => page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);

  const { clubName } = await openSquad(page, 4);
  await openPlayer(page, 17);
  expect(await overflow()).toBeLessThanOrEqual(0);
  const back = page.getByRole("button", { name: "Back", exact: true });
  expect((await back.boundingBox())?.height ?? 0).toBeGreaterThanOrEqual(44);

  await backToSquad(page, clubName);
  expect(await overflow()).toBeLessThanOrEqual(0);
  await page.getByRole("button", { name: "Back", exact: true }).click();
  await expect(page.getByRole("heading", { level: 1 })).toContainText(clubName);
  await expect(page.getByRole("list", { name: /squad/i })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Squad", exact: true })).toBeVisible();
  expect(errors).toEqual([]);
});
