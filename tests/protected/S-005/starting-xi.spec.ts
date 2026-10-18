import { expect, test, type Locator, type Page } from "@playwright/test";

// S-005: Pick my starting XI. Black-box, phone viewport, roles, accessible names and visible text only.
// Expected XIs are computed from the "Squad" list of the same seed, so the scenarios hold for any generated squad.

test.use({ viewport: { width: 390, height: 844 } });

type Code = "GK" | "DF" | "MF" | "FW";
type Formation = "4-4-2" | "4-3-3" | "4-2-3-1";
interface Player {
  readonly name: string;
  readonly position: Code;
  readonly overall: number;
}
interface Slot {
  readonly code: Code;
  readonly name: string;
  readonly overall: number;
}

const CODES: readonly Code[] = ["GK", "DF", "MF", "FW"];
const COUNTS: Record<Formation, Record<Code, number>> = {
  "4-4-2": { GK: 1, DF: 4, MF: 4, FW: 2 },
  "4-3-3": { GK: 1, DF: 4, MF: 3, FW: 3 },
  "4-2-3-1": { GK: 1, DF: 4, MF: 5, FW: 1 },
};
const SQUAD_ROW = /^(.+?)\s+(GK|DF|MF|FW)\s+(\d{1,3})\s+(\d{1,3})\b/;
const SLOT_TEXT = /^(GK|DF|MF|FW) (\S.*\S|\S) (\d{1,2})$/;
const CHOICE_TEXT = /^(\S.*?\S|\S) (\d{1,2})( Starting)?$/;

const norm = (text: string) => text.replace(/\s+/g, " ").trim();
const heading = (page: Page) => page.getByRole("heading", { level: 1 });
const button = (scope: Page | Locator, name: string) => scope.getByRole("button", { name, exact: true });
const xiList = (page: Page) => page.getByRole("list", { name: "Starting XI", exact: true });
const playersList = (page: Page) => page.getByRole("list", { name: "Players", exact: true });
const overflow = (page: Page) => page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
const height = async (locator: Locator) => (await locator.boundingBox())?.height ?? 0;

const watchErrors = (page: Page) => {
  const errors: string[] = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(e.message));
  return errors;
};

const openClubHome = async (page: Page, club: number, query: string) => {
  await page.goto(`./${query}`);
  await button(page, "New game").click();
  const item = page.getByRole("list", { name: /clubs/i }).getByRole("listitem").nth(club);
  const clubName = ((await item.innerText()).trim().split("\n")[0] ?? "").trim();
  await item.getByRole("button").click();
  await expect(heading(page)).toContainText(clubName);
  return clubName;
};

// Reads the 18 rows of "Squad" (name, position, age, overall) and returns to the club home.
const readSquad = async (page: Page, clubName: string): Promise<Player[]> => {
  await button(page, "Squad").click();
  const rows = page.getByRole("list", { name: /^squad$/i }).getByRole("listitem");
  await expect(rows).toHaveCount(18);
  const squad = (await rows.allInnerTexts()).map((text, i) => {
    const match = SQUAD_ROW.exec(norm(text));
    expect(match, `squad row ${i} reads name, position, age, overall`).not.toBeNull();
    return { name: match![1]!, position: match![2] as Code, overall: Number(match![4]) };
  });
  await button(page, "Back").click();
  await expect(heading(page)).toContainText(clubName);
  return squad;
};

// The automatic XI: per position the highest overall start, highest first, ties in squad order.
const automaticXI = (squad: readonly Player[], formation: Formation): Slot[] =>
  CODES.flatMap((code) =>
    squad
      .map((player, index) => ({ player, index }))
      .filter(({ player }) => player.position === code)
      .sort((a, b) => b.player.overall - a.player.overall || a.index - b.index)
      .slice(0, COUNTS[formation][code])
      .map(({ player }) => ({ code, name: player.name, overall: player.overall })),
  );

const openStartingXI = async (page: Page) => {
  const entry = button(page, "Starting XI");
  expect(await height(entry), '"Starting XI" is at least 44px tall').toBeGreaterThanOrEqual(44);
  await entry.click();
  await expectOnStartingXI(page);
};

const expectOnStartingXI = async (page: Page) => {
  await expect(heading(page)).toHaveCount(1);
  await expect(heading(page)).toHaveText("Starting XI");
  await expect(heading(page)).toBeFocused();
  await expect(xiList(page).getByRole("listitem")).toHaveCount(11);
};

