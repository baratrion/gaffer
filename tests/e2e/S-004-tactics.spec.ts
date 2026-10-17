// @US-1 (S-004 choose a formation)
// CONTRACT_SHAPE: e2e journey
// Outcome anchor: DISCUSS Elevator Pitch (feature-delta.md US-1): on the club home Sam taps "Tactics", then taps "4-3-3",
// and sees "4-3-3" checked and the list "Line-up" reading GK, DF, DF, DF, DF, MF, MF, MF, FW, FW, FW.
// Environment precondition: runs against local-preview (ci:serve, http://localhost:4173/gaffer/) or, via BASE_URL, the
// deployed Pages site; both serve the production build under /gaffer/. Not meant for local-dev (vite dev, :5173): waived.
// Viewport and device: the Pixel 7 profile at 390px comes from playwright.config.ts (no per-spec override).
import { expect, test, type Locator, type Page } from "@playwright/test";

const FORMATIONS = ["4-4-2", "4-3-3", "4-2-3-1"] as const;
type Formation = (typeof FORMATIONS)[number];
const LINE_UPS: Readonly<Record<Formation, readonly string[]>> = {
  "4-4-2": ["GK", "DF", "DF", "DF", "DF", "MF", "MF", "MF", "MF", "FW", "FW"],
  "4-3-3": ["GK", "DF", "DF", "DF", "DF", "MF", "MF", "MF", "FW", "FW", "FW"],
  "4-2-3-1": ["GK", "DF", "DF", "DF", "DF", "MF", "MF", "MF", "MF", "MF", "FW"],
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
const radio = (page: Page, formation: Formation): Locator => group(page).getByRole("radio", { name: formation, exact: true });
const label = (page: Page, formation: Formation): Locator => group(page).locator("label").filter({ hasText: formation });
const lineUpList = (page: Page): Locator => page.getByRole("list", { name: "Line-up" });
const lineUpCodes = async (page: Page): Promise<string[]> => (await lineUpList(page).getByRole("listitem").allInnerTexts()).map((t) => t.trim());
const count = (codes: readonly string[], code: string): number => codes.filter((c) => c === code).length;

const openTactics = async (page: Page, query = "?seed=31", clubIndex = 0) => {
  const club = await openClubHome(page, query, clubIndex);
  await tacticsButton(page).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Tactics");
  return club;
};

/** Exactly one of the three radios is checked: `formation`; its line-up is shown; the only heading is still "Tactics". */
const expectChosen = async (page: Page, formation: Formation): Promise<void> => {
  for (const other of FORMATIONS) {
    if (other === formation) await expect(radio(page, other)).toBeChecked();
    else await expect(radio(page, other)).not.toBeChecked();
  }
  expect(await lineUpCodes(page)).toEqual(LINE_UPS[formation]);
  await expect(page.getByRole("heading")).toHaveCount(1);
  await expect(page.getByRole("heading")).toHaveText("Tactics");
};

const installTapCounter = (page: Page) =>
  page.evaluate(() => {
    const w = window as unknown as { __taps: number };
    w.__taps = 0;
    document.addEventListener("click", () => void w.__taps++, true);
  });
const tapsSoFar = (page: Page): Promise<number> => page.evaluate(() => (window as unknown as { __taps: number }).__taps);
const noSidewaysScroll = (page: Page): Promise<boolean> =>
  page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth);

