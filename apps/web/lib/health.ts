import { API_VERSION } from "@/lib/version";
import { pingDatabase } from "@tend/db";

export type HealthResult =
  | {
      ok: true;
      status: 200;
      body: { status: "ok"; database: "connected"; version: string };
    }
  | {
      ok: false;
      status: 503;
      body: {
        status: "error";
        database: "not_configured" | "disconnected";
        error: string;
        version: string;
      };
    };

export async function checkHealth(databaseUrl: string | undefined): Promise<HealthResult> {
  if (!databaseUrl) {
    return {
      ok: false,
      status: 503,
      body: {
        status: "error",
        database: "not_configured",
        error: "DATABASE_URL is missing",
        version: API_VERSION,
      },
    };
  }

  try {
    await pingDatabase(databaseUrl);
    return {
      ok: true,
      status: 200,
      body: { status: "ok", database: "connected", version: API_VERSION },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown database error";
    return {
      ok: false,
      status: 503,
      body: {
        status: "error",
        database: "disconnected",
        error: message,
        version: API_VERSION,
      },
    };
  }
}
