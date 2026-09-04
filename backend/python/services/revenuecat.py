from datetime import datetime, timezone

from firebase_admin import firestore
from firebase_functions import https_fn

_ACTIVE_INCREMENT_TYPES = {"INITIAL_PURCHASE", "UNCANCELLATION", "NON_RENEWING_PURCHASE"}
_ACTIVE_DECREMENT_TYPES = {"EXPIRATION"}
_REVENUE_TYPES = {"INITIAL_PURCHASE", "RENEWAL"}


def handle_revenuecat_webhook(
    req: https_fn.Request, webhook_secret: str
) -> https_fn.Response:
    if req.method != "POST":
        return https_fn.Response("Method Not Allowed", status=405)

    if not webhook_secret or req.headers.get("Authorization") != webhook_secret:
        return https_fn.Response("Unauthorized", status=401)

    body = req.get_json(silent=True) or {}
    event = body.get("event") or {}
    event_id = event.get("id")
    event_type = event.get("type")

    if not event_id or not event_type:
        return https_fn.Response("Missing event id/type", status=400)

    db = firestore.client()
    event_ref = db.collection("revenuecatEvents").document(event_id)

    if event_ref.get().exists:
        return https_fn.Response("OK", status=200)

    environment = event.get("environment", "PRODUCTION")
    price = event.get("price") or 0

    event_ref.set(
        {
            "type": event_type,
            "appUserId": event.get("app_user_id"),
            "productId": event.get("product_id"),
            "environment": environment,
            "price": price,
            "currency": event.get("currency"),
            "receivedAt": firestore.SERVER_TIMESTAMP,
            "raw": event,
        }
    )

    if environment != "PRODUCTION":
        return https_fn.Response("OK", status=200)

    active_delta = 0
    if event_type in _ACTIVE_INCREMENT_TYPES:
        active_delta = 1
    elif event_type in _ACTIVE_DECREMENT_TYPES:
        active_delta = -1

    revenue_delta = price if event_type in _REVENUE_TYPES else 0

    db.collection("revenuecatLiveStats").document("current").set(
        {
            "activeSubscriptions": firestore.Increment(active_delta),
            "totalRevenue": firestore.Increment(revenue_delta),
            "lastEventType": event_type,
            "lastEventAt": firestore.SERVER_TIMESTAMP,
        },
        merge=True,
    )

    date = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    daily_update = {
        "date": date,
        "revenue": firestore.Increment(revenue_delta),
        "updatedAt": firestore.SERVER_TIMESTAMP,
    }
    if event_type == "INITIAL_PURCHASE":
        daily_update["newSubscriptions"] = firestore.Increment(1)
    elif event_type == "RENEWAL":
        daily_update["renewals"] = firestore.Increment(1)
    elif event_type == "CANCELLATION":
        daily_update["cancellations"] = firestore.Increment(1)
    elif event_type == "EXPIRATION":
        daily_update["expirations"] = firestore.Increment(1)

    db.collection("revenuecatDailyStats").document(date).set(
        daily_update, merge=True
    )

    return https_fn.Response("OK", status=200)
