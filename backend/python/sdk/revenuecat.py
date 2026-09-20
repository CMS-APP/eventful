from datetime import datetime, timezone

from sdk.http_client import get

REVENUECAT_API_BASE = "https://api.revenuecat.com/v2"
PRIMARY_MEASURE_INDEX = 0


def _extract_points(raw) -> list[dict]:
    values = raw.get("values", []) if isinstance(raw, dict) else []
    points = [
        {
            "date": datetime.fromtimestamp(entry.get("cohort", 0), tz=timezone.utc).strftime(
                "%Y-%m-%d"
            ),
            "value": entry.get("value", 0) if isinstance(entry.get("value"), (int, float)) else 0,
        }
        for entry in values
        if isinstance(entry, dict) and entry.get("measure") == PRIMARY_MEASURE_INDEX
    ]
    return sorted(points, key=lambda point: point["date"])


def fetch_chart(chart_name: str, project_id: str, api_key: str, start_date: str, end_date: str):
    response = get(
        f"{REVENUECAT_API_BASE}/projects/{project_id}/charts/{chart_name}",
        headers={"Authorization": f"Bearer {api_key}"},
        params={
            "start_date": start_date,
            "end_date": end_date,
            "resolution": "day",
            "currency": "GBP",
        },
    )
    if not response.ok:
        raise Exception(
            f"RevenueCat {chart_name} chart failed: {response.status_code} {response.text}"
        )
    return _extract_points(response.json())


def fetch_active_subscriptions(project_id: str, api_key: str):
    response = get(
        f"{REVENUECAT_API_BASE}/projects/{project_id}/metrics/overview",
        headers={"Authorization": f"Bearer {api_key}"},
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
