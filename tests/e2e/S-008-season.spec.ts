// @US-1 @US-2 (S-008 play the season, matchday by matchday)
// CONTRACT_SHAPE: bounded-change
// Outcome anchor: DISCUSS Elevator Pitches (feature-delta.md US-1, US-2): on Netherwold Borough's home Sam taps "Play match" and "Back" 14 times
// (28 taps) and sees "Matchday 1" to "Matchday 14", the second being "Rushmoor Heath Albion 2–1 Netherwold Borough" and the last "Tarnbeck
// Borough 2–1 Netherwold Borough"; "Back" and "Table" show every row at P 2 after two matches (Netherwold Borough eighth on Pts 0, GD -2)
// and at P 14 after the season (Netherwold Borough third on Pts 23, five behind Oakhampton Rise Borough); after matchday 14 the club home
// shows "End of season" where "Play match" was. The expected values are the reference season of the plan run (season-reference.ts, written
// before any S-008 code). Covers only what tests/protected/S-008 does not: the cross-engine golden season (Chromium equals Node), focus on
// each heading, 44px, the picks counting forward with a real pick, the "End of season" button and the missing "Play match" button (durable, S-009 D1),
// "Table" after 14, determinism between fresh pages, a reload offers Continue and New game still starts fresh (S-010), no sideways scroll and no console error.
// Environment precondition: runs against local-preview (ci:serve, http://localhost:4173/gaffer/) or, via BASE_URL, the deployed Pages site;
// both serve the production build under /gaffer/. Not meant for local-dev (vite dev, :5173): waived (as S-003..S-007).
// Environment probes (ADR-0014 Earned Trust): (1) the browser reproduces the Node reference season (14 score lines, seed 31 and 20260);
// (5) after matchday 14 no button named "Play match" and one button named "End of season" in its slot, 5 buttons 44px or taller, no "Season over", no sideways scroll. A season is 28 taps: the season tests use test.slow().
// Destination: tests/e2e/S-008-season.spec.ts (DELIVER, same commit as the club-home change).
import { expect, test, type Locator, type Page } from "@playwright/test";
import { goalDifferenceText, REFERENCE_20260, REFERENCE_31, scoreLinesOf, TABLE_AFTER_TWO_31, type ReferenceSeason } from "../acceptance/S-008/season-reference";

// Viewport and device: the Pixel 7 profile at 390px comes from playwright.config.ts (no per-spec override).

type Row = readonly [pos: string, club: string, p: string, w: string, d: string, l: string, gd: string, pts: string];

const COLUMNS = ["Pos", "Club", "P", "W", "D", "L", "GD", "Pts"] as const;
const SCORE = /^(.+) (\d)–(\d) (.+)$/;
const ITEM = /^(\d{1,2})' (.+) \((.+)\)$/;
const finalRows = (season: ReferenceSeason): readonly Row[] =>
  season.table.map((r, i): Row => [String(i + 1), r.name, String(r.played), String(r.won), String(r.drawn), String(r.lost), goalDifferenceText(r.goalDifference), String(r.points)]);

const heading = (page: Page): Locator => page.getByRole("heading", { level: 1 });
const button = (page: Page, name: string): Locator => page.getByRole("button", { name, exact: true });
const back = (page: Page): Locator => button(page, "Back");
const leagueTable = (page: Page): Locator => page.getByRole("table", { name: "League table", exact: true });
const overflow = (page: Page): Promise<number> => page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
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
/** The scorers named in the Goals items for one club ("23' Ivo Elderkin (Netherwold Borough)" gives Ivo Elderkin). */
const scorersFor = (goals: readonly string[], club: string): string[] =>
  goals.map((text) => ITEM.exec(text)!).filter((match) => match[3] === club).map((match) => match[2]!);
const firstLine = (text: string): string => (text.split("\n")[0] ?? "").trim();

/** Opens a fresh page, taps New game, reads the 8 names of the "Clubs" list and picks club `clubIndex`. */
const openSeason = async (page: Page, query: string, clubIndex: number): Promise<{ readonly club: string; readonly clubs: readonly string[] }> => {
  await page.goto(`./${query}`);
  await page.getByRole("button", { name: "New game" }).click();
  const list = page.getByRole("list", { name: "Clubs" }).getByRole("button");
  const clubs = (await list.allInnerTexts()).map(firstLine);
  expect(clubs).toHaveLength(8);
  await list.nth(clubIndex).click();
  const club = clubs[clubIndex]!;
  await expect(heading(page)).toContainText(club);
  return { club, clubs };
};

