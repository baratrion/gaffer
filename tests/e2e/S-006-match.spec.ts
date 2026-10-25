// @US-1 @US-2 (S-006 play my first match)
// CONTRACT_SHAPE: bounded-change
// Outcome anchor: DISCUSS Elevator Pitch (feature-delta.md US-1, US-2): on Netherwold Borough's home Sam taps "Play match" and sees the
// heading "Matchday 1", the score line "Netherwold Borough 1–2 Marlbrook Athletic" and the list "Goals" with "17' Rurik Fairbourne
// (Marlbrook Athletic)", "22' Calder Redfern (Netherwold Borough)", "77' Rurik Fairbourne (Marlbrook Athletic)" (the expected golden of
// ADR-0011, fixed by DESIGN before the model existed). Covers only what tests/protected/S-006 does not: the cross-engine golden, focus on
// each heading, textContent = innerText, 44px, a pick then "Play match" again, the empty list, apostrophe and hyphen names, no console error.
// Environment precondition: runs against local-preview (ci:serve, http://localhost:4173/gaffer/) or, via BASE_URL, the deployed Pages site;
// both serve the production build under /gaffer/. Not meant for local-dev (vite dev, :5173): waived (as S-003..S-005).
// Environment probes (ADR-0011 Earned Trust): (1) the browser reproduces the Node golden; (2) inline flow: textContent equals innerText;
// (3) the empty "Goals" list at ?seed=8 (club index 3 or 4) is visible and named exactly.
// Destination: tests/e2e/S-006-match.spec.ts (DELIVER step 04).
import { expect, test, type Locator, type Page } from "@playwright/test";

// Viewport and device: the Pixel 7 profile at 390px comes from playwright.config.ts (no per-spec override).

// Expected values written out from ADR-0011 "Expected golden matches" and the DISCUSS rows, independent of the code under test.
const GOLDEN_31 = {
  score: "Netherwold Borough 1–2 Marlbrook Athletic",
  goals: ["17' Rurik Fairbourne (Marlbrook Athletic)", "22' Calder Redfern (Netherwold Borough)", "77' Rurik Fairbourne (Marlbrook Athletic)"],
} as const;
const GOLDEN_ABC = { score: "Harrowgate Lane United 0–1 Oakhampton Rise Borough", goals: ["65' Joren Northcott (Oakhampton Rise Borough)"] } as const;

const heading = (page: Page): Locator => page.getByRole("heading", { level: 1 });
const button = (page: Page, name: string): Locator => page.getByRole("button", { name, exact: true });
const back = (page: Page): Locator => button(page, "Back");
const goalsList = (page: Page): Locator => page.getByRole("list", { name: "Goals", exact: true });
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

/** What Sam reads the instant the heading has focus: no waiting between the tap and this snapshot (D13). */
interface Reading {
  readonly focusedTag: string;
  readonly focusedText: string;
  readonly headings: number;
  readonly scoreLines: readonly { tag: string; text: string; inner: string; visible: boolean }[];
  readonly enDashElements: number;
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
    const box = list?.getBoundingClientRect();
    const active = document.activeElement;
    return {
      focusedTag: active?.tagName ?? "",
      focusedText: active?.textContent ?? "",
      headings: document.querySelectorAll("h1, h2, h3, h4, h5, h6, [role='heading']").length,
      scoreLines: deepest.map((node) => ({ tag: node.tagName, text: node.textContent ?? "", inner: node.innerText, visible: node.getBoundingClientRect().height > 0 })),
      enDashElements: all.filter((node) => [...node.childNodes].some((child) => child.nodeType === 3 && (child.textContent ?? "").includes("–"))).length,
      items: [...(list?.querySelectorAll<HTMLElement>("li") ?? [])].map((node) => ({ text: node.textContent ?? "", inner: node.innerText })),
      goalsListVisible: labelled?.textContent === "Goals" && (box?.height ?? 0) > 0,
    };
  });

const ITEM = /^(\d{1,2})' (.+) \((.+)\)$/;

