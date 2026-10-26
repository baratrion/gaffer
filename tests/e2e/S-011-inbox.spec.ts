// @US-1 @US-2 (S-011 read my club's news in the Inbox) held out until DELIVER step 4 (the "Inbox" button, its screen and its CSS)
// CONTRACT_SHAPE: bounded-change
// What tests/protected/S-011 does not pin (version-only rules and measurements): "No messages yet", exact item counts, the place of "Inbox" after "Table", the seed-31 lines and positions
// (Chromium equals Node; an older message keeping its position is the same table read after 10 and 14 matches), ?seed=abc, innerText equal to textContent plus a computed-style check
// of the line elements, the stored game untouched (a setItem counter), click-everything, 390px with the longest names the generator makes (seed 585, found by sweeping seeds 1..1500 x 8
// clubs), focus, reload and Continue, "New game" after a season. Reference data: tests/acceptance/S-011/inbox-reference.ts (committed, from DISCUSS).
import { expect, test, type Locator, type Page } from "@playwright/test";
import { SAVE_KEY } from "../acceptance/S-010/save-golden";
import { SEED_20260_CLUB, SEED_20260_FIRST, SEED_31_REPORTS, scoreText, type ReferenceReport } from "../acceptance/S-011/inbox-reference";

const heading = (page: Page): Locator => page.getByRole("heading", { level: 1 });
const button = (page: Page, name: string): Locator => page.getByRole("button", { name, exact: true });
const messages = (page: Page): Locator => page.getByRole("list", { name: "Messages", exact: true });
const overflow = (page: Page): Promise<number> => page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
const tall = async (target: Locator, what: string): Promise<void> => expect((await target.boundingBox())?.height ?? 0, what).toBeGreaterThanOrEqual(44);
const watchErrors = (page: Page): string[] => {
  const errors: string[] = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(e.message));
  return errors;
};
const ordinal = (n: number): string => ({ 1: "1st", 2: "2nd", 3: "3rd" })[n as 1 | 2 | 3] ?? `${n}th`;
/** The three lines the Inbox must show for a reference report. */
const linesOf = (report: ReferenceReport): string[] => [`Matchday ${report.matchday}`, scoreText(report), `League position ${ordinal(report.position)}`];
/** Newest first: the messages after `played` matches of the seed-31 reference season. */
const expectedAfter = (played: number): string[][] => SEED_31_REPORTS.slice(0, played).reverse().map(linesOf);
const ALL_BUTTONS = ["Squad", "Tactics", "Starting XI", "Play match", "Table", "Inbox"];
/** Opens `query`, taps New game and club number `clubIndex` of the "Clubs" list; returns its name. */
const startSeason = async (page: Page, query: string, clubIndex = 0): Promise<string> => {
  await page.goto(`./${query}`);
  await button(page, "New game").click();
  const choice = page.getByRole("list", { name: "Clubs" }).getByRole("button").nth(clubIndex);
  const club = ((await choice.innerText()).split("\n")[0] ?? "").trim();
  await choice.click();
  await expect(heading(page)).toHaveText(club);
  return club;
};
/** Taps "Play match" and "Back" for matchdays first..last from the club home; returns each match screen's h1 and score line. */
const playMatches = async (page: Page, club: string, [first, last]: readonly [number, number]): Promise<{ title: string; line: string }[]> => {
  const seen: { title: string; line: string }[] = [];
  for (let matchday = first; matchday <= last; matchday++) {
    await button(page, "Play match").click();
    await expect(heading(page)).toHaveText(`Matchday ${matchday}`);
    seen.push({ title: (await heading(page).innerText()).trim(), line: (await page.getByText(/^.+ \d–\d .+$/).first().innerText()).trim() });
    await button(page, "Back").click();
    await expect(heading(page)).toHaveText(club);
  }
  return seen;
};
/** The club's Pos in the Table right now; returns to the club home. */
const readPos = async (page: Page, club: string): Promise<number> => {
  await button(page, "Table").click();
  const pos = Number((await page.getByRole("table", { name: "League table", exact: true }).locator("tr[aria-current='true'] td").first().innerText()).trim());
  await button(page, "Back").click();
  await expect(heading(page)).toHaveText(club);
  return pos;
};
const openInbox = async (page: Page): Promise<void> => {
  await button(page, "Inbox").click();
  await expect(heading(page)).toHaveText("Inbox");
};
const leaveInbox = async (page: Page, club: string): Promise<void> => {
  await button(page, "Back").click();
  await expect(heading(page)).toHaveText(club);
};
/** Every message of the open Inbox: the innerText of each line, one child element of the list item per line. */
const readMessages = (page: Page): Promise<string[][]> => messages(page).getByRole("listitem").evaluateAll((items) => items.map((item) => [...item.children].map((line) => (line as HTMLElement).innerText)));
const installTapCounter = (page: Page): Promise<void> =>
  page.evaluate(() => {
    const w = window as unknown as { __taps: number };
    w.__taps = 0;
    document.addEventListener("pointerdown", () => void w.__taps++, true);
  });
