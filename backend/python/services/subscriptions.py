from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timedelta, timezone

from sdk.revenuecat import fetch_active_subscriptions, fetch_chart
from sdk.users import admin_auth_error, is_admin
from utils.https import format_request, response


def handle_subscriptions_request(req, apiKey, projectId):
    if not is_admin(req):
        return admin_auth_error()

    req = format_request(req)
    days = int(req.get("days", 30))
    end = datetime.now(timezone.utc)
    start = end - timedelta(days=days)
    startDate = start.strftime("%Y-%m-%d")
    endDate = end.strftime("%Y-%m-%d")

    try:
        with ThreadPoolExecutor(max_workers=4) as executor:
            mrr = executor.submit(fetch_chart, "mrr", projectId, apiKey, startDate, endDate)
            revenue = executor.submit(fetch_chart, "revenue", projectId, apiKey, startDate, endDate)
            activeSubsFuture = executor.submit(fetch_active_subscriptions, projectId, apiKey)
            mrr = mrr.result()
            revenue = revenue.result()
            active_subscriptions = activeSubsFuture.result()

        revenueByDate = {point["date"]: point["value"] for point in revenue}
        history = [
            {
                "date": point["date"],
                "mrr": point["value"],
                "revenue": revenueByDate.get(point["date"], 0),
            }
            for point in mrr
        ]

        data = {"history": history, "activeSubscriptions": active_subscriptions}
        return response(data, 200)
    except Exception as exc:
        print(f"RevenueCat charts fetch failed: {exc}")
        return response({"error": "Failed to fetch RevenueCat data"}, status=502)
