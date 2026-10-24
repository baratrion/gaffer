import { expect, test, type Locator, type Page } from "@playwright/test";

// S-007: See the league table after my first match. Black-box, phone viewport, roles, accessible names and
// visible text only. The scenarios check rules that hold for any seed (row rules, order, agreement with the
// score line, kept results), not a generated table. Later versions may add columns after "Pts", so only the
// first 8 columns are read; the re-show on a second "Play match" is a rule of this version and is not checked.

test.use({ viewport: { width: 390, height: 844 } });

const COLUMNS = ["Pos", "Club", "P", "W", "D", "L", "GD", "Pts"];
const SCORE_SOURCE = "^(.+) (\\d)–(\\d) (.+)$";
const SCORE_TEXT = new RegExp(SCORE_SOURCE);
const WHOLE = /^\d+$/;
const GOAL_DIFFERENCE = /^(\+[1-9]\d*|0|-[1-9]\d*)$/;

interface Row {
  readonly pos: number;
  readonly club: string;
  readonly p: number;
  readonly w: number;
  readonly d: number;
  readonly l: number;
  readonly gd: number;
  readonly pts: number;
}
interface Score {
  readonly home: string;
  readonly homeGoals: number;
  readonly awayGoals: number;
  readonly away: string;
}

const heading = (page: Page) => page.getByRole("heading", { level: 1 });
const button = (scope: Page | Locator, name: string) => scope.getByRole("button", { name, exact: true });
const leagueTable = (page: Page) => page.getByRole("table", { name: "League table", exact: true });
const overflow = (page: Page) => page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
const height = async (locator: Locator) => (await locator.boundingBox())?.height ?? 0;
const codePointOrder = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0);

const watchErrors = (page: Page) => {
  const errors: string[] = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(e.message));
  return errors;
};

// Starts a new game on a fresh page and returns the names of the 8 clubs in the "Clubs" list.
const newGame = async (page: Page, query: string): Promise<string[]> => {
  await page.goto(`./${query}`);
  await button(page, "New game").click();
  const items = page.getByRole("list", { name: /clubs/i }).getByRole("listitem");
  await expect(items).toHaveCount(8);
  return (await items.allInnerTexts()).map((text) => (text.trim().split("\n")[0] ?? "").trim());
};

const pickClub = async (page: Page, clubs: readonly string[], club: string) => {
  await page.getByRole("list", { name: /clubs/i }).getByRole("listitem").nth(clubs.indexOf(club)).getByRole("button").click();
  await expect(heading(page)).toContainText(club);
};

const backHome = async (page: Page, club: string) => {
  const back = button(page, "Back");
  expect(await height(back), '"Back" is at least 44px tall').toBeGreaterThanOrEqual(44);
  await back.click();
  await expect(heading(page)).toHaveCount(1);
  await expect(heading(page)).toContainText(club);
  await expect(heading(page)).toBeFocused();
};

const number = (text: string, column: string, pattern: RegExp = WHOLE): number => {
  expect(text, `${column} reads a whole number, got "${text}"`).toMatch(pattern);
  return Number(text);
};

