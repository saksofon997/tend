import { describe, expect, it } from "bun:test";
import { REMINDER_POLL_MS } from "@/lib/reminders/polling";

describe("REMINDER_POLL_MS", () => {
  it("polls reminder banner content every 5 minutes", () => {
    expect(REMINDER_POLL_MS).toBe(5 * 60 * 1000);
  });
});
