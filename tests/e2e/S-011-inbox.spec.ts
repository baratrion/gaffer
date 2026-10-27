// S-011 the Inbox (Pixel 7, 390px; ci:serve or BASE_URL): the sixth button after "Table", "No messages yet" outside the list, N messages for N = 0..14, the seed-31
// goldens (inbox-reference.ts, also recomputed in Node by inbox-inputs-pinned: Chromium must equal Node), per-season reset, ?seed=abc equal to no seed, nothing stored,
// K1 tap counts, computed styles of the message lines, click-everything (only Back acts) and 390px with 14 of the widest score lines (?seed=180). Seasons are 28+ taps: 90s.
import { devices, expect, test, type Browser, type Locator, type Page } from "@playwright/test";
import { CLUB_31, LONGEST_NAMES, messageLines, ORDINALS, REFERENCE_INBOX_20260, REFERENCE_INBOX_31 } from "../acceptance/S-011/inbox-reference";
const TITLE = /^Matchday (\d{1,2})$/;
const SCORE = /^(.+) (\d)–(\d) (.+)$/;
const POSITION = /^League position (1st|2nd|3rd|4th|5th|6th|7th|8th)$/;
const SIX = ["Squad", "Tactics", "Starting XI", "Play match", "Table", "Inbox"];
const LAST = ["Squad", "Tactics", "Starting XI", "End of season", "Table", "Inbox"];
const heading = (page: Page): Locator => page.getByRole("heading", { level: 1 });
const button = (page: Page, name: string): Locator => page.getByRole("button", { name, exact: true });
const messages = (page: Page): Locator => page.getByRole("list", { name: "Messages", exact: true });
const leagueTable = (page: Page): Locator => page.getByRole("table", { name: "League table", exact: true });
const overflow = (page: Page): Promise<number> => page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
const buttonTexts = async (page: Page): Promise<string[]> => (await page.getByRole("button").allInnerTexts()).map((text) => text.trim());
const clubActions = (page: Page): Promise<string[]> => page.evaluate(() => [...document.querySelectorAll(".club-actions > *")].map((node) => `${node.tagName}:${node.textContent?.trim()}`));
const tall = async (target: Locator, what: string): Promise<void> => expect((await target.boundingBox())?.height ?? 0, what).toBeGreaterThanOrEqual(44);
const watchErrors = (page: Page): string[] => {
  const errors: string[] = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(e.message));
  return errors;
};
const installTapCounter = (page: Page) =>
  page.evaluate(() => {
    const w = window as unknown as { __taps: number };
    w.__taps = 0;
    document.addEventListener("pointerdown", () => void w.__taps++, true);
  });
const tapsSoFar = (page: Page): Promise<number> => page.evaluate(() => (window as unknown as { __taps: number }).__taps);
/** Counts calls that write the saved game, in this page's context only (an init script, so it never touches a real player's storage). */
const countSaveWrites = (page: Page) =>
  page.addInitScript(() => {
    const w = window as unknown as { __saveWrites: number };
    const real = Storage.prototype.setItem;
    w.__saveWrites = 0;
    Storage.prototype.setItem = function (key: string, value: string) { if (key === "gaffer.save") w.__saveWrites++; return real.call(this, key, value); };
  });
