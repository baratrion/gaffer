import { isFormationId, type FormationId } from "../domain/formation";
import { generateLeague } from "../domain/league";
import type { GoalEvent, MatchResult, PlayedMatch } from "../domain/match";
import { FIXTURES_PER_MATCHDAY, MATCHDAYS, fixturesOf } from "../domain/schedule";
import { isLegalXI } from "../domain/selection";
import { generateSquad, PLAYERS_PER_SQUAD, type Player } from "../domain/squad";
import { isInt32 } from "./seed";
import type { GameState } from "./state";

export const SAVE_VERSION = 1;

const MAX_GOALS = 9;
const MINUTES = 90;
const MAX_RESULTS = MATCHDAYS * FIXTURES_PER_MATCHDAY;

export interface SaveData {
  readonly v: 1;
  readonly seed: number;
  readonly clubId: string;
  readonly formation: FormationId;
  readonly xi?: readonly number[];
  readonly results?: readonly PlayedMatch[];
}

type Raw = Readonly<Record<string, unknown>>;

const isRecord = (value: unknown): value is Raw => typeof value === "object" && value !== null && !Array.isArray(value);

const isIntIn = (value: unknown, min: number, max: number): value is number =>
  typeof value === "number" && Number.isInteger(value) && value >= min && value <= max;

const clubIdOf = (state: GameState): string | undefined => {
  const { screen } = state;
  return "clubId" in screen && state.league.clubs.some((club) => club.id === screen.clubId) ? screen.clubId : undefined;
};

export const toSave = (state: GameState): SaveData | undefined => {
  const clubId = clubIdOf(state);
  if (clubId === undefined) return undefined;
  const { league, formation, xi, results } = state;
  return {
    v: SAVE_VERSION,
    seed: league.seed,
    clubId,
    formation,
    ...(xi === undefined ? {} : { xi }),
    ...(results === undefined || results.length === 0 ? {} : { results }),
  };
};

const goalFrom = (raw: unknown, previousMinute: number): GoalEvent | undefined => {
  if (!isRecord(raw) || !isIntIn(raw.minute, Math.max(1, previousMinute), MINUTES)) return undefined;
  if ((raw.side !== "home" && raw.side !== "away") || !isIntIn(raw.playerIndex, 0, PLAYERS_PER_SQUAD - 1)) return undefined;
  return { minute: raw.minute, side: raw.side, playerIndex: raw.playerIndex };
};

const goalsFrom = (raw: unknown): readonly GoalEvent[] | undefined => {
  if (!Array.isArray(raw)) return undefined;
  const goals: GoalEvent[] = [];
  for (const entry of raw) {
    const goal = goalFrom(entry, goals.at(-1)?.minute ?? 1);
    if (goal === undefined) return undefined;
    goals.push(goal);
  }
  return goals;
};

const resultFrom = (raw: unknown): MatchResult | undefined => {
  if (!isRecord(raw) || !isIntIn(raw.homeGoals, 0, MAX_GOALS) || !isIntIn(raw.awayGoals, 0, MAX_GOALS)) return undefined;
  const goals = goalsFrom(raw.goals);
  const home = goals?.filter((goal) => goal.side === "home").length;
  return goals === undefined || home !== raw.homeGoals || goals.length - home !== raw.awayGoals
    ? undefined
    : { homeGoals: raw.homeGoals, awayGoals: raw.awayGoals, goals };
};

const entryFrom = (raw: unknown, position: number): PlayedMatch | undefined => {
  const matchday = Math.floor(position / FIXTURES_PER_MATCHDAY) + 1;
  const fixtureIndex = position % FIXTURES_PER_MATCHDAY;
  const fixture = fixturesOf(matchday)[fixtureIndex]!;
  if (!isRecord(raw) || raw.matchday !== matchday || raw.fixtureIndex !== fixtureIndex) return undefined;
  if (raw.home !== fixture.home || raw.away !== fixture.away) return undefined;
  const result = resultFrom(raw.result);
  return result === undefined ? undefined : { matchday, fixtureIndex, home: fixture.home, away: fixture.away, result };
};

const resultsFrom = (raw: unknown): readonly PlayedMatch[] | undefined => {
  const validLength = Array.isArray(raw) && raw.length > 0 && raw.length <= MAX_RESULTS && raw.length % FIXTURES_PER_MATCHDAY === 0;
  if (!validLength) return undefined;
  const entries = raw.map(entryFrom);
  return entries.every((entry) => entry !== undefined) ? (entries as readonly PlayedMatch[]) : undefined;
};

const isEnvelope = (raw: unknown): raw is Raw & { seed: number; clubId: string; formation: FormationId } =>
  isRecord(raw) &&
  raw.v === SAVE_VERSION &&
  typeof raw.seed === "number" &&
  Number.isInteger(raw.seed) &&
  isInt32(raw.seed) &&
  typeof raw.clubId === "string" &&
  typeof raw.formation === "string" &&
  isFormationId(raw.formation);

const xiIsValid = (raw: Raw, squad: readonly Player[], formation: FormationId): boolean =>
  !("xi" in raw) || (Array.isArray(raw.xi) && isLegalXI(squad, formation, raw.xi as readonly number[]));

export const fromSave = (raw: unknown): GameState | undefined => {
  if (!isEnvelope(raw)) return undefined;
  const league = generateLeague(raw.seed);
  const clubIndex = league.clubs.findIndex((club) => club.id === raw.clubId);
  if (clubIndex < 0 || !xiIsValid(raw, generateSquad(raw.seed, clubIndex), raw.formation)) return undefined;
  const results = "results" in raw ? resultsFrom(raw.results) : undefined;
  if ("results" in raw && results === undefined) return undefined;
  const xi = "xi" in raw ? (raw.xi as readonly number[]) : undefined;
  return {
    league,
    screen: { kind: "clubHome", clubId: raw.clubId },
    formation: raw.formation,
    ...(xi === undefined ? {} : { xi: [...xi] }),
    ...(results === undefined ? {} : { results }),
  };
};

export const encodeSave = (state: GameState): string | undefined => {
  const save = toSave(state);
  return save === undefined ? undefined : JSON.stringify(save);
};

export const decodeSave = (text: string | null | undefined): GameState | undefined => {
  try {
    return typeof text === "string" ? fromSave(JSON.parse(text)) : undefined;
  } catch {
    return undefined;
  }
};

export const saveTextFor = (lastText: string | undefined, state: GameState): string | undefined => {
  const text = encodeSave(state);
  return text === lastText ? undefined : text;
};
