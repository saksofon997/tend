import { getSharedSentryOptions } from "@/lib/sentry/options";
import * as Sentry from "@sentry/nextjs";

Sentry.init(getSharedSentryOptions());

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
