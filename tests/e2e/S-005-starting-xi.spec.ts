// @US-1 @US-2 @US-3 (S-005 pick my starting XI)
// CONTRACT_SHAPE: bounded-change
// Outcome anchor: DISCUSS Elevator Pitch (feature-delta.md US-1..US-3): on Netherwold Borough's home Sam taps "Starting XI" and
// sees 11 buttons from "GK Tamsin Ingleby 17" to "FW Garrick Thistlewood 5"; taps "MF Dorian Dunmore 7", sees "Choose MF" with 6
// midfielders, taps "Kestrel Northcott 6", and the slot reads "MF Kestrel Northcott 6"; the pick survives Squad and Tactics.
// Environment precondition: runs against local-preview (ci:serve, http://localhost:4173/gaffer/) or, via BASE_URL, the
// deployed Pages site; both serve the production build under /gaffer/. Not meant for local-dev (vite dev, :5173): waived.
// Environment probe (ADR-0009 Earned Trust): exact-name queries, textContent and innerText equality, scroll width.
// Destination: tests/e2e/S-005-starting-xi.spec.ts (DELIVER step 03).
import { expect, test, type Locator, type Page } from "@playwright/test";

// Viewport and device: the Pixel 7 profile at 390px comes from playwright.config.ts (no per-spec override).

type Formation = "4-4-2" | "4-3-3" | "4-2-3-1";

// Expected elevens, written out from DISCUSS US-1 (real generator rows), independent of the code under test.
const NETHERWOLD_442 = [
  "GK Tamsin Ingleby 17", "DF Bram Pemberly 19", "DF Calder Ashcombe 18", "DF Quill Crossley 4", "DF Quill Yarrow 3",
  "MF Ivo Elderkin 18", "MF Joren Dalrymple 16", "MF Calder Redfern 15", "MF Dorian Dunmore 7",
  "FW Merrick Hartwell 8", "FW Garrick Thistlewood 5",
] as const;
const NETHERWOLD_433 = [
  "GK Tamsin Ingleby 17", "DF Bram Pemberly 19", "DF Calder Ashcombe 18", "DF Quill Crossley 4", "DF Quill Yarrow 3",
  "MF Ivo Elderkin 18", "MF Joren Dalrymple 16", "MF Calder Redfern 15",
  "FW Merrick Hartwell 8", "FW Garrick Thistlewood 5", "FW Finlay Fitch-Moreton 5",
] as const;
const NETHERWOLD_4231 = [
  "GK Tamsin Ingleby 17", "DF Bram Pemberly 19", "DF Calder Ashcombe 18", "DF Quill Crossley 4", "DF Quill Yarrow 3",
  "MF Ivo Elderkin 18", "MF Joren Dalrymple 16", "MF Calder Redfern 15", "MF Dorian Dunmore 7", "MF Kestrel Northcott 6",
  "FW Merrick Hartwell 8",
] as const;
const OAKHAMPTON_442 = [
  "GK Alden Hartwell 17", "DF Wystan Redfern 14", "DF Ulric O'Garrity 8", "DF Soren Dalrymple 8", "DF Perrin Dunmore 6",
  "MF Niall Stanhope 20", "MF Alden Underby 17", "MF Tamsin Stanhope 12", "MF Ulric Everleigh 8",
  "FW Joren Northcott 19", "FW Bram Stanhope 9",
] as const;
const OAKHAMPTON_433 = [
  "GK Alden Hartwell 17", "DF Wystan Redfern 14", "DF Ulric O'Garrity 8", "DF Soren Dalrymple 8", "DF Perrin Dunmore 6",
  "MF Niall Stanhope 20", "MF Alden Underby 17", "MF Tamsin Stanhope 12",
  "FW Joren Northcott 19", "FW Bram Stanhope 9", "FW Cormac Marwood 6",
] as const;
const OAKHAMPTON_4231 = [
  "GK Alden Hartwell 17", "DF Wystan Redfern 14", "DF Ulric O'Garrity 8", "DF Soren Dalrymple 8", "DF Perrin Dunmore 6",
  "MF Niall Stanhope 20", "MF Alden Underby 17", "MF Tamsin Stanhope 12", "MF Ulric Everleigh 8", "MF Orrin Lockhart 2",
  "FW Joren Northcott 19",
] as const;

const withSlot = (xi: readonly string[], slot: number, label: string): string[] => xi.map((text, index) => (index === slot ? label : text));

