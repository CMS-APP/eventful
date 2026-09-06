export interface FunnelStep {
  id: string;
  label: string;
  users: number;
}

export async function getFunnelStats(
  idToken: string,
  days = 30
): Promise<FunnelStep[]> {
  const res = await fetch(`/api/analytics/funnel?days=${days}`, {
    headers: { Authorization: `Bearer ${idToken}` }
  });

  if (!res.ok) {
    throw new Error(`Failed to load funnel stats (${res.status})`);
  }

  const data = await res.json();
  return Array.isArray(data.steps) ? data.steps : [];
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
  const res = await fetch(`/api/analytics/feature-usage?days=${days}`, {
    headers: { Authorization: `Bearer ${idToken}` }
  });

  if (!res.ok) {
    throw new Error(`Failed to load feature usage stats (${res.status})`);
  }

  const data = await res.json();
  return Array.isArray(data.domains) ? data.domains : [];
}
