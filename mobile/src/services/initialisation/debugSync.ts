import { Timestamp } from "@react-native-firebase/firestore";
import * as RNLocalize from "react-native-localize";

import { Platform } from "react-native";

import * as Application from "expo-application";
import * as Device from "expo-device";

import type { UserUpdateData } from "@/services/firebase/firebaseUserFunctions";

import { getCurrentVersion } from "./versionCheck";

/**
 * Collects device and app info useful for debugging and support.
 * Each source is wrapped in try/catch so one failure doesn't block the rest.
 * Used on app launch to sync to the user document for admin querying.
 */
export function getDebugSyncPayload(): UserUpdateData {
  const payload: UserUpdateData = {};

  try {
    payload.appVersion = getCurrentVersion();
  } catch {
    // ignore
  }

  try {
    payload.platform = Platform.OS;
  } catch {
    // ignore
  }

  try {
    const build = Application.nativeBuildVersion;
    if (build != null && build !== "") {
      payload.appBuildVersion = String(build);
    }
  } catch {
    // ignore
  }

  try {
    if (Device?.osVersion != null && Device.osVersion !== "") {
      payload.osVersion = String(Device.osVersion);
    }
  } catch {
    // ignore
  }

  try {
    if (Device?.modelName != null && Device.modelName !== "") {
      payload.deviceModel = Device.modelName;
    }
  } catch {
    // ignore
  }

  try {
    if (Device?.deviceType != null) {
      payload.deviceType = String(Device.deviceType);
    }
  } catch {
    // ignore
  }

  try {
    payload.lastLaunchedAt = Timestamp.now();
  } catch {
    // ignore
  }

  try {
    if (Device?.isDevice != null) {
      payload.isPhysicalDevice = Device.isDevice;
    }
  } catch {
    // ignore
  }

  try {
    const locales = RNLocalize.getLocales();
    const first = locales?.[0];
    if (first?.countryCode) {
      payload.region = first.countryCode;
    }
    if (first?.languageTag) {
      payload.locale = first.languageTag;
    }
  } catch {
    // ignore
  }

  return payload;
}
