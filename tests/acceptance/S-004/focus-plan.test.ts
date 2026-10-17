// @US-1 (S-004 choose a formation): where focus goes after a render (brief port 13, ADR-0008).
// CONTRACT_SHAPE: pure-function (focusPlan only returns data; main.ts is the one place that touches focus)
// Outcome anchor: DISCUSS Elevator Pitch + D5: after tapping "4-3-3" focus stays on that radio (not the heading);
// after navigating, focus moves to the new screen's heading.
// Hand-off: pending (it.skip) until DELIVER implements focusPlan in src/app/state.ts (scaffold today).
// DELIVER: unskip ONE scenario at a time, make it green, commit, repeat. Never edit an assertion to fit the code.
import { describe, expect, it } from "vitest";
import { focusPlan, type Screen } from "../../../src/app/state";

const SCREENS: readonly Screen[] = [
  { kind: "title" },
  { kind: "pickClub" },
  { kind: "clubHome", clubId: "a" },
  { kind: "clubHome", clubId: "b" },
  { kind: "squad", clubId: "a" },
  { kind: "player", clubId: "a", playerIndex: 0 },
  { kind: "player", clubId: "a", playerIndex: 1 },
  { kind: "player", clubId: "b", playerIndex: 0 },
  { kind: "tactics", clubId: "a" },
  { kind: "tactics", clubId: "b" },
];
const HEADING = { kind: "heading" } as const;
const pairs = SCREENS.flatMap((from, i) => SCREENS.filter((_, j) => j !== i).map((to) => [from, to] as const));

describe("@US-1 S-004 focus after a render", () => {
  it.skip("Given the first render, when focus is planned with or without an id, then the heading gets focus @contract-shape:pure-function", () => {
    for (const next of SCREENS) {
      expect(focusPlan(undefined, next, undefined)).toEqual(HEADING);
      expect(focusPlan(undefined, next, "formation-4-3-3")).toEqual(HEADING);
    }
  });

  it.skip.each(pairs)("Given the screen changes from %j to %j, when focus is planned (even with an id), then the heading gets focus, including a different club or player @contract-shape:pure-function", (from, to) => {
    expect(focusPlan(from, to, undefined)).toEqual(HEADING);
    expect(focusPlan(from, to, "formation-4-3-3")).toEqual(HEADING);
  });

  it.skip.each(SCREENS)("Given the same screen %j is shown again, when the control Sam used names its id, then that control gets focus @driving_port @contract-shape:pure-function", (screen) => {
    const sameScreen = { ...screen };
    expect(focusPlan(screen, sameScreen, "formation-4-3-3")).toEqual({ kind: "element", id: "formation-4-3-3" });
    expect(focusPlan(screen, sameScreen, "x")).toEqual({ kind: "element", id: "x" });
  });

  it.skip.each(SCREENS)("Given the same screen %j is shown again, when no control names an id, then the heading gets focus so focus is never lost @error @contract-shape:pure-function", (screen) => {
    expect(focusPlan(screen, { ...screen }, undefined)).toEqual(HEADING);
  });

  it.skip.each(SCREENS)("Given the same screen %j is shown again, when the id is empty, then the heading gets focus @error @contract-shape:pure-function", (screen) => {
    expect(focusPlan(screen, { ...screen }, "")).toEqual(HEADING);
  });

  it.skip("Given any plan, when focus is planned, then the screens given are not changed @contract-shape:pure-function", () => {
    const before = JSON.stringify(SCREENS);
    for (const [from, to] of pairs) focusPlan(from, to, "formation-4-4-2");
    for (const screen of SCREENS) focusPlan(screen, screen, "formation-4-4-2");
    expect(JSON.stringify(SCREENS)).toBe(before);
  });
});
