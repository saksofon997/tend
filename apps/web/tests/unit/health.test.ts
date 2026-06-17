import { describe, expect, it } from "bun:test";
import { checkHealth } from "@/lib/health";
import { API_VERSION } from "@/lib/version";
import { isDatabaseAvailable } from "@tend/db";

describe("checkHealth", () => {
  it("returns not_configured when DATABASE_URL is missing", async () => {
    const result = await checkHealth(undefined);

    expect(result.ok).toBe(false);
    expect(result.status).toBe(503);
    expect(result.body.database).toBe("not_configured");
    expect(result.body.version).toBe(API_VERSION);
  });

  it("returns connected when database is available", async () => {
    if (!(await isDatabaseAvailable())) {
      console.warn("Skipping: database not available (start Docker with docker compose up -d)");
      return;
    }

    const result = await checkHealth(process.env.DATABASE_URL);

    expect(result.ok).toBe(true);
    expect(result.status).toBe(200);
    expect(result.body).toEqual({
      status: "ok",
      database: "connected",
      version: API_VERSION,
    });
  });
});