// Netherwold Borough's 4-4-2 choose lists, in squad order, written out from the squad rows in DISCUSS.
const CHOOSE_442: readonly { code: "GK" | "DF" | "MF" | "FW"; tap: string; players: readonly string[]; starters: number }[] = [
  { code: "GK", tap: "GK Tamsin Ingleby 17", players: ["Tamsin Ingleby 17 Starting", "Alden Zealby 11"], starters: 1 },
  {
    code: "DF", tap: "DF Quill Crossley 4", starters: 4,
    players: ["Quill Yarrow 3 Starting", "Calder Ashcombe 18 Starting", "Calder Kilbride 3", "Dacey Jessamy 3", "Quill Crossley 4 Starting", "Bram Pemberly 19 Starting"],
  },
  {
    code: "MF", tap: "MF Dorian Dunmore 7", starters: 4,
    players: ["Calder Redfern 15 Starting", "Ivo Elderkin 18 Starting", "Dorian Dunmore 7 Starting", "Finlay Ballantyne 3", "Joren Dalrymple 16 Starting", "Kestrel Northcott 6"],
  },
  { code: "FW", tap: "FW Garrick Thistlewood 5", players: ["Garrick Thistlewood 5 Starting", "Emlyn Vexford 2", "Finlay Fitch-Moreton 5", "Merrick Hartwell 8 Starting"], starters: 2 },
];

const heading = (page: Page): Locator => page.getByRole("heading", { level: 1 });
const button = (page: Page, name: string): Locator => page.getByRole("button", { name, exact: true });
const back = (page: Page): Locator => button(page, "Back");
const xiList = (page: Page): Locator => page.getByRole("list", { name: "Starting XI" });
const playersList = (page: Page): Locator => page.getByRole("list", { name: "Players" });
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

const openStartingXI = async (page: Page, query = "?seed=31", clubIndex = 0): Promise<string> => {
  const club = await openClubHome(page, query, clubIndex);
  await button(page, "Starting XI").click();
  await expect(heading(page)).toHaveText("Starting XI");
  return club;
};

const chooseFormation = async (page: Page, formation: Formation): Promise<void> => {
  await button(page, "Tactics").click();
  await page.getByRole("radiogroup", { name: "Formation" }).getByText(formation, { exact: true }).click();
  await expect(page.getByRole("radio", { name: formation, exact: true })).toBeChecked();
  await back(page).click();
};

/** Asserts the whole Starting XI screen as Sam reads it: one heading, one list of 11 one-button items, exact texts. */
const expectXI = async (page: Page, expected: readonly string[]): Promise<void> => {
  await expect(page.getByRole("heading")).toHaveCount(1);
  await expect(heading(page)).toHaveText("Starting XI");
  await expect(heading(page)).toBeFocused();
  await expect(page.getByRole("list")).toHaveCount(1);
  const items = xiList(page).getByRole("listitem");
  await expect(items).toHaveCount(11);
  const buttons = xiList(page).getByRole("button");
  await expect(buttons).toHaveCount(11);
  for (let index = 0; index < 11; index++) await expect(items.nth(index).getByRole("button")).toHaveCount(1);
  expect(await buttons.allTextContents(), "textContent of the 11 slots").toEqual([...expected]);
  expect(await buttons.allInnerTexts(), "innerText of the 11 slots (one line each)").toEqual([...expected]);
  for (const [index, text] of expected.entries()) {
    await expect(buttons.nth(index)).toHaveAccessibleName(text);
    await expect(xiList(page).getByRole("button", { name: text, exact: true })).toHaveCount(1);
  }
  expect(new Set(await buttons.allTextContents()).size, "11 different players").toBe(11);
};

const expectChoose = async (page: Page, code: string, expected: readonly string[]): Promise<void> => {
  await expect(page.getByRole("heading")).toHaveCount(1);
  await expect(heading(page)).toHaveText(`Choose ${code}`);
  await expect(heading(page)).toBeFocused();
  await expect(page.getByRole("list")).toHaveCount(1);
  await expect(playersList(page).getByRole("listitem")).toHaveCount(expected.length);
  const buttons = playersList(page).getByRole("button");
  await expect(buttons).toHaveCount(expected.length);
  for (let index = 0; index < expected.length; index++) await expect(playersList(page).getByRole("listitem").nth(index).getByRole("button")).toHaveCount(1);
  expect(await buttons.allTextContents(), "textContent of the choices").toEqual([...expected]);
  expect(await buttons.allInnerTexts(), "innerText of the choices").toEqual([...expected]);
  for (const [index, text] of expected.entries()) await expect(buttons.nth(index)).toHaveAccessibleName(text);
};

