// @US-1 @US-2 (S-011 read my club's news in the Inbox) held out until DELIVER
// CONTRACT_SHAPE: bounded-change
// Outcome anchor: DISCUSS Elevator Pitches (feature-delta.md US-1, US-2): on Netherwold Borough's home (?seed=31) Sam plays 3 matches, taps "Inbox" and sees the screen
// "Inbox" (focused) with a list "Messages" of 3 messages, newest first: "Matchday 3 / Netherwold Borough 2–1 Oakhampton Rise Borough / League position 6th", then
// Matchday 2 (8th) and Matchday 1 (6th). Covers what tests/protected/S-011 does not (D9): the sixth button after "Table", "No messages yet" outside the list, the exact
// item count for N = 0..14, the seed-31 goldens (inbox-reference.ts, recomputed in Node by the committed inbox-inputs-pinned.test.ts: Chromium must equal Node), the
// per-season reset, ?seed=abc equal to no seed, nothing stored (a Storage.setItem counter and the stored text), the K1 tap counts (1 tap from the club home, 2 from the
// title after a reload), a computed-style check of the message lines (spans inline, <p> lines block, no float, no positioning, no generated content: innerText equals
// textContent), click-everything (only Back acts) and 390px with 14 messages on the seed with the widest score lines the generator makes (?seed=180, 55 characters).
// Environment precondition: local-preview (ci:serve, http://localhost:4173/gaffer/) or, via BASE_URL, the deployed Pages site (fresh contexts; the init script that
// counts writes lives in the test's own context only). A season is 28+ taps: the season tests use test.setTimeout(90_000) (DEVOPS note).
// Environment probes (ADR-0017 Earned Trust): (1) Chromium equals Node on the goldens; (2) innerText equals textContent, one element per line, no generated content;
// (4) navigation writes nothing; (5) messages are text: click-everything emits only Back; (6) focus, 44px, 390px, no console error.
// Destination: tests/e2e/S-011-inbox.spec.ts (DELIVER: git mv, dropping .pending, in the commit that adds the Inbox screen). It imports
// ../acceptance/S-011/inbox-reference (committed data module; do not move it).
import { devices, expect, test, type Browser, type Locator, type Page } from "@playwright/test";
import { CLUB_31, LONGEST_NAMES, REFERENCE_INBOX_20260, REFERENCE_INBOX_31 } from "../acceptance/S-011/inbox-reference";

// Viewport and device: the Pixel 7 profile at 390px comes from playwright.config.ts (no per-spec override).

const TITLE = /^Matchday (\d{1,2})$/;
const SCORE = /^(.+) (\d)–(\d) (.+)$/;
const POSITION = /^League position (1st|2nd|3rd|4th|5th|6th|7th|8th)$/;
const ORDINALS = ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th"] as const;
const SIX = ["Squad", "Tactics", "Starting XI", "Play match", "Table", "Inbox"];

const heading = (page: Page): Locator => page.getByRole("heading", { level: 1 });
const button = (page: Page, name: string): Locator => page.getByRole("button", { name, exact: true });
const messages = (page: Page): Locator => page.getByRole("list", { name: "Messages", exact: true });
const overflow = (page: Page): Promise<number> => page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
const firstLine = (text: string): string => (text.split("\n")[0] ?? "").trim();
const watchErrors = (page: Page): string[] => {
  const errors: string[] = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(e.message));
  return errors;
};
const installTapCounter = (page: Page) =>
  page.evaluate(() => {
    const w = window as unknown as { __taps: number; __counting?: boolean };
    w.__taps = 0;
    if (!w.__counting) {
      w.__counting = true;
      document.addEventListener("pointerdown", () => void w.__taps++, true);
    }
  });
const tapsSoFar = (page: Page): Promise<number> => page.evaluate(() => (window as unknown as { __taps: number }).__taps);
const tall = async (target: Locator, what: string): Promise<void> => expect((await target.boundingBox())?.height ?? 0, what).toBeGreaterThanOrEqual(44);

/** Counts calls that write the saved game, in this page's context only (an init script, so it never touches a real player's storage). */
const countSaveWrites = (page: Page) =>
  page.addInitScript(() => {
    const w = window as unknown as { __saveWrites: number };
    w.__saveWrites = 0;
    const real = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key: string, value: string) {
      if (key === "gaffer.save") w.__saveWrites++;
      return real.call(this, key, value);
    };
  });
