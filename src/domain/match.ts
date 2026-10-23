import { createRng, deriveSeed, nextFloat, type Rng } from "./rng";
import { FIXTURES_PER_MATCHDAY, MATCHDAYS } from "./schedule";
import type { StartingXI } from "./selection";
import type { Player, Position } from "./squad";

/** The match model of ADR-0011. Constants and draw order are frozen by that ADR. */
export const CHANCES_PER_SIDE = 9;
export const MINUTES_PER_CHANCE = 10;
export const MAX_CONVERSION = 0.3;
export const MATCH_STREAM_BASE = 200;

const SCORER_FACTOR: Readonly<Record<Exclude<Position, "GK">, number>> = { DF: 1, MF: 2, FW: 4 };

export interface MatchSide {
  readonly squad: readonly Player[];
  readonly xi: StartingXI;
}

export interface MatchInput {
  readonly seed: number;
  readonly matchday: number;
  readonly fixtureIndex: number;
  readonly home: MatchSide;
  readonly away: MatchSide;
}

export interface GoalEvent {
  readonly minute: number;
  readonly side: "home" | "away";
  readonly playerIndex: number;
}

export interface MatchResult {
  readonly homeGoals: number;
  readonly awayGoals: number;
  readonly goals: readonly GoalEvent[];
}

type SideName = GoalEvent["side"];

export const teamStrength = (side: MatchSide): number =>
  side.xi.reduce((sum, index) => sum + side.squad[index]!.overall, 0);

const cube = (value: number): number => value * value * value;

const scorerWeight = (player: Player): number =>
  player.position === "GK" ? 0 : player.attributes.shooting * SCORER_FACTOR[player.position];

const pickScorer = (side: MatchSide, scorerDraw: number): number => {
  const weights = side.xi.map((index) => scorerWeight(side.squad[index]!));
  const target = Math.floor(scorerDraw * weights.reduce((sum, weight) => sum + weight, 0));
  let cumulative = 0;
  const slot = weights.findIndex((weight) => (cumulative += weight) > target);
  return side.xi[slot]!;
};

const assertInRange = (name: string, value: number, range: readonly [number, number]): void => {
  const [min, max] = range;
  if (!Number.isInteger(value) || value < min || value > max) {
    throw new RangeError(`${name} must be an integer ${min}..${max}`);
  }
};

const draw = (rng: Rng): { value: number; rng: Rng } => {
  const { value, next } = nextFloat(rng);
  return { value, rng: next };
};

interface Chance {
  readonly goal: GoalEvent | undefined;
  readonly rng: Rng;
}

interface ChanceSetup {
  readonly c: number;
  readonly name: SideName;
  readonly side: MatchSide;
  readonly conversion: number;
}

const playChance = (rng: Rng, setup: ChanceSetup): Chance => {
  const { c, name, side, conversion } = setup;
  const minuteDraw = draw(rng);
  const conversionDraw = draw(minuteDraw.rng);
  const scorerDraw = draw(conversionDraw.rng);
  if (conversionDraw.value >= conversion) return { goal: undefined, rng: scorerDraw.rng };
  const minute = c * MINUTES_PER_CHANCE + 1 + Math.floor(minuteDraw.value * MINUTES_PER_CHANCE);
  return { goal: { minute, side: name, playerIndex: pickScorer(side, scorerDraw.value) }, rng: scorerDraw.rng };
};

/** The RNG stream of one fixture: 200..255 across the season (ADR-0011). */
export const matchStream = (matchday: number, fixtureIndex: number): number =>
  MATCH_STREAM_BASE + (matchday - 1) * FIXTURES_PER_MATCHDAY + fixtureIndex;

export const playMatch = (input: MatchInput): MatchResult => {
  assertInRange("matchday", input.matchday, [1, MATCHDAYS]);
  assertInRange("fixtureIndex", input.fixtureIndex, [0, FIXTURES_PER_MATCHDAY - 1]);
  const homeCube = cube(teamStrength(input.home));
  const awayCube = cube(teamStrength(input.away));
  const conversion = {
    home: (MAX_CONVERSION * homeCube) / (homeCube + awayCube),
    away: (MAX_CONVERSION * awayCube) / (homeCube + awayCube),
  };
  let rng = createRng(deriveSeed(input.seed, matchStream(input.matchday, input.fixtureIndex)));
  const goals: GoalEvent[] = [];
  for (let c = 0; c < CHANCES_PER_SIDE; c++) {
    for (const name of ["home", "away"] as const) {
      const chance = playChance(rng, { c, name, side: input[name], conversion: conversion[name] });
      rng = chance.rng;
      if (chance.goal) goals.push(chance.goal);
    }
  }
  goals.sort((a, b) => a.minute - b.minute);
  const homeGoals = goals.filter((goal) => goal.side === "home").length;
  return { homeGoals, awayGoals: goals.length - homeGoals, goals };
};
