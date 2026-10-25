// @US-1 @US-2 (S-007 see the league table after my first match)
// CONTRACT_SHAPE: bounded-change
// Outcome anchor: DISCUSS Elevator Pitch (feature-delta.md US-1, US-2): on Netherwold Borough's home Sam taps "Table" and sees the screen
// title "League table" and a table "League table" with Pos, Club, P, W, D, L, GD, Pts, Fennimore Town first and everything at 0, his row
// highlighted; after "Play match", "Back", "Table" it reads 1 Tarnbeck Borough +4 3 ... 6 Netherwold Borough -1 0 (the golden of US-2
// example 1, derived from ADR-0011 values and written out below before the table exists). Covers only what tests/protected/S-007 does
// not: the cross-engine golden table, focus on each heading the instant it opens, role counts, text equality, 44px, the highlighted row
// (aria-current), the click-everything check that only "Back" navigates, "what is played stays played" with a real pick, Matchday 2 on a
// second "Play match", no sideways scroll and no console error.
// Environment precondition: runs against local-preview (ci:serve, http://localhost:4173/gaffer/) or, via BASE_URL, the deployed Pages site;
// both serve the production build under /gaffer/. Not meant for local-dev (vite dev, :5173): waived (as S-003..S-006).
// Environment probes (ADR-0012/0013 Earned Trust): (1) the browser reproduces the Node golden table; (2) native table roles survive the
// CSS (9 rows, 8 columnheaders, 8 rowheaders, 56 cells); (3) the table fits 390px with the longest names; (4) innerText equals textContent;
// (5) exactly one aria-current row, the managed club.
// Destination: tests/e2e/S-007-table.spec.ts (DELIVER step 04).
import { expect, test, type Locator, type Page } from "@playwright/test";

// Viewport and device: the Pixel 7 profile at 390px comes from playwright.config.ts (no per-spec override).

type Row = readonly [pos: string, club: string, p: string, w: string, d: string, l: string, gd: string, pts: string];

const COLUMNS = ["Pos", "Club", "P", "W", "D", "L", "GD", "Pts"] as const;
// Expected values written out from DISCUSS US-1 example 1 and US-2 examples 1-2, independent of the code under test.
const ZERO_31: readonly Row[] = [
  "Fennimore Town", "Juniper Hollow United", "Marlbrook Athletic", "Netherwold Borough",
  "Oakhampton Rise Borough", "Rushmoor Heath Albion", "Tarnbeck Borough", "Valebridge Albion",
].map((club, i): Row => [String(i + 1), club, "0", "0", "0", "0", "0", "0"]);
const GOLDEN_31: readonly Row[] = [
  ["1", "Tarnbeck Borough", "1", "1", "0", "0", "+4", "3"],
  ["2", "Oakhampton Rise Borough", "1", "1", "0", "0", "+2", "3"],
  ["3", "Marlbrook Athletic", "1", "1", "0", "0", "+1", "3"],
  ["4", "Fennimore Town", "1", "0", "1", "0", "0", "1"],
  ["5", "Valebridge Albion", "1", "0", "1", "0", "0", "1"],
  ["6", "Netherwold Borough", "1", "0", "0", "1", "-1", "0"],
  ["7", "Juniper Hollow United", "1", "0", "0", "1", "-2", "0"],
  ["8", "Rushmoor Heath Albion", "1", "0", "0", "1", "-4", "0"],
];
const SCORE_31 = "Netherwold Borough 1–2 Marlbrook Athletic";
const GOALS_31 = ["17' Rurik Fairbourne (Marlbrook Athletic)", "22' Calder Redfern (Netherwold Borough)", "77' Rurik Fairbourne (Marlbrook Athletic)"];
const SCORE_ABC = "Harrowgate Lane United 0–1 Oakhampton Rise Borough";

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

const openClubHome = async (page: Page, query: string, clubIndex: number): Promise<string> => {
  await page.goto(`./${query}`);
  await page.getByRole("button", { name: "New game" }).click();
  const club = page.getByRole("list", { name: "Clubs" }).getByRole("button").nth(clubIndex);
  const name = ((await club.innerText()).split("\n")[0] ?? "").trim();
  await club.click();
  await expect(heading(page)).toContainText(name);
  return name;
};
/** The eight names of the "Clubs" list of a fresh page (read before picking a club). */
const clubNames = async (page: Page, query: string): Promise<string[]> => {
  await page.goto(`./${query}`);
  await page.getByRole("button", { name: "New game" }).click();
  return (await page.getByRole("list", { name: "Clubs" }).getByRole("button").allInnerTexts()).map((text) => (text.split("\n")[0] ?? "").trim());
};

