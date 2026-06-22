import { afterEach, describe, expect, it } from "bun:test";
import {
  getSentryDsn,
  getSentryEnvironment,
  getSharedSentryOptions,
  getTracesSampleRate,
  isSentryEnabled,
} from "@/lib/sentry/options";

const originalSentryDsn = process.env.SENTRY_DSN;
const originalPublicSentryDsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
const originalNodeEnv = process.env.NODE_ENV;

afterEach(() => {
  process.env.SENTRY_DSN = originalSentryDsn;
  process.env.NEXT_PUBLIC_SENTRY_DSN = originalPublicSentryDsn;
  process.env.NODE_ENV = originalNodeEnv;
});

describe("sentry options", () => {
  it("returns undefined when no DSN is configured", () => {
    process.env.SENTRY_DSN = undefined;
    process.env.NEXT_PUBLIC_SENTRY_DSN = undefined;

    expect(getSentryDsn()).toBeUndefined();
    expect(isSentryEnabled()).toBe(false);
  });

  it("prefers SENTRY_DSN over NEXT_PUBLIC_SENTRY_DSN", () => {
    process.env.SENTRY_DSN = " https://server@o1.ingest.sentry.io/1 ";
    process.env.NEXT_PUBLIC_SENTRY_DSN = "https://client@o1.ingest.sentry.io/2";

    expect(getSentryDsn()).toBe("https://server@o1.ingest.sentry.io/1");
    expect(isSentryEnabled()).toBe(true);
  });

  it("falls back to NEXT_PUBLIC_SENTRY_DSN", () => {
    process.env.SENTRY_DSN = undefined;
    process.env.NEXT_PUBLIC_SENTRY_DSN = "https://client@o1.ingest.sentry.io/2";

    expect(getSentryDsn()).toBe("https://client@o1.ingest.sentry.io/2");
  });

  it("builds shared options with lower production trace sampling", () => {
    process.env.SENTRY_DSN = "https://server@o1.ingest.sentry.io/1";
    process.env.NODE_ENV = "production";

    expect(getSentryEnvironment()).toBe("production");
    expect(getTracesSampleRate()).toBe(0.1);
    expect(getSharedSentryOptions()).toEqual({
      dsn: "https://server@o1.ingest.sentry.io/1",
      enabled: true,
      environment: "production",
      tracesSampleRate: 0.1,
    });
  });
});
