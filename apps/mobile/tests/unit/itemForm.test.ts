import { describe, expect, it } from "bun:test";
import { ITEM_NAME_MAX_LENGTH, todayDateInputValue } from "../../src/constants";
import { t } from "../../src/i18n";
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
    ).toEqual({ name: t("errors.item.nameRequired") });
  });

  it("rejects names over the max length", () => {
    expect(
      validateItemForm(
        {
          name: "x".repeat(ITEM_NAME_MAX_LENGTH + 1),
          type: "want",
          rhythmDays: 7,
          lifeArea: null,
          lastTendedDate: todayDate,
        },
        todayDate,
      ),
    ).toEqual({
      name: t("errors.item.nameTooLong", { max: ITEM_NAME_MAX_LENGTH }),
    });
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
    ).toEqual({ lastTendedDate: t("errors.item.lastTendedFuture") });
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
    ).toEqual({ rhythmDays: t("errors.item.rhythmMin") });
  });
});