const expectTall = async (locator: Locator, what: string): Promise<void> => {
  for (const [index, item] of (await locator.all()).entries()) {
    expect((await item.boundingBox())?.height ?? 0, `${what} ${index}`).toBeGreaterThanOrEqual(44);
  }
};

test.describe("@US-1 S-005 see my best eleven at once", () => {
  test("@walking_skeleton @kpi Sam taps Starting XI (1 tap), sees the automatic eleven with focus on its heading, taps Back (1 tap) to the club home @contract-shape:bounded-change", async ({ page }) => {
    const errors = watchErrors(page);
    const club = await openClubHome(page, "?seed=31", 0);
    expect(new URL(page.url()).pathname, "precondition: production build served under /gaffer/").toBe("/gaffer/");
    await installTapCounter(page);
    expect((await button(page, "Starting XI").boundingBox())?.height ?? 0, "Starting XI button").toBeGreaterThanOrEqual(44);

    await button(page, "Starting XI").click();
    expect(await tapsSoFar(page), "club home to a complete XI is 1 tap").toBe(1);
    await expectXI(page, NETHERWOLD_442);
    await expectTall(xiList(page).getByRole("button"), "slot");
    expect((await back(page).boundingBox())?.height ?? 0, "Back").toBeGreaterThanOrEqual(44);

    await back(page).click();
    expect(await tapsSoFar(page), "back home is 1 more tap").toBe(2);
    await expect(page.getByRole("heading")).toHaveCount(1);
    await expect(heading(page)).toContainText(club);
    await expect(heading(page)).toBeFocused();
    await expect(xiList(page)).toHaveCount(0);
    await expect(button(page, "Squad")).toBeVisible();
    await expect(button(page, "Tactics")).toBeVisible();
    expect(errors).toEqual([]);
  });

  test("Starting XI is the third of four club home buttons, after Squad and Tactics, before Play match @contract-shape:bounded-change", async ({ page }) => {
    await openClubHome(page, "?seed=31", 0);
    const names = await page.getByRole("button").allInnerTexts();
    expect(names.map((name) => name.trim())).toEqual(["Squad", "Tactics", "Starting XI", "Play match"]);
  });

  for (const [query, clubIndex, formation, expected] of [
    ["?seed=31", 0, "4-3-3", NETHERWOLD_433],
    ["?seed=31", 0, "4-2-3-1", NETHERWOLD_4231],
    ["?seed=abc", 7, "4-3-3", OAKHAMPTON_433],
    ["?seed=abc", 7, "4-2-3-1", OAKHAMPTON_4231],
  ] as const) {
    test(`an XI never changed follows the formation: ${formation} at ${query} (club ${clubIndex}) @example @contract-shape:bounded-change`, async ({ page }) => {
      await openClubHome(page, query, clubIndex);
      await chooseFormation(page, formation);
      await button(page, "Starting XI").click();
      await expectXI(page, expected);
    });
  }

  test("a new game at ?seed=abc (the default seed) shows Oakhampton Rise Borough's automatic 4-4-2 eleven with no formation chosen @example @contract-shape:bounded-change", async ({ page }) => {
    await openStartingXI(page, "?seed=abc", 7);
    await expectXI(page, OAKHAMPTON_442);
  });

  test("the same ?seed= in a second fresh page gives the same eleven @boundary @contract-shape:bounded-change", async ({ page, context }) => {
    await openStartingXI(page, "?seed=31", 0);
    await expectXI(page, NETHERWOLD_442);
    const second = await context.newPage();
    await openStartingXI(second, "?seed=31", 0);
    await expectXI(second, NETHERWOLD_442);
  });

  for (const [query, clubIndex] of [["?seed=31", 0], ["?seed=abc", 7], ["?seed=7", 2]] as const) {
    test(`every name, position and overall on the Starting XI equals the Squad list, and no one outside it is better in his position (${query}, club ${clubIndex}, every formation) @property @contract-shape:bounded-change`, async ({ page }) => {
      await openClubHome(page, query, clubIndex);
      await button(page, "Squad").click();
      const rows = (await page.getByRole("list", { name: "Squad" }).getByRole("button").allInnerTexts()).map((text) => {
        const [name = "", position = "", , overall = ""] = text.split("\n").map((line) => line.trim());
        return { name, position, overall: Number(overall) };
      });
      expect(rows).toHaveLength(18);
      await back(page).click();

      for (const formation of ["4-4-2", "4-3-3", "4-2-3-1"] as const) {
        if (formation !== "4-4-2") await chooseFormation(page, formation);
        await button(page, "Starting XI").click();
        const shown = (await xiList(page).getByRole("button").allTextContents()).map((text) => {
          const [code = "", ...rest] = text.split(" ");
          const overall = Number(rest.pop());
          return { code, name: rest.join(" "), overall };
        });
        expect(shown).toHaveLength(11);
        for (const starter of shown) {
          const row = rows.find((candidate) => candidate.name === starter.name);
          expect(row, `${starter.name} is in the squad`).toBeDefined();
          expect(row?.position).toBe(starter.code);
          expect(row?.overall).toBe(starter.overall);
        }
        expect(new Set(shown.map((starter) => starter.name)).size).toBe(11);
        for (const code of ["GK", "DF", "MF", "FW"]) {
          const starters = shown.filter((starter) => starter.code === code);
          const lowestStarter = Math.min(...starters.map((starter) => starter.overall));
          const best = rows.filter((row) => row.position === code && !starters.some((starter) => starter.name === row.name));
          for (const outsider of best) expect(outsider.overall, `${outsider.name} sits out`).toBeLessThanOrEqual(lowestStarter);
        }
        await back(page).click();
      }
    });
  }

  test("@environment-probe an apostrophe name and a hyphenated name read exactly, in the accessible name, textContent and innerText, on one line @contract-shape:bounded-change", async ({ page }) => {
    await openStartingXI(page, "?seed=abc", 7);
    const apostrophe = xiList(page).getByRole("button", { name: "DF Ulric O'Garrity 8", exact: true });
    await expect(apostrophe).toHaveCount(1);
    expect(await apostrophe.textContent()).toBe("DF Ulric O'Garrity 8");
    expect(await apostrophe.innerText()).toBe("DF Ulric O'Garrity 8");

    await openClubHome(page, "?seed=31", 0);
    await chooseFormation(page, "4-3-3");
    await button(page, "Starting XI").click();
    const hyphen = xiList(page).getByRole("button", { name: "FW Finlay Fitch-Moreton 5", exact: true });
    await expect(hyphen).toHaveCount(1);
    expect(await hyphen.textContent()).toBe("FW Finlay Fitch-Moreton 5");
    expect(await hyphen.innerText()).toBe("FW Finlay Fitch-Moreton 5");
  });
});

