import { describe, expect, it } from "bun:test";
import { ITEM_NAME_MAX_LENGTH, todayDateInputValue } from "../../src/constants";
import { validateItemForm } from "../../src/utils/itemFormValidation";

describe("item form field validation coverage", () => {
  const todayDate = todayDateInputValue(new Date("2026-06-17T12:00:00.000Z"));

  it("returns all field errors together", () => {
    expect(
      validateItemForm(
        {
          name: "",
          type: "want",
          rhythmDays: 400,
          lifeArea: null,
          lastTendedDate: "2099-01-01",
          sharedWithEmail: "bad-email",
        },
        todayDate,
      ),
    ).toEqual({
      name: "Give your item a name",
      lastTendedDate: "Last tended cannot be in the future",
      rhythmDays: "Rhythm must be 365 days or fewer",
      sharedWithEmail: "Enter a valid friend email address",
    });
  });

  it("requires a last tended date", () => {
    expect(
      validateItemForm(
        {
          name: "Water plants",
          type: "want",
          rhythmDays: 7,
          lifeArea: null,
          lastTendedDate: "",
          sharedWithEmail: "",
        },
        todayDate,
      ),
    ).toEqual({ lastTendedDate: "Last tended date is required" });
  });
});
