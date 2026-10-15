/**
 * Tactics and formation types.
 *
 * Formation positions use normalized coordinates (0.0-1.0).
 * Includes default formation constants for 4-4-2 and 4-3-3.
 */

import type { PlayerRole } from "./match-state";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type Mentality = "defensive" | "balanced" | "attacking";

export interface FormationPosition {
  readonly role: PlayerRole;
  readonly baseX: number;
  readonly baseY: number;
}

export interface FormationConfig {
  readonly name: string;
  readonly positions: ReadonlyArray<FormationPosition>;
}

export interface TeamTactics {
  readonly formation: FormationConfig;
  readonly mentality: Mentality;
}

// ---------------------------------------------------------------------------
// Default formations
// ---------------------------------------------------------------------------

export const FOUR_FOUR_TWO: FormationConfig = {
  name: "4-4-2",
  positions: [
    { role: "GK", baseX: 0.5, baseY: 0.04 },
    { role: "LB", baseX: 0.15, baseY: 0.25 },
    { role: "CB", baseX: 0.38, baseY: 0.22 },
    { role: "CB", baseX: 0.62, baseY: 0.22 },
    { role: "RB", baseX: 0.85, baseY: 0.25 },
    { role: "LM", baseX: 0.15, baseY: 0.48 },
    { role: "CM", baseX: 0.38, baseY: 0.45 },
    { role: "CM", baseX: 0.62, baseY: 0.45 },
    { role: "RM", baseX: 0.85, baseY: 0.48 },
    { role: "ST", baseX: 0.38, baseY: 0.75 },
    { role: "ST", baseX: 0.62, baseY: 0.75 },
  ],
} as const;

export const FOUR_THREE_THREE: FormationConfig = {
  name: "4-3-3",
  positions: [
    { role: "GK", baseX: 0.5, baseY: 0.04 },
    { role: "LB", baseX: 0.15, baseY: 0.25 },
    { role: "CB", baseX: 0.38, baseY: 0.22 },
    { role: "CB", baseX: 0.62, baseY: 0.22 },
    { role: "RB", baseX: 0.85, baseY: 0.25 },
    { role: "CM", baseX: 0.3, baseY: 0.45 },
    { role: "CM", baseX: 0.5, baseY: 0.42 },
    { role: "CM", baseX: 0.7, baseY: 0.45 },
    { role: "LW", baseX: 0.15, baseY: 0.75 },
    { role: "ST", baseX: 0.5, baseY: 0.8 },
    { role: "RW", baseX: 0.85, baseY: 0.75 },
  ],
} as const;
