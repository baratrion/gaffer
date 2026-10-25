import { expect, test, type Locator, type Page } from "@playwright/test";

// S-008: Play the season, matchday by matchday. Black-box, phone viewport, roles, accessible names and visible
// text only. The scenarios check rules that hold for any seed (the next matchday in order, opponents from the
// double round-robin, formats, who may score, the table agreeing with the score lines seen), not generated
// results. Later versions may add columns after "Pts", so only the first 8 columns are read. What the club home
// shows after matchday 14 is a rule of this version and is not checked.

test.use({ viewport: { width: 390, height: 844 } });

const MATCHDAYS = 14;
const COLUMNS = ["Pos", "Club", "P", "W", "D", "L", "GD", "Pts"];
const SCORE_SOURCE = "^(.+) (\\d)–(\\d) (.+)$";
const SCORE_TEXT = new RegExp(SCORE_SOURCE);
const GOAL_TEXT = /^(\d{1,2})' (\S.*\S|\S) \(([^()]+)\)$/;
const SLOT_TEXT = /^(GK|DF|MF|FW) (\S.*\S|\S) (\d{1,2})$/;
const WHOLE = /^\d+$/;
const GOAL_DIFFERENCE = /^(\+[1-9]\d*|0|-[1-9]\d*)$/;

interface Score {
  readonly home: string;
  readonly homeGoals: number;
  readonly awayGoals: number;
  readonly away: string;
}
interface Goal {
  readonly minute: number;
  readonly scorer: string;
  readonly club: string;
}
interface Match {
  readonly score: Score;
  readonly goals: readonly Goal[];
  readonly goalTexts: readonly string[];
}
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

const norm = (text: string) => text.replace(/\s+/g, " ").trim();
const heading = (page: Page) => page.getByRole("heading", { level: 1 });
const button = (scope: Page | Locator, name: string) => scope.getByRole("button", { name, exact: true });
const goalsList = (page: Page) => page.getByRole("list", { name: "Goals", exact: true });
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
  const index = clubs.indexOf(club);
  expect(index, `${club} is in the Clubs list`).toBeGreaterThanOrEqual(0);
  await page.getByRole("list", { name: /clubs/i }).getByRole("listitem").nth(index).getByRole("button").click();
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

// The names of the 10 outfield players on the Starting XI screen (never the GK slot); returns to the club home.
const readOutfield = async (page: Page, club: string): Promise<string[]> => {
  await button(page, "Starting XI").click();
  await expect(heading(page)).toHaveText("Starting XI");
  const items = page.getByRole("list", { name: "Starting XI", exact: true }).getByRole("listitem");
  await expect(items).toHaveCount(11);
  const slots = (await items.allInnerTexts()).map((text) => {
    const match = SLOT_TEXT.exec(norm(text));
    expect(match, `slot reads "CODE Name OVERALL", got "${norm(text)}"`).not.toBeNull();
    return { code: match![1]!, name: match![2]! };
  });
  await backHome(page, club);
  return slots.filter((s) => s.code !== "GK").map((s) => s.name);
};

// Taps "Play match" on the club home and reads the match screen of matchday `matchday`, checking the formats.
interface Play {
  readonly clubs: readonly string[];
  readonly club: string;
  readonly matchday: number;
}
const playMatch = async (page: Page, { clubs, club, matchday }: Play): Promise<Match> => {
  const play = button(page, "Play match");
  expect(await height(play), '"Play match" is at least 44px tall').toBeGreaterThanOrEqual(44);
  await play.click();
  await expect(heading(page)).toHaveCount(1);
  await expect(heading(page)).toHaveText(`Matchday ${matchday}`);
  await expect(heading(page)).toBeFocused();

  const lines = await page.evaluate((source) => {
    const pattern = new RegExp(source);
    const text = (el: Element) => (el.textContent ?? "").replace(/\s+/g, " ").trim();
    const reads = (el: Element) => pattern.test(text(el));
    return [...document.body.querySelectorAll("*")].filter((el) => reads(el) && ![...el.children].some(reads)).map(text);
  }, SCORE_SOURCE);
  expect(lines, `exactly one score line on the Matchday ${matchday} screen`).toHaveLength(1);
  const found = SCORE_TEXT.exec(lines[0]!)!;
  const score = { home: found[1]!, homeGoals: Number(found[2]), awayGoals: Number(found[3]), away: found[4]! };
  expect([score.home, score.away], `${club} plays on matchday ${matchday}`).toContain(club);
  expect(score.home, "two different clubs").not.toBe(score.away);
  for (const name of [score.home, score.away]) expect(clubs, `${name} is in the Clubs list`).toContain(name);

  const list = goalsList(page);
  await expect(list).toHaveCount(1);
  const goalTexts = (await list.getByRole("listitem").allInnerTexts()).map(norm);
  const goals = goalTexts.map((text) => {
    const match = GOAL_TEXT.exec(text);
    expect(match, `goal reads "MIN' Scorer (Club)", got "${text}"`).not.toBeNull();
    return { minute: Number(match![1]), scorer: match![2]!, club: match![3]! };
  });
  expect(goals.length, "one item per goal").toBe(score.homeGoals + score.awayGoals);
  goals.forEach((goal, i) => {
    expect(goal.minute, "minute 1 to 90").toBeGreaterThanOrEqual(1);
    expect(goal.minute, "minute 1 to 90").toBeLessThanOrEqual(90);
    if (i > 0) expect(goal.minute, "minutes never decrease").toBeGreaterThanOrEqual(goals[i - 1]!.minute);
  });
  expect(goals.filter((g) => g.club === score.home).length, `${score.home}'s goals`).toBe(score.homeGoals);
  expect(goals.filter((g) => g.club === score.away).length, `${score.away}'s goals`).toBe(score.awayGoals);
  expect(await overflow(page), "no horizontal scroll at 390px").toBeLessThanOrEqual(0);
  return { score, goals, goalTexts };
};

