import { getAdminFirestore } from "./firebase-admin";

/**
 * RevenueCat webhook payload (subset we care about).
 * Full event is under body.event per RevenueCat docs.
 */
export type RevenueCatSubscriberAttribute = {
  value: string;
  updated_at_ms?: number;
};

export type RevenueCatWebhookEvent = {
  event_timestamp_ms: number;
  product_id: string | null;
  period_type: string | null;
  purchased_at_ms: number | null;
  expiration_at_ms: number | null;
  environment: string | null;
  entitlement_id: string | null;
  entitlement_ids: string[] | null;
  app_user_id: string | null;
  original_app_user_id: string | null;
  aliases: string[] | null;
  subscriber_attributes?: Record<string, RevenueCatSubscriberAttribute>;
  store: string | null;
  type: string;
  id: string;
  app_id: string | null;
  country_code?: string | null;
  currency?: string | null;
  price?: number | null;
  cancel_reason?: string | null;
  expiration_reason?: string | null;
  transaction_id?: string | null;
  original_transaction_id?: string | null;
  renewal_number?: number | null;
  is_trial_conversion?: boolean | null;
  [key: string]: unknown;
};

export type RevenueCatWebhookBody = {
  event: RevenueCatWebhookEvent;
  api_version?: string;
};

/**
 * Extract email, displayName, phone from RevenueCat subscriber_attributes.
 */
function getSubscriberAttrs(
  attrs: RevenueCatWebhookEvent["subscriber_attributes"],
) {
  const get = (key: string): string | null => {
    const o = attrs?.[key];
    if (o && typeof o === "object" && "value" in o)
      return (o as { value: string }).value ?? null;
    return null;
  };
  return {
    email: get("$email") ?? get("email"),
    displayName: get("$displayName") ?? get("displayName"),
    phoneNumber: get("$phoneNumber") ?? get("phoneNumber"),
  };
}

const SUBSCRIPTION_LOG_COLLECTION = "subscriptionLog";
const SUBSCRIPTIONS_COLLECTION = "subscriptions";

/**
 * Append one webhook event to subscriptionLog.
 * Uses event.id as doc ID so RevenueCat retries are idempotent.
 */
export async function appendSubscriptionLog(
  body: RevenueCatWebhookBody,
): Promise<void> {
  const db = getAdminFirestore();
  const event = body.event;
  const docId = event.id;
  const ref = db.collection(SUBSCRIPTION_LOG_COLLECTION).doc(docId);

  await ref.set(
    {
      event,
      api_version: body.api_version ?? null,
      received_at: new Date(),
    },
    { merge: true },
  );
}

/**
 * Update the subscriptions document for the given user from a webhook event.
 * One doc per app_user_id with current subscription state + last event info.
 */
export async function upsertSubscriptionFromEvent(
  body: RevenueCatWebhookBody,
): Promise<void> {
  const db = getAdminFirestore();
  const ev = body.event;
  const appUserId = ev.app_user_id ?? ev.original_app_user_id;
  if (!appUserId) return;

  const attrs = getSubscriberAttrs(ev.subscriber_attributes);

  const subscriptionDoc: Record<string, unknown> = {
    app_user_id: appUserId,
    original_app_user_id: ev.original_app_user_id ?? null,
    aliases: ev.aliases ?? [],
    email: attrs.email,
    display_name: attrs.displayName,
    phone_number: attrs.phoneNumber,
    product_id: ev.product_id ?? null,
    entitlement_ids: ev.entitlement_ids ?? null,
    period_type: ev.period_type ?? null,
    purchased_at_ms: ev.purchased_at_ms ?? null,
    expiration_at_ms: ev.expiration_at_ms ?? null,
    environment: ev.environment ?? null,
    store: ev.store ?? null,
    country_code: ev.country_code ?? null,
    currency: ev.currency ?? null,
    price: ev.price ?? null,
    last_event_type: ev.type,
    last_event_id: ev.id,
    last_event_timestamp_ms: ev.event_timestamp_ms,
    cancel_reason: ev.cancel_reason ?? null,
    expiration_reason: ev.expiration_reason ?? null,
    transaction_id: ev.transaction_id ?? null,
    original_transaction_id: ev.original_transaction_id ?? null,
    app_id: ev.app_id ?? null,
    renewal_number: ev.renewal_number ?? null,
    is_trial_conversion: ev.is_trial_conversion ?? null,
    updated_at: new Date(),
  };

  const ref = db.collection(SUBSCRIPTIONS_COLLECTION).doc(appUserId);
  await ref.set(subscriptionDoc, { merge: true });
}

/** Firestore subscription document shape (for admin list). */
export type SubscriptionRecord = {
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
  updated_at: unknown;
};

/**
 * List all subscription documents for admin. Uses Admin Firestore.
 */
export async function getAllSubscriptions(): Promise<SubscriptionRecord[]> {
  const db = getAdminFirestore();
  const snapshot = await db.collection(SUBSCRIPTIONS_COLLECTION).get();
  return snapshot.docs.map((d) => {
    const data = d.data();
    return {
      app_user_id: d.id,
      original_app_user_id: data.original_app_user_id ?? null,
      email: data.email ?? null,
      display_name: data.display_name ?? null,
      phone_number: data.phone_number ?? null,
      product_id: data.product_id ?? null,
      entitlement_ids: data.entitlement_ids ?? null,
      period_type: data.period_type ?? null,
      purchased_at_ms: data.purchased_at_ms ?? null,
      expiration_at_ms: data.expiration_at_ms ?? null,
      environment: data.environment ?? null,
      store: data.store ?? null,
      last_event_type: data.last_event_type ?? null,
      last_event_id: data.last_event_id ?? null,
      cancel_reason: data.cancel_reason ?? null,
      expiration_reason: data.expiration_reason ?? null,
      renewal_number: data.renewal_number ?? null,
      updated_at: data.updated_at,
    } as SubscriptionRecord;
  });
}

/** Log entry as stored (event + received_at). */
export type SubscriptionLogEntry = {
  event: RevenueCatWebhookEvent;
  received_at: unknown;
};

/**
 * Get all webhook log events for a given app_user_id (full renewal/event history).
 * Ordered by received_at descending (newest first).
 */
export async function getSubscriptionLogByAppUserId(
  appUserId: string,
  limit = 200,
): Promise<SubscriptionLogEntry[]> {
  const db = getAdminFirestore();
  const snapshot = await db
    .collection(SUBSCRIPTION_LOG_COLLECTION)
    .where("event.app_user_id", "==", appUserId)
    .limit(limit)
    .get();

  const entries = snapshot.docs.map((d) => {
    const data = d.data();
    return {
      event: data.event as RevenueCatWebhookEvent,
      received_at: data.received_at,
    } as SubscriptionLogEntry;
  });

  entries.sort((a, b) => {
    const ta = (a.event.event_timestamp_ms ?? 0) as number;
    const tb = (b.event.event_timestamp_ms ?? 0) as number;
    return tb - ta;
  });
  return entries;
}