const saveWrites = (page: Page): Promise<number> => page.evaluate(() => (window as unknown as { __saveWrites: number }).__saveWrites);
const savedText = (page: Page): Promise<string | null> => page.evaluate(() => localStorage.getItem("gaffer.save"));

/** Opens a fresh page, taps New game, picks club `clubIndex` of the "Clubs" list and returns its name. */
const openSeason = async (page: Page, query: string, clubIndex: number): Promise<string> => {
  await page.goto(`./${query}`);
  await button(page, "New game").click();
  const list = page.getByRole("list", { name: "Clubs" }).getByRole("button");
  const clubs = (await list.allInnerTexts()).map(firstLine);
  expect(clubs).toHaveLength(8);
  await list.nth(clubIndex).click();
  await expect(heading(page)).toHaveText(clubs[clubIndex]!);
  return clubs[clubIndex]!;
};

interface Seen {
  readonly title: string;
  readonly score: string;
}

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
  const rows = (await page.getByRole("table", { name: "League table", exact: true }).getByRole("row").all()).slice(1);
  expect(rows).toHaveLength(8);
  let ordinal = "";
  for (const row of rows) {
    if ((await row.getByRole("rowheader").innerText()).trim() === club) ordinal = ORDINALS[Number((await row.getByRole("cell").first().innerText()).trim()) - 1]!;
  }
  await button(page, "Back").click();
  await expect(heading(page)).toHaveText(club);
  return ordinal;
};

interface Message {
  readonly lines: readonly string[];
  readonly texts: readonly string[];
  readonly tags: readonly string[];
  readonly controls: number;
}

