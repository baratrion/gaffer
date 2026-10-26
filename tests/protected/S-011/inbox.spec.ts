import { expect, test, type Locator, type Page } from "@playwright/test";

// S-011: Read my club's news in the Inbox. Black-box, phone viewport, roles, accessible names and visible text only.
// The scenarios pin the durable clause: the club home offers "Inbox"; its screen has the only h1 "Inbox" and a list
// named "Messages"; for each matchday played in the season there is exactly one message whose title line reads
// "Matchday N", newest first among the matchday messages, with that matchday's score line (as on its match screen)
// and a "League position" line equal to the Table's Pos right after that matchday; each matchday message is one list
// item whose lines are separate child elements in that order, with no button, link or nested list; and a matchday
// message never changes once played (Tactics, reload and "Continue"). They count only the messages with a
// "Matchday N" line, never all items, and do not check "No messages yet", where "Inbox" sits among the buttons, or
// the empty Inbox after "Play again": those are rules of this version only.

test.use({ viewport: { width: 390, height: 844 } });

const MATCHDAYS = 14;
const ORDINALS = ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th"];
const SCORE_SOURCE = "^(.+) (\\d)–(\\d) (.+)$";
const SCORE_TEXT = new RegExp(SCORE_SOURCE);
const TITLE_TEXT = /^Matchday (\d+)$/;
const POSITION_TEXT = /^League position (1st|2nd|3rd|4th|5th|6th|7th|8th)$/;
const FINAL_TEXT = /^Final position (1st|2nd|3rd|4th|5th|6th|7th|8th)$/;
const WHOLE = /^\d+$/;

interface Played {
  readonly title: string;
  readonly score: string;
}
interface Report {
  readonly title: string;
  readonly score: string;
  readonly position: string;
}

const norm = (text: string) => text.replace(/\s+/g, " ").trim();
const heading = (page: Page) => page.getByRole("heading", { level: 1 });
const button = (scope: Page | Locator, name: string) => scope.getByRole("button", { name, exact: true });
const clubsList = (page: Page) => page.getByRole("list", { name: /clubs/i });
const messagesList = (page: Page) => page.getByRole("list", { name: "Messages", exact: true });
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

const expectClubHome = async (page: Page, club: string) => {
  await expect(heading(page)).toHaveCount(1);
  await expect(heading(page)).toContainText(club);
  await expect(heading(page)).toBeFocused();
};

// Opens the game, taps "New game" and picks the club at `index` of the "Clubs" list; returns its name.
const startGame = async (page: Page, query: string, index: number): Promise<string> => {
  await page.goto(`./${query}`);
  await button(page, "New game").click();
  const items = clubsList(page).getByRole("listitem");
  await expect(items).toHaveCount(8);
  const club = ((await items.nth(index).innerText()).trim().split("\n")[0] ?? "").trim();
  await items.nth(index).getByRole("button").click();
  await expectClubHome(page, club);
  return club;
};

const backHome = async (page: Page, club: string) => {
  const back = button(page, "Back");
  expect(await height(back), '"Back" is at least 44px tall').toBeGreaterThanOrEqual(44);
  await back.click();
  await expectClubHome(page, club);
};

// Taps "Play match" and reads the h1 and the score line of the Matchday `matchday` screen; returns to the club home.
const playMatch = async (page: Page, club: string, matchday: number): Promise<Played> => {
  await button(page, "Play match").click();
  await expect(heading(page)).toHaveText(`Matchday ${matchday}`);
  const scores = await linesMatching(page, SCORE_SOURCE);
  expect(scores, `exactly one score line on the Matchday ${matchday} screen`).toHaveLength(1);
  const score = SCORE_TEXT.exec(scores[0]!)!;
  expect([score[1], score[4]], `${club} plays on matchday ${matchday}`).toContain(club);
  const title = norm(await heading(page).innerText());
  await backHome(page, club);
  return { title, score: scores[0]! };
};

// Opens "Table" and returns the club's Pos, checking that every row has played `played`; returns to the club home.
const tablePos = async (page: Page, club: string, played: number): Promise<number> => {
  await button(page, "Table").click();
  await expect(heading(page)).toHaveText("League table");
  const table = page.getByRole("table", { name: "League table", exact: true });
  const header = (await table.getByRole("columnheader").allInnerTexts()).map(norm);
  const rows = table.getByRole("row").filter({ has: page.getByRole("rowheader") });
  await expect(rows).toHaveCount(8);
  const playedCell = header.indexOf("P") - 1; // the Club column is the row header, not a cell
  let pos = 0;
  for (let i = 0; i < 8; i += 1) {
    const row = rows.nth(i);
    const cells = (await row.getByRole("cell").allInnerTexts()).map(norm);
    expect(cells[0], "Pos is a whole number").toMatch(WHOLE);
    expect(cells[playedCell], `every club has played ${played}`).toBe(String(played));
    if (norm(await row.getByRole("rowheader").innerText()) === club) pos = Number(cells[0]);
  }
  expect(pos, `${club} has a row in the table`).toBeGreaterThan(0);
  await backHome(page, club);
  return pos;
};

// The visible text of each child element of a list item, in order (one entry per line of the message).
const childLines = (item: Locator): Promise<string[]> =>
  item.evaluate((li) => [...li.children].map((child) => ((child as HTMLElement).innerText ?? "").replace(/\s+/g, " ").trim()));

