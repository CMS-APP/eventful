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
