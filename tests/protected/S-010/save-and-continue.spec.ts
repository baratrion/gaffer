import { expect, test, type Browser, type Locator, type Page } from "@playwright/test";

// S-010: Save and continue my season. Black-box, phone viewport, roles, accessible names and visible text only.
// The scenarios pin the durable clause: with a saved game the title screen offers "Continue" (exact name) and without
// one it does not; "Continue" restores the saved club with its formation, Starting XI, recorded results and next
// matchday, and the season carries on exactly as it would have without the reload (same seed, same season); "New game"
// always starts a fresh game. Every reload happens on the club home, so the scenarios hold whichever screen "Continue"
// lands on, and they read clubs and players from the screens, so they hold for any generated league.

test.use({ viewport: { width: 390, height: 844 } });

const MATCHDAYS = 14;
const SCORE_SOURCE = "^(.+) (\\d)–(\\d) (.+)$";

interface MatchScreen {
  readonly heading: string;
  readonly score: string;
  readonly goals: readonly string[];
}

const norm = (text: string) => text.replace(/\s+/g, " ").trim();
const heading = (page: Page) => page.getByRole("heading", { level: 1 });
const button = (scope: Page | Locator, name: string) => scope.getByRole("button", { name, exact: true });
const clubsList = (page: Page) => page.getByRole("list", { name: /clubs/i });
const xiList = (page: Page) => page.getByRole("list", { name: "Starting XI", exact: true });
const playersList = (page: Page) => page.getByRole("list", { name: "Players", exact: true });
const overflow = (page: Page) => page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
const height = async (locator: Locator) => (await locator.boundingBox())?.height ?? 0;

const watchErrors = (page: Page) => {
  const errors: string[] = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(e.message));
  return errors;
};

// The visible texts of the innermost elements whose whole visible text matches `source` (one per line on the screen).
const linesMatching = (page: Page, source: string): Promise<string[]> =>
  page.evaluate((pattern) => {
    const regex = new RegExp(pattern);
    const text = (el: Element) => ((el as HTMLElement).innerText ?? "").replace(/\s+/g, " ").trim();
    const reads = (el: Element) => regex.test(text(el));
    return [...document.body.querySelectorAll("*")].filter((el) => reads(el) && ![...el.children].some(reads)).map(text);
  }, source);

// Opens the game, taps "New game" and picks the club at `index` of the "Clubs" list; returns its name.
const startGame = async (page: Page, query: string, index: number): Promise<string> => {
  await page.goto(`./${query}`);
  await button(page, "New game").click();
  const item = clubsList(page).getByRole("listitem").nth(index);
  await expect(clubsList(page).getByRole("listitem")).toHaveCount(8);
  const club = ((await item.innerText()).trim().split("\n")[0] ?? "").trim();
  await item.getByRole("button").click();
  await expectClubHome(page, club);
  return club;
};

const expectClubHome = async (page: Page, club: string) => {
  await expect(heading(page)).toHaveCount(1);
  await expect(heading(page)).toContainText(club);
  await expect(heading(page)).toBeFocused();
};

const backHome = async (page: Page, club: string) => {
  await button(page, "Back").click();
  await expectClubHome(page, club);
};

// Reloads the page and expects the title screen to offer "Continue" next to "New game".
const reloadToTitle = async (page: Page) => {
  await page.reload();
  await expect(heading(page)).toHaveCount(1);
  await expect(heading(page)).toBeFocused();
  const offer = button(page, "Continue");
  await expect(offer, 'the title screen offers "Continue" for the saved game').toBeVisible();
  expect(await height(offer), '"Continue" is at least 44px tall').toBeGreaterThanOrEqual(44);
  await expect(button(page, "New game")).toBeVisible();
  expect(await overflow(page)).toBeLessThanOrEqual(0);
};

// Reloads on the club home, taps "Continue" and expects to be back on the saved club's home screen.
const reloadAndContinue = async (page: Page, club: string) => {
  await reloadToTitle(page);
  await button(page, "Continue").click();
  await expect(heading(page)).toHaveCount(1);
  await expect(heading(page)).toBeFocused();
  if (!(await heading(page).innerText()).includes(club)) await backHome(page, club);
  await expectClubHome(page, club);
};

