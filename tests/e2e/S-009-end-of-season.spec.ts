// @US-1 @US-2 (S-009 see how my season ended) held out until DELIVER
// CONTRACT_SHAPE: bounded-change
// Outcome anchor: DISCUSS Elevator Pitches (feature-delta.md US-1, US-2): on Netherwold Borough's home Sam taps "Play match" and "Back" 14 times,
// then "End of season" where "Play match" was, and sees the screen title "End of season", "Final position 3rd" and "Top scorer Garrick
// Thistlewood (5 goals)", then "Play again" and "Back"; "Play again" shows the pick-a-club screen with the same 8 clubs, and 3 taps later
// "Matchday 1" ("Netherwold Borough 1–2 Marlbrook Athletic") is on screen again. The expected lines are the reference season ends of the plan run
// (season-end-reference.ts, recomputed in Node by the committed season-end-inputs-pinned.test.ts): Chromium must equal Node at ?seed=31 (3rd),
// ?seed=abc (2nd, Joren Northcott 8), ?seed=13 (8th, "(1 goal)") and ?seed=1 (8th, Bram Fairbourne 3). Covers only what tests/protected/S-009
// does not: those goldens, the 8th-place rows, the 44px and focus details, the K1 tap counts, click-everything, Play again and the replay.
// Environment precondition: local-preview (ci:serve, http://localhost:4173/gaffer/) or, via BASE_URL, the deployed Pages site. Not meant for
// local-dev (waived, as S-003..S-008). A season is 28 taps: the season tests use test.slow() or test.setTimeout(90_000) (DEVOPS open question 1).
// Environment probes (ADR-0015 Earned Trust): (1) Chromium equals Node on the goldens; (2) both lines' innerText equals textContent, one innermost
// element each, no line break; (3) the rendered ordinal equals the Table's Pos cell and the top scorer equals a tally of the 14 "Goals" lists
// with ties to the "Squad" order (the independent check); (6) focus, 44px, click-everything, no sideways scroll, no console error.
// Destination: tests/e2e/S-009-end-of-season.spec.ts (DELIVER: git mv, dropping .pending, in the commit that adds the screen). It imports
// ../acceptance/S-009/season-end-reference (committed data module; do not move it).
import { expect, test, type Locator, type Page } from "@playwright/test";
import { REFERENCE_END_1, REFERENCE_END_13, REFERENCE_END_20260, REFERENCE_END_31 } from "../acceptance/S-009/season-end-reference";

// Viewport and device: the Pixel 7 profile at 390px comes from playwright.config.ts (no per-spec override).

const ITEM = /^(\d{1,2})' (.+) \((.+)\)$/;
const POSITION_LINE = /^Final position (1st|2nd|3rd|4th|5th|6th|7th|8th)$/;
const TOP_LINE = /^Top scorer (none|(.+) \((\d+) goals?\))$/;
const ORDINALS = ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th"] as const;

const heading = (page: Page): Locator => page.getByRole("heading", { level: 1 });
const button = (page: Page, name: string): Locator => page.getByRole("button", { name, exact: true });
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
    const w = window as unknown as { __taps: number };
    w.__taps = 0;
    if (!(w as unknown as { __counting?: boolean }).__counting) {
      (w as unknown as { __counting: boolean }).__counting = true;
      document.addEventListener("pointerdown", () => void w.__taps++, true);
    }
  });
const tapsSoFar = (page: Page): Promise<number> => page.evaluate(() => (window as unknown as { __taps: number }).__taps);
const tall = async (target: Locator, what: string): Promise<void> => expect((await target.boundingBox())?.height ?? 0, what).toBeGreaterThanOrEqual(44);

interface Who {
  readonly club: string;
  readonly clubs: readonly string[];
  readonly squad: readonly string[];
}

