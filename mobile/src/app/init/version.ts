import { Platform } from "react-native";

import * as Application from "expo-application";

import {
  API_COLLECTIONS,
  API_STATS_COLLECTIONS
} from "@/services/api/constants";
import { getDocument } from "@/services/api/get";

const APP_STORE_URL = "https://apps.apple.com/app/id6449842590";
const PLAY_STORE_URL =
  "https://play.google.com/store/apps/details?id=com.hostinghappily.app";

export function getCurrentVersion(): string {
  return Application.nativeApplicationVersion || "1.0.0";
}

export function getStoreUrl(): string {
  return Platform.OS === "ios" ? APP_STORE_URL : PLAY_STORE_URL;
}

function compareVersions(version1: string, version2: string): number {
  const v1Parts = version1.split(".").map(Number);
  const v2Parts = version2.split(".").map(Number);

  for (let i = 0; i < Math.max(v1Parts.length, v2Parts.length); i++) {
    const v1Part = v1Parts[i] || 0;
    const v2Part = v2Parts[i] || 0;

    if (v1Part > v2Part) return 1;
    if (v1Part < v2Part) return -1;
  }

  return 0;
}

async function fetchMinimumVersionFromFirestore(): Promise<string | null> {
  const versionDoc = await getDocument(
    API_COLLECTIONS.STATS,
    API_STATS_COLLECTIONS.APP_VERSIONS
  );
  return versionDoc?.[Platform.OS];
}

export async function checkIfUpdateRequired(): Promise<boolean> {
  const currentVersion = getCurrentVersion();

  let minimumVersion = await fetchMinimumVersionFromFirestore();
  if (!minimumVersion || __DEV__) {
    return false;
  }

  return compareVersions(currentVersion, minimumVersion) < 0;
}