/** What Sam reads the instant the heading has focus: no waiting between the tap and this snapshot. */
interface Arrival {
  readonly focusedTag: string;
  readonly focusedText: string;
  readonly headings: number;
  readonly tables: number;
  readonly bodyRowsVisible: number;
  readonly buttons: readonly string[];
}
const arrivalNow = (page: Page): Promise<Arrival> =>
  page.evaluate((): Arrival => {
    const active = document.activeElement;
    const rows = [...document.querySelectorAll<HTMLElement>("tbody tr")];
    return {
      focusedTag: active?.tagName ?? "",
      focusedText: active?.textContent ?? "",
      headings: document.querySelectorAll("h1, h2, h3, h4, h5, h6, [role='heading']").length,
      tables: document.querySelectorAll("table, [role='table']").length,
      bodyRowsVisible: rows.filter((row) => row.getBoundingClientRect().height > 0).length,
      buttons: [...document.querySelectorAll("button")].map((node) => node.textContent ?? ""),
    };
  });

/** Opens the table from the club home and asserts the arrival snapshot (D4, K1: one tap, all 8 rows already there, h1 focused). */
const openTable = async (page: Page): Promise<void> => {
  await button(page, "Table").click();
  const now = await arrivalNow(page);
  expect(now.focusedTag, "focus is on the heading the moment the table opens").toBe("H1");
  expect(now.focusedText).toBe("League table");
  expect(now.headings, "one heading on the screen").toBe(1);
  expect(now.tables, "one table on the screen").toBe(1);
  expect(now.bodyRowsVisible, "all 8 rows visible on arrival").toBe(8);
  expect(now.buttons, "Back is the only button").toEqual(["Back"]);
};