/** Taps "Play match" and asserts the whole screen as Sam reads it right away: one heading, one score line, the list "Goals". */
const playAndRead = async (page: Page, matchday = 1): Promise<{ readonly score: string; readonly goals: readonly string[]; readonly reading: Reading }> => {
  await button(page, "Play match").click();
  const reading = await readNow(page);
  expect(reading.focusedTag, "focus is on the heading the moment the match opens").toBe("H1");
  expect(reading.focusedText).toBe(`Matchday ${matchday}`);
  expect(reading.headings, "one heading on the screen").toBe(1);
  expect(reading.scoreLines, "exactly one piece of text reads as a score line").toHaveLength(1);
  const line = reading.scoreLines[0]!;
  expect(line.tag, "a paragraph, not a heading").toBe("P");
  expect(line.visible, "score line visible on arrival").toBe(true);
  expect(line.inner, "innerText equals textContent for the score line").toBe(line.text);
  expect(reading.enDashElements, "the en dash is only in the score line").toBe(1);
  expect(reading.goalsListVisible, "list Goals with its visible label, on arrival").toBe(true);
  for (const item of reading.items) {
    expect(item.inner, "innerText equals textContent for a goal item").toBe(item.text);
    expect(item.text).toMatch(ITEM);
    const minute = Number(ITEM.exec(item.text)![1]);
    expect(minute).toBeGreaterThanOrEqual(1);
    expect(minute).toBeLessThanOrEqual(90);
  }
  const minutes = reading.items.map((item) => Number(ITEM.exec(item.text)![1]));
  expect(minutes, "minutes never decrease").toEqual([...minutes].sort((a, b) => a - b));
  const [, homeGoals, awayGoals] = /^.+ (\d)–(\d) .+$/.exec(line.text)!;
  expect(reading.items, "one item per goal").toHaveLength(Number(homeGoals) + Number(awayGoals));
  return { score: line.text, goals: reading.items.map((item) => item.text), reading };
};

const names = async (list: Locator): Promise<string[]> => (await list.getByRole("listitem").allInnerTexts()).map((text) => (text.split("\n")[0] ?? "").trim());

test.describe("@US-1 @US-2 S-006 send my team out and see the result", () => {
  test("@walking_skeleton @kpi Sam taps Play match (1 tap), sees Matchday 1 with the golden score and goals already there and focus on its heading, taps Back (1 tap) to the club home @contract-shape:bounded-change", async ({ page }) => {
    const errors = watchErrors(page);
    const club = await openClubHome(page, "?seed=31", 0);
    expect(club).toBe("Netherwold Borough");
    expect(new URL(page.url()).pathname, "precondition: production build served under /gaffer/").toBe("/gaffer/");
    await installTapCounter(page);
    expect((await button(page, "Play match").boundingBox())?.height ?? 0, "Play match").toBeGreaterThanOrEqual(44);

    const { score, goals } = await playAndRead(page);
    expect(await tapsSoFar(page), "club home to the result is 1 tap").toBe(1);
    // Cross-engine probe (ADR-0011 Earned Trust 1): the browser computes the very match the Node test pins.
    expect(score).toBe(GOLDEN_31.score);
    expect(goals).toEqual([...GOLDEN_31.goals]);
    await expect(heading(page)).toHaveText("Matchday 1");
    await expect(goalsList(page).getByRole("listitem")).toHaveCount(3);
    expect(await overflow(page), "no sideways scroll on the match screen").toBeLessThanOrEqual(0);
    expect((await back(page).boundingBox())?.height ?? 0, "Back").toBeGreaterThanOrEqual(44);
    await expect(page.getByRole("button", { name: "Back" })).toHaveCount(1);

    await back(page).click();
    expect(await tapsSoFar(page), "back home is 1 more tap").toBe(2);
    await expect(page.getByRole("heading")).toHaveCount(1);
    await expect(heading(page)).toHaveText(club);
    await expect(heading(page)).toBeFocused();
    await expect(goalsList(page)).toHaveCount(0);
    for (const name of ["Squad", "Tactics", "Starting XI", "Play match"]) await expect(button(page, name)).toBeVisible();
    expect(errors).toEqual([]);
  });

  test("Play match is the fourth of five club home buttons, after Squad, Tactics and Starting XI and before Table, and all five are 44px or taller @contract-shape:bounded-change", async ({ page }) => {
    await openClubHome(page, "?seed=31", 0);
    const buttons = page.getByRole("button");
    expect((await buttons.allInnerTexts()).map((text) => text.trim())).toEqual(["Squad", "Tactics", "Starting XI", "Play match", "Table"]);
    for (const [index, item] of (await buttons.all()).entries()) expect((await item.boundingBox())?.height ?? 0, `club home button ${index}`).toBeGreaterThanOrEqual(44);
    expect(await overflow(page), "no sideways scroll on the club home").toBeLessThanOrEqual(0);
  });

  test("The default seed (?seed=abc, 8th club) reads Harrowgate Lane United 0–1 Oakhampton Rise Borough with 65' Joren Northcott, the same as with no seed @example @contract-shape:bounded-change", async ({ page }) => {
    for (const query of ["?seed=abc", ""]) {
      const club = await openClubHome(page, query, 7);
      expect(club).toBe("Oakhampton Rise Borough");
      const { score, goals } = await playAndRead(page);
      expect(score).toBe(GOLDEN_ABC.score);
      expect(goals).toEqual([...GOLDEN_ABC.goals]);
    }
  });

  test("The other club of the fixture sees the same two names in the same order and the same match (managing Marlbrook Athletic at ?seed=31) @boundary @contract-shape:bounded-change", async ({ page }) => {
    const club = await openClubHome(page, "?seed=31", 7);
    expect(club).toBe("Marlbrook Athletic");
    const { score, goals } = await playAndRead(page);
    expect(score).toBe(GOLDEN_31.score);
    expect(goals).toEqual([...GOLDEN_31.goals]);
  });

  test("The same seed in a second fresh page gives the same match screen @boundary @contract-shape:bounded-change", async ({ browser }) => {
    const readings: string[] = [];
    for (let visit = 0; visit < 2; visit++) {
      const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
      const page = await context.newPage();
      await openClubHome(page, "?seed=11", 0);
      const { score, goals } = await playAndRead(page);
      readings.push(JSON.stringify([score, goals]));
      await context.close();
    }
    expect(readings[1]).toBe(readings[0]);
  });
});

