import { describe, expect, it } from "bun:test";
import { isDatabaseAvailable } from "./test-helpers";

describe("waitForDatabase", () => {
  it("connects when DATABASE_URL is set", async () => {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl || !(await isDatabaseAvailable())) {
      console.warn("Skipping: database not available");
      return;
    }

    const { waitForDatabase } = await import("./wait-for-database");
    await expect(waitForDatabase(databaseUrl, { maxAttempts: 1 })).resolves.toBeUndefined();
  });
});
