import { expect, test, type Locator, type Page } from "@playwright/test";

// S-006: Play my first match. Black-box, phone viewport, roles, accessible names and visible text only.
// The scenarios check rules that hold for any seed (pairing, formats, who may score), not a generated result.

test.use({ viewport: { width: 390, height: 844 } });

interface Score {
  readonly text: string;
  readonly home: string;
  readonly homeGoals: number;
  readonly awayGoals: number;
  readonly away: string;
}
interface Goal {
  readonly minute: number;
  readonly scorer: string;
  readonly club: string;
}
interface Match {
  readonly score: Score;
  readonly goals: readonly Goal[];
}
interface SquadPlayer {
  readonly name: string;
  readonly position: string;
}

const SCORE_SOURCE = "^(.+) (\\d)–(\\d) (.+)$";
const SCORE_TEXT = new RegExp(SCORE_SOURCE);
const GOAL_TEXT = /^(\d{1,2})' (\S.*\S|\S) \(([^()]+)\)$/;
const SQUAD_ROW = /^(.+?)\s+(GK|DF|MF|FW)\s+(\d{1,3})\s+(\d{1,3})\b/;
const SLOT_TEXT = /^(GK|DF|MF|FW) (\S.*\S|\S) (\d{1,2})$/;

const norm = (text: string) => text.replace(/\s+/g, " ").trim();
const heading = (page: Page) => page.getByRole("heading", { level: 1 });
const button = (scope: Page | Locator, name: string) => scope.getByRole("button", { name, exact: true });
const goalsList = (page: Page) => page.getByRole("list", { name: "Goals", exact: true });
const overflow = (page: Page) => page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
const height = async (locator: Locator) => (await locator.boundingBox())?.height ?? 0;

const watchErrors = (page: Page) => {
  const errors: string[] = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(e.message));
  return errors;
};

// Starts a new game and returns the names of the 8 clubs in the "Clubs" list.
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

const readSquad = async (page: Page, club: string): Promise<SquadPlayer[]> => {
  await button(page, "Squad").click();
  const rows = page.getByRole("list", { name: /^squad$/i }).getByRole("listitem");
  await expect(rows).toHaveCount(18);
  const squad = (await rows.allInnerTexts()).map((text) => {
    const match = SQUAD_ROW.exec(norm(text));
    expect(match, `squad row "${norm(text)}" reads name, position, age, overall`).not.toBeNull();
    return { name: match![1]!, position: match![2]! };
  });
  await button(page, "Back").click();
  await expect(heading(page)).toContainText(club);
  return squad;
};

// The 11 "CODE Name OVERALL" texts of the Starting XI screen; returns to the club home.
const readXI = async (page: Page, club: string): Promise<string[]> => {
  await button(page, "Starting XI").click();
  await expect(heading(page)).toHaveText("Starting XI");
  const items = page.getByRole("list", { name: "Starting XI", exact: true }).getByRole("listitem");
  await expect(items).toHaveCount(11);
  const texts = (await items.allInnerTexts()).map((text) => text.trim());
  await button(page, "Back").click();
  await expect(heading(page)).toContainText(club);
  return texts;
};

const xiNames = (xi: readonly string[]) =>
  xi.map((text) => {
    const match = SLOT_TEXT.exec(text);
    expect(match, `slot reads "CODE Name OVERALL", got "${text}"`).not.toBeNull();
    return { code: match![1]!, name: match![2]! };
  });

// Every deepest element whose whole text reads like a score line, with its visibility right now (no waiting).
const scoreLines = (page: Page) =>
  page.evaluate((source) => {
    const pattern = new RegExp(source);
    const text = (el: Element) => (el.textContent ?? "").replace(/\s+/g, " ").trim();
    const reads = (el: Element) => pattern.test(text(el));
    return [...document.body.querySelectorAll("*")]
      .filter((el) => reads(el) && ![...el.children].some(reads))
      .map((el) => {
        const box = el.getBoundingClientRect();
        return { text: text(el), visible: el.checkVisibility() && box.width > 0 && box.height > 0 };
      });
  }, SCORE_SOURCE);