// Taps "Table" on the club home and reads the league table, checking its structure and row rules on the way.
const readTable = async (page: Page, clubs: readonly string[]): Promise<Row[]> => {
  const open = button(page, "Table");
  expect(await height(open), '"Table" is at least 44px tall').toBeGreaterThanOrEqual(44);
  await open.click();
  await expect(heading(page)).toHaveCount(1);
  await expect(heading(page)).toHaveText("League table");
  await expect(heading(page)).toBeFocused();

  const table = leagueTable(page);
  await expect(table).toHaveCount(1);
  await expect(table).toBeVisible();
  const allRows = table.getByRole("row");
  const headerRows = allRows.filter({ has: page.getByRole("columnheader") });
  await expect(headerRows, "exactly one header row").toHaveCount(1);
  const headers = (await headerRows.getByRole("columnheader").allInnerTexts()).map((t) => t.trim());
  expect(headers.slice(0, 8), "the first 8 column headers").toEqual(COLUMNS);

  const bodyRows = allRows.filter({ has: page.getByRole("rowheader") });
  await expect(bodyRows, "one body row per club").toHaveCount(8);
  const rows: Row[] = [];
  for (let i = 0; i < 8; i += 1) {
    const row = bodyRows.nth(i);
    await expect(row.getByRole("rowheader"), "the club cell is the row's one row header").toHaveCount(1);
    const club = (await row.getByRole("rowheader").innerText()).trim();
    const cells = (await row.getByRole("cell").allInnerTexts()).map((t) => t.trim());
    expect(cells.length, `${club}: Pos and P, W, D, L, GD, Pts are cells`).toBeGreaterThanOrEqual(7);
    const [pos, p, w, d, l, gd, pts] = cells as [string, string, string, string, string, string, string];
    rows.push({
      pos: number(pos, "Pos"),
      club,
      p: number(p, "P"),
      w: number(w, "W"),
      d: number(d, "D"),
      l: number(l, "L"),
      gd: number(gd, "GD", GOAL_DIFFERENCE),
      pts: number(pts, "Pts"),
    });
  }

  expect(rows.map((r) => r.pos), "Pos is 1 to 8 down the table").toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  expect(rows.map((r) => r.club).sort(codePointOrder), "each club of the Clubs list exactly once").toEqual(
    [...clubs].sort(codePointOrder),
  );
  for (const r of rows) {
    expect(r.w + r.d + r.l, `${r.club}: W + D + L = P`).toBe(r.p);
    expect(r.pts, `${r.club}: Pts = 3 × W + D`).toBe(3 * r.w + r.d);
  }
  for (let i = 1; i < rows.length; i += 1) {
    const [above, below] = [rows[i - 1]!, rows[i]!];
    expect(below.pts, `Pts never increases down the table (${above.club}, ${below.club})`).toBeLessThanOrEqual(above.pts);
    if (below.pts === above.pts) {
      expect(below.gd, `GD never increases between rows with equal Pts (${above.club}, ${below.club})`).toBeLessThanOrEqual(above.gd);
    }
  }
  expect(await overflow(page), "no horizontal scroll at 390px").toBeLessThanOrEqual(0);
  return rows;
};

// Taps "Play match" and reads the one score line of the match screen.
const playMatch = async (page: Page): Promise<Score> => {
  await button(page, "Play match").click();
  await expect(heading(page)).toHaveText("Matchday 1");
  const lines = await page.evaluate((source) => {
    const pattern = new RegExp(source);
    const text = (el: Element) => (el.textContent ?? "").replace(/\s+/g, " ").trim();
    const reads = (el: Element) => pattern.test(text(el));
    return [...document.body.querySelectorAll("*")].filter((el) => reads(el) && ![...el.children].some(reads)).map(text);
  }, SCORE_SOURCE);
  expect(lines, "exactly one score line on the match screen").toHaveLength(1);
  const match = SCORE_TEXT.exec(lines[0]!)!;
  return { home: match[1]!, homeGoals: Number(match[2]), awayGoals: Number(match[3]), away: match[4]! };
};

const rowOf = (rows: readonly Row[], club: string): Row => {
  const row = rows.find((r) => r.club === club);
  expect(row, `${club} has a row`).toBeDefined();
  return row!;
};

// After matchday 1: every club played once, the totals balance, and both clubs of my match agree with its score line.
const expectAfterMatchday1 = (rows: readonly Row[], club: string, score: Score) => {
  for (const r of rows) expect(r.p, `${r.club} has played 1`).toBe(1);
  const total = (pick: (r: Row) => number) => rows.reduce((sum, r) => sum + pick(r), 0);
  expect(total((r) => r.w), "total W equals total L").toBe(total((r) => r.l));
  expect(total((r) => r.d) % 2, "total D is even").toBe(0);
  expect(total((r) => r.gd), "the GDs add up to 0").toBe(0);

  const mine = club === score.home ? score.homeGoals : score.awayGoals;
  const theirs = club === score.home ? score.awayGoals : score.homeGoals;
  const opponent = club === score.home ? score.away : score.home;
  const expected = (goals: number, against: number) => ({
    p: 1,
    w: goals > against ? 1 : 0,
    d: goals === against ? 1 : 0,
    l: goals < against ? 1 : 0,
    gd: goals - against,
    pts: goals > against ? 3 : goals === against ? 1 : 0,
  });
  const { p, w, d, l, gd, pts } = rowOf(rows, club);
  expect({ p, w, d, l, gd, pts }, `${club}'s row agrees with "${score.home} ${score.homeGoals}–${score.awayGoals} ${score.away}"`).toEqual(
    expected(mine, theirs),
  );
  const other = rowOf(rows, opponent);
  expect(
    { p: other.p, w: other.w, d: other.d, l: other.l, gd: other.gd, pts: other.pts },
    `${opponent} has the mirror row`,
  ).toEqual(expected(theirs, mine));
};

