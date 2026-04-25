import {
  appendSubscriptionLog,
  upsertSubscriptionFromEvent,
  type RevenueCatWebhookBody,
} from "@/lib/subscriptions";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  if (req.method !== "POST") {
    return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
  }

  let body: RevenueCatWebhookBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const event = body?.event;
  if (!event?.id) {
    return NextResponse.json(
      { error: "Missing event or event.id" },
      { status: 400 },
    );
  }

  try {
    await appendSubscriptionLog(body);
    await upsertSubscriptionFromEvent(body);
  } catch (err) {
    console.error("RevenueCat webhook error:", err);
    return NextResponse.json(
      { error: "Failed to process webhook" },
      { status: 500 },
    );
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
