import postgres from "postgres";

const STARTUP_ERROR_CODES = new Set(["57P03", "ECONNREFUSED", "ENOTFOUND"]);

function isStartupError(error: unknown): boolean {
  if (!error || typeof error !== "object") {
    return false;
  }

  const code = "code" in error ? String(error.code) : "";
  if (STARTUP_ERROR_CODES.has(code)) {
    return true;
  }

  const message = "message" in error ? String(error.message) : "";
  return message.includes("starting up") || message.includes("ECONNREFUSED");
}

export async function waitForDatabase(
  connectionString: string,
  options: { maxAttempts?: number; delayMs?: number } = {},
): Promise<void> {
  const maxAttempts = options.maxAttempts ?? 30;
  const delayMs = options.delayMs ?? 1000;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const client = postgres(connectionString, { max: 1 });

    try {
      await client`select 1`;
      await client.end();
      return;
    } catch (error) {
      await client.end({ timeout: 0 }).catch(() => undefined);

      if (!isStartupError(error) || attempt === maxAttempts) {
        throw error;
      }

      console.warn(`Database not ready yet (${attempt}/${maxAttempts}) — retrying in ${delayMs}ms`);
      await Bun.sleep(delayMs);
    }
  }
}
