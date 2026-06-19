import {
  getSentryEnvironment,
  getTracesSampleRate,
  resolveSentryDsn,
} from "@/monitoring/sentryOptions";
import * as Sentry from "@sentry/react-native";
import { isDevMode } from "@utils/devMode";
import Constants from "expo-constants";

function readRuntimeSentryDsn(): string | undefined {
  const extraDsn = Constants.expoConfig?.extra?.sentryDsn;
  const publicDsn = process.env.EXPO_PUBLIC_SENTRY_DSN;

  return resolveSentryDsn({
    extraDsn: typeof extraDsn === "string" ? extraDsn : undefined,
    publicDsn,
  });
}

export function initSentry(): void {
  const dsn = readRuntimeSentryDsn();
  if (!dsn) {
    return;
  }

  const isDev = isDevMode();

  Sentry.init({
    dsn,
    enabled: true,
    environment: getSentryEnvironment(isDev),
    tracesSampleRate: getTracesSampleRate(isDev),
    debug: isDev,
  });
}

export { Sentry };
