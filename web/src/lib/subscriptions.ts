export interface RevenueCatDailyStat {
  date: string;
  mrr: number;
  revenue: number;
}

export async function getRevenueCatHistory(
  idToken: string,
  days = 30,
): Promise<RevenueCatDailyStat[]> {
  const res = await fetch(`/api/subscriptions?days=${days}`, {
    headers: { Authorization: `Bearer ${idToken}` },
  });

  if (!res.ok) {
    throw new Error(`Failed to load subscription stats (${res.status})`);
  }

  const data = await res.json();
  return Array.isArray(data.history) ? data.history : [];
}
