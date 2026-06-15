import { describe, expect, it } from "bun:test";
import { validateItemForm } from "@/lib/forms/item-form-validation";

describe("validateItemForm", () => {
  const todayDate = "2026-06-15";

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
    const errors = validateItemForm(
      {
        name: "   ",
        type: "want",
        rhythmDays: 7,
        lifeArea: null,
        lastTendedDate: todayDate,
      },
      todayDate,
    );

    expect(errors?.name).toBe("Name is required");
  });

  it("rejects future last tended dates", () => {
    const errors = validateItemForm(
      {
        name: "Water plants",
        type: "want",
        rhythmDays: 7,
        lifeArea: null,
        lastTendedDate: "2026-06-16",
      },
      todayDate,
    );

    expect(errors?.lastTendedDate).toBe("Last tended cannot be in the future");
  });

  it("rejects custom rhythms outside the supported range", () => {
    const errors = validateItemForm(
      {
        name: "Dental cleaning",
        type: "must",
        rhythmDays: 400,
        lifeArea: "health",
        lastTendedDate: todayDate,
      },
      todayDate,
    );

    expect(errors?.rhythmDays).toBe("Rhythm must be 365 days or fewer");
  });
});