/** Reads the table by role: the header names and the eight body rows (Pos cell, Club row header, then P W D L GD Pts cells). */
const readTable = async (page: Page): Promise<{ readonly headers: string[]; readonly rows: Row[]; readonly marked: string[] }> => {
  const table = leagueTable(page);
  await expect(table).toBeVisible();
  const headers = (await table.getByRole("columnheader").allInnerTexts()).map((text) => text.trim());
  const rowLocators = await table.getByRole("row").all();
  expect(rowLocators, "1 header row and 8 body rows").toHaveLength(9);
  const rows: Row[] = [];
  const marked: string[] = [];
  for (const row of rowLocators.slice(1)) {
    const cells = (await row.getByRole("cell").allInnerTexts()).map((text) => text.trim());
    const club = ((await row.getByRole("rowheader").innerText()) ?? "").trim();
    expect(cells, `7 cells in the row of ${club}`).toHaveLength(7);
    const [pos, p, w, d, l, gd, pts] = cells as [string, string, string, string, string, string, string];
    rows.push([pos, club, p, w, d, l, gd, pts]);
    if ((await row.getAttribute("aria-current")) === "true") marked.push(club);
  }
  return { headers, rows, marked };
};
const expectStructure = async (page: Page): Promise<void> => {
  const table = leagueTable(page);
  await expect(table).toHaveCount(1);
  await expect(table.getByRole("row")).toHaveCount(9);
  await expect(table.getByRole("columnheader")).toHaveCount(8);
  await expect(table.getByRole("rowheader")).toHaveCount(8);
  await expect(table.getByRole("cell")).toHaveCount(56);
  for (const name of COLUMNS) await expect(table.getByRole("columnheader", { name, exact: true }), `column ${name}`).toHaveCount(1);
  expect(await table.getByRole("columnheader").allInnerTexts(), "column headers in order").toEqual([...COLUMNS]);
  const texts = await page.evaluate(() =>
    [...document.querySelectorAll<HTMLElement>("table th, table td")].map((node) => ({ text: node.textContent ?? "", inner: node.innerText })),
  );
  expect(texts).toHaveLength(8 + 8 + 56);
  for (const { text, inner } of texts) expect(inner, `innerText equals textContent for "${text}"`).toBe(text);
};
/** The roles Chromium itself exposes (CDP accessibility tree, not Playwright's own role engine, which ignores CSS `display`). */
const browserRoles = async (page: Page): Promise<Record<string, number>> => {
  const session = await page.context().newCDPSession(page);
  const { nodes } = await session.send("Accessibility.getFullAXTree");
  await session.detach();
  const counts: Record<string, number> = {};
  for (const node of nodes) {
    const role = String(node.role?.value ?? "");
    if (!node.ignored && ["table", "row", "columnheader", "rowheader", "cell"].includes(role)) counts[role] = (counts[role] ?? 0) + 1;
  }
  return counts;
};
/** The row rules and the order every table must obey whatever the seed (D4, D14). */
const expectRules = (rows: readonly Row[]): void => {
  expect(rows.map((row) => row[0])).toEqual(["1", "2", "3", "4", "5", "6", "7", "8"]);
  for (const [, club, p, w, d, l, gd, pts] of rows) {
    for (const value of [p, w, d, l, pts]) expect(value, `${club} whole numbers`).toMatch(/^\d+$/);
    expect(gd, `${club} goal difference text`).toMatch(/^(\+[1-9]\d*|0|-[1-9]\d*)$/);
    expect(Number(w) + Number(d) + Number(l), `${club} W+D+L=P`).toBe(Number(p));
    expect(Number(pts), `${club} Pts=3W+D`).toBe(3 * Number(w) + Number(d));
  }
  for (let i = 1; i < rows.length; i++) {
    const [above, below] = [rows[i - 1]!, rows[i]!];
    expect(Number(above[7])).toBeGreaterThanOrEqual(Number(below[7]));
    if (above[7] === below[7]) expect(Number(above[6])).toBeGreaterThanOrEqual(Number(below[6]));
  }
};
const parseScore = (line: string): { home: string; away: string; homeGoals: number; awayGoals: number } => {
  const [, home, h, a, away] = /^(.+) (\d)–(\d) (.+)$/.exec(line)!;
  return { home: home!, away: away!, homeGoals: Number(h), awayGoals: Number(a) };
};
const readMatch = async (page: Page, matchday = 1): Promise<{ score: string; goals: string[] }> => {
  await expect(heading(page)).toHaveText(`Matchday ${matchday}`);
  const score = (await page.locator("section p").filter({ hasText: /–/ }).first().innerText()).trim();
  const goals = (await page.getByRole("list", { name: "Goals", exact: true }).getByRole("listitem").allInnerTexts()).map((text) => text.trim());
  return { score, goals };
};
const playBackTable = async (page: Page): Promise<string> => {
  await button(page, "Play match").click();
  const { score } = await readMatch(page);
  await back(page).click();
  await openTable(page);
  return score;
};