const taps = (page: Page): Promise<number> => page.evaluate(() => (window as unknown as { __taps: number }).__taps);
/** Counts every write of the saved game, on every page load. */
const countSaveWrites = (page: Page): Promise<unknown> =>
  page.addInitScript((key) => {
    const w = window as unknown as { __writes: number };
    w.__writes = 0;
    const real = Storage.prototype.setItem;
    Storage.prototype.setItem = function (k: string, v: string) {
      if (k === key) w.__writes++;
      return real.call(this, k, v);
    };
  }, SAVE_KEY);
const writes = (page: Page): Promise<number> => page.evaluate(() => (window as unknown as { __writes: number }).__writes);
const stored = (page: Page): Promise<string | null> => page.evaluate((key) => localStorage.getItem(key), SAVE_KEY);

test.describe("@US-1 S-011 the Inbox before any match", () => {
  test("@walking_skeleton @driving_port The club home has six buttons with Inbox last, after Table and 44px or taller; Inbox opens the only heading Inbox (focused) over an empty list Messages and the line No messages yet, outside the list; Back returns to the focused club name @contract-shape:bounded-change", async ({ page }) => {
    const errors = watchErrors(page);
    const club = await startSeason(page, "?seed=31");
    expect(club).toBe("Netherwold Borough");
    expect((await page.getByRole("button").allInnerTexts()).map((text) => text.trim())).toEqual(ALL_BUTTONS);
    for (const [index, each] of (await page.getByRole("button").all()).entries()) await tall(each, `club home button ${index}`);
    expect((await button(page, "Inbox").boundingBox())!.y).toBeGreaterThan((await button(page, "Table").boundingBox())!.y);
    expect(await overflow(page)).toBeLessThanOrEqual(0);
    await openInbox(page);
    await expect(heading(page)).toBeFocused();
    await expect(page.getByRole("heading")).toHaveCount(1);
    await expect(messages(page)).toHaveCount(1);
    await expect(messages(page).getByRole("listitem")).toHaveCount(0);
    await expect(page.getByText("No messages yet", { exact: true })).toBeVisible();
    await expect(messages(page).getByText("No messages yet")).toHaveCount(0);
    await tall(button(page, "Back"), "Back");
    expect(await overflow(page)).toBeLessThanOrEqual(0);
    await leaveInbox(page, club);
    await expect(heading(page)).toBeFocused();
    await expect(page.getByRole("heading")).toHaveCount(1);
    expect(errors).toEqual([]);
  });
  test("@boundary New game over a saved season (a reload offers Continue and New game): picking a club gives an empty Inbox, nothing carries over @contract-shape:bounded-change", async ({ page }) => {
    const club = await startSeason(page, "?seed=31");
    await playMatches(page, club, [1, 2]);
    await page.reload();
    await button(page, "New game").click();
    await page.getByRole("list", { name: "Clubs" }).getByRole("button").nth(0).click();
    await expect(heading(page)).toHaveText(club);
    await openInbox(page);
    await expect(messages(page).getByRole("listitem")).toHaveCount(0);
    await expect(page.getByText("No messages yet", { exact: true })).toBeVisible();
  });
});
test.describe("@US-1 @US-2 S-011 every played matchday leaves a report", () => {
  test("@walking_skeleton @driving_port @kpi After 3 matches at ?seed=31 the Inbox holds exactly 3 messages, Matchday 3, 2, 1, of three lines each (the match screen's h1, its score line, League position 6th, 8th, 6th = the Pos the Table showed then); No messages yet is gone; a message is text (tapping it does nothing); the reports are one tap from the club home (K1) @contract-shape:bounded-change", async ({ page }) => {
    const errors = watchErrors(page);
    const club = await startSeason(page, "?seed=31");
    const screens: { title: string; line: string }[] = [];
    const positions: number[] = [];
    for (let matchday = 1; matchday <= 3; matchday++) {
      screens.push(...(await playMatches(page, club, [matchday, matchday])));
      positions.push(await readPos(page, club));
    }
    await installTapCounter(page);
    await openInbox(page);
    expect(await taps(page), "the reports are one tap from the club home").toBe(1);
    await expect(heading(page)).toBeFocused();
    await expect(page.getByRole("heading")).toHaveCount(1);
    await expect(page.getByText("No messages yet")).toHaveCount(0);
    const read = await readMessages(page);
    expect(read.map((lines) => lines.length)).toEqual([3, 3, 3]);
    expect(read.map((lines) => lines[0])).toEqual(screens.map(({ title }) => title).reverse());
    expect(read.map((lines) => lines[1]), "each score line is the one on the match screen").toEqual(screens.map(({ line }) => line).reverse());
    expect(read.map((lines) => lines[2]), "each position is the Pos the Table showed right after that matchday").toEqual(positions.map((pos) => `League position ${ordinal(pos)}`).reverse());
    expect(read, "Chromium equals Node: the reference table").toEqual(expectedAfter(3));
    await expect(messages(page).locator("button, a, ul, ol, [role=button], [role=link]")).toHaveCount(0);
    await messages(page).getByRole("listitem").first().click();
    await expect(heading(page)).toHaveText("Inbox");
    expect(await readMessages(page)).toEqual(read);
    await tall(button(page, "Back"), "Back");
    await leaveInbox(page, club);
    await button(page, "Play match").click();
    await expect(heading(page)).toHaveText("Matchday 4");
    expect(errors).toEqual([]);
  });
  test("@walking_skeleton @kpi After all 14 matches at ?seed=31 the club home still offers Inbox last (End of season in the Play match slot); the Inbox holds 14 messages, Matchday 14 down to 1, equal to the reference table (an older message keeps its position: Matchday 9 is 2nd, Matchday 10 is 4th); the newest position is the Final position of End of season; Play again then the same club gives an empty Inbox @contract-shape:bounded-change", async ({ page }) => {
    test.setTimeout(90_000);
    const errors = watchErrors(page);
    const club = await startSeason(page, "?seed=31");
    await playMatches(page, club, [1, 14]);
    expect((await page.getByRole("button").allInnerTexts()).map((text) => text.trim())).toEqual(["Squad", "Tactics", "Starting XI", "End of season", "Table", "Inbox"]);
    await openInbox(page);
    const read = await readMessages(page);
    expect(read).toEqual(expectedAfter(14));
    expect(read[0]).toEqual(["Matchday 14", "Tarnbeck Borough 2–1 Netherwold Borough", "League position 3rd"]);
    expect(read[4]).toEqual(["Matchday 10", "Oakhampton Rise Borough 1–1 Netherwold Borough", "League position 4th"]);
    expect(read[5]).toEqual(["Matchday 9", "Netherwold Borough 3–1 Rushmoor Heath Albion", "League position 2nd"]);
    expect(read[13]).toEqual(["Matchday 1", "Netherwold Borough 1–2 Marlbrook Athletic", "League position 6th"]);
    await leaveInbox(page, club);
    await button(page, "End of season").click();
    await expect(heading(page)).toHaveText("End of season");
    const verdict = (await page.getByText(/^Final position (1st|2nd|3rd|4th|5th|6th|7th|8th)$/).innerText()).trim();
    expect(`League position ${verdict.replace("Final position ", "")}`).toBe(read[0]![2]);
    await button(page, "Play again").click();
    await page.getByRole("list", { name: "Clubs" }).getByRole("button").nth(0).click();
    await expect(heading(page)).toHaveText(club);
    await openInbox(page);
    await expect(messages(page).getByRole("listitem")).toHaveCount(0);
    await expect(page.getByText("No messages yet", { exact: true })).toBeVisible();
    expect(errors).toEqual([]);
  });
  test("@boundary The default seed: ?seed=abc and no seed give the same one message for Oakhampton Rise Borough after matchday 1 (Harrowgate Lane United 0–1 Oakhampton Rise Borough, League position 3rd) in two fresh browsers @contract-shape:bounded-change", async ({ browser }) => {
    const seen: string[][][] = [];
    for (const query of ["?seed=abc", ""]) {
      const page = await (await browser.newContext({ viewport: { width: 390, height: 844 } })).newPage();
      const errors = watchErrors(page);
      await page.goto(`./${query}`);
      await button(page, "New game").click();
      await page.getByRole("list", { name: "Clubs" }).getByRole("button").filter({ hasText: SEED_20260_CLUB }).first().click();
      await expect(heading(page)).toHaveText(SEED_20260_CLUB);
      await playMatches(page, SEED_20260_CLUB, [1, 1]);
      await openInbox(page);
      seen.push(await readMessages(page));
      expect(errors).toEqual([]);
      await page.context().close();
    }
    expect(seen).toEqual([[linesOf(SEED_20260_FIRST)], [linesOf(SEED_20260_FIRST)]]);
  });
});
test.describe("@US-1 S-011 the Inbox is read-only text and writes nothing", () => {
  test("@kpi @error Opening the Inbox, leaving it and opening it again adds no write of the saved game and leaves the stored text as it was (K3); clicking everything on the Inbox but Back changes nothing; the page holds one button (Back) and no link @contract-shape:bounded-change", async ({ page }) => {
    const errors = watchErrors(page);
    await countSaveWrites(page);
    const club = await startSeason(page, "?seed=31");
    await playMatches(page, club, [1, 3]);
    await expect.poll(() => stored(page)).not.toBeNull();
    const [writesBefore, textBefore] = [await writes(page), await stored(page)];
    expect(writesBefore, "the three matches were saved").toBeGreaterThan(0);
    await openInbox(page);
    await leaveInbox(page, club);
    await openInbox(page);
    const read = await readMessages(page);
    await expect(page.getByRole("button")).toHaveCount(1);
    await expect(page.getByRole("link")).toHaveCount(0);
    for (const target of await page.locator("body *:not(button):not(script):not(style)").all()) if (await target.isVisible()) await target.click({ timeout: 3000 });
    await expect(heading(page)).toHaveText("Inbox");
    expect(await readMessages(page)).toEqual(read);
    await leaveInbox(page, club);
    expect(await writes(page), "navigation writes nothing").toBe(writesBefore);
    expect(await stored(page)).toBe(textBefore);
    expect(errors).toEqual([]);
  });
  test("@boundary @error After 3 matches every line's innerText equals its textContent and the exact line; the lines are blocks, their spans inline, with no float, no positioning and no generated content (a flex or grid span would break the line in two) @contract-shape:bounded-change", async ({ page }) => {
    const club = await startSeason(page, "?seed=31");
    await playMatches(page, club, [1, 3]);
    await openInbox(page);
    const facts = await messages(page).getByRole("listitem").evaluateAll((items) =>
      items.map((item) => {
        const lines = [...item.children] as HTMLElement[];
        const spans = [...item.querySelectorAll("span")];
        const all = [...lines, ...spans];
        return {
          same: lines.map((line) => line.innerText === line.textContent), texts: lines.map((line) => line.innerText), lineDisplays: lines.map((line) => getComputedStyle(line).display),
          spanDisplays: [...new Set(spans.map((span) => getComputedStyle(span).display))], floats: [...new Set(all.map((node) => getComputedStyle(node).float))], positions: [...new Set(all.map((node) => getComputedStyle(node).position))],
          generated: all.flatMap((node) => [getComputedStyle(node, "::before").content, getComputedStyle(node, "::after").content]).filter((content) => content !== "none" && content !== "normal"),
        };
      }),
    );
    expect(facts).toHaveLength(3);
    for (const [index, fact] of facts.entries()) {
      expect(fact.same, "innerText equals textContent for every line").toEqual([true, true, true]);
      expect(fact.texts).toEqual(expectedAfter(3)[index]);
      expect([fact.lineDisplays, fact.spanDisplays, fact.floats, fact.positions, fact.generated]).toEqual([["block", "block", "block"], ["inline"], ["none"], ["static"], []]);
      expect(fact.texts[1]).toMatch(/^(.+) (\d)–(\d) (.+)$/);
      expect(fact.texts[2]).toMatch(/^League position (1st|2nd|3rd|4th|5th|6th|7th|8th)$/);
    }
  });
});
test.describe("@US-1 S-011 the Inbox survives a team change, a reload and Continue", () => {
  test("@walking_skeleton @kpi After 2 matches the Inbox is the same after switching to 4-3-3 in Tactics and after a reload and Continue; Continue then Inbox is 2 taps from the title (K1), and the club home after Continue offers Inbox last @contract-shape:bounded-change", async ({ page }) => {
    const errors = watchErrors(page);
    const club = await startSeason(page, "?seed=31");
    await playMatches(page, club, [1, 2]);
    await openInbox(page);
    const before = await readMessages(page);
    expect(before).toEqual(expectedAfter(2));
    await leaveInbox(page, club);
    await button(page, "Tactics").click();
    await page.getByRole("radiogroup", { name: "Formation" }).getByText("4-3-3", { exact: true }).click();
    await button(page, "Back").click();
    await expect(heading(page)).toHaveText(club);
    await openInbox(page);
    expect(await readMessages(page), "a team change rewrites no message").toEqual(before);
    await page.reload();
    await expect(heading(page)).toHaveText("Gaffer");
    await installTapCounter(page);
    await button(page, "Continue").click();
    await expect(heading(page)).toHaveText(club);
    expect((await page.getByRole("button").allInnerTexts()).map((text) => text.trim())).toEqual(ALL_BUTTONS);
    await openInbox(page);
    expect(await taps(page), "Continue, Inbox: two taps from the title").toBe(2);
    expect(await readMessages(page), "a reload and Continue rewrite no message").toEqual(before);
    expect(errors).toEqual([]);
  });
});
test.describe("@US-1 S-011 phone first with the longest names the generator makes", () => {
  test("@boundary At ?seed=585 (the sweep's winner over seeds 1..1500 x 8 clubs: Oakhampton Rise Wanderers' score lines run to 55 characters) 14 messages hold their three lines, nothing scrolls sideways at 390px, every message stays inside the viewport, Inbox and Back are 44px or taller, and there are no console errors @contract-shape:bounded-change", async ({ page }) => {
    test.setTimeout(90_000);
    const errors = watchErrors(page);
    const club = await startSeason(page, "?seed=585", 3);
    expect(club).toBe("Oakhampton Rise Wanderers");
    await playMatches(page, club, [1, 14]);
    await tall(button(page, "Inbox"), "Inbox");
    await openInbox(page);
    const read = await readMessages(page);
    expect(read.map((lines) => lines.length)).toEqual(Array.from({ length: 14 }, () => 3));
    const scoreLines = read.map((lines) => lines[1]!);
    expect(Math.max(...scoreLines.map((line) => line.length)), "the longest score line the generator makes").toBe(55);
    expect(scoreLines).toContain("Stoneleigh Moor Wanderers 1–4 Oakhampton Rise Wanderers");
    expect(await overflow(page), "no sideways scroll").toBeLessThanOrEqual(0);
    for (const box of await messages(page).getByRole("listitem").evaluateAll((items) => items.map((item) => item.getBoundingClientRect().toJSON() as { left: number; right: number }))) {
      expect(box.left).toBeGreaterThanOrEqual(0);
      expect(box.right).toBeLessThanOrEqual(page.viewportSize()!.width);
    }
    await tall(button(page, "Back"), "Back");
    await leaveInbox(page, club);
    expect(errors).toEqual([]);
  });
});