const readXI = async (page: Page): Promise<Slot[]> => {
  const items = xiList(page).getByRole("listitem");
  await expect(items).toHaveCount(11);
  const slots: Slot[] = [];
  for (let i = 0; i < 11; i++) {
    const buttons = items.nth(i).getByRole("button");
    await expect(buttons, `slot ${i} holds exactly one button`).toHaveCount(1);
    const text = (await buttons.innerText()).trim();
    const match = SLOT_TEXT.exec(text);
    expect(match, `slot ${i} reads "CODE Name OVERALL" with single spaces, got "${text}"`).not.toBeNull();
    await expect(buttons).toHaveAccessibleName(text);
    slots.push({ code: match![1] as Code, name: match![2]!, overall: Number(match![3]) });
  }
  return slots;
};

const slotText = ({ code, name, overall }: Slot) => `${code} ${name} ${overall}`;

const expectValidXI = (xi: readonly Slot[], squad: readonly Player[], formation: Formation) => {
  expect(xi.map((s) => s.code), `codes follow the ${formation} line-up`).toEqual(automaticXI(squad, formation).map((s) => s.code));
  expect(new Set(xi.map((s) => s.name)).size, "11 different players").toBe(11);
  for (const slot of xi) {
    const player = squad.find((p) => p.name === slot.name);
    expect(player, `${slot.name} is in the squad`).toBeDefined();
    expect(player!.position, `${slot.name} plays ${slot.code}`).toBe(slot.code);
    expect(player!.overall, `${slot.name} has the squad overall`).toBe(slot.overall);
  }
};

const readChoices = async (page: Page) => {
  const buttons = playersList(page).getByRole("button");
  const texts = (await buttons.allInnerTexts()).map((t) => t.trim());
  return texts.map((text) => {
    const match = CHOICE_TEXT.exec(text);
    expect(match, `choice reads "Name OVERALL" or "Name OVERALL Starting", got "${text}"`).not.toBeNull();
    return { text, name: match![1]!, overall: Number(match![2]), starting: match![3] !== undefined };
  });
};

test("Starting XI opens on its own focused heading with the automatic 4-4-2 eleven of the squad, and Back leads home", async ({ page }) => {
  const errors = watchErrors(page);
  const clubName = await openClubHome(page, 0, "?seed=31");
  const squad = await readSquad(page, clubName);
  await openStartingXI(page);

  const xi = await readXI(page);
  expect(xi).toEqual(automaticXI(squad, "4-4-2"));
  expectValidXI(xi, squad, "4-4-2");
  const items = xiList(page).getByRole("listitem");
  for (let i = 0; i < 11; i++) {
    expect(await height(items.nth(i).getByRole("button")), `slot ${i} is at least 44px tall`).toBeGreaterThanOrEqual(44);
  }
  expect(await overflow(page)).toBeLessThanOrEqual(0);

  const back = button(page, "Back");
  expect(await height(back), '"Back" is at least 44px tall').toBeGreaterThanOrEqual(44);
  await back.click();
  await expect(heading(page)).toHaveCount(1);
  await expect(heading(page)).toContainText(clubName);
  await expect(heading(page)).toBeFocused();
  await expect(xiList(page)).toHaveCount(0);
  expect(errors).toEqual([]);
});

test("an XI never changed follows the formation chosen in Tactics, whatever the seed", async ({ page }) => {
  const errors = watchErrors(page);
  const clubName = await openClubHome(page, 7, "?seed=abc");
  const squad = await readSquad(page, clubName);
  for (const formation of ["4-2-3-1", "4-3-3", "4-4-2"] as const) {
    await button(page, "Tactics").click();
    await page.getByRole("radiogroup", { name: "Formation", exact: true }).getByRole("radio", { name: formation, exact: true }).check();
    await button(page, "Back").click();
    await expect(heading(page)).toContainText(clubName);
    await openStartingXI(page);
    const xi = await readXI(page);
    expect(xi, `automatic ${formation} XI`).toEqual(automaticXI(squad, formation));
    expectValidXI(xi, squad, formation);
    expect(await overflow(page)).toBeLessThanOrEqual(0);
    await button(page, "Back").click();
    await expect(heading(page)).toContainText(clubName);
  }
  expect(errors).toEqual([]);
});

