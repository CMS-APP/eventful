from firebase_functions import https_fn

from sdk.analytics.map import FEATURE_DOMAINS, FUNNELS
from sdk.analytics.utils import get_reports
from sdk.app_check import app_check_error, verify_app_check
from sdk.ga4 import run_funnel_report, run_realtime_report, run_report
from sdk.users import admin_auth_error, is_admin
from utils.https import format_request, response


def _humanize_event_name(event: str) -> str:
    words = [word for word in event.split("_") if word]
    if not words:
        return event
    return " ".join(
        word[0].upper() + word[1:] if index == 0 else word for index, word in enumerate(words)
    )


def _funnel_step_filter(step: dict) -> dict:
    if "screen_name" in step:
        return {
            "andGroup": {
                "expressions": [
                    {
                        "funnelFieldFilter": {
                            "fieldName": "eventName",
                            "stringFilter": {"value": step["event"]},
                        }
                    },
                    {
                        "funnelFieldFilter": {
                            "fieldName": "unifiedScreenName",
                            "stringFilter": {"value": step["screen_name"]},
                        }
                    },
                ]
            }
        }

    return {"funnelEventFilter": {"eventName": step["event"]}}


def handle_feature_usage_request(req, property_id) -> https_fn.Response:
    if not verify_app_check(req):
        return app_check_error()

    req = format_request(req)
    days = req.get("days", 30)

    try:
        domains = []
        for domain in FEATURE_DOMAINS:
            data = run_report(property_id, get_reports(days, domain))

            statsByEvent = {}
            for row in data.get("rows", []):
                dimensionValues = row.get("dimensionValues", [])
                event = dimensionValues[0].get("value") if dimensionValues else None
                if not event:
                    continue

                metricValues = row.get("metricValues", [])
                count = int(metricValues[0].get("value", 0)) if len(metricValues) > 0 else 0
                users = int(metricValues[1].get("value", 0)) if len(metricValues) > 1 else 0
                statsByEvent[event] = {"count": count, "users": users}

            features = sorted(
                (
                    {
                        "event": event,
                        "label": _humanize_event_name(event),
                        "count": statsByEvent.get(event, {}).get("count", 0),
                        "users": statsByEvent.get(event, {}).get("users", 0),
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
    funnelParam = req.get("funnel", "")

    if not (funnelSteps := FUNNELS.get(funnelParam)):
        return response("Unknown funnel", status=400)

    try:
        body = {
            "dateRanges": [{"startDate": f"{days}daysAgo", "endDate": "today"}],
            "funnel": {
                "steps": [
                    {"name": step["label"], "filterExpression": _funnel_step_filter(step)}
                    for step in funnelSteps
                ]
            },
        }
        data = run_funnel_report(property_id, body)
        table = data.get("funnelTable", {})
        metricNames = [header.get("name") for header in table.get("metricHeaders", [])]
        activeUsersIndex = metricNames.index("activeUsers") if "activeUsers" in metricNames else 0
        rows = table.get("rows", [])
        steps = []
        for index, step in enumerate(funnelSteps):
            users = 0
            if index < len(rows):
                metricValues = rows[index].get("metricValues", [])
                if activeUsersIndex < len(metricValues):
                    users = int(metricValues[activeUsersIndex].get("value", 0))
            steps.append({"id": step["id"], "label": step["label"], "users": users})
        return response({"steps": steps}, 200)

    except Exception as exc:
        print(f"GA4 funnel report failed: {exc}")
        return response("Failed to fetch Firebase Analytics data", status=502)


def handle_realtime_users_request(req: https_fn.Request, property_id: str) -> https_fn.Response:
    if not is_admin(req):
        return admin_auth_error()

    try:
        body = {"metrics": [{"name": "activeUsers"}]}
        data = run_realtime_report(property_id, body)
        rows = data.get("rows", [])
        activeUsers = 0
        if rows:
            metricValues = rows[0].get("metricValues", [])
            if metricValues:
                activeUsers = int(metricValues[0].get("value", 0))
        return response({"activeUsers": activeUsers}, 200)

    except Exception as exc:
        print(f"GA4 realtime report failed: {exc}")
        return response("Failed to fetch Firebase Analytics data", status=502)
