import { NextRequest, NextResponse } from "next/server";

import { isAdminRequest } from "@/lib/admin-request";

const REVENUECAT_API_BASE = "https://api.revenuecat.com/v2";
const DAY_MS = 24 * 60 * 60 * 1000;

const PRIMARY_MEASURE_INDEX = 0;

interface ChartPoint {
  date: string;
  value: number;
}

function extractPoints(raw: unknown): ChartPoint[] {
  const obj = (raw ?? {}) as Record<string, unknown>;
  const values = Array.isArray(obj.values) ? obj.values : [];

  return values
    .filter(
      (entry): entry is Record<string, unknown> =>
        !!entry &&
        typeof entry === "object" &&
        (entry as Record<string, unknown>).measure === PRIMARY_MEASURE_INDEX
    )
    .map((entry) => {
      const cohort = typeof entry.cohort === "number" ? entry.cohort : 0;
      const value = typeof entry.value === "number" ? entry.value : 0;
      return {
        date: new Date(cohort * 1000).toISOString().slice(0, 10),
        value
      };
    })
    .sort((a, b) => a.date.localeCompare(b.date));
}

function percentChange(previous: number, current: number): number | null {
  if (!previous) return null;
  return ((current - previous) / previous) * 100;
}

async function fetchChart(
  chartName: "mrr" | "revenue" | "actives",
  projectId: string,
  apiKey: string,
  startDate: string,
  endDate: string
): Promise<ChartPoint[]> {
  const url = new URL(
    `${REVENUECAT_API_BASE}/projects/${projectId}/charts/${chartName}`
  );
  url.searchParams.set("start_date", startDate);
  url.searchParams.set("end_date", endDate);
  url.searchParams.set("resolution", "day");
  url.searchParams.set("currency", "GBP");

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${apiKey}` },
    cache: "no-store"
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(
      `RevenueCat ${chartName} chart failed: ${res.status} ${body}`
    );
  }

  return extractPoints(await res.json());
}

async function fetchActiveSubscriptions(
  projectId: string,
  apiKey: string
): Promise<number | null> {
  const url = `${REVENUECAT_API_BASE}/projects/${projectId}/metrics/overview`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${apiKey}` },
    cache: "no-store"
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(
      `RevenueCat overview metrics failed: ${res.status} ${body}`
    );
  }

  const raw = (await res.json()) as Record<string, unknown>;
  const metrics = Array.isArray(raw.metrics) ? raw.metrics : [];
  const activeSubscriptions = metrics.find(
    (metric): metric is Record<string, unknown> =>
      !!metric &&
      typeof metric === "object" &&
      (metric as Record<string, unknown>).id === "active_subscriptions"
  );

  return typeof activeSubscriptions?.value === "number"
    ? activeSubscriptions.value
    : null;
}

export async function GET(request: NextRequest) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.REVENUECAT_SECRET_API_KEY;
  const projectId = process.env.REVENUECAT_PROJECT_ID;
  if (!apiKey || !projectId) {
    return NextResponse.json(
      { error: "RevenueCat is not configured on the server" },
      { status: 500 }
    );
  }

  const { searchParams } = new URL(request.url);
  const days = Number(searchParams.get("days")) || 30;
  const end = new Date();
  const start = new Date(end.getTime() - days * DAY_MS);
  const startDate = start.toISOString().slice(0, 10);
  const endDate = end.toISOString().slice(0, 10);

  try {
    const [mrr, revenue, actives, activeSubscriptions] = await Promise.all([
      fetchChart("mrr", projectId, apiKey, startDate, endDate),
      fetchChart("revenue", projectId, apiKey, startDate, endDate),
      fetchChart("actives", projectId, apiKey, startDate, endDate),
      fetchActiveSubscriptions(projectId, apiKey)
    ]);

    const revenueByDate = new Map(revenue.map((p) => [p.date, p.value]));
    const history = mrr.map((p) => ({
      date: p.date,
      mrr: p.value,
      revenue: revenueByDate.get(p.date) ?? 0
    }));

    const mrrChangePercent =
      mrr.length > 1 ? percentChange(mrr[0].value, mrr[mrr.length - 1].value) : null;
    const activeSubscriptionsChangePercent =
      actives.length > 1
        ? percentChange(actives[0].value, actives[actives.length - 1].value)
        : null;

    return NextResponse.json({
      history,
      activeSubscriptions,
      mrrChangePercent,
      activeSubscriptionsChangePercent
    });
  } catch (error) {
    console.error("RevenueCat charts fetch failed:", error);
    return NextResponse.json(
      { error: "Failed to fetch RevenueCat data" },
      { status: 502 }
    );
  }
}