test.describe("@US-1 @US-2 S-006 who scored, and the lists that must stay exactly as written", () => {
  test("@environment-probe An apostrophe (O'Garrity, seed 11) and a hyphen (Fitch-Moreton, seed 15) read in the score line items exactly as in the Squad list, textContent and innerText alike @boundary @contract-shape:bounded-change", async ({ page }) => {
    for (const [query, mark] of [["?seed=11", "'"], ["?seed=15", "-"]] as const) {
      const club = await openClubHome(page, query, 0);
      const { goals } = await playAndRead(page);
      const scorers = goals.map((text) => /^\d+' (.+) \((.+)\)$/.exec(text)!.slice(1, 3) as [string, string]);
      expect(scorers.some(([scorer]) => scorer.includes(mark)), `a scorer with ${mark} in ${query}`).toBe(true);
      const own = scorers.filter(([, clubName]) => clubName === club).map(([scorer]) => scorer);
      await back(page).click();
      await button(page, "Squad").click();
      const squad = await names(page.getByRole("list", { name: "Squad" }));
      for (const scorer of own) expect(squad, `${scorer} is in the Squad list`).toContain(scorer);
      await back(page).click();
    }
  });

  test("@example The goals of Sam's club name only the 11 on his Starting XI after a pick (Kestrel Northcott for Dorian Dunmore), never the goalkeeper or the benched, and Dunmore cannot score; theirs name a player of their squad @contract-shape:bounded-change", async ({ page }) => {
    const club = await openClubHome(page, "?seed=31", 0);
    await button(page, "Starting XI").click();
    await page.getByRole("list", { name: "Starting XI" }).getByRole("button", { name: "MF Dorian Dunmore 7", exact: true }).click();
    await expect(heading(page)).toHaveText("Choose MF");
    await page.getByRole("list", { name: "Players" }).getByRole("button", { name: "Kestrel Northcott 6", exact: true }).click();
    await expect(heading(page)).toHaveText("Starting XI");
    const eleven = (await page.getByRole("list", { name: "Starting XI" }).getByRole("button").allInnerTexts()).map((text) => text.replace(/^(GK|DF|MF|FW) /, "").replace(/ \d+$/, ""));
    expect(eleven).toHaveLength(11);
    expect(eleven).toContain("Kestrel Northcott");
    expect(eleven).not.toContain("Dorian Dunmore");
    await back(page).click();

    const first = await playAndRead(page);
    const goals = first.goals;
    const parsed = goals.map((text) => /^\d+' (.+) \((.+)\)$/.exec(text)!.slice(1, 3) as [string, string]);
    for (const [scorer] of parsed.filter(([, clubName]) => clubName === club)) {
      expect(eleven, `${scorer} is one of the 11`).toContain(scorer);
      expect(scorer).not.toBe("Tamsin Ingleby");
      expect(scorer).not.toBe("Dorian Dunmore");
    }
    await back(page).click();
    await expect(heading(page)).toHaveText(club);
    await expect(heading(page)).toBeFocused();
    await expect(page.getByRole("button", { name: "Starting XI", exact: true })).toBeVisible();
    await button(page, "Starting XI").click();
    expect(await page.getByRole("list", { name: "Starting XI" }).getByRole("button", { name: "MF Kestrel Northcott 6", exact: true }).count(), "the pick is kept after the match").toBe(1);
    await expect(page.getByRole("button", { name: "MF Dorian Dunmore 7", exact: true })).toHaveCount(0);
    await back(page).click();

    const second = await playAndRead(page, 2);
    const secondParsed = second.goals.map((text) => /^\d+' (.+) \((.+)\)$/.exec(text)!.slice(1, 3) as [string, string]);
    for (const [scorer] of secondParsed.filter(([, clubName]) => clubName === club)) {
      expect(eleven, `${scorer} is one of the 11 in matchday 2`).toContain(scorer);
      expect(scorer).not.toBe("Dorian Dunmore");
    }
    const otherOf = (score: string): string => {
      const [, home, , , away] = /^(.+) (\d)–(\d) (.+)$/.exec(score)!;
      return home === club ? away! : home!;
    };
    expect(otherOf(second.score), "playing again plays a new opponent on matchday 2").not.toBe(otherOf(first.score));
    await back(page).click();

    const rival = await openClubHome(page, "?seed=31", 7);
    await button(page, "Squad").click();
    const theirs = await names(page.getByRole("list", { name: "Squad" }));
    for (const [scorer] of parsed.filter(([, clubName]) => clubName === rival)) expect(theirs, `${scorer} is in ${rival}'s Squad list`).toContain(scorer);
  });

  test("@boundary The empty list: at ?seed=8 the matches of club 3 and club 4 (Mossdale Athletic v Pickering Dene Rovers) read 0–0 and the list Goals is there, visible and named exactly, with no items @contract-shape:bounded-change", async ({ page }) => {
    const errors = watchErrors(page);
    for (const clubIndex of [3, 4]) {
      await openClubHome(page, "?seed=8", clubIndex);
      const { score, goals, reading } = await playAndRead(page);
      expect(score).toBe("Mossdale Athletic 0–0 Pickering Dene Rovers");
      expect(goals).toEqual([]);
      expect(reading.goalsListVisible).toBe(true);
      await expect(goalsList(page)).toBeVisible();
      await expect(goalsList(page).getByRole("listitem")).toHaveCount(0);
      expect((await goalsList(page).boundingBox())?.height ?? 0, "the empty list keeps a box").toBeGreaterThan(0);
      await expect(page.getByText("Goals", { exact: true })).toBeVisible();
      expect(await page.getByText("Goals", { exact: true }).innerText(), "the label is not upper-cased").toBe("Goals");
      expect(await overflow(page)).toBeLessThanOrEqual(0);
    }
    expect(errors).toEqual([]);
  });

  test("The match screen has no accessible name that collides: one Back, one list Goals, one heading, no other list or button but Back @boundary @contract-shape:bounded-change", async ({ page }) => {
    await openClubHome(page, "?seed=31", 0);
    await playAndRead(page);
    await expect(page.getByRole("button")).toHaveCount(1);
    await expect(page.getByRole("list")).toHaveCount(1);
    await expect(page.getByRole("heading")).toHaveCount(1);
    await expect(page.getByRole("button", { name: "Back" })).toHaveCount(1);
  });
});

test.describe("@US-1 S-006 Back keeps the team as Sam left it", () => {
  test("@boundary Sam chose 4-3-3, played and tapped Back: the club home heading is focused and Tactics still has 4-3-3 checked @contract-shape:bounded-change", async ({ page }) => {
    const club = await openClubHome(page, "?seed=abc", 7);
    await button(page, "Tactics").click();
    await page.getByRole("radiogroup", { name: "Formation" }).getByText("4-3-3", { exact: true }).click();
    await expect(page.getByRole("radio", { name: "4-3-3", exact: true })).toBeChecked();
    await back(page).click();
    await playAndRead(page);
    await back(page).click();
    await expect(heading(page)).toHaveText(club);
    await expect(heading(page)).toBeFocused();
    await button(page, "Tactics").click();
    await expect(page.getByRole("radio", { name: "4-3-3", exact: true })).toBeChecked();
  });

  test("@walking_skeleton No console error and no sideways scroll across the whole journey: club home, Play match, Back, Starting XI, a pick, Back, Play match, Back @contract-shape:bounded-change", async ({ page }) => {
    const errors = watchErrors(page);
    const club = await openClubHome(page, "?seed=31", 0);
    expect(await overflow(page)).toBeLessThanOrEqual(0);
    await playAndRead(page);
    expect(await overflow(page)).toBeLessThanOrEqual(0);
    await back(page).click();
    await expect(heading(page)).toHaveText(club);
    await expect(heading(page)).toBeFocused();
    await button(page, "Starting XI").click();
    await expect(heading(page)).toHaveText("Starting XI");
    await expect(heading(page)).toBeFocused();
    await page.getByRole("list", { name: "Starting XI" }).getByRole("button", { name: "MF Dorian Dunmore 7", exact: true }).click();
    await expect(heading(page)).toHaveText("Choose MF");
    await page.getByRole("list", { name: "Players" }).getByRole("button", { name: "Kestrel Northcott 6", exact: true }).click();
    await expect(heading(page)).toHaveText("Starting XI");
    await back(page).click();
    await expect(heading(page)).toHaveText(club);
    await expect(heading(page)).toBeFocused();
    await playAndRead(page, 2);
    expect(await overflow(page)).toBeLessThanOrEqual(0);
    await back(page).click();
    await expect(heading(page)).toHaveText(club);
    await expect(heading(page)).toBeFocused();
    expect(errors).toEqual([]);
  });
});
