import type { UserResponse } from "@/types";
import { ApiError } from "@api/apiError";

export const SESSION_RESTORE_TIMEOUT_MS = 8_000;

type SessionClient = {
  me(): Promise<{ user: UserResponse }>;
  clearSession(): Promise<void>;
};

export async function restoreSession(
  client: SessionClient,
  timeoutMs = SESSION_RESTORE_TIMEOUT_MS,
): Promise<UserResponse | null> {
  try {
    const body = await Promise.race([
      client.me(),
      new Promise<never>((_, reject) => {
        setTimeout(() => reject(new ApiError("Session restore timed out", 0)), timeoutMs);
      }),
    ]);

    return body.user;
  } catch (error) {
    if (error instanceof ApiError && (error.status === 401 || error.status === 0)) {
      await client.clearSession();
    }

    return null;
  }
}
