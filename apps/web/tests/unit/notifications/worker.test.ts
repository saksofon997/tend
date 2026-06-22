import { describe, expect, it } from "bun:test";
import type { NotificationJobResult } from "@/lib/notifications/job";
import {
  DEFAULT_NOTIFICATION_JOB_CRON,
  getNotificationJobCron,
  shouldRunNotificationJobOnStart,
  startNotificationWorker,
} from "@/lib/notifications/worker";
import type { Database } from "@tend/db";

function createLogger() {
  const messages: string[] = [];
  return {
    messages,
    logger: {
      info: (message: string) => messages.push(`info:${message}`),
      warn: (message: string) => messages.push(`warn:${message}`),
      error: (message: string) => messages.push(`error:${message}`),
    },
  };
}

describe("notification worker", () => {
  it("uses the default 30-minute cron expression unless overridden", () => {
    expect(getNotificationJobCron({})).toBe(DEFAULT_NOTIFICATION_JOB_CRON);
    expect(getNotificationJobCron({ NOTIFICATIONS_JOB_CRON: "0 * * * *" })).toBe("0 * * * *");
    expect(getNotificationJobCron({ NOTIFICATIONS_JOB_CRON: "  " })).toBe(
      DEFAULT_NOTIFICATION_JOB_CRON,
    );
  });

  it("only runs on start when explicitly configured", () => {
    expect(shouldRunNotificationJobOnStart({})).toBe(false);
    expect(shouldRunNotificationJobOnStart({ NOTIFICATIONS_JOB_RUN_ON_START: "false" })).toBe(
      false,
    );
    expect(shouldRunNotificationJobOnStart({ NOTIFICATIONS_JOB_RUN_ON_START: "true" })).toBe(true);
  });

  it("schedules the notification job with overlap protection", async () => {
    const scheduled: Array<{ expression: string; options: { name: string; noOverlap: boolean } }> =
      [];
    const scheduler = {
      validate: () => true,
      schedule: (
        expression: string,
        task: () => Promise<unknown>,
        options: { name: string; noOverlap: boolean },
      ) => {
        scheduled.push({ expression, options });
        return {
          start: () => undefined,
          stop: () => undefined,
          task,
        };
      },
    };
    const { logger, messages } = createLogger();
    let runs = 0;

    const worker = startNotificationWorker({
      database: {} as Database,
      env: { NOTIFICATIONS_JOB_CRON: "*/15 * * * *" },
      logger,
      scheduler,
      runJob: async () => {
        runs += 1;
        return { checked: 1, sent: 1, skipped: 0, failed: 0, invalidated: 0 };
      },
    });

    expect(worker.cronExpression).toBe("*/15 * * * *");
    expect(scheduled).toEqual([
      {
        expression: "*/15 * * * *",
        options: { name: "tend-notifications", noOverlap: true },
      },
    ]);

    await worker.runOnce();

    expect(runs).toBe(1);
    expect(messages).toContain(
      "info:Notification job finished: checked=1 sent=1 skipped=0 failed=0 invalidated=0",
    );
  });

  it("skips overlapping executions", async () => {
    const scheduler = {
      validate: () => true,
      schedule: () => ({ start: () => undefined, stop: () => undefined }),
    };
    const { logger, messages } = createLogger();
    let finishRun!: () => void;
    const pendingRun = new Promise<NotificationJobResult>((resolve) => {
      finishRun = () => resolve({ checked: 1, sent: 0, skipped: 1, failed: 0, invalidated: 0 });
    });

    const worker = startNotificationWorker({
      database: {} as Database,
      logger,
      scheduler,
      runJob: () => pendingRun,
    });

    const firstRun = worker.runOnce();
    const secondRun = await worker.runOnce();

    expect(secondRun).toBeNull();
    expect(messages).toContain(
      "warn:Notification job is already running; skipping overlapping execution.",
    );

    finishRun();
    await firstRun;
  });

  it("rejects invalid cron expressions", () => {
    expect(() =>
      startNotificationWorker({
        database: {} as Database,
        env: { NOTIFICATIONS_JOB_CRON: "not a cron" },
        scheduler: {
          validate: () => false,
          schedule: () => ({ start: () => undefined, stop: () => undefined }),
        },
      }),
    ).toThrow("Invalid NOTIFICATIONS_JOB_CRON expression: not a cron");
  });
});
