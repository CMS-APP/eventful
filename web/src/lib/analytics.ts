import { HOUR_MS, readLocalCache, writeLocalCache } from "@/lib/localCache";

export interface FunnelStep {
  id: string;
  label: string;
  users: number;
}

export async function getFunnelStats(
  idToken: string,
  days = 30,
  funnel: "onboarding" | "paywall" = "onboarding"
): Promise<FunnelStep[]> {
  const cacheKey = `analytics:funnel:${funnel}:${days}`;
  const cached = readLocalCache<FunnelStep[]>(cacheKey, HOUR_MS);
  if (cached) return cached;

  const res = await fetch(`/api/analytics/funnel?days=${days}&funnel=${funnel}`, {
    headers: { Authorization: `Bearer ${idToken}` }
  });

  if (!res.ok) {
    throw new Error(`Failed to load funnel stats (${res.status})`);
  }

  const data = await res.json();
  const result = Array.isArray(data.steps) ? data.steps : [];
  writeLocalCache(cacheKey, result);
  return result;
}

export async function getRealtimeActiveUsers(idToken: string): Promise<number> {
  const res = await fetch("/api/analytics/realtime-users", {
    headers: { Authorization: `Bearer ${idToken}` }
  });

  if (!res.ok) {
    throw new Error(`Failed to load realtime users (${res.status})`);
  }

  const data = await res.json();
  return typeof data.activeUsers === "number" ? data.activeUsers : 0;
}

export interface FeatureUsageStat {
  event: string;
  label: string;
  count: number;
  users: number;
}

export interface FeatureUsageDomain {
  id: string;
  label: string;
  features: FeatureUsageStat[];
}

export async function getFeatureUsageStats(
  idToken: string,
  days = 30
): Promise<FeatureUsageDomain[]> {
  const cacheKey = `analytics:featureUsage:${days}`;
  const cached = readLocalCache<FeatureUsageDomain[]>(cacheKey, HOUR_MS);
  if (cached) return cached;

  const res = await fetch(`/api/analytics/feature-usage?days=${days}`, {
    headers: { Authorization: `Bearer ${idToken}` }
  });

  if (!res.ok) {
    throw new Error(`Failed to load feature usage stats (${res.status})`);
  }

  const data = await res.json();
  const result = Array.isArray(data.domains) ? data.domains : [];
  writeLocalCache(cacheKey, result);
  return result;
}
