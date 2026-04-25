import type { SubscriptionRow } from "../database/utils";

export function getSubscriptionStatus(row: SubscriptionRow): string {
  const now = Date.now();
  const exp = row.expiration_at_ms ?? 0;
  const type = row.last_event_type ?? "";

  if (type === "BILLING_ISSUE") return "Billing Issue";
  if (type === "EXPIRATION" || (exp > 0 && exp < now)) return "Cancelled";
  if (type === "CANCELLATION" && exp > now) return "Cancelling (active)";

  const activeTypes = [
    "INITIAL_PURCHASE",
    "RENEWAL",
    "NON_RENEWING_PURCHASE",
    "PRODUCT_CHANGE",
    "SUBSCRIPTION_EXTENDED",
    "UNCANCELLATION",
    "TEMPORARY_ENTITLEMENT_GRANT",
    "TEST",
  ];
  if (activeTypes.includes(type) || exp > now) return "Active";

  return "Other";
}

export function getPurchaseTypeDisplay(eventType: string | null): string {
  if (!eventType) return "—";
  if (eventType === "INITIAL_PURCHASE") return "New";
  if (eventType === "RENEWAL") return "Renewal";
  return "—";
}

export function getSubscriptionDisplayTag(productId: string | null): string {
  if (!productId) return "—";
  const id = productId.toLowerCase();
  if (id.includes("photo_booth_yearly")) return "Photo Booth Yearly";
  if (id.includes("photo_booth_monthly")) return "Photo Booth Monthly";
  if (id.includes("premium_yearly")) return "Premium Yearly";
  if (id.includes("premium_monthly")) return "Premium Monthly";
  return productId;
}

export function formatEnvironment(env: string | null): string {
  if (!env) return "—";
  if (env === "SANDBOX") return "Sandbox";
  if (env === "PRODUCTION") return "Production";
  return env;
}

export function formatTime(ms: number | null): string {
  if (ms == null || ms <= 0) return "—";
  try {
    return new Date(ms).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return "—";
  }
}
