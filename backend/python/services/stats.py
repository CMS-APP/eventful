from firebase_functions import https_fn

from sdk.analytics.map import FEATURE_DOMAINS, FUNNELS
from sdk.analytics.utils import get_reports
from services.admin_auth import admin_auth_error, is_admin
from services.app_check import app_check_error, verify_app_check
from services.ga4_client import run_realtime_report, run_report
from utils.https import format_request, response


def _humanize_event_name(event: str) -> str:
    words = [word for word in event.split("_") if word]
    if not words:
        return event
    return " ".join(
        word[0].upper() + word[1:] if index == 0 else word for index, word in enumerate(words)
    )


def _int_param(req: https_fn.Request, key: str, default: int) -> int:
    raw = req.args.get(key)
    try:
        return int(raw) if raw else default
    except ValueError:
        return default


def handle_feature_usage_request(req, property_id) -> https_fn.Response:
    if not verify_app_check(req):
        return app_check_error()

    req = format_request(req)
    days = req.get("days", 30)

    try:
        domains = []
        for domain in FEATURE_DOMAINS:
            data = run_report(property_id, get_reports(days, domain))

            stats_by_event = {}
            for row in data.get("rows", []):
                dimension_values = row.get("dimensionValues", [])
                event = dimension_values[0].get("value") if dimension_values else None
                if not event:
                    continue

                metric_values = row.get("metricValues", [])
                count = int(metric_values[0].get("value", 0)) if len(metric_values) > 0 else 0
                users = int(metric_values[1].get("value", 0)) if len(metric_values) > 1 else 0
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

        return response({"domains": domains}, 200)
    except Exception as exc:
        print(f"GA4 feature usage report failed: {exc}")
        return response("Failed to fetch Firebase Analytics data", status=502)


def handle_funnel_request(req, property_id):
    if not is_admin(req):
        return admin_auth_error()

    req = format_request(req)
    days = req.get("days", 30)
    funnel_param = req.get("funnel", "onboarding")
    if funnel_param not in FUNNELS:
        return response("Unknown funnel", status=400)

    funnel_steps = FUNNELS[funnel_param]

    try:
        users_by_step_id = {}

        if event_steps:
            data = run_report(
                property_id,
                {
                    "dateRanges": [{"startDate": f"{days}daysAgo", "endDate": "today"}],
                    "dimensions": [{"name": "eventName"}],
                    "metrics": [{"name": "activeUsers"}],
                    "dimensionFilter": {
                        "filter": {
                            "fieldName": "eventName",
                            "inListFilter": {"values": [step["event"] for step in event_steps]},
                        }
                    },
                },
            )

            users_by_event = {}
            for row in data.get("rows", []):
                dimension_values = row.get("dimensionValues", [])
                event_name = dimension_values[0].get("value") if dimension_values else None
                metric_values = row.get("metricValues", [])
                users = int(metric_values[0].get("value", 0)) if metric_values else 0
                if event_name:
                    users_by_event[event_name] = users

            for step in event_steps:
                users_by_step_id[step["id"]] = users_by_event.get(step["event"], 0)

        for step in screen_steps:
            data = run_report(
                property_id,
                {
                    "dateRanges": [{"startDate": f"{days}daysAgo", "endDate": "today"}],
                    "dimensions": [{"name": "eventName"}, {"name": "unifiedScreenName"}],
                    "metrics": [{"name": "activeUsers"}],
                    "dimensionFilter": {
                        "andGroup": {
                            "expressions": [
                                {
                                    "filter": {
                                        "fieldName": "eventName",
                                        "stringFilter": {"value": step["event"]},
                                    }
                                },
                                {
                                    "filter": {
                                        "fieldName": "unifiedScreenName",
                                        "stringFilter": {"value": step["screen_name"]},
                                    }
                                },
                            ]
                        }
                    },
                },
            )
        data = run_funnel_report(
            property_id,
            {
                "dateRanges": [{"startDate": f"{days}daysAgo", "endDate": "today"}],
                "funnel": {
                    "steps": [
                        {"name": step["label"], "filterExpression": _funnel_step_filter(step)}
                        for step in funnel_steps
                    ]
                },
            },
        )

        table = data.get("funnelTable", {})
        metric_names = [header.get("name") for header in table.get("metricHeaders", [])]
        active_users_index = (
            metric_names.index("activeUsers") if "activeUsers" in metric_names else 0
        )
        rows = table.get("rows", [])

        steps = []
        for index, step in enumerate(funnel_steps):
            users = 0
            if rows:
                metric_values = rows[0].get("metricValues", [])
                if metric_values:
                    users = int(metric_values[0].get("value", 0))
            users_by_step_id[step["id"]] = users

        steps = [
            {
                "id": step["id"],
                "label": step["label"],
                "users": users_by_step_id.get(step["id"], 0),
            }
            for step in funnel_steps
        ]

        return response({"steps": steps}, 200)
    except Exception as exc:
        print(f"GA4 funnel report failed: {exc}")
        return response("Failed to fetch Firebase Analytics data", status=502)


def handle_realtime_users_request(req: https_fn.Request, property_id: str) -> https_fn.Response:
    if not is_admin(req):
        return admin_auth_error()

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

        return response({"activeUsers": active_users}, 200)
    except Exception as exc:
        print(f"GA4 realtime report failed: {exc}")
        return response("Failed to fetch Firebase Analytics data", status=502)
