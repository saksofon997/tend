import { getDb } from "@/lib/db";
import type { Database } from "@tend/db";
import cron from "node-cron";
import { runNotificationJob } from "./job";
import type { NotificationJobLogger, NotificationJobResult } from "./job";

export const DEFAULT_NOTIFICATION_JOB_CRON = "*/30 * * * *";

interface ScheduledTaskHandle {
  start(): void | Promise<void>;
  stop(): void | Promise<void>;
}

interface CronScheduler {
  validate(expression: string): boolean;
  schedule(
    expression: string,
    task: () => Promise<NotificationJobResult | null>,
    options: { name: string; noOverlap: boolean },
  ): ScheduledTaskHandle;
}

type RunNotificationJob = (
  database: Database,
  options?: { logger?: NotificationJobLogger },
) => Promise<NotificationJobResult>;

interface NotificationWorkerEnv {
  NODE_ENV?: string;
  NOTIFICATIONS_JOB_CRON?: string;
  NOTIFICATIONS_JOB_RUN_ON_START?: string;
}

interface NotificationWorkerOptions {
  database?: Database;
  env?: NotificationWorkerEnv;
  logger?: NotificationJobLogger;
  runJob?: RunNotificationJob;
  scheduler?: CronScheduler;
}

export interface NotificationWorker {
  cronExpression: string;
  runOnce(): Promise<NotificationJobResult | null>;
  task: ScheduledTaskHandle;
}

export function getNotificationJobCron(env: NotificationWorkerEnv = process.env): string {
  return env.NOTIFICATIONS_JOB_CRON?.trim() || DEFAULT_NOTIFICATION_JOB_CRON;
}

export function shouldRunNotificationJobOnStart(env: NotificationWorkerEnv = process.env): boolean {
  return env.NOTIFICATIONS_JOB_RUN_ON_START === "true";
}

export function startNotificationWorker(
  options: NotificationWorkerOptions = {},
): NotificationWorker {
  const env = options.env ?? process.env;
  const logger = options.logger ?? console;
  const scheduler = options.scheduler ?? cron;
  const cronExpression = getNotificationJobCron(env);

  if (!scheduler.validate(cronExpression)) {
    throw new Error(`Invalid NOTIFICATIONS_JOB_CRON expression: ${cronExpression}`);
  }

  const database = options.database ?? getDb();
  const runJob = options.runJob ?? runNotificationJob;
  let isRunning = false;

  async function runOnce(): Promise<NotificationJobResult | null> {
    if (isRunning) {
      logger.warn("Notification job is already running; skipping overlapping execution.");
      return null;
    }

    isRunning = true;
    try {
      return await runJob(database, { logger });
    } catch (error) {
      logger.error("Notification job failed.", error);
      return null;
    } finally {
      isRunning = false;
    }
  }

  const task = scheduler.schedule(cronExpression, runOnce, {
    name: "tend-notifications",
    noOverlap: true,
  });

  logger.info(`Notification worker scheduled with cron expression: ${cronExpression}`);

  if (shouldRunNotificationJobOnStart(env)) {
    void runOnce();
  }

  return { cronExpression, runOnce, task };
}
