import json
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timedelta, timezone

import requests
from firebase_functions import https_fn

from services.admin_auth import require_admin

REVENUECAT_API_BASE = "https://api.revenuecat.com/v2"
PRIMARY_MEASURE_INDEX = 0


def _json_response(payload: dict, status: int = 200) -> https_fn.Response:
    return https_fn.Response(
        json.dumps(payload), status=status, headers={"Content-Type": "application/json"}
    )


def _extract_points(raw) -> list[dict]:
    values = raw.get("values", []) if isinstance(raw, dict) else []
    points = [
        {
            "date": datetime.fromtimestamp(
                entry.get("cohort", 0), tz=timezone.utc
            ).strftime("%Y-%m-%d"),
            "value": entry.get("value", 0)
            if isinstance(entry.get("value"), (int, float))
            else 0,
        }
        for entry in values
        if isinstance(entry, dict) and entry.get("measure") == PRIMARY_MEASURE_INDEX
    ]
    return sorted(points, key=lambda point: point["date"])


def _percent_change(previous: float, current: float) -> float | None:
    if not previous:
        return None
    return ((current - previous) / previous) * 100


def _fetch_chart(
    chart_name: str, project_id: str, api_key: str, start_date: str, end_date: str
) -> list[dict]:
    response = requests.get(
        f"{REVENUECAT_API_BASE}/projects/{project_id}/charts/{chart_name}",
        headers={"Authorization": f"Bearer {api_key}"},
        params={
            "start_date": start_date,
            "end_date": end_date,
            "resolution": "day",
            "currency": "GBP",
        },
        timeout=15,
    )
    if not response.ok:
        raise Exception(
            f"RevenueCat {chart_name} chart failed: {response.status_code} {response.text}"
        )
    return _extract_points(response.json())


def _fetch_active_subscriptions(project_id: str, api_key: str):
    response = requests.get(
        f"{REVENUECAT_API_BASE}/projects/{project_id}/metrics/overview",
        headers={"Authorization": f"Bearer {api_key}"},
        timeout=15,
    )
    if not response.ok:
        raise Exception(
            f"RevenueCat overview metrics failed: {response.status_code} {response.text}"
        )

    raw = response.json()
    metrics = raw.get("metrics", []) if isinstance(raw, dict) else []
    for metric in metrics:
        if isinstance(metric, dict) and metric.get("id") == "active_subscriptions":
            value = metric.get("value")
            return value if isinstance(value, (int, float)) else None
    return None


def handle_subscriptions_request(
    req: https_fn.Request, api_key: str, project_id: str
) -> https_fn.Response:
    admin_error = require_admin(req)
    if admin_error:
        return admin_error

    raw_days = req.args.get("days")
    try:
        days = int(raw_days) if raw_days else 30
    except ValueError:
        days = 30

    end = datetime.now(timezone.utc)
    start = end - timedelta(days=days)
    start_date = start.strftime("%Y-%m-%d")
    end_date = end.strftime("%Y-%m-%d")

    try:
        with ThreadPoolExecutor(max_workers=4) as executor:
            mrr_future = executor.submit(
                _fetch_chart, "mrr", project_id, api_key, start_date, end_date
            )
            revenue_future = executor.submit(
                _fetch_chart, "revenue", project_id, api_key, start_date, end_date
            )
            actives_future = executor.submit(
                _fetch_chart, "actives", project_id, api_key, start_date, end_date
            )
            active_subs_future = executor.submit(
                _fetch_active_subscriptions, project_id, api_key
            )

            mrr = mrr_future.result()
            revenue = revenue_future.result()
            actives = actives_future.result()
            active_subscriptions = active_subs_future.result()

        revenue_by_date = {point["date"]: point["value"] for point in revenue}
        history = [
            {
                "date": point["date"],
                "mrr": point["value"],
                "revenue": revenue_by_date.get(point["date"], 0),
            }
            for point in mrr
        ]

        mrr_change_percent = (
            _percent_change(mrr[0]["value"], mrr[-1]["value"]) if len(mrr) > 1 else None
        )
        active_subscriptions_change_percent = (
            _percent_change(actives[0]["value"], actives[-1]["value"])
            if len(actives) > 1
            else None
        )

        return _json_response(
            {
                "history": history,
                "activeSubscriptions": active_subscriptions,
                "mrrChangePercent": mrr_change_percent,
                "activeSubscriptionsChangePercent": active_subscriptions_change_percent,
            }
        )
    except Exception as exc:
        print(f"RevenueCat charts fetch failed: {exc}")
        return _json_response({"error": "Failed to fetch RevenueCat data"}, status=502)