/** The 11 on the Starting XI screen as Sam reads them: position and name (the shirt number is dropped). Back returns to the club home. */
const readEleven = async (page: Page): Promise<readonly { readonly position: string; readonly name: string }[]> => {
  await button(page, "Starting XI").click();
  await expect(heading(page)).toHaveText("Starting XI");
  const items = (await page.getByRole("list", { name: "Starting XI" }).getByRole("button").allInnerTexts()).map((text) => text.trim());
  await back(page).click();
  return items.map((text) => {
    const [, position, name] = /^(GK|DF|MF|FW) (.+) \d+$/.exec(text)!;
    return { position: position!, name: name! };
  });
};

/** What Sam reads the instant the match heading has focus: no waiting between the tap and this snapshot. */
interface Reading {
  readonly focusedTag: string;
  readonly focusedText: string;
  readonly headings: number;
  readonly scoreLines: readonly { tag: string; text: string; inner: string; visible: boolean }[];
  readonly items: readonly { text: string; inner: string }[];
  readonly goalsListVisible: boolean;
}
const readNow = (page: Page): Promise<Reading> =>
  page.evaluate((): Reading => {
    const re = /^(.+) (\d)–(\d) (.+)$/;
    const all = [...document.querySelectorAll<HTMLElement>("#app *")];
    const deepest = all.filter((node) => re.test(node.textContent ?? "") && ![...node.children].some((child) => re.test(child.textContent ?? "")));
    const list = document.querySelector<HTMLElement>("[role='list'][aria-labelledby]");
    const labelled = list ? document.getElementById(list.getAttribute("aria-labelledby") ?? "") : null;
    const active = document.activeElement;
    return {
      focusedTag: active?.tagName ?? "",
      focusedText: active?.textContent ?? "",
      headings: document.querySelectorAll("h1, h2, h3, h4, h5, h6, [role='heading']").length,
      scoreLines: deepest.map((node) => ({ tag: node.tagName, text: node.textContent ?? "", inner: node.innerText, visible: node.getBoundingClientRect().height > 0 })),
      items: [...(list?.querySelectorAll<HTMLElement>("li") ?? [])].map((node) => ({ text: node.textContent ?? "", inner: node.innerText })),
      goalsListVisible: labelled?.textContent === "Goals" && (list?.getBoundingClientRect().height ?? 0) > 0,
    };
  });

interface Played {
  readonly matchday: number;
  readonly score: string;
  readonly goals: readonly string[];
}
interface Who {
  readonly club: string;
  readonly clubs: readonly string[];
  readonly eleven: readonly { readonly position: string; readonly name: string }[];
}

/** Taps "Play match" and asserts the whole match screen as Sam reads it right away (D2): h1 "Matchday N" focused, one score line, the Goals list. */
const playAndRead = async (page: Page, matchday: number, who: Who): Promise<Played> => {
  expect((await button(page, "Play match").boundingBox())?.height ?? 0, `Play match before matchday ${matchday}`).toBeGreaterThanOrEqual(44);
  await button(page, "Play match").click();
  const reading = await readNow(page);
  expect(reading.focusedTag, `focus is on the heading the moment matchday ${matchday} opens`).toBe("H1");
  expect(reading.focusedText).toBe(`Matchday ${matchday}`);
  expect(reading.headings, "one heading on the screen").toBe(1);
  expect(reading.scoreLines, "exactly one piece of text reads as a score line").toHaveLength(1);
  const line = reading.scoreLines[0]!;
  expect(line.tag, "a paragraph, not a heading").toBe("P");
  expect(line.visible, "score line visible on arrival").toBe(true);
  expect(line.inner, "innerText equals textContent for the score line").toBe(line.text);
  const [, home, homeGoals, awayGoals, away] = SCORE.exec(line.text)!;
  expect(home === who.club || away === who.club, "one of the two clubs is Sam's").toBe(true);
  expect(home !== away && who.clubs.includes(home!) && who.clubs.includes(away!), "the other is a different club of the Clubs list").toBe(true);
  expect(reading.goalsListVisible, "list Goals with its visible label, on arrival").toBe(true);
  const minutes = reading.items.map((item) => Number(ITEM.exec(item.text)![1]));
  for (const item of reading.items) {
    expect(item.inner, "innerText equals textContent for a goal item").toBe(item.text);
    expect(item.text).toMatch(ITEM);
  }
  expect(minutes.every((minute) => minute >= 1 && minute <= 90), "minutes 1 to 90").toBe(true);
  expect(minutes, "minutes never decrease").toEqual([...minutes].sort((a, b) => a - b));
  expect(reading.items, "one item per goal").toHaveLength(Number(homeGoals) + Number(awayGoals));
  const goals = reading.items.map((item) => item.text);
  const own = scorersFor(goals, who.club);
  expect(own, "Sam's club's items equal its goals in the score line").toHaveLength(who.club === home ? Number(homeGoals) : Number(awayGoals));
  const outfield = who.eleven.filter((player) => player.position !== "GK").map((player) => player.name);
  for (const scorer of own) expect(outfield, `${scorer} is an outfield player of the Starting XI, never the goalkeeper`).toContain(scorer);
  return { matchday, score: line.text, goals };
};

