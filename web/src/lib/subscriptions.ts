export interface RevenueCatDailyStat {
  date: string;
  mrr: number;
  revenue: number;
}

export interface RevenueCatStats {
  history: RevenueCatDailyStat[];
  activeSubscriptions: number | null;
}

export async function getRevenueCatStats(
  idToken: string,
  days = 30,
): Promise<RevenueCatStats> {
  const res = await fetch(`/api/subscriptions?days=${days}`, {
    headers: { Authorization: `Bearer ${idToken}` },
  });

  if (!res.ok) {
    throw new Error(`Failed to load subscription stats (${res.status})`);
  }

  const data = await res.json();
  return {
    history: Array.isArray(data.history) ? data.history : [],
    activeSubscriptions:
      typeof data.activeSubscriptions === "number"
        ? data.activeSubscriptions
        : null,
  };
}
