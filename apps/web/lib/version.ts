import versions from "../../../version.json";

/** Semantic version of the Tend web client. Bump in version.json and package.json together. */
export const APP_VERSION = versions.app;

/** Semantic version of the /api/v1 HTTP surface. Bump when request or response contracts change. */
export const API_VERSION = versions.api;
