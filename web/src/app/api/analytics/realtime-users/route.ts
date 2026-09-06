import { NextRequest, NextResponse } from "next/server";

import { isAdminRequest } from "@/lib/admin-request";
import { getGa4Client } from "@/lib/ga4";

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

  try {
    const [response] = await client.runRealtimeReport({
      property: `properties/${propertyId}`,
      metrics: [{ name: "activeUsers" }]
    });

    const activeUsers = Number(response.rows?.[0]?.metricValues?.[0]?.value ?? 0);

    return NextResponse.json({ activeUsers });
  } catch (error) {
    console.error("GA4 realtime report failed:", error);
    return NextResponse.json(
      { error: "Failed to fetch Firebase Analytics data" },
      { status: 502 }
    );
  }
}