/** Opens a fresh page, taps New game, reads the 8 names of the "Clubs" list, picks club `clubIndex` and reads the order of its "Squad" list. */
const openSeason = async (page: Page, query: string, clubIndex: number): Promise<Who> => {
  await page.goto(`./${query}`);
  await page.getByRole("button", { name: "New game" }).click();
  const list = page.getByRole("list", { name: "Clubs" }).getByRole("button");
  const clubs = (await list.allInnerTexts()).map(firstLine);
  expect(clubs).toHaveLength(8);
  await list.nth(clubIndex).click();
  const club = clubs[clubIndex]!;
  await expect(heading(page)).toHaveText(club);
  await button(page, "Squad").click();
  const squad = (await page.getByRole("list", { name: "Squad" }).getByRole("listitem").allInnerTexts()).map(firstLine);
  expect(squad).toHaveLength(18);
  await button(page, "Back").click();
  await expect(heading(page)).toHaveText(club);
  return { club, clubs, squad };
};

/** The 11 on the Starting XI screen as Sam reads them (position, name, shirt number as printed). Back returns to the club home. */
const readEleven = async (page: Page): Promise<readonly string[]> => {
  await button(page, "Starting XI").click();
  await expect(heading(page)).toHaveText("Starting XI");
  const items = (await page.getByRole("list", { name: "Starting XI" }).getByRole("button").allInnerTexts()).map((text) => text.trim());
  await button(page, "Back").click();
  return items;
};

/** Taps "Play match" and "Back" for matchdays `from`..`to`; returns the scorers named for `club` on each Goals list (club's own goals only). */
const playMatches = async (page: Page, who: Who, range: { readonly from: number; readonly to: number }): Promise<readonly string[]> => {
  const own: string[] = [];
  for (let matchday = range.from; matchday <= range.to; matchday++) {
    await tall(button(page, "Play match"), `Play match before matchday ${matchday}`);
    if (matchday < 14) await expect(button(page, "End of season"), `no End of season before matchday 14 is played (${matchday - 1} played)`).toHaveCount(0);
    await button(page, "Play match").click();
    await expect(heading(page)).toHaveText(`Matchday ${matchday}`);
    await expect(heading(page)).toBeFocused();
    const items = await page.getByRole("list", { name: "Goals", exact: true }).getByRole("listitem").allTextContents();
    for (const text of items) {
      const [, , scorer, club] = ITEM.exec(text)!;
      if (club === who.club) own.push(scorer!);
    }
    await button(page, "Back").click();
    await expect(heading(page)).toHaveText(who.club);
    await expect(heading(page)).toBeFocused();
  }
  return own;
};

/** Opens Table from the club home: every body row at P 14 (or `played`), returns the club's Pos and the row names in order, then Back. */
const tableFacts = async (page: Page, club: string, played: string): Promise<{ readonly pos: number; readonly names: readonly string[]; readonly zeros: boolean }> => {
  await button(page, "Table").click();
  await expect(heading(page)).toHaveText("League table");
  await expect(heading(page)).toBeFocused();
  const rows = (await page.getByRole("table", { name: "League table", exact: true }).getByRole("row").all()).slice(1);
  expect(rows).toHaveLength(8);
  let pos = 0;
  const names: string[] = [];
  let zeros = true;
  for (const row of rows) {
    const cells = (await row.getByRole("cell").allInnerTexts()).map((text) => text.trim());
    const name = (await row.getByRole("rowheader").innerText()).trim();
    expect(cells[1], `P of ${name}`).toBe(played);
    names.push(name);
    if (name === club) pos = Number(cells[0]);
    zeros &&= cells.slice(1).every((cell) => cell === "0");
  }
  await button(page, "Back").click();
  await expect(heading(page)).toHaveText(club);
  await expect(heading(page)).toBeFocused();
  return { pos, names, zeros };
};

