// @US-1 (S-011 read my club's news in the Inbox) @regression
// CONTRACT_SHAPE: pure-function
// Passes before and after DELIVER (D6, K3): opening the Inbox writes nothing and changes no save format. `toSave` projects any screen that carries a known clubId, so a state on an
// `inbox` screen must encode to the very text of the club home it came from and the autosave decision (`saveTextFor`) must be "no write". Built by hand (no ViewInbox yet).
import { describe, expect, it } from "vitest";
import { SAVE_VERSION, encodeSave, saveTextFor } from "../../../src/app/save";
import type { GameState, Screen } from "../../../src/app/state";
import { afterMatchdays, homeOf, withFormation, withPick } from "../S-010/save-world";

const onInbox = (home: GameState): GameState => ({ ...home, screen: { kind: "inbox", clubId: (home.screen as { clubId: string }).clubId } as unknown as Screen });
const HOMES: readonly (readonly [string, GameState])[] = [["nothing played", homeOf(31, 0)], ["3 matches", afterMatchdays(homeOf(31, 0), 3)], ["14 matches", afterMatchdays(homeOf(31, 0), 14)], ["4-3-3 and a pick after 2 matches", withPick(withFormation(afterMatchdays(homeOf(31, 4), 2), "4-3-3"), 4, 3)]];
describe("@US-1 S-011 opening the Inbox writes no save", () => {
  it("Given the save format of S-010, when S-011 lands, then the version is still 1 (no bump) @regression @boundary @contract-shape:pure-function", () => expect(SAVE_VERSION).toBe(1));
  it.each(HOMES)("Given the club home with %s, when the club is on the Inbox screen instead, then it encodes to the same text and the autosave writes nothing @regression @driving_port @contract-shape:pure-function", (_label, home) => {
    const text = encodeSave(home);
    expect(text).toBeDefined();
    expect(encodeSave(onInbox(home))).toBe(text);
    expect(saveTextFor(text, onInbox(home))).toBeUndefined();
  });
});