/** "Back" to the club home: the club-name heading has focus, Play match or End of season is where it was. */
const backHome = async (page: Page, club: string): Promise<void> => {
  expect((await back(page).boundingBox())?.height ?? 0, "Back").toBeGreaterThanOrEqual(44);
  await back(page).click();
  await expect(heading(page)).toHaveText(club);
  await expect(heading(page)).toBeFocused();
};

/** Plays matches `from`..`to` (each: Play match, read, Back). */
const playSeason = async (page: Page, who: Who, range: { readonly from: number; readonly to: number }): Promise<readonly Played[]> => {
  const played: Played[] = [];
  for (let matchday = range.from; matchday <= range.to; matchday++) {
    played.push(await playAndRead(page, matchday, who));
    expect(await overflow(page), `no sideways scroll on matchday ${matchday}`).toBeLessThanOrEqual(0);
    await backHome(page, who.club);
  }
  return played;
};
const whoIs = async (page: Page, query: string, clubIndex: number): Promise<Who> => {
  const { club, clubs } = await openSeason(page, query, clubIndex);
  return { club, clubs, eleven: await readEleven(page) };
};

/** Opens the table from the club home and asserts the arrival (focused "League table", one table, 8 rows already there). */
const openTable = async (page: Page): Promise<void> => {
  await button(page, "Table").click();
  const now = await page.evaluate(() => ({
    tag: document.activeElement?.tagName ?? "",
    text: document.activeElement?.textContent ?? "",
    rows: [...document.querySelectorAll<HTMLElement>("tbody tr")].filter((row) => row.getBoundingClientRect().height > 0).length,
  }));
  expect([now.tag, now.text], "focus is on the League table heading the moment the table opens").toEqual(["H1", "League table"]);
  expect(now.rows, "all 8 rows visible on arrival").toBe(8);
};
const readTable = async (page: Page): Promise<{ readonly rows: Row[]; readonly marked: string[] }> => {
  const table = leagueTable(page);
  await expect(table).toBeVisible();
  expect((await table.getByRole("columnheader").allInnerTexts()).map((text) => text.trim()), "column headers in order").toEqual([...COLUMNS]);
  const rowLocators = await table.getByRole("row").all();
  expect(rowLocators, "1 header row and 8 body rows").toHaveLength(9);
  const rows: Row[] = [];
  const marked: string[] = [];
  for (const row of rowLocators.slice(1)) {
    const cells = (await row.getByRole("cell").allInnerTexts()).map((text) => text.trim());
    const club = (await row.getByRole("rowheader").innerText()).trim();
    expect(cells, `7 cells in the row of ${club}`).toHaveLength(7);
    const [pos, p, w, d, l, gd, pts] = cells as [string, string, string, string, string, string, string];
    rows.push([pos, club, p, w, d, l, gd, pts]);
    if ((await row.getAttribute("aria-current")) === "true") marked.push(club);
  }
  return { rows, marked };
};
/** The row rules and the order every table must obey after the N-th match whatever the seed (D4). */
const expectRules = (rows: readonly Row[], played: number): void => {
  expect(rows.map((row) => row[0])).toEqual(["1", "2", "3", "4", "5", "6", "7", "8"]);
  let [won, drawn, lost, gdSum] = [0, 0, 0, 0];
  for (const [, club, p, w, d, l, gd, pts] of rows) {
    expect(p, `${club} has played ${played}`).toBe(String(played));
    expect(gd, `${club} goal difference text`).toMatch(/^(\+[1-9]\d*|0|-[1-9]\d*)$/);
    expect(Number(w) + Number(d) + Number(l), `${club} W+D+L=P`).toBe(Number(p));
    expect(Number(pts), `${club} Pts=3W+D`).toBe(3 * Number(w) + Number(d));
    [won, drawn, lost, gdSum] = [won + Number(w), drawn + Number(d), lost + Number(l), gdSum + Number(gd)];
  }
  expect(won, "total W equals total L").toBe(lost);
  expect(drawn % 2, "total D is even").toBe(0);
  expect(gdSum, "the GDs add up to 0").toBe(0);
  for (let i = 1; i < rows.length; i++) {
    const [above, below] = [rows[i - 1]!, rows[i]!];
    expect(Number(above[7])).toBeGreaterThanOrEqual(Number(below[7]));
    if (above[7] === below[7]) expect(Number(above[6])).toBeGreaterThanOrEqual(Number(below[6]));
  }
};
/** Back, Table, read the table, Back: Sam's way to the standings between two matches. */
const tableAfter = async (page: Page, club: string, matches: number): Promise<{ readonly rows: Row[]; readonly marked: string[] }> => {
  await openTable(page);
  const read = await readTable(page);
  expectRules(read.rows, matches);
  await backHome(page, club);
  return read;
};
/** Sam's row must be the sum of the score lines he saw (W, D, L, GD, Pts). */
const expectSamsRow = (rows: readonly Row[], club: string, lines: readonly string[]): void => {
  const mine = lines.map((line) => {
    const [, home, h, a] = SCORE.exec(line)!;
    return home === club ? [Number(h), Number(a)] : [Number(a), Number(h)];
  }) as [number, number][];
  const [w, d, l] = [mine.filter(([f, a]) => f > a).length, mine.filter(([f, a]) => f === a).length, mine.filter(([f, a]) => f < a).length];
  const gd = mine.reduce((sum, [f, a]) => sum + f - a, 0);
  const row = rows.find((r) => r[1] === club)!;
  expect(row.slice(2), `${club}'s row is the sum of its ${lines.length} score lines`).toEqual([String(lines.length), String(w), String(d), String(l), goalDifferenceText(gd), String(3 * w + d)]);
};