test.describe("@US-1 S-004 choose a formation", () => {
  test("@walking_skeleton @kpi Sam reaches a chosen formation in 2 taps from the club home, goes Back in 1 tap, and sees the choice kept after Squad @contract-shape:bounded-change", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
    page.on("pageerror", (e) => errors.push(e.message));
    const club = await openClubHome(page, "?seed=31", 0);
    expect(new URL(page.url()).pathname, "precondition: production build served under /gaffer/").toBe("/gaffer/");
    await installTapCounter(page);

    await tacticsButton(page).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Tactics");
    await label(page, "4-3-3").click();
    await expectChosen(page, "4-3-3");
    expect(await tapsSoFar(page), "club home to a chosen formation is 2 taps").toBe(2);

    await back(page).click();
    await expect(page.getByRole("heading", { level: 1 })).toContainText(club);
    expect(await tapsSoFar(page), "back to the club home is 1 more tap").toBe(3);

    await page.getByRole("button", { name: "Squad", exact: true }).click();
    await expect(page.getByRole("list", { name: "Squad" }).getByRole("listitem")).toHaveCount(18);
    await back(page).click();
    await tacticsButton(page).click();
    await expectChosen(page, "4-3-3");
    expect(errors).toEqual([]);
  });

  test("the club home keeps its club name as the only heading and gains a Tactics button after Squad @contract-shape:bounded-change", async ({ page }) => {
    const club = await openClubHome(page, "?seed=31", 0);
    await expect(page.getByRole("heading")).toHaveCount(1);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(club);
    await expect(page.getByRole("button", { name: "Squad", exact: true })).toBeVisible();
    await expect(tacticsButton(page)).toHaveCount(1);
    const buttons = await page.getByRole("button").allInnerTexts();
    expect(buttons.map((b) => b.trim()).filter((b) => b === "Squad" || b === "Tactics")).toEqual(["Squad", "Tactics"]);
  });

  test("a new game's Tactics screen has one heading, focused, a group Formation with 3 radios in order with only 4-4-2 checked, and a Line-up of 11 @contract-shape:bounded-change", async ({ page }) => {
    await openTactics(page);
    await expect(page.getByRole("heading")).toHaveCount(1);
    await expect(page.getByRole("heading", { level: 1 })).toBeFocused();
    await expect(group(page)).toHaveCount(1);
    const radios = group(page).getByRole("radio");
    await expect(radios).toHaveCount(3);
    for (const [i, formation] of FORMATIONS.entries()) {
      await expect(radios.nth(i)).toHaveAccessibleName(formation);
      await expect(page.getByRole("radio", { name: formation, exact: true }), `only one radio is named ${formation}`).toHaveCount(1);
    }
    await expectChosen(page, "4-4-2");
    await expect(lineUpList(page).getByRole("listitem")).toHaveCount(11);
    await expect(page.getByRole("list")).toHaveCount(1);
  });

  for (const [query, clubIndex] of [["?seed=31", 0], ["?seed=abc", 7]] as const) {
    test(`${query}, club ${clubIndex + 1}: every formation lines up GK first, then DF, MF, FW with the same counts at both seeds; the heading stays Tactics and focus is on the tapped radio @contract-shape:bounded-change`, async ({ page }) => {
      await openTactics(page, query, clubIndex);
      for (const formation of ["4-2-3-1", "4-3-3", "4-4-2"] as const) {
        await label(page, formation).click();
        await expectChosen(page, formation);
        await expect(radio(page, formation)).toBeFocused();
        const codes = await lineUpCodes(page);
        expect(codes).toHaveLength(11);
        expect(codes.every((c) => ["GK", "DF", "MF", "FW"].includes(c))).toBe(true);
        const [gk, df, mf, fw] = ["GK", "DF", "MF", "FW"].map((c) => count(codes, c));
        expect([gk, df, mf, fw]).toEqual(formation === "4-4-2" ? [1, 4, 4, 2] : formation === "4-3-3" ? [1, 4, 3, 3] : [1, 4, 5, 1]);
      }
    });
  }

  test("the Tactics button, the Back button and each formation label are 44px or taller, and tapping a label checks its radio @contract-shape:bounded-change", async ({ page }) => {
    await openClubHome(page, "?seed=31", 0);
    expect((await tacticsButton(page).boundingBox())?.height ?? 0, "Tactics button").toBeGreaterThanOrEqual(44);
    await tacticsButton(page).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Tactics");
    expect((await back(page).boundingBox())?.height ?? 0, "Back button").toBeGreaterThanOrEqual(44);
    for (const formation of FORMATIONS) {
      expect((await label(page, formation).boundingBox())?.height ?? 0, `${formation} label`).toBeGreaterThanOrEqual(44);
      await label(page, formation).click();
      await expect(radio(page, formation)).toBeChecked();
    }
  });

  test("the choice is kept: 4-3-3, Back, Squad, a player, Back, Back, Tactics shows 4-3-3 checked with its line-up @contract-shape:bounded-change", async ({ page }) => {
    const club = await openTactics(page);
    await label(page, "4-3-3").click();
    await back(page).click();
    await expect(page.getByRole("heading", { level: 1 })).toContainText(club);
    await page.getByRole("button", { name: "Squad", exact: true }).click();
    await page.getByRole("list", { name: "Squad" }).getByRole("listitem").first().getByRole("button").click();
    await back(page).click();
    await back(page).click();
    await expect(page.getByRole("heading", { level: 1 })).toContainText(club);
    await tacticsButton(page).click();
    await expectChosen(page, "4-3-3");
  });

  for (const [query, clubIndex] of [["?seed=31", 7], ["?seed=abc", 0]] as const) {
    test(`a fresh visit of ${query}: New game, club ${clubIndex + 1}, Tactics shows only 4-4-2 checked with 1 GK, 4 DF, 4 MF, 2 FW @error @contract-shape:bounded-change`, async ({ page }) => {
      await openTactics(page, query, clubIndex);
      await expectChosen(page, "4-4-2");
    });
  }

  test("pressing ArrowRight on the focused radio checks the next formation, shows its line-up, keeps the heading and keeps focus on that radio @contract-shape:bounded-change", async ({ page }) => {
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

  test("@error tapping the formation that is already chosen changes nothing @contract-shape:bounded-change", async ({ page }) => {
    await openTactics(page);
    await label(page, "4-4-2").click();
    await expectChosen(page, "4-4-2");
    await label(page, "4-3-3").click();
    await label(page, "4-3-3").click();
    await expectChosen(page, "4-3-3");
  });

  test("focus moves to the new heading when Sam navigates: Tactics, Back, Squad, Back @contract-shape:bounded-change", async ({ page }) => {
    const club = await openTactics(page);
    await expect(page.getByRole("heading", { level: 1 })).toBeFocused();
    await back(page).click();
    await expect(page.getByRole("heading", { level: 1 })).toContainText(club);
    await expect(page.getByRole("heading", { level: 1 })).toBeFocused();
    await page.getByRole("button", { name: "Squad", exact: true }).click();
    await expect(page.getByRole("list", { name: "Squad" })).toBeVisible();
    await expect(page.getByRole("heading", { level: 1 })).toBeFocused();
    await back(page).click();
    await expect(page.getByRole("heading", { level: 1 })).toBeFocused();
  });

  test("neither the club home nor the Tactics screen scrolls sideways at 390px, whichever formation is chosen @contract-shape:bounded-change", async ({ page }) => {
    await openClubHome(page, "?seed=abc", 7);
    expect(await noSidewaysScroll(page), "club home").toBe(true);
    await tacticsButton(page).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Tactics");
    for (const formation of FORMATIONS) {
      await label(page, formation).click();
      await expectChosen(page, formation);
      expect(await noSidewaysScroll(page), `tactics with ${formation}`).toBe(true);
    }
  });

  test("no console errors across club home, Tactics, each choice, Back, Squad, a player, Back, Back, Tactics @contract-shape:bounded-change", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
    page.on("pageerror", (e) => errors.push(e.message));
    await openTactics(page);
    for (const formation of FORMATIONS) await label(page, formation).click();
    await radio(page, "4-2-3-1").focus();
    await page.keyboard.press("ArrowLeft");
    await back(page).click();
    await page.getByRole("button", { name: "Squad", exact: true }).click();
    await page.getByRole("list", { name: "Squad" }).getByRole("listitem").first().getByRole("button").click();
    await back(page).click();
    await back(page).click();
    await tacticsButton(page).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Tactics");
    expect(errors).toEqual([]);
  });
});