const saveWrites = (page: Page): Promise<number> => page.evaluate(() => (window as unknown as { __saveWrites: number }).__saveWrites);
const savedText = (page: Page): Promise<string | null> => page.evaluate(() => localStorage.getItem("gaffer.save"));
/** Opens a fresh page, taps New game, picks club `clubIndex` of the "Clubs" list and returns its name. */
const openSeason = async (page: Page, query: string, clubIndex: number): Promise<string> => {
  await page.goto(`./${query}`);
  await button(page, "New game").click();
  const list = page.getByRole("list", { name: "Clubs" }).getByRole("button");
  const clubs = (await list.allInnerTexts()).map((text) => (text.split("\n")[0] ?? "").trim());
  expect(clubs).toHaveLength(8);
  await list.nth(clubIndex).click();
  await expect(heading(page)).toHaveText(clubs[clubIndex]!);
  return clubs[clubIndex]!;
};
interface Seen { readonly title: string; readonly score: string }
/** Plays the next matchday, reads the match screen's h1 and score line, and taps Back to the focused club home. */
const playOne = async (page: Page, club: string): Promise<Seen> => {
  await button(page, "Play match").click();
  await expect(heading(page)).toHaveText(TITLE);
  const title = (await heading(page).innerText()).trim();
  const score = (await page.locator(".score-line").innerText()).trim();
  await button(page, "Back").click();
  await expect(heading(page)).toHaveText(club);
  return { title, score };
};
/** Taps Table, returns the club's Pos as an ordinal, and taps Back. */
const tablePosition = async (page: Page, club: string): Promise<string> => {
  await button(page, "Table").click();
  const rows = (await leagueTable(page).getByRole("row").all()).slice(1);
  expect(rows).toHaveLength(8);
  const names = await Promise.all(rows.map((row) => row.getByRole("rowheader").innerText()));
  const position = await rows[names.findIndex((name) => name.trim() === club)]!.getByRole("cell").first().innerText();
  await button(page, "Back").click();
  await expect(heading(page)).toHaveText(club);
  return ORDINALS[Number(position.trim()) - 1]!;
};
interface Message { readonly lines: readonly string[]; readonly texts: readonly string[]; readonly controls: number }
/** The Inbox as Sam reads it: per list item, the visible text (innerText) and textContent of each child element, in order, and how many controls the item holds. */
const readInbox = async (page: Page): Promise<readonly Message[]> => {
  await expect(messages(page)).toHaveCount(1);
  return messages(page).getByRole("listitem").evaluateAll((items) =>
    items.map((item) => ({
      lines: [...item.children].map((child) => (child as HTMLElement).innerText),
      texts: [...item.children].map((child) => child.textContent ?? ""),
      controls: item.querySelectorAll("button, a, ul, ol, input, select, textarea, [role], [tabindex], [onclick]").length,
    })),
  );
};
/** Every message holds exactly three one-element lines in the three formats, readable as one piece of text each, and no control. */
const expectWellFormed = (inbox: readonly Message[]): void => {
  for (const [index, message] of inbox.entries()) {
    expect(message.lines, `message ${index} has three child elements`).toHaveLength(3);
    expect(message.texts, `message ${index}: innerText equals textContent`).toEqual(message.lines);
    expect(message.lines[0], `message ${index} title`).toMatch(TITLE);
    expect(message.lines[1], `message ${index} score line`).toMatch(SCORE);
    expect(message.lines[2], `message ${index} position`).toMatch(POSITION);
    expect(message.controls, `message ${index} holds no button, link, list or other control`).toBe(0);
  }
};

test.describe("@US-1 S-011 the Inbox is offered on the club home and is empty before the first match", () => {
  test("@boundary Six club-home buttons with Inbox last and 44px or taller; Inbox opens the only h1 Inbox, focused, an empty Messages list and No messages yet outside it; Back returns to the focused club name @contract-shape:bounded-change", async ({ page }) => {
    const errors = watchErrors(page);
    const club = await openSeason(page, "?seed=31", 0);
    expect(club).toBe(CLUB_31);
    const buttons = page.getByRole("button");
    expect(await buttonTexts(page), "six buttons, Inbox after Table").toEqual(SIX);
    for (const [index, each] of (await buttons.all()).entries()) await tall(each, `club home button ${index}`);
    expect(await clubActions(page)).toEqual(SIX.map((name) => `BUTTON:${name}`));
    await button(page, "Inbox").click(); await expect(heading(page)).toHaveText("Inbox");
    await expect(heading(page)).toBeFocused();
    await expect(page.getByRole("heading"), "the only heading").toHaveCount(1);
    await expect(messages(page)).toBeVisible();
    expect(await readInbox(page), "no message before the first match").toEqual([]);
    await expect(page.getByText("No messages yet", { exact: true })).toHaveCount(1);
    await expect(page.getByText("No messages yet", { exact: true })).toBeVisible();
    await expect(messages(page).getByText("No messages yet"), "the line is outside the list").toHaveCount(0);
    await expect(page.getByRole("button"), "Back is the only button").toHaveCount(1);
    await expect(page.getByRole("link")).toHaveCount(0);
    await tall(button(page, "Back"), "Back");
    expect(await overflow(page)).toBeLessThanOrEqual(0);
    await button(page, "Back").click(); await expect(heading(page)).toHaveText(club);
    await expect(heading(page)).toBeFocused();
    expect(await buttonTexts(page)).toEqual(SIX);
    expect(errors).toEqual([]);
  });
});

