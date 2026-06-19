const appJson = require("./app.json");

const sentryOrg = process.env.SENTRY_ORG;
const sentryProject = process.env.SENTRY_PROJECT;
const hasSentryBuildConfig = Boolean(sentryOrg && sentryProject && process.env.SENTRY_AUTH_TOKEN);

/** @type {import("@expo/config").ExpoConfig} */
module.exports = {
  expo: {
    ...appJson.expo,
    extra: {
      ...appJson.expo.extra,
      sentryDsn: process.env.EXPO_PUBLIC_SENTRY_DSN ?? "",
    },
    plugins: [
      ...appJson.expo.plugins,
      [
        "@sentry/react-native/expo",
        {
          organization: sentryOrg,
          project: sentryProject,
          ...(hasSentryBuildConfig ? {} : { disableAutoUpload: true }),
        },
      ],
    ],
  },
};
