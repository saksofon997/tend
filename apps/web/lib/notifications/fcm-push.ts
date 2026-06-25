import { createSign } from "node:crypto";

const FCM_SCOPE = "https://www.googleapis.com/auth/firebase.messaging";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";

export interface PushNotificationMessage {
  to: string;
  title: string;
  body: string;
  data: Record<string, string>;
}

export interface PushSendResult {
  ok: boolean;
  invalidToken: boolean;
  error: string | null;
}

interface FcmServiceAccount {
  clientEmail: string;
  privateKey: string;
  projectId: string;
}

interface FcmAccessToken {
  accessToken: string;
  expiresAt: number;
}

interface FcmErrorResponse {
  error?: {
    status?: string;
    message?: string;
    details?: Array<{
      "@type"?: string;
      errorCode?: string;
    }>;
  };
}

type FetchPush = (input: string, init: RequestInit) => Promise<Response>;

let cachedAccessToken: FcmAccessToken | null = null;

export function resetFcmAccessTokenCacheForTests(): void {
  cachedAccessToken = null;
}

function base64Url(input: string | Buffer): string {
  return Buffer.from(input)
    .toString("base64")
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replace(/=+$/u, "");
}

function normalizePrivateKey(privateKey: string): string {
  return privateKey.replaceAll("\\n", "\n");
}

export function getMissingFcmConfiguration(env: NodeJS.ProcessEnv = process.env): string[] {
  const missing: string[] = [];
  if (!env.FIREBASE_PROJECT_ID) {
    missing.push("FIREBASE_PROJECT_ID");
  }
  if (!env.FIREBASE_CLIENT_EMAIL) {
    missing.push("FIREBASE_CLIENT_EMAIL");
  }
  if (!env.FIREBASE_PRIVATE_KEY) {
    missing.push("FIREBASE_PRIVATE_KEY");
  }
  return missing;
}

function getServiceAccount(env: NodeJS.ProcessEnv = process.env): FcmServiceAccount | null {
  if (!env.FIREBASE_PROJECT_ID || !env.FIREBASE_CLIENT_EMAIL || !env.FIREBASE_PRIVATE_KEY) {
    return null;
  }

  return {
    clientEmail: env.FIREBASE_CLIENT_EMAIL,
    privateKey: normalizePrivateKey(env.FIREBASE_PRIVATE_KEY),
    projectId: env.FIREBASE_PROJECT_ID,
  };
}

function createServiceAccountJwt(account: FcmServiceAccount, now: Date): string {
  const issuedAt = Math.floor(now.getTime() / 1000);
  const header = base64Url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const payload = base64Url(
    JSON.stringify({
      aud: GOOGLE_TOKEN_URL,
      exp: issuedAt + 3600,
      iat: issuedAt,
      iss: account.clientEmail,
      scope: FCM_SCOPE,
    }),
  );
  const unsignedJwt = `${header}.${payload}`;
  const signature = createSign("RSA-SHA256").update(unsignedJwt).sign(account.privateKey);
  return `${unsignedJwt}.${base64Url(signature)}`;
}

async function getAccessToken(
  account: FcmServiceAccount,
  options: { fetchFn: FetchPush; now: Date },
): Promise<string> {
  const nowMs = options.now.getTime();
  if (cachedAccessToken && cachedAccessToken.expiresAt > nowMs + 60_000) {
    return cachedAccessToken.accessToken;
  }

  const assertion = createServiceAccountJwt(account, options.now);
  const response = await options.fetchFn(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      assertion,
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
    }).toString(),
  });

  if (!response.ok) {
    throw new Error(`Google OAuth token request failed with ${response.status}`);
  }

  const payload = (await response.json()) as {
    access_token?: string;
    expires_in?: number;
  };

  if (!payload.access_token) {
    throw new Error("Google OAuth token response did not include access_token");
  }

  cachedAccessToken = {
    accessToken: payload.access_token,
    expiresAt: nowMs + (payload.expires_in ?? 3600) * 1000,
  };
  return payload.access_token;
}

function fcmErrorCode(payload: FcmErrorResponse): string | null {
  const details = payload.error?.details ?? [];
  const fcmError = details.find((detail) => detail["@type"]?.includes("google.firebase.fcm"));
  return fcmError?.errorCode ?? payload.error?.status ?? null;
}

function isInvalidFcmToken(errorCode: string | null): boolean {
  return (
    errorCode === "UNREGISTERED" ||
    errorCode === "INVALID_ARGUMENT" ||
    errorCode === "SENDER_ID_MISMATCH"
  );
}

export async function sendFcmPushNotification(
  message: PushNotificationMessage,
  options: {
    env?: NodeJS.ProcessEnv;
    fetchFn?: FetchPush;
    now?: Date;
  } = {},
): Promise<PushSendResult> {
  const env = options.env ?? process.env;
  const missing = getMissingFcmConfiguration(env);
  if (missing.length > 0) {
    return {
      ok: false,
      invalidToken: false,
      error: `FCM is not configured; missing ${missing.join(", ")}`,
    };
  }

  const account = getServiceAccount(env);
  if (!account) {
    return {
      ok: false,
      invalidToken: false,
      error: "FCM is not configured; service account credentials are invalid",
    };
  }

  const fetchFn = options.fetchFn ?? fetch;
  try {
    const now = options.now ?? new Date();
    const accessToken = await getAccessToken(account, { fetchFn, now });
    const response = await fetchFn(
      `https://fcm.googleapis.com/v1/projects/${account.projectId}/messages:send`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: {
            token: message.to,
            notification: {
              title: message.title,
              body: message.body,
            },
            data: message.data,
            android: {
              notification: {
                channel_id: "tend-reminders",
                default_sound: false,
              },
            },
          },
        }),
      },
    );

    if (response.ok) {
      return { ok: true, invalidToken: false, error: null };
    }

    const payload = (await response.json().catch(() => ({}))) as FcmErrorResponse;
    const errorCode = fcmErrorCode(payload);
    return {
      ok: false,
      invalidToken: isInvalidFcmToken(errorCode),
      error:
        errorCode ?? payload.error?.message ?? `FCM push request failed with ${response.status}`,
    };
  } catch (error) {
    return {
      ok: false,
      invalidToken: false,
      error: error instanceof Error ? error.message : "Unknown FCM push error",
    };
  }
}