test.describe("@US-2 S-005 put the player I believe in into a slot", () => {
  test("@walking_skeleton @kpi Sam taps MF Dorian Dunmore 7, sees Choose MF with 6 midfielders, taps Kestrel Northcott 6 (2 taps from Starting XI, 3 from the club home), and the 9th slot reads MF Kestrel Northcott 6 @contract-shape:bounded-change", async ({ page }) => {
    const errors = watchErrors(page);
    await openClubHome(page, "?seed=31", 0);
    await installTapCounter(page);
    await button(page, "Starting XI").click();
    await button(page, "MF Dorian Dunmore 7").click();
    await expectChoose(page, "MF", CHOOSE_442[2]!.players);
    await expectTall(playersList(page).getByRole("button"), "choice");
    expect((await back(page).boundingBox())?.height ?? 0, "Back").toBeGreaterThanOrEqual(44);

    await button(page, "Kestrel Northcott 6").click();
    expect(await tapsSoFar(page), "club home to a changed starter is 3 taps").toBe(3);
    await expectXI(page, withSlot(NETHERWOLD_442, 8, "MF Kestrel Northcott 6"));
    await expect(page.getByRole("button", { name: "Dorian Dunmore" })).toHaveCount(0);
    expect(errors).toEqual([]);
  });

  test("picking a starter of another slot swaps the two: Joren Dalrymple 16 Starting into MF Ivo Elderkin 18's slot puts Elderkin in the 7th @example @contract-shape:bounded-change", async ({ page }) => {
    await openStartingXI(page);
    await button(page, "MF Ivo Elderkin 18").click();
    await button(page, "Joren Dalrymple 16 Starting").click();
    await expectXI(page, withSlot(withSlot(NETHERWOLD_442, 5, "MF Joren Dalrymple 16"), 6, "MF Ivo Elderkin 18"));
  });

  test("a second pick after a first one keeps the first (Northcott for Dunmore, then the swap of Elderkin and Dalrymple) @example @contract-shape:bounded-change", async ({ page }) => {
    await openStartingXI(page);
    await button(page, "MF Dorian Dunmore 7").click();
    await button(page, "Kestrel Northcott 6").click();
    await button(page, "MF Ivo Elderkin 18").click();
    await button(page, "Joren Dalrymple 16 Starting").click();
    await expectXI(page, withSlot(withSlot(withSlot(NETHERWOLD_442, 8, "MF Kestrel Northcott 6"), 5, "MF Joren Dalrymple 16"), 6, "MF Ivo Elderkin 18"));
    await button(page, "MF Kestrel Northcott 6").click();
    await expectChoose(page, "MF", ["Calder Redfern 15 Starting", "Ivo Elderkin 18 Starting", "Dorian Dunmore 7", "Finlay Ballantyne 3", "Joren Dalrymple 16 Starting", "Kestrel Northcott 6 Starting"]);
  });

  for (const { code, tap, players, starters } of CHOOSE_442) {
    test(`tapping ${tap} opens Choose ${code} with ${players.length} players in squad order, exactly ${starters} marked Starting, and Back changes nothing @contract-shape:bounded-change`, async ({ page }) => {
      await openStartingXI(page);
      await button(page, tap).click();
      await expectChoose(page, code, players);
      expect(players.filter((text) => text.endsWith(" Starting")).length).toBe(starters);
      await expectTall(playersList(page).getByRole("button"), "choice");
      await back(page).click();
      await expectXI(page, NETHERWOLD_442);
    });
  }

  test("the slot's own player changes nothing: Oakhampton Rise Borough's GK Alden Hartwell 17 then Alden Hartwell 17 Starting @boundary @contract-shape:bounded-change", async ({ page }) => {
    await openStartingXI(page, "?seed=abc", 7);
    await button(page, "GK Alden Hartwell 17").click();
    await expectChoose(page, "GK", ["Dacey Marwood 6", "Alden Hartwell 17 Starting"]);
    await button(page, "Alden Hartwell 17 Starting").click();
    await expectXI(page, OAKHAMPTON_442);
  });

  test("Back from an open slot changes nothing: FW Joren Northcott 19 then Back, with focus on the Starting XI heading @boundary @contract-shape:bounded-change", async ({ page }) => {
    await openStartingXI(page, "?seed=abc", 7);
    await button(page, "FW Joren Northcott 19").click();
    await expect(heading(page)).toHaveText("Choose FW");
    await back(page).click();
    await expectXI(page, OAKHAMPTON_442);
  });

  test("the choose screen shows no age, attributes or condition: each choice is only a name, an overall and maybe Starting @boundary @contract-shape:bounded-change", async ({ page }) => {
    await openStartingXI(page);
    await button(page, "DF Quill Crossley 4").click();
    for (const text of await playersList(page).getByRole("button").allInnerTexts()) expect(text).toMatch(/^[^\d\n]+ \d{1,2}( Starting)?$/);
    await expect(page.getByText(/Age|Condition|Goalkeeping|Defending|Passing|Shooting/)).toHaveCount(0);
  });
});