test.describe("@US-1 @US-2 S-011 every played matchday leaves one report: its match, and where the club stood", () => {
  test("@walking_skeleton @driving_port After 3 matches (each match screen and the Table read) one tap on Inbox shows Matchday 3, 2 and 1 with each match screen's score line and the Pos read right after it; messages are text, only Back acts; the season is untouched @contract-shape:bounded-change", async ({ page }) => {
    test.setTimeout(90_000);
    const errors = watchErrors(page);
    const club = await openSeason(page, "?seed=31", 0);
    const seen: Seen[] = [];
    const positions: string[] = [];
    for (let matchday = 1; matchday <= 3; matchday++) {
      seen.push(await playOne(page, club));
      positions.push(await tablePosition(page, club));
    }
    expect(seen.map((s) => s.title)).toEqual(["Matchday 1", "Matchday 2", "Matchday 3"]);
    expect(positions, "the Table's Pos after matchdays 1, 2, 3 (DISCUSS)").toEqual(["6th", "8th", "6th"]);
    await button(page, "Table").click();
    const tableBefore = await leagueTable(page).innerText();
    await button(page, "Back").click(); await installTapCounter(page);
    await button(page, "Inbox").click(); expect(await tapsSoFar(page), "K1: one tap from the club home").toBe(1);
    await expect(heading(page)).toHaveText("Inbox"); await expect(heading(page)).toBeFocused();
    const inbox = await readInbox(page);
    expect(inbox).toHaveLength(3);
    expectWellFormed(inbox);
    expect(inbox.map((m) => m.lines[0]), "titles equal the match screens' h1, newest first").toEqual([...seen].reverse().map((s) => s.title));
    expect(inbox.map((m) => m.lines[0])).toEqual(["Matchday 3", "Matchday 2", "Matchday 1"]);
    expect(inbox.map((m) => m.lines[1]), "each score line is the one on the match screen with the same h1").toEqual([...seen].reverse().map((s) => s.score));
    expect(inbox.map((m) => m.lines[2])).toEqual([...positions].reverse().map((p) => `League position ${p}`));
    expect(inbox.map((m) => m.lines)).toEqual(REFERENCE_INBOX_31.slice(0, 3).reverse().map(messageLines));
    await expect(page.getByText("No messages yet")).toHaveCount(0);
    await expect(page.getByRole("heading"), "titles are not headings").toHaveCount(1);
    await expect(page.getByRole("button"), "Back is the only button").toHaveCount(1);
    await expect(page.getByRole("link")).toHaveCount(0);
    const styles = await messages(page).getByRole("listitem").evaluateAll((items) =>
      items.flatMap((item) => [...item.children].flatMap((line) => [line, ...line.querySelectorAll("span")])).map((node) => {
        const style = getComputedStyle(node);
        return { tag: node.tagName, display: style.display, float: style.float, position: style.position, before: getComputedStyle(node, "::before").content, after: getComputedStyle(node, "::after").content };
      }),
    );
    expect(styles.filter((style) => style.tag === "SPAN").length, "every message has spans to check").toBeGreaterThan(0);
    for (const style of styles) {
      expect(style.display, style.tag === "SPAN" ? "spans stay inline" : "lines are blocks").toBe(style.tag === "SPAN" ? "inline" : "block");
      expect([style.float, style.position, style.before, style.after]).toEqual(["none", "static", "none", "none"]);
    }
    // Messages are text: tapping every item and line does nothing (an already played match cannot be re-opened).
    for (const item of await messages(page).getByRole("listitem").all()) {
      await item.click();
      for (const line of await item.locator("> *").all()) await line.click();
    }
    await expect(heading(page)).toHaveText("Inbox");
    expect(await readInbox(page)).toEqual(inbox);
    await button(page, "Back").click(); await expect(heading(page)).toHaveText(club);
    await expect(heading(page)).toBeFocused();
    await button(page, "Table").click(); expect(await leagueTable(page).innerText(), "reading the Inbox changed nothing").toBe(tableBefore);
    await button(page, "Back").click();
    await button(page, "Play match").click(); await expect(heading(page)).toHaveText("Matchday 4");
    await expect(page.getByText(REFERENCE_INBOX_31[3]!.scoreLine, { exact: true })).toBeVisible();
    expect(await overflow(page)).toBeLessThanOrEqual(0);
    expect(errors).toEqual([]);
  });
  test("@boundary After each of the 14 matchdays the Inbox holds exactly N reports, newest first, with the DISCUSS score lines; every older report keeps its position (Matchday 9 stays 2nd after Matchday 10 is 4th); the newest equals the Table's Pos; after 14: Final position equals it, the club home still offers Inbox, and Play again gives an empty Inbox @contract-shape:bounded-change", async ({ page }) => {
    test.setTimeout(90_000);
    const errors = watchErrors(page);
    const club = await openSeason(page, "?seed=31", 0);
    for (const reference of REFERENCE_INBOX_31) {
      const n = reference.matchday;
      await playOne(page, club);
      await button(page, "Inbox").click();
      await expect(heading(page)).toHaveText("Inbox");
      const inbox = await readInbox(page);
      expect(inbox, `after ${n} matches`).toHaveLength(n);
      expectWellFormed(inbox);
      const expected = REFERENCE_INBOX_31.slice(0, n).reverse();
      expect(inbox.map((m) => m.lines), `after ${n} matches: older messages keep their position`).toEqual(expected.map(messageLines));
      await expect(page.getByText("No messages yet"), `after ${n} matches`).toHaveCount(0);
      await button(page, "Back").click();
      await expect(heading(page)).toBeFocused();
      expect(`League position ${await tablePosition(page, club)}`, `the newest report equals the Table after ${n}`).toBe(inbox[0]!.lines[2]);
    }
    expect(await buttonTexts(page), "Inbox after matchday 14").toEqual(LAST);
    expect(await clubActions(page)).toEqual(LAST.map((name) => `BUTTON:${name}`));
    await button(page, "End of season").click();
    const finalLine = (await page.getByText(/^Final position /).innerText()).trim();
    expect(finalLine).toBe("Final position 3rd");
    await button(page, "Back").click();
    await button(page, "Inbox").click();
    const last = await readInbox(page);
    expect(last[0]!.lines).toEqual(["Matchday 14", "Tarnbeck Borough 2–1 Netherwold Borough", `League position ${finalLine.replace("Final position ", "")}`]);
    expect(last.at(-1)!.lines[0]).toBe("Matchday 1");
    await button(page, "Back").click();
    await button(page, "End of season").click();
    await button(page, "Play again").click(); await page.getByRole("list", { name: "Clubs" }).getByRole("button").nth(0).click();
    await expect(heading(page)).toHaveText(club);
    await button(page, "Inbox").click(); expect(await readInbox(page), "a new season starts with an empty Inbox (a rule of this version)").toEqual([]);
    await expect(page.getByText("No messages yet", { exact: true })).toBeVisible();
    expect(errors).toEqual([]);
  });
});

