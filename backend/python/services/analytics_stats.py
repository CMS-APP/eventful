import json

from firebase_functions import https_fn

from services.admin_auth import require_admin
from services.ga4_client import run_realtime_report, run_report

FEATURE_DOMAINS = [
    {
        "id": "auth",
        "label": "Auth",
        "events": ["auth_sign_in", "auth_sign_out", "auth_account_deleted"],
    },
    {
        "id": "events",
        "label": "Events",
        "events": [
            "event_created",
            "event_updated",
            "event_list_item_added",
            "event_budget_item_added",
            "event_location_searched",
            "event_location_selected",
            "event_timeline_item_toggled",
            "event_amazon_link_opened",
        ],
    },
    {
        "id": "invites",
        "label": "Invites & Guests",
        "events": ["invite_sent", "invite_response_changed", "invite_link_copied"],
    },
    {
        "id": "contacts",
        "label": "Contacts",
        "events": ["contacts_search_performed", "user_followed"],
    },
    {
        "id": "photo_booth",
        "label": "Photo Booth",
        "events": [
            "photo_booth_session_started",
            "photo_booth_photo_shared",
            "photo_booth_photo_saved",
            "photo_booth_photos_uploaded",
            "photo_booth_locked",
            "photo_booth_customised",
        ],
    },
    {
        "id": "inspiration",
        "label": "Inspiration",
        "events": ["post_liked", "poll_voted"],
    },
    {
        "id": "settings_account",
        "label": "Settings & Account",
        "events": [
            "settings_name_changed",
            "settings_notifications_toggled",
            "account_picture_updated",
        ],
    },
    {
        "id": "spotify",
        "label": "Spotify",
        "events": ["spotify_connected", "spotify_playlist_added"],
    },
]

FUNNELS = {
    "onboarding": [
        {"id": "downloads", "label": "Downloads", "event": "first_open"},
        {"id": "signup", "label": "Signup", "event": "auth_sign_up"},
        {
            "id": "onboarding_started",
            "label": "Onboarding started",
            "event": "onboarding_started",
        },
        {
            "id": "onboarding_completed",
            "label": "Onboarding completed",
            "event": "onboarding_completed",
        },
    ],
    "paywall": [
        {
            "id": "paywall_viewed",
            "label": "Paywall viewed",
            "event": "screen_view",
            "screen_name": "Paywall",
        },
        {
            "id": "purchased",
            "label": "Purchase completed",
            "event": "subscription_purchased",
        },
    ],
}


def _humanize_event_name(event: str) -> str:
    words = [word for word in event.split("_") if word]
    if not words:
        return event
    return " ".join(
        word[0].upper() + word[1:] if index == 0 else word for index, word in enumerate(words)
    )


def _json_response(payload: dict, status: int = 200) -> https_fn.Response:
    return https_fn.Response(
        json.dumps(payload), status=status, headers={"Content-Type": "application/json"}
    )


def _int_param(req: https_fn.Request, key: str, default: int) -> int:
    raw = req.args.get(key)
    try:
        return int(raw) if raw else default
    except ValueError:
        return default


def handle_feature_usage_request(req: https_fn.Request, property_id: str) -> https_fn.Response:
    admin_error = require_admin(req)
    if admin_error:
        return admin_error

    days = _int_param(req, "days", 30)

    try:
        domains = []
        for domain in FEATURE_DOMAINS:
            data = run_report(
                property_id,
                {
                    "dateRanges": [{"startDate": f"{days}daysAgo", "endDate": "today"}],
                    "dimensions": [{"name": "eventName"}],
                    "metrics": [{"name": "eventCount"}, {"name": "totalUsers"}],
                    "dimensionFilter": {
                        "filter": {
                            "fieldName": "eventName",
                            "inListFilter": {"values": domain["events"]},
                        }
                    },
                    "orderBys": [{"metric": {"metricName": "eventCount"}, "desc": True}],
                },
            )

            stats_by_event = {}
            for row in data.get("rows", []):
                dimension_values = row.get("dimensionValues", [])
                event = dimension_values[0].get("value") if dimension_values else None
                metric_values = row.get("metricValues", [])
                count = int(metric_values[0].get("value", 0)) if len(metric_values) > 0 else 0
                users = int(metric_values[1].get("value", 0)) if len(metric_values) > 1 else 0
                if event:
                    stats_by_event[event] = {"count": count, "users": users}

            features = sorted(
                (
                    {
                        "event": event,
                        "label": _humanize_event_name(event),
                        "count": stats_by_event.get(event, {}).get("count", 0),
                        "users": stats_by_event.get(event, {}).get("users", 0),
                    }
                    for event in domain["events"]
                ),
                key=lambda feature: feature["count"],
                reverse=True,
            )

            domains.append({"id": domain["id"], "label": domain["label"], "features": features})

        return _json_response({"domains": domains})
    except Exception as exc:
        print(f"GA4 feature usage report failed: {exc}")
        return _json_response({"error": "Failed to fetch Firebase Analytics data"}, status=502)


