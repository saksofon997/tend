const EXPO_PUSH_SEND_URL = "https://exp.host/--/api/v2/push/send";

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

interface ExpoPushReceipt {
  status?: string;
  message?: string;
  details?: {
    error?: string;
  };
}

interface ExpoPushResponse {
  data?: ExpoPushReceipt;
  errors?: Array<{ message?: string }>;
}

type FetchPush = (input: string, init: RequestInit) => Promise<Response>;

export async function sendExpoPushNotification(
  message: PushNotificationMessage,
  fetchFn: FetchPush = fetch,
): Promise<PushSendResult> {
  const response = await fetchFn(EXPO_PUSH_SEND_URL, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      to: message.to,
      title: message.title,
      body: message.body,
      data: message.data,
      sound: null,
      channelId: "tend-reminders",
    }),
  });

  if (!response.ok) {
    return {
      ok: false,
      invalidToken: false,
      error: `Expo push request failed with ${response.status}`,
    };
  }

  const payload = (await response.json()) as ExpoPushResponse;
  const receipt = payload.data;
  if (receipt?.status === "ok") {
    return { ok: true, invalidToken: false, error: null };
  }

  const error = receipt?.details?.error ?? payload.errors?.[0]?.message ?? receipt?.message ?? null;
  return {
    ok: false,
    invalidToken: error === "DeviceNotRegistered",
    error,
  };
}