/** The Inbox as Sam reads it: per list item, the visible text (innerText) and textContent of each child element, in order, and how many controls the item holds. */
const readInbox = async (page: Page): Promise<readonly Message[]> => {
  await expect(messages(page)).toHaveCount(1);
  return messages(page).getByRole("listitem").evaluateAll((items) =>
    items.map((item) => ({
      lines: [...item.children].map((child) => (child as HTMLElement).innerText),
      texts: [...item.children].map((child) => child.textContent ?? ""),
      tags: [...item.children].map((child) => child.tagName),
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

const readEleven = async (page: Page): Promise<readonly string[]> => {
  await button(page, "Starting XI").click();
  const items = (await page.getByRole("list", { name: "Starting XI" }).getByRole("button").allInnerTexts()).map((text) => text.trim());
  await button(page, "Back").click();
  return items;
};

test.describe("@US-1 S-011 the Inbox is offered on the club home and is empty before the first match", () => {
  test("@boundary Six club-home buttons with Inbox last and 44px or taller; Inbox opens the only h1 Inbox, focused, an empty Messages list and No messages yet outside it; Back returns to the focused club name @contract-shape:bounded-change", async ({ page }) => {
    const errors = watchErrors(page);
    const club = await openSeason(page, "?seed=31", 0);
    expect(club).toBe(CLUB_31);
    const buttons = page.getByRole("button");
    expect((await buttons.allInnerTexts()).map((text) => text.trim()), "six buttons, Inbox after Table").toEqual(SIX);
    for (const [index, each] of (await buttons.all()).entries()) await tall(each, `club home button ${index}`);
    expect(await page.evaluate(() => [...document.querySelectorAll(".club-actions > *")].map((node) => `${node.tagName}:${node.textContent?.trim()}`))).toEqual(SIX.map((name) => `BUTTON:${name}`));

    await button(page, "Inbox").click();
    await expect(heading(page)).toHaveText("Inbox");
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

    await button(page, "Back").click();
    await expect(heading(page)).toHaveText(club);
    await expect(heading(page)).toBeFocused();
    expect((await page.getByRole("button").allInnerTexts()).map((text) => text.trim())).toEqual(SIX);
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
    const tableBefore = await page.getByRole("table", { name: "League table", exact: true }).innerText();
    await button(page, "Back").click();

    await installTapCounter(page);
    await button(page, "Inbox").click();
    expect(await tapsSoFar(page), "K1: one tap from the club home").toBe(1);
    await expect(heading(page)).toHaveText("Inbox");
    await expect(heading(page)).toBeFocused();
    const inbox = await readInbox(page);
    expect(inbox).toHaveLength(3);
    expectWellFormed(inbox);
    expect(inbox.map((m) => m.lines[0]), "titles equal the match screens' h1, newest first").toEqual([...seen].reverse().map((s) => s.title));
    expect(inbox.map((m) => m.lines[0])).toEqual(["Matchday 3", "Matchday 2", "Matchday 1"]);
    expect(inbox.map((m) => m.lines[1]), "each score line is the one on the match screen with the same h1").toEqual([...seen].reverse().map((s) => s.score));
    expect(inbox.map((m) => m.lines[2])).toEqual([...positions].reverse().map((p) => `League position ${p}`));
    expect(inbox.map((m) => m.lines)).toEqual(REFERENCE_INBOX_31.slice(0, 3).reverse().map((r) => [`Matchday ${r.matchday}`, r.scoreLine, `League position ${r.ordinal}`]));
    await expect(page.getByText("No messages yet")).toHaveCount(0);
    await expect(page.getByRole("heading"), "titles are not headings").toHaveCount(1);
    await expect(page.getByRole("button"), "Back is the only button").toHaveCount(1);
    await expect(page.getByRole("link")).toHaveCount(0);

    // The layout lie: each line is one element, read as one piece of text (spans inline, <p> lines block, no float, no positioning, no generated content).
    const styles = await messages(page).getByRole("listitem").evaluateAll((items) =>
      items.flatMap((item) =>
        [...item.children].flatMap((line) => [line, ...line.querySelectorAll("span")]).map((node) => {
          const style = getComputedStyle(node);
          return { tag: node.tagName, display: style.display, float: style.float, position: style.position, before: getComputedStyle(node, "::before").content, after: getComputedStyle(node, "::after").content };
        }),
      ),
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

    await button(page, "Back").click();
    await expect(heading(page)).toHaveText(club);
    await expect(heading(page)).toBeFocused();
    await button(page, "Table").click();
    expect(await page.getByRole("table", { name: "League table", exact: true }).innerText(), "reading the Inbox changed nothing").toBe(tableBefore);
    await button(page, "Back").click();
    await button(page, "Play match").click();
    await expect(heading(page)).toHaveText("Matchday 4");
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
      expect(inbox.map((m) => m.lines), `after ${n} matches: older messages keep their position`).toEqual(expected.map((r) => [`Matchday ${r.matchday}`, r.scoreLine, `League position ${r.ordinal}`]));
      await expect(page.getByText("No messages yet"), `after ${n} matches`).toHaveCount(0);
      await button(page, "Back").click();
      await expect(heading(page)).toBeFocused();
      expect(`League position ${await tablePosition(page, club)}`, `the newest report equals the Table after ${n}`).toBe(inbox[0]!.lines[2]);
    }
    expect((await page.getByRole("button").allInnerTexts()).map((text) => text.trim()), "Inbox after matchday 14").toEqual(["Squad", "Tactics", "Starting XI", "End of season", "Table", "Inbox"]);
    expect(await page.evaluate(() => [...document.querySelectorAll(".club-actions > *")].map((node) => `${node.tagName}:${node.textContent?.trim()}`))).toEqual(
      ["Squad", "Tactics", "Starting XI", "End of season", "Table", "Inbox"].map((name) => `BUTTON:${name}`),
    );

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
    await button(page, "Play again").click();
    await page.getByRole("list", { name: "Clubs" }).getByRole("button").nth(0).click();
    await expect(heading(page)).toHaveText(club);
    await button(page, "Inbox").click();
    expect(await readInbox(page), "a new season starts with an empty Inbox (a rule of this version)").toEqual([]);
    await expect(page.getByText("No messages yet", { exact: true })).toBeVisible();
    expect(errors).toEqual([]);
  });
});

test.describe("@US-2 S-011 the same league gives the same Inbox", () => {
  const freshContext = (browser: Browser, baseURL: string | undefined) => browser.newContext({ ...devices["Pixel 7"], viewport: { width: 390, height: 844 }, ...(baseURL === undefined ? {} : { baseURL }) });
  const oneMatchInbox = async (page: Page, query: string, clubIndex: number): Promise<readonly string[][]> => {
    const club = await openSeason(page, query, clubIndex);
    await playOne(page, club);
    await button(page, "Inbox").click();
    const inbox = await readInbox(page);
    expectWellFormed(inbox);
    return inbox.map((m) => [...m.lines]);
  };

  test("@boundary ?seed=abc, Oakhampton Rise Borough, one match: Matchday 1, Harrowgate Lane United 0–1 Oakhampton Rise Borough, League position 3rd; a fresh browser with no seed shows the same message @contract-shape:bounded-change", async ({ page, browser }, testInfo) => {
    const { clubIndex, report } = REFERENCE_INBOX_20260;
    const expected = [[`Matchday ${report.matchday}`, report.scoreLine, `League position ${report.ordinal}`]];
    expect(await oneMatchInbox(page, "?seed=abc", clubIndex)).toEqual(expected);
    const context = await freshContext(browser, testInfo.project.use.baseURL);
    try {
      expect(await oneMatchInbox(await context.newPage(), "", clubIndex), "no seed").toEqual(expected);
    } finally {
      await context.close();
    }
  });

  test("@boundary Two fresh browsers at ?seed=31 with the same two matches show the same Inbox, line for line @contract-shape:bounded-change", async ({ page, browser }, testInfo) => {
    const twoMatches = async (target: Page): Promise<readonly string[][]> => {
      const club = await openSeason(target, "?seed=31", 0);
      await playOne(target, club);
      await playOne(target, club);
      await button(target, "Inbox").click();
      return (await readInbox(target)).map((m) => [...m.lines]);
    };
    const first = await twoMatches(page);
    expect(first).toEqual(REFERENCE_INBOX_31.slice(0, 2).reverse().map((r) => [`Matchday ${r.matchday}`, r.scoreLine, `League position ${r.ordinal}`]));
    const context = await freshContext(browser, testInfo.project.use.baseURL);
    try {
      expect(await twoMatches(await context.newPage())).toEqual(first);
    } finally {
      await context.close();
    }
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
    await button(page, "Back").click();
    await expect(heading(page)).toHaveText(club);
    expect(await saveWrites(page), "opening the Inbox and Back writes no save").toBe(writes);
    expect(await savedText(page), "the stored text is unchanged").toBe(stored);

    await button(page, "Tactics").click();
    await page.getByRole("radiogroup", { name: "Formation" }).getByText("4-3-3", { exact: true }).click();
    await button(page, "Back").click();
    await button(page, "Starting XI").click();
    await page.getByRole("list", { name: "Starting XI" }).getByRole("button").filter({ hasText: /^MF/ }).last().click();
    await page.getByRole("list", { name: "Players" }).getByRole("button").filter({ hasNotText: "Starting" }).first().click();
    await button(page, "Back").click();
    const eleven = await readEleven(page);
    expect(eleven).toHaveLength(11);
    await button(page, "Inbox").click();
    expect(await readInbox(page), "a change of team never changes a message").toEqual(before);
    await button(page, "Back").click();

    await page.reload();
    await installTapCounter(page);
    await button(page, "Continue").click();
    await expect(heading(page)).toHaveText(club);
    expect((await page.getByRole("button").allInnerTexts()).map((text) => text.trim()), "Inbox is offered after Continue").toEqual(SIX);
    const writesAfterContinue = await saveWrites(page);
    await button(page, "Inbox").click();
    expect(await tapsSoFar(page), "K1: Continue and Inbox, two taps from the title").toBe(2);
    expect(await readInbox(page), "after a reload and Continue the Inbox reads the same").toEqual(before);
    await button(page, "Back").click();
    expect(await saveWrites(page), "the Inbox writes nothing after Continue either").toBe(writesAfterContinue);
    expect(errors).toEqual([]);
  });
});

test.describe("@US-1 S-011 a whole season of the widest score lines fits a 390px phone", () => {
  test("@boundary At ?seed=180 (the widest score lines the generator makes, 55 characters) after 14 matches the Inbox holds 14 messages and nothing scrolls sideways; every line stays on screen and Back is reachable and 44px or taller @contract-shape:bounded-change", async ({ page }) => {
    test.setTimeout(90_000);
    const errors = watchErrors(page);
    const club = await openSeason(page, LONGEST_NAMES.query, LONGEST_NAMES.clubIndex);
    for (let matchday = 1; matchday <= 14; matchday++) await playOne(page, club);
    await button(page, "Inbox").click();
    await expect(heading(page)).toBeFocused();
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
    await button(page, "Back").click();
    await expect(heading(page)).toHaveText(club);
    await expect(heading(page)).toBeFocused();
    expect(errors).toEqual([]);
  });
});