def handle_funnel_request(req: https_fn.Request, property_id: str) -> https_fn.Response:
    admin_error = require_admin(req)
    if admin_error:
        return admin_error

    days = _int_param(req, "days", 30)
    funnel_param = req.args.get("funnel", "onboarding")
    if funnel_param not in FUNNELS:
        return _json_response({"error": "Unknown funnel"}, status=400)
    funnel_steps = FUNNELS[funnel_param]

    dimensions = [{"name": "eventName"}]
    if any("screen_name" in step for step in funnel_steps):
        dimensions.append({"name": "unifiedScreenName"})

    def _step_filter(step: dict) -> dict:
        event_filter = {
            "filter": {"fieldName": "eventName", "stringFilter": {"value": step["event"]}}
        }
        if "screen_name" not in step:
            return event_filter
        return {
            "andGroup": {
                "expressions": [
                    event_filter,
                    {
                        "filter": {
                            "fieldName": "unifiedScreenName",
                            "stringFilter": {"value": step["screen_name"]},
                        }
                    },
                ]
            }
        }

    def _row_matches(row: dict, step: dict) -> bool:
        values = [dv.get("value") for dv in row.get("dimensionValues", [])]
        if not values or values[0] != step["event"]:
            return False
        if "screen_name" in step:
            return len(values) > 1 and values[1] == step["screen_name"]
        return True

    try:
        data = run_report(
            property_id,
            {
                "dateRanges": [{"startDate": f"{days}daysAgo", "endDate": "today"}],
                "dimensions": dimensions,
                "metrics": [{"name": "activeUsers"}],
                "dimensionFilter": {
                    "orGroup": {"expressions": [_step_filter(step) for step in funnel_steps]}
                },
            },
        )

        users_by_step_id = {}
        for row in data.get("rows", []):
            metric_values = row.get("metricValues", [])
            users = int(metric_values[0].get("value", 0)) if metric_values else 0
            for step in funnel_steps:
                if _row_matches(row, step):
                    users_by_step_id[step["id"]] = users
                    break

        steps = [
            {
                "id": step["id"],
                "label": step["label"],
                "users": users_by_step_id.get(step["id"], 0),
            }
            for step in funnel_steps
        ]

        return _json_response({"steps": steps})
    except Exception as exc:
        print(f"GA4 funnel report failed: {exc}")
        return _json_response({"error": "Failed to fetch Firebase Analytics data"}, status=502)


def handle_realtime_users_request(req: https_fn.Request, property_id: str) -> https_fn.Response:
    admin_error = require_admin(req)
    if admin_error:
        return admin_error

    try:
        data = run_realtime_report(
            property_id,
            {"metrics": [{"name": "activeUsers"}]},
        )

        rows = data.get("rows", [])
        active_users = 0
        if rows:
            metric_values = rows[0].get("metricValues", [])
            if metric_values:
                active_users = int(metric_values[0].get("value", 0))

        return _json_response({"activeUsers": active_users})
    except Exception as exc:
        print(f"GA4 realtime report failed: {exc}")
        return _json_response({"error": "Failed to fetch Firebase Analytics data"}, status=502)
