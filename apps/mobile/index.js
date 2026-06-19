import * as Sentry from "@sentry/react-native";
import { registerRootComponent } from "expo";

import App from "./App";
import { initSentry } from "./src/monitoring/initSentry";

initSentry();

registerRootComponent(Sentry.wrap(App));
