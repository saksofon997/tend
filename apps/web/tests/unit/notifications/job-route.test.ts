import { afterEach, describe, expect, it, mock, spyOn } from "bun:test";
import { GET as runNotificationJobRoute } from "@/app/api/v1/jobs/notifications/route";
import * as dbModule from "@/lib/db";
import * as jobModule from "@/lib/notifications/job";

const jobResult = {
  checked: 0,
  failed: 0,
  invalidated: 0,
  sent: 0,
  skipped: 0,
};

describe("notification job route", () => {
  afterEach(() => {
    mock.restore();
  });

  it("rejects requests without the notification job bearer token", async () => {
    process.env.NOTIFICATIONS_JOB_SECRET = "test-secret";

    const response = await runNotificationJobRoute(
      new Request("http://localhost/api/v1/jobs/notifications"),
    );

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: "Unauthorized" });
  });

  it("accepts requests with the notification job bearer token", async () => {
    process.env.NOTIFICATIONS_JOB_SECRET = "test-secret";
    spyOn(dbModule, "getDb").mockReturnValue({} as never);
    spyOn(jobModule, "runNotificationJob").mockResolvedValue(jobResult);

    const response = await runNotificationJobRoute(
      new Request("http://localhost/api/v1/jobs/notifications", {
        headers: { Authorization: "Bearer test-secret" },
      }),
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(jobResult);
    expect(jobModule.runNotificationJob).toHaveBeenCalledWith({});
  });
});