// Taps "Play match" and reads the match screen of `matchday`; returns to the club home.
const playMatch = async (page: Page, club: string, matchday: number): Promise<MatchScreen> => {
  await button(page, "Play match").click();
  await expect(heading(page)).toHaveText(`Matchday ${matchday}`);
  const scores = await linesMatching(page, SCORE_SOURCE);
  expect(scores, `exactly one score line on the Matchday ${matchday} screen`).toHaveLength(1);
  expect(scores[0], `${club} plays on matchday ${matchday}`).toContain(club);
  const goals = (await page.getByRole("list", { name: "Goals", exact: true }).getByRole("listitem").allInnerTexts()).map(norm);
  const screen = { heading: `Matchday ${matchday}`, score: scores[0]!, goals };
  await backHome(page, club);
  return screen;
};

// Taps "Table" and reads every row of the table named "League table" (header row first); returns to the club home.
const readTable = async (page: Page, club: string): Promise<string[][]> => {
  await button(page, "Table").click();
  await expect(heading(page)).toHaveText("League table");
  const rows = page.getByRole("table", { name: "League table", exact: true }).getByRole("row");
  await expect(rows).toHaveCount(9);
  const table: string[][] = [];
  for (let i = 0; i < 9; i += 1) {
    const row = rows.nth(i);
    const cells = row.getByRole("columnheader").or(row.getByRole("rowheader")).or(row.getByRole("cell"));
    table.push((await cells.allInnerTexts()).map(norm));
  }
  await backHome(page, club);
  return table;
};

const playedColumn = (table: readonly string[][]) => {
  const p = table[0]!.indexOf("P");
  return table.slice(1).map((row) => row[p]);
};

const readXI = async (page: Page, club: string): Promise<string[]> => {
  await button(page, "Starting XI").click();
  await expect(heading(page)).toHaveText("Starting XI");
  const slots = xiList(page).getByRole("listitem");
  await expect(slots).toHaveCount(11);
  const texts = (await slots.allInnerTexts()).map(norm);
  await backHome(page, club);
  return texts;
};

const checkedFormation = async (page: Page, club: string): Promise<string[]> => {
  await button(page, "Tactics").click();
  await expect(heading(page)).toHaveText("Tactics");
  const checked: string[] = [];
  for (const name of ["4-4-2", "4-3-3", "4-2-3-1"]) {
    if (await page.getByRole("radio", { name, exact: true }).isChecked()) checked.push(name);
  }
  await backHome(page, club);
  return checked;
};

interface Season {
  readonly query: string;
  readonly index: number;
  readonly count: number;
}

// Plays `count` matches in a fresh browser (no saved game), for the same seed and club, and reads the last screen and table.
const uninterrupted = async (browser: Browser, { query, index, count }: Season) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  const club = await startGame(page, query, index);
  let last: MatchScreen | undefined;
  for (let matchday = 1; matchday <= count; matchday += 1) last = await playMatch(page, club, matchday);
  const table = await readTable(page, club);
  await context.close();
  return { club, last: last!, table };
};

test("a fresh browser offers no Continue; once a club is picked, a reload offers Continue next to New game", async ({ page }) => {
  const errors = watchErrors(page);
  await page.goto("./?seed=31");
  await expect(heading(page)).toHaveCount(1);
  await expect(button(page, "New game")).toBeVisible();
  await expect(button(page, "Continue"), 'no "Continue" without a saved game').toHaveCount(0);

  await startGame(page, "?seed=31", 3);
  await reloadToTitle(page);
  expect(errors).toEqual([]);
});

test("Continue after a reload resumes the season: the same table, and the next match is the one an uninterrupted season plays", async ({
  page,
  browser,
}) => {
  test.setTimeout(90_000);
  const errors = watchErrors(page);
  const club = await startGame(page, "?seed=31", 2);
  await playMatch(page, club, 1);
  await playMatch(page, club, 2);
  const before = await readTable(page, club);
  expect(playedColumn(before), "every row at P 2 before the reload").toEqual(Array(8).fill("2"));

  await reloadAndContinue(page, club);
  expect(await readTable(page, club), "the same table after Continue").toEqual(before);
  await expect(button(page, "Play match")).toBeVisible();
  const third = await playMatch(page, club, 3);
  const after = await readTable(page, club);
  expect(playedColumn(after), "every row at P 3").toEqual(Array(8).fill("3"));

  const reference = await uninterrupted(browser, { query: "?seed=31", index: 2, count: 3 });
  expect(reference.club).toBe(club);
  expect(third, "matchday 3 after Continue equals matchday 3 played without a reload").toEqual(reference.last);
  expect(after, "the table after matchday 3 equals the uninterrupted one").toEqual(reference.table);
  expect(await overflow(page)).toBeLessThanOrEqual(0);
  expect(errors).toEqual([]);
});