test.describe("@US-3 S-005 keep my XI for the session", () => {
  const pickNorthcott = async (page: Page): Promise<string[]> => {
    await openStartingXI(page);
    await button(page, "MF Dorian Dunmore 7").click();
    await button(page, "Kestrel Northcott 6").click();
    return withSlot(NETHERWOLD_442, 8, "MF Kestrel Northcott 6");
  };

  test("@walking_skeleton the pick is kept while Sam taps Back, Squad, Calder Redfern's row, Back, Back, Tactics, 4-4-2 (already checked), Back and Starting XI @contract-shape:bounded-change", async ({ page }) => {
    const errors = watchErrors(page);
    const picked = await pickNorthcott(page);
    await back(page).click();
    await button(page, "Squad").click();
    await page.getByRole("list", { name: "Squad" }).getByRole("button").filter({ hasText: "Calder Redfern" }).click();
    await expect(heading(page)).toHaveText("Calder Redfern");
    await back(page).click();
    await back(page).click();
    await button(page, "Tactics").click();
    await page.getByRole("radiogroup", { name: "Formation" }).getByText("4-4-2", { exact: true }).click();
    await expect(page.getByRole("radio", { name: "4-4-2", exact: true })).toBeChecked();
    await back(page).click();
    await button(page, "Starting XI").click();
    await expectXI(page, picked);
    expect(errors).toEqual([]);
  });

  test("an open slot closed by Back, and a trip to the club home and back, both keep the XI @contract-shape:bounded-change", async ({ page }) => {
    const picked = await pickNorthcott(page);
    await button(page, "FW Garrick Thistlewood 5").click();
    await back(page).click();
    await expectXI(page, picked);
    await back(page).click();
    await button(page, "Starting XI").click();
    await expectXI(page, picked);
  });

  test("choosing another formation re-picks the automatic XI of the new formation and drops the pick; choosing 4-4-2 again gives the automatic 4-4-2 (Dunmore back, Northcott out) @contract-shape:bounded-change", async ({ page }) => {
    await pickNorthcott(page);
    await back(page).click();
    await chooseFormation(page, "4-3-3");
    await button(page, "Starting XI").click();
    await expectXI(page, NETHERWOLD_433);
    await back(page).click();
    await chooseFormation(page, "4-4-2");
    await button(page, "Starting XI").click();
    await expectXI(page, NETHERWOLD_442);
  });

  test("a fresh page and New game start from the automatic eleven again, the pick is gone @error @contract-shape:bounded-change", async ({ page, context }) => {
    await pickNorthcott(page);
    const fresh = await context.newPage();
    await openStartingXI(fresh, "?seed=31", 0);
    await expectXI(fresh, NETHERWOLD_442);
    await expect(fresh.getByRole("button", { name: "Kestrel Northcott" })).toHaveCount(0);
  });
});

