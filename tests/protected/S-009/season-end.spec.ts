import { expect, test, type Locator, type Page } from "@playwright/test";

// S-009: See how my season ended. Black-box, phone viewport, roles, accessible names and visible text only.
// The scenarios pin the durable clause: once the season's 14 matchdays are played (and not before) the club home
// offers "End of season"; its screen has the only h1 "End of season", a "Final position" line equal to the club's
// Pos in the table, a "Top scorer" line in the stated format and by the stated rule (checked against the goals seen
// on the club's 14 match screens and the order of the "Squad" list), and "Back" to the club home. They check rules
// that hold for any seed, not generated names, plus two clauses that follow from recorded results never changing:
// "End of season" reopens the same screen, and a Tactics change after matchday 14 does not change it; and the
// screen comes from the seed. Where "Play again" lands is a rule of this version and is not checked.

test.use({ viewport: { width: 390, height: 844 } });

const MATCHDAYS = 14;
const ORDINALS = ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th"];
const SCORE_SOURCE = "^(.+) (\\d)–(\\d) (.+)$";
const SCORE_TEXT = new RegExp(SCORE_SOURCE);
const GOAL_TEXT = /^(\d{1,2})' (\S.*\S|\S) \(([^()]+)\)$/;
const SQUAD_ROW = /^(.+?)\s+(GK|DF|MF|FW)\s+(\d{1,3})\s+(\d{1,3})\b/;
const POSITION_LINE = /^Final position (1st|2nd|3rd|4th|5th|6th|7th|8th)$/;
const SCORER_LINE = /^Top scorer (none|(.+) \((\d+) goals?\))$/;
const WHOLE = /^\d+$/;

interface Goal {
  readonly scorer: string;
  readonly club: string;
}
interface SeasonEnd {
  readonly position: string;
  readonly scorer: string;
}

const norm = (text: string) => text.replace(/\s+/g, " ").trim();
const heading = (page: Page) => page.getByRole("heading", { level: 1 });
const button = (scope: Page | Locator, name: string) => scope.getByRole("button", { name, exact: true });
const overflow = (page: Page) => page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
const height = async (locator: Locator) => (await locator.boundingBox())?.height ?? 0;

const watchErrors = (page: Page) => {
  const errors: string[] = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(e.message));
  return errors;
};

// The visible texts of the innermost elements whose whole visible text matches `source` (one per line on the screen).
const linesMatching = (page: Page, source: string): Promise<string[]> =>
  page.evaluate((pattern) => {
    const regex = new RegExp(pattern);
    const text = (el: Element) => ((el as HTMLElement).innerText ?? "").replace(/\s+/g, " ").trim();
    const reads = (el: Element) => regex.test(text(el));
    return [...document.body.querySelectorAll("*")].filter((el) => reads(el) && ![...el.children].some(reads)).map(text);
  }, source);

// Starts a new game on a fresh page and returns the names of the 8 clubs in the "Clubs" list.
const newGame = async (page: Page, query: string): Promise<string[]> => {
  await page.goto(`./${query}`);
  await button(page, "New game").click();
  const items = page.getByRole("list", { name: /clubs/i }).getByRole("listitem");
  await expect(items).toHaveCount(8);
  return (await items.allInnerTexts()).map((text) => (text.trim().split("\n")[0] ?? "").trim());
};

const pickClub = async (page: Page, clubs: readonly string[], club: string) => {
  const index = clubs.indexOf(club);
  expect(index, `${club} is in the Clubs list`).toBeGreaterThanOrEqual(0);
  await page.getByRole("list", { name: /clubs/i }).getByRole("listitem").nth(index).getByRole("button").click();
  await expect(heading(page)).toContainText(club);
};

const backHome = async (page: Page, club: string) => {
  const back = button(page, "Back");
  expect(await height(back), '"Back" is at least 44px tall').toBeGreaterThanOrEqual(44);
  await back.click();
  await expect(heading(page)).toHaveCount(1);
  await expect(heading(page)).toContainText(club);
  await expect(heading(page)).toBeFocused();
};

// The player names of the club's "Squad" list, in list order; returns to the club home.
const readSquad = async (page: Page, club: string): Promise<string[]> => {
  await button(page, "Squad").click();
  const rows = page.getByRole("list", { name: /^squad$/i }).getByRole("listitem");
  await expect(rows).toHaveCount(18);
  const names = (await rows.allInnerTexts()).map((text) => {
    const match = SQUAD_ROW.exec(norm(text));
    expect(match, `squad row "${norm(text)}" reads name, position, age, overall`).not.toBeNull();
    return match![1]!;
  });
  await backHome(page, club);
  return names;
};