/** The club home after matchday 14 (DISCUSS D1): no Play match, one End of season button, the other four, all 44px, in the Play match slot. */
const expectEndOfSeasonOffer = async (page: Page, club: string): Promise<void> => {
  await expect(heading(page)).toHaveText(club);
  await expect(heading(page)).toBeFocused();
  await expect(button(page, "Play match"), "no button named Play match").toHaveCount(0);
  await expect(page.getByRole("button", { name: /play match/i }), "no button with a name like Play match").toHaveCount(0);
  await expect(button(page, "End of season"), "one End of season button").toHaveCount(1);
  await expect(page.getByText("Season over"), "the S-008 line is gone").toHaveCount(0);
  await expect(page.getByRole("heading")).toHaveCount(1);
  const buttons = page.getByRole("button");
  expect((await buttons.allInnerTexts()).map((text) => text.trim()), "five buttons in the Play match slot's order").toEqual(["Squad", "Tactics", "Starting XI", "End of season", "Table"]);
  for (const [index, each] of (await buttons.all()).entries()) await tall(each, `club home button ${index}`);
  expect(await page.evaluate(() => [...document.querySelectorAll(".club-actions > *")].map((node) => `${node.tagName}:${node.textContent?.trim()}`)), "the button sits in the Play match slot").toEqual([
    "BUTTON:Squad", "BUTTON:Tactics", "BUTTON:Starting XI", "BUTTON:End of season", "BUTTON:Table",
  ]);
  const box = (await button(page, "End of season").boundingBox())!;
  expect([box.x >= 0, box.x + box.width <= page.viewportSize()!.width], "inside the 390px screen").toEqual([true, true]);
  expect(await overflow(page), "no sideways scroll on the finished club home").toBeLessThanOrEqual(0);
};

interface Line {
  readonly tag: string;
  readonly text: string;
  readonly inner: string;
  readonly visible: boolean;
  readonly insideButton: boolean;
  readonly role: string | null;
  readonly width: number;
  readonly right: number;
}
interface Reading {
  readonly focusedTag: string;
  readonly focusedText: string;
  readonly headings: number;
  readonly position: readonly Line[];
  readonly top: readonly Line[];
}
/** What Sam reads the instant the End of season screen opens: the focused element, the headings and the two lines (innermost element whose whole text matches). */
const readNow = (page: Page): Promise<Reading> =>
  page.evaluate(
    ([positionSource, topSource]): Reading => {
      const [positionRe, topRe] = [new RegExp(positionSource!), new RegExp(topSource!)];
      const all = [...document.querySelectorAll<HTMLElement>("#app *")];
      const innermost = (re: RegExp): Line[] =>
        all
          .filter((node) => re.test(node.textContent ?? "") && ![...node.children].some((child) => re.test(child.textContent ?? "")))
          .map((node) => ({
            tag: node.tagName,
            text: node.textContent ?? "",
            inner: node.innerText,
            visible: node.getBoundingClientRect().height > 0,
            insideButton: node.closest("button") !== null,
            role: node.getAttribute("role"),
            width: node.getBoundingClientRect().width,
            right: node.getBoundingClientRect().right,
          }));
      const active = document.activeElement;
      return {
        focusedTag: active?.tagName ?? "",
        focusedText: active?.textContent ?? "",
        headings: document.querySelectorAll("h1, h2, h3, h4, h5, h6, [role='heading']").length,
        position: innermost(positionRe),
        top: innermost(topRe),
      };
    },
    [POSITION_LINE.source, TOP_LINE.source] as const,
  );

/** The tie rule of the story: the club player named most often on the 14 Goals lists; the one listed first in the Squad list when several tie. */
const expectedTopLine = (own: readonly string[], squad: readonly string[]): string => {
  const counts = squad.map((name) => own.filter((scorer) => scorer === name).length);
  const top = Math.max(...counts);
  if (top === 0) return "Top scorer none";
  const name = squad[counts.indexOf(top)]!;
  return `Top scorer ${name} (${top} ${top === 1 ? "goal" : "goals"})`;
};

