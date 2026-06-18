import { describe, expect, it } from "bun:test";
import { todayDateInputValue } from "../../src/constants";
import { validateItemForm } from "../../src/utils/itemFormValidation";

describe("validateItemForm", () => {
  const todayDate = todayDateInputValue(new Date("2026-06-17T12:00:00.000Z"));

  it("returns null for valid values", () => {
    expect(
      validateItemForm(
        {
          name: "Water plants",
          type: "want",
          rhythmDays: 7,
          lifeArea: null,
          lastTendedDate: todayDate,
        },
        todayDate,
      ),
    ).toBeNull();
  });

  it("requires a name", () => {
    expect(
      validateItemForm(
        {
          name: "   ",
          type: "want",
          rhythmDays: 7,
          lifeArea: null,
          lastTendedDate: todayDate,
        },
        todayDate,
      ),
    ).toEqual({ name: "Name is required" });
  });

  it("rejects future last tended dates", () => {
    expect(
      validateItemForm(
        {
          name: "Water plants",
          type: "want",
          rhythmDays: 7,
          lifeArea: null,
          lastTendedDate: "2099-01-01",
        },
        todayDate,
      ),
    ).toEqual({ lastTendedDate: "Last tended cannot be in the future" });
  });

  it("rejects invalid rhythm days", () => {
    expect(
      validateItemForm(
        {
          name: "Water plants",
          type: "want",
          rhythmDays: 0,
          lifeArea: null,
          lastTendedDate: todayDate,
        },
        todayDate,
      ),
    ).toEqual({ rhythmDays: "Rhythm must be at least 1 day" });
  });
});