const opponentOf = ({ score }: Match, club: string) => (score.home === club ? score.away : score.home);

const expectScorers = (match: Match, club: string, outfield: readonly string[]) => {
  for (const goal of match.goals.filter((g) => g.club === club)) {
    expect(outfield, `${goal.scorer} is an outfield player of ${club}'s Starting XI at the time of the match`).toContain(goal.scorer);
  }
};

const number = (text: string, column: string, pattern: RegExp = WHOLE): number => {
  expect(text, `${column} reads a whole number, got "${text}"`).toMatch(pattern);
  return Number(text);
};

// Taps "Table" on the club home and reads the league table, checking its structure and row rules; returns home.
const readTable = async (page: Page, clubs: readonly string[], club: string): Promise<Row[]> => {
  await button(page, "Table").click();
  await expect(heading(page)).toHaveText("League table");
  await expect(heading(page)).toBeFocused();
  const allRows = leagueTable(page).getByRole("row");
  const headerRows = allRows.filter({ has: page.getByRole("columnheader") });
  await expect(headerRows, "exactly one header row").toHaveCount(1);
  const headers = (await headerRows.getByRole("columnheader").allInnerTexts()).map((t) => t.trim());
  expect(headers.slice(0, 8), "the first 8 column headers").toEqual(COLUMNS);
  const bodyRows = allRows.filter({ has: page.getByRole("rowheader") });
  await expect(bodyRows, "one body row per club").toHaveCount(8);
  const rows: Row[] = [];
  for (let i = 0; i < 8; i += 1) {
    const row = bodyRows.nth(i);
    const name = (await row.getByRole("rowheader").innerText()).trim();
    const cells = (await row.getByRole("cell").allInnerTexts()).map((t) => t.trim());
    expect(cells.length, `${name}: Pos and P, W, D, L, GD, Pts are cells`).toBeGreaterThanOrEqual(7);
    const [pos, p, w, d, l, gd, pts] = cells as [string, string, string, string, string, string, string];
    rows.push({
      pos: number(pos, "Pos"),
      club: name,
      p: number(p, "P"),
      w: number(w, "W"),
      d: number(d, "D"),
      l: number(l, "L"),
      gd: number(gd, "GD", GOAL_DIFFERENCE),
      pts: number(pts, "Pts"),
    });
  }
  expect(rows.map((r) => r.pos), "Pos is 1 to 8 down the table").toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  expect(rows.map((r) => r.club).sort(codePointOrder), "each club exactly once").toEqual([...clubs].sort(codePointOrder));
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
  await backHome(page, club);
  return rows;
};

// After the player's N-th match: every club has played N, the totals balance, and my row is the sum of my score lines.
const expectAfter = (rows: readonly Row[], club: string, matches: readonly Match[]) => {
  const n = matches.length;
  for (const r of rows) expect(r.p, `${r.club} has played ${n}`).toBe(n);
  const total = (pick: (r: Row) => number) => rows.reduce((sum, r) => sum + pick(r), 0);
  expect(total((r) => r.w), "total W equals total L").toBe(total((r) => r.l));
  expect(total((r) => r.d) % 2, "total D is even").toBe(0);
  expect(total((r) => r.gd), "the GDs add up to 0").toBe(0);

  const expected = { p: n, w: 0, d: 0, l: 0, gd: 0, pts: 0 };
  for (const { score } of matches) {
    const mine = club === score.home ? score.homeGoals : score.awayGoals;
    const theirs = club === score.home ? score.awayGoals : score.homeGoals;
    if (mine > theirs) expected.w += 1;
    else if (mine === theirs) expected.d += 1;
    else expected.l += 1;
    expected.gd += mine - theirs;
  }
  expected.pts = 3 * expected.w + expected.d;
  const row = rows.find((r) => r.club === club);
  expect(row, `${club} has a row`).toBeDefined();
  const { p, w, d, l, gd, pts } = row!;
  expect({ p, w, d, l, gd, pts }, `${club}'s row is the sum of its ${n} score lines`).toEqual(expected);
};