interface EndScreen {
  readonly position: string;
  readonly top: string;
}
/** Taps "End of season" and asserts the whole screen as Sam reads it right away (DISCUSS D2). */
const openEndOfSeason = async (page: Page): Promise<EndScreen> => {
  await button(page, "End of season").click();
  const now = await readNow(page);
  expect([now.focusedTag, now.focusedText], "focus is on the End of season heading the moment it opens").toEqual(["H1", "End of season"]);
  expect(now.headings, "the End of season h1 is the only heading").toBe(1);
  expect(now.position, "exactly one element reads as the Final position line").toHaveLength(1);
  expect(now.top, "exactly one element reads as the Top scorer line").toHaveLength(1);
  for (const line of [now.position[0]!, now.top[0]!]) {
    expect(line.tag, "a paragraph, not a heading or a button").toBe("P");
    expect([line.role, line.insideButton, line.visible]).toEqual([null, false, true]);
    expect(line.inner, "innerText equals textContent: one line of text").toBe(line.text);
    expect(line.right, "the line sits inside the 390px phone screen").toBeLessThanOrEqual(page.viewportSize()!.width);
  }
  await expect(heading(page)).toHaveText("End of season");
  expect((await page.getByRole("button").allInnerTexts()).map((text) => text.trim()), "only Play again and Back are buttons").toEqual(["Play again", "Back"]);
  await tall(button(page, "Play again"), "Play again");
  await tall(button(page, "Back"), "Back");
  expect(await overflow(page), "no sideways scroll on the End of season screen").toBeLessThanOrEqual(0);
  return { position: now.position[0]!.text, top: now.top[0]!.text };
};

interface Season extends Who {
  readonly own: readonly string[];
}
/** A fresh page, New game, the club, 14 x (Play match, Back); the club home then offers End of season. */
const finishSeason = async (page: Page, query: string, clubIndex: number): Promise<Season> => {
  const who = await openSeason(page, query, clubIndex);
  const own = await playMatches(page, who, { from: 1, to: 14 });
  await expectEndOfSeasonOffer(page, who.club);
  return { ...who, own };
};
/** The lines against the story's rules: the table's Pos, the Goals lists' tally, the tie rule and the formats. */
const expectVerdict = (screen: EndScreen, season: Season, pos: number): void => {
  expect(screen.position, "Final position equals the ordinal of the club's Pos on the Table screen").toBe(`Final position ${ORDINALS[pos - 1]}`);
  expect(screen.position).toMatch(POSITION_LINE);
  expect(screen.top).toMatch(TOP_LINE);
  expect(screen.top, "Top scorer is the most-named club player, ties to the Squad order, goal singular exactly at 1").toBe(expectedTopLine(season.own, season.squad));
};
/** Season to the End of season screen: the table read first (P 14 on every row, the club's Pos), then the screen and its lines. */
const reachVerdict = async (page: Page, season: Season): Promise<EndScreen> => {
  const { pos } = await tableFacts(page, season.club, "14");
  const screen = await openEndOfSeason(page);
  expectVerdict(screen, season, pos);
  return screen;
};