test.describe("@US-1 S-007 see where we stand before kick-off", () => {
  test("@walking_skeleton @kpi Sam taps Table (1 tap) on Netherwold Borough's home, sees League table focused with all 8 rows at zero in A to Z order and his row marked, taps Back (1 tap) to the club home @contract-shape:bounded-change", async ({ page }) => {
    const errors = watchErrors(page);
    const club = await openClubHome(page, "?seed=31", 0);
    expect(club).toBe("Netherwold Borough");
    expect(new URL(page.url()).pathname, "precondition: production build served under /gaffer/").toBe("/gaffer/");
    expect((await button(page, "Table").boundingBox())?.height ?? 0, "Table").toBeGreaterThanOrEqual(44);
    await installTapCounter(page);
    await openTable(page);
    expect(await tapsSoFar(page), "one tap from the club home to the table").toBe(1);
    await expectStructure(page);
    const { headers, rows, marked } = await readTable(page);
    expect(headers).toEqual([...COLUMNS]);
    expect(rows).toEqual(ZERO_31);
    expect(marked, "exactly one row is marked, the managed club").toEqual(["Netherwold Borough"]);
    expectRules(rows);
    expect((await back(page).boundingBox())?.height ?? 0, "Back").toBeGreaterThanOrEqual(44);
    await back(page).click();
    expect(await tapsSoFar(page), "one tap back").toBe(2);
    await expect(heading(page)).toHaveText(club);
    await expect(heading(page)).toBeFocused();
    expect(await overflow(page)).toBeLessThanOrEqual(0);
    expect(errors).toEqual([]);
  });

  test("Environment probe: the browser's own accessibility tree holds 1 table, 9 rows, 8 column headers, 8 row headers and 56 cells (no CSS display override on a table part) @environment-probe @boundary @contract-shape:bounded-change", async ({ page }) => {
    await openClubHome(page, "?seed=31", 0);
    await openTable(page);
    expect(await browserRoles(page)).toEqual({ table: 1, row: 9, columnheader: 8, rowheader: 8, cell: 56 });
    await back(page).click();
    await playBackTable(page);
    expect(await browserRoles(page), "and after matchday 1").toEqual({ table: 1, row: 9, columnheader: 8, rowheader: 8, cell: 56 });
  });

  test("The club home has five buttons in the order Squad, Tactics, Starting XI, Play match, Table, all 44px or taller @contract-shape:bounded-change", async ({ page }) => {
    await openClubHome(page, "?seed=31", 0);
    const buttons = page.getByRole("button");
    expect((await buttons.allInnerTexts()).map((text) => text.trim())).toEqual(["Squad", "Tactics", "Starting XI", "Play match", "Table"]);
    for (const [index, each] of (await buttons.all()).entries()) expect((await each.boundingBox())?.height ?? 0, `club home button ${index}`).toBeGreaterThanOrEqual(44);
  });

  for (const [query, index] of [["?seed=31", 0], ["?seed=abc", 7]] as const) {
    test(`The table holds exactly the league's clubs, each once, in A to Z order (${query}, club ${index}) @example @boundary @contract-shape:bounded-change`, async ({ page }) => {
      const names = await clubNames(page, query);
      expect(names).toHaveLength(8);
      await page.getByRole("list", { name: "Clubs" }).getByRole("button").nth(index).click();
      await openTable(page);
      const { rows } = await readTable(page);
      expect(rows.map((row) => row[1]).sort()).toEqual([...names].sort());
      expect(rows.map((row) => row[1])).toEqual([...names].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0)));
      for (const row of rows) expect(row.slice(2)).toEqual(["0", "0", "0", "0", "0", "0"]);
    });
  }

  test("Back from the table returns to the club home with its heading focused, and Tactics still has 4-3-3 checked @boundary @contract-shape:bounded-change", async ({ page }) => {
    const club = await openClubHome(page, "?seed=31", 0);
    await button(page, "Tactics").click();
    await page.getByRole("radiogroup", { name: "Formation" }).getByText("4-3-3", { exact: true }).click();
    await back(page).click();
    await openTable(page);
    await back(page).click();
    await expect(heading(page)).toHaveText(club);
    await expect(heading(page)).toBeFocused();
    await button(page, "Tactics").click();
    await expect(page.getByRole("radio", { name: "4-3-3", exact: true })).toBeChecked();
  });

  test("Sam clicks everything on the table screen (heading, headers, rows, cells) and nothing navigates; only Back leaves, and the screen holds no other control @error @boundary @contract-shape:bounded-change", async ({ page }) => {
    const club = await openClubHome(page, "?seed=31", 0);
    await openTable(page);
    const table = leagueTable(page);
    const targets = [heading(page), ...(await table.getByRole("columnheader").all()), ...(await table.getByRole("row").all()), ...(await table.getByRole("rowheader").all()), ...(await table.getByRole("cell").all()), table];
    for (const target of targets) {
      await target.click();
      await expect(heading(page)).toHaveText("League table");
      await expect(table).toBeVisible();
    }
    await expect(page.getByRole("button")).toHaveCount(1);
    for (const role of ["link", "textbox", "combobox", "checkbox", "radio", "listbox", "slider"] as const) await expect(page.getByRole(role), role).toHaveCount(0);
    await expectStructure(page);
    await back(page).click();
    await expect(heading(page)).toHaveText(club);
  });
});

