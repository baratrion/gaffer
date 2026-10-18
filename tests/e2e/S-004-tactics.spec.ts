// @US-1 (S-004 choose a formation)
// CONTRACT_SHAPE: e2e journey
// Outcome anchor: DISCUSS Elevator Pitch (feature-delta.md US-1): on the club home Sam taps "Tactics", then taps "4-3-3",
// and sees "4-3-3" checked and the list "Line-up" reading GK, DF, DF, DF, DF, MF, MF, MF, FW, FW, FW.
// Environment precondition: runs against local-preview (ci:serve, http://localhost:4173/gaffer/) or, via BASE_URL, the
// deployed Pages site; both serve the production build under /gaffer/. Not meant for local-dev (vite dev, :5173): waived.
// Destination: tests/e2e/S-004-tactics.spec.ts (DELIVER step 02).
import { expect, test, type Locator, type Page } from "@playwright/test";

// Viewport and device: the Pixel 7 profile at 390px comes from playwright.config.ts (no per-spec override).

const NAMES = ["4-4-2", "4-3-3", "4-2-3-1"] as const;
type Name = (typeof NAMES)[number];
type Code = "GK" | "DF" | "MF" | "FW";
const repeat = (code: Code, count: number): Code[] => Array.from({ length: count }, () => code);
const slots = ([gk, df, mf, fw]: readonly [number, number, number, number]): Code[] => [
  ...repeat("GK", gk),
  ...repeat("DF", df),
  ...repeat("MF", mf),
  ...repeat("FW", fw),
];
const LINE_UP: Readonly<Record<Name, readonly Code[]>> = {
  "4-4-2": slots([1, 4, 4, 2]),
  "4-3-3": slots([1, 4, 3, 3]),
  "4-2-3-1": slots([1, 4, 5, 1]),
};

const openClubHome = async (page: Page, query: string, clubIndex: number): Promise<string> => {
  await page.goto(`./${query}`);
  await page.getByRole("button", { name: "New game" }).click();
  const button = page.getByRole("list", { name: "Clubs" }).getByRole("button").nth(clubIndex);
  const name = ((await button.innerText()).split("\n")[0] ?? "").trim();
  await button.click();
  await expect(page.getByRole("heading", { level: 1 })).toContainText(name);
  return name;
};

const tacticsButton = (page: Page): Locator => page.getByRole("button", { name: "Tactics", exact: true });
const back = (page: Page): Locator => page.getByRole("button", { name: "Back", exact: true });
const group = (page: Page): Locator => page.getByRole("radiogroup", { name: "Formation" });
const radio = (page: Page, name: Name): Locator => group(page).getByRole("radio", { name, exact: true });
const label = (page: Page, name: Name): Locator => group(page).getByText(name, { exact: true });
const lineUp = (page: Page): Locator => page.getByRole("list", { name: "Line-up" });

const openTactics = async (page: Page, query = "?seed=31", clubIndex = 0) => {
  const club = await openClubHome(page, query, clubIndex);
  await tacticsButton(page).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Tactics");
  await expect(group(page)).toBeVisible();
  return club;
};

const lineUpCodes = async (page: Page): Promise<string[]> =>
  (await lineUp(page).getByRole("listitem").allInnerTexts()).map((text) => text.trim());

/** Asserts the whole tactics screen as Sam reads it: one heading, one group of three radios, one checked, the line-up. */
const expectChosen = async (page: Page, chosen: Name): Promise<void> => {
  await expect(page.getByRole("heading")).toHaveCount(1);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Tactics");
  await expect(page.getByRole("radiogroup")).toHaveCount(1);
  await expect(page.getByRole("radio")).toHaveCount(3);
  await expect(group(page).getByRole("radio")).toHaveCount(3);
  for (const [index, name] of NAMES.entries()) {
    await expect(group(page).getByRole("radio").nth(index)).toHaveAccessibleName(name);
    if (name === chosen) await expect(radio(page, name)).toBeChecked();
    else await expect(radio(page, name)).not.toBeChecked();
  }
  await expect(page.getByRole("list")).toHaveCount(1);
  expect(await lineUpCodes(page)).toEqual(LINE_UP[chosen]);
};