// Taps "Play match" on the club home and reads the match screen, checking the formats on the way.
const playMatch = async (page: Page, clubs: readonly string[], club: string): Promise<Match> => {
  const play = button(page, "Play match");
  expect(await height(play), '"Play match" is at least 44px tall').toBeGreaterThanOrEqual(44);
  await play.click();
  await expect(heading(page)).toHaveCount(1);
  await expect(heading(page)).toHaveText("Matchday 1");
  await expect(heading(page)).toBeFocused();

  // On arrival the result is already shown: read it at once, without waiting for anything to appear.
  const lines = await scoreLines(page);
  expect(lines, "exactly one score line on the match screen").toHaveLength(1);
  expect(lines[0]!.visible, "the score line is visible on arrival").toBe(true);
  const goalsNow = await page.evaluate(() =>
    [...document.querySelectorAll('[role="list"], ul, ol')].some((el) => {
      const labelledBy = el.getAttribute("aria-labelledby");
      const label = labelledBy ? document.getElementById(labelledBy)?.textContent : el.getAttribute("aria-label");
      return (label ?? "").trim() === "Goals" && el.checkVisibility();
    }),
  );
  expect(goalsNow, "the Goals list is shown on arrival").toBe(true);

  const match = SCORE_TEXT.exec(lines[0]!.text)!;
  const score: Score = {
    text: lines[0]!.text,
    home: match[1]!,
    homeGoals: Number(match[2]),
    awayGoals: Number(match[3]),
    away: match[4]!,
  };
  expect([score.home, score.away], `${club} plays in "${score.text}"`).toContain(club);
  expect(score.home, "two different clubs").not.toBe(score.away);
  expect(clubs, `"${score.home}" is a club of the league`).toContain(score.home);
  expect(clubs, `"${score.away}" is a club of the league`).toContain(score.away);

  await expect(goalsList(page)).toHaveCount(1);
  await expect(goalsList(page)).toBeVisible();
  const items = goalsList(page).getByRole("listitem");
  await expect(items).toHaveCount(score.homeGoals + score.awayGoals);
  const goals = (await items.allInnerTexts()).map((raw) => {
    const text = raw.trim();
    const goal = GOAL_TEXT.exec(text);
    expect(goal, `goal reads "MINUTE' Name (Club)", got "${text}"`).not.toBeNull();
    return { minute: Number(goal![1]), scorer: goal![2]!, club: goal![3]! };
  });
  let previous = 1;
  for (const goal of goals) {
    expect(goal.minute, "minutes are 1 to 90 and never decrease").toBeGreaterThanOrEqual(previous);
    expect(goal.minute).toBeLessThanOrEqual(90);
    expect([score.home, score.away], `the scorer's club is one of the two`).toContain(goal.club);
    previous = goal.minute;
  }
  expect(goals.filter((g) => g.club === score.home)).toHaveLength(score.homeGoals);
  expect(goals.filter((g) => g.club === score.away)).toHaveLength(score.awayGoals);
  expect(await overflow(page)).toBeLessThanOrEqual(0);
  return { score, goals };
};

const backHome = async (page: Page, club: string) => {
  const back = button(page, "Back");
  expect(await height(back), '"Back" is at least 44px tall').toBeGreaterThanOrEqual(44);
  await back.click();
  await expect(heading(page)).toHaveCount(1);
  await expect(heading(page)).toContainText(club);
  await expect(heading(page)).toBeFocused();
};

// My goals come from my current XI, never its GK slot; the opponent's never from my squad.
interface Side {
  readonly club: string;
  readonly xi: readonly string[];
  readonly squad: readonly SquadPlayer[];
}
const expectScorers = (match: Match, { club, xi, squad }: Side) => {
  const slots = xiNames(xi);
  const outfield = new Set(slots.filter((s) => s.code !== "GK").map((s) => s.name));
  const mine = new Set(squad.map((p) => p.name));
  for (const goal of match.goals) {
    if (goal.club === club) {
      expect(outfield.has(goal.scorer), `${goal.scorer} is an outfield player of the Starting XI`).toBe(true);
    } else {
      expect(mine.has(goal.scorer), `${goal.scorer} scores for the opponent, not from my squad`).toBe(false);
    }
  }
};