test.describe("@US-1 S-005 phone first", () => {
  for (const [query, clubIndex] of [["?seed=31", 0], ["?seed=abc", 7]] as const) {
    test(`nothing scrolls sideways at 390px on the club home, the Starting XI and every choose screen, and no button's text spills out (${query}, club ${clubIndex}) @contract-shape:bounded-change`, async ({ page }) => {
      const errors = watchErrors(page);
      await openClubHome(page, query, clubIndex);
      expect(await overflow(page)).toBeLessThanOrEqual(0);
      await chooseFormation(page, "4-2-3-1");
      await button(page, "Starting XI").click();
      expect(await overflow(page)).toBeLessThanOrEqual(0);
      const slotButtons = await xiList(page).getByRole("button").all();
      for (const [index, slot] of slotButtons.entries()) {
        const spill = await slot.evaluate((node) => node.scrollWidth - node.clientWidth);
        expect(spill, `slot ${index}`).toBeLessThanOrEqual(0);
      }
      await expectTall(xiList(page).getByRole("button"), "slot");
      for (const slotIndex of [0, 3, 6, 10]) {
        await xiList(page).getByRole("button").nth(slotIndex).click();
        expect(await overflow(page), `choose screen of slot ${slotIndex}`).toBeLessThanOrEqual(0);
        await expectTall(playersList(page).getByRole("button"), "choice");
        await back(page).click();
      }
      expect(errors).toEqual([]);
    });
  }

  test("no console error appears across club home, Starting XI, a slot, a pick, a swap, Back, Back, Squad, Back, Tactics, Back, Starting XI and a formation change @contract-shape:bounded-change", async ({ page }) => {
    const errors = watchErrors(page);
    await openStartingXI(page);
    await button(page, "MF Dorian Dunmore 7").click();
    await button(page, "Kestrel Northcott 6").click();
    await button(page, "MF Ivo Elderkin 18").click();
    await button(page, "Joren Dalrymple 16 Starting").click();
    await button(page, "FW Merrick Hartwell 8").click();
    await back(page).click();
    await back(page).click();
    await button(page, "Squad").click();
    await back(page).click();
    await button(page, "Tactics").click();
    await back(page).click();
    await button(page, "Starting XI").click();
    await back(page).click();
    await chooseFormation(page, "4-3-3");
    await button(page, "Starting XI").click();
    await expectXI(page, NETHERWOLD_433);
    expect(errors).toEqual([]);
  });
});
