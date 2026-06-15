import { describe, expect, it } from "bun:test";
import { pingDatabase } from "./ping";
import { isDatabaseAvailable } from "./test-helpers";

describe("pingDatabase", () => {
  it("connects when database is available", async () => {
    if (!(await isDatabaseAvailable())) {
      console.warn("Skipping: database not available (start Docker with docker compose up -d)");
      return;
    }

    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      return;
    }

    await expect(pingDatabase(databaseUrl)).resolves.toBeUndefined();
  });
});
