export type SentryConfigSource = {
  extraDsn?: string;
  publicDsn?: string;
};

export function resolveSentryDsn(source: SentryConfigSource = {}): string | undefined {
  const candidates = [source.extraDsn, source.publicDsn];

  for (const candidate of candidates) {
    if (typeof candidate !== "string") {
      continue;
    }

    const trimmed = candidate.trim();
    if (trimmed.length > 0) {
      return trimmed;
    }
  }

  return undefined;
}

export function getTracesSampleRate(isDev: boolean): number {
  return isDev ? 1 : 0.1;
}

export function getSentryEnvironment(isDev: boolean): "development" | "production" {
  return isDev ? "development" : "production";
}
