// @US-1 @US-2 (S-005 pick my starting XI)
// CONTRACT_SHAPE: pure-function
// Outcome anchor: DISCUSS D3/D7/D8 and ADR-0008: arriving on the Starting XI screen, opening a slot, picking (or Back) and
// returning home each land on a new screen, so the new heading is focused every time; no S-005 navigation names an element.
// Pairs that involve only the S-004 screens are covered by tests/acceptance/S-004/focus-plan.test.ts and not repeated here.
// Destination: tests/acceptance/S-005/focus-plan.test.ts (DELIVER step 02).
import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { focusPlan, type Screen } from "../../../src/app/state";

const A = "club-a";
const B = "club-b";
const OLD_SCREENS: readonly Screen[] = [
  { kind: "title" },
  { kind: "pickClub" },
  { kind: "clubHome", clubId: A },
  { kind: "squad", clubId: A },
  { kind: "player", clubId: A, playerIndex: 0 },
  { kind: "tactics", clubId: A },
];
const NEW_SCREENS: readonly Screen[] = [
  { kind: "startingXI", clubId: A },
  { kind: "startingXI", clubId: B },
  { kind: "choosePlayer", clubId: A, slot: 0 },
  { kind: "choosePlayer", clubId: A, slot: 10 },
  { kind: "choosePlayer", clubId: B, slot: 0 },
];
const SCREENS: readonly Screen[] = [...OLD_SCREENS, ...NEW_SCREENS];
const copy = (screen: Screen): Screen => ({ ...screen });
const sameScreen = (x: Screen, y: Screen): boolean => JSON.stringify(x) === JSON.stringify(y);
const isNew = (screen: Screen): boolean => screen.kind === "startingXI" || screen.kind === "choosePlayer";
const HEADING = { kind: "heading" } as const;
const anyScreen = fc.constantFrom(...SCREENS);
const anyId = fc.option(fc.oneof(fc.constant(""), fc.constantFrom("xi-slot-0", "formation-4-4-2"), fc.string()), { nil: undefined });

describe("@US-1 S-005 where focus goes on the starting XI and choose screens", () => {
  describe("Given the very first screen is a new one", () => {
    it.each(NEW_SCREENS)("when %j is drawn first, then the heading is focused, even if an id is named @contract-shape:pure-function", (screen) => {
      expect(focusPlan(undefined, screen, undefined)).toEqual(HEADING);
      expect(focusPlan(undefined, screen, "xi-slot-0")).toEqual(HEADING);
    });
  });

  describe("Given Sam moves between screens, one of which is new", () => {
    const pairs = SCREENS.flatMap((from) =>
      SCREENS.filter((to) => !sameScreen(from, to) && (isNew(from) || isNew(to))).map((to): [Screen, Screen] => [from, to]),
    );

    it.each(pairs)("when %j becomes %j, then the new heading is focused whether or not an id is named @driving_port @contract-shape:pure-function", (from, to) => {
      expect(focusPlan(from, to, undefined)).toEqual(HEADING);
      expect(focusPlan(from, to, "xi-slot-0")).toEqual(HEADING);
    });

    it("when Sam goes club home, Starting XI, a slot, a pick (back on Starting XI), Back (club home), then each step focuses a heading @walking_skeleton @driving_port @contract-shape:pure-function", () => {
      const journey: Screen[] = [
        { kind: "clubHome", clubId: A },
        { kind: "startingXI", clubId: A },
        { kind: "choosePlayer", clubId: A, slot: 8 },
        { kind: "startingXI", clubId: A },
        { kind: "clubHome", clubId: A },
      ];
      journey.slice(1).forEach((next, index) => {
        expect(focusPlan(journey[index], next, undefined)).toEqual(HEADING);
      });
    });

    it("when only the club differs (Starting XI of A to B, or the choose screen of A to B at the same slot), then the heading is focused @boundary @contract-shape:pure-function", () => {
      expect(focusPlan({ kind: "startingXI", clubId: A }, { kind: "startingXI", clubId: B }, "x")).toEqual(HEADING);
      expect(focusPlan({ kind: "choosePlayer", clubId: A, slot: 0 }, { kind: "choosePlayer", clubId: B, slot: 0 }, "x")).toEqual(HEADING);
    });

    it("when only the slot differs (slot 0 to slot 10 of the same club), then the heading is focused @boundary @contract-shape:pure-function", () => {
      expect(focusPlan({ kind: "choosePlayer", clubId: A, slot: 0 }, { kind: "choosePlayer", clubId: A, slot: 10 }, "x")).toEqual(HEADING);
    });
  });

  describe("Given a new screen is drawn again unchanged", () => {
    it.each(NEW_SCREENS)("when %j is redrawn with an id, then that element is focused, and without an id or with an empty one the heading @boundary @contract-shape:pure-function", (screen) => {
      expect(focusPlan(screen, copy(screen), "xi-slot-0")).toEqual({ kind: "element", id: "xi-slot-0" });
      expect(focusPlan(screen, copy(screen), undefined)).toEqual(HEADING);
      expect(focusPlan(screen, copy(screen), "")).toEqual(HEADING);
    });
  });

  it("Given any previous, next and id, then the plan names the element exactly when the screen is the same and the id is not empty, else the heading, and the inputs are not changed @property @contract-shape:pure-function", () => {
    fc.assert(
      fc.property(fc.option(anyScreen, { nil: undefined }), anyScreen, anyId, (previous, next, id) => {
        const before = JSON.stringify([previous, next, id]);
        const expected = previous !== undefined && sameScreen(previous, next) && id !== undefined && id !== "" ? { kind: "element", id } : HEADING;
        expect(focusPlan(previous, next, id)).toEqual(expected);
        expect(JSON.stringify([previous, next, id])).toBe(before);
      }),
    );
  });

  it("Given any screen and an equal copy of it, then they count as the same screen @property @contract-shape:pure-function", () => {
    fc.assert(
      fc.property(anyScreen, (screen) => {
        expect(focusPlan(screen, copy(screen), "an-id")).toEqual({ kind: "element", id: "an-id" });
      }),
    );
  });
});
