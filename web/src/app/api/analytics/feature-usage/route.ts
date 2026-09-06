import { NextRequest, NextResponse } from "next/server";

import { isAdminRequest } from "@/lib/admin-request";
import { getGa4Client } from "@/lib/ga4";

const FEATURE_DOMAINS = [
  {
    id: "auth",
    label: "Auth",
    events: ["auth_sign_in", "auth_sign_out", "auth_account_deleted"]
  },
  {
    id: "events",
    label: "Events",
    events: [
      "event_created",
      "event_updated",
      "event_list_item_added",
      "event_budget_item_added",
      "event_location_searched",
      "event_location_selected",
      "event_timeline_item_toggled",
      "event_amazon_link_opened"
    ]
  },
  {
    id: "invites",
    label: "Invites & Guests",
    events: ["invite_sent", "invite_response_changed", "invite_link_copied"]
  },
  {
    id: "contacts",
    label: "Contacts",
    events: ["contacts_search_performed", "user_followed"]
  },
  {
    id: "photo_booth",
    label: "Photo Booth",
    events: [
      "photo_booth_session_started",
      "photo_booth_photo_shared",
      "photo_booth_photo_saved",
      "photo_booth_photos_uploaded",
      "photo_booth_locked",
      "photo_booth_customised"
    ]
  },
  {
    id: "inspiration",
    label: "Inspiration",
    events: ["post_liked", "poll_voted"]
  },
  {
    id: "settings_account",
    label: "Settings & Account",
    events: [
      "settings_name_changed",
      "settings_notifications_toggled",
      "account_picture_updated"
    ]
  },
  {
    id: "spotify",
    label: "Spotify",
    events: ["spotify_connected", "spotify_playlist_added"]
  },
  {
    id: "subscriptions",
    label: "Subscriptions",
    events: ["subscription_purchased", "subscription_restored"]
  }
] as const;

function humanizeEventName(event: string): string {
  const words = event.split("_").filter(Boolean);
  if (words.length === 0) return event;

  return words
    .map((word, index) => (index === 0 ? word[0].toUpperCase() + word.slice(1) : word))
    .join(" ");
}

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
    const domains = await Promise.all(
      FEATURE_DOMAINS.map(async (domain) => {
        const [response] = await client.runReport({
          property: `properties/${propertyId}`,
          dateRanges: [{ startDate: `${days}daysAgo`, endDate: "today" }],
          dimensions: [{ name: "eventName" }],
          metrics: [{ name: "eventCount" }, { name: "totalUsers" }],
          dimensionFilter: {
            filter: {
              fieldName: "eventName",
              inListFilter: { values: [...domain.events] }
            }
          },
          orderBys: [{ metric: { metricName: "eventCount" }, desc: true }]
        });

        const statsByEvent = new Map<string, { count: number; users: number }>();
        for (const row of response.rows ?? []) {
          const event = row.dimensionValues?.[0]?.value;
          const count = Number(row.metricValues?.[0]?.value ?? 0);
          const users = Number(row.metricValues?.[1]?.value ?? 0);
          if (event) statsByEvent.set(event, { count, users });
        }

        const features = domain.events
          .map((event) => ({
            event,
            label: humanizeEventName(event),
            count: statsByEvent.get(event)?.count ?? 0,
            users: statsByEvent.get(event)?.users ?? 0
          }))
          .sort((a, b) => b.count - a.count);

        return { id: domain.id, label: domain.label, features };
      })
    );

    return NextResponse.json({ domains });
  } catch (error) {
    console.error("GA4 feature usage report failed:", error);
    return NextResponse.json(
      { error: "Failed to fetch Firebase Analytics data" },
      { status: 502 }
    );
  }
}