test.describe("@US-1 S-009 see how my season ended", () => {
  test("@walking_skeleton @kpi Sam plays 14 matches at ?seed=31; the club home offers End of season in the Play match slot only then; one tap opens the screen titled End of season (focused, the only heading) with Final position 3rd, Top scorer Garrick Thistlewood (5 goals) after a 5-5 tie broken by Squad order, and Play again and Back, 44px or taller @contract-shape:bounded-change", async ({ page }) => {
    test.slow();
    const errors = watchErrors(page);
    const season = await finishSeason(page, REFERENCE_END_31.query, REFERENCE_END_31.clubIndex);
    expect(season.club).toBe("Netherwold Borough");
    expect(new URL(page.url()).pathname, "precondition: production build served under /gaffer/").toBe("/gaffer/");
    const tally = new Map<string, number>();
    for (const scorer of season.own) tally.set(scorer, (tally.get(scorer) ?? 0) + 1);
    expect([...tally.entries()].sort((a, b) => b[1] - a[1] || season.squad.indexOf(a[0]) - season.squad.indexOf(b[0])), "Chromium plays the reference scorers").toEqual(
      REFERENCE_END_31.scorers.map((scorer) => [scorer.name, scorer.goals]),
    );

    const { pos, names } = await tableFacts(page, season.club, "14");
    expect(pos).toBe(3);
    expect(names).toHaveLength(8);
    await installTapCounter(page);
    const screen = await openEndOfSeason(page);
    expect(await tapsSoFar(page), "the verdict is one tap from the club home (K1)").toBe(1);
    expectVerdict(screen, season, pos);
    expect(screen, "Chromium equals Node: the reference lines").toEqual({ position: REFERENCE_END_31.positionLine, top: REFERENCE_END_31.topScorerLine });
    expect(errors).toEqual([]);
  });

  test("@boundary Nothing on the End of season screen reacts to a tap except Play again and Back: tapping the title and both lines leaves the screen as it was @contract-shape:bounded-change", async ({ page }) => {
    test.slow();
    const errors = watchErrors(page);
    const season = await finishSeason(page, REFERENCE_END_31.query, REFERENCE_END_31.clubIndex);
    const before = await reachVerdict(page, season);
    for (const target of [heading(page), page.getByText(before.position, { exact: true }), page.getByText(before.top, { exact: true })]) {
      await target.click();
      await expect(heading(page)).toHaveText("End of season");
      await expect(page.getByRole("heading")).toHaveCount(1);
      expect((await page.getByRole("button").allInnerTexts()).map((text) => text.trim())).toEqual(["Play again", "Back"]);
    }
    expect((await readNow(page)).position.map((line) => line.text)).toEqual([before.position]);
    expect((await readNow(page)).top.map((line) => line.text)).toEqual([before.top]);
    expect(errors).toEqual([]);
  });

  test("@boundary Back returns to the finished club home with its name focused and End of season still offered; Table still reads P 14; End of season opens the same lines again; a played match cannot be re-opened @contract-shape:bounded-change", async ({ page }) => {
    test.slow();
    const errors = watchErrors(page);
    const season = await finishSeason(page, REFERENCE_END_31.query, REFERENCE_END_31.clubIndex);
    const first = await reachVerdict(page, season);
    await tall(button(page, "Back"), "Back");
    await button(page, "Back").click();
    await expectEndOfSeasonOffer(page, season.club);
    expect((await tableFacts(page, season.club, "14")).pos).toBe(3);
    await expectEndOfSeasonOffer(page, season.club);
    expect(await openEndOfSeason(page)).toEqual(first);
    await button(page, "Back").click();
    await expectEndOfSeasonOffer(page, season.club);
    await expect(page.getByRole("heading", { name: /Matchday/ }), "an already played match cannot be re-opened").toHaveCount(0);
    expect(errors).toEqual([]);
  });

  test("@boundary Changing Tactics to 4-3-3 and picking Kestrel Northcott for Calder Redfern after matchday 14 leaves the End of season lines exactly as they were @contract-shape:bounded-change", async ({ page }) => {
    test.slow();
    const season = await finishSeason(page, REFERENCE_END_31.query, REFERENCE_END_31.clubIndex);
    const first = await reachVerdict(page, season);
    await button(page, "Back").click();
    await button(page, "Tactics").click();
    await page.getByRole("radiogroup", { name: "Formation" }).getByText("4-3-3", { exact: true }).click();
    await button(page, "Back").click();
    await button(page, "Starting XI").click();
    await page.getByRole("list", { name: "Starting XI" }).getByRole("button", { name: "MF Calder Redfern 15", exact: true }).click();
    await expect(heading(page)).toHaveText("Choose MF");
    await page.getByRole("list", { name: "Players" }).getByRole("button", { name: "Kestrel Northcott 6", exact: true }).click();
    await expect(heading(page)).toHaveText("Starting XI");
    await button(page, "Back").click();
    await expectEndOfSeasonOffer(page, season.club);
    expect(await openEndOfSeason(page)).toEqual(first);
  });
});