// Taps "Play match" and reads the goals of the Matchday `matchday` screen; returns to the club home.
const playMatch = async (page: Page, club: string, matchday: number): Promise<Goal[]> => {
  await button(page, "Play match").click();
  await expect(heading(page)).toHaveText(`Matchday ${matchday}`);
  const lines = await linesMatching(page, SCORE_SOURCE);
  expect(lines, `exactly one score line on the Matchday ${matchday} screen`).toHaveLength(1);
  const score = SCORE_TEXT.exec(lines[0]!)!;
  expect([score[1], score[4]], `${club} plays on matchday ${matchday}`).toContain(club);
  const texts = (await page.getByRole("list", { name: "Goals", exact: true }).getByRole("listitem").allInnerTexts()).map(norm);
  const goals = texts.map((text) => {
    const match = GOAL_TEXT.exec(text);
    expect(match, `goal reads "MIN' Scorer (Club)", got "${text}"`).not.toBeNull();
    return { scorer: match![2]!, club: match![3]! };
  });
  expect(goals.length, "one item per goal").toBe(Number(score[2]) + Number(score[3]));
  await backHome(page, club);
  return goals;
};

// Plays the whole season from a new game's club home and returns the club's own goals; checks the offer on the way.
const playSeason = async (page: Page, club: string): Promise<Goal[]> => {
  const own: Goal[] = [];
  for (let matchday = 1; matchday <= MATCHDAYS; matchday += 1) {
    await expect(button(page, "Play match"), `"Play match" is offered before matchday ${matchday}`).toBeVisible();
    await expect(button(page, "End of season"), `no "End of season" before matchday ${MATCHDAYS} is played`).toHaveCount(0);
    own.push(...(await playMatch(page, club, matchday)).filter((goal) => goal.club === club));
  }
  return own;
};

// On the club home after the season: "End of season" in place of "Play match"; opens it and reads its two lines.
const openSeasonEnd = async (page: Page, club: string): Promise<SeasonEnd> => {
  await expect(heading(page)).toContainText(club);
  await expect(button(page, "Play match"), 'no "Play match" once the season is played').toHaveCount(0);
  for (const name of ["Squad", "Tactics", "Starting XI", "Table"]) await expect(button(page, name)).toBeVisible();
  const offer = button(page, "End of season");
  await expect(offer).toBeVisible();
  expect(await height(offer), '"End of season" is at least 44px tall').toBeGreaterThanOrEqual(44);
  await offer.click();

  await expect(heading(page)).toHaveCount(1);
  await expect(heading(page)).toHaveText("End of season");
  await expect(heading(page)).toBeFocused();
  const positions = await linesMatching(page, "^Final position .+$");
  expect(positions, 'exactly one "Final position" line').toHaveLength(1);
  expect(positions[0], 'reads "Final position" and an ordinal from 1st to 8th').toMatch(POSITION_LINE);
  const scorers = await linesMatching(page, "^Top scorer .+$");
  expect(scorers, 'exactly one "Top scorer" line').toHaveLength(1);
  expect(scorers[0], 'reads "Top scorer none" or "Top scorer Name (N goals)"').toMatch(SCORER_LINE);
  expect(await overflow(page), "no horizontal scroll at 390px").toBeLessThanOrEqual(0);
  return { position: POSITION_LINE.exec(positions[0]!)![1]!, scorer: scorers[0]! };
};

// The "Top scorer" line agrees with the goals seen on the club's 14 match screens and the order of its "Squad" list.
const expectTopScorer = (line: string, own: readonly Goal[], squad: readonly string[]) => {
  const tally = new Map<string, number>();
  for (const { scorer } of own) tally.set(scorer, (tally.get(scorer) ?? 0) + 1);
  const match = SCORER_LINE.exec(line)!;
  if (match[1] === "none") {
    expect(own, '"Top scorer none" only when the club scored no goal all season').toHaveLength(0);
    return;
  }
  const [name, count] = [match[2]!, Number(match[3])];
  const most = Math.max(...tally.values());
  expect(squad, `${name} is a player of the club's "Squad" list`).toContain(name);
  expect(count, `${name}'s count equals the goals naming them on the club's match screens`).toBe(tally.get(name) ?? 0);
  expect(count, "no player of the club has more goals").toBe(most);
  expect(line.endsWith(count === 1 ? "(1 goal)" : `(${count} goals)`), '"goal" is singular exactly when the count is 1').toBe(true);
  const tied = squad.filter((player) => tally.get(player) === most);
  expect(name, "on a tie, the one listed first in the Squad list is named").toBe(tied[0]);
};

