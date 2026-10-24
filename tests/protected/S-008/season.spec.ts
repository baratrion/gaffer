import { expect, test, type Locator, type Page } from "@playwright/test";

// S-008: Play the season, one matchday at a time. Black-box, phone viewport, roles, accessible names and visible
// text only. The scenarios check rules that hold for any seed (the next matchday on each tap, the fixed double
// round-robin, the table as the sum of the recorded results, one result per row per matchday, scorers on the
// current eleven, the seed), not a generated result. Not checked here, as rules of this version only: what a
// "Play match" after matchday 14 shows, and the goals-scored and club-name tie-breaks. Only the first 8 table
// columns are read (later versions may add columns after "Pts").

test.use({ viewport: { width: 390, height: 844 } });

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
  readonly matchday: number;
  readonly score: Score;
  readonly goals: readonly Goal[];
}
interface Game {
  readonly club: string;
  readonly clubs: readonly string[];
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
type Tally = Pick<Row, "p" | "w" | "d" | "l" | "gd" | "pts">;

const norm = (text: string) => text.replace(/\s+/g, " ").trim();
const heading = (page: Page) => page.getByRole("heading", { level: 1 });
const button = (scope: Page | Locator, name: string) => scope.getByRole("button", { name, exact: true });
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
  await button(page, "Back").click();
  await expect(heading(page)).toHaveCount(1);
  await expect(heading(page)).toContainText(club);
  await expect(heading(page)).toBeFocused();
};

// The names of the 10 outfield players on the Starting XI screen (every slot but GK); returns to the club home.
const readOutfieldXI = async (page: Page, club: string): Promise<string[]> => {
  await button(page, "Starting XI").click();
  const slots = page.getByRole("list", { name: "Starting XI", exact: true }).getByRole("listitem");
  await expect(slots).toHaveCount(11);
  const names = (await slots.allInnerTexts()).flatMap((text) => {
    const slot = SLOT_TEXT.exec(norm(text));
    expect(slot, `slot "${norm(text)}" reads code, name, overall`).not.toBeNull();
    return slot![1] === "GK" ? [] : [slot![2]!];
  });
  expect(names, "10 outfield slots").toHaveLength(10);
  await backHome(page, club);
  return names;
};

// Taps "Play match" on the club home and reads the match screen: its matchday, its one score line and its Goals list.
const playMatch = async (page: Page, game: Game, matchday: number): Promise<Match> => {
  const { club, clubs } = game;
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
  expect(lines, `matchday ${matchday}: exactly one score line`).toHaveLength(1);
  const m = SCORE_TEXT.exec(lines[0]!)!;
  const score = { home: m[1]!, homeGoals: Number(m[2]), awayGoals: Number(m[3]), away: m[4]! };
  expect([score.home, score.away], `matchday ${matchday}: ${club} plays`).toContain(club);
  expect(score.home, `matchday ${matchday}: two different clubs`).not.toBe(score.away);
  expect(clubs, `matchday ${matchday}: ${score.home} is a club of the league`).toContain(score.home);
  expect(clubs, `matchday ${matchday}: ${score.away} is a club of the league`).toContain(score.away);

  const goals = (await page.getByRole("list", { name: "Goals", exact: true }).getByRole("listitem").allInnerTexts()).map((text) => {
    const goal = GOAL_TEXT.exec(norm(text));
    expect(goal, `matchday ${matchday}: goal "${norm(text)}" reads minute' scorer (club)`).not.toBeNull();
    return { minute: Number(goal![1]), scorer: goal![2]!, club: goal![3]! };
  });
  expect(goals, `matchday ${matchday}: one item per goal`).toHaveLength(score.homeGoals + score.awayGoals);
  expect(goals.filter((g) => g.club === score.home)).toHaveLength(score.homeGoals);
  expect(goals.filter((g) => g.club === score.away)).toHaveLength(score.awayGoals);
  for (let i = 0; i < goals.length; i += 1) {
    expect(goals[i]!.minute, "minutes are 1 to 90").toBeGreaterThanOrEqual(1);
    expect(goals[i]!.minute, "minutes are 1 to 90").toBeLessThanOrEqual(90);
    if (i > 0) expect(goals[i]!.minute, "minutes never decrease").toBeGreaterThanOrEqual(goals[i - 1]!.minute);
  }
  return { matchday, score, goals };
};

const number = (text: string, column: string, pattern: RegExp = WHOLE): number => {
  expect(text, `${column} reads a whole number, got "${text}"`).toMatch(pattern);
  return Number(text);
};

