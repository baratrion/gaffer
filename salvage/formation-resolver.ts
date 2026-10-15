/**
 * Formation resolver -- maps normalized formation positions to pitch coordinates.
 *
 * Formation positions use normalized coordinates (0.0-1.0):
 *   - baseX: lateral position across the pitch (0=left touchline, 1=right touchline)
 *   - baseY: depth position (0=own goal, 1=opponent goal)
 *
 * Pitch coordinate system:
 *   - x: goal-to-goal axis (0 to pitch.width, e.g. 0-105m)
 *   - y: touchline-to-touchline axis (0 to pitch.height, e.g. 0-68m)
 *
 * For home_left_to_right:
 *   - Home: baseY maps to x (depth along pitch), baseX maps to y (lateral)
 *   - Away: mirrored -- x = pitch.width - (baseY * pitch.width)
 */

import type {
  FormationConfig,
  FormationPosition,
  PitchDimensions,
  Position,
  TeamId,
  PlayingDirection,
} from "../types";

/**
 * Resolve a single normalized position to pitch coordinates.
 *
 * When isLeftToRight is true, depth (baseY) maps directly to x.
 * When false (mirrored), x is reflected across the pitch center.
 */
const resolvePosition = (
  formationPos: FormationPosition,
  pitch: PitchDimensions,
  isLeftToRight: boolean,
): Position => {
  const lateralY = formationPos.baseX * pitch.height;

  if (isLeftToRight) {
    return { x: formationPos.baseY * pitch.width, y: lateralY };
  }
  return { x: pitch.width - formationPos.baseY * pitch.width, y: lateralY };
};

interface ResolveFormationInput {
  readonly formation: FormationConfig;
  readonly pitch: PitchDimensions;
  readonly teamSide: TeamId;
  readonly playingDirection: PlayingDirection;
}

/**
 * Resolve all formation positions to pitch coordinates.
 *
 * For the away team, positions are mirrored so their GK
 * is near the opposite goal from the home GK.
 */
export const resolveFormationPositions = (
  input: ResolveFormationInput,
): ReadonlyArray<Position> => {
  const homeIsLeftToRight = input.playingDirection === "home_left_to_right";
  const isLeftToRight = input.teamSide === "home" ? homeIsLeftToRight : !homeIsLeftToRight;

  return input.formation.positions.map((pos) => resolvePosition(pos, input.pitch, isLeftToRight));
};