test.describe("@US-2 S-011 the same league gives the same Inbox", () => {
  const inboxAfter = async (page: Page, query: string, [clubIndex, matches]: readonly [number, number]): Promise<readonly string[][]> => {
    const club = await openSeason(page, query, clubIndex);
    for (let played = 0; played < matches; played++) await playOne(page, club);
    await button(page, "Inbox").click();
    const inbox = await readInbox(page);
    expectWellFormed(inbox);
    return inbox.map((m) => [...m.lines]);
  };
  const inFreshBrowser = async <T>(browser: Browser, baseURL: string | undefined, run: (page: Page) => Promise<T>): Promise<T> => {
    const context = await browser.newContext({ ...devices["Pixel 7"], viewport: { width: 390, height: 844 }, ...(baseURL === undefined ? {} : { baseURL }) });
    try {
      return await run(await context.newPage());
    } finally {
      await context.close();
    }
  };
  test("@boundary ?seed=abc, Oakhampton Rise Borough, one match: Matchday 1, Harrowgate Lane United 0–1 Oakhampton Rise Borough, League position 3rd; a fresh browser with no seed shows the same message @contract-shape:bounded-change", async ({ page, browser }, testInfo) => {
    const { clubIndex, report } = REFERENCE_INBOX_20260;
    expect(await inboxAfter(page, "?seed=abc", [clubIndex, 1])).toEqual([messageLines(report)]);
    expect(await inFreshBrowser(browser, testInfo.project.use.baseURL, (fresh) => inboxAfter(fresh, "", [clubIndex, 1])), "no seed").toEqual([messageLines(report)]);
  });
  test("@boundary Two fresh browsers at ?seed=31 with the same two matches show the same Inbox, line for line @contract-shape:bounded-change", async ({ page, browser }, testInfo) => {
    const first = await inboxAfter(page, "?seed=31", [0, 2]);
    expect(first).toEqual(REFERENCE_INBOX_31.slice(0, 2).reverse().map(messageLines));
    expect(await inFreshBrowser(browser, testInfo.project.use.baseURL, (fresh) => inboxAfter(fresh, "?seed=31", [0, 2]))).toEqual(first);
  });
});