// Opens "Table" from the club home and returns the club's Pos, checking every row has played 14; returns home.
const tablePos = async (page: Page, club: string): Promise<number> => {
  await button(page, "Table").click();
  await expect(heading(page)).toHaveText("League table");
  const rows = page.getByRole("table", { name: "League table", exact: true }).getByRole("row").filter({ has: page.getByRole("rowheader") });
  await expect(rows).toHaveCount(8);
  let pos = 0;
  for (let i = 0; i < 8; i += 1) {
    const row = rows.nth(i);
    const cells = (await row.getByRole("cell").allInnerTexts()).map((t) => t.trim());
    expect(cells[0], "Pos is a whole number").toMatch(WHOLE);
    expect(cells[1], "every club has played 14").toBe(String(MATCHDAYS));
    if ((await row.getByRole("rowheader").innerText()).trim() === club) pos = Number(cells[0]);
  }
  expect(pos, `${club} has a row in the table`).toBeGreaterThan(0);
  await backHome(page, club);
  return pos;
};

// US-1 "End of season appears only once the season is played", "The verdict agrees with the table and the goals",
// "Back returns to the club home" and "The verdict does not move after the season" (durable clause, D6).
test("after matchday 14 the club home offers End of season: final position as in the table, top scorer by the rule", async ({ page }) => {
  test.setTimeout(90_000);
  const errors = watchErrors(page);
  const clubs = await newGame(page, "?seed=31");
  const club = clubs[0]!;
  await pickClub(page, clubs, club);
  const squad = await readSquad(page, club);

  const own = await playSeason(page, club);
  const seen = await openSeasonEnd(page, club);
  expectTopScorer(seen.scorer, own, squad);
  const back = button(page, "Back");
  expect(await height(back), '"Back" is at least 44px tall').toBeGreaterThanOrEqual(44);
  await backHome(page, club);

  const pos = await tablePos(page, club);
  expect(seen.position, "the final position is the club's Pos in the League table").toBe(ORDINALS[pos - 1]);
  expect(await openSeasonEnd(page, club), "End of season opens the same screen again").toEqual(seen);
  await backHome(page, club);

  await button(page, "Tactics").click();
  await page.getByRole("radiogroup", { name: "Formation", exact: true }).getByRole("radio", { name: "4-3-3", exact: true }).check();
  await backHome(page, club);
  expect(await openSeasonEnd(page, club), "changing Tactics after matchday 14 does not change the screen").toEqual(seen);
  await backHome(page, club);
  expect(errors).toEqual([]);
});

// US-1 "The same seed gives the same verdict": "?seed=abc" plays the same season, and so the same screen, as no seed.
test("the End of season screen comes from the seed: ?seed=abc shows the same screen as no seed", async ({ page }) => {
  test.setTimeout(150_000);
  const errors = watchErrors(page);
  const read = async (query: string) => {
    const clubs = await newGame(page, query);
    const club = clubs[7]!;
    await pickClub(page, clubs, club);
    const squad = await readSquad(page, club);
    const own = await playSeason(page, club);
    const seen = await openSeasonEnd(page, club);
    expectTopScorer(seen.scorer, own, squad);
    await backHome(page, club);
    expect(seen.position, "the final position is the club's Pos in the League table").toBe(ORDINALS[(await tablePos(page, club)) - 1]);
    return { club, seen };
  };
  const invalid = await read("?seed=abc");
  const unseeded = await read("");
  expect(unseeded, "?seed=abc shows the same End of season screen as no seed").toEqual(invalid);
  expect(errors).toEqual([]);
});

// US-1 "A one-goal top scorer reads (1 goal)" (?seed=13, 8th club): the rules again, on a season where the club's
// goals are few, so the singular "goal", a tie at the top count and the lowest positions are exercised.
test("on a season with few goals the End of season screen follows the same rules, with \"goal\" singular at 1", async ({ page }) => {
  test.setTimeout(90_000);
  const errors = watchErrors(page);
  const clubs = await newGame(page, "?seed=13");
  const club = clubs[7]!;
  await pickClub(page, clubs, club);
  const squad = await readSquad(page, club);
  const own = await playSeason(page, club);
  const seen = await openSeasonEnd(page, club);
  expectTopScorer(seen.scorer, own, squad);
  await backHome(page, club);
  expect(seen.position, "the final position is the club's Pos in the League table").toBe(ORDINALS[(await tablePos(page, club)) - 1]);
  expect(errors).toEqual([]);
});
