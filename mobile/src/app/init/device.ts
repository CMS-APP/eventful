import * as RNLocalize from "react-native-localize";

import { Platform } from "react-native";

import * as Application from "expo-application";
import * as Device from "expo-device";

import type { UserUpdateData } from "@/services/firebase/user";
import { log } from "@/utils/logging";

import { getCurrentVersion } from "./version";

export function getDeviceInfo(): UserUpdateData {
  const payload: UserUpdateData = {};

  try {
    payload.appVersion = getCurrentVersion();
    payload.platform = Platform.OS;
    payload.appBuildVersion = String(Application.nativeBuildVersion);
    payload.osVersion = String(Device.osVersion);
    payload.deviceModel = Device.modelName || "";
    payload.deviceType = String(Device.deviceType);
    payload.isPhysicalDevice = Device.isDevice;
    const locales = RNLocalize.getLocales();
    const first = locales?.[0];
    if (first?.countryCode) {
      payload.region = first.countryCode;
    }
    if (first?.languageTag) {
      payload.locale = first.languageTag;
    }
  } catch (error) {
    log(error as string, "error");
    return {};
  }

  return payload;
}
