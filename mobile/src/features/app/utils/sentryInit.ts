import * as Sentry from "@sentry/react-native";

import * as Application from "expo-application";
import * as Updates from "expo-updates";

import { config } from "@/config/sentryConfig";

export function initializeSentry(): void {
  const version = Application.nativeApplicationVersion || "1.0.0";
  const buildNumber = Application.nativeBuildVersion || "1";

  const release = `com.hostinghappily.app@${version}+${buildNumber}`;
  const dist = buildNumber;
  const environment =
    Updates.channel || (__DEV__ ? "development" : "production");

  Sentry.init({
    dsn: config.dsn,
    release,
    dist,
    environment,
    replaysSessionSampleRate: __DEV__ ? 1 : 0.1,
    replaysOnErrorSampleRate: 1.0,
    tracesSampleRate: 1.0,
    integrations: [
      Sentry.mobileReplayIntegration({
        maskAllText: false,
        maskAllImages: true,
        maskAllVectors: true
      })
    ],
    ignoreErrors: [/auth\/network-request-failed/],
    enableLogs: __DEV__
  });
}