// Taps "Table" on the club home, reads the League table with its row rules and order, and returns to the club home.
const readTable = async (page: Page, club: string, clubs: readonly string[]): Promise<Row[]> => {
  await button(page, "Table").click();
  await expect(heading(page)).toHaveText("League table");
  const table = page.getByRole("table", { name: "League table", exact: true });
  await expect(table).toHaveCount(1);
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
    if (below.pts === above.pts) expect(below.gd, `GD never increases at equal Pts (${above.club}, ${below.club})`).toBeLessThanOrEqual(above.gd);
  }
  expect(await overflow(page), "no horizontal scroll at 390px").toBeLessThanOrEqual(0);
  await backHome(page, club);
  return rows;
};

const rowOf = (rows: readonly Row[], club: string): Row => {
  const row = rows.find((r) => r.club === club);
  expect(row, `${club} has a row`).toBeDefined();
  return row!;
};

const recordOf = ({ p, w, d, l, gd, pts }: Row): Tally => ({ p, w, d, l, gd, pts });

// The record a club earns from a list of score lines.
const sumOf = (club: string, matches: readonly Match[]): Tally =>
  matches.reduce<Tally>(
    (acc, { score }) => {
      const mine = club === score.home ? score.homeGoals : score.awayGoals;
      const theirs = club === score.home ? score.awayGoals : score.homeGoals;
      const [w, d, l] = [mine > theirs ? 1 : 0, mine === theirs ? 1 : 0, mine < theirs ? 1 : 0];
      return { p: acc.p + 1, w: acc.w + w, d: acc.d + d, l: acc.l + l, gd: acc.gd + mine - theirs, pts: acc.pts + 3 * w + d };
    },
    { p: 0, w: 0, d: 0, l: 0, gd: 0, pts: 0 },
  );

// After n matchdays: every club has played n, the totals balance, and my row is the sum of my n score lines.
const expectAfter = (rows: readonly Row[], club: string, matches: readonly Match[]) => {
  const n = matches.length;
  for (const r of rows) expect(r.p, `${r.club} has played ${n}`).toBe(n);
  const total = (pick: (r: Row) => number) => rows.reduce((sum, r) => sum + pick(r), 0);
  expect(total((r) => r.w), "total W equals total L").toBe(total((r) => r.l));
  expect(total((r) => r.d) % 2, "total D is even").toBe(0);
  expect(total((r) => r.gd), "the GDs add up to 0").toBe(0);
  expect(recordOf(rowOf(rows, club)), `${club}'s row is the sum of its ${n} score lines`).toEqual(sumOf(club, matches));
};

// From one matchday to the next every row gains exactly one result, and nothing earlier moves.
const expectOneMoreResult = (before: readonly Row[], after: readonly Row[]) => {
  for (const b of before) {
    const a = rowOf(after, b.club);
    expect(a.p, `${b.club}: P is one more`).toBe(b.p + 1);
    const gained = [a.w - b.w, a.d - b.d, a.l - b.l];
    expect([...gained].sort(), `${b.club}: exactly one of W, D, L is one more`).toEqual([0, 0, 1]);
    const [won, drew] = gained as [number, number, number];
    expect(a.pts - b.pts, `${b.club}: Pts gain matches the result`).toBe(won ? 3 : drew ? 1 : 0);
    if (won) expect(a.gd, `${b.club}: GD goes up after a win`).toBeGreaterThan(b.gd);
    else if (drew) expect(a.gd, `${b.club}: GD stays after a draw`).toBe(b.gd);
    else expect(a.gd, `${b.club}: GD goes down after a loss`).toBeLessThan(b.gd);
  }
};

const opponentOf = (club: string, { score }: Match) => (score.home === club ? score.away : score.home);

const expectMyScorersIn = (club: string, match: Match, eleven: readonly string[]) => {
  for (const goal of match.goals.filter((g) => g.club === club)) {
    expect(eleven, `matchday ${match.matchday}: ${goal.scorer} scored for ${club} from the outfield of the current XI`).toContain(goal.scorer);
  }
};

test("the second Play match plays matchday 2 against a new opponent, and the table counts both matches", async ({ page }) => {
  test.slow();
  const errors = watchErrors(page);
  for (const [query, index] of [["?seed=31", 0], ["?seed=7", 2]] as const) {
    const clubs = await newGame(page, query);
    const club = clubs[index]!;
    await pickClub(page, clubs, club);
    const eleven = await readOutfieldXI(page, club);

    const first = await playMatch(page, { club, clubs }, 1);
    await backHome(page, club);
    const afterOne = await readTable(page, club, clubs);
    expectAfter(afterOne, club, [first]);

    const second = await playMatch(page, { club, clubs }, 2);
    expect(opponentOf(club, second), "matchday 2 is against a different club than matchday 1").not.toBe(opponentOf(club, first));
    expectMyScorersIn(club, second, eleven);
    await backHome(page, club);
    for (const name of ["Squad", "Tactics", "Starting XI", "Play match", "Table"]) await expect(button(page, name)).toBeVisible();

    const afterTwo = await readTable(page, club, clubs);
    expectAfter(afterTwo, club, [first, second]);
    expectOneMoreResult(afterOne, afterTwo);
  }
  expect(errors).toEqual([]);
});

