import { NextRequest, NextResponse } from "next/server";

import { isAdminRequest } from "@/lib/admin-request";
import { getGa4Client } from "@/lib/ga4";

const FUNNEL_STEPS = [
  { id: "downloads", label: "Downloads", event: "first_open" },
  { id: "signup", label: "Signup", event: "auth_sign_up" },
  {
    id: "onboarding_started",
    label: "Onboarding started",
    event: "onboarding_started"
  },
  {
    id: "onboarding_completed",
    label: "Onboarding completed",
    event: "onboarding_completed"
  }
] as const;

export async function GET(request: NextRequest) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const propertyId = process.env.GA4_PROPERTY_ID;
  const client = getGa4Client();
  if (!propertyId || !client) {
    return NextResponse.json(
      { error: "Firebase Analytics is not configured on the server" },
      { status: 500 }
    );
  }

  const { searchParams } = new URL(request.url);
  const days = Number(searchParams.get("days")) || 30;

  try {
    const [response] = await client.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate: `${days}daysAgo`, endDate: "today" }],
      dimensions: [{ name: "eventName" }],
      metrics: [{ name: "activeUsers" }],
      dimensionFilter: {
        filter: {
          fieldName: "eventName",
          inListFilter: { values: FUNNEL_STEPS.map((step) => step.event) }
        }
      }
    });

    const usersByEvent = new Map<string, number>();
    for (const row of response.rows ?? []) {
      const eventName = row.dimensionValues?.[0]?.value;
      const users = Number(row.metricValues?.[0]?.value ?? 0);
      if (eventName) usersByEvent.set(eventName, users);
    }

    const steps = FUNNEL_STEPS.map((step) => ({
      id: step.id,
      label: step.label,
      users: usersByEvent.get(step.event) ?? 0
    }));

    return NextResponse.json({ steps });
  } catch (error) {
    console.error("GA4 funnel report failed:", error);
    return NextResponse.json(
      { error: "Failed to fetch Firebase Analytics data" },
      { status: 502 }
    );
  }
}