/** The club home after matchday 14 (ADR-0015, DISCUSS D1): no Play match, one End of season button in its slot, the other four buttons, all 44px or taller, no Season over, no sideways scroll. */
const expectEndOfSeasonOffer = async (page: Page, club: string, headingFocused = true): Promise<void> => {
  await expect(heading(page)).toHaveText(club);
  if (headingFocused) await expect(heading(page)).toBeFocused();
  await expect(button(page, "Play match"), "no button named Play match").toHaveCount(0);
  await expect(page.getByRole("button", { name: /play match/i }), "no button with a name like Play match").toHaveCount(0);
  const offer = button(page, "End of season");
  await expect(offer, "exactly one button named End of season").toHaveCount(1);
  await expect(offer).toBeVisible();
  await expect(page.getByText("Season over"), "the S-008 line is retired").toHaveCount(0);
  await expect(page.getByRole("heading")).toHaveCount(1);
  const buttons = page.getByRole("button");
  expect((await buttons.allInnerTexts()).map((text) => text.trim()), "six buttons: Squad, Tactics, Starting XI, End of season, Table, Inbox").toEqual(["Squad", "Tactics", "Starting XI", "End of season", "Table", "Inbox"]);
  for (const [index, each] of (await buttons.all()).entries()) expect((await each.boundingBox())?.height ?? 0, `club home button ${index}`).toBeGreaterThanOrEqual(44);
  expect(await page.evaluate(() => [...document.querySelectorAll(".club-actions > *")].map((node) => `${node.tagName}:${node.textContent?.trim()}`)), "the button sits in the Play match slot").toEqual([
    "BUTTON:Squad", "BUTTON:Tactics", "BUTTON:Starting XI", "BUTTON:End of season", "BUTTON:Table", "BUTTON:Inbox",
  ]);
  const box = (await offer.boundingBox())!;
  const viewportWidth = page.viewportSize()!.width;
  expect([box.x >= 0, box.x + box.width <= viewportWidth, box.height > 0], "the button sits inside the 390px phone screen").toEqual([true, true, true]);
  expect(await overflow(page), "no sideways scroll with the button in place of Play match").toBeLessThanOrEqual(0);
};