test.describe("@US-1 S-009 the other reference verdicts, in the browser as in Node", () => {
  for (const reference of [REFERENCE_END_13, REFERENCE_END_1]) {
    test(`@example @boundary ${reference.query} ${reference.club} finishes 8th: ${reference.positionLine} equals its Pos on the Table, and ${reference.topScorerLine} (a goal is singular exactly at 1) @contract-shape:bounded-change`, async ({ page }) => {
      test.slow();
      const errors = watchErrors(page);
      const season = await finishSeason(page, reference.query, reference.clubIndex);
      expect(season.club).toBe(reference.club);
      expect(season.own, "the club's goals in the 14 Goals lists").toHaveLength(reference.row.goalsFor);
      const screen = await reachVerdict(page, season);
      expect(screen).toEqual({ position: reference.positionLine, top: reference.topScorerLine });
      await expect(page.getByText(reference.positionLine, { exact: true })).toBeVisible();
      await expect(page.getByText(reference.topScorerLine, { exact: true })).toBeVisible();
      expect(errors).toEqual([]);
    });
  }

  test("@example @boundary @determinism ?seed=abc and no ?seed= in the address end the same way: Oakhampton Rise Borough, Final position 2nd, Top scorer Joren Northcott (8 goals); Play again then Valebridge Town gives a club home with Play match and no End of season @contract-shape:bounded-change", async ({ page }) => {
    test.setTimeout(90_000);
    const errors = watchErrors(page);
    const season = await finishSeason(page, REFERENCE_END_20260.query, REFERENCE_END_20260.clubIndex);
    expect(season.club).toBe("Oakhampton Rise Borough");
    const first = await reachVerdict(page, season);
    expect(first).toEqual({ position: REFERENCE_END_20260.positionLine, top: REFERENCE_END_20260.topScorerLine });

    const other = await page.context().newPage();
    const bare = await finishSeason(other, "", REFERENCE_END_20260.clubIndex);
    expect(bare.club).toBe(season.club);
    expect(bare.squad).toEqual(season.squad);
    expect(await reachVerdict(other, bare), "no ?seed= gives the same End of season screen as ?seed=abc").toEqual(first);

    await button(page, "Play again").click();
    await expect(heading(page)).toBeFocused();
    const list = page.getByRole("list", { name: "Clubs" }).getByRole("button");
    expect((await list.allInnerTexts()).map(firstLine), "the same 8 clubs in the same order").toEqual(season.clubs);
    await list.nth(season.clubs.indexOf("Valebridge Town")).click();
    await expect(heading(page)).toHaveText("Valebridge Town");
    await expect(button(page, "End of season"), "a new season has not ended").toHaveCount(0);
    await tall(button(page, "Play match"), "Play match");
    await button(page, "Play match").click();
    await expect(heading(page)).toHaveText("Matchday 1");
    expect(errors).toEqual([]);
  });
});

