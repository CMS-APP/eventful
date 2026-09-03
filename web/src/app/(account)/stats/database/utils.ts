import { FIRESTORE_DB } from "@/app/Firebase";
import {
  collection,
  deleteDoc,
  doc,
  getCountFromServer,
  getDocs,
  limit,
  orderBy,
  query,
  Timestamp,
  where,
} from "firebase/firestore";

export interface FeedbackItem {
  id: string;
  message: string;
  email: string;
  type: string;
  username: string;
  timestamp: string;
}

export async function getAllFeedback(): Promise<FeedbackItem[]> {
  try {
    const feedbackRef = collection(FIRESTORE_DB, "feedback");
    const q = query(feedbackRef, orderBy("timestamp", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => {
      const data = doc.data();
      const timestamp = data.timestamp as Timestamp | undefined;
      return {
        id: doc.id,
        message: data.message ?? "",
        email: data.email ?? "",
        type: data.type ?? "general",
        username: data.username ?? "Anonymous",
        timestamp:
          timestamp?.toDate?.()?.toISOString?.() ?? new Date().toISOString(),
      };
    });
  } catch (error) {
    console.error("Error fetching feedback:", error);
    return [];
  }
}

export async function deleteFeedback(feedbackId: string): Promise<void> {
  const feedbackDoc = doc(FIRESTORE_DB, "feedback", feedbackId);
  await deleteDoc(feedbackDoc);
}

/** Minimal user fields used for device/platform/locale stats (from app user store). */
export interface UserDeviceStatsRow {
  uid: string;
  platform: string;
  appVersion: string;
  appBuildVersion: string;
  databaseUpdate: string;
  deviceModel: string;
  deviceType: string;
  locale: string;
  region: string;
  osVersion: string;
  lastLaunchedAt: string | null;
}

/** Matches the 30-day MAU window used by the snapshotActiveUsers scheduled function. */
const DEVICE_STATS_ACTIVE_WINDOW_DAYS = 30;

export async function getUsersForDeviceStats(): Promise<UserDeviceStatsRow[]> {
  try {
    const usersRef = collection(FIRESTORE_DB, "user");
    const cutoff = Timestamp.fromMillis(
      Date.now() - DEVICE_STATS_ACTIVE_WINDOW_DAYS * 24 * 60 * 60 * 1000,
    );
    const q = query(usersRef, where("lastLaunchedAt", ">=", cutoff));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => {
      const data = d.data();
      const uid = d.id;
      const lastLaunched = data.lastLaunchedAt as Timestamp | undefined;
      return {
        uid,
        platform: typeof data.platform === "string" ? data.platform : "unknown",
        appVersion:
          typeof data.appVersion === "string" ? data.appVersion : "unknown",
        appBuildVersion:
          typeof data.appBuildVersion === "string"
            ? data.appBuildVersion
            : "unknown",
        databaseUpdate:
          typeof data.databaseUpdate === "string"
            ? data.databaseUpdate
            : "unknown",
        deviceModel:
          typeof data.deviceModel === "string" ? data.deviceModel : "unknown",
        deviceType:
          typeof data.deviceType === "string" ? data.deviceType : "unknown",
        locale: typeof data.locale === "string" ? data.locale : "unknown",
        region: typeof data.region === "string" ? data.region : "unknown",
        osVersion:
          typeof data.osVersion === "string" ? data.osVersion : "unknown",
        lastLaunchedAt: lastLaunched?.toDate?.()?.toISOString?.() ?? null,
      };
    });
  } catch (error) {
    console.error("Error fetching users for device stats:", error);
    return [];
  }
}

export async function getTotalUser() {
  try {
    const usersRef = collection(FIRESTORE_DB, "user");
    const snapshot = await getCountFromServer(usersRef);
    return snapshot.data().count;
  } catch (error) {
    console.error("Error getting total user count:", error);
    return 0;
  }
}

export async function getTotalEvent() {
  try {
    const eventsRef = collection(FIRESTORE_DB, "event");
    const snapshot = await getCountFromServer(eventsRef);
    return snapshot.data().count;
  } catch (error) {
    console.error("Error getting total event count:", error);
    return 0;
  }
}

export async function getTotalEventResponses() {
  try {
    const eventResponsesRef = collection(FIRESTORE_DB, "eventResponses");
    const snapshot = await getCountFromServer(eventResponsesRef);
    return snapshot.data().count;
  } catch (error) {
    console.error("Error getting total event response count:", error);
    return 0;
  }
}

export async function getTotalPhotoBoothConfigs() {
  try {
    const photoBoothConfigsRef = collection(FIRESTORE_DB, "photoBoothConfig");
    const snapshot = await getCountFromServer(photoBoothConfigsRef);
    return snapshot.data().count;
  } catch (error) {
    console.error("Error getting total photo booth config count:", error);
    return 0;
  }
}

/** One day's active-user snapshot (from the activeUserStats collection, written daily by the snapshotActiveUsers scheduled function). */
export interface ActiveUserStatsPoint {
  date: string;
  dau: number;
  wau: number;
  mau: number;
}

export async function getActiveUserStatsHistory(
  maxDays = 90,
): Promise<ActiveUserStatsPoint[]> {
  try {
    const ref = collection(FIRESTORE_DB, "activeUserStats");
    const q = query(ref, orderBy("date", "desc"), limit(maxDays));
    const snapshot = await getDocs(q);
    return snapshot.docs
      .map((d) => {
        const data = d.data();
        return {
          date: typeof data.date === "string" ? data.date : d.id,
          dau: typeof data.dau === "number" ? data.dau : 0,
          wau: typeof data.wau === "number" ? data.wau : 0,
          mau: typeof data.mau === "number" ? data.mau : 0,
        };
      })
      .sort((a, b) => a.date.localeCompare(b.date));
  } catch (error) {
    console.error("Error fetching active user stats history:", error);
    return [];
  }
}
