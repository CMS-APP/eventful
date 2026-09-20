from src.sdk.analytics.ga4 import run_funnel_report, run_realtime_report, run_report
from src.sdk.analytics.map import FEATURE_DOMAINS, FUNNELS
from src.sdk.analytics.utils import get_reports


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


def feature_usage_stats(property_id: str, days: int) -> list[dict]:
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
    return domains


def funnel_stats(property_id: str, funnel_param: str, days: int) -> list[dict] | None:
    funnelSteps = FUNNELS.get(funnel_param)
    if not funnelSteps:
        return None

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
    return steps


def realtime_active_users(property_id: str) -> int:
    body = {"metrics": [{"name": "activeUsers"}]}
    data = run_realtime_report(property_id, body)
    activeUsers = 0
    if rows := data.get("rows", []):
        if metricValues := rows[0].get("metricValues", []):
            activeUsers = int(metricValues[0].get("value", 0))
    return activeUsers