// US-1 "The second Play match plays matchday 2 against a new opponent" and "After three matches the table agrees" (at N = 2).
test("the second Play match plays matchday 2 against a new opponent, and the table counts both matches", async ({ page }) => {
  test.slow();
  const errors = watchErrors(page);
  const clubs = await newGame(page, "?seed=31");
  const club = clubs[0]!;
  await pickClub(page, clubs, club);
  const outfield = await readOutfield(page, club);

  const first = await playMatch(page, { clubs, club, matchday: 1 });
  await backHome(page, club);
  const second = await playMatch(page, { clubs, club, matchday: 2 });
  expect(opponentOf(second, club), "matchday 2 is against a different club than matchday 1").not.toBe(opponentOf(first, club));
  expectScorers(second, club, outfield);
  await backHome(page, club);

  expectAfter(await readTable(page, clubs, club), club, [first, second]);
  for (const name of ["Squad", "Tactics", "Starting XI", "Play match", "Table"]) await expect(button(page, name)).toBeVisible();
  expect(errors).toEqual([]);
});

// US-1 "Picks made between matches count from the next match on", on another seed and club (any pick will do).
test("picks made between matches change nothing already played and count from the next match on", async ({ page }) => {
  test.slow();
  const errors = watchErrors(page);
  const clubs = await newGame(page, "?seed=7");
  const club = clubs[2]!;
  await pickClub(page, clubs, club);
  const first = await playMatch(page, { clubs, club, matchday: 1 });
  await backHome(page, club);
  const before = await readTable(page, clubs, club);
  expectAfter(before, club, [first]);

  await button(page, "Tactics").click();
  await page.getByRole("radiogroup", { name: "Formation", exact: true }).getByRole("radio", { name: "4-3-3", exact: true }).check();
  await backHome(page, club);
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
  await backHome(page, club);
  expect(await readTable(page, clubs, club), "the table after matchday 1 is unchanged by the picks").toEqual(before);

  const outfield = await readOutfield(page, club);
  const second = await playMatch(page, { clubs, club, matchday: 2 });
  expectScorers(second, club, outfield);
  await backHome(page, club);
  expectAfter(await readTable(page, clubs, club), club, [first, second]);
  expect(await readOutfield(page, club), "the picked XI is unchanged by playing").toEqual(outfield);
  expect(errors).toEqual([]);
});

// US-2 "Over the season Sam meets every rival twice" and "The final table agrees with the season Sam played".
test("a whole season: Matchday 1 to 14 in order, every other club met twice, named first once and second once", async ({ page }) => {
  test.setTimeout(90_000);
  const errors = watchErrors(page);
  const clubs = await newGame(page, "?seed=31");
  const club = clubs[3]!;
  await pickClub(page, clubs, club);
  const outfield = await readOutfield(page, club);
  const others = clubs.filter((c) => c !== club).sort(codePointOrder);

  const matches: Match[] = [];
  for (let matchday = 1; matchday <= MATCHDAYS; matchday += 1) {
    const match = await playMatch(page, { clubs, club, matchday });
    expectScorers(match, club, outfield);
    matches.push(match);
    await backHome(page, club);
  }

  const opponents = matches.map((m) => opponentOf(m, club));
  expect(opponents.slice(0, 7).sort(codePointOrder), "matchdays 1 to 7: each other club exactly once").toEqual(others);
  expect(opponents.slice(7).sort(codePointOrder), "matchdays 8 to 14: each other club exactly once").toEqual(others);
  const namedFirst = matches.filter((m) => m.score.home === club).map((m) => m.score.away).sort(codePointOrder);
  const namedSecond = matches.filter((m) => m.score.away === club).map((m) => m.score.home).sort(codePointOrder);
  expect(namedFirst, `${club} is named first against each other club exactly once`).toEqual(others);
  expect(namedSecond, `${club} is named second against each other club exactly once`).toEqual(others);

  expectAfter(await readTable(page, clubs, club), club, matches);
  expect(errors).toEqual([]);
});

// US-1 "The same seed plays the same season" (3 matches, the table after each).
test("the season comes from the seed: the same seed plays the same matches and tables, and an invalid seed is the default", async ({ page }) => {
  test.slow();
  const errors = watchErrors(page);
  const read = async (query: string) => {
    const clubs = await newGame(page, query);
    const club = clubs[7]!;
    await pickClub(page, clubs, club);
    const seen: { match: { score: Score; goals: readonly string[] }; table: Row[] }[] = [];
    const played: Match[] = [];
    for (let matchday = 1; matchday <= 3; matchday += 1) {
      const match = await playMatch(page, { clubs, club, matchday });
      played.push(match);
      await backHome(page, club);
      const table = await readTable(page, clubs, club);
      expectAfter(table, club, played);
      seen.push({ match: { score: match.score, goals: match.goalTexts }, table });
    }
    return seen;
  };
  const first = await read("?seed=abc");
  const second = await read("?seed=abc");
  const unseeded = await read("");
  expect(second, "the same seed plays the same 3 matches and tables").toEqual(first);
  expect(unseeded, "?seed=abc plays the same season as no seed").toEqual(first);
  expect(errors).toEqual([]);
});