test.describe("@US-2 S-008 play the season to the end", () => {
  test("@walking_skeleton @kpi Sam taps Play match and Back 14 times (28 taps) at ?seed=31 and reads Matchday 1 to Matchday 14, the browser's 14 score lines being the reference season's; then Table shows every row at P 14 with Netherwold Borough third on Pts 23, and the club home offers End of season @contract-shape:bounded-change", async ({ page }) => {
    test.slow();
    const errors = watchErrors(page);
    const who = await whoIs(page, "?seed=31", 0);
    expect(who.club).toBe("Netherwold Borough");
    expect(new URL(page.url()).pathname, "precondition: production build served under /gaffer/").toBe("/gaffer/");
    await installTapCounter(page);
    const season = await playSeason(page, who, { from: 1, to: 14 });
    expect(await tapsSoFar(page), "a whole season is 28 taps").toBe(28);
    expect(season.map((m) => m.score), "the browser plays the reference season (Chromium equals Node)").toEqual(scoreLinesOf(REFERENCE_31, who.club));
    expect(season[1]!.score).toBe("Rushmoor Heath Albion 2–1 Netherwold Borough");
    expect(season[13]!.score).toBe("Tarnbeck Borough 2–1 Netherwold Borough");
    const others = season.map((m) => SCORE.exec(m.score)!).map(([, home, , , away]) => (home === who.club ? away : home));
    const rivals = who.clubs.filter((name) => name !== who.club).sort();
    expect(others.slice(0, 7).sort(), "matchdays 1 to 7: each other club once").toEqual(rivals);
    expect(others.slice(7).sort(), "matchdays 8 to 14: each other club once more").toEqual(rivals);
    const named = rivals.map((rival) => season.filter((m) => m.score.includes(rival)).map((m) => (m.score.startsWith(who.club) ? "first" : "second")).sort());
    for (const pair of named) expect(pair, "named first once and named second once").toEqual(["first", "second"]);

    await expectEndOfSeasonOffer(page, who.club);
    await openTable(page);
    const { rows, marked } = await readTable(page);
    expect(rows, "the reference final table, cell for cell").toEqual(finalRows(REFERENCE_31));
    expect(rows[2]).toEqual(["3", "Netherwold Borough", "14", "7", "2", "5", "+2", "23"]);
    expect(marked).toEqual(["Netherwold Borough"]);
    expectRules(rows, 14);
    expectSamsRow(rows, who.club, season.map((m) => m.score));
    expect(await overflow(page)).toBeLessThanOrEqual(0);
    await backHome(page, who.club);
    await expectEndOfSeasonOffer(page, who.club);
    expect(errors).toEqual([]);
  });

  test("@kpi After two matches at ?seed=31 the table is US-1 example 1, every row at P 2 and Netherwold Borough eighth on Pts 0 and GD -2; after Netherwold Borough 2–1 Oakhampton Rise Borough on matchday 3 it is sixth on Pts 3 @contract-shape:bounded-change", async ({ page }) => {
    const errors = watchErrors(page);
    const who = await whoIs(page, "?seed=31", 0);
    const two = await playSeason(page, who, { from: 1, to: 2 });
    expect(two.map((m) => m.score)).toEqual(["Netherwold Borough 1–2 Marlbrook Athletic", "Rushmoor Heath Albion 2–1 Netherwold Borough"]);
    const { rows, marked } = await tableAfter(page, who.club, 2);
    expect(rows.map(([, club, p, w, d, l, gd, pts]) => [club, Number(p), Number(w), Number(d), Number(l), gd, Number(pts)])).toEqual(
      TABLE_AFTER_TWO_31.map(([club, p, w, d, l, gd, pts]) => [club, p, w, d, l, goalDifferenceText(gd), pts]),
    );
    expect(rows[7]).toEqual(["8", "Netherwold Borough", "2", "0", "0", "2", "-2", "0"]);
    expect(marked).toEqual(["Netherwold Borough"]);
    expectSamsRow(rows, who.club, two.map((m) => m.score));
    const third = await playSeason(page, who, { from: 3, to: 3 });
    expect(third[0]!.score).toBe("Netherwold Borough 2–1 Oakhampton Rise Borough");
    const after = await tableAfter(page, who.club, 3);
    expect(after.rows[5]).toEqual(["6", "Netherwold Borough", "3", "1", "0", "2", "-1", "3"]);
    expect(errors).toEqual([]);
  });

  test("@example @boundary At ?seed=abc Oakhampton Rise Borough plays Harrowgate Lane United 0–1, then Oakhampton Rise Borough 2–2 Mossdale Wanderers, and ends its season Oakhampton Rise Borough 1–1 Ironbridge Fen Wanderers with Valebridge Town first on Pts 29 and itself second on 21; no ?seed= plays the same first two matches @contract-shape:bounded-change", async ({ page }) => {
    test.slow();
    const errors = watchErrors(page);
    const who = await whoIs(page, "?seed=abc", 7);
    expect(who.club).toBe("Oakhampton Rise Borough");
    const season = await playSeason(page, who, { from: 1, to: 14 });
    expect(season.map((m) => m.score)).toEqual(scoreLinesOf(REFERENCE_20260, who.club));
    expect([season[0]!.score, season[1]!.score, season[13]!.score]).toEqual([
      "Harrowgate Lane United 0–1 Oakhampton Rise Borough", "Oakhampton Rise Borough 2–2 Mossdale Wanderers", "Oakhampton Rise Borough 1–1 Ironbridge Fen Wanderers",
    ]);
    await expectEndOfSeasonOffer(page, who.club);
    await openTable(page);
    const { rows, marked } = await readTable(page);
    expect(rows).toEqual(finalRows(REFERENCE_20260));
    expect([rows[0]![1], rows[0]![7], rows[1]![1], rows[1]![7]]).toEqual(["Valebridge Town", "29", "Oakhampton Rise Borough", "21"]);
    expect(marked).toEqual(["Oakhampton Rise Borough"]);
    expectSamsRow(rows, who.club, season.map((m) => m.score));

    const other = await page.context().newPage();
    const otherWho = await whoIs(other, "", 7);
    const first = await playSeason(other, otherWho, { from: 1, to: 2 });
    expect(first.map((m) => m.score), "no ?seed= plays the same season as ?seed=abc").toEqual(season.slice(0, 2).map((m) => m.score));
    expect(first.map((m) => m.goals)).toEqual(season.slice(0, 2).map((m) => m.goals));
    expect(errors).toEqual([]);
  });

  test("@environment-probe @boundary Managing Marlbrook Athletic at ?seed=31 gives the same final table, his own row marked; on the End of season home Squad, Starting XI and Table still open and Back returns to the home still offering End of season, and End of season opens its screen and Back returns without re-opening any match @contract-shape:bounded-change", async ({ page }) => {
    test.slow();
    const who = await whoIs(page, "?seed=31", 7);
    expect(who.club).toBe("Marlbrook Athletic");
    const season = await playSeason(page, who, { from: 1, to: 14 });
    expect(season.map((m) => m.score)).toEqual(scoreLinesOf(REFERENCE_31, who.club));
    expect(season.map((m) => m.matchday)).toEqual(Array.from({ length: 14 }, (_, i) => i + 1));
    await expectEndOfSeasonOffer(page, who.club);

    await button(page, "End of season").click();
    await expect(heading(page)).toHaveText("End of season");
    await expect(heading(page)).toBeFocused();
    await expect(page.getByRole("heading")).toHaveCount(1);
    await expect(page.getByRole("heading", { name: /Matchday/ }), "an already played match cannot be re-opened").toHaveCount(0);
    await back(page).click();
    await expectEndOfSeasonOffer(page, who.club);

    await openTable(page);
    const { rows, marked } = await readTable(page);
    expect(rows).toEqual(finalRows(REFERENCE_31));
    expect(marked).toEqual(["Marlbrook Athletic"]);
    expectSamsRow(rows, who.club, season.map((m) => m.score));
    await backHome(page, who.club);
    await expectEndOfSeasonOffer(page, who.club);

    await button(page, "Squad").click();
    await expect(page.getByRole("list", { name: "Squad" }).getByRole("listitem")).toHaveCount(18);
    await backHome(page, who.club);
    await expectEndOfSeasonOffer(page, who.club);
    await button(page, "Starting XI").click();
    await expect(heading(page)).toHaveText("Starting XI");
    await backHome(page, who.club);
    await expectEndOfSeasonOffer(page, who.club);
    await expect(page.getByRole("heading", { name: /Matchday/ }), "an already played match cannot be re-opened").toHaveCount(0);
  });
});