const installTapCounter = (page: Page) =>
  page.evaluate(() => {
    const w = window as unknown as { __taps: number };
    w.__taps = 0;
    // One pointerdown per physical tap; a label tap also makes the browser click the radio, so clicks would double count.
    document.addEventListener("pointerdown", () => void w.__taps++, true);
  });
const tapsSoFar = (page: Page): Promise<number> => page.evaluate(() => (window as unknown as { __taps: number }).__taps);
const overflow = (page: Page): Promise<number> => page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
const watchErrors = (page: Page): string[] => {
  const errors: string[] = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(e.message));
  return errors;
};

test.describe("@US-1 S-004 choose a formation", () => {
  test("@walking_skeleton @kpi Sam taps Tactics, taps 4-3-3 (2 taps), sees it checked with its line-up, taps Back (1 tap) to the club home @contract-shape:bounded-change", async ({ page }) => {
    const errors = watchErrors(page);
    const club = await openClubHome(page, "?seed=31", 0);
    expect(new URL(page.url()).pathname, "precondition: production build served under /gaffer/").toBe("/gaffer/");
    await installTapCounter(page);

    await tacticsButton(page).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Tactics");
    await expect(page.getByRole("heading", { level: 1 })).toBeFocused();
    await expectChosen(page, "4-4-2");

    await label(page, "4-3-3").click();
    expect(await tapsSoFar(page), "club home to a chosen formation is 2 taps").toBe(2);
    await expectChosen(page, "4-3-3");
    await expect(radio(page, "4-3-3")).toBeFocused();

    await back(page).click();
    expect(await tapsSoFar(page), "back is 1 more tap").toBe(3);
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(club);
    await expect(page.getByRole("heading", { level: 1 })).toBeFocused();
    await expect(group(page)).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Squad", exact: true })).toBeVisible();
    await expect(tacticsButton(page)).toBeVisible();
    expect(errors).toEqual([]);
  });

  for (const [query, clubIndex] of [["?seed=31", 0], ["?seed=abc", 7]] as const) {
    test(`a new game opens Tactics on 4-4-2 with GK, 4 DF, 4 MF, 2 FW (${query}, club ${clubIndex}) @contract-shape:bounded-change`, async ({ page }) => {
      await openTactics(page, query, clubIndex);
      await expectChosen(page, "4-4-2");
      await expect(page.getByRole("heading", { level: 1 })).toBeFocused();
    });
  }

  for (const [query, clubIndex] of [["?seed=31", 0], ["?seed=abc", 7]] as const) {
    test(`tapping 4-2-3-1, then 4-3-3, then 4-4-2 gives the same line-ups for every seed (${query}, club ${clubIndex}), focus on the tapped radio @example @contract-shape:bounded-change`, async ({ page }) => {
      await openTactics(page, query, clubIndex);
      for (const name of ["4-2-3-1", "4-3-3", "4-4-2"] as const) {
        await label(page, name).click();
        await expectChosen(page, name);
        await expect(radio(page, name)).toBeFocused();
        await expect(page.getByRole("heading", { level: 1 })).not.toBeFocused();
      }
    });
  }

  test("the Tactics and Back buttons and every formation label are at least 44px tall, and tapping a label checks its radio @contract-shape:bounded-change", async ({ page }) => {
    await openClubHome(page, "?seed=31", 0);
    expect((await tacticsButton(page).boundingBox())?.height ?? 0, "Tactics button").toBeGreaterThanOrEqual(44);
    await tacticsButton(page).click();
    await expect(group(page)).toBeVisible();
    expect((await back(page).boundingBox())?.height ?? 0, "Back button").toBeGreaterThanOrEqual(44);
    for (const name of NAMES) {
      expect((await label(page, name).boundingBox())?.height ?? 0, `${name} label`).toBeGreaterThanOrEqual(44);
      await expect(group(page).getByLabel(name, { exact: true }), `${name} is the radio's visible label`).toHaveCount(1);
      await label(page, name).click();
      await expect(radio(page, name)).toBeChecked();
    }
  });

  test("the choice is kept: 4-3-3, Back, Squad, Back, Tactics shows 4-3-3 checked with its line-up @contract-shape:bounded-change", async ({ page }) => {
    const club = await openTactics(page);
    await label(page, "4-3-3").click();
    await back(page).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(club);
    await page.getByRole("button", { name: "Squad", exact: true }).click();
    await expect(page.getByRole("list", { name: "Squad" }).getByRole("listitem")).toHaveCount(18);
    await back(page).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(club);
    await tacticsButton(page).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Tactics");
    await expectChosen(page, "4-3-3");
    await expect(page.getByRole("heading", { level: 1 })).toBeFocused();
  });

  test("the choice is kept after visiting a player too: 4-2-3-1, Back, Squad, a player, Back, Back, Tactics @contract-shape:bounded-change", async ({ page }) => {
    const club = await openTactics(page, "?seed=abc", 7);
    await label(page, "4-2-3-1").click();
    await back(page).click();
    await page.getByRole("button", { name: "Squad", exact: true }).click();
    await page.getByRole("list", { name: "Squad" }).getByRole("listitem").nth(4).getByRole("button").click();
    await back(page).click();
    await back(page).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(club);
    await tacticsButton(page).click();
    await expectChosen(page, "4-2-3-1");
  });

  test("the choice is lost on a fresh visit: New game starts at 4-4-2 again @error @contract-shape:bounded-change", async ({ page: first }) => {
    await openTactics(first, "?seed=31", 7);
    await label(first, "4-2-3-1").click();
    await expectChosen(first, "4-2-3-1");
    const second = await first.context().newPage();
    await openTactics(second, "?seed=31", 7);
    await expectChosen(second, "4-4-2");
    const third = await first.context().newPage();
    await openTactics(third, "?seed=abc", 7);
    await expectChosen(third, "4-4-2");
  });

  test("tapping the formation that is already checked changes nothing @boundary @contract-shape:bounded-change", async ({ page }) => {
    await openTactics(page);
    await label(page, "4-4-2").click();
    await expectChosen(page, "4-4-2");
    await label(page, "4-3-3").click();
    await label(page, "4-3-3").click();
    await expectChosen(page, "4-3-3");
    await expect(radio(page, "4-3-3")).toBeFocused();
  });

  test("with the arrow keys, the next formation is checked and focused, the heading stays Tactics @contract-shape:bounded-change", async ({ page }) => {
    await openTactics(page);
    await radio(page, "4-4-2").focus();
    await page.keyboard.press("ArrowRight");
    await expectChosen(page, "4-3-3");
    await expect(radio(page, "4-3-3")).toBeFocused();
    await page.keyboard.press("ArrowRight");
    await expectChosen(page, "4-2-3-1");
    await expect(radio(page, "4-2-3-1")).toBeFocused();
    await page.keyboard.press("ArrowLeft");
    await expectChosen(page, "4-3-3");
    await expect(radio(page, "4-3-3")).toBeFocused();
  });

  test("Back is reachable by keyboard from the chosen formation and returns to the club home @contract-shape:bounded-change", async ({ page }) => {
    const club = await openTactics(page);
    await label(page, "4-3-3").click();
    await back(page).focus();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(club);
  });

  test("no horizontal scroll at 390px on the club home and on the tactics screen for every formation @contract-shape:bounded-change", async ({ page }) => {
    await openClubHome(page, "?seed=31", 7);
    expect(await overflow(page), "club home").toBeLessThanOrEqual(0);
    await tacticsButton(page).click();
    await expect(group(page)).toBeVisible();
    for (const name of [...NAMES, "4-4-2"] as const) {
      await label(page, name).click();
      await expectChosen(page, name);
      expect(await overflow(page), `tactics with ${name}`).toBeLessThanOrEqual(0);
    }
  });

  test("no console errors across club home, Tactics, each choice, Back, Squad, a player, Back, Back, Tactics @contract-shape:bounded-change", async ({ page }) => {
    const errors = watchErrors(page);
    await openTactics(page);
    for (const name of NAMES) await label(page, name).click();
    await back(page).click();
    await page.getByRole("button", { name: "Squad", exact: true }).click();
    await page.getByRole("list", { name: "Squad" }).getByRole("listitem").nth(0).getByRole("button").click();
    await back(page).click();
    await back(page).click();
    await tacticsButton(page).click();
    await expectChosen(page, "4-2-3-1");
    expect(errors).toEqual([]);
  });
});
