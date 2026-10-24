import type { Action } from "../../app/state";
import { formatGoalDifference, type StandingRow } from "../../domain/standings";
import { el } from "../dom";

export interface TableView {
  readonly rows: readonly StandingRow[];
  readonly managedClubId: string;
}

const COLUMN_HEADINGS = ["Pos", "Club", "P", "W", "D", "L", "GD", "Pts"] as const;

const headerCell = (heading: string): HTMLElement => el("th", { scope: "col" }, heading);

const bodyRow = (row: StandingRow, managedClubId: string): HTMLElement => {
  const attributes = row.clubId === managedClubId ? { "aria-current": "true" } : {};
  return el(
    "tr",
    attributes,
    el("td", {}, String(row.position)),
    el("th", { scope: "row" }, row.name),
    el("td", {}, String(row.played)),
    el("td", {}, String(row.won)),
    el("td", {}, String(row.drawn)),
    el("td", {}, String(row.lost)),
    el("td", {}, formatGoalDifference(row.goalDifference)),
    el("td", {}, String(row.points)),
  );
};

export const renderTable = (
  root: HTMLElement,
  { rows, managedClubId }: TableView,
  dispatch: (action: Extract<Action, { type: "Back" }>) => void,
): void => {
  const back = el("button", { type: "button", class: "back-button" }, "Back");
  back.addEventListener("click", () => dispatch({ type: "Back" }));
  root.replaceChildren(
    el(
      "section",
      { class: "league-table" },
      el("h1", { id: "table-title", tabindex: "-1" }, "League table"),
      el(
        "table",
        { class: "standings", "aria-labelledby": "table-title" },
        el("thead", {}, el("tr", {}, ...COLUMN_HEADINGS.map(headerCell))),
        el("tbody", {}, ...rows.map((row) => bodyRow(row, managedClubId))),
      ),
      back,
    ),
  );
};
