import {
  type PushRegistrationResult,
  buildTendNotificationRequest,
  configurePushNotifications,
  disablePushNotifications,
  getStoredPushToken,
  registerForPushNotifications,
  scheduleTendNotification,
} from "@api/pushNotifications";
import type { TendApi } from "@api/tendApi";
import { t } from "@i18n";
import { useCallback, useEffect, useState } from "react";

export function usePushNotifications(api: TendApi) {
  const [pushToken, setPushToken] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [registering, setRegistering] = useState(false);
  const scheduleReminder = useCallback(async () => {
    await scheduleNextReminderNotification(api);
  }, [api]);

  useEffect(() => {
    let mounted = true;

    async function loadPushState() {
      await configurePushNotifications();
      const storedToken = await getStoredPushToken();
      if (mounted) {
        setPushToken(storedToken);
      }
      if (storedToken) {
        await scheduleReminder().catch(() => null);
      }
    }

    loadPushState();
    return () => {
      mounted = false;
    };
  }, [scheduleReminder]);

  const register = useCallback(async () => {
    setRegistering(true);
    setStatusMessage(null);

    try {
      const result = await registerForPushNotifications();
      handleRegistrationResult(result, setPushToken, setStatusMessage);
      if (result.status === "registered") {
        await scheduleReminder();
      }
    } catch {
      setStatusMessage(t("errors.notifications.schedule"));
    } finally {
      setRegistering(false);
    }
  }, [scheduleReminder]);

  const disable = useCallback(async () => {
    setRegistering(true);
    setStatusMessage(null);

    try {
      await disablePushNotifications();
      setPushToken(null);
      setStatusMessage(t("settings.notifications.disabled"));
    } catch {
      setStatusMessage(t("errors.notifications.disable"));
    } finally {
      setRegistering(false);
    }
  }, []);

  return {
    disable,
    pushToken,
    register,
    registering,
    scheduleReminder,
    statusMessage,
  };
}

async function scheduleNextReminderNotification(api: TendApi) {
  const reminders = await api.listReminders();
  const request = buildTendNotificationRequest(reminders);
  if (request) {
    await scheduleTendNotification(request);
  }
}

function handleRegistrationResult(
  result: PushRegistrationResult,
  setPushToken: (token: string | null) => void,
  setStatusMessage: (message: string | null) => void,
) {
  if (result.status === "registered") {
    setPushToken(result.token);
    setStatusMessage(t("settings.notifications.enabled"));
    return;
  }

  setPushToken(null);
  setStatusMessage(result.reason);
}
