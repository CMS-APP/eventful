import * as Sentry from "@sentry/react-native";

import * as Application from "expo-application";
import * as Updates from "expo-updates";

export function sentryInit(): void {
  const version = Application.nativeApplicationVersion || "1.0.0";
  const buildNumber = Application.nativeBuildVersion || "1";

  const release = `com.hostinghappily.app@${version}+${buildNumber}`;
  const dist = buildNumber;
  const environment =
    Updates.channel || (__DEV__ ? "development" : "production");

  Sentry.init({
    dsn: "https://6b665485a4d2a4ecb4b6175302c57721@o4508836940873728.ingest.de.sentry.io/4508836942839888",
    release,
    dist,
    environment,
    tracesSampleRate: 1.0,
    enableLogs: __DEV__
  });
}