test("Continue restores the chosen formation and the player's own Starting XI pick", async ({ page }) => {
  const errors = watchErrors(page);
  const club = await startGame(page, "?seed=31", 0);

  await button(page, "Tactics").click();
  await expect(heading(page)).toHaveText("Tactics");
  await page.getByRole("radio", { name: "4-3-3", exact: true }).check();
  await expect(page.getByRole("radio", { name: "4-3-3", exact: true })).toBeChecked();
  await backHome(page, club);

  await button(page, "Starting XI").click();
  await expect(heading(page)).toHaveText("Starting XI");
  const slots = xiList(page).getByRole("listitem");
  await expect(slots).toHaveCount(11);
  const automatic = (await slots.allInnerTexts()).map(norm);
  const lastMF = automatic.map((text) => text.slice(0, 2)).lastIndexOf("MF");
  await slots.nth(lastMF).getByRole("button").click();
  await expect(heading(page)).toHaveText("Choose MF");
  const choices = (await playersList(page).getByRole("button").allInnerTexts()).map(norm);
  const outsider = choices.find((text) => !text.endsWith(" Starting"));
  expect(outsider, "a midfielder outside the XI").toBeDefined();
  await button(playersList(page), outsider!).click();
  await expect(heading(page)).toHaveText("Starting XI");
  const picked = (await slots.allInnerTexts()).map(norm);
  expect(picked, "the pick changed the XI").not.toEqual(automatic);
  await backHome(page, club);

  await reloadAndContinue(page, club);
  expect(await checkedFormation(page, club), "Tactics has the saved formation checked").toEqual(["4-3-3"]);
  expect(await readXI(page, club), "the Starting XI lists the same 11 slots").toEqual(picked);
  expect(await overflow(page)).toBeLessThanOrEqual(0);
  expect(errors).toEqual([]);
});

test("with a saved game offered, New game still starts a fresh season", async ({ page }) => {
  const errors = watchErrors(page);
  const club = await startGame(page, "?seed=31", 1);
  await button(page, "Tactics").click();
  await page.getByRole("radio", { name: "4-2-3-1", exact: true }).check();
  await expect(page.getByRole("radio", { name: "4-2-3-1", exact: true })).toBeChecked();
  await backHome(page, club);
  await playMatch(page, club, 1);

  await reloadToTitle(page);
  await button(page, "New game").click();
  const items = clubsList(page).getByRole("listitem");
  await expect(items).toHaveCount(8);
  const clubs = (await items.allInnerTexts()).map((text) => (text.trim().split("\n")[0] ?? "").trim());
  await items.nth(clubs.indexOf(club)).getByRole("button").click();
  await expectClubHome(page, club);

  const table = await readTable(page, club);
  const names = table.slice(1).map((row) => row[1]);
  expect(names, "the fresh table is in A to Z order").toEqual([...names].sort((a, b) => (a! < b! ? -1 : a! > b! ? 1 : 0)));
  const header = table[0]!;
  for (const row of table.slice(1)) {
    for (const column of ["P", "W", "D", "L", "GD", "Pts"]) expect(row[header.indexOf(column)], `${row[1]} ${column}`).toBe("0");
  }
  expect(await checkedFormation(page, club), "a fresh game plays 4-4-2").toEqual(["4-4-2"]);
  await playMatch(page, club, 1);
  expect(errors).toEqual([]);
});

test("a finished season is saved too: Continue offers End of season with the same final lines", async ({ page }) => {
  test.setTimeout(90_000);
  const errors = watchErrors(page);
  const club = await startGame(page, "?seed=31", 4);
  for (let matchday = 1; matchday <= MATCHDAYS; matchday += 1) await playMatch(page, club, matchday);

  const readSeasonEnd = async () => {
    await expect(button(page, "Play match"), 'no "Play match" once the season is played').toHaveCount(0);
    await button(page, "End of season").click();
    await expect(heading(page)).toHaveText("End of season");
    const lines = [...(await linesMatching(page, "^Final position .+$")), ...(await linesMatching(page, "^Top scorer .+$"))];
    expect(lines, 'one "Final position" and one "Top scorer" line').toHaveLength(2);
    await backHome(page, club);
    return lines;
  };
  const before = await readSeasonEnd();
  const table = await readTable(page, club);

  await reloadAndContinue(page, club);
  expect(await readSeasonEnd(), "the same End of season lines after Continue").toEqual(before);
  expect(await readTable(page, club), "the same final table").toEqual(table);
  expect(errors).toEqual([]);
});
