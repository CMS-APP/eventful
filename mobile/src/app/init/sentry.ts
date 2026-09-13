import * as Sentry from "@sentry/react-native";

import * as Application from "expo-application";
import * as Updates from "expo-updates";

const NETWORK_ERROR_PATTERNS = [
  /network-request-failed/i,
  /firestore\/unavailable/i,
  /network request failed/i,
  /error performing request\./i
];

function isNetworkError(event: Sentry.ErrorEvent): boolean {
  const strings = [event.message];

  for (const exceptionValue of event.exception?.values ?? []) {
    strings.push(exceptionValue.value, exceptionValue.type);
  }

  return strings
    .filter((value): value is string => !!value)
    .some((value) =>
      NETWORK_ERROR_PATTERNS.some((pattern) => pattern.test(value))
    );
}

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
    enableLogs: __DEV__,
    beforeSend(event) {
      return isNetworkError(event) ? null : event;
    }
  });
}