test.describe("@US-2 S-007 see the table after matchday 1", () => {
  test("@walking_skeleton @kpi Sam plays at ?seed=31, taps Back and Table (2 taps from the match) and reads the golden table, his row Netherwold Borough P 1 L 1 GD -1 Pts 0 marked, agreeing with the score line he saw @contract-shape:bounded-change", async ({ page }) => {
    const errors = watchErrors(page);
    await openClubHome(page, "?seed=31", 0);
    await button(page, "Play match").click();
    const match = await readMatch(page);
    expect(match.score).toBe(SCORE_31);
    expect(match.goals).toEqual(GOALS_31);
    await installTapCounter(page);
    await back(page).click();
    await openTable(page);
    expect(await tapsSoFar(page), "two taps from the match screen to the table").toBe(2);
    await expectStructure(page);
    const { rows, marked } = await readTable(page);
    expect(rows, "the seed-31 golden table, cell for cell (Chromium equals Node)").toEqual(GOLDEN_31);
    expect(marked).toEqual(["Netherwold Borough"]);
    expectRules(rows);
    const { home, away, homeGoals, awayGoals } = parseScore(match.score);
    const mine = rows.find((row) => row[1] === home)!;
    const theirs = rows.find((row) => row[1] === away)!;
    expect([mine[3], mine[4], mine[5]]).toEqual([homeGoals > awayGoals ? "1" : "0", homeGoals === awayGoals ? "1" : "0", homeGoals < awayGoals ? "1" : "0"]);
    expect([theirs[3], theirs[4], theirs[5]]).toEqual([mine[5], mine[4], mine[3]]);
    expect(Number(theirs[6]) + Number(mine[6])).toBe(0);
    expect(rows.every((row) => row[2] === "1")).toBe(true);
    expect(await overflow(page)).toBeLessThanOrEqual(0);
    expect(errors).toEqual([]);
  });

  test("?seed=abc and Oakhampton Rise Borough: the match reads Harrowgate Lane United 0–1 Oakhampton Rise Borough, so Oakhampton Rise Borough is P 1 W 1 GD +1 Pts 3 and Harrowgate Lane United P 1 L 1 GD -1 Pts 0; the table is the same as with no seed @example @boundary @contract-shape:bounded-change", async ({ page }) => {
    const club = await openClubHome(page, "?seed=abc", 7);
    expect(club).toBe("Oakhampton Rise Borough");
    await button(page, "Play match").click();
    expect((await readMatch(page)).score).toBe(SCORE_ABC);
    await back(page).click();
    await openTable(page);
    const abc = await readTable(page);
    const oak = abc.rows.find((row) => row[1] === "Oakhampton Rise Borough")!;
    const harrow = abc.rows.find((row) => row[1] === "Harrowgate Lane United")!;
    expect(oak.slice(2)).toEqual(["1", "1", "0", "0", "+1", "3"]);
    expect(harrow.slice(2)).toEqual(["1", "0", "0", "1", "-1", "0"]);
    expect(abc.marked).toEqual(["Oakhampton Rise Borough"]);
    expectRules(abc.rows);

    const other = await page.context().newPage();
    await openClubHome(other, "", 7);
    await playBackTable(other);
    expect((await readTable(other)).rows, "no ?seed= gives the same table as ?seed=abc").toEqual(abc.rows);
  });

  test("The same seed in a second fresh page gives the same table cell for cell @boundary @contract-shape:bounded-change", async ({ page }) => {
    await openClubHome(page, "?seed=31", 0);
    await playBackTable(page);
    const first = (await readTable(page)).rows;
    const second = await page.context().newPage();
    await openClubHome(second, "?seed=31", 0);
    await playBackTable(second);
    expect((await readTable(second)).rows).toEqual(first);
    expect(first).toEqual(GOLDEN_31);
  });

  test("Managing Marlbrook Athletic gives the same table with his own row marked @boundary @contract-shape:bounded-change", async ({ page }) => {
    const club = await openClubHome(page, "?seed=31", 7);
    expect(club).toBe("Marlbrook Athletic");
    await playBackTable(page);
    const { rows, marked } = await readTable(page);
    expect(rows).toEqual(GOLDEN_31);
    expect(marked).toEqual(["Marlbrook Athletic"]);
  });

  test("@walking_skeleton What is played stays played: after 4-3-3, Kestrel Northcott for Calder Redfern and a visit to Squad the table reads exactly as before, and Play match shows Matchday 2 @contract-shape:bounded-change", async ({ page }) => {
    const errors = watchErrors(page);
    const club = await openClubHome(page, "?seed=31", 0);
    await playBackTable(page);
    const before = (await readTable(page)).rows;
    expect(before).toEqual(GOLDEN_31);
    await back(page).click();

    await button(page, "Tactics").click();
    await page.getByRole("radiogroup", { name: "Formation" }).getByText("4-3-3", { exact: true }).click();
    await back(page).click();
    await button(page, "Starting XI").click();
    await page.getByRole("list", { name: "Starting XI" }).getByRole("button", { name: "MF Calder Redfern 15", exact: true }).click();
    await expect(heading(page)).toHaveText("Choose MF");
    await page.getByRole("list", { name: "Players" }).getByRole("button", { name: "Kestrel Northcott 6", exact: true }).click();
    await expect(heading(page)).toHaveText("Starting XI");
    await expect(page.getByRole("list", { name: "Starting XI" }).getByRole("button", { name: "MF Kestrel Northcott 6", exact: true })).toHaveCount(1);
    await back(page).click();
    await button(page, "Squad").click();
    await expect(page.getByRole("list", { name: "Squad" }).getByRole("listitem")).toHaveCount(18);
    await back(page).click();
    await expect(heading(page)).toHaveText(club);

    await openTable(page);
    const after = await readTable(page);
    expect(after.rows, "the table is unchanged cell for cell").toEqual(before);
    expect(after.rows.find((row) => row[1] === "Netherwold Borough")!.slice(2)).toEqual(["1", "0", "0", "1", "-1", "0"]);
    await back(page).click();

    await button(page, "Play match").click();
    const again = await readMatch(page, 2);
    expect(again.score, "matchday 2: Rushmoor Heath Albion named first, Netherwold Borough second").toMatch(/^Rushmoor Heath Albion \d–\d Netherwold Borough$/);
    expect(again.score, "and not the matchday-1 score line").not.toBe(SCORE_31);
    for (const goal of again.goals.filter((text) => text.endsWith("(Netherwold Borough)"))) {
      expect(goal, "his scorers come from the eleven he picked").not.toContain("Calder Redfern");
    }
    await back(page).click();
    await expect(heading(page)).toHaveText(club);
    await expect(heading(page)).toBeFocused();
    expect(errors).toEqual([]);
  });

  test("The table keeps its place after Squad, Tactics and Starting XI are visited without any change @boundary @contract-shape:bounded-change", async ({ page }) => {
    await openClubHome(page, "?seed=31", 0);
    await playBackTable(page);
    await back(page).click();
    for (const name of ["Squad", "Tactics", "Starting XI"]) {
      await button(page, name).click();
      await back(page).click();
    }
    await openTable(page);
    expect((await readTable(page)).rows).toEqual(GOLDEN_31);
  });
});