test.describe("@US-1 S-011 the Inbox is derived: tactics never change it, a reload and Continue bring it back, and nothing is stored", () => {
  test("@boundary @real-io After 2 matches: opening the Inbox and Back writes no save and leaves the stored text alone; 4-3-3 and another player in the eleven leave the Inbox the same; after a reload, Continue and Inbox (2 taps from the title) it reads the same @contract-shape:bounded-change", async ({ page }) => {
    const errors = watchErrors(page);
    await countSaveWrites(page);
    const club = await openSeason(page, "?seed=31", 0);
    await playOne(page, club);
    await playOne(page, club);
    await expect.poll(() => saveWrites(page), "playing matches saves").toBeGreaterThan(0);
    const writes = await saveWrites(page);
    const stored = await savedText(page);
    expect(stored).not.toBeNull();
    await button(page, "Inbox").click();
    const before = await readInbox(page);
    expect(before).toHaveLength(2);
    expect(before.map((m) => m.lines[0])).toEqual(["Matchday 2", "Matchday 1"]);
    await button(page, "Back").click(); await expect(heading(page)).toHaveText(club);
    expect(await saveWrites(page), "opening the Inbox and Back writes no save").toBe(writes);
    expect(await savedText(page), "the stored text is unchanged").toBe(stored);
    await button(page, "Tactics").click(); await page.getByRole("radiogroup", { name: "Formation" }).getByText("4-3-3", { exact: true }).click();
    await button(page, "Back").click();
    await button(page, "Starting XI").click(); await page.getByRole("list", { name: "Starting XI" }).getByRole("button").filter({ hasText: /^MF/ }).last().click();
    await page.getByRole("list", { name: "Players" }).getByRole("button").filter({ hasNotText: "Starting" }).first().click();
    await button(page, "Back").click();
    await button(page, "Starting XI").click(); expect(await page.getByRole("list", { name: "Starting XI" }).getByRole("button").allInnerTexts()).toHaveLength(11);
    await button(page, "Back").click();
    await button(page, "Inbox").click(); expect(await readInbox(page), "a change of team never changes a message").toEqual(before);
    await button(page, "Back").click(); await page.reload();
    await installTapCounter(page);
    await button(page, "Continue").click(); await expect(heading(page)).toHaveText(club);
    expect(await buttonTexts(page), "Inbox is offered after Continue").toEqual(SIX);
    const writesAfterContinue = await saveWrites(page);
    await button(page, "Inbox").click(); expect(await tapsSoFar(page), "K1: Continue and Inbox, two taps from the title").toBe(2);
    expect(await readInbox(page), "after a reload and Continue the Inbox reads the same").toEqual(before);
    await button(page, "Back").click(); expect(await saveWrites(page), "the Inbox writes nothing after Continue either").toBe(writesAfterContinue);
    expect(errors).toEqual([]);
  });
});

test.describe("@US-1 S-011 a whole season of the widest score lines fits a 390px phone", () => {
  test("@boundary At ?seed=180 (the widest score lines the generator makes, 55 characters) after 14 matches the Inbox holds 14 messages and nothing scrolls sideways; every line stays on screen and Back is reachable and 44px or taller @contract-shape:bounded-change", async ({ page }) => {
    test.setTimeout(90_000);
    const errors = watchErrors(page);
    const club = await openSeason(page, LONGEST_NAMES.query, LONGEST_NAMES.clubIndex);
    for (let matchday = 1; matchday <= 14; matchday++) await playOne(page, club);
    await button(page, "Inbox").click(); await expect(heading(page)).toBeFocused();
    const inbox = await readInbox(page);
    expect(inbox).toHaveLength(14);
    expectWellFormed(inbox);
    expect(inbox.map((m) => m.lines[0])).toEqual(Array.from({ length: 14 }, (_, i) => `Matchday ${14 - i}`));
    expect(Math.max(...inbox.map((m) => (m.lines[1] ?? "").length)), "the seed has the widest line the generator makes").toBe(LONGEST_NAMES.widestLineLength);
    expect(await overflow(page), "no sideways scroll with 14 messages").toBeLessThanOrEqual(0);
    const width = page.viewportSize()!.width;
    for (const line of await messages(page).locator("li > *").all()) {
      const box = (await line.boundingBox())!;
      expect([box.x >= 0, box.x + box.width <= width], "inside the 390px screen").toEqual([true, true]);
    }
    await button(page, "Back").scrollIntoViewIfNeeded();
    await tall(button(page, "Back"), "Back below 14 messages");
    expect(await overflow(page)).toBeLessThanOrEqual(0);
    await button(page, "Back").click(); await expect(heading(page)).toHaveText(club);
    await expect(heading(page)).toBeFocused();
    expect(errors).toEqual([]);
  });
});
