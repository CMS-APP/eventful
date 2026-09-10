import {
  setUserId as firebaseSetUserId,
  getAnalytics,
  logEvent,
  setAnalyticsCollectionEnabled,
  setDefaultEventParameters
} from "@react-native-firebase/analytics";

import { Platform } from "react-native";

import Constants from "expo-constants";

import { isDuplicate } from "@/services/analytics/dedupe";
import { log } from "@/utils/logging";

let userId: string | null = null;
let ready = false;

function appVersion(): string {
  return Constants.expoConfig?.version ?? "unknown";
}

function commonParams(): Record<string, string | number> {
  return {
    user_id: userId ?? "anonymous",
    app_version: appVersion(),
    platform: Platform.OS,
    timestamp: Date.now()
  };
}

export async function initAnalytics(): Promise<void> {
  if (ready) return;
  ready = true;

  const analytics = getAnalytics();
  await setAnalyticsCollectionEnabled(analytics, !__DEV__);
  if (__DEV__) return;

  await setDefaultEventParameters(analytics, {
    app_version: appVersion(),
    platform: Platform.OS
  });
}

export function setAnalyticsUserId(id: string | null): void {
  userId = id;
  if (__DEV__) return;
  firebaseSetUserId(getAnalytics(), id);
}

export function track(
  name: string,
  params?: Record<string, string | number | boolean>,
  dedupeKey?: string
): void {
  if (__DEV__) return;
  if (dedupeKey && isDuplicate(`${name}:${dedupeKey}`)) return;

  log(`Tracking event: ${name}`, "debug");
  logEvent(getAnalytics(), name, {
    ...commonParams(),
    ...params
  });
}

export function trackScreen(screenName: string | undefined): void {
  if (__DEV__ || !screenName) return;

  log(`Tracking screen view: ${screenName}`, "debug");
  logEvent(getAnalytics(), "screen_view", {
    ...commonParams(),
    screen_name: screenName,
    screen_class: screenName
  });
}