test("a team change counts from the next match on: matchday 2 is played by the new eleven and matchday 1 stays as played", async ({ page }) => {
  test.slow();
  const errors = watchErrors(page);
  const clubs = await newGame(page, "?seed=7");
  const club = clubs[2]!;
  await pickClub(page, clubs, club);
  const first = await playMatch(page, { club, clubs }, 1);
  await backHome(page, club);
  const afterOne = await readTable(page, club, clubs);
  expectAfter(afterOne, club, [first]);

  await button(page, "Tactics").click();
  await page.getByRole("radiogroup", { name: "Formation", exact: true }).getByRole("radio", { name: "4-3-3", exact: true }).check();
  await backHome(page, club);
  await button(page, "Starting XI").click();
  const slots = page.getByRole("list", { name: "Starting XI", exact: true }).getByRole("listitem");
  await expect(slots).toHaveCount(11);
  await slots.nth(10).getByRole("button").click();
  await expect(heading(page)).toHaveText("Choose FW");
  await page.getByRole("list", { name: "Players", exact: true }).getByRole("button").filter({ hasNotText: /Starting$/ }).first().click();
  await expect(heading(page)).toHaveText("Starting XI");
  await backHome(page, club);
  const eleven = await readOutfieldXI(page, club);

  const second = await playMatch(page, { club, clubs }, 2);
  expectMyScorersIn(club, second, eleven);
  await backHome(page, club);
  const afterTwo = await readTable(page, club, clubs);
  expectAfter(afterTwo, club, [first, second]);
  expectOneMoreResult(afterOne, afterTwo);

  await button(page, "Tactics").click();
  await expect(page.getByRole("radio", { name: "4-3-3", exact: true }), "the formation is unchanged by the match").toBeChecked();
  await backHome(page, club);
  expect(await readOutfieldXI(page, club), "the Starting XI is unchanged by the match").toEqual(eleven);
  expect(errors).toEqual([]);
});

test("a whole season: 14 matchdays in order, a double round-robin, and a table of 14 played that sums my results", async ({ page }) => {
  test.slow();
  const errors = watchErrors(page);
  const clubs = await newGame(page, "?seed=31");
  const club = clubs[0]!;
  await pickClub(page, clubs, club);
  const before = await readTable(page, club, clubs);
  for (const r of before) expect([r.p, r.w, r.d, r.l, r.gd, r.pts], `${r.club} starts on zero`).toEqual([0, 0, 0, 0, 0, 0]);

  const matches: Match[] = [];
  for (let matchday = 1; matchday <= 14; matchday += 1) {
    matches.push(await playMatch(page, { club, clubs }, matchday));
    await backHome(page, club);
  }

  const firstHalf = matches.slice(0, 7).map((m) => opponentOf(club, m));
  expect([...firstHalf].sort(codePointOrder), "matchdays 1 to 7: each other club exactly once").toEqual(
    clubs.filter((c) => c !== club).sort(codePointOrder),
  );
  for (let n = 0; n < 7; n += 1) {
    const [early, late] = [matches[n]!.score, matches[n + 7]!.score];
    expect([late.home, late.away], `matchday ${n + 8} is matchday ${n + 1} in the opposite order`).toEqual([early.away, early.home]);
  }

  const rows = await readTable(page, club, clubs);
  expectAfter(rows, club, matches);
  await button(page, "Table").click();
  const table = page.getByRole("table", { name: "League table", exact: true });
  const tableOverflow = await table.evaluate((el) => el.scrollWidth - el.clientWidth);
  expect(tableOverflow, "the 14-matchday table fits at 390px").toBeLessThanOrEqual(0);
  expect(await overflow(page), "no horizontal scroll at 390px").toBeLessThanOrEqual(0);
  await backHome(page, club);
  expect(errors).toEqual([]);
});

test("the season comes from the seed: the same seed plays the same matchdays, and an invalid seed is the default", async ({ page }) => {
  test.slow();
  const errors = watchErrors(page);
  const play = async (query: string) => {
    const clubs = await newGame(page, query);
    const club = clubs[5]!;
    await pickClub(page, clubs, club);
    const matches: Match[] = [];
    for (let matchday = 1; matchday <= 3; matchday += 1) {
      matches.push(await playMatch(page, { club, clubs }, matchday));
      await backHome(page, club);
    }
    const rows = await readTable(page, club, clubs);
    expectAfter(rows, club, matches);
    return { matches, rows };
  };
  const first = await play("?seed=abc");
  const second = await play("?seed=abc");
  const unseeded = await play("");
  expect(second, "the same seed gives the same three matchdays and table").toEqual(first);
  expect(unseeded, "an invalid seed is the default seed").toEqual(first);
  expect(errors).toEqual([]);
});
