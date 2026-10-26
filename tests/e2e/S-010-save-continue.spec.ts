// @US-1 @US-2 (S-010 save and continue my season) held out until DELIVER
// CONTRACT_SHAPE: bounded-change
import { expect, test, type Locator, type Page } from "@playwright/test";
import { DAMAGED_SAVE_TEXT, INCOMPATIBLE_SAVE_TEXT, SAVE_KEY, SEED_31_SAVE_TEXT } from "../acceptance/S-010/save-golden";
const heading = (page: Page): Locator => page.getByRole("heading", { level: 1 });
const button = (page: Page, name: string): Locator => page.getByRole("button", { name, exact: true });
const overflow = (page: Page): Promise<number> => page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
const tall = async (target: Locator): Promise<void> => expect((await target.boundingBox())?.height ?? 0).toBeGreaterThanOrEqual(44);
const watchErrors = (page: Page): string[] => {
  const errors: string[] = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(e.message));
  return errors;
};
const flag = (page: Page, name: string): Promise<void> => page.evaluate((n) => void (document.cookie = `${n}=1`), name);
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
/** Taps "Play match" and "Back" `count` times from the club home; returns the Matchday heading and score line of each. */
const playMatches = async (page: Page, club: string, count: number | readonly [number, number]): Promise<string[]> => {
  const [first, last] = typeof count === "number" ? [1, count] : count;
  const seen: string[] = [];
  for (let matchday = first; matchday <= last; matchday++) {
    await button(page, "Play match").click();
    await expect(heading(page)).toHaveText(`Matchday ${matchday}`);
    seen.push((await page.getByText(/^.+ \d–\d .+$/).first().innerText()).trim());
    await button(page, "Back").click();
    await expect(heading(page)).toHaveText(club);
  }
  return seen;
};
/** The League table as Sam reads it: one string per row (name, then every cell). Returns to the club home. */
const readTable = async (page: Page, club: string): Promise<string[]> => {
  await button(page, "Table").click();
  const rows = (await page.getByRole("table", { name: "League table", exact: true }).getByRole("row").all()).slice(1);
  const text = await Promise.all(rows.map(async (row) => `${(await row.getByRole("rowheader").innerText()).trim()} ${(await row.getByRole("cell").allInnerTexts()).map((c) => c.trim()).join(" ")}`));
  await button(page, "Back").click();
  await expect(heading(page)).toHaveText(club);
  return text;
};
/** Seeds `gaffer.save` once per tab, before the game loads. */
const seedOnce = (page: Page, text: string) =>
  page.addInitScript(([key, value]) => {
    if (sessionStorage.getItem("seeded") === null) {
      sessionStorage.setItem("seeded", "1");
      localStorage.setItem(key!, value!);
    }
  }, [SAVE_KEY, text]);
