import {
  clearScheduledPushNotifications,
  configurePushNotifications,
  disablePushNotifications,
  getStoredPushToken,
  registerForPushNotifications,
} from "@api/pushNotifications";
import type { TendApi } from "@api/tendApi";
import { t } from "@i18n";
import { useCallback, useEffect, useState } from "react";
import { Platform } from "react-native";

const EXPO_PUSH_TOKEN_PATTERN = /^(ExponentPushToken|ExpoPushToken)\[[\w-]+\]$/;

export function isExpoPushToken(token: string): boolean {
  return EXPO_PUSH_TOKEN_PATTERN.test(token);
}

function currentPushPlatform(): "ios" | "android" {
  return Platform.OS === "ios" ? "ios" : "android";
}

interface PushSubscriptionApi {
  deletePushSubscription(token: string): Promise<unknown>;
  savePushSubscription(token: string, platform: "ios" | "android"): Promise<unknown>;
}

export async function saveRegisteredPushToken(
  api: PushSubscriptionApi,
  token: string,
  previousToken: string | null,
  platform: "ios" | "android" = currentPushPlatform(),
) {
  if (previousToken && previousToken !== token && isExpoPushToken(previousToken)) {
    await api.deletePushSubscription(previousToken).catch(() => null);
  }

  await api.savePushSubscription(token, platform);
}

export async function deleteRegisteredPushToken(
  api: PushSubscriptionApi,
  pushToken: string | null,
  storedToken: string | null,
) {
  const tokenToDelete = pushToken ?? storedToken;
  if (tokenToDelete && isExpoPushToken(tokenToDelete)) {
    await api.deletePushSubscription(tokenToDelete);
  }
}

export function usePushNotifications(api: TendApi) {
  const [pushToken, setPushToken] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [registering, setRegistering] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadPushState() {
      await configurePushNotifications();
      const storedToken = await getStoredPushToken();
      if (storedToken && !isExpoPushToken(storedToken)) {
        await disablePushNotifications().catch(() => null);
        if (mounted) {
          setPushToken(null);
        }
        return;
      }

      if (mounted) {
        setPushToken(storedToken);
      }
      if (storedToken) {
        await api.savePushSubscription(storedToken, currentPushPlatform()).catch(() => null);
        await clearScheduledPushNotifications().catch(() => null);
      }
    }

    loadPushState();
    return () => {
      mounted = false;
    };
  }, [api]);

  const register = useCallback(async () => {
    setRegistering(true);
    setStatusMessage(null);

    try {
      const previousToken = await getStoredPushToken();
      const result = await registerForPushNotifications();
      if (result.status === "registered") {
        await saveRegisteredPushToken(api, result.token, previousToken);
        await clearScheduledPushNotifications().catch(() => null);
        setPushToken(result.token);
        setStatusMessage(t("settings.notifications.enabled"));
      } else {
        setPushToken(null);
        setStatusMessage(result.reason);
      }
    } catch {
      setStatusMessage(t("errors.notifications.enable"));
    } finally {
      setRegistering(false);
    }
  }, [api]);

  const disable = useCallback(async () => {
    setRegistering(true);
    setStatusMessage(null);

    try {
      const storedToken = await getStoredPushToken();
      await deleteRegisteredPushToken(api, pushToken, storedToken);
      await disablePushNotifications();
      setPushToken(null);
      setStatusMessage(t("settings.notifications.disabled"));
    } catch {
      setStatusMessage(t("errors.notifications.disable"));
    } finally {
      setRegistering(false);
    }
  }, [api, pushToken]);

  return {
    disable,
    pushToken,
    register,
    registering,
    statusMessage,
  };
}