// Taps "Inbox" on the club home and reads every matchday message of the list named "Messages", in list order.
const readInbox = async (page: Page, club: string): Promise<Report[]> => {
  await expectClubHome(page, club);
  const inbox = button(page, "Inbox");
  await expect(inbox, 'the club home offers "Inbox"').toBeVisible();
  expect(await height(inbox), '"Inbox" is at least 44px tall').toBeGreaterThanOrEqual(44);
  await inbox.click();

  await expect(heading(page)).toHaveCount(1);
  await expect(heading(page)).toHaveText("Inbox");
  await expect(heading(page)).toBeFocused();
  await expect(messagesList(page), 'one list named "Messages"').toHaveCount(1);
  const items = messagesList(page).getByRole("listitem");
  const reports: Report[] = [];
  for (let i = 0; i < (await items.count()); i += 1) {
    const item = items.nth(i);
    const lines = await childLines(item);
    if (!lines.some((line) => TITLE_TEXT.test(line))) continue;
    expect(lines[0], 'a matchday message starts with its "Matchday N" line').toMatch(TITLE_TEXT);
    expect(lines.filter((line) => TITLE_TEXT.test(line)), 'one "Matchday N" line per message').toHaveLength(1);
    const score = lines.findIndex((line) => SCORE_TEXT.test(line));
    const position = lines.findIndex((line) => POSITION_TEXT.test(line));
    expect(score, `${lines[0]} has a score line, after its title`).toBeGreaterThan(0);
    expect(position, `${lines[0]} has a "League position" line, after its score line`).toBeGreaterThan(score);
    await expect(item.getByRole("button"), "a message holds no button").toHaveCount(0);
    await expect(item.getByRole("link"), "a message holds no link").toHaveCount(0);
    await expect(item.getByRole("list"), "a message holds no nested list").toHaveCount(0);
    reports.push({ title: lines[0]!, score: lines[score]!, position: lines[position]! });
  }
  expect(await overflow(page), "no horizontal scroll at 390px").toBeLessThanOrEqual(0);
  await backHome(page, club);
  return reports;
};

// US-1 "Before any match the Inbox has no report" and "Back returns to the club home" (durable clause, D7).
test("the club home offers Inbox: its only h1 is Inbox, its Messages list holds no matchday report before a match, Back returns home", async ({
  page,
}) => {
  const errors = watchErrors(page);
  const club = await startGame(page, "?seed=31", 0);
  expect(await readInbox(page, club), "no matchday message before the first match").toEqual([]);
  expect(await overflow(page)).toBeLessThanOrEqual(0);
  expect(errors).toEqual([]);
});

// US-1 "One report per matchday, newest first" and US-2 "Each report shows where the club stood right after its matchday".
test("after 3 matches the Inbox holds Matchday 3, 2, 1 with each match screen's score line and the Pos the Table showed then", async ({
  page,
}) => {
  test.setTimeout(60_000);
  const errors = watchErrors(page);
  const club = await startGame(page, "?seed=31", 3);
  const expected: Report[] = [];
  for (let matchday = 1; matchday <= 3; matchday += 1) {
    const played = await playMatch(page, club, matchday);
    const pos = await tablePos(page, club, matchday);
    expected.unshift({ ...played, position: `League position ${ORDINALS[pos - 1]}` });
  }
  const reports = await readInbox(page, club);
  expect(reports.map((report) => report.title), "newest first").toEqual(["Matchday 3", "Matchday 2", "Matchday 1"]);
  expect(reports, "each message repeats its match screen and the Pos right after that matchday").toEqual(expected);
  expect(errors).toEqual([]);
});

// US-1 and US-2 over a whole season: 14 reports, newest first, the newest at the End of season's final position.
test("after the whole season the Inbox holds Matchday 14 down to 1, the newest at the End of season's final position", async ({ page }) => {
  test.setTimeout(90_000);
  const errors = watchErrors(page);
  const club = await startGame(page, "?seed=31", 0);
  const played: Played[] = [];
  for (let matchday = 1; matchday <= MATCHDAYS; matchday += 1) played.unshift(await playMatch(page, club, matchday));

  await button(page, "End of season").click();
  await expect(heading(page)).toHaveText("End of season");
  const finals = await linesMatching(page, "^Final position .+$");
  expect(finals, 'exactly one "Final position" line').toHaveLength(1);
  const final = FINAL_TEXT.exec(finals[0]!)![1]!;
  await backHome(page, club);

  const reports = await readInbox(page, club);
  expect(reports.map(({ title, score }) => ({ title, score })), "14 reports, Matchday 14 first, each as its match screen").toEqual(played);
  expect(reports[0]!.position, "the newest report's position is the final position").toBe(`League position ${final}`);
  expect(errors).toEqual([]);
});

// US-1 "Nothing played is rewritten": a Tactics change and a reload with "Continue" leave every message as it was.
test("a played matchday's message never changes: not after a Tactics change, not after a reload and Continue", async ({ page }) => {
  test.setTimeout(60_000);
  const errors = watchErrors(page);
  const club = await startGame(page, "?seed=31", 5);
  await playMatch(page, club, 1);
  await playMatch(page, club, 2);
  const before = await readInbox(page, club);
  expect(before.map((report) => report.title)).toEqual(["Matchday 2", "Matchday 1"]);

  await button(page, "Tactics").click();
  await expect(heading(page)).toHaveText("Tactics");
  await page.getByRole("radio", { name: "4-3-3", exact: true }).check();
  await expect(page.getByRole("radio", { name: "4-3-3", exact: true })).toBeChecked();
  await backHome(page, club);
  expect(await readInbox(page, club), "the same messages after a Tactics change").toEqual(before);

  await page.reload();
  await expect(heading(page)).toHaveCount(1);
  await button(page, "Continue").click();
  await expect(heading(page)).toHaveCount(1);
  await expect(heading(page)).toBeFocused();
  if (!(await heading(page).innerText()).includes(club)) await backHome(page, club);
  expect(await readInbox(page, club), "the same messages after a reload and Continue").toEqual(before);
  expect(errors).toEqual([]);
});