test.describe("@US-1 S-008 a pick between two matches counts from the next match on", () => {
  test("@walking_skeleton Sam plays matchday 1, chooses 4-3-3 and picks Kestrel Northcott for Calder Redfern: the table reads exactly as before; Play match shows Matchday 2 against Rushmoor Heath Albion, named first, and every Netherwold Borough goal is one of the 11 now on his Starting XI, never the goalkeeper and never Calder Redfern @contract-shape:bounded-change", async ({ page }) => {
    const errors = watchErrors(page);
    const who = await whoIs(page, "?seed=31", 0);
    const [one] = await playSeason(page, who, { from: 1, to: 1 });
    expect(one!.score).toBe("Netherwold Borough 1–2 Marlbrook Athletic");
    const before = await tableAfter(page, who.club, 1);
    expect(before.rows[5]).toEqual(["6", "Netherwold Borough", "1", "0", "0", "1", "-1", "0"]);

    await button(page, "Tactics").click();
    await page.getByRole("radiogroup", { name: "Formation" }).getByText("4-3-3", { exact: true }).click();
    await back(page).click();
    await button(page, "Starting XI").click();
    await page.getByRole("list", { name: "Starting XI" }).getByRole("button", { name: "MF Calder Redfern 15", exact: true }).click();
    await expect(heading(page)).toHaveText("Choose MF");
    await page.getByRole("list", { name: "Players" }).getByRole("button", { name: "Kestrel Northcott 6", exact: true }).click();
    await expect(heading(page)).toHaveText("Starting XI");
    await back(page).click();
    await expect(heading(page)).toHaveText(who.club);
    const eleven = await readEleven(page);
    expect(eleven.map((p) => p.name)).toContain("Kestrel Northcott");
    expect(eleven.map((p) => p.name)).not.toContain("Calder Redfern");

    await openTable(page);
    expect((await readTable(page)).rows, "the table is unchanged cell for cell").toEqual(before.rows);
    await backHome(page, who.club);

    const second = await playAndRead(page, 2, { ...who, eleven });
    expect(second.score, "the schedule's matchday-2 opponent, named first").toMatch(/^Rushmoor Heath Albion \d–\d Netherwold Borough$/);
    for (const scorer of scorersFor(second.goals, who.club)) expect(scorer).not.toBe("Calder Redfern");
    await backHome(page, who.club);
    const after = await tableAfter(page, who.club, 2);
    expectSamsRow(after.rows, who.club, [one!.score, second.score]);
    await button(page, "Tactics").click();
    await expect(page.getByRole("radio", { name: "4-3-3", exact: true })).toBeChecked();
    expect(errors).toEqual([]);
  });

  test("@example After a pick of Kestrel Northcott for Dorian Dunmore Sam's goals on matchday 1 and on matchday 2 name only the 11 on his Starting XI, never the goalkeeper; the matchday-2 opponent differs and its scorers are in its Squad list @contract-shape:bounded-change", async ({ page, browser }) => {
    const who = await whoIs(page, "?seed=31", 0);
    await button(page, "Starting XI").click();
    await page.getByRole("list", { name: "Starting XI" }).getByRole("button", { name: "MF Dorian Dunmore 7", exact: true }).click();
    await expect(heading(page)).toHaveText("Choose MF");
    await page.getByRole("list", { name: "Players" }).getByRole("button", { name: "Kestrel Northcott 6", exact: true }).click();
    await expect(heading(page)).toHaveText("Starting XI");
    await back(page).click();
    const eleven = await readEleven(page);
    expect(eleven).toHaveLength(11);
    expect(eleven.map((p) => p.name)).toContain("Kestrel Northcott");
    expect(eleven.map((p) => p.name)).not.toContain("Dorian Dunmore");
    const withPick = { ...who, eleven };

    const [first, second] = await playSeason(page, withPick, { from: 1, to: 2 });
    for (const played of [first!, second!]) {
      for (const scorer of scorersFor(played.goals, who.club)) expect(eleven.map((p) => p.name), `${scorer} is one of the 11`).toContain(scorer);
    }
    const otherOf = (score: string): string => {
      const [, home, , , away] = SCORE.exec(score)!;
      return home === who.club ? away! : home!;
    };
    expect(otherOf(second!.score), "a new opponent on matchday 2").not.toBe(otherOf(first!.score));

    const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const rivalPage = await context.newPage();
    const rival = otherOf(second!.score);
    await openSeason(rivalPage, "?seed=31", who.clubs.indexOf(rival));
    await button(rivalPage, "Squad").click();
    const squad = (await rivalPage.getByRole("list", { name: "Squad" }).getByRole("listitem").allInnerTexts()).map(firstLine);
    for (const scorer of scorersFor(second!.goals, rival)) {
      expect(squad.some((line) => line.includes(scorer)), `${scorer} is in ${rival}'s Squad list`).toBe(true);
    }
    await context.close();
  });
});

