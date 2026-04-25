import { FIRESTORE_DB } from "@/app/Firebase";
import {
  collection,
  deleteDoc,
  doc,
  getCountFromServer,
  getDoc,
  getDocs,
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

export async function getUsersForDeviceStats(): Promise<UserDeviceStatsRow[]> {
  try {
    const usersRef = collection(FIRESTORE_DB, "user");
    const snapshot = await getDocs(usersRef);
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

/** Subscription row for admin subscribers table (from Firestore). */
export interface SubscriptionRow {
  app_user_id: string;
  original_app_user_id: string | null;
  email: string | null;
  display_name: string | null;
  phone_number: string | null;
  product_id: string | null;
  entitlement_ids: string[] | null;
  period_type: string | null;
  purchased_at_ms: number | null;
  expiration_at_ms: number | null;
  environment: string | null;
  store: string | null;
  last_event_type: string | null;
  last_event_id: string | null;
  cancel_reason: string | null;
  expiration_reason: string | null;
  renewal_number: number | null;
  transaction_id: string | null;
  original_transaction_id: string | null;
  updated_at: unknown;
}

function mapDocToSubscriptionRow(
  docId: string,
  data: Record<string, unknown>,
): SubscriptionRow {
  return {
    app_user_id: docId,
    original_app_user_id: (data.original_app_user_id as string | null) ?? null,
    email: (data.email as string | null) ?? null,
    display_name: (data.display_name as string | null) ?? null,
    phone_number: (data.phone_number as string | null) ?? null,
    product_id: (data.product_id as string | null) ?? null,
    entitlement_ids: (data.entitlement_ids as string[] | null) ?? null,
    period_type: (data.period_type as string | null) ?? null,
    purchased_at_ms: (data.purchased_at_ms as number | null) ?? null,
    expiration_at_ms: (data.expiration_at_ms as number | null) ?? null,
    environment: (data.environment as string | null) ?? null,
    store: (data.store as string | null) ?? null,
    last_event_type: (data.last_event_type as string | null) ?? null,
    last_event_id: (data.last_event_id as string | null) ?? null,
    cancel_reason: (data.cancel_reason as string | null) ?? null,
    expiration_reason: (data.expiration_reason as string | null) ?? null,
    renewal_number: (data.renewal_number as number | null) ?? null,
    transaction_id: (data.transaction_id as string | null) ?? null,
    original_transaction_id:
      (data.original_transaction_id as string | null) ?? null,
    updated_at: data.updated_at,
  } as SubscriptionRow;
}

export async function getSubscriptionByAppUserId(
  appUserId: string,
): Promise<SubscriptionRow | null> {
  try {
    const ref = doc(FIRESTORE_DB, "subscriptions", appUserId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    return mapDocToSubscriptionRow(snap.id, snap.data());
  } catch (error) {
    console.error("Error fetching subscription:", error);
    throw error;
  }
}

export async function getSubscriptions(): Promise<SubscriptionRow[]> {
  try {
    const ref = collection(FIRESTORE_DB, "subscriptions");
    const snapshot = await getDocs(ref);
    return snapshot.docs.map((d) => mapDocToSubscriptionRow(d.id, d.data()));
  } catch (error) {
    console.error("Error fetching subscriptions:", error);
    throw error;
  }
}

/** One subscription log event (from subscriptionLog collection). */
export interface SubscriptionLogEventItem {
  type: string;
  product_id: string | null;
  purchased_at_ms: number | null;
  expiration_at_ms: number | null;
  store: string | null;
  period_type: string | null;
  cancel_reason: string | null;
  expiration_reason: string | null;
  renewal_number: number | null;
  event_timestamp_ms: number;
  /** Price in USD (from RevenueCat webhook). Can be negative for refunds. */
  price: number | null;
  currency: string | null;
}

const SUBSCRIPTION_LOG_COLLECTION = "subscriptionLog";

/**
 * Get subscription log events for a user (client Firestore). Used on subscriber detail page.
 */
export async function getSubscriptionLogByAppUserId(
  appUserId: string,
  limit = 200,
): Promise<SubscriptionLogEventItem[]> {
  const ref = collection(FIRESTORE_DB, SUBSCRIPTION_LOG_COLLECTION);
  const q = query(ref, where("event.app_user_id", "==", appUserId));
  const snapshot = await getDocs(q);
  const entries = snapshot.docs.map((d) => {
    const data = d.data();
    const event = (data?.event ?? {}) as Record<string, unknown>;
    return {
      type: (event.type as string) ?? "",
      product_id: (event.product_id as string | null) ?? null,
      purchased_at_ms: (event.purchased_at_ms as number | null) ?? null,
      expiration_at_ms: (event.expiration_at_ms as number | null) ?? null,
      store: (event.store as string | null) ?? null,
      period_type: (event.period_type as string | null) ?? null,
      cancel_reason: (event.cancel_reason as string | null) ?? null,
      expiration_reason: (event.expiration_reason as string | null) ?? null,
      renewal_number: (event.renewal_number as number | null) ?? null,
      event_timestamp_ms: (event.event_timestamp_ms as number) ?? 0,
      price: (event.price as number | null) ?? null,
      currency: (event.currency as string | null) ?? null,
    } as SubscriptionLogEventItem;
  });
  entries.sort(
    (a, b) => (b.event_timestamp_ms ?? 0) - (a.event_timestamp_ms ?? 0),
  );
  return entries.slice(0, limit);
}