test.describe("@US-1 S-010 Continue picks the season up where it was left", () => {
  test("@walking_skeleton @driving_port After two matches a reload offers Continue above New game (44px, Gaffer focused), Continue lands on the focused club home with the same table, and Play match is Matchday 3 in 2 taps @contract-shape:bounded-change", async ({ page }) => {
    const errors = watchErrors(page);
    const club = await startSeason(page, "?seed=31");
    await playMatches(page, club, 2);
    const before = await readTable(page, club);
    expect(before[7]).toBe("Netherwold Borough 8 2 0 0 2 -2 0");
    await page.reload();
    await expect(heading(page)).toHaveText("Gaffer");
    await expect(heading(page)).toBeFocused();
    await expect(page.getByRole("heading")).toHaveCount(1);
    await tall(button(page, "Continue"));
    await tall(button(page, "New game"));
    expect((await button(page, "Continue").boundingBox())!.y).toBeLessThan((await button(page, "New game").boundingBox())!.y);
    expect(await overflow(page)).toBeLessThanOrEqual(0);
    await page.evaluate(() => {
      const w = window as unknown as { __taps: number };
      w.__taps = 0;
      document.addEventListener("pointerdown", () => void w.__taps++, true);
    });
    await button(page, "Continue").click();
    await expect(heading(page)).toHaveText(club);
    await expect(heading(page)).toBeFocused();
    expect(await page.evaluate(() => (window as unknown as { __taps: number }).__taps)).toBe(1);
    expect(await readTable(page, club)).toEqual(before);
    await button(page, "Play match").click();
    await expect(heading(page)).toHaveText("Matchday 3");
    await expect(page.getByText("Netherwold Borough 2–1 Oakhampton Rise Borough", { exact: true })).toBeVisible();
    expect(await overflow(page)).toBeLessThanOrEqual(0);
    expect(errors).toEqual([]);
  });
  test("@boundary Continue ignores the address's seed: a seed-31 save opened at ?seed=abc still lands on Netherwold Borough at Matchday 3, and New game there lists the other league @contract-shape:bounded-change", async ({ page }) => {
    const errors = watchErrors(page);
    const club = await startSeason(page, "?seed=31");
    await playMatches(page, club, 2);
    await page.goto("./?seed=abc");
    await button(page, "New game").click();
    await expect(page.getByRole("list", { name: "Clubs" }).getByRole("button").filter({ hasText: "Valebridge Town" })).toHaveCount(1);
    await page.goto("./?seed=abc");
    await button(page, "Continue").click();
    await expect(heading(page)).toHaveText("Netherwold Borough");
    await button(page, "Play match").click();
    await expect(heading(page)).toHaveText("Matchday 3");
    await expect(page.getByText("Netherwold Borough 2–1 Oakhampton Rise Borough", { exact: true })).toBeVisible();
    expect(errors).toEqual([]);
  });
});
test.describe("@US-1 S-010 New game and Play again replace the saved game only once a club is picked", () => {
  test("@boundary Tapping New game does not remove the save (a reload still offers Continue and the old season); picking a club replaces it (a reload resumes the new game at Matchday 1) @contract-shape:bounded-change", async ({ page }) => {
    const errors = watchErrors(page);
    const club = await startSeason(page, "?seed=31");
    await playMatches(page, club, 2);
    await page.reload();
    await button(page, "New game").click();
    await expect(heading(page)).toHaveText("Choose your club");
    await page.reload();
    await button(page, "Continue").click();
    await expect(heading(page)).toHaveText(club);
    expect((await readTable(page, club))[7]).toBe("Netherwold Borough 8 2 0 0 2 -2 0");
    await page.reload();
    await button(page, "New game").click();
    await page.getByRole("list", { name: "Clubs" }).getByRole("button").nth(0).click();
    await page.reload();
    await button(page, "Continue").click();
    await button(page, "Play match").click();
    await expect(heading(page)).toHaveText("Matchday 1");
    expect(errors).toEqual([]);
  });
  test("@boundary A finished season, Play again and a reload before a club is picked: Continue still lands on the finished season's club home with End of season @contract-shape:bounded-change", async ({ page }) => {
    test.setTimeout(90_000);
    const errors = watchErrors(page);
    const club = await startSeason(page, "?seed=31");
    await playMatches(page, club, 14);
    await button(page, "End of season").click();
    const lines = (await page.getByText(/^(Final position|Top scorer) /).allInnerTexts()).map((t) => t.trim());
    expect(lines).toHaveLength(2);
    await button(page, "Play again").click();
    await expect(heading(page)).toHaveText("Choose your club");
    await page.reload();
    await button(page, "Continue").click();
    await expect(heading(page)).toHaveText(club);
    await expect(button(page, "Play match")).toHaveCount(0);
    await button(page, "End of season").click();
    expect((await page.getByText(/^(Final position|Top scorer) /).allInnerTexts()).map((t) => t.trim())).toEqual(lines);
    expect(errors).toEqual([]);
  });
});
test.describe("@US-2 S-010 Continue keeps my team sheet", () => {
  test("@boundary Sam chooses 4-3-3 and puts a player from outside the eleven into the last midfield slot; after a reload and Continue, 4-3-3 is checked and Starting XI lists the same 11 slots in the same order @contract-shape:bounded-change", async ({ page }) => {
    const errors = watchErrors(page);
    const club = await startSeason(page, "?seed=31");
    await button(page, "Tactics").click();
    await page.getByRole("radiogroup", { name: "Formation" }).getByText("4-3-3", { exact: true }).click();
    await button(page, "Back").click();
    await button(page, "Starting XI").click();
    const slots = page.getByRole("list", { name: "Starting XI" }).getByRole("button");
    await slots.filter({ hasText: /^MF/ }).last().click();
    await page.getByRole("list", { name: "Players" }).getByRole("button").filter({ hasNotText: "Starting" }).first().click();
    const eleven = (await slots.allInnerTexts()).map((t) => t.trim());
    expect(eleven).toHaveLength(11);
    await button(page, "Back").click();
    await expect(heading(page)).toHaveText(club);
    await page.reload();
    await button(page, "Continue").click();
    await button(page, "Tactics").click();
    await expect(page.getByRole("radio", { name: "4-3-3", exact: true })).toBeChecked();
    await button(page, "Back").click();
    await button(page, "Starting XI").click();
    expect((await slots.allInnerTexts()).map((t) => t.trim())).toEqual(eleven);
    expect(errors).toEqual([]);
  });
});
test.describe("@US-2 S-010 a bad or unavailable store never gets in the way", () => {
  for (const [what, text] of [["damaged (the first 100 characters)", DAMAGED_SAVE_TEXT], ["from version 0", INCOMPATIBLE_SAVE_TEXT], ["foreign text", "hello from another project"]] as const) {
    test(`@error A saved game ${what} is ignored: no Continue, no console error, and the first club pick replaces it @contract-shape:bounded-change`, async ({ page }) => {
      const errors = watchErrors(page);
      await seedOnce(page, text);
      await page.goto("./?seed=31");
      await expect(button(page, "Continue")).toHaveCount(0);
      await expect(button(page, "New game")).toBeVisible();
      const club = await startSeason(page, "?seed=31");
      await playMatches(page, club, 1);
      await page.reload();
      await button(page, "Continue").click();
      await button(page, "Play match").click();
      await expect(heading(page)).toHaveText("Matchday 2");
      expect(errors).toEqual([]);
    });
  }
  test("@error Blocked storage: no Continue, two matches play and every Table row reads P 2, a reload offers nothing, no console error @contract-shape:bounded-change", async ({ page }) => {
    const errors = watchErrors(page);
    await page.addInitScript(() => Object.defineProperty(window, "localStorage", { get: () => { throw new DOMException("blocked", "SecurityError"); } }));
    await page.goto("./?seed=31");
    await expect(button(page, "Continue")).toHaveCount(0);
    const club = await startSeason(page, "?seed=31");
    await playMatches(page, club, 2);
    expect((await readTable(page, club)).every((row) => row.split(" ").at(-6) === "2")).toBe(true);
    await page.reload();
    await expect(button(page, "Continue")).toHaveCount(0);
    await expect(button(page, "New game")).toBeVisible();
    expect(errors).toEqual([]);
  });
  test("@error Storage full at load with a valid save inside: no Continue, play goes on, and once writes work again a reload still offers nothing (the stored game was removed) @contract-shape:bounded-change", async ({ page }) => {
    const errors = watchErrors(page);
    await page.addInitScript(([key, value]) => {
      if (sessionStorage.getItem("seeded") === null) {
        sessionStorage.setItem("seeded", "1");
        localStorage.setItem(key!, value!);
      }
      const real = Storage.prototype.setItem;
      Storage.prototype.setItem = function (k: string, v: string) {
        if (!document.cookie.includes("writable=1")) throw new DOMException("full", "QuotaExceededError");
        return real.call(this, k, v);
      };
    }, [SAVE_KEY, SEED_31_SAVE_TEXT]);
    await page.goto("./?seed=31");
    await expect(button(page, "Continue")).toHaveCount(0);
    const club = await startSeason(page, "?seed=31");
    await playMatches(page, club, 1);
    expect((await readTable(page, club)).every((row) => row.split(" ").at(-6) === "1")).toBe(true);
    await flag(page, "writable");
    await page.reload();
    await expect(button(page, "Continue")).toHaveCount(0);
    await expect(button(page, "New game")).toBeVisible();
    expect(errors).toEqual([]);
  });
  test("@error Storage that fills up during play: after matchday 2 is saved only writes to the saved game fail; matchday 3 plays, and a reload offers no stale Continue (the store itself works) @contract-shape:bounded-change", async ({ page }) => {
    const errors = watchErrors(page);
    await page.addInitScript(() => {
      const real = Storage.prototype.setItem;
      Storage.prototype.setItem = function (k: string, v: string) {
        if (k === "gaffer.save" && document.cookie.includes("failing=1")) throw new DOMException("full", "QuotaExceededError");
        return real.call(this, k, v);
      };
    });
    const club = await startSeason(page, "?seed=31");
    await playMatches(page, club, 2);
    await flag(page, "failing");
    await playMatches(page, club, [3, 3]);
    await page.reload();
    await expect(button(page, "Continue")).toHaveCount(0);
    await expect(button(page, "New game")).toBeVisible();
    expect(errors).toEqual([]);
  });
});
