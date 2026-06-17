import {
  type PushRegistrationResult,
  configurePushNotifications,
  getStoredPushToken,
  registerForPushNotifications,
} from "@api/pushNotifications";
import { t } from "@i18n";
import { useCallback, useEffect, useState } from "react";

export function usePushNotifications() {
  const [pushToken, setPushToken] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [registering, setRegistering] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadPushState() {
      await configurePushNotifications();
      const storedToken = await getStoredPushToken();
      if (mounted) {
        setPushToken(storedToken);
      }
    }

    loadPushState();
    return () => {
      mounted = false;
    };
  }, []);

  const register = useCallback(async () => {
    setRegistering(true);
    setStatusMessage(null);

    const result = await registerForPushNotifications();
    handleRegistrationResult(result, setPushToken, setStatusMessage);
    setRegistering(false);
  }, []);

  return {
    pushToken,
    register,
    registering,
    statusMessage,
  };
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
