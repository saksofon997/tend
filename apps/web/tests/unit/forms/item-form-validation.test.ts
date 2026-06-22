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
          sharedWithEmail: "",
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
        sharedWithEmail: "",
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
        sharedWithEmail: "",
      },
      todayDate,
    );

    expect(errors?.lastTendedDate).toBe("Last tended cannot be in the future");
  });

  it("rejects names longer than the limit", () => {
    const errors = validateItemForm(
      {
        name: "a".repeat(201),
        type: "want",
        rhythmDays: 7,
        lifeArea: null,
        lastTendedDate: todayDate,
        sharedWithEmail: "",
      },
      todayDate,
    );

    expect(errors?.name).toBe("Name must be 200 characters or fewer");
  });

  it("rejects custom rhythms outside the supported range", () => {
    const errors = validateItemForm(
      {
        name: "Dental cleaning",
        type: "must",
        rhythmDays: 400,
        lifeArea: "health",
        lastTendedDate: todayDate,
        sharedWithEmail: "",
      },
      todayDate,
    );

    expect(errors?.rhythmDays).toBe("Rhythm must be 365 days or fewer");
  });

  it("rejects invalid friend emails", () => {
    const errors = validateItemForm(
      {
        name: "Dinner",
        type: "want",
        rhythmDays: 14,
        lifeArea: "relationships",
        lastTendedDate: todayDate,
        sharedWithEmail: "not-an-email",
      },
      todayDate,
    );

    expect(errors?.sharedWithEmail).toBe("Enter a valid friend email address");
  });
});