test("tapping a slot lists that position's players in squad order with the starters marked, and Back changes nothing", async ({ page }) => {
  const errors = watchErrors(page);
  const clubName = await openClubHome(page, 2, "?seed=7");
  const squad = await readSquad(page, clubName);
  await openStartingXI(page);
  const xi = await readXI(page);

  for (const code of CODES) {
    const slot = xi.findIndex((s) => s.code === code);
    await button(xiList(page), slotText(xi[slot]!)).click();
    await expect(heading(page)).toHaveCount(1);
    await expect(heading(page)).toHaveText(`Choose ${code}`);
    await expect(heading(page)).toBeFocused();

    const choices = await readChoices(page);
    const ofPosition = squad.filter((p) => p.position === code);
    expect(choices.map((c) => [c.name, c.overall]), `the ${code} players in squad order`).toEqual(
      ofPosition.map((p) => [p.name, p.overall]),
    );
    const starters = new Set(xi.filter((s) => s.code === code).map((s) => s.name));
    for (const choice of choices) {
      expect(choice.starting, `${choice.name} reads "Starting" exactly when in the XI`).toBe(starters.has(choice.name));
    }
    expect(choices.filter((c) => c.starting)).toHaveLength(COUNTS["4-4-2"][code]);
    const buttons = playersList(page).getByRole("button");
    for (let i = 0; i < choices.length; i++) {
      expect(await height(buttons.nth(i)), `choice ${i} is at least 44px tall`).toBeGreaterThanOrEqual(44);
    }
    expect(await overflow(page)).toBeLessThanOrEqual(0);

    const back = button(page, "Back");
    expect(await height(back), '"Back" is at least 44px tall').toBeGreaterThanOrEqual(44);
    await back.click();
    await expectOnStartingXI(page);
    expect(await readXI(page), "Back leaves the XI unchanged").toEqual(xi);
  }
  expect(errors).toEqual([]);
});

test("picking a player puts him in the tapped slot, a starter from another slot swaps, and the slot's own player changes nothing", async ({ page }) => {
  const errors = watchErrors(page);
  const clubName = await openClubHome(page, 0, "?seed=31");
  const squad = await readSquad(page, clubName);
  await openStartingXI(page);
  const before = await readXI(page);

  // Replace: the last MF slot takes a midfielder who is not in the XI.
  const lastMF = before.map((s) => s.code).lastIndexOf("MF");
  await button(xiList(page), slotText(before[lastMF]!)).click();
  const outsider = (await readChoices(page)).find((c) => !c.starting)!;
  expect(outsider, "a midfielder outside the XI").toBeDefined();
  await button(playersList(page), outsider.text).click();
  await expectOnStartingXI(page);
  const replaced = await readXI(page);
  const expectedReplaced = before.map((s, i) => (i === lastMF ? { code: "MF" as Code, name: outsider.name, overall: outsider.overall } : s));
  expect(replaced).toEqual(expectedReplaced);
  expect(replaced.some((s) => s.name === before[lastMF]!.name), "the replaced player left the XI").toBe(false);
  expectValidXI(replaced, squad, "4-4-2");

  // Swap: the first MF slot takes the starter of the second MF slot.
  const firstMF = replaced.findIndex((s) => s.code === "MF");
  const other = replaced[firstMF + 1]!;
  await button(xiList(page), slotText(replaced[firstMF]!)).click();
  await button(playersList(page), `${other.name} ${other.overall} Starting`).click();
  await expectOnStartingXI(page);
  const swapped = await readXI(page);
  const expectedSwapped = replaced.map((s, i) => (i === firstMF ? other : i === firstMF + 1 ? replaced[firstMF]! : s));
  expect(swapped).toEqual(expectedSwapped);
  expectValidXI(swapped, squad, "4-4-2");

  // The slot's own player: nothing changes.
  const keeper = swapped[0]!;
  await button(xiList(page), slotText(keeper)).click();
  await expect(heading(page)).toHaveText("Choose GK");
  await button(playersList(page), `${keeper.name} ${keeper.overall} Starting`).click();
  await expectOnStartingXI(page);
  expect(await readXI(page)).toEqual(swapped);
  expect(errors).toEqual([]);
});

test("the XI is kept after Squad and Tactics for the session, and a new game starts from the automatic XI again", async ({ page }) => {
  const errors = watchErrors(page);
  const clubName = await openClubHome(page, 4, "?seed=31");
  const squad = await readSquad(page, clubName);
  await openStartingXI(page);
  const automatic = await readXI(page);
  expect(automatic).toEqual(automaticXI(squad, "4-4-2"));

  const df = automatic.findIndex((s) => s.code === "DF");
  await button(xiList(page), slotText(automatic[df]!)).click();
  const outsider = (await readChoices(page)).find((c) => !c.starting)!;
  await button(playersList(page), outsider.text).click();
  await expectOnStartingXI(page);
  const picked = await readXI(page);
  expect(picked[df]!.name).toBe(outsider.name);

  await button(page, "Back").click();
  await expect(heading(page)).toContainText(clubName);
  await button(page, "Squad").click();
  await expect(page.getByRole("list", { name: /^squad$/i }).getByRole("listitem")).toHaveCount(18);
  await button(page, "Back").click();
  await button(page, "Tactics").click();
  await expect(heading(page)).toHaveText("Tactics");
  await button(page, "Back").click();
  await expect(heading(page)).toContainText(clubName);
  await openStartingXI(page);
  expect(await readXI(page), "the picked XI is kept").toEqual(picked);

  await openClubHome(page, 4, "?seed=31");
  await openStartingXI(page);
  expect(await readXI(page), "a new game starts from the automatic XI").toEqual(automatic);
  expect(errors).toEqual([]);
});
