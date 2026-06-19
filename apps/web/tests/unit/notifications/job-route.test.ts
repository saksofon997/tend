import { describe, expect, it } from "bun:test";
import { GET as runNotificationJobRoute } from "@/app/api/v1/jobs/notifications/route";

describe("notification job route", () => {
  it("rejects requests without the cron bearer token", async () => {
    process.env.CRON_SECRET = "test-secret";

    const response = await runNotificationJobRoute(
      new Request("http://localhost/api/v1/jobs/notifications"),
    );

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: "Unauthorized" });
  });
});
