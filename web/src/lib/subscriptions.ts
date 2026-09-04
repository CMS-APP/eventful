import { FIRESTORE_DB } from "@/app/Firebase";
import {
  Timestamp,
  Unsubscribe,
  collection,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";

/** Live RevenueCat counters, updated in near-real-time by the revenuecatWebhook function. */
export interface RevenueCatLiveStats {
  activeSubscriptions: number;
  totalRevenue: number;
  lastEventType: string | null;
  lastEventAt: string | null;
}

export function subscribeToRevenueCatLiveStats(
  callback: (stats: RevenueCatLiveStats) => void,
): Unsubscribe {
  const ref = doc(FIRESTORE_DB, "revenuecatLiveStats", "current");
  return onSnapshot(ref, (snapshot) => {
    const data = snapshot.data();
    const lastEventAt = data?.lastEventAt as Timestamp | undefined;
    callback({
      activeSubscriptions:
        typeof data?.activeSubscriptions === "number"
          ? data.activeSubscriptions
          : 0,
      totalRevenue:
        typeof data?.totalRevenue === "number" ? data.totalRevenue : 0,
      lastEventType:
        typeof data?.lastEventType === "string" ? data.lastEventType : null,
      lastEventAt: lastEventAt?.toDate?.()?.toISOString?.() ?? null,
    });
  });
}

/** One day's RevenueCat activity, written by the revenuecatWebhook function as events arrive. */
export interface RevenueCatDailyStat {
  date: string;
  revenue: number;
  newSubscriptions: number;
  renewals: number;
  cancellations: number;
  expirations: number;
}

export function subscribeToRevenueCatDailyHistory(
  callback: (history: RevenueCatDailyStat[]) => void,
  maxDays = 90,
): Unsubscribe {
  const ref = collection(FIRESTORE_DB, "revenuecatDailyStats");
  const q = query(ref, orderBy("date", "desc"), limit(maxDays));
  return onSnapshot(q, (snapshot) => {
    const history = snapshot.docs
      .map((d) => {
        const data = d.data();
        return {
          date: typeof data.date === "string" ? data.date : d.id,
          revenue: typeof data.revenue === "number" ? data.revenue : 0,
          newSubscriptions:
            typeof data.newSubscriptions === "number"
              ? data.newSubscriptions
              : 0,
          renewals: typeof data.renewals === "number" ? data.renewals : 0,
          cancellations:
            typeof data.cancellations === "number" ? data.cancellations : 0,
          expirations:
            typeof data.expirations === "number" ? data.expirations : 0,
        };
      })
      .sort((a, b) => a.date.localeCompare(b.date));
    callback(history);
  });
}
