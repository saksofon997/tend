import { jsonData, jsonError } from "@/lib/api";
import { getDb } from "@/lib/db";
import { runNotificationJob } from "@/lib/notifications/job";

export const runtime = "nodejs";

function getJobSecrets(): string[] {
  return [process.env.NOTIFICATIONS_JOB_SECRET, process.env.CRON_SECRET].filter(
    (secret): secret is string => Boolean(secret),
  );
}

function isAuthorized(request: Request): boolean {
  const secrets = getJobSecrets();
  if (secrets.length === 0) {
    return false;
  }

  const authorization = request.headers.get("authorization");
  return secrets.some((secret) => authorization === `Bearer ${secret}`);
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    console.warn("Notification job HTTP trigger rejected: unauthorized");
    return jsonError("Unauthorized", 401);
  }

  console.info("Notification job triggered via HTTP");
  return jsonData(await runNotificationJob(getDb()));
}