test.describe("@US-1 S-008 the same seed plays the same season, and a reload starts over", () => {
  test("@boundary The same seed in a second fresh page gives the same three matches, Goals lists and tables after each; ?seed=abc and no seed give the same three matches and tables @contract-shape:bounded-change", async ({ page, browser }) => {
    const threeMatches = async (target: Page, query: string, clubIndex: number): Promise<readonly unknown[]> => {
      const who = await whoIs(target, query, clubIndex);
      const seen: unknown[] = [];
      for (let matchday = 1; matchday <= 3; matchday++) {
        const played = await playAndRead(target, matchday, who);
        await backHome(target, who.club);
        seen.push([played, (await tableAfter(target, who.club, matchday)).rows]);
      }
      return seen;
    };
    const fresh = async (): Promise<Page> => (await (await browser.newContext({ viewport: { width: 390, height: 844 } })).newPage());
    const first = await threeMatches(page, "?seed=31", 0);
    const second = await fresh();
    expect(await threeMatches(second, "?seed=31", 0)).toEqual(first);
    await second.context().close();
    const abc = await fresh();
    const none = await fresh();
    expect(await threeMatches(abc, "?seed=abc", 7)).toEqual(await threeMatches(none, "", 7));
    await abc.context().close();
    await none.context().close();
  });

  test("@error @boundary Reloading the page after two matches shows the title with Continue and New game; New game and the same club start at Matchday 1 with every row at P 0 (the saved game is kept, New game starts fresh) @contract-shape:bounded-change", async ({ page }) => {
    const errors = watchErrors(page);
    const who = await whoIs(page, "?seed=31", 0);
    await playSeason(page, who, { from: 1, to: 2 });
    await page.reload();
    await expect(page.getByRole("button", { name: "Continue", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "New game" })).toBeVisible();
    await page.getByRole("button", { name: "New game" }).click();
    await page.getByRole("list", { name: "Clubs" }).getByRole("button").nth(0).click();
    await expect(heading(page)).toHaveText(who.club);
    await openTable(page);
    const { rows } = await readTable(page);
    expect(rows.every((row) => row.slice(2).every((cell) => cell === "0"))).toBe(true);
    await backHome(page, who.club);
    const again = await playAndRead(page, 1, { ...who, eleven: await readEleven(page) });
    expect(again.score).toBe("Netherwold Borough 1–2 Marlbrook Athletic");
    expect(errors).toEqual([]);
  });
});

