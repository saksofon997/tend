import { describe, expect, it } from "bun:test";
import {
  getSentryEnvironment,
  getTracesSampleRate,
  resolveSentryDsn,
} from "../../src/monitoring/sentryOptions";

describe("sentryOptions", () => {
  it("returns undefined when no DSN is configured", () => {
    expect(resolveSentryDsn()).toBeUndefined();
  });

  it("prefers extra DSN over public env DSN", () => {
    expect(
      resolveSentryDsn({
        extraDsn: " https://extra@o1.ingest.sentry.io/1 ",
        publicDsn: "https://public@o1.ingest.sentry.io/2",
      }),
    ).toBe("https://extra@o1.ingest.sentry.io/1");
  });

  it("falls back to public env DSN", () => {
    expect(
      resolveSentryDsn({
        publicDsn: "https://public@o1.ingest.sentry.io/2",
      }),
    ).toBe("https://public@o1.ingest.sentry.io/2");
  });

  it("uses lower trace sampling in production", () => {
    expect(getTracesSampleRate(true)).toBe(1);
    expect(getTracesSampleRate(false)).toBe(0.1);
    expect(getSentryEnvironment(true)).toBe("development");
    expect(getSentryEnvironment(false)).toBe("production");
  });
});