test.describe("@US-1 @US-2 S-007 the table on a phone", () => {
  for (const [query, index] of [["?seed=31", 0], ["?seed=abc", 7]] as const) {
    test(`No sideways scroll on the club home or the table, before and after matchday 1, with the longest names (${query}) @boundary @contract-shape:bounded-change`, async ({ page }) => {
      await openClubHome(page, query, index);
      expect(await overflow(page)).toBeLessThanOrEqual(0);
      const fits = async (): Promise<void> => {
        expect(await overflow(page), "document").toBeLessThanOrEqual(0);
        const widths = await leagueTable(page).evaluate((node) => ({ scroll: node.scrollWidth, client: node.clientWidth }));
        expect(widths.scroll, "table scrollWidth").toBeLessThanOrEqual(widths.client);
      };
      await openTable(page);
      await fits();
      await back(page).click();
      await playBackTable(page);
      await fits();
      expect((await leagueTable(page).getByRole("rowheader").allInnerTexts()).map((text) => text.trim()).sort()).toHaveLength(8);
    });
  }

  test("@walking_skeleton No console error and no sideways scroll across the whole journey: club home, Table, Back, Play match, Back, Table, 4-3-3, Table, Play match, Back @contract-shape:bounded-change", async ({ page }) => {
    const errors = watchErrors(page);
    const club = await openClubHome(page, "?seed=31", 0);
    await openTable(page);
    expect((await readTable(page)).rows).toEqual(ZERO_31);
    await back(page).click();
    await expect(heading(page)).toHaveText(club);
    const score = await playBackTable(page);
    expect(score).toBe(SCORE_31);
    expect(await overflow(page)).toBeLessThanOrEqual(0);
    await back(page).click();
    await button(page, "Tactics").click();
    await page.getByRole("radiogroup", { name: "Formation" }).getByText("4-3-3", { exact: true }).click();
    await back(page).click();
    await openTable(page);
    expect((await readTable(page)).rows).toEqual(GOLDEN_31);
    await back(page).click();
    await button(page, "Play match").click();
    expect((await readMatch(page, 2)).score, "matchday 2's score line, not matchday 1's").not.toBe(SCORE_31);
    await back(page).click();
    await expect(heading(page)).toHaveText(club);
    await expect(heading(page)).toBeFocused();
    expect(await overflow(page)).toBeLessThanOrEqual(0);
    expect(errors).toEqual([]);
  });
});