test("before the first match the League table lists every club on zero in A to Z order, and Back leads home unchanged", async ({ page }) => {
  const errors = watchErrors(page);
  const clubs = await newGame(page, "?seed=31");
  const club = clubs[0]!;
  await pickClub(page, clubs, club);
  for (const name of ["Squad", "Tactics", "Starting XI", "Play match"]) await expect(button(page, name)).toBeVisible();

  const rows = await readTable(page, clubs);
  for (const r of rows) {
    expect([r.p, r.w, r.d, r.l, r.gd, r.pts], `${r.club} reads P 0, W 0, D 0, L 0, GD 0, Pts 0`).toEqual([0, 0, 0, 0, 0, 0]);
  }
  expect(rows.map((r) => r.club), "A to Z by club name").toEqual([...clubs].sort(codePointOrder));

  await backHome(page, club);
  await button(page, "Tactics").click();
  await expect(page.getByRole("radio", { name: "4-4-2", exact: true })).toBeChecked();
  await button(page, "Back").click();
  await expect(heading(page)).toContainText(club);
  expect(errors).toEqual([]);
});

test("after my first match every club has played once and my row and my opponent's agree with the score line", async ({ page }) => {
  test.slow();
  const errors = watchErrors(page);
  for (const [query, index] of [["?seed=31", 0], ["?seed=abc", 5], ["?seed=7", 3]] as const) {
    const clubs = await newGame(page, query);
    const club = clubs[index]!;
    await pickClub(page, clubs, club);
    const score = await playMatch(page);
    expect([score.home, score.away], `${club} plays matchday 1`).toContain(club);
    await backHome(page, club);
    expectAfterMatchday1(await readTable(page, clubs), club, score);
    await backHome(page, club);
  }
  expect(errors).toEqual([]);
});

test("the recorded result is kept: changing the formation and the XI, and visiting every screen, leave the table unchanged", async ({ page }) => {
  test.slow();
  const errors = watchErrors(page);
  const clubs = await newGame(page, "?seed=7");
  const club = clubs[2]!;
  await pickClub(page, clubs, club);
  const score = await playMatch(page);
  await backHome(page, club);
  const before = await readTable(page, clubs);
  expectAfterMatchday1(before, club, score);
  await backHome(page, club);

  await button(page, "Tactics").click();
  await page.getByRole("radiogroup", { name: "Formation", exact: true }).getByRole("radio", { name: "4-3-3", exact: true }).check();
  await button(page, "Back").click();
  await expect(heading(page)).toContainText(club);
  await button(page, "Starting XI").click();
  const slots = page.getByRole("list", { name: "Starting XI", exact: true }).getByRole("listitem");
  await expect(slots).toHaveCount(11);
  await slots.nth(10).getByRole("button").click();
  await expect(heading(page)).toHaveText("Choose FW");
  await page
    .getByRole("list", { name: "Players", exact: true })
    .getByRole("button")
    .filter({ hasNotText: /Starting$/ })
    .first()
    .click();
  await expect(heading(page)).toHaveText("Starting XI");
  const xi = (await slots.allInnerTexts()).map((t) => t.trim());
  await button(page, "Back").click();
  await expect(heading(page)).toContainText(club);
  await button(page, "Squad").click();
  await button(page, "Back").click();
  await expect(heading(page)).toContainText(club);

  expect(await readTable(page, clubs), "the table is unchanged").toEqual(before);
  await backHome(page, club);
  await button(page, "Tactics").click();
  await expect(page.getByRole("radio", { name: "4-3-3", exact: true }), "the formation is unchanged").toBeChecked();
  await button(page, "Back").click();
  await button(page, "Starting XI").click();
  await expect(slots).toHaveCount(11);
  expect((await slots.allInnerTexts()).map((t) => t.trim()), "the Starting XI is unchanged").toEqual(xi);
  await button(page, "Back").click();
  await expect(heading(page)).toContainText(club);
  expect(await readTable(page, clubs), "still unchanged").toEqual(before);
  expect(errors).toEqual([]);
});

test("the table comes from the seed: the same seed shows the identical table, and an invalid seed is the default", async ({ page }) => {
  test.slow();
  const errors = watchErrors(page);
  const read = async (query: string) => {
    const clubs = await newGame(page, query);
    const club = clubs[7]!;
    await pickClub(page, clubs, club);
    const score = await playMatch(page);
    await backHome(page, club);
    const rows = await readTable(page, clubs);
    expectAfterMatchday1(rows, club, score);
    return rows;
  };
  const first = await read("?seed=abc");
  const second = await read("?seed=abc");
  const unseeded = await read("");
  expect(second).toEqual(first);
  expect(unseeded).toEqual(first);
  expect(errors).toEqual([]);
});