test.describe("@US-2 S-009 Play again", () => {
  test("@walking_skeleton @kpi From the End of season screen at ?seed=31, Play again shows the pick-a-club screen with the same 8 clubs (focus on its heading); Netherwold Borough, Play match is 3 taps and reads Matchday 1, Netherwold Borough 1–2 Marlbrook Athletic; the same choices play the same season: the same End of season lines @contract-shape:bounded-change", async ({ page }) => {
    test.setTimeout(90_000);
    const errors = watchErrors(page);
    const season = await finishSeason(page, REFERENCE_END_31.query, REFERENCE_END_31.clubIndex);
    const first = await reachVerdict(page, season);
    expect(first).toEqual({ position: REFERENCE_END_31.positionLine, top: REFERENCE_END_31.topScorerLine });

    await installTapCounter(page);
    await button(page, "Play again").click();
    const landed = await page.evaluate(() => ({ tag: document.activeElement?.tagName ?? "", headings: document.querySelectorAll("h1, h2, h3, h4, h5, h6, [role='heading']").length }));
    expect(landed, "focus is on the only top-level heading of the pick-a-club screen").toEqual({ tag: "H1", headings: 1 });
    const list = page.getByRole("list", { name: "Clubs" }).getByRole("button");
    expect((await list.allInnerTexts()).map(firstLine), "the same 8 clubs in the same order as the first New game").toEqual(season.clubs);
    await list.nth(REFERENCE_END_31.clubIndex).click();
    await button(page, "Play match").click();
    expect(await tapsSoFar(page), "Play again, the club, Play match: 3 taps to a new matchday 1 (K1)").toBe(3);
    await expect(heading(page)).toHaveText("Matchday 1");
    await expect(page.getByText("Netherwold Borough 1–2 Marlbrook Athletic", { exact: true })).toBeVisible();
    const items = await page.getByRole("list", { name: "Goals", exact: true }).getByRole("listitem").allTextContents();
    expect(items.filter((text) => ITEM.exec(text)![3] === season.club).map((text) => ITEM.exec(text)![2]), "the same first match, goal for goal (one goal in the 1–2)").toEqual(season.own.slice(0, 1));
    await button(page, "Back").click();

    const rest = await playMatches(page, season, { from: 2, to: 14 });
    await expectEndOfSeasonOffer(page, season.club);
    const again = await reachVerdict(page, { ...season, own: [...items.filter((text) => ITEM.exec(text)![3] === season.club).map((text) => ITEM.exec(text)![2]!), ...rest] });
    expect(again, "the same season played again reads the same, line for line").toEqual(first);
    expect(errors).toEqual([]);
  });

  test("@boundary @error After a season with 4-3-3 and Kestrel Northcott for Calder Redfern, Play again and Netherwold Borough give a table at 0 in A to Z order, 4-4-2 checked and the automatic Starting XI of a new game @contract-shape:bounded-change", async ({ page }) => {
    test.slow();
    const errors = watchErrors(page);
    const who = await openSeason(page, REFERENCE_END_31.query, REFERENCE_END_31.clubIndex);
    const automatic = await readEleven(page);
    await button(page, "Tactics").click();
    await page.getByRole("radiogroup", { name: "Formation" }).getByText("4-3-3", { exact: true }).click();
    await button(page, "Back").click();
    await button(page, "Starting XI").click();
    await page.getByRole("list", { name: "Starting XI" }).getByRole("button", { name: "MF Calder Redfern 15", exact: true }).click();
    await page.getByRole("list", { name: "Players" }).getByRole("button", { name: "Kestrel Northcott 6", exact: true }).click();
    await button(page, "Back").click();
    const tuned = await readEleven(page);
    expect(tuned).not.toEqual(automatic);
    const own = await playMatches(page, who, { from: 1, to: 14 });
    await expectEndOfSeasonOffer(page, who.club);
    await reachVerdict(page, { ...who, own });

    await button(page, "Play again").click();
    await page.getByRole("list", { name: "Clubs" }).getByRole("button").nth(REFERENCE_END_31.clubIndex).click();
    await expect(heading(page)).toHaveText(who.club);
    await expect(button(page, "End of season")).toHaveCount(0);
    const facts = await tableFacts(page, who.club, "0");
    expect(facts.zeros, "every row reads P 0, W 0, D 0, L 0, GD 0, Pts 0").toBe(true);
    expect(facts.names, "A to Z order of club name").toEqual([...who.clubs].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0)));
    await button(page, "Tactics").click();
    await expect(page.getByRole("radio", { name: "4-4-2", exact: true })).toBeChecked();
    await button(page, "Back").click();
    expect(await readEleven(page), "the automatic Starting XI of a new game").toEqual(automatic);
    await button(page, "Play match").click();
    await expect(heading(page)).toHaveText("Matchday 1");
    await expect(page.getByText("Netherwold Borough 1–2 Marlbrook Athletic", { exact: true })).toBeVisible();
    expect(await overflow(page)).toBeLessThanOrEqual(0);
    expect(errors).toEqual([]);
  });
});
