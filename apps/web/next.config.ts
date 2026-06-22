import path from "node:path";
import { isSentryEnabled } from "@/lib/sentry/options";
import { withSentryConfig } from "@sentry/nextjs";
import { config } from "dotenv";
import type { NextConfig } from "next";

config({ path: path.resolve(__dirname, "../../.env") });

const nextConfig: NextConfig = {
  transpilePackages: ["@tend/db", "@tend/domain"],
};

const sentryWebpackPluginOptions = {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: !process.env.CI,
  widenClientFileUpload: true,
  tunnelRoute: "/monitoring",
  webpack: {
    treeshake: {
      removeDebugLogging: true,
    },
  },
};

export default isSentryEnabled()
  ? withSentryConfig(nextConfig, sentryWebpackPluginOptions)
  : nextConfig;
