// @US-1 (S-004 choose a formation)
// CONTRACT_SHAPE: pure-function
// Outcome anchor: DISCUSS Elevator Pitch (feature-delta.md US-1) and D5: after tapping a formation, focus stays on the
// tapped formation's radio and the heading stays "Tactics"; arriving on a new screen still focuses its heading (ADR-0008).
// Destination: tests/acceptance/S-004/focus-plan.test.ts (DELIVER step 02).
import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { focusPlan, type Screen } from "../../../src/app/state";

const A = "club-a";
const B = "club-b";
const SCREENS: readonly Screen[] = [
  { kind: "title" },
  { kind: "pickClub" },
  { kind: "clubHome", clubId: A },
  { kind: "clubHome", clubId: B },
  { kind: "squad", clubId: A },
  { kind: "player", clubId: A, playerIndex: 0 },
  { kind: "player", clubId: A, playerIndex: 1 },
  { kind: "tactics", clubId: A },
  { kind: "tactics", clubId: B },
];
const copy = (screen: Screen): Screen => ({ ...screen });
const sameScreen = (x: Screen, y: Screen): boolean => JSON.stringify(x) === JSON.stringify(y);
const HEADING = { kind: "heading" } as const;
const anyScreen = fc.constantFrom(...SCREENS);
const anyId = fc.option(fc.oneof(fc.constant(""), fc.constantFrom("formation-4-4-2", "formation-4-3-3", "formation-4-2-3-1"), fc.string()), { nil: undefined });

describe("@US-1 S-004 where focus goes after a screen is drawn", () => {
  describe("Given the very first screen", () => {
    it.each(SCREENS)("when %j is drawn first, then the heading is focused, even if an id is named @contract-shape:pure-function", (screen) => {
      expect(focusPlan(undefined, screen, undefined)).toEqual(HEADING);
      expect(focusPlan(undefined, screen, "formation-4-3-3")).toEqual(HEADING);
    });
  });

  describe("Given Sam moves to a different screen", () => {
    const pairs = SCREENS.flatMap((from) => SCREENS.filter((to) => !sameScreen(from, to)).map((to): [Screen, Screen] => [from, to]));

    it.each(pairs)("when %j becomes %j, then the new heading is focused whether or not an id is named @driving_port @contract-shape:pure-function", (from, to) => {
      expect(focusPlan(from, to, undefined)).toEqual(HEADING);
      expect(focusPlan(from, to, "formation-4-3-3")).toEqual(HEADING);
    });

    it("when only the club differs (club home A to club home B, tactics A to tactics B), then the heading is focused @boundary @contract-shape:pure-function", () => {
      expect(focusPlan({ kind: "tactics", clubId: A }, { kind: "tactics", clubId: B }, "formation-4-4-2")).toEqual(HEADING);
      expect(focusPlan({ kind: "clubHome", clubId: A }, { kind: "clubHome", clubId: B }, "x")).toEqual(HEADING);
    });

    it("when only the player differs (row 0 to row 1), then the heading is focused @boundary @contract-shape:pure-function", () => {
      expect(focusPlan({ kind: "player", clubId: A, playerIndex: 0 }, { kind: "player", clubId: A, playerIndex: 1 }, "x")).toEqual(HEADING);
    });
  });

  describe("Given the screen stays the same", () => {
    it.each(["formation-4-4-2", "formation-4-3-3", "formation-4-2-3-1"])(
      "when %s is named, then that element is focused, not the heading @walking_skeleton @driving_port @contract-shape:pure-function",
      (id) => {
        expect(focusPlan({ kind: "tactics", clubId: A }, { kind: "tactics", clubId: A }, id)).toEqual({ kind: "element", id });
      },
    );

    it("when no id is named, then the heading is focused so focus is never left on the page body @boundary @contract-shape:pure-function", () => {
      expect(focusPlan({ kind: "tactics", clubId: A }, { kind: "tactics", clubId: A }, undefined)).toEqual(HEADING);
    });

    it("when the named id is empty, then the heading is focused @error @contract-shape:pure-function", () => {
      expect(focusPlan({ kind: "tactics", clubId: A }, { kind: "tactics", clubId: A }, "")).toEqual(HEADING);
    });

    it("when the screens are equal copies rather than the same object, then they still count as the same screen @boundary @contract-shape:pure-function", () => {
      for (const screen of SCREENS) expect(focusPlan(screen, copy(screen), "formation-4-3-3")).toEqual({ kind: "element", id: "formation-4-3-3" });
    });
  });

  describe("Given any two screens and any id", () => {
    it("then the element is focused exactly when the screen is the same and the id is non-empty, otherwise the heading @property @contract-shape:pure-function", () => {
      fc.assert(
        fc.property(fc.option(anyScreen, { nil: undefined }), anyScreen, anyId, (previous, next, id) => {
          const sameAndNamed = previous !== undefined && sameScreen(previous, next) && id !== undefined && id !== "";
          expect(focusPlan(previous, next, id)).toEqual(sameAndNamed ? { kind: "element", id } : HEADING);
        }),
      );
    });

    it("then the screens given are not changed @contract-shape:pure-function", () => {
      fc.assert(
        fc.property(anyScreen, anyScreen, anyId, (previous, next, id) => {
          const before = JSON.stringify([previous, next]);
          focusPlan(previous, next, id);
          expect(JSON.stringify([previous, next])).toBe(before);
        }),
      );
    });
  });
});
