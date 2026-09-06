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
