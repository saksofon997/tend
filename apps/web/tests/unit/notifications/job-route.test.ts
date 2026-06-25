import { describe, expect, it, mock } from "bun:test";

const runNotificationJob = mock(() =>
  Promise.resolve({ checked: 0, failed: 0, invalidated: 0, sent: 0, skipped: 0 }),
);

mock.module("@/lib/notifications/job", () => ({
  runNotificationJob,
}));

import { GET as runNotificationJobRoute } from "@/app/api/v1/jobs/notifications/route";

describe("notification job route", () => {
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

    const response = await runNotificationJobRoute(
      new Request("http://localhost/api/v1/jobs/notifications", {
        headers: { Authorization: "Bearer test-secret" },
      }),
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      checked: 0,
      failed: 0,
      invalidated: 0,
      sent: 0,
      skipped: 0,
    });
  });
});