test("Play match shows Matchday 1 with one score line and the goals of my XI at once, and Back leads home unchanged", async ({ page }) => {
  const errors = watchErrors(page);
  const clubs = await newGame(page, "?seed=31");
  const club = clubs[0]!;
  await pickClub(page, clubs, club);
  for (const name of ["Squad", "Tactics", "Starting XI"]) await expect(button(page, name)).toBeVisible();
  const squad = await readSquad(page, club);
  const xi = await readXI(page, club);

  const match = await playMatch(page, clubs, club);
  expectScorers(match, { club, xi, squad });

  await backHome(page, club);
  await button(page, "Tactics").click();
  await expect(page.getByRole("radio", { name: "4-4-2", exact: true })).toBeChecked();
  await button(page, "Back").click();
  await expect(heading(page)).toContainText(club);
  expect(await readXI(page, club), "the Starting XI is unchanged").toEqual(xi);
  expect(errors).toEqual([]);
});

test("every club meets exactly one other club on matchday 1, the opponent's scorers are outfield players of its squad, and not all end 0–0", async ({ page }) => {
  test.slow();
  const errors = watchErrors(page);
  const query = "?seed=31";
  const clubs = await newGame(page, query);
  const matches = new Map<string, Match>();
  const squads = new Map<string, SquadPlayer[]>();
  for (const club of clubs) {
    if (club !== clubs[0]) await newGame(page, query);
    await pickClub(page, clubs, club);
    squads.set(club, await readSquad(page, club));
    matches.set(club, await playMatch(page, clubs, club));
  }

  for (const club of clubs) {
    const { score } = matches.get(club)!;
    const opponent = score.home === club ? score.away : score.home;
    const theirs = matches.get(opponent)!.score;
    expect([theirs.home, theirs.away], `${opponent} meets ${club}, in the same order`).toEqual([score.home, score.away]);
    for (const goal of matches.get(club)!.goals.filter((g) => g.club === opponent)) {
      const player = squads.get(opponent)!.find((p) => p.name === goal.scorer);
      expect(player, `${goal.scorer} is in the "Squad" list of ${opponent}`).toBeDefined();
      expect(player!.position, `${goal.scorer} is not a goalkeeper`).not.toBe("GK");
    }
  }
  const goals = [...matches.values()].reduce((sum, m) => sum + m.score.homeGoals + m.score.awayGoals, 0);
  expect(goals, "not every matchday-1 match ends 0–0").toBeGreaterThan(0);
  expect(errors).toEqual([]);
});

test("the match comes from the seed: the same seed shows the identical match, and an invalid seed is the default", async ({ page }) => {
  const errors = watchErrors(page);
  const read = async (query: string) => {
    const clubs = await newGame(page, query);
    const club = clubs[7]!;
    await pickClub(page, clubs, club);
    const match = await playMatch(page, clubs, club);
    return { match, items: (await goalsList(page).getByRole("listitem").allInnerTexts()).map((t) => t.trim()) };
  };
  const first = await read("?seed=abc");
  const second = await read("?seed=abc");
  const unseeded = await read("");
  expect(second).toEqual(first);
  expect(unseeded).toEqual(first);
  expect(errors).toEqual([]);
});

test("after changing the formation and the XI, my goals still come from the XI on the Starting XI screen", async ({ page }) => {
  const errors = watchErrors(page);
  const clubs = await newGame(page, "?seed=7");
  const club = clubs[2]!;
  await pickClub(page, clubs, club);
  const squad = await readSquad(page, club);

  await button(page, "Tactics").click();
  await page.getByRole("radiogroup", { name: "Formation", exact: true }).getByRole("radio", { name: "4-3-3", exact: true }).check();
  await button(page, "Back").click();
  await button(page, "Starting XI").click();
  const slots = page.getByRole("list", { name: "Starting XI", exact: true }).getByRole("listitem");
  await expect(slots).toHaveCount(11);
  await slots.nth(10).getByRole("button").click();
  await expect(heading(page)).toHaveText("Choose FW");
  const bench = page
    .getByRole("list", { name: "Players", exact: true })
    .getByRole("button")
    .filter({ hasNotText: /Starting$/ });
  await bench.first().click();
  await expect(heading(page)).toHaveText("Starting XI");
  await button(page, "Back").click();
  await expect(heading(page)).toContainText(club);
  const xi = await readXI(page, club);

  const match = await playMatch(page, clubs, club);
  expectScorers(match, { club, xi, squad });
  await backHome(page, club);
  expect(await readXI(page, club), "the picked XI is unchanged").toEqual(xi);
  expect(errors).toEqual([]);
});