test.describe("@US-1 S-008 the S-006 and S-007 journeys, restated for a second Play match (ADR-0014 supersedes the re-show)", () => {
  test("@walking_skeleton No console error and no sideways scroll across the whole journey: club home, Table, Back, Play match, Back, Table, 4-3-3, Table, Play match (Matchday 2), Back @contract-shape:bounded-change", async ({ page }) => {
    const errors = watchErrors(page);
    const who = await whoIs(page, "?seed=31", 0);
    await openTable(page);
    expect((await readTable(page)).rows.every((row) => row.slice(2).every((cell) => cell === "0"))).toBe(true);
    await backHome(page, who.club);
    const [first] = await playSeason(page, who, { from: 1, to: 1 });
    expect(first!.score).toBe("Netherwold Borough 1–2 Marlbrook Athletic");
    await openTable(page);
    const golden = (await readTable(page)).rows;
    expectRules(golden, 1);
    await backHome(page, who.club);
    await button(page, "Tactics").click();
    await page.getByRole("radiogroup", { name: "Formation" }).getByText("4-3-3", { exact: true }).click();
    await back(page).click();
    await openTable(page);
    expect((await readTable(page)).rows, "choosing 4-3-3 changes nothing already played").toEqual(golden);
    await backHome(page, who.club);
    const eleven = await readEleven(page);
    const second = await playAndRead(page, 2, { ...who, eleven });
    expect(second.score, "a second Play match plays matchday 2, it does not re-show matchday 1").not.toBe(first!.score);
    await backHome(page, who.club);
    expect(await overflow(page)).toBeLessThanOrEqual(0);
    expect(errors).toEqual([]);
  });
});
