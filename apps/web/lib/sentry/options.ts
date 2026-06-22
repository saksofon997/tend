export function getSentryDsn(): string | undefined {
  const dsn = process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN;
  if (!dsn) {
    return undefined;
  }

  const trimmed = dsn.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export function isSentryEnabled(): boolean {
  return getSentryDsn() !== undefined;
}

export function getSentryEnvironment(): string {
  return process.env.NODE_ENV ?? "development";
}

export function getTracesSampleRate(): number {
  return getSentryEnvironment() === "production" ? 0.1 : 1;
}

export function getSharedSentryOptions() {
  const dsn = getSentryDsn();
  const environment = getSentryEnvironment();

  return {
    dsn,
    enabled: dsn !== undefined,
    environment,
    tracesSampleRate: getTracesSampleRate(),
  };
}
