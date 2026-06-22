const sentryOrg = process.env.SENTRY_ORG;
const sentryProject = process.env.SENTRY_PROJECT;
const hasSentryBuildConfig = Boolean(sentryOrg && sentryProject && process.env.SENTRY_AUTH_TOKEN);

const plugins = [
  [
    "expo-notifications",
    {
      defaultChannel: "tend-reminders",
    },
  ],
  "@react-native-community/datetimepicker",
];

if (hasSentryBuildConfig) {
  plugins.push([
    "@sentry/react-native/expo",
    {
      organization: sentryOrg,
      project: sentryProject,
    },
  ]);
}

/** @type {import("@expo/config").ExpoConfig} */
module.exports = {
  expo: {
    name: "Tend",
    slug: "tend",
    version: "0.1.0",
    orientation: "portrait",
    icon: "./assets/app-icon.png",
    userInterfaceStyle: "light",
    scheme: "tend",
    assetBundlePatterns: ["**/*"],
    android: {
      package: "com.saksofon997.tend",
      googleServicesFile: "./google-services.json",
      adaptiveIcon: {
        foregroundImage: "./assets/app-icon.png",
        backgroundColor: "#f7f5f2",
      },
      edgeToEdgeEnabled: true,
    },
    ios: {
      supportsTablet: true,
    },
    plugins,
    extra: {
      defaultApiBaseUrl: "https://app.tend.qzz.io",
      eas: {
        projectId: "d66401db-0760-4e31-a496-7e990d1691ba",
      },
      sentryDsn: process.env.EXPO_PUBLIC_SENTRY_DSN ?? "",
    },
  },
};
