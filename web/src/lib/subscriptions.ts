import { HOUR_MS, readLocalCache, writeLocalCache } from "@/lib/localCache";

export interface RevenueCatDailyStat {
  date: string;
  mrr: number;
  revenue: number;
}

export interface RevenueCatStats {
  history: RevenueCatDailyStat[];
  activeSubscriptions: number | null;
  mrrChangePercent: number | null;
  activeSubscriptionsChangePercent: number | null;
}

export async function getRevenueCatStats(
  idToken: string,
  days = 30,
): Promise<RevenueCatStats> {
  const cacheKey = `subscriptions:revenueCatStats:${days}`;
  const cached = readLocalCache<RevenueCatStats>(cacheKey, HOUR_MS);
  if (cached) return cached;

  const res = await fetch(`/api/subscriptions?days=${days}`, {
    headers: { Authorization: `Bearer ${idToken}` },
  });

  if (!res.ok) {
    throw new Error(`Failed to load subscription stats (${res.status})`);
  }

  const data = await res.json();
  const result = {
    history: Array.isArray(data.history) ? data.history : [],
    activeSubscriptions:
      typeof data.activeSubscriptions === "number"
        ? data.activeSubscriptions
        : null,
    mrrChangePercent:
      typeof data.mrrChangePercent === "number" ? data.mrrChangePercent : null,
    activeSubscriptionsChangePercent:
      typeof data.activeSubscriptionsChangePercent === "number"
        ? data.activeSubscriptionsChangePercent
        : null,
  };
  writeLocalCache(cacheKey, result);
  return result;
}
